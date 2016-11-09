/**
 * Copyright 2016 David Karlin, Bachtrack Ltd. All Rights Reserved.
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

import {isLayoutSizeDefined} from '../../../src/layout';
import {getLifecycleReporter} from '../../../ads/google/a4a/performance';
import {user} from '../../../src/log';
import {getBatchManager} from './amp-ad-batch-manager.js';
import {templatesFor} from '../../../src/template';

/** @const {!string} Tag name for 3P AD implementation. */
export const TAG_AD_IMAGE = 'amp-ad-image';

export class AmpAdImage extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} The base URL of the ad server for this ad */
    this.url_ = element.getAttribute('data-url');
    
    /** @private {boolean} Whether this is the batch master */
    this.isBatchMaster_ = false;

    /** @private {string} A string identifying this ad slot: the server's responses will be keyed by slot */
    this.slot_ = element.getAttribute('data-slot');
    if (this.slot_ && !this.slot_.match(/^[0-9a-z]+$/)) {
      user().error(TAG_AD_IMAGE, 'imagead slot should be alphanumeric: ' +
            this.slot_);
    }

    /** @private {AmpAdBatchManager} This will batch up the display of this ad together with others of the same URL */
    this.batchManager_ = getBatchManager(this, this.url_);

    this.lifecycleReporter_ = getLifecycleReporter(this, 'amp');
    this.lifecycleReporter_.sendPing('adSlotBuilt');
  }

  /**
   * Get or Set whether this is a batch master
   * @param {boolean} val If true or false, set the value. If absent, just get the existing value
   * @returns {boolean} True if this is the batch master, else false
   */  
  batchMaster(val) {
      if (val === false || val === true) {
          this.isBatchMaster_ = val;
      }
      return this.isBatchMaster_;
  }

  /** @override */
  getPriority() {
    // Loads ads after other content.
    return 2;
  }

  /** @override **/
  isLayoutSupported(layout) {
    /** @TODO Add proper support for more layouts, and figure out which ones we're permitting */
    return isLayoutSizeDefined(layout);
  }

  /**
   * Display an ad in this element. Call this only when we know that the responses have been fetched from the ad server.
   * The response data can be found in the batch manager's responseData variable, indexed by slot.
   */
  showImageAd() {
    const response = this.batchManager_.responseData[this.slot_];
    // See if there are any templates in this ad
    const templates = this.element.querySelectorAll('template');
    if (templates.length == 0) {
      user().error(TAG_AD_IMAGE, 'Missing template in imagead');
      return;
    }
    const element = this.element;
    templatesFor(this.win).findAndRenderTemplate(element, response)
        .then(renderedElement => {
          // Clear out the template and replace it by the rendered version
          element.innerHTML = '';
          element.appendChild(renderedElement);
        });
  }
  /** @override */
  layoutCallback() {
    // Call the batch manager to do the layout
    return this.batchManager_.doLayout(this).then(element => {
      // When the batch manager has fetched the batch of ads safely, it can now tell us to show this one.
      element.showImageAd();
    });
  }
}
