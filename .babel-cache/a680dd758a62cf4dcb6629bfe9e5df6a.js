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
import { CSS } from "../../../build/amp-story-interactive-results-0.1.css";
import { StateProperty } from "../../amp-story/1.0/amp-story-store-service";
import { computedStyle, setStyle } from "../../../src/core/dom/style";
import { dev } from "../../../src/log";
import { htmlFor } from "../../../src/core/dom/static-template";

/**
 * @typedef {{
 *    category: ?string,
 *    percentage: ?number,
 * }}
 */
export var InteractiveResultsDef;

/**
 * Generates the template for the quiz.
 *
 * @param {!Element} element
 * @return {!Element}
 */
var buildResultsTemplate = function buildResultsTemplate(element) {
  var html = htmlFor(element);
  return html(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n    <div class=\"i-amphtml-story-interactive-results-container\">\n      <div class=\"i-amphtml-story-interactive-results-top\">\n        <div class=\"i-amphtml-story-interactive-results-top-score\">SCORE:</div>\n        <div class=\"i-amphtml-story-interactive-results-top-value\">\n          <span class=\"i-amphtml-story-interactive-results-top-value-number\"\n            >100</span\n          ><span>%</span>\n        </div>\n      </div>\n      <div class=\"i-amphtml-story-interactive-results-image-border\">\n        <div class=\"i-amphtml-story-interactive-results-image\"></div>\n      </div>\n      <div class=\"i-amphtml-story-interactive-results-prompt\"></div>\n      <div class=\"i-amphtml-story-interactive-results-title\"></div>\n      <div class=\"i-amphtml-story-interactive-results-description\"></div>\n    </div>\n  "])));
};

var HAS_IMAGE_CLASS = 'i-amphtml-story-interactive-has-image';
var HAS_SCORE_CLASS = 'i-amphtml-story-interactive-has-score';

/**
 * Processes the state and returns the condensed results.
 * @param {!Map<string, {option: ?./amp-story-interactive-abstract.OptionConfigType, interactiveId: string}>} interactiveState
 * @param {?Array<!./amp-story-interactive-abstract.OptionConfigType>} options needed to ensure the first options take precedence on ties
 * @return {InteractiveResultsDef} the results
 */
var processResults = function processResults(interactiveState, options) {
  var processStrategy = decideStrategy(options) === 'category' ? processResultsCategory : processResultsPercentage;
  return processStrategy(interactiveState, options);
};

/**
 * Processes the state and returns the condensed results for a category strategy
 * @param {!Map<string, {option: ?./amp-story-interactive-abstract.OptionConfigType, interactiveId: string}>} interactiveState
 * @param {?Array<!./amp-story-interactive-abstract.OptionConfigType>} options the attributes on the component
 * @return {InteractiveResultsDef} the results
 * @package
 */
export var processResultsCategory = function processResultsCategory(interactiveState, options) {
  var result = {
    category: null,
    percentage: null
  };
  // Add all categories in order to the map with value 0
  var categories = {};
  options.forEach(function (option) {
    if (option.resultscategory) {
      categories[option.resultscategory] = 0;
    }
  });
  // Vote for category for each answered poll
  Object.values(interactiveState).forEach(function (e) {
    if (e.type == InteractiveType.POLL) {
      if (e.option && e.option.resultscategory && categories[e.option.resultscategory] != null) {
        categories[e.option.resultscategory] += 1;
      }
    }
  });
  // Returns category with most votes, first ones take precedence in ties
  result.category = Object.keys(categories).reduce(function (a, b) {
    return categories[a] >= categories[b] ? a : b;
  });
  return result;
};

/**
 * Processes the state and returns the condensed results for a percentage strategy
 * @param {!Map<string, {option: ?./amp-story-interactive-abstract.OptionConfigType, interactiveId: string}>} interactiveState
 * @param {?Array<!./amp-story-interactive-abstract.OptionConfigType>} options the attributes on the component
 * @return {InteractiveResultsDef} the results
 * @package
 */
export var processResultsPercentage = function processResultsPercentage(interactiveState, options) {
  var result = {
    category: null,
    percentage: null
  };
  // Count quizzes and correct quizzes
  var quizCount = 0;
  var quizCorrect = 0;
  Object.values(interactiveState).forEach(function (e) {
    if (e.type == InteractiveType.QUIZ) {
      quizCount += 1;

      if (e.option && e.option.correct != null) {
        quizCorrect += 1;
      }
    }
  });
  // Percentage = (correct / total) but avoid divide by 0 error
  result.percentage = quizCount == 0 ? 0 : 100 * (quizCorrect / quizCount);
  // Get closest threshold that is lower than percentage, or lowest one if percentage is too low
  var minThresholdDiff = -100;
  options.forEach(function (option) {
    // ThresholdDiff is positive if it's lower than percentage (desired)
    var currThresholdDiff = result.percentage - parseFloat(option.resultsthreshold);

    if ( // Curr meets the requirement and (is better or min doesnt meet)
    currThresholdDiff >= 0 && (minThresholdDiff > currThresholdDiff || minThresholdDiff < 0) || // Curr doesnt meet the requirement, but min also doesnt and curr is better than min
    currThresholdDiff < 0 && minThresholdDiff < 0 && currThresholdDiff > minThresholdDiff) {
      result.category = option.resultscategory;
      minThresholdDiff = currThresholdDiff;
    }
  });
  return result;
};

/**
 * Decides what strategy to use.
 * If there are thresholds specified, it uses percentage; otherwise it uses category.
 * @param {?Array<!./amp-story-interactive-abstract.OptionConfigType>} options the attributes on the component
 * @return {string} the strategy
 * @package
 */
export var decideStrategy = function decideStrategy(options) {
  return options.some(function (o) {
    return o.resultsthreshold != undefined;
  }) ? 'percentage' : 'category';
};
export var AmpStoryInteractiveResults = /*#__PURE__*/function (_AmpStoryInteractive) {
  _inherits(AmpStoryInteractiveResults, _AmpStoryInteractive);

  var _super = _createSuper(AmpStoryInteractiveResults);

  /**
   * @param {!AmpElement} element
   */
  function AmpStoryInteractiveResults(element) {
    _classCallCheck(this, AmpStoryInteractiveResults);

    return _super.call(this, element, InteractiveType.RESULTS, [2, 4]);
  }

  /** @override */
  _createClass(AmpStoryInteractiveResults, [{
    key: "buildCallback",
    value: function buildCallback() {
      return _get(_getPrototypeOf(AmpStoryInteractiveResults.prototype), "buildCallback", this).call(this, CSS);
    }
    /** @override */

  }, {
    key: "buildComponent",
    value: function buildComponent() {
      this.rootEl_ = buildResultsTemplate(this.element);
      return this.rootEl_;
    }
    /** @override */

  }, {
    key: "layoutCallback",
    value: function layoutCallback() {
      var _this = this;

      if (this.element.hasAttribute('prompt-text')) {
        this.rootEl_.querySelector('.i-amphtml-story-interactive-results-prompt').textContent = this.element.getAttribute('prompt-text');
      }

      this.storeService_.subscribe(StateProperty.INTERACTIVE_REACT_STATE, function (data) {
        return _this.onInteractiveReactStateUpdate_(data);
      }, true);
    }
    /**
     * Receives state updates and fills up DOM with the result
     * @param {!Map<string, {option: ?./amp-story-interactive-abstract.OptionConfigType, interactiveId: string}>} interactiveState
     * @private
     */

  }, {
    key: "onInteractiveReactStateUpdate_",
    value: function onInteractiveReactStateUpdate_(interactiveState) {
      var _this2 = this;

      var results = processResults(interactiveState, this.options_);
      this.rootEl_.classList.toggle(HAS_SCORE_CLASS, results.percentage != null);
      this.rootEl_.querySelector('.i-amphtml-story-interactive-results-top-value-number').textContent = (results.percentage || 0).toFixed(0);
      this.options_.forEach(function (e) {
        if (e.resultscategory === results.category) {
          _this2.mutateElement(function () {
            _this2.updateCategory_(e);

            _this2.updateToPostSelectionState_(null);
          });
        }
      });
    }
    /**
     * Updates the element with the correct category
     * @param {./amp-story-interactive-abstract.OptionConfigType} categorySelected
     * @private
     */

  }, {
    key: "updateCategory_",
    value: function updateCategory_(categorySelected) {
      this.rootEl_.classList.toggle(HAS_IMAGE_CLASS, categorySelected.image != null);

      if (categorySelected.image) {
        setStyle(this.rootEl_.querySelector('.i-amphtml-story-interactive-results-image'), 'background', 'url(' + categorySelected.image + ')');
      }

      this.rootEl_.querySelector('.i-amphtml-story-interactive-results-title').textContent = categorySelected.resultscategory;
      this.rootEl_.querySelector('.i-amphtml-story-interactive-results-description').textContent = categorySelected.text || '';
      this.rootEl_.classList.toggle('i-amphtml-story-interactive-results-top-transparent', this.scoreBackgroundIsTransparent_());
    }
    /** @override */

  }, {
    key: "handleTap_",
    value: function handleTap_(unusedEvent) {// Disallow click handler since there are no options.
    }
    /** @override */

  }, {
    key: "displayOptionsData",
    value: function displayOptionsData(unusedOptionsData) {// TODO(mszylkowski): Show percentages of categories if endpoint.
    }
    /** @override */

  }, {
    key: "updateStoryStoreState_",
    value: function updateStoryStoreState_(unusedOption) {// Prevent from updating the state.
    }
    /**
     * Check score background has a color with alpha 0, used to adjust layout
     * @return {boolean}
     * @private
     **/

  }, {
    key: "scoreBackgroundIsTransparent_",
    value: function scoreBackgroundIsTransparent_() {
      var bgColor = computedStyle(this.win, dev().assertElement(this.rootEl_.querySelector('.i-amphtml-story-interactive-results-top')))['background'];

      // Check the background starts with rgba and doesn't contain other colors (no gradients)
      if (bgColor.startsWith('rgba') && bgColor.lastIndexOf('rgb') == 0) {
        // If single rgba color, return alpha == 0
        return parseFloat(bgColor.split(', ')[3].split(')')[0]) == 0;
      }

      return false;
    }
  }]);

  return AmpStoryInteractiveResults;
}(AmpStoryInteractive);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1pbnRlcmFjdGl2ZS1yZXN1bHRzLmpzIl0sIm5hbWVzIjpbIkFtcFN0b3J5SW50ZXJhY3RpdmUiLCJJbnRlcmFjdGl2ZVR5cGUiLCJDU1MiLCJTdGF0ZVByb3BlcnR5IiwiY29tcHV0ZWRTdHlsZSIsInNldFN0eWxlIiwiZGV2IiwiaHRtbEZvciIsIkludGVyYWN0aXZlUmVzdWx0c0RlZiIsImJ1aWxkUmVzdWx0c1RlbXBsYXRlIiwiZWxlbWVudCIsImh0bWwiLCJIQVNfSU1BR0VfQ0xBU1MiLCJIQVNfU0NPUkVfQ0xBU1MiLCJwcm9jZXNzUmVzdWx0cyIsImludGVyYWN0aXZlU3RhdGUiLCJvcHRpb25zIiwicHJvY2Vzc1N0cmF0ZWd5IiwiZGVjaWRlU3RyYXRlZ3kiLCJwcm9jZXNzUmVzdWx0c0NhdGVnb3J5IiwicHJvY2Vzc1Jlc3VsdHNQZXJjZW50YWdlIiwicmVzdWx0IiwiY2F0ZWdvcnkiLCJwZXJjZW50YWdlIiwiY2F0ZWdvcmllcyIsImZvckVhY2giLCJvcHRpb24iLCJyZXN1bHRzY2F0ZWdvcnkiLCJPYmplY3QiLCJ2YWx1ZXMiLCJlIiwidHlwZSIsIlBPTEwiLCJrZXlzIiwicmVkdWNlIiwiYSIsImIiLCJxdWl6Q291bnQiLCJxdWl6Q29ycmVjdCIsIlFVSVoiLCJjb3JyZWN0IiwibWluVGhyZXNob2xkRGlmZiIsImN1cnJUaHJlc2hvbGREaWZmIiwicGFyc2VGbG9hdCIsInJlc3VsdHN0aHJlc2hvbGQiLCJzb21lIiwibyIsInVuZGVmaW5lZCIsIkFtcFN0b3J5SW50ZXJhY3RpdmVSZXN1bHRzIiwiUkVTVUxUUyIsInJvb3RFbF8iLCJoYXNBdHRyaWJ1dGUiLCJxdWVyeVNlbGVjdG9yIiwidGV4dENvbnRlbnQiLCJnZXRBdHRyaWJ1dGUiLCJzdG9yZVNlcnZpY2VfIiwic3Vic2NyaWJlIiwiSU5URVJBQ1RJVkVfUkVBQ1RfU1RBVEUiLCJkYXRhIiwib25JbnRlcmFjdGl2ZVJlYWN0U3RhdGVVcGRhdGVfIiwicmVzdWx0cyIsIm9wdGlvbnNfIiwiY2xhc3NMaXN0IiwidG9nZ2xlIiwidG9GaXhlZCIsIm11dGF0ZUVsZW1lbnQiLCJ1cGRhdGVDYXRlZ29yeV8iLCJ1cGRhdGVUb1Bvc3RTZWxlY3Rpb25TdGF0ZV8iLCJjYXRlZ29yeVNlbGVjdGVkIiwiaW1hZ2UiLCJ0ZXh0Iiwic2NvcmVCYWNrZ3JvdW5kSXNUcmFuc3BhcmVudF8iLCJ1bnVzZWRFdmVudCIsInVudXNlZE9wdGlvbnNEYXRhIiwidW51c2VkT3B0aW9uIiwiYmdDb2xvciIsIndpbiIsImFzc2VydEVsZW1lbnQiLCJzdGFydHNXaXRoIiwibGFzdEluZGV4T2YiLCJzcGxpdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQ0VBLG1CQURGLEVBRUVDLGVBRkY7QUFJQSxTQUFRQyxHQUFSO0FBQ0EsU0FBUUMsYUFBUjtBQUNBLFNBQVFDLGFBQVIsRUFBdUJDLFFBQXZCO0FBQ0EsU0FBUUMsR0FBUjtBQUNBLFNBQVFDLE9BQVI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFJQyxxQkFBSjs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQyxvQkFBb0IsR0FBRyxTQUF2QkEsb0JBQXVCLENBQUNDLE9BQUQsRUFBYTtBQUN4QyxNQUFNQyxJQUFJLEdBQUdKLE9BQU8sQ0FBQ0csT0FBRCxDQUFwQjtBQUNBLFNBQU9DLElBQVA7QUFrQkQsQ0FwQkQ7O0FBc0JBLElBQU1DLGVBQWUsR0FBRyx1Q0FBeEI7QUFDQSxJQUFNQyxlQUFlLEdBQUcsdUNBQXhCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1DLGNBQWMsR0FBRyxTQUFqQkEsY0FBaUIsQ0FBQ0MsZ0JBQUQsRUFBbUJDLE9BQW5CLEVBQStCO0FBQ3BELE1BQU1D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O0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBeEdBO0FBQUE7QUFBQSxXQXlHRSx5Q0FBZ0M7QUFDOUIsVUFBTUMsT0FBTyxHQUFHdkUsYUFBYSxDQUMzQixLQUFLd0UsR0FEc0IsRUFFM0J0RSxHQUFHLEdBQUd1RSxhQUFOLENBQ0UsS0FBSzNCLE9BQUwsQ0FBYUUsYUFBYixDQUEyQiwwQ0FBM0IsQ0FERixDQUYyQixDQUFiLENBS2QsWUFMYyxDQUFoQjs7QUFNQTtBQUNBLFVBQUl1QixPQUFPLENBQUNHLFVBQVIsQ0FBbUIsTUFBbkIsS0FBOEJILE9BQU8sQ0FBQ0ksV0FBUixDQUFvQixLQUFwQixLQUE4QixDQUFoRSxFQUFtRTtBQUNqRTtBQUNBLGVBQU9wQyxVQUFVLENBQUNnQyxPQUFPLENBQUNLLEtBQVIsQ0FBYyxJQUFkLEVBQW9CLENBQXBCLEVBQXVCQSxLQUF2QixDQUE2QixHQUE3QixFQUFrQyxDQUFsQyxDQUFELENBQVYsSUFBb0QsQ0FBM0Q7QUFDRDs7QUFDRCxhQUFPLEtBQVA7QUFDRDtBQXRISDs7QUFBQTtBQUFBLEVBQWdEaEYsbUJBQWhEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAyMCBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7XG4gIEFtcFN0b3J5SW50ZXJhY3RpdmUsXG4gIEludGVyYWN0aXZlVHlwZSxcbn0gZnJvbSAnLi9hbXAtc3RvcnktaW50ZXJhY3RpdmUtYWJzdHJhY3QnO1xuaW1wb3J0IHtDU1N9IGZyb20gJy4uLy4uLy4uL2J1aWxkL2FtcC1zdG9yeS1pbnRlcmFjdGl2ZS1yZXN1bHRzLTAuMS5jc3MnO1xuaW1wb3J0IHtTdGF0ZVByb3BlcnR5fSBmcm9tICcuLi8uLi9hbXAtc3RvcnkvMS4wL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlJztcbmltcG9ydCB7Y29tcHV0ZWRTdHlsZSwgc2V0U3R5bGV9IGZyb20gJyNjb3JlL2RvbS9zdHlsZSc7XG5pbXBvcnQge2Rldn0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge2h0bWxGb3J9IGZyb20gJyNjb3JlL2RvbS9zdGF0aWMtdGVtcGxhdGUnO1xuXG4vKipcbiAqIEB0eXBlZGVmIHt7XG4gKiAgICBjYXRlZ29yeTogP3N0cmluZyxcbiAqICAgIHBlcmNlbnRhZ2U6ID9udW1iZXIsXG4gKiB9fVxuICovXG5leHBvcnQgbGV0IEludGVyYWN0aXZlUmVzdWx0c0RlZjtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgdGhlIHRlbXBsYXRlIGZvciB0aGUgcXVpei5cbiAqXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJuIHshRWxlbWVudH1cbiAqL1xuY29uc3QgYnVpbGRSZXN1bHRzVGVtcGxhdGUgPSAoZWxlbWVudCkgPT4ge1xuICBjb25zdCBodG1sID0gaHRtbEZvcihlbGVtZW50KTtcbiAgcmV0dXJuIGh0bWxgXG4gICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1yZXN1bHRzLWNvbnRhaW5lclwiPlxuICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1yZXN1bHRzLXRvcFwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLXJlc3VsdHMtdG9wLXNjb3JlXCI+U0NPUkU6PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtcmVzdWx0cy10b3AtdmFsdWVcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1yZXN1bHRzLXRvcC12YWx1ZS1udW1iZXJcIlxuICAgICAgICAgICAgPjEwMDwvc3BhblxuICAgICAgICAgID48c3Bhbj4lPC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1yZXN1bHRzLWltYWdlLWJvcmRlclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLXJlc3VsdHMtaW1hZ2VcIj48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1yZXN1bHRzLXByb21wdFwiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1yZXN1bHRzLXRpdGxlXCI+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLXJlc3VsdHMtZGVzY3JpcHRpb25cIj48L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcbn07XG5cbmNvbnN0IEhBU19JTUFHRV9DTEFTUyA9ICdpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtaGFzLWltYWdlJztcbmNvbnN0IEhBU19TQ09SRV9DTEFTUyA9ICdpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtaGFzLXNjb3JlJztcblxuLyoqXG4gKiBQcm9jZXNzZXMgdGhlIHN0YXRlIGFuZCByZXR1cm5zIHRoZSBjb25kZW5zZWQgcmVzdWx0cy5cbiAqIEBwYXJhbSB7IU1hcDxzdHJpbmcsIHtvcHRpb246ID8uL2FtcC1zdG9yeS1pbnRlcmFjdGl2ZS1hYnN0cmFjdC5PcHRpb25Db25maWdUeXBlLCBpbnRlcmFjdGl2ZUlkOiBzdHJpbmd9Pn0gaW50ZXJhY3RpdmVTdGF0ZVxuICogQHBhcmFtIHs/QXJyYXk8IS4vYW1wLXN0b3J5LWludGVyYWN0aXZlLWFic3RyYWN0Lk9wdGlvbkNvbmZpZ1R5cGU+fSBvcHRpb25zIG5lZWRlZCB0byBlbnN1cmUgdGhlIGZpcnN0IG9wdGlvbnMgdGFrZSBwcmVjZWRlbmNlIG9uIHRpZXNcbiAqIEByZXR1cm4ge0ludGVyYWN0aXZlUmVzdWx0c0RlZn0gdGhlIHJlc3VsdHNcbiAqL1xuY29uc3QgcHJvY2Vzc1Jlc3VsdHMgPSAoaW50ZXJhY3RpdmVTdGF0ZSwgb3B0aW9ucykgPT4ge1xuICBjb25zdCBwcm9jZXNzU3RyYXRlZ3kgPVxuICAgIGRlY2lkZVN0cmF0ZWd5KG9wdGlvbnMpID09PSAnY2F0ZWdvcnknXG4gICAgICA/IHByb2Nlc3NSZXN1bHRzQ2F0ZWdvcnlcbiAgICAgIDogcHJvY2Vzc1Jlc3VsdHNQZXJjZW50YWdlO1xuICByZXR1cm4gcHJvY2Vzc1N0cmF0ZWd5KGludGVyYWN0aXZlU3RhdGUsIG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBQcm9jZXNzZXMgdGhlIHN0YXRlIGFuZCByZXR1cm5zIHRoZSBjb25kZW5zZWQgcmVzdWx0cyBmb3IgYSBjYXRlZ29yeSBzdHJhdGVneVxuICogQHBhcmFtIHshTWFwPHN0cmluZywge29wdGlvbjogPy4vYW1wLXN0b3J5LWludGVyYWN0aXZlLWFic3RyYWN0Lk9wdGlvbkNvbmZpZ1R5cGUsIGludGVyYWN0aXZlSWQ6IHN0cmluZ30+fSBpbnRlcmFjdGl2ZVN0YXRlXG4gKiBAcGFyYW0gez9BcnJheTwhLi9hbXAtc3RvcnktaW50ZXJhY3RpdmUtYWJzdHJhY3QuT3B0aW9uQ29uZmlnVHlwZT59IG9wdGlvbnMgdGhlIGF0dHJpYnV0ZXMgb24gdGhlIGNvbXBvbmVudFxuICogQHJldHVybiB7SW50ZXJhY3RpdmVSZXN1bHRzRGVmfSB0aGUgcmVzdWx0c1xuICogQHBhY2thZ2VcbiAqL1xuZXhwb3J0IGNvbnN0IHByb2Nlc3NSZXN1bHRzQ2F0ZWdvcnkgPSAoaW50ZXJhY3RpdmVTdGF0ZSwgb3B0aW9ucykgPT4ge1xuICBjb25zdCByZXN1bHQgPSB7Y2F0ZWdvcnk6IG51bGwsIHBlcmNlbnRhZ2U6IG51bGx9O1xuXG4gIC8vIEFkZCBhbGwgY2F0ZWdvcmllcyBpbiBvcmRlciB0byB0aGUgbWFwIHdpdGggdmFsdWUgMFxuICBjb25zdCBjYXRlZ29yaWVzID0ge307XG4gIG9wdGlvbnMuZm9yRWFjaCgob3B0aW9uKSA9PiB7XG4gICAgaWYgKG9wdGlvbi5yZXN1bHRzY2F0ZWdvcnkpIHtcbiAgICAgIGNhdGVnb3JpZXNbb3B0aW9uLnJlc3VsdHNjYXRlZ29yeV0gPSAwO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gVm90ZSBmb3IgY2F0ZWdvcnkgZm9yIGVhY2ggYW5zd2VyZWQgcG9sbFxuICBPYmplY3QudmFsdWVzKGludGVyYWN0aXZlU3RhdGUpLmZvckVhY2goKGUpID0+IHtcbiAgICBpZiAoZS50eXBlID09IEludGVyYWN0aXZlVHlwZS5QT0xMKSB7XG4gICAgICBpZiAoXG4gICAgICAgIGUub3B0aW9uICYmXG4gICAgICAgIGUub3B0aW9uLnJlc3VsdHNjYXRlZ29yeSAmJlxuICAgICAgICBjYXRlZ29yaWVzW2Uub3B0aW9uLnJlc3VsdHNjYXRlZ29yeV0gIT0gbnVsbFxuICAgICAgKSB7XG4gICAgICAgIGNhdGVnb3JpZXNbZS5vcHRpb24ucmVzdWx0c2NhdGVnb3J5XSArPSAxO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgLy8gUmV0dXJucyBjYXRlZ29yeSB3aXRoIG1vc3Qgdm90ZXMsIGZpcnN0IG9uZXMgdGFrZSBwcmVjZWRlbmNlIGluIHRpZXNcbiAgcmVzdWx0LmNhdGVnb3J5ID0gT2JqZWN0LmtleXMoY2F0ZWdvcmllcykucmVkdWNlKChhLCBiKSA9PlxuICAgIGNhdGVnb3JpZXNbYV0gPj0gY2F0ZWdvcmllc1tiXSA/IGEgOiBiXG4gICk7XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFByb2Nlc3NlcyB0aGUgc3RhdGUgYW5kIHJldHVybnMgdGhlIGNvbmRlbnNlZCByZXN1bHRzIGZvciBhIHBlcmNlbnRhZ2Ugc3RyYXRlZ3lcbiAqIEBwYXJhbSB7IU1hcDxzdHJpbmcsIHtvcHRpb246ID8uL2FtcC1zdG9yeS1pbnRlcmFjdGl2ZS1hYnN0cmFjdC5PcHRpb25Db25maWdUeXBlLCBpbnRlcmFjdGl2ZUlkOiBzdHJpbmd9Pn0gaW50ZXJhY3RpdmVTdGF0ZVxuICogQHBhcmFtIHs/QXJyYXk8IS4vYW1wLXN0b3J5LWludGVyYWN0aXZlLWFic3RyYWN0Lk9wdGlvbkNvbmZpZ1R5cGU+fSBvcHRpb25zIHRoZSBhdHRyaWJ1dGVzIG9uIHRoZSBjb21wb25lbnRcbiAqIEByZXR1cm4ge0ludGVyYWN0aXZlUmVzdWx0c0RlZn0gdGhlIHJlc3VsdHNcbiAqIEBwYWNrYWdlXG4gKi9cbmV4cG9ydCBjb25zdCBwcm9jZXNzUmVzdWx0c1BlcmNlbnRhZ2UgPSAoaW50ZXJhY3RpdmVTdGF0ZSwgb3B0aW9ucykgPT4ge1xuICBjb25zdCByZXN1bHQgPSB7Y2F0ZWdvcnk6IG51bGwsIHBlcmNlbnRhZ2U6IG51bGx9O1xuXG4gIC8vIENvdW50IHF1aXp6ZXMgYW5kIGNvcnJlY3QgcXVpenplc1xuICBsZXQgcXVpekNvdW50ID0gMDtcbiAgbGV0IHF1aXpDb3JyZWN0ID0gMDtcbiAgT2JqZWN0LnZhbHVlcyhpbnRlcmFjdGl2ZVN0YXRlKS5mb3JFYWNoKChlKSA9PiB7XG4gICAgaWYgKGUudHlwZSA9PSBJbnRlcmFjdGl2ZVR5cGUuUVVJWikge1xuICAgICAgcXVpekNvdW50ICs9IDE7XG4gICAgICBpZiAoZS5vcHRpb24gJiYgZS5vcHRpb24uY29ycmVjdCAhPSBudWxsKSB7XG4gICAgICAgIHF1aXpDb3JyZWN0ICs9IDE7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICAvLyBQZXJjZW50YWdlID0gKGNvcnJlY3QgLyB0b3RhbCkgYnV0IGF2b2lkIGRpdmlkZSBieSAwIGVycm9yXG4gIHJlc3VsdC5wZXJjZW50YWdlID0gcXVpekNvdW50ID09IDAgPyAwIDogMTAwICogKHF1aXpDb3JyZWN0IC8gcXVpekNvdW50KTtcblxuICAvLyBHZXQgY2xvc2VzdCB0aHJlc2hvbGQgdGhhdCBpcyBsb3dlciB0aGFuIHBlcmNlbnRhZ2UsIG9yIGxvd2VzdCBvbmUgaWYgcGVyY2VudGFnZSBpcyB0b28gbG93XG4gIGxldCBtaW5UaHJlc2hvbGREaWZmID0gLTEwMDtcbiAgb3B0aW9ucy5mb3JFYWNoKChvcHRpb24pID0+IHtcbiAgICAvLyBUaHJlc2hvbGREaWZmIGlzIHBvc2l0aXZlIGlmIGl0J3MgbG93ZXIgdGhhbiBwZXJjZW50YWdlIChkZXNpcmVkKVxuICAgIGNvbnN0IGN1cnJUaHJlc2hvbGREaWZmID1cbiAgICAgIHJlc3VsdC5wZXJjZW50YWdlIC0gcGFyc2VGbG9hdChvcHRpb24ucmVzdWx0c3RocmVzaG9sZCk7XG4gICAgaWYgKFxuICAgICAgLy8gQ3VyciBtZWV0cyB0aGUgcmVxdWlyZW1lbnQgYW5kIChpcyBiZXR0ZXIgb3IgbWluIGRvZXNudCBtZWV0KVxuICAgICAgKGN1cnJUaHJlc2hvbGREaWZmID49IDAgJiZcbiAgICAgICAgKG1pblRocmVzaG9sZERpZmYgPiBjdXJyVGhyZXNob2xkRGlmZiB8fCBtaW5UaHJlc2hvbGREaWZmIDwgMCkpIHx8XG4gICAgICAvLyBDdXJyIGRvZXNudCBtZWV0IHRoZSByZXF1aXJlbWVudCwgYnV0IG1pbiBhbHNvIGRvZXNudCBhbmQgY3VyciBpcyBiZXR0ZXIgdGhhbiBtaW5cbiAgICAgIChjdXJyVGhyZXNob2xkRGlmZiA8IDAgJiZcbiAgICAgICAgbWluVGhyZXNob2xkRGlmZiA8IDAgJiZcbiAgICAgICAgY3VyclRocmVzaG9sZERpZmYgPiBtaW5UaHJlc2hvbGREaWZmKVxuICAgICkge1xuICAgICAgcmVzdWx0LmNhdGVnb3J5ID0gb3B0aW9uLnJlc3VsdHNjYXRlZ29yeTtcbiAgICAgIG1pblRocmVzaG9sZERpZmYgPSBjdXJyVGhyZXNob2xkRGlmZjtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBEZWNpZGVzIHdoYXQgc3RyYXRlZ3kgdG8gdXNlLlxuICogSWYgdGhlcmUgYXJlIHRocmVzaG9sZHMgc3BlY2lmaWVkLCBpdCB1c2VzIHBlcmNlbnRhZ2U7IG90aGVyd2lzZSBpdCB1c2VzIGNhdGVnb3J5LlxuICogQHBhcmFtIHs/QXJyYXk8IS4vYW1wLXN0b3J5LWludGVyYWN0aXZlLWFic3RyYWN0Lk9wdGlvbkNvbmZpZ1R5cGU+fSBvcHRpb25zIHRoZSBhdHRyaWJ1dGVzIG9uIHRoZSBjb21wb25lbnRcbiAqIEByZXR1cm4ge3N0cmluZ30gdGhlIHN0cmF0ZWd5XG4gKiBAcGFja2FnZVxuICovXG5leHBvcnQgY29uc3QgZGVjaWRlU3RyYXRlZ3kgPSAob3B0aW9ucykgPT4ge1xuICByZXR1cm4gb3B0aW9ucy5zb21lKChvKSA9PiB7XG4gICAgcmV0dXJuIG8ucmVzdWx0c3RocmVzaG9sZCAhPSB1bmRlZmluZWQ7XG4gIH0pXG4gICAgPyAncGVyY2VudGFnZSdcbiAgICA6ICdjYXRlZ29yeSc7XG59O1xuXG5leHBvcnQgY2xhc3MgQW1wU3RvcnlJbnRlcmFjdGl2ZVJlc3VsdHMgZXh0ZW5kcyBBbXBTdG9yeUludGVyYWN0aXZlIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IGVsZW1lbnRcbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICBzdXBlcihlbGVtZW50LCBJbnRlcmFjdGl2ZVR5cGUuUkVTVUxUUywgWzIsIDRdKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgYnVpbGRDYWxsYmFjaygpIHtcbiAgICByZXR1cm4gc3VwZXIuYnVpbGRDYWxsYmFjayhDU1MpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBidWlsZENvbXBvbmVudCgpIHtcbiAgICB0aGlzLnJvb3RFbF8gPSBidWlsZFJlc3VsdHNUZW1wbGF0ZSh0aGlzLmVsZW1lbnQpO1xuICAgIHJldHVybiB0aGlzLnJvb3RFbF87XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGxheW91dENhbGxiYWNrKCkge1xuICAgIGlmICh0aGlzLmVsZW1lbnQuaGFzQXR0cmlidXRlKCdwcm9tcHQtdGV4dCcpKSB7XG4gICAgICB0aGlzLnJvb3RFbF8ucXVlcnlTZWxlY3RvcihcbiAgICAgICAgJy5pLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtcmVzdWx0cy1wcm9tcHQnXG4gICAgICApLnRleHRDb250ZW50ID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgncHJvbXB0LXRleHQnKTtcbiAgICB9XG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShcbiAgICAgIFN0YXRlUHJvcGVydHkuSU5URVJBQ1RJVkVfUkVBQ1RfU1RBVEUsXG4gICAgICAoZGF0YSkgPT4gdGhpcy5vbkludGVyYWN0aXZlUmVhY3RTdGF0ZVVwZGF0ZV8oZGF0YSksXG4gICAgICB0cnVlXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWNlaXZlcyBzdGF0ZSB1cGRhdGVzIGFuZCBmaWxscyB1cCBET00gd2l0aCB0aGUgcmVzdWx0XG4gICAqIEBwYXJhbSB7IU1hcDxzdHJpbmcsIHtvcHRpb246ID8uL2FtcC1zdG9yeS1pbnRlcmFjdGl2ZS1hYnN0cmFjdC5PcHRpb25Db25maWdUeXBlLCBpbnRlcmFjdGl2ZUlkOiBzdHJpbmd9Pn0gaW50ZXJhY3RpdmVTdGF0ZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25JbnRlcmFjdGl2ZVJlYWN0U3RhdGVVcGRhdGVfKGludGVyYWN0aXZlU3RhdGUpIHtcbiAgICBjb25zdCByZXN1bHRzID0gcHJvY2Vzc1Jlc3VsdHMoaW50ZXJhY3RpdmVTdGF0ZSwgdGhpcy5vcHRpb25zXyk7XG4gICAgdGhpcy5yb290RWxfLmNsYXNzTGlzdC50b2dnbGUoSEFTX1NDT1JFX0NMQVNTLCByZXN1bHRzLnBlcmNlbnRhZ2UgIT0gbnVsbCk7XG4gICAgdGhpcy5yb290RWxfLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAnLmktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1yZXN1bHRzLXRvcC12YWx1ZS1udW1iZXInXG4gICAgKS50ZXh0Q29udGVudCA9IChyZXN1bHRzLnBlcmNlbnRhZ2UgfHwgMCkudG9GaXhlZCgwKTtcbiAgICB0aGlzLm9wdGlvbnNfLmZvckVhY2goKGUpID0+IHtcbiAgICAgIGlmIChlLnJlc3VsdHNjYXRlZ29yeSA9PT0gcmVzdWx0cy5jYXRlZ29yeSkge1xuICAgICAgICB0aGlzLm11dGF0ZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMudXBkYXRlQ2F0ZWdvcnlfKGUpO1xuICAgICAgICAgIHRoaXMudXBkYXRlVG9Qb3N0U2VsZWN0aW9uU3RhdGVfKG51bGwpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBlbGVtZW50IHdpdGggdGhlIGNvcnJlY3QgY2F0ZWdvcnlcbiAgICogQHBhcmFtIHsuL2FtcC1zdG9yeS1pbnRlcmFjdGl2ZS1hYnN0cmFjdC5PcHRpb25Db25maWdUeXBlfSBjYXRlZ29yeVNlbGVjdGVkXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB1cGRhdGVDYXRlZ29yeV8oY2F0ZWdvcnlTZWxlY3RlZCkge1xuICAgIHRoaXMucm9vdEVsXy5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgSEFTX0lNQUdFX0NMQVNTLFxuICAgICAgY2F0ZWdvcnlTZWxlY3RlZC5pbWFnZSAhPSBudWxsXG4gICAgKTtcbiAgICBpZiAoY2F0ZWdvcnlTZWxlY3RlZC5pbWFnZSkge1xuICAgICAgc2V0U3R5bGUoXG4gICAgICAgIHRoaXMucm9vdEVsXy5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICcuaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLXJlc3VsdHMtaW1hZ2UnXG4gICAgICAgICksXG4gICAgICAgICdiYWNrZ3JvdW5kJyxcbiAgICAgICAgJ3VybCgnICsgY2F0ZWdvcnlTZWxlY3RlZC5pbWFnZSArICcpJ1xuICAgICAgKTtcbiAgICB9XG4gICAgdGhpcy5yb290RWxfLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAnLmktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1yZXN1bHRzLXRpdGxlJ1xuICAgICkudGV4dENvbnRlbnQgPSBjYXRlZ29yeVNlbGVjdGVkLnJlc3VsdHNjYXRlZ29yeTtcbiAgICB0aGlzLnJvb3RFbF8ucXVlcnlTZWxlY3RvcihcbiAgICAgICcuaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLXJlc3VsdHMtZGVzY3JpcHRpb24nXG4gICAgKS50ZXh0Q29udGVudCA9IGNhdGVnb3J5U2VsZWN0ZWQudGV4dCB8fCAnJztcbiAgICB0aGlzLnJvb3RFbF8uY2xhc3NMaXN0LnRvZ2dsZShcbiAgICAgICdpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtcmVzdWx0cy10b3AtdHJhbnNwYXJlbnQnLFxuICAgICAgdGhpcy5zY29yZUJhY2tncm91bmRJc1RyYW5zcGFyZW50XygpXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaGFuZGxlVGFwXyh1bnVzZWRFdmVudCkge1xuICAgIC8vIERpc2FsbG93IGNsaWNrIGhhbmRsZXIgc2luY2UgdGhlcmUgYXJlIG5vIG9wdGlvbnMuXG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGRpc3BsYXlPcHRpb25zRGF0YSh1bnVzZWRPcHRpb25zRGF0YSkge1xuICAgIC8vIFRPRE8obXN6eWxrb3dza2kpOiBTaG93IHBlcmNlbnRhZ2VzIG9mIGNhdGVnb3JpZXMgaWYgZW5kcG9pbnQuXG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHVwZGF0ZVN0b3J5U3RvcmVTdGF0ZV8odW51c2VkT3B0aW9uKSB7XG4gICAgLy8gUHJldmVudCBmcm9tIHVwZGF0aW5nIHRoZSBzdGF0ZS5cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBzY29yZSBiYWNrZ3JvdW5kIGhhcyBhIGNvbG9yIHdpdGggYWxwaGEgMCwgdXNlZCB0byBhZGp1c3QgbGF5b3V0XG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqIEBwcml2YXRlXG4gICAqKi9cbiAgc2NvcmVCYWNrZ3JvdW5kSXNUcmFuc3BhcmVudF8oKSB7XG4gICAgY29uc3QgYmdDb2xvciA9IGNvbXB1dGVkU3R5bGUoXG4gICAgICB0aGlzLndpbixcbiAgICAgIGRldigpLmFzc2VydEVsZW1lbnQoXG4gICAgICAgIHRoaXMucm9vdEVsXy5xdWVyeVNlbGVjdG9yKCcuaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLXJlc3VsdHMtdG9wJylcbiAgICAgIClcbiAgICApWydiYWNrZ3JvdW5kJ107XG4gICAgLy8gQ2hlY2sgdGhlIGJhY2tncm91bmQgc3RhcnRzIHdpdGggcmdiYSBhbmQgZG9lc24ndCBjb250YWluIG90aGVyIGNvbG9ycyAobm8gZ3JhZGllbnRzKVxuICAgIGlmIChiZ0NvbG9yLnN0YXJ0c1dpdGgoJ3JnYmEnKSAmJiBiZ0NvbG9yLmxhc3RJbmRleE9mKCdyZ2InKSA9PSAwKSB7XG4gICAgICAvLyBJZiBzaW5nbGUgcmdiYSBjb2xvciwgcmV0dXJuIGFscGhhID09IDBcbiAgICAgIHJldHVybiBwYXJzZUZsb2F0KGJnQ29sb3Iuc3BsaXQoJywgJylbM10uc3BsaXQoJyknKVswXSkgPT0gMDtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-story-interactive/0.1/amp-story-interactive-results.js