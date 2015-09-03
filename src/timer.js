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
 * Helper with all things Timer.
 */
export class Timer {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;
  }

  /**
   * Returns the current EPOC time in milliseconds.
   * @return {number}
   */
  now() {
    // TODO(dvoytenko): when can we use Date.now?
    return +new Date();
  }

  /**
   * Runs the provided callback after the specified delay. If delay is not
   * specified, the 0 value is assumed. Returns the timer ID that can be used
   * to cancel the timer (cancel method).
   * @param {!function()} callback
   * @param {number=} opt_delay
   * @return {number}
   */
  delay(callback, opt_delay) {
    return this.win.setTimeout(callback, opt_delay || 0);
  }

  /**
   * Cancels the previously scheduled callback.
   * @param {number} timeoutId
   */
  cancel(timeoutId) {
    this.win.clearTimeout(timeoutId);
  }

  /**
   * Returns a promise that will resolve after the delay. Optionally, the
   * resolved value can be provided as opt_result argument.
   * @param {number=} opt_delay
   * @param {RESULT=} opt_result
   * @return {!Promise<RESULT>}
   * @template RESULT
   */
  promise(opt_delay, opt_result) {
    var timerKey = null;
    return new Promise((resolve, reject) => {
      timerKey = this.delay(() => {
        timerKey = -1;
        resolve(opt_result);
      }, opt_delay);
      if (timerKey == -1) {
        reject(new Error('Failed to schedule timer.'));
      }
    }).catch((error) => {
      // Clear the timer. The most likely reason is "cancel" signal.
      if (timerKey != -1) {
        this.cancel(timerKey);
      }
      return Promise.reject(error);
    });
  }

  /**
   * Returns a promise that will fail after the specified delay. Optionally,
   * this method can take opt_racePromise parameter. In this case, the
   * resulting promise will either fail when the specified delay expires or
   * will resolve based on the opt_racePromise, whichever happens first.
   * @param {number} delay
   * @param {!Promise<RESULT>|undefined} opt_racePromise
   * @return {!Promise<RESULT>}
   * @template RESULT
   */
  timeoutPromise(delay, opt_racePromise) {
    var timerKey = null;
    var delayPromise = new Promise((resolve, reject) => {
      timerKey = this.delay(() => {
        timerKey = -1;
        reject('timeout');
      }, delay);
      if (timerKey == -1) {
        reject(new Error('Failed to schedule timer.'));
      }
    }).catch((error) => {
      // Clear the timer. The most likely reason is "cancel" signal.
      if (timerKey != -1) {
        this.cancel(timerKey);
      }
      return Promise.reject(error);
    });
    if (!opt_racePromise) {
      return delayPromise;
    }
    return Promise.race([delayPromise, opt_racePromise]);
  }
}


export const timer = new Timer(window);
