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

import {bytesToString, stringToBytes} from './utils/bytes';
import {getSourceOrigin, parseUrl} from './url';
import {parseJson} from './json';

/**
 * Generates, signs and verifies origin experiments.
 */
export class OriginExperiments {
  /**
   * @param {!./service/crypto-impl.Crypto} crypto
   */
  constructor(crypto) {
    /** @private {!./service/crypto-impl.Crypto} */
    this.crypto_ = crypto;
  }

  /**
   * Generates an RSA public/private key pair for signing and verifying.
   * @return {!Promise}
   */
  generateKeys() {
    const generationAlgo = Object.assign({
      modulusLength: 2048,
      publicExponent: Uint8Array.of(1, 0, 1),
    }, this.crypto_.pkcsAlgo);
    return this.crypto_.subtle.generateKey(
        /** @type {{name: string}} */ (generationAlgo),
        /* extractable */ true,
        /* keyUsages */ ['sign', 'verify']);
  }

  /**
   * Generates an origin experiment token given a config json.
   * @param {number} version
   * @param {!JsonObject} json
   * @param {!webCrypto.CryptoKey} privateKey
   * @return {!Promise<string>}
   */
  generateToken(version, json, privateKey) {
    const config = stringToBytes(JSON.stringify(json));
    const data = this.prepend_(version, config);
    return this.sign_(data, privateKey).then(signature => {
      return this.append_(data, new Uint8Array(signature));
    });
  }

  /**
   * Verifies an origin experiment token given a public key.
   * @param {string} token
   * @param {!Location} location
   * @param {!webCrypto.CryptoKey} publicKey
   * @return {!Promise<string>} If token is valid, resolves with the
   *     experiment ID. Otherwise, rejects with validation error.
   */
  verifyToken(token, location, publicKey) {
    return new Promise(resolve => {
      let i = 0;
      const bytes = stringToBytes(atob(token));

      // Parse version.
      const version = bytes[i];
      if (version !== 0) {
        throw new Error(`Unrecognized token version: ${version}`);
      }
      i += 1;

      // Parse config length.
      const length = new DataView(bytes.buffer).getUint32(i);
      i += 4; // Number of bytes in Uint32 config length.
      if (length > bytes.length - i) {
        throw new Error(`Unexpected config length: ${length}`);
      }

      // Parse config itself.
      const configBytes = bytes.subarray(i, i + length);
      i += length;

      // Parse unsigned data and its signature.
      const data = bytes.subarray(0, i);
      const signature = bytes.subarray(i);

      resolve(this.verify_(signature, data, publicKey).then(verified => {
        if (!verified) {
          throw new Error('Failed to verify token signature.');
        }
        // Convert config from bytes to JS object.
        const configStr = bytesToString(configBytes);
        const config = parseJson(configStr);

        // Check token experiment origin against `location`.
        const approvedOrigin = parseUrl(config['origin']).origin;
        const sourceOrigin = getSourceOrigin(location);
        if (approvedOrigin !== sourceOrigin) {
          throw new Error(`Config origin (${approvedOrigin}) does not match ` +
              `window (${sourceOrigin}).`);
        }

        // Check token expiration date.
        const experimentId = config['experiment'];
        const expiration = config['expiration'];
        if (expiration >= Date.now()) {
          return experimentId;
        } else {
          throw new Error(`Experiment "${experimentId}" has expired.`);
        }
      }));
    });
  }

  /**
   * Returns a byte array: (version + config.length + config)
   * @param {number} version
   * @param {!Uint8Array} config
   * @return {!Uint8Array}
   */
  prepend_(version, config) {
    const data = new Uint8Array(config.length + 5);
    data[0] = version;
    // Insert config length into bytes 1 through 5.
    new DataView(data.buffer).setUint32(1, config.length, false);
    data.set(config, 5);
    return data;
  }

  /**
   * Returns base64(data + signature).
   * @param {!Uint8Array} data
   * @param {!Uint8Array} signature
   * @return {string}
   */
  append_(data, signature) {
    const string = bytesToString(data) + bytesToString(signature);
    return btoa(string);
  }

  /**
   * Wraps SubtleCrypto.sign().
   * @param {!Uint8Array} data
   * @param {!webCrypto.CryptoKey} privateKey
   * @return {!Promise}
   */
  sign_(data, privateKey) {
    return this.crypto_.subtle.sign(this.crypto_.pkcsAlgo, privateKey, data);
  }

  /**
   * Wraps SubtleCrypto.verify().
   * @param {!Uint8Array} signature
   * @param {!Uint8Array} data
   * @param {!webCrypto.CryptoKey} publicKey
   * @return {!Promise<boolean>}
   */
  verify_(signature, data, publicKey) {
    return this.crypto_.verifyPkcs(publicKey, signature, data);
  }
}
