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

    /** @private {string} A string identifying this ad slot: the server's responses will be keyed by slot */
    this.slot_ = element.getAttribute('data-slot');

    /** @private {Object} Data passed back from the ad server, via the batch manager */
    this.jsondata_ = null;

    /** @private {string} Target specifier for the ad's anchor tag: default to "_blank", accept "_top" */
    this.target_ = '_blank';
    const t = element.getAttribute('data-target');
    if (t) {
      if (t === '_blank' || t === '_self') {
        this.target_ = t;
      } else {
        user().error(TAG_AD_IMAGE,
        "Invalid data-target: only '_blank' and '_self' are permitted");
      }
    }

    /** @private {AmpAdBatchManager} This will batch up the display of this ad together with others of the same URL */
    this.batchManager_ = getBatchManager(this, this.url_, 'amp-ad[type=imagead]');

    this.lifecycleReporter_ = getLifecycleReporter(this, 'amp');
    this.lifecycleReporter_.sendPing('adSlotBuilt');
  }

  /** @override */
  getPriority() {
    // Loads ads after other content.
    return 2;
  }

  /** @override **/
  isLayoutSupported(layout) {
    /** @todo Add proper support for more layouts, and figure out which ones we're permitting */
    return isLayoutSizeDefined(layout);
  }

  /**
   * Display an ad in this element. Call this only when we know that the responses have been fetched from the ad server.
   * The response data can be found in the batch manager's responseData variable, indexed by slot.
   */
  showImageAd() {
    const d = this.batchManager_.responseData[this.slot_];
    // See if there are any templates in this ad
    const templates = this.element.querySelectorAll('template');
    if (templates.length) {
      // We have a template. Use it to do the rendering.
      const t = this;
      templatesFor(this.win).findAndRenderTemplate(this.element, d)
          .then(function(x) {
            // Clear out the template and replace it by the rendered version
            t.element.innerHTML = '';
            t.element.appendChild(x);
          });
    } else {
      // We have no template. Fall back to a simple default image ad.
      const a = document.createElement('a');
      a.setAttribute('target', this.target_);
      a.setAttribute('href', d.href);
      a.style.width = '100%';
      // If the server sent back some info for analytics purposes, put it where analytics can get at it
      if (d.hasOwnProperty('info')) {
        a.setAttribute('data-info', d.info);
      }
      this.element.appendChild(a);
      const i = document.createElement('img');
      i.setAttribute('src', d.src);
      i.style.width = '100%';
      a.appendChild(i);
    }
  }
  /** @override */
  layoutCallback() {
    const t = this;
    // Call the batch manager to do the layout
    return t.batchManager_.doLayout(t).then(function() {
      t.showImageAd();
    });
  }
}
