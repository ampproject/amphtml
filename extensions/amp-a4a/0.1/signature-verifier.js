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

import {signingServerURLs} from '../../../ads/_a4a-config';
import {cryptoFor} from '../../../src/crypto';
import {dev} from '../../../src/log';
import {xhrFor} from '../../../src/services';

/**
 * Potential reasons why an attempt to verify a Fast Fetch signature might not
 * succeed. Used for reporting errors to the ad network.
 *
 * @enum {number}
 */
export const VerificationFailure = {

  /**
   * A network connectivity failure, misbehaving signing service, or other
   * factor beyond the ad network's control caused verification to fail.
   */
  NO_FAULT: 1,

  /**
   * The keypair ID provided by the ad network does not correspond to any public
   * key offered by the signing service.
   */
  KEY_NOT_FOUND: 2,

  /**
   * The signature provided by the ad network is not the correct cryptographic
   * signature for the given creative data and public key.
   */
  SIGNATURE_MISMATCH: 3,

};

/**
 * Returns the signature verifier for the given window. Lazily creates it if it
 * doesn't already exist.
 *
 * This ensures that only one signature verifier exists per window, which allows
 * multiple Fast Fetch ad slots on a page (even ones from different ad networks)
 * to share the same cached public keys.
 *
 * @param {!Window} win
 * @return {!SignatureVerifier}
 */
export function signatureVerifierFor(win) {
  const propertyName = 'AMP_FAST_FETCH_SIGNATURE_VERIFIER_';
  return win[propertyName] || (win[propertyName] = new SignatureVerifier(win));
}

/**
 * A window-level object that encapsulates the logic for obtaining public keys
 * from Fast Fetch signing services and cryptographically verifying signatures
 * of AMP creatives.
 *
 * Unlike an AMP service, a signature verifier is **stateful**. It maintains a
 * cache of all public keys that it has previously downloaded and imported, and
 * also keeps track of which keys and signing services have already had failed
 * download or import attempts and should not be attempted again.
 */
class SignatureVerifier {
  /** @param {!Window} win */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;

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
     * @private {?Object<string, {promise: !Promise<boolean>, keys: !Object<string, ?Promise<?webCrypto.CryptoKey>>}>}
     */
    this.signers_ = cryptoFor(win).isPkcsAvailable() ? {} : null;
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
  loadKeyset(signingServiceName) {
    if (this.signers_ && !this.signers_[signingServiceName]) {
      const keys = {};
      const promise = this.fetchAndAddKeys_(keys, signingServiceName, null);
      this.signers_[signingServiceName] = {promise, keys};
    }
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
   * @return {!Promise<?VerificationFailure>} resolves to `null` on success, or,
   *     on failure, to a `VerificationFailure` indicating the cause
   */
  verify(signingServiceName, keypairId, signature, creative) {
    if (this.signers_) {
      const signer = this.signers_[signingServiceName];
      return signer.promise.then(success => {
        if (success) {
          const keyPromise = signer.keys[keypairId];
          if (keyPromise === undefined) {
            // We don't have this key, but maybe the cache is stale; try
            // cachebusting.
            signer.promise = this.fetchAndAddKeys_(
                                     signer.keys, signingServiceName, keypairId)
                                 .then(success => {
                                   if (signer.keys[keypairId] === undefined) {
                                     // We still don't have this key; make sure
                                     // we never try again.
                                     signer.keys[keypairId] = null;
                                   }
                                   return success;
                                 });
            // This "recursive" call can recur at most once.
            return this.verify(
                signingServiceName, keypairId, signature, creative);
          } else if (keyPromise === null) {
            // We tried cachebusting and still don't have this key.
            return VerificationFailure.KEY_NOT_FOUND;
          } else {
            return keyPromise.then(key => {
              if (key) {
                return cryptoFor(this.win_)
                    .verifyPkcs(key, signature, creative)
                    .then(
                        result => {
                          if (result) {
                            return null;  // Success!
                          } else {
                            return VerificationFailure.SIGNATURE_MISMATCH;
                          }
                        },
                        err => {
                          // Web Cryptography rejected the verification attempt.
                          // This hopefully won't happen in the wild, but
                          // browsers can be weird about this, so we need to
                          // guard against the possibility. Phone home to the
                          // AMP Project so that we can understand why this
                          // occurred.
                          const message = err && err.message;
                          dev().error(`Failed to verify signature: ${message}`);
                          return VerificationFailure.NO_FAULT;
                        });
              } else {
                // This particular public key couldn't be imported. Probably the
                // signing service's fault.
                return VerificationFailure.NO_FAULT;
              }
            });
          }
        } else {
          // The public keyset couldn't be fetched and imported. Probably a
          // network connectivity failure.
          return VerificationFailure.NO_FAULT;
        }
      });
    } else {
      // Web Cryptography isn't available.
      return Promise.resolve(VerificationFailure.NO_FAULT);
    }
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
  fetchAndAddKeys_(keys, signingServiceName, keypairId) {
    let url = signingServerURLs[signingServiceName].url;
    if (keypairId != null) {
      url += '?' + encodeURIComponent(keypairId);
    }
    return xhrFor(this.win_)
        .fetch(
            url,
            {mode: 'cors', method: 'GET', ampCors: false, credentials: 'omit'})
        .then(
            response => {
              if (response.status == 200) {
                // The signing service spec requires this, but checking it at
                // runtime in production isn't worth it.
                dev().assert(
                    response.headers.get('Content-Type') ==
                    'application/jwk-set+json');
                return response.json().then(
                    jwkSet => {
                      // This is supposed to be a JSON Web Key Set, as defined
                      // in Section 5 of RFC 7517. However, the signing service
                      // could misbehave and send an arbitrary JSON value, so we
                      // have to type-check at runtime.
                      if (jwkSet && Array.isArray(jwkSet['keys'])) {
                        jwkSet['keys'].forEach(jwk => {
                          if (jwk && typeof jwk['kid'] == 'string') {
                            if (keys[jwk['kid']] === undefined) {
                              // We haven't seen this keypair ID before.
                              keys[jwk['kid']] =
                                  cryptoFor(this.win_).importPkcsKey(jwk).catch(
                                      err => {
                                        // Web Cryptography rejected the key
                                        // import attempt. Either the signing
                                        // service sent a malformed key or the
                                        // browser is doing something weird.
                                        const jwkData = JSON.stringify(jwk);
                                        const message = err && err.message;
                                        signingServiceError(
                                            signingServiceName,
                                            `Failed to import key (${
                                                                     jwkData
                                                                   }): ${
                                                                         message
                                                                       }`);
                                        return null;
                                      });
                            }
                          } else {
                            // The JSON Web Key is malformed or doesn't have a
                            // "kid" parameter, which is where the keypair ID
                            // has to be.
                            signingServiceError(
                                signingServiceName,
                                `Key (${JSON.stringify(jwk)}) has no "kid"`);
                          }
                        });
                        return true;
                      } else {
                        // The entire JSON Web Key Set is malformed.
                        signingServiceError(
                            signingServiceName,
                            `Key set (${
                                        JSON.stringify(jwkSet)
                                      }) has no "keys"`);
                        return false;
                      }
                    },
                    err => {
                      // The signing service didn't send valid JSON.
                      signingServiceError(
                          `Failed to parse JSON: ${err && err.response}`);
                      return false;
                    });
              } else {
                // The signing service sent a non-200 HTTP status code. The
                // signing service spec forbids this.
                signingServiceError(`Status code ${response.status}`);
                return false;
              }
            },
            err => {
              // Some kind of error occurred during the XHR. This could be a lot
              // of things (and we have no type information), but if there's no
              // `response` it's probably a network connectivity failure, so we
              // ignore it. Unfortunately, we can't distinguish this from a CORS
              // problem.
              if (err && err.response) {
                // This probably indicates a non-2xx HTTP status code.
                signingServiceError(`Status code ${err.response.status}`);
              }
              return false;
            });
  }
}

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
  dev().error(`Signing service error for ${signingServiceName}: ${message}`);
}
