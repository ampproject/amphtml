/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';
import {startsWith} from '../../../src/string';

/**
 * Base URL
 *
 * @type {string}
 * @private
 */
const BASE_URL_ = 'https://smart-ads.biz/_amp';

/**
 * A4A base URL
 *
 * @type {string}
 * @private
 */
const BASE_A4A_URL_ = 'https://smart-ads.biz/_a4a';

export class AmpAdNetworkSmartAdsImpl extends AmpA4A {
  /** @override */
  getAdUrl(unusedConsentTuple, opt_rtcResponsesPromise) {
    return this.element.getAttribute('src').replace(BASE_URL_, BASE_A4A_URL_);
  }

  /** @override */
  getSigningServiceNames() {
    return ['cloudflare'];
  }

  /** @override */
  isValidElement() {
    const src = this.element.getAttribute('src') || '';
    return (
      this.isAmpAdElement() &&
      (startsWith(src, BASE_URL_) || startsWith(src, BASE_A4A_URL_))
    );
  }
}

AMP.extension('amp-ad-network-smartads-impl', '0.1', (AMP) => {
  AMP.registerElement('amp-ad-network-smartads-impl', AmpAdNetworkSmartAdsImpl);
});
