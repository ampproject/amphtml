function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
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
  function Observable() {
    _classCallCheck(this, Observable);

    /** @type {?Array<function(TYPE)>} */
    this.handlers_ = null;
  }

  /**
   * Adds the observer to this instance.
   * @param {function(TYPE)} handler Observer's handler.
   * @return {!UnlistenDef}
   */
  _createClass(Observable, [{
    key: "add",
    value: function add(handler) {
      var _this = this;

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
     */

  }, {
    key: "remove",
    value: function remove(handler) {
      if (!this.handlers_) {
        return;
      }

      removeItem(this.handlers_, handler);
    }
    /**
     * Removes all observers.
     */

  }, {
    key: "removeAll",
    value: function removeAll() {
      if (!this.handlers_) {
        return;
      }

      this.handlers_.length = 0;
    }
    /**
     * Fires an event. All observers are called.
     * @param {TYPE=} opt_event
     */

  }, {
    key: "fire",
    value: function fire(opt_event) {
      if (!this.handlers_) {
        return;
      }

      for (var _iterator = _createForOfIteratorHelperLoose(this.handlers_), _step; !(_step = _iterator()).done;) {
        var handler = _step.value;
        handler(opt_event);
      }
    }
    /**
     * Returns number of handlers. Mostly needed for tests.
     * @return {number}
     */

  }, {
    key: "getHandlerCount",
    value: function getHandlerCount() {
      var _this$handlers_$lengt, _this$handlers_;

      return (_this$handlers_$lengt = (_this$handlers_ = this.handlers_) == null ? void 0 : _this$handlers_.length) != null ? _this$handlers_$lengt : 0;
    }
  }]);

  return Observable;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9ic2VydmFibGUuanMiXSwibmFtZXMiOlsicmVtb3ZlSXRlbSIsIk9ic2VydmFibGUiLCJoYW5kbGVyc18iLCJoYW5kbGVyIiwicHVzaCIsInJlbW92ZSIsImxlbmd0aCIsIm9wdF9ldmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsVUFBUjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBYUMsVUFBYjtBQUNFO0FBQ0Y7QUFDQTtBQUNFLHdCQUFjO0FBQUE7O0FBQ1o7QUFDQSxTQUFLQyxTQUFMLEdBQWlCLElBQWpCO0FBQ0Q7O0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQWJBO0FBQUE7QUFBQSxXQWNFLGFBQUlDLE9BQUosRUFBYTtBQUFBOztBQUNYLFVBQUksQ0FBQyxLQUFLRCxTQUFWLEVBQXFCO0FBQ25CLGFBQUtBLFNBQUwsR0FBaUIsRUFBakI7QUFDRDs7QUFDRCxXQUFLQSxTQUFMLENBQWVFLElBQWYsQ0FBb0JELE9BQXBCO0FBQ0EsYUFBTyxZQUFNO0FBQ1gsUUFBQSxLQUFJLENBQUNFLE1BQUwsQ0FBWUYsT0FBWjtBQUNELE9BRkQ7QUFHRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQTNCQTtBQUFBO0FBQUEsV0E0QkUsZ0JBQU9BLE9BQVAsRUFBZ0I7QUFDZCxVQUFJLENBQUMsS0FBS0QsU0FBVixFQUFxQjtBQUNuQjtBQUNEOztBQUNERixNQUFBQSxVQUFVLENBQUMsS0FBS0UsU0FBTixFQUFpQkMsT0FBakIsQ0FBVjtBQUNEO0FBRUQ7QUFDRjtBQUNBOztBQXJDQTtBQUFBO0FBQUEsV0FzQ0UscUJBQVk7QUFDVixVQUFJLENBQUMsS0FBS0QsU0FBVixFQUFxQjtBQUNuQjtBQUNEOztBQUNELFdBQUtBLFNBQUwsQ0FBZUksTUFBZixHQUF3QixDQUF4QjtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBaERBO0FBQUE7QUFBQSxXQWlERSxjQUFLQyxTQUFMLEVBQWdCO0FBQ2QsVUFBSSxDQUFDLEtBQUtMLFNBQVYsRUFBcUI7QUFDbkI7QUFDRDs7QUFDRCwyREFBc0IsS0FBS0EsU0FBM0Isd0NBQXNDO0FBQUEsWUFBM0JDLE9BQTJCO0FBQ3BDQSxRQUFBQSxPQUFPLENBQUNJLFNBQUQsQ0FBUDtBQUNEO0FBQ0Y7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUE3REE7QUFBQTtBQUFBLFdBOERFLDJCQUFrQjtBQUFBOztBQUNoQix5REFBTyxLQUFLTCxTQUFaLHFCQUFPLGdCQUFnQkksTUFBdkIsb0NBQWlDLENBQWpDO0FBQ0Q7QUFoRUg7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTUgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge3JlbW92ZUl0ZW19IGZyb20gJyNjb3JlL3R5cGVzL2FycmF5JztcblxuLyoqXG4gKiBUaGlzIGNsYXNzIGhlbHBzIHRvIG1hbmFnZSBvYnNlcnZlcnMuIE9ic2VydmVycyBjYW4gYmUgYWRkZWQsIHJlbW92ZWQgb3JcbiAqIGZpcmVkIHRocm91Z2ggYW5kIGluc3RhbmNlIG9mIHRoaXMgY2xhc3MuXG4gKiBAdGVtcGxhdGUgVFlQRVxuICovXG5leHBvcnQgY2xhc3MgT2JzZXJ2YWJsZSB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIE9ic2VydmFibGUuXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICAvKiogQHR5cGUgez9BcnJheTxmdW5jdGlvbihUWVBFKT59ICovXG4gICAgdGhpcy5oYW5kbGVyc18gPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgdGhlIG9ic2VydmVyIHRvIHRoaXMgaW5zdGFuY2UuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oVFlQRSl9IGhhbmRsZXIgT2JzZXJ2ZXIncyBoYW5kbGVyLlxuICAgKiBAcmV0dXJuIHshVW5saXN0ZW5EZWZ9XG4gICAqL1xuICBhZGQoaGFuZGxlcikge1xuICAgIGlmICghdGhpcy5oYW5kbGVyc18pIHtcbiAgICAgIHRoaXMuaGFuZGxlcnNfID0gW107XG4gICAgfVxuICAgIHRoaXMuaGFuZGxlcnNfLnB1c2goaGFuZGxlcik7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHRoaXMucmVtb3ZlKGhhbmRsZXIpO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyB0aGUgb2JzZXJ2ZXIgZnJvbSB0aGlzIGluc3RhbmNlLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKFRZUEUpfSBoYW5kbGVyIE9ic2VydmVyJ3MgaW5zdGFuY2UuXG4gICAqL1xuICByZW1vdmUoaGFuZGxlcikge1xuICAgIGlmICghdGhpcy5oYW5kbGVyc18pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmVtb3ZlSXRlbSh0aGlzLmhhbmRsZXJzXywgaGFuZGxlcik7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhbGwgb2JzZXJ2ZXJzLlxuICAgKi9cbiAgcmVtb3ZlQWxsKCkge1xuICAgIGlmICghdGhpcy5oYW5kbGVyc18pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5oYW5kbGVyc18ubGVuZ3RoID0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaXJlcyBhbiBldmVudC4gQWxsIG9ic2VydmVycyBhcmUgY2FsbGVkLlxuICAgKiBAcGFyYW0ge1RZUEU9fSBvcHRfZXZlbnRcbiAgICovXG4gIGZpcmUob3B0X2V2ZW50KSB7XG4gICAgaWYgKCF0aGlzLmhhbmRsZXJzXykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGhhbmRsZXIgb2YgdGhpcy5oYW5kbGVyc18pIHtcbiAgICAgIGhhbmRsZXIob3B0X2V2ZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBudW1iZXIgb2YgaGFuZGxlcnMuIE1vc3RseSBuZWVkZWQgZm9yIHRlc3RzLlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqL1xuICBnZXRIYW5kbGVyQ291bnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaGFuZGxlcnNfPy5sZW5ndGggPz8gMDtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/src/core/data-structures/observable.js