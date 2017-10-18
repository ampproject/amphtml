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

export class OriginExperiments {
  constructor() {
    this.algo_ = {
      name: 'RSASSA-PKCS1-v1_5',
      hash: {name: 'SHA-256'},
    };
  }

  /** @return {!Promise} */
  generateKeys() {
    return crypto.subtle.generateKey(
        /* algo */ {
          name: 'RSASSA-PKCS1-v1_5',
          modulusLength: 2048,
          publicExponent: Uint8Array.of(1, 0, 1),
          hash: {name: 'SHA-256'},
        },
        /* extractable */ true,
        /* keyUsages */ ['sign', 'verify']);
  }

  /** @return {!Promise<string>} */
  generateToken(version, json, privateKey) {
    const config = stringToBytes(
        typeof json == 'object' ? JSON.stringify(json) : json);
    const data = this.prepend_(version, config);
    return this.sign_(data, privateKey).then(signature => {
      return this.append_(data, new Uint8Array(signature));
    });
  }

  /** @return {!Promise<string>} */
  verifyToken(token, publicKey) {
    let i = 0;
    const bytes = stringToBytes(atob(token));

    // Parse version.
    const version = bytes[i];
    if (version !== 0) {
      return Promise.reject(`Unrecognized experiments token version: ${version}`);
    }
    i += 1;

    const length = bytesToUInt32(bytes.subarray(i, i + LENGTH_BYTES));
    i += LENGTH_BYTES;
    if (length > bytes.length - i) {
      return Promise.reject('Specified config length larger than token.');
    }

    const configBytes = bytes.subarray(i, i + length);
    i += length;

    const data = bytes.subarray(0, i);
    const signature = bytes.subarray(i);

    return this.verify_(signature, data, publicKey).then(verified => {
      if (!verified) {
        throw new Error('Failed to verify config signature.');
      }
      const configStr = bytesToString(configBytes);
      const config = parseJson(configStr);

      const approvedOrigin = parseUrl(config['origin']).origin;
      const sourceOrigin = getSourceOrigin(win.location);
      if (approvedOrigin !== sourceOrigin) {
        throw new Error(`Config origin (${approvedOrigin}) does not match window (${sourceOrigin}).`);
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

  prepend_(version, config) {
    const data = new Uint8Array(config.length + 5);
    data[0] = version;
    new DataView(data.buffer).setUint32(1, config.length, false);
    data.set(config, 5);
    return data;
  }

  append_(data, signature) {
    const string = bytesToString(data) + bytesToString(signature);
    return btoa(string);
  }

  sign_(data, privateKey) {
    return crypto.subtle.sign(this.algo_, privateKey, data);
  }

  verify_(signature, data, publicKey) {
    return crypto.subtle.verify(this.algo_, publicKey, signature, data);
  }
}

// const o = new OriginExperiments();

// const correctConfig = {
//   origin: 'https://www.google.com',
//   experiment: 'amp-expires-later',
//   expiration: 95617602000000,
// };

// const expiredConfig = {
//   origin: 'https://www.google.com',
//   experiment: 'amp-expired',
//   expiration: 1232427600000,
// };

// const generatePromise = crypto.subtle.generateKey(
//     /* algo */ {
//       name: 'RSASSA-PKCS1-v1_5',
//       modulusLength: 2048,
//       publicExponent: Uint8Array.of(1, 0, 1),
//       hash: {name: 'SHA-256'},
//     },
//     /* extractable */ true,
//     /* keyUsages */ ['sign', 'verify']);

// generatePromise.then(keyPair => {
//   const {publicKey, privateKey} = keyPair;

//   o.generateToken(0, correctConfig, privateKey).then(token => {
//     console.log('Token', token);

//     return o.verifyToken(token, publicKey);
//   }).then(verified => {
//     console.log('Verified', verified);
//   })

//   const correct = prepend(0, correctConfig.length, correctConfig);
//   const badVersion = prepend(47, correctConfig.length, correctConfig);
//   const badConfigLength = prepend(0, 999999, correctConfig);
//   const expired = prepend(0, expiredConfig.length, expiredConfig);
//   return Promise.all([
//     crypto.subtle.exportKey('jwk', publicKey).then(JSON.stringify),
//     signAndAppend(correct, privateKey),
//     signAndAppend(badVersion, privateKey),
//     signAndAppend(badConfigLength, privateKey),
//     concatAndBtoa(correct, crypto.getRandomValues(new Uint8Array(256))),
//     signAndAppend(expired, privateKey),
//   ]).then(results => `/**
// * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
// *
// * Licensed under the Apache License, Version 2.0 (the "License");
// * you may not use this file except in compliance with the License.
// * You may obtain a copy of the License at
// *
// *      http://www.apache.org/licenses/LICENSE-2.0
// *
// * Unless required by applicable law or agreed to in writing, software
// * distributed under the License is distributed on an "AS-IS" BASIS,
// * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// * See the License for the specific language governing permissions and
// * limitations under the License.
// */
// /* eslint-disable */
// // Generated from generate-testdata-experiments.js_.
// export const publicJwk = ${results[0]};
// export const correctToken = '${results[1]}';
// export const tokenWithBadVersion = '${results[2]}';
// export const tokenWithBadConfigLength = '${results[3]}';
// export const tokenWithBadSignature = '${results[4]}';
// export const tokenWithExpiredExperiment = '${results[5]}';
// `);
// })
// .then(copy)
// .then(() => {
//   console.log('Generated code copied to clipboard.');
// });
