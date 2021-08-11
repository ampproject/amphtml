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
//import {scopedQuerySelector, scopedQuerySelectorAll} from '#core/dom/query';
import { setImportantStyles } from "../../../src/core/dom/style";

/**
 * Generates the template for the slider.
 *
 * @param {!Element} element
 * @return {!Element}
 */
var buildSliderTemplate = function buildSliderTemplate(element) {
  var html = htmlFor(element);
  return html(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n    <div class=\"i-amphtml-story-interactive-slider-container\">\n      <div class=\"i-amphtml-story-interactive-prompt-container\"></div>\n      <div class=\"i-amphtml-story-interactive-slider-input-container\">\n        <div class=\"i-amphtml-story-interactive-slider-input-size\">\n          <input\n            class=\"i-amphtml-story-interactive-slider-input\"\n            type=\"range\"\n            min=\"0\"\n            max=\"100\"\n            value=\"0\"\n          />\n          <div class=\"i-amphtml-story-interactive-slider-bubble\"></div>\n        </div>\n      </div>\n    </div>\n  "])));
};

/**
 * @const @enum {number}
 */
var SliderType = {
  PERCENTAGE: 'percentage',
  EMOJI: 'emoji'
};
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
        _this2.onDrag_();
      });
      this.inputEl_.addEventListener('change', function () {
        _this2.onRelease_();
      });
      this.inputEl_.addEventListener('touchmove', function (event) {
        return event.stopPropagation();
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
        this.bubbleEl_.textContent = value + '%';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1pbnRlcmFjdGl2ZS1zbGlkZXIuanMiXSwibmFtZXMiOlsiQW1wU3RvcnlJbnRlcmFjdGl2ZSIsIkludGVyYWN0aXZlVHlwZSIsIkNTUyIsImh0bWxGb3IiLCJzZXRJbXBvcnRhbnRTdHlsZXMiLCJidWlsZFNsaWRlclRlbXBsYXRlIiwiZWxlbWVudCIsImh0bWwiLCJTbGlkZXJUeXBlIiwiUEVSQ0VOVEFHRSIsIkVNT0pJIiwiQW1wU3RvcnlJbnRlcmFjdGl2ZVNsaWRlciIsIlNMSURFUiIsImJ1YmJsZUVsXyIsImlucHV0RWxfIiwic2xpZGVyVHlwZV8iLCJyb290RWxfIiwicXVlcnlTZWxlY3RvciIsIm9wdGlvbnNfIiwibGVuZ3RoIiwiZW1vamlXcmFwcGVyIiwid2luIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwidGV4dENvbnRlbnQiLCJ0ZXh0IiwiYXBwZW5kQ2hpbGQiLCJzZXRBdHRyaWJ1dGUiLCJhdHRhY2hQcm9tcHRfIiwiYWRkRXZlbnRMaXN0ZW5lciIsIm9uRHJhZ18iLCJvblJlbGVhc2VfIiwiZXZlbnQiLCJzdG9wUHJvcGFnYXRpb24iLCJ2YWx1ZSIsImNsYXNzTGlzdCIsImFkZCIsInVwZGF0ZVRvUG9zdFNlbGVjdGlvblN0YXRlXyIsInJlbW92ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQ0VBLG1CQURGLEVBRUVDLGVBRkY7QUFJQSxTQUFRQyxHQUFSO0FBQ0EsU0FBUUMsT0FBUjtBQUNBO0FBQ0EsU0FBUUMsa0JBQVI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUMsbUJBQW1CLEdBQUcsU0FBdEJBLG1CQUFzQixDQUFDQyxPQUFELEVBQWE7QUFDdkMsTUFBTUMsSUFBSSxHQUFHSixPQUFPLENBQUNH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QWE7QUFDWCxXQUFLRywyQkFBTDtBQUNBLFdBQUt2QixRQUFMLENBQWNhLFlBQWQsQ0FBMkIsVUFBM0IsRUFBdUMsRUFBdkM7QUFDQSxXQUFLWCxPQUFMLENBQWFtQixTQUFiLENBQXVCRyxNQUF2QixDQUE4QiwyQ0FBOUI7QUFDRDtBQS9FSDs7QUFBQTtBQUFBLEVBQStDdEMsbUJBQS9DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAyMSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7XG4gIEFtcFN0b3J5SW50ZXJhY3RpdmUsXG4gIEludGVyYWN0aXZlVHlwZSxcbn0gZnJvbSAnLi9hbXAtc3RvcnktaW50ZXJhY3RpdmUtYWJzdHJhY3QnO1xuaW1wb3J0IHtDU1N9IGZyb20gJy4uLy4uLy4uL2J1aWxkL2FtcC1zdG9yeS1pbnRlcmFjdGl2ZS1zbGlkZXItMC4xLmNzcyc7XG5pbXBvcnQge2h0bWxGb3J9IGZyb20gJyNjb3JlL2RvbS9zdGF0aWMtdGVtcGxhdGUnO1xuLy9pbXBvcnQge3Njb3BlZFF1ZXJ5U2VsZWN0b3IsIHNjb3BlZFF1ZXJ5U2VsZWN0b3JBbGx9IGZyb20gJyNjb3JlL2RvbS9xdWVyeSc7XG5pbXBvcnQge3NldEltcG9ydGFudFN0eWxlc30gZnJvbSAnI2NvcmUvZG9tL3N0eWxlJztcblxuLyoqXG4gKiBHZW5lcmF0ZXMgdGhlIHRlbXBsYXRlIGZvciB0aGUgc2xpZGVyLlxuICpcbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4geyFFbGVtZW50fVxuICovXG5jb25zdCBidWlsZFNsaWRlclRlbXBsYXRlID0gKGVsZW1lbnQpID0+IHtcbiAgY29uc3QgaHRtbCA9IGh0bWxGb3IoZWxlbWVudCk7XG4gIHJldHVybiBodG1sYFxuICAgIDxkaXYgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtc2xpZGVyLWNvbnRhaW5lclwiPlxuICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1wcm9tcHQtY29udGFpbmVyXCI+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLXNsaWRlci1pbnB1dC1jb250YWluZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1zbGlkZXItaW5wdXQtc2l6ZVwiPlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtc2xpZGVyLWlucHV0XCJcbiAgICAgICAgICAgIHR5cGU9XCJyYW5nZVwiXG4gICAgICAgICAgICBtaW49XCIwXCJcbiAgICAgICAgICAgIG1heD1cIjEwMFwiXG4gICAgICAgICAgICB2YWx1ZT1cIjBcIlxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1zbGlkZXItYnViYmxlXCI+PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG59O1xuLyoqXG4gKiBAY29uc3QgQGVudW0ge251bWJlcn1cbiAqL1xuY29uc3QgU2xpZGVyVHlwZSA9IHtcbiAgUEVSQ0VOVEFHRTogJ3BlcmNlbnRhZ2UnLFxuICBFTU9KSTogJ2Vtb2ppJyxcbn07XG5cbmV4cG9ydCBjbGFzcyBBbXBTdG9yeUludGVyYWN0aXZlU2xpZGVyIGV4dGVuZHMgQW1wU3RvcnlJbnRlcmFjdGl2ZSB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFBbXBFbGVtZW50fSBlbGVtZW50XG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XG4gICAgc3VwZXIoZWxlbWVudCwgSW50ZXJhY3RpdmVUeXBlLlNMSURFUiwgWzAsIDFdKTtcbiAgICAvKiogQHByaXZhdGUgez9FbGVtZW50fSBidWJibGUgY29udGFpbmluZyB0aGUgY3VycmVudCBzZWxlY3Rpb24gb2YgdGhlIHVzZXIgd2hpbGUgZHJhZ2dpbmcgKi9cbiAgICB0aGlzLmJ1YmJsZUVsXyA9IG51bGw7XG4gICAgLyoqIEBwcml2YXRlIHs/RWxlbWVudH0gdHJhY2tzIHVzZXIgaW5wdXQgKi9cbiAgICB0aGlzLmlucHV0RWxfID0gbnVsbDtcbiAgICAvKiogQHByaXZhdGUgeyFTbGlkZXJUeXBlfSAgKi9cbiAgICB0aGlzLnNsaWRlclR5cGVfID0gU2xpZGVyVHlwZS5QRVJDRU5UQUdFO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBidWlsZENvbXBvbmVudCgpIHtcbiAgICB0aGlzLnJvb3RFbF8gPSBidWlsZFNsaWRlclRlbXBsYXRlKHRoaXMuZWxlbWVudCk7XG4gICAgdGhpcy5idWJibGVFbF8gPSB0aGlzLnJvb3RFbF8ucXVlcnlTZWxlY3RvcihcbiAgICAgICcuaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLXNsaWRlci1idWJibGUnXG4gICAgKTtcbiAgICB0aGlzLmlucHV0RWxfID0gdGhpcy5yb290RWxfLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAnLmktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1zbGlkZXItaW5wdXQnXG4gICAgKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnNfLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuc2xpZGVyVHlwZV8gPSBTbGlkZXJUeXBlLkVNT0pJO1xuICAgICAgY29uc3QgZW1vamlXcmFwcGVyID0gdGhpcy53aW4uZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgZW1vamlXcmFwcGVyLnRleHRDb250ZW50ID0gdGhpcy5vcHRpb25zX1swXS50ZXh0O1xuICAgICAgdGhpcy5idWJibGVFbF8uYXBwZW5kQ2hpbGQoZW1vamlXcmFwcGVyKTtcbiAgICB9XG5cbiAgICB0aGlzLnJvb3RFbF8uc2V0QXR0cmlidXRlKCd0eXBlJywgdGhpcy5zbGlkZXJUeXBlXyk7XG5cbiAgICB0aGlzLmF0dGFjaFByb21wdF8odGhpcy5yb290RWxfKTtcbiAgICByZXR1cm4gdGhpcy5yb290RWxfO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBidWlsZENhbGxiYWNrKCkge1xuICAgIHJldHVybiBzdXBlci5idWlsZENhbGxiYWNrKENTUyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGluaXRpYWxpemVMaXN0ZW5lcnNfKCkge1xuICAgIHN1cGVyLmluaXRpYWxpemVMaXN0ZW5lcnNfKCk7XG5cbiAgICB0aGlzLmlucHV0RWxfLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgdGhpcy5vbkRyYWdfKCk7XG4gICAgfSk7XG4gICAgdGhpcy5pbnB1dEVsXy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICB0aGlzLm9uUmVsZWFzZV8oKTtcbiAgICB9KTtcblxuICAgIHRoaXMuaW5wdXRFbF8uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICd0b3VjaG1vdmUnLFxuICAgICAgKGV2ZW50KSA9PiBldmVudC5zdG9wUHJvcGFnYXRpb24oKSxcbiAgICAgIHRydWVcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvbkRyYWdfKCkge1xuICAgIGNvbnN0IHt2YWx1ZX0gPSB0aGlzLmlucHV0RWxfO1xuICAgIGlmICh0aGlzLnNsaWRlclR5cGVfID09IFNsaWRlclR5cGUuUEVSQ0VOVEFHRSkge1xuICAgICAgdGhpcy5idWJibGVFbF8udGV4dENvbnRlbnQgPSB2YWx1ZSArICclJztcbiAgICB9XG4gICAgdGhpcy5yb290RWxfLmNsYXNzTGlzdC5hZGQoJ2ktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1taWQtc2VsZWN0aW9uJyk7XG4gICAgc2V0SW1wb3J0YW50U3R5bGVzKHRoaXMucm9vdEVsXywgeyctLWZyYWN0aW9uJzogdmFsdWUgLyAxMDB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25SZWxlYXNlXygpIHtcbiAgICB0aGlzLnVwZGF0ZVRvUG9zdFNlbGVjdGlvblN0YXRlXygpO1xuICAgIHRoaXMuaW5wdXRFbF8uc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICcnKTtcbiAgICB0aGlzLnJvb3RFbF8uY2xhc3NMaXN0LnJlbW92ZSgnaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW1pZC1zZWxlY3Rpb24nKTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-story-interactive/0.1/amp-story-interactive-slider.js