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

import {ActionTrust} from '../../../src/action-trust';
import {CSS} from '../../../build/amp-story-consent-1.0.css';
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {childElementByTag} from '../../../src/dom';
import {closestByTag} from '../../../src/dom';
import {createShadowRootWithStyle} from './utils';
import {dev, user} from '../../../src/log';
import {dict} from './../../../src/utils/object';
import {isArray} from '../../../src/types';
import {parseJson} from '../../../src/json';
import {renderAsElement} from './simple-template';
import {throttle} from '../../../src/utils/rate-limit';


/** @private @const {string} */
const TAG = 'amp-story-consent';

// TODO(gmajoulet): switch to `htmlFor` static template helper.
// TODO(gmajoulet): use a CSS variable for the `color` config parameter.
/**
 * Story consent template.
 * @private @const {function(!Object, string, ?string):!./simple-template.ElementDef}
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
              attrs: dict({
                'class': 'i-amphtml-story-consent-header',
                'style': config.color ?
                  `background-color: ${config.color} !important;` : '',
              }),
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
                    'i-amphtml-story-consent-action-reject',
                'on': `tap:${consentId}.reject`,
              }),
              children: [],
              unlocalizedString: 'Decline',
            },
            {
              tag: 'button',
              attrs: dict({
                'class': 'i-amphtml-story-consent-action ' +
                    'i-amphtml-story-consent-action-accept',
                'style': config.color ?
                  `background-color: ${config.color} !important; ` +
                      `border-color: ${config.color} !important;` : '',
                'on': `tap:${consentId}.accept`,
              }),
              children: [],
              unlocalizedString: 'Agree',
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

    /** @private {?Element} */
    this.scrollableEl_ = null;

    /** @private {?Element} */
    this.storyConsentEl_ = null;
  }

  /** @override */
  buildCallback() {
    this.assertAndParseConfig_();

    const storyEl = closestByTag(this.element, 'AMP-STORY');
    const logoSrc = storyEl && storyEl.getAttribute('publisher-logo-src');

    if (!logoSrc) {
      user().warn(
          TAG, 'Expected "publisher-logo-src" attribute on <amp-story>');
    }

    const storyConsentConfig =
        this.consentConfig_ && this.consentConfig_['story-consent'];
    const consentId = Object.keys(this.consentConfig_.consents)[0];
    this.storyConsentEl_ = renderAsElement(
        this.win.document, getTemplate(storyConsentConfig, consentId, logoSrc));
    createShadowRootWithStyle(this.element, this.storyConsentEl_, CSS);

    this.initializeListeners_();
    this.addActionsToWhitelist_();
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /** @override */
  prerenderAllowed() {
    return false;
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
   * Allows the consent related actions.
   * @private
   */
  addActionsToWhitelist_() {
    dev().assert(this.consentConfig_, `${TAG}: Consent config must be parsed ` +
        'before adding the actions to the whitelist.');

    const consentIds = Object.keys(this.consentConfig_.consents);

    consentIds.forEach(consentId => {
      this.actions_.addToWhitelist(`${consentId}.accept`);
      this.actions_.addToWhitelist(`${consentId}.reject`);
    });
  }

  /**
   * Validates the story-consent config. `story-consent` is a new parameter
   * specific to stories, added on the `amp-consent` JSON config.
   * @private
   */
  assertAndParseConfig_() {
    const parentEl = dev().assertElement(this.element.parentElement);
    const script = childElementByTag(parentEl, 'script');
    this.consentConfig_ = parseJson(script.textContent);

    const storyConsent = this.consentConfig_['story-consent'];

    user().assert(storyConsent, `${TAG}: story-consent config is required`);
    user().assertString(
        storyConsent.title, `${TAG}: story-consent requires a title`);
    user().assertString(
        storyConsent.message, `${TAG}: story-consent requires a message`);
    user().assert(
        storyConsent.vendors && isArray(storyConsent.vendors),
        `${TAG}: story-consent requires an array of vendors`);
  }
}
