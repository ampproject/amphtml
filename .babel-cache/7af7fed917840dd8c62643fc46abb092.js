function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

/** Polyfill for the public AbortController. */
var AbortController = /*#__PURE__*/function () {
  /** Constructor. */
  function AbortController() {
    _classCallCheck(this, AbortController);

    /** @const {!AbortSignal} */
    this.signal_ = new AbortSignal();
  }

  /** Triggers an abort signal. */
  _createClass(AbortController, [{
    key: "abort",
    value: function abort() {
      if (this.signal_.isAborted_) {
        // Already aborted.
        return;
      }

      this.signal_.isAborted_ = true;

      if (this.signal_.onabort_) {
        var event =
        /** @type {!Event} */
        {
          'type': 'abort',
          'bubbles': false,
          'cancelable': false,
          'target': this.signal_,
          'currentTarget': this.signal_
        };
        this.signal_.onabort_(event);
      }
    }
    /** @return {!AbortSignal} */

  }, {
    key: "signal",
    get: function get() {
      return this.signal_;
    }
  }]);

  return AbortController;
}();

/** Polyfill for the public AbortSignal. */
var AbortSignal = /*#__PURE__*/function () {
  /** */
  function AbortSignal() {
    _classCallCheck(this, AbortSignal);

    /** @private {boolean} */
    this.isAborted_ = false;

    /** @private {?function(!Event)} */
    this.onabort_ = null;
  }

  /** @return {boolean} */
  _createClass(AbortSignal, [{
    key: "aborted",
    get: function get() {
      return this.isAborted_;
    }
    /** @return {?function(!Event)} */

  }, {
    key: "onabort",
    get: function get() {
      return this.onabort_;
    }
    /** @param {?function(!Event)} value */
    ,
    set: function set(value) {
      this.onabort_ = value;
    }
  }]);

  return AbortSignal;
}();

/**
 * Sets the AbortController and AbortSignal polyfills if not defined.
 * @param {!Window} win
 */
export function install(win) {
  if (win.AbortController) {
    return;
  }

  Object.defineProperty(win, 'AbortController', {
    configurable: true,
    enumerable: false,
    writable: true,
    value: AbortController
  });
  Object.defineProperty(win, 'AbortSignal', {
    configurable: true,
    enumerable: false,
    writable: true,
    value: AbortSignal
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFib3J0LWNvbnRyb2xsZXIuanMiXSwibmFtZXMiOlsiQWJvcnRDb250cm9sbGVyIiwic2lnbmFsXyIsIkFib3J0U2lnbmFsIiwiaXNBYm9ydGVkXyIsIm9uYWJvcnRfIiwiZXZlbnQiLCJ2YWx1ZSIsImluc3RhbGwiLCJ3aW4iLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImNvbmZpZ3VyYWJsZSIsImVudW1lcmFibGUiLCJ3cml0YWJsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0lBQ01BLGU7QUFDSjtBQUNBLDZCQUFjO0FBQUE7O0FBQ1o7QUFDQSxTQUFLQyxPQUFMLEdBQWUsSUFBSUMsV0FBSixFQUFmO0FBQ0Q7O0FBRUQ7OztXQUNBLGlCQUFRO0FBQ04sVUFBSSxLQUFLRCxPQUFMLENBQWFFLFVBQWpCLEVBQTZCO0FBQzNCO0FBQ0E7QUFDRDs7QUFDRCxXQUFLRixPQUFMLENBQWFFLFVBQWIsR0FBMEIsSUFBMUI7O0FBQ0EsVUFBSSxLQUFLRixPQUFMLENBQWFHLFFBQWpCLEVBQTJCO0FBQ3pCLFlBQU1DLEtBQUs7QUFBRztBQUF1QjtBQUNuQyxrQkFBUSxPQUQyQjtBQUVuQyxxQkFBVyxLQUZ3QjtBQUduQyx3QkFBYyxLQUhxQjtBQUluQyxvQkFBVSxLQUFLSixPQUpvQjtBQUtuQywyQkFBaUIsS0FBS0E7QUFMYSxTQUFyQztBQU9BLGFBQUtBLE9BQUwsQ0FBYUcsUUFBYixDQUFzQkMsS0FBdEI7QUFDRDtBQUNGO0FBRUQ7Ozs7U0FDQSxlQUFhO0FBQ1gsYUFBTyxLQUFLSixPQUFaO0FBQ0Q7Ozs7OztBQUdIO0lBQ01DLFc7QUFDSjtBQUNBLHlCQUFjO0FBQUE7O0FBQ1o7QUFDQSxTQUFLQyxVQUFMLEdBQWtCLEtBQWxCOztBQUNBO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQixJQUFoQjtBQUNEOztBQUVEOzs7U0FDQSxlQUFjO0FBQ1osYUFBTyxLQUFLRCxVQUFaO0FBQ0Q7QUFFRDs7OztTQUNBLGVBQWM7QUFDWixhQUFPLEtBQUtDLFFBQVo7QUFDRDtBQUVEOztTQUNBLGFBQVlFLEtBQVosRUFBbUI7QUFDakIsV0FBS0YsUUFBTCxHQUFnQkUsS0FBaEI7QUFDRDs7Ozs7O0FBR0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLE9BQVQsQ0FBaUJDLEdBQWpCLEVBQXNCO0FBQzNCLE1BQUlBLEdBQUcsQ0FBQ1IsZUFBUixFQUF5QjtBQUN2QjtBQUNEOztBQUNEUyxFQUFBQSxNQUFNLENBQUNDLGNBQVAsQ0FBc0JGLEdBQXRCLEVBQTJCLGlCQUEzQixFQUE4QztBQUM1Q0csSUFBQUEsWUFBWSxFQUFFLElBRDhCO0FBRTVDQyxJQUFBQSxVQUFVLEVBQUUsS0FGZ0M7QUFHNUNDLElBQUFBLFFBQVEsRUFBRSxJQUhrQztBQUk1Q1AsSUFBQUEsS0FBSyxFQUFFTjtBQUpxQyxHQUE5QztBQU1BUyxFQUFBQSxNQUFNLENBQUNDLGNBQVAsQ0FBc0JGLEdBQXRCLEVBQTJCLGFBQTNCLEVBQTBDO0FBQ3hDRyxJQUFBQSxZQUFZLEVBQUUsSUFEMEI7QUFFeENDLElBQUFBLFVBQVUsRUFBRSxLQUY0QjtBQUd4Q0MsSUFBQUEsUUFBUSxFQUFFLElBSDhCO0FBSXhDUCxJQUFBQSxLQUFLLEVBQUVKO0FBSmlDLEdBQTFDO0FBTUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDIwIFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqIFBvbHlmaWxsIGZvciB0aGUgcHVibGljIEFib3J0Q29udHJvbGxlci4gKi9cbmNsYXNzIEFib3J0Q29udHJvbGxlciB7XG4gIC8qKiBDb25zdHJ1Y3Rvci4gKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLyoqIEBjb25zdCB7IUFib3J0U2lnbmFsfSAqL1xuICAgIHRoaXMuc2lnbmFsXyA9IG5ldyBBYm9ydFNpZ25hbCgpO1xuICB9XG5cbiAgLyoqIFRyaWdnZXJzIGFuIGFib3J0IHNpZ25hbC4gKi9cbiAgYWJvcnQoKSB7XG4gICAgaWYgKHRoaXMuc2lnbmFsXy5pc0Fib3J0ZWRfKSB7XG4gICAgICAvLyBBbHJlYWR5IGFib3J0ZWQuXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuc2lnbmFsXy5pc0Fib3J0ZWRfID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5zaWduYWxfLm9uYWJvcnRfKSB7XG4gICAgICBjb25zdCBldmVudCA9IC8qKiBAdHlwZSB7IUV2ZW50fSAqLyAoe1xuICAgICAgICAndHlwZSc6ICdhYm9ydCcsXG4gICAgICAgICdidWJibGVzJzogZmFsc2UsXG4gICAgICAgICdjYW5jZWxhYmxlJzogZmFsc2UsXG4gICAgICAgICd0YXJnZXQnOiB0aGlzLnNpZ25hbF8sXG4gICAgICAgICdjdXJyZW50VGFyZ2V0JzogdGhpcy5zaWduYWxfLFxuICAgICAgfSk7XG4gICAgICB0aGlzLnNpZ25hbF8ub25hYm9ydF8oZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAcmV0dXJuIHshQWJvcnRTaWduYWx9ICovXG4gIGdldCBzaWduYWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2lnbmFsXztcbiAgfVxufVxuXG4vKiogUG9seWZpbGwgZm9yIHRoZSBwdWJsaWMgQWJvcnRTaWduYWwuICovXG5jbGFzcyBBYm9ydFNpZ25hbCB7XG4gIC8qKiAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5pc0Fib3J0ZWRfID0gZmFsc2U7XG4gICAgLyoqIEBwcml2YXRlIHs/ZnVuY3Rpb24oIUV2ZW50KX0gKi9cbiAgICB0aGlzLm9uYWJvcnRfID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBAcmV0dXJuIHtib29sZWFufSAqL1xuICBnZXQgYWJvcnRlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5pc0Fib3J0ZWRfO1xuICB9XG5cbiAgLyoqIEByZXR1cm4gez9mdW5jdGlvbighRXZlbnQpfSAqL1xuICBnZXQgb25hYm9ydCgpIHtcbiAgICByZXR1cm4gdGhpcy5vbmFib3J0XztcbiAgfVxuXG4gIC8qKiBAcGFyYW0gez9mdW5jdGlvbighRXZlbnQpfSB2YWx1ZSAqL1xuICBzZXQgb25hYm9ydCh2YWx1ZSkge1xuICAgIHRoaXMub25hYm9ydF8gPSB2YWx1ZTtcbiAgfVxufVxuXG4vKipcbiAqIFNldHMgdGhlIEFib3J0Q29udHJvbGxlciBhbmQgQWJvcnRTaWduYWwgcG9seWZpbGxzIGlmIG5vdCBkZWZpbmVkLlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGwod2luKSB7XG4gIGlmICh3aW4uQWJvcnRDb250cm9sbGVyKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW4sICdBYm9ydENvbnRyb2xsZXInLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIHZhbHVlOiBBYm9ydENvbnRyb2xsZXIsXG4gIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luLCAnQWJvcnRTaWduYWwnLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIHZhbHVlOiBBYm9ydFNpZ25hbCxcbiAgfSk7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/polyfills/abort-controller.js