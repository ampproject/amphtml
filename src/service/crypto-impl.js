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

import {registerServiceBuilder, getService} from '../service';
import {dev} from '../log';
import {extensionsFor} from '../services';
import {stringToBytes, utf8EncodeSync} from '../utils/bytes';
import {base64UrlEncodeFromBytes} from '../utils/base64';

/** @const {string} */
const TAG = 'Crypto';
const FALLBACK_MSG = 'SubtleCrypto failed, fallback to closure lib.';

export class Crypto {

  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private @const {?webCrypto.SubtleCrypto} */
    this.subtle_ = getSubtle(win);

    /** @private @const {boolean} */
    this.isWebkit_ = this.subtle_ && win.crypto && 'webkitSubtle' in win.crypto;

    /** @private {?Promise<{sha384: function((string|Uint8Array))}>} */
    this.polyfillPromise_ = null;
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

    if (!this.subtle_ || this.polyfillPromise_) {
      // means native Crypto API is not available or failed before.
      return (this.polyfillPromise_ || this.loadPolyfill_())
          .then(polyfill => polyfill.sha384(input));
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
        .then(() => getService(this.win_, 'crypto-polyfill'));
  }

  /**
   * Checks whether Web Cryptography is available. This is not needed for
   * SHA-384 operations, because there's a polyfill for that, but it is needed
   * for PKCS operations. This could be false if the browser does not support
   * Web Cryptography, or if the current browsing context is not secure (e.g.,
   * because it is on an insecure HTTP page, or an HTTPS iframe embedded in an
   * insecure HTTP page).
   *
   * @return {boolean} whether Web Cryptography is available
   */
  isCryptoAvailable() {
    return Boolean(this.subtle_) && this.win_.isSecureContext !== false;
  }

  /**
   * Converts an RSA JSON Web Key object to a browser-native cryptographic key.
   * As a precondition, `isCryptoAvailable()` must be `true`.
   *
   * @param {!Object} jwk a deserialized RSA JSON Web Key, as specified in
   *     Section 6.3 of RSA 7518
   * @return {!Promise<!CryptoKey>}
   * @throws {TypeError} if `jwk` is not an RSA JSON Web Key
   */
  importPkcsKey(jwk) {
    dev().assert(this.isCryptoAvailable());
    return this.subtle_.importKey(
        'jwk',
        // WebKit wants this as an ArrayBufferView.
        this.isWebkit_ ? utf8EncodeSync(JSON.stringify(jwk)) : jwk,
        {name: 'RSASSA-PKCS1-v1_5', hash: {name: 'SHA-256'}}, true, ['verify']);
  }

  /**
   * Verifies an RSASSA-PKCS1-v1_5 signature with a SHA-256 hash. As a
   * precondition, `isCryptoAvailable()` must be `true`.
   *
   * @param {!CryptoKey} an RSA public key
   * @param {!signature} an RSASSA-PKCS1-v1_5 signature
   * @param {!data} the data that was signed
   * @return {!Promise<boolean>} whether the signature is correct for the given
   *     data and public key
   */
  verifyPkcs(key, signature, data) {
    dev().assert(this.isCryptoAvailable());
    return this.subtle_.verify(
        {name: 'RSASSA-PKCS1-v1_5', hash: {name: 'SHA-256'}}, key, signature,
        data);
  }
}

function getSubtle(win) {
  if (!win.crypto) {
    return null;
  }
  return win.crypto.subtle || win.crypto.webkitSubtle || null;
}

/**
 * @param {!Window} win
 */
export function installCryptoService(win) {
  return registerServiceBuilder(win, 'crypto', Crypto);
}
