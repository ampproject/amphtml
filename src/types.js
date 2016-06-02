/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

/* @const */
const toString_ = Object.prototype.toString;

/**
 * Returns the ECMA [[Class]] of a value
 * @param {*} value
 * @return {string}
 */
function toString(value) {
  return toString_.call(value);
}

/**
 * Determines if value is actually an Array.
 * @param {*} value
 * @return {boolean}
 */
export function isArray(value) {
  return Array.isArray(value);
}

/**
 * Converts an array-like object to an array.
 * @param {?IArrayLike<*>|string} arrayLike
 * @return {!Array.<*>}
 */
export function toArray(arrayLike) {
  if (!arrayLike) {
    return [];
  }
  const length = arrayLike.length;
  if (length > 0) {
    const array = new Array(length);
    for (let i = 0; i < length; i++) {
      array[i] = arrayLike[i];
    }
    return array;
  }
  return [];
}

/**
 * Determines if value is actually an Object.
 * @param {*} value
 * @return {boolean}
 */
export function isObject(value) {
  return toString(value) === '[object Object]';
}
