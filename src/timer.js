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

// Requires polyfills in immediate side effect.
import './polyfills';

import {user} from './log';
import {fromClass} from './service';

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

    /** @private @const {!Promise}  */
    this.resolved_ = Promise.resolve();

    this.taskCount_ = 0;

    this.canceled_ = {};

    /** @const {number} */
    this.startTime_ = this.now();
  }

  /**
   * Returns the current EPOC time in milliseconds.
   * @return {number}
   */
  now() {
    return Date.now();
  }

 /**
  * Returns time since start in milliseconds.
  * @return {number}
  */
  timeSinceStart() {
    return this.now() - this.startTime_;
  }

  /**
   * Runs the provided callback after the specified delay. This uses a micro
   * task for 0 or no specified time. This means that the delay will actually
   * be close to 0 and this will NOT yield to the event queue.
   *
   * Returns the timer ID that can be used to cancel the timer (cancel method).
   * @param {!function()} callback
   * @param {number=} opt_delay
   * @return {number|string}
   */
  delay(callback, opt_delay) {
    if (!opt_delay) {
      // For a delay of zero,  schedule a promise based micro task since
      // they are predictably fast.
      const id = 'p' + this.taskCount_++;
      this.resolved_.then(() => {
        if (this.canceled_[id]) {
          delete this.canceled_[id];
          return;
        }
        callback();
      });
      return id;
    }
    return this.win.setTimeout(callback, opt_delay);
  }

  /**
   * Cancels the previously scheduled callback.
   * @param {number|string|null} timeoutId
   */
  cancel(timeoutId) {
    if (typeof timeoutId == 'string') {
      this.canceled_[timeoutId] = true;
      return;
    }
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
    let timerKey = null;
    return new Promise((resolve, reject) => {
      timerKey = this.delay(() => {
        timerKey = -1;
        resolve(opt_result);
      }, opt_delay);
      if (timerKey == -1) {
        reject(new Error('Failed to schedule timer.'));
      }
    }).catch(error => {
      // Clear the timer. The most likely reason is "cancel" signal.
      if (timerKey != -1) {
        this.cancel(timerKey);
      }
      throw error;
    });
  }

  /**
   * Returns a promise that will fail after the specified delay. Optionally,
   * this method can take opt_racePromise parameter. In this case, the
   * resulting promise will either fail when the specified delay expires or
   * will resolve based on the opt_racePromise, whichever happens first.
   * @param {number} delay
   * @param {!Promise<RESULT>|undefined} opt_racePromise
   * @param {string=} opt_message
   * @return {!Promise<RESULT>}
   * @template RESULT
   */
  timeoutPromise(delay, opt_racePromise, opt_message) {
    let timerKey = null;
    const delayPromise = new Promise((_resolve, reject) => {
      timerKey = this.delay(() => {
        timerKey = -1;
        reject(user.createError(opt_message || 'timeout'));
      }, delay);
      if (timerKey == -1) {
        reject(new Error('Failed to schedule timer.'));
      }
    }).catch(error => {
      // Clear the timer. The most likely reason is "cancel" signal.
      if (timerKey != -1) {
        this.cancel(timerKey);
      }
      throw error;
    });
    if (!opt_racePromise) {
      return delayPromise;
    }
    return Promise.race([delayPromise, opt_racePromise]);
  }
}

/**
 * @param {!Window} window
 * @return {!Timer}
 */
export function timerFor(window) {
  return fromClass(window, 'timer', Timer);
};


export const timer = timerFor(window);
