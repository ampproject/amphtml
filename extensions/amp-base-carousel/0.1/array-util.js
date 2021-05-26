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

import {mod} from '../../../src/core/math';

/**
 * Calculates the forwards distance between two indicies in an Array, treating
 * the first and last indicies as adjacent. In the array ['a', 'b', 'c'], the
 * forwardWrappingDistance between 'b' and 'a' is 2.
 * @param {number} a A start index.
 * @param {number} b An end index.
 * @param {!IArrayLike} arr An array like Object.
 * @return {number}
 */
export function forwardWrappingDistance(a, b, arr) {
  const {length} = arr;
  return a === b ? length : mod(b - a, length);
}

/**
 * Calculates the backwards distance between two indicies in an Array, treating
 * the first and last indicies as adjacent. In the array ['a', 'b', 'c'], the
 * backwardWrappingDistance between 'a' and 'b' is 2.
 * @param {number} a A start index.
 * @param {number} b An end index.
 * @param {!IArrayLike} arr An array like Object.
 * @return {number}
 */
export function backwardWrappingDistance(a, b, arr) {
  const {length} = arr;
  return a === b ? length : mod(a - b, length);
}
