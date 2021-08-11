function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { reportError } from "../error-reporting";
import { user } from "../log";
import { getMode } from "../mode";
import { registerServiceBuilder, registerServiceBuilderInEmbedWin } from "../service-helpers";
var TAG = 'timer';
var timersForTesting;

/**
 * Helper with all things Timer.
 */
export var Timer = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function Timer(win) {
    _classCallCheck(this, Timer);

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
   */
  _createClass(Timer, [{
    key: "timeSinceStart",
    value: function timeSinceStart() {
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
     */

  }, {
    key: "delay",
    value: function delay(callback, opt_delay) {
      var _this = this;

      if (!opt_delay) {
        // For a delay of zero,  schedule a promise based micro task since
        // they are predictably fast.
        var id = 'p' + this.taskCount_++;
        this.resolved_.then(function () {
          if (_this.canceled_[id]) {
            delete _this.canceled_[id];
            return;
          }

          callback();
        }).catch(reportError);
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

      if (getMode().test) {
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
     */

  }, {
    key: "cancel",
    value: function cancel(timeoutId) {
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
     */

  }, {
    key: "promise",
    value: function promise(opt_delay) {
      var _this2 = this;

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
     */

  }, {
    key: "timeoutPromise",
    value: function timeoutPromise(delay, opt_racePromise, opt_message) {
      var _this3 = this;

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
     */

  }, {
    key: "poll",
    value: function poll(delay, predicate) {
      var _this4 = this;

      return new this.win.Promise(function (resolve) {
        var interval = _this4.win.setInterval(function () {
          if (predicate()) {
            _this4.win.clearInterval(interval);

            resolve();
          }
        }, delay);
      });
    }
  }]);

  return Timer;
}();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRpbWVyLWltcGwuanMiXSwibmFtZXMiOlsicmVwb3J0RXJyb3IiLCJ1c2VyIiwiZ2V0TW9kZSIsInJlZ2lzdGVyU2VydmljZUJ1aWxkZXIiLCJyZWdpc3RlclNlcnZpY2VCdWlsZGVySW5FbWJlZFdpbiIsIlRBRyIsInRpbWVyc0ZvclRlc3RpbmciLCJUaW1lciIsIndpbiIsInJlc29sdmVkXyIsIlByb21pc2UiLCJyZXNvbHZlIiwidGFza0NvdW50XyIsImNhbmNlbGVkXyIsInN0YXJ0VGltZV8iLCJEYXRlIiwibm93IiwiY2FsbGJhY2siLCJvcHRfZGVsYXkiLCJpZCIsInRoZW4iLCJjYXRjaCIsIndyYXBwZWQiLCJlIiwiaW5kZXgiLCJzZXRUaW1lb3V0IiwidGVzdCIsInB1c2giLCJ0aW1lb3V0SWQiLCJjbGVhclRpbWVvdXQiLCJ0aW1lcktleSIsImRlbGF5IiwiRXJyb3IiLCJvcHRfcmFjZVByb21pc2UiLCJvcHRfbWVzc2FnZSIsImRlbGF5UHJvbWlzZSIsIl9yZXNvbHZlIiwicmVqZWN0IiwiY3JlYXRlRXJyb3IiLCJjYW5jZWwiLCJyYWNlIiwicHJlZGljYXRlIiwiaW50ZXJ2YWwiLCJzZXRJbnRlcnZhbCIsImNsZWFySW50ZXJ2YWwiLCJpbnN0YWxsVGltZXJTZXJ2aWNlIiwid2luZG93IiwiaW5zdGFsbFRpbWVySW5FbWJlZFdpbmRvdyIsImVtYmVkV2luIiwiY2FuY2VsVGltZXJzRm9yVGVzdGluZyIsImZvckVhY2giXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFdBQVI7QUFDQSxTQUFRQyxJQUFSO0FBQ0EsU0FBUUMsT0FBUjtBQUNBLFNBQ0VDLHNCQURGLEVBRUVDLGdDQUZGO0FBS0EsSUFBTUMsR0FBRyxHQUFHLE9BQVo7QUFDQSxJQUFJQyxnQkFBSjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxX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QUFpQjtBQUNmLFlBQUEsTUFBSSxDQUFDakMsR0FBTCxDQUFTb0MsYUFBVCxDQUF1QkYsUUFBdkI7O0FBQ0EvQixZQUFBQSxPQUFPO0FBQ1I7QUFDRixTQUxnQixFQUtkb0IsS0FMYyxDQUFqQjtBQU1ELE9BUE0sQ0FBUDtBQVFEO0FBbkpIOztBQUFBO0FBQUE7O0FBc0pBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU2MsbUJBQVQsQ0FBNkJDLE1BQTdCLEVBQXFDO0FBQzFDM0MsRUFBQUEsc0JBQXNCLENBQUMyQyxNQUFELEVBQVN6QyxHQUFULEVBQWNFLEtBQWQsQ0FBdEI7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVN3Qyx5QkFBVCxDQUFtQ0MsUUFBbkMsRUFBNkM7QUFDbEQ1QyxFQUFBQSxnQ0FBZ0MsQ0FBQzRDLFFBQUQsRUFBVzNDLEdBQVgsRUFBZ0JFLEtBQWhCLENBQWhDO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTMEMsc0JBQVQsR0FBa0M7QUFDdkMsTUFBSSxDQUFDM0MsZ0JBQUwsRUFBdUI7QUFDckI7QUFDRDs7QUFDREEsRUFBQUEsZ0JBQWdCLENBQUM0QyxPQUFqQixDQUF5QnJCLFlBQXpCO0FBQ0F2QixFQUFBQSxnQkFBZ0IsR0FBRyxJQUFuQjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7cmVwb3J0RXJyb3J9IGZyb20gJy4uL2Vycm9yLXJlcG9ydGluZyc7XG5pbXBvcnQge3VzZXJ9IGZyb20gJy4uL2xvZyc7XG5pbXBvcnQge2dldE1vZGV9IGZyb20gJy4uL21vZGUnO1xuaW1wb3J0IHtcbiAgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlcixcbiAgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckluRW1iZWRXaW4sXG59IGZyb20gJy4uL3NlcnZpY2UtaGVscGVycyc7XG5cbmNvbnN0IFRBRyA9ICd0aW1lcic7XG5sZXQgdGltZXJzRm9yVGVzdGluZztcblxuLyoqXG4gKiBIZWxwZXIgd2l0aCBhbGwgdGhpbmdzIFRpbWVyLlxuICovXG5leHBvcnQgY2xhc3MgVGltZXIge1xuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHdpbikge1xuICAgIC8qKiBAY29uc3QgeyFXaW5kb3d9ICovXG4gICAgdGhpcy53aW4gPSB3aW47XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshUHJvbWlzZX0gICovXG4gICAgdGhpcy5yZXNvbHZlZF8gPSB0aGlzLndpbi5Qcm9taXNlLnJlc29sdmUoKTtcblxuICAgIHRoaXMudGFza0NvdW50XyA9IDA7XG5cbiAgICB0aGlzLmNhbmNlbGVkXyA9IHt9O1xuXG4gICAgLyoqIEBjb25zdCB7bnVtYmVyfSAqL1xuICAgIHRoaXMuc3RhcnRUaW1lXyA9IERhdGUubm93KCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aW1lIHNpbmNlIHN0YXJ0IGluIG1pbGxpc2Vjb25kcy5cbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKi9cbiAgdGltZVNpbmNlU3RhcnQoKSB7XG4gICAgcmV0dXJuIERhdGUubm93KCkgLSB0aGlzLnN0YXJ0VGltZV87XG4gIH1cblxuICAvKipcbiAgICogUnVucyB0aGUgcHJvdmlkZWQgY2FsbGJhY2sgYWZ0ZXIgdGhlIHNwZWNpZmllZCBkZWxheS4gVGhpcyB1c2VzIGEgbWljcm9cbiAgICogdGFzayBmb3IgMCBvciBubyBzcGVjaWZpZWQgdGltZS4gVGhpcyBtZWFucyB0aGF0IHRoZSBkZWxheSB3aWxsIGFjdHVhbGx5XG4gICAqIGJlIGNsb3NlIHRvIDAgYW5kIHRoaXMgd2lsbCBOT1QgeWllbGQgdG8gdGhlIGV2ZW50IHF1ZXVlLlxuICAgKlxuICAgKiBSZXR1cm5zIHRoZSB0aW1lciBJRCB0aGF0IGNhbiBiZSB1c2VkIHRvIGNhbmNlbCB0aGUgdGltZXIgKGNhbmNlbCBtZXRob2QpLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCl9IGNhbGxiYWNrXG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gb3B0X2RlbGF5XG4gICAqIEByZXR1cm4ge251bWJlcnxzdHJpbmd9XG4gICAqL1xuICBkZWxheShjYWxsYmFjaywgb3B0X2RlbGF5KSB7XG4gICAgaWYgKCFvcHRfZGVsYXkpIHtcbiAgICAgIC8vIEZvciBhIGRlbGF5IG9mIHplcm8sICBzY2hlZHVsZSBhIHByb21pc2UgYmFzZWQgbWljcm8gdGFzayBzaW5jZVxuICAgICAgLy8gdGhleSBhcmUgcHJlZGljdGFibHkgZmFzdC5cbiAgICAgIGNvbnN0IGlkID0gJ3AnICsgdGhpcy50YXNrQ291bnRfKys7XG4gICAgICB0aGlzLnJlc29sdmVkX1xuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMuY2FuY2VsZWRfW2lkXSkge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuY2FuY2VsZWRfW2lkXTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKHJlcG9ydEVycm9yKTtcbiAgICAgIHJldHVybiBpZDtcbiAgICB9XG4gICAgY29uc3Qgd3JhcHBlZCA9ICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJlcG9ydEVycm9yKGUpO1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLndpbi5zZXRUaW1lb3V0KHdyYXBwZWQsIG9wdF9kZWxheSk7XG4gICAgaWYgKGdldE1vZGUoKS50ZXN0KSB7XG4gICAgICBpZiAoIXRpbWVyc0ZvclRlc3RpbmcpIHtcbiAgICAgICAgdGltZXJzRm9yVGVzdGluZyA9IFtdO1xuICAgICAgfVxuICAgICAgdGltZXJzRm9yVGVzdGluZy5wdXNoKGluZGV4KTtcbiAgICB9XG4gICAgcmV0dXJuIGluZGV4O1xuICB9XG5cbiAgLyoqXG4gICAqIENhbmNlbHMgdGhlIHByZXZpb3VzbHkgc2NoZWR1bGVkIGNhbGxiYWNrLlxuICAgKiBAcGFyYW0ge251bWJlcnxzdHJpbmd8bnVsbH0gdGltZW91dElkXG4gICAqL1xuICBjYW5jZWwodGltZW91dElkKSB7XG4gICAgaWYgKHR5cGVvZiB0aW1lb3V0SWQgPT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMuY2FuY2VsZWRfW3RpbWVvdXRJZF0gPSB0cnVlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLndpbi5jbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHdpbGwgcmVzb2x2ZSBhZnRlciB0aGUgZGVsYXkuIE9wdGlvbmFsbHksIHRoZVxuICAgKiByZXNvbHZlZCB2YWx1ZSBjYW4gYmUgcHJvdmlkZWQgYXMgb3B0X3Jlc3VsdCBhcmd1bWVudC5cbiAgICogQHBhcmFtIHtudW1iZXI9fSBvcHRfZGVsYXlcbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICBwcm9taXNlKG9wdF9kZWxheSkge1xuICAgIHJldHVybiBuZXcgdGhpcy53aW4uUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgLy8gQXZvaWQgd3JhcHBpbmcgaW4gY2xvc3VyZSBpZiBubyBzcGVjaWZpYyByZXN1bHQgaXMgcHJvZHVjZWQuXG4gICAgICBjb25zdCB0aW1lcktleSA9IHRoaXMuZGVsYXkocmVzb2x2ZSwgb3B0X2RlbGF5KTtcbiAgICAgIGlmICh0aW1lcktleSA9PSAtMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBzY2hlZHVsZSB0aW1lci4nKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHdpbGwgZmFpbCBhZnRlciB0aGUgc3BlY2lmaWVkIGRlbGF5LiBPcHRpb25hbGx5LFxuICAgKiB0aGlzIG1ldGhvZCBjYW4gdGFrZSBvcHRfcmFjZVByb21pc2UgcGFyYW1ldGVyLiBJbiB0aGlzIGNhc2UsIHRoZVxuICAgKiByZXN1bHRpbmcgcHJvbWlzZSB3aWxsIGVpdGhlciBmYWlsIHdoZW4gdGhlIHNwZWNpZmllZCBkZWxheSBleHBpcmVzIG9yXG4gICAqIHdpbGwgcmVzb2x2ZSBiYXNlZCBvbiB0aGUgb3B0X3JhY2VQcm9taXNlLCB3aGljaGV2ZXIgaGFwcGVucyBmaXJzdC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGRlbGF5XG4gICAqIEBwYXJhbSB7P1Byb21pc2U8UkVTVUxUPnx1bmRlZmluZWR9IG9wdF9yYWNlUHJvbWlzZVxuICAgKiBAcGFyYW0ge3N0cmluZz19IG9wdF9tZXNzYWdlXG4gICAqIEByZXR1cm4geyFQcm9taXNlPFJFU1VMVD59XG4gICAqIEB0ZW1wbGF0ZSBSRVNVTFRcbiAgICovXG4gIHRpbWVvdXRQcm9taXNlKGRlbGF5LCBvcHRfcmFjZVByb21pc2UsIG9wdF9tZXNzYWdlKSB7XG4gICAgbGV0IHRpbWVyS2V5O1xuICAgIGNvbnN0IGRlbGF5UHJvbWlzZSA9IG5ldyB0aGlzLndpbi5Qcm9taXNlKChfcmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aW1lcktleSA9IHRoaXMuZGVsYXkoKCkgPT4ge1xuICAgICAgICByZWplY3QodXNlcigpLmNyZWF0ZUVycm9yKG9wdF9tZXNzYWdlIHx8ICd0aW1lb3V0JykpO1xuICAgICAgfSwgZGVsYXkpO1xuXG4gICAgICBpZiAodGltZXJLZXkgPT0gLTEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gc2NoZWR1bGUgdGltZXIuJyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKCFvcHRfcmFjZVByb21pc2UpIHtcbiAgICAgIHJldHVybiBkZWxheVByb21pc2U7XG4gICAgfVxuICAgIGNvbnN0IGNhbmNlbCA9ICgpID0+IHtcbiAgICAgIHRoaXMuY2FuY2VsKHRpbWVyS2V5KTtcbiAgICB9O1xuICAgIG9wdF9yYWNlUHJvbWlzZS50aGVuKGNhbmNlbCwgY2FuY2VsKTtcbiAgICByZXR1cm4gdGhpcy53aW4uUHJvbWlzZS5yYWNlKFtkZWxheVByb21pc2UsIG9wdF9yYWNlUHJvbWlzZV0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgYWZ0ZXIgYHByZWRpY2F0ZWAgcmV0dXJucyB0cnVlLlxuICAgKiBQb2xscyB3aXRoIGludGVydmFsIGBkZWxheWBcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRlbGF5XG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKTpib29sZWFufSBwcmVkaWNhdGVcbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICBwb2xsKGRlbGF5LCBwcmVkaWNhdGUpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMud2luLlByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGNvbnN0IGludGVydmFsID0gdGhpcy53aW4uc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBpZiAocHJlZGljYXRlKCkpIHtcbiAgICAgICAgICB0aGlzLndpbi5jbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH0sIGRlbGF5KTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luZG93XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsVGltZXJTZXJ2aWNlKHdpbmRvdykge1xuICByZWdpc3RlclNlcnZpY2VCdWlsZGVyKHdpbmRvdywgVEFHLCBUaW1lcik7XG59XG5cbi8qKlxuICogQHBhcmFtIHshV2luZG93fSBlbWJlZFdpblxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbFRpbWVySW5FbWJlZFdpbmRvdyhlbWJlZFdpbikge1xuICByZWdpc3RlclNlcnZpY2VCdWlsZGVySW5FbWJlZFdpbihlbWJlZFdpbiwgVEFHLCBUaW1lcik7XG59XG5cbi8qKlxuICogQ2FuY2VscyBhbGwgdGltZXJzIHNjaGVkdWxlZCBkdXJpbmcgdGhlIGN1cnJlbnQgdGVzdFxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsVGltZXJzRm9yVGVzdGluZygpIHtcbiAgaWYgKCF0aW1lcnNGb3JUZXN0aW5nKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRpbWVyc0ZvclRlc3RpbmcuZm9yRWFjaChjbGVhclRpbWVvdXQpO1xuICB0aW1lcnNGb3JUZXN0aW5nID0gbnVsbDtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/service/timer-impl.js