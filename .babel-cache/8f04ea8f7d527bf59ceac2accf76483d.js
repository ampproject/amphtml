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
import { Services } from "./service";

/**
 * Pass class helps to manage single-pass process. A pass is scheduled using
 * delay method. Only one pass can be pending at a time. If no pass is pending
 * the process is considered to be "idle".
 */
export var Pass = /*#__PURE__*/function () {
  /**
   * Creates a new Pass instance.
   * @param {!Window} win
   * @param {function()} handler Handler to be executed when pass is triggered.
   * @param {number=} opt_defaultDelay Default delay to be used when schedule
   *   is called without one.
   */
  function Pass(win, handler, opt_defaultDelay) {
    var _this = this;

    _classCallCheck(this, Pass);

    this.timer_ = Services.timerFor(win);

    /** @private @const {function()} */
    this.handler_ = handler;

    /** @private @const {number} */
    this.defaultDelay_ = opt_defaultDelay || 0;

    /** @private {number|string} */
    this.scheduled_ = -1;

    /** @private {number} */
    this.nextTime_ = 0;

    /** @private {boolean} */
    this.running_ = false;

    /**
     * @private
     * @const {function()}
     */
    this.boundPass_ = function () {
      _this.pass_();
    };
  }

  /**
   * Whether or not a pass is currently pending.
   * @return {boolean}
   */
  _createClass(Pass, [{
    key: "isPending",
    value: function isPending() {
      return this.scheduled_ != -1;
    }
    /**
     * Tries to schedule a new pass optionally with specified delay. If the new
     * requested pass is requested before the pending pass, the pending pass is
     * canceled. If the new pass is requested after the pending pass, the newly
     * requested pass is ignored.
     *
     * Returns {@code true} if the pass has been scheduled and {@code false} if
     * ignored.
     *
     * @param {number=} opt_delay Delay to schedule the pass. If not specified
     *   the default delay is used, falling back to 0.
     * @return {boolean}
     */

  }, {
    key: "schedule",
    value: function schedule(opt_delay) {
      var delay = opt_delay || this.defaultDelay_;

      if (this.running_ && delay < 10) {
        // If we get called recursively, wait at least 10ms for the next
        // execution.
        delay = 10;
      }

      var nextTime = Date.now() + delay;

      // Schedule anew if nothing is scheduled currently or if the new time is
      // sooner then previously requested.
      if (!this.isPending() || nextTime - this.nextTime_ < -10) {
        this.cancel();
        this.nextTime_ = nextTime;
        this.scheduled_ = this.timer_.delay(this.boundPass_, delay);
        return true;
      }

      return false;
    }
    /**
     *
     */

  }, {
    key: "pass_",
    value: function pass_() {
      this.scheduled_ = -1;
      this.nextTime_ = 0;
      this.running_ = true;
      this.handler_();
      this.running_ = false;
    }
    /**
     * Cancels the pending pass if any.
     */

  }, {
    key: "cancel",
    value: function cancel() {
      if (this.isPending()) {
        this.timer_.cancel(this.scheduled_);
        this.scheduled_ = -1;
      }
    }
  }]);

  return Pass;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhc3MuanMiXSwibmFtZXMiOlsiU2VydmljZXMiLCJQYXNzIiwid2luIiwiaGFuZGxlciIsIm9wdF9kZWZhdWx0RGVsYXkiLCJ0aW1lcl8iLCJ0aW1lckZvciIsImhhbmRsZXJfIiwiZGVmYXVsdERlbGF5XyIsInNjaGVkdWxlZF8iLCJuZXh0VGltZV8iLCJydW5uaW5nXyIsImJvdW5kUGFzc18iLCJwYXNzXyIsIm9wdF9kZWxheSIsImRlbGF5IiwibmV4dFRpbWUiLCJEYXRlIiwibm93IiwiaXNQZW5kaW5nIiwiY2FuY2VsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxRQUFSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFhQyxJQUFiO0FBQ0U7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRSxnQkFBWUMsR0FBWixFQUFpQkMsT0FBakIsRUFBMEJDLGdCQUExQixFQUE0QztBQUFBOztBQUFBOztBQUMxQyxTQUFLQyxNQUFMLEdBQWNMLFFBQVEsQ0FBQ00sUUFBVCxDQUFrQkosR0FBbEIsQ0FBZDs7QUFFQTtBQUNBLFNBQUtLLFFBQUwsR0FBZ0JKLE9BQWhCOztBQUVBO0FBQ0EsU0FBS0ssYUFBTCxHQUFxQkosZ0JBQWdCLElBQUksQ0FBekM7O0FBRUE7QUFDQSxTQUFLSyxVQUFMLEdBQWtCLENBQUMsQ0FBbkI7O0FBRUE7QUFDQSxTQUFLQyxTQUFMLEdBQWlCLENBQWpCOztBQUVBO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQixLQUFoQjs7QUFFQTtBQUNKO0FBQ0E7QUFDQTtBQUNJLFNBQUtDLFVBQUwsR0FBa0IsWUFBTTtBQUN0QixNQUFBLEtBQUksQ0FBQ0MsS0FBTDtBQUNELEtBRkQ7QUFHRDs7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQXRDQTtBQUFBO0FBQUEsV0F1Q0UscUJBQVk7QUFDVixhQUFPLEtBQUtKLFVBQUwsSUFBbUIsQ0FBQyxDQUEzQjtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBdkRBO0FBQUE7QUFBQSxXQXdERSxrQkFBU0ssU0FBVCxFQUFvQjtBQUNsQixVQUFJQyxLQUFLLEdBQUdELFNBQVMsSUFBSSxLQUFLTixhQUE5Qjs7QUFDQSxVQUFJLEtBQUtHLFFBQUwsSUFBaUJJLEtBQUssR0FBRyxFQUE3QixFQUFpQztBQUMvQjtBQUNBO0FBQ0FBLFFBQUFBLEtBQUssR0FBRyxFQUFSO0FBQ0Q7O0FBRUQsVUFBTUMsUUFBUSxHQUFHQyxJQUFJLENBQUNDLEdBQUwsS0FBYUgsS0FBOUI7O0FBQ0E7QUFDQTtBQUNBLFVBQUksQ0FBQyxLQUFLSSxTQUFMLEVBQUQsSUFBcUJILFFBQVEsR0FBRyxLQUFLTixTQUFoQixHQUE0QixDQUFDLEVBQXRELEVBQTBEO0FBQ3hELGFBQUtVLE1BQUw7QUFDQSxhQUFLVixTQUFMLEdBQWlCTSxRQUFqQjtBQUNBLGFBQUtQLFVBQUwsR0FBa0IsS0FBS0osTUFBTCxDQUFZVSxLQUFaLENBQWtCLEtBQUtILFVBQXZCLEVBQW1DRyxLQUFuQyxDQUFsQjtBQUVBLGVBQU8sSUFBUDtBQUNEOztBQUVELGFBQU8sS0FBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBOztBQWhGQTtBQUFBO0FBQUEsV0FpRkUsaUJBQVE7QUFDTixXQUFLTixVQUFMLEdBQWtCLENBQUMsQ0FBbkI7QUFDQSxXQUFLQyxTQUFMLEdBQWlCLENBQWpCO0FBQ0EsV0FBS0MsUUFBTCxHQUFnQixJQUFoQjtBQUNBLFdBQUtKLFFBQUw7QUFDQSxXQUFLSSxRQUFMLEdBQWdCLEtBQWhCO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7O0FBM0ZBO0FBQUE7QUFBQSxXQTRGRSxrQkFBUztBQUNQLFVBQUksS0FBS1EsU0FBTCxFQUFKLEVBQXNCO0FBQ3BCLGFBQUtkLE1BQUwsQ0FBWWUsTUFBWixDQUFtQixLQUFLWCxVQUF4QjtBQUNBLGFBQUtBLFVBQUwsR0FBa0IsQ0FBQyxDQUFuQjtBQUNEO0FBQ0Y7QUFqR0g7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTUgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcuL3NlcnZpY2UnO1xuXG4vKipcbiAqIFBhc3MgY2xhc3MgaGVscHMgdG8gbWFuYWdlIHNpbmdsZS1wYXNzIHByb2Nlc3MuIEEgcGFzcyBpcyBzY2hlZHVsZWQgdXNpbmdcbiAqIGRlbGF5IG1ldGhvZC4gT25seSBvbmUgcGFzcyBjYW4gYmUgcGVuZGluZyBhdCBhIHRpbWUuIElmIG5vIHBhc3MgaXMgcGVuZGluZ1xuICogdGhlIHByb2Nlc3MgaXMgY29uc2lkZXJlZCB0byBiZSBcImlkbGVcIi5cbiAqL1xuZXhwb3J0IGNsYXNzIFBhc3Mge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBQYXNzIGluc3RhbmNlLlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCl9IGhhbmRsZXIgSGFuZGxlciB0byBiZSBleGVjdXRlZCB3aGVuIHBhc3MgaXMgdHJpZ2dlcmVkLlxuICAgKiBAcGFyYW0ge251bWJlcj19IG9wdF9kZWZhdWx0RGVsYXkgRGVmYXVsdCBkZWxheSB0byBiZSB1c2VkIHdoZW4gc2NoZWR1bGVcbiAgICogICBpcyBjYWxsZWQgd2l0aG91dCBvbmUuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih3aW4sIGhhbmRsZXIsIG9wdF9kZWZhdWx0RGVsYXkpIHtcbiAgICB0aGlzLnRpbWVyXyA9IFNlcnZpY2VzLnRpbWVyRm9yKHdpbik7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHtmdW5jdGlvbigpfSAqL1xuICAgIHRoaXMuaGFuZGxlcl8gPSBoYW5kbGVyO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7bnVtYmVyfSAqL1xuICAgIHRoaXMuZGVmYXVsdERlbGF5XyA9IG9wdF9kZWZhdWx0RGVsYXkgfHwgMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfHN0cmluZ30gKi9cbiAgICB0aGlzLnNjaGVkdWxlZF8gPSAtMTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMubmV4dFRpbWVfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLnJ1bm5pbmdfID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBjb25zdCB7ZnVuY3Rpb24oKX1cbiAgICAgKi9cbiAgICB0aGlzLmJvdW5kUGFzc18gPSAoKSA9PiB7XG4gICAgICB0aGlzLnBhc3NfKCk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIG9yIG5vdCBhIHBhc3MgaXMgY3VycmVudGx5IHBlbmRpbmcuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBpc1BlbmRpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2NoZWR1bGVkXyAhPSAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmllcyB0byBzY2hlZHVsZSBhIG5ldyBwYXNzIG9wdGlvbmFsbHkgd2l0aCBzcGVjaWZpZWQgZGVsYXkuIElmIHRoZSBuZXdcbiAgICogcmVxdWVzdGVkIHBhc3MgaXMgcmVxdWVzdGVkIGJlZm9yZSB0aGUgcGVuZGluZyBwYXNzLCB0aGUgcGVuZGluZyBwYXNzIGlzXG4gICAqIGNhbmNlbGVkLiBJZiB0aGUgbmV3IHBhc3MgaXMgcmVxdWVzdGVkIGFmdGVyIHRoZSBwZW5kaW5nIHBhc3MsIHRoZSBuZXdseVxuICAgKiByZXF1ZXN0ZWQgcGFzcyBpcyBpZ25vcmVkLlxuICAgKlxuICAgKiBSZXR1cm5zIHtAY29kZSB0cnVlfSBpZiB0aGUgcGFzcyBoYXMgYmVlbiBzY2hlZHVsZWQgYW5kIHtAY29kZSBmYWxzZX0gaWZcbiAgICogaWdub3JlZC5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXI9fSBvcHRfZGVsYXkgRGVsYXkgdG8gc2NoZWR1bGUgdGhlIHBhc3MuIElmIG5vdCBzcGVjaWZpZWRcbiAgICogICB0aGUgZGVmYXVsdCBkZWxheSBpcyB1c2VkLCBmYWxsaW5nIGJhY2sgdG8gMC5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIHNjaGVkdWxlKG9wdF9kZWxheSkge1xuICAgIGxldCBkZWxheSA9IG9wdF9kZWxheSB8fCB0aGlzLmRlZmF1bHREZWxheV87XG4gICAgaWYgKHRoaXMucnVubmluZ18gJiYgZGVsYXkgPCAxMCkge1xuICAgICAgLy8gSWYgd2UgZ2V0IGNhbGxlZCByZWN1cnNpdmVseSwgd2FpdCBhdCBsZWFzdCAxMG1zIGZvciB0aGUgbmV4dFxuICAgICAgLy8gZXhlY3V0aW9uLlxuICAgICAgZGVsYXkgPSAxMDtcbiAgICB9XG5cbiAgICBjb25zdCBuZXh0VGltZSA9IERhdGUubm93KCkgKyBkZWxheTtcbiAgICAvLyBTY2hlZHVsZSBhbmV3IGlmIG5vdGhpbmcgaXMgc2NoZWR1bGVkIGN1cnJlbnRseSBvciBpZiB0aGUgbmV3IHRpbWUgaXNcbiAgICAvLyBzb29uZXIgdGhlbiBwcmV2aW91c2x5IHJlcXVlc3RlZC5cbiAgICBpZiAoIXRoaXMuaXNQZW5kaW5nKCkgfHwgbmV4dFRpbWUgLSB0aGlzLm5leHRUaW1lXyA8IC0xMCkge1xuICAgICAgdGhpcy5jYW5jZWwoKTtcbiAgICAgIHRoaXMubmV4dFRpbWVfID0gbmV4dFRpbWU7XG4gICAgICB0aGlzLnNjaGVkdWxlZF8gPSB0aGlzLnRpbWVyXy5kZWxheSh0aGlzLmJvdW5kUGFzc18sIGRlbGF5KTtcblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBwYXNzXygpIHtcbiAgICB0aGlzLnNjaGVkdWxlZF8gPSAtMTtcbiAgICB0aGlzLm5leHRUaW1lXyA9IDA7XG4gICAgdGhpcy5ydW5uaW5nXyA9IHRydWU7XG4gICAgdGhpcy5oYW5kbGVyXygpO1xuICAgIHRoaXMucnVubmluZ18gPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYW5jZWxzIHRoZSBwZW5kaW5nIHBhc3MgaWYgYW55LlxuICAgKi9cbiAgY2FuY2VsKCkge1xuICAgIGlmICh0aGlzLmlzUGVuZGluZygpKSB7XG4gICAgICB0aGlzLnRpbWVyXy5jYW5jZWwodGhpcy5zY2hlZHVsZWRfKTtcbiAgICAgIHRoaXMuc2NoZWR1bGVkXyA9IC0xO1xuICAgIH1cbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/src/pass.js