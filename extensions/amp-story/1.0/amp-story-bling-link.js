/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview Bling link component that expands when clicked.
 */

import {StateProperty, getStoreService} from './amp-story-store-service';
import {addAttributesToElement} from '../../../src/dom';
import {dict} from '../../../src/utils/object';
import {htmlFor} from '../../../src/static-template';
import {isProtocolValid, parseUrlDeprecated} from '../../../src/url';
import {user} from '../../../src/log';

/**
 * Links that are bling links.
 * @const {string}
 */
export const BLING_LINK_SELECTOR = 'a.i-amphtml-story-bling-link';

/**
 * Custom property signifying a built link.
 * @const {string}
 */
export const BLING_LINK_BUILT = '__AMP_BLING_LINK_BUILT';

export class AmpStoryBlingLink {
  /**
   * @param {!Window} win
   * @param {!Element} element
   */
  constructor(win, element) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Element} */
    this.element_ = element;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);
  }

  /**
   * Builds bling link
   */
  build() {
    if (this.element_[BLING_LINK_BUILT]) {
      return;
    }

    this.addIconElement_();
    this.addText_();
    this.addPulseElement_();
    this.validateHref_();
    this.initializeListeners_();
    this.element_[BLING_LINK_BUILT] = true;
  }

  /**
   * @private
   */
  initializeListeners_() {
    this.storeService_.subscribe(
      StateProperty.BLING_LINK_STATE,
      toggleExpand => {
        this.element_.toggleAttribute('expanded', toggleExpand);
      }
    );
  }

  /**
   * Adds icon as a child element of <amp-story-bling-link>
   * @private
   */
  addIconElement_() {
    const iconEl = htmlFor(this.element_)`
      <div class="i-amphtml-story-bling-link-circle">
        <i class="i-amphtml-story-bling-link-icon i-amphtml-story-bling-link-shopping-cart"></i>
        <span class="i-amphtml-story-bling-link-text"></span>
        <i class="i-amphtml-story-bling-link-launch"></i>
      </div>`;
    this.element_.appendChild(iconEl);
  }

  /**
   * Adds text from <a> tag to expanded link
   * @private
   */
  addText_() {
    const textEl = this.element_.querySelector(
      '.i-amphtml-story-bling-link-text'
    );
    textEl.innerText = this.element_.innerText;
  }

  /**
   * Adds pulse as a child element of <amp-story-bling-link>
   * @private
   */
  addPulseElement_() {
    const pulseEl = htmlFor(this.element_)`
      <div class="i-amphtml-story-bling-link-pulse"></div>`;
    this.element_.appendChild(pulseEl);
  }

  /**
   * @private
   */
  validateHref_() {
    const href = this.getElementHref_(this.element_);
    addAttributesToElement(this.element_, dict({'href': href}));
  }

  /**
   * Gets href from an element containing a url.
   * @param {!Element} target
   * @private
   */
  getElementHref_(target) {
    const elUrl = target.getAttribute('href');
    if (!isProtocolValid(elUrl)) {
      user().error('amp-story-bling-link', 'The bling link url is invalid');
      return;
    }

    return parseUrlDeprecated(elUrl).href;
  }
}
