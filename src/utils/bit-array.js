/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {devAssert} from '../log';

export class BitArray {
  /**
   * Utility class for 52-bit bit array.
   */
  constructor() {
    this.bits_ = [];
  }

  /**
   * Sets or unsets the value at the given bit.
   * @param {number} index The index of the bit to flip.
   * @param {boolean} value The value of the bit.
   */
  set(index, value = true) {
    devAssert(index >= 0 && index < 52, 'Index must be in [0,51].');
    devAssert(index % 1 === 0, 'Index must be an integer.');
    this.bits_[index] = value;
  }

  /**
   * @param {number} index
   * @return {boolean}
   */
  get(index) {
    return !!this.bits_[index];
  }

  /**
   * Returns the bit mask value as an integer.
   * @return {number}
   */
  getIntValue() {
    return this.bits_.reduce((accumulator, currentValue, currentIndex) => {
      return currentValue
        ? accumulator + Math.pow(2, currentIndex)
        : accumulator;
    }, 0);
  }
}
