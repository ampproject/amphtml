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

import {
  Action,
  StateProperty,
  getStoreService,
} from './amp-story-store-service';
import {ActionTrust} from '../../../src/action-constants';
import {CSS} from '../../../build/amp-story-consent-1.0.css';
import {Layout} from '../../../src/layout';
import {LocalizedStringId} from '../../../src/localized-strings';
import {Services} from '../../../src/services';
import {assertAbsoluteHttpOrHttpsUrl, assertHttpsUrl} from '../../../src/url';
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

    /** @private {?Object} */
    this.consentConfig_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win);

    /** @private {?Object} */
    this.storyConsentConfig_ = null;

    /** @private {?Element} */
    this.storyConsentEl_ = null;
  }

  /** @override */
  buildCallback() {
    this.assertAndParseConfig_();

    const storyEl = dev().assertElement(
        closestAncestorElementBySelector(this.element, 'AMP-STORY'));
    const consentEl = closestAncestorElementBySelector(this.element,
        'AMP-CONSENT');
    const consentId = consentEl.id;

    this.storeConsentId_(consentId);

    const logoSrc = storyEl && storyEl.getAttribute('publisher-logo-src');

    logoSrc ?
      assertHttpsUrl(logoSrc, storyEl, 'publisher-logo-src') :
      user().warn(
          TAG, 'Expected "publisher-logo-src" attribute on <amp-story>');

    // Story consent config is set by the `assertAndParseConfig_` method.
    if (this.storyConsentConfig_) {
      this.storyConsentEl_ = renderAsElement(
          this.win.document,
          getTemplate(this.storyConsentConfig_, consentId, logoSrc));
      createShadowRootWithStyle(this.element, this.storyConsentEl_, CSS);

      // Allow <amp-consent> actions in STAMP (defaults to no actions allowed).
      const actions = [
        {tagOrTarget: 'AMP-CONSENT', method: 'accept'},
        {tagOrTarget: 'AMP-CONSENT', method: 'prompt'},
        {tagOrTarget: 'AMP-CONSENT', method: 'reject'},
      ];
      this.storeService_.dispatch(Action.ADD_TO_ACTIONS_WHITELIST, actions);

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

    this.storeService_.subscribe(StateProperty.RTL_STATE, rtlState => {
      this.onRtlStateUpdate_(rtlState);
    }, true /** callToInitialize */);
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
   * Reacts to RTL state updates and triggers the UI for RTL.
   * @param {boolean} rtlState
   * @private
   */
  onRtlStateUpdate_(rtlState) {
    const mutator = () => {
      rtlState ?
        this.storyConsentEl_.setAttribute('dir', 'rtl') :
        this.storyConsentEl_.removeAttribute('dir');
    };

    this.mutateElement(mutator, this.storyConsentEl_);
  }

  /**
   * Validates the story-consent config. `story-consent` is a new parameter
   * specific to stories, added on the `amp-consent` JSON config.
   * @private
   */
  assertAndParseConfig_() {
    // Validation of the amp-consent config is handled by the amp-consent
    // javascript.
    const parentEl = dev().assertElement(this.element.parentElement);
    const consentScript = childElementByTag(parentEl, 'script');
    this.consentConfig_ = consentScript && parseJson(consentScript.textContent);

    // amp-consent already triggered console errors, step out to avoid polluting
    // the console.
    if (!this.consentConfig_) {
      return;
    }

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
   * @param {string} consentId
   * @private
   */
  storeConsentId_(consentId) {
    const policyId = Object.keys(this.consentConfig_['consents'])[0];
    const policy = this.consentConfig_['consents'][policyId];

    // checkConsentHref response overrides the amp-geo config, if provided.
    if (policy.checkConsentHref) {
      this.storeService_.dispatch(Action.SET_CONSENT_ID, consentId);
      return;
    }

    // If using amp-access with amp-geo, only set the consent id if the user is
    // in the expected geo group.
    if (policy['promptIfUnknownForGeoGroup']) {
      Services.geoForDocOrNull(this.element).then(geo => {
        const geoGroup = policy['promptIfUnknownForGeoGroup'];
        const matchedGeoGroups =
          /** @type {!Array<string>} */ (geo.matchedISOCountryGroups);
        if (geo && !matchedGeoGroups.includes(geoGroup)) {
          return;
        }
        this.storeService_.dispatch(Action.SET_CONSENT_ID, consentId);
      });
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
