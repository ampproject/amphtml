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

import {Services} from '../../../src/services';
import {StateProperty, getStoreService} from './amp-story-store-service';
import {getAmpdoc} from '../../../src/service';
import {htmlFor} from '../../../src/static-template';

/**
 * Links that are affiliate links.
 * @const {string}
 */
export const AFFILIATE_LINK_SELECTOR = 'a[affiliate-link-icon]';

/**
 * Custom property signifying a built link.
 * @const {string}
 */
export const AFFILIATE_LINK_BUILT = '__AMP_AFFILIATE_LINK_BUILT';

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

    /** @private {?Element} */
    this.textEl_ = null;

    /** @private {?Element} */
    this.launchEl_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    /** @private {string} */
    this.text_ = this.element_.textContent;

    /** @private @const {!../../../src/service/resources-interface.ResourcesInterface} */
    this.resources_ = Services.resourcesForDoc(getAmpdoc(this.win_.document));
  }

  /**
   * Builds affiliate link.
   */
  build() {
    if (this.element_[AFFILIATE_LINK_BUILT]) {
      return;
    }

    this.resources_.mutateElement(this.element_, () => {
      this.element_.textContent = '';
      this.element_.toggleAttribute('pristine', true);
      this.addPulseElement_();
      this.addIconElement_();
      this.addText_();
      this.addLaunchElement_();
    });

    this.initializeListener_();
    this.element_[AFFILIATE_LINK_BUILT] = true;
  }

  /**
   * Initialize listener to toggle expanded state.
   * @private
   */
  initializeListener_() {
    this.storeService_.subscribe(
      StateProperty.AFFILIATE_LINK_STATE,
      elementToToggleExpand => {
        const expand = this.element_ === elementToToggleExpand;
        this.element_.toggleAttribute('expanded', expand);
        this.textEl_.toggleAttribute('hidden', !expand);
        this.launchEl_.toggleAttribute('hidden', !expand);
        if (expand) {
          this.element_.toggleAttribute('pristine', false);
        }
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
        <div class="i-amphtml-story-reset i-amphtml-hidden">
          <span class="i-amphtml-story-affiliate-link-text" hidden></span>
          <i class="i-amphtml-story-affiliate-link-launch" hidden></i>
        </div>        
      </div>`;
    this.element_.appendChild(iconEl);
  }

  /**
   * Adds text from <a> tag to expanded link.
   * @private
   */
  addText_() {
    this.textEl_ = this.element_.querySelector(
      '.i-amphtml-story-affiliate-link-text'
    );

    this.textEl_.textContent = this.text_;
    this.textEl_.toggleAttribute('hidden', true);
  }

  /**
   * Adds launch arrow to expanded link.
   * @private
   */
  addLaunchElement_() {
    this.launchEl_ = this.element_.querySelector(
      '.i-amphtml-story-affiliate-link-launch'
    );

    this.launchEl_.toggleAttribute('hidden', true);
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
