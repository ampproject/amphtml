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

import {AmpA4A, decodeSignatureHeader, decodeSizeHeader} from '../amp-a4a';

/** @type {string} @private */
export const SIGNATURE_HEADER = 'X-TestSignatureHeader';

/** @type {string} @private */
export const SIZE_HEADER = 'X-CreativeSize';

/** @type {string} @private */
export const TEST_URL = 'http://iframe.localhost:' + location.port +
    '/test/fixtures/served/iframe.html?args';

export class MockA4AImpl extends AmpA4A {
  getAdUrl() {
    return Promise.resolve(TEST_URL);
  }

  updatePriority() {
    // Do nothing.
  }

  extractCreativeAndSignature(responseArrayBuffer, responseHeaders) {
    return Promise.resolve(/** @type {!AdResponseDef} */ ({
      creative: responseArrayBuffer,
      signatureInfo: decodeSignatureHeader(
          responseHeaders.get(SIGNATURE_HEADER)),
      sizeInfo: decodeSizeHeader(responseHeaders.get(SIZE_HEADER)),
    }));
  }

  getFallback() {
    return null;
  }
}
