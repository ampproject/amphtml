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
  return new Promise(resolve => {
    resolve(fn());
  });
}

/**
 * Returns a promise which resolves if a threshold amount of the given promises
 * resolve, and rejects otherwise.
 * @param {!Array<!Promise>} promises The array of promises to test.
 * @param {number} count The number of promises that must resolve for the
 *     returned promise to resolve.
 * @return {!Promise} A promise that resolves if any of the given promises
 *     resolve, and which rejects otherwise.
 */
export function some(promises, count = 1) {
  return new Promise((resolve, reject) => {
    count = Math.max(count, 0);
    const extra = promises.length - count;
    if (extra < 0) {
      reject(new Error('not enough promises to resolve'));
    }
    if (promises.length == 0) {
      resolve([]);
    }
    const values = [];
    const reasons = [];

    const onFulfilled = value => {
      if (values.length < count) {
        values.push(value);
      }
      if (values.length == count) {
        resolve(values);
      }
    };
    const onRejected = reason => {
      if (reasons.length <= extra) {
        reasons.push(reason);
      }
      if (reasons.length > extra) {
        reject(reasons);
      }
    };
    for (let i = 0; i < promises.length; i++) {
      Promise.resolve(promises[i]).then(onFulfilled, onRejected);
    }
  });
}

/**
 * Resolves with the result of the last promise added.
 * @implements {IThenable}
 */
export class LastAddedResolver {
  /**
   * @param {!Array<!Promise>=} opt_promises
   */
  constructor(opt_promises) {
    let resolve_, reject_;
    /** @private @const {!Promise} */
    this.promise_ = new Promise((resolve, reject) => {
      resolve_ = resolve;
      reject_ = reject;
    });

    /** @private */
    this.resolve_ = resolve_;

    /** @private */
    this.reject_ = reject_;

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
   * @param {!Promise} promise
   * @return {!Promise}
   */
  add(promise) {
    const countAtAdd = ++this.count_;
    Promise.resolve(promise).then(
      result => {
        if (this.count_ === countAtAdd) {
          this.resolve_(result);
        }
      },
      error => {
        // Don't follow behavior of Promise.all and Promise.race error so that
        // this will only reject when most recently added promise fails.
        if (this.count_ === countAtAdd) {
          this.reject_(error);
        }
      }
    );
    return this.promise_;
  }

  /** @override */
  then(opt_resolve, opt_reject) {
    return this.promise_.then(opt_resolve, opt_reject);
  }
}
