function _createForOfIteratorHelper(o, allowArrayLike) {var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];if (!it) {if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || (allowArrayLike && o && typeof o.length === "number")) {if (it) o = it;var i = 0;var F = function F() {};return { s: F, n: function n() {if (i >= o.length) return { done: true };return { done: false, value: o[i++] };}, e: function e(_e) {throw _e;}, f: F };}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}var normalCompletion = true,didErr = false,err;return { s: function s() {it = it.call(o);}, n: function n() {var step = it.next();normalCompletion = step.done;return step;}, e: function e(_e2) {didErr = true;err = _e2;}, f: function f() {try {if (!normalCompletion && it.return != null) it.return();} finally {if (didErr) throw err;}} };}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;} /**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
 * Some exceptions (DOMException, namely) have read-only message.
 * @param {!Error} error
 * @return {!Error};
 */
export function duplicateErrorIfNecessary(error) {
  var messageProperty = Object.getOwnPropertyDescriptor(error, 'message');
  if ((messageProperty !== null && messageProperty !== void 0) && messageProperty.writable) {
    return error;
  }

  var message = error.message,stack = error.stack;
  var e = new Error(message);
  // Copy all the extraneous things we attach.
  for (var prop in error) {
    e[prop] = error[prop];
  }
  // Ensure these are copied.
  e.stack = stack;
  return e;
}

/**
 * @param {...*} var_args
 * @return {!Error}
 * @visibleForTesting
 */
export function createErrorVargs(var_args) {
  var error = null;
  var message = '';var _iterator = _createForOfIteratorHelper(
  arguments),_step;try {for (_iterator.s(); !(_step = _iterator.n()).done;) {var arg = _step.value;
      if (arg instanceof Error && !error) {
        error = duplicateErrorIfNecessary(arg);
      } else {
        if (message) {
          message += ' ';
        }
        message += arg;
      }
    }} catch (err) {_iterator.e(err);} finally {_iterator.f();}

  if (!error) {
    error = new Error(message);
  } else if (message) {
    error.message = message + ': ' + error.message;
  }
  return error;
}

/**
 * Rethrows the error without terminating the current context. This preserves
 * whether the original error designation is a user error or a dev error.
 * @param {...*} var_args
 */
export function rethrowAsync(var_args) {
  var error = createErrorVargs.apply(null, arguments);
  setTimeout(function () {var _self$__AMP_REPORT_ER, _self;
    // __AMP_REPORT_ERROR is installed globally per window in the entry point.
    // It may not exist for Bento components without the runtime.
    ((_self$__AMP_REPORT_ER = (_self = self).__AMP_REPORT_ERROR) === null || _self$__AMP_REPORT_ER === void 0) ? (void 0) : _self$__AMP_REPORT_ER.call(_self, error);
    throw error;
  });
}

/**
 * Executes the provided callback in a try/catch and rethrows any errors
 * asynchronously.
 *
 * @param {function(...*):T} callback
 * @param {...*} args
 * @return {T}
 * @template T
 */
export function tryCallback(callback) {
  try {for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {args[_key - 1] = arguments[_key];}
    return callback.apply(null, args);
  } catch (e) {
    rethrowAsync(e);
  }
}
// /Users/mszylkowski/src/amphtml/src/core/error/index.js