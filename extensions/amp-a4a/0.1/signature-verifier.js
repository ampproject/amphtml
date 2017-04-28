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
import {xhrFor} from '../../../src/xhr';

/** @enum {number} */
export const VerificationFailure = {
  NO_FAULT: 1,
  KEY_NOT_FOUND: 2,
  SIGNATURE_MISMATCH: 3,
};

/**
 * @param {!Window} win
 * @return {!SignatureVerifier}
 */
export function signatureVerifierFor(win) {
  const propertyName = 'AMP_FAST_FETCH_SIGNATURE_VERIFIER_';
  if (!win[propertyName]) {
    win[propertyName] = new SignatureVerifier(win);
  }
  return win[propertyName];
}

class SignatureVerifier {
  /**
   * @param {!Window} win
   * @private
   */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;

    /**
     *
     * @private {?Object<string, {promise: !Promise<boolean>, keys: !Object<string, ?Promise<?CryptoKey>>}>}
     */
    this.signers_ = cryptoFor(win).isPkcsAvailable() ? {} : null;
  }

  /**
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
   * @param {string} signingServiceName
   * @param {string} keypairId
   * @param {!ArrayBuffer} signature
   * @param {!ArrayBuffer} creative
   * @return {!Promise<?VerificationFailure>)
   */
  verify(signingServiceName, keypairId, signature, creative) {
    if (this.signers_) {
      const signer = this.signers_[signingServiceName];
      return signer.promise.then((success) => {
        if (success) {
          const keyPromise = signer.keys[keypairId];
          if (keyPromise === undefined) {
            signer.promise = this.fetchAndAddKeys_(
                                     signer.keys, signingServiceName, keypairId)
                                 .then((success) => {
                                   if (!signer.keys[keypairId]) {
                                     signer.keys[keypairId] = null;
                                   }
                                   return success;
                                 });
            return this.verify(
                signingServiceName, keypairId, signature, creative);
          } else if (keyPromise === null) {
            return VerificationFailure.KEY_NOT_FOUND;
          } else {
            return keyPromise.then((key) => {
              if (key) {
                return cryptoFor(this.win_)
                    .verifyPkcs(key, signature, creative)
                    .then(
                        (result) => {
                          if (result) {
                            return null;
                          } else {
                            return VerificationFailure.SIGNATURE_MISMATCH;
                          }
                        },
                        (err) => {
                          dev().error(`Failed to verify signature: ${
                                                                     err &&
                                                                     err.message
                                                                   }`);
                          return VerificationFailure.NO_FAULT;
                        });
              } else {
                return VerificationFailure.NO_FAULT;
              }
            });
          }
        } else {
          return VerificationFailure.NO_FAULT;
        }
      });
    } else {
      return Promise.resolve(VerificationFailure.NO_FAULT);
    }
  }

  /**
   * @param {!Object<string, !Promise<?CryptoKey>>} keys
   * @param {string} signingServiceName
   * @param {?string} keypairId
   * @return {!Promise<boolean>}
   */
  fetchAndAddKeys_(keys, signingServiceName, keypairId) {
    let url = signingServices[signingServiceName].url;
    if (keypairId != null) {
      url += '?' + encodeURIComponent(keypairId);
    }
    return xhrFor(this.win_)
        .fetch(
            url,
            {mode: 'cors', method: 'GET', ampCors: false, credentials: 'omit'})
        .then(
            (response) => {
              if (response.status == 200) {
                return response.json().then(
                    (jwkSet) => {
                      // This could be an arbitrary JSON-stringifiable value, so
                      // we have to type-check at runtime.
                      if (jwkSet && Array.isArray(jwkSet['keys'])) {
                        for (const jwk of jwkSet['keys']) {
                          if (jwk && typeof jwk['kid'] == 'string') {
                            if (!keyset[jwk['kid']]) {
                              keyset[jwk['kid']] =
                                  cryptoFor(this.win_).importPkcsKey(jwk).catch(
                                      (err) => {
                                        signingServiceError(
                                            signingServiceName,
                                            `Failed to import key (${
                                                                     JSON.stringify(
                                                                         jwk)
                                                                   }): ${
                                                                         err &&
                                                                         err.message
                                                                       }`);
                                        return null;
                                      });
                            }
                          } else {
                            signingServiceError(
                                signingServiceName,
                                `Key (${JSON.stringify(jwk)}) has no "kid"`);
                          }
                        }
                        return true;
                      } else {
                        signingServiceError(
                            signingServiceName,
                            `Key set (${
                                        JSON.stringify(jwkSet)
                                      }) has no "keys"`);
                        return false;
                      }
                    },
                    (err) => {
                      signingServiceError(
                          `Failed to parse JSON: ${err && err.response}`);
                      return false;
                    });
              } else {
                signingServiceError(`Status code ${response.status}`);
                return false;
              }
            },
            (err) => {
              if (err && err.response) {
                signingServiceError(`Status code ${err.response.status}`);
              }
              return false;
            });
  }
}

function signingServiceError(signingServiceName, message) {
  // TODO(taymonbeal): make this a custom <amp-analytics> event
  dev().error(`Signing service error for ${signingServiceName}: ${message}`);
}
