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
      this.inputEl_.addEventListener('change', function () {
        _this2.onRelease_();
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
      });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1pbnRlcmFjdGl2ZS1zbGlkZXIuanMiXSwibmFtZXMiOlsiQW1wU3RvcnlJbnRlcmFjdGl2ZSIsIkludGVyYWN0aXZlVHlwZSIsIkNTUyIsImh0bWxGb3IiLCJzZXRJbXBvcnRhbnRTdHlsZXMiLCJTdGF0ZVByb3BlcnR5IiwiYnVpbGRTbGlkZXJUZW1wbGF0ZSIsImVsZW1lbnQiLCJodG1sIiwiZWFzZUluT3V0Q3ViaWMiLCJ0IiwiU2xpZGVyVHlwZSIsIlBFUkNFTlRBR0UiLCJFTU9KSSIsIkhJTlRfQU5JTUFUSU9OX0RVUkFUSU9OX01TIiwiSElOVF9BTklNQVRJT05fREVMQVlfTVMiLCJBbXBTdG9yeUludGVyYWN0aXZlU2xpZGVyIiwiU0xJREVSIiwiYnViYmxlRWxfIiwiaW5wdXRFbF8iLCJzbGlkZXJUeXBlXyIsImxhbmRpbmdBbmltYXRpb25EZWxheVRpbWVvdXRfIiwiY3VycmVudFJBRl8iLCJyb290RWxfIiwicXVlcnlTZWxlY3RvciIsIm9wdGlvbnNfIiwibGVuZ3RoIiwiZW1vamlXcmFwcGVyIiwid2luIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwidGV4dENvbnRlbnQiLCJ0ZXh0IiwiYXBwZW5kQ2hpbGQiLCJzZXRBdHRyaWJ1dGUiLCJhdHRhY2hQcm9tcHRfIiwiYWRkRXZlbnRMaXN0ZW5lciIsImNhbmNlbEFuaW1hdGlvbkZyYW1lIiwib25EcmFnXyIsIm9uUmVsZWFzZV8iLCJldmVudCIsInN0b3BQcm9wYWdhdGlvbiIsInN0b3JlU2VydmljZV8iLCJzdWJzY3JpYmUiLCJDVVJSRU5UX1BBR0VfSUQiLCJjdXJyUGFnZUlkIiwiaXNQb3N0U3RhdGUiLCJjbGFzc0xpc3QiLCJjb250YWlucyIsImdldFBhZ2VFbCIsImdldEF0dHJpYnV0ZSIsImNsZWFyVGltZW91dCIsInZhbHVlIiwicmVtb3ZlIiwic3RhcnRUaW1lIiwiYW5pbWF0ZUZyYW1lIiwiY3VyclRpbWUiLCJlbGFwc2VkIiwidGltZVBlcmNlbnRhZ2UiLCJ2YWwiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJzZXRUaW1lb3V0IiwiTWF0aCIsInJvdW5kIiwiYWRkIiwidXBkYXRlVG9Qb3N0U2VsZWN0aW9uU3RhdGVfIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FDRUEsbUJBREYsRUFFRUMsZUFGRjtBQUlBLFNBQVFDLEdBQVI7QUFDQSxTQUFRQyxPQUFSO0FBQ0EsU0FBUUMsa0JBQVI7QUFDQSxTQUFRQyxhQUFSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1DLG1CQUFtQixHQUFHLFNBQXRCQSxtQkFBc0IsQ0FBQ0MsT0FBRCxFQUFhO0FBQ3ZDLE1BQU1DLElBQUksR0FBR0wsT0FBTyxDQUFDSSxPQUFELENBQXBCO0FBQ0EsU0FBT0MsSUFBUDtBQW9CRCxDQXRCRDs7QUF3QkEsSUFBTUMsY0FBYyxHQUFHLFNBQWpCQSxjQUFpQixDQUFDQyxDQUFEO0FBQUEsU0FDckJBLENBQUMsR0FBRyxHQUFKLEdBQVUsSUFBSUEsQ0FBSixHQUFRQSxDQUFSLEdBQVlBLENBQXRCLEdBQTBCLENBQUNBLENBQUMsR0FBRyxDQUFMLEtBQVcsSUFBSUEsQ0FBSixHQUFRLENBQW5CLEtBQXlCLElBQUlBLENBQUosR0FBUSxDQUFqQyxJQUFzQyxDQUQzQztBQUFBLENBQXZCOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQU1DLFVBQVUsR0FBRztBQUNqQkMsRUFBQUEsVUFBVSxFQUFFLFlBREs7QUFFakJDLEVBQUFBLEtBQUssRUFBRTtBQUZVLENBQW5CO0FBS0EsSUFBTUMsMEJBQTBCLEdBQUcsSUFBbkM7QUFDQSxJQUFNQyx1QkFBdUIsR0FBRyxHQUFoQztBQUVBLFdBQWFDLHlCQUFiO0FBQUE7O0FBQUE7O0FBQ0U7QUFDRjtBQUNBO0FBQ0UscUNBQVlULE9BQVosRUFB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Q0FBT2lDLEtBQVA7O0FBQ0EsVUFBSSxLQUFLaEMsV0FBTCxJQUFvQlQsVUFBVSxDQUFDQyxVQUFuQyxFQUErQztBQUM3QyxhQUFLTSxTQUFMLENBQWVhLFdBQWYsR0FBNkIrQixJQUFJLENBQUNDLEtBQUwsQ0FBV1gsS0FBWCxJQUFvQixHQUFqRDtBQUNEOztBQUNELFdBQUs3QixPQUFMLENBQWF3QixTQUFiLENBQXVCaUIsR0FBdkIsQ0FBMkIsMkNBQTNCO0FBQ0E1RCxNQUFBQSxrQkFBa0IsQ0FBQyxLQUFLbUIsT0FBTixFQUFlO0FBQUMsc0JBQWM2QixLQUFLLEdBQUc7QUFBdkIsT0FBZixDQUFsQjtBQUNEO0FBRUQ7QUFDRjtBQUNBOztBQWpJQTtBQUFBO0FBQUEsV0FrSUUsc0JBQWE7QUFDWCxXQUFLYSwyQkFBTDtBQUNBLFdBQUs5QyxRQUFMLENBQWNlLFlBQWQsQ0FBMkIsVUFBM0IsRUFBdUMsRUFBdkM7QUFDQSxXQUFLWCxPQUFMLENBQWF3QixTQUFiLENBQXVCTSxNQUF2QixDQUE4QiwyQ0FBOUI7QUFDRDtBQXRJSDs7QUFBQTtBQUFBLEVBQStDckQsbUJBQS9DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAyMSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7XG4gIEFtcFN0b3J5SW50ZXJhY3RpdmUsXG4gIEludGVyYWN0aXZlVHlwZSxcbn0gZnJvbSAnLi9hbXAtc3RvcnktaW50ZXJhY3RpdmUtYWJzdHJhY3QnO1xuaW1wb3J0IHtDU1N9IGZyb20gJy4uLy4uLy4uL2J1aWxkL2FtcC1zdG9yeS1pbnRlcmFjdGl2ZS1zbGlkZXItMC4xLmNzcyc7XG5pbXBvcnQge2h0bWxGb3J9IGZyb20gJyNjb3JlL2RvbS9zdGF0aWMtdGVtcGxhdGUnO1xuaW1wb3J0IHtzZXRJbXBvcnRhbnRTdHlsZXN9IGZyb20gJyNjb3JlL2RvbS9zdHlsZSc7XG5pbXBvcnQge1N0YXRlUHJvcGVydHl9IGZyb20gJ2V4dGVuc2lvbnMvYW1wLXN0b3J5LzEuMC9hbXAtc3Rvcnktc3RvcmUtc2VydmljZSc7XG5cbi8qKlxuICogR2VuZXJhdGVzIHRoZSB0ZW1wbGF0ZSBmb3IgdGhlIHNsaWRlci5cbiAqXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJuIHshRWxlbWVudH1cbiAqL1xuY29uc3QgYnVpbGRTbGlkZXJUZW1wbGF0ZSA9IChlbGVtZW50KSA9PiB7XG4gIGNvbnN0IGh0bWwgPSBodG1sRm9yKGVsZW1lbnQpO1xuICByZXR1cm4gaHRtbGBcbiAgICA8ZGl2IGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLXNsaWRlci1jb250YWluZXJcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtcHJvbXB0LWNvbnRhaW5lclwiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1zbGlkZXItaW5wdXQtY29udGFpbmVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtc2xpZGVyLWlucHV0LXNpemVcIj5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLXNsaWRlci1pbnB1dFwiXG4gICAgICAgICAgICB0eXBlPVwicmFuZ2VcIlxuICAgICAgICAgICAgbWluPVwiMFwiXG4gICAgICAgICAgICBtYXg9XCIxMDBcIlxuICAgICAgICAgICAgc3RlcD1cIjAuMVwiXG4gICAgICAgICAgICB2YWx1ZT1cIjBcIlxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1zbGlkZXItYnViYmxlLXdyYXBwZXJcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtc2xpZGVyLWJ1YmJsZVwiPjwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xufTtcblxuY29uc3QgZWFzZUluT3V0Q3ViaWMgPSAodCkgPT5cbiAgdCA8IDAuNSA/IDQgKiB0ICogdCAqIHQgOiAodCAtIDEpICogKDIgKiB0IC0gMikgKiAoMiAqIHQgLSAyKSArIDE7XG4vKipcbiAqIEBjb25zdCBAZW51bSB7bnVtYmVyfVxuICovXG5jb25zdCBTbGlkZXJUeXBlID0ge1xuICBQRVJDRU5UQUdFOiAncGVyY2VudGFnZScsXG4gIEVNT0pJOiAnZW1vamknLFxufTtcblxuY29uc3QgSElOVF9BTklNQVRJT05fRFVSQVRJT05fTVMgPSAxNTAwO1xuY29uc3QgSElOVF9BTklNQVRJT05fREVMQVlfTVMgPSA1MDA7XG5cbmV4cG9ydCBjbGFzcyBBbXBTdG9yeUludGVyYWN0aXZlU2xpZGVyIGV4dGVuZHMgQW1wU3RvcnlJbnRlcmFjdGl2ZSB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFBbXBFbGVtZW50fSBlbGVtZW50XG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XG4gICAgc3VwZXIoZWxlbWVudCwgSW50ZXJhY3RpdmVUeXBlLlNMSURFUiwgWzAsIDFdKTtcbiAgICAvKiogQHByaXZhdGUgez9FbGVtZW50fSBidWJibGUgY29udGFpbmluZyB0aGUgY3VycmVudCBzZWxlY3Rpb24gb2YgdGhlIHVzZXIgd2hpbGUgZHJhZ2dpbmcgKi9cbiAgICB0aGlzLmJ1YmJsZUVsXyA9IG51bGw7XG4gICAgLyoqIEBwcml2YXRlIHs/RWxlbWVudH0gdHJhY2tzIHVzZXIgaW5wdXQgKi9cbiAgICB0aGlzLmlucHV0RWxfID0gbnVsbDtcbiAgICAvKiogQHByaXZhdGUgeyFTbGlkZXJUeXBlfSAgKi9cbiAgICB0aGlzLnNsaWRlclR5cGVfID0gU2xpZGVyVHlwZS5QRVJDRU5UQUdFO1xuICAgIC8qKiBAcHJpdmF0ZSB7P251bWJlcn0gUmVmZXJlbmNlIHRvIHRpbWVvdXQgc28gd2UgY2FuIGNhbmNlbCBpdCBpZiBuZWVkZWQuICovXG4gICAgdGhpcy5sYW5kaW5nQW5pbWF0aW9uRGVsYXlUaW1lb3V0XyA9IG51bGw7XG4gICAgLyoqICBAcHJpdmF0ZSB7P251bWJlcn0gUmVmZXJlbmNlIHRvIHJlcXVlc3RBbmltYXRpb25GcmFtZSBzbyB3ZSBjYW4gY2FuY2VsIGl0IGlmIG5lZWRlZC4qL1xuICAgIHRoaXMuY3VycmVudFJBRl8gPSBudWxsO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBidWlsZENvbXBvbmVudCgpIHtcbiAgICB0aGlzLnJvb3RFbF8gPSBidWlsZFNsaWRlclRlbXBsYXRlKHRoaXMuZWxlbWVudCk7XG4gICAgdGhpcy5idWJibGVFbF8gPSB0aGlzLnJvb3RFbF8ucXVlcnlTZWxlY3RvcihcbiAgICAgICcuaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLXNsaWRlci1idWJibGUnXG4gICAgKTtcbiAgICB0aGlzLmlucHV0RWxfID0gdGhpcy5yb290RWxfLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAnLmktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1zbGlkZXItaW5wdXQnXG4gICAgKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnNfLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuc2xpZGVyVHlwZV8gPSBTbGlkZXJUeXBlLkVNT0pJO1xuICAgICAgY29uc3QgZW1vamlXcmFwcGVyID0gdGhpcy53aW4uZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgZW1vamlXcmFwcGVyLnRleHRDb250ZW50ID0gdGhpcy5vcHRpb25zX1swXS50ZXh0O1xuICAgICAgdGhpcy5idWJibGVFbF8uYXBwZW5kQ2hpbGQoZW1vamlXcmFwcGVyKTtcbiAgICB9XG5cbiAgICB0aGlzLnJvb3RFbF8uc2V0QXR0cmlidXRlKCd0eXBlJywgdGhpcy5zbGlkZXJUeXBlXyk7XG4gICAgdGhpcy5hdHRhY2hQcm9tcHRfKHRoaXMucm9vdEVsXyk7XG4gICAgcmV0dXJuIHRoaXMucm9vdEVsXztcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgYnVpbGRDYWxsYmFjaygpIHtcbiAgICByZXR1cm4gc3VwZXIuYnVpbGRDYWxsYmFjayhDU1MpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBpbml0aWFsaXplTGlzdGVuZXJzXygpIHtcbiAgICBzdXBlci5pbml0aWFsaXplTGlzdGVuZXJzXygpO1xuXG4gICAgdGhpcy5pbnB1dEVsXy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcbiAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuY3VycmVudFJBRl8pO1xuICAgICAgdGhpcy5vbkRyYWdfKCk7XG4gICAgfSk7XG4gICAgdGhpcy5pbnB1dEVsXy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICB0aGlzLm9uUmVsZWFzZV8oKTtcbiAgICB9KTtcblxuICAgIHRoaXMuaW5wdXRFbF8uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICd0b3VjaG1vdmUnLFxuICAgICAgKGV2ZW50KSA9PiBldmVudC5zdG9wUHJvcGFnYXRpb24oKSxcbiAgICAgIHRydWVcbiAgICApO1xuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShcbiAgICAgIFN0YXRlUHJvcGVydHkuQ1VSUkVOVF9QQUdFX0lELFxuICAgICAgKGN1cnJQYWdlSWQpID0+IHtcbiAgICAgICAgY29uc3QgaXNQb3N0U3RhdGUgPSB0aGlzLnJvb3RFbF8uY2xhc3NMaXN0LmNvbnRhaW5zKFxuICAgICAgICAgICdpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtcG9zdC1zZWxlY3Rpb24nXG4gICAgICAgICk7XG4gICAgICAgIGlmIChpc1Bvc3RTdGF0ZSkge1xuICAgICAgICAgIC8vIElmIGl0J3MgYWxyZWFkeSBiZWVuIGludGVyYWN0ZWQgd2l0aCwgZG8gbm90IGFuaW1hdGUuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjdXJyUGFnZUlkICE9IHRoaXMuZ2V0UGFnZUVsKCkuZ2V0QXR0cmlidXRlKCdpZCcpKSB7XG4gICAgICAgICAgLy8gUmVzZXRzIGFuaW1hdGlvbiB3aGVuIG5hdmlnYXRpbmcgYXdheS5cbiAgICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLmN1cnJlbnRSQUZfKTtcbiAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5sYW5kaW5nQW5pbWF0aW9uRGVsYXlUaW1lb3V0Xyk7XG4gICAgICAgICAgdGhpcy5pbnB1dEVsXy52YWx1ZSA9IDA7XG4gICAgICAgICAgdGhpcy5vbkRyYWdfKCk7XG4gICAgICAgICAgdGhpcy5yb290RWxfLmNsYXNzTGlzdC5yZW1vdmUoXG4gICAgICAgICAgICAnaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW1pZC1zZWxlY3Rpb24nXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHN0YXJ0VGltZTtcbiAgICAgICAgY29uc3QgYW5pbWF0ZUZyYW1lID0gKGN1cnJUaW1lKSA9PiB7XG4gICAgICAgICAgLy8gU2V0IGN1cnJlbnQgc3RhcnRUaW1lIGlmIG5vdCBkZWZpbmVkLlxuICAgICAgICAgIGlmICghc3RhcnRUaW1lKSB7XG4gICAgICAgICAgICBzdGFydFRpbWUgPSBjdXJyVGltZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgZWxhcHNlZCA9IGN1cnJUaW1lIC0gc3RhcnRUaW1lO1xuICAgICAgICAgIGlmIChISU5UX0FOSU1BVElPTl9EVVJBVElPTl9NUyA8IGVsYXBzZWQpIHtcbiAgICAgICAgICAgIHRoaXMucm9vdEVsXy5jbGFzc0xpc3QucmVtb3ZlKFxuICAgICAgICAgICAgICAnaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW1pZC1zZWxlY3Rpb24nXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBWYWx1ZSBiZXR3ZWVuIDAgYW5kIDE7XG4gICAgICAgICAgY29uc3QgdGltZVBlcmNlbnRhZ2UgPSBlbGFwc2VkIC8gSElOVF9BTklNQVRJT05fRFVSQVRJT05fTVM7XG4gICAgICAgICAgY29uc3QgdmFsID1cbiAgICAgICAgICAgIHRpbWVQZXJjZW50YWdlIDwgMC41XG4gICAgICAgICAgICAgID8gZWFzZUluT3V0Q3ViaWModGltZVBlcmNlbnRhZ2UgKiAyKSAqIDMwXG4gICAgICAgICAgICAgIDogZWFzZUluT3V0Q3ViaWMoMiAtIHRpbWVQZXJjZW50YWdlICogMikgKiAzMDtcbiAgICAgICAgICB0aGlzLmlucHV0RWxfLnZhbHVlID0gdmFsO1xuICAgICAgICAgIHRoaXMub25EcmFnXygpO1xuICAgICAgICAgIHRoaXMuY3VycmVudFJBRl8gPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZUZyYW1lKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5sYW5kaW5nQW5pbWF0aW9uRGVsYXlUaW1lb3V0XyA9IHNldFRpbWVvdXQoXG4gICAgICAgICAgKCkgPT4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGVGcmFtZSksXG4gICAgICAgICAgSElOVF9BTklNQVRJT05fREVMQVlfTVNcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvbkRyYWdfKCkge1xuICAgIGNvbnN0IHt2YWx1ZX0gPSB0aGlzLmlucHV0RWxfO1xuICAgIGlmICh0aGlzLnNsaWRlclR5cGVfID09IFNsaWRlclR5cGUuUEVSQ0VOVEFHRSkge1xuICAgICAgdGhpcy5idWJibGVFbF8udGV4dENvbnRlbnQgPSBNYXRoLnJvdW5kKHZhbHVlKSArICclJztcbiAgICB9XG4gICAgdGhpcy5yb290RWxfLmNsYXNzTGlzdC5hZGQoJ2ktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1taWQtc2VsZWN0aW9uJyk7XG4gICAgc2V0SW1wb3J0YW50U3R5bGVzKHRoaXMucm9vdEVsXywgeyctLWZyYWN0aW9uJzogdmFsdWUgLyAxMDB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25SZWxlYXNlXygpIHtcbiAgICB0aGlzLnVwZGF0ZVRvUG9zdFNlbGVjdGlvblN0YXRlXygpO1xuICAgIHRoaXMuaW5wdXRFbF8uc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICcnKTtcbiAgICB0aGlzLnJvb3RFbF8uY2xhc3NMaXN0LnJlbW92ZSgnaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW1pZC1zZWxlY3Rpb24nKTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-story-interactive/0.1/amp-story-interactive-slider.js