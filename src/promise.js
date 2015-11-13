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

import {assert} from './asserts';


/**
 * Waits for all promises to yield and resolves with the position array of
 * results. If one promise fails, the overall promise fails as well.
 *
 * @param {!Array<!Promise<T>>} promises
 * @return {!Promise<!Array<T>>}
 * @template T
 */
export function all(promises) {
  let left = promises.length;
  if (left == 0) {
    return Promise.resolve([]);
  }

  const results = [];
  return new Promise((resolve, reject) => {
    promises.forEach((promise, index) => {
      promise.then(result => {
        results[index] = result;
        left--;
        if (left == 0) {
          resolve(results);
        }
      }, error => {
        reject(error);
      });
    });
  });
}
