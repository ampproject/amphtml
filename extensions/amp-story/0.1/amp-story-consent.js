/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Action} from './amp-story-store-service';
import {ActionTrust} from '../../../src/action-constants';
import {CSS} from '../../../build/amp-story-consent-0.1.css';
import {Layout} from '../../../src/layout';
import {LocalizedStringId} from '../../../src/service/localization';
import {Services} from '../../../src/services';
import {assertAbsoluteHttpOrHttpsUrl} from '../../../src/url';
import {
  childElementByTag,
  closestAncestorElementBySelector,
  isJsonScriptTag,
} from '../../../src/dom';
import {computedStyle, setImportantStyles} from '../../../src/style';
import {
  createShadowRootWithStyle,
  getRGBFromCssColorValue,
  getTextColorForRGB,
} from './utils';
import {dev, user, userAssert} from '../../../src/log';
import {dict} from './../../../src/utils/object';
import {isArray} from '../../../src/types';
import {parseJson} from '../../../src/json';
import {renderAsElement} from './simple-template';
import {throttle} from '../../../src/utils/rate-limit';


/** @const {string} */
const TAG = 'amp-story-consent';

/**
 * Default optional config parameters.
 * @const {!Object}
 */
const DEFAULT_OPTIONAL_PARAMETERS = {
  externalLink: {},
  onlyAccept: false,
};

// TODO(gmajoulet): switch to `htmlFor` static template helper.
/**
 * Story consent template.
 * @param {!Object} config
 * @param {string} consentId
 * @param {?string} logoSrc
 * @return {!./simple-template.ElementDef}
 * @private @const
 */
const getTemplate = (config, consentId, logoSrc) => ({
  tag: 'div',
  attrs: dict({
    'class': 'i-amphtml-story-consent i-amphtml-story-system-reset'}),
  children: [
    {
      tag: 'div',
      attrs: dict({'class': 'i-amphtml-story-consent-overflow'}),
      children: [
        {
          tag: 'div',
          attrs: dict({'class': 'i-amphtml-story-consent-container'}),
          children: [
            {
              tag: 'div',
              attrs: dict({'class': 'i-amphtml-story-consent-header'}),
              children: [
                {
                  tag: 'div',
                  attrs: dict({
                    'class': 'i-amphtml-story-consent-logo',
                    'style': logoSrc ?
                      `background-image: url('${logoSrc}') !important;` : '',
                  }),
                  children: [],
                },
              ],
            },
            {
              tag: 'div',
              attrs: dict({'class': 'i-amphtml-story-consent-content'}),
              children: [
                {
                  tag: 'h3',
                  attrs: dict({}),
                  children: [],
                  unlocalizedString: config.title,
                },
                {
                  tag: 'p',
                  attrs: dict({}),
                  children: [],
                  unlocalizedString: config.message,
                },
                {
                  tag: 'ul',
                  attrs: dict({'class': 'i-amphtml-story-consent-vendors'}),
                  children: config.vendors && config.vendors.map(vendor => (
                    {
                      tag: 'li',
                      attrs: dict({'class': 'i-amphtml-story-consent-vendor'}),
                      children: [],
                      unlocalizedString: vendor,
                    })
                  ),
                },
                {
                  tag: 'a',
                  attrs: dict({
                    'class': 'i-amphtml-story-consent-external-link ' +
                        (!(config.externalLink.title &&
                            config.externalLink.href) ?
                          'i-amphtml-hidden' : ''),
                    'href': config.externalLink.href,
                    'target': '_top',
                    'title': config.externalLink.title,
                  }),
                  children: [],
                  unlocalizedString: config.externalLink.title,
                },
              ],
            },
          ],
        },
        {
          tag: 'div',
          attrs: dict({'class': 'i-amphtml-story-consent-actions'}),
          children: [
            {
              tag: 'button',
              attrs: dict({
                'class': 'i-amphtml-story-consent-action ' +
                    'i-amphtml-story-consent-action-reject' +
                    (config.onlyAccept === true ? ' i-amphtml-hidden' : ''),
                'on': `tap:${consentId}.reject`,
              }),
              children: [],
              localizedStringId:
                  LocalizedStringId.AMP_STORY_CONSENT_DECLINE_BUTTON_LABEL,
            },
            {
              tag: 'button',
              attrs: dict({
                'class': 'i-amphtml-story-consent-action ' +
                    'i-amphtml-story-consent-action-accept',
                'on': `tap:${consentId}.accept`,
              }),
              children: [],
              localizedStringId:
                  LocalizedStringId.AMP_STORY_CONSENT_ACCEPT_BUTTON_LABEL,
            },
          ],
        },
      ],
    },
  ],
});

/**
 * The <amp-story-consent> custom element.
 */
export class AmpStoryConsent extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @const @private {!../../../src/service/action-impl.ActionService} */
    this.actions_ = Services.actionServiceForDoc(this.element);

    /** @private {?Element} */
    this.scrollableEl_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = Services.storyStoreServiceV01(this.win);

    /** @private {?Object} */
    this.storyConsentConfig_ = null;

    /** @private {?Element} */
    this.storyConsentEl_ = null;
  }

  /** @override */
  buildCallback() {
    this.assertAndParseConfig_();

    const storyEl = closestAncestorElementBySelector(this.element, 'AMP-STORY');
    const consentEl = closestAncestorElementBySelector(this.element,
        'AMP-CONSENT');
    const consentId = consentEl.id;
    this.storeService_.dispatch(Action.SET_CONSENT_ID, consentId);

    const logoSrc = storyEl && storyEl.getAttribute('publisher-logo-src');

    if (!logoSrc) {
      user().warn(
          TAG, 'Expected "publisher-logo-src" attribute on <amp-story>');
    }

    // Story consent config is set by the `assertAndParseConfig_` method.
    if (this.storyConsentConfig_) {
      this.storyConsentEl_ = renderAsElement(
          this.win.document,
          getTemplate(this.storyConsentConfig_, consentId, logoSrc));
      createShadowRootWithStyle(this.element, this.storyConsentEl_, CSS);

      // Allow <amp-consent> actions in STAMP (defaults to no actions allowed).
      this.actions_.addToWhitelist('AMP-CONSENT', 'accept');
      this.actions_.addToWhitelist('AMP-CONSENT', 'prompt');
      this.actions_.addToWhitelist('AMP-CONSENT', 'reject');

      this.setAcceptButtonFontColor_();

      this.initializeListeners_();
    }
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /**
   * @private
   */
  initializeListeners_() {
    this.storyConsentEl_.addEventListener(
        'click', event => this.onClick_(event), true /** useCapture */);

    this.scrollableEl_ =
        this.storyConsentEl_.querySelector('.i-amphtml-story-consent-overflow');
    this.scrollableEl_.addEventListener(
        'scroll', throttle(this.win, () => this.onScroll_(), 100));
  }

  /**
   * Listens to click events to trigger the actions programatically.
   * Since events bubble up from the Shadow DOM but their target is updated to
   * the Shadow root, the top level actions event listeners would not detect
   * and trigger the actions upon click events.
   * @param {!Event} event
   * @private
   */
  onClick_(event) {
    if (event.target && event.target.hasAttribute('on')) {
      const targetEl = dev().assertElement(event.target);
      this.actions_.trigger(targetEl, 'tap', event, ActionTrust.HIGH);
    }
  }

  /**
   * Toggles the fullbleed UI on scroll.
   * @private
   */
  onScroll_() {
    let isFullBleed;

    const measurer =
        () => isFullBleed = this.scrollableEl_./*OK*/scrollTop > 88;
    const mutator = () => {
      this.storyConsentEl_
          .classList.toggle('i-amphtml-story-consent-fullbleed', isFullBleed);
    };

    this.element.getResources()
        .measureMutateElement(this.storyConsentEl_, measurer, mutator);
  }

  /**
   * Validates the story-consent config. `story-consent` is a new parameter
   * specific to stories, added on the `amp-consent` JSON config.
   * @private
   */
  assertAndParseConfig_() {
    const storyConsentScript = childElementByTag(this.element, 'script');

    userAssert(
        storyConsentScript && isJsonScriptTag(storyConsentScript),
        `${TAG} config should be put in a <script> tag with ` +
        'type="application/json"');

    this.storyConsentConfig_ =
        Object.assign(
            {},
            DEFAULT_OPTIONAL_PARAMETERS,
            /** @type {Object} */ (parseJson(storyConsentScript.textContent)));

    user().assertString(
        this.storyConsentConfig_.title, `${TAG}: config requires a title`);
    user().assertString(
        this.storyConsentConfig_.message, `${TAG}: config requires a message`);
    userAssert(
        this.storyConsentConfig_.vendors &&
            isArray(this.storyConsentConfig_.vendors),
        `${TAG}: config requires an array of vendors`);
    user().assertBoolean(
        this.storyConsentConfig_.onlyAccept,
        `${TAG}: config requires "onlyAccept" to be a boolean`);

    // Runs the validation if any of the title or link are provided, since
    // both have to be provided for the external link to be displayed.
    if (this.storyConsentConfig_.externalLink.href ||
        this.storyConsentConfig_.externalLink.title) {
      user().assertString(
          this.storyConsentConfig_.externalLink.title,
          `${TAG}: config requires "externalLink.title" to be a string`);
      user().assertString(
          this.storyConsentConfig_.externalLink.href,
          `${TAG}: config requires "externalLink.href" to be an absolute URL`);
      assertAbsoluteHttpOrHttpsUrl(this.storyConsentConfig_.externalLink.href);
    }
  }

  /**
   * Sets the accept button font color to either white or black, depending on
   * the publisher custom background color.
   * Must be called from the `buildCallback` or in another vsync mutate state.
   * @private
   */
  setAcceptButtonFontColor_() {
    const buttonEl =
        dev().assertElement(this.storyConsentEl_
            .querySelector('.i-amphtml-story-consent-action-accept'));
    const styles = computedStyle(this.win, buttonEl);

    const rgb = getRGBFromCssColorValue(styles['background-color']);
    const color = getTextColorForRGB(rgb);

    setImportantStyles(buttonEl, {color});
  }
}
