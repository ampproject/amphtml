import { resolvedPromise as _resolvedPromise } from "./../../core/data-structures/promise";

function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

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
  return !win.IntersectionObserver || !win.IntersectionObserverEntry || !!win.IntersectionObserver[STUB] || !supportsDocumentRoot(win) || isWebkit(win);
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
  function Ctor(ioCallback, opts) {
    var _opts$root;

    if ((opts == null ? void 0 : (_opts$root = opts.root) == null ? void 0 : _opts$root.nodeType) ===
    /* Node.DOCUMENT_NODE */
    9) {
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
  win.IntersectionObserver = getIntersectionObserverDispatcher(win.IntersectionObserver, IntersectionObserverStub);
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
      root:
      /** @type {?} */
      win.document
    });
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
      win.IntersectionObserver = getIntersectionObserverDispatcher(Native, Polyfill);
    }

    /** @type {!Array<!InObUpgraderDef>} */
    var upgraders = Stub[UPGRADERS].slice(0);

    var microtask = _resolvedPromise();

    var upgrade = function upgrade(upgrader) {
      microtask.then(function () {
        return upgrader(Polyfill);
      });
    };

    upgraders.forEach(upgrade);
    Stub[UPGRADERS] = {
      'push': upgrade
    };
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
  function IntersectionObserverStub(callback, options) {
    _classCallCheck(this, IntersectionObserverStub);

    /** @private @const */
    this.callback_ = callback;

    /** @private @const {!IntersectionObserverInit} */
    this.options_ = _extends({
      root: null,
      rootMargin: '0px 0px 0px 0px'
    }, options);

    /** @private {!Array<!Element>} */
    this.elements_ = [];

    /** @private {?IntersectionObserver} */
    this.inst_ = null;
    // Wait for the upgrade.
    IntersectionObserverStub[UPGRADERS].push(this.upgrade_.bind(this));
  }

  /** @return {?Element} */
  _createClass(IntersectionObserverStub, [{
    key: "root",
    get: function get() {
      if (this.inst_) {
        return this.inst_.root;
      }

      // eslint-disable-next-line local/no-forbidden-terms
      return (
        /** @type {!Element} */
        this.options_.root || null
      );
    }
    /** @return {string} */

  }, {
    key: "rootMargin",
    get: function get() {
      if (this.inst_) {
        return this.inst_.rootMargin;
      }

      // The CC-provided IntersectionObserverInit type allows for rootMargin to be
      // undefined, but we provide a default, so it's guaranteed to be a string
      // here.
      return (
        /** @type {string} */
        this.options_.rootMargin
      );
    }
    /** @return {!Array<number>} */

  }, {
    key: "thresholds",
    get: function get() {
      if (this.inst_) {
        return this.inst_.thresholds;
      }

      return [].concat(this.options_.threshold || 0);
    }
    /** @return {undefined} */

  }, {
    key: "disconnect",
    value: function disconnect() {
      if (this.inst_) {
        this.inst_.disconnect();
      } else {
        this.elements_.length = 0;
      }
    }
    /** @return {!Array<!IntersectionObserverEntry>} */

  }, {
    key: "takeRecords",
    value: function takeRecords() {
      if (this.inst_) {
        return this.inst_.takeRecords();
      }

      return [];
    }
    /** @param {!Element} target */

  }, {
    key: "observe",
    value: function observe(target) {
      if (this.inst_) {
        this.inst_.observe(target);
      } else {
        if (this.elements_.indexOf(target) == -1) {
          this.elements_.push(target);
        }
      }
    }
    /** @param {!Element} target */

  }, {
    key: "unobserve",
    value: function unobserve(target) {
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
     */

  }, {
    key: "upgrade_",
    value: function upgrade_(Ctor) {
      var inst = new Ctor(this.callback_, this.options_);
      this.inst_ = inst;

      for (var _iterator = _createForOfIteratorHelperLoose(this.elements_), _step; !(_step = _iterator()).done;) {
        var e = _step.value;
        inst.observe(e);
      }

      this.elements_.length = 0;
    }
  }]);

  return IntersectionObserverStub;
}();

/** @type {!Array<!InObUpgraderDef>} */
IntersectionObserverStub[UPGRADERS] = [];

/** @visibleForTesting */
export function resetStubsForTesting() {
  IntersectionObserverStub[UPGRADERS] = [];
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImludGVyc2VjdGlvbi1vYnNlcnZlci1zdHViLmpzIl0sIm5hbWVzIjpbIkluT2JVcGdyYWRlckRlZiIsIlVQR1JBREVSUyIsIk5BVElWRSIsIlNUVUIiLCJzaG91bGRMb2FkUG9seWZpbGwiLCJ3aW4iLCJJbnRlcnNlY3Rpb25PYnNlcnZlciIsIkludGVyc2VjdGlvbk9ic2VydmVyRW50cnkiLCJzdXBwb3J0c0RvY3VtZW50Um9vdCIsImlzV2Via2l0IiwidGVzdCIsIm5hdmlnYXRvciIsInZlbmRvciIsImdldEludGVyc2VjdGlvbk9ic2VydmVyRGlzcGF0Y2hlciIsIk5hdGl2ZSIsIlBvbHlmaWxsIiwiQ3RvciIsImlvQ2FsbGJhY2siLCJvcHRzIiwicm9vdCIsIm5vZGVUeXBlIiwiaW5zdGFsbFN0dWIiLCJJbnRlcnNlY3Rpb25PYnNlcnZlclN0dWIiLCJkb2N1bWVudCIsInVwZ3JhZGVQb2x5ZmlsbCIsImluc3RhbGxlciIsIlN0dWIiLCJ1cGdyYWRlcnMiLCJzbGljZSIsIm1pY3JvdGFzayIsInVwZ3JhZGUiLCJ1cGdyYWRlciIsInRoZW4iLCJmb3JFYWNoIiwiY2FsbGJhY2siLCJvcHRpb25zIiwiY2FsbGJhY2tfIiwib3B0aW9uc18iLCJyb290TWFyZ2luIiwiZWxlbWVudHNfIiwiaW5zdF8iLCJwdXNoIiwidXBncmFkZV8iLCJiaW5kIiwidGhyZXNob2xkcyIsImNvbmNhdCIsInRocmVzaG9sZCIsImRpc2Nvbm5lY3QiLCJsZW5ndGgiLCJ0YWtlUmVjb3JkcyIsInRhcmdldCIsIm9ic2VydmUiLCJpbmRleE9mIiwidW5vYnNlcnZlIiwiaW5kZXgiLCJzcGxpY2UiLCJpbnN0IiwiZSIsInJlc2V0U3R1YnNGb3JUZXN0aW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNB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YjtBQUNEOztBQUNELFdBQUtsQixTQUFMLENBQWVTLE1BQWYsR0FBd0IsQ0FBeEI7QUFDRDtBQXpHSDs7QUFBQTtBQUFBOztBQTRHQTtBQUNBMUIsd0JBQXdCLENBQUNyQixTQUFELENBQXhCLEdBQXNDLEVBQXRDOztBQUVBO0FBQ0EsT0FBTyxTQUFTeUQsb0JBQVQsR0FBZ0M7QUFDckNwQyxFQUFBQSx3QkFBd0IsQ0FBQ3JCLFNBQUQsQ0FBeEIsR0FBc0MsRUFBdEM7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMjAgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXdcbiAqIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvSW50ZXJzZWN0aW9uT2JzZXJ2ZXIuXG4gKlxuICogVGhpcyBpcyB0aGUgc3R1YiB0byBzdXBwb3J0IEludGVyc2VjdGlvbk9ic2VydmVyLiBJdCdzIGluc3RhbGxlZCBmcm9tXG4gKiBwb2x5ZmlsbHMvaW50ZXJzZWN0aW9uLW9ic2VydmVyLmpzIGFuZCB1cGdyYWRlZCBmcm9tIHRoZVxuICogYW1wLWludGVyc2VjdGlvbi1vYnNlcnZlci1wb2x5ZmlsbCBleHRlbnNpb24uXG4gKi9cblxuLyoqIEB0eXBlZGVmIHtmdW5jdGlvbighdHlwZW9mIEludGVyc2VjdGlvbk9ic2VydmVyKX0gKi9cbmxldCBJbk9iVXBncmFkZXJEZWY7XG5cbmNvbnN0IFVQR1JBREVSUyA9ICdfdXBncmFkZXJzJztcbmNvbnN0IE5BVElWRSA9ICdfbmF0aXZlJztcbmNvbnN0IFNUVUIgPSAnX3N0dWInO1xuXG4vKipcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaG91bGRMb2FkUG9seWZpbGwod2luKSB7XG4gIHJldHVybiAoXG4gICAgIXdpbi5JbnRlcnNlY3Rpb25PYnNlcnZlciB8fFxuICAgICF3aW4uSW50ZXJzZWN0aW9uT2JzZXJ2ZXJFbnRyeSB8fFxuICAgICEhd2luLkludGVyc2VjdGlvbk9ic2VydmVyW1NUVUJdIHx8XG4gICAgIXN1cHBvcnRzRG9jdW1lbnRSb290KHdpbikgfHxcbiAgICBpc1dlYmtpdCh3aW4pXG4gICk7XG59XG5cbi8qKlxuICogQWxsIGN1cnJlbnQgV2ViS2l0IChhcyBvZiBTYWZhcmkgMTQueCkge3Jvb3Q6ZG9jdW1lbnR9IEludGVyc2VjdGlvbk9ic2VydmVyc1xuICogd2lsbCByZXBvcnQgaW5jb3JyZWN0IHJvb3RCb3VuZHMsIGludGVyc2VjdGlvblJlY3QsIGFuZCBpbnRlcnNlY3Rpb25SYXRpb3NcbiAqIGFuZCB0aGVyZWZvcmUgd2UgZm9yY2UgdGhlIHBvbHlmaWxsIGluIHRoaXMgY2FzZS5cbiAqIFNlZTogaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTIxOTQ5NS5cbiAqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNXZWJraXQod2luKSB7XG4gIC8vIG5hdmlnYXRvci52ZW5kb3IgaXMgYWx3YXlzIFwiQXBwbGUgQ29tcHV0ZXIsIEluYy5cIiBmb3IgYWxsIGlPUyBicm93c2VycyBhbmRcbiAgLy8gTWFjIE9TIFNhZmFyaS5cbiAgcmV0dXJuIC9hcHBsZS9pLnRlc3Qod2luLm5hdmlnYXRvci52ZW5kb3IpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IXR5cGVvZiBJbnRlcnNlY3Rpb25PYnNlcnZlcn0gTmF0aXZlXG4gKiBAcGFyYW0geyF0eXBlb2YgSW50ZXJzZWN0aW9uT2JzZXJ2ZXJ9IFBvbHlmaWxsXG4gKiBAcmV0dXJuIHshdHlwZW9mIEludGVyc2VjdGlvbk9ic2VydmVyfVxuICovXG5mdW5jdGlvbiBnZXRJbnRlcnNlY3Rpb25PYnNlcnZlckRpc3BhdGNoZXIoTmF0aXZlLCBQb2x5ZmlsbCkge1xuICAvKipcbiAgICogQHBhcmFtIHshSW50ZXJzZWN0aW9uT2JzZXJ2ZXJDYWxsYmFja30gaW9DYWxsYmFja1xuICAgKiBAcGFyYW0ge0ludGVyc2VjdGlvbk9ic2VydmVySW5pdD19IG9wdHNcbiAgICogQHJldHVybiB7IUludGVyc2VjdGlvbk9ic2VydmVyfVxuICAgKi9cbiAgZnVuY3Rpb24gQ3Rvcihpb0NhbGxiYWNrLCBvcHRzKSB7XG4gICAgaWYgKG9wdHM/LnJvb3Q/Lm5vZGVUeXBlID09PSAvKiBOb2RlLkRPQ1VNRU5UX05PREUgKi8gOSkge1xuICAgICAgcmV0dXJuIG5ldyBQb2x5ZmlsbChpb0NhbGxiYWNrLCBvcHRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBOYXRpdmUoaW9DYWxsYmFjaywgb3B0cyk7XG4gICAgfVxuICB9XG4gIHJldHVybiBDdG9yO1xufVxuXG4vKipcbiAqIEluc3RhbGxzIHRoZSBJbk9iIHN0dWJzLiBUaGlzIHNob3VsZCBvbmx5IGJlIGNhbGxlZCBpbiB0d28gY2FzZXM6XG4gKiAxLiBObyBuYXRpdmUgSW5PYiBleGlzdHMuXG4gKiAyLiBOYXRpdmUgSW5PYiBpcyBwcmVzZW50LCBidXQgbGFja3MgZG9jdW1lbnQgcm9vdCBzdXBwb3J0LlxuICpcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsU3R1Yih3aW4pIHtcbiAgaWYgKCF3aW4uSW50ZXJzZWN0aW9uT2JzZXJ2ZXIpIHtcbiAgICB3aW4uSW50ZXJzZWN0aW9uT2JzZXJ2ZXIgPSBJbnRlcnNlY3Rpb25PYnNlcnZlclN0dWI7XG4gICAgd2luLkludGVyc2VjdGlvbk9ic2VydmVyW1NUVUJdID0gSW50ZXJzZWN0aW9uT2JzZXJ2ZXJTdHViO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IE5hdGl2ZSA9IHdpbi5JbnRlcnNlY3Rpb25PYnNlcnZlcjtcbiAgd2luLkludGVyc2VjdGlvbk9ic2VydmVyID0gZ2V0SW50ZXJzZWN0aW9uT2JzZXJ2ZXJEaXNwYXRjaGVyKFxuICAgIHdpbi5JbnRlcnNlY3Rpb25PYnNlcnZlcixcbiAgICBJbnRlcnNlY3Rpb25PYnNlcnZlclN0dWJcbiAgKTtcbiAgd2luLkludGVyc2VjdGlvbk9ic2VydmVyW1NUVUJdID0gSW50ZXJzZWN0aW9uT2JzZXJ2ZXJTdHViO1xuICB3aW4uSW50ZXJzZWN0aW9uT2JzZXJ2ZXJbTkFUSVZFXSA9IE5hdGl2ZTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIgc3VwcG9ydHMgYSBkb2N1bWVudCByb290LlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdXBwb3J0c0RvY3VtZW50Um9vdCh3aW4pIHtcbiAgdHJ5IHtcbiAgICBuZXcgd2luLkludGVyc2VjdGlvbk9ic2VydmVyKCgpID0+IHt9LCB7XG4gICAgICAvLyBUT0RPKHJjZWJ1bGtvKTogVXBkYXRlIHdoZW4gQ0MgdXBkYXRlcyB0aGVpciBleHRlcm5zXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS9jbG9zdXJlLWNvbXBpbGVyL3B1bGwvMzgwNFxuICAgICAgcm9vdDogLyoqIEB0eXBlIHs/fSAqLyAod2luLmRvY3VtZW50KSxcbiAgICB9KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gaW5zdGFsbGVyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGdyYWRlUG9seWZpbGwod2luLCBpbnN0YWxsZXIpIHtcbiAgLy8gQ2FuJ3QgdXNlIHRoZSBJbnRlcnNlY3Rpb25PYnNlcnZlclN0dWIgaGVyZSBkaXJlY3RseSBzaW5jZSBpdCdzIGEgc2VwYXJhdGVcbiAgLy8gaW5zdGFuY2UgZGVwbG95ZWQgaW4gdjAuanMgdnMgdGhlIHBvbHlmaWxsIGV4dGVuc2lvbi5cbiAgY29uc3QgU3R1YiA9IHdpbi5JbnRlcnNlY3Rpb25PYnNlcnZlcltTVFVCXTtcbiAgaWYgKFN0dWIpIHtcbiAgICBjb25zdCBOYXRpdmUgPSB3aW4uSW50ZXJzZWN0aW9uT2JzZXJ2ZXJbTkFUSVZFXTtcbiAgICBkZWxldGUgd2luLkludGVyc2VjdGlvbk9ic2VydmVyO1xuICAgIGRlbGV0ZSB3aW4uSW50ZXJzZWN0aW9uT2JzZXJ2ZXJFbnRyeTtcbiAgICBpbnN0YWxsZXIoKTtcbiAgICBjb25zdCBQb2x5ZmlsbCA9IHdpbi5JbnRlcnNlY3Rpb25PYnNlcnZlcjtcbiAgICBpZiAoTmF0aXZlKSB7XG4gICAgICB3aW4uSW50ZXJzZWN0aW9uT2JzZXJ2ZXIgPSBnZXRJbnRlcnNlY3Rpb25PYnNlcnZlckRpc3BhdGNoZXIoXG4gICAgICAgIE5hdGl2ZSxcbiAgICAgICAgUG9seWZpbGxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqIEB0eXBlIHshQXJyYXk8IUluT2JVcGdyYWRlckRlZj59ICovXG4gICAgY29uc3QgdXBncmFkZXJzID0gU3R1YltVUEdSQURFUlNdLnNsaWNlKDApO1xuICAgIGNvbnN0IG1pY3JvdGFzayA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIGNvbnN0IHVwZ3JhZGUgPSAodXBncmFkZXIpID0+IHtcbiAgICAgIG1pY3JvdGFzay50aGVuKCgpID0+IHVwZ3JhZGVyKFBvbHlmaWxsKSk7XG4gICAgfTtcbiAgICB1cGdyYWRlcnMuZm9yRWFjaCh1cGdyYWRlKTtcbiAgICBTdHViW1VQR1JBREVSU10gPSB7J3B1c2gnOiB1cGdyYWRlfTtcbiAgfSBlbHNlIHtcbiAgICAvLyBFdmVuIGlmIHRoaXMgaXMgbm90IHRoZSBzdHViLCB3ZSBzdGlsbCBtYXkgbmVlZCB0byBwb2x5ZmlsbFxuICAgIC8vIGBpc0ludGVyc2VjdGluZ2AuIFNlZSBgc2hvdWxkTG9hZFBvbHlmaWxsYCBmb3IgbW9yZSBpbmZvLlxuICAgIGluc3RhbGxlcigpO1xuICB9XG59XG5cbi8qKlxuICogVGhlIHN0dWIgZm9yIGBJbnRlcnNlY3Rpb25PYnNlcnZlcmAuIEltcGxlbWVudHMgdGhlIHNhbWUgaW50ZXJmYWNlLCBidXRcbiAqIGtlZXBzIHRoZSB0cmFja2VkIGVsZW1lbnRzIGluIG1lbW9yeSB1bnRpbCB0aGUgYWN0dWFsIHBvbHlmaWxsIGFyaXZlcy5cbiAqIFRoaXMgc3R1YiBpcyBuZWNlc3NhcnkgYmVjYXVzZSB0aGUgcG9seWZpbGwgaXRzZWxmIGlzIHNpZ25pZmljYW50bHkgYmlnZ2VyLlxuICpcbiAqIEl0IGRvZXNuJ3QgdGVjaG5pY2FsbHkgZXh0ZW5kIEludGVyc2VjdGlvbk9ic2VydmVyLCBidXQgdGhpcyBhbGxvd3MgdGhlIHN0dWJcbiAqIHRvIGJlIHNlZW4gYXMgZXF1aXZhbGVudCB3aGVuIHR5cGVjaGVja2luZyBjYWxscyBleHBlY3RpbmcgYW5cbiAqIEludGVyc2VjdGlvbk9ic2VydmVyLlxuICogQGV4dGVuZHMgSW50ZXJzZWN0aW9uT2JzZXJ2ZXJcbiAqL1xuZXhwb3J0IGNsYXNzIEludGVyc2VjdGlvbk9ic2VydmVyU3R1YiB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFJbnRlcnNlY3Rpb25PYnNlcnZlckNhbGxiYWNrfSBjYWxsYmFja1xuICAgKiBAcGFyYW0geyFJbnRlcnNlY3Rpb25PYnNlcnZlckluaXQ9fSBvcHRpb25zXG4gICAqL1xuICBjb25zdHJ1Y3RvcihjYWxsYmFjaywgb3B0aW9ucykge1xuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgKi9cbiAgICB0aGlzLmNhbGxiYWNrXyA9IGNhbGxiYWNrO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IUludGVyc2VjdGlvbk9ic2VydmVySW5pdH0gKi9cbiAgICB0aGlzLm9wdGlvbnNfID0ge1xuICAgICAgcm9vdDogbnVsbCxcbiAgICAgIHJvb3RNYXJnaW46ICcwcHggMHB4IDBweCAwcHgnLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICB9O1xuXG4gICAgLyoqIEBwcml2YXRlIHshQXJyYXk8IUVsZW1lbnQ+fSAqL1xuICAgIHRoaXMuZWxlbWVudHNfID0gW107XG5cbiAgICAvKiogQHByaXZhdGUgez9JbnRlcnNlY3Rpb25PYnNlcnZlcn0gKi9cbiAgICB0aGlzLmluc3RfID0gbnVsbDtcblxuICAgIC8vIFdhaXQgZm9yIHRoZSB1cGdyYWRlLlxuICAgIEludGVyc2VjdGlvbk9ic2VydmVyU3R1YltVUEdSQURFUlNdLnB1c2godGhpcy51cGdyYWRlXy5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIC8qKiBAcmV0dXJuIHs/RWxlbWVudH0gKi9cbiAgZ2V0IHJvb3QoKSB7XG4gICAgaWYgKHRoaXMuaW5zdF8pIHtcbiAgICAgIHJldHVybiB0aGlzLmluc3RfLnJvb3Q7XG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBsb2NhbC9uby1mb3JiaWRkZW4tdGVybXNcbiAgICByZXR1cm4gLyoqIEB0eXBlIHshRWxlbWVudH0gKi8gKHRoaXMub3B0aW9uc18ucm9vdCkgfHwgbnVsbDtcbiAgfVxuXG4gIC8qKiBAcmV0dXJuIHtzdHJpbmd9ICovXG4gIGdldCByb290TWFyZ2luKCkge1xuICAgIGlmICh0aGlzLmluc3RfKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbnN0Xy5yb290TWFyZ2luO1xuICAgIH1cbiAgICAvLyBUaGUgQ0MtcHJvdmlkZWQgSW50ZXJzZWN0aW9uT2JzZXJ2ZXJJbml0IHR5cGUgYWxsb3dzIGZvciByb290TWFyZ2luIHRvIGJlXG4gICAgLy8gdW5kZWZpbmVkLCBidXQgd2UgcHJvdmlkZSBhIGRlZmF1bHQsIHNvIGl0J3MgZ3VhcmFudGVlZCB0byBiZSBhIHN0cmluZ1xuICAgIC8vIGhlcmUuXG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7c3RyaW5nfSAqLyAodGhpcy5vcHRpb25zXy5yb290TWFyZ2luKTtcbiAgfVxuXG4gIC8qKiBAcmV0dXJuIHshQXJyYXk8bnVtYmVyPn0gKi9cbiAgZ2V0IHRocmVzaG9sZHMoKSB7XG4gICAgaWYgKHRoaXMuaW5zdF8pIHtcbiAgICAgIHJldHVybiB0aGlzLmluc3RfLnRocmVzaG9sZHM7XG4gICAgfVxuICAgIHJldHVybiBbXS5jb25jYXQodGhpcy5vcHRpb25zXy50aHJlc2hvbGQgfHwgMCk7XG4gIH1cblxuICAvKiogQHJldHVybiB7dW5kZWZpbmVkfSAqL1xuICBkaXNjb25uZWN0KCkge1xuICAgIGlmICh0aGlzLmluc3RfKSB7XG4gICAgICB0aGlzLmluc3RfLmRpc2Nvbm5lY3QoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lbGVtZW50c18ubGVuZ3RoID0gMDtcbiAgICB9XG4gIH1cblxuICAvKiogQHJldHVybiB7IUFycmF5PCFJbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5Pn0gKi9cbiAgdGFrZVJlY29yZHMoKSB7XG4gICAgaWYgKHRoaXMuaW5zdF8pIHtcbiAgICAgIHJldHVybiB0aGlzLmluc3RfLnRha2VSZWNvcmRzKCk7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIC8qKiBAcGFyYW0geyFFbGVtZW50fSB0YXJnZXQgKi9cbiAgb2JzZXJ2ZSh0YXJnZXQpIHtcbiAgICBpZiAodGhpcy5pbnN0Xykge1xuICAgICAgdGhpcy5pbnN0Xy5vYnNlcnZlKHRhcmdldCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLmVsZW1lbnRzXy5pbmRleE9mKHRhcmdldCkgPT0gLTEpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c18ucHVzaCh0YXJnZXQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBAcGFyYW0geyFFbGVtZW50fSB0YXJnZXQgKi9cbiAgdW5vYnNlcnZlKHRhcmdldCkge1xuICAgIGlmICh0aGlzLmluc3RfKSB7XG4gICAgICB0aGlzLmluc3RfLnVub2JzZXJ2ZSh0YXJnZXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuZWxlbWVudHNfLmluZGV4T2YodGFyZ2V0KTtcbiAgICAgIGlmIChpbmRleCAhPSAtMSkge1xuICAgICAgICB0aGlzLmVsZW1lbnRzXy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyF0eXBlb2YgSW50ZXJzZWN0aW9uT2JzZXJ2ZXJ9IEN0b3JcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHVwZ3JhZGVfKEN0b3IpIHtcbiAgICBjb25zdCBpbnN0ID0gbmV3IEN0b3IodGhpcy5jYWxsYmFja18sIHRoaXMub3B0aW9uc18pO1xuICAgIHRoaXMuaW5zdF8gPSBpbnN0O1xuICAgIGZvciAoY29uc3QgZSBvZiB0aGlzLmVsZW1lbnRzXykge1xuICAgICAgaW5zdC5vYnNlcnZlKGUpO1xuICAgIH1cbiAgICB0aGlzLmVsZW1lbnRzXy5sZW5ndGggPSAwO1xuICB9XG59XG5cbi8qKiBAdHlwZSB7IUFycmF5PCFJbk9iVXBncmFkZXJEZWY+fSAqL1xuSW50ZXJzZWN0aW9uT2JzZXJ2ZXJTdHViW1VQR1JBREVSU10gPSBbXTtcblxuLyoqIEB2aXNpYmxlRm9yVGVzdGluZyAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0U3R1YnNGb3JUZXN0aW5nKCkge1xuICBJbnRlcnNlY3Rpb25PYnNlcnZlclN0dWJbVVBHUkFERVJTXSA9IFtdO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/polyfills/stubs/intersection-observer-stub.js