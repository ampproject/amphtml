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
import {getSourceOrigin, parseUrl} from './url';
import {parseJson} from './json';

/** @const {number} */
const LENGTH_BYTES = 4;

/**
 * @typedef {{name: string}}
 */
let AlgorithmDef;

/**
 * Generates, signs and verifies origin experiments.
 */
export class OriginExperiments {
  /**
   * @param {!Window} win
   * @param {./service/crypto-impl.Crypto=} opt_crypto
   */
  constructor(win, opt_crypto) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {./service/crypto-impl.Crypto|undefined} */
    this.crypto_ = opt_crypto;

    /** @private {AlgorithmDef} */
    this.algo_ = {
      name: 'RSASSA-PKCS1-v1_5',
      hash: {name: 'SHA-256'},
    };

    /** @private {webCrypto.SubtleCrypto} */
    this.subtle_ = null;
    if (win.crypto) {
      this.subtle_ = win.crypto.subtle;
    }
  }

  /** @return {!Promise} */
  generateKeys() {
    if (!this.subtle_) {
      return Promise.reject(new Error('Crypto is not supported.'));
    }
    const generationAlgo = Object.assign({
      modulusLength: 2048,
      publicExponent: Uint8Array.of(1, 0, 1),
    }, this.algo_);
    return this.subtle_.generateKey(
        /** @type {AlgorithmDef} */ (generationAlgo),
        /* extractable */ true,
        /* keyUsages */ ['sign', 'verify']);
  }

  /**
   * Generates an origin experiment token given a config json.
   * @param {number} version
   * @param {string} json
   * @param {!webCrypto.CryptoKey} privateKey
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
   * @param {!Location} location
   * @param {!webCrypto.CryptoKey} publicKey
   * @return {!Promise<string>} If token is valid, resolves with the
   *     experiment ID. Otherwise, reject with validation error.
   */
  verifyToken(token, location, publicKey) {
    let i = 0;
    const bytes = stringToBytes(atob(token));

    // Parse version.
    const version = bytes[i];
    if (version !== 0) {
      return Promise.reject(
          new Error(`Unrecognized token version: ${version}`));
    }
    i += 1;

    // Parse config length.
    const length = bytesToUInt32(bytes.subarray(i, i + LENGTH_BYTES));
    i += LENGTH_BYTES;
    if (length > bytes.length - i) {
      return Promise.reject(new Error(`Unexpected config length: ${length}`));
    }

    // Parse config itself.
    const configBytes = bytes.subarray(i, i + length);
    i += length;

    // Parse unsigned data and its signature.
    const data = bytes.subarray(0, i);
    const signature = bytes.subarray(i);

    return this.verify_(signature, data, publicKey).then(verified => {
      if (!verified) {
        throw new Error('Failed to verify token signature.');
      }
      const configStr = bytesToString(configBytes);
      const config = parseJson(configStr);

      const approvedOrigin = parseUrl(config['origin']).origin;
      const sourceOrigin = getSourceOrigin(location);
      if (approvedOrigin !== sourceOrigin) {
        throw new Error(`Config origin (${approvedOrigin}) does not match ` +
            `window (${sourceOrigin}).`);
      }

      const experimentId = config['experiment'];
      const expiration = config['expiration'];
      const now = Date.now();
      if (expiration >= now) {
        return experimentId;
      } else {
        throw new Error(`Experiment "${experimentId}" has expired.`);
      }
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
    if (this.subtle_) {
      return this.subtle_.sign(this.algo_, privateKey, data);
    } else {
      return Promise.reject(new Error('Crypto is not supported.'));
    }
  }

  /**
   * Wraps SubtleCrypto.verify().
   * @param {!Uint8Array} signature
   * @param {!Uint8Array} data
   * @param {!webCrypto.CryptoKey} publicKey
   * @return {!Promise}
   */
  verify_(signature, data, publicKey) {
    if (this.crypto_) {
      return this.crypto_.verifyPkcs(publicKey, signature, data);
    } else if (this.subtle_) {
      return this.subtle_.verify(this.algo_, publicKey, signature, data);
    } else {
      return Promise.reject(new Error('Crypto is not supported.'));
    }
  }
}
