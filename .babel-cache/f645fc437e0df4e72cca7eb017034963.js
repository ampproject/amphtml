import { resolvedPromise as _resolvedPromise } from "./../../core/data-structures/promise";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

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
      microtask.then(function () {
        return upgrader(Polyfill);
      });
    };

    for (var _iterator = _createForOfIteratorHelperLoose(upgraders), _step; !(_step = _iterator()).done;) {
      var upgrader = _step.value;
      upgrade(upgrader);
    }

    Stub[UPGRADERS] = {
      'push': upgrade
    };
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
  function ResizeObserverStub(callback) {
    _classCallCheck(this, ResizeObserverStub);

    /** @private @const {!ResizeObserverCallback} */
    this.callback_ = callback;

    /** @private {!Array<!Element>} */
    this.elements_ = [];

    /** @private {?ResizeObserver} */
    this.inst_ = null;
    // Wait for the upgrade.
    ResizeObserverStub[UPGRADERS].push(this.upgrade_.bind(this));
  }

  /** @return {undefined} */
  _createClass(ResizeObserverStub, [{
    key: "disconnect",
    value: function disconnect() {
      if (this.inst_) {
        this.inst_.disconnect();
      } else {
        this.elements_.length = 0;
      }
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
     * @param {!typeof ResizeObserver} Ctor
     * @private
     */

  }, {
    key: "upgrade_",
    value: function upgrade_(Ctor) {
      var inst = new Ctor(this.callback_);
      this.inst_ = inst;

      for (var _iterator2 = _createForOfIteratorHelperLoose(this.elements_), _step2; !(_step2 = _iterator2()).done;) {
        var e = _step2.value;
        inst.observe(e);
      }

      this.elements_.length = 0;
    }
  }]);

  return ResizeObserverStub;
}();

/** @type {!Array<!ResObsUpgraderDef>} */
ResizeObserverStub[UPGRADERS] = [];

/** @visibleForTesting */
export function resetStubsForTesting() {
  ResizeObserverStub[UPGRADERS] = [];
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlc2l6ZS1vYnNlcnZlci1zdHViLmpzIl0sIm5hbWVzIjpbIlJlc09ic1VwZ3JhZGVyRGVmIiwiVVBHUkFERVJTIiwiU1RVQiIsInNob3VsZExvYWRQb2x5ZmlsbCIsIndpbiIsIlJlc2l6ZU9ic2VydmVyIiwiaW5zdGFsbFN0dWIiLCJSZXNpemVPYnNlcnZlclN0dWIiLCJ1cGdyYWRlUG9seWZpbGwiLCJpbnN0YWxsZXIiLCJTdHViIiwiUmVzaXplT2JzZXJ2ZXJFbnRyeSIsIlBvbHlmaWxsIiwidXBncmFkZXJzIiwic2xpY2UiLCJtaWNyb3Rhc2siLCJ1cGdyYWRlIiwidXBncmFkZXIiLCJ0aGVuIiwiY2FsbGJhY2siLCJjYWxsYmFja18iLCJlbGVtZW50c18iLCJpbnN0XyIsInB1c2giLCJ1cGdyYWRlXyIsImJpbmQiLCJkaXNjb25uZWN0IiwibGVuZ3RoIiwidGFyZ2V0Iiwib2JzZXJ2ZSIsImluZGV4T2YiLCJ1bm9ic2VydmUiLCJpbmRleCIsInNwbGljZSIsIkN0b3IiLCJpbnN0IiwiZSIsInJlc2V0U3R1YnNGb3JUZXN0aW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsSUFBSUEsaUJBQUo7QUFFQSxJQUFNQyxTQUFTLEdBQUcsWUFBbEI7QUFDQSxJQUFNQyxJQUFJLEdBQUcsT0FBYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQyxrQkFBVCxDQUE0QkMsR0FBNUIsRUFBaUM7QUFDdEMsU0FBTyxDQUFDQSxHQUFHLENBQUNDLGNBQUwsSUFBdUIsQ0FBQyxDQUFDRCxHQUFHLENBQUNDLGNBQUosQ0FBbUJILElBQW5CLENBQWhDO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0ksV0FBVCxDQUFxQkYsR0FBckIsRUFBMEI7QUFDL0IsTUFBSUEsR0FBRyxDQUFDQyxjQUFSLEVBQXdCO0FBQ3RCO0FBQ0Q7O0FBRURELEVBQUFBLEdBQUcsQ0FBQ0MsY0FBSixHQUFxQkUsa0JBQXJCO0FBQ0FILEVBQUFBLEdBQUcsQ0FBQ0MsY0FBSixDQUFtQkgsSUFBbkIsSUFBMkJLLGtCQUEzQjtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQyxlQUFULENBQXlCSixHQUF6QixFQUE4QkssU0FBOUIsRUFBeUM7QUFDOUM7QUFDQTtBQUNBLE1BQU1DLElBQUksR0FBR04sR0FBRyxDQUFDQyxjQUFKLENBQW1CSCxJQUFuQixDQUFiOztBQUNBLE1BQUlRLElBQUosRUFBVTtBQUNSLFdBQU9OLEdBQUcsQ0FBQ0MsY0FBWDtBQUNBLFdBQU9ELEdBQUcsQ0FBQ08sbUJBQVg7QUFDQUYsSUFBQUEsU0FBUztBQUVULFFBQU1HLFFBQVEsR0FBR1IsR0FBRyxDQUFDQyxjQUFyQjs7QUFDQTtBQUNBLFFBQU1RLFNBQVMsR0FBR0gsSUFBSSxDQUFDVCxTQUFELENBQUosQ0FBZ0JhLEtBQWhCLENBQXNCLENBQXRCLENBQWxCOztBQUNBLFFBQU1DLFNBQVMsR0FBRyxrQkFBbEI7O0FBQ0EsUUFBTUMsT0FBTyxHQUFHLFNBQVZBLE9BQVUsQ0FBQ0MsUUFBRCxFQUFjO0FBQzVCRixNQUFBQSxTQUFTLENBQUNHLElBQVYsQ0FBZTtBQUFBLGVBQU1ELFFBQVEsQ0FBQ0wsUUFBRCxDQUFkO0FBQUEsT0FBZjtBQUNELEtBRkQ7O0FBR0EseURBQXVCQyxTQUF2Qix3Q0FBa0M7QUFBQSxVQUF2QkksUUFBdUI7QUFDaENELE1BQUFBLE9BQU8sQ0FBQ0MsUUFBRCxDQUFQO0FBQ0Q7O0FBQ0RQLElBQUFBLElBQUksQ0FBQ1QsU0FBRCxDQUFKLEdBQWtCO0FBQUMsY0FBUWU7QUFBVCxLQUFsQjtBQUNELEdBaEJELE1BZ0JPO0FBQ0w7QUFDQTtBQUNBUCxJQUFBQSxTQUFTO0FBQ1Y7QUFDRjs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBYUYsa0JBQWI7QUFDRTtBQUNBLDhCQUFZWSxRQUFaLEVBQXNCO0FBQUE7O0FBQ3BCO0FBQ0EsU0FBS0MsU0FBTCxHQUFpQkQsUUFBakI7O0FBRUE7QUFDQSxTQUFLRSxTQUFMLEdBQWlCLEVBQWpCOztBQUVBO0FBQ0EsU0FBS0MsS0FBTCxHQUFhLElBQWI7QUFFQTtBQUNBZixJQUFBQSxrQkFBa0IsQ0FBQ04sU0FBRCxDQUFsQixDQUE4QnNCLElBQTlCLENBQW1DLEtBQUtDLFFBQUwsQ0FBY0MsSUFBZCxDQUFtQixJQUFuQixDQUFuQztBQUNEOztBQUVEO0FBaEJGO0FBQUE7QUFBQSxXQWlCRSxzQkFBYTtBQUNYLFVBQUksS0FBS0gsS0FBVCxFQUFnQjtBQUNkLGFBQUtBLEtBQUwsQ0FBV0ksVUFBWDtBQUNELE9BRkQsTUFFTztBQUNMLGFBQUtMLFNBQUwsQ0FBZU0sTUFBZixHQUF3QixDQUF4QjtBQUNEO0FBQ0Y7QUFFRDs7QUF6QkY7QUFBQTtBQUFBLFdBMEJFLGlCQUFRQyxNQUFSLEVBQWdCO0FBQ2QsVUFBSSxLQUFLTixLQUFULEVBQWdCO0FBQ2QsYUFBS0EsS0FBTCxDQUFXTyxPQUFYLENBQW1CRCxNQUFuQjtBQUNELE9BRkQsTUFFTztBQUNMLFlBQUksS0FBS1AsU0FBTCxDQUFlUyxPQUFmLENBQXVCRixNQUF2QixLQUFrQyxDQUFDLENBQXZDLEVBQTBDO0FBQ3hDLGVBQUtQLFNBQUwsQ0FBZUUsSUFBZixDQUFvQkssTUFBcEI7QUFDRDtBQUNGO0FBQ0Y7QUFFRDs7QUFwQ0Y7QUFBQTtBQUFBLFdBcUNFLG1CQUFVQSxNQUFWLEVBQWtCO0FBQ2hCLFVBQUksS0FBS04sS0FBVCxFQUFnQjtBQUNkLGFBQUtBLEtBQUwsQ0FBV1MsU0FBWCxDQUFxQkgsTUFBckI7QUFDRCxPQUZELE1BRU87QUFDTCxZQUFNSSxLQUFLLEdBQUcsS0FBS1gsU0FBTCxDQUFlUyxPQUFmLENBQXVCRixNQUF2QixDQUFkOztBQUNBLFlBQUlJLEtBQUssSUFBSSxDQUFDLENBQWQsRUFBaUI7QUFDZixlQUFLWCxTQUFMLENBQWVZLE1BQWYsQ0FBc0JELEtBQXRCLEVBQTZCLENBQTdCO0FBQ0Q7QUFDRjtBQUNGO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBbkRBO0FBQUE7QUFBQSxXQW9ERSxrQkFBU0UsSUFBVCxFQUFlO0FBQ2IsVUFBTUMsSUFBSSxHQUFHLElBQUlELElBQUosQ0FBUyxLQUFLZCxTQUFkLENBQWI7QUFDQSxXQUFLRSxLQUFMLEdBQWFhLElBQWI7O0FBQ0EsNERBQWdCLEtBQUtkLFNBQXJCLDJDQUFnQztBQUFBLFlBQXJCZSxDQUFxQjtBQUM5QkQsUUFBQUEsSUFBSSxDQUFDTixPQUFMLENBQWFPLENBQWI7QUFDRDs7QUFDRCxXQUFLZixTQUFMLENBQWVNLE1BQWYsR0FBd0IsQ0FBeEI7QUFDRDtBQTNESDs7QUFBQTtBQUFBOztBQThEQTtBQUNBcEIsa0JBQWtCLENBQUNOLFNBQUQsQ0FBbEIsR0FBZ0MsRUFBaEM7O0FBRUE7QUFDQSxPQUFPLFNBQVNvQyxvQkFBVCxHQUFnQztBQUNyQzlCLEVBQUFBLGtCQUFrQixDQUFDTixTQUFELENBQWxCLEdBQWdDLEVBQWhDO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDIwIFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3XG4gKiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1Jlc2l6ZU9ic2VydmVyXG4gKlxuICogVGhpcyBpcyB0aGUgc3R1YiB0byBzdXBwb3J0IFJlc2l6ZU9ic2VydmVyLiBJdCdzIGluc3RhbGxlZCBmcm9tXG4gKiBwb2x5ZmlsbHMvcmVzaXplLW9ic2VydmVyLmpzIGFuZCB1cGdyYWRlZCBmcm9tIHRoZVxuICogYW1wLXJlc2l6ZS1vYnNlcnZlci1wb2x5ZmlsbCBleHRlbnNpb24uXG4gKi9cblxuLyoqIEB0eXBlZGVmIHtmdW5jdGlvbighdHlwZW9mIFJlc2l6ZU9ic2VydmVyKX0gKi9cbmxldCBSZXNPYnNVcGdyYWRlckRlZjtcblxuY29uc3QgVVBHUkFERVJTID0gJ191cGdyYWRlcnMnO1xuY29uc3QgU1RVQiA9ICdfc3R1Yic7XG5cbi8qKlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3VsZExvYWRQb2x5ZmlsbCh3aW4pIHtcbiAgcmV0dXJuICF3aW4uUmVzaXplT2JzZXJ2ZXIgfHwgISF3aW4uUmVzaXplT2JzZXJ2ZXJbU1RVQl07XG59XG5cbi8qKlxuICogSW5zdGFsbHMgdGhlIFJlc09iIHN0dWJzLlxuICpcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsU3R1Yih3aW4pIHtcbiAgaWYgKHdpbi5SZXNpemVPYnNlcnZlcikge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHdpbi5SZXNpemVPYnNlcnZlciA9IFJlc2l6ZU9ic2VydmVyU3R1YjtcbiAgd2luLlJlc2l6ZU9ic2VydmVyW1NUVUJdID0gUmVzaXplT2JzZXJ2ZXJTdHViO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKCl9IGluc3RhbGxlclxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBncmFkZVBvbHlmaWxsKHdpbiwgaW5zdGFsbGVyKSB7XG4gIC8vIENhbid0IHVzZSB0aGUgUmVzaXplT2JzZXJ2ZXJTdHViIGhlcmUgZGlyZWN0bHkgc2luY2UgaXQncyBhIHNlcGFyYXRlXG4gIC8vIGluc3RhbmNlIGRlcGxveWVkIGluIHYwLmpzIHZzIHRoZSBwb2x5ZmlsbCBleHRlbnNpb24uXG4gIGNvbnN0IFN0dWIgPSB3aW4uUmVzaXplT2JzZXJ2ZXJbU1RVQl07XG4gIGlmIChTdHViKSB7XG4gICAgZGVsZXRlIHdpbi5SZXNpemVPYnNlcnZlcjtcbiAgICBkZWxldGUgd2luLlJlc2l6ZU9ic2VydmVyRW50cnk7XG4gICAgaW5zdGFsbGVyKCk7XG5cbiAgICBjb25zdCBQb2x5ZmlsbCA9IHdpbi5SZXNpemVPYnNlcnZlcjtcbiAgICAvKiogQHR5cGUgeyFBcnJheTxSZXNPYnNVcGdyYWRlckRlZj59ICovXG4gICAgY29uc3QgdXBncmFkZXJzID0gU3R1YltVUEdSQURFUlNdLnNsaWNlKDApO1xuICAgIGNvbnN0IG1pY3JvdGFzayA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIGNvbnN0IHVwZ3JhZGUgPSAodXBncmFkZXIpID0+IHtcbiAgICAgIG1pY3JvdGFzay50aGVuKCgpID0+IHVwZ3JhZGVyKFBvbHlmaWxsKSk7XG4gICAgfTtcbiAgICBmb3IgKGNvbnN0IHVwZ3JhZGVyIG9mIHVwZ3JhZGVycykge1xuICAgICAgdXBncmFkZSh1cGdyYWRlcik7XG4gICAgfVxuICAgIFN0dWJbVVBHUkFERVJTXSA9IHsncHVzaCc6IHVwZ3JhZGV9O1xuICB9IGVsc2Uge1xuICAgIC8vIEV2ZW4gaWYgdGhpcyBpcyBub3QgdGhlIHN0dWIsIHdlIHN0aWxsIG1heSBuZWVkIHRvIGluc3RhbGwgdGhlIHBvbHlmaWxsLlxuICAgIC8vIFNlZSBgc2hvdWxkTG9hZFBvbHlmaWxsYCBmb3IgbW9yZSBpbmZvLlxuICAgIGluc3RhbGxlcigpO1xuICB9XG59XG5cbi8qKlxuICogVGhlIHN0dWIgZm9yIGBSZXNpemVPYnNlcnZlcmAuIEltcGxlbWVudHMgdGhlIHNhbWUgaW50ZXJmYWNlLCBidXRcbiAqIGtlZXBzIHRoZSB0cmFja2VkIGVsZW1lbnRzIGluIG1lbW9yeSB1bnRpbCB0aGUgYWN0dWFsIHBvbHlmaWxsIGFyaXZlcy5cbiAqIFRoaXMgc3R1YiBpcyBuZWNlc3NhcnkgYmVjYXVzZSB0aGUgcG9seWZpbGwgaXRzZWxmIGlzIHNpZ25pZmljYW50bHkgYmlnZ2VyLlxuICogSXQgZG9lc24ndCB0ZWNobmljYWxseSBleHRlbmQgUmVzaXplT2JzZXJ2ZXIsIGJ1dCB0aGlzIGFsbG93cyB0aGUgc3R1YlxuICogdG8gYmUgc2VlbiBhcyBlcXVpdmFsZW50IHdoZW4gdHlwZWNoZWNraW5nIGNhbGxzIGV4cGVjdGluZyBhIFJlc2l6ZU9ic2VydmVyLlxuICogQGV4dGVuZHMgUmVzaXplT2JzZXJ2ZXJcbiAqL1xuZXhwb3J0IGNsYXNzIFJlc2l6ZU9ic2VydmVyU3R1YiB7XG4gIC8qKiBAcGFyYW0geyFSZXNpemVPYnNlcnZlckNhbGxiYWNrfSBjYWxsYmFjayAqL1xuICBjb25zdHJ1Y3RvcihjYWxsYmFjaykge1xuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFSZXNpemVPYnNlcnZlckNhbGxiYWNrfSAqL1xuICAgIHRoaXMuY2FsbGJhY2tfID0gY2FsbGJhY2s7XG5cbiAgICAvKiogQHByaXZhdGUgeyFBcnJheTwhRWxlbWVudD59ICovXG4gICAgdGhpcy5lbGVtZW50c18gPSBbXTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P1Jlc2l6ZU9ic2VydmVyfSAqL1xuICAgIHRoaXMuaW5zdF8gPSBudWxsO1xuXG4gICAgLy8gV2FpdCBmb3IgdGhlIHVwZ3JhZGUuXG4gICAgUmVzaXplT2JzZXJ2ZXJTdHViW1VQR1JBREVSU10ucHVzaCh0aGlzLnVwZ3JhZGVfLmJpbmQodGhpcykpO1xuICB9XG5cbiAgLyoqIEByZXR1cm4ge3VuZGVmaW5lZH0gKi9cbiAgZGlzY29ubmVjdCgpIHtcbiAgICBpZiAodGhpcy5pbnN0Xykge1xuICAgICAgdGhpcy5pbnN0Xy5kaXNjb25uZWN0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZWxlbWVudHNfLmxlbmd0aCA9IDA7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBwYXJhbSB7IUVsZW1lbnR9IHRhcmdldCAqL1xuICBvYnNlcnZlKHRhcmdldCkge1xuICAgIGlmICh0aGlzLmluc3RfKSB7XG4gICAgICB0aGlzLmluc3RfLm9ic2VydmUodGFyZ2V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuZWxlbWVudHNfLmluZGV4T2YodGFyZ2V0KSA9PSAtMSkge1xuICAgICAgICB0aGlzLmVsZW1lbnRzXy5wdXNoKHRhcmdldCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIEBwYXJhbSB7IUVsZW1lbnR9IHRhcmdldCAqL1xuICB1bm9ic2VydmUodGFyZ2V0KSB7XG4gICAgaWYgKHRoaXMuaW5zdF8pIHtcbiAgICAgIHRoaXMuaW5zdF8udW5vYnNlcnZlKHRhcmdldCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5lbGVtZW50c18uaW5kZXhPZih0YXJnZXQpO1xuICAgICAgaWYgKGluZGV4ICE9IC0xKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNfLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IXR5cGVvZiBSZXNpemVPYnNlcnZlcn0gQ3RvclxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdXBncmFkZV8oQ3Rvcikge1xuICAgIGNvbnN0IGluc3QgPSBuZXcgQ3Rvcih0aGlzLmNhbGxiYWNrXyk7XG4gICAgdGhpcy5pbnN0XyA9IGluc3Q7XG4gICAgZm9yIChjb25zdCBlIG9mIHRoaXMuZWxlbWVudHNfKSB7XG4gICAgICBpbnN0Lm9ic2VydmUoZSk7XG4gICAgfVxuICAgIHRoaXMuZWxlbWVudHNfLmxlbmd0aCA9IDA7XG4gIH1cbn1cblxuLyoqIEB0eXBlIHshQXJyYXk8IVJlc09ic1VwZ3JhZGVyRGVmPn0gKi9cblJlc2l6ZU9ic2VydmVyU3R1YltVUEdSQURFUlNdID0gW107XG5cbi8qKiBAdmlzaWJsZUZvclRlc3RpbmcgKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldFN0dWJzRm9yVGVzdGluZygpIHtcbiAgUmVzaXplT2JzZXJ2ZXJTdHViW1VQR1JBREVSU10gPSBbXTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/polyfills/stubs/resize-observer-stub.js