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

import {dev} from '../log';
import {getService} from '../service';
import {
  encodeByteArray,
} from
  '../../third_party/closure-library/encode-byte-array-trampoline-generated';


const TAG_ = 'CryptoVerifier';

const isWebkit = window.crypto && 'webkitSubtle' in window.crypto;
const crossCrypto = isWebkit ? window.crypto.webkitSubtle :
                               window.crypto.subtle;

const VERSION = 0x00;

/**
 * A service that provides cryptographic signature verification for use
 * within AMP.
 */
class CryptoVerifier {
  /**
   * Verifies RSA signature corresponds to the data given a list of public keys.
   * @param {!Uint8Array} the data that was signed.
   * @param {!Uint8Array} the RSA signature.
   * @param {{e: !Uint8Array, n:!Uint8Array, keyHash: !Uint8Array }} the RSA
   *     public keys. If keyHash in each public key is null, this function will
   *     compute it.
   * @return {!Promise<!boolean>} whether the signature is valid for one of
   *     the public keys.
   */
  verify(data, signature, rsaPubKeys) {
    return hashRSAPubKeys(rsaPubKeys).then(hashes => {
      for (let i = 0; i < rsaPubKeys.length; i++) {
        const rsaPubKey = rsaPubKeys[i];
        if (rsaPubKey['keyHash'] == null) {
          rsaPubKey['keyHash'] = new Uint8Array(hashes[i], 0, 4);
        }
        const keyHash = rsaPubKey['keyHash'];
        // The signature has the following format:
        // 1-byte version + 4-byte key hash + raw RSA signature where
        // the raw RSA signature is computed over (data || 1-byte version).
        // As the key hash is unique, we verify against only one key.
        if (signature.length > 5 && signature[0] == VERSION &&
            hashesEqual(signature, keyHash)) {
          const signedData = new Uint8Array(data.length + 1);
          signedData.set(data);
          signedData[data.length] = VERSION;
          let jsonRsaKey = {
            kty: 'RSA',
            e: encodeByteArray(rsaPubKey['e'], true),
            n: encodeByteArray(rsaPubKey['n'], true),
            alg: 'RS256',
            ext: true,
          };
          if (isWebkit) {
            jsonRsaKey = asciiToUint8Array(JSON.stringify(jsonRsaKey));
          }
          return crossCrypto.importKey(
            'jwk',
            jsonRsaKey,
            {
              name: 'RSASSA-PKCS1-v1_5',
              hash: {name: 'SHA-256'},
            },
            true,
            ['verify'])

            .then(publicKey => crossCrypto.verify({
              name: 'RSASSA-PKCS1-v1_5',
              hash: 'SHA-256',
            }, publicKey, new Uint8Array(signature, 5), signedData))

            .catch(err => {
              dev.error(TAG_, 'Error while verifying:', err);
              throw err;
            });
        };
      };
      return Promise.resolve(false);
    });
  }

  /**
   * Is this service actually available? For now, we use browser native
   * crypto. So if that is not available, then this service is not available.
   * @return {boolean}
   */
  isAvailable() {
    return !!crossCrypto;
  }
}

/**
 * Appends 4-byte endian data's length to the data itself.
 * @param {!Uint8Array} the data.
 * @return {!Uint8Array} the appended 4-byte endian data's length together with
 *     the data itself.
 */
function lenPrefix(data) {
  if (data == null || data.length == 0) {
    return new Uint8Array([0x00, 0x00, 0x00, 0x00]);
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

function asciiToUint8Array(str) {
  const chars = new Uint8Array(str.length);
  for (let i = 0; i < str.length; ++i) {
    chars[i] = str.charCodeAt(i);
  }
  return chars;
}

/**
 * @param {{e: !Uint8Array, n:!Uint8Array, keyHash: !Uint8Array }} the RSA
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
 * @param {{e: !Uint8Array, n:!Uint8Array, keyHash: !Uint8Array }} the RSA
 *     public key. If keyHash is null, this function will compute it.
 * @return {!Promise<!ArrayBuffer>} the hash of RSA public key.
 */
function hashRSAPubKeys(rsaPubKeys) {
  return Promise.all(rsaPubKeys.map(rsaPubKey => hashRSAPubKey(rsaPubKey)));
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

/**
 * @param {!Window} window
 * @return {!CryptoVerifier}
 */
export function installCryptoVerifierService(window) {
  return getService(window, 'crypto-verifier', () => {
    return new CryptoVerifier();
  });
};
