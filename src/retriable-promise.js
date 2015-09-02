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

import {log} from './log';
import {timer} from './timer';

let TAG_ = 'retriablePromise';


/**
 * Creates a retriable promise. This promise will retry the work the number of
 * times up to value specified by maxAttempts.
 * @param {!function():!Promise<TYPE>} exec Performs the retriable work and
 *   returns the promise for the attempt.
 * @param {number} maxAttempts Maximum number of attempts to try the execution.
 * @param {number} delay The default delay before the next attempt is made.
 * @param {boolean} backoffFactor The backoff factor for each consequent
 *   attempt.
 * @return {!goog.Promise<TYPE>}
 * @template TYPE
 */
export function retriablePromise(exec, maxAttempts, delay, backoffFactor) {
  return new Promise((resolve, reject) => {
    attempt_(exec, resolve, reject, maxAttempts - 1, delay, backoffFactor);
  });
}

/**
 * @param {!function():!Promise<TYPE>} exec
 * @param {!function(TYPE)} resolve
 * @param {!function(*)} reject
 * @param {number} maxAttempts
 * @param {number} delay
 * @param {boolean} backoffFactor
 * @private
 */
function attempt_(exec, resolve, reject, attemptsLeft, nextDelay,
                  backoffFactor) {
  log.fine(TAG_, 'attempts left: ' + attemptsLeft);
  exec().then((result) => {
    log.fine(TAG_, 'success');
    resolve(result);
  }, (reason) => {
    log.fine(TAG_, 'attempt failed: ' + reason);
    if (attemptsLeft <= 0) {
      log.fine(TAG_, 'out of attempts');
      reject(reason);
    } else {
      // TODO(dvoytenko): not all errors retriable
      var nextNextDelay = (nextDelay * backoffFactor / 2) *
          (1 + Math.random());
      timer.delay(() => {
        attempt_(exec, resolve, reject, attemptsLeft - 1,
            nextNextDelay, backoffFactor);
      }, nextDelay);
    }
  });
}
