var _templateObject;

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

/**
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
import { AmpStoryInteractive, InteractiveType } from "./amp-story-interactive-abstract";
import { CSS } from "../../../build/amp-story-interactive-results-detailed-0.1.css";
import { htmlFor } from "../../../src/core/dom/static-template";
export var AmpStoryInteractiveResultsDetailed = /*#__PURE__*/function (_AmpStoryInteractive) {
  _inherits(AmpStoryInteractiveResultsDetailed, _AmpStoryInteractive);

  var _super = _createSuper(AmpStoryInteractiveResultsDetailed);

  /**
   * @param {!AmpElement} element
   */
  function AmpStoryInteractiveResultsDetailed(element) {
    _classCallCheck(this, AmpStoryInteractiveResultsDetailed);

    return _super.call(this, element, InteractiveType.RESULTS, [2, 4]);
  }

  /** @override */
  _createClass(AmpStoryInteractiveResultsDetailed, [{
    key: "buildCallback",
    value: function buildCallback() {
      return _get(_getPrototypeOf(AmpStoryInteractiveResultsDetailed.prototype), "buildCallback", this).call(this, CSS);
    }
    /** @override */

  }, {
    key: "buildComponent",
    value: function buildComponent() {
      this.rootEl_ = htmlFor(this.element)(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["<p>Detailed results component</p>"])));
      return this.rootEl_;
    }
  }]);

  return AmpStoryInteractiveResultsDetailed;
}(AmpStoryInteractive);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1pbnRlcmFjdGl2ZS1yZXN1bHRzLWRldGFpbGVkLmpzIl0sIm5hbWVzIjpbIkFtcFN0b3J5SW50ZXJhY3RpdmUiLCJJbnRlcmFjdGl2ZVR5cGUiLCJDU1MiLCJodG1sRm9yIiwiQW1wU3RvcnlJbnRlcmFjdGl2ZVJlc3VsdHNEZXRhaWxlZCIsImVsZW1lbnQiLCJSRVNVTFRTIiwicm9vdEVsXyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQ0VBLG1CQURGLEVBRUVDLGVBRkY7QUFJQSxTQUFRQyxHQUFSO0FBQ0EsU0FBUUMsT0FBUjtBQUVBLFdBQWFDLGtDQUFiO0FBQUE7O0FBQUE7O0FBQ0U7QUFDRjtBQUNBO0FBQ0UsOENBQVlDLE9BQVosRUFBcUI7QUFBQTs7QUFBQSw2QkFDYkEsT0FEYSxFQUNKSixlQUFlLENBQUNLLE9BRFosRUFDcUIsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURyQjtBQUVwQjs7QUFFRDtBQVJGO0FBQUE7QUFBQSxXQVNFLHlCQUFnQjtBQUNkLG1IQUEyQkosR0FBM0I7QUFDRDtBQUVEOztBQWJGO0FBQUE7QUFBQSxXQWNFLDBCQUFpQjtBQUNmLFdBQUtLLE9BQUwsR0FBZUosT0FBTyxDQUFDLEtBQUtFLE9BQU4sQ0FBdEI7QUFDQSxhQUFPLEtBQUtFLE9BQVo7QUFDRDtBQWpCSDs7QUFBQTtBQUFBLEVBQXdEUCxtQkFBeEQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDIxIFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtcbiAgQW1wU3RvcnlJbnRlcmFjdGl2ZSxcbiAgSW50ZXJhY3RpdmVUeXBlLFxufSBmcm9tICcuL2FtcC1zdG9yeS1pbnRlcmFjdGl2ZS1hYnN0cmFjdCc7XG5pbXBvcnQge0NTU30gZnJvbSAnLi4vLi4vLi4vYnVpbGQvYW1wLXN0b3J5LWludGVyYWN0aXZlLXJlc3VsdHMtZGV0YWlsZWQtMC4xLmNzcyc7XG5pbXBvcnQge2h0bWxGb3J9IGZyb20gJyNjb3JlL2RvbS9zdGF0aWMtdGVtcGxhdGUnO1xuXG5leHBvcnQgY2xhc3MgQW1wU3RvcnlJbnRlcmFjdGl2ZVJlc3VsdHNEZXRhaWxlZCBleHRlbmRzIEFtcFN0b3J5SW50ZXJhY3RpdmUge1xuICAvKipcbiAgICogQHBhcmFtIHshQW1wRWxlbWVudH0gZWxlbWVudFxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgIHN1cGVyKGVsZW1lbnQsIEludGVyYWN0aXZlVHlwZS5SRVNVTFRTLCBbMiwgNF0pO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBidWlsZENhbGxiYWNrKCkge1xuICAgIHJldHVybiBzdXBlci5idWlsZENhbGxiYWNrKENTUyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGJ1aWxkQ29tcG9uZW50KCkge1xuICAgIHRoaXMucm9vdEVsXyA9IGh0bWxGb3IodGhpcy5lbGVtZW50KWA8cD5EZXRhaWxlZCByZXN1bHRzIGNvbXBvbmVudDwvcD5gO1xuICAgIHJldHVybiB0aGlzLnJvb3RFbF87XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-story-interactive/0.1/amp-story-interactive-results-detailed.js