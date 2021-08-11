function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
  function Crypto(win) {
    _classCallCheck(this, Crypto);

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
      hash: {
        name: 'SHA-256'
      }
    };

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
   */
  _createClass(Crypto, [{
    key: "sha384",
    value: function sha384(input) {
      var _this = this;

      if (typeof input === 'string') {
        input = stringToBytes(input);
      }

      if (!this.subtle || this.polyfillPromise_) {
        // means native Crypto API is not available or failed before.
        return (this.polyfillPromise_ || this.loadPolyfill_()).then(function (polyfillSha384) {
          return polyfillSha384(input);
        });
      }

      try {
        return this.subtle.digest({
          name: 'SHA-384'
        }, input)
        /** @param {?} buffer */
        .then(function (buffer) {
          return new Uint8Array(buffer);
        }, function (e) {
          // Chrome doesn't allow the usage of Crypto API under
          // non-secure origin: https://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
          if (e.message && e.message.indexOf('secure origin') < 0) {
            // Log unexpected fallback.
            user().error(TAG, 'SubtleCrypto failed, fallback to closure lib.', e);
          }

          return _this.loadPolyfill_().then(function () {
            return _this.sha384(input);
          });
        });
      } catch (e) {
        dev().error(TAG, 'SubtleCrypto failed, fallback to closure lib.', e);
        return this.loadPolyfill_().then(function () {
          return _this.sha384(input);
        });
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

  }, {
    key: "sha384Base64",
    value: function sha384Base64(input) {
      return this.sha384(input).then(function (buffer) {
        return base64UrlEncodeFromBytes(buffer);
      });
    }
    /**
     * Returns a uniform hash of the input string as a float number in the range
     * of [0, 1).
     * Input string cannot contain chars out of range [0,255].
     * @param {string|!Uint8Array} input
     * @return {!Promise<number>}
     */

  }, {
    key: "uniform",
    value: function uniform(input) {
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
     */

  }, {
    key: "loadPolyfill_",
    value: function loadPolyfill_() {
      var _this2 = this;

      if (this.polyfillPromise_) {
        return this.polyfillPromise_;
      }

      return this.polyfillPromise_ = Services.extensionsFor(this.win_).preloadExtension('amp-crypto-polyfill').then(function () {
        return getService(_this2.win_, 'crypto-polyfill');
      });
    }
    /**
     * Checks whether Web Cryptography is available, which is required for PKCS 1
     * operations. SHA-384 operations do not need this because there's a polyfill.
     * This could be false if the browser does not support Web Cryptography, or if
     * the current browsing context is not secure (e.g., it's on an insecure HTTP
     * page, or an HTTPS iframe embedded in an insecure HTTP page).
     *
     * @return {boolean} whether Web Cryptography is available
     */

  }, {
    key: "isPkcsAvailable",
    value: function isPkcsAvailable() {
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
     */

  }, {
    key: "importPkcsKey",
    value: function importPkcsKey(jwk) {
      devAssert(this.isPkcsAvailable());
      // Safari 10 and earlier want this as an ArrayBufferView.
      var keyData = this.isLegacyWebkit_ ? utf8Encode(JSON.stringify(
      /** @type {!JsonObject} */
      jwk)) :
      /** @type {!webCrypto.JsonWebKey} */
      jwk;
      return (
        /** @type {!Promise<!webCrypto.CryptoKey>} */
        this.subtle.importKey('jwk', keyData, this.pkcsAlgo, true, ['verify'])
      );
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
     */

  }, {
    key: "verifyPkcs",
    value: function verifyPkcs(key, signature, data) {
      devAssert(this.isPkcsAvailable());
      return (
        /** @type {!Promise<boolean>} */
        this.subtle.verify(this.pkcsAlgo, key, signature, data)
      );
    }
  }]);

  return Crypto;
}();

/**
 * @param {!Window} win
 * @return {*} TODO(#23582): Specify return type
 */
export function installCryptoService(win) {
  return registerServiceBuilder(win, 'crypto', Crypto);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyeXB0by1pbXBsLmpzIl0sIm5hbWVzIjpbImJhc2U2NFVybEVuY29kZUZyb21CeXRlcyIsInN0cmluZ1RvQnl0ZXMiLCJ1dGY4RW5jb2RlIiwiU2VydmljZXMiLCJkZXYiLCJkZXZBc3NlcnQiLCJ1c2VyIiwiZ2V0U2VydmljZSIsInJlZ2lzdGVyU2VydmljZUJ1aWxkZXIiLCJUQUciLCJDcnlwdG9Qb2x5ZmlsbERlZiIsIkNyeXB0byIsIndpbiIsIndpbl8iLCJzdWJ0bGUiLCJpc0xlZ2FjeVdlYmtpdCIsImNyeXB0byIsIndlYmtpdFN1YnRsZSIsInBrY3NBbGdvIiwibmFtZSIsImhhc2giLCJpc0xlZ2FjeVdlYmtpdF8iLCJwb2x5ZmlsbFByb21pc2VfIiwiaW5wdXQiLCJsb2FkUG9seWZpbGxfIiwidGhlbiIsInBvbHlmaWxsU2hhMzg0IiwiZGlnZXN0IiwiYnVmZmVyIiwiVWludDhBcnJheSIsImUiLCJtZXNzYWdlIiwiaW5kZXhPZiIsImVycm9yIiwic2hhMzg0IiwicmVzdWx0IiwiaSIsImV4dGVuc2lvbnNGb3IiLCJwcmVsb2FkRXh0ZW5zaW9uIiwiQm9vbGVhbiIsImp3ayIsImlzUGtjc0F2YWlsYWJsZSIsImtleURhdGEiLCJKU09OIiwic3RyaW5naWZ5IiwiaW1wb3J0S2V5Iiwia2V5Iiwic2lnbmF0dXJlIiwiZGF0YSIsInZlcmlmeSIsImluc3RhbGxDcnlwdG9TZXJ2aWNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSx3QkFBUjtBQUNBLFNBQVFDLGFBQVIsRUFBdUJDLFVBQXZCO0FBRUEsU0FBUUMsUUFBUjtBQUVBLFNBQVFDLEdBQVIsRUFBYUMsU0FBYixFQUF3QkMsSUFBeEI7QUFDQSxTQUFRQyxVQUFSLEVBQW9CQyxzQkFBcEI7O0FBRUE7QUFDQSxJQUFNQyxHQUFHLEdBQUcsUUFBWjs7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QTdCO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE2IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtiYXNlNjRVcmxFbmNvZGVGcm9tQnl0ZXN9IGZyb20gJyNjb3JlL3R5cGVzL3N0cmluZy9iYXNlNjQnO1xuaW1wb3J0IHtzdHJpbmdUb0J5dGVzLCB1dGY4RW5jb2RlfSBmcm9tICcjY29yZS90eXBlcy9zdHJpbmcvYnl0ZXMnO1xuXG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5cbmltcG9ydCB7ZGV2LCBkZXZBc3NlcnQsIHVzZXJ9IGZyb20gJy4uL2xvZyc7XG5pbXBvcnQge2dldFNlcnZpY2UsIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXJ9IGZyb20gJy4uL3NlcnZpY2UtaGVscGVycyc7XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IFRBRyA9ICdDcnlwdG8nO1xuXG4vKipcbiAqIEB0eXBlZGVmIHtmdW5jdGlvbigoc3RyaW5nfFVpbnQ4QXJyYXkpKX1cbiAqL1xubGV0IENyeXB0b1BvbHlmaWxsRGVmO1xuXG5leHBvcnQgY2xhc3MgQ3J5cHRvIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgQ3J5cHRvLlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKi9cbiAgY29uc3RydWN0b3Iod2luKSB7XG4gICAgLyoqIEBwcml2YXRlIHshV2luZG93fSAqL1xuICAgIHRoaXMud2luXyA9IHdpbjtcblxuICAgIGxldCBzdWJ0bGUgPSBudWxsO1xuICAgIGxldCBpc0xlZ2FjeVdlYmtpdCA9IGZhbHNlO1xuICAgIGlmICh3aW4uY3J5cHRvKSB7XG4gICAgICBpZiAod2luLmNyeXB0by5zdWJ0bGUpIHtcbiAgICAgICAgc3VidGxlID0gd2luLmNyeXB0by5zdWJ0bGU7XG4gICAgICB9IGVsc2UgaWYgKHdpbi5jcnlwdG8ud2Via2l0U3VidGxlKSB7XG4gICAgICAgIHN1YnRsZSA9IHdpbi5jcnlwdG8ud2Via2l0U3VidGxlO1xuICAgICAgICBpc0xlZ2FjeVdlYmtpdCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEBjb25zdCB7e25hbWU6IHN0cmluZ319ICovXG4gICAgdGhpcy5wa2NzQWxnbyA9IHtcbiAgICAgIG5hbWU6ICdSU0FTU0EtUEtDUzEtdjFfNScsXG4gICAgICBoYXNoOiB7bmFtZTogJ1NIQS0yNTYnfSxcbiAgICB9O1xuXG4gICAgLyoqIEBjb25zdCB7P3dlYkNyeXB0by5TdWJ0bGVDcnlwdG99ICovXG4gICAgdGhpcy5zdWJ0bGUgPSBzdWJ0bGU7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHtib29sZWFufSAqL1xuICAgIHRoaXMuaXNMZWdhY3lXZWJraXRfID0gaXNMZWdhY3lXZWJraXQ7XG5cbiAgICAvKiogQHByaXZhdGUgez9Qcm9taXNlPCFDcnlwdG9Qb2x5ZmlsbERlZj59ICovXG4gICAgdGhpcy5wb2x5ZmlsbFByb21pc2VfID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBTSEEtMzg0IGhhc2ggb2YgdGhlIGlucHV0IHN0cmluZyBpbiBhIG51bWJlciBhcnJheS5cbiAgICogSW5wdXQgc3RyaW5nIGNhbm5vdCBjb250YWluIGNoYXJzIG91dCBvZiByYW5nZSBbMCwyNTVdLlxuICAgKiBAcGFyYW0ge3N0cmluZ3whVWludDhBcnJheX0gaW5wdXRcbiAgICogQHJldHVybiB7IVByb21pc2U8IVVpbnQ4QXJyYXk+fVxuICAgKiBAdGhyb3dzIHshRXJyb3J9IHdoZW4gaW5wdXQgc3RyaW5nIGNvbnRhaW5zIGNoYXJzIG91dCBvZiByYW5nZSBbMCwyNTVdXG4gICAqL1xuICBzaGEzODQoaW5wdXQpIHtcbiAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgaW5wdXQgPSBzdHJpbmdUb0J5dGVzKGlucHV0KTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuc3VidGxlIHx8IHRoaXMucG9seWZpbGxQcm9taXNlXykge1xuICAgICAgLy8gbWVhbnMgbmF0aXZlIENyeXB0byBBUEkgaXMgbm90IGF2YWlsYWJsZSBvciBmYWlsZWQgYmVmb3JlLlxuICAgICAgcmV0dXJuICh0aGlzLnBvbHlmaWxsUHJvbWlzZV8gfHwgdGhpcy5sb2FkUG9seWZpbGxfKCkpLnRoZW4oXG4gICAgICAgIChwb2x5ZmlsbFNoYTM4NCkgPT4gcG9seWZpbGxTaGEzODQoaW5wdXQpXG4gICAgICApO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICB0aGlzLnN1YnRsZVxuICAgICAgICAgIC5kaWdlc3Qoe25hbWU6ICdTSEEtMzg0J30sIGlucHV0KVxuICAgICAgICAgIC8qKiBAcGFyYW0gez99IGJ1ZmZlciAqL1xuICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgKGJ1ZmZlcikgPT4gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKSxcbiAgICAgICAgICAgIChlKSA9PiB7XG4gICAgICAgICAgICAgIC8vIENocm9tZSBkb2Vzbid0IGFsbG93IHRoZSB1c2FnZSBvZiBDcnlwdG8gQVBJIHVuZGVyXG4gICAgICAgICAgICAgIC8vIG5vbi1zZWN1cmUgb3JpZ2luOiBodHRwczovL3d3dy5jaHJvbWl1bS5vcmcvSG9tZS9jaHJvbWl1bS1zZWN1cml0eS9wcmVmZXItc2VjdXJlLW9yaWdpbnMtZm9yLXBvd2VyZnVsLW5ldy1mZWF0dXJlc1xuICAgICAgICAgICAgICBpZiAoZS5tZXNzYWdlICYmIGUubWVzc2FnZS5pbmRleE9mKCdzZWN1cmUgb3JpZ2luJykgPCAwKSB7XG4gICAgICAgICAgICAgICAgLy8gTG9nIHVuZXhwZWN0ZWQgZmFsbGJhY2suXG4gICAgICAgICAgICAgICAgdXNlcigpLmVycm9yKFxuICAgICAgICAgICAgICAgICAgVEFHLFxuICAgICAgICAgICAgICAgICAgJ1N1YnRsZUNyeXB0byBmYWlsZWQsIGZhbGxiYWNrIHRvIGNsb3N1cmUgbGliLicsXG4gICAgICAgICAgICAgICAgICBlXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sb2FkUG9seWZpbGxfKCkudGhlbigoKSA9PiB0aGlzLnNoYTM4NChpbnB1dCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIClcbiAgICAgICk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZGV2KCkuZXJyb3IoVEFHLCAnU3VidGxlQ3J5cHRvIGZhaWxlZCwgZmFsbGJhY2sgdG8gY2xvc3VyZSBsaWIuJywgZSk7XG4gICAgICByZXR1cm4gdGhpcy5sb2FkUG9seWZpbGxfKCkudGhlbigoKSA9PiB0aGlzLnNoYTM4NChpbnB1dCkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBTSEEtMzg0IGhhc2ggb2YgdGhlIGlucHV0IHN0cmluZyBpbiB0aGUgZm9ybWF0IG9mIHdlYiBzYWZlXG4gICAqIGJhc2U2NCAodXNpbmcgLV8uIGluc3RlYWQgb2YgKy89KS5cbiAgICogSW5wdXQgc3RyaW5nIGNhbm5vdCBjb250YWluIGNoYXJzIG91dCBvZiByYW5nZSBbMCwyNTVdLlxuICAgKiBAcGFyYW0ge3N0cmluZ3whVWludDhBcnJheX0gaW5wdXRcbiAgICogQHJldHVybiB7IVByb21pc2U8c3RyaW5nPn1cbiAgICogQHRocm93cyB7IUVycm9yfSB3aGVuIGlucHV0IHN0cmluZyBjb250YWlucyBjaGFycyBvdXQgb2YgcmFuZ2UgWzAsMjU1XVxuICAgKi9cbiAgc2hhMzg0QmFzZTY0KGlucHV0KSB7XG4gICAgcmV0dXJuIHRoaXMuc2hhMzg0KGlucHV0KS50aGVuKChidWZmZXIpID0+XG4gICAgICBiYXNlNjRVcmxFbmNvZGVGcm9tQnl0ZXMoYnVmZmVyKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHVuaWZvcm0gaGFzaCBvZiB0aGUgaW5wdXQgc3RyaW5nIGFzIGEgZmxvYXQgbnVtYmVyIGluIHRoZSByYW5nZVxuICAgKiBvZiBbMCwgMSkuXG4gICAqIElucHV0IHN0cmluZyBjYW5ub3QgY29udGFpbiBjaGFycyBvdXQgb2YgcmFuZ2UgWzAsMjU1XS5cbiAgICogQHBhcmFtIHtzdHJpbmd8IVVpbnQ4QXJyYXl9IGlucHV0XG4gICAqIEByZXR1cm4geyFQcm9taXNlPG51bWJlcj59XG4gICAqL1xuICB1bmlmb3JtKGlucHV0KSB7XG4gICAgcmV0dXJuIHRoaXMuc2hhMzg0KGlucHV0KS50aGVuKChidWZmZXIpID0+IHtcbiAgICAgIC8vIENvbnNpZGVyIHRoZSBVaW50OCBhcnJheSBhcyBhIGJhc2UyNTYgZnJhY3Rpb24gbnVtYmVyLFxuICAgICAgLy8gdGhlbiBjb252ZXJ0IGl0IHRvIHRoZSBkZWNpbWFsIGZvcm0uXG4gICAgICBsZXQgcmVzdWx0ID0gMDtcbiAgICAgIGZvciAobGV0IGkgPSAyOyBpID49IDA7IGktLSkge1xuICAgICAgICAvLyAzIGJhc2UyNTYgZGlnaXRzIGdpdmUgZW5vdWdoIHByZWNpc2lvblxuICAgICAgICByZXN1bHQgPSAocmVzdWx0ICsgYnVmZmVyW2ldKSAvIDI1NjtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogTG9hZHMgQ3J5cHRvIHBvbHlmaWxsIGxpYnJhcnkuXG4gICAqIEByZXR1cm4geyFQcm9taXNlPCFDcnlwdG9Qb2x5ZmlsbERlZj59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBsb2FkUG9seWZpbGxfKCkge1xuICAgIGlmICh0aGlzLnBvbHlmaWxsUHJvbWlzZV8pIHtcbiAgICAgIHJldHVybiB0aGlzLnBvbHlmaWxsUHJvbWlzZV87XG4gICAgfVxuICAgIHJldHVybiAodGhpcy5wb2x5ZmlsbFByb21pc2VfID0gU2VydmljZXMuZXh0ZW5zaW9uc0Zvcih0aGlzLndpbl8pXG4gICAgICAucHJlbG9hZEV4dGVuc2lvbignYW1wLWNyeXB0by1wb2x5ZmlsbCcpXG4gICAgICAudGhlbigoKSA9PiBnZXRTZXJ2aWNlKHRoaXMud2luXywgJ2NyeXB0by1wb2x5ZmlsbCcpKSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHdoZXRoZXIgV2ViIENyeXB0b2dyYXBoeSBpcyBhdmFpbGFibGUsIHdoaWNoIGlzIHJlcXVpcmVkIGZvciBQS0NTIDFcbiAgICogb3BlcmF0aW9ucy4gU0hBLTM4NCBvcGVyYXRpb25zIGRvIG5vdCBuZWVkIHRoaXMgYmVjYXVzZSB0aGVyZSdzIGEgcG9seWZpbGwuXG4gICAqIFRoaXMgY291bGQgYmUgZmFsc2UgaWYgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBXZWIgQ3J5cHRvZ3JhcGh5LCBvciBpZlxuICAgKiB0aGUgY3VycmVudCBicm93c2luZyBjb250ZXh0IGlzIG5vdCBzZWN1cmUgKGUuZy4sIGl0J3Mgb24gYW4gaW5zZWN1cmUgSFRUUFxuICAgKiBwYWdlLCBvciBhbiBIVFRQUyBpZnJhbWUgZW1iZWRkZWQgaW4gYW4gaW5zZWN1cmUgSFRUUCBwYWdlKS5cbiAgICpcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gd2hldGhlciBXZWIgQ3J5cHRvZ3JhcGh5IGlzIGF2YWlsYWJsZVxuICAgKi9cbiAgaXNQa2NzQXZhaWxhYmxlKCkge1xuICAgIHJldHVybiBCb29sZWFuKHRoaXMuc3VidGxlKSAmJiB0aGlzLndpbl9bJ2lzU2VjdXJlQ29udGV4dCddICE9PSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhbiBSU0EgSlNPTiBXZWIgS2V5IG9iamVjdCB0byBhIGJyb3dzZXItbmF0aXZlIGNyeXB0b2dyYXBoaWMga2V5LlxuICAgKiBBcyBhIHByZWNvbmRpdGlvbiwgYGlzUGtjc0F2YWlsYWJsZSgpYCBtdXN0IGJlIGB0cnVlYC5cbiAgICpcbiAgICogQHBhcmFtIHshT2JqZWN0fSBqd2sgYSBkZXNlcmlhbGl6ZWQgUlNBIEpTT04gV2ViIEtleSwgYXMgc3BlY2lmaWVkIGluXG4gICAqICAgICBTZWN0aW9uIDYuMyBvZiBSRkMgNzUxOFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhd2ViQ3J5cHRvLkNyeXB0b0tleT59XG4gICAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gaWYgYGp3a2AgaXMgbm90IGFuIFJTQSBKU09OIFdlYiBLZXlcbiAgICovXG4gIGltcG9ydFBrY3NLZXkoandrKSB7XG4gICAgZGV2QXNzZXJ0KHRoaXMuaXNQa2NzQXZhaWxhYmxlKCkpO1xuICAgIC8vIFNhZmFyaSAxMCBhbmQgZWFybGllciB3YW50IHRoaXMgYXMgYW4gQXJyYXlCdWZmZXJWaWV3LlxuICAgIGNvbnN0IGtleURhdGEgPSB0aGlzLmlzTGVnYWN5V2Via2l0X1xuICAgICAgPyB1dGY4RW5jb2RlKEpTT04uc3RyaW5naWZ5KC8qKiBAdHlwZSB7IUpzb25PYmplY3R9ICovIChqd2spKSlcbiAgICAgIDogLyoqIEB0eXBlIHshd2ViQ3J5cHRvLkpzb25XZWJLZXl9ICovIChqd2spO1xuICAgIHJldHVybiAvKiogQHR5cGUgeyFQcm9taXNlPCF3ZWJDcnlwdG8uQ3J5cHRvS2V5Pn0gKi8gKFxuICAgICAgdGhpcy5zdWJ0bGUuaW1wb3J0S2V5KCdqd2snLCBrZXlEYXRhLCB0aGlzLnBrY3NBbGdvLCB0cnVlLCBbJ3ZlcmlmeSddKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgYW4gUlNBU1NBLVBLQ1MxLXYxXzUgc2lnbmF0dXJlIHdpdGggYSBTSEEtMjU2IGhhc2guIEFzIGFcbiAgICogcHJlY29uZGl0aW9uLCBgaXNQa2NzQXZhaWxhYmxlKClgIG11c3QgYmUgYHRydWVgLlxuICAgKlxuICAgKiBAcGFyYW0geyF3ZWJDcnlwdG8uQ3J5cHRvS2V5fSBrZXkgYW4gUlNBIHB1YmxpYyBrZXlcbiAgICogQHBhcmFtIHshVWludDhBcnJheX0gc2lnbmF0dXJlIGFuIFJTQVNTQS1QS0NTMS12MV81IHNpZ25hdHVyZVxuICAgKiBAcGFyYW0geyFCdWZmZXJTb3VyY2V9IGRhdGEgdGhlIGRhdGEgdGhhdCB3YXMgc2lnbmVkXG4gICAqIEByZXR1cm4geyFQcm9taXNlPGJvb2xlYW4+fSB3aGV0aGVyIHRoZSBzaWduYXR1cmUgaXMgY29ycmVjdCBmb3IgdGhlIGdpdmVuXG4gICAqICAgICBkYXRhIGFuZCBwdWJsaWMga2V5XG4gICAqL1xuICB2ZXJpZnlQa2NzKGtleSwgc2lnbmF0dXJlLCBkYXRhKSB7XG4gICAgZGV2QXNzZXJ0KHRoaXMuaXNQa2NzQXZhaWxhYmxlKCkpO1xuICAgIHJldHVybiAvKiogQHR5cGUgeyFQcm9taXNlPGJvb2xlYW4+fSAqLyAoXG4gICAgICB0aGlzLnN1YnRsZS52ZXJpZnkodGhpcy5wa2NzQWxnbywga2V5LCBzaWduYXR1cmUsIGRhdGEpXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcmV0dXJuIHsqfSBUT0RPKCMyMzU4Mik6IFNwZWNpZnkgcmV0dXJuIHR5cGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGxDcnlwdG9TZXJ2aWNlKHdpbikge1xuICByZXR1cm4gcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlcih3aW4sICdjcnlwdG8nLCBDcnlwdG8pO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/service/crypto-impl.js