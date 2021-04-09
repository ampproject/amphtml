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

/**
 * Converts an array-like object to an array.
 * @param {?IArrayLike<T>|string} arrayLike
 * @return {!Array<T>}
 * @template T
 */
export function toArray(arrayLike) {
  return arrayLike ? Array.prototype.slice.call(arrayLike) : [];
}

/**
 * Determines if value is actually an Array.
 * @param {*} value
 * @return {boolean}
 */
export const {isArray} = Array;

/**
 * If the specified argument is an array, it's returned as is. If it's a
 * single item, the array containing this item is created and returned.
 * @param {!Array<T>|T} arrayOrSingleItem
 * @return {!Array<T>}
 * @template T
 */
export function arrayOrSingleItemToArray(arrayOrSingleItem) {
  return isArray(arrayOrSingleItem)
    ? /** @type {!Array<T>} */ (arrayOrSingleItem)
    : [arrayOrSingleItem];
}

/**
 * Compares if two arrays contains exactly same elements of same number
 * of same order. Note that it does NOT handle NaN case as expected.
 *
 * @param {!Array<T>} arr1
 * @param {!Array<T>} arr2
 * @return {boolean}
 * @template T
 */
export function areEqualOrdered(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Removes elements that shouldRemove returns true for from the array.
 *
 * @param {!Array<T>} array
 * @param {function(T, number, !Array<T>):boolean} shouldRemove
 * @return {!Array<T>}
 * @template T
 */
export function remove(array, shouldRemove) {
  const removed = [];
  let index = 0;
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    if (shouldRemove(item, i, array)) {
      removed.push(item);
    } else {
      if (index < i) {
        array[index] = item;
      }
      index++;
    }
  }
  if (index < array.length) {
    array.length = index;
  }
  return removed;
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

/**
 * Adds item to array if it is not already present.
 *
 * @param {Array<T>} array
 * @param {T} item
 * @return {boolean}
 * @template T
 */
export function pushIfNotExist(array, item) {
  if (array.indexOf(item) < 0) {
    array.push(item);
    return true;
  }
  return false;
}

/**
 * Removes the first matching item in the array. Returns `true` if the array
 * has changed.
 *
 * @param {!Array<T>} array
 * @param {T} item
 * @return {boolean}
 * @template T
 */
export function removeItem(array, item) {
  const index = array.indexOf(item);
  if (index == -1) {
    return false;
  }
  array.splice(index, 1);
  return true;
}

/**
 * Returns the last item in an array.
 *
 * @param {Array<T>} array
 * @template T
 * @return {?T}
 */
export function lastItem(array) {
  return array[array.length - 1];
}
