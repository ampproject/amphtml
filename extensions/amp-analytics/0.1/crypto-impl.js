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

import * as lib from '../../../third_party/closure-library/sha384-generated';
import {getService} from '../../../src/service';
import {dev} from '../../../src/log';

/** @const {string} */
const TAG = 'Crypto';

export class Crypto {

  constructor(win) {
    /** @private @const {?SubtleCrypto} */
    this.subtle_ = getSubtle(win);
  }

  /**
   * Returns the SHA-384 hash of the input string in a number array.
   * Input string cannot contain chars out of range [0,255].
   * @param {string} str
   * @returns {!Promise<!Array<number>>}
   * @throws {!Error} when input string contains chars out of range [0,255]
   */
  sha384(str) {
    if (this.subtle_) {
      try {
        return this.subtle_.digest('SHA-384', str2ab(str))
            // [].slice.call(Unit8Array) is a shim for Array.from(Unit8Array)
            .then(buffer => [].slice.call(new Uint8Array(buffer)),
                e => {
                  dev.info(TAG, 'Crypto digest promise has rejected, ' +
                      'fallback to closure lib.', e);
                  return lib.sha384(str);
                });
      } catch (e) {
        dev.info(TAG, 'Crypto digest has thrown, fallback to closure lib.', e);
      }
    }
    return Promise.resolve(lib.sha384(str));
  }

  /**
   * Returns the SHA-384 hash of the input string in the format of web safe
   * base64 (using -_. instead of +/=).
   * Input string cannot contain chars out of range [0,255].
   * @param {string} str
   * @returns {!Promise<string>}
   * @throws {!Error} when input string contains chars out of range [0,255]
   */
  sha384Base64(str) {
    return this.sha384(str).then(buffer => {
      return lib.base64(buffer);
    });
  }
}

function getSubtle(win) {
  if (!win.crypto) {
    return null;
  }
  return win.crypto.subtle || win.crypto.webkitSubtle || null;
}

/**
 * Convert a string to Unit8Array. A shim for TextEncoder.
 * @param {string} str
 * @returns {!Uint8Array}
 */
function str2ab(str) {
  const buf = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    // Apply the same check as in closure lib:
    // https://github.com/google/closure-library/blob/master/closure/goog/crypt/sha2_64bit.js#L169
    if (str.charCodeAt(i) > 255) {
      throw Error('Characters must be in range [0,255]');
    }
    buf[i] = str.charCodeAt(i);
  }
  return buf;
}

export function installCryptoService(win) {
  return getService(win, 'crypto', () => {
    return new Crypto(win);
  });
}
