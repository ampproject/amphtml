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
const AMP_SIGNATURE_HEADER = 'X-AmpAdSignature';

/**
 * Base URL of Ad server.  The extra /_a4a prefix signals Cloudflare
 * A4A header processing to generate a signature and CORS headers.
 *
 * @type {string}
 * @private
 */
// This points to the internal "fake" cloudflare signed Ad server.
// Remove and replace with the actual value, like:
//   const CLOUDFLARE_BASE_URL = 'http://www.mycloudflaredomain.com/_a4a';
const CLOUDFLARE_BASE_URL =
  '/extensions/amp-ad-network-cloudflare-impl/0.1/data';

/**
 * This is a minimalistic AmpA4A implementation that primarily gets an Ad
 * through a source URL and extracts the Cloudflare generated signature
 * from a HTTP header.  This is then given to A4A to validate against
 * the cloudflare signing key.  Also see AmpAdNetworkFakeImpl for
 * additional guidance on other implementation details.
 */
export class AmpAdNetworkCloudflareImpl extends AmpA4A {

  /**
   * Validate the tag parameters.  If invalid, ad ad will not be displayed.
   * @override
   */
  isValidElement() {
    return this.element.hasAttribute('src') && this.isAmpAdElement();
  }

  /** @override */
  getSigningServiceNames() {
    // this specifies verification for Cloudflare signing
    return ['cloudflare'];
  }

  /** @override */
  getAdUrl() {
    // You can optionally use data from this context to augment the URL,
    // to pass data back to the network, to aid in ad selection.  For example:
    //   const rect = this.getIntersectionElementLayoutBox();
    // can extract the layout size and be used to pass layout hints to the server.

    // If you don't want to use relative URL generation from your base url,
    // be sure that this only generates urls to valid hosts, since it could
    // allow cookie leaks, etc.

    return CLOUDFLARE_BASE_URL + encodeURI(this.element.getAttribute('src'));
  }

  /**
   * Extract creative and signature from a Cloudflare signed response.
   *
   * Note: Invalid A4A content will NOT have a signature, which will automatically
   *   cause the A4A processing to render it within a cross domain frame.
   *
   * @override
   */
  extractCreativeAndSignature(responseText, responseHeaders) {
    let signature = null;
    try {
      if (responseHeaders.has(AMP_SIGNATURE_HEADER)) {
        signature =
          base64UrlDecodeToBytes(dev().assertString(
              responseHeaders.get(AMP_SIGNATURE_HEADER)));
      }
    } finally {
      return Promise.resolve(/** @type {!../../../extensions/amp-a4a/0.1/amp-a4a.AdResponseDef} */
        ({creative: responseText, signature})
      );
    }
  }
}

AMP.registerElement('amp-ad-network-cloudflare-impl',
  AmpAdNetworkCloudflareImpl);
