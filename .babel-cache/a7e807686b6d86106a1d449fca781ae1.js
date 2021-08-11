function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { TimestampDef } from "../types/date";
import { map } from "../types/object";
import { Deferred } from "./promise";

/**
 * This object tracts signals and allows blocking until a signal has been
 * received.
 */
export var Signals = /*#__PURE__*/function () {
  /**
   * Creates an instance of Signals.
   */
  function Signals() {
    _classCallCheck(this, Signals);

    /**
     * A mapping from a signal name to the signal response: either time or
     * an error.
     * @private @const {!Object<string, (!TimestampDef|!Error)>}
     */
    this.map_ = map();

    /**
     * A mapping from a signal name to the signal promise, resolve and reject.
     * Only allocated when promise has been requested.
     * @private {?Object<string, {
     *   promise: !Promise,
     *   resolve: (function(!TimestampDef)|undefined),
     *   reject: (function(!Error)|undefined)
     * }>}
     */
    this.promiseMap_ = null;
  }

  /**
   * Returns the current known value of the signal. If signal is not yet
   * available, `null` is returned.
   * @param {string} name
   * @return {number|!Error|null}
   */
  _createClass(Signals, [{
    key: "get",
    value: function get(name) {
      var v = this.map_[name];
      return v == null ? null : v;
    }
    /**
     * Returns the promise that's resolved when the signal is triggered. The
     * resolved value is the time of the signal.
     * @param {string} name
     * @return {!Promise<!TimestampDef>}
     */

  }, {
    key: "whenSignal",
    value: function whenSignal(name) {
      var _this$promiseMap_;

      var promiseStruct = (_this$promiseMap_ = this.promiseMap_) == null ? void 0 : _this$promiseMap_[name];

      if (!promiseStruct) {
        var result = this.map_[name];

        if (result != null) {
          // Immediately resolve signal.
          var promise = typeof result == 'number' ? Promise.resolve(result) : Promise.reject(result);
          promiseStruct = {
            promise: promise
          };
        } else {
          // Allocate the promise/resolver for when the signal arrives in the
          // future.
          promiseStruct = new Deferred();
        }

        if (!this.promiseMap_) {
          this.promiseMap_ = map();
        }

        this.promiseMap_[name] = promiseStruct;
      }

      return promiseStruct.promise;
    }
    /**
     * Triggers the signal with the specified name on the element. The time is
     * optional; if not provided, the current time is used. The associated
     * promise is resolved with the resulting TimestampDef.
     * @param {string} name
     * @param {!TimestampDef=} opt_time
     */

  }, {
    key: "signal",
    value: function signal(name, opt_time) {
      var _this$promiseMap_2;

      if (this.map_[name] != null) {
        // Do not duplicate signals.
        return;
      }

      var time = opt_time != null ? opt_time : Date.now();
      this.map_[name] = time;
      var promiseStruct = (_this$promiseMap_2 = this.promiseMap_) == null ? void 0 : _this$promiseMap_2[name];

      if (promiseStruct != null && promiseStruct.resolve) {
        promiseStruct.resolve(time);
        promiseStruct.resolve = undefined;
        promiseStruct.reject = undefined;
      }
    }
    /**
     * Rejects the signal. Indicates that the signal will never succeed. The
     * associated signal is rejected.
     * @param {string} name
     * @param {!Error} error
     */

  }, {
    key: "rejectSignal",
    value: function rejectSignal(name, error) {
      var _this$promiseMap_3;

      if (this.map_[name] != null) {
        // Do not duplicate signals.
        return;
      }

      this.map_[name] = error;
      var promiseStruct = (_this$promiseMap_3 = this.promiseMap_) == null ? void 0 : _this$promiseMap_3[name];

      if (promiseStruct != null && promiseStruct.reject) {
        promiseStruct.reject(error);
        promiseStruct.promise.catch(function () {});
        promiseStruct.resolve = undefined;
        promiseStruct.reject = undefined;
      }
    }
    /**
     * Resets all signals.
     * @param {string} name
     */

  }, {
    key: "reset",
    value: function reset(name) {
      var _this$promiseMap_4;

      if (this.map_[name]) {
        delete this.map_[name];
      }

      // Reset promise it has already been resolved.
      var promiseStruct = (_this$promiseMap_4 = this.promiseMap_) == null ? void 0 : _this$promiseMap_4[name];

      if (promiseStruct && !promiseStruct.resolve) {
        delete this.promiseMap_[name];
      }
    }
  }]);

  return Signals;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNpZ25hbHMuanMiXSwibmFtZXMiOlsiVGltZXN0YW1wRGVmIiwibWFwIiwiRGVmZXJyZWQiLCJTaWduYWxzIiwibWFwXyIsInByb21pc2VNYXBfIiwibmFtZSIsInYiLCJwcm9taXNlU3RydWN0IiwicmVzdWx0IiwicHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0Iiwib3B0X3RpbWUiLCJ0aW1lIiwiRGF0ZSIsIm5vdyIsInVuZGVmaW5lZCIsImVycm9yIiwiY2F0Y2giXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFlBQVI7QUFDQSxTQUFRQyxHQUFSO0FBRUEsU0FBUUMsUUFBUjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQWFDLE9BQWI7QUFDRTtBQUNGO0FBQ0E7QUFDRSxxQkFBYztBQUFBOztBQUNaO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDSSxTQUFLQyxJQUFMLEdBQVlILEdBQUcsRUFBZjs7QUFFQTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDSSxTQUFLSSxXQUFMLEdBQW1CLElBQW5CO0FBQ0Q7O0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBN0JBO0FBQUE7QUFBQSxXQThCRSxhQUFJQyxJQUFKLEVBQVU7QUFDUixVQUFNQyxDQUFDLEdBQUcsS0FBS0gsSUFBTCxDQUFVRSxJQUFWLENBQVY7QUFDQSxhQUFPQyxDQUFDLElBQUksSUFBTCxHQUFZLElBQVosR0FBbUJBLENBQTFCO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBeENBO0FBQUE7QUFBQSxXQXlDRSxvQkFBV0QsSUFBWCxFQUFpQjtBQUFBOztBQUNmLFVBQUlFLGFBQWEsd0JBQUcsS0FBS0gsV0FBUixxQkFBRyxrQkFBbUJDLElBQW5CLENBQXBCOztB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S0FBS1AsV0FBTCxDQUFpQkMsSUFBakIsQ0FBUDtBQUNEO0FBQ0Y7QUF6SEg7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1RpbWVzdGFtcERlZn0gZnJvbSAnI2NvcmUvdHlwZXMvZGF0ZSc7XG5pbXBvcnQge21hcH0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0JztcblxuaW1wb3J0IHtEZWZlcnJlZH0gZnJvbSAnLi9wcm9taXNlJztcblxuLyoqXG4gKiBUaGlzIG9iamVjdCB0cmFjdHMgc2lnbmFscyBhbmQgYWxsb3dzIGJsb2NraW5nIHVudGlsIGEgc2lnbmFsIGhhcyBiZWVuXG4gKiByZWNlaXZlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIFNpZ25hbHMge1xuICAvKipcbiAgICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBTaWduYWxzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLyoqXG4gICAgICogQSBtYXBwaW5nIGZyb20gYSBzaWduYWwgbmFtZSB0byB0aGUgc2lnbmFsIHJlc3BvbnNlOiBlaXRoZXIgdGltZSBvclxuICAgICAqIGFuIGVycm9yLlxuICAgICAqIEBwcml2YXRlIEBjb25zdCB7IU9iamVjdDxzdHJpbmcsICghVGltZXN0YW1wRGVmfCFFcnJvcik+fVxuICAgICAqL1xuICAgIHRoaXMubWFwXyA9IG1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogQSBtYXBwaW5nIGZyb20gYSBzaWduYWwgbmFtZSB0byB0aGUgc2lnbmFsIHByb21pc2UsIHJlc29sdmUgYW5kIHJlamVjdC5cbiAgICAgKiBPbmx5IGFsbG9jYXRlZCB3aGVuIHByb21pc2UgaGFzIGJlZW4gcmVxdWVzdGVkLlxuICAgICAqIEBwcml2YXRlIHs/T2JqZWN0PHN0cmluZywge1xuICAgICAqICAgcHJvbWlzZTogIVByb21pc2UsXG4gICAgICogICByZXNvbHZlOiAoZnVuY3Rpb24oIVRpbWVzdGFtcERlZil8dW5kZWZpbmVkKSxcbiAgICAgKiAgIHJlamVjdDogKGZ1bmN0aW9uKCFFcnJvcil8dW5kZWZpbmVkKVxuICAgICAqIH0+fVxuICAgICAqL1xuICAgIHRoaXMucHJvbWlzZU1hcF8gPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGN1cnJlbnQga25vd24gdmFsdWUgb2YgdGhlIHNpZ25hbC4gSWYgc2lnbmFsIGlzIG5vdCB5ZXRcbiAgICogYXZhaWxhYmxlLCBgbnVsbGAgaXMgcmV0dXJuZWQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge251bWJlcnwhRXJyb3J8bnVsbH1cbiAgICovXG4gIGdldChuYW1lKSB7XG4gICAgY29uc3QgdiA9IHRoaXMubWFwX1tuYW1lXTtcbiAgICByZXR1cm4gdiA9PSBudWxsID8gbnVsbCA6IHY7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcHJvbWlzZSB0aGF0J3MgcmVzb2x2ZWQgd2hlbiB0aGUgc2lnbmFsIGlzIHRyaWdnZXJlZC4gVGhlXG4gICAqIHJlc29sdmVkIHZhbHVlIGlzIHRoZSB0aW1lIG9mIHRoZSBzaWduYWwuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4geyFQcm9taXNlPCFUaW1lc3RhbXBEZWY+fVxuICAgKi9cbiAgd2hlblNpZ25hbChuYW1lKSB7XG4gICAgbGV0IHByb21pc2VTdHJ1Y3QgPSB0aGlzLnByb21pc2VNYXBfPy5bbmFtZV07XG4gICAgaWYgKCFwcm9taXNlU3RydWN0KSB7XG4gICAgICBjb25zdCByZXN1bHQgPSB0aGlzLm1hcF9bbmFtZV07XG4gICAgICBpZiAocmVzdWx0ICE9IG51bGwpIHtcbiAgICAgICAgLy8gSW1tZWRpYXRlbHkgcmVzb2x2ZSBzaWduYWwuXG4gICAgICAgIGNvbnN0IHByb21pc2UgPVxuICAgICAgICAgIHR5cGVvZiByZXN1bHQgPT0gJ251bWJlcidcbiAgICAgICAgICAgID8gUHJvbWlzZS5yZXNvbHZlKHJlc3VsdClcbiAgICAgICAgICAgIDogUHJvbWlzZS5yZWplY3QocmVzdWx0KTtcbiAgICAgICAgcHJvbWlzZVN0cnVjdCA9IHtwcm9taXNlfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEFsbG9jYXRlIHRoZSBwcm9taXNlL3Jlc29sdmVyIGZvciB3aGVuIHRoZSBzaWduYWwgYXJyaXZlcyBpbiB0aGVcbiAgICAgICAgLy8gZnV0dXJlLlxuICAgICAgICBwcm9taXNlU3RydWN0ID0gbmV3IERlZmVycmVkKCk7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMucHJvbWlzZU1hcF8pIHtcbiAgICAgICAgdGhpcy5wcm9taXNlTWFwXyA9IG1hcCgpO1xuICAgICAgfVxuICAgICAgdGhpcy5wcm9taXNlTWFwX1tuYW1lXSA9IHByb21pc2VTdHJ1Y3Q7XG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlU3RydWN0LnByb21pc2U7XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlcnMgdGhlIHNpZ25hbCB3aXRoIHRoZSBzcGVjaWZpZWQgbmFtZSBvbiB0aGUgZWxlbWVudC4gVGhlIHRpbWUgaXNcbiAgICogb3B0aW9uYWw7IGlmIG5vdCBwcm92aWRlZCwgdGhlIGN1cnJlbnQgdGltZSBpcyB1c2VkLiBUaGUgYXNzb2NpYXRlZFxuICAgKiBwcm9taXNlIGlzIHJlc29sdmVkIHdpdGggdGhlIHJlc3VsdGluZyBUaW1lc3RhbXBEZWYuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7IVRpbWVzdGFtcERlZj19IG9wdF90aW1lXG4gICAqL1xuICBzaWduYWwobmFtZSwgb3B0X3RpbWUpIHtcbiAgICBpZiAodGhpcy5tYXBfW25hbWVdICE9IG51bGwpIHtcbiAgICAgIC8vIERvIG5vdCBkdXBsaWNhdGUgc2lnbmFscy5cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgdGltZSA9IG9wdF90aW1lID8/IERhdGUubm93KCk7XG4gICAgdGhpcy5tYXBfW25hbWVdID0gdGltZTtcbiAgICBjb25zdCBwcm9taXNlU3RydWN0ID0gdGhpcy5wcm9taXNlTWFwXz8uW25hbWVdO1xuICAgIGlmIChwcm9taXNlU3RydWN0Py5yZXNvbHZlKSB7XG4gICAgICBwcm9taXNlU3RydWN0LnJlc29sdmUodGltZSk7XG4gICAgICBwcm9taXNlU3RydWN0LnJlc29sdmUgPSB1bmRlZmluZWQ7XG4gICAgICBwcm9taXNlU3RydWN0LnJlamVjdCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVqZWN0cyB0aGUgc2lnbmFsLiBJbmRpY2F0ZXMgdGhhdCB0aGUgc2lnbmFsIHdpbGwgbmV2ZXIgc3VjY2VlZC4gVGhlXG4gICAqIGFzc29jaWF0ZWQgc2lnbmFsIGlzIHJlamVjdGVkLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0geyFFcnJvcn0gZXJyb3JcbiAgICovXG4gIHJlamVjdFNpZ25hbChuYW1lLCBlcnJvcikge1xuICAgIGlmICh0aGlzLm1hcF9bbmFtZV0gIT0gbnVsbCkge1xuICAgICAgLy8gRG8gbm90IGR1cGxpY2F0ZSBzaWduYWxzLlxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLm1hcF9bbmFtZV0gPSBlcnJvcjtcbiAgICBjb25zdCBwcm9taXNlU3RydWN0ID0gdGhpcy5wcm9taXNlTWFwXz8uW25hbWVdO1xuICAgIGlmIChwcm9taXNlU3RydWN0Py5yZWplY3QpIHtcbiAgICAgIHByb21pc2VTdHJ1Y3QucmVqZWN0KGVycm9yKTtcbiAgICAgIHByb21pc2VTdHJ1Y3QucHJvbWlzZS5jYXRjaCgoKSA9PiB7fSk7XG4gICAgICBwcm9taXNlU3RydWN0LnJlc29sdmUgPSB1bmRlZmluZWQ7XG4gICAgICBwcm9taXNlU3RydWN0LnJlamVjdCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVzZXRzIGFsbCBzaWduYWxzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKi9cbiAgcmVzZXQobmFtZSkge1xuICAgIGlmICh0aGlzLm1hcF9bbmFtZV0pIHtcbiAgICAgIGRlbGV0ZSB0aGlzLm1hcF9bbmFtZV07XG4gICAgfVxuICAgIC8vIFJlc2V0IHByb21pc2UgaXQgaGFzIGFscmVhZHkgYmVlbiByZXNvbHZlZC5cbiAgICBjb25zdCBwcm9taXNlU3RydWN0ID0gdGhpcy5wcm9taXNlTWFwXz8uW25hbWVdO1xuICAgIGlmIChwcm9taXNlU3RydWN0ICYmICFwcm9taXNlU3RydWN0LnJlc29sdmUpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLnByb21pc2VNYXBfW25hbWVdO1xuICAgIH1cbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/src/core/data-structures/signals.js