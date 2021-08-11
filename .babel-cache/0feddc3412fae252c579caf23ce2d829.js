var _templateObject;

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

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

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
import { AmpStoryInteractive, InteractiveType, MID_SELECTION_CLASS, POST_SELECTION_CLASS } from "./amp-story-interactive-abstract";
import { CSS } from "../../../build/amp-story-interactive-slider-0.1.css";
import { htmlFor } from "../../../src/core/dom/static-template";
import { setImportantStyles } from "../../../src/core/dom/style";
import { StateProperty } from "../../amp-story/1.0/amp-story-store-service";

/**
 * Generates the template for the slider.
 *
 * @param {!Element} element
 * @return {!Element}
 */
var buildSliderTemplate = function buildSliderTemplate(element) {
  var html = htmlFor(element);
  return html(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n    <div class=\"i-amphtml-story-interactive-slider-container\">\n      <div class=\"i-amphtml-story-interactive-prompt-container\"></div>\n      <div class=\"i-amphtml-story-interactive-slider-input-container\">\n        <div class=\"i-amphtml-story-interactive-slider-input-size\">\n          <input\n            class=\"i-amphtml-story-interactive-slider-input\"\n            type=\"range\"\n            min=\"0\"\n            max=\"100\"\n            step=\"0.1\"\n            value=\"0\"\n          />\n          <div class=\"i-amphtml-story-interactive-slider-bubble-wrapper\">\n            <div class=\"i-amphtml-story-interactive-slider-bubble\"></div>\n          </div>\n          <div class=\"i-amphtml-story-interactive-slider-average-indicator\">\n            <span></span><span></span><span></span>\n          </div>\n          <div class=\"i-amphtml-story-interactive-slider-average-text\">\n            Average answer\n          </div>\n        </div>\n      </div>\n    </div>\n  "])));
};

var easeInOutCubic = function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
};

/**
 * @const @enum {number}
 */
var SliderType = {
  PERCENTAGE: 'percentage',
  EMOJI: 'emoji'
};
var HINT_ANIMATION_DURATION_MS = 1500;
var HINT_ANIMATION_DELAY_MS = 500;
export var AmpStoryInteractiveSlider = /*#__PURE__*/function (_AmpStoryInteractive) {
  _inherits(AmpStoryInteractiveSlider, _AmpStoryInteractive);

  var _super = _createSuper(AmpStoryInteractiveSlider);

  /**
   * @param {!AmpElement} element
   */
  function AmpStoryInteractiveSlider(element) {
    var _this;

    _classCallCheck(this, AmpStoryInteractiveSlider);

    _this = _super.call(this, element, InteractiveType.SLIDER, [0, 1]);

    /** @private {?Element} bubble containing the current selection of the user while dragging */
    _this.bubbleEl_ = null;

    /** @private {?Element} tracks user input */
    _this.inputEl_ = null;

    /** @private {!SliderType}  */
    _this.sliderType_ = SliderType.PERCENTAGE;

    /** @private {?number} Reference to timeout so we can cancel it if needed. */
    _this.landingAnimationDelayTimeout_ = null;

    /**  @private {?number} Reference to requestAnimationFrame so we can cancel it if needed.*/
    _this.currentRAF_ = null;
    return _this;
  }

  /** @override */
  _createClass(AmpStoryInteractiveSlider, [{
    key: "displayOptionsData",
    value: function displayOptionsData(responseData) {
      var average = this.calculateWeightedAverage_(responseData);
      setImportantStyles(this.rootEl_, {
        '--average': average + '%'
      });
    }
    /**
     * @private
     * @param {!Array<!InteractiveOptionType>} responseData
     * @return {number}
     */

  }, {
    key: "calculateWeightedAverage_",
    value: function calculateWeightedAverage_(responseData) {
      var numerator = 0;
      var denominator = 0;

      for (var i = 0; i < responseData.length; i++) {
        numerator += responseData[i].index * responseData[i].count;
        denominator += responseData[i].count;
      }

      if (denominator == 0) {
        return 0;
      }

      return numerator / denominator;
    }
    /** @override*/

  }, {
    key: "updateComponentWithData",
    value: function updateComponentWithData(data) {
      var _this2 = this;

      this.optionsData_ = this.orderData_(data);
      this.optionsData_.forEach(function (response) {
        if (response.selected) {
          _this2.hasUserSelection_ = true;

          _this2.mutateElement(function () {
            _this2.inputEl_.value = response.index;

            _this2.onDrag_();

            _this2.onRelease_();

            _this2.updateToPostSelectionState_(null);
          });
        }
      });
    }
    /** @override */

  }, {
    key: "buildComponent",
    value: function buildComponent() {
      this.rootEl_ = buildSliderTemplate(this.element);
      this.bubbleEl_ = this.rootEl_.querySelector('.i-amphtml-story-interactive-slider-bubble');
      this.inputEl_ = this.rootEl_.querySelector('.i-amphtml-story-interactive-slider-input');

      if (this.options_.length > 0) {
        this.sliderType_ = SliderType.EMOJI;
        var emojiWrapper = this.win.document.createElement('span');
        emojiWrapper.textContent = this.options_[0].text;
        this.bubbleEl_.appendChild(emojiWrapper);
      }

      this.rootEl_.setAttribute('type', this.sliderType_);
      this.attachPrompt_(this.rootEl_);
      return this.rootEl_;
    }
    /** @override */

  }, {
    key: "buildCallback",
    value: function buildCallback() {
      return _get(_getPrototypeOf(AmpStoryInteractiveSlider.prototype), "buildCallback", this).call(this, CSS);
    }
    /** @override */

  }, {
    key: "initializeListeners_",
    value: function initializeListeners_() {
      var _this3 = this;

      _get(_getPrototypeOf(AmpStoryInteractiveSlider.prototype), "initializeListeners_", this).call(this);

      this.inputEl_.addEventListener('input', function () {
        cancelAnimationFrame(_this3.currentRAF_);

        _this3.onDrag_();
      });
      this.inputEl_.addEventListener('change', function () {
        _this3.onRelease_();
      });
      this.inputEl_.addEventListener('touchmove', function (event) {
        return event.stopPropagation();
      }, true);
      this.storeService_.subscribe(StateProperty.CURRENT_PAGE_ID, function (currPageId) {
        var isPostState = _this3.rootEl_.classList.contains(POST_SELECTION_CLASS);

        if (isPostState) {
          // If it's already been interacted with, do not animate.
          return;
        }

        if (currPageId != _this3.getPageEl().getAttribute('id')) {
          // Resets animation when navigating away.
          cancelAnimationFrame(_this3.currentRAF_);
          clearTimeout(_this3.landingAnimationDelayTimeout_);
          _this3.inputEl_.value = 0;

          _this3.onDrag_();

          _this3.rootEl_.classList.remove(MID_SELECTION_CLASS);

          return;
        }

        var startTime;

        var animateFrame = function animateFrame(currTime) {
          // Set current startTime if not defined.
          var hasData = _this3.rootEl_.classList.contains('i-amphtml-story-interactive-has-data');

          if (hasData) {
            // If it's already been interacted with, do not animate.
            return;
          }

          if (!startTime) {
            startTime = currTime;
          }

          var elapsed = currTime - startTime;

          if (HINT_ANIMATION_DURATION_MS < elapsed) {
            _this3.rootEl_.classList.remove(MID_SELECTION_CLASS);

            return;
          }

          // Value between 0 and 1;
          var timePercentage = elapsed / HINT_ANIMATION_DURATION_MS;
          var val = timePercentage < 0.5 ? easeInOutCubic(timePercentage * 2) * 30 : easeInOutCubic(2 - timePercentage * 2) * 30;
          _this3.inputEl_.value = val;

          _this3.onDrag_();

          _this3.currentRAF_ = requestAnimationFrame(animateFrame);
        };

        _this3.landingAnimationDelayTimeout_ = setTimeout(function () {
          return requestAnimationFrame(animateFrame);
        }, HINT_ANIMATION_DELAY_MS);
      }, true);
    }
    /**
     * @private
     */

  }, {
    key: "onDrag_",
    value: function onDrag_() {
      var value = this.inputEl_.value;

      if (this.sliderType_ == SliderType.PERCENTAGE) {
        this.bubbleEl_.textContent = Math.round(value) + '%';
      }

      this.rootEl_.classList.add(MID_SELECTION_CLASS);
      setImportantStyles(this.rootEl_, {
        '--fraction': value / 100
      });
    }
    /**
     * @private
     */

  }, {
    key: "onRelease_",
    value: function onRelease_() {
      this.updateToPostSelectionState_();
      this.inputEl_.setAttribute('disabled', '');
      this.rootEl_.classList.remove(MID_SELECTION_CLASS);
      this.handleOptionSelection_(Math.round(this.inputEl_.value));
    }
    /**@override */

  }, {
    key: "getNumberOfOptions",
    value: function getNumberOfOptions() {
      return 101;
    }
  }]);

  return AmpStoryInteractiveSlider;
}(AmpStoryInteractive);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1pbnRlcmFjdGl2ZS1zbGlkZXIuanMiXSwibmFtZXMiOlsiQW1wU3RvcnlJbnRlcmFjdGl2ZSIsIkludGVyYWN0aXZlVHlwZSIsIk1JRF9TRUxFQ1RJT05fQ0xBU1MiLCJQT1NUX1NFTEVDVElPTl9DTEFTUyIsIkNTUyIsImh0bWxGb3IiLCJzZXRJbXBvcnRhbnRTdHlsZXMiLCJTdGF0ZVByb3BlcnR5IiwiYnVpbGRTbGlkZXJUZW1wbGF0ZSIsImVsZW1lbnQiLCJodG1sIiwiZWFzZUluT3V0Q3ViaWMiLCJ0IiwiU2xpZGVyVHlwZSIsIlBFUkNFTlRBR0UiLCJFTU9KSSIsIkhJTlRfQU5JTUFUSU9OX0RVUkFUSU9OX01TIiwiSElOVF9BTklNQVRJT05fREVMQVlfTVMiLCJBbXBTdG9yeUludGVyYWN0aXZlU2xpZGVyIiwiU0xJREVSIiwiYnViYmxlRWxfIiwiaW5wdXRFbF8iLCJzbGlkZXJUeXBlXyIsImxhbmRpbmdBbmltYXRpb25EZWxheVRpbWVvdXRfIiwiY3VycmVudFJBRl8iLCJyZXNwb25zZURhdGEiLCJhdmVyYWdlIiwiY2FsY3VsYXRlV2VpZ2h0ZWRBdmVyYWdlXyIsInJvb3RFbF8iLCJudW1lcmF0b3IiLCJkZW5vbWluYXRvciIsImkiLCJsZW5ndGgiLCJpbmRleCIsImNvdW50IiwiZGF0YSIsIm9wdGlvbnNEYXRhXyIsIm9yZGVyRGF0YV8iLCJmb3JFYWNoIiwicmVzcG9uc2UiLCJzZWxlY3RlZCIsImhhc1VzZXJTZWxlY3Rpb25fIiwibXV0YXRlRWxlbWVudCIsInZhbHVlIiwib25EcmFnXyIsIm9uUmVsZWFzZV8iLCJ1cGRhdGVUb1Bvc3RTZWxlY3Rpb25TdGF0ZV8iLCJxdWVyeVNlbGVjdG9yIiwib3B0aW9uc18iLCJlbW9qaVdyYXBwZXIiLCJ3aW4iLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJ0ZXh0Q29udGVudCIsInRleHQiLCJhcHBlbmRDaGlsZCIsInNldEF0dHJpYnV0ZSIsImF0dGFjaFByb21wdF8iLCJhZGRFdmVudExpc3RlbmVyIiwiY2FuY2VsQW5pbWF0aW9uRnJhbWUiLCJldmVudCIsInN0b3BQcm9wYWdhdGlvbiIsInN0b3JlU2VydmljZV8iLCJzdWJzY3JpYmUiLCJDVVJSRU5UX1BBR0VfSUQiLCJjdXJyUGFnZUlkIiwiaXNQb3N0U3RhdGUiLCJjbGFzc0xpc3QiLCJjb250YWlucyIsImdldFBhZ2VFbCIsImdldEF0dHJpYnV0ZSIsImNsZWFyVGltZW91dCIsInJlbW92ZSIsInN0YXJ0VGltZSIsImFuaW1hdGVGcmFtZSIsImN1cnJUaW1lIiwiaGFzRGF0YSIsImVsYXBzZWQiLCJ0aW1lUGVyY2VudGFnZSIsInZhbCIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsInNldFRpbWVvdXQiLCJNYXRoIiwicm91bmQiLCJhZGQiLCJoYW5kbGVPcHRpb25TZWxlY3Rpb25fIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FDRUEsbUJBREYsRUFFRUMsZUFGRixFQUdFQyxtQkFIRixFQUlFQyxvQkFKRjtBQU1BLFNBQVFDLEdBQVI7QUFDQSxTQUFRQyxPQUFSO0FBQ0EsU0FBUUMsa0JBQVI7QUFDQSxTQUFRQyxhQUFSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1DLG1CQUFtQixHQUFHLFNBQXRCQSxtQkFBc0IsQ0FBQ0MsT0FBRCxFQUFhO0FBQ3ZDLE1BQU1DLElBQUksR0FBR0wsT0FBTyxDQUFDSSxPQUFELENBQXBCO0FBQ0EsU0FBT0MsSUFBUDtBQTBCRCxDQTVCRDs7QUE4QkEsSUFBTUMsY0FBYyxHQUFHLFNBQWpCQSxjQUFpQixDQUFDQyxDQUFEO0FBQUEsU0FDckJBLENBQUMsR0FBRyxHQUFKLEdBQVUsSUFBSUEsQ0FBSixHQUFRQSxDQUFSLEdBQVlBLENBQXRCLEdBQTBCLENBQUNBLENBQUMsR0FB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QUMsS0FBS3NCLE9BQU4sRUFBZTtBQUFDLHNCQUFjZSxLQUFLLEdBQUc7QUFBdkIsT0FBZixDQUFsQjtBQUNEO0FBRUQ7QUFDRjtBQUNBOztBQTNLQTtBQUFBO0FBQUEsV0E0S0Usc0JBQWE7QUFDWCxXQUFLRywyQkFBTDtBQUNBLFdBQUt6QixRQUFMLENBQWNtQyxZQUFkLENBQTJCLFVBQTNCLEVBQXVDLEVBQXZDO0FBQ0EsV0FBSzVCLE9BQUwsQ0FBYXVDLFNBQWIsQ0FBdUJLLE1BQXZCLENBQThCdEUsbUJBQTlCO0FBQ0EsV0FBS21GLHNCQUFMLENBQTRCSCxJQUFJLENBQUNDLEtBQUwsQ0FBVyxLQUFLOUQsUUFBTCxDQUFjc0IsS0FBekIsQ0FBNUI7QUFDRDtBQUVEOztBQW5MRjtBQUFBO0FBQUEsV0FvTEUsOEJBQXFCO0FBQ25CLGFBQU8sR0FBUDtBQUNEO0FBdExIOztBQUFBO0FBQUEsRUFBK0MzQyxtQkFBL0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDIxIFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtcbiAgQW1wU3RvcnlJbnRlcmFjdGl2ZSxcbiAgSW50ZXJhY3RpdmVUeXBlLFxuICBNSURfU0VMRUNUSU9OX0NMQVNTLFxuICBQT1NUX1NFTEVDVElPTl9DTEFTUyxcbn0gZnJvbSAnLi9hbXAtc3RvcnktaW50ZXJhY3RpdmUtYWJzdHJhY3QnO1xuaW1wb3J0IHtDU1N9IGZyb20gJy4uLy4uLy4uL2J1aWxkL2FtcC1zdG9yeS1pbnRlcmFjdGl2ZS1zbGlkZXItMC4xLmNzcyc7XG5pbXBvcnQge2h0bWxGb3J9IGZyb20gJyNjb3JlL2RvbS9zdGF0aWMtdGVtcGxhdGUnO1xuaW1wb3J0IHtzZXRJbXBvcnRhbnRTdHlsZXN9IGZyb20gJyNjb3JlL2RvbS9zdHlsZSc7XG5pbXBvcnQge1N0YXRlUHJvcGVydHl9IGZyb20gJ2V4dGVuc2lvbnMvYW1wLXN0b3J5LzEuMC9hbXAtc3Rvcnktc3RvcmUtc2VydmljZSc7XG5cbi8qKlxuICogR2VuZXJhdGVzIHRoZSB0ZW1wbGF0ZSBmb3IgdGhlIHNsaWRlci5cbiAqXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJuIHshRWxlbWVudH1cbiAqL1xuY29uc3QgYnVpbGRTbGlkZXJUZW1wbGF0ZSA9IChlbGVtZW50KSA9PiB7XG4gIGNvbnN0IGh0bWwgPSBodG1sRm9yKGVsZW1lbnQpO1xuICByZXR1cm4gaHRtbGBcbiAgICA8ZGl2IGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLXNsaWRlci1jb250YWluZXJcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtcHJvbXB0LWNvbnRhaW5lclwiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1zbGlkZXItaW5wdXQtY29udGFpbmVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtc2xpZGVyLWlucHV0LXNpemVcIj5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLXNsaWRlci1pbnB1dFwiXG4gICAgICAgICAgICB0eXBlPVwicmFuZ2VcIlxuICAgICAgICAgICAgbWluPVwiMFwiXG4gICAgICAgICAgICBtYXg9XCIxMDBcIlxuICAgICAgICAgICAgc3RlcD1cIjAuMVwiXG4gICAgICAgICAgICB2YWx1ZT1cIjBcIlxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1zbGlkZXItYnViYmxlLXdyYXBwZXJcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtc2xpZGVyLWJ1YmJsZVwiPjwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtc2xpZGVyLWF2ZXJhZ2UtaW5kaWNhdG9yXCI+XG4gICAgICAgICAgICA8c3Bhbj48L3NwYW4+PHNwYW4+PC9zcGFuPjxzcGFuPjwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLXNsaWRlci1hdmVyYWdlLXRleHRcIj5cbiAgICAgICAgICAgIEF2ZXJhZ2UgYW5zd2VyXG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG59O1xuXG5jb25zdCBlYXNlSW5PdXRDdWJpYyA9ICh0KSA9PlxuICB0IDwgMC41ID8gNCAqIHQgKiB0ICogdCA6ICh0IC0gMSkgKiAoMiAqIHQgLSAyKSAqICgyICogdCAtIDIpICsgMTtcblxuLyoqXG4gKiBAY29uc3QgQGVudW0ge251bWJlcn1cbiAqL1xuY29uc3QgU2xpZGVyVHlwZSA9IHtcbiAgUEVSQ0VOVEFHRTogJ3BlcmNlbnRhZ2UnLFxuICBFTU9KSTogJ2Vtb2ppJyxcbn07XG5cbmNvbnN0IEhJTlRfQU5JTUFUSU9OX0RVUkFUSU9OX01TID0gMTUwMDtcbmNvbnN0IEhJTlRfQU5JTUFUSU9OX0RFTEFZX01TID0gNTAwO1xuXG5leHBvcnQgY2xhc3MgQW1wU3RvcnlJbnRlcmFjdGl2ZVNsaWRlciBleHRlbmRzIEFtcFN0b3J5SW50ZXJhY3RpdmUge1xuICAvKipcbiAgICogQHBhcmFtIHshQW1wRWxlbWVudH0gZWxlbWVudFxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgIHN1cGVyKGVsZW1lbnQsIEludGVyYWN0aXZlVHlwZS5TTElERVIsIFswLCAxXSk7XG4gICAgLyoqIEBwcml2YXRlIHs/RWxlbWVudH0gYnViYmxlIGNvbnRhaW5pbmcgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIG9mIHRoZSB1c2VyIHdoaWxlIGRyYWdnaW5nICovXG4gICAgdGhpcy5idWJibGVFbF8gPSBudWxsO1xuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9IHRyYWNrcyB1c2VyIGlucHV0ICovXG4gICAgdGhpcy5pbnB1dEVsXyA9IG51bGw7XG4gICAgLyoqIEBwcml2YXRlIHshU2xpZGVyVHlwZX0gICovXG4gICAgdGhpcy5zbGlkZXJUeXBlXyA9IFNsaWRlclR5cGUuUEVSQ0VOVEFHRTtcbiAgICAvKiogQHByaXZhdGUgez9udW1iZXJ9IFJlZmVyZW5jZSB0byB0aW1lb3V0IHNvIHdlIGNhbiBjYW5jZWwgaXQgaWYgbmVlZGVkLiAqL1xuICAgIHRoaXMubGFuZGluZ0FuaW1hdGlvbkRlbGF5VGltZW91dF8gPSBudWxsO1xuICAgIC8qKiAgQHByaXZhdGUgez9udW1iZXJ9IFJlZmVyZW5jZSB0byByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgc28gd2UgY2FuIGNhbmNlbCBpdCBpZiBuZWVkZWQuKi9cbiAgICB0aGlzLmN1cnJlbnRSQUZfID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZGlzcGxheU9wdGlvbnNEYXRhKHJlc3BvbnNlRGF0YSkge1xuICAgIGNvbnN0IGF2ZXJhZ2UgPSB0aGlzLmNhbGN1bGF0ZVdlaWdodGVkQXZlcmFnZV8ocmVzcG9uc2VEYXRhKTtcbiAgICBzZXRJbXBvcnRhbnRTdHlsZXModGhpcy5yb290RWxfLCB7Jy0tYXZlcmFnZSc6IGF2ZXJhZ2UgKyAnJSd9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0geyFBcnJheTwhSW50ZXJhY3RpdmVPcHRpb25UeXBlPn0gcmVzcG9uc2VEYXRhXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICovXG4gIGNhbGN1bGF0ZVdlaWdodGVkQXZlcmFnZV8ocmVzcG9uc2VEYXRhKSB7XG4gICAgbGV0IG51bWVyYXRvciA9IDA7XG4gICAgbGV0IGRlbm9taW5hdG9yID0gMDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlc3BvbnNlRGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgbnVtZXJhdG9yICs9IHJlc3BvbnNlRGF0YVtpXS5pbmRleCAqIHJlc3BvbnNlRGF0YVtpXS5jb3VudDtcbiAgICAgIGRlbm9taW5hdG9yICs9IHJlc3BvbnNlRGF0YVtpXS5jb3VudDtcbiAgICB9XG4gICAgaWYgKGRlbm9taW5hdG9yID09IDApIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICByZXR1cm4gbnVtZXJhdG9yIC8gZGVub21pbmF0b3I7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlKi9cbiAgdXBkYXRlQ29tcG9uZW50V2l0aERhdGEoZGF0YSkge1xuICAgIHRoaXMub3B0aW9uc0RhdGFfID0gdGhpcy5vcmRlckRhdGFfKGRhdGEpO1xuICAgIHRoaXMub3B0aW9uc0RhdGFfLmZvckVhY2goKHJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAocmVzcG9uc2Uuc2VsZWN0ZWQpIHtcbiAgICAgICAgdGhpcy5oYXNVc2VyU2VsZWN0aW9uXyA9IHRydWU7XG4gICAgICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5pbnB1dEVsXy52YWx1ZSA9IHJlc3BvbnNlLmluZGV4O1xuICAgICAgICAgIHRoaXMub25EcmFnXygpO1xuICAgICAgICAgIHRoaXMub25SZWxlYXNlXygpO1xuICAgICAgICAgIHRoaXMudXBkYXRlVG9Qb3N0U2VsZWN0aW9uU3RhdGVfKG51bGwpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgYnVpbGRDb21wb25lbnQoKSB7XG4gICAgdGhpcy5yb290RWxfID0gYnVpbGRTbGlkZXJUZW1wbGF0ZSh0aGlzLmVsZW1lbnQpO1xuICAgIHRoaXMuYnViYmxlRWxfID0gdGhpcy5yb290RWxfLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAnLmktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1zbGlkZXItYnViYmxlJ1xuICAgICk7XG4gICAgdGhpcy5pbnB1dEVsXyA9IHRoaXMucm9vdEVsXy5xdWVyeVNlbGVjdG9yKFxuICAgICAgJy5pLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtc2xpZGVyLWlucHV0J1xuICAgICk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zXy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnNsaWRlclR5cGVfID0gU2xpZGVyVHlwZS5FTU9KSTtcbiAgICAgIGNvbnN0IGVtb2ppV3JhcHBlciA9IHRoaXMud2luLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgIGVtb2ppV3JhcHBlci50ZXh0Q29udGVudCA9IHRoaXMub3B0aW9uc19bMF0udGV4dDtcbiAgICAgIHRoaXMuYnViYmxlRWxfLmFwcGVuZENoaWxkKGVtb2ppV3JhcHBlcik7XG4gICAgfVxuICAgIHRoaXMucm9vdEVsXy5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCB0aGlzLnNsaWRlclR5cGVfKTtcbiAgICB0aGlzLmF0dGFjaFByb21wdF8odGhpcy5yb290RWxfKTtcbiAgICByZXR1cm4gdGhpcy5yb290RWxfO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBidWlsZENhbGxiYWNrKCkge1xuICAgIHJldHVybiBzdXBlci5idWlsZENhbGxiYWNrKENTUyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGluaXRpYWxpemVMaXN0ZW5lcnNfKCkge1xuICAgIHN1cGVyLmluaXRpYWxpemVMaXN0ZW5lcnNfKCk7XG5cbiAgICB0aGlzLmlucHV0RWxfLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5jdXJyZW50UkFGXyk7XG4gICAgICB0aGlzLm9uRHJhZ18oKTtcbiAgICB9KTtcbiAgICB0aGlzLmlucHV0RWxfLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgIHRoaXMub25SZWxlYXNlXygpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5pbnB1dEVsXy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgJ3RvdWNobW92ZScsXG4gICAgICAoZXZlbnQpID0+IGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpLFxuICAgICAgdHJ1ZVxuICAgICk7XG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShcbiAgICAgIFN0YXRlUHJvcGVydHkuQ1VSUkVOVF9QQUdFX0lELFxuICAgICAgKGN1cnJQYWdlSWQpID0+IHtcbiAgICAgICAgY29uc3QgaXNQb3N0U3RhdGUgPVxuICAgICAgICAgIHRoaXMucm9vdEVsXy5jbGFzc0xpc3QuY29udGFpbnMoUE9TVF9TRUxFQ1RJT05fQ0xBU1MpO1xuICAgICAgICBpZiAoaXNQb3N0U3RhdGUpIHtcbiAgICAgICAgICAvLyBJZiBpdCdzIGFscmVhZHkgYmVlbiBpbnRlcmFjdGVkIHdpdGgsIGRvIG5vdCBhbmltYXRlLlxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjdXJyUGFnZUlkICE9IHRoaXMuZ2V0UGFnZUVsKCkuZ2V0QXR0cmlidXRlKCdpZCcpKSB7XG4gICAgICAgICAgLy8gUmVzZXRzIGFuaW1hdGlvbiB3aGVuIG5hdmlnYXRpbmcgYXdheS5cbiAgICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLmN1cnJlbnRSQUZfKTtcbiAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5sYW5kaW5nQW5pbWF0aW9uRGVsYXlUaW1lb3V0Xyk7XG4gICAgICAgICAgdGhpcy5pbnB1dEVsXy52YWx1ZSA9IDA7XG4gICAgICAgICAgdGhpcy5vbkRyYWdfKCk7XG4gICAgICAgICAgdGhpcy5yb290RWxfLmNsYXNzTGlzdC5yZW1vdmUoTUlEX1NFTEVDVElPTl9DTEFTUyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBzdGFydFRpbWU7XG4gICAgICAgIGNvbnN0IGFuaW1hdGVGcmFtZSA9IChjdXJyVGltZSkgPT4ge1xuICAgICAgICAgIC8vIFNldCBjdXJyZW50IHN0YXJ0VGltZSBpZiBub3QgZGVmaW5lZC5cbiAgICAgICAgICBjb25zdCBoYXNEYXRhID0gdGhpcy5yb290RWxfLmNsYXNzTGlzdC5jb250YWlucyhcbiAgICAgICAgICAgICdpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtaGFzLWRhdGEnXG4gICAgICAgICAgKTtcbiAgICAgICAgICBpZiAoaGFzRGF0YSkge1xuICAgICAgICAgICAgLy8gSWYgaXQncyBhbHJlYWR5IGJlZW4gaW50ZXJhY3RlZCB3aXRoLCBkbyBub3QgYW5pbWF0ZS5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFzdGFydFRpbWUpIHtcbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IGN1cnJUaW1lO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBlbGFwc2VkID0gY3VyclRpbWUgLSBzdGFydFRpbWU7XG4gICAgICAgICAgaWYgKEhJTlRfQU5JTUFUSU9OX0RVUkFUSU9OX01TIDwgZWxhcHNlZCkge1xuICAgICAgICAgICAgdGhpcy5yb290RWxfLmNsYXNzTGlzdC5yZW1vdmUoTUlEX1NFTEVDVElPTl9DTEFTUyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFZhbHVlIGJldHdlZW4gMCBhbmQgMTtcbiAgICAgICAgICBjb25zdCB0aW1lUGVyY2VudGFnZSA9IGVsYXBzZWQgLyBISU5UX0FOSU1BVElPTl9EVVJBVElPTl9NUztcbiAgICAgICAgICBjb25zdCB2YWwgPVxuICAgICAgICAgICAgdGltZVBlcmNlbnRhZ2UgPCAwLjVcbiAgICAgICAgICAgICAgPyBlYXNlSW5PdXRDdWJpYyh0aW1lUGVyY2VudGFnZSAqIDIpICogMzBcbiAgICAgICAgICAgICAgOiBlYXNlSW5PdXRDdWJpYygyIC0gdGltZVBlcmNlbnRhZ2UgKiAyKSAqIDMwO1xuICAgICAgICAgIHRoaXMuaW5wdXRFbF8udmFsdWUgPSB2YWw7XG4gICAgICAgICAgdGhpcy5vbkRyYWdfKCk7XG4gICAgICAgICAgdGhpcy5jdXJyZW50UkFGXyA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlRnJhbWUpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmxhbmRpbmdBbmltYXRpb25EZWxheVRpbWVvdXRfID0gc2V0VGltZW91dChcbiAgICAgICAgICAoKSA9PiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZUZyYW1lKSxcbiAgICAgICAgICBISU5UX0FOSU1BVElPTl9ERUxBWV9NU1xuICAgICAgICApO1xuICAgICAgfSxcbiAgICAgIHRydWVcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvbkRyYWdfKCkge1xuICAgIGNvbnN0IHt2YWx1ZX0gPSB0aGlzLmlucHV0RWxfO1xuICAgIGlmICh0aGlzLnNsaWRlclR5cGVfID09IFNsaWRlclR5cGUuUEVSQ0VOVEFHRSkge1xuICAgICAgdGhpcy5idWJibGVFbF8udGV4dENvbnRlbnQgPSBNYXRoLnJvdW5kKHZhbHVlKSArICclJztcbiAgICB9XG4gICAgdGhpcy5yb290RWxfLmNsYXNzTGlzdC5hZGQoTUlEX1NFTEVDVElPTl9DTEFTUyk7XG4gICAgc2V0SW1wb3J0YW50U3R5bGVzKHRoaXMucm9vdEVsXywgeyctLWZyYWN0aW9uJzogdmFsdWUgLyAxMDB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25SZWxlYXNlXygpIHtcbiAgICB0aGlzLnVwZGF0ZVRvUG9zdFNlbGVjdGlvblN0YXRlXygpO1xuICAgIHRoaXMuaW5wdXRFbF8uc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICcnKTtcbiAgICB0aGlzLnJvb3RFbF8uY2xhc3NMaXN0LnJlbW92ZShNSURfU0VMRUNUSU9OX0NMQVNTKTtcbiAgICB0aGlzLmhhbmRsZU9wdGlvblNlbGVjdGlvbl8oTWF0aC5yb3VuZCh0aGlzLmlucHV0RWxfLnZhbHVlKSk7XG4gIH1cblxuICAvKipAb3ZlcnJpZGUgKi9cbiAgZ2V0TnVtYmVyT2ZPcHRpb25zKCkge1xuICAgIHJldHVybiAxMDE7XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-story-interactive/0.1/amp-story-interactive-slider.js