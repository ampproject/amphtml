function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { base64UrlEncodeFromBytes } from "../core/types/string/base64";
import { stringToBytes, utf8Encode } from "../core/types/string/bytes";

import { Services } from "./";

import { dev, devAssert, user } from "../log";
import { getService, registerServiceBuilder } from "../service-helpers";

/** @const {string} */
var TAG = 'Crypto';

/**
 * @typedef {function((string|Uint8Array))}
 */
var CryptoPolyfillDef;

export var Crypto = /*#__PURE__*/function () {
  /**
   * Creates an instance of Crypto.
   * @param {!Window} win
   */
  function Crypto(win) {_classCallCheck(this, Crypto);
    /** @private {!Window} */
    this.win_ = win;

    var subtle = null;
    var isLegacyWebkit = false;
    if (win.crypto) {
      if (win.crypto.subtle) {
        subtle = win.crypto.subtle;
      } else if (win.crypto.webkitSubtle) {
        subtle = win.crypto.webkitSubtle;
        isLegacyWebkit = true;
      }
    }

    /** @const {{name: string}} */
    this.pkcsAlgo = {
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-256' } };


    /** @const {?webCrypto.SubtleCrypto} */
    this.subtle = subtle;

    /** @private @const {boolean} */
    this.isLegacyWebkit_ = isLegacyWebkit;

    /** @private {?Promise<!CryptoPolyfillDef>} */
    this.polyfillPromise_ = null;
  }

  /**
   * Returns the SHA-384 hash of the input string in a number array.
   * Input string cannot contain chars out of range [0,255].
   * @param {string|!Uint8Array} input
   * @return {!Promise<!Uint8Array>}
   * @throws {!Error} when input string contains chars out of range [0,255]
   */_createClass(Crypto, [{ key: "sha384", value:
    function sha384(input) {var _this = this;
      if (typeof input === 'string') {
        input = stringToBytes(input);
      }

      if (!this.subtle || this.polyfillPromise_) {
        // means native Crypto API is not available or failed before.
        return (this.polyfillPromise_ || this.loadPolyfill_()).then(
        function (polyfillSha384) {return polyfillSha384(input);});

      }

      try {
        return (
        this.subtle.
        digest({ name: 'SHA-384' }, input)
        /** @param {?} buffer */.
        then(
        function (buffer) {return new Uint8Array(buffer);},
        function (e) {
          // Chrome doesn't allow the usage of Crypto API under
          // non-secure origin: https://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
          if (e.message && e.message.indexOf('secure origin') < 0) {
            // Log unexpected fallback.
            user().error(
            TAG,
            'SubtleCrypto failed, fallback to closure lib.',
            e);

          }
          return _this.loadPolyfill_().then(function () {return _this.sha384(input);});
        }));


      } catch (e) {
        dev().error(TAG, 'SubtleCrypto failed, fallback to closure lib.', e);
        return this.loadPolyfill_().then(function () {return _this.sha384(input);});
      }
    }

    /**
     * Returns the SHA-384 hash of the input string in the format of web safe
     * base64 (using -_. instead of +/=).
     * Input string cannot contain chars out of range [0,255].
     * @param {string|!Uint8Array} input
     * @return {!Promise<string>}
     * @throws {!Error} when input string contains chars out of range [0,255]
     */ }, { key: "sha384Base64", value:
    function sha384Base64(input) {
      return this.sha384(input).then(function (buffer) {return (
          base64UrlEncodeFromBytes(buffer));});

    }

    /**
     * Returns a uniform hash of the input string as a float number in the range
     * of [0, 1).
     * Input string cannot contain chars out of range [0,255].
     * @param {string|!Uint8Array} input
     * @return {!Promise<number>}
     */ }, { key: "uniform", value:
    function uniform(input) {
      return this.sha384(input).then(function (buffer) {
        // Consider the Uint8 array as a base256 fraction number,
        // then convert it to the decimal form.
        var result = 0;
        for (var i = 2; i >= 0; i--) {
          // 3 base256 digits give enough precision
          result = (result + buffer[i]) / 256;
        }
        return result;
      });
    }

    /**
     * Loads Crypto polyfill library.
     * @return {!Promise<!CryptoPolyfillDef>}
     * @private
     */ }, { key: "loadPolyfill_", value:
    function loadPolyfill_() {var _this2 = this;
      if (this.polyfillPromise_) {
        return this.polyfillPromise_;
      }
      return (this.polyfillPromise_ = Services.extensionsFor(this.win_).
      preloadExtension('amp-crypto-polyfill').
      then(function () {return getService(_this2.win_, 'crypto-polyfill');}));
    }

    /**
     * Checks whether Web Cryptography is available, which is required for PKCS 1
     * operations. SHA-384 operations do not need this because there's a polyfill.
     * This could be false if the browser does not support Web Cryptography, or if
     * the current browsing context is not secure (e.g., it's on an insecure HTTP
     * page, or an HTTPS iframe embedded in an insecure HTTP page).
     *
     * @return {boolean} whether Web Cryptography is available
     */ }, { key: "isPkcsAvailable", value:
    function isPkcsAvailable() {
      return Boolean(this.subtle) && this.win_['isSecureContext'] !== false;
    }

    /**
     * Converts an RSA JSON Web Key object to a browser-native cryptographic key.
     * As a precondition, `isPkcsAvailable()` must be `true`.
     *
     * @param {!Object} jwk a deserialized RSA JSON Web Key, as specified in
     *     Section 6.3 of RFC 7518
     * @return {!Promise<!webCrypto.CryptoKey>}
     * @throws {TypeError} if `jwk` is not an RSA JSON Web Key
     */ }, { key: "importPkcsKey", value:
    function importPkcsKey(jwk) {
      devAssert(this.isPkcsAvailable());
      // Safari 10 and earlier want this as an ArrayBufferView.
      var keyData = this.isLegacyWebkit_ ?
      utf8Encode(JSON.stringify( /** @type {!JsonObject} */(jwk))) :
      /** @type {!webCrypto.JsonWebKey} */(jwk);
      return (/** @type {!Promise<!webCrypto.CryptoKey>} */(
        this.subtle.importKey('jwk', keyData, this.pkcsAlgo, true, ['verify'])));

    }

    /**
     * Verifies an RSASSA-PKCS1-v1_5 signature with a SHA-256 hash. As a
     * precondition, `isPkcsAvailable()` must be `true`.
     *
     * @param {!webCrypto.CryptoKey} key an RSA public key
     * @param {!Uint8Array} signature an RSASSA-PKCS1-v1_5 signature
     * @param {!BufferSource} data the data that was signed
     * @return {!Promise<boolean>} whether the signature is correct for the given
     *     data and public key
     */ }, { key: "verifyPkcs", value:
    function verifyPkcs(key, signature, data) {
      devAssert(this.isPkcsAvailable());
      return (/** @type {!Promise<boolean>} */(
        this.subtle.verify(this.pkcsAlgo, key, signature, data)));

    } }]);return Crypto;}();


/**
 * @param {!Window} win
 * @return {*} TODO(#23582): Specify return type
 */
export function installCryptoService(win) {
  return registerServiceBuilder(win, 'crypto', Crypto);
}
// /Users/mszylkowski/src/amphtml/src/service/crypto-impl.js