function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import { Layout, applyFillContent, isLayoutSizeDefined } from "../../core/dom/layout";
import { realChildNodes } from "../../core/dom/query";
import { registerElement } from "../../service/custom-element-registry";
import { BaseElement } from "../../base-element";
import { getEffectiveLayout } from "../../static-layout";
export var AmpLayout = /*#__PURE__*/function (_BaseElement) {
  _inherits(AmpLayout, _BaseElement);

  var _super = _createSuper(AmpLayout);

  function AmpLayout() {
    _classCallCheck(this, AmpLayout);

    return _super.apply(this, arguments);
  }

  _createClass(AmpLayout, [{
    key: "isLayoutSupported",
    value:
    /** @override */
    function isLayoutSupported(layout) {
      return layout == Layout.CONTAINER || isLayoutSizeDefined(layout);
    }
    /** @override */

  }, {
    key: "buildCallback",
    value: function buildCallback() {
      buildDom(this.element);
    }
  }], [{
    key: "prerenderAllowed",
    value:
    /** @override @nocollapse */
    function prerenderAllowed() {
      return true;
    }
  }]);

  return AmpLayout;
}(BaseElement);

/**
 * @see amphtml/compiler/types.js for full description
 *
 * @param {!Element} element
 */
export function buildDom(element) {
  var layout = getEffectiveLayout(element);

  if (layout == Layout.CONTAINER) {
    return;
  }

  var doc = element.ownerDocument;
  var container = doc.createElement('div');
  applyFillContent(container);
  realChildNodes(element).forEach(function (child) {
    container.appendChild(child);
  });
  element.appendChild(container);
}

/**
 * @param {!Window} win Destination window for the new element.
 */
export function installLayout(win) {
  registerElement(win, 'amp-layout', AmpLayout);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1sYXlvdXQuanMiXSwibmFtZXMiOlsiTGF5b3V0IiwiYXBwbHlGaWxsQ29udGVudCIsImlzTGF5b3V0U2l6ZURlZmluZWQiLCJyZWFsQ2hpbGROb2RlcyIsInJlZ2lzdGVyRWxlbWVudCIsIkJhc2VFbGVtZW50IiwiZ2V0RWZmZWN0aXZlTGF5b3V0IiwiQW1wTGF5b3V0IiwibGF5b3V0IiwiQ09OVEFJTkVSIiwiYnVpbGREb20iLCJlbGVtZW50IiwiZG9jIiwib3duZXJEb2N1bWVudCIsImNvbnRhaW5lciIsImNyZWF0ZUVsZW1lbnQiLCJmb3JFYWNoIiwiY2hpbGQiLCJhcHBlbmRDaGlsZCIsImluc3RhbGxMYXlvdXQiLCJ3aW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsTUFBUixFQUFnQkMsZ0JBQWhCLEVBQWtDQyxtQkFBbEM7QUFDQSxTQUFRQyxjQUFSO0FBRUEsU0FBUUMsZUFBUjtBQUVBLFNBQVFDLFdBQVI7QUFDQSxTQUFRQyxrQkFBUjtBQUVBLFdBQWFDLFNBQWI7QUFBQTs7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBTUU7QUFDQSwrQkFBa0JDLE1BQWxCLEVBQTBCO0FBQ3hCLGFBQU9BLE1BQU0sSUFBSVIsTUFBTSxDQUFDUyxTQUFqQixJQUE4QlAsbUJBQW1CLENBQUNNLE1BQUQsQ0FBeEQ7QUFDRDtBQUVEOztBQVhGO0FBQUE7QUFBQSxXQVlFLHlCQUFnQjtBQUNkRSxNQUFBQSxRQUFRLENBQUMsS0FBS0MsT0FBTixDQUFSO0FBQ0Q7QUFkSDtBQUFBO0FBQUE7QUFDRTtBQUNBLGdDQUEwQjtBQUN4QixhQUFPLElBQVA7QUFDRDtBQUpIOztBQUFBO0FBQUEsRUFBK0JOLFdBQS9COztBQWlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTSyxRQUFULENBQWtCQyxPQUFsQixFQUEyQjtBQUNoQyxNQUFNSCxNQUFNLEdBQUdGLGtCQUFrQixDQUFDSyxPQUFELENBQWpDOztBQUNBLE1BQUlILE1BQU0sSUFBSVIsTUFBTSxDQUFDUyxTQUFyQixFQUFnQztBQUM5QjtBQUNEOztBQUVELE1BQU1HLEdBQUcsR0FBR0QsT0FBTyxDQUFDRSxhQUFwQjtBQUNBLE1BQU1DLFNBQVMsR0FBR0YsR0FBRyxDQUFDRyxhQUFKLENBQWtCLEtBQWxCLENBQWxCO0FBQ0FkLEVBQUFBLGdCQUFnQixDQUFDYSxTQUFELENBQWhCO0FBQ0FYLEVBQUFBLGNBQWMsQ0FBQ1EsT0FBRCxDQUFkLENBQXdCSyxPQUF4QixDQUFnQyxVQUFDQyxLQUFELEVBQVc7QUFDekNILElBQUFBLFNBQVMsQ0FBQ0ksV0FBVixDQUFzQkQsS0FBdEI7QUFDRCxHQUZEO0FBR0FOLEVBQUFBLE9BQU8sQ0FBQ08sV0FBUixDQUFvQkosU0FBcEI7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNLLGFBQVQsQ0FBdUJDLEdBQXZCLEVBQTRCO0FBQ2pDaEIsRUFBQUEsZUFBZSxDQUFDZ0IsR0FBRCxFQUFNLFlBQU4sRUFBb0JiLFNBQXBCLENBQWY7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge0xheW91dCwgYXBwbHlGaWxsQ29udGVudCwgaXNMYXlvdXRTaXplRGVmaW5lZH0gZnJvbSAnI2NvcmUvZG9tL2xheW91dCc7XG5pbXBvcnQge3JlYWxDaGlsZE5vZGVzfSBmcm9tICcjY29yZS9kb20vcXVlcnknO1xuXG5pbXBvcnQge3JlZ2lzdGVyRWxlbWVudH0gZnJvbSAnI3NlcnZpY2UvY3VzdG9tLWVsZW1lbnQtcmVnaXN0cnknO1xuXG5pbXBvcnQge0Jhc2VFbGVtZW50fSBmcm9tICcuLi8uLi9iYXNlLWVsZW1lbnQnO1xuaW1wb3J0IHtnZXRFZmZlY3RpdmVMYXlvdXR9IGZyb20gJy4uLy4uL3N0YXRpYy1sYXlvdXQnO1xuXG5leHBvcnQgY2xhc3MgQW1wTGF5b3V0IGV4dGVuZHMgQmFzZUVsZW1lbnQge1xuICAvKiogQG92ZXJyaWRlIEBub2NvbGxhcHNlICovXG4gIHN0YXRpYyBwcmVyZW5kZXJBbGxvd2VkKCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBpc0xheW91dFN1cHBvcnRlZChsYXlvdXQpIHtcbiAgICByZXR1cm4gbGF5b3V0ID09IExheW91dC5DT05UQUlORVIgfHwgaXNMYXlvdXRTaXplRGVmaW5lZChsYXlvdXQpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBidWlsZENhbGxiYWNrKCkge1xuICAgIGJ1aWxkRG9tKHRoaXMuZWxlbWVudCk7XG4gIH1cbn1cblxuLyoqXG4gKiBAc2VlIGFtcGh0bWwvY29tcGlsZXIvdHlwZXMuanMgZm9yIGZ1bGwgZGVzY3JpcHRpb25cbiAqXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZERvbShlbGVtZW50KSB7XG4gIGNvbnN0IGxheW91dCA9IGdldEVmZmVjdGl2ZUxheW91dChlbGVtZW50KTtcbiAgaWYgKGxheW91dCA9PSBMYXlvdXQuQ09OVEFJTkVSKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgZG9jID0gZWxlbWVudC5vd25lckRvY3VtZW50O1xuICBjb25zdCBjb250YWluZXIgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGFwcGx5RmlsbENvbnRlbnQoY29udGFpbmVyKTtcbiAgcmVhbENoaWxkTm9kZXMoZWxlbWVudCkuZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY2hpbGQpO1xuICB9KTtcbiAgZWxlbWVudC5hcHBlbmRDaGlsZChjb250YWluZXIpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luIERlc3RpbmF0aW9uIHdpbmRvdyBmb3IgdGhlIG5ldyBlbGVtZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbExheW91dCh3aW4pIHtcbiAgcmVnaXN0ZXJFbGVtZW50KHdpbiwgJ2FtcC1sYXlvdXQnLCBBbXBMYXlvdXQpO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/builtins/amp-layout/amp-layout.js