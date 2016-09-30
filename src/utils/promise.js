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
 * Returns a promise which resolves if any of the given promises resolve, and
 * which rejects if none of the given promises resolve.
 * @param {!Array<!Promise>>} promises The array of promises to test.
 * @return {!Promise} A promise that resolves if any of the given promises
 *     resolve, and which rejects otherwise.
 */
export function any(promises) {
  let resolve;
  let reject;
  const p = new Promise((s, j) => {
    resolve = s;
    reject = j;
  });
  let rejectCnt = 0;
  promises.forEach(promise => {
    promise.then(retVal => resolve(retVal), () => {
      if (++rejectCnt == promises.length) {
        reject();
      }
    });
  });
  return p;
}
