function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import { Services } from "../../../src/service";
import { base64DecodeToBytes } from "../../../src/core/types/string/base64";
import { dev, devAssert, user } from "../../../src/log";
import { isArray } from "../../../src/core/types";

/** @visibleForTesting */
export var AMP_SIGNATURE_HEADER = 'AMP-Fast-Fetch-Signature';

/**
 * The result of an attempt to verify a Fast Fetch signature. The different
 * error statuses are used for reporting errors to the ad network.
 *
 * @enum {number}
 */
export var VerificationStatus = {
  /** The ad was successfully verified as AMP. */
  OK: 0,

  /**
   * Verification failed because of a factor beyond the ad network's control,
   * such as a network connectivity failure, unavailability of Web Cryptography
   * in the current browsing context, or a misbehaving signing service.
   */
  UNVERIFIED: 1,

  /**
   * Verification failed because the keypair ID provided by the ad network did
   * not correspond to any public key offered by the signing service.
   */
  ERROR_KEY_NOT_FOUND: 2,

  /**
   * Verification failed because the signature provided by the ad network was
   * not the correct cryptographic signature for the given creative data and
   * public key.
   */
  ERROR_SIGNATURE_MISMATCH: 3,

  /**
   * Verification failed because the page does not have web crypto available,
   * i.e. is not SSL.
   */
  CRYPTO_UNAVAILABLE: 4
};

/**
 * A window-level object that encapsulates the logic for obtaining public keys
 * from Fast Fetch signing services and cryptographically verifying signatures
 * of AMP creatives.
 *
 * Unlike an AMP service, a signature verifier is **stateful**. It maintains a
 * cache of all public keys that it has previously downloaded and imported, and
 * also keeps track of which keys and signing services have already had
 * unsuccessful download or import attempts and should not be attempted again.
 *
 * This entire class is currently dead code in production, but will soon be
 * introduced as an experiment.
 */
export var SignatureVerifier = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Object<string, string>} signingServerURLs a map from the name of
   *    each trusted signing service to the URL of its public key endpoint
   */
  function SignatureVerifier(win, signingServerURLs) {
    _classCallCheck(this, SignatureVerifier);

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!Object<string, string>} */
    this.signingServerURLs_ = signingServerURLs;

    /**
     * The cache where all the public keys are stored.
     *
     * This field has a lot of internal structure and its type's a little hairy,
     * so here's a rundown of what each piece means:
     *  - If Web Cryptography isn't available in the current browsing context,
     *    then the entire field is null. Since the keys are of no use, we don't
     *    fetch them.
     *  - Otherwise, it's a map-like `Object` from signing service names (as
     *    defined in the Fast Fetch config registry) to "signer" objects.
     *  - The `promise` property of each signer resolves to a boolean indicating
     *    whether the most recent attempt to fetch and import that signing
     *    service's public keys was successful. If the promise is still pending,
     *    then an attempt is currently in progress. This property is mutable;
     *    its value is replaced with a new promise when a new attempt is made.
     *    Invariant: only one attempt may be in progress at a time, so this
     *    property may not be mutated while the current promise is pending.
     *  - The `keys` property of each signer is a map-like `Object` from keypair
     *    IDs to nullable key promises. (This means that a property access on
     *    this object may evaluate to `undefined`, `null`, or a `Promise`
     *    object.) The `keys` object is internally mutable; new keys are added
     *    to it as they are fetched. Invariant: the `keys` object may be mutated
     *    only while the corresponding `promise` object is pending; this ensures
     *    that callbacks chained to `promise` may observe `keys` without being
     *    subject to race conditions.
     *  - If a key promise (i.e., the value of a property access on the `keys`
     *    object) is absent (i.e., `undefined`), then no key with that keypair
     *    ID is present (but this could be because of a stale cache). If it's
     *    null, then no key with that keypair ID could be found even after
     *    cachebusting. If it's a `Promise` that resolves to `null`, then key
     *    data for that keypair ID was found but could not be imported
     *    successfully; this most likely indicates signing service misbehavior.
     *    The success case is a `Promise` that resolves to a `CryptoKey`.
     *
     * @private @const {?Object<string, {promise: !Promise<boolean>, keys: !Object<string, ?Promise<?webCrypto.CryptoKey>>}>}
     */
    this.signers_ = Services.cryptoFor(win).isPkcsAvailable() ? {} : null;

    /**
     * Gets a notion of current time, in ms.  The value is not necessarily
     * absolute, so should be used only for computing deltas.  When available,
     * the performance system will be used; otherwise Date.now() will be
     * returned.
     *
     * @protected @const {function(): number}
     */
    this.getNow_ = win.performance && win.performance.now ? win.performance.now.bind(win.performance) : Date.now;
  }

  /**
   * Fetches and imports the public keyset for the named signing service,
   * without any cachebusting. Hopefully, this will hit cache in many cases
   * and not make an actual network round-trip. This method should be called
   * as early as possible, once it's known which signing service is likely to
   * be used, so that the network request and key imports can execute in
   * parallel with other operations.
   *
   * @param {string} signingServiceName
   */
  _createClass(SignatureVerifier, [{
    key: "loadKeyset",
    value: function loadKeyset(signingServiceName) {
      if (this.signers_ && !this.signers_[signingServiceName]) {
        var keys = {};
        var promise = this.fetchAndAddKeys_(keys, signingServiceName, null);
        this.signers_[signingServiceName] = {
          promise: promise,
          keys: keys
        };
      }
    }
    /**
     * Extracts a cryptographic signature from `headers` and attempts to verify
     * that it's the correct cryptographic signature for `creative`.
     *
     * As a precondition, `loadKeyset(signingServiceName)` must have already been
     * called.
     *
     * @param {!ArrayBuffer} creative
     * @param {!Headers} headers
     * @return {!Promise<!VerificationStatus>}
     */

  }, {
    key: "verify",
    value: function verify(creative, headers) {
      var signatureFormat = /^([A-Za-z0-9._-]+):([A-Za-z0-9._-]+):([A-Za-z0-9+/]{341}[AQgw]==)$/;

      if (!headers.has(AMP_SIGNATURE_HEADER)) {
        return Promise.resolve(VerificationStatus.UNVERIFIED);
      }

      var headerValue = headers.get(AMP_SIGNATURE_HEADER);
      var match = signatureFormat.exec(headerValue);

      if (!match) {
        // TODO(@taymonbeal, #9274): replace this with real error reporting
        user().error('AMP-A4A', "Invalid signature header: " + headerValue.split(':')[0]);
        return Promise.resolve(VerificationStatus.ERROR_SIGNATURE_MISMATCH);
      }

      return this.verifyCreativeAndSignature(match[1], match[2], base64DecodeToBytes(match[3]), creative);
    }
    /**
     * Verifies that `signature` is the correct cryptographic signature for
     * `creative`, with the public key from the named signing service identified
     * by `keypairId`.
     *
     * As a precondition, `loadKeyset(signingServiceName)` must have already been
     * called.
     *
     * If the keyset for the named signing service was imported successfully but
     * did not include a key for `keypairId`, this may be the result of a stale
     * browser cache. To work around this, `keypairId` is added to the public key
     * endpoint URL as a query parameter and the keyset is re-fetched. Other kinds
     * of failures, including network connectivity failures, are not retried.
     *
     * @param {string} signingServiceName
     * @param {string} keypairId
     * @param {!Uint8Array} signature
     * @param {!ArrayBuffer} creative
     * @return {!Promise<!VerificationStatus>}
     * @visibleForTesting
     */

  }, {
    key: "verifyCreativeAndSignature",
    value: function verifyCreativeAndSignature(signingServiceName, keypairId, signature, creative) {
      var _this = this;

      if (!this.signers_) {
        // Web Cryptography isn't available.
        return Promise.resolve(VerificationStatus.CRYPTO_UNAVAILABLE);
      }

      var signer = this.signers_[signingServiceName];
      devAssert(signer, 'Keyset for service %s not loaded before verification', signingServiceName);
      return signer.promise.then(function (success) {
        if (!success) {
          // The public keyset couldn't be fetched and imported. Probably a
          // network connectivity failure.
          return VerificationStatus.UNVERIFIED;
        }

        var keyPromise = signer.keys[keypairId];

        if (keyPromise === undefined) {
          // We don't have this key, but maybe the cache is stale; try
          // cachebusting.
          signer.promise = _this.fetchAndAddKeys_(signer.keys, signingServiceName, keypairId).then(function (success) {
            if (signer.keys[keypairId] === undefined) {
              // We still don't have this key; make sure we never try
              // again.
              signer.keys[keypairId] = null;
            }

            return success;
          });
          // This "recursive" call can recurse at most once.
          return _this.verifyCreativeAndSignature(signingServiceName, keypairId, signature, creative);
        } else if (keyPromise === null) {
          // We don't have this key and we already tried cachebusting.
          return VerificationStatus.ERROR_KEY_NOT_FOUND;
        } else {
          return keyPromise.then(function (key) {
            if (!key) {
              // This particular public key couldn't be imported. Probably the
              // signing service's fault.
              return VerificationStatus.UNVERIFIED;
            }

            var crypto = Services.cryptoFor(_this.win_);
            return crypto.verifyPkcs(key, signature, creative).then(function (result) {
              return result ? VerificationStatus.OK : VerificationStatus.ERROR_SIGNATURE_MISMATCH;
            }, function (err) {
              // Web Cryptography rejected the verification attempt. This
              // hopefully won't happen in the wild, but browsers can be weird
              // about this, so we need to guard against the possibility.
              // Phone home to the AMP Project so that we can understand why
              // this occurred.
              var message = err && err.message;
              dev().error('AMP-A4A', "Failed to verify signature: " + message);
              return VerificationStatus.UNVERIFIED;
            });
          });
        }
      });
    }
    /**
     * Try to download the keyset for the named signing service and add a promise
     * for each key to the `keys` object.
     *
     * @param {!Object<string, ?Promise<?webCrypto.CryptoKey>>} keys the object to
     *     add each key promise to. This is mutated while the returned promise is
     *     pending.
     * @param {string} signingServiceName
     * @param {?string} keypairId the keypair ID to include in the query string
     *     for cachebusting purposes, or `null` if no cachebusting is needed
     * @return {!Promise<boolean>} resolves after the mutation of `keys` is
     *     complete, to `true` if the keyset was downloaded and parsed
     *     successfully (even if some keys were malformed), or `false` if a
     *     keyset-level failure occurred
     * @private
     */

  }, {
    key: "fetchAndAddKeys_",
    value: function fetchAndAddKeys_(keys, signingServiceName, keypairId) {
      var _this2 = this;

      var url = this.signingServerURLs_[signingServiceName];

      if (keypairId != null) {
        url += '?kid=' + encodeURIComponent(keypairId);
      }

      // TODO(@taymonbeal, #11088): consider a timeout on this fetch
      return Services.xhrFor(this.win_).fetchJson(url, {
        mode: 'cors',
        method: 'GET',
        // This should be cached across publisher domains, so don't append
        // __amp_source_origin to the URL.
        ampCors: false,
        credentials: 'omit'
      }).then(function (response) {
        // These are assertions on signing service behavior required by
        // the spec. However, nothing terrible happens if they aren't met
        // and there's no meaningful error recovery to be done if they
        // fail, so we don't need to do them at runtime in production.
        // They're included in dev mode as a debugging aid.
        devAssert(response.status === 200, 'Fast Fetch keyset spec requires status code 200');
        devAssert(response.headers.get('Content-Type') == 'application/jwk-set+json', 'Fast Fetch keyset spec requires Content-Type: ' + 'application/jwk-set+json');
        return response.json().then(function (jsonResponse) {
          var jwkSet =
          /** @type {!JsonObject} */
          jsonResponse;

          // This is supposed to be a JSON Web Key Set, as defined in
          // Section 5 of RFC 7517. However, the signing service could
          // misbehave and send an arbitrary JSON value, so we have to
          // type-check at runtime.
          if (!jwkSet || !isArray(jwkSet['keys'])) {
            signingServiceError(signingServiceName, "Key set (" + JSON.stringify(jwkSet) + ") has no \"keys\"");
            return false;
          }

          /** @type {!Array} */
          jwkSet['keys'].forEach(function (jwk) {
            if (!jwk || typeof jwk['kid'] != 'string') {
              signingServiceError(signingServiceName, "Key (" + JSON.stringify(jwk) + ") has no \"kid\"");
            } else if (keys[jwk['kid']] === undefined) {
              // We haven't seen this keypair ID before.
              keys[jwk['kid']] = Services.cryptoFor(_this2.win_).importPkcsKey(jwk).catch(function (err) {
                // Web Cryptography rejected the key
                // import attempt. Either the signing
                // service sent a malformed key or the
                // browser is doing something weird.
                var jwkData = JSON.stringify(jwk);
                var message = err && err.message;
                signingServiceError(signingServiceName, "Failed to import key (" + jwkData + "): " + message);
                return null;
              });
            }
          });
          return true;
        }, function (err) {
          // The signing service didn't send valid JSON.
          signingServiceError(signingServiceName, "Failed to parse JSON: " + (err && err.response));
          return false;
        });
      }, function (err) {
        // Some kind of error occurred during the XHR. This could be a lot
        // of things (and we have no type information), but if there's no
        // `response` it's probably a network connectivity failure, so we
        // ignore it. Unfortunately, we can't distinguish this from a CORS
        // problem.
        if (err && err.response) {
          // This probably indicates a non-2xx HTTP status code.
          signingServiceError(signingServiceName, "Status code " + err.response.status);
        }

        return false;
      });
    }
  }]);

  return SignatureVerifier;
}();

/**
 * Report an error caused by a signing service. Since signing services currently
 * don't have their own error logging URLs, we just send everything to the AMP
 * Project.
 *
 * @param {string} signingServiceName
 * @param {string} message
 * @private
 */
function signingServiceError(signingServiceName, message) {
  dev().error('AMP-A4A', "Signing service error for " + signingServiceName + ": " + message);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNpZ25hdHVyZS12ZXJpZmllci5qcyJdLCJuYW1lcyI6WyJTZXJ2aWNlcyIsImJhc2U2NERlY29kZVRvQnl0ZXMiLCJkZXYiLCJkZXZBc3NlcnQiLCJ1c2VyIiwiaXNBcnJheSIsIkFNUF9TSUdOQVRVUkVfSEVBREVSIiwiVmVyaWZpY2F0aW9uU3RhdHVzIiwiT0siLCJVTlZFUklGSUVEIiwiRVJST1JfS0VZX05PVF9GT1VORCIsIkVSUk9SX1NJR05BVFVSRV9NSVNNQVRDSCIsIkNSWVBUT19VTkFWQUlMQUJMRSIsIlNpZ25hdHVyZVZlcmlmaWVyIiwid2luIiwic2lnbmluZ1NlcnZlclVSTHMiLCJ3aW5fIiwic2lnbmluZ1NlcnZlclVSTHNfIiwic2lnbmVyc18iLCJjcnlwdG9Gb3IiLCJpc1BrY3NBdmFpbGFibGUiLCJnZXROb3dfIiwicGVyZm9ybWFuY2UiLCJub3ciLCJiaW5kIiwiRGF0ZSIsInNpZ25pbmdTZXJ2aWNlTmFtZSIsImtleXMiLCJwcm9taXNlIiwiZmV0Y2hBbmRBZGRLZXlzXyIsImNyZWF0aXZlIiwiaGVhZGVycyIsInNpZ25hdHVyZUZvcm1hdCIsImhhcyIsIlByb21pc2UiLCJyZXNvbHZlIiwiaGVhZGVyVmFsdWUiLCJnZXQiLCJtYXRjaCIsImV4ZWMiLCJlcnJvciIsInNwbGl0IiwidmVyaWZ5Q3JlYXRpdmVBbmRTaWduYXR1cmUiLCJrZXlwYWlySWQiLCJzaWduYXR1cmUiLCJzaWduZXIiLCJ0aGVuIiwic3VjY2VzcyIsImtleVByb21pc2UiLCJ1bmRlZmluZWQiLCJrZXkiLCJjcnlwdG8iLCJ2ZXJpZnlQa2NzIiwicmVzdWx0IiwiZXJyIiwibWVzc2FnZSIsInVybCIsImVuY29kZVVSSUNvbXBvbmVudCIsInhockZvciIsImZldGNoSnNvbiIsIm1vZGUiLCJtZXRob2QiLCJhbXBDb3JzIiwiY3JlZGVudGlhbHMiLCJyZXNwb25zZSIsInN0YXR1cyIsImpzb24iLCJqc29uUmVzcG9uc2UiLCJqd2tTZXQiLCJzaWduaW5nU2VydmljZUVycm9yIiwiSlNPTiIsInN0cmluZ2lmeSIsImZvckVhY2giLCJqd2siLCJpbXBvcnRQa2NzS2V5IiwiY2F0Y2giLCJqd2tEYXRhIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxRQUFSO0FBQ0EsU0FBUUMsbUJBQVI7QUFDQSxTQUFRQyxHQUFSLEVBQWFDLFNBQWIsRUFBd0JDLElBQXhCO0FBQ0EsU0FBUUMsT0FBUjs7QUFFQTtBQUNBLE9BQU8sSUFBTUMsb0JBQW9CLEdBQUcsMEJBQTdCOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sSUFBTUMsa0JBQWtCLEdBQUc7QUFDaEM7QUFDQUMsRUFBQUEsRUFBRSxFQUFFLENBRjRCOztBQUloQztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0VDLEVBQUFBLFVBQVUsRUFBRSxDQVRvQjs7QUFXaEM7QUFDRjtBQUNBO0FBQ0E7QUFDRUMsRUFBQUEsbUJBQW1CLEVBQUUsQ0FmVzs7QUFpQmhDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDRUMsRUFBQUEsd0JBQXdCLEVBQUUsQ0F0Qk07O0FBd0JoQztBQUNGO0FBQ0E7QUFDQTtBQUNFQyxFQUFBQSxrQkFBa0IsRUFBRTtBQTVCWSxDQUEzQjs7QUErQlA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFhQyxpQkFBYjtBQUNFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDRSw2QkFBWUMsR0FBWixFQUFpQkMsaUJBQWpCLEVBQW9DO0FBQUE7O0FBQ2xDO0FBQ0EsU0FBS0MsSUFBTCxHQUFZRixHQUFaOztBQUVBO0FBQ0EsU0FBS0csa0JBQUwsR0FBMEJGLGlCQUExQjs7QUFFQTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUFQO0FBNEZEO0FBMVVIOztBQUFBO0FBQUE7O0FBNlVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNJLG1CQUFULENBQTZCM0Msa0JBQTdCLEVBQWlENkIsT0FBakQsRUFBMEQ7QUFDeERyRCxFQUFBQSxHQUFHLEdBQUdzQyxLQUFOLENBQ0UsU0FERixpQ0FFK0JkLGtCQUYvQixVQUVzRDZCLE9BRnREO0FBSUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE3IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHtiYXNlNjREZWNvZGVUb0J5dGVzfSBmcm9tICcjY29yZS90eXBlcy9zdHJpbmcvYmFzZTY0JztcbmltcG9ydCB7ZGV2LCBkZXZBc3NlcnQsIHVzZXJ9IGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuaW1wb3J0IHtpc0FycmF5fSBmcm9tICcjY29yZS90eXBlcyc7XG5cbi8qKiBAdmlzaWJsZUZvclRlc3RpbmcgKi9cbmV4cG9ydCBjb25zdCBBTVBfU0lHTkFUVVJFX0hFQURFUiA9ICdBTVAtRmFzdC1GZXRjaC1TaWduYXR1cmUnO1xuXG4vKipcbiAqIFRoZSByZXN1bHQgb2YgYW4gYXR0ZW1wdCB0byB2ZXJpZnkgYSBGYXN0IEZldGNoIHNpZ25hdHVyZS4gVGhlIGRpZmZlcmVudFxuICogZXJyb3Igc3RhdHVzZXMgYXJlIHVzZWQgZm9yIHJlcG9ydGluZyBlcnJvcnMgdG8gdGhlIGFkIG5ldHdvcmsuXG4gKlxuICogQGVudW0ge251bWJlcn1cbiAqL1xuZXhwb3J0IGNvbnN0IFZlcmlmaWNhdGlvblN0YXR1cyA9IHtcbiAgLyoqIFRoZSBhZCB3YXMgc3VjY2Vzc2Z1bGx5IHZlcmlmaWVkIGFzIEFNUC4gKi9cbiAgT0s6IDAsXG5cbiAgLyoqXG4gICAqIFZlcmlmaWNhdGlvbiBmYWlsZWQgYmVjYXVzZSBvZiBhIGZhY3RvciBiZXlvbmQgdGhlIGFkIG5ldHdvcmsncyBjb250cm9sLFxuICAgKiBzdWNoIGFzIGEgbmV0d29yayBjb25uZWN0aXZpdHkgZmFpbHVyZSwgdW5hdmFpbGFiaWxpdHkgb2YgV2ViIENyeXB0b2dyYXBoeVxuICAgKiBpbiB0aGUgY3VycmVudCBicm93c2luZyBjb250ZXh0LCBvciBhIG1pc2JlaGF2aW5nIHNpZ25pbmcgc2VydmljZS5cbiAgICovXG4gIFVOVkVSSUZJRUQ6IDEsXG5cbiAgLyoqXG4gICAqIFZlcmlmaWNhdGlvbiBmYWlsZWQgYmVjYXVzZSB0aGUga2V5cGFpciBJRCBwcm92aWRlZCBieSB0aGUgYWQgbmV0d29yayBkaWRcbiAgICogbm90IGNvcnJlc3BvbmQgdG8gYW55IHB1YmxpYyBrZXkgb2ZmZXJlZCBieSB0aGUgc2lnbmluZyBzZXJ2aWNlLlxuICAgKi9cbiAgRVJST1JfS0VZX05PVF9GT1VORDogMixcblxuICAvKipcbiAgICogVmVyaWZpY2F0aW9uIGZhaWxlZCBiZWNhdXNlIHRoZSBzaWduYXR1cmUgcHJvdmlkZWQgYnkgdGhlIGFkIG5ldHdvcmsgd2FzXG4gICAqIG5vdCB0aGUgY29ycmVjdCBjcnlwdG9ncmFwaGljIHNpZ25hdHVyZSBmb3IgdGhlIGdpdmVuIGNyZWF0aXZlIGRhdGEgYW5kXG4gICAqIHB1YmxpYyBrZXkuXG4gICAqL1xuICBFUlJPUl9TSUdOQVRVUkVfTUlTTUFUQ0g6IDMsXG5cbiAgLyoqXG4gICAqIFZlcmlmaWNhdGlvbiBmYWlsZWQgYmVjYXVzZSB0aGUgcGFnZSBkb2VzIG5vdCBoYXZlIHdlYiBjcnlwdG8gYXZhaWxhYmxlLFxuICAgKiBpLmUuIGlzIG5vdCBTU0wuXG4gICAqL1xuICBDUllQVE9fVU5BVkFJTEFCTEU6IDQsXG59O1xuXG4vKipcbiAqIEEgd2luZG93LWxldmVsIG9iamVjdCB0aGF0IGVuY2Fwc3VsYXRlcyB0aGUgbG9naWMgZm9yIG9idGFpbmluZyBwdWJsaWMga2V5c1xuICogZnJvbSBGYXN0IEZldGNoIHNpZ25pbmcgc2VydmljZXMgYW5kIGNyeXB0b2dyYXBoaWNhbGx5IHZlcmlmeWluZyBzaWduYXR1cmVzXG4gKiBvZiBBTVAgY3JlYXRpdmVzLlxuICpcbiAqIFVubGlrZSBhbiBBTVAgc2VydmljZSwgYSBzaWduYXR1cmUgdmVyaWZpZXIgaXMgKipzdGF0ZWZ1bCoqLiBJdCBtYWludGFpbnMgYVxuICogY2FjaGUgb2YgYWxsIHB1YmxpYyBrZXlzIHRoYXQgaXQgaGFzIHByZXZpb3VzbHkgZG93bmxvYWRlZCBhbmQgaW1wb3J0ZWQsIGFuZFxuICogYWxzbyBrZWVwcyB0cmFjayBvZiB3aGljaCBrZXlzIGFuZCBzaWduaW5nIHNlcnZpY2VzIGhhdmUgYWxyZWFkeSBoYWRcbiAqIHVuc3VjY2Vzc2Z1bCBkb3dubG9hZCBvciBpbXBvcnQgYXR0ZW1wdHMgYW5kIHNob3VsZCBub3QgYmUgYXR0ZW1wdGVkIGFnYWluLlxuICpcbiAqIFRoaXMgZW50aXJlIGNsYXNzIGlzIGN1cnJlbnRseSBkZWFkIGNvZGUgaW4gcHJvZHVjdGlvbiwgYnV0IHdpbGwgc29vbiBiZVxuICogaW50cm9kdWNlZCBhcyBhbiBleHBlcmltZW50LlxuICovXG5leHBvcnQgY2xhc3MgU2lnbmF0dXJlVmVyaWZpZXIge1xuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHBhcmFtIHshT2JqZWN0PHN0cmluZywgc3RyaW5nPn0gc2lnbmluZ1NlcnZlclVSTHMgYSBtYXAgZnJvbSB0aGUgbmFtZSBvZlxuICAgKiAgICBlYWNoIHRydXN0ZWQgc2lnbmluZyBzZXJ2aWNlIHRvIHRoZSBVUkwgb2YgaXRzIHB1YmxpYyBrZXkgZW5kcG9pbnRcbiAgICovXG4gIGNvbnN0cnVjdG9yKHdpbiwgc2lnbmluZ1NlcnZlclVSTHMpIHtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshV2luZG93fSAqL1xuICAgIHRoaXMud2luXyA9IHdpbjtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFPYmplY3Q8c3RyaW5nLCBzdHJpbmc+fSAqL1xuICAgIHRoaXMuc2lnbmluZ1NlcnZlclVSTHNfID0gc2lnbmluZ1NlcnZlclVSTHM7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY2FjaGUgd2hlcmUgYWxsIHRoZSBwdWJsaWMga2V5cyBhcmUgc3RvcmVkLlxuICAgICAqXG4gICAgICogVGhpcyBmaWVsZCBoYXMgYSBsb3Qgb2YgaW50ZXJuYWwgc3RydWN0dXJlIGFuZCBpdHMgdHlwZSdzIGEgbGl0dGxlIGhhaXJ5LFxuICAgICAqIHNvIGhlcmUncyBhIHJ1bmRvd24gb2Ygd2hhdCBlYWNoIHBpZWNlIG1lYW5zOlxuICAgICAqICAtIElmIFdlYiBDcnlwdG9ncmFwaHkgaXNuJ3QgYXZhaWxhYmxlIGluIHRoZSBjdXJyZW50IGJyb3dzaW5nIGNvbnRleHQsXG4gICAgICogICAgdGhlbiB0aGUgZW50aXJlIGZpZWxkIGlzIG51bGwuIFNpbmNlIHRoZSBrZXlzIGFyZSBvZiBubyB1c2UsIHdlIGRvbid0XG4gICAgICogICAgZmV0Y2ggdGhlbS5cbiAgICAgKiAgLSBPdGhlcndpc2UsIGl0J3MgYSBtYXAtbGlrZSBgT2JqZWN0YCBmcm9tIHNpZ25pbmcgc2VydmljZSBuYW1lcyAoYXNcbiAgICAgKiAgICBkZWZpbmVkIGluIHRoZSBGYXN0IEZldGNoIGNvbmZpZyByZWdpc3RyeSkgdG8gXCJzaWduZXJcIiBvYmplY3RzLlxuICAgICAqICAtIFRoZSBgcHJvbWlzZWAgcHJvcGVydHkgb2YgZWFjaCBzaWduZXIgcmVzb2x2ZXMgdG8gYSBib29sZWFuIGluZGljYXRpbmdcbiAgICAgKiAgICB3aGV0aGVyIHRoZSBtb3N0IHJlY2VudCBhdHRlbXB0IHRvIGZldGNoIGFuZCBpbXBvcnQgdGhhdCBzaWduaW5nXG4gICAgICogICAgc2VydmljZSdzIHB1YmxpYyBrZXlzIHdhcyBzdWNjZXNzZnVsLiBJZiB0aGUgcHJvbWlzZSBpcyBzdGlsbCBwZW5kaW5nLFxuICAgICAqICAgIHRoZW4gYW4gYXR0ZW1wdCBpcyBjdXJyZW50bHkgaW4gcHJvZ3Jlc3MuIFRoaXMgcHJvcGVydHkgaXMgbXV0YWJsZTtcbiAgICAgKiAgICBpdHMgdmFsdWUgaXMgcmVwbGFjZWQgd2l0aCBhIG5ldyBwcm9taXNlIHdoZW4gYSBuZXcgYXR0ZW1wdCBpcyBtYWRlLlxuICAgICAqICAgIEludmFyaWFudDogb25seSBvbmUgYXR0ZW1wdCBtYXkgYmUgaW4gcHJvZ3Jlc3MgYXQgYSB0aW1lLCBzbyB0aGlzXG4gICAgICogICAgcHJvcGVydHkgbWF5IG5vdCBiZSBtdXRhdGVkIHdoaWxlIHRoZSBjdXJyZW50IHByb21pc2UgaXMgcGVuZGluZy5cbiAgICAgKiAgLSBUaGUgYGtleXNgIHByb3BlcnR5IG9mIGVhY2ggc2lnbmVyIGlzIGEgbWFwLWxpa2UgYE9iamVjdGAgZnJvbSBrZXlwYWlyXG4gICAgICogICAgSURzIHRvIG51bGxhYmxlIGtleSBwcm9taXNlcy4gKFRoaXMgbWVhbnMgdGhhdCBhIHByb3BlcnR5IGFjY2VzcyBvblxuICAgICAqICAgIHRoaXMgb2JqZWN0IG1heSBldmFsdWF0ZSB0byBgdW5kZWZpbmVkYCwgYG51bGxgLCBvciBhIGBQcm9taXNlYFxuICAgICAqICAgIG9iamVjdC4pIFRoZSBga2V5c2Agb2JqZWN0IGlzIGludGVybmFsbHkgbXV0YWJsZTsgbmV3IGtleXMgYXJlIGFkZGVkXG4gICAgICogICAgdG8gaXQgYXMgdGhleSBhcmUgZmV0Y2hlZC4gSW52YXJpYW50OiB0aGUgYGtleXNgIG9iamVjdCBtYXkgYmUgbXV0YXRlZFxuICAgICAqICAgIG9ubHkgd2hpbGUgdGhlIGNvcnJlc3BvbmRpbmcgYHByb21pc2VgIG9iamVjdCBpcyBwZW5kaW5nOyB0aGlzIGVuc3VyZXNcbiAgICAgKiAgICB0aGF0IGNhbGxiYWNrcyBjaGFpbmVkIHRvIGBwcm9taXNlYCBtYXkgb2JzZXJ2ZSBga2V5c2Agd2l0aG91dCBiZWluZ1xuICAgICAqICAgIHN1YmplY3QgdG8gcmFjZSBjb25kaXRpb25zLlxuICAgICAqICAtIElmIGEga2V5IHByb21pc2UgKGkuZS4sIHRoZSB2YWx1ZSBvZiBhIHByb3BlcnR5IGFjY2VzcyBvbiB0aGUgYGtleXNgXG4gICAgICogICAgb2JqZWN0KSBpcyBhYnNlbnQgKGkuZS4sIGB1bmRlZmluZWRgKSwgdGhlbiBubyBrZXkgd2l0aCB0aGF0IGtleXBhaXJcbiAgICAgKiAgICBJRCBpcyBwcmVzZW50IChidXQgdGhpcyBjb3VsZCBiZSBiZWNhdXNlIG9mIGEgc3RhbGUgY2FjaGUpLiBJZiBpdCdzXG4gICAgICogICAgbnVsbCwgdGhlbiBubyBrZXkgd2l0aCB0aGF0IGtleXBhaXIgSUQgY291bGQgYmUgZm91bmQgZXZlbiBhZnRlclxuICAgICAqICAgIGNhY2hlYnVzdGluZy4gSWYgaXQncyBhIGBQcm9taXNlYCB0aGF0IHJlc29sdmVzIHRvIGBudWxsYCwgdGhlbiBrZXlcbiAgICAgKiAgICBkYXRhIGZvciB0aGF0IGtleXBhaXIgSUQgd2FzIGZvdW5kIGJ1dCBjb3VsZCBub3QgYmUgaW1wb3J0ZWRcbiAgICAgKiAgICBzdWNjZXNzZnVsbHk7IHRoaXMgbW9zdCBsaWtlbHkgaW5kaWNhdGVzIHNpZ25pbmcgc2VydmljZSBtaXNiZWhhdmlvci5cbiAgICAgKiAgICBUaGUgc3VjY2VzcyBjYXNlIGlzIGEgYFByb21pc2VgIHRoYXQgcmVzb2x2ZXMgdG8gYSBgQ3J5cHRvS2V5YC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlIEBjb25zdCB7P09iamVjdDxzdHJpbmcsIHtwcm9taXNlOiAhUHJvbWlzZTxib29sZWFuPiwga2V5czogIU9iamVjdDxzdHJpbmcsID9Qcm9taXNlPD93ZWJDcnlwdG8uQ3J5cHRvS2V5Pj59Pn1cbiAgICAgKi9cbiAgICB0aGlzLnNpZ25lcnNfID0gU2VydmljZXMuY3J5cHRvRm9yKHdpbikuaXNQa2NzQXZhaWxhYmxlKCkgPyB7fSA6IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIGEgbm90aW9uIG9mIGN1cnJlbnQgdGltZSwgaW4gbXMuICBUaGUgdmFsdWUgaXMgbm90IG5lY2Vzc2FyaWx5XG4gICAgICogYWJzb2x1dGUsIHNvIHNob3VsZCBiZSB1c2VkIG9ubHkgZm9yIGNvbXB1dGluZyBkZWx0YXMuICBXaGVuIGF2YWlsYWJsZSxcbiAgICAgKiB0aGUgcGVyZm9ybWFuY2Ugc3lzdGVtIHdpbGwgYmUgdXNlZDsgb3RoZXJ3aXNlIERhdGUubm93KCkgd2lsbCBiZVxuICAgICAqIHJldHVybmVkLlxuICAgICAqXG4gICAgICogQHByb3RlY3RlZCBAY29uc3Qge2Z1bmN0aW9uKCk6IG51bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmdldE5vd18gPVxuICAgICAgd2luLnBlcmZvcm1hbmNlICYmIHdpbi5wZXJmb3JtYW5jZS5ub3dcbiAgICAgICAgPyB3aW4ucGVyZm9ybWFuY2Uubm93LmJpbmQod2luLnBlcmZvcm1hbmNlKVxuICAgICAgICA6IERhdGUubm93O1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoZXMgYW5kIGltcG9ydHMgdGhlIHB1YmxpYyBrZXlzZXQgZm9yIHRoZSBuYW1lZCBzaWduaW5nIHNlcnZpY2UsXG4gICAqIHdpdGhvdXQgYW55IGNhY2hlYnVzdGluZy4gSG9wZWZ1bGx5LCB0aGlzIHdpbGwgaGl0IGNhY2hlIGluIG1hbnkgY2FzZXNcbiAgICogYW5kIG5vdCBtYWtlIGFuIGFjdHVhbCBuZXR3b3JrIHJvdW5kLXRyaXAuIFRoaXMgbWV0aG9kIHNob3VsZCBiZSBjYWxsZWRcbiAgICogYXMgZWFybHkgYXMgcG9zc2libGUsIG9uY2UgaXQncyBrbm93biB3aGljaCBzaWduaW5nIHNlcnZpY2UgaXMgbGlrZWx5IHRvXG4gICAqIGJlIHVzZWQsIHNvIHRoYXQgdGhlIG5ldHdvcmsgcmVxdWVzdCBhbmQga2V5IGltcG9ydHMgY2FuIGV4ZWN1dGUgaW5cbiAgICogcGFyYWxsZWwgd2l0aCBvdGhlciBvcGVyYXRpb25zLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc2lnbmluZ1NlcnZpY2VOYW1lXG4gICAqL1xuICBsb2FkS2V5c2V0KHNpZ25pbmdTZXJ2aWNlTmFtZSkge1xuICAgIGlmICh0aGlzLnNpZ25lcnNfICYmICF0aGlzLnNpZ25lcnNfW3NpZ25pbmdTZXJ2aWNlTmFtZV0pIHtcbiAgICAgIGNvbnN0IGtleXMgPSB7fTtcbiAgICAgIGNvbnN0IHByb21pc2UgPSB0aGlzLmZldGNoQW5kQWRkS2V5c18oa2V5cywgc2lnbmluZ1NlcnZpY2VOYW1lLCBudWxsKTtcbiAgICAgIHRoaXMuc2lnbmVyc19bc2lnbmluZ1NlcnZpY2VOYW1lXSA9IHtwcm9taXNlLCBrZXlzfTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRXh0cmFjdHMgYSBjcnlwdG9ncmFwaGljIHNpZ25hdHVyZSBmcm9tIGBoZWFkZXJzYCBhbmQgYXR0ZW1wdHMgdG8gdmVyaWZ5XG4gICAqIHRoYXQgaXQncyB0aGUgY29ycmVjdCBjcnlwdG9ncmFwaGljIHNpZ25hdHVyZSBmb3IgYGNyZWF0aXZlYC5cbiAgICpcbiAgICogQXMgYSBwcmVjb25kaXRpb24sIGBsb2FkS2V5c2V0KHNpZ25pbmdTZXJ2aWNlTmFtZSlgIG11c3QgaGF2ZSBhbHJlYWR5IGJlZW5cbiAgICogY2FsbGVkLlxuICAgKlxuICAgKiBAcGFyYW0geyFBcnJheUJ1ZmZlcn0gY3JlYXRpdmVcbiAgICogQHBhcmFtIHshSGVhZGVyc30gaGVhZGVyc1xuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhVmVyaWZpY2F0aW9uU3RhdHVzPn1cbiAgICovXG4gIHZlcmlmeShjcmVhdGl2ZSwgaGVhZGVycykge1xuICAgIGNvbnN0IHNpZ25hdHVyZUZvcm1hdCA9XG4gICAgICAvXihbQS1aYS16MC05Ll8tXSspOihbQS1aYS16MC05Ll8tXSspOihbQS1aYS16MC05Ky9dezM0MX1bQVFnd109PSkkLztcbiAgICBpZiAoIWhlYWRlcnMuaGFzKEFNUF9TSUdOQVRVUkVfSEVBREVSKSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShWZXJpZmljYXRpb25TdGF0dXMuVU5WRVJJRklFRCk7XG4gICAgfVxuICAgIGNvbnN0IGhlYWRlclZhbHVlID0gaGVhZGVycy5nZXQoQU1QX1NJR05BVFVSRV9IRUFERVIpO1xuICAgIGNvbnN0IG1hdGNoID0gc2lnbmF0dXJlRm9ybWF0LmV4ZWMoaGVhZGVyVmFsdWUpO1xuICAgIGlmICghbWF0Y2gpIHtcbiAgICAgIC8vIFRPRE8oQHRheW1vbmJlYWwsICM5Mjc0KTogcmVwbGFjZSB0aGlzIHdpdGggcmVhbCBlcnJvciByZXBvcnRpbmdcbiAgICAgIHVzZXIoKS5lcnJvcihcbiAgICAgICAgJ0FNUC1BNEEnLFxuICAgICAgICBgSW52YWxpZCBzaWduYXR1cmUgaGVhZGVyOiAke2hlYWRlclZhbHVlLnNwbGl0KCc6JylbMF19YFxuICAgICAgKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoVmVyaWZpY2F0aW9uU3RhdHVzLkVSUk9SX1NJR05BVFVSRV9NSVNNQVRDSCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnZlcmlmeUNyZWF0aXZlQW5kU2lnbmF0dXJlKFxuICAgICAgbWF0Y2hbMV0sXG4gICAgICBtYXRjaFsyXSxcbiAgICAgIGJhc2U2NERlY29kZVRvQnl0ZXMobWF0Y2hbM10pLFxuICAgICAgY3JlYXRpdmVcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIHRoYXQgYHNpZ25hdHVyZWAgaXMgdGhlIGNvcnJlY3QgY3J5cHRvZ3JhcGhpYyBzaWduYXR1cmUgZm9yXG4gICAqIGBjcmVhdGl2ZWAsIHdpdGggdGhlIHB1YmxpYyBrZXkgZnJvbSB0aGUgbmFtZWQgc2lnbmluZyBzZXJ2aWNlIGlkZW50aWZpZWRcbiAgICogYnkgYGtleXBhaXJJZGAuXG4gICAqXG4gICAqIEFzIGEgcHJlY29uZGl0aW9uLCBgbG9hZEtleXNldChzaWduaW5nU2VydmljZU5hbWUpYCBtdXN0IGhhdmUgYWxyZWFkeSBiZWVuXG4gICAqIGNhbGxlZC5cbiAgICpcbiAgICogSWYgdGhlIGtleXNldCBmb3IgdGhlIG5hbWVkIHNpZ25pbmcgc2VydmljZSB3YXMgaW1wb3J0ZWQgc3VjY2Vzc2Z1bGx5IGJ1dFxuICAgKiBkaWQgbm90IGluY2x1ZGUgYSBrZXkgZm9yIGBrZXlwYWlySWRgLCB0aGlzIG1heSBiZSB0aGUgcmVzdWx0IG9mIGEgc3RhbGVcbiAgICogYnJvd3NlciBjYWNoZS4gVG8gd29yayBhcm91bmQgdGhpcywgYGtleXBhaXJJZGAgaXMgYWRkZWQgdG8gdGhlIHB1YmxpYyBrZXlcbiAgICogZW5kcG9pbnQgVVJMIGFzIGEgcXVlcnkgcGFyYW1ldGVyIGFuZCB0aGUga2V5c2V0IGlzIHJlLWZldGNoZWQuIE90aGVyIGtpbmRzXG4gICAqIG9mIGZhaWx1cmVzLCBpbmNsdWRpbmcgbmV0d29yayBjb25uZWN0aXZpdHkgZmFpbHVyZXMsIGFyZSBub3QgcmV0cmllZC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNpZ25pbmdTZXJ2aWNlTmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5cGFpcklkXG4gICAqIEBwYXJhbSB7IVVpbnQ4QXJyYXl9IHNpZ25hdHVyZVxuICAgKiBAcGFyYW0geyFBcnJheUJ1ZmZlcn0gY3JlYXRpdmVcbiAgICogQHJldHVybiB7IVByb21pc2U8IVZlcmlmaWNhdGlvblN0YXR1cz59XG4gICAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICAgKi9cbiAgdmVyaWZ5Q3JlYXRpdmVBbmRTaWduYXR1cmUoXG4gICAgc2lnbmluZ1NlcnZpY2VOYW1lLFxuICAgIGtleXBhaXJJZCxcbiAgICBzaWduYXR1cmUsXG4gICAgY3JlYXRpdmVcbiAgKSB7XG4gICAgaWYgKCF0aGlzLnNpZ25lcnNfKSB7XG4gICAgICAvLyBXZWIgQ3J5cHRvZ3JhcGh5IGlzbid0IGF2YWlsYWJsZS5cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoVmVyaWZpY2F0aW9uU3RhdHVzLkNSWVBUT19VTkFWQUlMQUJMRSk7XG4gICAgfVxuICAgIGNvbnN0IHNpZ25lciA9IHRoaXMuc2lnbmVyc19bc2lnbmluZ1NlcnZpY2VOYW1lXTtcbiAgICBkZXZBc3NlcnQoXG4gICAgICBzaWduZXIsXG4gICAgICAnS2V5c2V0IGZvciBzZXJ2aWNlICVzIG5vdCBsb2FkZWQgYmVmb3JlIHZlcmlmaWNhdGlvbicsXG4gICAgICBzaWduaW5nU2VydmljZU5hbWVcbiAgICApO1xuICAgIHJldHVybiBzaWduZXIucHJvbWlzZS50aGVuKChzdWNjZXNzKSA9PiB7XG4gICAgICBpZiAoIXN1Y2Nlc3MpIHtcbiAgICAgICAgLy8gVGhlIHB1YmxpYyBrZXlzZXQgY291bGRuJ3QgYmUgZmV0Y2hlZCBhbmQgaW1wb3J0ZWQuIFByb2JhYmx5IGFcbiAgICAgICAgLy8gbmV0d29yayBjb25uZWN0aXZpdHkgZmFpbHVyZS5cbiAgICAgICAgcmV0dXJuIFZlcmlmaWNhdGlvblN0YXR1cy5VTlZFUklGSUVEO1xuICAgICAgfVxuICAgICAgY29uc3Qga2V5UHJvbWlzZSA9IHNpZ25lci5rZXlzW2tleXBhaXJJZF07XG4gICAgICBpZiAoa2V5UHJvbWlzZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIFdlIGRvbid0IGhhdmUgdGhpcyBrZXksIGJ1dCBtYXliZSB0aGUgY2FjaGUgaXMgc3RhbGU7IHRyeVxuICAgICAgICAvLyBjYWNoZWJ1c3RpbmcuXG4gICAgICAgIHNpZ25lci5wcm9taXNlID0gdGhpcy5mZXRjaEFuZEFkZEtleXNfKFxuICAgICAgICAgIHNpZ25lci5rZXlzLFxuICAgICAgICAgIHNpZ25pbmdTZXJ2aWNlTmFtZSxcbiAgICAgICAgICBrZXlwYWlySWRcbiAgICAgICAgKS50aGVuKChzdWNjZXNzKSA9PiB7XG4gICAgICAgICAgaWYgKHNpZ25lci5rZXlzW2tleXBhaXJJZF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgLy8gV2Ugc3RpbGwgZG9uJ3QgaGF2ZSB0aGlzIGtleTsgbWFrZSBzdXJlIHdlIG5ldmVyIHRyeVxuICAgICAgICAgICAgLy8gYWdhaW4uXG4gICAgICAgICAgICBzaWduZXIua2V5c1trZXlwYWlySWRdID0gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHN1Y2Nlc3M7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBUaGlzIFwicmVjdXJzaXZlXCIgY2FsbCBjYW4gcmVjdXJzZSBhdCBtb3N0IG9uY2UuXG4gICAgICAgIHJldHVybiB0aGlzLnZlcmlmeUNyZWF0aXZlQW5kU2lnbmF0dXJlKFxuICAgICAgICAgIHNpZ25pbmdTZXJ2aWNlTmFtZSxcbiAgICAgICAgICBrZXlwYWlySWQsXG4gICAgICAgICAgc2lnbmF0dXJlLFxuICAgICAgICAgIGNyZWF0aXZlXG4gICAgICAgICk7XG4gICAgICB9IGVsc2UgaWYgKGtleVByb21pc2UgPT09IG51bGwpIHtcbiAgICAgICAgLy8gV2UgZG9uJ3QgaGF2ZSB0aGlzIGtleSBhbmQgd2UgYWxyZWFkeSB0cmllZCBjYWNoZWJ1c3RpbmcuXG4gICAgICAgIHJldHVybiBWZXJpZmljYXRpb25TdGF0dXMuRVJST1JfS0VZX05PVF9GT1VORDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBrZXlQcm9taXNlLnRoZW4oKGtleSkgPT4ge1xuICAgICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICAvLyBUaGlzIHBhcnRpY3VsYXIgcHVibGljIGtleSBjb3VsZG4ndCBiZSBpbXBvcnRlZC4gUHJvYmFibHkgdGhlXG4gICAgICAgICAgICAvLyBzaWduaW5nIHNlcnZpY2UncyBmYXVsdC5cbiAgICAgICAgICAgIHJldHVybiBWZXJpZmljYXRpb25TdGF0dXMuVU5WRVJJRklFRDtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgY3J5cHRvID0gU2VydmljZXMuY3J5cHRvRm9yKHRoaXMud2luXyk7XG4gICAgICAgICAgcmV0dXJuIGNyeXB0by52ZXJpZnlQa2NzKGtleSwgc2lnbmF0dXJlLCBjcmVhdGl2ZSkudGhlbihcbiAgICAgICAgICAgIChyZXN1bHQpID0+XG4gICAgICAgICAgICAgIHJlc3VsdFxuICAgICAgICAgICAgICAgID8gVmVyaWZpY2F0aW9uU3RhdHVzLk9LXG4gICAgICAgICAgICAgICAgOiBWZXJpZmljYXRpb25TdGF0dXMuRVJST1JfU0lHTkFUVVJFX01JU01BVENILFxuICAgICAgICAgICAgKGVycikgPT4ge1xuICAgICAgICAgICAgICAvLyBXZWIgQ3J5cHRvZ3JhcGh5IHJlamVjdGVkIHRoZSB2ZXJpZmljYXRpb24gYXR0ZW1wdC4gVGhpc1xuICAgICAgICAgICAgICAvLyBob3BlZnVsbHkgd29uJ3QgaGFwcGVuIGluIHRoZSB3aWxkLCBidXQgYnJvd3NlcnMgY2FuIGJlIHdlaXJkXG4gICAgICAgICAgICAgIC8vIGFib3V0IHRoaXMsIHNvIHdlIG5lZWQgdG8gZ3VhcmQgYWdhaW5zdCB0aGUgcG9zc2liaWxpdHkuXG4gICAgICAgICAgICAgIC8vIFBob25lIGhvbWUgdG8gdGhlIEFNUCBQcm9qZWN0IHNvIHRoYXQgd2UgY2FuIHVuZGVyc3RhbmQgd2h5XG4gICAgICAgICAgICAgIC8vIHRoaXMgb2NjdXJyZWQuXG4gICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnIgJiYgZXJyLm1lc3NhZ2U7XG4gICAgICAgICAgICAgIGRldigpLmVycm9yKCdBTVAtQTRBJywgYEZhaWxlZCB0byB2ZXJpZnkgc2lnbmF0dXJlOiAke21lc3NhZ2V9YCk7XG4gICAgICAgICAgICAgIHJldHVybiBWZXJpZmljYXRpb25TdGF0dXMuVU5WRVJJRklFRDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcnkgdG8gZG93bmxvYWQgdGhlIGtleXNldCBmb3IgdGhlIG5hbWVkIHNpZ25pbmcgc2VydmljZSBhbmQgYWRkIGEgcHJvbWlzZVxuICAgKiBmb3IgZWFjaCBrZXkgdG8gdGhlIGBrZXlzYCBvYmplY3QuXG4gICAqXG4gICAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsID9Qcm9taXNlPD93ZWJDcnlwdG8uQ3J5cHRvS2V5Pj59IGtleXMgdGhlIG9iamVjdCB0b1xuICAgKiAgICAgYWRkIGVhY2gga2V5IHByb21pc2UgdG8uIFRoaXMgaXMgbXV0YXRlZCB3aGlsZSB0aGUgcmV0dXJuZWQgcHJvbWlzZSBpc1xuICAgKiAgICAgcGVuZGluZy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHNpZ25pbmdTZXJ2aWNlTmFtZVxuICAgKiBAcGFyYW0gez9zdHJpbmd9IGtleXBhaXJJZCB0aGUga2V5cGFpciBJRCB0byBpbmNsdWRlIGluIHRoZSBxdWVyeSBzdHJpbmdcbiAgICogICAgIGZvciBjYWNoZWJ1c3RpbmcgcHVycG9zZXMsIG9yIGBudWxsYCBpZiBubyBjYWNoZWJ1c3RpbmcgaXMgbmVlZGVkXG4gICAqIEByZXR1cm4geyFQcm9taXNlPGJvb2xlYW4+fSByZXNvbHZlcyBhZnRlciB0aGUgbXV0YXRpb24gb2YgYGtleXNgIGlzXG4gICAqICAgICBjb21wbGV0ZSwgdG8gYHRydWVgIGlmIHRoZSBrZXlzZXQgd2FzIGRvd25sb2FkZWQgYW5kIHBhcnNlZFxuICAgKiAgICAgc3VjY2Vzc2Z1bGx5IChldmVuIGlmIHNvbWUga2V5cyB3ZXJlIG1hbGZvcm1lZCksIG9yIGBmYWxzZWAgaWYgYVxuICAgKiAgICAga2V5c2V0LWxldmVsIGZhaWx1cmUgb2NjdXJyZWRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGZldGNoQW5kQWRkS2V5c18oa2V5cywgc2lnbmluZ1NlcnZpY2VOYW1lLCBrZXlwYWlySWQpIHtcbiAgICBsZXQgdXJsID0gdGhpcy5zaWduaW5nU2VydmVyVVJMc19bc2lnbmluZ1NlcnZpY2VOYW1lXTtcbiAgICBpZiAoa2V5cGFpcklkICE9IG51bGwpIHtcbiAgICAgIHVybCArPSAnP2tpZD0nICsgZW5jb2RlVVJJQ29tcG9uZW50KGtleXBhaXJJZCk7XG4gICAgfVxuICAgIC8vIFRPRE8oQHRheW1vbmJlYWwsICMxMTA4OCk6IGNvbnNpZGVyIGEgdGltZW91dCBvbiB0aGlzIGZldGNoXG4gICAgcmV0dXJuIFNlcnZpY2VzLnhockZvcih0aGlzLndpbl8pXG4gICAgICAuZmV0Y2hKc29uKHVybCwge1xuICAgICAgICBtb2RlOiAnY29ycycsXG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIC8vIFRoaXMgc2hvdWxkIGJlIGNhY2hlZCBhY3Jvc3MgcHVibGlzaGVyIGRvbWFpbnMsIHNvIGRvbid0IGFwcGVuZFxuICAgICAgICAvLyBfX2FtcF9zb3VyY2Vfb3JpZ2luIHRvIHRoZSBVUkwuXG4gICAgICAgIGFtcENvcnM6IGZhbHNlLFxuICAgICAgICBjcmVkZW50aWFsczogJ29taXQnLFxuICAgICAgfSlcbiAgICAgIC50aGVuKFxuICAgICAgICAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAvLyBUaGVzZSBhcmUgYXNzZXJ0aW9ucyBvbiBzaWduaW5nIHNlcnZpY2UgYmVoYXZpb3IgcmVxdWlyZWQgYnlcbiAgICAgICAgICAvLyB0aGUgc3BlYy4gSG93ZXZlciwgbm90aGluZyB0ZXJyaWJsZSBoYXBwZW5zIGlmIHRoZXkgYXJlbid0IG1ldFxuICAgICAgICAgIC8vIGFuZCB0aGVyZSdzIG5vIG1lYW5pbmdmdWwgZXJyb3IgcmVjb3ZlcnkgdG8gYmUgZG9uZSBpZiB0aGV5XG4gICAgICAgICAgLy8gZmFpbCwgc28gd2UgZG9uJ3QgbmVlZCB0byBkbyB0aGVtIGF0IHJ1bnRpbWUgaW4gcHJvZHVjdGlvbi5cbiAgICAgICAgICAvLyBUaGV5J3JlIGluY2x1ZGVkIGluIGRldiBtb2RlIGFzIGEgZGVidWdnaW5nIGFpZC5cbiAgICAgICAgICBkZXZBc3NlcnQoXG4gICAgICAgICAgICByZXNwb25zZS5zdGF0dXMgPT09IDIwMCxcbiAgICAgICAgICAgICdGYXN0IEZldGNoIGtleXNldCBzcGVjIHJlcXVpcmVzIHN0YXR1cyBjb2RlIDIwMCdcbiAgICAgICAgICApO1xuICAgICAgICAgIGRldkFzc2VydChcbiAgICAgICAgICAgIHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdDb250ZW50LVR5cGUnKSA9PSAnYXBwbGljYXRpb24vandrLXNldCtqc29uJyxcbiAgICAgICAgICAgICdGYXN0IEZldGNoIGtleXNldCBzcGVjIHJlcXVpcmVzIENvbnRlbnQtVHlwZTogJyArXG4gICAgICAgICAgICAgICdhcHBsaWNhdGlvbi9qd2stc2V0K2pzb24nXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpLnRoZW4oXG4gICAgICAgICAgICAoanNvblJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGp3a1NldCA9IC8qKiBAdHlwZSB7IUpzb25PYmplY3R9ICovIChqc29uUmVzcG9uc2UpO1xuICAgICAgICAgICAgICAvLyBUaGlzIGlzIHN1cHBvc2VkIHRvIGJlIGEgSlNPTiBXZWIgS2V5IFNldCwgYXMgZGVmaW5lZCBpblxuICAgICAgICAgICAgICAvLyBTZWN0aW9uIDUgb2YgUkZDIDc1MTcuIEhvd2V2ZXIsIHRoZSBzaWduaW5nIHNlcnZpY2UgY291bGRcbiAgICAgICAgICAgICAgLy8gbWlzYmVoYXZlIGFuZCBzZW5kIGFuIGFyYml0cmFyeSBKU09OIHZhbHVlLCBzbyB3ZSBoYXZlIHRvXG4gICAgICAgICAgICAgIC8vIHR5cGUtY2hlY2sgYXQgcnVudGltZS5cbiAgICAgICAgICAgICAgaWYgKCFqd2tTZXQgfHwgIWlzQXJyYXkoandrU2V0WydrZXlzJ10pKSB7XG4gICAgICAgICAgICAgICAgc2lnbmluZ1NlcnZpY2VFcnJvcihcbiAgICAgICAgICAgICAgICAgIHNpZ25pbmdTZXJ2aWNlTmFtZSxcbiAgICAgICAgICAgICAgICAgIGBLZXkgc2V0ICgke0pTT04uc3RyaW5naWZ5KGp3a1NldCl9KSBoYXMgbm8gXCJrZXlzXCJgXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLyoqIEB0eXBlIHshQXJyYXl9ICovIChqd2tTZXRbJ2tleXMnXSkuZm9yRWFjaCgoandrKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFqd2sgfHwgdHlwZW9mIGp3a1sna2lkJ10gIT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgIHNpZ25pbmdTZXJ2aWNlRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIHNpZ25pbmdTZXJ2aWNlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgYEtleSAoJHtKU09OLnN0cmluZ2lmeShqd2spfSkgaGFzIG5vIFwia2lkXCJgXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoa2V5c1tqd2tbJ2tpZCddXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAvLyBXZSBoYXZlbid0IHNlZW4gdGhpcyBrZXlwYWlyIElEIGJlZm9yZS5cbiAgICAgICAgICAgICAgICAgIGtleXNbandrWydraWQnXV0gPSBTZXJ2aWNlcy5jcnlwdG9Gb3IodGhpcy53aW5fKVxuICAgICAgICAgICAgICAgICAgICAuaW1wb3J0UGtjc0tleShqd2spXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gV2ViIENyeXB0b2dyYXBoeSByZWplY3RlZCB0aGUga2V5XG4gICAgICAgICAgICAgICAgICAgICAgLy8gaW1wb3J0IGF0dGVtcHQuIEVpdGhlciB0aGUgc2lnbmluZ1xuICAgICAgICAgICAgICAgICAgICAgIC8vIHNlcnZpY2Ugc2VudCBhIG1hbGZvcm1lZCBrZXkgb3IgdGhlXG4gICAgICAgICAgICAgICAgICAgICAgLy8gYnJvd3NlciBpcyBkb2luZyBzb21ldGhpbmcgd2VpcmQuXG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgandrRGF0YSA9IEpTT04uc3RyaW5naWZ5KGp3ayk7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVyciAmJiBlcnIubWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgICAgICBzaWduaW5nU2VydmljZUVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgc2lnbmluZ1NlcnZpY2VOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgYEZhaWxlZCB0byBpbXBvcnQga2V5ICgke2p3a0RhdGF9KTogJHttZXNzYWdlfWBcbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgIC8vIFRoZSBzaWduaW5nIHNlcnZpY2UgZGlkbid0IHNlbmQgdmFsaWQgSlNPTi5cbiAgICAgICAgICAgICAgc2lnbmluZ1NlcnZpY2VFcnJvcihcbiAgICAgICAgICAgICAgICBzaWduaW5nU2VydmljZU5hbWUsXG4gICAgICAgICAgICAgICAgYEZhaWxlZCB0byBwYXJzZSBKU09OOiAke2VyciAmJiBlcnIucmVzcG9uc2V9YFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgICAgfSxcbiAgICAgICAgKGVycikgPT4ge1xuICAgICAgICAgIC8vIFNvbWUga2luZCBvZiBlcnJvciBvY2N1cnJlZCBkdXJpbmcgdGhlIFhIUi4gVGhpcyBjb3VsZCBiZSBhIGxvdFxuICAgICAgICAgIC8vIG9mIHRoaW5ncyAoYW5kIHdlIGhhdmUgbm8gdHlwZSBpbmZvcm1hdGlvbiksIGJ1dCBpZiB0aGVyZSdzIG5vXG4gICAgICAgICAgLy8gYHJlc3BvbnNlYCBpdCdzIHByb2JhYmx5IGEgbmV0d29yayBjb25uZWN0aXZpdHkgZmFpbHVyZSwgc28gd2VcbiAgICAgICAgICAvLyBpZ25vcmUgaXQuIFVuZm9ydHVuYXRlbHksIHdlIGNhbid0IGRpc3Rpbmd1aXNoIHRoaXMgZnJvbSBhIENPUlNcbiAgICAgICAgICAvLyBwcm9ibGVtLlxuICAgICAgICAgIGlmIChlcnIgJiYgZXJyLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAvLyBUaGlzIHByb2JhYmx5IGluZGljYXRlcyBhIG5vbi0yeHggSFRUUCBzdGF0dXMgY29kZS5cbiAgICAgICAgICAgIHNpZ25pbmdTZXJ2aWNlRXJyb3IoXG4gICAgICAgICAgICAgIHNpZ25pbmdTZXJ2aWNlTmFtZSxcbiAgICAgICAgICAgICAgYFN0YXR1cyBjb2RlICR7ZXJyLnJlc3BvbnNlLnN0YXR1c31gXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXBvcnQgYW4gZXJyb3IgY2F1c2VkIGJ5IGEgc2lnbmluZyBzZXJ2aWNlLiBTaW5jZSBzaWduaW5nIHNlcnZpY2VzIGN1cnJlbnRseVxuICogZG9uJ3QgaGF2ZSB0aGVpciBvd24gZXJyb3IgbG9nZ2luZyBVUkxzLCB3ZSBqdXN0IHNlbmQgZXZlcnl0aGluZyB0byB0aGUgQU1QXG4gKiBQcm9qZWN0LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzaWduaW5nU2VydmljZU5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBzaWduaW5nU2VydmljZUVycm9yKHNpZ25pbmdTZXJ2aWNlTmFtZSwgbWVzc2FnZSkge1xuICBkZXYoKS5lcnJvcihcbiAgICAnQU1QLUE0QScsXG4gICAgYFNpZ25pbmcgc2VydmljZSBlcnJvciBmb3IgJHtzaWduaW5nU2VydmljZU5hbWV9OiAke21lc3NhZ2V9YFxuICApO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-a4a/0.1/signature-verifier.js