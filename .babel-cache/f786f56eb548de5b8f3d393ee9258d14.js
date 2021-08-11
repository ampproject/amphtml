function _createForOfIteratorHelper(o, allowArrayLike) {var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];if (!it) {if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || (allowArrayLike && o && typeof o.length === "number")) {if (it) o = it;var i = 0;var F = function F() {};return { s: F, n: function n() {if (i >= o.length) return { done: true };return { done: false, value: o[i++] };}, e: function e(_e) {throw _e;}, f: F };}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}var normalCompletion = true,didErr = false,err;return { s: function s() {it = it.call(o);}, n: function n() {var step = it.next();normalCompletion = step.done;return step;}, e: function e(_e2) {didErr = true;err = _e2;}, f: function f() {try {if (!normalCompletion && it.return != null) it.return();} finally {if (didErr) throw err;}} };}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}} /**
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
function Deferred() {var _this = this;_classCallCheck(this, Deferred);
  /** @const {!Promise<T>} */
  this.promise = new /*OK*/Promise(function (res, rej) {
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
  function LastAddedResolver(opt_promises) {_classCallCheck(this, LastAddedResolver);
    /** @private @const {!Deferred} */
    this.deferred_ = new Deferred();

    /** @private */
    this.count_ = 0;

    if (opt_promises) {var _iterator = _createForOfIteratorHelper(
      opt_promises),_step;try {for (_iterator.s(); !(_step = _iterator.n()).done;) {var promise = _step.value;
          this.add(promise);
        }} catch (err) {_iterator.e(err);} finally {_iterator.f();}
    }
  }

  /**
   * Add a promise to possibly be resolved.
   * @param {!IThenable} promise
   * @return {!Promise}
   */_createClass(LastAddedResolver, [{ key: "add", value:
    function add(promise) {var _this2 = this;
      var countAtAdd = ++this.count_;
      promise.then(
      function (result) {
        if (_this2.count_ === countAtAdd) {
          _this2.deferred_.resolve(result);
        }
      },
      function (error) {
        // Don't follow behavior of Promise.all and Promise.race error so that
        // this will only reject when most recently added promise fails.
        if (_this2.count_ === countAtAdd) {
          _this2.deferred_.reject(error);
        }
      });

      return this.deferred_.promise;
    }

    /** @override */ }, { key: "then", value:
    function then(opt_resolve, opt_reject) {
      return this.deferred_.promise.then(opt_resolve, opt_reject);
    } }]);return LastAddedResolver;}();
// /Users/mszylkowski/src/amphtml/src/core/data-structures/promise.js