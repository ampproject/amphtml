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
import {startsWith} from '../../../src/string';

/**
 * GMOSSP base URL
 *
 * @type {string}
 * @private
 */
const GMOSSP_BASE_URL_ = 'https://sp.gmossp-sp.jp';

/**
 * This is a minimalistic AmpA4A implementation that primarily gets an Ad
 * through a source URL and extracts the generated signature
 * from a HTTP header.  This is then given to A4A to validate against
 * the cloudflare signing key.
 */
export class AmpAdNetworkGmosspImpl extends AmpA4A {

  /** @override */
  isValidElement() {
    return this.isAmpAdElement() &&
      startsWith(
          this.element.getAttribute('src') || '',
          GMOSSP_BASE_URL_
      );
  }

  /** @override */
  getSigningServiceNames() {
    return ['cloudflare'];
  }

  /** @override */
  getAdUrl() {
    return this.element.getAttribute('src');
  }

}

AMP.registerElement('amp-ad-network-gmossp-impl',
    AmpAdNetworkGmosspImpl);
