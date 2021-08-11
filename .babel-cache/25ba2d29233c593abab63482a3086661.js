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
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import { CSS } from "../../../build/amp-story-interactive-quiz-0.1.css";
import { LocalizedStringId } from "../../../src/service/localization/strings";
import { htmlFor } from "../../../src/core/dom/static-template";
import { setStyle } from "../../../src/core/dom/style";
import objstr from 'obj-str';

/**
 * Generates the template for the quiz.
 *
 * @param {!Element} element
 * @return {!Element}
 */
var buildQuizTemplate = function buildQuizTemplate(element) {
  var html = htmlFor(element);
  return html(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n    <div class=\"i-amphtml-story-interactive-quiz-container\">\n      <div class=\"i-amphtml-story-interactive-prompt-container\"></div>\n      <div class=\"i-amphtml-story-interactive-quiz-option-container\"></div>\n    </div>\n  "])));
};

/**
 * Generates the template for each option.
 *
 * @param {!Element} option
 * @return {!Element}
 */
var buildOptionTemplate = function buildOptionTemplate(option) {
  var html = htmlFor(option);
  return html(_templateObject2 || (_templateObject2 = _taggedTemplateLiteralLoose(["\n    <button\n      class=\"i-amphtml-story-interactive-quiz-option i-amphtml-story-interactive-option\"\n      aria-live=\"polite\"\n    >\n      <span\n        class=\"i-amphtml-story-interactive-quiz-answer-choice notranslate\"\n      ></span>\n    </button>\n  "])));
};

export var AmpStoryInteractiveQuiz = /*#__PURE__*/function (_AmpStoryInteractive) {
  _inherits(AmpStoryInteractiveQuiz, _AmpStoryInteractive);

  var _super = _createSuper(AmpStoryInteractiveQuiz);

  /**
   * @param {!AmpElement} element
   */
  function AmpStoryInteractiveQuiz(element) {
    var _this;

    _classCallCheck(this, AmpStoryInteractiveQuiz);

    _this = _super.call(this, element, InteractiveType.QUIZ);

    /** @private {!Array<string>} */
    _this.localizedAnswerChoices_ = [];
    return _this;
  }

  /** @override */
  _createClass(AmpStoryInteractiveQuiz, [{
    key: "buildCallback",
    value: function buildCallback() {
      return _get(_getPrototypeOf(AmpStoryInteractiveQuiz.prototype), "buildCallback", this).call(this, CSS);
    }
    /** @override */

  }, {
    key: "buildComponent",
    value: function buildComponent() {
      this.rootEl_ = buildQuizTemplate(this.element);
      this.attachContent_(this.rootEl_);
      return this.rootEl_;
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
      var optionContainer = this.rootEl_.querySelector('.i-amphtml-story-interactive-quiz-option-container');
      this.options_.forEach(function (option, index) {
        return optionContainer.appendChild(_this2.configureOption_(option, index));
      });
    }
    /**
     * Creates an option container with option content,
     * adds styling and answer choices,
     * and adds it to the quiz element.
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
      var answerChoiceEl = convertedOption.querySelector('.i-amphtml-story-interactive-quiz-answer-choice');
      answerChoiceEl.textContent = this.localizedAnswerChoices_[index];
      convertedOption.optionIndex_ = option['optionIndex'];
      // Extract and structure the option information
      var optionText = document.createElement('span');
      optionText.classList.add('i-amphtml-story-interactive-quiz-option-text');
      optionText.textContent = option['text'];
      convertedOption.appendChild(optionText);
      // Add text container for percentage display
      var percentageText = document.createElement('span');
      percentageText.classList.add('i-amphtml-story-interactive-quiz-percentage-text');
      convertedOption.appendChild(percentageText);

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
        el.querySelector('.i-amphtml-story-interactive-quiz-answer-choice').setAttribute('aria-hidden', true);
        var optionText = el.querySelector('.i-amphtml-story-interactive-quiz-option-text');
        optionText.setAttribute('aria-label', ariaDescription + ' ' + optionText.textContent);
        // Update percentage text
        el.querySelector('.i-amphtml-story-interactive-quiz-percentage-text').textContent = percentages[index] + "%";
        setStyle(el, '--option-percentage', percentages[index] + "%");
      });
    }
  }]);

  return AmpStoryInteractiveQuiz;
}(AmpStoryInteractive);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1pbnRlcmFjdGl2ZS1xdWl6LmpzIl0sIm5hbWVzIjpbIkFtcFN0b3J5SW50ZXJhY3RpdmUiLCJJbnRlcmFjdGl2ZVR5cGUiLCJDU1MiLCJMb2NhbGl6ZWRTdHJpbmdJZCIsImh0bWxGb3IiLCJzZXRTdHlsZSIsIm9ianN0ciIsImJ1aWxkUXVpelRlbXBsYXRlIiwiZWxlbWVudCIsImh0bWwiLCJidWlsZE9wdGlvblRlbXBsYXRlIiwib3B0aW9uIiwiQW1wU3RvcnlJbnRlcmFjdGl2ZVF1aXoiLCJRVUlaIiwibG9jYWxpemVkQW5zd2VyQ2hvaWNlc18iLCJyb290RWxfIiwiYXR0YWNoQ29udGVudF8iLCJyb290IiwiYXR0YWNoUHJvbXB0XyIsIkFNUF9TVE9SWV9JTlRFUkFDVElWRV9RVUlaX0FOU1dFUl9DSE9JQ0VfQSIsIkFNUF9TVE9SWV9JTlRFUkFDVElWRV9RVUlaX0FOU1dFUl9DSE9JQ0VfQiIsIkFNUF9TVE9SWV9JTlRFUkFDVElWRV9RVUlaX0FOU1dFUl9DSE9JQ0VfQyIsIkFNUF9TVE9SWV9JTlRFUkFDVElWRV9RVUlaX0FOU1dFUl9DSE9JQ0VfRCIsIm1hcCIsImNob2ljZSIsImxvY2FsaXphdGlvblNlcnZpY2UiLCJnZXRMb2NhbGl6ZWRTdHJpbmciLCJvcHRpb25Db250YWluZXIiLCJxdWVyeVNlbGVjdG9yIiwib3B0aW9uc18iLCJmb3JFYWNoIiwiaW5kZXgiLCJhcHBlbmRDaGlsZCIsImNvbmZpZ3VyZU9wdGlvbl8iLCJjb252ZXJ0ZWRPcHRpb24iLCJhbnN3ZXJDaG9pY2VFbCIsInRleHRDb250ZW50Iiwib3B0aW9uSW5kZXhfIiwib3B0aW9uVGV4dCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImNsYXNzTGlzdCIsImFkZCIsInBlcmNlbnRhZ2VUZXh0Iiwic2V0QXR0cmlidXRlIiwib3B0aW9uc0RhdGEiLCJwZXJjZW50YWdlcyIsInByZXByb2Nlc3NQZXJjZW50YWdlc18iLCJnZXRPcHRpb25FbGVtZW50cyIsImVsIiwiYXJpYURlc2NyaXB0aW9uIiwic2VsZWN0ZWQiLCJjb3JyZWN0IiwiaGFzQXR0cmlidXRlIiwiaW5jb3JyZWN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FDRUEsbUJBREYsRUFFRUMsZUFGRjtBQUlBLFNBQVFDLEdBQVI7QUFDQSxTQUFRQyxpQkFBUjtBQUNBLFNBQVFDLE9BQVI7QUFDQSxTQUFRQyxRQUFSO0FBQ0EsT0FBT0MsTUFBUCxNQUFtQixTQUFuQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQyxpQkFBaUIsR0FBRyxTQUFwQkEsaUJBQW9CLENBQUNDLE9BQUQsRUFBYTtBQUNyQyxNQUFNQyxJQUFJLEdBQUdMLE9BQU8sQ0FBQ0ksT0FBRCxDQUFwQjtBQUNBLFNBQU9DLElBQVA7QUFNRCxDQVJEOztBQVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1DLG1CQUFtQixHQUFHLFNBQXRCQSxtQkFBc0IsQ0FBQ0MsTUFBRCxFQUFZO0FBQ3RDLE1BQU1GLElBQUksR0FBR0wsT0FBTyxDQUFDTyxNQUFELENBQXBCO0FBQ0EsU0FBT0YsSUFBUDtBQVVELENBWkQ7O0FBY0EsV0FBYUcsdUJBQWI7QUFBQTs7QUFBQTs7QUFDRTtBQUNGO0FBQ0E7QUFDRSxtQ0FBWUosT0FBWixFQUFxQjtBQUFBOztBQUFBOztBQUNuQiw4QkFBTUEsT0FBTixFQUFlUCxlQUFlLENBQUNZLElBQS9COztBQUVBO0FBQ0EsVUFBS0MsdUJBQUwsR0FBK0IsRUFBL0I7QUFKbUI7QUFLcEI7O0FBRUQ7QUFYRjtBQUFBO0FBQUEsV0FZRSx5QkFBZ0I7QUFDZCx3R0FBMkJaLEdBQTNCO0FBQ0Q7QUFFRDs7QUFoQkY7QUFBQTtBQUFBLFdBaUJFLDBCQUFpQjtBQUNmLFdBQUthLE9BQUwsR0FBZVIs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QUQsQ0FBWCxDQUFtQm9CLFFBREE7QUFFN0JDLFVBQUFBLE9BQU8sRUFBRUgsRUFBRSxDQUFDSSxZQUFILENBQWdCLFNBQWhCLENBRm9CO0FBRzdCQyxVQUFBQSxTQUFTLEVBQUUsQ0FBQ0wsRUFBRSxDQUFDSSxZQUFILENBQWdCLFNBQWhCO0FBSGlCLFNBQUQsQ0FBOUI7QUFLQUosUUFBQUEsRUFBRSxDQUFDckIsYUFBSCxDQUNFLGlEQURGLEVBRUVnQixZQUZGLENBRWUsYUFGZixFQUU4QixJQUY5QjtBQUdBLFlBQU1OLFVBQVUsR0FBR1csRUFBRSxDQUFDckIsYUFBSCxDQUNqQiwrQ0FEaUIsQ0FBbkI7QUFHQVUsUUFBQUEsVUFBVSxDQUFDTSxZQUFYLENBQ0UsWUFERixFQUVFTSxlQUFlLEdBQUcsR0FBbEIsR0FBd0JaLFVBQVUsQ0FBQ0YsV0FGckM7QUFJQTtBQUNBYSxRQUFBQSxFQUFFLENBQUNyQixhQUFILENBQ0UsbURBREYsRUFFRVEsV0FGRixHQUVtQlUsV0FBVyxDQUFDZixLQUFELENBRjlCO0FBR0ExQixRQUFBQSxRQUFRLENBQUM0QyxFQUFELEVBQUsscUJBQUwsRUFBK0JILFdBQVcsQ0FBQ2YsS0FBRCxDQUExQyxPQUFSO0FBQ0QsT0F0QkQ7QUF1QkQ7QUF4SEg7O0FBQUE7QUFBQSxFQUE2Qy9CLG1CQUE3QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTkgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1xuICBBbXBTdG9yeUludGVyYWN0aXZlLFxuICBJbnRlcmFjdGl2ZVR5cGUsXG59IGZyb20gJy4vYW1wLXN0b3J5LWludGVyYWN0aXZlLWFic3RyYWN0JztcbmltcG9ydCB7Q1NTfSBmcm9tICcuLi8uLi8uLi9idWlsZC9hbXAtc3RvcnktaW50ZXJhY3RpdmUtcXVpei0wLjEuY3NzJztcbmltcG9ydCB7TG9jYWxpemVkU3RyaW5nSWR9IGZyb20gJyNzZXJ2aWNlL2xvY2FsaXphdGlvbi9zdHJpbmdzJztcbmltcG9ydCB7aHRtbEZvcn0gZnJvbSAnI2NvcmUvZG9tL3N0YXRpYy10ZW1wbGF0ZSc7XG5pbXBvcnQge3NldFN0eWxlfSBmcm9tICcjY29yZS9kb20vc3R5bGUnO1xuaW1wb3J0IG9ianN0ciBmcm9tICdvYmotc3RyJztcblxuLyoqXG4gKiBHZW5lcmF0ZXMgdGhlIHRlbXBsYXRlIGZvciB0aGUgcXVpei5cbiAqXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJuIHshRWxlbWVudH1cbiAqL1xuY29uc3QgYnVpbGRRdWl6VGVtcGxhdGUgPSAoZWxlbWVudCkgPT4ge1xuICBjb25zdCBodG1sID0gaHRtbEZvcihlbGVtZW50KTtcbiAgcmV0dXJuIGh0bWxgXG4gICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1xdWl6LWNvbnRhaW5lclwiPlxuICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1wcm9tcHQtY29udGFpbmVyXCI+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLXF1aXotb3B0aW9uLWNvbnRhaW5lclwiPjwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgdGhlIHRlbXBsYXRlIGZvciBlYWNoIG9wdGlvbi5cbiAqXG4gKiBAcGFyYW0geyFFbGVtZW50fSBvcHRpb25cbiAqIEByZXR1cm4geyFFbGVtZW50fVxuICovXG5jb25zdCBidWlsZE9wdGlvblRlbXBsYXRlID0gKG9wdGlvbikgPT4ge1xuICBjb25zdCBodG1sID0gaHRtbEZvcihvcHRpb24pO1xuICByZXR1cm4gaHRtbGBcbiAgICA8YnV0dG9uXG4gICAgICBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1xdWl6LW9wdGlvbiBpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtb3B0aW9uXCJcbiAgICAgIGFyaWEtbGl2ZT1cInBvbGl0ZVwiXG4gICAgPlxuICAgICAgPHNwYW5cbiAgICAgICAgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtcXVpei1hbnN3ZXItY2hvaWNlIG5vdHJhbnNsYXRlXCJcbiAgICAgID48L3NwYW4+XG4gICAgPC9idXR0b24+XG4gIGA7XG59O1xuXG5leHBvcnQgY2xhc3MgQW1wU3RvcnlJbnRlcmFjdGl2ZVF1aXogZXh0ZW5kcyBBbXBTdG9yeUludGVyYWN0aXZlIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IGVsZW1lbnRcbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICBzdXBlcihlbGVtZW50LCBJbnRlcmFjdGl2ZVR5cGUuUVVJWik7XG5cbiAgICAvKiogQHByaXZhdGUgeyFBcnJheTxzdHJpbmc+fSAqL1xuICAgIHRoaXMubG9jYWxpemVkQW5zd2VyQ2hvaWNlc18gPSBbXTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgYnVpbGRDYWxsYmFjaygpIHtcbiAgICByZXR1cm4gc3VwZXIuYnVpbGRDYWxsYmFjayhDU1MpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBidWlsZENvbXBvbmVudCgpIHtcbiAgICB0aGlzLnJvb3RFbF8gPSBidWlsZFF1aXpUZW1wbGF0ZSh0aGlzLmVsZW1lbnQpO1xuICAgIHRoaXMuYXR0YWNoQ29udGVudF8odGhpcy5yb290RWxfKTtcbiAgICByZXR1cm4gdGhpcy5yb290RWxfO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmRzIHRoZSBwcm9tcHQgYW5kIG9wdGlvbnMgY29udGVudFxuICAgKiBhbmQgYWRkcyBpdCB0byB0aGUgcXVpeiBlbGVtZW50LlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IHJvb3RcbiAgICovXG4gIGF0dGFjaENvbnRlbnRfKHJvb3QpIHtcbiAgICB0aGlzLmF0dGFjaFByb21wdF8ocm9vdCk7XG5cbiAgICAvLyBMb2NhbGl6ZSB0aGUgYW5zd2VyIGNob2ljZSBvcHRpb25zXG4gICAgdGhpcy5sb2NhbGl6ZWRBbnN3ZXJDaG9pY2VzXyA9IFtcbiAgICAgIExvY2FsaXplZFN0cmluZ0lkLkFNUF9TVE9SWV9JTlRFUkFDVElWRV9RVUlaX0FOU1dFUl9DSE9JQ0VfQSxcbiAgICAgIExvY2FsaXplZFN0cmluZ0lkLkFNUF9TVE9SWV9JTlRFUkFDVElWRV9RVUlaX0FOU1dFUl9DSE9JQ0VfQixcbiAgICAgIExvY2FsaXplZFN0cmluZ0lkLkFNUF9TVE9SWV9JTlRFUkFDVElWRV9RVUlaX0FOU1dFUl9DSE9JQ0VfQyxcbiAgICAgIExvY2FsaXplZFN0cmluZ0lkLkFNUF9TVE9SWV9JTlRFUkFDVElWRV9RVUlaX0FOU1dFUl9DSE9JQ0VfRCxcbiAgICBdLm1hcCgoY2hvaWNlKSA9PiB0aGlzLmxvY2FsaXphdGlvblNlcnZpY2UuZ2V0TG9jYWxpemVkU3RyaW5nKGNob2ljZSkpO1xuICAgIGNvbnN0IG9wdGlvbkNvbnRhaW5lciA9IHRoaXMucm9vdEVsXy5xdWVyeVNlbGVjdG9yKFxuICAgICAgJy5pLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtcXVpei1vcHRpb24tY29udGFpbmVyJ1xuICAgICk7XG4gICAgdGhpcy5vcHRpb25zXy5mb3JFYWNoKChvcHRpb24sIGluZGV4KSA9PlxuICAgICAgb3B0aW9uQ29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuY29uZmlndXJlT3B0aW9uXyhvcHRpb24sIGluZGV4KSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gb3B0aW9uIGNvbnRhaW5lciB3aXRoIG9wdGlvbiBjb250ZW50LFxuICAgKiBhZGRzIHN0eWxpbmcgYW5kIGFuc3dlciBjaG9pY2VzLFxuICAgKiBhbmQgYWRkcyBpdCB0byB0aGUgcXVpeiBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0geyEuL2FtcC1zdG9yeS1pbnRlcmFjdGl2ZS1hYnN0cmFjdC5PcHRpb25Db25maWdUeXBlfSBvcHRpb25cbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4XG4gICAqIEByZXR1cm4geyFFbGVtZW50fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY29uZmlndXJlT3B0aW9uXyhvcHRpb24sIGluZGV4KSB7XG4gICAgY29uc3QgY29udmVydGVkT3B0aW9uID0gYnVpbGRPcHRpb25UZW1wbGF0ZSh0aGlzLmVsZW1lbnQpO1xuXG4gICAgLy8gRmlsbCBpbiB0aGUgYW5zd2VyIGNob2ljZSBhbmQgc2V0IHRoZSBvcHRpb24gSURcbiAgICBjb25zdCBhbnN3ZXJDaG9pY2VFbCA9IGNvbnZlcnRlZE9wdGlvbi5xdWVyeVNlbGVjdG9yKFxuICAgICAgJy5pLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtcXVpei1hbnN3ZXItY2hvaWNlJ1xuICAgICk7XG4gICAgYW5zd2VyQ2hvaWNlRWwudGV4dENvbnRlbnQgPSB0aGlzLmxvY2FsaXplZEFuc3dlckNob2ljZXNfW2luZGV4XTtcbiAgICBjb252ZXJ0ZWRPcHRpb24ub3B0aW9uSW5kZXhfID0gb3B0aW9uWydvcHRpb25JbmRleCddO1xuXG4gICAgLy8gRXh0cmFjdCBhbmQgc3RydWN0dXJlIHRoZSBvcHRpb24gaW5mb3JtYXRpb25cbiAgICBjb25zdCBvcHRpb25UZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIG9wdGlvblRleHQuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLXF1aXotb3B0aW9uLXRleHQnKTtcbiAgICBvcHRpb25UZXh0LnRleHRDb250ZW50ID0gb3B0aW9uWyd0ZXh0J107XG4gICAgY29udmVydGVkT3B0aW9uLmFwcGVuZENoaWxkKG9wdGlvblRleHQpO1xuXG4gICAgLy8gQWRkIHRleHQgY29udGFpbmVyIGZvciBwZXJjZW50YWdlIGRpc3BsYXlcbiAgICBjb25zdCBwZXJjZW50YWdlVGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBwZXJjZW50YWdlVGV4dC5jbGFzc0xpc3QuYWRkKFxuICAgICAgJ2ktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1xdWl6LXBlcmNlbnRhZ2UtdGV4dCdcbiAgICApO1xuICAgIGNvbnZlcnRlZE9wdGlvbi5hcHBlbmRDaGlsZChwZXJjZW50YWdlVGV4dCk7XG5cbiAgICBpZiAoJ2NvcnJlY3QnIGluIG9wdGlvbikge1xuICAgICAgY29udmVydGVkT3B0aW9uLnNldEF0dHJpYnV0ZSgnY29ycmVjdCcsICdjb3JyZWN0Jyk7XG4gICAgfVxuICAgIHJldHVybiBjb252ZXJ0ZWRPcHRpb247XG4gIH1cblxuICAvKipcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBkaXNwbGF5T3B0aW9uc0RhdGEob3B0aW9uc0RhdGEpIHtcbiAgICBpZiAoIW9wdGlvbnNEYXRhKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGVyY2VudGFnZXMgPSB0aGlzLnByZXByb2Nlc3NQZXJjZW50YWdlc18ob3B0aW9uc0RhdGEpO1xuXG4gICAgdGhpcy5nZXRPcHRpb25FbGVtZW50cygpLmZvckVhY2goKGVsLCBpbmRleCkgPT4ge1xuICAgICAgLy8gVXBkYXRlIHRoZSBhcmlhLWxhYmVsIHNvIHRoZXkgcmVhZCBcInNlbGVjdGVkXCIgYW5kIFwiY29ycmVjdFwiIG9yIFwiaW5jb3JyZWN0XCJcbiAgICAgIGNvbnN0IGFyaWFEZXNjcmlwdGlvbiA9IG9ianN0cih7XG4gICAgICAgIHNlbGVjdGVkOiBvcHRpb25zRGF0YVtpbmRleF0uc2VsZWN0ZWQsXG4gICAgICAgIGNvcnJlY3Q6IGVsLmhhc0F0dHJpYnV0ZSgnY29ycmVjdCcpLFxuICAgICAgICBpbmNvcnJlY3Q6ICFlbC5oYXNBdHRyaWJ1dGUoJ2NvcnJlY3QnKSxcbiAgICAgIH0pO1xuICAgICAgZWwucXVlcnlTZWxlY3RvcihcbiAgICAgICAgJy5pLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtcXVpei1hbnN3ZXItY2hvaWNlJ1xuICAgICAgKS5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgdHJ1ZSk7XG4gICAgICBjb25zdCBvcHRpb25UZXh0ID0gZWwucXVlcnlTZWxlY3RvcihcbiAgICAgICAgJy5pLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtcXVpei1vcHRpb24tdGV4dCdcbiAgICAgICk7XG4gICAgICBvcHRpb25UZXh0LnNldEF0dHJpYnV0ZShcbiAgICAgICAgJ2FyaWEtbGFiZWwnLFxuICAgICAgICBhcmlhRGVzY3JpcHRpb24gKyAnICcgKyBvcHRpb25UZXh0LnRleHRDb250ZW50XG4gICAgICApO1xuICAgICAgLy8gVXBkYXRlIHBlcmNlbnRhZ2UgdGV4dFxuICAgICAgZWwucXVlcnlTZWxlY3RvcihcbiAgICAgICAgJy5pLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtcXVpei1wZXJjZW50YWdlLXRleHQnXG4gICAgICApLnRleHRDb250ZW50ID0gYCR7cGVyY2VudGFnZXNbaW5kZXhdfSVgO1xuICAgICAgc2V0U3R5bGUoZWwsICctLW9wdGlvbi1wZXJjZW50YWdlJywgYCR7cGVyY2VudGFnZXNbaW5kZXhdfSVgKTtcbiAgICB9KTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-story-interactive/0.1/amp-story-interactive-quiz.js