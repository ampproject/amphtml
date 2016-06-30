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

export class Crypto {

  constructor(win) {
    this.win = win;
  }

  /**
   * Returns the SHA-384 hash of the input string in an ArrayBuffer.
   * @param {string} str
   * @returns {!Promise<!ArrayBuffer>}
   */
  sha384(str) {
    return Promise.resolve(lib.sha384(str));
  }

  /**
   * Returns the SHA-384 hash of the input string in the format of web safe
   * base64 string (using -_. instead of +/=).
   * @param {string} str
   * @returns {!Promise<string>}
   */
  sha384Base64(str) {
    return Promise.resolve(lib.sha384Base64(str));
  }
}

export function installCryptoService(win) {
  return getService(win, 'crypto', () => {
    return new Crypto(win);
  });
}
