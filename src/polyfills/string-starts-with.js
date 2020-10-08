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
 * Return true if string begins with the characters of the specified string.
 * Polyfill copied from MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/string/startsWith
 *
 * @param {string} search
 * @param {number=} rawPos
 * @return {boolean}
 * @this {string}
 */
function startsWith(search, rawPos) {
  const pos = rawPos > 0 ? rawPos | 0 : 0;
  // eslint-disable-next-line local/no-invalid-this
  return this.substring(pos, pos + search.length) === search;
}

/**
 * Sets the String.startsWith polyfill if it does not exist.
 * @param {!Window} win
 */
export function install(win) {
  if (!win.Array.prototype.includes) {
    win.Object.defineProperty(win.String.prototype, 'startsWith', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: startsWith,
    });
  }
}
