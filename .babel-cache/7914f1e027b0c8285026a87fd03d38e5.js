import { resolvedPromise as _resolvedPromise } from "./../../core/data-structures/promise";function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _createForOfIteratorHelper(o, allowArrayLike) {var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];if (!it) {if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || (allowArrayLike && o && typeof o.length === "number")) {if (it) o = it;var i = 0;var F = function F() {};return { s: F, n: function n() {if (i >= o.length) return { done: true };return { done: false, value: o[i++] };}, e: function e(_e) {throw _e;}, f: F };}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}var normalCompletion = true,didErr = false,err;return { s: function s() {it = it.call(o);}, n: function n() {var step = it.next();normalCompletion = step.done;return step;}, e: function e(_e2) {didErr = true;err = _e2;}, f: function f() {try {if (!normalCompletion && it.return != null) it.return();} finally {if (didErr) throw err;}} };}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;} /**
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

/**
 * @fileoverview
 * See https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
 *
 * This is the stub to support ResizeObserver. It's installed from
 * polyfills/resize-observer.js and upgraded from the
 * amp-resize-observer-polyfill extension.
 */

/** @typedef {function(!typeof ResizeObserver)} */
var ResObsUpgraderDef;

var UPGRADERS = '_upgraders';
var STUB = '_stub';

/**
 * @param {!Window} win
 * @return {boolean}
 * @visibleForTesting
 */
export function shouldLoadPolyfill(win) {
  return !win.ResizeObserver || !!win.ResizeObserver[STUB];
}

/**
 * Installs the ResOb stubs.
 *
 * @param {!Window} win
 */
export function installStub(win) {
  if (win.ResizeObserver) {
    return;
  }

  win.ResizeObserver = ResizeObserverStub;
  win.ResizeObserver[STUB] = ResizeObserverStub;
}

/**
 * @param {!Window} win
 * @param {function()} installer
 */
export function upgradePolyfill(win, installer) {
  // Can't use the ResizeObserverStub here directly since it's a separate
  // instance deployed in v0.js vs the polyfill extension.
  var Stub = win.ResizeObserver[STUB];
  if (Stub) {
    delete win.ResizeObserver;
    delete win.ResizeObserverEntry;
    installer();

    var Polyfill = win.ResizeObserver;
    /** @type {!Array<ResObsUpgraderDef>} */
    var upgraders = Stub[UPGRADERS].slice(0);
    var microtask = _resolvedPromise();
    var upgrade = function upgrade(upgrader) {
      microtask.then(function () {return upgrader(Polyfill);});
    };var _iterator = _createForOfIteratorHelper(
    upgraders),_step;try {for (_iterator.s(); !(_step = _iterator.n()).done;) {var upgrader = _step.value;
        upgrade(upgrader);
      }} catch (err) {_iterator.e(err);} finally {_iterator.f();}
    Stub[UPGRADERS] = { 'push': upgrade };
  } else {
    // Even if this is not the stub, we still may need to install the polyfill.
    // See `shouldLoadPolyfill` for more info.
    installer();
  }
}

/**
 * The stub for `ResizeObserver`. Implements the same interface, but
 * keeps the tracked elements in memory until the actual polyfill arives.
 * This stub is necessary because the polyfill itself is significantly bigger.
 * It doesn't technically extend ResizeObserver, but this allows the stub
 * to be seen as equivalent when typechecking calls expecting a ResizeObserver.
 * @extends ResizeObserver
 */
export var ResizeObserverStub = /*#__PURE__*/function () {
  /** @param {!ResizeObserverCallback} callback */
  function ResizeObserverStub(callback) {_classCallCheck(this, ResizeObserverStub);
    /** @private @const {!ResizeObserverCallback} */
    this.callback_ = callback;

    /** @private {!Array<!Element>} */
    this.elements_ = [];

    /** @private {?ResizeObserver} */
    this.inst_ = null;

    // Wait for the upgrade.
    ResizeObserverStub[UPGRADERS].push(this.upgrade_.bind(this));
  }

  /** @return {undefined} */_createClass(ResizeObserverStub, [{ key: "disconnect", value:
    function disconnect() {
      if (this.inst_) {
        this.inst_.disconnect();
      } else {
        this.elements_.length = 0;
      }
    }

    /** @param {!Element} target */ }, { key: "observe", value:
    function observe(target) {
      if (this.inst_) {
        this.inst_.observe(target);
      } else {
        if (this.elements_.indexOf(target) == -1) {
          this.elements_.push(target);
        }
      }
    }

    /** @param {!Element} target */ }, { key: "unobserve", value:
    function unobserve(target) {
      if (this.inst_) {
        this.inst_.unobserve(target);
      } else {
        var index = this.elements_.indexOf(target);
        if (index != -1) {
          this.elements_.splice(index, 1);
        }
      }
    }

    /**
     * @param {!typeof ResizeObserver} Ctor
     * @private
     */ }, { key: "upgrade_", value:
    function upgrade_(Ctor) {
      var inst = new Ctor(this.callback_);
      this.inst_ = inst;var _iterator2 = _createForOfIteratorHelper(
      this.elements_),_step2;try {for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {var e = _step2.value;
          inst.observe(e);
        }} catch (err) {_iterator2.e(err);} finally {_iterator2.f();}
      this.elements_.length = 0;
    } }]);return ResizeObserverStub;}();


/** @type {!Array<!ResObsUpgraderDef>} */
ResizeObserverStub[UPGRADERS] = [];

/** @visibleForTesting */
export function resetStubsForTesting() {
  ResizeObserverStub[UPGRADERS] = [];
}
// /Users/mszylkowski/src/amphtml/src/polyfills/stubs/resize-observer-stub.js