/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {getCryptoRandomBytesArray} from '../../../src/utils/bytes';

/**
 * Returns an string with a total of 128 of random values based on the
 * `win.crypto.getRandomValues` API. If that is not available concatenates
 * a string of other values that might be hard to guess including
 * `Math.random` and the current time.
 * @param {!Window} win
 * @return {string} Entropy.
 */
export function getUniqueId(win) {
  // Use win.crypto.getRandomValues to get 128 bits of random value
  const uint8array = getCryptoRandomBytesArray(win, 16); // 128 bit
  if (uint8array) {
    return uint8array.join('');
  }

  // Support for legacy browsers.
  return String(
    win.location.href +
      Date.now() +
      win.Math.random() +
      win.screen.width +
      win.screen.height
  );
}
