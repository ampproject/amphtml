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

import {VerificationStatus} from './signature-verifier';
import {signingServerURLs} from '../../../ads/_a4a-config';
import {dev, user} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {Services} from '../../../src/services';
import {endsWith} from '../../../src/string';
import {isArray, isObject} from '../../../src/types';
import {base64UrlDecodeToBytes} from '../../../src/utils/base64';
import {some} from '../../../src/utils/promise';

/**
 * An object holding the public key and its hash.
 *
 * @typedef {{
 *   signingServiceName: string,
 *   hash: !Uint8Array,
 *   cryptoKey: !webCrypto.CryptoKey
 * }}
 */
let PublicKeyInfoDef;

/**
 * A set of public keys for a single AMP signing service.  A single service may
 * return more than one key if, e.g., they're rotating keys and they serve
 * the current and upcoming keys.  A CryptoKeysDef stores one or more
 * (promises to) keys, in the order given by the return value from the
 * signing service.
 *
 * @typedef {{
 *     signingServiceName: string,
 *     keys: !Array<!Promise<!PublicKeyInfoDef>>,
 * }}
 */
let CryptoKeysDef;

/** @const {number} */
const SIGNATURE_VERSION = 0x00;

/** @const {string} */
const TAG = 'amp-a4a';

/** @const {string} @visibleForTesting */
export const AMP_SIGNATURE_HEADER = 'X-AmpAdSignature';

/**
 * Returns the signature verifier for the given window. Lazily creates it if it
 * doesn't already exist.
 *
 * This ensures that only one signature verifier exists per window, which allows
 * multiple Fast Fetch ad slots on a page (even ones from different ad networks)
 * to share the same cached public keys.
 *
 * @param {!Window} win
 * @return {!./signature-verifier.ISignatureVerifier}
 */
export function signatureVerifierFor(win) {
  const propertyName = 'AMP_FAST_FETCH_SIGNATURE_VERIFIER_';
  return win[propertyName] ||
      (win[propertyName] = new LegacySignatureVerifier(win));
}

/**
 * @implements {./signature-verifier.ISignatureVerifier}
 * @visibleForTesting
 */
export class LegacySignatureVerifier {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!../../../src/service/crypto-impl.Crypto} */
    this.crypto_ = Services.cryptoFor(win);

    /**
     * The public keys for all signing services.  This is an array of promises,
     * one per signing service, in the order given by the array returned by
     * #getSigningServiceNames().  Each entry resolves to the keys returned by
     * that service, represented by a `CryptoKeysDef` object.
     *
     * @private @const {!Array<!Promise<!CryptoKeysDef>>}
     */
    this.keys_ = [];

    /**
     * The set of signing services whose keys have been loaded.
     *
     * @private @const {!Object<string, boolean>}
     */
    this.signingServiceNames_ = {};

    /**
     * Gets a notion of current time, in ms.  The value is not necessarily
     * absolute, so should be used only for computing deltas.  When available,
     * the performance system will be used; otherwise Date.now() will be
     * returned.
     *
     * @private @const {function(): number}
     */
    this.getNow_ = (win.performance && win.performance.now) ?
        win.performance.now.bind(win.performance) : Date.now;
  }

  /**
   * Fetches and imports the public keyset for the named signing service.
   * Hopefully, this will hit cache in many cases and not make an actual network
   * round-trip. This method should be called as early as possible so that the
   * network request and key imports can execute in parallel with other
   * operations.
   *
   * @param {string} signingServiceName
   * @param {!Promise<undefined>} waitFor a promise that must resolve before the
   *     keys are fetched
   */
  loadKeyset(signingServiceName, waitFor) {
    dev().assert(getMode().localDev || !endsWith(signingServiceName, '-dev'));
    if (!this.isAvailable_()) {
      return;
    }
    const url = signingServerURLs[signingServiceName];
    if (url) {
      if (this.signingServiceNames_[signingServiceName]) {
        return;
      }
      this.signingServiceNames_[signingServiceName] = true;
      // Delay request until document is not in a prerender state.
      this.keys_.push(waitFor.then(() =>
          Services.xhrFor(this.win_).fetchJson(url, {
            mode: 'cors',
            method: 'GET',
            // Set ampCors false so that __amp_source_origin is not
            // included in XHR CORS request allowing for keyset to be cached
            // across pages.
            ampCors: false,
            credentials: 'omit',
          })).then(res => res.json())
          .then(jwkSetObj => {
            if (jwkSetObj && isArray(jwkSetObj['keys']) &&
                jwkSetObj['keys'].every(isObject)) {
              return jwkSetObj['keys'];
            } else {
              user().error(
                  TAG,
                  `Invalid response from signing server ${signingServiceName}`);
              return [];
            }
          }).then(jwks => ({
            signingServiceName,
            keys: jwks.map(jwk => this.importPublicKey_(signingServiceName, jwk)
                .catch(err => {
                  user().error(
                      TAG, `error importing keys for: ${signingServiceName}`,
                      err);
                  return null;
                })),
          })).catch(err => {
            user().error(TAG, err);
            // TODO(a4a-team): This is a failure in the initial attempt to get
            // the keys, probably b/c of a network condition.  We should
            // re-trigger key fetching later.
            return {signingServiceName, keys: []};
          }));
    } else {
      // The given signingServiceName does not have a corresponding URL in
      // _a4a-config.js.
      const reason = `Signing service '${signingServiceName}' does not exist.`;
      user().error(TAG, reason);
      this.keys_.push(/** @type {!Promise<!CryptoKeysDef>} */ (Promise.resolve({
        signingServiceName,
        keys: [],
      })));
    }
  }

  /**
   * Extracts a cryptographic signature from `headers` and attempts to verify
   * that it's the correct cryptographic signature for `creative`.
   *
   * As a precondition, `loadKeyset` must have already been called on the
   * signing service that was used.
   *
   * @param {!ArrayBuffer} creative
   * @param {!Headers} headers
   * @param {function(string, !Object)} lifecycleCallback called for each AMP
   *     lifecycle event triggered during verification
   * @return {!Promise<!VerificationStatus>}
   */
  verify(creative, headers, lifecycleCallback) {
    if (!this.isAvailable_()) {
      return Promise.resolve(VerificationStatus.UNVERIFIED);
    }
    const headerValue = headers.get(AMP_SIGNATURE_HEADER);
    if (!headerValue) {
      return Promise.resolve(VerificationStatus.UNVERIFIED);
    }
    let signature;
    try {
      signature = base64UrlDecodeToBytes(headerValue);
    } catch (e) {
      return Promise.resolve(VerificationStatus.ERROR_SIGNATURE_MISMATCH);
    }
    // For each signing service, we have exactly one Promise,
    // keyInfoSetPromise, that holds an Array of Promises of signing keys.
    // So long as any one of these signing services can verify the
    // signature, then the creative is valid AMP.
    // Track if verification found, as it will ensure that promises yet to
    // resolve will "cancel" as soon as possible saving unnecessary resource
    // allocation.
    let verified = false;
    return some(this.keys_.map(keyInfoSetPromise => {
      // Resolve Promise into an object containing a 'keys' field, which
      // is an Array of Promises of signing keys.  *whew*
      return keyInfoSetPromise.then(keyInfoSet => {
        // As long as any one individual key of a particular signing
        // service, keyInfoPromise, can verify the signature, then the
        // creative is valid AMP.
        if (verified) {
          return Promise.reject('redundant');
        }
        return some(keyInfoSet.keys.map(keyInfoPromise => {
          // Resolve Promise into signing key.
          return keyInfoPromise.then(keyInfo => {
            if (verified) {
              return Promise.reject('redundant');
            }
            if (!keyInfo) {
              return Promise.reject('Promise resolved to null key.');
            }
            const signatureVerifyStartTime = this.getNow_();
            // If the key exists, try verifying with it.
            return this.verifySignature_(
                new Uint8Array(creative),
                signature,
                keyInfo).then(
                isValid => {
                  if (isValid) {
                    verified = true;
                    lifecycleCallback('signatureVerifySuccess', {
                      'met.delta.AD_SLOT_ID':
                          Math.round(this.getNow_() - signatureVerifyStartTime),
                      'signingServiceName.AD_SLOT_ID':
                          keyInfo.signingServiceName,
                    });
                    return creative;
                  }
                    // Only report if signature is expected to match, given that
                    // multiple key providers could have been specified.
                  if (verifyHashVersion(
                      signature, /** @type {!PublicKeyInfoDef} */ (keyInfo))) {
                    user().error(
                        TAG, 'Key failed to validate creative\'s signature',
                        keyInfo.signingServiceName, keyInfo.cryptoKey);
                  }
                    // Reject to ensure the some operation waits for other
                    // possible providers to properly verify and resolve.
                  return Promise.reject(
                      `${keyInfo.signingServiceName} key failed to verify`);
                },
                err => {
                  dev().error(TAG, keyInfo.signingServiceName, err);
                });
          });
        // some() returns an array of which we only need a single value.
        })).then(returnedArray => returnedArray[0], () => {
          // Rejection occurs if all keys for this provider fail to validate.
          return Promise.reject(
              `All keys for ${keyInfoSet.signingServiceName} failed to verify`);
        });
      });
    })).then(
        () => VerificationStatus.OK,
        // rejection occurs if all providers fail to verify.
        () => VerificationStatus.ERROR_SIGNATURE_MISMATCH);
  }

  /**
   * Checks whether Web Cryptography is available in this context.
   *
   * @return {boolean}
   * @visibleForTesting
   */
  isAvailable_() {
    return this.crypto_.isPkcsAvailable();
  }

  /**
   * Convert a JSON Web Key object to a browser-native cryptographic key and
   * compute a hash for it.  The caller must verify that Web Cryptography is
   * available before calling this function.
   *
   * @param {string} signingServiceName used to identify the signing service.
   * @param {!Object} jwk An object which is hopefully an RSA JSON Web Key.  The
   *     caller should verify that it is an object before calling this function.
   * @return {!Promise<!PublicKeyInfoDef>}
   * @visibleForTesting
   */
  importPublicKey_(signingServiceName, jwk) {
    return this.crypto_.importPkcsKey(jwk).then(cryptoKey => {
          // We do the importKey first to allow the browser to check for
          // an invalid key.  This last check is in case the key is valid
          // but a different kind.
      if (typeof jwk.n != 'string' || typeof jwk.e != 'string') {
        throw new Error('missing fields in JSON Web Key');
      }
      const mod = base64UrlDecodeToBytes(jwk.n);
      const pubExp = base64UrlDecodeToBytes(jwk.e);
      const lenMod = lenPrefix(mod);
      const lenPubExp = lenPrefix(pubExp);
      const data = new Uint8Array(lenMod.length + lenPubExp.length);
      data.set(lenMod);
      data.set(lenPubExp, lenMod.length);
          // The list of RSA public keys are not under attacker's
          // control, so a collision would not help.
      return this.crypto_.sha1(data)
          .then(digest => ({
            signingServiceName,
            cryptoKey,
                // Hash is the first 4 bytes of the SHA-1 digest.
            hash: new Uint8Array(digest, 0, 4),
          }));
    });
  }

  /**
   * Verifies RSA signature corresponds to the data, given a public key.
   * @param {!Uint8Array} data the data that was signed.
   * @param {!Uint8Array} signature the RSA signature.
   * @param {!PublicKeyInfoDef} publicKeyInfo the RSA public key.
   * @return {!Promise<!boolean>} whether the signature is valid for
   *     the public key.
   * @visibleForTesting
   */
  verifySignature_(data, signature, publicKeyInfo) {
    if (!verifyHashVersion(signature, publicKeyInfo)) {
      return Promise.resolve(false);
    }
    // Verify that the data matches the raw RSA signature, using the
    // public key.
    // Append the version number to the data.
    const signedData = new Uint8Array(data.length + 1);
    signedData.set(data);
    signedData[data.length] = SIGNATURE_VERSION;

    return /** @type {!Promise<boolean>} */ (this.crypto_.verifyPkcs(
        publicKeyInfo.cryptoKey, signature.subarray(5), signedData));
  }
}

/**
 * Verifies signature was signed with private key matching public key given.
 * Does not verify data actually matches signature (use verifySignature).
 * @param {!Uint8Array} signature the RSA signature.
 * @param {!PublicKeyInfoDef} publicKeyInfo the RSA public key.
 * @return {boolean} whether signature was generated using hash.
 */
export function verifyHashVersion(signature, publicKeyInfo) {
  // The signature has the following format:
  // 1-byte version + 4-byte key hash + raw RSA signature where
  // the raw RSA signature is computed over (data || 1-byte version).
  // If the hash doesn't match, don't bother checking this key.
  return signature.length > 5 && signature[0] == SIGNATURE_VERSION &&
      hashesEqual(signature, publicKeyInfo.hash);
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
