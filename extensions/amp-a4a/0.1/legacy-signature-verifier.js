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

import {cryptoFor} from '../../../src/crypto';
import {base64UrlDecodeToBytes} from '../../../src/utils/base64';

/**
 * An object holding the public key and its hash.
 *
 * @typedef {{
 *   serviceName: string,
 *   hash: !Uint8Array,
 *   cryptoKey: !webCrypto.CryptoKey
 * }}
 */
export let PublicKeyInfoDef;

/** @const {number} */
const SIGNATURE_VERSION = 0x00;

export class LegacySignatureVerifier {

  /** @param {!Window} win */
  constructor(win) {
    /** @private @const {!../../../src/service/crypto-impl.Crypto} */
    this.crypto_ = cryptoFor(win);
  }

  /**
   * Checks whether Web Cryptography is available in this context.
   *
   * @return {boolean}
   */
  isAvailable() {
    return this.crypto_.isPkcsAvailable();
  }

  /**
   * Convert a JSON Web Key object to a browser-native cryptographic key and
   * compute a hash for it.  The caller must verify that Web Cryptography is
   * available using isPkcsAvailable before calling this function.
   *
   * @param {string} serviceName used to identify the signing service.
   * @param {!Object} jwk An object which is hopefully an RSA JSON Web Key.  The
   *     caller should verify that it is an object before calling this function.
   * @return {!Promise<!PublicKeyInfoDef>}
   */
  importPublicKey(serviceName, jwk) {
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
            serviceName,
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
   */
  verifySignature(data, signature, publicKeyInfo) {
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
function verifyHashVersion(signature, publicKeyInfo) {
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
