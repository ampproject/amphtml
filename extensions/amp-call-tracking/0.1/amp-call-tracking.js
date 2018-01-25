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
import {Layout, isLayoutSizeDefined} from '../../../src/layout';
import {Services} from '../../../src/services';
import {user} from '../../../src/log';


/**
 * Bookkeeps all unique URL requests so that no URL is called twice.
 * @type {!Object<string, !Promise>}
 */
let cachedResponsePromises_ = {};


/**
 * Fetches vendor response.
 * @param {!Window} win
 * @param {string} url
 * @return {!Promise<JsonObject>}
 */
function fetch_(win, url) {
  if (!(url in cachedResponsePromises_)) {
    cachedResponsePromises_[url] = Services.xhrFor(win)
        .fetchJson(url, {credentials: 'include'})
        .then(res => res.json());
  }
  return cachedResponsePromises_[url];
}


/** @visibleForTesting */
export function clearResponseCacheForTesting() {
  cachedResponsePromises_ = {};
}


/**
 * Implementation of `amp-call-tracking` component. See
 * {@link ../amp-call-tracking.md} for the spec.
 */
export class AmpCallTracking extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.hyperlink_ = null;

    /** @private {?string} */
    this.configUrl_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout) || layout == Layout.CONTAINER;
  }

  /** @override */
  buildCallback() {
    this.configUrl_ = assertHttpsUrl(
        this.element.getAttribute('config'), this.element);

    this.hyperlink_ = this.element.firstElementChild;
  }

  /** @override */
  layoutCallback() {
    return Services.urlReplacementsForDoc(this.getAmpDoc())
        .expandUrlAsync(user().assertString(this.configUrl_))
        .then(url => fetch_(this.win, url))
        .then(data => {
          user().assert('phoneNumber' in data,
              'Response must contain a non-empty phoneNumber field %s',
              this.element);

          this.hyperlink_.setAttribute('href', `tel:${data['phoneNumber']}`);
          this.hyperlink_.textContent = data['formattedPhoneNumber']
            || data['phoneNumber'];
        });
  }
}


AMP.extension('amp-call-tracking', '0.1', AMP => {
  AMP.registerElement('amp-call-tracking', AmpCallTracking);
});
