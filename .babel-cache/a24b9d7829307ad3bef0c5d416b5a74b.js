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
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
 * @fileoverview Base layer from which other layers in a story page extend from.
 */
import { Layout } from "../../../src/core/dom/layout";

/**
 * Base layer template.
 */
export var AmpStoryBaseLayer = /*#__PURE__*/function (_AMP$BaseElement) {
  _inherits(AmpStoryBaseLayer, _AMP$BaseElement);

  var _super = _createSuper(AmpStoryBaseLayer);

  /** @param {!AmpElement} element */
  function AmpStoryBaseLayer(element) {
    _classCallCheck(this, AmpStoryBaseLayer);

    return _super.call(this, element);
  }

  /** @override */
  _createClass(AmpStoryBaseLayer, [{
    key: "isLayoutSupported",
    value: function isLayoutSupported(layout) {
      return layout == Layout.CONTAINER;
    }
    /** @override */

  }, {
    key: "buildCallback",
    value: function buildCallback() {
      this.element.classList.add('i-amphtml-story-layer');
    }
  }]);

  return AmpStoryBaseLayer;
}(AMP.BaseElement);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1iYXNlLWxheWVyLmpzIl0sIm5hbWVzIjpbIkxheW91dCIsIkFtcFN0b3J5QmFzZUxheWVyIiwiZWxlbWVudCIsImxheW91dCIsIkNPTlRBSU5FUiIsImNsYXNzTGlzdCIsImFkZCIsIkFNUCIsIkJhc2VFbGVtZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxNQUFSOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQWFDLGlCQUFiO0FBQUE7O0FBQUE7O0FBQ0U7QUFDQSw2QkFBWUMsT0FBWixFQUFxQjtBQUFBOztBQUFBLDZCQUNiQSxPQURhO0FBRXBCOztBQUVEO0FBTkY7QUFBQTtBQUFBLFdBT0UsMkJBQWtCQyxNQUFsQixFQUEwQjtBQUN4QixhQUFPQSxNQUFNLElBQUlILE1BQU0sQ0FBQ0ksU0FBeEI7QUFDRDtBQUVEOztBQVhGO0FBQUE7QUFBQSxXQVlFLHlCQUFnQjtBQUNkLFdBQUtGLE9BQUwsQ0FBYUcsU0FBYixDQUF1QkMsR0FBdkIsQ0FBMkIsdUJBQTNCO0FBQ0Q7QUFkSDs7QUFBQTtBQUFBLEVBQXVDQyxHQUFHLENBQUNDLFdBQTNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOCBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBCYXNlIGxheWVyIGZyb20gd2hpY2ggb3RoZXIgbGF5ZXJzIGluIGEgc3RvcnkgcGFnZSBleHRlbmQgZnJvbS5cbiAqL1xuXG5pbXBvcnQge0xheW91dH0gZnJvbSAnI2NvcmUvZG9tL2xheW91dCc7XG5cbi8qKlxuICogQmFzZSBsYXllciB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEFtcFN0b3J5QmFzZUxheWVyIGV4dGVuZHMgQU1QLkJhc2VFbGVtZW50IHtcbiAgLyoqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IGVsZW1lbnQgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgIHN1cGVyKGVsZW1lbnQpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBpc0xheW91dFN1cHBvcnRlZChsYXlvdXQpIHtcbiAgICByZXR1cm4gbGF5b3V0ID09IExheW91dC5DT05UQUlORVI7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGJ1aWxkQ2FsbGJhY2soKSB7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2ktYW1waHRtbC1zdG9yeS1sYXllcicpO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-base-layer.js