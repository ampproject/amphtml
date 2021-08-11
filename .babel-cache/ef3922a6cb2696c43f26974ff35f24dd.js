var _templateObject, _templateObject2, _templateObject3;

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
import { CSS } from "../../../build/amp-story-interactive-binary-poll-0.1.css";
import { computedStyle, setStyle } from "../../../src/core/dom/style";
import { dev } from "../../../src/log";
import { htmlFor } from "../../../src/core/dom/static-template";
import { toArray } from "../../../src/core/types/array";

/** @const @enum {number} */
export var FontSize = {
  EMOJI: 28,
  SINGLE_LINE: 16,
  DOUBLE_LINE: 14
};

/**
 * Minimum transformX value.
 * Prevents small percentages from moving outside of poll.
 *
/** @const {number} */
var MIN_HORIZONTAL_TRANSFORM = -20;

/**
 * Generates the template for the binary poll.
 *
 * @param {!Element} element
 * @return {!Element}
 */
var buildBinaryPollTemplate = function buildBinaryPollTemplate(element) {
  var html = htmlFor(element);
  return html(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n    <div class=\"i-amphtml-story-interactive-binary-poll-container\">\n      <div class=\"i-amphtml-story-interactive-prompt-container\"></div>\n      <div\n        class=\"i-amphtml-story-interactive-binary-poll-option-container\"\n      ></div>\n    </div>\n  "])));
};

/**
 * Generates the template for the binary poll option.
 *
 * @param {!Element} element
 * @return {!Element}
 */
var buildOptionTemplate = function buildOptionTemplate(element) {
  var html = htmlFor(element);
  return html(_templateObject2 || (_templateObject2 = _taggedTemplateLiteralLoose(["\n    <button class=\"i-amphtml-story-interactive-option\" aria-live=\"polite\">\n      <span class=\"i-amphtml-story-interactive-option-percent-bar\"></span>\n      <span class=\"i-amphtml-story-interactive-option-text-container\">\n        <span class=\"i-amphtml-story-interactive-option-title\"\n          ><span class=\"i-amphtml-story-interactive-option-title-text\"></span\n        ></span>\n        <span\n          class=\"i-amphtml-story-interactive-option-percentage-text\"\n          aria-hidden=\"true\"\n          >0%</span\n        >\n      </span>\n    </button>\n  "])));
};

/**
 * Generates the template for the option divider.
 *
 * @param {!Element} element
 * @return {!Element}
 */
var buildBinaryOptionDividerTemplate = function buildBinaryOptionDividerTemplate(element) {
  var html = htmlFor(element);
  return html(_templateObject3 || (_templateObject3 = _taggedTemplateLiteralLoose(["\n    <span class=\"i-amphtml-story-interactive-option-divider\"></span>\n  "])));
};

export var AmpStoryInteractiveBinaryPoll = /*#__PURE__*/function (_AmpStoryInteractive) {
  _inherits(AmpStoryInteractiveBinaryPoll, _AmpStoryInteractive);

  var _super = _createSuper(AmpStoryInteractiveBinaryPoll);

  /**
   * @param {!AmpElement} element
   */
  function AmpStoryInteractiveBinaryPoll(element) {
    _classCallCheck(this, AmpStoryInteractiveBinaryPoll);

    return _super.call(this, element, InteractiveType.POLL,
    /* bounds */
    [2, 2]);
  }

  /** @override */
  _createClass(AmpStoryInteractiveBinaryPoll, [{
    key: "buildCallback",
    value: function buildCallback() {
      return _get(_getPrototypeOf(AmpStoryInteractiveBinaryPoll.prototype), "buildCallback", this).call(this, CSS);
    }
    /** @override */

  }, {
    key: "buildComponent",
    value: function buildComponent() {
      this.rootEl_ = buildBinaryPollTemplate(this.element);
      this.attachContent_(this.rootEl_);
      return this.rootEl_;
    }
    /** @override */

  }, {
    key: "layoutCallback",
    value: function layoutCallback() {
      var _this = this;

      return this.adaptFontSize_(dev().assertElement(this.rootEl_)).then(function () {
        return _get(_getPrototypeOf(AmpStoryInteractiveBinaryPoll.prototype), "layoutCallback", _this).call(_this);
      });
    }
    /**
     * Gets the options and adds them to the element
     *
     * @private
     * @param {!Element} root
     */

  }, {
    key: "attachContent_",
    value: function attachContent_(root) {
      this.attachPrompt_(root);
      var options = root.querySelector('.i-amphtml-story-interactive-binary-poll-option-container');
      options.appendChild(this.generateOption_(this.options_[0]));
      options.appendChild(buildBinaryOptionDividerTemplate(root));
      options.appendChild(this.generateOption_(this.options_[1]));
    }
    /**
     * This method changes the font-size on post-select to best display the titles.
     *
     * It measures the number of lines and chars on the titles and generates an appropriate font-size.
     * - font-size: 28px - Both titles are emojis or short text (yes/no)
     * - font-size: 16px - Both titles have at most one line
     * - font-size: 14px - At least one title has two lines
     *
     * The title container will shrink 50% on post-select to indicate the safe-zone for the title is smaller.
     * To keep the font-size (original font-size:28px) true to the guidelines above, a post-select-scale is applied counteracting it.
     * Eg. post-select-scale:1 corresponds to font-size:14px after the 50% scale (for 2-lined title),
     * but post-select-scale:1.14 corresponds to font-size:16px after the 50% scale (for 1-lined titles),
     * and post-select-scale:2 corresponds to font-size:28px after the 50% scale (for emoji titles).
     * @private
     * @param {!Element} root
     * @return {!Promise}
     */

  }, {
    key: "adaptFontSize_",
    value: function adaptFontSize_(root) {
      var _this2 = this;

      var largestFontSize = FontSize.EMOJI;
      var allTitles = toArray(root.querySelectorAll('.i-amphtml-story-interactive-option-title-text'));
      return this.measureMutateElement(function () {
        allTitles.forEach(function (e) {
          var lines = Math.round(e.
          /*OK*/
          clientHeight / parseFloat(computedStyle(_this2.win, e)['line-height'].replace('px', '')));

          if (e.textContent.length <= 3 && largestFontSize >= FontSize.EMOJI) {
            largestFontSize = FontSize.EMOJI;
          } else if (lines == 1 && largestFontSize >= FontSize.SINGLE_LINE) {
            largestFontSize = FontSize.SINGLE_LINE;
          } else if (lines == 2) {
            largestFontSize = FontSize.DOUBLE_LINE;
          }
        });
      }, function () {
        setStyle(root, '--post-select-scale-variable', "" + (largestFontSize / FontSize.DOUBLE_LINE).toFixed(2));
      }, root);
    }
    /**
     * Creates an option template filled with the details the attributes.
     * @param {./amp-story-interactive-abstract.OptionConfigType} option
     * @return {Element} option element
     * @private
     */

  }, {
    key: "generateOption_",
    value: function generateOption_(option) {
      var convertedOption = buildOptionTemplate(this.element);
      var optionText = convertedOption.querySelector('.i-amphtml-story-interactive-option-title-text');
      optionText.textContent = option['text'];
      convertedOption.optionIndex_ = option['optionIndex'];
      return convertedOption;
    }
    /**
     * Creates a number to transfrom the x axis of binary poll text.
     * @param {number} percentage
     * @return {number}
     * @private
     */

  }, {
    key: "getTransformVal_",
    value: function getTransformVal_(percentage) {
      var mappedVal = Math.max(percentage - 50, MIN_HORIZONTAL_TRANSFORM);

      if (document.dir === 'rtl') {
        mappedVal *= -1;
      }

      return mappedVal;
    }
    /**
     * @override
     */

  }, {
    key: "displayOptionsData",
    value: function displayOptionsData(responseData) {
      var _this3 = this;

      if (!responseData) {
        return;
      }

      var percentages = this.preprocessPercentages_(responseData);
      this.getOptionElements().forEach(function (el, index) {
        // TODO(jackbsteinberg): Add i18n support for various ways of displaying percentages.
        var percentage = percentages[index];
        var percentageEl = el.querySelector('.i-amphtml-story-interactive-option-percentage-text');
        percentageEl.textContent = percentage + "%";
        percentageEl.removeAttribute('aria-hidden');
        setStyle(el.querySelector('.i-amphtml-story-interactive-option-percent-bar'), 'transform', "scaleX(" + percentage * 0.01 * 2 + ")");
        var textContainer = el.querySelector('.i-amphtml-story-interactive-option-text-container');
        textContainer.setAttribute('style', "transform: translateX(" + _this3.getTransformVal_(percentage) * (index === 0 ? 1 : -1) + "%) !important");

        if (responseData[index].selected) {
          textContainer.setAttribute('aria-label', 'selected ' + textContainer.textContent);
        }

        if (percentage === 0) {
          setStyle(textContainer, 'opacity', '0');
        }
      });
    }
  }]);

  return AmpStoryInteractiveBinaryPoll;
}(AmpStoryInteractive);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1pbnRlcmFjdGl2ZS1iaW5hcnktcG9sbC5qcyJdLCJuYW1lcyI6WyJBbXBTdG9yeUludGVyYWN0aXZlIiwiSW50ZXJhY3RpdmVUeXBlIiwiQ1NTIiwiY29tcHV0ZWRTdHlsZSIsInNldFN0eWxlIiwiZGV2IiwiaHRtbEZvciIsInRvQXJyYXkiLCJGb250U2l6ZSIsIkVNT0pJIiwiU0lOR0xFX0xJTkUiLCJET1VCTEVfTElORSIsIk1JTl9IT1JJWk9OVEFMX1RSQU5TRk9STSIsImJ1aWxkQmluYXJ5UG9sbFRlbXBsYXRlIiwiZWxlbWVudCIsImh0bWwiLCJidWlsZE9wdGlvblRlbXBsYXRlIiwiYnVpbGRCaW5hcnlPcHRpb25EaXZpZGVyVGVtcGxhdGUiLCJBbXBTdG9yeUludGVyYWN0aXZlQmluYXJ5UG9sbCIsIlBPTEwiLCJyb290RWxfIiwiYXR0YWNoQ29udGVudF8iLCJhZGFwdEZvbnRTaXplXyIsImFzc2VydEVsZW1lbnQiLCJ0aGVuIiwicm9vdCIsImF0dGFjaFByb21wdF8iLCJvcHRpb25zIiwicXVlcnlTZWxlY3RvciIsImFwcGVuZENoaWxkIiwiZ2VuZXJhdGVPcHRpb25fIiwib3B0aW9uc18iLCJsYXJnZXN0Rm9udFNpemUiLCJhbGxUaXRsZXMiLCJxdWVyeVNlbGVjdG9yQWxsIiwibWVhc3VyZU11dGF0ZUVsZW1lbnQiLCJmb3JFYWNoIiwiZSIsImxpbmVzIiwiTWF0aCIsInJvdW5kIiwiY2xpZW50SGVpZ2h0IiwicGFyc2VGbG9hdCIsIndpbiIsInJlcGxhY2UiLCJ0ZXh0Q29udGVudCIsImxlbmd0aCIsInRvRml4ZWQiLCJvcHRpb24iLCJjb252ZXJ0ZWRPcHRpb24iLCJvcHRpb25UZXh0Iiwib3B0aW9uSW5kZXhfIiwicGVyY2VudGFnZSIsIm1hcHBlZFZhbCIsIm1heCIsImRvY3VtZW50IiwiZGlyIiwicmVzcG9uc2VEYXRhIiwicGVyY2VudGFnZXMiLCJwcmVwcm9jZXNzUGVyY2VudGFnZXNfIiwiZ2V0T3B0aW9uRWxlbWVudHMiLCJlbCIsImluZGV4IiwicGVyY2VudGFnZUVsIiwicmVtb3ZlQXR0cmlidXRlIiwidGV4dENvbnRhaW5lciIsInNldEF0dHJpYnV0ZSIsImdldFRyYW5zZm9ybVZhbF8iLCJzZWxlY3RlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQ0VBLG1CQURGLEVBRUVDLGVBRkY7QUFJQSxTQUFRQyxHQUFSO0FBQ0EsU0FBUUMsYUFBUixFQUF1QkMsUUFBdkI7QUFDQSxTQUFRQyxHQUFSO0FBQ0EsU0FBUUMsT0FBUjtBQUNBLFNBQVFDLE9BQVI7O0FBRUE7QUFDQSxPQUFPLElBQU1DLFFBQVEsR0FBRztBQUN0QkMsRUFBQUEsS0FBSyxFQUFFLEVBRGU7QUFFdEJDLEVBQUFBLFdBQVcsRUFBRSxFQUZTO0FBR3RCQyxFQUFBQSxXQUFXLEVBQUU7QUFIUyxDQUFqQjs7QUFNUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUMsd0JBQXdCLEdBQUcsQ0FBQyxFQUFsQzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQyx1QkFBdUIsR0FBRyxTQUExQkEsdUJBQTBCLENBQUNDLE9BQUQsRUFBYTtBQUMzQyxNQUFNQyxJQUFJLEdBQUdULE9BQU8sQ0FBQ1EsT0FBRCxDQUFwQjtBQUNBLFNBQU9DLElBQVA7QUFRRCxDQVZEOztBQVlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1DLG1CQUFtQixHQUFHLFNBQXRCQSxtQkFBc0IsQ0FBQ0YsT0FBRCxFQUFhO0FBQ3ZDLE1BQU1DLElBQUksR0FBR1QsT0FBTyxDQUFDUSxPQUFELENBQXBCO0FBQ0EsU0FBT0MsSUFBUDtBQWVELENBakJEOztBQW1CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNRSxnQ0FBZ0MsR0FBRyxT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QTNLSDs7QUFBQTtBQUFBLEVBQW1EakUsbUJBQW5EIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAyMCBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7XG4gIEFtcFN0b3J5SW50ZXJhY3RpdmUsXG4gIEludGVyYWN0aXZlVHlwZSxcbn0gZnJvbSAnLi9hbXAtc3RvcnktaW50ZXJhY3RpdmUtYWJzdHJhY3QnO1xuaW1wb3J0IHtDU1N9IGZyb20gJy4uLy4uLy4uL2J1aWxkL2FtcC1zdG9yeS1pbnRlcmFjdGl2ZS1iaW5hcnktcG9sbC0wLjEuY3NzJztcbmltcG9ydCB7Y29tcHV0ZWRTdHlsZSwgc2V0U3R5bGV9IGZyb20gJyNjb3JlL2RvbS9zdHlsZSc7XG5pbXBvcnQge2Rldn0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge2h0bWxGb3J9IGZyb20gJyNjb3JlL2RvbS9zdGF0aWMtdGVtcGxhdGUnO1xuaW1wb3J0IHt0b0FycmF5fSBmcm9tICcjY29yZS90eXBlcy9hcnJheSc7XG5cbi8qKiBAY29uc3QgQGVudW0ge251bWJlcn0gKi9cbmV4cG9ydCBjb25zdCBGb250U2l6ZSA9IHtcbiAgRU1PSkk6IDI4LFxuICBTSU5HTEVfTElORTogMTYsXG4gIERPVUJMRV9MSU5FOiAxNCxcbn07XG5cbi8qKlxuICogTWluaW11bSB0cmFuc2Zvcm1YIHZhbHVlLlxuICogUHJldmVudHMgc21hbGwgcGVyY2VudGFnZXMgZnJvbSBtb3Zpbmcgb3V0c2lkZSBvZiBwb2xsLlxuICpcbi8qKiBAY29uc3Qge251bWJlcn0gKi9cbmNvbnN0IE1JTl9IT1JJWk9OVEFMX1RSQU5TRk9STSA9IC0yMDtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgdGhlIHRlbXBsYXRlIGZvciB0aGUgYmluYXJ5IHBvbGwuXG4gKlxuICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybiB7IUVsZW1lbnR9XG4gKi9cbmNvbnN0IGJ1aWxkQmluYXJ5UG9sbFRlbXBsYXRlID0gKGVsZW1lbnQpID0+IHtcbiAgY29uc3QgaHRtbCA9IGh0bWxGb3IoZWxlbWVudCk7XG4gIHJldHVybiBodG1sYFxuICAgIDxkaXYgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtYmluYXJ5LXBvbGwtY29udGFpbmVyXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLXByb21wdC1jb250YWluZXJcIj48L2Rpdj5cbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtYmluYXJ5LXBvbGwtb3B0aW9uLWNvbnRhaW5lclwiXG4gICAgICA+PC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlcyB0aGUgdGVtcGxhdGUgZm9yIHRoZSBiaW5hcnkgcG9sbCBvcHRpb24uXG4gKlxuICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybiB7IUVsZW1lbnR9XG4gKi9cbmNvbnN0IGJ1aWxkT3B0aW9uVGVtcGxhdGUgPSAoZWxlbWVudCkgPT4ge1xuICBjb25zdCBodG1sID0gaHRtbEZvcihlbGVtZW50KTtcbiAgcmV0dXJuIGh0bWxgXG4gICAgPGJ1dHRvbiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1vcHRpb25cIiBhcmlhLWxpdmU9XCJwb2xpdGVcIj5cbiAgICAgIDxzcGFuIGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW9wdGlvbi1wZXJjZW50LWJhclwiPjwvc3Bhbj5cbiAgICAgIDxzcGFuIGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW9wdGlvbi10ZXh0LWNvbnRhaW5lclwiPlxuICAgICAgICA8c3BhbiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1vcHRpb24tdGl0bGVcIlxuICAgICAgICAgID48c3BhbiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1vcHRpb24tdGl0bGUtdGV4dFwiPjwvc3BhblxuICAgICAgICA+PC9zcGFuPlxuICAgICAgICA8c3BhblxuICAgICAgICAgIGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW9wdGlvbi1wZXJjZW50YWdlLXRleHRcIlxuICAgICAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICAgICAgPjAlPC9zcGFuXG4gICAgICAgID5cbiAgICAgIDwvc3Bhbj5cbiAgICA8L2J1dHRvbj5cbiAgYDtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIHRoZSB0ZW1wbGF0ZSBmb3IgdGhlIG9wdGlvbiBkaXZpZGVyLlxuICpcbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4geyFFbGVtZW50fVxuICovXG5jb25zdCBidWlsZEJpbmFyeU9wdGlvbkRpdmlkZXJUZW1wbGF0ZSA9IChlbGVtZW50KSA9PiB7XG4gIGNvbnN0IGh0bWwgPSBodG1sRm9yKGVsZW1lbnQpO1xuICByZXR1cm4gaHRtbGBcbiAgICA8c3BhbiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1vcHRpb24tZGl2aWRlclwiPjwvc3Bhbj5cbiAgYDtcbn07XG5cbmV4cG9ydCBjbGFzcyBBbXBTdG9yeUludGVyYWN0aXZlQmluYXJ5UG9sbCBleHRlbmRzIEFtcFN0b3J5SW50ZXJhY3RpdmUge1xuICAvKipcbiAgICogQHBhcmFtIHshQW1wRWxlbWVudH0gZWxlbWVudFxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgIHN1cGVyKGVsZW1lbnQsIEludGVyYWN0aXZlVHlwZS5QT0xMLCAvKiBib3VuZHMgKi8gWzIsIDJdKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgYnVpbGRDYWxsYmFjaygpIHtcbiAgICByZXR1cm4gc3VwZXIuYnVpbGRDYWxsYmFjayhDU1MpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBidWlsZENvbXBvbmVudCgpIHtcbiAgICB0aGlzLnJvb3RFbF8gPSBidWlsZEJpbmFyeVBvbGxUZW1wbGF0ZSh0aGlzLmVsZW1lbnQpO1xuICAgIHRoaXMuYXR0YWNoQ29udGVudF8odGhpcy5yb290RWxfKTtcbiAgICByZXR1cm4gdGhpcy5yb290RWxfO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBsYXlvdXRDYWxsYmFjaygpIHtcbiAgICByZXR1cm4gdGhpcy5hZGFwdEZvbnRTaXplXyhkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMucm9vdEVsXykpLnRoZW4oKCkgPT5cbiAgICAgIHN1cGVyLmxheW91dENhbGxiYWNrKClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG9wdGlvbnMgYW5kIGFkZHMgdGhlbSB0byB0aGUgZWxlbWVudFxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0geyFFbGVtZW50fSByb290XG4gICAqL1xuICBhdHRhY2hDb250ZW50Xyhyb290KSB7XG4gICAgdGhpcy5hdHRhY2hQcm9tcHRfKHJvb3QpO1xuICAgIGNvbnN0IG9wdGlvbnMgPSByb290LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAnLmktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1iaW5hcnktcG9sbC1vcHRpb24tY29udGFpbmVyJ1xuICAgICk7XG4gICAgb3B0aW9ucy5hcHBlbmRDaGlsZCh0aGlzLmdlbmVyYXRlT3B0aW9uXyh0aGlzLm9wdGlvbnNfWzBdKSk7XG4gICAgb3B0aW9ucy5hcHBlbmRDaGlsZChidWlsZEJpbmFyeU9wdGlvbkRpdmlkZXJUZW1wbGF0ZShyb290KSk7XG4gICAgb3B0aW9ucy5hcHBlbmRDaGlsZCh0aGlzLmdlbmVyYXRlT3B0aW9uXyh0aGlzLm9wdGlvbnNfWzFdKSk7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgY2hhbmdlcyB0aGUgZm9udC1zaXplIG9uIHBvc3Qtc2VsZWN0IHRvIGJlc3QgZGlzcGxheSB0aGUgdGl0bGVzLlxuICAgKlxuICAgKiBJdCBtZWFzdXJlcyB0aGUgbnVtYmVyIG9mIGxpbmVzIGFuZCBjaGFycyBvbiB0aGUgdGl0bGVzIGFuZCBnZW5lcmF0ZXMgYW4gYXBwcm9wcmlhdGUgZm9udC1zaXplLlxuICAgKiAtIGZvbnQtc2l6ZTogMjhweCAtIEJvdGggdGl0bGVzIGFyZSBlbW9qaXMgb3Igc2hvcnQgdGV4dCAoeWVzL25vKVxuICAgKiAtIGZvbnQtc2l6ZTogMTZweCAtIEJvdGggdGl0bGVzIGhhdmUgYXQgbW9zdCBvbmUgbGluZVxuICAgKiAtIGZvbnQtc2l6ZTogMTRweCAtIEF0IGxlYXN0IG9uZSB0aXRsZSBoYXMgdHdvIGxpbmVzXG4gICAqXG4gICAqIFRoZSB0aXRsZSBjb250YWluZXIgd2lsbCBzaHJpbmsgNTAlIG9uIHBvc3Qtc2VsZWN0IHRvIGluZGljYXRlIHRoZSBzYWZlLXpvbmUgZm9yIHRoZSB0aXRsZSBpcyBzbWFsbGVyLlxuICAgKiBUbyBrZWVwIHRoZSBmb250LXNpemUgKG9yaWdpbmFsIGZvbnQtc2l6ZToyOHB4KSB0cnVlIHRvIHRoZSBndWlkZWxpbmVzIGFib3ZlLCBhIHBvc3Qtc2VsZWN0LXNjYWxlIGlzIGFwcGxpZWQgY291bnRlcmFjdGluZyBpdC5cbiAgICogRWcuIHBvc3Qtc2VsZWN0LXNjYWxlOjEgY29ycmVzcG9uZHMgdG8gZm9udC1zaXplOjE0cHggYWZ0ZXIgdGhlIDUwJSBzY2FsZSAoZm9yIDItbGluZWQgdGl0bGUpLFxuICAgKiBidXQgcG9zdC1zZWxlY3Qtc2NhbGU6MS4xNCBjb3JyZXNwb25kcyB0byBmb250LXNpemU6MTZweCBhZnRlciB0aGUgNTAlIHNjYWxlIChmb3IgMS1saW5lZCB0aXRsZXMpLFxuICAgKiBhbmQgcG9zdC1zZWxlY3Qtc2NhbGU6MiBjb3JyZXNwb25kcyB0byBmb250LXNpemU6MjhweCBhZnRlciB0aGUgNTAlIHNjYWxlIChmb3IgZW1vamkgdGl0bGVzKS5cbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHshRWxlbWVudH0gcm9vdFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIGFkYXB0Rm9udFNpemVfKHJvb3QpIHtcbiAgICBsZXQgbGFyZ2VzdEZvbnRTaXplID0gRm9udFNpemUuRU1PSkk7XG4gICAgY29uc3QgYWxsVGl0bGVzID0gdG9BcnJheShcbiAgICAgIHJvb3QucXVlcnlTZWxlY3RvckFsbCgnLmktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1vcHRpb24tdGl0bGUtdGV4dCcpXG4gICAgKTtcbiAgICByZXR1cm4gdGhpcy5tZWFzdXJlTXV0YXRlRWxlbWVudChcbiAgICAgICgpID0+IHtcbiAgICAgICAgYWxsVGl0bGVzLmZvckVhY2goKGUpID0+IHtcbiAgICAgICAgICBjb25zdCBsaW5lcyA9IE1hdGgucm91bmQoXG4gICAgICAgICAgICBlLi8qT0sqLyBjbGllbnRIZWlnaHQgL1xuICAgICAgICAgICAgICBwYXJzZUZsb2F0KFxuICAgICAgICAgICAgICAgIGNvbXB1dGVkU3R5bGUodGhpcy53aW4sIGUpWydsaW5lLWhlaWdodCddLnJlcGxhY2UoJ3B4JywgJycpXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICApO1xuICAgICAgICAgIGlmIChlLnRleHRDb250ZW50Lmxlbmd0aCA8PSAzICYmIGxhcmdlc3RGb250U2l6ZSA+PSBGb250U2l6ZS5FTU9KSSkge1xuICAgICAgICAgICAgbGFyZ2VzdEZvbnRTaXplID0gRm9udFNpemUuRU1PSkk7XG4gICAgICAgICAgfSBlbHNlIGlmIChsaW5lcyA9PSAxICYmIGxhcmdlc3RGb250U2l6ZSA+PSBGb250U2l6ZS5TSU5HTEVfTElORSkge1xuICAgICAgICAgICAgbGFyZ2VzdEZvbnRTaXplID0gRm9udFNpemUuU0lOR0xFX0xJTkU7XG4gICAgICAgICAgfSBlbHNlIGlmIChsaW5lcyA9PSAyKSB7XG4gICAgICAgICAgICBsYXJnZXN0Rm9udFNpemUgPSBGb250U2l6ZS5ET1VCTEVfTElORTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgICgpID0+IHtcbiAgICAgICAgc2V0U3R5bGUoXG4gICAgICAgICAgcm9vdCxcbiAgICAgICAgICAnLS1wb3N0LXNlbGVjdC1zY2FsZS12YXJpYWJsZScsXG4gICAgICAgICAgYCR7KGxhcmdlc3RGb250U2l6ZSAvIEZvbnRTaXplLkRPVUJMRV9MSU5FKS50b0ZpeGVkKDIpfWBcbiAgICAgICAgKTtcbiAgICAgIH0sXG4gICAgICByb290XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIG9wdGlvbiB0ZW1wbGF0ZSBmaWxsZWQgd2l0aCB0aGUgZGV0YWlscyB0aGUgYXR0cmlidXRlcy5cbiAgICogQHBhcmFtIHsuL2FtcC1zdG9yeS1pbnRlcmFjdGl2ZS1hYnN0cmFjdC5PcHRpb25Db25maWdUeXBlfSBvcHRpb25cbiAgICogQHJldHVybiB7RWxlbWVudH0gb3B0aW9uIGVsZW1lbnRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdlbmVyYXRlT3B0aW9uXyhvcHRpb24pIHtcbiAgICBjb25zdCBjb252ZXJ0ZWRPcHRpb24gPSBidWlsZE9wdGlvblRlbXBsYXRlKHRoaXMuZWxlbWVudCk7XG5cbiAgICBjb25zdCBvcHRpb25UZXh0ID0gY29udmVydGVkT3B0aW9uLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAnLmktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1vcHRpb24tdGl0bGUtdGV4dCdcbiAgICApO1xuICAgIG9wdGlvblRleHQudGV4dENvbnRlbnQgPSBvcHRpb25bJ3RleHQnXTtcbiAgICBjb252ZXJ0ZWRPcHRpb24ub3B0aW9uSW5kZXhfID0gb3B0aW9uWydvcHRpb25JbmRleCddO1xuICAgIHJldHVybiBjb252ZXJ0ZWRPcHRpb247XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG51bWJlciB0byB0cmFuc2Zyb20gdGhlIHggYXhpcyBvZiBiaW5hcnkgcG9sbCB0ZXh0LlxuICAgKiBAcGFyYW0ge251bWJlcn0gcGVyY2VudGFnZVxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRUcmFuc2Zvcm1WYWxfKHBlcmNlbnRhZ2UpIHtcbiAgICBsZXQgbWFwcGVkVmFsID0gTWF0aC5tYXgocGVyY2VudGFnZSAtIDUwLCBNSU5fSE9SSVpPTlRBTF9UUkFOU0ZPUk0pO1xuICAgIGlmIChkb2N1bWVudC5kaXIgPT09ICdydGwnKSB7XG4gICAgICBtYXBwZWRWYWwgKj0gLTE7XG4gICAgfVxuICAgIHJldHVybiBtYXBwZWRWYWw7XG4gIH1cblxuICAvKipcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBkaXNwbGF5T3B0aW9uc0RhdGEocmVzcG9uc2VEYXRhKSB7XG4gICAgaWYgKCFyZXNwb25zZURhdGEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwZXJjZW50YWdlcyA9IHRoaXMucHJlcHJvY2Vzc1BlcmNlbnRhZ2VzXyhyZXNwb25zZURhdGEpO1xuXG4gICAgdGhpcy5nZXRPcHRpb25FbGVtZW50cygpLmZvckVhY2goKGVsLCBpbmRleCkgPT4ge1xuICAgICAgLy8gVE9ETyhqYWNrYnN0ZWluYmVyZyk6IEFkZCBpMThuIHN1cHBvcnQgZm9yIHZhcmlvdXMgd2F5cyBvZiBkaXNwbGF5aW5nIHBlcmNlbnRhZ2VzLlxuICAgICAgY29uc3QgcGVyY2VudGFnZSA9IHBlcmNlbnRhZ2VzW2luZGV4XTtcbiAgICAgIGNvbnN0IHBlcmNlbnRhZ2VFbCA9IGVsLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICcuaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW9wdGlvbi1wZXJjZW50YWdlLXRleHQnXG4gICAgICApO1xuICAgICAgcGVyY2VudGFnZUVsLnRleHRDb250ZW50ID0gYCR7cGVyY2VudGFnZX0lYDtcbiAgICAgIHBlcmNlbnRhZ2VFbC5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJyk7XG5cbiAgICAgIHNldFN0eWxlKFxuICAgICAgICBlbC5xdWVyeVNlbGVjdG9yKCcuaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW9wdGlvbi1wZXJjZW50LWJhcicpLFxuICAgICAgICAndHJhbnNmb3JtJyxcbiAgICAgICAgYHNjYWxlWCgke3BlcmNlbnRhZ2UgKiAwLjAxICogMn0pYFxuICAgICAgKTtcblxuICAgICAgY29uc3QgdGV4dENvbnRhaW5lciA9IGVsLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICcuaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW9wdGlvbi10ZXh0LWNvbnRhaW5lcidcbiAgICAgICk7XG5cbiAgICAgIHRleHRDb250YWluZXIuc2V0QXR0cmlidXRlKFxuICAgICAgICAnc3R5bGUnLFxuICAgICAgICBgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKCR7XG4gICAgICAgICAgdGhpcy5nZXRUcmFuc2Zvcm1WYWxfKHBlcmNlbnRhZ2UpICogKGluZGV4ID09PSAwID8gMSA6IC0xKVxuICAgICAgICB9JSkgIWltcG9ydGFudGBcbiAgICAgICk7XG4gICAgICBpZiAocmVzcG9uc2VEYXRhW2luZGV4XS5zZWxlY3RlZCkge1xuICAgICAgICB0ZXh0Q29udGFpbmVyLnNldEF0dHJpYnV0ZShcbiAgICAgICAgICAnYXJpYS1sYWJlbCcsXG4gICAgICAgICAgJ3NlbGVjdGVkICcgKyB0ZXh0Q29udGFpbmVyLnRleHRDb250ZW50XG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwZXJjZW50YWdlID09PSAwKSB7XG4gICAgICAgIHNldFN0eWxlKHRleHRDb250YWluZXIsICdvcGFjaXR5JywgJzAnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-story-interactive/0.1/amp-story-interactive-binary-poll.js