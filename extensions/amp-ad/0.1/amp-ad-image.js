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

/** @const {!string} Tag name for 3P AD implementation. */
export const TAG_AD_IMAGE = 'amp-ad-image';

/** @const {number} The number of milliseconds between checks to see if the response has arrived */
const IMAGEAD_TICK_LENGTH = 50;

/** @const {number} The number of ticks to wait for a response from the ad server before timing out */
const IMAGEAD_TIMEOUT = 100;

export class AmpAdImage extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} The base URL of the ad server for this ad */
    this.url_ = element.getAttribute('data-url');

    /** @private {string} A string identifying this ad slot: the server's responses will be keyed by slot */
    this.slot_ = element.getAttribute('data-slot');

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


    // If this is our first imagead, create a map of responses for each value of 'data-url'
    // This allows ads from multiple ad servers on the same page
    if (!this.win.hasOwnProperty('imageadResponses')) {
      // Map in the form {url1:xxx, url2:yyy} where xxx and yyy contain 0 initially, then 1 when the fetch for that URL is in
      // progress, then the data from the ad server when it arrives in the form {888:{src:xxx,target:yyy}}} where xxx is the
      // URL to use as the source of the image (which may be base64 if desired), and yyy is the URL to which to send the user
      // when the ad is clicked on
      this.win.imageadResponses = {};
      // Timers: the first imagead to be laid out for any given is will be used by all ads on the page except the first
      this.win.imageadTimeouts = {};
      // Map of slots for each URL
      this.win.imageadSlots = {};
    }
    if (!(this.url_ in this.win.imageadResponses)) {
      // This is the first time we've seen this URL
      this.win.imageadResponses[this.url_] = 0;
      this.win.imageadTimeouts[this.url_] = IMAGEAD_TIMEOUT;
      this.win.imageadSlots[this.url_] = [];
    }
    // If we haven't seen this slot yet (which will be the case unless there are two ads with the sam slot), add it.
    let done = false;
    for (const x in this.win.imageadSlots[this.url_]) {
      if (this.win.imageadSlots[this.url_][x] == this.slot_) {
        done = true;
      }
    }
    if (!done) {
      this.win.imageadSlots[this.url_].push(this.slot_);
    }

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?Element} */
    this.placeholder_ = null;

    /** @private {?Element} */
    this.fallback_ = null;

    /** @private {boolean} */
    this.isInFixedContainer_ = false;

    /**
     * The (relative) layout box of the ad iframe to the amp-ad tag.
     * @private {?../../../src/layout-rect.LayoutRectDef}
     */
    this.iframeLayoutBox_ = null;

    /**
     * Call to stop listening to viewport changes.
     * @private {?function()}
     */
    this.unlistenViewportChanges_ = null;

    /** @private {IntersectionObserver} */
    this.intersectionObserver_ = null;

    /** @private @const {function()} */
    this.boundNoContentHandler_ = () => this.noContentHandler_();

    /** @private {?string|undefined} */
    this.container_ = undefined;

    /** @private {?Promise} */
    this.layoutPromise_ = null;

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
   * Display an ad in this element. Call this only when we know that the responses have been fetched from the ad server
   */
  showImageAd() {
    const resp = this.win.imageadResponses[this.url_];
    for (const s in resp) {
      if (s == this.slot_) {
        const d = resp[s];
        const a = document.createElement('a');
        a.setAttribute('target', this.target_);
        a.setAttribute('href', d.target);
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
        return;
      }
    }
    user().error(TAG_AD_IMAGE, 'Slot ' + this.slot_ +
        ' not found in response from ' + this.url_);
  }

  /**
   * Return a promise that will complete when the response from the image server has been received.
   * If the response is not ready after
   * @returns {Promise}
   */
  getResponseWhenReady() {
    const t = this;
    return new Promise(function(resolve, reject) {
      if (t.win.imageadResponses[t.url_] !== 0 &&
              t.win.imageadResponses[t.url_] !== 1) {
        resolve('OK');
      } else {
      // t's not ready. Let's wait 50 ms and try again
        if (--t.win.imageadTimeouts[t.url_]) {
          setTimeout(function() {
            t.getResponseWhenReady().then(function() {
              resolve('OK');
            });
          }, IMAGEAD_TICK_LENGTH);
        } else {
          reject('Timed out waiting for imagead server');
        }
      }
    });
  }

  /** @override */
  layoutCallback() {
    const t = this;
    return new Promise(function(resolve, reject) {
      // First, let's see if we already have the data for this url
      const d = global.imageadResponses[t.url_];
      if (d === 0) {
        // We have not yet asked the ad server for this url for data. Do so now
        t.win.imageadResponses[t.url_] = 1; // Means "in progress"
        // Gather the parameters to be added to the URL. First, make a list of the slot ids for all ads on this page with this URL
        const req = new XMLHttpRequest();
        req.responseType = 'json';

        req.open('GET', t.url_ + '?s=' + t.win.imageadSlots[t.url_].join());

        req.onload = function() {
          if (req.status == 200) {
            // @todo What if the ad server wants to return an error? Need to trap it here
            t.win.imageadResponses[t.url_] = req.response;
            try {
              t.showImageAd();
            } catch (e) {
              reject(e);
            }
            resolve('OK');
          } else {
            reject(Error(req.statusText));
          }
        };
        req.onerror = function() {
          reject(Error('imagead network error'));
        };
        req.send();
      } else if (d === 1) {
        // The fetch is in progress, initiated by another ad. Wait for it to be complete
        t.getResponseWhenReady().then(function() {
          try {
            t.showImageAd();
          } catch (e) {
            reject(e);
          }
          resolve('OK');
        }, function(err) {
          user().error(TAG_AD_IMAGE, err);
        });
      } else {
        // The fetch is already complete.
        try {
          t.showImageAd();
        } catch (e) {
          reject(e);
        }
        resolve('OK');
      }
    });
  }
}
