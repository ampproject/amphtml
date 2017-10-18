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

import {bytesToString, bytesToUInt32, stringToBytes} from './utils/bytes';
import {getSourceOrigin, parseQueryString, parseUrl} from './url';
import {parseJson} from './json';

/** @const {number} */
const LENGTH_BYTES = 4;

/**
 * Generates, signs and verifies origin experiments.
 */
export class OriginExperiments {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Object} */
    this.algo_ = {
      name: 'RSASSA-PKCS1-v1_5',
      hash: {name: 'SHA-256'},
    };

    /** @private {!SubtleCrypto} */
    this.subtle_ = win.crypto.subtle;
  }

  /** @return {!Promise} */
  generateKeys() {
    const generationAlgo = Object.assign({
      modulusLength: 2048,
      publicExponent: Uint8Array.of(1, 0, 1),
    }, this.algo_);
    return this.subtle_.generateKey(
        generationAlgo,
        /* extractable */ true,
        /* keyUsages */ ['sign', 'verify']);
  }

  /**
   * Generates an origin experiment token given a config json.
   * @param {number} version
   * @param {string} json
   * @param {!CryptoKey} privateKey
   * @return {!Promise<string>}
   */
  generateToken(version, json, privateKey) {
    const config = stringToBytes(
        typeof json == 'object' ? JSON.stringify(json) : json);
    const data = this.prepend_(version, config);
    return this.sign_(data, privateKey).then(signature => {
      return this.append_(data, new Uint8Array(signature));
    });
  }

  /**
   * Verifies an origin experiment token given a public key.
   * @param {string} token
   * @param {!CryptoKey} publicKey
   * @return {!Promise}
   */
  verifyToken(token, publicKey) {
    let i = 0;
    const bytes = stringToBytes(atob(token));

    // Parse version.
    const version = bytes[i];
    if (version !== 0) {
      return Promise.reject(`Unrecognized token version: ${version}`);
    }
    i += 1;

    // Parse config length.
    const length = bytesToUInt32(bytes.subarray(i, i + LENGTH_BYTES));
    i += LENGTH_BYTES;
    if (length > bytes.length - i) {
      return Promise.reject(`Unexpected config length: ${length}`);
    }

    // Parse config itself.
    const configBytes = bytes.subarray(i, i + length);
    i += length;

    // Parse unsigned data and its signature.
    const data = bytes.subarray(0, i);
    const signature = bytes.subarray(i);

    return this.verify_(signature, data, publicKey).then(verified => {
      if (!verified) {
        throw new Error('Failed to verify config signature.');
      }
      const configStr = bytesToString(configBytes);
      const config = parseJson(configStr);

      const approvedOrigin = parseUrl(config['origin']).origin;
      const sourceOrigin = getSourceOrigin(this.win_.location);
      if (approvedOrigin !== sourceOrigin) {
        throw new Error(`Config origin (${approvedOrigin}) does not match ` +
            ` window (${sourceOrigin}).`);
      }

      const experimentId = config['experiment'];
      const expiration = config['expiration'];
      const now = Date.now();
      if (expiration >= now) {
        return true;
      } else {
        throw new Error(`Experiment ${experimentId} has expired.`);
      }
    });
  }

  /**
   * Returns a byte array: (version + config.length + config)
   * @param {number} version
   * @param {string} config
   * @return {!Uint8Array}
   */
  prepend_(version, config) {
    const data = new Uint8Array(config.length + 5);
    data[0] = version;
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
   * @param {!CryptoKey} privateKey
   * @return {!Promise}
   */
  sign_(data, privateKey) {
    return this.subtle_.sign(this.algo_, privateKey, data);
  }

  /**
   * Wraps SubtleCrypto.verify().
   * @param {string} signature
   * @param {!Uint8Array} data
   * @param {!CryptoKey} publicKey
   * @return {!Promise<boolean>}
   */
  verify_(signature, data, publicKey) {
    return this.subtle_.verify(this.algo_, publicKey, signature, data);
  }
}
