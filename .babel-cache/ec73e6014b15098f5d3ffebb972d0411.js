function _createForOfIteratorHelper(o, allowArrayLike) {var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];if (!it) {if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || (allowArrayLike && o && typeof o.length === "number")) {if (it) o = it;var i = 0;var F = function F() {};return { s: F, n: function n() {if (i >= o.length) return { done: true };return { done: false, value: o[i++] };}, e: function e(_e) {throw _e;}, f: F };}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}var normalCompletion = true,didErr = false,err;return { s: function s() {it = it.call(o);}, n: function n() {var step = it.next();normalCompletion = step.done;return step;}, e: function e(_e2) {didErr = true;err = _e2;}, f: function f() {try {if (!normalCompletion && it.return != null) it.return();} finally {if (didErr) throw err;}} };}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { removeItem } from "../types/array";

/**
 * This class helps to manage observers. Observers can be added, removed or
 * fired through and instance of this class.
 * @template TYPE
 */
export var Observable = /*#__PURE__*/function () {
  /**
   * Creates an instance of Observable.
   */
  function Observable() {_classCallCheck(this, Observable);
    /** @type {?Array<function(TYPE)>} */
    this.handlers_ = null;
  }

  /**
   * Adds the observer to this instance.
   * @param {function(TYPE)} handler Observer's handler.
   * @return {!UnlistenDef}
   */_createClass(Observable, [{ key: "add", value:
    function add(handler) {var _this = this;
      if (!this.handlers_) {
        this.handlers_ = [];
      }
      this.handlers_.push(handler);
      return function () {
        _this.remove(handler);
      };
    }

    /**
     * Removes the observer from this instance.
     * @param {function(TYPE)} handler Observer's instance.
     */ }, { key: "remove", value:
    function remove(handler) {
      if (!this.handlers_) {
        return;
      }
      removeItem(this.handlers_, handler);
    }

    /**
     * Removes all observers.
     */ }, { key: "removeAll", value:
    function removeAll() {
      if (!this.handlers_) {
        return;
      }
      this.handlers_.length = 0;
    }

    /**
     * Fires an event. All observers are called.
     * @param {TYPE=} opt_event
     */ }, { key: "fire", value:
    function fire(opt_event) {
      if (!this.handlers_) {
        return;
      }var _iterator = _createForOfIteratorHelper(
      this.handlers_),_step;try {for (_iterator.s(); !(_step = _iterator.n()).done;) {var handler = _step.value;
          handler(opt_event);
        }} catch (err) {_iterator.e(err);} finally {_iterator.f();}
    }

    /**
     * Returns number of handlers. Mostly needed for tests.
     * @return {number}
     */ }, { key: "getHandlerCount", value:
    function getHandlerCount() {var _this$handlers_$lengt, _this$handlers_;
      return (_this$handlers_$lengt = ((_this$handlers_ = this.handlers_) === null || _this$handlers_ === void 0) ? (void 0) : _this$handlers_.length) !== null && _this$handlers_$lengt !== void 0 ? _this$handlers_$lengt : 0;
    } }]);return Observable;}();
// /Users/mszylkowski/src/amphtml/src/core/data-structures/observable.js