function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { reportError } from "../error-reporting";
import { user } from "../log";
import { getMode } from "../mode";
import {
registerServiceBuilder,
registerServiceBuilderInEmbedWin } from "../service-helpers";


var TAG = 'timer';
var timersForTesting;

/**
 * Helper with all things Timer.
 */
export var Timer = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function Timer(win) {_classCallCheck(this, Timer);
    /** @const {!Window} */
    this.win = win;

    /** @private @const {!Promise}  */
    this.resolved_ = this.win.Promise.resolve();

    this.taskCount_ = 0;

    this.canceled_ = {};

    /** @const {number} */
    this.startTime_ = Date.now();
  }

  /**
   * Returns time since start in milliseconds.
   * @return {number}
   */_createClass(Timer, [{ key: "timeSinceStart", value:
    function timeSinceStart() {
      return Date.now() - this.startTime_;
    }

    /**
     * Runs the provided callback after the specified delay. This uses a micro
     * task for 0 or no specified time. This means that the delay will actually
     * be close to 0 and this will NOT yield to the event queue.
     *
     * Returns the timer ID that can be used to cancel the timer (cancel method).
     * @param {function()} callback
     * @param {number=} opt_delay
     * @return {number|string}
     */ }, { key: "delay", value:
    function delay(callback, opt_delay) {var _this = this;
      if (!opt_delay) {
        // For a delay of zero,  schedule a promise based micro task since
        // they are predictably fast.
        var id = 'p' + this.taskCount_++;
        this.resolved_.
        then(function () {
          if (_this.canceled_[id]) {
            delete _this.canceled_[id];
            return;
          }
          callback();
        }).
        catch(reportError);
        return id;
      }
      var wrapped = function wrapped() {
        try {
          callback();
        } catch (e) {
          reportError(e);
          throw e;
        }
      };
      var index = this.win.setTimeout(wrapped, opt_delay);
      if (false) {
        if (!timersForTesting) {
          timersForTesting = [];
        }
        timersForTesting.push(index);
      }
      return index;
    }

    /**
     * Cancels the previously scheduled callback.
     * @param {number|string|null} timeoutId
     */ }, { key: "cancel", value:
    function cancel(timeoutId) {
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
     * @return {!Promise}
     */ }, { key: "promise", value:
    function promise(opt_delay) {var _this2 = this;
      return new this.win.Promise(function (resolve) {
        // Avoid wrapping in closure if no specific result is produced.
        var timerKey = _this2.delay(resolve, opt_delay);
        if (timerKey == -1) {
          throw new Error('Failed to schedule timer.');
        }
      });
    }

    /**
     * Returns a promise that will fail after the specified delay. Optionally,
     * this method can take opt_racePromise parameter. In this case, the
     * resulting promise will either fail when the specified delay expires or
     * will resolve based on the opt_racePromise, whichever happens first.
     * @param {number} delay
     * @param {?Promise<RESULT>|undefined} opt_racePromise
     * @param {string=} opt_message
     * @return {!Promise<RESULT>}
     * @template RESULT
     */ }, { key: "timeoutPromise", value:
    function timeoutPromise(delay, opt_racePromise, opt_message) {var _this3 = this;
      var timerKey;
      var delayPromise = new this.win.Promise(function (_resolve, reject) {
        timerKey = _this3.delay(function () {
          reject(user().createError(opt_message || 'timeout'));
        }, delay);

        if (timerKey == -1) {
          throw new Error('Failed to schedule timer.');
        }
      });
      if (!opt_racePromise) {
        return delayPromise;
      }
      var cancel = function cancel() {
        _this3.cancel(timerKey);
      };
      opt_racePromise.then(cancel, cancel);
      return this.win.Promise.race([delayPromise, opt_racePromise]);
    }

    /**
     * Returns a promise that resolves after `predicate` returns true.
     * Polls with interval `delay`
     * @param {number} delay
     * @param {function():boolean} predicate
     * @return {!Promise}
     */ }, { key: "poll", value:
    function poll(delay, predicate) {var _this4 = this;
      return new this.win.Promise(function (resolve) {
        var interval = _this4.win.setInterval(function () {
          if (predicate()) {
            _this4.win.clearInterval(interval);
            resolve();
          }
        }, delay);
      });
    } }]);return Timer;}();


/**
 * @param {!Window} window
 */
export function installTimerService(window) {
  registerServiceBuilder(window, TAG, Timer);
}

/**
 * @param {!Window} embedWin
 */
export function installTimerInEmbedWindow(embedWin) {
  registerServiceBuilderInEmbedWin(embedWin, TAG, Timer);
}

/**
 * Cancels all timers scheduled during the current test
 */
export function cancelTimersForTesting() {
  if (!timersForTesting) {
    return;
  }
  timersForTesting.forEach(clearTimeout);
  timersForTesting = null;
}
// /Users/mszylkowski/src/amphtml/src/service/timer-impl.js