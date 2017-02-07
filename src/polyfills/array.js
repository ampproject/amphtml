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
 * Returns true if the element is in the array and false otherwise.
 *
 * @param {*} searchElement
 * @param {number} fromIndex
 * @returns {boolean}
 */
export function includes(searchElement, fromIndex) {
  if (this == null) {
    throw new TypeError('"this" is null or not defined');
  }
  const o = Object(this);
  const len = o.length >>> 0;
  if (len === 0) {
    return false;
  }
  const n = fromIndex | 0;
  let k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
  while (k < len) {
    if (o[k] === searchElement) {
      return true;
    }
    k++;
  }
  return false;
}

/**
* Sets the Array.contains polyfill if it does not exist.
* @param {!Window} win
*/
export function install(win) {
  if (!win.Array.prototype.includes) {
    /*eslint "no-extend-native": 0*/
    Object.defineProperty(Array.prototype, 'includes', {value: includes});
  }
}
