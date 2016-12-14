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
 * Wraps a given callback and apply rate limit.
 * It throttles the calls so that no consequent calls have time interval
 * smaller than the given minimal interval.
 *
 * @param {!Window} win
 * @param {function()} callback
 * @param {number} minInterval the minimum time interval in millisecond
 * @returns {function()}
 */
export function rateLimit(win, callback, minInterval) {
  let locker = null;
  let nextCallArgs = null;

  const fire = args => {
    callback.apply(null, args);

    nextCallArgs = null;
    // Lock the fire for minInterval milliseconds
    locker = win.setTimeout(() => {
      locker = null;
      // If during the period there're invocations queued up, fire once.
      if (nextCallArgs !== null) {
        fire(nextCallArgs);
      }
    }, minInterval);
  };
  return function() {
    if (locker) {
      nextCallArgs = arguments;
      return;
    }
    fire(arguments);
  };
}
