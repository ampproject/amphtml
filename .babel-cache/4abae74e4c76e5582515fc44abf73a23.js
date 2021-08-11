import { resolvedPromise as _resolvedPromise3 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise2 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

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
import { ANALYTICS_TAG_NAME, StoryAnalyticsEvent } from "../../amp-story/1.0/story-analytics";
import { clamp } from "../../../src/core/math";
import { Action, StateProperty } from "../../amp-story/1.0/amp-story-store-service";
import { AnalyticsVariable } from "../../amp-story/1.0/variable-service";
import { CSS } from "../../../build/amp-story-interactive-0.1.css";
import { Services } from "../../../src/service";
import { addParamsToUrl, appendPathToUrl, assertAbsoluteHttpOrHttpsUrl } from "../../../src/url";
import { base64UrlEncodeFromString } from "../../../src/core/types/string/base64";
import { assertDoesNotContainDisplay } from "../../../src/assert-display";
import { buildInteractiveDisclaimer, buildInteractiveDisclaimerIcon } from "./interactive-disclaimer";
import { closest } from "../../../src/core/dom/query";
import { createShadowRootWithStyle, maybeMakeProxyUrl } from "../../amp-story/1.0/utils";
import { deduplicateInteractiveIds } from "./utils";
import { dev, devAssert } from "../../../src/log";
import { dict } from "../../../src/core/types/object";
import { emojiConfetti } from "./interactive-confetti";
import { toArray } from "../../../src/core/types/array";
import { setImportantStyles } from "../../../src/core/dom/style";
import { isExperimentOn } from "../../../src/experiments";

/** @const {string} */
var TAG = 'amp-story-interactive';

/** @const {string} */
export var MID_SELECTION_CLASS = 'i-amphtml-story-interactive-mid-selection';

/** @const {string} */
export var POST_SELECTION_CLASS = 'i-amphtml-story-interactive-post-selection';

/**
 * @const @enum {number}
 */
export var InteractiveType = {
  QUIZ: 0,
  POLL: 1,
  RESULTS: 2,
  SLIDER: 3
};

/** @const {string} */
var ENDPOINT_INVALID_ERROR = 'The publisher has specified an invalid datastore endpoint';

/** @const {string} */
var INTERACTIVE_ACTIVE_CLASS = 'i-amphtml-story-interactive-active';

/**
 * @typedef {{
 *    index: number,
 *    count: number,
 *    selected: boolean,
 * }}
 */
export var InteractiveOptionType;

/**
 * @typedef {{
 *    options: !Array<InteractiveOptionType>,
 * }}
 */
export var InteractiveResponseType;

/**
 * @typedef {{
 *    optionIndex: number,
 *    text: string,
 *    correct: ?string,
 *    resultscategory: ?string,
 *    image: ?string,
 *    confetti: ?string,
 *    resultsthreshold: ?string,
 * }}
 */
export var OptionConfigType;

/** @const {Array<Object>} fontFaces with urls from https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&amp;display=swap */
var fontsToLoad = [{
  family: 'Poppins',
  weight: '400',
  src: "url(https://fonts.gstatic.com/s/poppins/v9/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2) format('woff2')"
}, {
  family: 'Poppins',
  weight: '700',
  src: "url(https://fonts.gstatic.com/s/poppins/v9/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.woff2) format('woff2')"
}];

/**
 * Interactive abstract class with shared functionality for interactive components.
 *
 * Lifecycle:
 * 1) When created, the abstract class will call the buildComponent() method implemented by each concrete class.
 *   NOTE: When created, the component will receive a .i-amphtml-story-interactive-component, inheriting useful CSS variables.
 *
 * 2) If an endpoint is specified, it will retrieve aggregate results from the backend and process them. If the clientId
 *   has responded in a previous session, the component will change to a post-selection state. Otherwise it will wait
 *   for user selection.
 *   NOTE: Click listeners will be attached to all options, which require .i-amphtml-story-interactive-option.
 *
 * 3) On user selection, it will process the backend results (if endpoint specified) and display the selected option.
 *   Analytic events will be sent, percentages updated (implemented by the concrete class), and backend posted with the
 *   user response. Classes will be added to the component and options accordingly.
 *   NOTE: On option selected, the selection will receive a .i-amphtml-story-interactive-option-selected, and the root element
 *   will receive a .i-amphtml-story-interactive-post-selection. Optionally, if the endpoint returned aggregate results,
 *   the root element will also receive a .i-amphtml-story-interactive-has-data.
 *
 * @abstract
 */
export var AmpStoryInteractive = /*#__PURE__*/function (_AMP$BaseElement) {
  _inherits(AmpStoryInteractive, _AMP$BaseElement);

  var _super = _createSuper(AmpStoryInteractive);

  /**
   * @param {!AmpElement} element
   * @param {!InteractiveType} type
   * @param {!Array<number>} bounds the bounds on number of options, inclusive
   */
  function AmpStoryInteractive(element, type, bounds) {
    var _this;

    if (bounds === void 0) {
      bounds = [2, 4];
    }

    _classCallCheck(this, AmpStoryInteractive);

    _this = _super.call(this, element);

    /** @protected @const {InteractiveType} */
    _this.interactiveType_ = type;

    /** @protected {?../../amp-story/1.0/story-analytics.StoryAnalyticsService} */
    _this.analyticsService_ = null;

    /** @protected {?Promise<?InteractiveResponseType|?JsonObject|undefined>} */
    _this.backendDataPromise_ = null;

    /** @protected {?Promise<JsonObject>} */
    _this.clientIdPromise_ = null;

    /** @private {?Element} the disclaimer dialog if open, null if closed */
    _this.disclaimerEl_ = null;

    /** @private {?Element} */
    _this.disclaimerIcon_ = null;

    /** @protected {boolean} */
    _this.hasUserSelection_ = false;

    /** @private {!Array<number>} min and max number of options, inclusive */
    _this.optionBounds_ = bounds;

    /** @private {?Array<!Element>} DOM elements that have the i-amphtml-story-interactive-option class */
    _this.optionElements_ = null;

    /** @protected {?Array<!OptionConfigType>} option config values from attributes (text, correct...) */
    _this.options_ = null;

    /** @protected {?Array<!InteractiveOptionType>} retrieved results from the backend */
    _this.optionsData_ = null;

    /** @private {?Element} the page element the component is on */
    _this.pageEl_ = null;

    /** @protected {?Element} */
    _this.rootEl_ = null;

    /** @public {../../../src/service/localizationService} */
    _this.localizationService = null;

    /** @protected {?../../amp-story/1.0/amp-story-request-service.AmpStoryRequestService} */
    _this.requestService_ = null;

    /** @protected {?../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    _this.storeService_ = null;

    /** @protected {?../../../src/service/url-impl.Url} */
    _this.urlService_ = null;

    /** @protected {?../../amp-story/1.0/variable-service.AmpStoryVariableService} */
    _this.variableService_ = null;
    return _this;
  }

  /**
   * Gets the root element.
   * @visibleForTesting
   * @return {?Element}
   */
  _createClass(AmpStoryInteractive, [{
    key: "getRootElement",
    value: function getRootElement() {
      return this.rootEl_;
    }
    /**
     * Gets the options.
     * @protected
     * @return {!Array<!Element>}
     */

  }, {
    key: "getOptionElements",
    value: function getOptionElements() {
      if (!this.optionElements_) {
        this.optionElements_ = toArray(this.rootEl_.querySelectorAll('.i-amphtml-story-interactive-option'));
      }

      return this.optionElements_;
    }
    /**
     * Gets the interactive ID
     * @private
     * @return {string}
     */

  }, {
    key: "getInteractiveId_",
    value: function getInteractiveId_() {
      if (!AmpStoryInteractive.canonicalUrl64) {
        deduplicateInteractiveIds(this.win.document);
        AmpStoryInteractive.canonicalUrl64 = base64UrlEncodeFromString(Services.documentInfoForDoc(this.element).canonicalUrl);
      }

      return AmpStoryInteractive.canonicalUrl64 + "+" + this.element.id;
    }
    /**
     * @protected
     * @return {Element} the page element
     */

  }, {
    key: "getPageEl",
    value: function getPageEl() {
      if (this.pageEl_ == null) {
        this.pageEl_ = closest(dev().assertElement(this.element), function (el) {
          return el.tagName.toLowerCase() === 'amp-story-page';
        });
      }

      return this.pageEl_;
    }
    /** @override */

  }, {
    key: "buildCallback",
    value: function buildCallback(concreteCSS) {
      var _this2 = this;

      if (concreteCSS === void 0) {
        concreteCSS = '';
      }

      this.loadFonts_();
      this.options_ = this.parseOptions_();
      this.element.classList.add('i-amphtml-story-interactive-component');
      this.adjustGridLayer_();
      devAssert(this.element.children.length == 0, 'Too many children');
      // Initialize all the services before proceeding, and update store with state
      this.urlService_ = Services.urlForDoc(this.element);
      return Promise.all([Services.storyVariableServiceForOrNull(this.win).then(function (service) {
        _this2.variableService_ = service;
      }), Services.storyStoreServiceForOrNull(this.win).then(function (service) {
        _this2.storeService_ = service;

        _this2.updateStoryStoreState_(null);
      }), Services.storyRequestServiceForOrNull(this.win).then(function (service) {
        _this2.requestService_ = service;
      }), Services.storyAnalyticsServiceForOrNull(this.win).then(function (service) {
        _this2.analyticsService_ = service;
      }), Services.localizationServiceForOrNull(this.element).then(function (service) {
        _this2.localizationService = service;
      })]).then(function () {
        _this2.rootEl_ = _this2.buildComponent();

        _this2.rootEl_.classList.add('i-amphtml-story-interactive-container');

        if (isExperimentOn(_this2.win, 'amp-story-interactive-disclaimer') && _this2.element.hasAttribute('endpoint')) {
          _this2.disclaimerIcon_ = buildInteractiveDisclaimerIcon(_this2);

          _this2.rootEl_.prepend(_this2.disclaimerIcon_);
        }

        createShadowRootWithStyle(_this2.element, dev().assertElement(_this2.rootEl_), CSS + concreteCSS);
        return _resolvedPromise();
      });
    }
    /**
     * @private
     */

  }, {
    key: "loadFonts_",
    value: function loadFonts_() {
      var _this3 = this;

      if (!AmpStoryInteractive.loadedFonts && this.win.document.fonts && FontFace) {
        fontsToLoad.forEach(function (fontProperties) {
          var font = new FontFace(fontProperties.family, fontProperties.src, {
            weight: fontProperties.weight,
            style: 'normal'
          });
          font.load().then(function () {
            _this3.win.document.fonts.add(font);
          });
        });
      }

      AmpStoryInteractive.loadedFonts = true;
    }
    /**
     * Reads the element attributes prefixed with option- and returns them as a list.
     * eg: [
     *      {optionIndex: 0, text: 'Koala'},
     *      {optionIndex: 1, text: 'Developers', correct: ''}
     *    ]
     * @protected
     * @return {?Array<!OptionConfigType>}
     */

  }, {
    key: "parseOptions_",
    value: function parseOptions_() {
      var _this4 = this;

      var options = [];
      toArray(this.element.attributes).forEach(function (attr) {
        // Match 'option-#-type' (eg: option-1-text, option-2-image, option-3-correct...)
        if (attr.name.match(/^option-\d+(-\w+)+$/)) {
          var splitParts = attr.name.split('-');
          var optionNumber = parseInt(splitParts[1], 10);

          // Add all options in order on the array with correct index.
          while (options.length < optionNumber) {
            options.push({
              'optionIndex': options.length
            });
          }

          var key = splitParts.slice(2).join('');

          if (key === 'image') {
            options[optionNumber - 1][key] = maybeMakeProxyUrl(attr.value, _this4.getAmpDoc());
          } else {
            options[optionNumber - 1][key] = attr.value;
          }
        }
      });

      if (options.length >= this.optionBounds_[0] && options.length <= this.optionBounds_[1]) {
        return options;
      }

      devAssert(options.length >= this.optionBounds_[0] && options.length <= this.optionBounds_[1], "Improper number of options. Expected " + this.optionBounds_[0] + " <= options <= " + this.optionBounds_[1] + " but got " + options.length + ".");
      dev().error(TAG, "Improper number of options. Expected " + this.optionBounds_[0] + " <= options <= " + this.optionBounds_[1] + " but got " + options.length + ".");
    }
    /**
     * Finds the prompt and adds it to the prompt-container
     *
     * @protected
     * @param {Element} root
     */

  }, {
    key: "attachPrompt_",
    value: function attachPrompt_(root) {
      var promptContainer = root.querySelector('.i-amphtml-story-interactive-prompt-container');

      if (!this.element.hasAttribute('prompt-text')) {
        this.rootEl_.removeChild(promptContainer);
      } else {
        var prompt = document.createElement('p');
        prompt.textContent = this.element.getAttribute('prompt-text');
        prompt.classList.add('i-amphtml-story-interactive-prompt');
        promptContainer.appendChild(prompt);
      }
    }
    /**
     * Generates the template from the config_ Map.
     *
     * @return {!Element} rootEl_
     * @protected @abstract
     */

  }, {
    key: "buildComponent",
    value: function buildComponent() {// Subclass must override.
    }
    /** @override */

  }, {
    key: "layoutCallback",
    value: function layoutCallback() {
      this.initializeListeners_();
      return this.backendDataPromise_ = this.element.hasAttribute('endpoint') ? this.retrieveInteractiveData_() : _resolvedPromise2();
    }
    /**
     * Gets a Promise to return the unique AMP clientId
     * @private
     * @return {Promise<string>}
     */

  }, {
    key: "getClientId_",
    value: function getClientId_() {
      if (!this.clientIdPromise_) {
        this.clientIdPromise_ = Services.cidForDoc(this.element).then(function (data) {
          return data.get({
            scope: 'amp-story',
            createCookieIfNotPresent: true
          },
          /* consent */
          _resolvedPromise3());
        });
      }

      return this.clientIdPromise_;
    }
    /**
     * Reacts to RTL state updates and triggers the UI for RTL.
     * @param {boolean} rtlState
     * @private
     */

  }, {
    key: "onRtlStateUpdate_",
    value: function onRtlStateUpdate_(rtlState) {
      var _this5 = this;

      this.mutateElement(function () {
        rtlState ? _this5.rootEl_.setAttribute('dir', 'rtl') : _this5.rootEl_.removeAttribute('dir');
      });
    }
    /** @override */

  }, {
    key: "isLayoutSupported",
    value: function isLayoutSupported(layout) {
      return layout === 'container';
    }
    /**
     * Add classes to adjust the bottom padding on the grid-layer
     * to prevent overlap with the component.
     *
     * @private
     */

  }, {
    key: "adjustGridLayer_",
    value: function adjustGridLayer_() {
      var gridLayer = closest(dev().assertElement(this.element), function (el) {
        return el.tagName.toLowerCase() === 'amp-story-grid-layer';
      });
      gridLayer.classList.add('i-amphtml-story-has-interactive');

      if (gridLayer.parentElement.querySelector('amp-story-cta-layer')) {
        gridLayer.classList.add('i-amphtml-story-has-CTA-layer');
      }

      if (gridLayer.parentElement.querySelector('amp-story-page-attachment')) {
        gridLayer.classList.add('i-amphtml-story-has-page-attachment');
      }
    }
    /**
     * Attaches functions to each option to handle state transition.
     * @private
     */

  }, {
    key: "initializeListeners_",
    value: function initializeListeners_() {
      var _this6 = this;

      this.storeService_.subscribe(StateProperty.RTL_STATE, function (rtlState) {
        _this6.onRtlStateUpdate_(rtlState);
      }, true
      /** callToInitialize */
      );
      // Check if the component page is active, and add class.
      this.storeService_.subscribe(StateProperty.CURRENT_PAGE_ID, function (currPageId) {
        _this6.mutateElement(function () {
          var toggle = currPageId === _this6.getPageEl().getAttribute('id');

          _this6.rootEl_.classList.toggle(INTERACTIVE_ACTIVE_CLASS, toggle);

          _this6.toggleTabbableElements_(toggle);
        });

        _this6.closeDisclaimer_();
      }, true
      /** callToInitialize */
      );
      this.rootEl_.addEventListener('click', function (e) {
        return _this6.handleTap_(e);
      });
    }
    /**
     * Handles a tap event on the quiz element.
     * @param {Event} e
     * @protected
     */

  }, {
    key: "handleTap_",
    value: function handleTap_(e) {
      if (e.target == this.disclaimerIcon_ && !this.disclaimerEl_) {
        this.openDisclaimer_();
        return;
      }

      if (this.hasUserSelection_) {
        return;
      }

      var optionEl = closest(dev().assertElement(e.target), function (element) {
        return element.classList.contains('i-amphtml-story-interactive-option');
      }, this.rootEl_);

      if (optionEl) {
        this.updateStoryStoreState_(optionEl.optionIndex_);
        this.handleOptionSelection_(optionEl.optionIndex_, optionEl);
        var confettiEmoji = this.options_[optionEl.optionIndex_].confetti;

        if (confettiEmoji) {
          emojiConfetti(dev().assertElement(this.rootEl_), this.win, confettiEmoji);
        }

        this.closeDisclaimer_();
      }
    }
    /**
     * Triggers the analytics event for quiz response.
     *
     * @param {number} optionIndex
     * @private
     */

  }, {
    key: "triggerAnalytics_",
    value: function triggerAnalytics_(optionIndex) {
      this.variableService_.onVariableUpdate(AnalyticsVariable.STORY_INTERACTIVE_ID, this.element.getAttribute('id'));
      this.variableService_.onVariableUpdate(AnalyticsVariable.STORY_INTERACTIVE_RESPONSE, optionIndex);
      this.variableService_.onVariableUpdate(AnalyticsVariable.STORY_INTERACTIVE_TYPE, this.interactiveType_);
      this.element[ANALYTICS_TAG_NAME] = this.element.tagName;
      this.analyticsService_.triggerEvent(StoryAnalyticsEvent.INTERACTIVE, this.element);
    }
    /**
     * Update component to reflect values in the data obtained.
     * Called when user has responded (in this session or before).
     *
     * @protected @abstract
     * @param {!Array<!InteractiveOptionType>} unusedOptionsData
     */

  }, {
    key: "displayOptionsData",
    value: function displayOptionsData(unusedOptionsData) {// Subclass must implement
    }
    /**
     * Preprocess the percentages for display.
     *
     * @param {!Array<!InteractiveOptionType>} optionsData
     * @return {Array<number>}
     * @protected
     */

  }, {
    key: "preprocessPercentages_",
    value: function preprocessPercentages_(optionsData) {
      var totalResponseCount = optionsData.reduce(function (acc, response) {
        return acc + response['count'];
      }, 0);
      var percentages = optionsData.map(function (e) {
        return (100 * e['count'] / totalResponseCount).toFixed(2);
      });
      var total = percentages.reduce(function (acc, x) {
        return acc + Math.round(x);
      }, 0);

      // Special case: divide remainders by three if they break 100,
      // 3 is the maximum above 100 the remainders can add.
      if (total > 100) {
        percentages = percentages.map(function (percentage) {
          return (percentage - 2 * (percentage - Math.floor(percentage)) / 3).toFixed(2);
        });
        total = percentages.reduce(function (acc, x) {
          return acc += Math.round(x);
        }, 0);
      }

      if (total === 100) {
        return percentages.map(function (percentage) {
          return Math.round(percentage);
        });
      }

      // Truncate all and round up those with the highest remainders,
      // preserving order and ties and adding to 100 (if possible given ties and ordering).
      var remainder = 100 - total;
      var preserveOriginal = percentages.map(function (percentage, index) {
        return {
          originalIndex: index,
          value: percentage,
          remainder: (percentage - Math.floor(percentage)).toFixed(2)
        };
      });
      preserveOriginal.sort(function (left, right) {
        return (// Break remainder ties using the higher value.
          right.remainder - left.remainder || right.value - left.value
        );
      });
      var finalPercentages = [];

      var _loop = function _loop() {
        var highestRemainderObj = preserveOriginal[0];
        var ties = preserveOriginal.filter(function (percentageObj) {
          return percentageObj.value === highestRemainderObj.value;
        });
        preserveOriginal = preserveOriginal.filter(function (percentageObj) {
          return percentageObj.value !== highestRemainderObj.value;
        });
        var toRoundUp = ties.length <= remainder && highestRemainderObj.remainder !== '0.00';
        ties.forEach(function (percentageObj) {
          finalPercentages[percentageObj.originalIndex] = Math.floor(percentageObj.value) + (toRoundUp ? 1 : 0);
        });
        // Update the remainder given additions to the percentages.
        remainder -= toRoundUp ? ties.length : 0;
      };

      while (remainder > 0 && preserveOriginal.length !== 0) {
        _loop();
      }

      preserveOriginal.forEach(function (percentageObj) {
        finalPercentages[percentageObj.originalIndex] = Math.floor(percentageObj.value);
      });
      return finalPercentages;
    }
    /**
     * Triggers changes to component state on response interactive.
     *
     * @param {number} optionIndex
     * @param {?Element} optionEl
     * @private
     */

  }, {
    key: "handleOptionSelection_",
    value: function handleOptionSelection_(optionIndex, optionEl) {
      var _this7 = this;

      this.backendDataPromise_.then(function () {
        if (_this7.hasUserSelection_) {
          return;
        }

        _this7.triggerAnalytics_(optionIndex);

        _this7.hasUserSelection_ = true;

        if (_this7.optionsData_) {
          _this7.optionsData_[optionIndex]['count']++;
          _this7.optionsData_[optionIndex]['selected'] = true;
        }

        _this7.mutateElement(function () {
          _this7.updateToPostSelectionState_(optionEl);
        });

        if (_this7.element.hasAttribute('endpoint')) {
          _this7.executeInteractiveRequest_('POST', optionIndex);
        }
      }).catch(function () {
        // If backend is not properly connected, still update state.
        _this7.triggerAnalytics_(optionIndex);

        _this7.hasUserSelection_ = true;

        _this7.mutateElement(function () {
          _this7.updateToPostSelectionState_(optionEl);
        });
      });
    }
    /**
     * Get the Interactive data from the datastore
     *
     * @return {?Promise<?InteractiveResponseType|?JsonObject|undefined>}
     * @private
     */

  }, {
    key: "retrieveInteractiveData_",
    value: function retrieveInteractiveData_() {
      var _this8 = this;

      return this.executeInteractiveRequest_('GET').then(function (response) {
        _this8.onDataRetrieved_(
        /** @type {InteractiveResponseType} */
        response);
      });
    }
    /**
     * Executes a Interactive API call.
     *
     * @param {string} method GET or POST.
     * @param {number=} optionSelected
     * @return {!Promise<!InteractiveResponseType|string>}
     * @private
     */

  }, {
    key: "executeInteractiveRequest_",
    value: function executeInteractiveRequest_(method, optionSelected) {
      var _this9 = this;

      if (optionSelected === void 0) {
        optionSelected = undefined;
      }

      var url = this.element.getAttribute('endpoint');

      if (!assertAbsoluteHttpOrHttpsUrl(url)) {
        return Promise.reject(ENDPOINT_INVALID_ERROR);
      }

      return this.getClientId_().then(function (clientId) {
        var requestOptions = {
          'method': method
        };
        var requestParams = dict({
          'type': _this9.interactiveType_,
          'client': clientId
        });
        url = appendPathToUrl(_this9.urlService_.parse(url), _this9.getInteractiveId_());

        if (requestOptions['method'] === 'POST') {
          requestOptions['body'] = {
            'option_selected': optionSelected
          };
          requestOptions['headers'] = {
            'Content-Type': 'application/json'
          };
          url = appendPathToUrl(_this9.urlService_.parse(url), ':vote');
        }

        url = addParamsToUrl(url, requestParams);
        return _this9.requestService_.executeRequest(url, requestOptions).catch(function (err) {
          return dev().error(TAG, err);
        });
      });
    }
    /**
     * Handles incoming interactive data response
     *
     * RESPONSE FORMAT
     * {
     *  options: [
     *    {
     *      index:
     *      count:
     *      selected:
     *    },
     *    ...
     *  ]
     * }
     * @param {InteractiveResponseType|undefined} response
     * @private
     */

  }, {
    key: "onDataRetrieved_",
    value: function onDataRetrieved_(response) {
      if (!(response && response['options'])) {
        devAssert(response && 'options' in response, "Invalid interactive response, expected { data: InteractiveResponseType, ...} but received " + response);
        dev().error(TAG, "Invalid interactive response, expected { data: InteractiveResponseType, ...} but received " + response);
        return;
      }

      var numOptions = this.getNumberOfOptions();
      // Only keep the visible options to ensure visible percentages add up to 100.
      this.updateComponentWithData(response['options'].slice(0, numOptions));
    }
    /**
     * Updates the quiz to reflect the state of the remote data.
     * @param {!Array<InteractiveOptionType>} data
     * @protected
     */

  }, {
    key: "updateComponentWithData",
    value: function updateComponentWithData(data) {
      var _this10 = this;

      var options = this.rootEl_.querySelectorAll('.i-amphtml-story-interactive-option');
      this.optionsData_ = this.orderData_(data);
      this.optionsData_.forEach(function (response) {
        if (response.selected) {
          _this10.hasUserSelection_ = true;

          _this10.updateStoryStoreState_(response.index);

          _this10.mutateElement(function () {
            _this10.updateToPostSelectionState_(options[response.index]);
          });
        }
      });
    }
    /**
     * Updates the selected classes on component and option selected.
     * @param {?Element} selectedOption
     * @protected
     */

  }, {
    key: "updateToPostSelectionState_",
    value: function updateToPostSelectionState_(selectedOption) {
      this.rootEl_.classList.add(POST_SELECTION_CLASS);

      if (selectedOption != null) {
        selectedOption.classList.add('i-amphtml-story-interactive-option-selected');
      }

      if (this.optionsData_) {
        this.rootEl_.classList.add('i-amphtml-story-interactive-has-data');
        this.displayOptionsData(this.optionsData_);
      }

      this.getOptionElements().forEach(function (el) {
        el.setAttribute('tabindex', -1);
      });
    }
    /**
     * @public
     * @param {?number} option
     */

  }, {
    key: "updateStoryStoreState_",
    value: function updateStoryStoreState_(option) {
      if (option === void 0) {
        option = null;
      }

      var update = {
        option: option != null ? this.options_[option] : null,
        interactiveId: this.getInteractiveId_(),
        type: this.interactiveType_
      };
      this.storeService_.dispatch(Action.ADD_INTERACTIVE_REACT, update);
    }
    /**
     * Toggles the tabbable elements (buttons, links, etc) to only reach them when page is active.
     * @param {boolean} toggle
     */

  }, {
    key: "toggleTabbableElements_",
    value: function toggleTabbableElements_(toggle) {
      var _this11 = this;

      this.rootEl_.querySelectorAll('button, a').forEach(function (el) {
        // Disable tabbing through options if already selected.
        if (el.classList.contains('i-amphtml-story-interactive-option') && _this11.hasUserSelection_) {
          el.setAttribute('tabindex', -1);
        } else {
          el.setAttribute('tabindex', toggle ? 0 : -1);
        }
      });
    }
    /**
     * Returns the number of options.
     *
     * @protected
     * @return {number}
     */

  }, {
    key: "getNumberOfOptions",
    value: function getNumberOfOptions() {
      return this.getOptionElements().length;
    }
    /**
     * Reorders options data to account for scrambled or incomplete data.
     *
     * @private
     * @param {!Array<!InteractiveOptionType>} optionsData
     * @return {!Array<!InteractiveOptionType>}
     */

  }, {
    key: "orderData_",
    value: function orderData_(optionsData) {
      var numOptionElements = this.getNumberOfOptions();
      var orderedData = new Array(numOptionElements);
      optionsData.forEach(function (option) {
        var index = option.index;

        if (index >= 0 && index < numOptionElements) {
          orderedData[index] = option;
        }
      });

      for (var i = 0; i < orderedData.length; i++) {
        if (!orderedData[i]) {
          orderedData[i] = {
            count: 0,
            index: i,
            selected: false
          };
        }
      }

      return orderedData;
    }
    /**
     * Opens the disclaimer dialog and positions it according to the page and itself.
     * @private
     */

  }, {
    key: "openDisclaimer_",
    value: function openDisclaimer_() {
      var _this12 = this;

      if (this.disclaimerEl_) {
        return;
      }

      var dir = this.rootEl_.getAttribute('dir') || 'ltr';
      this.disclaimerEl_ = buildInteractiveDisclaimer(this, {
        dir: dir
      });
      var styles;
      this.measureMutateElement(function () {
        // Get rects and calculate position from icon.
        var interactiveRect = _this12.element.
        /*OK*/
        getBoundingClientRect();

        var pageRect = _this12.getPageEl().
        /*OK*/
        getBoundingClientRect();

        var iconRect = _this12.disclaimerIcon_.
        /*OK*/
        getBoundingClientRect();

        var bottomFraction = 1 - (iconRect.y + iconRect.height - pageRect.y) / pageRect.height;
        var widthFraction = interactiveRect.width / pageRect.width;
        // Clamp values to ensure dialog has space up and left.
        var bottomPercentage = clamp(bottomFraction * 100, 0, 85);
        // Ensure 15% of space up.
        var widthPercentage = Math.max(widthFraction * 100, 65);
        // Ensure 65% of max-width.
        styles = {
          'bottom': bottomPercentage + '%',
          'max-width': widthPercentage + '%',
          'position': 'absolute',
          'z-index': 3
        };

        // Align disclaimer to left if RTL, otherwise align to the right.
        if (dir === 'rtl') {
          var leftFraction = (iconRect.x - pageRect.x) / pageRect.width;
          styles['left'] = clamp(leftFraction * 100, 0, 25) + '%';
        } else {
          var rightFraction = 1 - (iconRect.x + iconRect.width - pageRect.x) / pageRect.width;
          styles['right'] = clamp(rightFraction * 100, 0, 25) + '%';
        }
      }, function () {
        setImportantStyles(_this12.disclaimerEl_, assertDoesNotContainDisplay(styles));

        _this12.getPageEl().appendChild(_this12.disclaimerEl_);

        _this12.disclaimerIcon_.setAttribute('hide', '');

        // Add click listener through the shadow dom using e.path.
        _this12.disclaimerEl_.addEventListener('click', function (e) {
          if (e.path[0].classList.contains('i-amphtml-story-interactive-disclaimer-close')) {
            _this12.closeDisclaimer_();
          }
        });
      });
    }
    /**
     * Closes the disclaimer dialog if open.
     * @private
     */

  }, {
    key: "closeDisclaimer_",
    value: function closeDisclaimer_() {
      var _this13 = this;

      if (!this.disclaimerEl_) {
        return;
      }

      this.mutateElement(function () {
        _this13.disclaimerEl_.remove();

        _this13.disclaimerEl_ = null;

        if (_this13.disclaimerIcon_) {
          _this13.disclaimerIcon_.removeAttribute('hide');
        }
      });
    }
  }]);

  return AmpStoryInteractive;
}(AMP.BaseElement);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1pbnRlcmFjdGl2ZS1hYnN0cmFjdC5qcyJdLCJuYW1lcyI6WyJBTkFMWVRJQ1NfVEFHX05BTUUiLCJTdG9yeUFuYWx5dGljc0V2ZW50IiwiY2xhbXAiLCJBY3Rpb24iLCJTdGF0ZVByb3BlcnR5IiwiQW5hbHl0aWNzVmFyaWFibGUiLCJDU1MiLCJTZXJ2aWNlcyIsImFkZFBhcmFtc1RvVXJsIiwiYXBwZW5kUGF0aFRvVXJsIiwiYXNzZXJ0QWJzb2x1dGVIdHRwT3JIdHRwc1VybCIsImJhc2U2NFVybEVuY29kZUZyb21TdHJpbmciLCJhc3NlcnREb2VzTm90Q29udGFpbkRpc3BsYXkiLCJidWlsZEludGVyYWN0aXZlRGlzY2xhaW1lciIsImJ1aWxkSW50ZXJhY3RpdmVEaXNjbGFpbWVySWNvbiIsImNsb3Nlc3QiLCJjcmVhdGVTaGFkb3dSb290V2l0aFN0eWxlIiwibWF5YmVNYWtlUHJveHlVcmwiLCJkZWR1cGxpY2F0ZUludGVyYWN0aXZlSWRzIiwiZGV2IiwiZGV2QXNzZXJ0IiwiZGljdCIsImVtb2ppQ29uZmV0dGkiLCJ0b0FycmF5Iiwic2V0SW1wb3J0YW50U3R5bGVzIiwiaXNFeHBlcmltZW50T24iLCJUQUciLCJNSURfU0VMRUNUSU9OX0NMQVNTIiwiUE9TVF9TRUxFQ1RJT05fQ0xBU1MiLCJJbnRlcmFjdGl2ZVR5cGUiLCJRVUlaIiwiUE9MTCIsIlJFU1VMVFMiLCJTTElERVIiLCJFTkRQT0lOVF9JTlZBTElEX0VSUk9SIiwiSU5URVJBQ1RJVkVfQUNUSVZFX0NMQVNTIiwiSW50ZXJhY3RpdmVPcHRpb25UeXBlIiwiSW50ZXJhY3RpdmVSZXNwb25zZVR5cGUiLCJPcHRpb25Db25maWdUeXBlIiwiZm9udHNUb0xvYWQiLCJmYW1pbHkiLCJ3ZWlnaHQiLCJzcmMiLCJBbXBTdG9yeUludGVyYWN0aXZlIiwiZWxlbWVudCIsInR5cGUiLCJib3VuZHMiLCJpbnRlcmFjdGl2ZVR5cGVfIiwiYW5hbHl0aWNzU2VydmljZV8iLCJiYWNrZW5kRGF0YVByb21pc2VfIiwiY2xpZW50SWRQcm9taXNlXyIsImRpc2NsYWltZXJFbF8iLCJkaXNjbGFpbWVySWNvbl8iLCJoYXNVc2VyU2VsZWN0aW9uXyIsIm9wdGlvbkJvdW5kc18iLCJvcHRpb25FbGVtZW50c18iLCJvcHRpb25zXyIsIm9wdGlvbnNEYXRhXyIsInBhZ2VFbF8iLCJyb290RWxfIiwibG9jYWxpemF0aW9uU2VydmljZSIsInJlcXVlc3RTZXJ2aWNlXyIsInN0b3JlU2VydmljZV8iLCJ1cmxTZXJ2aWNlXyIsInZhcmlhYmxlU2VydmljZV8iLCJxdWVyeVNlbGVjdG9yQWxsIiwiY2Fub25pY2FsVXJsNjQiLCJ3aW4iLCJkb2N1bWVudCIsImRvY3VtZW50SW5mb0ZvckRvYyIsImNhbm9uaWNhbFVybCIsImlkIiwiYXNzZXJ0RWxlbWVudCIsImVsIiwidGFnTmFtZSIsInRvTG93ZXJDYXNlIiwiY29uY3JldGVDU1MiLCJsb2FkRm9udHNfIiwicGFyc2VPcHRpb25zXyIsImNsYXNzTGlzdCIsImFkZCIsImFkanVzdEdyaWRMYXllcl8iLCJjaGlsZHJlbiIsImxlbmd0aCIsInVybEZvckRvYyIsIlByb21pc2UiLCJhbGwiLCJzdG9yeVZhcmlhYmxlU2VydmljZUZvck9yTnVsbCIsInRoZW4iLCJzZXJ2aWNlIiwic3RvcnlTdG9yZVNlcnZpY2VGb3JPck51bGwiLCJ1cGRhdGVTdG9yeVN0b3JlU3RhdGVfIiwic3RvcnlSZXF1ZXN0U2VydmljZUZvck9yTnVsbCIsInN0b3J5QW5hbHl0aWNzU2VydmljZUZvck9yTnVsbCIsImxvY2FsaXphdGlvblNlcnZpY2VGb3JPck51bGwiLCJidWlsZENvbXBvbmVudCIsImhhc0F0dHJpYnV0ZSIsInByZXBlbmQiLCJsb2FkZWRGb250cyIsImZvbnRzIiwiRm9udEZhY2UiLCJmb3JFYWNoIiwiZm9udFByb3BlcnRpZXMiLCJmb250Iiwic3R5bGUiLCJsb2FkIiwib3B0aW9ucyIsImF0dHJpYnV0ZXMiLCJhdHRyIiwibmFtZSIsIm1hdGNoIiwic3BsaXRQYXJ0cyIsInNwbGl0Iiwib3B0aW9uTnVtYmVyIiwicGFyc2VJbnQiLCJwdXNoIiwia2V5Iiwic2xpY2UiLCJqb2luIiwidmFsdWUiLCJnZXRBbXBEb2MiLCJlcnJvciIsInJvb3QiLCJwcm9tcHRDb250YWluZXIiLCJxdWVyeVNlbGVjdG9yIiwicmVtb3ZlQ2hpbGQiLCJwcm9tcHQiLCJjcmVhdGVFbGVtZW50IiwidGV4dENvbnRlbnQiLCJnZXRBdHRyaWJ1dGUiLCJhcHBlbmRDaGlsZCIsImluaXRpYWxpemVMaXN0ZW5lcnNfIiwicmV0cmlldmVJbnRlcmFjdGl2ZURhdGFfIiwiY2lkRm9yRG9jIiwiZGF0YSIsImdldCIsInNjb3BlIiwiY3JlYXRlQ29va2llSWZOb3RQcmVzZW50IiwicnRsU3RhdGUiLCJtdXRhdGVFbGVtZW50Iiwic2V0QXR0cmlidXRlIiwicmVtb3ZlQXR0cmlidXRlIiwibGF5b3V0IiwiZ3JpZExheWVyIiwicGFyZW50RWxlbWVudCIsInN1YnNjcmliZSIsIlJUTF9TVEFURSIsIm9uUnRsU3RhdGVVcGRhdGVfIiwiQ1VSUkVOVF9QQUdFX0lEIiwiY3VyclBhZ2VJZCIsInRvZ2dsZSIsImdldFBhZ2VFbCIsInRvZ2dsZVRhYmJhYmxlRWxlbWVudHNfIiwiY2xvc2VEaXNjbGFpbWVyXyIsImFkZEV2ZW50TGlzdGVuZXIiLCJlIiwiaGFuZGxlVGFwXyIsInRhcmdldCIsIm9wZW5EaXNjbGFpbWVyXyIsIm9wdGlvbkVsIiwiY29udGFpbnMiLCJvcHRpb25JbmRleF8iLCJoYW5kbGVPcHRpb25TZWxlY3Rpb25fIiwiY29uZmV0dGlFbW9qaSIsImNvbmZldHRpIiwib3B0aW9uSW5kZXgiLCJvblZhcmlhYmxlVXBkYXRlIiwiU1RPUllfSU5URVJBQ1RJVkVfSUQiLCJTVE9SWV9JTlRFUkFDVElWRV9SRVNQT05TRSIsIlNUT1JZX0lOVEVSQUNUSVZFX1RZUEUiLCJ0cmlnZ2VyRXZlbnQiLCJJTlRFUkFDVElWRSIsInVudXNlZE9wdGlvbnNEYXRhIiwib3B0aW9uc0RhdGEiLCJ0b3RhbFJlc3BvbnNlQ291bnQiLCJyZWR1Y2UiLCJhY2MiLCJyZXNwb25zZSIsInBlcmNlbnRhZ2VzIiwibWFwIiwidG9GaXhlZCIsInRvdGFsIiwieCIsIk1hdGgiLCJyb3VuZCIsInBlcmNlbnRhZ2UiLCJmbG9vciIsInJlbWFpbmRlciIsInByZXNlcnZlT3JpZ2luYWwiLCJpbmRleCIsIm9yaWdpbmFsSW5kZXgiLCJzb3J0IiwibGVmdCIsInJpZ2h0IiwiZmluYWxQZXJjZW50YWdlcyIsImhpZ2hlc3RSZW1haW5kZXJPYmoiLCJ0aWVzIiwiZmlsdGVyIiwicGVyY2VudGFnZU9iaiIsInRvUm91bmRVcCIsInRyaWdnZXJBbmFseXRpY3NfIiwidXBkYXRlVG9Qb3N0U2VsZWN0aW9uU3RhdGVfIiwiZXhlY3V0ZUludGVyYWN0aXZlUmVxdWVzdF8iLCJjYXRjaCIsIm9uRGF0YVJldHJpZXZlZF8iLCJtZXRob2QiLCJvcHRpb25TZWxlY3RlZCIsInVuZGVmaW5lZCIsInVybCIsInJlamVjdCIsImdldENsaWVudElkXyIsImNsaWVudElkIiwicmVxdWVzdE9wdGlvbnMiLCJyZXF1ZXN0UGFyYW1zIiwicGFyc2UiLCJnZXRJbnRlcmFjdGl2ZUlkXyIsImV4ZWN1dGVSZXF1ZXN0IiwiZXJyIiwibnVtT3B0aW9ucyIsImdldE51bWJlck9mT3B0aW9ucyIsInVwZGF0ZUNvbXBvbmVudFdpdGhEYXRhIiwib3JkZXJEYXRhXyIsInNlbGVjdGVkIiwic2VsZWN0ZWRPcHRpb24iLCJkaXNwbGF5T3B0aW9uc0RhdGEiLCJnZXRPcHRpb25FbGVtZW50cyIsIm9wdGlvbiIsInVwZGF0ZSIsImludGVyYWN0aXZlSWQiLCJkaXNwYXRjaCIsIkFERF9JTlRFUkFDVElWRV9SRUFDVCIsIm51bU9wdGlvbkVsZW1lbnRzIiwib3JkZXJlZERhdGEiLCJBcnJheSIsImkiLCJjb3VudCIsImRpciIsInN0eWxlcyIsIm1lYXN1cmVNdXRhdGVFbGVtZW50IiwiaW50ZXJhY3RpdmVSZWN0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwicGFnZVJlY3QiLCJpY29uUmVjdCIsImJvdHRvbUZyYWN0aW9uIiwieSIsImhlaWdodCIsIndpZHRoRnJhY3Rpb24iLCJ3aWR0aCIsImJvdHRvbVBlcmNlbnRhZ2UiLCJ3aWR0aFBlcmNlbnRhZ2UiLCJtYXgiLCJsZWZ0RnJhY3Rpb24iLCJyaWdodEZyYWN0aW9uIiwicGF0aCIsInJlbW92ZSIsIkFNUCIsIkJhc2VFbGVtZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUNFQSxrQkFERixFQUVFQyxtQkFGRjtBQUlBLFNBQVFDLEtBQVI7QUFDQSxTQUNFQyxNQURGLEVBRUVDLGFBRkY7QUFJQSxTQUFRQyxpQkFBUjtBQUNBLFNBQVFDLEdBQVI7QUFDQSxTQUFRQyxRQUFSO0FBQ0EsU0FDRUMsY0FERixFQUVFQyxlQUZGLEVBR0VDLDRCQUhGO0FBS0EsU0FBUUMseUJBQVI7QUFDQSxTQUFRQywyQkFBUjtBQUNBLFNBQ0VDLDBCQURGLEVBRUVDLDhCQUZGO0FBSUEsU0FBUUMsT0FBUjtBQUNBLFNBQ0VDLHlCQURGLEVBRUVDLGlCQUZGO0FBSUEsU0FBUUMseUJBQVI7QUFDQSxTQUFRQyxHQUFSLEVBQWFDLFNBQWI7QUFDQSxTQUFRQyxJQUFSO0FBQ0EsU0FBUUMsYUFBUjtBQUNBLFNBQVFDLE9BQVI7QUFDQSxTQUFRQyxrQkFBUjtBQUNBLFNBQVFDLGNBQVI7O0FBRUE7QUFDQSxJQUFNQyxHQUFHLEdBQUcsdUJBQVo7O0FBRUE7QUFDQSxPQUFPLElBQU1DLG1CQUFtQixHQUFHLDJDQUE1Qjs7QUFDUDtBQUNBLE9BQU8sSUFBTUMsb0JBQW9CLEdBQy9CLDRDQURLOztBQUdQO0FBQ0E7QUFDQTtBQUNBLE9BQU8sSUFBTUMsZUFBZSxHQUFHO0FBQzdCQyxFQUFBQSxJQUFJLEVBQUUsQ0FEdUI7QUFFN0JDLEVBQUFBLElBQUksRUFBRSxDQUZ1QjtBQUc3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QyxDQUFDa0csSUFBRixDQUFPLENBQVAsRUFBVTlLLFNBQVYsQ0FBb0JpRixRQUFwQixDQUNFLDhDQURGLENBREYsRUFJRTtBQUNBLFlBQUEsT0FBSSxDQUFDUCxnQkFBTDtBQUNEO0FBQ0YsU0FSRDtBQVNELE9BaERIO0FBa0REO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBbnpCQTtBQUFBO0FBQUEsV0FvekJFLDRCQUFtQjtBQUFBOztBQUNqQixVQUFJLENBQUMsS0FBS3RHLGFBQVYsRUFBeUI7QUFDdkI7QUFDRDs7QUFDRCxXQUFLd0YsYUFBTCxDQUFtQixZQUFNO0FBQ3ZCLFFBQUEsT0FBSSxDQUFDeEYsYUFBTCxDQUFtQjJNLE1BQW5COztBQUNBLFFBQUEsT0FBSSxDQUFDM00sYUFBTCxHQUFxQixJQUFyQjs7QUFDQSxZQUFJLE9BQUksQ0FBQ0MsZUFBVCxFQUEwQjtBQUN4QixVQUFBLE9BQUksQ0FBQ0EsZUFBTCxDQUFxQnlGLGVBQXJCLENBQXFDLE1BQXJDO0FBQ0Q7QUFDRixPQU5EO0FBT0Q7QUEvekJIOztBQUFBO0FBQUEsRUFBeUNrSCxHQUFHLENBQUNDLFdBQTdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7XG4gIEFOQUxZVElDU19UQUdfTkFNRSxcbiAgU3RvcnlBbmFseXRpY3NFdmVudCxcbn0gZnJvbSAnLi4vLi4vYW1wLXN0b3J5LzEuMC9zdG9yeS1hbmFseXRpY3MnO1xuaW1wb3J0IHtjbGFtcH0gZnJvbSAnI2NvcmUvbWF0aCc7XG5pbXBvcnQge1xuICBBY3Rpb24sXG4gIFN0YXRlUHJvcGVydHksXG59IGZyb20gJy4uLy4uL2FtcC1zdG9yeS8xLjAvYW1wLXN0b3J5LXN0b3JlLXNlcnZpY2UnO1xuaW1wb3J0IHtBbmFseXRpY3NWYXJpYWJsZX0gZnJvbSAnLi4vLi4vYW1wLXN0b3J5LzEuMC92YXJpYWJsZS1zZXJ2aWNlJztcbmltcG9ydCB7Q1NTfSBmcm9tICcuLi8uLi8uLi9idWlsZC9hbXAtc3RvcnktaW50ZXJhY3RpdmUtMC4xLmNzcyc7XG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5pbXBvcnQge1xuICBhZGRQYXJhbXNUb1VybCxcbiAgYXBwZW5kUGF0aFRvVXJsLFxuICBhc3NlcnRBYnNvbHV0ZUh0dHBPckh0dHBzVXJsLFxufSBmcm9tICcuLi8uLi8uLi9zcmMvdXJsJztcbmltcG9ydCB7YmFzZTY0VXJsRW5jb2RlRnJvbVN0cmluZ30gZnJvbSAnI2NvcmUvdHlwZXMvc3RyaW5nL2Jhc2U2NCc7XG5pbXBvcnQge2Fzc2VydERvZXNOb3RDb250YWluRGlzcGxheX0gZnJvbSAnLi4vLi4vLi4vc3JjL2Fzc2VydC1kaXNwbGF5JztcbmltcG9ydCB7XG4gIGJ1aWxkSW50ZXJhY3RpdmVEaXNjbGFpbWVyLFxuICBidWlsZEludGVyYWN0aXZlRGlzY2xhaW1lckljb24sXG59IGZyb20gJy4vaW50ZXJhY3RpdmUtZGlzY2xhaW1lcic7XG5pbXBvcnQge2Nsb3Nlc3R9IGZyb20gJyNjb3JlL2RvbS9xdWVyeSc7XG5pbXBvcnQge1xuICBjcmVhdGVTaGFkb3dSb290V2l0aFN0eWxlLFxuICBtYXliZU1ha2VQcm94eVVybCxcbn0gZnJvbSAnLi4vLi4vYW1wLXN0b3J5LzEuMC91dGlscyc7XG5pbXBvcnQge2RlZHVwbGljYXRlSW50ZXJhY3RpdmVJZHN9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtkZXYsIGRldkFzc2VydH0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge2RpY3R9IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5pbXBvcnQge2Vtb2ppQ29uZmV0dGl9IGZyb20gJy4vaW50ZXJhY3RpdmUtY29uZmV0dGknO1xuaW1wb3J0IHt0b0FycmF5fSBmcm9tICcjY29yZS90eXBlcy9hcnJheSc7XG5pbXBvcnQge3NldEltcG9ydGFudFN0eWxlc30gZnJvbSAnI2NvcmUvZG9tL3N0eWxlJztcbmltcG9ydCB7aXNFeHBlcmltZW50T259IGZyb20gJyNleHBlcmltZW50cy8nO1xuXG4vKiogQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBUQUcgPSAnYW1wLXN0b3J5LWludGVyYWN0aXZlJztcblxuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuZXhwb3J0IGNvbnN0IE1JRF9TRUxFQ1RJT05fQ0xBU1MgPSAnaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW1pZC1zZWxlY3Rpb24nO1xuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuZXhwb3J0IGNvbnN0IFBPU1RfU0VMRUNUSU9OX0NMQVNTID1cbiAgJ2ktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1wb3N0LXNlbGVjdGlvbic7XG5cbi8qKlxuICogQGNvbnN0IEBlbnVtIHtudW1iZXJ9XG4gKi9cbmV4cG9ydCBjb25zdCBJbnRlcmFjdGl2ZVR5cGUgPSB7XG4gIFFVSVo6IDAsXG4gIFBPTEw6IDEsXG4gIFJFU1VMVFM6IDIsXG4gIFNMSURFUjogMyxcbn07XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IEVORFBPSU5UX0lOVkFMSURfRVJST1IgPVxuICAnVGhlIHB1Ymxpc2hlciBoYXMgc3BlY2lmaWVkIGFuIGludmFsaWQgZGF0YXN0b3JlIGVuZHBvaW50JztcblxuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgSU5URVJBQ1RJVkVfQUNUSVZFX0NMQVNTID0gJ2ktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1hY3RpdmUnO1xuXG4vKipcbiAqIEB0eXBlZGVmIHt7XG4gKiAgICBpbmRleDogbnVtYmVyLFxuICogICAgY291bnQ6IG51bWJlcixcbiAqICAgIHNlbGVjdGVkOiBib29sZWFuLFxuICogfX1cbiAqL1xuZXhwb3J0IGxldCBJbnRlcmFjdGl2ZU9wdGlvblR5cGU7XG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqICAgIG9wdGlvbnM6ICFBcnJheTxJbnRlcmFjdGl2ZU9wdGlvblR5cGU+LFxuICogfX1cbiAqL1xuZXhwb3J0IGxldCBJbnRlcmFjdGl2ZVJlc3BvbnNlVHlwZTtcblxuLyoqXG4gKiBAdHlwZWRlZiB7e1xuICogICAgb3B0aW9uSW5kZXg6IG51bWJlcixcbiAqICAgIHRleHQ6IHN0cmluZyxcbiAqICAgIGNvcnJlY3Q6ID9zdHJpbmcsXG4gKiAgICByZXN1bHRzY2F0ZWdvcnk6ID9zdHJpbmcsXG4gKiAgICBpbWFnZTogP3N0cmluZyxcbiAqICAgIGNvbmZldHRpOiA/c3RyaW5nLFxuICogICAgcmVzdWx0c3RocmVzaG9sZDogP3N0cmluZyxcbiAqIH19XG4gKi9cbmV4cG9ydCBsZXQgT3B0aW9uQ29uZmlnVHlwZTtcblxuLyoqIEBjb25zdCB7QXJyYXk8T2JqZWN0Pn0gZm9udEZhY2VzIHdpdGggdXJscyBmcm9tIGh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzMj9mYW1pbHk9UG9wcGluczp3Z2h0QDQwMDs3MDAmYW1wO2Rpc3BsYXk9c3dhcCAqL1xuY29uc3QgZm9udHNUb0xvYWQgPSBbXG4gIHtcbiAgICBmYW1pbHk6ICdQb3BwaW5zJyxcbiAgICB3ZWlnaHQ6ICc0MDAnLFxuICAgIHNyYzogXCJ1cmwoaHR0cHM6Ly9mb250cy5nc3RhdGljLmNvbS9zL3BvcHBpbnMvdjkvcHhpRXlwOGt2OEpIZ0ZWckpKZmVjbkZIR1BjLndvZmYyKSBmb3JtYXQoJ3dvZmYyJylcIixcbiAgfSxcbiAge1xuICAgIGZhbWlseTogJ1BvcHBpbnMnLFxuICAgIHdlaWdodDogJzcwMCcsXG4gICAgc3JjOiBcInVybChodHRwczovL2ZvbnRzLmdzdGF0aWMuY29tL3MvcG9wcGlucy92OS9weGlCeXA4a3Y4SkhnRlZyTEN6N1oxeGxGZDJKUUVrLndvZmYyKSBmb3JtYXQoJ3dvZmYyJylcIixcbiAgfSxcbl07XG5cbi8qKlxuICogSW50ZXJhY3RpdmUgYWJzdHJhY3QgY2xhc3Mgd2l0aCBzaGFyZWQgZnVuY3Rpb25hbGl0eSBmb3IgaW50ZXJhY3RpdmUgY29tcG9uZW50cy5cbiAqXG4gKiBMaWZlY3ljbGU6XG4gKiAxKSBXaGVuIGNyZWF0ZWQsIHRoZSBhYnN0cmFjdCBjbGFzcyB3aWxsIGNhbGwgdGhlIGJ1aWxkQ29tcG9uZW50KCkgbWV0aG9kIGltcGxlbWVudGVkIGJ5IGVhY2ggY29uY3JldGUgY2xhc3MuXG4gKiAgIE5PVEU6IFdoZW4gY3JlYXRlZCwgdGhlIGNvbXBvbmVudCB3aWxsIHJlY2VpdmUgYSAuaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLWNvbXBvbmVudCwgaW5oZXJpdGluZyB1c2VmdWwgQ1NTIHZhcmlhYmxlcy5cbiAqXG4gKiAyKSBJZiBhbiBlbmRwb2ludCBpcyBzcGVjaWZpZWQsIGl0IHdpbGwgcmV0cmlldmUgYWdncmVnYXRlIHJlc3VsdHMgZnJvbSB0aGUgYmFja2VuZCBhbmQgcHJvY2VzcyB0aGVtLiBJZiB0aGUgY2xpZW50SWRcbiAqICAgaGFzIHJlc3BvbmRlZCBpbiBhIHByZXZpb3VzIHNlc3Npb24sIHRoZSBjb21wb25lbnQgd2lsbCBjaGFuZ2UgdG8gYSBwb3N0LXNlbGVjdGlvbiBzdGF0ZS4gT3RoZXJ3aXNlIGl0IHdpbGwgd2FpdFxuICogICBmb3IgdXNlciBzZWxlY3Rpb24uXG4gKiAgIE5PVEU6IENsaWNrIGxpc3RlbmVycyB3aWxsIGJlIGF0dGFjaGVkIHRvIGFsbCBvcHRpb25zLCB3aGljaCByZXF1aXJlIC5pLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtb3B0aW9uLlxuICpcbiAqIDMpIE9uIHVzZXIgc2VsZWN0aW9uLCBpdCB3aWxsIHByb2Nlc3MgdGhlIGJhY2tlbmQgcmVzdWx0cyAoaWYgZW5kcG9pbnQgc3BlY2lmaWVkKSBhbmQgZGlzcGxheSB0aGUgc2VsZWN0ZWQgb3B0aW9uLlxuICogICBBbmFseXRpYyBldmVudHMgd2lsbCBiZSBzZW50LCBwZXJjZW50YWdlcyB1cGRhdGVkIChpbXBsZW1lbnRlZCBieSB0aGUgY29uY3JldGUgY2xhc3MpLCBhbmQgYmFja2VuZCBwb3N0ZWQgd2l0aCB0aGVcbiAqICAgdXNlciByZXNwb25zZS4gQ2xhc3NlcyB3aWxsIGJlIGFkZGVkIHRvIHRoZSBjb21wb25lbnQgYW5kIG9wdGlvbnMgYWNjb3JkaW5nbHkuXG4gKiAgIE5PVEU6IE9uIG9wdGlvbiBzZWxlY3RlZCwgdGhlIHNlbGVjdGlvbiB3aWxsIHJlY2VpdmUgYSAuaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW9wdGlvbi1zZWxlY3RlZCwgYW5kIHRoZSByb290IGVsZW1lbnRcbiAqICAgd2lsbCByZWNlaXZlIGEgLmktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1wb3N0LXNlbGVjdGlvbi4gT3B0aW9uYWxseSwgaWYgdGhlIGVuZHBvaW50IHJldHVybmVkIGFnZ3JlZ2F0ZSByZXN1bHRzLFxuICogICB0aGUgcm9vdCBlbGVtZW50IHdpbGwgYWxzbyByZWNlaXZlIGEgLmktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1oYXMtZGF0YS5cbiAqXG4gKiBAYWJzdHJhY3RcbiAqL1xuZXhwb3J0IGNsYXNzIEFtcFN0b3J5SW50ZXJhY3RpdmUgZXh0ZW5kcyBBTVAuQmFzZUVsZW1lbnQge1xuICAvKipcbiAgICogQHBhcmFtIHshQW1wRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcGFyYW0geyFJbnRlcmFjdGl2ZVR5cGV9IHR5cGVcbiAgICogQHBhcmFtIHshQXJyYXk8bnVtYmVyPn0gYm91bmRzIHRoZSBib3VuZHMgb24gbnVtYmVyIG9mIG9wdGlvbnMsIGluY2x1c2l2ZVxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgdHlwZSwgYm91bmRzID0gWzIsIDRdKSB7XG4gICAgc3VwZXIoZWxlbWVudCk7XG5cbiAgICAvKiogQHByb3RlY3RlZCBAY29uc3Qge0ludGVyYWN0aXZlVHlwZX0gKi9cbiAgICB0aGlzLmludGVyYWN0aXZlVHlwZV8gPSB0eXBlO1xuXG4gICAgLyoqIEBwcm90ZWN0ZWQgez8uLi8uLi9hbXAtc3RvcnkvMS4wL3N0b3J5LWFuYWx5dGljcy5TdG9yeUFuYWx5dGljc1NlcnZpY2V9ICovXG4gICAgdGhpcy5hbmFseXRpY3NTZXJ2aWNlXyA9IG51bGw7XG5cbiAgICAvKiogQHByb3RlY3RlZCB7P1Byb21pc2U8P0ludGVyYWN0aXZlUmVzcG9uc2VUeXBlfD9Kc29uT2JqZWN0fHVuZGVmaW5lZD59ICovXG4gICAgdGhpcy5iYWNrZW5kRGF0YVByb21pc2VfID0gbnVsbDtcblxuICAgIC8qKiBAcHJvdGVjdGVkIHs/UHJvbWlzZTxKc29uT2JqZWN0Pn0gKi9cbiAgICB0aGlzLmNsaWVudElkUHJvbWlzZV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/RWxlbWVudH0gdGhlIGRpc2NsYWltZXIgZGlhbG9nIGlmIG9wZW4sIG51bGwgaWYgY2xvc2VkICovXG4gICAgdGhpcy5kaXNjbGFpbWVyRWxfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5kaXNjbGFpbWVySWNvbl8gPSBudWxsO1xuXG4gICAgLyoqIEBwcm90ZWN0ZWQge2Jvb2xlYW59ICovXG4gICAgdGhpcy5oYXNVc2VyU2VsZWN0aW9uXyA9IGZhbHNlO1xuXG4gICAgLyoqIEBwcml2YXRlIHshQXJyYXk8bnVtYmVyPn0gbWluIGFuZCBtYXggbnVtYmVyIG9mIG9wdGlvbnMsIGluY2x1c2l2ZSAqL1xuICAgIHRoaXMub3B0aW9uQm91bmRzXyA9IGJvdW5kcztcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0FycmF5PCFFbGVtZW50Pn0gRE9NIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW9wdGlvbiBjbGFzcyAqL1xuICAgIHRoaXMub3B0aW9uRWxlbWVudHNfID0gbnVsbDtcblxuICAgIC8qKiBAcHJvdGVjdGVkIHs/QXJyYXk8IU9wdGlvbkNvbmZpZ1R5cGU+fSBvcHRpb24gY29uZmlnIHZhbHVlcyBmcm9tIGF0dHJpYnV0ZXMgKHRleHQsIGNvcnJlY3QuLi4pICovXG4gICAgdGhpcy5vcHRpb25zXyA9IG51bGw7XG5cbiAgICAvKiogQHByb3RlY3RlZCB7P0FycmF5PCFJbnRlcmFjdGl2ZU9wdGlvblR5cGU+fSByZXRyaWV2ZWQgcmVzdWx0cyBmcm9tIHRoZSBiYWNrZW5kICovXG4gICAgdGhpcy5vcHRpb25zRGF0YV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/RWxlbWVudH0gdGhlIHBhZ2UgZWxlbWVudCB0aGUgY29tcG9uZW50IGlzIG9uICovXG4gICAgdGhpcy5wYWdlRWxfID0gbnVsbDtcblxuICAgIC8qKiBAcHJvdGVjdGVkIHs/RWxlbWVudH0gKi9cbiAgICB0aGlzLnJvb3RFbF8gPSBudWxsO1xuXG4gICAgLyoqIEBwdWJsaWMgey4uLy4uLy4uL3NyYy9zZXJ2aWNlL2xvY2FsaXphdGlvblNlcnZpY2V9ICovXG4gICAgdGhpcy5sb2NhbGl6YXRpb25TZXJ2aWNlID0gbnVsbDtcblxuICAgIC8qKiBAcHJvdGVjdGVkIHs/Li4vLi4vYW1wLXN0b3J5LzEuMC9hbXAtc3RvcnktcmVxdWVzdC1zZXJ2aWNlLkFtcFN0b3J5UmVxdWVzdFNlcnZpY2V9ICovXG4gICAgdGhpcy5yZXF1ZXN0U2VydmljZV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcm90ZWN0ZWQgez8uLi8uLi9hbXAtc3RvcnkvMS4wL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlLkFtcFN0b3J5U3RvcmVTZXJ2aWNlfSAqL1xuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXyA9IG51bGw7XG5cbiAgICAvKiogQHByb3RlY3RlZCB7Py4uLy4uLy4uL3NyYy9zZXJ2aWNlL3VybC1pbXBsLlVybH0gKi9cbiAgICB0aGlzLnVybFNlcnZpY2VfID0gbnVsbDtcblxuICAgIC8qKiBAcHJvdGVjdGVkIHs/Li4vLi4vYW1wLXN0b3J5LzEuMC92YXJpYWJsZS1zZXJ2aWNlLkFtcFN0b3J5VmFyaWFibGVTZXJ2aWNlfSAqL1xuICAgIHRoaXMudmFyaWFibGVTZXJ2aWNlXyA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgcm9vdCBlbGVtZW50LlxuICAgKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAgICogQHJldHVybiB7P0VsZW1lbnR9XG4gICAqL1xuICBnZXRSb290RWxlbWVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5yb290RWxfO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG9wdGlvbnMuXG4gICAqIEBwcm90ZWN0ZWRcbiAgICogQHJldHVybiB7IUFycmF5PCFFbGVtZW50Pn1cbiAgICovXG4gIGdldE9wdGlvbkVsZW1lbnRzKCkge1xuICAgIGlmICghdGhpcy5vcHRpb25FbGVtZW50c18pIHtcbiAgICAgIHRoaXMub3B0aW9uRWxlbWVudHNfID0gdG9BcnJheShcbiAgICAgICAgdGhpcy5yb290RWxfLnF1ZXJ5U2VsZWN0b3JBbGwoJy5pLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtb3B0aW9uJylcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm9wdGlvbkVsZW1lbnRzXztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBpbnRlcmFjdGl2ZSBJRFxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBnZXRJbnRlcmFjdGl2ZUlkXygpIHtcbiAgICBpZiAoIUFtcFN0b3J5SW50ZXJhY3RpdmUuY2Fub25pY2FsVXJsNjQpIHtcbiAgICAgIGRlZHVwbGljYXRlSW50ZXJhY3RpdmVJZHModGhpcy53aW4uZG9jdW1lbnQpO1xuICAgICAgQW1wU3RvcnlJbnRlcmFjdGl2ZS5jYW5vbmljYWxVcmw2NCA9IGJhc2U2NFVybEVuY29kZUZyb21TdHJpbmcoXG4gICAgICAgIFNlcnZpY2VzLmRvY3VtZW50SW5mb0ZvckRvYyh0aGlzLmVsZW1lbnQpLmNhbm9uaWNhbFVybFxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIGAke0FtcFN0b3J5SW50ZXJhY3RpdmUuY2Fub25pY2FsVXJsNjR9KyR7dGhpcy5lbGVtZW50LmlkfWA7XG4gIH1cblxuICAvKipcbiAgICogQHByb3RlY3RlZFxuICAgKiBAcmV0dXJuIHtFbGVtZW50fSB0aGUgcGFnZSBlbGVtZW50XG4gICAqL1xuICBnZXRQYWdlRWwoKSB7XG4gICAgaWYgKHRoaXMucGFnZUVsXyA9PSBudWxsKSB7XG4gICAgICB0aGlzLnBhZ2VFbF8gPSBjbG9zZXN0KGRldigpLmFzc2VydEVsZW1lbnQodGhpcy5lbGVtZW50KSwgKGVsKSA9PiB7XG4gICAgICAgIHJldHVybiBlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdhbXAtc3RvcnktcGFnZSc7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucGFnZUVsXztcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgYnVpbGRDYWxsYmFjayhjb25jcmV0ZUNTUyA9ICcnKSB7XG4gICAgdGhpcy5sb2FkRm9udHNfKCk7XG4gICAgdGhpcy5vcHRpb25zXyA9IHRoaXMucGFyc2VPcHRpb25zXygpO1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtY29tcG9uZW50Jyk7XG4gICAgdGhpcy5hZGp1c3RHcmlkTGF5ZXJfKCk7XG4gICAgZGV2QXNzZXJ0KHRoaXMuZWxlbWVudC5jaGlsZHJlbi5sZW5ndGggPT0gMCwgJ1RvbyBtYW55IGNoaWxkcmVuJyk7XG5cbiAgICAvLyBJbml0aWFsaXplIGFsbCB0aGUgc2VydmljZXMgYmVmb3JlIHByb2NlZWRpbmcsIGFuZCB1cGRhdGUgc3RvcmUgd2l0aCBzdGF0ZVxuICAgIHRoaXMudXJsU2VydmljZV8gPSBTZXJ2aWNlcy51cmxGb3JEb2ModGhpcy5lbGVtZW50KTtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAgU2VydmljZXMuc3RvcnlWYXJpYWJsZVNlcnZpY2VGb3JPck51bGwodGhpcy53aW4pLnRoZW4oKHNlcnZpY2UpID0+IHtcbiAgICAgICAgdGhpcy52YXJpYWJsZVNlcnZpY2VfID0gc2VydmljZTtcbiAgICAgIH0pLFxuICAgICAgU2VydmljZXMuc3RvcnlTdG9yZVNlcnZpY2VGb3JPck51bGwodGhpcy53aW4pLnRoZW4oKHNlcnZpY2UpID0+IHtcbiAgICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfID0gc2VydmljZTtcbiAgICAgICAgdGhpcy51cGRhdGVTdG9yeVN0b3JlU3RhdGVfKG51bGwpO1xuICAgICAgfSksXG4gICAgICBTZXJ2aWNlcy5zdG9yeVJlcXVlc3RTZXJ2aWNlRm9yT3JOdWxsKHRoaXMud2luKS50aGVuKChzZXJ2aWNlKSA9PiB7XG4gICAgICAgIHRoaXMucmVxdWVzdFNlcnZpY2VfID0gc2VydmljZTtcbiAgICAgIH0pLFxuICAgICAgU2VydmljZXMuc3RvcnlBbmFseXRpY3NTZXJ2aWNlRm9yT3JOdWxsKHRoaXMud2luKS50aGVuKChzZXJ2aWNlKSA9PiB7XG4gICAgICAgIHRoaXMuYW5hbHl0aWNzU2VydmljZV8gPSBzZXJ2aWNlO1xuICAgICAgfSksXG4gICAgICBTZXJ2aWNlcy5sb2NhbGl6YXRpb25TZXJ2aWNlRm9yT3JOdWxsKHRoaXMuZWxlbWVudCkudGhlbigoc2VydmljZSkgPT4ge1xuICAgICAgICB0aGlzLmxvY2FsaXphdGlvblNlcnZpY2UgPSBzZXJ2aWNlO1xuICAgICAgfSksXG4gICAgXSkudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLnJvb3RFbF8gPSB0aGlzLmJ1aWxkQ29tcG9uZW50KCk7XG4gICAgICB0aGlzLnJvb3RFbF8uY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLWNvbnRhaW5lcicpO1xuICAgICAgaWYgKFxuICAgICAgICBpc0V4cGVyaW1lbnRPbih0aGlzLndpbiwgJ2FtcC1zdG9yeS1pbnRlcmFjdGl2ZS1kaXNjbGFpbWVyJykgJiZcbiAgICAgICAgdGhpcy5lbGVtZW50Lmhhc0F0dHJpYnV0ZSgnZW5kcG9pbnQnKVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuZGlzY2xhaW1lckljb25fID0gYnVpbGRJbnRlcmFjdGl2ZURpc2NsYWltZXJJY29uKHRoaXMpO1xuICAgICAgICB0aGlzLnJvb3RFbF8ucHJlcGVuZCh0aGlzLmRpc2NsYWltZXJJY29uXyk7XG4gICAgICB9XG4gICAgICBjcmVhdGVTaGFkb3dSb290V2l0aFN0eWxlKFxuICAgICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICAgIGRldigpLmFzc2VydEVsZW1lbnQodGhpcy5yb290RWxfKSxcbiAgICAgICAgQ1NTICsgY29uY3JldGVDU1NcbiAgICAgICk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGxvYWRGb250c18oKSB7XG4gICAgaWYgKFxuICAgICAgIUFtcFN0b3J5SW50ZXJhY3RpdmUubG9hZGVkRm9udHMgJiZcbiAgICAgIHRoaXMud2luLmRvY3VtZW50LmZvbnRzICYmXG4gICAgICBGb250RmFjZVxuICAgICkge1xuICAgICAgZm9udHNUb0xvYWQuZm9yRWFjaCgoZm9udFByb3BlcnRpZXMpID0+IHtcbiAgICAgICAgY29uc3QgZm9udCA9IG5ldyBGb250RmFjZShmb250UHJvcGVydGllcy5mYW1pbHksIGZvbnRQcm9wZXJ0aWVzLnNyYywge1xuICAgICAgICAgIHdlaWdodDogZm9udFByb3BlcnRpZXMud2VpZ2h0LFxuICAgICAgICAgIHN0eWxlOiAnbm9ybWFsJyxcbiAgICAgICAgfSk7XG4gICAgICAgIGZvbnQubG9hZCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHRoaXMud2luLmRvY3VtZW50LmZvbnRzLmFkZChmb250KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgQW1wU3RvcnlJbnRlcmFjdGl2ZS5sb2FkZWRGb250cyA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogUmVhZHMgdGhlIGVsZW1lbnQgYXR0cmlidXRlcyBwcmVmaXhlZCB3aXRoIG9wdGlvbi0gYW5kIHJldHVybnMgdGhlbSBhcyBhIGxpc3QuXG4gICAqIGVnOiBbXG4gICAqICAgICAge29wdGlvbkluZGV4OiAwLCB0ZXh0OiAnS29hbGEnfSxcbiAgICogICAgICB7b3B0aW9uSW5kZXg6IDEsIHRleHQ6ICdEZXZlbG9wZXJzJywgY29ycmVjdDogJyd9XG4gICAqICAgIF1cbiAgICogQHByb3RlY3RlZFxuICAgKiBAcmV0dXJuIHs/QXJyYXk8IU9wdGlvbkNvbmZpZ1R5cGU+fVxuICAgKi9cbiAgcGFyc2VPcHRpb25zXygpIHtcbiAgICBjb25zdCBvcHRpb25zID0gW107XG4gICAgdG9BcnJheSh0aGlzLmVsZW1lbnQuYXR0cmlidXRlcykuZm9yRWFjaCgoYXR0cikgPT4ge1xuICAgICAgLy8gTWF0Y2ggJ29wdGlvbi0jLXR5cGUnIChlZzogb3B0aW9uLTEtdGV4dCwgb3B0aW9uLTItaW1hZ2UsIG9wdGlvbi0zLWNvcnJlY3QuLi4pXG4gICAgICBpZiAoYXR0ci5uYW1lLm1hdGNoKC9eb3B0aW9uLVxcZCsoLVxcdyspKyQvKSkge1xuICAgICAgICBjb25zdCBzcGxpdFBhcnRzID0gYXR0ci5uYW1lLnNwbGl0KCctJyk7XG4gICAgICAgIGNvbnN0IG9wdGlvbk51bWJlciA9IHBhcnNlSW50KHNwbGl0UGFydHNbMV0sIDEwKTtcbiAgICAgICAgLy8gQWRkIGFsbCBvcHRpb25zIGluIG9yZGVyIG9uIHRoZSBhcnJheSB3aXRoIGNvcnJlY3QgaW5kZXguXG4gICAgICAgIHdoaWxlIChvcHRpb25zLmxlbmd0aCA8IG9wdGlvbk51bWJlcikge1xuICAgICAgICAgIG9wdGlvbnMucHVzaCh7J29wdGlvbkluZGV4Jzogb3B0aW9ucy5sZW5ndGh9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBrZXkgPSBzcGxpdFBhcnRzLnNsaWNlKDIpLmpvaW4oJycpO1xuICAgICAgICBpZiAoa2V5ID09PSAnaW1hZ2UnKSB7XG4gICAgICAgICAgb3B0aW9uc1tvcHRpb25OdW1iZXIgLSAxXVtrZXldID0gbWF5YmVNYWtlUHJveHlVcmwoXG4gICAgICAgICAgICBhdHRyLnZhbHVlLFxuICAgICAgICAgICAgdGhpcy5nZXRBbXBEb2MoKVxuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3B0aW9uc1tvcHRpb25OdW1iZXIgLSAxXVtrZXldID0gYXR0ci52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChcbiAgICAgIG9wdGlvbnMubGVuZ3RoID49IHRoaXMub3B0aW9uQm91bmRzX1swXSAmJlxuICAgICAgb3B0aW9ucy5sZW5ndGggPD0gdGhpcy5vcHRpb25Cb3VuZHNfWzFdXG4gICAgKSB7XG4gICAgICByZXR1cm4gb3B0aW9ucztcbiAgICB9XG4gICAgZGV2QXNzZXJ0KFxuICAgICAgb3B0aW9ucy5sZW5ndGggPj0gdGhpcy5vcHRpb25Cb3VuZHNfWzBdICYmXG4gICAgICAgIG9wdGlvbnMubGVuZ3RoIDw9IHRoaXMub3B0aW9uQm91bmRzX1sxXSxcbiAgICAgIGBJbXByb3BlciBudW1iZXIgb2Ygb3B0aW9ucy4gRXhwZWN0ZWQgJHt0aGlzLm9wdGlvbkJvdW5kc19bMF19IDw9IG9wdGlvbnMgPD0gJHt0aGlzLm9wdGlvbkJvdW5kc19bMV19IGJ1dCBnb3QgJHtvcHRpb25zLmxlbmd0aH0uYFxuICAgICk7XG4gICAgZGV2KCkuZXJyb3IoXG4gICAgICBUQUcsXG4gICAgICBgSW1wcm9wZXIgbnVtYmVyIG9mIG9wdGlvbnMuIEV4cGVjdGVkICR7dGhpcy5vcHRpb25Cb3VuZHNfWzBdfSA8PSBvcHRpb25zIDw9ICR7dGhpcy5vcHRpb25Cb3VuZHNfWzFdfSBidXQgZ290ICR7b3B0aW9ucy5sZW5ndGh9LmBcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmRzIHRoZSBwcm9tcHQgYW5kIGFkZHMgaXQgdG8gdGhlIHByb21wdC1jb250YWluZXJcbiAgICpcbiAgICogQHByb3RlY3RlZFxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IHJvb3RcbiAgICovXG4gIGF0dGFjaFByb21wdF8ocm9vdCkge1xuICAgIGNvbnN0IHByb21wdENvbnRhaW5lciA9IHJvb3QucXVlcnlTZWxlY3RvcihcbiAgICAgICcuaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLXByb21wdC1jb250YWluZXInXG4gICAgKTtcblxuICAgIGlmICghdGhpcy5lbGVtZW50Lmhhc0F0dHJpYnV0ZSgncHJvbXB0LXRleHQnKSkge1xuICAgICAgdGhpcy5yb290RWxfLnJlbW92ZUNoaWxkKHByb21wdENvbnRhaW5lcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHByb21wdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICAgIHByb21wdC50ZXh0Q29udGVudCA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3Byb21wdC10ZXh0Jyk7XG4gICAgICBwcm9tcHQuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLXByb21wdCcpO1xuICAgICAgcHJvbXB0Q29udGFpbmVyLmFwcGVuZENoaWxkKHByb21wdCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlcyB0aGUgdGVtcGxhdGUgZnJvbSB0aGUgY29uZmlnXyBNYXAuXG4gICAqXG4gICAqIEByZXR1cm4geyFFbGVtZW50fSByb290RWxfXG4gICAqIEBwcm90ZWN0ZWQgQGFic3RyYWN0XG4gICAqL1xuICBidWlsZENvbXBvbmVudCgpIHtcbiAgICAvLyBTdWJjbGFzcyBtdXN0IG92ZXJyaWRlLlxuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBsYXlvdXRDYWxsYmFjaygpIHtcbiAgICB0aGlzLmluaXRpYWxpemVMaXN0ZW5lcnNfKCk7XG4gICAgcmV0dXJuICh0aGlzLmJhY2tlbmREYXRhUHJvbWlzZV8gPSB0aGlzLmVsZW1lbnQuaGFzQXR0cmlidXRlKCdlbmRwb2ludCcpXG4gICAgICA/IHRoaXMucmV0cmlldmVJbnRlcmFjdGl2ZURhdGFfKClcbiAgICAgIDogUHJvbWlzZS5yZXNvbHZlKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBQcm9taXNlIHRvIHJldHVybiB0aGUgdW5pcXVlIEFNUCBjbGllbnRJZFxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPHN0cmluZz59XG4gICAqL1xuICBnZXRDbGllbnRJZF8oKSB7XG4gICAgaWYgKCF0aGlzLmNsaWVudElkUHJvbWlzZV8pIHtcbiAgICAgIHRoaXMuY2xpZW50SWRQcm9taXNlXyA9IFNlcnZpY2VzLmNpZEZvckRvYyh0aGlzLmVsZW1lbnQpLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgcmV0dXJuIGRhdGEuZ2V0KFxuICAgICAgICAgIHtzY29wZTogJ2FtcC1zdG9yeScsIGNyZWF0ZUNvb2tpZUlmTm90UHJlc2VudDogdHJ1ZX0sXG4gICAgICAgICAgLyogY29uc2VudCAqLyBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNsaWVudElkUHJvbWlzZV87XG4gIH1cblxuICAvKipcbiAgICogUmVhY3RzIHRvIFJUTCBzdGF0ZSB1cGRhdGVzIGFuZCB0cmlnZ2VycyB0aGUgVUkgZm9yIFJUTC5cbiAgICogQHBhcmFtIHtib29sZWFufSBydGxTdGF0ZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25SdGxTdGF0ZVVwZGF0ZV8ocnRsU3RhdGUpIHtcbiAgICB0aGlzLm11dGF0ZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgcnRsU3RhdGVcbiAgICAgICAgPyB0aGlzLnJvb3RFbF8uc2V0QXR0cmlidXRlKCdkaXInLCAncnRsJylcbiAgICAgICAgOiB0aGlzLnJvb3RFbF8ucmVtb3ZlQXR0cmlidXRlKCdkaXInKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaXNMYXlvdXRTdXBwb3J0ZWQobGF5b3V0KSB7XG4gICAgcmV0dXJuIGxheW91dCA9PT0gJ2NvbnRhaW5lcic7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGNsYXNzZXMgdG8gYWRqdXN0IHRoZSBib3R0b20gcGFkZGluZyBvbiB0aGUgZ3JpZC1sYXllclxuICAgKiB0byBwcmV2ZW50IG92ZXJsYXAgd2l0aCB0aGUgY29tcG9uZW50LlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYWRqdXN0R3JpZExheWVyXygpIHtcbiAgICBjb25zdCBncmlkTGF5ZXIgPSBjbG9zZXN0KGRldigpLmFzc2VydEVsZW1lbnQodGhpcy5lbGVtZW50KSwgKGVsKSA9PiB7XG4gICAgICByZXR1cm4gZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnYW1wLXN0b3J5LWdyaWQtbGF5ZXInO1xuICAgIH0pO1xuXG4gICAgZ3JpZExheWVyLmNsYXNzTGlzdC5hZGQoJ2ktYW1waHRtbC1zdG9yeS1oYXMtaW50ZXJhY3RpdmUnKTtcblxuICAgIGlmIChncmlkTGF5ZXIucGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKCdhbXAtc3RvcnktY3RhLWxheWVyJykpIHtcbiAgICAgIGdyaWRMYXllci5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3RvcnktaGFzLUNUQS1sYXllcicpO1xuICAgIH1cblxuICAgIGlmIChncmlkTGF5ZXIucGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKCdhbXAtc3RvcnktcGFnZS1hdHRhY2htZW50JykpIHtcbiAgICAgIGdyaWRMYXllci5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3RvcnktaGFzLXBhZ2UtYXR0YWNobWVudCcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyBmdW5jdGlvbnMgdG8gZWFjaCBvcHRpb24gdG8gaGFuZGxlIHN0YXRlIHRyYW5zaXRpb24uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpbml0aWFsaXplTGlzdGVuZXJzXygpIHtcbiAgICB0aGlzLnN0b3JlU2VydmljZV8uc3Vic2NyaWJlKFxuICAgICAgU3RhdGVQcm9wZXJ0eS5SVExfU1RBVEUsXG4gICAgICAocnRsU3RhdGUpID0+IHtcbiAgICAgICAgdGhpcy5vblJ0bFN0YXRlVXBkYXRlXyhydGxTdGF0ZSk7XG4gICAgICB9LFxuICAgICAgdHJ1ZSAvKiogY2FsbFRvSW5pdGlhbGl6ZSAqL1xuICAgICk7XG5cbiAgICAvLyBDaGVjayBpZiB0aGUgY29tcG9uZW50IHBhZ2UgaXMgYWN0aXZlLCBhbmQgYWRkIGNsYXNzLlxuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5zdWJzY3JpYmUoXG4gICAgICBTdGF0ZVByb3BlcnR5LkNVUlJFTlRfUEFHRV9JRCxcbiAgICAgIChjdXJyUGFnZUlkKSA9PiB7XG4gICAgICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PiB7XG4gICAgICAgICAgY29uc3QgdG9nZ2xlID0gY3VyclBhZ2VJZCA9PT0gdGhpcy5nZXRQYWdlRWwoKS5nZXRBdHRyaWJ1dGUoJ2lkJyk7XG4gICAgICAgICAgdGhpcy5yb290RWxfLmNsYXNzTGlzdC50b2dnbGUoSU5URVJBQ1RJVkVfQUNUSVZFX0NMQVNTLCB0b2dnbGUpO1xuICAgICAgICAgIHRoaXMudG9nZ2xlVGFiYmFibGVFbGVtZW50c18odG9nZ2xlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY2xvc2VEaXNjbGFpbWVyXygpO1xuICAgICAgfSxcbiAgICAgIHRydWUgLyoqIGNhbGxUb0luaXRpYWxpemUgKi9cbiAgICApO1xuXG4gICAgdGhpcy5yb290RWxfLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHRoaXMuaGFuZGxlVGFwXyhlKSk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBhIHRhcCBldmVudCBvbiB0aGUgcXVpeiBlbGVtZW50LlxuICAgKiBAcGFyYW0ge0V2ZW50fSBlXG4gICAqIEBwcm90ZWN0ZWRcbiAgICovXG4gIGhhbmRsZVRhcF8oZSkge1xuICAgIGlmIChlLnRhcmdldCA9PSB0aGlzLmRpc2NsYWltZXJJY29uXyAmJiAhdGhpcy5kaXNjbGFpbWVyRWxfKSB7XG4gICAgICB0aGlzLm9wZW5EaXNjbGFpbWVyXygpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmhhc1VzZXJTZWxlY3Rpb25fKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgb3B0aW9uRWwgPSBjbG9zZXN0KFxuICAgICAgZGV2KCkuYXNzZXJ0RWxlbWVudChlLnRhcmdldCksXG4gICAgICAoZWxlbWVudCkgPT4ge1xuICAgICAgICByZXR1cm4gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2ktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1vcHRpb24nKTtcbiAgICAgIH0sXG4gICAgICB0aGlzLnJvb3RFbF9cbiAgICApO1xuXG4gICAgaWYgKG9wdGlvbkVsKSB7XG4gICAgICB0aGlzLnVwZGF0ZVN0b3J5U3RvcmVTdGF0ZV8ob3B0aW9uRWwub3B0aW9uSW5kZXhfKTtcbiAgICAgIHRoaXMuaGFuZGxlT3B0aW9uU2VsZWN0aW9uXyhvcHRpb25FbC5vcHRpb25JbmRleF8sIG9wdGlvbkVsKTtcbiAgICAgIGNvbnN0IGNvbmZldHRpRW1vamkgPSB0aGlzLm9wdGlvbnNfW29wdGlvbkVsLm9wdGlvbkluZGV4X10uY29uZmV0dGk7XG4gICAgICBpZiAoY29uZmV0dGlFbW9qaSkge1xuICAgICAgICBlbW9qaUNvbmZldHRpKFxuICAgICAgICAgIGRldigpLmFzc2VydEVsZW1lbnQodGhpcy5yb290RWxfKSxcbiAgICAgICAgICB0aGlzLndpbixcbiAgICAgICAgICBjb25mZXR0aUVtb2ppXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB0aGlzLmNsb3NlRGlzY2xhaW1lcl8oKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlcnMgdGhlIGFuYWx5dGljcyBldmVudCBmb3IgcXVpeiByZXNwb25zZS5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IG9wdGlvbkluZGV4XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB0cmlnZ2VyQW5hbHl0aWNzXyhvcHRpb25JbmRleCkge1xuICAgIHRoaXMudmFyaWFibGVTZXJ2aWNlXy5vblZhcmlhYmxlVXBkYXRlKFxuICAgICAgQW5hbHl0aWNzVmFyaWFibGUuU1RPUllfSU5URVJBQ1RJVkVfSUQsXG4gICAgICB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdpZCcpXG4gICAgKTtcbiAgICB0aGlzLnZhcmlhYmxlU2VydmljZV8ub25WYXJpYWJsZVVwZGF0ZShcbiAgICAgIEFuYWx5dGljc1ZhcmlhYmxlLlNUT1JZX0lOVEVSQUNUSVZFX1JFU1BPTlNFLFxuICAgICAgb3B0aW9uSW5kZXhcbiAgICApO1xuICAgIHRoaXMudmFyaWFibGVTZXJ2aWNlXy5vblZhcmlhYmxlVXBkYXRlKFxuICAgICAgQW5hbHl0aWNzVmFyaWFibGUuU1RPUllfSU5URVJBQ1RJVkVfVFlQRSxcbiAgICAgIHRoaXMuaW50ZXJhY3RpdmVUeXBlX1xuICAgICk7XG5cbiAgICB0aGlzLmVsZW1lbnRbQU5BTFlUSUNTX1RBR19OQU1FXSA9IHRoaXMuZWxlbWVudC50YWdOYW1lO1xuICAgIHRoaXMuYW5hbHl0aWNzU2VydmljZV8udHJpZ2dlckV2ZW50KFxuICAgICAgU3RvcnlBbmFseXRpY3NFdmVudC5JTlRFUkFDVElWRSxcbiAgICAgIHRoaXMuZWxlbWVudFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIGNvbXBvbmVudCB0byByZWZsZWN0IHZhbHVlcyBpbiB0aGUgZGF0YSBvYnRhaW5lZC5cbiAgICogQ2FsbGVkIHdoZW4gdXNlciBoYXMgcmVzcG9uZGVkIChpbiB0aGlzIHNlc3Npb24gb3IgYmVmb3JlKS5cbiAgICpcbiAgICogQHByb3RlY3RlZCBAYWJzdHJhY3RcbiAgICogQHBhcmFtIHshQXJyYXk8IUludGVyYWN0aXZlT3B0aW9uVHlwZT59IHVudXNlZE9wdGlvbnNEYXRhXG4gICAqL1xuICBkaXNwbGF5T3B0aW9uc0RhdGEodW51c2VkT3B0aW9uc0RhdGEpIHtcbiAgICAvLyBTdWJjbGFzcyBtdXN0IGltcGxlbWVudFxuICB9XG5cbiAgLyoqXG4gICAqIFByZXByb2Nlc3MgdGhlIHBlcmNlbnRhZ2VzIGZvciBkaXNwbGF5LlxuICAgKlxuICAgKiBAcGFyYW0geyFBcnJheTwhSW50ZXJhY3RpdmVPcHRpb25UeXBlPn0gb3B0aW9uc0RhdGFcbiAgICogQHJldHVybiB7QXJyYXk8bnVtYmVyPn1cbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgcHJlcHJvY2Vzc1BlcmNlbnRhZ2VzXyhvcHRpb25zRGF0YSkge1xuICAgIGNvbnN0IHRvdGFsUmVzcG9uc2VDb3VudCA9IG9wdGlvbnNEYXRhLnJlZHVjZShcbiAgICAgIChhY2MsIHJlc3BvbnNlKSA9PiBhY2MgKyByZXNwb25zZVsnY291bnQnXSxcbiAgICAgIDBcbiAgICApO1xuXG4gICAgbGV0IHBlcmNlbnRhZ2VzID0gb3B0aW9uc0RhdGEubWFwKChlKSA9PlxuICAgICAgKCgxMDAgKiBlWydjb3VudCddKSAvIHRvdGFsUmVzcG9uc2VDb3VudCkudG9GaXhlZCgyKVxuICAgICk7XG4gICAgbGV0IHRvdGFsID0gcGVyY2VudGFnZXMucmVkdWNlKChhY2MsIHgpID0+IGFjYyArIE1hdGgucm91bmQoeCksIDApO1xuXG4gICAgLy8gU3BlY2lhbCBjYXNlOiBkaXZpZGUgcmVtYWluZGVycyBieSB0aHJlZSBpZiB0aGV5IGJyZWFrIDEwMCxcbiAgICAvLyAzIGlzIHRoZSBtYXhpbXVtIGFib3ZlIDEwMCB0aGUgcmVtYWluZGVycyBjYW4gYWRkLlxuICAgIGlmICh0b3RhbCA+IDEwMCkge1xuICAgICAgcGVyY2VudGFnZXMgPSBwZXJjZW50YWdlcy5tYXAoKHBlcmNlbnRhZ2UpID0+XG4gICAgICAgIChwZXJjZW50YWdlIC0gKDIgKiAocGVyY2VudGFnZSAtIE1hdGguZmxvb3IocGVyY2VudGFnZSkpKSAvIDMpLnRvRml4ZWQoXG4gICAgICAgICAgMlxuICAgICAgICApXG4gICAgICApO1xuICAgICAgdG90YWwgPSBwZXJjZW50YWdlcy5yZWR1Y2UoKGFjYywgeCkgPT4gKGFjYyArPSBNYXRoLnJvdW5kKHgpKSwgMCk7XG4gICAgfVxuXG4gICAgaWYgKHRvdGFsID09PSAxMDApIHtcbiAgICAgIHJldHVybiBwZXJjZW50YWdlcy5tYXAoKHBlcmNlbnRhZ2UpID0+IE1hdGgucm91bmQocGVyY2VudGFnZSkpO1xuICAgIH1cblxuICAgIC8vIFRydW5jYXRlIGFsbCBhbmQgcm91bmQgdXAgdGhvc2Ugd2l0aCB0aGUgaGlnaGVzdCByZW1haW5kZXJzLFxuICAgIC8vIHByZXNlcnZpbmcgb3JkZXIgYW5kIHRpZXMgYW5kIGFkZGluZyB0byAxMDAgKGlmIHBvc3NpYmxlIGdpdmVuIHRpZXMgYW5kIG9yZGVyaW5nKS5cbiAgICBsZXQgcmVtYWluZGVyID0gMTAwIC0gdG90YWw7XG5cbiAgICBsZXQgcHJlc2VydmVPcmlnaW5hbCA9IHBlcmNlbnRhZ2VzLm1hcCgocGVyY2VudGFnZSwgaW5kZXgpID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG9yaWdpbmFsSW5kZXg6IGluZGV4LFxuICAgICAgICB2YWx1ZTogcGVyY2VudGFnZSxcbiAgICAgICAgcmVtYWluZGVyOiAocGVyY2VudGFnZSAtIE1hdGguZmxvb3IocGVyY2VudGFnZSkpLnRvRml4ZWQoMiksXG4gICAgICB9O1xuICAgIH0pO1xuICAgIHByZXNlcnZlT3JpZ2luYWwuc29ydChcbiAgICAgIChsZWZ0LCByaWdodCkgPT5cbiAgICAgICAgLy8gQnJlYWsgcmVtYWluZGVyIHRpZXMgdXNpbmcgdGhlIGhpZ2hlciB2YWx1ZS5cbiAgICAgICAgcmlnaHQucmVtYWluZGVyIC0gbGVmdC5yZW1haW5kZXIgfHwgcmlnaHQudmFsdWUgLSBsZWZ0LnZhbHVlXG4gICAgKTtcblxuICAgIGNvbnN0IGZpbmFsUGVyY2VudGFnZXMgPSBbXTtcbiAgICB3aGlsZSAocmVtYWluZGVyID4gMCAmJiBwcmVzZXJ2ZU9yaWdpbmFsLmxlbmd0aCAhPT0gMCkge1xuICAgICAgY29uc3QgaGlnaGVzdFJlbWFpbmRlck9iaiA9IHByZXNlcnZlT3JpZ2luYWxbMF07XG5cbiAgICAgIGNvbnN0IHRpZXMgPSBwcmVzZXJ2ZU9yaWdpbmFsLmZpbHRlcihcbiAgICAgICAgKHBlcmNlbnRhZ2VPYmopID0+IHBlcmNlbnRhZ2VPYmoudmFsdWUgPT09IGhpZ2hlc3RSZW1haW5kZXJPYmoudmFsdWVcbiAgICAgICk7XG4gICAgICBwcmVzZXJ2ZU9yaWdpbmFsID0gcHJlc2VydmVPcmlnaW5hbC5maWx0ZXIoXG4gICAgICAgIChwZXJjZW50YWdlT2JqKSA9PiBwZXJjZW50YWdlT2JqLnZhbHVlICE9PSBoaWdoZXN0UmVtYWluZGVyT2JqLnZhbHVlXG4gICAgICApO1xuXG4gICAgICBjb25zdCB0b1JvdW5kVXAgPVxuICAgICAgICB0aWVzLmxlbmd0aCA8PSByZW1haW5kZXIgJiYgaGlnaGVzdFJlbWFpbmRlck9iai5yZW1haW5kZXIgIT09ICcwLjAwJztcblxuICAgICAgdGllcy5mb3JFYWNoKChwZXJjZW50YWdlT2JqKSA9PiB7XG4gICAgICAgIGZpbmFsUGVyY2VudGFnZXNbcGVyY2VudGFnZU9iai5vcmlnaW5hbEluZGV4XSA9XG4gICAgICAgICAgTWF0aC5mbG9vcihwZXJjZW50YWdlT2JqLnZhbHVlKSArICh0b1JvdW5kVXAgPyAxIDogMCk7XG4gICAgICB9KTtcblxuICAgICAgLy8gVXBkYXRlIHRoZSByZW1haW5kZXIgZ2l2ZW4gYWRkaXRpb25zIHRvIHRoZSBwZXJjZW50YWdlcy5cbiAgICAgIHJlbWFpbmRlciAtPSB0b1JvdW5kVXAgPyB0aWVzLmxlbmd0aCA6IDA7XG4gICAgfVxuXG4gICAgcHJlc2VydmVPcmlnaW5hbC5mb3JFYWNoKChwZXJjZW50YWdlT2JqKSA9PiB7XG4gICAgICBmaW5hbFBlcmNlbnRhZ2VzW3BlcmNlbnRhZ2VPYmoub3JpZ2luYWxJbmRleF0gPSBNYXRoLmZsb29yKFxuICAgICAgICBwZXJjZW50YWdlT2JqLnZhbHVlXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGZpbmFsUGVyY2VudGFnZXM7XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlcnMgY2hhbmdlcyB0byBjb21wb25lbnQgc3RhdGUgb24gcmVzcG9uc2UgaW50ZXJhY3RpdmUuXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25JbmRleFxuICAgKiBAcGFyYW0gez9FbGVtZW50fSBvcHRpb25FbFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaGFuZGxlT3B0aW9uU2VsZWN0aW9uXyhvcHRpb25JbmRleCwgb3B0aW9uRWwpIHtcbiAgICB0aGlzLmJhY2tlbmREYXRhUHJvbWlzZV9cbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuaGFzVXNlclNlbGVjdGlvbl8pIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnRyaWdnZXJBbmFseXRpY3NfKG9wdGlvbkluZGV4KTtcbiAgICAgICAgdGhpcy5oYXNVc2VyU2VsZWN0aW9uXyA9IHRydWU7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9uc0RhdGFfKSB7XG4gICAgICAgICAgdGhpcy5vcHRpb25zRGF0YV9bb3B0aW9uSW5kZXhdWydjb3VudCddKys7XG4gICAgICAgICAgdGhpcy5vcHRpb25zRGF0YV9bb3B0aW9uSW5kZXhdWydzZWxlY3RlZCddID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy51cGRhdGVUb1Bvc3RTZWxlY3Rpb25TdGF0ZV8ob3B0aW9uRWwpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGhpcy5lbGVtZW50Lmhhc0F0dHJpYnV0ZSgnZW5kcG9pbnQnKSkge1xuICAgICAgICAgIHRoaXMuZXhlY3V0ZUludGVyYWN0aXZlUmVxdWVzdF8oJ1BPU1QnLCBvcHRpb25JbmRleCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAvLyBJZiBiYWNrZW5kIGlzIG5vdCBwcm9wZXJseSBjb25uZWN0ZWQsIHN0aWxsIHVwZGF0ZSBzdGF0ZS5cbiAgICAgICAgdGhpcy50cmlnZ2VyQW5hbHl0aWNzXyhvcHRpb25JbmRleCk7XG4gICAgICAgIHRoaXMuaGFzVXNlclNlbGVjdGlvbl8gPSB0cnVlO1xuICAgICAgICB0aGlzLm11dGF0ZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMudXBkYXRlVG9Qb3N0U2VsZWN0aW9uU3RhdGVfKG9wdGlvbkVsKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIEludGVyYWN0aXZlIGRhdGEgZnJvbSB0aGUgZGF0YXN0b3JlXG4gICAqXG4gICAqIEByZXR1cm4gez9Qcm9taXNlPD9JbnRlcmFjdGl2ZVJlc3BvbnNlVHlwZXw/SnNvbk9iamVjdHx1bmRlZmluZWQ+fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcmV0cmlldmVJbnRlcmFjdGl2ZURhdGFfKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWN1dGVJbnRlcmFjdGl2ZVJlcXVlc3RfKCdHRVQnKS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgdGhpcy5vbkRhdGFSZXRyaWV2ZWRfKC8qKiBAdHlwZSB7SW50ZXJhY3RpdmVSZXNwb25zZVR5cGV9ICovIChyZXNwb25zZSkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGVzIGEgSW50ZXJhY3RpdmUgQVBJIGNhbGwuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2QgR0VUIG9yIFBPU1QuXG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gb3B0aW9uU2VsZWN0ZWRcbiAgICogQHJldHVybiB7IVByb21pc2U8IUludGVyYWN0aXZlUmVzcG9uc2VUeXBlfHN0cmluZz59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBleGVjdXRlSW50ZXJhY3RpdmVSZXF1ZXN0XyhtZXRob2QsIG9wdGlvblNlbGVjdGVkID0gdW5kZWZpbmVkKSB7XG4gICAgbGV0IHVybCA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2VuZHBvaW50Jyk7XG4gICAgaWYgKCFhc3NlcnRBYnNvbHV0ZUh0dHBPckh0dHBzVXJsKHVybCkpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChFTkRQT0lOVF9JTlZBTElEX0VSUk9SKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5nZXRDbGllbnRJZF8oKS50aGVuKChjbGllbnRJZCkgPT4ge1xuICAgICAgY29uc3QgcmVxdWVzdE9wdGlvbnMgPSB7J21ldGhvZCc6IG1ldGhvZH07XG4gICAgICBjb25zdCByZXF1ZXN0UGFyYW1zID0gZGljdCh7XG4gICAgICAgICd0eXBlJzogdGhpcy5pbnRlcmFjdGl2ZVR5cGVfLFxuICAgICAgICAnY2xpZW50JzogY2xpZW50SWQsXG4gICAgICB9KTtcbiAgICAgIHVybCA9IGFwcGVuZFBhdGhUb1VybChcbiAgICAgICAgdGhpcy51cmxTZXJ2aWNlXy5wYXJzZSh1cmwpLFxuICAgICAgICB0aGlzLmdldEludGVyYWN0aXZlSWRfKClcbiAgICAgICk7XG4gICAgICBpZiAocmVxdWVzdE9wdGlvbnNbJ21ldGhvZCddID09PSAnUE9TVCcpIHtcbiAgICAgICAgcmVxdWVzdE9wdGlvbnNbJ2JvZHknXSA9IHsnb3B0aW9uX3NlbGVjdGVkJzogb3B0aW9uU2VsZWN0ZWR9O1xuICAgICAgICByZXF1ZXN0T3B0aW9uc1snaGVhZGVycyddID0geydDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbid9O1xuICAgICAgICB1cmwgPSBhcHBlbmRQYXRoVG9VcmwodGhpcy51cmxTZXJ2aWNlXy5wYXJzZSh1cmwpLCAnOnZvdGUnKTtcbiAgICAgIH1cbiAgICAgIHVybCA9IGFkZFBhcmFtc1RvVXJsKHVybCwgcmVxdWVzdFBhcmFtcyk7XG4gICAgICByZXR1cm4gdGhpcy5yZXF1ZXN0U2VydmljZV9cbiAgICAgICAgLmV4ZWN1dGVSZXF1ZXN0KHVybCwgcmVxdWVzdE9wdGlvbnMpXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiBkZXYoKS5lcnJvcihUQUcsIGVycikpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgaW5jb21pbmcgaW50ZXJhY3RpdmUgZGF0YSByZXNwb25zZVxuICAgKlxuICAgKiBSRVNQT05TRSBGT1JNQVRcbiAgICoge1xuICAgKiAgb3B0aW9uczogW1xuICAgKiAgICB7XG4gICAqICAgICAgaW5kZXg6XG4gICAqICAgICAgY291bnQ6XG4gICAqICAgICAgc2VsZWN0ZWQ6XG4gICAqICAgIH0sXG4gICAqICAgIC4uLlxuICAgKiAgXVxuICAgKiB9XG4gICAqIEBwYXJhbSB7SW50ZXJhY3RpdmVSZXNwb25zZVR5cGV8dW5kZWZpbmVkfSByZXNwb25zZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25EYXRhUmV0cmlldmVkXyhyZXNwb25zZSkge1xuICAgIGlmICghKHJlc3BvbnNlICYmIHJlc3BvbnNlWydvcHRpb25zJ10pKSB7XG4gICAgICBkZXZBc3NlcnQoXG4gICAgICAgIHJlc3BvbnNlICYmICdvcHRpb25zJyBpbiByZXNwb25zZSxcbiAgICAgICAgYEludmFsaWQgaW50ZXJhY3RpdmUgcmVzcG9uc2UsIGV4cGVjdGVkIHsgZGF0YTogSW50ZXJhY3RpdmVSZXNwb25zZVR5cGUsIC4uLn0gYnV0IHJlY2VpdmVkICR7cmVzcG9uc2V9YFxuICAgICAgKTtcbiAgICAgIGRldigpLmVycm9yKFxuICAgICAgICBUQUcsXG4gICAgICAgIGBJbnZhbGlkIGludGVyYWN0aXZlIHJlc3BvbnNlLCBleHBlY3RlZCB7IGRhdGE6IEludGVyYWN0aXZlUmVzcG9uc2VUeXBlLCAuLi59IGJ1dCByZWNlaXZlZCAke3Jlc3BvbnNlfWBcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG51bU9wdGlvbnMgPSB0aGlzLmdldE51bWJlck9mT3B0aW9ucygpO1xuICAgIC8vIE9ubHkga2VlcCB0aGUgdmlzaWJsZSBvcHRpb25zIHRvIGVuc3VyZSB2aXNpYmxlIHBlcmNlbnRhZ2VzIGFkZCB1cCB0byAxMDAuXG4gICAgdGhpcy51cGRhdGVDb21wb25lbnRXaXRoRGF0YShyZXNwb25zZVsnb3B0aW9ucyddLnNsaWNlKDAsIG51bU9wdGlvbnMpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBxdWl6IHRvIHJlZmxlY3QgdGhlIHN0YXRlIG9mIHRoZSByZW1vdGUgZGF0YS5cbiAgICogQHBhcmFtIHshQXJyYXk8SW50ZXJhY3RpdmVPcHRpb25UeXBlPn0gZGF0YVxuICAgKiBAcHJvdGVjdGVkXG4gICAqL1xuICB1cGRhdGVDb21wb25lbnRXaXRoRGF0YShkYXRhKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMucm9vdEVsXy5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgJy5pLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtb3B0aW9uJ1xuICAgICk7XG5cbiAgICB0aGlzLm9wdGlvbnNEYXRhXyA9IHRoaXMub3JkZXJEYXRhXyhkYXRhKTtcbiAgICB0aGlzLm9wdGlvbnNEYXRhXy5mb3JFYWNoKChyZXNwb25zZSkgPT4ge1xuICAgICAgaWYgKHJlc3BvbnNlLnNlbGVjdGVkKSB7XG4gICAgICAgIHRoaXMuaGFzVXNlclNlbGVjdGlvbl8gPSB0cnVlO1xuICAgICAgICB0aGlzLnVwZGF0ZVN0b3J5U3RvcmVTdGF0ZV8ocmVzcG9uc2UuaW5kZXgpO1xuICAgICAgICB0aGlzLm11dGF0ZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMudXBkYXRlVG9Qb3N0U2VsZWN0aW9uU3RhdGVfKG9wdGlvbnNbcmVzcG9uc2UuaW5kZXhdKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgc2VsZWN0ZWQgY2xhc3NlcyBvbiBjb21wb25lbnQgYW5kIG9wdGlvbiBzZWxlY3RlZC5cbiAgICogQHBhcmFtIHs/RWxlbWVudH0gc2VsZWN0ZWRPcHRpb25cbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgdXBkYXRlVG9Qb3N0U2VsZWN0aW9uU3RhdGVfKHNlbGVjdGVkT3B0aW9uKSB7XG4gICAgdGhpcy5yb290RWxfLmNsYXNzTGlzdC5hZGQoUE9TVF9TRUxFQ1RJT05fQ0xBU1MpO1xuICAgIGlmIChzZWxlY3RlZE9wdGlvbiAhPSBudWxsKSB7XG4gICAgICBzZWxlY3RlZE9wdGlvbi5jbGFzc0xpc3QuYWRkKFxuICAgICAgICAnaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW9wdGlvbi1zZWxlY3RlZCdcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9uc0RhdGFfKSB7XG4gICAgICB0aGlzLnJvb3RFbF8uY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLWhhcy1kYXRhJyk7XG4gICAgICB0aGlzLmRpc3BsYXlPcHRpb25zRGF0YSh0aGlzLm9wdGlvbnNEYXRhXyk7XG4gICAgfVxuICAgIHRoaXMuZ2V0T3B0aW9uRWxlbWVudHMoKS5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgZWwuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsIC0xKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqIEBwYXJhbSB7P251bWJlcn0gb3B0aW9uXG4gICAqL1xuICB1cGRhdGVTdG9yeVN0b3JlU3RhdGVfKG9wdGlvbiA9IG51bGwpIHtcbiAgICBjb25zdCB1cGRhdGUgPSB7XG4gICAgICBvcHRpb246IG9wdGlvbiAhPSBudWxsID8gdGhpcy5vcHRpb25zX1tvcHRpb25dIDogbnVsbCxcbiAgICAgIGludGVyYWN0aXZlSWQ6IHRoaXMuZ2V0SW50ZXJhY3RpdmVJZF8oKSxcbiAgICAgIHR5cGU6IHRoaXMuaW50ZXJhY3RpdmVUeXBlXyxcbiAgICB9O1xuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5kaXNwYXRjaChBY3Rpb24uQUREX0lOVEVSQUNUSVZFX1JFQUNULCB1cGRhdGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIHRhYmJhYmxlIGVsZW1lbnRzIChidXR0b25zLCBsaW5rcywgZXRjKSB0byBvbmx5IHJlYWNoIHRoZW0gd2hlbiBwYWdlIGlzIGFjdGl2ZS5cbiAgICogQHBhcmFtIHtib29sZWFufSB0b2dnbGVcbiAgICovXG4gIHRvZ2dsZVRhYmJhYmxlRWxlbWVudHNfKHRvZ2dsZSkge1xuICAgIHRoaXMucm9vdEVsXy5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24sIGEnKS5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgLy8gRGlzYWJsZSB0YWJiaW5nIHRocm91Z2ggb3B0aW9ucyBpZiBhbHJlYWR5IHNlbGVjdGVkLlxuICAgICAgaWYgKFxuICAgICAgICBlbC5jbGFzc0xpc3QuY29udGFpbnMoJ2ktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1vcHRpb24nKSAmJlxuICAgICAgICB0aGlzLmhhc1VzZXJTZWxlY3Rpb25fXG4gICAgICApIHtcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsIC0xKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsLnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCB0b2dnbGUgPyAwIDogLTEpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBvcHRpb25zLlxuICAgKlxuICAgKiBAcHJvdGVjdGVkXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICovXG4gIGdldE51bWJlck9mT3B0aW9ucygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRPcHRpb25FbGVtZW50cygpLmxlbmd0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW9yZGVycyBvcHRpb25zIGRhdGEgdG8gYWNjb3VudCBmb3Igc2NyYW1ibGVkIG9yIGluY29tcGxldGUgZGF0YS5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHshQXJyYXk8IUludGVyYWN0aXZlT3B0aW9uVHlwZT59IG9wdGlvbnNEYXRhXG4gICAqIEByZXR1cm4geyFBcnJheTwhSW50ZXJhY3RpdmVPcHRpb25UeXBlPn1cbiAgICovXG4gIG9yZGVyRGF0YV8ob3B0aW9uc0RhdGEpIHtcbiAgICBjb25zdCBudW1PcHRpb25FbGVtZW50cyA9IHRoaXMuZ2V0TnVtYmVyT2ZPcHRpb25zKCk7XG4gICAgY29uc3Qgb3JkZXJlZERhdGEgPSBuZXcgQXJyYXkobnVtT3B0aW9uRWxlbWVudHMpO1xuICAgIG9wdGlvbnNEYXRhLmZvckVhY2goKG9wdGlvbikgPT4ge1xuICAgICAgY29uc3Qge2luZGV4fSA9IG9wdGlvbjtcbiAgICAgIGlmIChpbmRleCA+PSAwICYmIGluZGV4IDwgbnVtT3B0aW9uRWxlbWVudHMpIHtcbiAgICAgICAgb3JkZXJlZERhdGFbaW5kZXhdID0gb3B0aW9uO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcmVkRGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKCFvcmRlcmVkRGF0YVtpXSkge1xuICAgICAgICBvcmRlcmVkRGF0YVtpXSA9IHtcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBpbmRleDogaSxcbiAgICAgICAgICBzZWxlY3RlZDogZmFsc2UsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9yZGVyZWREYXRhO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIHRoZSBkaXNjbGFpbWVyIGRpYWxvZyBhbmQgcG9zaXRpb25zIGl0IGFjY29yZGluZyB0byB0aGUgcGFnZSBhbmQgaXRzZWxmLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb3BlbkRpc2NsYWltZXJfKCkge1xuICAgIGlmICh0aGlzLmRpc2NsYWltZXJFbF8pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZGlyID0gdGhpcy5yb290RWxfLmdldEF0dHJpYnV0ZSgnZGlyJykgfHwgJ2x0cic7XG4gICAgdGhpcy5kaXNjbGFpbWVyRWxfID0gYnVpbGRJbnRlcmFjdGl2ZURpc2NsYWltZXIodGhpcywge2Rpcn0pO1xuXG4gICAgbGV0IHN0eWxlcztcbiAgICB0aGlzLm1lYXN1cmVNdXRhdGVFbGVtZW50KFxuICAgICAgKCkgPT4ge1xuICAgICAgICAvLyBHZXQgcmVjdHMgYW5kIGNhbGN1bGF0ZSBwb3NpdGlvbiBmcm9tIGljb24uXG4gICAgICAgIGNvbnN0IGludGVyYWN0aXZlUmVjdCA9IHRoaXMuZWxlbWVudC4vKk9LKi8gZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IHBhZ2VSZWN0ID0gdGhpcy5nZXRQYWdlRWwoKS4vKk9LKi8gZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IGljb25SZWN0ID0gdGhpcy5kaXNjbGFpbWVySWNvbl8uLypPSyovIGdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCBib3R0b21GcmFjdGlvbiA9XG4gICAgICAgICAgMSAtIChpY29uUmVjdC55ICsgaWNvblJlY3QuaGVpZ2h0IC0gcGFnZVJlY3QueSkgLyBwYWdlUmVjdC5oZWlnaHQ7XG4gICAgICAgIGNvbnN0IHdpZHRoRnJhY3Rpb24gPSBpbnRlcmFjdGl2ZVJlY3Qud2lkdGggLyBwYWdlUmVjdC53aWR0aDtcblxuICAgICAgICAvLyBDbGFtcCB2YWx1ZXMgdG8gZW5zdXJlIGRpYWxvZyBoYXMgc3BhY2UgdXAgYW5kIGxlZnQuXG4gICAgICAgIGNvbnN0IGJvdHRvbVBlcmNlbnRhZ2UgPSBjbGFtcChib3R0b21GcmFjdGlvbiAqIDEwMCwgMCwgODUpOyAvLyBFbnN1cmUgMTUlIG9mIHNwYWNlIHVwLlxuICAgICAgICBjb25zdCB3aWR0aFBlcmNlbnRhZ2UgPSBNYXRoLm1heCh3aWR0aEZyYWN0aW9uICogMTAwLCA2NSk7IC8vIEVuc3VyZSA2NSUgb2YgbWF4LXdpZHRoLlxuXG4gICAgICAgIHN0eWxlcyA9IHtcbiAgICAgICAgICAnYm90dG9tJzogYm90dG9tUGVyY2VudGFnZSArICclJyxcbiAgICAgICAgICAnbWF4LXdpZHRoJzogd2lkdGhQZXJjZW50YWdlICsgJyUnLFxuICAgICAgICAgICdwb3NpdGlvbic6ICdhYnNvbHV0ZScsXG4gICAgICAgICAgJ3otaW5kZXgnOiAzLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEFsaWduIGRpc2NsYWltZXIgdG8gbGVmdCBpZiBSVEwsIG90aGVyd2lzZSBhbGlnbiB0byB0aGUgcmlnaHQuXG4gICAgICAgIGlmIChkaXIgPT09ICdydGwnKSB7XG4gICAgICAgICAgY29uc3QgbGVmdEZyYWN0aW9uID0gKGljb25SZWN0LnggLSBwYWdlUmVjdC54KSAvIHBhZ2VSZWN0LndpZHRoO1xuICAgICAgICAgIHN0eWxlc1snbGVmdCddID0gY2xhbXAobGVmdEZyYWN0aW9uICogMTAwLCAwLCAyNSkgKyAnJSc7IC8vIEVuc3VyZSA3NSUgb2Ygc3BhY2UgdG8gdGhlIHJpZ2h0LlxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHJpZ2h0RnJhY3Rpb24gPVxuICAgICAgICAgICAgMSAtIChpY29uUmVjdC54ICsgaWNvblJlY3Qud2lkdGggLSBwYWdlUmVjdC54KSAvIHBhZ2VSZWN0LndpZHRoO1xuICAgICAgICAgIHN0eWxlc1sncmlnaHQnXSA9IGNsYW1wKHJpZ2h0RnJhY3Rpb24gKiAxMDAsIDAsIDI1KSArICclJzsgLy8gRW5zdXJlIDc1JSBvZiBzcGFjZSB0byB0aGUgbGVmdC5cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgICgpID0+IHtcbiAgICAgICAgc2V0SW1wb3J0YW50U3R5bGVzKFxuICAgICAgICAgIHRoaXMuZGlzY2xhaW1lckVsXyxcbiAgICAgICAgICBhc3NlcnREb2VzTm90Q29udGFpbkRpc3BsYXkoc3R5bGVzKVxuICAgICAgICApO1xuICAgICAgICB0aGlzLmdldFBhZ2VFbCgpLmFwcGVuZENoaWxkKHRoaXMuZGlzY2xhaW1lckVsXyk7XG4gICAgICAgIHRoaXMuZGlzY2xhaW1lckljb25fLnNldEF0dHJpYnV0ZSgnaGlkZScsICcnKTtcbiAgICAgICAgLy8gQWRkIGNsaWNrIGxpc3RlbmVyIHRocm91Z2ggdGhlIHNoYWRvdyBkb20gdXNpbmcgZS5wYXRoLlxuICAgICAgICB0aGlzLmRpc2NsYWltZXJFbF8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGUucGF0aFswXS5jbGFzc0xpc3QuY29udGFpbnMoXG4gICAgICAgICAgICAgICdpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtZGlzY2xhaW1lci1jbG9zZSdcbiAgICAgICAgICAgIClcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2VEaXNjbGFpbWVyXygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZXMgdGhlIGRpc2NsYWltZXIgZGlhbG9nIGlmIG9wZW4uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBjbG9zZURpc2NsYWltZXJfKCkge1xuICAgIGlmICghdGhpcy5kaXNjbGFpbWVyRWxfKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PiB7XG4gICAgICB0aGlzLmRpc2NsYWltZXJFbF8ucmVtb3ZlKCk7XG4gICAgICB0aGlzLmRpc2NsYWltZXJFbF8gPSBudWxsO1xuICAgICAgaWYgKHRoaXMuZGlzY2xhaW1lckljb25fKSB7XG4gICAgICAgIHRoaXMuZGlzY2xhaW1lckljb25fLnJlbW92ZUF0dHJpYnV0ZSgnaGlkZScpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-story-interactive/0.1/amp-story-interactive-abstract.js