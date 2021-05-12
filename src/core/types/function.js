/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

/** @fileoverview Helpers to wrap functions. */

/**
 * Creates a function that is evaluated only once and returns the cached result
 * subsequently.
 *
 * Please note that `once` only takes the function definition into account,
 * so it will return the same cached value even when the arguments are
 * different.
 *
 * @param {function(...):T} fn
 * @return {function(...):T}
 * @template T
 */
export function once(fn) {
  let evaluated = false;
  let retValue = null;
  let callback = fn;
  return (...args) => {
    if (!evaluated) {
      retValue = callback.apply(self, args);
      evaluated = true;
      callback = null; // GC
    }
    return retValue;
  };
}

/**
 * Wraps a given callback and applies a rate limit.
 * It throttles the calls so that no consequent calls have time interval
 * smaller than the given minimal interval.
 *
 * @param {!Window} win
 * @param {function(...T):R} callback
 * @param {number} minInterval the minimum time interval in millisecond
 * @return {function(...T)}
 * @template T
 * @template R
 */
export function throttle(win, callback, minInterval) {
  let locker = 0;
  let nextCallArgs = null;

  /**
   * @param {!Object} args
   */
  function fire(args) {
    nextCallArgs = null;
    // Lock the fire for minInterval milliseconds
    locker = win.setTimeout(waiter, minInterval);

    callback.apply(null, args);
  }

  /**
   * Waiter function
   */
  function waiter() {
    locker = 0;
    // If during the period there're invocations queued up, fire once.
    if (nextCallArgs) {
      fire(nextCallArgs);
    }
  }

  return function (...args) {
    if (locker) {
      nextCallArgs = args;
    } else {
      fire(args);
    }
  };
}

/**
 * Wraps a given callback and applies a wait timer, so that minInterval
 * milliseconds must pass since the last call before the callback is actually
 * invoked.
 *
 * @param {!Window} win
 * @param {function(...T):R} callback
 * @param {number} minInterval the minimum time interval in millisecond
 * @return {function(...T)}
 * @template T
 * @template R
 */
export function debounce(win, callback, minInterval) {
  let locker = 0;
  let timestamp = 0;
  let nextCallArgs = null;

  /**
   * @param {?Array} args
   */
  function fire(args) {
    nextCallArgs = null;
    callback.apply(null, args);
  }

  /**
   * Wait function for debounce
   */
  function waiter() {
    locker = 0;
    const remaining = minInterval - (win.Date.now() - timestamp);
    if (remaining > 0) {
      locker = win.setTimeout(waiter, remaining);
    } else {
      fire(nextCallArgs);
    }
  }

  return function (...args) {
    timestamp = win.Date.now();
    nextCallArgs = args;
    if (!locker) {
      locker = win.setTimeout(waiter, minInterval);
    }
  };
}
