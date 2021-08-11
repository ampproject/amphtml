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
import { CSS } from "../../../build/amp-story-interactive-img-quiz-0.1.css";
import { CSS as ImgCSS } from "../../../build/amp-story-interactive-img-0.1.css";
import { LocalizedStringId } from "../../../src/service/localization/strings";
import { buildImgTemplate } from "./utils";
import { dev } from "../../../src/log";
import { getRGBFromCssColorValue, getTextColorForRGB } from "../../amp-story/1.0/utils";
import { htmlFor } from "../../../src/core/dom/static-template";
import { computedStyle, setImportantStyles } from "../../../src/core/dom/style";
import objstr from 'obj-str';

/**
 * Generates the template for each option.
 *
 * @param {!Element} option
 * @return {!Element}
 */
var buildOptionTemplate = function buildOptionTemplate(option) {
  var html = htmlFor(option);
  return html(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n    <button\n      class=\"i-amphtml-story-interactive-img-option i-amphtml-story-interactive-option\"\n      aria-live=\"polite\"\n    >\n      <div class=\"i-amphtml-story-interactive-img-option-img\">\n        <span\n          class=\"i-amphtml-story-interactive-img-option-percentage-text\"\n        ></span>\n      </div>\n      <div\n        class=\"i-amphtml-story-interactive-img-quiz-answer-choice notranslate\"\n      ></div>\n    </button>\n  "])));
};

export var AmpStoryInteractiveImgQuiz = /*#__PURE__*/function (_AmpStoryInteractive) {
  _inherits(AmpStoryInteractiveImgQuiz, _AmpStoryInteractive);

  var _super = _createSuper(AmpStoryInteractiveImgQuiz);

  /**
   * @param {!AmpElement} element
   */
  function AmpStoryInteractiveImgQuiz(element) {
    var _this;

    _classCallCheck(this, AmpStoryInteractiveImgQuiz);

    _this = _super.call(this, element, InteractiveType.QUIZ);

    /** @private {!Array<string>} */
    _this.localizedAnswerChoices_ = [];
    return _this;
  }

  /** @override */
  _createClass(AmpStoryInteractiveImgQuiz, [{
    key: "buildCallback",
    value: function buildCallback() {
      return _get(_getPrototypeOf(AmpStoryInteractiveImgQuiz.prototype), "buildCallback", this).call(this, CSS + ImgCSS);
    }
    /** @override */

  }, {
    key: "buildComponent",
    value: function buildComponent() {
      this.rootEl_ = buildImgTemplate(this.element);
      this.attachContent_(this.rootEl_);
      return this.rootEl_;
    }
    /** @override */

  }, {
    key: "layoutCallback",
    value: function layoutCallback() {
      this.setBubbleTextColor_(dev().assertElement(this.rootEl_));
      return _get(_getPrototypeOf(AmpStoryInteractiveImgQuiz.prototype), "layoutCallback", this).call(this);
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
      // Localize the answer choice options
      this.localizedAnswerChoices_ = [LocalizedStringId.AMP_STORY_INTERACTIVE_QUIZ_ANSWER_CHOICE_A, LocalizedStringId.AMP_STORY_INTERACTIVE_QUIZ_ANSWER_CHOICE_B, LocalizedStringId.AMP_STORY_INTERACTIVE_QUIZ_ANSWER_CHOICE_C, LocalizedStringId.AMP_STORY_INTERACTIVE_QUIZ_ANSWER_CHOICE_D].map(function (choice) {
        return _this2.localizationService.getLocalizedString(choice);
      });
      var optionContainer = this.rootEl_.querySelector('.i-amphtml-story-interactive-img-option-container');
      this.options_.forEach(function (option, index) {
        return optionContainer.appendChild(_this2.configureOption_(option, index));
      });
    }
    /**
     * Creates and returns an option container with option content,
     * adds styling and answer choices.
     *
     * @param {!./amp-story-interactive-abstract.OptionConfigType} option
     * @param {number} index
     * @return {!Element}
     * @private
     */

  }, {
    key: "configureOption_",
    value: function configureOption_(option, index) {
      var convertedOption = buildOptionTemplate(this.element);
      // Fill in the answer choice and set the option ID
      var answerChoiceEl = convertedOption.querySelector('.i-amphtml-story-interactive-img-quiz-answer-choice');
      answerChoiceEl.textContent = this.localizedAnswerChoices_[index];
      convertedOption.optionIndex_ = option['optionIndex'];
      // Extract and structure the option information
      setImportantStyles(convertedOption.querySelector('.i-amphtml-story-interactive-img-option-img'), {
        'background-image': 'url(' + option['image'] + ')'
      });
      convertedOption.setAttribute('aria-label', option['imagealt']);

      if ('correct' in option) {
        convertedOption.setAttribute('correct', 'correct');
      }

      return convertedOption;
    }
    /**
     * @override
     */

  }, {
    key: "displayOptionsData",
    value: function displayOptionsData(optionsData) {
      var _this3 = this;

      if (!optionsData) {
        return;
      }

      var percentages = this.preprocessPercentages_(optionsData);
      this.getOptionElements().forEach(function (el, index) {
        // Update the aria-label so they read "selected" and "correct" or "incorrect"
        var ariaDescription = objstr({
          selected: optionsData[index].selected,
          correct: el.hasAttribute('correct'),
          incorrect: !el.hasAttribute('correct')
        });
        el.setAttribute('aria-label', ariaDescription + ' ' + _this3.options_[index]['imagealt']);
        // Update percentage text
        el.querySelector('.i-amphtml-story-interactive-img-option-percentage-text').textContent = percentages[index] + "%";
        setImportantStyles(el, {
          '--option-percentage': percentages[index] / 100
        });
      });
    }
    /**
     * Set the text color of the answer choice bubble to be readable and
     * accessible according to the background color.
     *
     * @param {!Element} root
     * @private
     */

  }, {
    key: "setBubbleTextColor_",
    value: function setBubbleTextColor_(root) {
      // Only retrieves first bubble, but styles all bubbles accordingly
      var answerChoiceEl = root.querySelector('.i-amphtml-story-interactive-img-quiz-answer-choice');

      var _computedStyle = computedStyle(this.win, answerChoiceEl),
          backgroundColor = _computedStyle.backgroundColor;

      var rgb = getRGBFromCssColorValue(backgroundColor);
      var contrastColor = getTextColorForRGB(rgb);
      setImportantStyles(root, {
        '--i-amphtml-interactive-option-answer-choice-color': contrastColor
      });
    }
  }]);

  return AmpStoryInteractiveImgQuiz;
}(AmpStoryInteractive);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1pbnRlcmFjdGl2ZS1pbWctcXVpei5qcyJdLCJuYW1lcyI6WyJBbXBTdG9yeUludGVyYWN0aXZlIiwiSW50ZXJhY3RpdmVUeXBlIiwiQ1NTIiwiSW1nQ1NTIiwiTG9jYWxpemVkU3RyaW5nSWQiLCJidWlsZEltZ1RlbXBsYXRlIiwiZGV2IiwiZ2V0UkdCRnJvbUNzc0NvbG9yVmFsdWUiLCJnZXRUZXh0Q29sb3JGb3JSR0IiLCJodG1sRm9yIiwiY29tcHV0ZWRTdHlsZSIsInNldEltcG9ydGFudFN0eWxlcyIsIm9ianN0ciIsImJ1aWxkT3B0aW9uVGVtcGxhdGUiLCJvcHRpb24iLCJodG1sIiwiQW1wU3RvcnlJbnRlcmFjdGl2ZUltZ1F1aXoiLCJlbGVtZW50IiwiUVVJWiIsImxvY2FsaXplZEFuc3dlckNob2ljZXNfIiwicm9vdEVsXyIsImF0dGFjaENvbnRlbnRfIiwic2V0QnViYmxlVGV4dENvbG9yXyIsImFzc2VydEVsZW1lbnQiLCJyb290IiwiYXR0YWNoUHJvbXB0XyIsIkFNUF9TVE9SWV9JTlRFUkFDVElWRV9RVUlaX0FOU1dFUl9DSE9JQ0VfQSIsIkFNUF9TVE9SWV9JTlRFUkFDVElWRV9RVUlaX0FOU1dFUl9DSE9JQ0VfQiIsIkFNUF9TVE9SWV9JTlRFUkFDVElWRV9RVUlaX0FOU1dFUl9DSE9JQ0VfQyIsIkFNUF9TVE9SWV9JTlRFUkFDVElWRV9RVUlaX0FOU1dFUl9DSE9JQ0VfRCIsIm1hcCIsImNob2ljZSIsImxvY2FsaXphdGlvblNlcnZpY2UiLCJnZXRMb2NhbGl6ZWRTdHJpbmciLCJvcHRpb25Db250YWluZXIiLCJxdWVyeVNlbGVjdG9yIiwib3B0aW9uc18iLCJmb3JFYWNoIiwiaW5kZXgiLCJhcHBlbmRDaGlsZCIsImNvbmZpZ3VyZU9wdGlvbl8iLCJjb252ZXJ0ZWRPcHRpb24iLCJhbnN3ZXJDaG9pY2VFbCIsInRleHRDb250ZW50Iiwib3B0aW9uSW5kZXhfIiwic2V0QXR0cmlidXRlIiwib3B0aW9uc0RhdGEiLCJwZXJjZW50YWdlcyIsInByZXByb2Nlc3NQZXJjZW50YWdlc18iLCJnZXRPcHRpb25FbGVtZW50cyIsImVsIiwiYXJpYURlc2NyaXB0aW9uIiwic2VsZWN0ZWQiLCJjb3JyZWN0IiwiaGFzQXR0cmlidXRlIiwiaW5jb3JyZWN0Iiwid2luIiwiYmFja2dyb3VuZENvbG9yIiwicmdiIiwiY29udHJhc3RDb2xvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQ0VBLG1CQURGLEVBRUVDLGVBRkY7QUFJQSxTQUFRQyxHQUFSO0FBQ0EsU0FBUUEsR0FBRyxJQUFJQyxNQUFmO0FBQ0EsU0FBUUMsaUJBQVI7QUFDQSxTQUFRQyxnQkFBUjtBQUNBLFNBQVFDLEdBQVI7QUFDQSxTQUNFQyx1QkFERixFQUVFQyxrQkFGRjtBQUlBLFNBQVFDLE9BQVI7QUFDQSxTQUFRQyxhQUFSLEVBQXVCQyxrQkFBdkI7QUFDQSxPQUFPQyxNQUFQLE1BQW1CLFNBQW5COztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1DLG1CQUFtQixHQUFHLFNBQXRCQSxtQkFBc0IsQ0FBQ0MsTUFBRCxFQUFZO0FBQ3RDLE1BQU1DLElBQUksR0FBR04sT0FBTyxDQUFDSyxNQUFELENBQXBCO0FBQ0EsU0FBT0MsSUFBUDtBQWVELENBakJEOztBQW1CQSxXQUFhQywwQkFBYjtBQUFBOztBQUFBOztBQUNFO0FBQ0Y7QUFDQTtBQUNFLHNDQUFZQyxPQUFaLEVBQXFCO0FBQUE7O0FBQUE7O0FBQ25CLDhCQUFNQSxPQUFOLEVBQWVoQixlQUFlLENBQUNpQixJQUEvQjs7QUFFQTtBQUNBLFVBQUtDLHVCQUFMLEdBQStCLEVBQS9CO0FBSm1CO0FBS3BCOztBQUVEO0FBWEY7QUFBQTtBQUFBLFdBWUUseUJBQWdCO0FBQ2QsMkdBQTJCakIsR0FBRyxHQUFHQyxNQUFqQztBQUNEO0FBRUQ7O0FBaEJGO0FBQUE7QUFBQSxXQWlCRSwwQkFBaUI7QUFDZixXQUFLaUIsT0FBTCxHQUFlZixnQkFBZ0IsQ0FBQyxLQUFLWSxPQUFOLENBQS9CO0FBQ0EsV0FBS0ksY0FBTCxDQUFvQixLQUFLRCxPQUF6QjtBQUNBLGFBQU8sS0FBS0EsT0FBWjtBQUNEO0FBRUQ7O0FBdkJGO0FBQUE7QUFBQSxXQXdCRSwwQkFBaUI7QUFDZixXQUFLRSxtQkFBTCxDQUF5QmhCLEdBQUcsR0FBR2lCLGFBQU4sQ0FBb0IsS0FBS0gsT0FBekIsQ0FBekI7QUFDQTtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBbkNBO0FBQUE7QUFBQSxXQW9DRSx3QkFBZUksSUFBZixFQUFxQjtBQUFBOztBQUNuQixXQUFLQyxhQUFMLENBQW1CRCxJQUFuQjtBQUVBO0FBQ0EsV0FBS0wsdUJBQUwsR0FBK0IsQ0FDN0JmLGlCQUFpQixDQUFDc0IsMENBRFcsRUFFN0J0QixpQkFBaUIsQ0FBQ3VCLDBDQUZXLEVBRzdCdkIsaUJBQWlCLENBQUN3QiwwQ0FIVyxFQUk3QnhCLGlCQUFpQixDQUFDeUIsMENBSlcsRUFLN0JDLEdBTDZCLENBS3pCLFVBQUNDLE1BQUQ7QUFBQSxlQUFZLE1BQUksQ0FBQ0MsbUJBQUwsQ0FBeUJDLGtCQUF6QixDQUE0Q0YsTUFBNUMsQ0FBWjtBQUFBLE9BTHlCLENBQS9CO0FBTUEsVUFBTUcsZUFBZSxHQUFHLEtBQUtkLE9BQUwsQ0FBYWUsYUFBYixDQUN0QixtREFEc0IsQ0FBeEI7QUFHQSxXQUFLQyxRQUFMLENBQWNDLE9BQWQsQ0FBc0IsVUFBQ3ZCLE1BQUQsRUFBU3dCLEtBQVQ7QUFBQSxlQUNwQkosZUFBZSxDQUFDSyxXQUFoQixDQUE0QixNQUFJLENBQUNDLGdCQUFMLENBQXNCMUIsTUFBdEIsRUFBOEJ3QixLQUE5QixDQUE1QixDQURvQjtBQUFBLE9BQXRCO0FBR0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBOURBO0FBQUE7QUFBQSxXQStERSwwQkFBaUJ4QixNQUFqQixFQUF5QndCLEtBQXpCLEVBQWdDO0FBQzlCLFVBQU1HLGVBQWUsR0FBRzVCLG1CQUFtQixDQUFDLEtBQUtJLE9BQU4sQ0FBM0M7QUFFQTtBQUNBLFVBQU15QixjQUFjLEdBQUdELGVBQWUsQ0FBQ04sYUFBaEIsQ0FDckIscURBRHFCLENBQXZCO0FBR0FPLE1BQUFBLGNBQWMsQ0FBQ0MsV0FBZixHQUE2QixLQUFLeEIsdUJBQUwsQ0FBNkJtQixLQUE3QixDQUE3QjtBQUNBRyxNQUFBQSxlQUFlLENBQUNHLFlBQWhCLEdBQStCOUIsTUFBTSxDQUFDLGFBQUQsQ0FBckM7QUFFQTtBQUNBSCxNQUFBQSxrQkFBa0IsQ0FDaEI4QixlQUFlLENBQUNOLGFBQWhCLENBQ0UsNkNBREYsQ0FEZ0IsRUFJaEI7QUFBQyw0QkFBb0IsU0FBU3JCLE1BQU0sQ0FBQyxPQUFELENBQWYsR0FBMkI7QUFBaEQsT0FKZ0IsQ0FBbEI7QUFPQTJCLE1BQUFBLGVBQWUsQ0FBQ0ksWUFBaEIsQ0FBNkIsWUFBN0IsRUFBMkMvQixNQUFNLENBQUMsVUFBRCxDQUFqRDs7QUFFQSxVQUFJLGFBQWFBLE1BQWpCLEVBQXlCO0FBQ3ZCMkIsUUFBQUEsZUFBZSxDQUFDSSxZQUFoQixDQUE2QixTQUE3QixFQUF3QyxTQUF4QztBQUNEOztBQUVELGFBQU9KLGVBQVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTs7QUE1RkE7QUFBQTtBQUFBLFdBNkZFLDRCQUFtQkssV0FBbkIsRUFBZ0M7QUFBQTs7QUFDOUIsVUFBSSxDQUFDQSxXQUFMLEVBQWtCO0FBQ2hCO0FBQ0Q7O0FBRUQsVUFBTUMsV0FBVyxHQUFHLEtBQUtDLHNCQUFMLENBQTRCRixXQUE1QixDQUFwQjtBQUVBLFdBQUtHLGlCQUFMLEdBQXlCWixPQUF6QixDQUFpQyxVQUFDYSxFQUFELEVBQUtaLEtBQUwsRUFBZTtBQUM5QztBQUNBLFlBQU1hLGVBQWUsR0FBR3ZDLE1BQU0sQ0FBQztBQUM3QndDLFVBQUFBLFFBQVEsRUFBRU4sV0FBVyxDQUFDUixLQUFELENBQVgsQ0FBbUJjLFFBREE7QUFFN0JDLFVBQUFBLE9BQU8sRUFBRUgsRUFBRSxDQUFDSSxZQUFILENBQWdCLFNBQWhCLENBRm9CO0FBRzdCQyxVQUFBQSxTQUFTLEVBQUUsQ0FBQ0wsRUFBRSxDQUFDSSxZQUFILENBQWdCLFNBQWhCO0FBSGlCLFNBQUQsQ0FBOUI7QUFLQUosUUFBQUEsRUFBRSxDQUFDTCxZQUFILENBQ0UsWUFERixFQUVFTSxlQUFlLEdBQUcsR0FBbEIsR0FBd0IsTUFBSSxDQUFDZixRQUFMLENBQWNFLEtBQWQsRUFBcUIsVUFBckIsQ0FGMUI7QUFJQTtBQUNBWSxRQUFBQSxFQUFFLENBQUNmLGFBQUgsQ0FDRSx5REFERixFQUVFUSxXQUZGLEdBRW1CSSxXQUFXLENBQUNULEtBQUQsQ0FGOUI7QUFHQTNCLFFBQUFBLGtCQUFrQixDQUFDdUMsRUFBRCxFQUFLO0FBQUMsaUNBQXVCSCxXQUFXLENBQUNULEtBQUQsQ0FBWCxHQUFxQjtBQUE3QyxTQUFMLENBQWxCO0FBQ0QsT0FoQkQ7QUFpQkQ7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUE3SEE7QUFBQTtBQUFBLFdBOEhFLDZCQUFvQmQsSUFBcEIsRUFBMEI7QUFDeEI7QUFDQSxVQUFNa0IsY0FBYyxHQUFHbEIsSUFBSSxDQUFDVyxhQUFMLENBQ3JCLHFEQURxQixDQUF2Qjs7QUFHQSwyQkFBMEJ6QixhQUFhLENBQUMsS0FBSzhDLEdBQU4sRUFBV2QsY0FBWCxDQUF2QztBQUFBLFVBQU9lLGVBQVAsa0JBQU9BLGVBQVA7O0FBQ0EsVUFBTUMsR0FBRyxHQUFHbkQsdUJBQXVCLENBQUNrRCxlQUFELENBQW5DO0FBQ0EsVUFBTUUsYUFBYSxHQUFHbkQsa0JBQWtCLENBQUNrRCxHQUFELENBQXhDO0FBQ0EvQyxNQUFBQSxrQkFBa0IsQ0FBQ2EsSUFBRCxFQUFPO0FBQ3ZCLDhEQUFzRG1DO0FBRC9CLE9BQVAsQ0FBbEI7QUFHRDtBQXpJSDs7QUFBQTtBQUFBLEVBQWdEM0QsbUJBQWhEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAyMSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7XG4gIEFtcFN0b3J5SW50ZXJhY3RpdmUsXG4gIEludGVyYWN0aXZlVHlwZSxcbn0gZnJvbSAnLi9hbXAtc3RvcnktaW50ZXJhY3RpdmUtYWJzdHJhY3QnO1xuaW1wb3J0IHtDU1N9IGZyb20gJy4uLy4uLy4uL2J1aWxkL2FtcC1zdG9yeS1pbnRlcmFjdGl2ZS1pbWctcXVpei0wLjEuY3NzJztcbmltcG9ydCB7Q1NTIGFzIEltZ0NTU30gZnJvbSAnLi4vLi4vLi4vYnVpbGQvYW1wLXN0b3J5LWludGVyYWN0aXZlLWltZy0wLjEuY3NzJztcbmltcG9ydCB7TG9jYWxpemVkU3RyaW5nSWR9IGZyb20gJyNzZXJ2aWNlL2xvY2FsaXphdGlvbi9zdHJpbmdzJztcbmltcG9ydCB7YnVpbGRJbWdUZW1wbGF0ZX0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge2Rldn0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge1xuICBnZXRSR0JGcm9tQ3NzQ29sb3JWYWx1ZSxcbiAgZ2V0VGV4dENvbG9yRm9yUkdCLFxufSBmcm9tICcuLi8uLi9hbXAtc3RvcnkvMS4wL3V0aWxzJztcbmltcG9ydCB7aHRtbEZvcn0gZnJvbSAnI2NvcmUvZG9tL3N0YXRpYy10ZW1wbGF0ZSc7XG5pbXBvcnQge2NvbXB1dGVkU3R5bGUsIHNldEltcG9ydGFudFN0eWxlc30gZnJvbSAnI2NvcmUvZG9tL3N0eWxlJztcbmltcG9ydCBvYmpzdHIgZnJvbSAnb2JqLXN0cic7XG5cbi8qKlxuICogR2VuZXJhdGVzIHRoZSB0ZW1wbGF0ZSBmb3IgZWFjaCBvcHRpb24uXG4gKlxuICogQHBhcmFtIHshRWxlbWVudH0gb3B0aW9uXG4gKiBAcmV0dXJuIHshRWxlbWVudH1cbiAqL1xuY29uc3QgYnVpbGRPcHRpb25UZW1wbGF0ZSA9IChvcHRpb24pID0+IHtcbiAgY29uc3QgaHRtbCA9IGh0bWxGb3Iob3B0aW9uKTtcbiAgcmV0dXJuIGh0bWxgXG4gICAgPGJ1dHRvblxuICAgICAgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtaW1nLW9wdGlvbiBpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtb3B0aW9uXCJcbiAgICAgIGFyaWEtbGl2ZT1cInBvbGl0ZVwiXG4gICAgPlxuICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1pbWctb3B0aW9uLWltZ1wiPlxuICAgICAgICA8c3BhblxuICAgICAgICAgIGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLWltZy1vcHRpb24tcGVyY2VudGFnZS10ZXh0XCJcbiAgICAgICAgPjwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdlxuICAgICAgICBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1pbWctcXVpei1hbnN3ZXItY2hvaWNlIG5vdHJhbnNsYXRlXCJcbiAgICAgID48L2Rpdj5cbiAgICA8L2J1dHRvbj5cbiAgYDtcbn07XG5cbmV4cG9ydCBjbGFzcyBBbXBTdG9yeUludGVyYWN0aXZlSW1nUXVpeiBleHRlbmRzIEFtcFN0b3J5SW50ZXJhY3RpdmUge1xuICAvKipcbiAgICogQHBhcmFtIHshQW1wRWxlbWVudH0gZWxlbWVudFxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgIHN1cGVyKGVsZW1lbnQsIEludGVyYWN0aXZlVHlwZS5RVUlaKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IUFycmF5PHN0cmluZz59ICovXG4gICAgdGhpcy5sb2NhbGl6ZWRBbnN3ZXJDaG9pY2VzXyA9IFtdO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBidWlsZENhbGxiYWNrKCkge1xuICAgIHJldHVybiBzdXBlci5idWlsZENhbGxiYWNrKENTUyArIEltZ0NTUyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGJ1aWxkQ29tcG9uZW50KCkge1xuICAgIHRoaXMucm9vdEVsXyA9IGJ1aWxkSW1nVGVtcGxhdGUodGhpcy5lbGVtZW50KTtcbiAgICB0aGlzLmF0dGFjaENvbnRlbnRfKHRoaXMucm9vdEVsXyk7XG4gICAgcmV0dXJuIHRoaXMucm9vdEVsXztcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgbGF5b3V0Q2FsbGJhY2soKSB7XG4gICAgdGhpcy5zZXRCdWJibGVUZXh0Q29sb3JfKGRldigpLmFzc2VydEVsZW1lbnQodGhpcy5yb290RWxfKSk7XG4gICAgcmV0dXJuIHN1cGVyLmxheW91dENhbGxiYWNrKCk7XG4gIH1cblxuICAvKipcbiAgICogRmluZHMgdGhlIHByb21wdCBhbmQgb3B0aW9ucyBjb250ZW50XG4gICAqIGFuZCBhZGRzIGl0IHRvIHRoZSBxdWl6IGVsZW1lbnQuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gcm9vdFxuICAgKi9cbiAgYXR0YWNoQ29udGVudF8ocm9vdCkge1xuICAgIHRoaXMuYXR0YWNoUHJvbXB0Xyhyb290KTtcblxuICAgIC8vIExvY2FsaXplIHRoZSBhbnN3ZXIgY2hvaWNlIG9wdGlvbnNcbiAgICB0aGlzLmxvY2FsaXplZEFuc3dlckNob2ljZXNfID0gW1xuICAgICAgTG9jYWxpemVkU3RyaW5nSWQuQU1QX1NUT1JZX0lOVEVSQUNUSVZFX1FVSVpfQU5TV0VSX0NIT0lDRV9BLFxuICAgICAgTG9jYWxpemVkU3RyaW5nSWQuQU1QX1NUT1JZX0lOVEVSQUNUSVZFX1FVSVpfQU5TV0VSX0NIT0lDRV9CLFxuICAgICAgTG9jYWxpemVkU3RyaW5nSWQuQU1QX1NUT1JZX0lOVEVSQUNUSVZFX1FVSVpfQU5TV0VSX0NIT0lDRV9DLFxuICAgICAgTG9jYWxpemVkU3RyaW5nSWQuQU1QX1NUT1JZX0lOVEVSQUNUSVZFX1FVSVpfQU5TV0VSX0NIT0lDRV9ELFxuICAgIF0ubWFwKChjaG9pY2UpID0+IHRoaXMubG9jYWxpemF0aW9uU2VydmljZS5nZXRMb2NhbGl6ZWRTdHJpbmcoY2hvaWNlKSk7XG4gICAgY29uc3Qgb3B0aW9uQ29udGFpbmVyID0gdGhpcy5yb290RWxfLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAnLmktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1pbWctb3B0aW9uLWNvbnRhaW5lcidcbiAgICApO1xuICAgIHRoaXMub3B0aW9uc18uZm9yRWFjaCgob3B0aW9uLCBpbmRleCkgPT5cbiAgICAgIG9wdGlvbkNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmNvbmZpZ3VyZU9wdGlvbl8ob3B0aW9uLCBpbmRleCkpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuZCByZXR1cm5zIGFuIG9wdGlvbiBjb250YWluZXIgd2l0aCBvcHRpb24gY29udGVudCxcbiAgICogYWRkcyBzdHlsaW5nIGFuZCBhbnN3ZXIgY2hvaWNlcy5cbiAgICpcbiAgICogQHBhcmFtIHshLi9hbXAtc3RvcnktaW50ZXJhY3RpdmUtYWJzdHJhY3QuT3B0aW9uQ29uZmlnVHlwZX0gb3B0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleFxuICAgKiBAcmV0dXJuIHshRWxlbWVudH1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNvbmZpZ3VyZU9wdGlvbl8ob3B0aW9uLCBpbmRleCkge1xuICAgIGNvbnN0IGNvbnZlcnRlZE9wdGlvbiA9IGJ1aWxkT3B0aW9uVGVtcGxhdGUodGhpcy5lbGVtZW50KTtcblxuICAgIC8vIEZpbGwgaW4gdGhlIGFuc3dlciBjaG9pY2UgYW5kIHNldCB0aGUgb3B0aW9uIElEXG4gICAgY29uc3QgYW5zd2VyQ2hvaWNlRWwgPSBjb252ZXJ0ZWRPcHRpb24ucXVlcnlTZWxlY3RvcihcbiAgICAgICcuaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLWltZy1xdWl6LWFuc3dlci1jaG9pY2UnXG4gICAgKTtcbiAgICBhbnN3ZXJDaG9pY2VFbC50ZXh0Q29udGVudCA9IHRoaXMubG9jYWxpemVkQW5zd2VyQ2hvaWNlc19baW5kZXhdO1xuICAgIGNvbnZlcnRlZE9wdGlvbi5vcHRpb25JbmRleF8gPSBvcHRpb25bJ29wdGlvbkluZGV4J107XG5cbiAgICAvLyBFeHRyYWN0IGFuZCBzdHJ1Y3R1cmUgdGhlIG9wdGlvbiBpbmZvcm1hdGlvblxuICAgIHNldEltcG9ydGFudFN0eWxlcyhcbiAgICAgIGNvbnZlcnRlZE9wdGlvbi5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAnLmktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1pbWctb3B0aW9uLWltZydcbiAgICAgICksXG4gICAgICB7J2JhY2tncm91bmQtaW1hZ2UnOiAndXJsKCcgKyBvcHRpb25bJ2ltYWdlJ10gKyAnKSd9XG4gICAgKTtcblxuICAgIGNvbnZlcnRlZE9wdGlvbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBvcHRpb25bJ2ltYWdlYWx0J10pO1xuXG4gICAgaWYgKCdjb3JyZWN0JyBpbiBvcHRpb24pIHtcbiAgICAgIGNvbnZlcnRlZE9wdGlvbi5zZXRBdHRyaWJ1dGUoJ2NvcnJlY3QnLCAnY29ycmVjdCcpO1xuICAgIH1cblxuICAgIHJldHVybiBjb252ZXJ0ZWRPcHRpb247XG4gIH1cblxuICAvKipcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBkaXNwbGF5T3B0aW9uc0RhdGEob3B0aW9uc0RhdGEpIHtcbiAgICBpZiAoIW9wdGlvbnNEYXRhKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGVyY2VudGFnZXMgPSB0aGlzLnByZXByb2Nlc3NQZXJjZW50YWdlc18ob3B0aW9uc0RhdGEpO1xuXG4gICAgdGhpcy5nZXRPcHRpb25FbGVtZW50cygpLmZvckVhY2goKGVsLCBpbmRleCkgPT4ge1xuICAgICAgLy8gVXBkYXRlIHRoZSBhcmlhLWxhYmVsIHNvIHRoZXkgcmVhZCBcInNlbGVjdGVkXCIgYW5kIFwiY29ycmVjdFwiIG9yIFwiaW5jb3JyZWN0XCJcbiAgICAgIGNvbnN0IGFyaWFEZXNjcmlwdGlvbiA9IG9ianN0cih7XG4gICAgICAgIHNlbGVjdGVkOiBvcHRpb25zRGF0YVtpbmRleF0uc2VsZWN0ZWQsXG4gICAgICAgIGNvcnJlY3Q6IGVsLmhhc0F0dHJpYnV0ZSgnY29ycmVjdCcpLFxuICAgICAgICBpbmNvcnJlY3Q6ICFlbC5oYXNBdHRyaWJ1dGUoJ2NvcnJlY3QnKSxcbiAgICAgIH0pO1xuICAgICAgZWwuc2V0QXR0cmlidXRlKFxuICAgICAgICAnYXJpYS1sYWJlbCcsXG4gICAgICAgIGFyaWFEZXNjcmlwdGlvbiArICcgJyArIHRoaXMub3B0aW9uc19baW5kZXhdWydpbWFnZWFsdCddXG4gICAgICApO1xuICAgICAgLy8gVXBkYXRlIHBlcmNlbnRhZ2UgdGV4dFxuICAgICAgZWwucXVlcnlTZWxlY3RvcihcbiAgICAgICAgJy5pLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtaW1nLW9wdGlvbi1wZXJjZW50YWdlLXRleHQnXG4gICAgICApLnRleHRDb250ZW50ID0gYCR7cGVyY2VudGFnZXNbaW5kZXhdfSVgO1xuICAgICAgc2V0SW1wb3J0YW50U3R5bGVzKGVsLCB7Jy0tb3B0aW9uLXBlcmNlbnRhZ2UnOiBwZXJjZW50YWdlc1tpbmRleF0gLyAxMDB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHRleHQgY29sb3Igb2YgdGhlIGFuc3dlciBjaG9pY2UgYnViYmxlIHRvIGJlIHJlYWRhYmxlIGFuZFxuICAgKiBhY2Nlc3NpYmxlIGFjY29yZGluZyB0byB0aGUgYmFja2dyb3VuZCBjb2xvci5cbiAgICpcbiAgICogQHBhcmFtIHshRWxlbWVudH0gcm9vdFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2V0QnViYmxlVGV4dENvbG9yXyhyb290KSB7XG4gICAgLy8gT25seSByZXRyaWV2ZXMgZmlyc3QgYnViYmxlLCBidXQgc3R5bGVzIGFsbCBidWJibGVzIGFjY29yZGluZ2x5XG4gICAgY29uc3QgYW5zd2VyQ2hvaWNlRWwgPSByb290LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAnLmktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1pbWctcXVpei1hbnN3ZXItY2hvaWNlJ1xuICAgICk7XG4gICAgY29uc3Qge2JhY2tncm91bmRDb2xvcn0gPSBjb21wdXRlZFN0eWxlKHRoaXMud2luLCBhbnN3ZXJDaG9pY2VFbCk7XG4gICAgY29uc3QgcmdiID0gZ2V0UkdCRnJvbUNzc0NvbG9yVmFsdWUoYmFja2dyb3VuZENvbG9yKTtcbiAgICBjb25zdCBjb250cmFzdENvbG9yID0gZ2V0VGV4dENvbG9yRm9yUkdCKHJnYik7XG4gICAgc2V0SW1wb3J0YW50U3R5bGVzKHJvb3QsIHtcbiAgICAgICctLWktYW1waHRtbC1pbnRlcmFjdGl2ZS1vcHRpb24tYW5zd2VyLWNob2ljZS1jb2xvcic6IGNvbnRyYXN0Q29sb3IsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-story-interactive/0.1/amp-story-interactive-img-quiz.js