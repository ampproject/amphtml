/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
 * Forces the return value from Map.prototype.set to always be the map
 * instance. IE11 returns undefined.
 *
 * @param {!Window} win
 */
export function install(win) {
  const {Map} = win;
  const m = new Map();
  if (m.set(0, 0) !== m) {
    const {set} = m;

    win.Object.defineProperty(Map.prototype, 'set', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: function () {
        set.apply(this, arguments);
        return this;
      },
    });
  }
}
