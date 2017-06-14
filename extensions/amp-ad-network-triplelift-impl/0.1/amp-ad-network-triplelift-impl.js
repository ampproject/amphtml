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

import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';
import {base64UrlDecodeToBytes} from '../../../src/utils/base64';
import {dev} from '../../../src/log';

/**
 * Header that will contain Cloudflare generated signature
 *
 * @type {string}
 * @private
 */
const AMP_SIGNATURE_HEADER_ = 'X-AmpAdSignature';

/**
 * TripleLift base URL
 *
 * @type {string}
 * @private
 */
const TRIPLELIFT_BASE_URL_ = 'ib.3lift.com/ttj';

/**
 * TripleLift A4A base URL
 *
 * @type {string}
 * @private
 */
const TRIPLELIFT_BASE_A4A_URL_ = 'amp.3lift.com/_a4a/amp/auction';

/**
 * This is a minimalistic AmpA4A implementation that primarily gets an Ad
 * through a source URL and extracts the generated signature
 * from a HTTP header.  This is then given to A4A to validate against
 * the cloudflare signing key.
 */
export class AmpAdNetworkTripleliftImpl extends AmpA4A {

  /** @override */
  isValidElement() {
    return this.isAmpAdElement();
  }

  /** @override */
  getSigningServiceNames() {
    return ['cloudflare'];
  }

  /** @override */
  getAdUrl() {
    return this.element.getAttribute('src').replace(TRIPLELIFT_BASE_URL_,
        TRIPLELIFT_BASE_A4A_URL_);
  }

  /**
   * Extract creative and signature from a Cloudflare signed response.
   *
   * Note: Invalid A4A content will NOT have a signature, which will
   * automatically cause the A4A processing to fall through to the 3p ad flow.
   *
   * @override
   */
  extractCreativeAndSignature(responseText, responseHeaders) {
    let signature = null;
    try {
      if (responseHeaders.has(AMP_SIGNATURE_HEADER_)) {
        signature =
          base64UrlDecodeToBytes(dev().assertString(
              responseHeaders.get(AMP_SIGNATURE_HEADER_)));
      }
    } finally {
      return Promise.resolve(/** @type
        {!../../../extensions/amp-a4a/0.1/amp-a4a.AdResponseDef} */
        ({creative: responseText, signature})
      );
    }
  }
}

AMP.registerElement('amp-ad-network-triplelift-impl',
    AmpAdNetworkTripleliftImpl);
