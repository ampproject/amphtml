function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
var resolved;

/**
 * Returns a cached resolved promise.
 * Babel converts direct calls to Promise.resolve() (with no arguments) into
 * calls to this.
 *
 * @return {!Promise<undefined>}
 */
export function resolvedPromise() {
  if (resolved) {
    return resolved;
  }

  // It's important that we call with `undefined` here, to prevent a transform
  // recursion. If we didn't pass an arg, then the transformer would replace
  // this callsite with a call to `resolvedPromise()`.
  resolved = Promise.resolve(undefined);
  return resolved;
}

/**
 * Returns a Deferred struct, which holds a pending promise and its associated
 * resolve and reject functions.
 *
 * This is preferred instead of creating a Promise instance to extract the
 * resolve/reject functions yourself:
 *
 * ```
 * // Avoid doing
 * let resolve;
 * const promise = new Promise(res => {
 *   resolve = res;
 * });
 *
 * // Good
 * const deferred = new Deferred();
 * const { promise, resolve } = deferred;
 * ```
 *
 * @template T
 */
export var Deferred =
/** Constructor. */
function Deferred() {
  var _this = this;

  _classCallCheck(this, Deferred);

  /** @const {!Promise<T>} */
  this.promise = new
  /*OK*/
  Promise(function (res, rej) {
    /** @const {function(T=)} */
    _this.resolve = res;

    /** @const {function(*=)} */
    _this.reject = rej;
  });
};

/**
 * Creates a promise resolved to the return value of fn.
 * If fn sync throws, it will cause the promise to reject.
 *
 * @param {function():T} fn
 * @return {!Promise<T>}
 * @template T
 */
export function tryResolve(fn) {
  return new Promise(function (resolve) {
    resolve(fn());
  });
}

/**
 * Resolves with the result of the last promise added.
 * @implements {IThenable}
 */
export var LastAddedResolver = /*#__PURE__*/function () {
  /**
   * @param {!Array<!IThenable>=} opt_promises
   */
  function LastAddedResolver(opt_promises) {
    _classCallCheck(this, LastAddedResolver);

    /** @private @const {!Deferred} */
    this.deferred_ = new Deferred();

    /** @private */
    this.count_ = 0;

    if (opt_promises) {
      for (var _iterator = _createForOfIteratorHelperLoose(opt_promises), _step; !(_step = _iterator()).done;) {
        var promise = _step.value;
        this.add(promise);
      }
    }
  }

  /**
   * Add a promise to possibly be resolved.
   * @param {!IThenable} promise
   * @return {!Promise}
   */
  _createClass(LastAddedResolver, [{
    key: "add",
    value: function add(promise) {
      var _this2 = this;

      var countAtAdd = ++this.count_;
      promise.then(function (result) {
        if (_this2.count_ === countAtAdd) {
          _this2.deferred_.resolve(result);
        }
      }, function (error) {
        // Don't follow behavior of Promise.all and Promise.race error so that
        // this will only reject when most recently added promise fails.
        if (_this2.count_ === countAtAdd) {
          _this2.deferred_.reject(error);
        }
      });
      return this.deferred_.promise;
    }
    /** @override */

  }, {
    key: "then",
    value: function then(opt_resolve, opt_reject) {
      return this.deferred_.promise.then(opt_resolve, opt_reject);
    }
  }]);

  return LastAddedResolver;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByb21pc2UuanMiXSwibmFtZXMiOlsicmVzb2x2ZWQiLCJyZXNvbHZlZFByb21pc2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsInVuZGVmaW5lZCIsIkRlZmVycmVkIiwicHJvbWlzZSIsInJlcyIsInJlaiIsInJlamVjdCIsInRyeVJlc29sdmUiLCJmbiIsIkxhc3RBZGRlZFJlc29sdmVyIiwib3B0X3Byb21pc2VzIiwiZGVmZXJyZWRfIiwiY291bnRfIiwiYWRkIiwiY291bnRBdEFkZCIsInRoZW4iLCJyZXN1bHQiLCJlcnJvciIsIm9wdF9yZXNvbHZlIiwib3B0X3JlamVjdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsSUFBSUEsUUFBSjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0MsZUFBVCxHQUEyQjtBQUNoQyxNQUFJRCxRQUFKLEVBQWM7QUFDWixXQUFPQSxRQUFQO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0FBLEVBQUFBLFFBQVEsR0FBR0UsT0FBTyxDQUFDQyxPQUFSLENBQWdCQyxTQUFoQixDQUFYO0FBQ0EsU0FBT0osUUFBUDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQWFLLFFBQWI7QUFDRTtBQUNBLG9CQUFjO0FBQUE7O0FBQUE7O0FBQ1o7QUFDQSxPQUFLQyxPQUFMLEdBQWU7QUFBSTtBQUFPSixFQUFBQSxPQUFYLENBQW1CLFVBQUNLLEdBQUQsRUFBTUMsR0FBTixFQUFjO0FBQzlDO0FBQ0EsSUFBQSxLQUFJLENBQUNMLE9BQUwsR0FBZUksR0FBZjs7QUFDQTtBQUNBLElBQUEsS0FBSSxDQUFDRSxNQUFMLEdBQWNELEdBQWQ7QUFDRCxHQUxjLENBQWY7QUFNRCxDQVZIOztBQWFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNFLFVBQVQsQ0FBb0JDLEVBQXBCLEVBQXdCO0FBQzdCLFNBQU8sSUFBSVQsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBYTtBQUM5QkEsSUFBQUEsT0FBTyxDQUFDUSxFQUFFLEVBQUgsQ0FBUDtBQUNELEdBRk0sQ0FBUDtBQUdEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBYUMsaUJBQWI7QUFDRTtBQUNGO0FBQ0E7QUFDRSw2QkFBWUMsWUFBWixFQUEwQjtBQUFBOztBQUN4QjtBQUNBLFNBQUtDLFNBQUwsR0FBaUIsSUFBSVQsUUFBSixFQUFqQjs7QUFFQTtBQUNBLFNBQUtVLE1BQUwsR0FBYyxDQUFkOztBQUVBLFFBQUlGLFlBQUosRUFBa0I7QUFDaEIsMkRBQXNCQSxZQUF0Qix3Q0FBb0M7QUFBQSxZQUF6QlAsT0FBeUI7QUFDbEMsYUFBS1UsR0FBTCxDQUFTVixPQUFUO0FBQ0Q7QUFDRjtBQUNGOztBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUF0QkE7QUFBQTtBQUFBLFdBdUJFLGFBQUlBLE9BQUosRUFBYTtBQUFBOztBQUNYLFVBQU1XLFVBQVUsR0FBRyxFQUFFLEtBQUtGLE1BQTFCO0FBQ0FULE1BQUFBLE9BQU8sQ0FBQ1ksSUFBUixDQUNFLFVBQUNDLE1BQUQsRUFBWTtBQUNWLFlBQUksTUFBSSxDQUFDSixNQUFMLEtBQWdCRSxVQUFwQixFQUFnQztBQUM5QixVQUFBLE1BQUksQ0FBQ0gsU0FBTCxDQUFlWCxPQUFmLENBQXVCZ0IsTUFBdkI7QUFDRDtBQUNGLE9BTEgsRUFNRSxVQUFDQyxLQUFELEVBQVc7QUFDVDtBQUNBO0FBQ0EsWUFBSSxNQUFJLENBQUNMLE1BQUwsS0FBZ0JFLFVBQXBCLEVBQWdDO0FBQzlCLFVBQUEsTUFBSSxDQUFDSCxTQUFMLENBQWVMLE1BQWYsQ0FBc0JXLEtBQXRCO0FBQ0Q7QUFDRixPQVpIO0FBY0EsYUFBTyxLQUFLTixTQUFMLENBQWVSLE9BQXRCO0FBQ0Q7QUFFRDs7QUExQ0Y7QUFBQTtBQUFBLFdBMkNFLGNBQUtlLFdBQUwsRUFBa0JDLFVBQWxCLEVBQThCO0FBQzVCLGFBQU8sS0FBS1IsU0FBTCxDQUFlUixPQUFmLENBQXVCWSxJQUF2QixDQUE0QkcsV0FBNUIsRUFBeUNDLFVBQXpDLENBQVA7QUFDRDtBQTdDSDs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNiBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmxldCByZXNvbHZlZDtcblxuLyoqXG4gKiBSZXR1cm5zIGEgY2FjaGVkIHJlc29sdmVkIHByb21pc2UuXG4gKiBCYWJlbCBjb252ZXJ0cyBkaXJlY3QgY2FsbHMgdG8gUHJvbWlzZS5yZXNvbHZlKCkgKHdpdGggbm8gYXJndW1lbnRzKSBpbnRvXG4gKiBjYWxscyB0byB0aGlzLlxuICpcbiAqIEByZXR1cm4geyFQcm9taXNlPHVuZGVmaW5lZD59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlZFByb21pc2UoKSB7XG4gIGlmIChyZXNvbHZlZCkge1xuICAgIHJldHVybiByZXNvbHZlZDtcbiAgfVxuXG4gIC8vIEl0J3MgaW1wb3J0YW50IHRoYXQgd2UgY2FsbCB3aXRoIGB1bmRlZmluZWRgIGhlcmUsIHRvIHByZXZlbnQgYSB0cmFuc2Zvcm1cbiAgLy8gcmVjdXJzaW9uLiBJZiB3ZSBkaWRuJ3QgcGFzcyBhbiBhcmcsIHRoZW4gdGhlIHRyYW5zZm9ybWVyIHdvdWxkIHJlcGxhY2VcbiAgLy8gdGhpcyBjYWxsc2l0ZSB3aXRoIGEgY2FsbCB0byBgcmVzb2x2ZWRQcm9taXNlKClgLlxuICByZXNvbHZlZCA9IFByb21pc2UucmVzb2x2ZSh1bmRlZmluZWQpO1xuICByZXR1cm4gcmVzb2x2ZWQ7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIERlZmVycmVkIHN0cnVjdCwgd2hpY2ggaG9sZHMgYSBwZW5kaW5nIHByb21pc2UgYW5kIGl0cyBhc3NvY2lhdGVkXG4gKiByZXNvbHZlIGFuZCByZWplY3QgZnVuY3Rpb25zLlxuICpcbiAqIFRoaXMgaXMgcHJlZmVycmVkIGluc3RlYWQgb2YgY3JlYXRpbmcgYSBQcm9taXNlIGluc3RhbmNlIHRvIGV4dHJhY3QgdGhlXG4gKiByZXNvbHZlL3JlamVjdCBmdW5jdGlvbnMgeW91cnNlbGY6XG4gKlxuICogYGBgXG4gKiAvLyBBdm9pZCBkb2luZ1xuICogbGV0IHJlc29sdmU7XG4gKiBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UocmVzID0+IHtcbiAqICAgcmVzb2x2ZSA9IHJlcztcbiAqIH0pO1xuICpcbiAqIC8vIEdvb2RcbiAqIGNvbnN0IGRlZmVycmVkID0gbmV3IERlZmVycmVkKCk7XG4gKiBjb25zdCB7IHByb21pc2UsIHJlc29sdmUgfSA9IGRlZmVycmVkO1xuICogYGBgXG4gKlxuICogQHRlbXBsYXRlIFRcbiAqL1xuZXhwb3J0IGNsYXNzIERlZmVycmVkIHtcbiAgLyoqIENvbnN0cnVjdG9yLiAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICAvKiogQGNvbnN0IHshUHJvbWlzZTxUPn0gKi9cbiAgICB0aGlzLnByb21pc2UgPSBuZXcgLypPSyovIFByb21pc2UoKHJlcywgcmVqKSA9PiB7XG4gICAgICAvKiogQGNvbnN0IHtmdW5jdGlvbihUPSl9ICovXG4gICAgICB0aGlzLnJlc29sdmUgPSByZXM7XG4gICAgICAvKiogQGNvbnN0IHtmdW5jdGlvbigqPSl9ICovXG4gICAgICB0aGlzLnJlamVjdCA9IHJlajtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBwcm9taXNlIHJlc29sdmVkIHRvIHRoZSByZXR1cm4gdmFsdWUgb2YgZm4uXG4gKiBJZiBmbiBzeW5jIHRocm93cywgaXQgd2lsbCBjYXVzZSB0aGUgcHJvbWlzZSB0byByZWplY3QuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbigpOlR9IGZuXG4gKiBAcmV0dXJuIHshUHJvbWlzZTxUPn1cbiAqIEB0ZW1wbGF0ZSBUXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cnlSZXNvbHZlKGZuKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIHJlc29sdmUoZm4oKSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFJlc29sdmVzIHdpdGggdGhlIHJlc3VsdCBvZiB0aGUgbGFzdCBwcm9taXNlIGFkZGVkLlxuICogQGltcGxlbWVudHMge0lUaGVuYWJsZX1cbiAqL1xuZXhwb3J0IGNsYXNzIExhc3RBZGRlZFJlc29sdmVyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IUFycmF5PCFJVGhlbmFibGU+PX0gb3B0X3Byb21pc2VzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihvcHRfcHJvbWlzZXMpIHtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshRGVmZXJyZWR9ICovXG4gICAgdGhpcy5kZWZlcnJlZF8gPSBuZXcgRGVmZXJyZWQoKTtcblxuICAgIC8qKiBAcHJpdmF0ZSAqL1xuICAgIHRoaXMuY291bnRfID0gMDtcblxuICAgIGlmIChvcHRfcHJvbWlzZXMpIHtcbiAgICAgIGZvciAoY29uc3QgcHJvbWlzZSBvZiBvcHRfcHJvbWlzZXMpIHtcbiAgICAgICAgdGhpcy5hZGQocHJvbWlzZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHByb21pc2UgdG8gcG9zc2libHkgYmUgcmVzb2x2ZWQuXG4gICAqIEBwYXJhbSB7IUlUaGVuYWJsZX0gcHJvbWlzZVxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIGFkZChwcm9taXNlKSB7XG4gICAgY29uc3QgY291bnRBdEFkZCA9ICsrdGhpcy5jb3VudF87XG4gICAgcHJvbWlzZS50aGVuKFxuICAgICAgKHJlc3VsdCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5jb3VudF8gPT09IGNvdW50QXRBZGQpIHtcbiAgICAgICAgICB0aGlzLmRlZmVycmVkXy5yZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAoZXJyb3IpID0+IHtcbiAgICAgICAgLy8gRG9uJ3QgZm9sbG93IGJlaGF2aW9yIG9mIFByb21pc2UuYWxsIGFuZCBQcm9taXNlLnJhY2UgZXJyb3Igc28gdGhhdFxuICAgICAgICAvLyB0aGlzIHdpbGwgb25seSByZWplY3Qgd2hlbiBtb3N0IHJlY2VudGx5IGFkZGVkIHByb21pc2UgZmFpbHMuXG4gICAgICAgIGlmICh0aGlzLmNvdW50XyA9PT0gY291bnRBdEFkZCkge1xuICAgICAgICAgIHRoaXMuZGVmZXJyZWRfLnJlamVjdChlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuICAgIHJldHVybiB0aGlzLmRlZmVycmVkXy5wcm9taXNlO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICB0aGVuKG9wdF9yZXNvbHZlLCBvcHRfcmVqZWN0KSB7XG4gICAgcmV0dXJuIHRoaXMuZGVmZXJyZWRfLnByb21pc2UudGhlbihvcHRfcmVzb2x2ZSwgb3B0X3JlamVjdCk7XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/core/data-structures/promise.js