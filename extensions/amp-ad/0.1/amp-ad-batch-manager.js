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
const AD_BATCH_TICK_INTERVAL = 50;

/** @const {number} The number of ticks to wait for a response from the ad server before timing out */
const AD_BATCH_RETRIES = 100;

/** @const {!string} Tag name for ad batch manager implementation. */
export const TAG = 'amp-ad-batch-manager';

/** @const {Object} A map of AmpAdBatchManager objects, one for each value of data-url on the page */ 
let imageadBatchManagers = null;

/** @const {Object} A map of arrays of imagead Elements, keyed by data-url */
let imageadElements = null;
/**
  * Get a batch manager that will be used to batch together elements with the same data-url
  * Note a side effect: the first ad with a given data-url to be processed will have its isBatchMaster_ variable set to true
  * @param {Element} elem The element which is to be batched
  * @param {string} url The URL identifying which batch
  * @returns {AmpAdBatchManager}
  */
export function getBatchManager(elem, url) {
  // If this is our first imagead, create a map of responses for each value of 'data-url'
  // This allows ads from multiple ad servers on the same page
  if (imageadBatchManagers === null) {
    // Scan the page to get a list of all image ads on this page, indexed by url.
    // For performance reasons, we only do the scan once, the first time that a batch manager is constructed.
    imageadBatchManagers = {};
    imageadElements = {};
    const elements = document.querySelectorAll('amp-ad[type=imagead]');
    for (let ind = 0; ind < elements.length; ind++) {
      const el = elements[ind];
      const url = el.getAttribute('data-url');
      if (!(url in imageadElements)) {
        imageadElements[url] = [];
      }
      imageadElements[url].push(el);
    }
  }
  if (!(url in imageadBatchManagers)) {
    // This is the first time we've seen this URL, so this will be the master for this batch
    elem.batchMaster(true);
    imageadBatchManagers[url] = new AmpAdBatchManager(url);
  }
  return imageadBatchManagers[url];
}

export class AmpAdBatchManager {

  /** @param {string} url The base URL of the ad server */
  constructor(url) {

    /** @private {string} The base URL of the ad server */
    this.url_ = url;

    /** @private {string} The full URL of the ad server, including any slot ids */
    this.fullUrl_ = this.url_;

    /** @private {number} The number of timer ticks remaining before we give up waiting for an ad server response */
    this.retries_ = AD_BATCH_RETRIES;

    /** @public {Object} responseData Map of JSON responses indexed by slot */
    this.responseData = null;

    // Get a list of slots that are in use for this URL
    const elements = imageadElements[this.url_];
    const slots = elements.map(element => {
      const slotId = element.getAttribute('data-slot');
      // Use a slot id of 0 if the element didn't provide one.
      return slotId ? slotId : 0;
    });
    // If any slots were defined, add them to the URL
    if (slots.length) {
      this.fullUrl_ += '?s=' + slots.join(',');
    }
  }

  /**
   * Call this to instruct the batch manager to do the layout for an element. Prior to doing the layout, the batch manager
   * will fetch the data (if this is the batch master) or wait for it to be ready (if not the batch master).
   * @param {Element} elem The element for which the layout is to be done
   * @returns {Promise} The element's "jsondata_" variable will be filled its with the data from the ad server before this is
   *     resolved. If resolved OK, the element is returned by the promise
   */
  doLayout(elem) {
      return new Promise(resolve => {
        if (elem.batchMaster()) {
        // This is the master. We're going to do the layout for all ads in the batch
        // Gather the parameters to be added to the URL. First, make a list of the slot ids for all ads on this page with this URL
        xhrFor(elem.win).fetchJson(this.fullUrl_).then(data => {
          this.responseData = data;
          resolve(elem);
        }, function(err) {
          user().error(TAG, err);
        });

      } else {
        // This is not the master. We need to wait for the master to have fetched the response for the ad server; when this is done,
        // it's OK to proceed
        this.getResponseWhenReady().then(function() {
          resolve(elem);
        }, function(err) {
          user().error(TAG, err);
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
        if (--t.retries_) {
          setTimeout(function() {
            t.getResponseWhenReady().then(function() {
              resolve('OK');
            });
          }, AD_BATCH_TICK_INTERVAL);
        } else {
          reject('Timed out waiting for server');
        }
      } else {
        resolve('OK');
      }
    });
  }
}
