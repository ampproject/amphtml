var _templateObject, _templateObject2;

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
import { AmpStoryInteractive, InteractiveType } from "./amp-story-interactive-abstract";
import { CSS } from "../../../build/amp-story-interactive-poll-0.1.css";
import { computedStyle, setStyle } from "../../../src/core/dom/style";
import { dev } from "../../../src/log";
import { htmlFor } from "../../../src/core/dom/static-template";
import { toArray } from "../../../src/core/types/array";

/**
 * Generates the template for the poll.
 *
 * @param {!Element} element
 * @return {!Element}
 */
var buildPollTemplate = function buildPollTemplate(element) {
  var html = htmlFor(element);
  return html(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n    <div class=\"i-amphtml-story-interactive-poll-container\">\n      <div class=\"i-amphtml-story-interactive-prompt-container\"></div>\n      <div class=\"i-amphtml-story-interactive-option-container\"></div>\n    </div>\n  "])));
};

/**
 * Generates the template for each option.
 *
 * @param {!Element} option
 * @return {!Element}
 */
var buildOptionTemplate = function buildOptionTemplate(option) {
  var html = htmlFor(option);
  return html(_templateObject2 || (_templateObject2 = _taggedTemplateLiteralLoose(["\n    <button class=\"i-amphtml-story-interactive-option\" aria-live=\"polite\">\n      <span class=\"i-amphtml-story-interactive-option-text\"></span>\n      <span class=\"i-amphtml-story-interactive-option-percentage\">\n        <span class=\"i-amphtml-story-interactive-option-percentage-text\"></span>\n        <span class=\"i-amphtml-story-interactive-option-percentage-sign\"\n          >%</span\n        >\n      </span>\n    </button>\n  "])));
};

export var AmpStoryInteractivePoll = /*#__PURE__*/function (_AmpStoryInteractive) {
  _inherits(AmpStoryInteractivePoll, _AmpStoryInteractive);

  var _super = _createSuper(AmpStoryInteractivePoll);

  /**
   * @param {!AmpElement} element
   */
  function AmpStoryInteractivePoll(element) {
    _classCallCheck(this, AmpStoryInteractivePoll);

    return _super.call(this, element, InteractiveType.POLL, [2, 4]);
  }

  /** @override */
  _createClass(AmpStoryInteractivePoll, [{
    key: "buildCallback",
    value: function buildCallback() {
      return _get(_getPrototypeOf(AmpStoryInteractivePoll.prototype), "buildCallback", this).call(this, CSS);
    }
    /** @override */

  }, {
    key: "buildComponent",
    value: function buildComponent() {
      this.rootEl_ = buildPollTemplate(this.element);
      this.attachContent_(this.rootEl_);
      return this.rootEl_;
    }
    /** @override */

  }, {
    key: "layoutCallback",
    value: function layoutCallback() {
      var _this = this;

      return this.adaptFontSize_(dev().assertElement(this.rootEl_)).then(function () {
        return _get(_getPrototypeOf(AmpStoryInteractivePoll.prototype), "layoutCallback", _this).call(_this);
      });
    }
    /**
     * Finds the prompt and options content
     * and adds it to the quiz element.
     *
     * @private
     * @param {Element} root
     */

  }, {
    key: "attachContent_",
    value: function attachContent_(root) {
      var _this2 = this;

      this.attachPrompt_(root);
      this.options_.forEach(function (option, index) {
        return _this2.configureOption_(option, index);
      });
    }
    /**
     * Creates an option container with option content,
     * adds styling and answer choices,
     * and adds it to the quiz element.
     *
     * @param {!./amp-story-interactive-abstract.OptionConfigType} option
     * @param {number} index
     * @private
     */

  }, {
    key: "configureOption_",
    value: function configureOption_(option, index) {
      var convertedOption = buildOptionTemplate(this.element);
      convertedOption.optionIndex_ = index;
      // Extract and structure the option information
      convertedOption.querySelector('.i-amphtml-story-interactive-option-text').textContent = option.text;
      this.rootEl_.querySelector('.i-amphtml-story-interactive-option-container').appendChild(convertedOption);
    }
    /**
     * @override
     */

  }, {
    key: "displayOptionsData",
    value: function displayOptionsData(optionsData) {
      if (!optionsData) {
        return;
      }

      var percentages = this.preprocessPercentages_(optionsData);
      this.getOptionElements().forEach(function (el, index) {
        if (optionsData[index].selected) {
          var textEl = el.querySelector('.i-amphtml-story-interactive-option-text');
          textEl.setAttribute('aria-label', 'selected ' + textEl.textContent);
        }

        el.querySelector('.i-amphtml-story-interactive-option-percentage-text').textContent = percentages[index];
        setStyle(el, '--option-percentage', percentages[index] + '%');
      });
    }
    /**
     * This method changes the font-size to best display the options, measured only once on create.
     *
     * If two lines appear, it will add the class 'i-amphtml-story-interactive-poll-two-lines'
     * It measures the number of lines on all options and generates the best size.
     * - font-size: 22px (1.375em) - All options are one line
     * - font-size: 18px (1.125em) - Any option is two lines if displayed at 22px.
     *
     * @private
     * @param {!Element} root
     * @return {!Promise}
     */

  }, {
    key: "adaptFontSize_",
    value: function adaptFontSize_(root) {
      var _this3 = this;

      var hasTwoLines = false;
      var allOptionTexts = toArray(root.querySelectorAll('.i-amphtml-story-interactive-option-text'));
      return this.measureMutateElement(function () {
        hasTwoLines = allOptionTexts.some(function (e) {
          var lines = Math.round(e.
          /*OK*/
          clientHeight / parseFloat(computedStyle(_this3.win, e)['line-height'].replace('px', '')));
          return lines >= 2;
        });
      }, function () {
        _this3.rootEl_.classList.toggle('i-amphtml-story-interactive-poll-two-lines', hasTwoLines);
      }, root);
    }
  }]);

  return AmpStoryInteractivePoll;
}(AmpStoryInteractive);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1pbnRlcmFjdGl2ZS1wb2xsLmpzIl0sIm5hbWVzIjpbIkFtcFN0b3J5SW50ZXJhY3RpdmUiLCJJbnRlcmFjdGl2ZVR5cGUiLCJDU1MiLCJjb21wdXRlZFN0eWxlIiwic2V0U3R5bGUiLCJkZXYiLCJodG1sRm9yIiwidG9BcnJheSIsImJ1aWxkUG9sbFRlbXBsYXRlIiwiZWxlbWVudCIsImh0bWwiLCJidWlsZE9wdGlvblRlbXBsYXRlIiwib3B0aW9uIiwiQW1wU3RvcnlJbnRlcmFjdGl2ZVBvbGwiLCJQT0xMIiwicm9vdEVsXyIsImF0dGFjaENvbnRlbnRfIiwiYWRhcHRGb250U2l6ZV8iLCJhc3NlcnRFbGVtZW50IiwidGhlbiIsInJvb3QiLCJhdHRhY2hQcm9tcHRfIiwib3B0aW9uc18iLCJmb3JFYWNoIiwiaW5kZXgiLCJjb25maWd1cmVPcHRpb25fIiwiY29udmVydGVkT3B0aW9uIiwib3B0aW9uSW5kZXhfIiwicXVlcnlTZWxlY3RvciIsInRleHRDb250ZW50IiwidGV4dCIsImFwcGVuZENoaWxkIiwib3B0aW9uc0RhdGEiLCJwZXJjZW50YWdlcyIsInByZXByb2Nlc3NQZXJjZW50YWdlc18iLCJnZXRPcHRpb25FbGVtZW50cyIsImVsIiwic2VsZWN0ZWQiLCJ0ZXh0RWwiLCJzZXRBdHRyaWJ1dGUiLCJoYXNUd29MaW5lcyIsImFsbE9wdGlvblRleHRzIiwicXVlcnlTZWxlY3RvckFsbCIsIm1lYXN1cmVNdXRhdGVFbGVtZW50Iiwic29tZSIsImUiLCJsaW5lcyIsIk1hdGgiLCJyb3VuZCIsImNsaWVudEhlaWdodCIsInBhcnNlRmxvYXQiLCJ3aW4iLCJyZXBsYWNlIiwiY2xhc3NMaXN0IiwidG9nZ2xlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FDRUEs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QyxNQUF2QixDQUNFLDRDQURGLEVBRUVkLFdBRkY7QUFJRCxPQWpCSSxFQWtCTHBCLElBbEJLLENBQVA7QUFvQkQ7QUE3SEg7O0FBQUE7QUFBQSxFQUE2Q3BCLG1CQUE3QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMjAgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1xuICBBbXBTdG9yeUludGVyYWN0aXZlLFxuICBJbnRlcmFjdGl2ZVR5cGUsXG59IGZyb20gJy4vYW1wLXN0b3J5LWludGVyYWN0aXZlLWFic3RyYWN0JztcbmltcG9ydCB7Q1NTfSBmcm9tICcuLi8uLi8uLi9idWlsZC9hbXAtc3RvcnktaW50ZXJhY3RpdmUtcG9sbC0wLjEuY3NzJztcbmltcG9ydCB7Y29tcHV0ZWRTdHlsZSwgc2V0U3R5bGV9IGZyb20gJyNjb3JlL2RvbS9zdHlsZSc7XG5pbXBvcnQge2Rldn0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge2h0bWxGb3J9IGZyb20gJyNjb3JlL2RvbS9zdGF0aWMtdGVtcGxhdGUnO1xuaW1wb3J0IHt0b0FycmF5fSBmcm9tICcjY29yZS90eXBlcy9hcnJheSc7XG5cbi8qKlxuICogR2VuZXJhdGVzIHRoZSB0ZW1wbGF0ZSBmb3IgdGhlIHBvbGwuXG4gKlxuICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybiB7IUVsZW1lbnR9XG4gKi9cbmNvbnN0IGJ1aWxkUG9sbFRlbXBsYXRlID0gKGVsZW1lbnQpID0+IHtcbiAgY29uc3QgaHRtbCA9IGh0bWxGb3IoZWxlbWVudCk7XG4gIHJldHVybiBodG1sYFxuICAgIDxkaXYgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtcG9sbC1jb250YWluZXJcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtcHJvbXB0LWNvbnRhaW5lclwiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1vcHRpb24tY29udGFpbmVyXCI+PC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlcyB0aGUgdGVtcGxhdGUgZm9yIGVhY2ggb3B0aW9uLlxuICpcbiAqIEBwYXJhbSB7IUVsZW1lbnR9IG9wdGlvblxuICogQHJldHVybiB7IUVsZW1lbnR9XG4gKi9cbmNvbnN0IGJ1aWxkT3B0aW9uVGVtcGxhdGUgPSAob3B0aW9uKSA9PiB7XG4gIGNvbnN0IGh0bWwgPSBodG1sRm9yKG9wdGlvbik7XG4gIHJldHVybiBodG1sYFxuICAgIDxidXR0b24gY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtb3B0aW9uXCIgYXJpYS1saXZlPVwicG9saXRlXCI+XG4gICAgICA8c3BhbiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1vcHRpb24tdGV4dFwiPjwvc3Bhbj5cbiAgICAgIDxzcGFuIGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW9wdGlvbi1wZXJjZW50YWdlXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW9wdGlvbi1wZXJjZW50YWdlLXRleHRcIj48L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW9wdGlvbi1wZXJjZW50YWdlLXNpZ25cIlxuICAgICAgICAgID4lPC9zcGFuXG4gICAgICAgID5cbiAgICAgIDwvc3Bhbj5cbiAgICA8L2J1dHRvbj5cbiAgYDtcbn07XG5cbmV4cG9ydCBjbGFzcyBBbXBTdG9yeUludGVyYWN0aXZlUG9sbCBleHRlbmRzIEFtcFN0b3J5SW50ZXJhY3RpdmUge1xuICAvKipcbiAgICogQHBhcmFtIHshQW1wRWxlbWVudH0gZWxlbWVudFxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgIHN1cGVyKGVsZW1lbnQsIEludGVyYWN0aXZlVHlwZS5QT0xMLCBbMiwgNF0pO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBidWlsZENhbGxiYWNrKCkge1xuICAgIHJldHVybiBzdXBlci5idWlsZENhbGxiYWNrKENTUyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGJ1aWxkQ29tcG9uZW50KCkge1xuICAgIHRoaXMucm9vdEVsXyA9IGJ1aWxkUG9sbFRlbXBsYXRlKHRoaXMuZWxlbWVudCk7XG4gICAgdGhpcy5hdHRhY2hDb250ZW50Xyh0aGlzLnJvb3RFbF8pO1xuICAgIHJldHVybiB0aGlzLnJvb3RFbF87XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGxheW91dENhbGxiYWNrKCkge1xuICAgIHJldHVybiB0aGlzLmFkYXB0Rm9udFNpemVfKGRldigpLmFzc2VydEVsZW1lbnQodGhpcy5yb290RWxfKSkudGhlbigoKSA9PlxuICAgICAgc3VwZXIubGF5b3V0Q2FsbGJhY2soKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogRmluZHMgdGhlIHByb21wdCBhbmQgb3B0aW9ucyBjb250ZW50XG4gICAqIGFuZCBhZGRzIGl0IHRvIHRoZSBxdWl6IGVsZW1lbnQuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gcm9vdFxuICAgKi9cbiAgYXR0YWNoQ29udGVudF8ocm9vdCkge1xuICAgIHRoaXMuYXR0YWNoUHJvbXB0Xyhyb290KTtcbiAgICB0aGlzLm9wdGlvbnNfLmZvckVhY2goKG9wdGlvbiwgaW5kZXgpID0+XG4gICAgICB0aGlzLmNvbmZpZ3VyZU9wdGlvbl8ob3B0aW9uLCBpbmRleClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gb3B0aW9uIGNvbnRhaW5lciB3aXRoIG9wdGlvbiBjb250ZW50LFxuICAgKiBhZGRzIHN0eWxpbmcgYW5kIGFuc3dlciBjaG9pY2VzLFxuICAgKiBhbmQgYWRkcyBpdCB0byB0aGUgcXVpeiBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0geyEuL2FtcC1zdG9yeS1pbnRlcmFjdGl2ZS1hYnN0cmFjdC5PcHRpb25Db25maWdUeXBlfSBvcHRpb25cbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBjb25maWd1cmVPcHRpb25fKG9wdGlvbiwgaW5kZXgpIHtcbiAgICBjb25zdCBjb252ZXJ0ZWRPcHRpb24gPSBidWlsZE9wdGlvblRlbXBsYXRlKHRoaXMuZWxlbWVudCk7XG4gICAgY29udmVydGVkT3B0aW9uLm9wdGlvbkluZGV4XyA9IGluZGV4O1xuXG4gICAgLy8gRXh0cmFjdCBhbmQgc3RydWN0dXJlIHRoZSBvcHRpb24gaW5mb3JtYXRpb25cbiAgICBjb252ZXJ0ZWRPcHRpb24ucXVlcnlTZWxlY3RvcihcbiAgICAgICcuaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW9wdGlvbi10ZXh0J1xuICAgICkudGV4dENvbnRlbnQgPSBvcHRpb24udGV4dDtcblxuICAgIHRoaXMucm9vdEVsX1xuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5pLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtb3B0aW9uLWNvbnRhaW5lcicpXG4gICAgICAuYXBwZW5kQ2hpbGQoY29udmVydGVkT3B0aW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIGRpc3BsYXlPcHRpb25zRGF0YShvcHRpb25zRGF0YSkge1xuICAgIGlmICghb3B0aW9uc0RhdGEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwZXJjZW50YWdlcyA9IHRoaXMucHJlcHJvY2Vzc1BlcmNlbnRhZ2VzXyhvcHRpb25zRGF0YSk7XG5cbiAgICB0aGlzLmdldE9wdGlvbkVsZW1lbnRzKCkuZm9yRWFjaCgoZWwsIGluZGV4KSA9PiB7XG4gICAgICBpZiAob3B0aW9uc0RhdGFbaW5kZXhdLnNlbGVjdGVkKSB7XG4gICAgICAgIGNvbnN0IHRleHRFbCA9IGVsLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgJy5pLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtb3B0aW9uLXRleHQnXG4gICAgICAgICk7XG4gICAgICAgIHRleHRFbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCAnc2VsZWN0ZWQgJyArIHRleHRFbC50ZXh0Q29udGVudCk7XG4gICAgICB9XG4gICAgICBlbC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAnLmktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1vcHRpb24tcGVyY2VudGFnZS10ZXh0J1xuICAgICAgKS50ZXh0Q29udGVudCA9IHBlcmNlbnRhZ2VzW2luZGV4XTtcbiAgICAgIHNldFN0eWxlKGVsLCAnLS1vcHRpb24tcGVyY2VudGFnZScsIHBlcmNlbnRhZ2VzW2luZGV4XSArICclJyk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgY2hhbmdlcyB0aGUgZm9udC1zaXplIHRvIGJlc3QgZGlzcGxheSB0aGUgb3B0aW9ucywgbWVhc3VyZWQgb25seSBvbmNlIG9uIGNyZWF0ZS5cbiAgICpcbiAgICogSWYgdHdvIGxpbmVzIGFwcGVhciwgaXQgd2lsbCBhZGQgdGhlIGNsYXNzICdpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtcG9sbC10d28tbGluZXMnXG4gICAqIEl0IG1lYXN1cmVzIHRoZSBudW1iZXIgb2YgbGluZXMgb24gYWxsIG9wdGlvbnMgYW5kIGdlbmVyYXRlcyB0aGUgYmVzdCBzaXplLlxuICAgKiAtIGZvbnQtc2l6ZTogMjJweCAoMS4zNzVlbSkgLSBBbGwgb3B0aW9ucyBhcmUgb25lIGxpbmVcbiAgICogLSBmb250LXNpemU6IDE4cHggKDEuMTI1ZW0pIC0gQW55IG9wdGlvbiBpcyB0d28gbGluZXMgaWYgZGlzcGxheWVkIGF0IDIycHguXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHJvb3RcbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICBhZGFwdEZvbnRTaXplXyhyb290KSB7XG4gICAgbGV0IGhhc1R3b0xpbmVzID0gZmFsc2U7XG4gICAgY29uc3QgYWxsT3B0aW9uVGV4dHMgPSB0b0FycmF5KFxuICAgICAgcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcuaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW9wdGlvbi10ZXh0JylcbiAgICApO1xuICAgIHJldHVybiB0aGlzLm1lYXN1cmVNdXRhdGVFbGVtZW50KFxuICAgICAgKCkgPT4ge1xuICAgICAgICBoYXNUd29MaW5lcyA9IGFsbE9wdGlvblRleHRzLnNvbWUoKGUpID0+IHtcbiAgICAgICAgICBjb25zdCBsaW5lcyA9IE1hdGgucm91bmQoXG4gICAgICAgICAgICBlLi8qT0sqLyBjbGllbnRIZWlnaHQgL1xuICAgICAgICAgICAgICBwYXJzZUZsb2F0KFxuICAgICAgICAgICAgICAgIGNvbXB1dGVkU3R5bGUodGhpcy53aW4sIGUpWydsaW5lLWhlaWdodCddLnJlcGxhY2UoJ3B4JywgJycpXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiBsaW5lcyA+PSAyO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHRoaXMucm9vdEVsXy5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgICAgICdpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtcG9sbC10d28tbGluZXMnLFxuICAgICAgICAgIGhhc1R3b0xpbmVzXG4gICAgICAgICk7XG4gICAgICB9LFxuICAgICAgcm9vdFxuICAgICk7XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-story-interactive/0.1/amp-story-interactive-poll.js