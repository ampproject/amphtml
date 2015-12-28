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


/**
 * Returns a promise resolver - a construct that contains the promise itself
 * as well as resolve and reject functions.
 * @return {!Resolver<T>}
 * @template T
 */
export function newResolver() {
  let resolve, reject;
  const promise = new Promise((aResolve, aReject) => {
    resolve = aResolve;
    reject = aReject;
  });
  return new Resolver(promise, resolve, reject);
}

/**
 * @template T
 */
class Resolver {
  /**
   * @param {!Promise<T>} promise
   * @param {function(T)} resolve
   * @param {function(*=)} reject
   */
  constructor(promise, resolve, reject) {
    /** @const @type {!Promise<T>} */
    this.promise = promise;
    /** @const @type {function(T)} */
    this.resolve = resolve.bind(null);
    /** @const @type {function(*=)} */
    this.reject = reject.bind(null);
  }
}
