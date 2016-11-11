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
import {user} from '../../../src/log';
import {templatesFor} from '../../../src/template';
import {xhrFor} from '../../../src/xhr';

/** @const {!string} Tag name for custom ad implementation. */
export const TAG_AD_CUSTOM = 'amp-ad-custom';

/** @var {Object} A map of promises for each value of data-url. The promise
 *  will fetch data for the URL for the ad server, and return it as a map of
 *  objects, keyed by slot; each object contains the variables to be
 *   substituted into the mustache template. */
const ampCustomadXhrPromises = {};

/** @var {Object} a map of ad slot ids for each value of data-url.
 *  Each entry in the map is an array of slot ids. */
let ampCustomadSlots = null;

export class AmpAdCustom extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    /** @private {string} The base URL of the ad server for this ad */
    this.url_ = element.getAttribute('data-url');

    /** @private {string} A string identifying this ad slot: the server's
     *  responses will be keyed by slot */
    this.slot_ = element.getAttribute('data-slot');
    if (!this.slot_) {
      // If a slot wasn't specified, set it to zero. For use in pages
      // with only a single ad.
      this.slot_ = 0;
    }
  }

  /** @override */
  getPriority() {
    // Loads ads after other content.
    return 2;
  }

  /** @override **/
  isLayoutSupported(layout) {
    /** @TODO Add proper support for more layouts, and figure out which ones
     *  we're permitting */
    return isLayoutSizeDefined(layout);
  }

  buildCallback() {
    // Ensure that there are templates in this ad
    const templates = this.element.querySelectorAll('template');
    user().assert(templates.length > 0, 'Missing template in custom ad');
    // And ensure that the slot value is legal
    user().assert(this.slot_.match(/^[0-9a-z]+$/),
        'custom ad slot should be alphanumeric: ' + this.slot_);
  }

  /**
   * Get a URL which includes a parameter indicating all slots to be fetched
   * from this web server URL
   * @returns {String} The URL with the "ampslots" parameter appended
   */
  getFullUrl() {
    if (ampCustomadSlots === null) {
      // The array of ad slots has not yet been built, do so now.
      ampCustomadSlots = {};
      const elements = document.querySelectorAll('amp-ad[type=custom]');
      for (let index = 0; index < elements.length; index++) {
        const elem = elements[index];
        const url = elem.getAttribute('data-url');
        if (!(url in ampCustomadSlots)) {
          ampCustomadSlots[url] = [];
        }
        const slotId = elem.getAttribute('data-slot');
        ampCustomadSlots[url].push(slotId ? slotId : 0);
      }
    }
    return this.url_ + (this.url_.match(/\?/) ? '&' : '?') + 'ampslots=' +
            (ampCustomadSlots[this.url_]).join(',');
  }

  /** @override */
  layoutCallback() {
    // If this promise has no URL yet, create one for it.
    if (!(this.url_ in ampCustomadXhrPromises)) {
      // Here is a promise that will return the data for this URL
      ampCustomadXhrPromises[this.url_] = xhrFor(this.win).fetchJson(
          this.getFullUrl(this.url_));
    }
    return ampCustomadXhrPromises[this.url_].then(data => {
      const element = this.element;
      // We will get here when the data has been fetched from the server
      templatesFor(this.win).findAndRenderTemplate(element, data[this.slot_])
        .then(renderedElement => {
        // Get here when the template has been rendered
        // Clear out the template and replace it by the rendered version
          element.innerHTML = '';
          element.appendChild(renderedElement);
          return this;
        });
    });
  }
}
