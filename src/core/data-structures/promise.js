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

let resolved;

/**
 * Returns a cached resolved promise.
 * Babel converts direct calls to Promise.resolve() (with no arguments) into
 * calls to this.
 *
 * @return {!Promise<undefined>}
 */
export function resolvedPromise() {
  if (resolved) {
    return resolved;
  }

  // It's important that we call with `undefined` here, to prevent a transform
  // recursion. If we didn't pass an arg, then the transformer would replace
  // this callsite with a call to `resolvedPromise()`.
  resolved = Promise.resolve(undefined);
  return resolved;
}

/**
 * Returns a Deferred struct, which holds a pending promise and its associated
 * resolve and reject functions.
 *
 * This is preferred instead of creating a Promise instance to extract the
 * resolve/reject functions yourself:
 *
 * ```
 * // Avoid doing
 * let resolve;
 * const promise = new Promise(res => {
 *   resolve = res;
 * });
 *
 * // Good
 * const deferred = new Deferred();
 * const { promise, resolve } = deferred;
 * ```
 *
 * @template T
 */
export class Deferred {
  /**
   * Creates an instance of Deferred.
   */
  constructor() {
    let resolve, reject;

    /**
     * @const {!Promise<T>}
     */
    this.promise = new /*OK*/ Promise((res, rej) => {
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
 * @return {!Promise<T>}
 * @template T
 */
export function tryResolve(fn) {
  return new Promise((resolve) => {
    resolve(fn());
  });
}

/**
 * Resolves with the result of the last promise added.
 * @implements {IThenable}
 */
export class LastAddedResolver {
  /**
   * @param {!Array<!IThenable>=} opt_promises
   */
  constructor(opt_promises) {
    /** @private @const {!Deferred} */
    this.deferred_ = new Deferred();

    /** @private */
    this.count_ = 0;

    if (opt_promises) {
      for (let i = 0; i < opt_promises.length; i++) {
        this.add(opt_promises[i]);
      }
    }
  }

  /**
   * Add a promise to possibly be resolved.
   * @param {!IThenable} promise
   * @return {!Promise}
   */
  add(promise) {
    const countAtAdd = ++this.count_;
    promise.then(
      (result) => {
        if (this.count_ === countAtAdd) {
          this.deferred_.resolve(result);
        }
      },
      (error) => {
        // Don't follow behavior of Promise.all and Promise.race error so that
        // this will only reject when most recently added promise fails.
        if (this.count_ === countAtAdd) {
          this.deferred_.reject(error);
        }
      }
    );
    return this.deferred_.promise;
  }

  /** @override */
  then(opt_resolve, opt_reject) {
    return this.deferred_.promise.then(opt_resolve, opt_reject);
  }
}
