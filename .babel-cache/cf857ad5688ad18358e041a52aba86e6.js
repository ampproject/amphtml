function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import { devAssert, devAssertElement } from "../core/assert";
import { computedStyle } from "../core/dom/style";
import { dev } from "../log";

/** @typedef {
 *    function(!Element, !Object<string, string>): *
 *  }
 */
export var VisitorCallbackTypeDef;

/**
 * Utility class that will visit every ancestor of a given element, and call
 * the provided callback functions on each element, passing in the element and
 * its computed styles as arguments to the callbacks. Callbacks may cease
 * visiting further nodes by returning a value, which may later be retrived by
 * calling 'getValueFor(visitorName)'. Once all visitors have returned or hit
 * their maximum nodes to visit, no more nodes will be visited.
 *
 * Example usage:
 * new DomAncestorVisitor()
 *   .addVisitor((el, style) => { ... })
 *   .addVisitor((el, style) => { ... })
 *   ...
 *   .visitAncestorsStartingFrom(someElement);
 */
export var DomAncestorVisitor = /*#__PURE__*/function () {
  /** @param {!Window=} win */
  function DomAncestorVisitor(win) {
    if (win === void 0) {
      win = window;
    }

    _classCallCheck(this, DomAncestorVisitor);

    /**
     * List of tasks to execute during each visit.
     * @private @const {!Array<!Visitor>}
     */
    this.visitors_ = [];

    /** @private @const {!Window} */
    this.win_ = win;
  }

  /**
   * Returns a list of visitors that have not yet been marked completed.
   * @return {!Array<!Visitor>}
   * @private
   */
  _createClass(DomAncestorVisitor, [{
    key: "getActiveVisitors_",
    value: function getActiveVisitors_() {
      return this.visitors_.filter(function (visitor) {
        return !visitor.complete;
      });
    }
    /**
     * @param {!VisitorCallbackTypeDef} callback
     * @param {number=} maxAncestorsToVisit The limit of how many ancestors this
     *   task should be executed on. Must be positive.
     * @return {!DomAncestorVisitor}
     */

  }, {
    key: "addVisitor",
    value: function addVisitor(callback, maxAncestorsToVisit) {
      if (maxAncestorsToVisit === void 0) {
        maxAncestorsToVisit = 100;
      }

      this.visitors_.push(new Visitor(callback, maxAncestorsToVisit));
      return this;
    }
    /**
     * @param {?Element} element
     */

  }, {
    key: "visitAncestorsStartingFrom",
    value: function visitAncestorsStartingFrom(element) {
      var _this = this;

      var el = element;
      var visitors = [];

      var _loop = function _loop() {
        var style = computedStyle(_this.win_, el);
        visitors.forEach(function (visitor) {
          return visitor.callback(devAssertElement(el), style);
        });
        el = el.parentElement;
      };

      while (el && (visitors = this.getActiveVisitors_()).length) {
        _loop();
      }

      this.visitors_.forEach(function (visitor) {
        return visitor.complete = true;
      });
    }
  }]);

  return DomAncestorVisitor;
}();

var Visitor = /*#__PURE__*/function () {
  /**
   * @param {!VisitorCallbackTypeDef} callback
   * @param {number} maxAncestorsToVisit
   */
  function Visitor(callback, maxAncestorsToVisit) {
    _classCallCheck(this, Visitor);

    devAssert(maxAncestorsToVisit > 0, 'maxAncestorsToVisit must be a positive value.');

    /** @private @const {!VisitorCallbackTypeDef} */
    this.callback_ = callback;

    /** @private {number} */
    this.maxAncestorsToVisit_ = maxAncestorsToVisit;

    /** @type {boolean} */
    this.complete = false;
  }

  /**
   * @param {!Element} element
   * @param {!Object<string, string>} style
   */
  _createClass(Visitor, [{
    key: "callback",
    value: function callback(element, style) {
      devAssert(!this.complete, 'Attempted to execute callback on completed visitor.');
      var result;

      try {
        result = this.callback_(element, style);
      } catch (e) {
        dev().warn('DOM-ANCESTOR-VISITOR', "Visitor encountered error during callback execution: \"" + e + "\".");
      }

      if (! --this.maxAncestorsToVisit_ || result != undefined) {
        this.complete = true;
      }
    }
  }]);

  return Visitor;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvbS1hbmNlc3Rvci12aXNpdG9yLmpzIl0sIm5hbWVzIjpbImRldkFzc2VydCIsImRldkFzc2VydEVsZW1lbnQiLCJjb21wdXRlZFN0eWxlIiwiZGV2IiwiVmlzaXRvckNhbGxiYWNrVHlwZURlZiIsIkRvbUFuY2VzdG9yVmlzaXRvciIsIndpbiIsIndpbmRvdyIsInZpc2l0b3JzXyIsIndpbl8iLCJmaWx0ZXIiLCJ2aXNpdG9yIiwiY29tcGxldGUiLCJjYWxsYmFjayIsIm1heEFuY2VzdG9yc1RvVmlzaXQiLCJwdXNoIiwiVmlzaXRvciIsImVsZW1lbnQiLCJlbCIsInZpc2l0b3JzIiwic3R5bGUiLCJmb3JFYWNoIiwicGFyZW50RWxlbWVudCIsImdldEFjdGl2ZVZpc2l0b3JzXyIsImxlbmd0aCIsImNhbGxiYWNrXyIsIm1heEFuY2VzdG9yc1RvVmlzaXRfIiwicmVzdWx0IiwiZSIsIndhcm4iLCJ1bmRlZmluZWQiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVFBLFNBQVIsRUFBbUJDLGdCQUFuQjtBQUNBLFNBQVFDLGFBQVI7QUFFQSxTQUFRQyxHQUFSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFJQyxzQkFBSjs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFhQyxrQkFBYjtBQUNFO0FBQ0EsOEJBQVlDLEdBQVosRUFBMEI7QUFBQSxRQUFkQSxHQUFjO0FBQWRBLE1BQUFBLEdBQWMsR0FBUkMsTUFBUTtBQUFBOztBQUFBOztBQUN4QjtBQUNKO0FBQ0E7QUFDQTtBQUNJLFNBQUtDLFNBQUwsR0FBaUIsRUFBakI7O0FBRUE7QUFDQSxTQUFLQyxJQUFMLEdBQVlILEdBQVo7QUFDRDs7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBakJBO0FBQUE7QUFBQSxXQWtCRSw4QkFBcUI7QUFDbkIsYUFBTyxLQUFLRSxTQUFMLENBQWVFLE1BQWYsQ0FBc0IsVUFBQ0MsT0FBRDtBQUFBLGVBQWEsQ0FBQ0EsT0FBTyxDQUFDQyxRQUF0QjtBQUFBLE9BQXRCLENBQVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUEzQkE7QUFBQTtBQUFBLFdBNEJFLG9CQUFXQyxRQUFYLEVBQXFCQyxtQkFBckIsRUFBZ0Q7QUFBQSxVQUEzQkEsbUJBQTJCO0FBQTNCQSxRQUFBQSxtQkFBMkIsR0FBTCxHQUFLO0FBQUE7O0FBQzlDLFdBQUtOLFNBQUwsQ0FBZU8sSUFBZixDQUFvQixJQUFJQyxPQUFKLENBQVlILFFBQVosRUFBc0JDLG1CQUF0QixDQUFwQjtBQUNBLGFBQU8sSUFBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBOztBQW5DQTtBQUFBO0FBQUEsV0FvQ0Usb0NBQTJCRyxPQUEzQixFQUFvQztBQUFBOztBQUNsQyxVQUFJQyxFQUFFLEdBQUdELE9BQVQ7QUFDQSxVQUFJRSxRQUFRLEdBQUcsRUFBZjs7QUFGa0M7QUFJaEMsWUFBTUMsS0FBSyxHQUFHbEIsYUFBYSxDQUFDLEtBQUksQ0FBQ08sSUFBTixFQUFZUyxFQUFaLENBQTNCO0FBQ0FDLFFBQUFBLFFBQVEsQ0FBQ0UsT0FBVCxDQUFpQixVQUFDVixPQUFEO0FBQUEsaUJBQ2ZBLE9BQU8sQ0FBQ0UsUUFBUixDQUFpQlosZ0JBQWdCLENBQUNpQixFQUFELENBQWpDLEVBQXVDRSxLQUF2QyxDQURlO0FBQUEsU0FBakI7QUFHQUYsUUFBQUEsRUFBRSxHQUFHQSxFQUFFLENBQUNJLGFBQVI7QUFSZ0M7O0FBR2xDLGFBQU9KLEVBQUUsSUFBSSxDQUFDQyxRQUFRLEdBQUcsS0FBS0ksa0JBQUwsRUFBWixFQUF1Q0MsTUFBcEQsRUFBNEQ7QUFBQTtBQU0zRDs7QUFDRCxXQUFLaEIsU0FBTCxDQUFlYSxPQUFmLENBQXVCLFVBQUNWLE9BQUQ7QUFBQSxlQUFjQSxPQUFPLENBQUNDLFFBQVIsR0FBbUIsSUFBakM7QUFBQSxPQUF2QjtBQUNEO0FBL0NIOztBQUFBO0FBQUE7O0lBa0RNSSxPO0FBQ0o7QUFDRjtBQUNBO0FBQ0E7QUFDRSxtQkFBWUgsUUFBWixFQUFzQkMsbUJBQXRCLEVBQTJDO0FBQUE7O0FBQ3pDZCxJQUFBQSxTQUFTLENBQ1BjLG1CQUFtQixHQUFHLENBRGYsRUFFUCwrQ0FGTyxDQUFUOztBQUtBO0FBQ0EsU0FBS1csU0FBTCxHQUFpQlosUUFBakI7O0FBRUE7QUFDQSxTQUFLYSxvQkFBTCxHQUE0QlosbUJBQTVCOztBQUVBO0FBQ0EsU0FBS0YsUUFBTCxHQUFnQixLQUFoQjtBQUNEOztBQUVEO0FBQ0Y7QUFDQTtBQUNBOzs7V0FDRSxrQkFBU0ssT0FBVCxFQUFrQkcsS0FBbEIsRUFBeUI7QUFDdkJwQixNQUFBQSxTQUFTLENBQ1AsQ0FBQyxLQUFLWSxRQURDLEVBRVAscURBRk8sQ0FBVDtBQUlBLFVBQUllLE1BQUo7O0FBQ0EsVUFBSTtBQUNGQSxRQUFBQSxNQUFNLEdBQUcsS0FBS0YsU0FBTCxDQUFlUixPQUFmLEVBQXdCRyxLQUF4QixDQUFUO0FBQ0QsT0FGRCxDQUVFLE9BQU9RLENBQVAsRUFBVTtBQUNWekIsUUFBQUEsR0FBRyxHQUFHMEIsSUFBTixDQUNFLHNCQURGLDhEQUUyREQsQ0FGM0Q7QUFJRDs7QUFDRCxVQUFJLENBQUMsR0FBRSxLQUFLRixvQkFBUixJQUFnQ0MsTUFBTSxJQUFJRyxTQUE5QyxFQUF5RDtBQUN2RCxhQUFLbEIsUUFBTCxHQUFnQixJQUFoQjtBQUNEO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE5IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbmltcG9ydCB7ZGV2QXNzZXJ0LCBkZXZBc3NlcnRFbGVtZW50fSBmcm9tICcjY29yZS9hc3NlcnQnO1xuaW1wb3J0IHtjb21wdXRlZFN0eWxlfSBmcm9tICcjY29yZS9kb20vc3R5bGUnO1xuXG5pbXBvcnQge2Rldn0gZnJvbSAnLi4vbG9nJztcblxuLyoqIEB0eXBlZGVmIHtcbiAqICAgIGZ1bmN0aW9uKCFFbGVtZW50LCAhT2JqZWN0PHN0cmluZywgc3RyaW5nPik6ICpcbiAqICB9XG4gKi9cbmV4cG9ydCBsZXQgVmlzaXRvckNhbGxiYWNrVHlwZURlZjtcblxuLyoqXG4gKiBVdGlsaXR5IGNsYXNzIHRoYXQgd2lsbCB2aXNpdCBldmVyeSBhbmNlc3RvciBvZiBhIGdpdmVuIGVsZW1lbnQsIGFuZCBjYWxsXG4gKiB0aGUgcHJvdmlkZWQgY2FsbGJhY2sgZnVuY3Rpb25zIG9uIGVhY2ggZWxlbWVudCwgcGFzc2luZyBpbiB0aGUgZWxlbWVudCBhbmRcbiAqIGl0cyBjb21wdXRlZCBzdHlsZXMgYXMgYXJndW1lbnRzIHRvIHRoZSBjYWxsYmFja3MuIENhbGxiYWNrcyBtYXkgY2Vhc2VcbiAqIHZpc2l0aW5nIGZ1cnRoZXIgbm9kZXMgYnkgcmV0dXJuaW5nIGEgdmFsdWUsIHdoaWNoIG1heSBsYXRlciBiZSByZXRyaXZlZCBieVxuICogY2FsbGluZyAnZ2V0VmFsdWVGb3IodmlzaXRvck5hbWUpJy4gT25jZSBhbGwgdmlzaXRvcnMgaGF2ZSByZXR1cm5lZCBvciBoaXRcbiAqIHRoZWlyIG1heGltdW0gbm9kZXMgdG8gdmlzaXQsIG5vIG1vcmUgbm9kZXMgd2lsbCBiZSB2aXNpdGVkLlxuICpcbiAqIEV4YW1wbGUgdXNhZ2U6XG4gKiBuZXcgRG9tQW5jZXN0b3JWaXNpdG9yKClcbiAqICAgLmFkZFZpc2l0b3IoKGVsLCBzdHlsZSkgPT4geyAuLi4gfSlcbiAqICAgLmFkZFZpc2l0b3IoKGVsLCBzdHlsZSkgPT4geyAuLi4gfSlcbiAqICAgLi4uXG4gKiAgIC52aXNpdEFuY2VzdG9yc1N0YXJ0aW5nRnJvbShzb21lRWxlbWVudCk7XG4gKi9cbmV4cG9ydCBjbGFzcyBEb21BbmNlc3RvclZpc2l0b3Ige1xuICAvKiogQHBhcmFtIHshV2luZG93PX0gd2luICovXG4gIGNvbnN0cnVjdG9yKHdpbiA9IHdpbmRvdykge1xuICAgIC8qKlxuICAgICAqIExpc3Qgb2YgdGFza3MgdG8gZXhlY3V0ZSBkdXJpbmcgZWFjaCB2aXNpdC5cbiAgICAgKiBAcHJpdmF0ZSBAY29uc3QgeyFBcnJheTwhVmlzaXRvcj59XG4gICAgICovXG4gICAgdGhpcy52aXNpdG9yc18gPSBbXTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFXaW5kb3d9ICovXG4gICAgdGhpcy53aW5fID0gd2luO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBsaXN0IG9mIHZpc2l0b3JzIHRoYXQgaGF2ZSBub3QgeWV0IGJlZW4gbWFya2VkIGNvbXBsZXRlZC5cbiAgICogQHJldHVybiB7IUFycmF5PCFWaXNpdG9yPn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldEFjdGl2ZVZpc2l0b3JzXygpIHtcbiAgICByZXR1cm4gdGhpcy52aXNpdG9yc18uZmlsdGVyKCh2aXNpdG9yKSA9PiAhdmlzaXRvci5jb21wbGV0ZSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshVmlzaXRvckNhbGxiYWNrVHlwZURlZn0gY2FsbGJhY2tcbiAgICogQHBhcmFtIHtudW1iZXI9fSBtYXhBbmNlc3RvcnNUb1Zpc2l0IFRoZSBsaW1pdCBvZiBob3cgbWFueSBhbmNlc3RvcnMgdGhpc1xuICAgKiAgIHRhc2sgc2hvdWxkIGJlIGV4ZWN1dGVkIG9uLiBNdXN0IGJlIHBvc2l0aXZlLlxuICAgKiBAcmV0dXJuIHshRG9tQW5jZXN0b3JWaXNpdG9yfVxuICAgKi9cbiAgYWRkVmlzaXRvcihjYWxsYmFjaywgbWF4QW5jZXN0b3JzVG9WaXNpdCA9IDEwMCkge1xuICAgIHRoaXMudmlzaXRvcnNfLnB1c2gobmV3IFZpc2l0b3IoY2FsbGJhY2ssIG1heEFuY2VzdG9yc1RvVmlzaXQpKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gez9FbGVtZW50fSBlbGVtZW50XG4gICAqL1xuICB2aXNpdEFuY2VzdG9yc1N0YXJ0aW5nRnJvbShlbGVtZW50KSB7XG4gICAgbGV0IGVsID0gZWxlbWVudDtcbiAgICBsZXQgdmlzaXRvcnMgPSBbXTtcbiAgICB3aGlsZSAoZWwgJiYgKHZpc2l0b3JzID0gdGhpcy5nZXRBY3RpdmVWaXNpdG9yc18oKSkubGVuZ3RoKSB7XG4gICAgICBjb25zdCBzdHlsZSA9IGNvbXB1dGVkU3R5bGUodGhpcy53aW5fLCBlbCk7XG4gICAgICB2aXNpdG9ycy5mb3JFYWNoKCh2aXNpdG9yKSA9PlxuICAgICAgICB2aXNpdG9yLmNhbGxiYWNrKGRldkFzc2VydEVsZW1lbnQoZWwpLCBzdHlsZSlcbiAgICAgICk7XG4gICAgICBlbCA9IGVsLnBhcmVudEVsZW1lbnQ7XG4gICAgfVxuICAgIHRoaXMudmlzaXRvcnNfLmZvckVhY2goKHZpc2l0b3IpID0+ICh2aXNpdG9yLmNvbXBsZXRlID0gdHJ1ZSkpO1xuICB9XG59XG5cbmNsYXNzIFZpc2l0b3Ige1xuICAvKipcbiAgICogQHBhcmFtIHshVmlzaXRvckNhbGxiYWNrVHlwZURlZn0gY2FsbGJhY2tcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1heEFuY2VzdG9yc1RvVmlzaXRcbiAgICovXG4gIGNvbnN0cnVjdG9yKGNhbGxiYWNrLCBtYXhBbmNlc3RvcnNUb1Zpc2l0KSB7XG4gICAgZGV2QXNzZXJ0KFxuICAgICAgbWF4QW5jZXN0b3JzVG9WaXNpdCA+IDAsXG4gICAgICAnbWF4QW5jZXN0b3JzVG9WaXNpdCBtdXN0IGJlIGEgcG9zaXRpdmUgdmFsdWUuJ1xuICAgICk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshVmlzaXRvckNhbGxiYWNrVHlwZURlZn0gKi9cbiAgICB0aGlzLmNhbGxiYWNrXyA9IGNhbGxiYWNrO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy5tYXhBbmNlc3RvcnNUb1Zpc2l0XyA9IG1heEFuY2VzdG9yc1RvVmlzaXQ7XG5cbiAgICAvKiogQHR5cGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5jb21wbGV0ZSA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHBhcmFtIHshT2JqZWN0PHN0cmluZywgc3RyaW5nPn0gc3R5bGVcbiAgICovXG4gIGNhbGxiYWNrKGVsZW1lbnQsIHN0eWxlKSB7XG4gICAgZGV2QXNzZXJ0KFxuICAgICAgIXRoaXMuY29tcGxldGUsXG4gICAgICAnQXR0ZW1wdGVkIHRvIGV4ZWN1dGUgY2FsbGJhY2sgb24gY29tcGxldGVkIHZpc2l0b3IuJ1xuICAgICk7XG4gICAgbGV0IHJlc3VsdDtcbiAgICB0cnkge1xuICAgICAgcmVzdWx0ID0gdGhpcy5jYWxsYmFja18oZWxlbWVudCwgc3R5bGUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGRldigpLndhcm4oXG4gICAgICAgICdET00tQU5DRVNUT1ItVklTSVRPUicsXG4gICAgICAgIGBWaXNpdG9yIGVuY291bnRlcmVkIGVycm9yIGR1cmluZyBjYWxsYmFjayBleGVjdXRpb246IFwiJHtlfVwiLmBcbiAgICAgICk7XG4gICAgfVxuICAgIGlmICghLS10aGlzLm1heEFuY2VzdG9yc1RvVmlzaXRfIHx8IHJlc3VsdCAhPSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuY29tcGxldGUgPSB0cnVlO1xuICAgIH1cbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/src/utils/dom-ancestor-visitor.js