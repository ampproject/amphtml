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

import {toArray} from '#core/types/array';

/**
 * @param {!Window} win
 */
export function install(win) {
  const {Set: SetConstructor} = win;
  const s = new SetConstructor([1]);
  // Add suppport for `new Set(iterable)`. IE11 lacks it.
  if (s.size < 1) {
    win.Set = /** @type {typeof Set} */ (
      function (iterable) {
        const set = new SetConstructor();
        if (iterable) {
          const asArray = toArray(iterable);
          for (let i = 0; i < asArray.length; i++) {
            set.add(asArray[i]);
          }
        }
        return set;
      }
    );
  }
  // Forces the return value from Set.prototype.add to always be the set
  // instance. IE11 returns undefined.
  if (s.add(0) !== s) {
    const {add} = s;

    win.Object.defineProperty(SetConstructor.prototype, 'add', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: function () {
        add.apply(this, arguments);
        return this;
      },
    });
  }
}
