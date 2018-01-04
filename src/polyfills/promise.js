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


import PJPromise from 'promise-pjs/promise';

/**
 * Sets the Promise polyfill if it does not exist.
 * @param {!Window} win
 */
export function install(win) {
  if (!win.Promise) {
    win.Promise = /** @type {!Promise} */ (PJPromise);
    // In babel the * export is an Object with a default property.
    // In closure compiler it is the Promise function itself.
    if (Promise.default) {
      win.Promise = PJPromise.default;
    }
    // We copy the individual static methods, because closure
    // compiler flattens the polyfill namespace.
    win.Promise.resolve = PJPromise.resolve;
    win.Promise.reject = PJPromise.reject;
    win.Promise.all = PJPromise.all;
    win.Promise.race = PJPromise.race;
  }
}
