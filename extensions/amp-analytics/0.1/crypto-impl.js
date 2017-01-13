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

import {fromClass} from '../../../src/service';
import {dev} from '../../../src/log';
import {getExistingServiceForWindow} from '../../../src/service';
import {extensionsFor} from '../../../src/extensions';
import {stringToBytes} from '../../../src/utils/bytes';
import {base64UrlEncodeFromBytes} from '../../../src/utils/base64';

/** @const {string} */
const TAG = 'Crypto';
const FALLBACK_MSG = 'SubtleCrypto failed, fallback to closure lib.';

export class Crypto {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private @const {?webCrypto.SubtleCrypto} */
    this.subtle_ = getSubtle(win);

    /** @private {?Promise<{sha384: function((string|Uint8Array))}>} */
    this.polyfillPromise_ = null;

    if (!this.subtle_) {
      this.loadPolyfill_();
    }
  }

  /**
   * Returns the SHA-384 hash of the input string in a number array.
   * Input string cannot contain chars out of range [0,255].
   * @param {string|!Uint8Array} input
   * @return {!Promise<!Uint8Array>}
   * @throws {!Error} when input string contains chars out of range [0,255]
   */
  sha384(input) {
    if (typeof input === 'string') {
      input = stringToBytes(input);
    }

    // polyfill is (being) loaded,
    // means native Crypto API is not available or failed before.
    if (this.polyfillPromise_) {
      return this.polyfillPromise_.then(polyfill => polyfill.sha384(input));
    }
    try {
      return this.subtle_.digest({name: 'SHA-384'}, input)
          /** @param {?} buffer */
          .then(buffer => new Uint8Array(buffer),
              e => {
                // Chrome doesn't allow the usage of Crypto API under
                // non-secure origin: https://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
                if (e.message && e.message.indexOf('secure origin') < 0) {
                  // Log unexpected fallback.
                  dev().error(TAG, FALLBACK_MSG, e);
                }
                return this.loadPolyfill_().then(() => this.sha384(input));
              });
    } catch (e) {
      dev().error(TAG, FALLBACK_MSG, e);
      return this.loadPolyfill_().then(() => this.sha384(input));
    }
  }

  /**
   * Returns the SHA-384 hash of the input string in the format of web safe
   * base64 (using -_. instead of +/=).
   * Input string cannot contain chars out of range [0,255].
   * @param {string|!Uint8Array} input
   * @return {!Promise<string>}
   * @throws {!Error} when input string contains chars out of range [0,255]
   */
  sha384Base64(input) {
    return this.sha384(input).then(buffer => base64UrlEncodeFromBytes(buffer));
  }

  /**
   * Returns a uniform hash of the input string as a float number in the range
   * of [0, 1).
   * Input string cannot contain chars out of range [0,255].
   * @param {string|!Uint8Array} input
   * @return {!Promise<number>}
   */
  uniform(input) {
    return this.sha384(input).then(buffer => {
      // Consider the Uint8 array as a base256 fraction number,
      // then convert it to the decimal form.
      let result = 0;
      for (let i = 2; i >= 0; i--) { // 3 base256 digits give enough precision
        result = (result + buffer[i]) / 256;
      }
      return result;
    });
  }

  /**
   * Loads Crypto polyfill library.
   * @return {!Promise<{sha384: function((string|Uint8Array))}>}
   * @private
   */
  loadPolyfill_() {
    if (this.polyfillPromise_) {
      return this.polyfillPromise_;
    }
    return this.polyfillPromise_ = extensionsFor(this.win_)
        .loadExtension('amp-crypto-polyfill')
        .then(() => getExistingServiceForWindow(this.win_, 'crypto-polyfill'));
  }
}

function getSubtle(win) {
  if (!win.crypto) {
    return null;
  }
  return win.crypto.subtle || win.crypto.webkitSubtle || null;
}

export function installCryptoService(win) {
  return fromClass(win, 'crypto', Crypto);
}
