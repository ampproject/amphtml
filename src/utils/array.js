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

import {dev} from '../log';

/**
 * A bit like Array#filter, but removes elements that filter false from the
 * array. Returns the filtered items.
 *
 * @param {!Array<T>} array
 * @param {function(T, number, !Array<T>):boolean} filter
 * @return {!Array<T>}
 * @template T
 */
export function filterSplice(array, filter) {
  const splice = [];
  let index = 0;
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    if (filter(item, i, array)) {
      if (index < i) {
        array[index] = item;
      }
      index++;
    } else {
      splice.push(item);
    }
  }

  if (index < array.length) {
    array.length = index;
  }

  return splice;
}

/**
 * Returns the index of the first element matching the predicate.
 * Like Array#findIndex.
 *
 * @param {!Array<T>} array
 * @param {function(T, number, !Array<T>):boolean} predicate
 * @return {number}
 * @template T
 */
export function findIndex(array, predicate) {
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i, array)) {
      return i;
    }
  }
  return -1;
}

/**
 * Returns the element at the negative index (indexing from the end).
 * `negative` must be a negative integer (>= -1), and its absolute value must
 * not be equal to or greater than the array's length.
 *
 * @param {!Array<T>} array
 * @param {number} negative
 * @return {T}
 * @template T
 */
export function negativeIndex(array, negative) {
  const length = array.length;
  const index = length - negative;
  dev().assert(index >= 0 && index < length, 'Overcooked index');

  return array[index];
}

/**
 * Converts the given iterator to an array.
 *
 * @param {!Iterator<T>} iterator
 * @return {Array<T>}
 * @template T
 */
export function fromIterator(iterator) {
  const array = [];
  for (let e = iterator.next(); !e.done; e = iterator.next()) {
    array.push(e.value);
  }
  return array;
}
