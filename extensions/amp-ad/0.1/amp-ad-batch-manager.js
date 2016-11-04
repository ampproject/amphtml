/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import {user} from '../../../src/log';
import {xhrFor} from '../../../src/xhr';

/** @const {number} The number of milliseconds between checks to see if the response has arrived */
const AD_BATCH_TICK_LENGTH = 50;

/** @const {number} The number of ticks to wait for a response from the ad server before timing out */
const AD_BATCH_TIMEOUT = 100;

/** @const {!string} Tag name for ad batch manager implementation. */
export const TAG_AD_BATCH_MANAGER = 'amp-ad-batch-manager';

/**
  * Get a batch manager that will be used to batch together elements with the same data-url
  * Note a side effect: the first ad with a given data-url to be processed will have its isBatchMaster_ variable set to true
  * @param {Element} e The element which is to be batched
  * @param {string} url The URL identifying which batch
  * @param {string} selector The selector to choose the things to be batched (e.g. 'amp-ad[type=imagead]')
  * @returns {AmpAdBatchManager}
  */
export function getBatchManager(e, url, selector) {
  // If this is our first imagead, create a map of responses for each value of 'data-url'
  // This allows ads from multiple ad servers on the same page
  if (!(e.win.hasOwnProperty('imageadBatchManagers'))) {
    // Create an array of batch mangers. There will be one for each URL.
    e.win.imageadBatchManagers = {};
    // Scan the page to get a list of all image ads on this page, indexed by url.
    // For performance reasons, we only do the scan once, the first time that a batch manager is constructed.
    e.win.imageadElements = {};
    const elements = document.querySelectorAll(selector);
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const url = el.getAttribute('data-url');
      if (!(url in e.win.imageadElements)) {
        e.win.imageadElements[url] = [];
      }
      e.win.imageadElements[url].push(el);
    }
  }
  if (!(url in e.win.imageadBatchManagers)) {
    // This is the first time we've seen this URL, so this will be the master for this batch
    e.isBatchMaster_ = true;
    e.win.imageadBatchManagers[url] = new AmpAdBatchManager(e);
  } else {
    e.isBatchMaster_ = false;
  }
  return e.win.imageadBatchManagers[url];
}

export class AmpAdBatchManager {

  /** @param {!Element} element */
  constructor(element) {

    /** @private {string} The base URL of the ad server */
    this.url_ = element.url_;

    /** @private {string} The full URL of the ad server, including any slot ids */
    this.fullurl_ = this.url_;

    /** @private {string} The number of timer ticks remaining before we give up waiting for an ad server response */
    this.timeout_ = AD_BATCH_TIMEOUT;

    /** @public {Object} responseData Map of JSON responses indexed by slot */
    this.responseData = null;

    // Get a list of slots that are in use for this URL
    const slots = [];
    const elements = element.win.imageadElements[this.url_];
    for (let i = 0; i < elements.length; i++) {
      const e = elements[i];

      // If a slot is defined, add it to the list if it isn't there already
      let s = e.getAttribute('data-slot');
      if (s === null) {
        s = 0;
      }
      let done = false;
      for (const x in slots) {
        if (slots[x] == s) {
          done = true;
        }
      }
      if (!done) {
        slots.push(s);
      }
    }
    // If any slots were defined, add them to the URL
    if (slots.length) {
      this.fullurl_ += '?s=' + slots.join(',');
    }
  }

  /**
   * Call this to instruct the batch manager to do the layout for an element. Prior to doing the layout, the batch manager
   * will fetch the data (if this is the batch master) or wait for it to be ready (if not the batch master).
   * @param {Element} e The element for which the layout is to be done
   * @returns {Promise} The element's "jsondata_" variable will be filled its with the data from the ad server before this is
   *     resolved.
   */
  doLayout(e) {
    const t = this;
    return new Promise(function(resolve) {
      if (e.isBatchMaster_) {
        // This is the master. We're going to do the layout for all ads in the batch
        // Gather the parameters to be added to the URL. First, make a list of the slot ids for all ads on this page with this URL
        xhrFor(e.win).fetchJson(t.fullurl_).then(function(data) {
          t.responseData = data;
          resolve('OK');
        }, function(err) {
          user().error(TAG_AD_BATCH_MANAGER, err);
        });

      } else {
        // This is not the master. We need to wait for the master to have fetched the response for the ad server; when this is done,
        // it's OK to proceed
        t.getResponseWhenReady().then(function() {
          resolve('OK');
        }, function(err) {
          user().error(TAG_AD_BATCH_MANAGER, err);
        });
      }
    });
  }

  /**
   * Return a promise that will complete when the response from the image server has been received.
   * If the response is not ready after the specified timeout, reject the promise.
   * @returns {Promise}
   */
  getResponseWhenReady() {
    const t = this;
    return new Promise(function(resolve, reject) {
      if (t.responseData === null) {
        // The response data is not ready. Let's wait 50 ms and try again
        if (--t.timeout_) {
          setTimeout(function() {
            t.getResponseWhenReady().then(function() {
              resolve('OK');
            });
          }, AD_BATCH_TICK_LENGTH);
        } else {
          reject('Timed out waiting for server');
        }
      } else {
        resolve('OK');
      }
    });
  }
}
