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

import {getElementService} from './element-service';

/**
 * @param {!Window} window
 * @return {!Promise<!../extensions/amp-analytics/0.1/crypto-impl.Crypto>}
 */
export function cryptoFor(window) {
  return (/** @type {!Promise<
      !../extensions/amp-analytics/0.1/crypto-impl.Crypto>} */ (
      getElementService(window, 'crypto', 'amp-analytics')));
}

/**
 * Hash function djb2a
 * This is intended to be a simple, fast hashing function using minimal code.
 * It does *not* have good cryptographic properties.
 * @param {string} str
 * @return {string} 32-bit unsigned hash of the string
 */
export function stringHash32(str) {
  const length = str.length;
  let hash = 5381;
  for (let i = 0; i < length; i++) {
    hash = hash * 33 ^ str.charCodeAt(i);
  }
  // Convert from 32-bit signed to unsigned.
  return String(hash >>> 0);
};
