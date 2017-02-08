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
export function includes(value, fromIndex) {
  if (value === value) { // Everything but NaN
    return this.indexOf(value, fromIndex) > -1;
  }
  let i = Math.max(n >= 0 ? n : len + n, 0);
  for (; i < this.length; i++) {
    const value = this[i];
    if (value !== value) {
      return true;
    }
  }
  return false;
}

/**
* Sets the Array.contains polyfill if it does not exist.
* @param {!Window} win
*/
export function install(win) {
  if (!win.Array.includes) {
    win.Array.includes = includes;
  }
}
