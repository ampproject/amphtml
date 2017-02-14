/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {assertHttpsUrl} from '../../../src/url';
import {urlReplacementsForDoc} from '../../../src/url-replacements';
import {user} from '../../../src/log';
import {xhrFor} from '../../../src/xhr';


/**
 * Bookkeeps all unique URL requests so that no URL is called twice.
 * @type {!Object<!string, !Promise>}
 */
let cachedResponsePromises_ = {};


/**
 * Fetches vendor response.
 * @param {!Window} window
 * @param {!string} url
 * @return {!Promise<Object>}
 */
function fetch_(window, url) {
  if (!(url in cachedResponsePromises_)) {
    cachedResponsePromises_[url] = xhrFor(window).fetchJson(url);
  }
  return cachedResponsePromises_[url];
}


/**
 * Implementation of `amp-call-tracking` component. See
 * {@link ../amp-call-tracking.md} for the spec.
 */
export class AmpCallTracking extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @const {!UrlReplacements} */
    this.urlReplacements_ = urlReplacementsForDoc(this.getAmpDoc());

    /** @private {?Element} */
    this.anchorEl_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return true;
  }

  /** @override */
  buildCallback() {
    this.anchorEl_ = this.getRealChildren()[0]; // TODO
  }

  /** @override */
  layoutCallback() {
    return this.urlReplacements_.expandAsync(assertHttpsUrl(
          this.element.getAttribute('config'), this.element))
      .then(url => fetch_(url))
      .then(data => {
        user().assert(data.phoneNumber && data.phoneNumber.length,
          'Response must contain a non-empty phoneNumber field %s',
          this.element);

        this.anchorEl_.setAttribute('href', `tel:${data.phoneNumber}`);
        this.anchorEl_.textContent = data.formattedPhoneNumber
            || data.phoneNumber;
      });
  }
}


AMP.registerElement('amp-call-tracking', AmpCallTracking);
