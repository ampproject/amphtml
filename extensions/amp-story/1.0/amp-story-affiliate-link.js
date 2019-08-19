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
 * @fileoverview Affiliate link component that expands when clicked.
 */

import {StateProperty, getStoreService} from './amp-story-store-service';
import {htmlFor} from '../../../src/static-template';

/**
 * Links that are affiliate links.
 * @const {string}
 */
export const AFFILIATE_LINK_SELECTOR = 'a[data-affiliate-link-icon]';

export class AmpStoryAffiliateLink {
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

    /** @private {boolean} */
    this.isBuilt_ = false;
  }

  /**
   * Builds affiliate link.
   */
  build() {
    if (this.isBuilt_) {
      return;
    }
    this.isBuilt_ = true;
    this.addIconElement_();
    this.addText_();
    this.addPulseElement_();
    this.initializeListener_();
  }

  /**
   * Initialize listener to toggle expanded state.
   * @private
   */
  initializeListener_() {
    this.storeService_.subscribe(
      StateProperty.AFFILIATE_LINK_STATE,
      elementToToggleExpand => {
        this.element_.toggleAttribute(
          'expanded',
          this.element_ === elementToToggleExpand
        );
      }
    );
  }

  /**
   * Adds icon as a child element of <amp-story-affiliate-link>.
   * @private
   */
  addIconElement_() {
    const iconEl = htmlFor(this.element_)`
      <div class="i-amphtml-story-affiliate-link-circle">
        <i class="i-amphtml-story-affiliate-link-icon"></i>
        <span class="i-amphtml-story-affiliate-link-text"></span>
        <i class="i-amphtml-story-affiliate-link-launch"></i>
      </div>`;
    this.element_.appendChild(iconEl);
  }

  /**
   * Adds text from <a> tag to expanded link.
   * @private
   */
  addText_() {
    const textEl = this.element_.querySelector(
      '.i-amphtml-story-affiliate-link-text'
    );
    textEl.textContent = this.element_.textContent;
  }

  /**
   * Adds pulse as a child element of <amp-story-affiliate-link>.
   * @private
   */
  addPulseElement_() {
    const pulseEl = htmlFor(this.element_)`
      <div class="i-amphtml-story-affiliate-link-pulse"></div>`;
    this.element_.appendChild(pulseEl);
  }
}
