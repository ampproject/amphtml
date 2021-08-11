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
import { AmpStoryInteractive, InteractiveType } from "./amp-story-interactive-abstract";
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
  return html(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n    <div class=\"i-amphtml-story-interactive-slider-container\">\n      <div class=\"i-amphtml-story-interactive-prompt-container\"></div>\n      <div class=\"i-amphtml-story-interactive-slider-input-container\">\n        <div class=\"i-amphtml-story-interactive-slider-input-size\">\n          <input\n            class=\"i-amphtml-story-interactive-slider-input\"\n            type=\"range\"\n            min=\"0\"\n            max=\"100\"\n            step=\"0.1\"\n            value=\"0\"\n          />\n          <div class=\"i-amphtml-story-interactive-slider-bubble-wrapper\">\n            <div class=\"i-amphtml-story-interactive-slider-bubble\"></div>\n          </div>\n        </div>\n      </div>\n    </div>\n  "])));
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
      var _this2 = this;

      _get(_getPrototypeOf(AmpStoryInteractiveSlider.prototype), "initializeListeners_", this).call(this);

      this.inputEl_.addEventListener('input', function () {
        cancelAnimationFrame(_this2.currentRAF_);

        _this2.onDrag_();
      });
      this.inputEl_.addEventListener('change', function () {// this.onRelease_();
      });
      this.inputEl_.addEventListener('touchmove', function (event) {
        return event.stopPropagation();
      }, true);
      this.storeService_.subscribe(StateProperty.CURRENT_PAGE_ID, function (currPageId) {
        var isPostState = _this2.rootEl_.classList.contains('i-amphtml-story-interactive-post-selection');

        if (isPostState) {
          // If it's already been interacted with, do not animate.
          return;
        }

        if (currPageId != _this2.getPageEl().getAttribute('id')) {
          // Resets animation when navigating away.
          cancelAnimationFrame(_this2.currentRAF_);
          clearTimeout(_this2.landingAnimationDelayTimeout_);
          _this2.inputEl_.value = 0;

          _this2.onDrag_();

          _this2.rootEl_.classList.remove('i-amphtml-story-interactive-mid-selection');

          return;
        }

        var startTime;

        var animateFrame = function animateFrame(currTime) {
          // Set current startTime if not defined.
          if (!startTime) {
            startTime = currTime;
          }

          var elapsed = currTime - startTime;

          if (HINT_ANIMATION_DURATION_MS < elapsed) {
            _this2.rootEl_.classList.remove('i-amphtml-story-interactive-mid-selection');

            return;
          }

          // Value between 0 and 1;
          var timePercentage = elapsed / HINT_ANIMATION_DURATION_MS;
          var val = timePercentage < 0.5 ? easeInOutCubic(timePercentage * 2) * 30 : easeInOutCubic(2 - timePercentage * 2) * 30;
          _this2.inputEl_.value = val;

          _this2.onDrag_();

          _this2.currentRAF_ = requestAnimationFrame(animateFrame);
        };

        _this2.landingAnimationDelayTimeout_ = setTimeout(function () {
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

      this.rootEl_.classList.add('i-amphtml-story-interactive-mid-selection');
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
      this.rootEl_.classList.remove('i-amphtml-story-interactive-mid-selection');
    }
  }]);

  return AmpStoryInteractiveSlider;
}(AmpStoryInteractive);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1pbnRlcmFjdGl2ZS1zbGlkZXIuanMiXSwibmFtZXMiOlsiQW1wU3RvcnlJbnRlcmFjdGl2ZSIsIkludGVyYWN0aXZlVHlwZSIsIkNTUyIsImh0bWxGb3IiLCJzZXRJbXBvcnRhbnRTdHlsZXMiLCJTdGF0ZVByb3BlcnR5IiwiYnVpbGRTbGlkZXJUZW1wbGF0ZSIsImVsZW1lbnQiLCJodG1sIiwiZWFzZUluT3V0Q3ViaWMiLCJ0IiwiU2xpZGVyVHlwZSIsIlBFUkNFTlRBR0UiLCJFTU9KSSIsIkhJTlRfQU5JTUFUSU9OX0RVUkFUSU9OX01TIiwiSElOVF9BTklNQVRJT05fREVMQVlfTVMiLCJBbXBTdG9yeUludGVyYWN0aXZlU2xpZGVyIiwiU0xJREVSIiwiYnViYmxlRWxfIiwiaW5wdXRFbF8iLCJzbGlkZXJUeXBlXyIsImxhbmRpbmdBbmltYXRpb25EZWxheVRpbWVvdXRfIiwiY3VycmVudFJBRl8iLCJyb290RWxfIiwicXVlcnlTZWxlY3RvciIsIm9wdGlvbnNfIiwibGVuZ3RoIiwiZW1vamlXcmFwcGVyIiwid2luIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwidGV4dENvbnRlbnQiLCJ0ZXh0IiwiYXBwZW5kQ2hpbGQiLCJzZXRBdHRyaWJ1dGUiLCJhdHRhY2hQcm9tcHRfIiwiYWRkRXZlbnRMaXN0ZW5lciIsImNhbmNlbEFuaW1hdGlvbkZyYW1lIiwib25EcmFnXyIsImV2ZW50Iiwic3RvcFByb3BhZ2F0aW9uIiwic3RvcmVTZXJ2aWNlXyIsInN1YnNjcmliZSIsIkNVUlJFTlRfUEFHRV9JRCIsImN1cnJQYWdlSWQiLCJpc1Bvc3RTdGF0ZSIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwiZ2V0UGFnZUVsIiwiZ2V0QXR0cmlidXRlIiwiY2xlYXJUaW1lb3V0IiwidmFsdWUiLCJyZW1vdmUiLCJzdGFydFRpbWUiLCJhbmltYXRlRnJhbWUiLCJjdXJyVGltZSIsImVsYXBzZWQiLCJ0aW1lUGVyY2VudGFnZSIsInZhbCIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsInNldFRpbWVvdXQiLCJNYXRoIiwicm91bmQiLCJhZGQiLCJ1cGRhdGVUb1Bvc3RTZWxlY3Rpb25TdGF0ZV8iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUNFQSxtQkFERixFQUVFQyxlQUZGO0FBSUEsU0FBUUMsR0FBUjtBQUNBLFNBQVFDLE9BQVI7QUFDQSxTQUFRQyxrQkFBUjtBQUNBLFNBQVFDLGFBQVI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUMsbUJBQW1CLEdBQUcsU0FBdEJBLG1CQUFzQixDQUFDQyxPQUFELEVBQWE7QUFDdkMsTUFBTUMsSUFBSSxHQUFHTCxPQUFPLENBQUNJLE9BQUQsQ0FBcEI7QUFDQSxTQUFPQyxJQUFQO0FBb0JELENBdEJEOztBQXdCQSxJQUFNQyxjQUFjLEdBQUcsU0FBakJBLGNBQWlCLENBQUNDLENBQUQ7QUFBQSxTQUNyQkEsQ0FBQyxHQUFHLEdBQUosR0FBVSxJQUFJQSxDQUFKLEdBQVFBLENBQVIsR0FBWUEsQ0FBdEIsR0FBMEIsQ0FBQ0EsQ0FBQyxHQUFHLENBQUwsS0FBVyxJQUFJQSxDQUFKLEdBQVEsQ0FBbkIsS0FBeUIsSUFBSUEsQ0FBSixHQUFRLENBQWpDLElBQXNDLENBRDNDO0FBQUEsQ0FBdkI7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBTUMsVUFBVSxHQUFHO0FBQ2pCQyxFQUFBQSxVQUFVLEVBQUUsWUFESztBQUVqQkMsRUFBQUEsS0FBSyxFQUFFO0FBRlUsQ0FBbkI7QUFLQSxJQUFNQywwQkFBMEIsR0FBRyxJQUFuQztBQUNBLElBQU1DLHVCQUF1QixHQUFHLEdBQWhDO0FBRUEsV0FBYUMseUJBQWI7QUFBQTs7QUFBQTs7QUFDRTtBQUNGO0FBQ0E7QUFDRSxxQ0FBWVQsT0FBWixFQUFxQjtBQUFBOztBQUFB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LEtBQUsvQixXQUFMLElBQW9CVCxVQUFVLENBQUNDLFVBQW5DLEVBQStDO0FBQzdDLGFBQUtNLFNBQUwsQ0FBZWEsV0FBZixHQUE2QjhCLElBQUksQ0FBQ0MsS0FBTCxDQUFXWCxLQUFYLElBQW9CLEdBQWpEO0FBQ0Q7O0FBQ0QsV0FBSzVCLE9BQUwsQ0FBYXVCLFNBQWIsQ0FBdUJpQixHQUF2QixDQUEyQiwyQ0FBM0I7QUFDQTNELE1BQUFBLGtCQUFrQixDQUFDLEtBQUttQixPQUFOLEVBQWU7QUFBQyxzQkFBYzRCLEtBQUssR0FBRztBQUF2QixPQUFmLENBQWxCO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7O0FBbElBO0FBQUE7QUFBQSxXQW1JRSxzQkFBYTtBQUNYLFdBQUthLDJCQUFMO0FBQ0EsV0FBSzdDLFFBQUwsQ0FBY2UsWUFBZCxDQUEyQixVQUEzQixFQUF1QyxFQUF2QztBQUNBLFdBQUtYLE9BQUwsQ0FBYXVCLFNBQWIsQ0FBdUJNLE1BQXZCLENBQThCLDJDQUE5QjtBQUNEO0FBdklIOztBQUFBO0FBQUEsRUFBK0NwRCxtQkFBL0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDIxIFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtcbiAgQW1wU3RvcnlJbnRlcmFjdGl2ZSxcbiAgSW50ZXJhY3RpdmVUeXBlLFxufSBmcm9tICcuL2FtcC1zdG9yeS1pbnRlcmFjdGl2ZS1hYnN0cmFjdCc7XG5pbXBvcnQge0NTU30gZnJvbSAnLi4vLi4vLi4vYnVpbGQvYW1wLXN0b3J5LWludGVyYWN0aXZlLXNsaWRlci0wLjEuY3NzJztcbmltcG9ydCB7aHRtbEZvcn0gZnJvbSAnI2NvcmUvZG9tL3N0YXRpYy10ZW1wbGF0ZSc7XG5pbXBvcnQge3NldEltcG9ydGFudFN0eWxlc30gZnJvbSAnI2NvcmUvZG9tL3N0eWxlJztcbmltcG9ydCB7U3RhdGVQcm9wZXJ0eX0gZnJvbSAnZXh0ZW5zaW9ucy9hbXAtc3RvcnkvMS4wL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlJztcblxuLyoqXG4gKiBHZW5lcmF0ZXMgdGhlIHRlbXBsYXRlIGZvciB0aGUgc2xpZGVyLlxuICpcbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4geyFFbGVtZW50fVxuICovXG5jb25zdCBidWlsZFNsaWRlclRlbXBsYXRlID0gKGVsZW1lbnQpID0+IHtcbiAgY29uc3QgaHRtbCA9IGh0bWxGb3IoZWxlbWVudCk7XG4gIHJldHVybiBodG1sYFxuICAgIDxkaXYgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtc2xpZGVyLWNvbnRhaW5lclwiPlxuICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1wcm9tcHQtY29udGFpbmVyXCI+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLXNsaWRlci1pbnB1dC1jb250YWluZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1zbGlkZXItaW5wdXQtc2l6ZVwiPlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtc2xpZGVyLWlucHV0XCJcbiAgICAgICAgICAgIHR5cGU9XCJyYW5nZVwiXG4gICAgICAgICAgICBtaW49XCIwXCJcbiAgICAgICAgICAgIG1heD1cIjEwMFwiXG4gICAgICAgICAgICBzdGVwPVwiMC4xXCJcbiAgICAgICAgICAgIHZhbHVlPVwiMFwiXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLXNsaWRlci1idWJibGUtd3JhcHBlclwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1zbGlkZXItYnViYmxlXCI+PC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG59O1xuXG5jb25zdCBlYXNlSW5PdXRDdWJpYyA9ICh0KSA9PlxuICB0IDwgMC41ID8gNCAqIHQgKiB0ICogdCA6ICh0IC0gMSkgKiAoMiAqIHQgLSAyKSAqICgyICogdCAtIDIpICsgMTtcbi8qKlxuICogQGNvbnN0IEBlbnVtIHtudW1iZXJ9XG4gKi9cbmNvbnN0IFNsaWRlclR5cGUgPSB7XG4gIFBFUkNFTlRBR0U6ICdwZXJjZW50YWdlJyxcbiAgRU1PSkk6ICdlbW9qaScsXG59O1xuXG5jb25zdCBISU5UX0FOSU1BVElPTl9EVVJBVElPTl9NUyA9IDE1MDA7XG5jb25zdCBISU5UX0FOSU1BVElPTl9ERUxBWV9NUyA9IDUwMDtcblxuZXhwb3J0IGNsYXNzIEFtcFN0b3J5SW50ZXJhY3RpdmVTbGlkZXIgZXh0ZW5kcyBBbXBTdG9yeUludGVyYWN0aXZlIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IGVsZW1lbnRcbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICBzdXBlcihlbGVtZW50LCBJbnRlcmFjdGl2ZVR5cGUuU0xJREVSLCBbMCwgMV0pO1xuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9IGJ1YmJsZSBjb250YWluaW5nIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBvZiB0aGUgdXNlciB3aGlsZSBkcmFnZ2luZyAqL1xuICAgIHRoaXMuYnViYmxlRWxfID0gbnVsbDtcbiAgICAvKiogQHByaXZhdGUgez9FbGVtZW50fSB0cmFja3MgdXNlciBpbnB1dCAqL1xuICAgIHRoaXMuaW5wdXRFbF8gPSBudWxsO1xuICAgIC8qKiBAcHJpdmF0ZSB7IVNsaWRlclR5cGV9ICAqL1xuICAgIHRoaXMuc2xpZGVyVHlwZV8gPSBTbGlkZXJUeXBlLlBFUkNFTlRBR0U7XG4gICAgLyoqIEBwcml2YXRlIHs/bnVtYmVyfSBSZWZlcmVuY2UgdG8gdGltZW91dCBzbyB3ZSBjYW4gY2FuY2VsIGl0IGlmIG5lZWRlZC4gKi9cbiAgICB0aGlzLmxhbmRpbmdBbmltYXRpb25EZWxheVRpbWVvdXRfID0gbnVsbDtcbiAgICAvKiogIEBwcml2YXRlIHs/bnVtYmVyfSBSZWZlcmVuY2UgdG8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIHNvIHdlIGNhbiBjYW5jZWwgaXQgaWYgbmVlZGVkLiovXG4gICAgdGhpcy5jdXJyZW50UkFGXyA9IG51bGw7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGJ1aWxkQ29tcG9uZW50KCkge1xuICAgIHRoaXMucm9vdEVsXyA9IGJ1aWxkU2xpZGVyVGVtcGxhdGUodGhpcy5lbGVtZW50KTtcbiAgICB0aGlzLmJ1YmJsZUVsXyA9IHRoaXMucm9vdEVsXy5xdWVyeVNlbGVjdG9yKFxuICAgICAgJy5pLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtc2xpZGVyLWJ1YmJsZSdcbiAgICApO1xuICAgIHRoaXMuaW5wdXRFbF8gPSB0aGlzLnJvb3RFbF8ucXVlcnlTZWxlY3RvcihcbiAgICAgICcuaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLXNsaWRlci1pbnB1dCdcbiAgICApO1xuXG4gICAgaWYgKHRoaXMub3B0aW9uc18ubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5zbGlkZXJUeXBlXyA9IFNsaWRlclR5cGUuRU1PSkk7XG4gICAgICBjb25zdCBlbW9qaVdyYXBwZXIgPSB0aGlzLndpbi5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICBlbW9qaVdyYXBwZXIudGV4dENvbnRlbnQgPSB0aGlzLm9wdGlvbnNfWzBdLnRleHQ7XG4gICAgICB0aGlzLmJ1YmJsZUVsXy5hcHBlbmRDaGlsZChlbW9qaVdyYXBwZXIpO1xuICAgIH1cblxuICAgIHRoaXMucm9vdEVsXy5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCB0aGlzLnNsaWRlclR5cGVfKTtcbiAgICB0aGlzLmF0dGFjaFByb21wdF8odGhpcy5yb290RWxfKTtcbiAgICByZXR1cm4gdGhpcy5yb290RWxfO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBidWlsZENhbGxiYWNrKCkge1xuICAgIHJldHVybiBzdXBlci5idWlsZENhbGxiYWNrKENTUyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGluaXRpYWxpemVMaXN0ZW5lcnNfKCkge1xuICAgIHN1cGVyLmluaXRpYWxpemVMaXN0ZW5lcnNfKCk7XG5cbiAgICB0aGlzLmlucHV0RWxfLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5jdXJyZW50UkFGXyk7XG4gICAgICB0aGlzLm9uRHJhZ18oKTtcbiAgICB9KTtcbiAgICB0aGlzLmlucHV0RWxfLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgIC8vIHRoaXMub25SZWxlYXNlXygpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5pbnB1dEVsXy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgJ3RvdWNobW92ZScsXG4gICAgICAoZXZlbnQpID0+IGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpLFxuICAgICAgdHJ1ZVxuICAgICk7XG5cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uc3Vic2NyaWJlKFxuICAgICAgU3RhdGVQcm9wZXJ0eS5DVVJSRU5UX1BBR0VfSUQsXG4gICAgICAoY3VyclBhZ2VJZCkgPT4ge1xuICAgICAgICBjb25zdCBpc1Bvc3RTdGF0ZSA9IHRoaXMucm9vdEVsXy5jbGFzc0xpc3QuY29udGFpbnMoXG4gICAgICAgICAgJ2ktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1wb3N0LXNlbGVjdGlvbidcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKGlzUG9zdFN0YXRlKSB7XG4gICAgICAgICAgLy8gSWYgaXQncyBhbHJlYWR5IGJlZW4gaW50ZXJhY3RlZCB3aXRoLCBkbyBub3QgYW5pbWF0ZS5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGN1cnJQYWdlSWQgIT0gdGhpcy5nZXRQYWdlRWwoKS5nZXRBdHRyaWJ1dGUoJ2lkJykpIHtcbiAgICAgICAgICAvLyBSZXNldHMgYW5pbWF0aW9uIHdoZW4gbmF2aWdhdGluZyBhd2F5LlxuICAgICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuY3VycmVudFJBRl8pO1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmxhbmRpbmdBbmltYXRpb25EZWxheVRpbWVvdXRfKTtcbiAgICAgICAgICB0aGlzLmlucHV0RWxfLnZhbHVlID0gMDtcbiAgICAgICAgICB0aGlzLm9uRHJhZ18oKTtcbiAgICAgICAgICB0aGlzLnJvb3RFbF8uY2xhc3NMaXN0LnJlbW92ZShcbiAgICAgICAgICAgICdpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtbWlkLXNlbGVjdGlvbidcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgc3RhcnRUaW1lO1xuICAgICAgICBjb25zdCBhbmltYXRlRnJhbWUgPSAoY3VyclRpbWUpID0+IHtcbiAgICAgICAgICAvLyBTZXQgY3VycmVudCBzdGFydFRpbWUgaWYgbm90IGRlZmluZWQuXG4gICAgICAgICAgaWYgKCFzdGFydFRpbWUpIHtcbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IGN1cnJUaW1lO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBlbGFwc2VkID0gY3VyclRpbWUgLSBzdGFydFRpbWU7XG4gICAgICAgICAgaWYgKEhJTlRfQU5JTUFUSU9OX0RVUkFUSU9OX01TIDwgZWxhcHNlZCkge1xuICAgICAgICAgICAgdGhpcy5yb290RWxfLmNsYXNzTGlzdC5yZW1vdmUoXG4gICAgICAgICAgICAgICdpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtbWlkLXNlbGVjdGlvbidcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFZhbHVlIGJldHdlZW4gMCBhbmQgMTtcbiAgICAgICAgICBjb25zdCB0aW1lUGVyY2VudGFnZSA9IGVsYXBzZWQgLyBISU5UX0FOSU1BVElPTl9EVVJBVElPTl9NUztcbiAgICAgICAgICBjb25zdCB2YWwgPVxuICAgICAgICAgICAgdGltZVBlcmNlbnRhZ2UgPCAwLjVcbiAgICAgICAgICAgICAgPyBlYXNlSW5PdXRDdWJpYyh0aW1lUGVyY2VudGFnZSAqIDIpICogMzBcbiAgICAgICAgICAgICAgOiBlYXNlSW5PdXRDdWJpYygyIC0gdGltZVBlcmNlbnRhZ2UgKiAyKSAqIDMwO1xuICAgICAgICAgIHRoaXMuaW5wdXRFbF8udmFsdWUgPSB2YWw7XG4gICAgICAgICAgdGhpcy5vbkRyYWdfKCk7XG4gICAgICAgICAgdGhpcy5jdXJyZW50UkFGXyA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlRnJhbWUpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmxhbmRpbmdBbmltYXRpb25EZWxheVRpbWVvdXRfID0gc2V0VGltZW91dChcbiAgICAgICAgICAoKSA9PiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZUZyYW1lKSxcbiAgICAgICAgICBISU5UX0FOSU1BVElPTl9ERUxBWV9NU1xuICAgICAgICApO1xuICAgICAgfSxcbiAgICAgIHRydWVcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvbkRyYWdfKCkge1xuICAgIGNvbnN0IHt2YWx1ZX0gPSB0aGlzLmlucHV0RWxfO1xuICAgIGlmICh0aGlzLnNsaWRlclR5cGVfID09IFNsaWRlclR5cGUuUEVSQ0VOVEFHRSkge1xuICAgICAgdGhpcy5idWJibGVFbF8udGV4dENvbnRlbnQgPSBNYXRoLnJvdW5kKHZhbHVlKSArICclJztcbiAgICB9XG4gICAgdGhpcy5yb290RWxfLmNsYXNzTGlzdC5hZGQoJ2ktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1taWQtc2VsZWN0aW9uJyk7XG4gICAgc2V0SW1wb3J0YW50U3R5bGVzKHRoaXMucm9vdEVsXywgeyctLWZyYWN0aW9uJzogdmFsdWUgLyAxMDB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25SZWxlYXNlXygpIHtcbiAgICB0aGlzLnVwZGF0ZVRvUG9zdFNlbGVjdGlvblN0YXRlXygpO1xuICAgIHRoaXMuaW5wdXRFbF8uc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICcnKTtcbiAgICB0aGlzLnJvb3RFbF8uY2xhc3NMaXN0LnJlbW92ZSgnaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW1pZC1zZWxlY3Rpb24nKTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-story-interactive/0.1/amp-story-interactive-slider.js