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


import {AmpAd} from '../extensions/amp-ad/0.1/amp-ad';
import {createIframePromise} from './iframe';
import {markElementScheduledForTesting} from '../src/custom-element';


/**
 * Creates an iframe with an ad inside it for use in tests.
 *
 * Returns a promise for when the ad is usable for testing that produces
 * an object with properties related to the created iframe and utility methods:
 * - win: The created window.
 * - doc: The created document.
 * - iframe: The host iframe element. Useful for e.g. resizing.
 * - awaitEvent: A function that returns a promise for when the given custom
 *   event fired at least the given number of times.
 * - errors: Array of console.error fired during page load.
 *
 * @param {string} name Type of element to create.
 * @param {function(!Window)} installer Function to install ad.
 * @param {!Object} attributes Attributes to add to the element.
 * @param {?string} canonical Rel, href link for element.
 * @param {function(!Element)=} opt_handleElement Called just before adding
 *       element to iframe.
 * @param {function(!Window)=} opt_beforeLayoutCallback Called just before any
 *       other JS executes in the window.
 * @return {!Promise}
 */
export function createAdPromise(name, attributes, canonical,
    opt_handleElement, opt_beforeLayoutCallback) {
  return createIframePromise(undefined, opt_beforeLayoutCallback)
    .then(iframe => {
      iframe.iframe.style.height = '400px';
      iframe.iframe.style.width = '400px';
      markElementScheduledForTesting(iframe.win, 'amp-user-notification');
      if (canonical) {
        const link = iframe.doc.createElement('link');
        link.setAttribute('rel', 'canonical');
        link.setAttribute('href', canonical);
        iframe.doc.head.appendChild(link);
      }
      let a = iframe.doc.createElement(name);
      for (const key in attributes) {
        a.setAttribute(key, attributes[key]);
      }
      if (attributes.resizable !== undefined) {
        const overflowEl = iframe.doc.createElement('div');
        overflowEl.setAttribute('overflow', '');
        a.appendChild(overflowEl);
      }
      // Make document long.
      a.style.marginBottom = '1000px';
      if (opt_handleElement) {
        a = opt_handleElement(a);
      }
      return iframe.addElement(a);
    });
}

