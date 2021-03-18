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

/**
 * Allow expectations to await the expected value. Duck-type a real Promise.
 * This class, and its waitForValue member function, are necessary because
 * to behave like a Promise and to wait for the correct value from the
 * Browser Automation Framework, the onFulfilled chains need to propagate into
 * the new values that come from the browser.
 *
 * @template TYPE
 * @extends {Promise<TYPE>}
 */
class ControllerPromise {
  /**
   * @param {!Promise<TYPE>|function(function(?TYPE):void, function(*):void):void} executorOrPromise
   * @param {undefined|function(TYPE,function(TYPE): ?TYPE): Promise<TYPE>} opt_waitForValue
   */
  constructor(executorOrPromise, opt_waitForValue) {
    this.promise_ =
      typeof executorOrPromise == 'function'
        ? new Promise(executorOrPromise)
        : executorOrPromise;

    /**
     * Returns a Promise that resolves when the given expected value fulfills
     * the given condition.
     * @param {function(TYPE): ?TYPE} condition
     * @return {!Promise<?TYPE>}
     */
    this.waitForValue = opt_waitForValue;
  }

  /** @override */
  catch(onRejected) {
    return new ControllerPromise(
      this.promise_.catch(onRejected),
      this.waitForValue
    );
  }

  /** @override */
  finally(onFinally) {
    return new ControllerPromise(
      this.promise_.finally(onFinally),
      this.waitForValue
    );
  }

  /** @override */
  then(opt_onFulfilled, opt_onRejected) {
    // Allow this and future `then`s to update the wait value.
    let wrappedWait;
    if (this.waitForValue) {
      wrappedWait = wrapWait(this.waitForValue, opt_onFulfilled);
    }

    return new ControllerPromise(
      this.promise_.then(opt_onFulfilled, opt_onRejected),
      wrappedWait
    );
  }
}

/**
 * Wrap the given wait function with the given mutation function,
 * while still allowing it to be mutated again in the future by
 * the inner opt_mutate function.
 * @param {function(TYPE1, function(TYPE1): ?TYPE1): Promise<TYPE3>} wait
 * @param {function(TYPE1): TYPE1} mutate
 * @return {function(function(TYPE1): ?TYPE1, function(TYPE1): TYPE2): Promise<TYPE3>}
 * @template TYPE1
 * @template TYPE2
 * @template TYPE3
 */
function wrapWait(wait, mutate) {
  return (condition, opt_mutate) => {
    opt_mutate = opt_mutate || ((x) => /** @type {*} */ (x));
    return wait(condition, (value) => opt_mutate(mutate(value)));
  };
}

module.exports = {
  ControllerPromise,
};
