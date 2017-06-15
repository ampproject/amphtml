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

import {PublicKeyInfoDef} from '../crypto';
import {registerServiceBuilder, getService} from '../service';
import {dev} from '../log';
import {extensionsFor} from '../services';
import {stringToBytes, utf8Encode} from '../utils/bytes';
import {
  base64UrlDecodeToBytes,
  base64UrlEncodeFromBytes} from '../utils/base64';

/** @const {number} */
const VERSION = 0x00;

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
   * Convert a JSON Web Key object to a browser-native cryptographic key and
   * compute a hash for it.  The caller must verify that Web Cryptography is
   * available using isCryptoAvailable before calling this function.
   *
   * @param {string} serviceName used to identify the signing service.
   * @param {!JsonObject} jwk An object which is hopefully an RSA JSON Web Key.  The
   *     caller should verify that it is an object before calling this function.
   * @return {!Promise<!PublicKeyInfoDef>}
   */
  importPublicKey(serviceName, jwk) {
    dev().assert(this.isCryptoAvailable());
    // WebKit wants this as an ArrayBufferView.
    return (this.isWebkit_ ?
          utf8Encode(JSON.stringify(jwk)) : Promise.resolve(jwk))
        .then(encodedJwk => this.subtle_.importKey(
            'jwk',
            encodedJwk,
            {name: 'RSASSA-PKCS1-v1_5', hash: {name: 'SHA-256'}},
            true,
            ['verify']))
        .then(cryptoKey => {
          // We do the importKey first to allow the browser to check for
          // an invalid key.  This last check is in case the key is valid
          // but a different kind.
          if (typeof jwk['n'] != 'string' || typeof jwk['e'] != 'string') {
            throw new Error('missing fields in JSON Web Key');
          }
          const mod = base64UrlDecodeToBytes(jwk['n']);
          const pubExp = base64UrlDecodeToBytes(jwk['e']);
          const lenMod = lenPrefix(mod);
          const lenPubExp = lenPrefix(pubExp);
          const data = new Uint8Array(lenMod.length + lenPubExp.length);
          data.set(lenMod);
          data.set(lenPubExp, lenMod.length);
          // The list of RSA public keys are not under attacker's
          // control, so a collision would not help.
          return this.subtle_.digest({name: 'SHA-1'}, data)
              .then(digest => ({
                serviceName,
                cryptoKey,
                // Hash is the first 4 bytes of the SHA-1 digest.
                hash: new Uint8Array(/** @type {ArrayBuffer} */(digest), 0, 4),
              }));
        });
  }

  /**
   * Verifies signature was signed with private key matching public key given.
   * Does not verify data actually matches signature (use verifySignature).
   * @param {!Uint8Array} signature the RSA signature.
   * @param {!PublicKeyInfoDef} publicKeyInfo the RSA public key.
   * @return {boolean} whether signature was generated using hash.
   */
  verifyHashVersion(signature, publicKeyInfo) {
    // The signature has the following format:
    // 1-byte version + 4-byte key hash + raw RSA signature where
    // the raw RSA signature is computed over (data || 1-byte version).
    // If the hash doesn't match, don't bother checking this key.
    return signature.length > 5 && signature[0] == VERSION &&
        hashesEqual(signature, publicKeyInfo.hash);
  }

  /**
   * Verifies RSA signature corresponds to the data, given a public key.
   * @param {!Uint8Array} data the data that was signed.
   * @param {!Uint8Array} signature the RSA signature.
   * @param {!PublicKeyInfoDef} publicKeyInfo the RSA public key.
   * @return {!Promise<!boolean>} whether the signature is valid for
   *     the public key.
   */
  verifySignature(data, signature, publicKeyInfo) {
    dev().assert(this.isCryptoAvailable());
    if (!this.verifyHashVersion(signature, publicKeyInfo)) {
      return Promise.resolve(false);
    }
    // Verify that the data matches the raw RSA signature, using the
    // public key.
    // Append the version number to the data.
    const signedData = new Uint8Array(data.length + 1);
    signedData.set(data);
    signedData[data.length] = VERSION;

    return /** @type {!Promise<boolean>} */ (this.subtle_.verify(
        {name: 'RSASSA-PKCS1-v1_5', hash: {name: 'SHA-256'}},
        publicKeyInfo.cryptoKey,
        signature.subarray(5),
        signedData));
  }

  /**
   * Is this service actually available? For now, we use browser native
   * crypto. So if that is not available, then this service is not available.
   * @return {boolean}
   */
  isCryptoAvailable() {
    return !!this.subtle_;
  }
}

function getSubtle(win) {
  if (!win.crypto) {
    return null;
  }
  return win.crypto.subtle || win.crypto.webkitSubtle || null;
}

/**
 * Appends 4-byte endian data's length to the data itself.
 * @param {!Uint8Array} data
 * @return {!Uint8Array} the prepended 4-byte endian data's length together with
 *     the data itself.
 */
function lenPrefix(data) {
  const res = new Uint8Array(4 + data.length);
  res[0] = (data.length >> 24) & 0xff;
  res[1] = (data.length >> 16) & 0xff;
  res[2] = (data.length >> 8) & 0xff;
  res[3] = data.length & 0xff;
  res.set(data, 4);
  return res;
}

/**
 * Compare the hash field of the signature to keyHash.
 * Note that signature has a one-byte version, followed by 4-byte hash.
 * @param {?Uint8Array} signature
 * @param {?Uint8Array} keyHash
 * @return {boolean} signature[1..5] == keyHash
 */
function hashesEqual(signature, keyHash) {
  if (!signature || !keyHash) {
    return false;
  }
  for (let i = 0; i < 4; i++) {
    if (signature[i + 1] !== keyHash[i]) {
      return false;
    }
  }
  return true;
}

/**
 * @param {!Window} win
 */
export function installCryptoService(win) {
  return registerServiceBuilder(win, 'crypto', Crypto);
}
