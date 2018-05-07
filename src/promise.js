/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
 * Returns a Deferred struct, which holds a pending promise and its associated
 * resolve and reject functions.
 *
 * @template T
 */
export class Deferred {
  constructor() {
    let resolve, reject;

    /**
     * @const {!Promise<T>}
     */
    this.promise = new /*OK*/Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    /**
     * @const {function(T=)}
     */
    this.resolve = resolve;

    /**
     * @const {function(*=)}
     */
    this.reject = reject;
  }
}

/**
 * Creates a promise resolved to the return value of fn.
 * If fn sync throws, it will cause the promise to reject.
 *
 * @param {function():T} fn
 * @return !Promise<T>
 * @template T
 */
export function tryResolve(fn) {
  return new Promise(resolve => {
    resolve(fn());
  });
}
