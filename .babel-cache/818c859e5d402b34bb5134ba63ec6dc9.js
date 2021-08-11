import { resolvedPromise as _resolvedPromise } from "./../../core/data-structures/promise";function _createForOfIteratorHelper(o, allowArrayLike) {var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];if (!it) {if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || (allowArrayLike && o && typeof o.length === "number")) {if (it) o = it;var i = 0;var F = function F() {};return { s: F, n: function n() {if (i >= o.length) return { done: true };return { done: false, value: o[i++] };}, e: function e(_e) {throw _e;}, f: F };}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}var normalCompletion = true,didErr = false,err;return { s: function s() {it = it.call(o);}, n: function n() {var step = it.next();normalCompletion = step.done;return step;}, e: function e(_e2) {didErr = true;err = _e2;}, f: function f() {try {if (!normalCompletion && it.return != null) it.return();} finally {if (didErr) throw err;}} };}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
 * See https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver.
 *
 * This is the stub to support IntersectionObserver. It's installed from
 * polyfills/intersection-observer.js and upgraded from the
 * amp-intersection-observer-polyfill extension.
 */

/** @typedef {function(!typeof IntersectionObserver)} */
var InObUpgraderDef;

var UPGRADERS = '_upgraders';
var NATIVE = '_native';
var STUB = '_stub';

/**
 * @param {!Window} win
 * @return {boolean}
 * @visibleForTesting
 */
export function shouldLoadPolyfill(win) {
  return (
  !win.IntersectionObserver ||
  !win.IntersectionObserverEntry ||
  !!win.IntersectionObserver[STUB] ||
  !supportsDocumentRoot(win) ||
  isWebkit(win));

}

/**
 * All current WebKit (as of Safari 14.x) {root:document} IntersectionObservers
 * will report incorrect rootBounds, intersectionRect, and intersectionRatios
 * and therefore we force the polyfill in this case.
 * See: https://bugs.webkit.org/show_bug.cgi?id=219495.
 *
 * @param {!Window} win
 * @return {boolean}
 */
function isWebkit(win) {
  // navigator.vendor is always "Apple Computer, Inc." for all iOS browsers and
  // Mac OS Safari.
  return /apple/i.test(win.navigator.vendor);
}

/**
 * @param {!typeof IntersectionObserver} Native
 * @param {!typeof IntersectionObserver} Polyfill
 * @return {!typeof IntersectionObserver}
 */
function getIntersectionObserverDispatcher(Native, Polyfill) {
  /**
   * @param {!IntersectionObserverCallback} ioCallback
   * @param {IntersectionObserverInit=} opts
   * @return {!IntersectionObserver}
   */
  function Ctor(ioCallback, opts) {var _opts$root;
    if (((opts === null || opts === void 0) ? (void 0) : ((_opts$root = opts.root) === null || _opts$root === void 0) ? (void 0) : _opts$root.nodeType) === /* Node.DOCUMENT_NODE */9) {
      return new Polyfill(ioCallback, opts);
    } else {
      return new Native(ioCallback, opts);
    }
  }
  return Ctor;
}

/**
 * Installs the InOb stubs. This should only be called in two cases:
 * 1. No native InOb exists.
 * 2. Native InOb is present, but lacks document root support.
 *
 * @param {!Window} win
 */
export function installStub(win) {
  if (!win.IntersectionObserver) {
    win.IntersectionObserver = IntersectionObserverStub;
    win.IntersectionObserver[STUB] = IntersectionObserverStub;
    return;
  }

  var Native = win.IntersectionObserver;
  win.IntersectionObserver = getIntersectionObserverDispatcher(
  win.IntersectionObserver,
  IntersectionObserverStub);

  win.IntersectionObserver[STUB] = IntersectionObserverStub;
  win.IntersectionObserver[NATIVE] = Native;
}

/**
 * Returns true if IntersectionObserver supports a document root.
 * @param {!Window} win
 * @return {boolean}
 */
export function supportsDocumentRoot(win) {
  try {
    new win.IntersectionObserver(function () {}, {
      // TODO(rcebulko): Update when CC updates their externs
      // See https://github.com/google/closure-compiler/pull/3804
      root: /** @type {?} */(win.document) });

    return true;
  } catch (_unused) {
    return false;
  }
}

/**
 * @param {!Window} win
 * @param {function()} installer
 */
export function upgradePolyfill(win, installer) {
  // Can't use the IntersectionObserverStub here directly since it's a separate
  // instance deployed in v0.js vs the polyfill extension.
  var Stub = win.IntersectionObserver[STUB];
  if (Stub) {
    var Native = win.IntersectionObserver[NATIVE];
    delete win.IntersectionObserver;
    delete win.IntersectionObserverEntry;
    installer();
    var Polyfill = win.IntersectionObserver;
    if (Native) {
      win.IntersectionObserver = getIntersectionObserverDispatcher(
      Native,
      Polyfill);

    }

    /** @type {!Array<!InObUpgraderDef>} */
    var upgraders = Stub[UPGRADERS].slice(0);
    var microtask = _resolvedPromise();
    var upgrade = function upgrade(upgrader) {
      microtask.then(function () {return upgrader(Polyfill);});
    };
    upgraders.forEach(upgrade);
    Stub[UPGRADERS] = { 'push': upgrade };
  } else {
    // Even if this is not the stub, we still may need to polyfill
    // `isIntersecting`. See `shouldLoadPolyfill` for more info.
    installer();
  }
}

/**
 * The stub for `IntersectionObserver`. Implements the same interface, but
 * keeps the tracked elements in memory until the actual polyfill arives.
 * This stub is necessary because the polyfill itself is significantly bigger.
 *
 * It doesn't technically extend IntersectionObserver, but this allows the stub
 * to be seen as equivalent when typechecking calls expecting an
 * IntersectionObserver.
 * @extends IntersectionObserver
 */
export var IntersectionObserverStub = /*#__PURE__*/function () {
  /**
   * @param {!IntersectionObserverCallback} callback
   * @param {!IntersectionObserverInit=} options
   */
  function IntersectionObserverStub(callback, options) {_classCallCheck(this, IntersectionObserverStub);
    /** @private @const */
    this.callback_ = callback;

    /** @private @const {!IntersectionObserverInit} */
    this.options_ = _objectSpread({
      root: null,
      rootMargin: '0px 0px 0px 0px' },
    options);


    /** @private {!Array<!Element>} */
    this.elements_ = [];

    /** @private {?IntersectionObserver} */
    this.inst_ = null;

    // Wait for the upgrade.
    IntersectionObserverStub[UPGRADERS].push(this.upgrade_.bind(this));
  }

  /** @return {?Element} */_createClass(IntersectionObserverStub, [{ key: "root", get:
    function get() {
      if (this.inst_) {
        return this.inst_.root;
      }
      // eslint-disable-next-line local/no-forbidden-terms
      return (/** @type {!Element} */(this.options_.root) || null);
    }

    /** @return {string} */ }, { key: "rootMargin", get:
    function get() {
      if (this.inst_) {
        return this.inst_.rootMargin;
      }
      // The CC-provided IntersectionObserverInit type allows for rootMargin to be
      // undefined, but we provide a default, so it's guaranteed to be a string
      // here.
      return (/** @type {string} */(this.options_.rootMargin));
    }

    /** @return {!Array<number>} */ }, { key: "thresholds", get:
    function get() {
      if (this.inst_) {
        return this.inst_.thresholds;
      }
      return [].concat(this.options_.threshold || 0);
    }

    /** @return {undefined} */ }, { key: "disconnect", value:
    function disconnect() {
      if (this.inst_) {
        this.inst_.disconnect();
      } else {
        this.elements_.length = 0;
      }
    }

    /** @return {!Array<!IntersectionObserverEntry>} */ }, { key: "takeRecords", value:
    function takeRecords() {
      if (this.inst_) {
        return this.inst_.takeRecords();
      }
      return [];
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
     * @param {!typeof IntersectionObserver} Ctor
     * @private
     */ }, { key: "upgrade_", value:
    function upgrade_(Ctor) {
      var inst = new Ctor(this.callback_, this.options_);
      this.inst_ = inst;var _iterator = _createForOfIteratorHelper(
      this.elements_),_step;try {for (_iterator.s(); !(_step = _iterator.n()).done;) {var e = _step.value;
          inst.observe(e);
        }} catch (err) {_iterator.e(err);} finally {_iterator.f();}
      this.elements_.length = 0;
    } }]);return IntersectionObserverStub;}();


/** @type {!Array<!InObUpgraderDef>} */
IntersectionObserverStub[UPGRADERS] = [];

/** @visibleForTesting */
export function resetStubsForTesting() {
  IntersectionObserverStub[UPGRADERS] = [];
}
// /Users/mszylkowski/src/amphtml/src/polyfills/stubs/intersection-observer-stub.js