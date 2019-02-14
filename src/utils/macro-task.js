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
import {devAssert} from '../log';

/**
 * @param {!Window} win
 * @param {function()} cb
 * @param {number=} amount
 */
export function waitForMacroTasks(win, cb, amount = 1) {
  devAssert(amount % 1 === 0 && amount >= 1);
  return win.setTimeout(() => {
    if (amount == 1) {
      return cb();
    }
    waitForMacroTasks(win, cb, amount - 1);
  }, 0);
}
