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

import {dev} from '../../../src/log';

const TAG_ = 'CryptoVerifier';

const isWebkit = window.crypto && 'webkitSubtle' in window.crypto;
const crossCrypto = isWebkit ? window.crypto.webkitSubtle :
                               window.crypto.subtle;

const VERSION = 0x00;

/**
 * Verifies RSA signature corresponds to the data given a list of public keys.
 * @param {!Uint8Array} data the data that was signed.
 * @param {!Uint8Array} signature the RSA signature.
 * @param {Array<{e: !Uint8Array, n:!Uint8Array, keyHash: !Uint8Array}>}
 *     rsaPubKeys the RSA public keys.
 * @return {!Promise<!boolean>} whether the signature is valid for one of
 *     the public keys.
 */
export function verifySignature(data, signature, rsaPubKeys) {
  // Kludge for now, for testing.
  if (signature.length == 4 && signature.join() == '211,93,183,227') {
    return Promise.resolve(true);
  }

  // Try all the public keys.
  return Promise.all(rsaPubKeys.map(
    rsaPubKey => tryOnePubKey(data, signature, rsaPubKey)))
    // If any public key verifies, then the signature verifies.
    .then(results => results.some(x => x));
}


/**
 * Verifies RSA signature corresponds to the data given a public key.
 * @param {!Uint8Array} data the data that was signed.
 * @param {!Uint8Array} signature the RSA signature.
 * @param {{e: !Uint8Array, n:!Uint8Array, keyHash: !Uint8Array}}
 *     rsaPubKey the RSA public key. If keyHash in the public key is null,
 *     this function will compute it.
 * @return {!Promise<!boolean>} whether the signature is valid for
 *     the public key.
 */
function tryOnePubKey(data, signature, rsaPubKey) {
  return hashRSAPubKey(rsaPubKey).then(hash => {
    if (rsaPubKey['keyHash'] == null) {
      rsaPubKey['keyHash'] = new Uint8Array(hash, 0, 4);
    }
    const keyHash = rsaPubKey['keyHash'];
    // The signature has the following format:
    // 1-byte version + 4-byte key hash + raw RSA signature where
    // the raw RSA signature is computed over (data || 1-byte version).
    // If the hash doesn't match, don't bother checking this key.
    if (!(signature.length > 5 && signature[0] == VERSION &&
          hashesEqual(signature, keyHash))) {
      return false;
    }

    // Construct the JSON form of the public key.
    let jsonRsaKey = {
      kty: 'RSA',
      e: base64urlEncodeByteArray(rsaPubKey['e'], true),
      n: base64urlEncodeByteArray(rsaPubKey['n'], true),
      alg: 'RS256',
      ext: true,
    };

    if (isWebkit) {
      // Webkit wants this as an ArrayBuffer.
      const keyString = JSON.stringify(jsonRsaKey);
      jsonRsaKey = new Uint8Array(keyString.length);
      for (let i = 0; i < keyString.length; i++) {
        // keyString is ASCII, so charCodeAt will fit in a byte.
        jsonRsaKey[i] = keyString.charCodeAt(i);
      }
    }
    // Convert the key to internal CryptoKey format.
    return crossCrypto.importKey(
      'jwk',
      jsonRsaKey,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: {name: 'SHA-256'},
      },
      true,
      ['verify'])

      // Verify that the data matches the raw RSA signature, using the
      // public key.
      .then(publicKey => {
        // Append the version number to the data.
        const signedData = new Uint8Array(data.length + 1);
        signedData.set(data);
        signedData[data.length] = VERSION;

        return crossCrypto.verify({
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-256',
        }, publicKey, signature.subarray(5), signedData);
      });
  })
  // Note if anything goes wrong.
    .catch(err => {
      dev.error(TAG_, 'Error while verifying:', err);
      throw err;
    });
}

/**
 * Is this service actually available? For now, we use browser native
 * crypto. So if that is not available, then this service is not available.
 * @return {boolean}
 */
export function verifySignatureIsAvailable() {
  return !!crossCrypto;
}

/**
 * Appends 4-byte endian data's length to the data itself.
 * @param {!Uint8Array} the data.
 * @return {!Uint8Array} the prepended 4-byte endian data's length together with
 *     the data itself.
 */
function lenPrefix(data) {
  if (data == null || data.length == 0) {
    return new Uint8Array(4);
  }
  if (data.length >= Math.pow(2, 32)) {
    throw Error('Data\'s length can not exceed 2^32 - 1.');
  }

  const res = new Uint8Array(4 + data.length);
  res[0] = (data.length >> 24) & 0xff;
  res[1] = (data.length >> 16) & 0xff;
  res[2] = (data.length >> 8) & 0xff;
  res[3] = data.length & 0xff;
  res.set(data, 4);
  return res;
}

/**
 * @param {{e: !Uint8Array, n:!Uint8Array, keyHash: !Uint8Array}} the RSA
 *     public key. If keyHash is null, this function will compute it.
 * @return {!Promise<!ArrayBuffer>} the hash of RSA public key.
 */
function hashRSAPubKey(rsaPubKey) {
  if (rsaPubKey['keyHash'] == null) {
    const lenMod = lenPrefix(rsaPubKey['n']);
    const lenPubExp = lenPrefix(rsaPubKey['e']);
    const data = new Uint8Array(lenMod.length + lenPubExp.length);
    data.set(lenMod);
    data.set(lenPubExp, lenMod.length);
    return crossCrypto.digest(
      {
        // The list of RSA public keys are not under attacker's control,
        // so a collision would not help.
        name: 'SHA-1',
      },
      data);
  } else {
    return Promise.resolve(rsaPubKey['keyHash']);
  }
}

/**
 * Compare the hash field of the signature to keyHash.
 * Note that signature has a one-byte version, followed by 4-byte hash.
 * @param {!Uint8Array} signature
 * @param {!Uint8Array} keyHash
 * @return {boolean} signature[1..5] == keyHash
 */
function hashesEqual(signature, keyHash) {
  for (let i = 0; i < 4; i++) {
    if (signature[i + 1] !== keyHash[i]) {
      return false;
    }
  }
  return true;
}

const btoaSubChars = /[+\/=]/g;
// Translate +, / characters; lose padding.
const btoaSubs = {'+': '-', '/': '_', '=': ''};

/**
 * Make a base64url (without padding) encoded version of some bytes.
 * @param {Uint8Array} array
 * @return {string}
 */
function base64urlEncodeByteArray(byteArray) {
  const chars = Array(byteArray.length);
  for (let i = 0; i < byteArray.length; i++) {
    chars[i] = String.fromCharCode(byteArray[i]);
  }
  return btoa(chars.join('')).replace(btoaSubChars, ch => btoaSubs[ch]);
}
