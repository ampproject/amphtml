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

/**
 * @const @enum {number}
 */
export var InteractiveType = {
  QUIZ: 0,
  POLL: 1,
  RESULTS: 2
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
     * @private
     * @return {Element} the page element
     */

  }, {
    key: "getPageEl_",
    value: function getPageEl_() {
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
          var toggle = currPageId === _this6.getPageEl_().getAttribute('id');

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
        this.handleOptionSelection_(optionEl);
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
     * @param {!Element} optionEl
     * @private
     */

  }, {
    key: "triggerAnalytics_",
    value: function triggerAnalytics_(optionEl) {
      this.variableService_.onVariableUpdate(AnalyticsVariable.STORY_INTERACTIVE_ID, this.element.getAttribute('id'));
      this.variableService_.onVariableUpdate(AnalyticsVariable.STORY_INTERACTIVE_RESPONSE, optionEl.optionIndex_);
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
     * @param {!Element} optionEl
     * @private
     */

  }, {
    key: "handleOptionSelection_",
    value: function handleOptionSelection_(optionEl) {
      var _this7 = this;

      this.backendDataPromise_.then(function () {
        if (_this7.hasUserSelection_) {
          return;
        }

        _this7.triggerAnalytics_(optionEl);

        _this7.hasUserSelection_ = true;

        if (_this7.optionsData_) {
          _this7.optionsData_[optionEl.optionIndex_]['count']++;
          _this7.optionsData_[optionEl.optionIndex_]['selected'] = true;
        }

        _this7.mutateElement(function () {
          _this7.updateToPostSelectionState_(optionEl);
        });

        if (_this7.element.hasAttribute('endpoint')) {
          _this7.executeInteractiveRequest_('POST', optionEl.optionIndex_);
        }
      }).catch(function () {
        // If backend is not properly connected, still update state.
        _this7.triggerAnalytics_(optionEl);

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
        _this8.handleSuccessfulDataRetrieval_(
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
    key: "handleSuccessfulDataRetrieval_",
    value: function handleSuccessfulDataRetrieval_(response) {
      if (!(response && response['options'])) {
        devAssert(response && 'options' in response, "Invalid interactive response, expected { data: InteractiveResponseType, ...} but received " + response);
        dev().error(TAG, "Invalid interactive response, expected { data: InteractiveResponseType, ...} but received " + response);
        return;
      }

      var numOptions = this.rootEl_.querySelectorAll('.i-amphtml-story-interactive-option').length;
      // Only keep the visible options to ensure visible percentages add up to 100.
      this.updateComponentOnDataRetrieval_(response['options'].slice(0, numOptions));
    }
    /**
     * Updates the quiz to reflect the state of the remote data.
     * @param {!Array<InteractiveOptionType>} data
     * @private
     */

  }, {
    key: "updateComponentOnDataRetrieval_",
    value: function updateComponentOnDataRetrieval_(data) {
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
      this.rootEl_.classList.add('i-amphtml-story-interactive-post-selection');

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
     * Reorders options data to account for scrambled or incomplete data.
     *
     * @private
     * @param {!Array<!InteractiveOptionType>} optionsData
     * @return {!Array<!InteractiveOptionType>}
     */

  }, {
    key: "orderData_",
    value: function orderData_(optionsData) {
      var numOptionElements = this.getOptionElements().length;
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

        var pageRect = _this12.getPageEl_().
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

        _this12.getPageEl_().appendChild(_this12.disclaimerEl_);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1pbnRlcmFjdGl2ZS1hYnN0cmFjdC5qcyJdLCJuYW1lcyI6WyJBTkFMWVRJQ1NfVEFHX05BTUUiLCJTdG9yeUFuYWx5dGljc0V2ZW50IiwiY2xhbXAiLCJBY3Rpb24iLCJTdGF0ZVByb3BlcnR5IiwiQW5hbHl0aWNzVmFyaWFibGUiLCJDU1MiLCJTZXJ2aWNlcyIsImFkZFBhcmFtc1RvVXJsIiwiYXBwZW5kUGF0aFRvVXJsIiwiYXNzZXJ0QWJzb2x1dGVIdHRwT3JIdHRwc1VybCIsImJhc2U2NFVybEVuY29kZUZyb21TdHJpbmciLCJhc3NlcnREb2VzTm90Q29udGFpbkRpc3BsYXkiLCJidWlsZEludGVyYWN0aXZlRGlzY2xhaW1lciIsImJ1aWxkSW50ZXJhY3RpdmVEaXNjbGFpbWVySWNvbiIsImNsb3Nlc3QiLCJjcmVhdGVTaGFkb3dSb290V2l0aFN0eWxlIiwibWF5YmVNYWtlUHJveHlVcmwiLCJkZWR1cGxpY2F0ZUludGVyYWN0aXZlSWRzIiwiZGV2IiwiZGV2QXNzZXJ0IiwiZGljdCIsImVtb2ppQ29uZmV0dGkiLCJ0b0FycmF5Iiwic2V0SW1wb3J0YW50U3R5bGVzIiwiaXNFeHBlcmltZW50T24iLCJUQUciLCJJbnRlcmFjdGl2ZVR5cGUiLCJRVUlaIiwiUE9MTCIsIlJFU1VMVFMiLCJFTkRQT0lOVF9JTlZBTElEX0VSUk9SIiwiSU5URVJBQ1RJVkVfQUNUSVZFX0NMQVNTIiwiSW50ZXJhY3RpdmVPcHRpb25UeXBlIiwiSW50ZXJhY3RpdmVSZXNwb25zZVR5cGUiLCJPcHRpb25Db25maWdUeXBlIiwiZm9udHNUb0xvYWQiLCJmYW1pbHkiLCJ3ZWlnaHQiLCJzcmMiLCJBbXBTdG9yeUludGVyYWN0aXZlIiwiZWxlbWVudCIsInR5cGUiLCJib3VuZHMiLCJpbnRlcmFjdGl2ZVR5cGVfIiwiYW5hbHl0aWNzU2VydmljZV8iLCJiYWNrZW5kRGF0YVByb21pc2VfIiwiY2xpZW50SWRQcm9taXNlXyIsImRpc2NsYWltZXJFbF8iLCJkaXNjbGFpbWVySWNvbl8iLCJoYXNVc2VyU2VsZWN0aW9uXyIsIm9wdGlvbkJvdW5kc18iLCJvcHRpb25FbGVtZW50c18iLCJvcHRpb25zXyIsIm9wdGlvbnNEYXRhXyIsInBhZ2VFbF8iLCJyb290RWxfIiwibG9jYWxpemF0aW9uU2VydmljZSIsInJlcXVlc3RTZXJ2aWNlXyIsInN0b3JlU2VydmljZV8iLCJ1cmxTZXJ2aWNlXyIsInZhcmlhYmxlU2VydmljZV8iLCJxdWVyeVNlbGVjdG9yQWxsIiwiY2Fub25pY2FsVXJsNjQiLCJ3aW4iLCJkb2N1bWVudCIsImRvY3VtZW50SW5mb0ZvckRvYyIsImNhbm9uaWNhbFVybCIsImlkIiwiYXNzZXJ0RWxlbWVudCIsImVsIiwidGFnTmFtZSIsInRvTG93ZXJDYXNlIiwiY29uY3JldGVDU1MiLCJsb2FkRm9udHNfIiwicGFyc2VPcHRpb25zXyIsImNsYXNzTGlzdCIsImFkZCIsImFkanVzdEdyaWRMYXllcl8iLCJjaGlsZHJlbiIsImxlbmd0aCIsInVybEZvckRvYyIsIlByb21pc2UiLCJhbGwiLCJzdG9yeVZhcmlhYmxlU2VydmljZUZvck9yTnVsbCIsInRoZW4iLCJzZXJ2aWNlIiwic3RvcnlTdG9yZVNlcnZpY2VGb3JPck51bGwiLCJ1cGRhdGVTdG9yeVN0b3JlU3RhdGVfIiwic3RvcnlSZXF1ZXN0U2VydmljZUZvck9yTnVsbCIsInN0b3J5QW5hbHl0aWNzU2VydmljZUZvck9yTnVsbCIsImxvY2FsaXphdGlvblNlcnZpY2VGb3JPck51bGwiLCJidWlsZENvbXBvbmVudCIsImhhc0F0dHJpYnV0ZSIsInByZXBlbmQiLCJsb2FkZWRGb250cyIsImZvbnRzIiwiRm9udEZhY2UiLCJmb3JFYWNoIiwiZm9udFByb3BlcnRpZXMiLCJmb250Iiwic3R5bGUiLCJsb2FkIiwib3B0aW9ucyIsImF0dHJpYnV0ZXMiLCJhdHRyIiwibmFtZSIsIm1hdGNoIiwic3BsaXRQYXJ0cyIsInNwbGl0Iiwib3B0aW9uTnVtYmVyIiwicGFyc2VJbnQiLCJwdXNoIiwia2V5Iiwic2xpY2UiLCJqb2luIiwidmFsdWUiLCJnZXRBbXBEb2MiLCJlcnJvciIsInJvb3QiLCJwcm9tcHRDb250YWluZXIiLCJxdWVyeVNlbGVjdG9yIiwicmVtb3ZlQ2hpbGQiLCJwcm9tcHQiLCJjcmVhdGVFbGVtZW50IiwidGV4dENvbnRlbnQiLCJnZXRBdHRyaWJ1dGUiLCJhcHBlbmRDaGlsZCIsImluaXRpYWxpemVMaXN0ZW5lcnNfIiwicmV0cmlldmVJbnRlcmFjdGl2ZURhdGFfIiwiY2lkRm9yRG9jIiwiZGF0YSIsImdldCIsInNjb3BlIiwiY3JlYXRlQ29va2llSWZOb3RQcmVzZW50IiwicnRsU3RhdGUiLCJtdXRhdGVFbGVtZW50Iiwic2V0QXR0cmlidXRlIiwicmVtb3ZlQXR0cmlidXRlIiwibGF5b3V0IiwiZ3JpZExheWVyIiwicGFyZW50RWxlbWVudCIsInN1YnNjcmliZSIsIlJUTF9TVEFURSIsIm9uUnRsU3RhdGVVcGRhdGVfIiwiQ1VSUkVOVF9QQUdFX0lEIiwiY3VyclBhZ2VJZCIsInRvZ2dsZSIsImdldFBhZ2VFbF8iLCJ0b2dnbGVUYWJiYWJsZUVsZW1lbnRzXyIsImNsb3NlRGlzY2xhaW1lcl8iLCJhZGRFdmVudExpc3RlbmVyIiwiZSIsImhhbmRsZVRhcF8iLCJ0YXJnZXQiLCJvcGVuRGlzY2xhaW1lcl8iLCJvcHRpb25FbCIsImNvbnRhaW5zIiwib3B0aW9uSW5kZXhfIiwiaGFuZGxlT3B0aW9uU2VsZWN0aW9uXyIsImNvbmZldHRpRW1vamkiLCJjb25mZXR0aSIsIm9uVmFyaWFibGVVcGRhdGUiLCJTVE9SWV9JTlRFUkFDVElWRV9JRCIsIlNUT1JZX0lOVEVSQUNUSVZFX1JFU1BPTlNFIiwiU1RPUllfSU5URVJBQ1RJVkVfVFlQRSIsInRyaWdnZXJFdmVudCIsIklOVEVSQUNUSVZFIiwidW51c2VkT3B0aW9uc0RhdGEiLCJvcHRpb25zRGF0YSIsInRvdGFsUmVzcG9uc2VDb3VudCIsInJlZHVjZSIsImFjYyIsInJlc3BvbnNlIiwicGVyY2VudGFnZXMiLCJtYXAiLCJ0b0ZpeGVkIiwidG90YWwiLCJ4IiwiTWF0aCIsInJvdW5kIiwicGVyY2VudGFnZSIsImZsb29yIiwicmVtYWluZGVyIiwicHJlc2VydmVPcmlnaW5hbCIsImluZGV4Iiwib3JpZ2luYWxJbmRleCIsInNvcnQiLCJsZWZ0IiwicmlnaHQiLCJmaW5hbFBlcmNlbnRhZ2VzIiwiaGlnaGVzdFJlbWFpbmRlck9iaiIsInRpZXMiLCJmaWx0ZXIiLCJwZXJjZW50YWdlT2JqIiwidG9Sb3VuZFVwIiwidHJpZ2dlckFuYWx5dGljc18iLCJ1cGRhdGVUb1Bvc3RTZWxlY3Rpb25TdGF0ZV8iLCJleGVjdXRlSW50ZXJhY3RpdmVSZXF1ZXN0XyIsImNhdGNoIiwiaGFuZGxlU3VjY2Vzc2Z1bERhdGFSZXRyaWV2YWxfIiwibWV0aG9kIiwib3B0aW9uU2VsZWN0ZWQiLCJ1bmRlZmluZWQiLCJ1cmwiLCJyZWplY3QiLCJnZXRDbGllbnRJZF8iLCJjbGllbnRJZCIsInJlcXVlc3RPcHRpb25zIiwicmVxdWVzdFBhcmFtcyIsInBhcnNlIiwiZ2V0SW50ZXJhY3RpdmVJZF8iLCJleGVjdXRlUmVxdWVzdCIsImVyciIsIm51bU9wdGlvbnMiLCJ1cGRhdGVDb21wb25lbnRPbkRhdGFSZXRyaWV2YWxfIiwib3JkZXJEYXRhXyIsInNlbGVjdGVkIiwic2VsZWN0ZWRPcHRpb24iLCJkaXNwbGF5T3B0aW9uc0RhdGEiLCJnZXRPcHRpb25FbGVtZW50cyIsIm9wdGlvbiIsInVwZGF0ZSIsImludGVyYWN0aXZlSWQiLCJkaXNwYXRjaCIsIkFERF9JTlRFUkFDVElWRV9SRUFDVCIsIm51bU9wdGlvbkVsZW1lbnRzIiwib3JkZXJlZERhdGEiLCJBcnJheSIsImkiLCJjb3VudCIsImRpciIsInN0eWxlcyIsIm1lYXN1cmVNdXRhdGVFbGVtZW50IiwiaW50ZXJhY3RpdmVSZWN0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwicGFnZVJlY3QiLCJpY29uUmVjdCIsImJvdHRvbUZyYWN0aW9uIiwieSIsImhlaWdodCIsIndpZHRoRnJhY3Rpb24iLCJ3aWR0aCIsImJvdHRvbVBlcmNlbnRhZ2UiLCJ3aWR0aFBlcmNlbnRhZ2UiLCJtYXgiLCJsZWZ0RnJhY3Rpb24iLCJyaWdodEZyYWN0aW9uIiwicGF0aCIsInJlbW92ZSIsIkFNUCIsIkJhc2VFbGVtZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUNFQSxrQkFERixFQUVFQyxtQkFGRjtBQUlBLFNBQVFDLEtBQVI7QUFDQSxTQUNFQyxNQURGLEVBRUVDLGFBRkY7QUFJQSxTQUFRQyxpQkFBUjtBQUNBLFNBQVFDLEdBQVI7QUFDQSxTQUFRQyxRQUFSO0FBQ0EsU0FDRUMsY0FERixFQUVFQyxlQUZGLEVBR0VDLDRCQUhGO0FBS0EsU0FBUUMseUJBQVI7QUFDQSxTQUFRQywyQkFBUjtBQUNBLFNBQ0VDLDBCQURGLEVBRUVDLDhCQUZGO0FBSUEsU0FBUUMsT0FBUjtBQUNBLFNBQ0VDLHlCQURGLEVBRUVDLGlCQUZGO0FBSUEsU0FBUUMseUJBQVI7QUFDQSxTQUFRQyxHQUFSLEVBQWFDLFNBQWI7QUFDQSxTQUFRQyxJQUFSO0FBQ0EsU0FBUUMsYUFBUjtBQUNBLFNBQVFDLE9BQVI7QUFDQSxTQUFRQyxrQkFBUjtBQUNBLFNBQVFDLGNBQVI7O0FBRUE7QUFDQSxJQUFNQyxHQUFHLEdBQUcsdUJBQVo7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFNQyxlQUFlLEdBQUc7QUFDN0JDLEVBQUFBLElBQUksRUFBRSxDQUR1QjtBQUU3QkMsRUFBQUEsSUFBSSxFQUFFLENBRnVCO0FBRzdCQyxFQUFBQSxPQUFPLEVBQUU7QUFIb0IsQ0FBeEI7O0FBTVA7QUFDQSxJQUFNQyxzQkFBc0IsR0FDMUIsMkRBREY7O0FBR0E7QUFDQSxJQUFNQyx3QkFBd0IsR0FBRyxvQ0FBakM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQUlDLHFCQUFKOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQUlDLHVCQUFKOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQUlDLGdCQUFKOztBQUVQO0FBQ0EsSUFBTUMsV0FBVyxHQUFHLENBQ2xCO0FBQ0VDLEVBQUFBLE1BQU0sRUFBRSxTQURWO0FBRUVDLEVBQUFBLE1BQU0sRUFBRSxLQUZWO0FBR0VDLEVBQUFBLEdBQUcsRUFBRTtBQUhQLENBRGtCLEVBTWxCO0FBQ0VGLEVBQUFBLE1BQU0sRUFBRSxTQURWO0FBRUVDLEVBQUFBLE1BQU0sRUFBRSxLQUZWO0FBR0VDLEVBQUFBLEdBQUcsRUFBRTtBQUhQLENBTmtCLENBQXBCOztBQWFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQWFDLG1CQUFiO0FBQUE7O0FBQUE7O0FBQ0U7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNFLCtCQUFZQyxPQUFaLEVBQXFCQyxJQUFyQixFQUEyQkMsTUFBM0IsRUFBNEM7QUFBQTs7QUFBQSxRQUFqQkEsTUFBaUI7QUFBakJBLE1BQUFBLE1BQWlCLEdBQVIsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFRO0FBQUE7O0FBQUE7O0FBQzFDLDhCQUFNRixPQUFOOztBQUVBO0FBQ0EsVUFBS0csZ0JBQUwsR0FBd0JGLElBQXhCOztBQUVBO0FBQ0EsVUFBS0csaUJBQUwsR0FBeUIsSUFBekI7O0FBRUE7QUFDQSxVQUFLQyxtQkFBTCxHQUEyQixJQUEzQjs7QUFFQTtBQUNBLFVBQUtDLGdCQUFMLEdBQXdCLElBQXhCOztBQUVBO0FBQ0EsVUFBS0MsYUFBTCxHQUFxQixJQUFyQjs7QUFFQTtBQUNBLFVBQUtDLGVBQUwsR0FBdUIsSUFBdkI7O0FBRUE7QUFDQSxVQUFLQyxpQkFBTCxHQUF5QixLQUF6Qjs7QUFFQTtBQUNBLFVBQUtDLGFBQUwsR0FBcUJSLE1BQXJCOztBQUVBO0FBQ0EsVUFBS1MsZUFBTCxHQUF1QixJQUF2Qjs7QUFFQTtBQUNBLFVBQUtDLFFBQUwsR0FBZ0IsSUFBaEI7O0FBRUE7QUFDQSxVQUFLQyxZQUFMLEdBQW9CLElBQXBCOztBQUVBO0FBQ0EsVUFBS0MsT0FBTCxHQUFlLElBQWY7O0FBRUE7QUFDQSxVQUFLQyxPQUFMLEdBQWUsSUFBZjs7QUFFQTtBQUNBLFVBQUtDLG1CQUFMLEdBQTJCLElBQTNCOztBQUVBO0FBQ0EsVUFBS0MsZUFBTCxHQUF1QixJQUF2Qjs7QUFFQTtBQUNBLFVBQUtDLGFBQUwsR0FBcUIsSUFBckI7O0FBRUE7QUFDQSxVQUFLQyxXQUFMLEdBQW1CLElBQW5COztBQUVBO0FBQ0EsVUFBS0MsZ0JBQUwsR0FBd0IsSUFBeEI7QUF2RDBDO0FBd0QzQzs7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBcEVBO0FBQUE7QUFBQSxXQXFFRSwwQkFBaUI7QUFDZixhQUFPLEtBQUtMLE9BQVo7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBN0VBO0FBQUE7QUFBQSxXQThFRSw2QkFBb0I7QUFDbEIsVUFBSSxDQUFDLEtBQUtKLGVBQVYsRUFBMkI7QUFDekIsYUFBS0EsZUFBTCxHQUF1QjdCLE9BQU8sQ0FDNUIsS0FBS2lDLE9BQUwsQ0FBYU0sZ0JBQWIsQ0FBOEIscUNBQTlCLENBRDRCLENBQTlCO0FBR0Q7O0FBQ0QsYUFBTyxLQUFLVixlQUFaO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQTNGQTtBQUFBO0FBQUEsV0E0RkUsNkJBQW9CO0FBQ2xCLFVBQUksQ0FBQ1osbUJBQW1CLENBQUN1QixjQUF6QixFQUF5QztBQUN2QzdDLFFBQUFBLHlCQUF5QixDQUFDLEtBQUs4QyxHQUFMLENBQVNDLFFBQVYsQ0FBekI7QUFDQXpCLFFBQUFBLG1CQUFtQixDQUFDdUIsY0FBcEIsR0FBcUNwRCx5QkFBeUIsQ0FDNURKLFFBQVEsQ0FBQzJELGtCQUFULENBQTRCLEtBQUt6QixPQUFqQyxFQUEwQzBCLFlBRGtCLENBQTlEO0FBR0Q7O0FBQ0QsYUFBVTNCLG1CQUFtQixDQUFDdUIsY0FBOUIsU0FBZ0QsS0FBS3RCLE9BQUwsQ0FBYTJCLEVBQTdEO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUF6R0E7QUFBQTtBQUFBLFdBMEdFLHNCQUFhO0FBQ1gsVUFBSSxLQUFLYixPQUFMLElBQWdCLElBQXBCLEVBQTBCO0FBQ3hCLGFBQUtBLE9BQUwsR0FBZXhDLE9BQU8sQ0FBQ0ksR0FBRyxHQUFHa0QsYUFBTixDQUFvQixLQUFLNUIsT0FBekIsQ0FBRCxFQUFvQyxVQUFDNkIsRUFBRCxFQUFRO0FBQ2hFLGlCQUFPQSxFQUFFLENBQUNDLE9BQUgsQ0FBV0MsV0FBWCxPQUE2QixnQkFBcEM7QUFDRCxTQUZxQixDQUF0QjtBQUdEOztBQUNELGFBQU8sS0FBS2pCLE9BQVo7QUFDRDtBQUVEOztBQW5IRjtBQUFBO0FBQUEsV0FvSEUsdUJBQWNrQixXQUFkLEVBQWdDO0FBQUE7O0FBQUEsVUFBbEJBLFdBQWtCO0FBQWxCQSxRQUFBQSxXQUFrQixHQUFKLEVBQUk7QUFBQTs7QUFDOUIsV0FBS0MsVUFBTDtBQUNBLFdBQUtyQixRQUFMLEdBQWdCLEtBQUtzQixhQUFMLEVBQWhCO0FBQ0EsV0FBS2xDLE9BQUwsQ0FBYW1DLFNBQWIsQ0FBdUJDLEdBQXZCLENBQTJCLHVDQUEzQjtBQUNBLFdBQUtDLGdCQUFMO0FBQ0ExRCxNQUFBQSxTQUFTLENBQUMsS0FBS3FCLE9BQUwsQ0FBYXNDLFFBQWIsQ0FBc0JDLE1BQXRCLElBQWdDLENBQWpDLEVBQW9DLG1CQUFwQyxDQUFUO0FBRUE7QUFDQSxXQUFLcEIsV0FBTCxHQUFtQnJELFFBQVEsQ0FBQzBFLFNBQVQsQ0FBbUIsS0FBS3hDLE9BQXhCLENBQW5CO0FBQ0EsYUFBT3lDLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLENBQ2pCNUUsUUFBUSxDQUFDNkUsNkJBQVQsQ0FBdUMsS0FBS3BCLEdBQTVDLEVBQWlEcUIsSUFBakQsQ0FBc0QsVUFBQ0MsT0FBRCxFQUFhO0FBQ2pFLFFBQUEsTUFBSSxDQUFDekIsZ0JBQUwsR0FBd0J5QixPQUF4QjtBQUNELE9BRkQsQ0FEaUIsRUFJakIvRSxRQUFRLENBQUNnRiwwQkFBVCxDQUFvQyxLQUFLdkIsR0FBekMsRUFBOENxQixJQUE5QyxDQUFtRCxVQUFDQyxPQUFELEVBQWE7QUFDOUQsUUFBQSxNQUFJLENBQUMzQixhQUFMLEdBQXFCMkIsT0FBckI7O0FBQ0EsUUFBQSxNQUFJLENBQUNFLHNCQUFMLENBQTRCLElBQTVCO0FBQ0QsT0FIRCxDQUppQixFQVFqQmpGLFFBQVEsQ0FBQ2tGLDRCQUFULENBQXNDLEtBQUt6QixHQUEzQyxFQUFnRHFCLElBQWhELENBQXFELFVBQUNDLE9BQUQsRUFBYTtBQUNoRSxRQUFBLE1BQUksQ0FBQzVCLGVBQUwsR0FBdUI0QixPQUF2QjtBQUNELE9BRkQsQ0FSaUIsRUFXakIvRSxRQUFRLENBQUNtRiw4QkFBVCxDQUF3QyxLQUFLMUIsR0FBN0MsRUFBa0RxQixJQUFsRCxDQUF1RCxVQUFDQyxPQUFELEVBQWE7QUFDbEUsUUFBQSxNQUFJLENBQUN6QyxpQkFBTCxHQUF5QnlDLE9BQXpCO0FBQ0QsT0FGRCxDQVhpQixFQWNqQi9FLFFBQVEsQ0FBQ29GLDRCQUFULENBQXNDLEtBQUtsRCxPQUEzQyxFQUFvRDRDLElBQXBELENBQXlELFVBQUNDLE9BQUQsRUFBYTtBQUNwRSxRQUFBLE1BQUksQ0FBQzdCLG1CQUFMLEdBQTJCNkIsT0FBM0I7QUFDRCxPQUZELENBZGlCLENBQVosRUFpQkpELElBakJJLENBaUJDLFlBQU07QUFDWixRQUFBLE1BQUksQ0FBQzdCLE9BQUwsR0FBZSxNQUFJLENBQUNvQyxjQUFMLEVBQWY7O0FBQ0EsUUFBQSxNQUFJLENBQUNwQyxPQUFMLENBQWFvQixTQUFiLENBQXVCQyxHQUF2QixDQUEyQix1Q0FBM0I7O0FBQ0EsWUFDRXBELGNBQWMsQ0FBQyxNQUFJLENBQUN1QyxHQUFOLEVBQVcsa0NBQVgsQ0FBZCxJQUNBLE1BQUksQ0FBQ3ZCLE9BQUwsQ0FBYW9ELFlBQWIsQ0FBMEIsVUFBMUIsQ0FGRixFQUdFO0FBQ0EsVUFBQSxNQUFJLENBQUM1QyxlQUFMLEdBQXVCbkMsOEJBQThCLENBQUMsTUFBRCxDQUFyRDs7QUFDQSxVQUFBLE1BQUksQ0FBQzBDLE9BQUwsQ0FBYXNDLE9BQWIsQ0FBcUIsTUFBSSxDQUFDN0MsZUFBMUI7QUFDRDs7QUFDRGpDLFFBQUFBLHlCQUF5QixDQUN2QixNQUFJLENBQUN5QixPQURrQixFQUV2QnRCLEdBQUcsR0FBR2tELGFBQU4sQ0FBb0IsTUFBSSxDQUFDYixPQUF6QixDQUZ1QixFQUd2QmxELEdBQUcsR0FBR21FLFdBSGlCLENBQXpCO0FBS0EsZUFBTyxrQkFBUDtBQUNELE9BakNNLENBQVA7QUFrQ0Q7QUFFRDtBQUNGO0FBQ0E7O0FBbktBO0FBQUE7QUFBQSxXQW9LRSxzQkFBYTtBQUFBOztBQUNYLFVBQ0UsQ0FBQ2pDLG1CQUFtQixDQUFDdUQsV0FBckIsSUFDQSxLQUFLL0IsR0FBTCxDQUFTQyxRQUFULENBQWtCK0IsS0FEbEIsSUFFQUMsUUFIRixFQUlFO0FBQ0E3RCxRQUFBQSxXQUFXLENBQUM4RCxPQUFaLENBQW9CLFVBQUNDLGNBQUQsRUFBb0I7QUFDdEMsY0FBTUMsSUFBSSxHQUFHLElBQUlILFFBQUosQ0FBYUUsY0FBYyxDQUFDOUQsTUFBNUIsRUFBb0M4RCxjQUFjLENBQUM1RCxHQUFuRCxFQUF3RDtBQUNuRUQsWUFBQUEsTUFBTSxFQUFFNkQsY0FBYyxDQUFDN0QsTUFENEM7QUFFbkUrRCxZQUFBQSxLQUFLLEVBQUU7QUFGNEQsV0FBeEQsQ0FBYjtBQUlBRCxVQUFBQSxJQUFJLENBQUNFLElBQUwsR0FBWWpCLElBQVosQ0FBaUIsWUFBTTtBQUNyQixZQUFBLE1BQUksQ0FBQ3JCLEdBQUwsQ0FBU0MsUUFBVCxDQUFrQitCLEtBQWxCLENBQXdCbkIsR0FBeEIsQ0FBNEJ1QixJQUE1QjtBQUNELFdBRkQ7QUFHRCxTQVJEO0FBU0Q7O0FBQ0Q1RCxNQUFBQSxtQkFBbUIsQ0FBQ3VELFdBQXBCLEdBQWtDLElBQWxDO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBL0xBO0FBQUE7QUFBQSxXQWdNRSx5QkFBZ0I7QUFBQTs7QUFDZCxVQUFNUSxPQUFPLEdBQUcsRUFBaEI7QUFDQWhGLE1BQUFBLE9BQU8sQ0FBQyxLQUFLa0IsT0FBTCxDQUFhK0QsVUFBZCxDQUFQLENBQWlDTixPQUFqQyxDQUF5QyxVQUFDTyxJQUFELEVBQVU7QUFDakQ7QUFDQSxZQUFJQSxJQUFJLENBQUNDLElBQUwsQ0FBVUMsS0FBVixDQUFnQixxQkFBaEIsQ0FBSixFQUE0QztBQUMxQyxjQUFNQyxVQUFVLEdBQUdILElBQUksQ0FBQ0MsSUFBTCxDQUFVRyxLQUFWLENBQWdCLEdBQWhCLENBQW5CO0FBQ0EsY0FBTUMsWUFBWSxHQUFHQyxRQUFRLENBQUNILFVBQVUsQ0FBQyxDQUFELENBQVgsRUFBZ0IsRUFBaEIsQ0FBN0I7O0FBQ0E7QUFDQSxpQkFBT0wsT0FBTyxDQUFDdkIsTUFBUixHQUFpQjhCLFlBQXhCLEVBQXNDO0FBQ3BDUCxZQUFBQSxPQUFPLENBQUNTLElBQVIsQ0FBYTtBQUFDLDZCQUFlVCxPQUFPLENBQUN2QjtBQUF4QixhQUFiO0FBQ0Q7O0FBQ0QsY0FBTWlDLEdBQUcsR0FBR0wsVUFBVSxDQUFDTSxLQUFYLENBQWlCLENBQWpCLEVBQW9CQyxJQUFwQixDQUF5QixFQUF6QixDQUFaOztBQUNBLGNBQUlGLEdBQUcsS0FBSyxPQUFaLEVBQXFCO0FBQ25CVixZQUFBQSxPQUFPLENBQUNPLFlBQVksR0FBRyxDQUFoQixDQUFQLENBQTBCRyxHQUExQixJQUFpQ2hHLGlCQUFpQixDQUNoRHdGLElBQUksQ0FBQ1csS0FEMkMsRUFFaEQsTUFBSSxDQUFDQyxTQUFMLEVBRmdELENBQWxEO0FBSUQsV0FMRCxNQUtPO0FBQ0xkLFlBQUFBLE9BQU8sQ0FBQ08sWUFBWSxHQUFHLENBQWhCLENBQVAsQ0FBMEJHLEdBQTFCLElBQWlDUixJQUFJLENBQUNXLEtBQXRDO0FBQ0Q7QUFDRjtBQUNGLE9BbkJEOztBQW9CQSxVQUNFYixPQUFPLENBQUN2QixNQUFSLElBQWtCLEtBQUs3QixhQUFMLENBQW1CLENBQW5CLENBQWxCLElBQ0FvRCxPQUFPLENBQUN2QixNQUFSLElBQWtCLEtBQUs3QixhQUFMLENBQW1CLENBQW5CLENBRnBCLEVBR0U7QUFDQSxlQUFPb0QsT0FBUDtBQUNEOztBQUNEbkYsTUFBQUEsU0FBUyxDQUNQbUYsT0FBTyxDQUFDdkIsTUFBUixJQUFrQixLQUFLN0IsYUFBTCxDQUFtQixDQUFuQixDQUFsQixJQUNFb0QsT0FBTyxDQUFDdkIsTUFBUixJQUFrQixLQUFLN0IsYUFBTCxDQUFtQixDQUFuQixDQUZiLDRDQUdpQyxLQUFLQSxhQUFMLENBQW1CLENBQW5CLENBSGpDLHVCQUd3RSxLQUFLQSxhQUFMLENBQW1CLENBQW5CLENBSHhFLGlCQUd5R29ELE9BQU8sQ0FBQ3ZCLE1BSGpILE9BQVQ7QUFLQTdELE1BQUFBLEdBQUcsR0FBR21HLEtBQU4sQ0FDRTVGLEdBREYsNENBRTBDLEtBQUt5QixhQUFMLENBQW1CLENBQW5CLENBRjFDLHVCQUVpRixLQUFLQSxhQUFMLENBQW1CLENBQW5CLENBRmpGLGlCQUVrSG9ELE9BQU8sQ0FBQ3ZCLE1BRjFIO0FBSUQ7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBNU9BO0FBQUE7QUFBQSxXQTZPRSx1QkFBY3VDLElBQWQsRUFBb0I7QUFDbEIsVUFBTUMsZUFBZSxHQUFHRCxJQUFJLENBQUNFLGFBQUwsQ0FDdEIsK0NBRHNCLENBQXhCOztBQUlBLFVBQUksQ0FBQyxLQUFLaEYsT0FBTCxDQUFhb0QsWUFBYixDQUEwQixhQUExQixDQUFMLEVBQStDO0FBQzdDLGFBQUtyQyxPQUFMLENBQWFrRSxXQUFiLENBQXlCRixlQUF6QjtBQUNELE9BRkQsTUFFTztBQUNMLFlBQU1HLE1BQU0sR0FBRzFELFFBQVEsQ0FBQzJELGFBQVQsQ0FBdUIsR0FBdkIsQ0FBZjtBQUNBRCxRQUFBQSxNQUFNLENBQUNFLFdBQVAsR0FBcUIsS0FBS3BGLE9BQUwsQ0FBYXFGLFlBQWIsQ0FBMEIsYUFBMUIsQ0FBckI7QUFDQUgsUUFBQUEsTUFBTSxDQUFDL0MsU0FBUCxDQUFpQkMsR0FBakIsQ0FBcUIsb0NBQXJCO0FBQ0EyQyxRQUFBQSxlQUFlLENBQUNPLFdBQWhCLENBQTRCSixNQUE1QjtBQUNEO0FBQ0Y7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBalFBO0FBQUE7QUFBQSxXQWtRRSwwQkFBaUIsQ0FDZjtBQUNEO0FBRUQ7O0FBdFFGO0FBQUE7QUFBQSxXQXVRRSwwQkFBaUI7QUFDZixXQUFLSyxvQkFBTDtBQUNBLGFBQVEsS0FBS2xGLG1CQUFMLEdBQTJCLEtBQUtMLE9BQUwsQ0FBYW9ELFlBQWIsQ0FBMEIsVUFBMUIsSUFDL0IsS0FBS29DLHdCQUFMLEVBRCtCLEdBRS9CLG1CQUZKO0FBR0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQWxSQTtBQUFBO0FBQUEsV0FtUkUsd0JBQWU7QUFDYixVQUFJLENBQUMsS0FBS2xGLGdCQUFWLEVBQTRCO0FBQzFCLGFBQUtBLGdCQUFMLEdBQXdCeEMsUUFBUSxDQUFDMkgsU0FBVCxDQUFtQixLQUFLekYsT0FBeEIsRUFBaUM0QyxJQUFqQyxDQUFzQyxVQUFDOEMsSUFBRCxFQUFVO0FBQ3RFLGlCQUFPQSxJQUFJLENBQUNDLEdBQUwsQ0FDTDtBQUFDQyxZQUFBQSxLQUFLLEVBQUUsV0FBUjtBQUFxQkMsWUFBQUEsd0JBQXdCLEVBQUU7QUFBL0MsV0FESztBQUVMO0FBQWMsNkJBRlQsQ0FBUDtBQUlELFNBTHVCLENBQXhCO0FBTUQ7O0FBQ0QsYUFBTyxLQUFLdkYsZ0JBQVo7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBblNBO0FBQUE7QUFBQSxXQW9TRSwyQkFBa0J3RixRQUFsQixFQUE0QjtBQUFBOztBQUMxQixXQUFLQyxhQUFMLENBQW1CLFlBQU07QUFDdkJELFFBQUFBLFFBQVEsR0FDSixNQUFJLENBQUMvRSxPQUFMLENBQWFpRixZQUFiLENBQTBCLEtBQTFCLEVBQWlDLEtBQWpDLENBREksR0FFSixNQUFJLENBQUNqRixPQUFMLENBQWFrRixlQUFiLENBQTZCLEtBQTdCLENBRko7QUFHRCxPQUpEO0FBS0Q7QUFFRDs7QUE1U0Y7QUFBQTtBQUFBLFdBNlNFLDJCQUFrQkMsTUFBbEIsRUFBMEI7QUFDeEIsYUFBT0EsTUFBTSxLQUFLLFdBQWxCO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBdFRBO0FBQUE7QUFBQSxXQXVURSw0QkFBbUI7QUFDakIsVUFBTUMsU0FBUyxHQUFHN0gsT0FBTyxDQUFDSSxHQUFHLEdBQUdrRCxhQUFOLENBQW9CLEtBQUs1QixPQUF6QixDQUFELEVBQW9DLFVBQUM2QixFQUFELEVBQVE7QUFDbkUsZUFBT0EsRUFBRSxDQUFDQyxPQUFILENBQVdDLFdBQVgsT0FBNkIsc0JBQXBDO0FBQ0QsT0FGd0IsQ0FBekI7QUFJQW9FLE1BQUFBLFNBQVMsQ0FBQ2hFLFNBQVYsQ0FBb0JDLEdBQXBCLENBQXdCLGlDQUF4Qjs7QUFFQSxVQUFJK0QsU0FBUyxDQUFDQyxhQUFWLENBQXdCcEIsYUFBeEIsQ0FBc0MscUJBQXRDLENBQUosRUFBa0U7QUFDaEVtQixRQUFBQSxTQUFTLENBQUNoRSxTQUFWLENBQW9CQyxHQUFwQixDQUF3QiwrQkFBeEI7QUFDRDs7QUFFRCxVQUFJK0QsU0FBUyxDQUFDQyxhQUFWLENBQXdCcEIsYUFBeEIsQ0FBc0MsMkJBQXRDLENBQUosRUFBd0U7QUFDdEVtQixRQUFBQSxTQUFTLENBQUNoRSxTQUFWLENBQW9CQyxHQUFwQixDQUF3QixxQ0FBeEI7QUFDRDtBQUNGO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBMVVBO0FBQUE7QUFBQSxXQTJVRSxnQ0FBdUI7QUFBQTs7QUFDckIsV0FBS2xCLGFBQUwsQ0FBbUJtRixTQUFuQixDQUNFMUksYUFBYSxDQUFDMkksU0FEaEIsRUFFRSxVQUFDUixRQUFELEVBQWM7QUFDWixRQUFBLE1BQUksQ0FBQ1MsaUJBQUwsQ0FBdUJULFFBQXZCO0FBQ0QsT0FKSCxFQUtFO0FBQUs7QUFMUDtBQVFBO0FBQ0EsV0FBSzVFLGFBQUwsQ0FBbUJtRixTQUFuQixDQUNFMUksYUFBYSxDQUFDNkksZUFEaEIsRUFFRSxVQUFDQyxVQUFELEVBQWdCO0FBQ2QsUUFBQSxNQUFJLENBQUNWLGFBQUwsQ0FBbUIsWUFBTTtBQUN2QixjQUFNVyxNQUFNLEdBQUdELFVBQVUsS0FBSyxNQUFJLENBQUNFLFVBQUwsR0FBa0J0QixZQUFsQixDQUErQixJQUEvQixDQUE5Qjs7QUFDQSxVQUFBLE1BQUksQ0FBQ3RFLE9BQUwsQ0FBYW9CLFNBQWIsQ0FBdUJ1RSxNQUF2QixDQUE4Qm5ILHdCQUE5QixFQUF3RG1ILE1BQXhEOztBQUNBLFVBQUEsTUFBSSxDQUFDRSx1QkFBTCxDQUE2QkYsTUFBN0I7QUFDRCxTQUpEOztBQUtBLFFBQUEsTUFBSSxDQUFDRyxnQkFBTDtBQUNELE9BVEgsRUFVRTtBQUFLO0FBVlA7QUFhQSxXQUFLOUYsT0FBTCxDQUFhK0YsZ0JBQWIsQ0FBOEIsT0FBOUIsRUFBdUMsVUFBQ0MsQ0FBRDtBQUFBLGVBQU8sTUFBSSxDQUFDQyxVQUFMLENBQWdCRCxDQUFoQixDQUFQO0FBQUEsT0FBdkM7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBeldBO0FBQUE7QUFBQSxXQTBXRSxvQkFBV0EsQ0FBWCxFQUFjO0FBQ1osVUFBSUEsQ0FBQyxDQUFDRSxNQUFGLElBQVksS0FBS3pHLGVBQWpCLElBQW9DLENBQUMsS0FBS0QsYUFBOUMsRUFBNkQ7QUFDM0QsYUFBSzJHLGVBQUw7QUFDQTtBQUNEOztBQUVELFVBQUksS0FBS3pHLGlCQUFULEVBQTRCO0FBQzFCO0FBQ0Q7O0FBRUQsVUFBTTBHLFFBQVEsR0FBRzdJLE9BQU8sQ0FDdEJJLEdBQUcsR0FBR2tELGFBQU4sQ0FBb0JtRixDQUFDLENBQUNFLE1BQXRCLENBRHNCLEVBRXRCLFVBQUNqSCxPQUFELEVBQWE7QUFDWCxlQUFPQSxPQUFPLENBQUNtQyxTQUFSLENBQWtCaUYsUUFBbEIsQ0FBMkIsb0NBQTNCLENBQVA7QUFDRCxPQUpxQixFQUt0QixLQUFLckcsT0FMaUIsQ0FBeEI7O0FBUUEsVUFBSW9HLFFBQUosRUFBYztBQUNaLGFBQUtwRSxzQkFBTCxDQUE0Qm9FLFFBQVEsQ0FBQ0UsWUFBckM7QUFDQSxhQUFLQyxzQkFBTCxDQUE0QkgsUUFBNUI7QUFDQSxZQUFNSSxhQUFhLEdBQUcsS0FBSzNHLFFBQUwsQ0FBY3VHLFFBQVEsQ0FBQ0UsWUFBdkIsRUFBcUNHLFFBQTNEOztBQUNBLFlBQUlELGFBQUosRUFBbUI7QUFDakIxSSxVQUFBQSxhQUFhLENBQ1hILEdBQUcsR0FBR2tELGFBQU4sQ0FBb0IsS0FBS2IsT0FBekIsQ0FEVyxFQUVYLEtBQUtRLEdBRk0sRUFHWGdHLGFBSFcsQ0FBYjtBQUtEOztBQUNELGFBQUtWLGdCQUFMO0FBQ0Q7QUFDRjtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFoWkE7QUFBQTtBQUFBLFdBaVpFLDJCQUFrQk0sUUFBbEIsRUFBNEI7QUFDMUIsV0FBSy9GLGdCQUFMLENBQXNCcUcsZ0JBQXRCLENBQ0U3SixpQkFBaUIsQ0FBQzhKLG9CQURwQixFQUVFLEtBQUsxSCxPQUFMLENBQWFxRixZQUFiLENBQTBCLElBQTFCLENBRkY7QUFJQSxXQUFLakUsZ0JBQUwsQ0FBc0JxRyxnQkFBdEIsQ0FDRTdKLGlCQUFpQixDQUFDK0osMEJBRHBCLEVBRUVSLFFBQVEsQ0FBQ0UsWUFGWDtBQUlBLFdBQUtqRyxnQkFBTCxDQUFzQnFHLGdCQUF0QixDQUNFN0osaUJBQWlCLENBQUNnSyxzQkFEcEIsRUFFRSxLQUFLekgsZ0JBRlA7QUFLQSxXQUFLSCxPQUFMLENBQWF6QyxrQkFBYixJQUFtQyxLQUFLeUMsT0FBTCxDQUFhOEIsT0FBaEQ7QUFDQSxXQUFLMUIsaUJBQUwsQ0FBdUJ5SCxZQUF2QixDQUNFckssbUJBQW1CLENBQUNzSyxXQUR0QixFQUVFLEtBQUs5SCxPQUZQO0FBSUQ7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUE1YUE7QUFBQTtBQUFBLFdBNmFFLDRCQUFtQitILGlCQUFuQixFQUFzQyxDQUNwQztBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBdmJBO0FBQUE7QUFBQSxXQXdiRSxnQ0FBdUJDLFdBQXZCLEVBQW9DO0FBQ2xDLFVBQU1DLGtCQUFrQixHQUFHRCxXQUFXLENBQUNFLE1BQVosQ0FDekIsVUFBQ0MsR0FBRCxFQUFNQyxRQUFOO0FBQUEsZUFBbUJELEdBQUcsR0FBR0MsUUFBUSxDQUFDLE9BQUQsQ0FBakM7QUFBQSxPQUR5QixFQUV6QixDQUZ5QixDQUEzQjtBQUtBLFVBQUlDLFdBQVcsR0FBR0wsV0FBVyxDQUFDTSxHQUFaLENBQWdCLFVBQUN2QixDQUFEO0FBQUEsZUFDaEMsQ0FBRSxNQUFNQSxDQUFDLENBQUMsT0FBRCxDQUFSLEdBQXFCa0Isa0JBQXRCLEVBQTBDTSxPQUExQyxDQUFrRCxDQUFsRCxDQURnQztBQUFBLE9BQWhCLENBQWxCO0FBR0EsVUFBSUMsS0FBSyxHQUFHSCxXQUFXLENBQUNILE1BQVosQ0FBbUIsVUFBQ0MsR0FBRCxFQUFNTSxDQUFOO0FBQUEsZUFBWU4sR0FBRyxHQUFHTyxJQUFJLENBQUNDLEtBQUwsQ0FBV0YsQ0FBWCxDQUFsQjtBQUFBLE9BQW5CLEVBQW9ELENBQXBELENBQVo7O0FBRUE7QUFDQTtBQUNBLFVBQUlELEtBQUssR0FBRyxHQUFaLEVBQWlCO0FBQ2ZILFFBQUFBLFdBQVcsR0FBR0EsV0FBVyxDQUFDQyxHQUFaLENBQWdCLFVBQUNNLFVBQUQ7QUFBQSxpQkFDNUIsQ0FBQ0EsVUFBVSxHQUFJLEtBQUtBLFVBQVUsR0FBR0YsSUFBSSxDQUFDRyxLQUFMLENBQVdELFVBQVgsQ0FBbEIsQ0FBRCxHQUE4QyxDQUE1RCxFQUErREwsT0FBL0QsQ0FDRSxDQURGLENBRDRCO0FBQUEsU0FBaEIsQ0FBZDtBQUtBQyxRQUFBQSxLQUFLLEdBQUdILFdBQVcsQ0FBQ0gsTUFBWixDQUFtQixVQUFDQyxHQUFELEVBQU1NLENBQU47QUFBQSxpQkFBYU4sR0FBRyxJQUFJTyxJQUFJLENBQUNDLEtBQUwsQ0FBV0YsQ0FBWCxDQUFwQjtBQUFBLFNBQW5CLEVBQXVELENBQXZELENBQVI7QUFDRDs7QUFFRCxVQUFJRCxLQUFLLEtBQUssR0FBZCxFQUFtQjtBQUNqQixlQUFPSCxXQUFXLENBQUNDLEdBQVosQ0FBZ0IsVUFBQ00sVUFBRDtBQUFBLGlCQUFnQkYsSUFBSSxDQUFDQyxLQUFMLENBQVdDLFVBQVgsQ0FBaEI7QUFBQSxTQUFoQixDQUFQO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBLFVBQUlFLFNBQVMsR0FBRyxNQUFNTixLQUF0QjtBQUVBLFVBQUlPLGdCQUFnQixHQUFHVixXQUFXLENBQUNDLEdBQVosQ0FBZ0IsVUFBQ00sVUFBRCxFQUFhSSxLQUFiLEVBQXVCO0FBQzVELGVBQU87QUFDTEMsVUFBQUEsYUFBYSxFQUFFRCxLQURWO0FBRUxyRSxVQUFBQSxLQUFLLEVBQUVpRSxVQUZGO0FBR0xFLFVBQUFBLFNBQVMsRUFBRSxDQUFDRixVQUFVLEdBQUdGLElBQUksQ0FBQ0csS0FBTCxDQUFXRCxVQUFYLENBQWQsRUFBc0NMLE9BQXRDLENBQThDLENBQTlDO0FBSE4sU0FBUDtBQUtELE9BTnNCLENBQXZCO0FBT0FRLE1BQUFBLGdCQUFnQixDQUFDRyxJQUFqQixDQUNFLFVBQUNDLElBQUQsRUFBT0MsS0FBUDtBQUFBLGVBQ0U7QUFDQUEsVUFBQUEsS0FBSyxDQUFDTixTQUFOLEdBQWtCSyxJQUFJLENBQUNMLFNBQXZCLElBQW9DTSxLQUFLLENBQUN6RSxLQUFOLEdBQWN3RSxJQUFJLENBQUN4RTtBQUZ6RDtBQUFBLE9BREY7QUFNQSxVQUFNMEUsZ0JBQWdCLEdBQUcsRUFBekI7O0FBM0NrQztBQTZDaEMsWUFBTUMsbUJBQW1CLEdBQUdQLGdCQUFnQixDQUFDLENBQUQsQ0FBNUM7QUFFQSxZQUFNUSxJQUFJLEdBQUdSLGdCQUFnQixDQUFDUyxNQUFqQixDQUNYLFVBQUNDLGFBQUQ7QUFBQSxpQkFBbUJBLGFBQWEsQ0FBQzlFLEtBQWQsS0FBd0IyRSxtQkFBbUIsQ0FBQzNFLEtBQS9EO0FBQUEsU0FEVyxDQUFiO0FBR0FvRSxRQUFBQSxnQkFBZ0IsR0FBR0EsZ0JBQWdCLENBQUNTLE1BQWpCLENBQ2pCLFVBQUNDLGFBQUQ7QUFBQSxpQkFBbUJBLGFBQWEsQ0FBQzlFLEtBQWQsS0FBd0IyRSxtQkFBbUIsQ0FBQzNFLEtBQS9EO0FBQUEsU0FEaUIsQ0FBbkI7QUFJQSxZQUFNK0UsU0FBUyxHQUNiSCxJQUFJLENBQUNoSCxNQUFMLElBQWV1RyxTQUFmLElBQTRCUSxtQkFBbUIsQ0FBQ1IsU0FBcEIsS0FBa0MsTUFEaEU7QUFHQVMsUUFBQUEsSUFBSSxDQUFDOUYsT0FBTCxDQUFhLFVBQUNnRyxhQUFELEVBQW1CO0FBQzlCSixVQUFBQSxnQkFBZ0IsQ0FBQ0ksYUFBYSxDQUFDUixhQUFmLENBQWhCLEdBQ0VQLElBQUksQ0FBQ0csS0FBTCxDQUFXWSxhQUFhLENBQUM5RSxLQUF6QixLQUFtQytFLFNBQVMsR0FBRyxDQUFILEdBQU8sQ0FBbkQsQ0FERjtBQUVELFNBSEQ7QUFLQTtBQUNBWixRQUFBQSxTQUFTLElBQUlZLFNBQVMsR0FBR0gsSUFBSSxDQUFDaEgsTUFBUixHQUFpQixDQUF2QztBQS9EZ0M7O0FBNENsQyxhQUFPdUcsU0FBUyxHQUFHLENBQVosSUFBaUJDLGdCQUFnQixDQUFDeEcsTUFBakIsS0FBNEIsQ0FBcEQsRUFBdUQ7QUFBQTtBQW9CdEQ7O0FBRUR3RyxNQUFBQSxnQkFBZ0IsQ0FBQ3RGLE9BQWpCLENBQXlCLFVBQUNnRyxhQUFELEVBQW1CO0FBQzFDSixRQUFBQSxnQkFBZ0IsQ0FBQ0ksYUFBYSxDQUFDUixhQUFmLENBQWhCLEdBQWdEUCxJQUFJLENBQUNHLEtBQUwsQ0FDOUNZLGFBQWEsQ0FBQzlFLEtBRGdDLENBQWhEO0FBR0QsT0FKRDtBQU1BLGFBQU8wRSxnQkFBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXhnQkE7QUFBQTtBQUFBLFdBeWdCRSxnQ0FBdUJsQyxRQUF2QixFQUFpQztBQUFBOztBQUMvQixXQUFLOUcsbUJBQUwsQ0FDR3VDLElBREgsQ0FDUSxZQUFNO0FBQ1YsWUFBSSxNQUFJLENBQUNuQyxpQkFBVCxFQUE0QjtBQUMxQjtBQUNEOztBQUVELFFBQUEsTUFBSSxDQUFDa0osaUJBQUwsQ0FBdUJ4QyxRQUF2Qjs7QUFDQSxRQUFBLE1BQUksQ0FBQzFHLGlCQUFMLEdBQXlCLElBQXpCOztBQUVBLFlBQUksTUFBSSxDQUFDSSxZQUFULEVBQXVCO0FBQ3JCLFVBQUEsTUFBSSxDQUFDQSxZQUFMLENBQWtCc0csUUFBUSxDQUFDRSxZQUEzQixFQUF5QyxPQUF6QztBQUNBLFVBQUEsTUFBSSxDQUFDeEcsWUFBTCxDQUFrQnNHLFFBQVEsQ0FBQ0UsWUFBM0IsRUFBeUMsVUFBekMsSUFBdUQsSUFBdkQ7QUFDRDs7QUFFRCxRQUFBLE1BQUksQ0FBQ3RCLGFBQUwsQ0FBbUIsWUFBTTtBQUN2QixVQUFBLE1BQUksQ0FBQzZELDJCQUFMLENBQWlDekMsUUFBakM7QUFDRCxTQUZEOztBQUlBLFlBQUksTUFBSSxDQUFDbkgsT0FBTCxDQUFhb0QsWUFBYixDQUEwQixVQUExQixDQUFKLEVBQTJDO0FBQ3pDLFVBQUEsTUFBSSxDQUFDeUcsMEJBQUwsQ0FBZ0MsTUFBaEMsRUFBd0MxQyxRQUFRLENBQUNFLFlBQWpEO0FBQ0Q7QUFDRixPQXJCSCxFQXNCR3lDLEtBdEJILENBc0JTLFlBQU07QUFDWDtBQUNBLFFBQUEsTUFBSSxDQUFDSCxpQkFBTCxDQUF1QnhDLFFBQXZCOztBQUNBLFFBQUEsTUFBSSxDQUFDMUcsaUJBQUwsR0FBeUIsSUFBekI7O0FBQ0EsUUFBQSxNQUFJLENBQUNzRixhQUFMLENBQW1CLFlBQU07QUFDdkIsVUFBQSxNQUFJLENBQUM2RCwyQkFBTCxDQUFpQ3pDLFFBQWpDO0FBQ0QsU0FGRDtBQUdELE9BN0JIO0FBOEJEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQS9pQkE7QUFBQTtBQUFBLFdBZ2pCRSxvQ0FBMkI7QUFBQTs7QUFDekIsYUFBTyxLQUFLMEMsMEJBQUwsQ0FBZ0MsS0FBaEMsRUFBdUNqSCxJQUF2QyxDQUE0QyxVQUFDd0YsUUFBRCxFQUFjO0FBQy9ELFFBQUEsTUFBSSxDQUFDMkIsOEJBQUw7QUFDRTtBQUF3QzNCLFFBQUFBLFFBRDFDO0FBR0QsT0FKTSxDQUFQO0FBS0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQS9qQkE7QUFBQTtBQUFBLFdBZ2tCRSxvQ0FBMkI0QixNQUEzQixFQUFtQ0MsY0FBbkMsRUFBK0Q7QUFBQTs7QUFBQSxVQUE1QkEsY0FBNEI7QUFBNUJBLFFBQUFBLGNBQTRCLEdBQVhDLFNBQVc7QUFBQTs7QUFDN0QsVUFBSUMsR0FBRyxHQUFHLEtBQUtuSyxPQUFMLENBQWFxRixZQUFiLENBQTBCLFVBQTFCLENBQVY7O0FBQ0EsVUFBSSxDQUFDcEgsNEJBQTRCLENBQUNrTSxHQUFELENBQWpDLEVBQXdDO0FBQ3RDLGVBQU8xSCxPQUFPLENBQUMySCxNQUFSLENBQWU5SyxzQkFBZixDQUFQO0FBQ0Q7O0FBRUQsYUFBTyxLQUFLK0ssWUFBTCxHQUFvQnpILElBQXBCLENBQXlCLFVBQUMwSCxRQUFELEVBQWM7QUFDNUMsWUFBTUMsY0FBYyxHQUFHO0FBQUMsb0JBQVVQO0FBQVgsU0FBdkI7QUFDQSxZQUFNUSxhQUFhLEdBQUc1TCxJQUFJLENBQUM7QUFDekIsa0JBQVEsTUFBSSxDQUFDdUIsZ0JBRFk7QUFFekIsb0JBQVVtSztBQUZlLFNBQUQsQ0FBMUI7QUFJQUgsUUFBQUEsR0FBRyxHQUFHbk0sZUFBZSxDQUNuQixNQUFJLENBQUNtRCxXQUFMLENBQWlCc0osS0FBakIsQ0FBdUJOLEdBQXZCLENBRG1CLEVBRW5CLE1BQUksQ0FBQ08saUJBQUwsRUFGbUIsQ0FBckI7O0FBSUEsWUFBSUgsY0FBYyxDQUFDLFFBQUQsQ0FBZCxLQUE2QixNQUFqQyxFQUF5QztBQUN2Q0EsVUFBQUEsY0FBYyxDQUFDLE1BQUQsQ0FBZCxHQUF5QjtBQUFDLCtCQUFtQk47QUFBcEIsV0FBekI7QUFDQU0sVUFBQUEsY0FBYyxDQUFDLFNBQUQsQ0FBZCxHQUE0QjtBQUFDLDRCQUFnQjtBQUFqQixXQUE1QjtBQUNBSixVQUFBQSxHQUFHLEdBQUduTSxlQUFlLENBQUMsTUFBSSxDQUFDbUQsV0FBTCxDQUFpQnNKLEtBQWpCLENBQXVCTixHQUF2QixDQUFELEVBQThCLE9BQTlCLENBQXJCO0FBQ0Q7O0FBQ0RBLFFBQUFBLEdBQUcsR0FBR3BNLGNBQWMsQ0FBQ29NLEdBQUQsRUFBTUssYUFBTixDQUFwQjtBQUNBLGVBQU8sTUFBSSxDQUFDdkosZUFBTCxDQUNKMEosY0FESSxDQUNXUixHQURYLEVBQ2dCSSxjQURoQixFQUVKVCxLQUZJLENBRUUsVUFBQ2MsR0FBRDtBQUFBLGlCQUFTbE0sR0FBRyxHQUFHbUcsS0FBTixDQUFZNUYsR0FBWixFQUFpQjJMLEdBQWpCLENBQVQ7QUFBQSxTQUZGLENBQVA7QUFHRCxPQW5CTSxDQUFQO0FBb0JEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUE1bUJBO0FBQUE7QUFBQSxXQTZtQkUsd0NBQStCeEMsUUFBL0IsRUFBeUM7QUFDdkMsVUFBSSxFQUFFQSxRQUFRLElBQUlBLFFBQVEsQ0FBQyxTQUFELENBQXRCLENBQUosRUFBd0M7QUFDdEN6SixRQUFBQSxTQUFTLENBQ1B5SixRQUFRLElBQUksYUFBYUEsUUFEbEIsaUdBRXNGQSxRQUZ0RixDQUFUO0FBSUExSixRQUFBQSxHQUFHLEdBQUdtRyxLQUFOLENBQ0U1RixHQURGLGlHQUUrRm1KLFFBRi9GO0FBSUE7QUFDRDs7QUFDRCxVQUFNeUMsVUFBVSxHQUFHLEtBQUs5SixPQUFMLENBQWFNLGdCQUFiLENBQ2pCLHFDQURpQixFQUVqQmtCLE1BRkY7QUFHQTtBQUNBLFdBQUt1SSwrQkFBTCxDQUNFMUMsUUFBUSxDQUFDLFNBQUQsQ0FBUixDQUFvQjNELEtBQXBCLENBQTBCLENBQTFCLEVBQTZCb0csVUFBN0IsQ0FERjtBQUdEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUF0b0JBO0FBQUE7QUFBQSxXQXVvQkUseUNBQWdDbkYsSUFBaEMsRUFBc0M7QUFBQTs7QUFDcEMsVUFBTTVCLE9BQU8sR0FBRyxLQUFLL0MsT0FBTCxDQUFhTSxnQkFBYixDQUNkLHFDQURjLENBQWhCO0FBSUEsV0FBS1IsWUFBTCxHQUFvQixLQUFLa0ssVUFBTCxDQUFnQnJGLElBQWhCLENBQXBCO0FBQ0EsV0FBSzdFLFlBQUwsQ0FBa0I0QyxPQUFsQixDQUEwQixVQUFDMkUsUUFBRCxFQUFjO0FBQ3RDLFlBQUlBLFFBQVEsQ0FBQzRDLFFBQWIsRUFBdUI7QUFDckIsVUFBQSxPQUFJLENBQUN2SyxpQkFBTCxHQUF5QixJQUF6Qjs7QUFDQSxVQUFBLE9BQUksQ0FBQ3NDLHNCQUFMLENBQTRCcUYsUUFBUSxDQUFDWSxLQUFyQzs7QUFDQSxVQUFBLE9BQUksQ0FBQ2pELGFBQUwsQ0FBbUIsWUFBTTtBQUN2QixZQUFBLE9BQUksQ0FBQzZELDJCQUFMLENBQWlDOUYsT0FBTyxDQUFDc0UsUUFBUSxDQUFDWSxLQUFWLENBQXhDO0FBQ0QsV0FGRDtBQUdEO0FBQ0YsT0FSRDtBQVNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUE1cEJBO0FBQUE7QUFBQSxXQTZwQkUscUNBQTRCaUMsY0FBNUIsRUFBNEM7QUFDMUMsV0FBS2xLLE9BQUwsQ0FBYW9CLFNBQWIsQ0FBdUJDLEdBQXZCLENBQTJCLDRDQUEzQjs7QUFDQSxVQUFJNkksY0FBYyxJQUFJLElBQXRCLEVBQTRCO0FBQzFCQSxRQUFBQSxjQUFjLENBQUM5SSxTQUFmLENBQXlCQyxHQUF6QixDQUNFLDZDQURGO0FBR0Q7O0FBRUQsVUFBSSxLQUFLdkIsWUFBVCxFQUF1QjtBQUNyQixhQUFLRSxPQUFMLENBQWFvQixTQUFiLENBQXVCQyxHQUF2QixDQUEyQixzQ0FBM0I7QUFDQSxhQUFLOEksa0JBQUwsQ0FBd0IsS0FBS3JLLFlBQTdCO0FBQ0Q7O0FBQ0QsV0FBS3NLLGlCQUFMLEdBQXlCMUgsT0FBekIsQ0FBaUMsVUFBQzVCLEVBQUQsRUFBUTtBQUN2Q0EsUUFBQUEsRUFBRSxDQUFDbUUsWUFBSCxDQUFnQixVQUFoQixFQUE0QixDQUFDLENBQTdCO0FBQ0QsT0FGRDtBQUdEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBanJCQTtBQUFBO0FBQUEsV0FrckJFLGdDQUF1Qm9GLE1BQXZCLEVBQXNDO0FBQUEsVUFBZkEsTUFBZTtBQUFmQSxRQUFBQSxNQUFlLEdBQU4sSUFBTTtBQUFBOztBQUNwQyxVQUFNQyxNQUFNLEdBQUc7QUFDYkQsUUFBQUEsTUFBTSxFQUFFQSxNQUFNLElBQUksSUFBVixHQUFpQixLQUFLeEssUUFBTCxDQUFjd0ssTUFBZCxDQUFqQixHQUF5QyxJQURwQztBQUViRSxRQUFBQSxhQUFhLEVBQUUsS0FBS1osaUJBQUwsRUFGRjtBQUdiekssUUFBQUEsSUFBSSxFQUFFLEtBQUtFO0FBSEUsT0FBZjtBQUtBLFdBQUtlLGFBQUwsQ0FBbUJxSyxRQUFuQixDQUE0QjdOLE1BQU0sQ0FBQzhOLHFCQUFuQyxFQUEwREgsTUFBMUQ7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQTlyQkE7QUFBQTtBQUFBLFdBK3JCRSxpQ0FBd0IzRSxNQUF4QixFQUFnQztBQUFBOztBQUM5QixXQUFLM0YsT0FBTCxDQUFhTSxnQkFBYixDQUE4QixXQUE5QixFQUEyQ29DLE9BQTNDLENBQW1ELFVBQUM1QixFQUFELEVBQVE7QUFDekQ7QUFDQSxZQUNFQSxFQUFFLENBQUNNLFNBQUgsQ0FBYWlGLFFBQWIsQ0FBc0Isb0NBQXRCLEtBQ0EsT0FBSSxDQUFDM0csaUJBRlAsRUFHRTtBQUNBb0IsVUFBQUEsRUFBRSxDQUFDbUUsWUFBSCxDQUFnQixVQUFoQixFQUE0QixDQUFDLENBQTdCO0FBQ0QsU0FMRCxNQUtPO0FBQ0xuRSxVQUFBQSxFQUFFLENBQUNtRSxZQUFILENBQWdCLFVBQWhCLEVBQTRCVSxNQUFNLEdBQUcsQ0FBSCxHQUFPLENBQUMsQ0FBMUM7QUFDRDtBQUNGLE9BVkQ7QUFXRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQW50QkE7QUFBQTtBQUFBLFdBb3RCRSxvQkFBV3NCLFdBQVgsRUFBd0I7QUFDdEIsVUFBTXlELGlCQUFpQixHQUFHLEtBQUtOLGlCQUFMLEdBQXlCNUksTUFBbkQ7QUFDQSxVQUFNbUosV0FBVyxHQUFHLElBQUlDLEtBQUosQ0FBVUYsaUJBQVYsQ0FBcEI7QUFDQXpELE1BQUFBLFdBQVcsQ0FBQ3ZFLE9BQVosQ0FBb0IsVUFBQzJILE1BQUQsRUFBWTtBQUM5QixZQUFPcEMsS0FBUCxHQUFnQm9DLE1BQWhCLENBQU9wQyxLQUFQOztBQUNBLFlBQUlBLEtBQUssSUFBSSxDQUFULElBQWNBLEtBQUssR0FBR3lDLGlCQUExQixFQUE2QztBQUMzQ0MsVUFBQUEsV0FBVyxDQUFDMUMsS0FBRCxDQUFYLEdBQXFCb0MsTUFBckI7QUFDRDtBQUNGLE9BTEQ7O0FBT0EsV0FBSyxJQUFJUSxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHRixXQUFXLENBQUNuSixNQUFoQyxFQUF3Q3FKLENBQUMsRUFBekMsRUFBNkM7QUFDM0MsWUFBSSxDQUFDRixXQUFXLENBQUNFLENBQUQsQ0FBaEIsRUFBcUI7QUFDbkJGLFVBQUFBLFdBQVcsQ0FBQ0UsQ0FBRCxDQUFYLEdBQWlCO0FBQ2ZDLFlBQUFBLEtBQUssRUFBRSxDQURRO0FBRWY3QyxZQUFBQSxLQUFLLEVBQUU0QyxDQUZRO0FBR2ZaLFlBQUFBLFFBQVEsRUFBRTtBQUhLLFdBQWpCO0FBS0Q7QUFDRjs7QUFFRCxhQUFPVSxXQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUE5dUJBO0FBQUE7QUFBQSxXQSt1QkUsMkJBQWtCO0FBQUE7O0FBQ2hCLFVBQUksS0FBS25MLGFBQVQsRUFBd0I7QUFDdEI7QUFDRDs7QUFDRCxVQUFNdUwsR0FBRyxHQUFHLEtBQUsvSyxPQUFMLENBQWFzRSxZQUFiLENBQTBCLEtBQTFCLEtBQW9DLEtBQWhEO0FBQ0EsV0FBSzlFLGFBQUwsR0FBcUJuQywwQkFBMEIsQ0FBQyxJQUFELEVBQU87QUFBQzBOLFFBQUFBLEdBQUcsRUFBSEE7QUFBRCxPQUFQLENBQS9DO0FBRUEsVUFBSUMsTUFBSjtBQUNBLFdBQUtDLG9CQUFMLENBQ0UsWUFBTTtBQUNKO0FBQ0EsWUFBTUMsZUFBZSxHQUFHLE9BQUksQ0FBQ2pNLE9BQUw7QUFBYTtBQUFPa00sUUFBQUEscUJBQXBCLEVBQXhCOztBQUNBLFlBQU1DLFFBQVEsR0FBRyxPQUFJLENBQUN4RixVQUFMO0FBQWtCO0FBQU91RixRQUFBQSxxQkFBekIsRUFBakI7O0FBQ0EsWUFBTUUsUUFBUSxHQUFHLE9BQUksQ0FBQzVMLGVBQUw7QUFBcUI7QUFBTzBMLFFBQUFBLHFCQUE1QixFQUFqQjs7QUFDQSxZQUFNRyxjQUFjLEdBQ2xCLElBQUksQ0FBQ0QsUUFBUSxDQUFDRSxDQUFULEdBQWFGLFFBQVEsQ0FBQ0csTUFBdEIsR0FBK0JKLFFBQVEsQ0FBQ0csQ0FBekMsSUFBOENILFFBQVEsQ0FBQ0ksTUFEN0Q7QUFFQSxZQUFNQyxhQUFhLEdBQUdQLGVBQWUsQ0FBQ1EsS0FBaEIsR0FBd0JOLFFBQVEsQ0FBQ00sS0FBdkQ7QUFFQTtBQUNBLFlBQU1DLGdCQUFnQixHQUFHalAsS0FBSyxDQUFDNE8sY0FBYyxHQUFHLEdBQWxCLEVBQXVCLENBQXZCLEVBQTBCLEVBQTFCLENBQTlCO0FBQTZEO0FBQzdELFlBQU1NLGVBQWUsR0FBR2pFLElBQUksQ0FBQ2tFLEdBQUwsQ0FBU0osYUFBYSxHQUFHLEdBQXpCLEVBQThCLEVBQTlCLENBQXhCO0FBQTJEO0FBRTNEVCxRQUFBQSxNQUFNLEdBQUc7QUFDUCxvQkFBVVcsZ0JBQWdCLEdBQUcsR0FEdEI7QUFFUCx1QkFBYUMsZUFBZSxHQUFHLEdBRnhCO0FBR1Asc0JBQVksVUFITDtBQUlQLHFCQUFXO0FBSkosU0FBVDs7QUFPQTtBQUNBLFlBQUliLEdBQUcsS0FBSyxLQUFaLEVBQW1CO0FBQ2pCLGNBQU1lLFlBQVksR0FBRyxDQUFDVCxRQUFRLENBQUMzRCxDQUFULEdBQWEwRCxRQUFRLENBQUMxRCxDQUF2QixJQUE0QjBELFFBQVEsQ0FBQ00sS0FBMUQ7QUFDQVYsVUFBQUEsTUFBTSxDQUFDLE1BQUQsQ0FBTixHQUFpQnRPLEtBQUssQ0FBQ29QLFlBQVksR0FBRyxHQUFoQixFQUFxQixDQUFyQixFQUF3QixFQUF4QixDQUFMLEdBQW1DLEdBQXBEO0FBQ0QsU0FIRCxNQUdPO0FBQ0wsY0FBTUMsYUFBYSxHQUNqQixJQUFJLENBQUNWLFFBQVEsQ0FBQzNELENBQVQsR0FBYTJELFFBQVEsQ0FBQ0ssS0FBdEIsR0FBOEJOLFFBQVEsQ0FBQzFELENBQXhDLElBQTZDMEQsUUFBUSxDQUFDTSxLQUQ1RDtBQUVBVixVQUFBQSxNQUFNLENBQUMsT0FBRCxDQUFOLEdBQWtCdE8sS0FBSyxDQUFDcVAsYUFBYSxHQUFHLEdBQWpCLEVBQXNCLENBQXRCLEVBQXlCLEVBQXpCLENBQUwsR0FBb0MsR0FBdEQ7QUFDRDtBQUNGLE9BOUJILEVBK0JFLFlBQU07QUFDSi9OLFFBQUFBLGtCQUFrQixDQUNoQixPQUFJLENBQUN3QixhQURXLEVBRWhCcEMsMkJBQTJCLENBQUM0TixNQUFELENBRlgsQ0FBbEI7O0FBSUEsUUFBQSxPQUFJLENBQUNwRixVQUFMLEdBQWtCckIsV0FBbEIsQ0FBOEIsT0FBSSxDQUFDL0UsYUFBbkM7O0FBQ0EsUUFBQSxPQUFJLENBQUNDLGVBQUwsQ0FBcUJ3RixZQUFyQixDQUFrQyxNQUFsQyxFQUEwQyxFQUExQzs7QUFDQTtBQUNBLFFBQUEsT0FBSSxDQUFDekYsYUFBTCxDQUFtQnVHLGdCQUFuQixDQUFvQyxPQUFwQyxFQUE2QyxVQUFDQyxDQUFELEVBQU87QUFDbEQsY0FDRUEsQ0FBQyxDQUFDZ0csSUFBRixDQUFPLENBQVAsRUFBVTVLLFNBQVYsQ0FBb0JpRixRQUFwQixDQUNFLDhDQURGLENBREYsRUFJRTtBQUNBLFlBQUEsT0FBSSxDQUFDUCxnQkFBTDtBQUNEO0FBQ0YsU0FSRDtBQVNELE9BaERIO0FBa0REO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBOXlCQTtBQUFBO0FBQUEsV0EreUJFLDRCQUFtQjtBQUFBOztBQUNqQixVQUFJLENBQUMsS0FBS3RHLGFBQVYsRUFBeUI7QUFDdkI7QUFDRDs7QUFDRCxXQUFLd0YsYUFBTCxDQUFtQixZQUFNO0FBQ3ZCLFFBQUEsT0FBSSxDQUFDeEYsYUFBTCxDQUFtQnlNLE1BQW5COztBQUNBLFFBQUEsT0FBSSxDQUFDek0sYUFBTCxHQUFxQixJQUFyQjs7QUFDQSxZQUFJLE9BQUksQ0FBQ0MsZUFBVCxFQUEwQjtBQUN4QixVQUFBLE9BQUksQ0FBQ0EsZUFBTCxDQUFxQnlGLGVBQXJCLENBQXFDLE1BQXJDO0FBQ0Q7QUFDRixPQU5EO0FBT0Q7QUExekJIOztBQUFBO0FBQUEsRUFBeUNnSCxHQUFHLENBQUNDLFdBQTdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7XG4gIEFOQUxZVElDU19UQUdfTkFNRSxcbiAgU3RvcnlBbmFseXRpY3NFdmVudCxcbn0gZnJvbSAnLi4vLi4vYW1wLXN0b3J5LzEuMC9zdG9yeS1hbmFseXRpY3MnO1xuaW1wb3J0IHtjbGFtcH0gZnJvbSAnI2NvcmUvbWF0aCc7XG5pbXBvcnQge1xuICBBY3Rpb24sXG4gIFN0YXRlUHJvcGVydHksXG59IGZyb20gJy4uLy4uL2FtcC1zdG9yeS8xLjAvYW1wLXN0b3J5LXN0b3JlLXNlcnZpY2UnO1xuaW1wb3J0IHtBbmFseXRpY3NWYXJpYWJsZX0gZnJvbSAnLi4vLi4vYW1wLXN0b3J5LzEuMC92YXJpYWJsZS1zZXJ2aWNlJztcbmltcG9ydCB7Q1NTfSBmcm9tICcuLi8uLi8uLi9idWlsZC9hbXAtc3RvcnktaW50ZXJhY3RpdmUtMC4xLmNzcyc7XG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5pbXBvcnQge1xuICBhZGRQYXJhbXNUb1VybCxcbiAgYXBwZW5kUGF0aFRvVXJsLFxuICBhc3NlcnRBYnNvbHV0ZUh0dHBPckh0dHBzVXJsLFxufSBmcm9tICcuLi8uLi8uLi9zcmMvdXJsJztcbmltcG9ydCB7YmFzZTY0VXJsRW5jb2RlRnJvbVN0cmluZ30gZnJvbSAnI2NvcmUvdHlwZXMvc3RyaW5nL2Jhc2U2NCc7XG5pbXBvcnQge2Fzc2VydERvZXNOb3RDb250YWluRGlzcGxheX0gZnJvbSAnLi4vLi4vLi4vc3JjL2Fzc2VydC1kaXNwbGF5JztcbmltcG9ydCB7XG4gIGJ1aWxkSW50ZXJhY3RpdmVEaXNjbGFpbWVyLFxuICBidWlsZEludGVyYWN0aXZlRGlzY2xhaW1lckljb24sXG59IGZyb20gJy4vaW50ZXJhY3RpdmUtZGlzY2xhaW1lcic7XG5pbXBvcnQge2Nsb3Nlc3R9IGZyb20gJyNjb3JlL2RvbS9xdWVyeSc7XG5pbXBvcnQge1xuICBjcmVhdGVTaGFkb3dSb290V2l0aFN0eWxlLFxuICBtYXliZU1ha2VQcm94eVVybCxcbn0gZnJvbSAnLi4vLi4vYW1wLXN0b3J5LzEuMC91dGlscyc7XG5pbXBvcnQge2RlZHVwbGljYXRlSW50ZXJhY3RpdmVJZHN9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtkZXYsIGRldkFzc2VydH0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge2RpY3R9IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5pbXBvcnQge2Vtb2ppQ29uZmV0dGl9IGZyb20gJy4vaW50ZXJhY3RpdmUtY29uZmV0dGknO1xuaW1wb3J0IHt0b0FycmF5fSBmcm9tICcjY29yZS90eXBlcy9hcnJheSc7XG5pbXBvcnQge3NldEltcG9ydGFudFN0eWxlc30gZnJvbSAnI2NvcmUvZG9tL3N0eWxlJztcbmltcG9ydCB7aXNFeHBlcmltZW50T259IGZyb20gJyNleHBlcmltZW50cy8nO1xuXG4vKiogQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBUQUcgPSAnYW1wLXN0b3J5LWludGVyYWN0aXZlJztcblxuLyoqXG4gKiBAY29uc3QgQGVudW0ge251bWJlcn1cbiAqL1xuZXhwb3J0IGNvbnN0IEludGVyYWN0aXZlVHlwZSA9IHtcbiAgUVVJWjogMCxcbiAgUE9MTDogMSxcbiAgUkVTVUxUUzogMixcbn07XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IEVORFBPSU5UX0lOVkFMSURfRVJST1IgPVxuICAnVGhlIHB1Ymxpc2hlciBoYXMgc3BlY2lmaWVkIGFuIGludmFsaWQgZGF0YXN0b3JlIGVuZHBvaW50JztcblxuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgSU5URVJBQ1RJVkVfQUNUSVZFX0NMQVNTID0gJ2ktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1hY3RpdmUnO1xuXG4vKipcbiAqIEB0eXBlZGVmIHt7XG4gKiAgICBpbmRleDogbnVtYmVyLFxuICogICAgY291bnQ6IG51bWJlcixcbiAqICAgIHNlbGVjdGVkOiBib29sZWFuLFxuICogfX1cbiAqL1xuZXhwb3J0IGxldCBJbnRlcmFjdGl2ZU9wdGlvblR5cGU7XG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqICAgIG9wdGlvbnM6ICFBcnJheTxJbnRlcmFjdGl2ZU9wdGlvblR5cGU+LFxuICogfX1cbiAqL1xuZXhwb3J0IGxldCBJbnRlcmFjdGl2ZVJlc3BvbnNlVHlwZTtcblxuLyoqXG4gKiBAdHlwZWRlZiB7e1xuICogICAgb3B0aW9uSW5kZXg6IG51bWJlcixcbiAqICAgIHRleHQ6IHN0cmluZyxcbiAqICAgIGNvcnJlY3Q6ID9zdHJpbmcsXG4gKiAgICByZXN1bHRzY2F0ZWdvcnk6ID9zdHJpbmcsXG4gKiAgICBpbWFnZTogP3N0cmluZyxcbiAqICAgIGNvbmZldHRpOiA/c3RyaW5nLFxuICogICAgcmVzdWx0c3RocmVzaG9sZDogP3N0cmluZyxcbiAqIH19XG4gKi9cbmV4cG9ydCBsZXQgT3B0aW9uQ29uZmlnVHlwZTtcblxuLyoqIEBjb25zdCB7QXJyYXk8T2JqZWN0Pn0gZm9udEZhY2VzIHdpdGggdXJscyBmcm9tIGh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzMj9mYW1pbHk9UG9wcGluczp3Z2h0QDQwMDs3MDAmYW1wO2Rpc3BsYXk9c3dhcCAqL1xuY29uc3QgZm9udHNUb0xvYWQgPSBbXG4gIHtcbiAgICBmYW1pbHk6ICdQb3BwaW5zJyxcbiAgICB3ZWlnaHQ6ICc0MDAnLFxuICAgIHNyYzogXCJ1cmwoaHR0cHM6Ly9mb250cy5nc3RhdGljLmNvbS9zL3BvcHBpbnMvdjkvcHhpRXlwOGt2OEpIZ0ZWckpKZmVjbkZIR1BjLndvZmYyKSBmb3JtYXQoJ3dvZmYyJylcIixcbiAgfSxcbiAge1xuICAgIGZhbWlseTogJ1BvcHBpbnMnLFxuICAgIHdlaWdodDogJzcwMCcsXG4gICAgc3JjOiBcInVybChodHRwczovL2ZvbnRzLmdzdGF0aWMuY29tL3MvcG9wcGlucy92OS9weGlCeXA4a3Y4SkhnRlZyTEN6N1oxeGxGZDJKUUVrLndvZmYyKSBmb3JtYXQoJ3dvZmYyJylcIixcbiAgfSxcbl07XG5cbi8qKlxuICogSW50ZXJhY3RpdmUgYWJzdHJhY3QgY2xhc3Mgd2l0aCBzaGFyZWQgZnVuY3Rpb25hbGl0eSBmb3IgaW50ZXJhY3RpdmUgY29tcG9uZW50cy5cbiAqXG4gKiBMaWZlY3ljbGU6XG4gKiAxKSBXaGVuIGNyZWF0ZWQsIHRoZSBhYnN0cmFjdCBjbGFzcyB3aWxsIGNhbGwgdGhlIGJ1aWxkQ29tcG9uZW50KCkgbWV0aG9kIGltcGxlbWVudGVkIGJ5IGVhY2ggY29uY3JldGUgY2xhc3MuXG4gKiAgIE5PVEU6IFdoZW4gY3JlYXRlZCwgdGhlIGNvbXBvbmVudCB3aWxsIHJlY2VpdmUgYSAuaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLWNvbXBvbmVudCwgaW5oZXJpdGluZyB1c2VmdWwgQ1NTIHZhcmlhYmxlcy5cbiAqXG4gKiAyKSBJZiBhbiBlbmRwb2ludCBpcyBzcGVjaWZpZWQsIGl0IHdpbGwgcmV0cmlldmUgYWdncmVnYXRlIHJlc3VsdHMgZnJvbSB0aGUgYmFja2VuZCBhbmQgcHJvY2VzcyB0aGVtLiBJZiB0aGUgY2xpZW50SWRcbiAqICAgaGFzIHJlc3BvbmRlZCBpbiBhIHByZXZpb3VzIHNlc3Npb24sIHRoZSBjb21wb25lbnQgd2lsbCBjaGFuZ2UgdG8gYSBwb3N0LXNlbGVjdGlvbiBzdGF0ZS4gT3RoZXJ3aXNlIGl0IHdpbGwgd2FpdFxuICogICBmb3IgdXNlciBzZWxlY3Rpb24uXG4gKiAgIE5PVEU6IENsaWNrIGxpc3RlbmVycyB3aWxsIGJlIGF0dGFjaGVkIHRvIGFsbCBvcHRpb25zLCB3aGljaCByZXF1aXJlIC5pLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtb3B0aW9uLlxuICpcbiAqIDMpIE9uIHVzZXIgc2VsZWN0aW9uLCBpdCB3aWxsIHByb2Nlc3MgdGhlIGJhY2tlbmQgcmVzdWx0cyAoaWYgZW5kcG9pbnQgc3BlY2lmaWVkKSBhbmQgZGlzcGxheSB0aGUgc2VsZWN0ZWQgb3B0aW9uLlxuICogICBBbmFseXRpYyBldmVudHMgd2lsbCBiZSBzZW50LCBwZXJjZW50YWdlcyB1cGRhdGVkIChpbXBsZW1lbnRlZCBieSB0aGUgY29uY3JldGUgY2xhc3MpLCBhbmQgYmFja2VuZCBwb3N0ZWQgd2l0aCB0aGVcbiAqICAgdXNlciByZXNwb25zZS4gQ2xhc3NlcyB3aWxsIGJlIGFkZGVkIHRvIHRoZSBjb21wb25lbnQgYW5kIG9wdGlvbnMgYWNjb3JkaW5nbHkuXG4gKiAgIE5PVEU6IE9uIG9wdGlvbiBzZWxlY3RlZCwgdGhlIHNlbGVjdGlvbiB3aWxsIHJlY2VpdmUgYSAuaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW9wdGlvbi1zZWxlY3RlZCwgYW5kIHRoZSByb290IGVsZW1lbnRcbiAqICAgd2lsbCByZWNlaXZlIGEgLmktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1wb3N0LXNlbGVjdGlvbi4gT3B0aW9uYWxseSwgaWYgdGhlIGVuZHBvaW50IHJldHVybmVkIGFnZ3JlZ2F0ZSByZXN1bHRzLFxuICogICB0aGUgcm9vdCBlbGVtZW50IHdpbGwgYWxzbyByZWNlaXZlIGEgLmktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1oYXMtZGF0YS5cbiAqXG4gKiBAYWJzdHJhY3RcbiAqL1xuZXhwb3J0IGNsYXNzIEFtcFN0b3J5SW50ZXJhY3RpdmUgZXh0ZW5kcyBBTVAuQmFzZUVsZW1lbnQge1xuICAvKipcbiAgICogQHBhcmFtIHshQW1wRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcGFyYW0geyFJbnRlcmFjdGl2ZVR5cGV9IHR5cGVcbiAgICogQHBhcmFtIHshQXJyYXk8bnVtYmVyPn0gYm91bmRzIHRoZSBib3VuZHMgb24gbnVtYmVyIG9mIG9wdGlvbnMsIGluY2x1c2l2ZVxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgdHlwZSwgYm91bmRzID0gWzIsIDRdKSB7XG4gICAgc3VwZXIoZWxlbWVudCk7XG5cbiAgICAvKiogQHByb3RlY3RlZCBAY29uc3Qge0ludGVyYWN0aXZlVHlwZX0gKi9cbiAgICB0aGlzLmludGVyYWN0aXZlVHlwZV8gPSB0eXBlO1xuXG4gICAgLyoqIEBwcm90ZWN0ZWQgez8uLi8uLi9hbXAtc3RvcnkvMS4wL3N0b3J5LWFuYWx5dGljcy5TdG9yeUFuYWx5dGljc1NlcnZpY2V9ICovXG4gICAgdGhpcy5hbmFseXRpY3NTZXJ2aWNlXyA9IG51bGw7XG5cbiAgICAvKiogQHByb3RlY3RlZCB7P1Byb21pc2U8P0ludGVyYWN0aXZlUmVzcG9uc2VUeXBlfD9Kc29uT2JqZWN0fHVuZGVmaW5lZD59ICovXG4gICAgdGhpcy5iYWNrZW5kRGF0YVByb21pc2VfID0gbnVsbDtcblxuICAgIC8qKiBAcHJvdGVjdGVkIHs/UHJvbWlzZTxKc29uT2JqZWN0Pn0gKi9cbiAgICB0aGlzLmNsaWVudElkUHJvbWlzZV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/RWxlbWVudH0gdGhlIGRpc2NsYWltZXIgZGlhbG9nIGlmIG9wZW4sIG51bGwgaWYgY2xvc2VkICovXG4gICAgdGhpcy5kaXNjbGFpbWVyRWxfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5kaXNjbGFpbWVySWNvbl8gPSBudWxsO1xuXG4gICAgLyoqIEBwcm90ZWN0ZWQge2Jvb2xlYW59ICovXG4gICAgdGhpcy5oYXNVc2VyU2VsZWN0aW9uXyA9IGZhbHNlO1xuXG4gICAgLyoqIEBwcml2YXRlIHshQXJyYXk8bnVtYmVyPn0gbWluIGFuZCBtYXggbnVtYmVyIG9mIG9wdGlvbnMsIGluY2x1c2l2ZSAqL1xuICAgIHRoaXMub3B0aW9uQm91bmRzXyA9IGJvdW5kcztcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0FycmF5PCFFbGVtZW50Pn0gRE9NIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW9wdGlvbiBjbGFzcyAqL1xuICAgIHRoaXMub3B0aW9uRWxlbWVudHNfID0gbnVsbDtcblxuICAgIC8qKiBAcHJvdGVjdGVkIHs/QXJyYXk8IU9wdGlvbkNvbmZpZ1R5cGU+fSBvcHRpb24gY29uZmlnIHZhbHVlcyBmcm9tIGF0dHJpYnV0ZXMgKHRleHQsIGNvcnJlY3QuLi4pICovXG4gICAgdGhpcy5vcHRpb25zXyA9IG51bGw7XG5cbiAgICAvKiogQHByb3RlY3RlZCB7P0FycmF5PCFJbnRlcmFjdGl2ZU9wdGlvblR5cGU+fSByZXRyaWV2ZWQgcmVzdWx0cyBmcm9tIHRoZSBiYWNrZW5kICovXG4gICAgdGhpcy5vcHRpb25zRGF0YV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/RWxlbWVudH0gdGhlIHBhZ2UgZWxlbWVudCB0aGUgY29tcG9uZW50IGlzIG9uICovXG4gICAgdGhpcy5wYWdlRWxfID0gbnVsbDtcblxuICAgIC8qKiBAcHJvdGVjdGVkIHs/RWxlbWVudH0gKi9cbiAgICB0aGlzLnJvb3RFbF8gPSBudWxsO1xuXG4gICAgLyoqIEBwdWJsaWMgey4uLy4uLy4uL3NyYy9zZXJ2aWNlL2xvY2FsaXphdGlvblNlcnZpY2V9ICovXG4gICAgdGhpcy5sb2NhbGl6YXRpb25TZXJ2aWNlID0gbnVsbDtcblxuICAgIC8qKiBAcHJvdGVjdGVkIHs/Li4vLi4vYW1wLXN0b3J5LzEuMC9hbXAtc3RvcnktcmVxdWVzdC1zZXJ2aWNlLkFtcFN0b3J5UmVxdWVzdFNlcnZpY2V9ICovXG4gICAgdGhpcy5yZXF1ZXN0U2VydmljZV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcm90ZWN0ZWQgez8uLi8uLi9hbXAtc3RvcnkvMS4wL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlLkFtcFN0b3J5U3RvcmVTZXJ2aWNlfSAqL1xuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXyA9IG51bGw7XG5cbiAgICAvKiogQHByb3RlY3RlZCB7Py4uLy4uLy4uL3NyYy9zZXJ2aWNlL3VybC1pbXBsLlVybH0gKi9cbiAgICB0aGlzLnVybFNlcnZpY2VfID0gbnVsbDtcblxuICAgIC8qKiBAcHJvdGVjdGVkIHs/Li4vLi4vYW1wLXN0b3J5LzEuMC92YXJpYWJsZS1zZXJ2aWNlLkFtcFN0b3J5VmFyaWFibGVTZXJ2aWNlfSAqL1xuICAgIHRoaXMudmFyaWFibGVTZXJ2aWNlXyA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgcm9vdCBlbGVtZW50LlxuICAgKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAgICogQHJldHVybiB7P0VsZW1lbnR9XG4gICAqL1xuICBnZXRSb290RWxlbWVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5yb290RWxfO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG9wdGlvbnMuXG4gICAqIEBwcm90ZWN0ZWRcbiAgICogQHJldHVybiB7IUFycmF5PCFFbGVtZW50Pn1cbiAgICovXG4gIGdldE9wdGlvbkVsZW1lbnRzKCkge1xuICAgIGlmICghdGhpcy5vcHRpb25FbGVtZW50c18pIHtcbiAgICAgIHRoaXMub3B0aW9uRWxlbWVudHNfID0gdG9BcnJheShcbiAgICAgICAgdGhpcy5yb290RWxfLnF1ZXJ5U2VsZWN0b3JBbGwoJy5pLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtb3B0aW9uJylcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm9wdGlvbkVsZW1lbnRzXztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBpbnRlcmFjdGl2ZSBJRFxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBnZXRJbnRlcmFjdGl2ZUlkXygpIHtcbiAgICBpZiAoIUFtcFN0b3J5SW50ZXJhY3RpdmUuY2Fub25pY2FsVXJsNjQpIHtcbiAgICAgIGRlZHVwbGljYXRlSW50ZXJhY3RpdmVJZHModGhpcy53aW4uZG9jdW1lbnQpO1xuICAgICAgQW1wU3RvcnlJbnRlcmFjdGl2ZS5jYW5vbmljYWxVcmw2NCA9IGJhc2U2NFVybEVuY29kZUZyb21TdHJpbmcoXG4gICAgICAgIFNlcnZpY2VzLmRvY3VtZW50SW5mb0ZvckRvYyh0aGlzLmVsZW1lbnQpLmNhbm9uaWNhbFVybFxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIGAke0FtcFN0b3J5SW50ZXJhY3RpdmUuY2Fub25pY2FsVXJsNjR9KyR7dGhpcy5lbGVtZW50LmlkfWA7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICogQHJldHVybiB7RWxlbWVudH0gdGhlIHBhZ2UgZWxlbWVudFxuICAgKi9cbiAgZ2V0UGFnZUVsXygpIHtcbiAgICBpZiAodGhpcy5wYWdlRWxfID09IG51bGwpIHtcbiAgICAgIHRoaXMucGFnZUVsXyA9IGNsb3Nlc3QoZGV2KCkuYXNzZXJ0RWxlbWVudCh0aGlzLmVsZW1lbnQpLCAoZWwpID0+IHtcbiAgICAgICAgcmV0dXJuIGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2FtcC1zdG9yeS1wYWdlJztcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wYWdlRWxfO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBidWlsZENhbGxiYWNrKGNvbmNyZXRlQ1NTID0gJycpIHtcbiAgICB0aGlzLmxvYWRGb250c18oKTtcbiAgICB0aGlzLm9wdGlvbnNfID0gdGhpcy5wYXJzZU9wdGlvbnNfKCk7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2ktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1jb21wb25lbnQnKTtcbiAgICB0aGlzLmFkanVzdEdyaWRMYXllcl8oKTtcbiAgICBkZXZBc3NlcnQodGhpcy5lbGVtZW50LmNoaWxkcmVuLmxlbmd0aCA9PSAwLCAnVG9vIG1hbnkgY2hpbGRyZW4nKTtcblxuICAgIC8vIEluaXRpYWxpemUgYWxsIHRoZSBzZXJ2aWNlcyBiZWZvcmUgcHJvY2VlZGluZywgYW5kIHVwZGF0ZSBzdG9yZSB3aXRoIHN0YXRlXG4gICAgdGhpcy51cmxTZXJ2aWNlXyA9IFNlcnZpY2VzLnVybEZvckRvYyh0aGlzLmVsZW1lbnQpO1xuICAgIHJldHVybiBQcm9taXNlLmFsbChbXG4gICAgICBTZXJ2aWNlcy5zdG9yeVZhcmlhYmxlU2VydmljZUZvck9yTnVsbCh0aGlzLndpbikudGhlbigoc2VydmljZSkgPT4ge1xuICAgICAgICB0aGlzLnZhcmlhYmxlU2VydmljZV8gPSBzZXJ2aWNlO1xuICAgICAgfSksXG4gICAgICBTZXJ2aWNlcy5zdG9yeVN0b3JlU2VydmljZUZvck9yTnVsbCh0aGlzLndpbikudGhlbigoc2VydmljZSkgPT4ge1xuICAgICAgICB0aGlzLnN0b3JlU2VydmljZV8gPSBzZXJ2aWNlO1xuICAgICAgICB0aGlzLnVwZGF0ZVN0b3J5U3RvcmVTdGF0ZV8obnVsbCk7XG4gICAgICB9KSxcbiAgICAgIFNlcnZpY2VzLnN0b3J5UmVxdWVzdFNlcnZpY2VGb3JPck51bGwodGhpcy53aW4pLnRoZW4oKHNlcnZpY2UpID0+IHtcbiAgICAgICAgdGhpcy5yZXF1ZXN0U2VydmljZV8gPSBzZXJ2aWNlO1xuICAgICAgfSksXG4gICAgICBTZXJ2aWNlcy5zdG9yeUFuYWx5dGljc1NlcnZpY2VGb3JPck51bGwodGhpcy53aW4pLnRoZW4oKHNlcnZpY2UpID0+IHtcbiAgICAgICAgdGhpcy5hbmFseXRpY3NTZXJ2aWNlXyA9IHNlcnZpY2U7XG4gICAgICB9KSxcbiAgICAgIFNlcnZpY2VzLmxvY2FsaXphdGlvblNlcnZpY2VGb3JPck51bGwodGhpcy5lbGVtZW50KS50aGVuKChzZXJ2aWNlKSA9PiB7XG4gICAgICAgIHRoaXMubG9jYWxpemF0aW9uU2VydmljZSA9IHNlcnZpY2U7XG4gICAgICB9KSxcbiAgICBdKS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMucm9vdEVsXyA9IHRoaXMuYnVpbGRDb21wb25lbnQoKTtcbiAgICAgIHRoaXMucm9vdEVsXy5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtY29udGFpbmVyJyk7XG4gICAgICBpZiAoXG4gICAgICAgIGlzRXhwZXJpbWVudE9uKHRoaXMud2luLCAnYW1wLXN0b3J5LWludGVyYWN0aXZlLWRpc2NsYWltZXInKSAmJlxuICAgICAgICB0aGlzLmVsZW1lbnQuaGFzQXR0cmlidXRlKCdlbmRwb2ludCcpXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5kaXNjbGFpbWVySWNvbl8gPSBidWlsZEludGVyYWN0aXZlRGlzY2xhaW1lckljb24odGhpcyk7XG4gICAgICAgIHRoaXMucm9vdEVsXy5wcmVwZW5kKHRoaXMuZGlzY2xhaW1lckljb25fKTtcbiAgICAgIH1cbiAgICAgIGNyZWF0ZVNoYWRvd1Jvb3RXaXRoU3R5bGUoXG4gICAgICAgIHRoaXMuZWxlbWVudCxcbiAgICAgICAgZGV2KCkuYXNzZXJ0RWxlbWVudCh0aGlzLnJvb3RFbF8pLFxuICAgICAgICBDU1MgKyBjb25jcmV0ZUNTU1xuICAgICAgKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbG9hZEZvbnRzXygpIHtcbiAgICBpZiAoXG4gICAgICAhQW1wU3RvcnlJbnRlcmFjdGl2ZS5sb2FkZWRGb250cyAmJlxuICAgICAgdGhpcy53aW4uZG9jdW1lbnQuZm9udHMgJiZcbiAgICAgIEZvbnRGYWNlXG4gICAgKSB7XG4gICAgICBmb250c1RvTG9hZC5mb3JFYWNoKChmb250UHJvcGVydGllcykgPT4ge1xuICAgICAgICBjb25zdCBmb250ID0gbmV3IEZvbnRGYWNlKGZvbnRQcm9wZXJ0aWVzLmZhbWlseSwgZm9udFByb3BlcnRpZXMuc3JjLCB7XG4gICAgICAgICAgd2VpZ2h0OiBmb250UHJvcGVydGllcy53ZWlnaHQsXG4gICAgICAgICAgc3R5bGU6ICdub3JtYWwnLFxuICAgICAgICB9KTtcbiAgICAgICAgZm9udC5sb2FkKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy53aW4uZG9jdW1lbnQuZm9udHMuYWRkKGZvbnQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBBbXBTdG9yeUludGVyYWN0aXZlLmxvYWRlZEZvbnRzID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFkcyB0aGUgZWxlbWVudCBhdHRyaWJ1dGVzIHByZWZpeGVkIHdpdGggb3B0aW9uLSBhbmQgcmV0dXJucyB0aGVtIGFzIGEgbGlzdC5cbiAgICogZWc6IFtcbiAgICogICAgICB7b3B0aW9uSW5kZXg6IDAsIHRleHQ6ICdLb2FsYSd9LFxuICAgKiAgICAgIHtvcHRpb25JbmRleDogMSwgdGV4dDogJ0RldmVsb3BlcnMnLCBjb3JyZWN0OiAnJ31cbiAgICogICAgXVxuICAgKiBAcHJvdGVjdGVkXG4gICAqIEByZXR1cm4gez9BcnJheTwhT3B0aW9uQ29uZmlnVHlwZT59XG4gICAqL1xuICBwYXJzZU9wdGlvbnNfKCkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSBbXTtcbiAgICB0b0FycmF5KHRoaXMuZWxlbWVudC5hdHRyaWJ1dGVzKS5mb3JFYWNoKChhdHRyKSA9PiB7XG4gICAgICAvLyBNYXRjaCAnb3B0aW9uLSMtdHlwZScgKGVnOiBvcHRpb24tMS10ZXh0LCBvcHRpb24tMi1pbWFnZSwgb3B0aW9uLTMtY29ycmVjdC4uLilcbiAgICAgIGlmIChhdHRyLm5hbWUubWF0Y2goL15vcHRpb24tXFxkKygtXFx3KykrJC8pKSB7XG4gICAgICAgIGNvbnN0IHNwbGl0UGFydHMgPSBhdHRyLm5hbWUuc3BsaXQoJy0nKTtcbiAgICAgICAgY29uc3Qgb3B0aW9uTnVtYmVyID0gcGFyc2VJbnQoc3BsaXRQYXJ0c1sxXSwgMTApO1xuICAgICAgICAvLyBBZGQgYWxsIG9wdGlvbnMgaW4gb3JkZXIgb24gdGhlIGFycmF5IHdpdGggY29ycmVjdCBpbmRleC5cbiAgICAgICAgd2hpbGUgKG9wdGlvbnMubGVuZ3RoIDwgb3B0aW9uTnVtYmVyKSB7XG4gICAgICAgICAgb3B0aW9ucy5wdXNoKHsnb3B0aW9uSW5kZXgnOiBvcHRpb25zLmxlbmd0aH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGtleSA9IHNwbGl0UGFydHMuc2xpY2UoMikuam9pbignJyk7XG4gICAgICAgIGlmIChrZXkgPT09ICdpbWFnZScpIHtcbiAgICAgICAgICBvcHRpb25zW29wdGlvbk51bWJlciAtIDFdW2tleV0gPSBtYXliZU1ha2VQcm94eVVybChcbiAgICAgICAgICAgIGF0dHIudmFsdWUsXG4gICAgICAgICAgICB0aGlzLmdldEFtcERvYygpXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvcHRpb25zW29wdGlvbk51bWJlciAtIDFdW2tleV0gPSBhdHRyLnZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKFxuICAgICAgb3B0aW9ucy5sZW5ndGggPj0gdGhpcy5vcHRpb25Cb3VuZHNfWzBdICYmXG4gICAgICBvcHRpb25zLmxlbmd0aCA8PSB0aGlzLm9wdGlvbkJvdW5kc19bMV1cbiAgICApIHtcbiAgICAgIHJldHVybiBvcHRpb25zO1xuICAgIH1cbiAgICBkZXZBc3NlcnQoXG4gICAgICBvcHRpb25zLmxlbmd0aCA+PSB0aGlzLm9wdGlvbkJvdW5kc19bMF0gJiZcbiAgICAgICAgb3B0aW9ucy5sZW5ndGggPD0gdGhpcy5vcHRpb25Cb3VuZHNfWzFdLFxuICAgICAgYEltcHJvcGVyIG51bWJlciBvZiBvcHRpb25zLiBFeHBlY3RlZCAke3RoaXMub3B0aW9uQm91bmRzX1swXX0gPD0gb3B0aW9ucyA8PSAke3RoaXMub3B0aW9uQm91bmRzX1sxXX0gYnV0IGdvdCAke29wdGlvbnMubGVuZ3RofS5gXG4gICAgKTtcbiAgICBkZXYoKS5lcnJvcihcbiAgICAgIFRBRyxcbiAgICAgIGBJbXByb3BlciBudW1iZXIgb2Ygb3B0aW9ucy4gRXhwZWN0ZWQgJHt0aGlzLm9wdGlvbkJvdW5kc19bMF19IDw9IG9wdGlvbnMgPD0gJHt0aGlzLm9wdGlvbkJvdW5kc19bMV19IGJ1dCBnb3QgJHtvcHRpb25zLmxlbmd0aH0uYFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogRmluZHMgdGhlIHByb21wdCBhbmQgYWRkcyBpdCB0byB0aGUgcHJvbXB0LWNvbnRhaW5lclxuICAgKlxuICAgKiBAcHJvdGVjdGVkXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gcm9vdFxuICAgKi9cbiAgYXR0YWNoUHJvbXB0Xyhyb290KSB7XG4gICAgY29uc3QgcHJvbXB0Q29udGFpbmVyID0gcm9vdC5xdWVyeVNlbGVjdG9yKFxuICAgICAgJy5pLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtcHJvbXB0LWNvbnRhaW5lcidcbiAgICApO1xuXG4gICAgaWYgKCF0aGlzLmVsZW1lbnQuaGFzQXR0cmlidXRlKCdwcm9tcHQtdGV4dCcpKSB7XG4gICAgICB0aGlzLnJvb3RFbF8ucmVtb3ZlQ2hpbGQocHJvbXB0Q29udGFpbmVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcHJvbXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgICAgcHJvbXB0LnRleHRDb250ZW50ID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgncHJvbXB0LXRleHQnKTtcbiAgICAgIHByb21wdC5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtcHJvbXB0Jyk7XG4gICAgICBwcm9tcHRDb250YWluZXIuYXBwZW5kQ2hpbGQocHJvbXB0KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGVzIHRoZSB0ZW1wbGF0ZSBmcm9tIHRoZSBjb25maWdfIE1hcC5cbiAgICpcbiAgICogQHJldHVybiB7IUVsZW1lbnR9IHJvb3RFbF9cbiAgICogQHByb3RlY3RlZCBAYWJzdHJhY3RcbiAgICovXG4gIGJ1aWxkQ29tcG9uZW50KCkge1xuICAgIC8vIFN1YmNsYXNzIG11c3Qgb3ZlcnJpZGUuXG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGxheW91dENhbGxiYWNrKCkge1xuICAgIHRoaXMuaW5pdGlhbGl6ZUxpc3RlbmVyc18oKTtcbiAgICByZXR1cm4gKHRoaXMuYmFja2VuZERhdGFQcm9taXNlXyA9IHRoaXMuZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2VuZHBvaW50JylcbiAgICAgID8gdGhpcy5yZXRyaWV2ZUludGVyYWN0aXZlRGF0YV8oKVxuICAgICAgOiBQcm9taXNlLnJlc29sdmUoKSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIFByb21pc2UgdG8gcmV0dXJuIHRoZSB1bmlxdWUgQU1QIGNsaWVudElkXG4gICAqIEBwcml2YXRlXG4gICAqIEByZXR1cm4ge1Byb21pc2U8c3RyaW5nPn1cbiAgICovXG4gIGdldENsaWVudElkXygpIHtcbiAgICBpZiAoIXRoaXMuY2xpZW50SWRQcm9taXNlXykge1xuICAgICAgdGhpcy5jbGllbnRJZFByb21pc2VfID0gU2VydmljZXMuY2lkRm9yRG9jKHRoaXMuZWxlbWVudCkudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICByZXR1cm4gZGF0YS5nZXQoXG4gICAgICAgICAge3Njb3BlOiAnYW1wLXN0b3J5JywgY3JlYXRlQ29va2llSWZOb3RQcmVzZW50OiB0cnVlfSxcbiAgICAgICAgICAvKiBjb25zZW50ICovIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2xpZW50SWRQcm9taXNlXztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFjdHMgdG8gUlRMIHN0YXRlIHVwZGF0ZXMgYW5kIHRyaWdnZXJzIHRoZSBVSSBmb3IgUlRMLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHJ0bFN0YXRlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblJ0bFN0YXRlVXBkYXRlXyhydGxTdGF0ZSkge1xuICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PiB7XG4gICAgICBydGxTdGF0ZVxuICAgICAgICA/IHRoaXMucm9vdEVsXy5zZXRBdHRyaWJ1dGUoJ2RpcicsICdydGwnKVxuICAgICAgICA6IHRoaXMucm9vdEVsXy5yZW1vdmVBdHRyaWJ1dGUoJ2RpcicpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBpc0xheW91dFN1cHBvcnRlZChsYXlvdXQpIHtcbiAgICByZXR1cm4gbGF5b3V0ID09PSAnY29udGFpbmVyJztcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgY2xhc3NlcyB0byBhZGp1c3QgdGhlIGJvdHRvbSBwYWRkaW5nIG9uIHRoZSBncmlkLWxheWVyXG4gICAqIHRvIHByZXZlbnQgb3ZlcmxhcCB3aXRoIHRoZSBjb21wb25lbnQuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhZGp1c3RHcmlkTGF5ZXJfKCkge1xuICAgIGNvbnN0IGdyaWRMYXllciA9IGNsb3Nlc3QoZGV2KCkuYXNzZXJ0RWxlbWVudCh0aGlzLmVsZW1lbnQpLCAoZWwpID0+IHtcbiAgICAgIHJldHVybiBlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdhbXAtc3RvcnktZ3JpZC1sYXllcic7XG4gICAgfSk7XG5cbiAgICBncmlkTGF5ZXIuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLXN0b3J5LWhhcy1pbnRlcmFjdGl2ZScpO1xuXG4gICAgaWYgKGdyaWRMYXllci5wYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2FtcC1zdG9yeS1jdGEtbGF5ZXInKSkge1xuICAgICAgZ3JpZExheWVyLmNsYXNzTGlzdC5hZGQoJ2ktYW1waHRtbC1zdG9yeS1oYXMtQ1RBLWxheWVyJyk7XG4gICAgfVxuXG4gICAgaWYgKGdyaWRMYXllci5wYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2FtcC1zdG9yeS1wYWdlLWF0dGFjaG1lbnQnKSkge1xuICAgICAgZ3JpZExheWVyLmNsYXNzTGlzdC5hZGQoJ2ktYW1waHRtbC1zdG9yeS1oYXMtcGFnZS1hdHRhY2htZW50Jyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIGZ1bmN0aW9ucyB0byBlYWNoIG9wdGlvbiB0byBoYW5kbGUgc3RhdGUgdHJhbnNpdGlvbi5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGluaXRpYWxpemVMaXN0ZW5lcnNfKCkge1xuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5zdWJzY3JpYmUoXG4gICAgICBTdGF0ZVByb3BlcnR5LlJUTF9TVEFURSxcbiAgICAgIChydGxTdGF0ZSkgPT4ge1xuICAgICAgICB0aGlzLm9uUnRsU3RhdGVVcGRhdGVfKHJ0bFN0YXRlKTtcbiAgICAgIH0sXG4gICAgICB0cnVlIC8qKiBjYWxsVG9Jbml0aWFsaXplICovXG4gICAgKTtcblxuICAgIC8vIENoZWNrIGlmIHRoZSBjb21wb25lbnQgcGFnZSBpcyBhY3RpdmUsIGFuZCBhZGQgY2xhc3MuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShcbiAgICAgIFN0YXRlUHJvcGVydHkuQ1VSUkVOVF9QQUdFX0lELFxuICAgICAgKGN1cnJQYWdlSWQpID0+IHtcbiAgICAgICAgdGhpcy5tdXRhdGVFbGVtZW50KCgpID0+IHtcbiAgICAgICAgICBjb25zdCB0b2dnbGUgPSBjdXJyUGFnZUlkID09PSB0aGlzLmdldFBhZ2VFbF8oKS5nZXRBdHRyaWJ1dGUoJ2lkJyk7XG4gICAgICAgICAgdGhpcy5yb290RWxfLmNsYXNzTGlzdC50b2dnbGUoSU5URVJBQ1RJVkVfQUNUSVZFX0NMQVNTLCB0b2dnbGUpO1xuICAgICAgICAgIHRoaXMudG9nZ2xlVGFiYmFibGVFbGVtZW50c18odG9nZ2xlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY2xvc2VEaXNjbGFpbWVyXygpO1xuICAgICAgfSxcbiAgICAgIHRydWUgLyoqIGNhbGxUb0luaXRpYWxpemUgKi9cbiAgICApO1xuXG4gICAgdGhpcy5yb290RWxfLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHRoaXMuaGFuZGxlVGFwXyhlKSk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBhIHRhcCBldmVudCBvbiB0aGUgcXVpeiBlbGVtZW50LlxuICAgKiBAcGFyYW0ge0V2ZW50fSBlXG4gICAqIEBwcm90ZWN0ZWRcbiAgICovXG4gIGhhbmRsZVRhcF8oZSkge1xuICAgIGlmIChlLnRhcmdldCA9PSB0aGlzLmRpc2NsYWltZXJJY29uXyAmJiAhdGhpcy5kaXNjbGFpbWVyRWxfKSB7XG4gICAgICB0aGlzLm9wZW5EaXNjbGFpbWVyXygpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmhhc1VzZXJTZWxlY3Rpb25fKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgb3B0aW9uRWwgPSBjbG9zZXN0KFxuICAgICAgZGV2KCkuYXNzZXJ0RWxlbWVudChlLnRhcmdldCksXG4gICAgICAoZWxlbWVudCkgPT4ge1xuICAgICAgICByZXR1cm4gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2ktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1vcHRpb24nKTtcbiAgICAgIH0sXG4gICAgICB0aGlzLnJvb3RFbF9cbiAgICApO1xuXG4gICAgaWYgKG9wdGlvbkVsKSB7XG4gICAgICB0aGlzLnVwZGF0ZVN0b3J5U3RvcmVTdGF0ZV8ob3B0aW9uRWwub3B0aW9uSW5kZXhfKTtcbiAgICAgIHRoaXMuaGFuZGxlT3B0aW9uU2VsZWN0aW9uXyhvcHRpb25FbCk7XG4gICAgICBjb25zdCBjb25mZXR0aUVtb2ppID0gdGhpcy5vcHRpb25zX1tvcHRpb25FbC5vcHRpb25JbmRleF9dLmNvbmZldHRpO1xuICAgICAgaWYgKGNvbmZldHRpRW1vamkpIHtcbiAgICAgICAgZW1vamlDb25mZXR0aShcbiAgICAgICAgICBkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMucm9vdEVsXyksXG4gICAgICAgICAgdGhpcy53aW4sXG4gICAgICAgICAgY29uZmV0dGlFbW9qaVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgdGhpcy5jbG9zZURpc2NsYWltZXJfKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIHRoZSBhbmFseXRpY3MgZXZlbnQgZm9yIHF1aXogcmVzcG9uc2UuXG4gICAqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IG9wdGlvbkVsXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB0cmlnZ2VyQW5hbHl0aWNzXyhvcHRpb25FbCkge1xuICAgIHRoaXMudmFyaWFibGVTZXJ2aWNlXy5vblZhcmlhYmxlVXBkYXRlKFxuICAgICAgQW5hbHl0aWNzVmFyaWFibGUuU1RPUllfSU5URVJBQ1RJVkVfSUQsXG4gICAgICB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdpZCcpXG4gICAgKTtcbiAgICB0aGlzLnZhcmlhYmxlU2VydmljZV8ub25WYXJpYWJsZVVwZGF0ZShcbiAgICAgIEFuYWx5dGljc1ZhcmlhYmxlLlNUT1JZX0lOVEVSQUNUSVZFX1JFU1BPTlNFLFxuICAgICAgb3B0aW9uRWwub3B0aW9uSW5kZXhfXG4gICAgKTtcbiAgICB0aGlzLnZhcmlhYmxlU2VydmljZV8ub25WYXJpYWJsZVVwZGF0ZShcbiAgICAgIEFuYWx5dGljc1ZhcmlhYmxlLlNUT1JZX0lOVEVSQUNUSVZFX1RZUEUsXG4gICAgICB0aGlzLmludGVyYWN0aXZlVHlwZV9cbiAgICApO1xuXG4gICAgdGhpcy5lbGVtZW50W0FOQUxZVElDU19UQUdfTkFNRV0gPSB0aGlzLmVsZW1lbnQudGFnTmFtZTtcbiAgICB0aGlzLmFuYWx5dGljc1NlcnZpY2VfLnRyaWdnZXJFdmVudChcbiAgICAgIFN0b3J5QW5hbHl0aWNzRXZlbnQuSU5URVJBQ1RJVkUsXG4gICAgICB0aGlzLmVsZW1lbnRcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBjb21wb25lbnQgdG8gcmVmbGVjdCB2YWx1ZXMgaW4gdGhlIGRhdGEgb2J0YWluZWQuXG4gICAqIENhbGxlZCB3aGVuIHVzZXIgaGFzIHJlc3BvbmRlZCAoaW4gdGhpcyBzZXNzaW9uIG9yIGJlZm9yZSkuXG4gICAqXG4gICAqIEBwcm90ZWN0ZWQgQGFic3RyYWN0XG4gICAqIEBwYXJhbSB7IUFycmF5PCFJbnRlcmFjdGl2ZU9wdGlvblR5cGU+fSB1bnVzZWRPcHRpb25zRGF0YVxuICAgKi9cbiAgZGlzcGxheU9wdGlvbnNEYXRhKHVudXNlZE9wdGlvbnNEYXRhKSB7XG4gICAgLy8gU3ViY2xhc3MgbXVzdCBpbXBsZW1lbnRcbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVwcm9jZXNzIHRoZSBwZXJjZW50YWdlcyBmb3IgZGlzcGxheS5cbiAgICpcbiAgICogQHBhcmFtIHshQXJyYXk8IUludGVyYWN0aXZlT3B0aW9uVHlwZT59IG9wdGlvbnNEYXRhXG4gICAqIEByZXR1cm4ge0FycmF5PG51bWJlcj59XG4gICAqIEBwcm90ZWN0ZWRcbiAgICovXG4gIHByZXByb2Nlc3NQZXJjZW50YWdlc18ob3B0aW9uc0RhdGEpIHtcbiAgICBjb25zdCB0b3RhbFJlc3BvbnNlQ291bnQgPSBvcHRpb25zRGF0YS5yZWR1Y2UoXG4gICAgICAoYWNjLCByZXNwb25zZSkgPT4gYWNjICsgcmVzcG9uc2VbJ2NvdW50J10sXG4gICAgICAwXG4gICAgKTtcblxuICAgIGxldCBwZXJjZW50YWdlcyA9IG9wdGlvbnNEYXRhLm1hcCgoZSkgPT5cbiAgICAgICgoMTAwICogZVsnY291bnQnXSkgLyB0b3RhbFJlc3BvbnNlQ291bnQpLnRvRml4ZWQoMilcbiAgICApO1xuICAgIGxldCB0b3RhbCA9IHBlcmNlbnRhZ2VzLnJlZHVjZSgoYWNjLCB4KSA9PiBhY2MgKyBNYXRoLnJvdW5kKHgpLCAwKTtcblxuICAgIC8vIFNwZWNpYWwgY2FzZTogZGl2aWRlIHJlbWFpbmRlcnMgYnkgdGhyZWUgaWYgdGhleSBicmVhayAxMDAsXG4gICAgLy8gMyBpcyB0aGUgbWF4aW11bSBhYm92ZSAxMDAgdGhlIHJlbWFpbmRlcnMgY2FuIGFkZC5cbiAgICBpZiAodG90YWwgPiAxMDApIHtcbiAgICAgIHBlcmNlbnRhZ2VzID0gcGVyY2VudGFnZXMubWFwKChwZXJjZW50YWdlKSA9PlxuICAgICAgICAocGVyY2VudGFnZSAtICgyICogKHBlcmNlbnRhZ2UgLSBNYXRoLmZsb29yKHBlcmNlbnRhZ2UpKSkgLyAzKS50b0ZpeGVkKFxuICAgICAgICAgIDJcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICAgIHRvdGFsID0gcGVyY2VudGFnZXMucmVkdWNlKChhY2MsIHgpID0+IChhY2MgKz0gTWF0aC5yb3VuZCh4KSksIDApO1xuICAgIH1cblxuICAgIGlmICh0b3RhbCA9PT0gMTAwKSB7XG4gICAgICByZXR1cm4gcGVyY2VudGFnZXMubWFwKChwZXJjZW50YWdlKSA9PiBNYXRoLnJvdW5kKHBlcmNlbnRhZ2UpKTtcbiAgICB9XG5cbiAgICAvLyBUcnVuY2F0ZSBhbGwgYW5kIHJvdW5kIHVwIHRob3NlIHdpdGggdGhlIGhpZ2hlc3QgcmVtYWluZGVycyxcbiAgICAvLyBwcmVzZXJ2aW5nIG9yZGVyIGFuZCB0aWVzIGFuZCBhZGRpbmcgdG8gMTAwIChpZiBwb3NzaWJsZSBnaXZlbiB0aWVzIGFuZCBvcmRlcmluZykuXG4gICAgbGV0IHJlbWFpbmRlciA9IDEwMCAtIHRvdGFsO1xuXG4gICAgbGV0IHByZXNlcnZlT3JpZ2luYWwgPSBwZXJjZW50YWdlcy5tYXAoKHBlcmNlbnRhZ2UsIGluZGV4KSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBvcmlnaW5hbEluZGV4OiBpbmRleCxcbiAgICAgICAgdmFsdWU6IHBlcmNlbnRhZ2UsXG4gICAgICAgIHJlbWFpbmRlcjogKHBlcmNlbnRhZ2UgLSBNYXRoLmZsb29yKHBlcmNlbnRhZ2UpKS50b0ZpeGVkKDIpLFxuICAgICAgfTtcbiAgICB9KTtcbiAgICBwcmVzZXJ2ZU9yaWdpbmFsLnNvcnQoXG4gICAgICAobGVmdCwgcmlnaHQpID0+XG4gICAgICAgIC8vIEJyZWFrIHJlbWFpbmRlciB0aWVzIHVzaW5nIHRoZSBoaWdoZXIgdmFsdWUuXG4gICAgICAgIHJpZ2h0LnJlbWFpbmRlciAtIGxlZnQucmVtYWluZGVyIHx8IHJpZ2h0LnZhbHVlIC0gbGVmdC52YWx1ZVxuICAgICk7XG5cbiAgICBjb25zdCBmaW5hbFBlcmNlbnRhZ2VzID0gW107XG4gICAgd2hpbGUgKHJlbWFpbmRlciA+IDAgJiYgcHJlc2VydmVPcmlnaW5hbC5sZW5ndGggIT09IDApIHtcbiAgICAgIGNvbnN0IGhpZ2hlc3RSZW1haW5kZXJPYmogPSBwcmVzZXJ2ZU9yaWdpbmFsWzBdO1xuXG4gICAgICBjb25zdCB0aWVzID0gcHJlc2VydmVPcmlnaW5hbC5maWx0ZXIoXG4gICAgICAgIChwZXJjZW50YWdlT2JqKSA9PiBwZXJjZW50YWdlT2JqLnZhbHVlID09PSBoaWdoZXN0UmVtYWluZGVyT2JqLnZhbHVlXG4gICAgICApO1xuICAgICAgcHJlc2VydmVPcmlnaW5hbCA9IHByZXNlcnZlT3JpZ2luYWwuZmlsdGVyKFxuICAgICAgICAocGVyY2VudGFnZU9iaikgPT4gcGVyY2VudGFnZU9iai52YWx1ZSAhPT0gaGlnaGVzdFJlbWFpbmRlck9iai52YWx1ZVxuICAgICAgKTtcblxuICAgICAgY29uc3QgdG9Sb3VuZFVwID1cbiAgICAgICAgdGllcy5sZW5ndGggPD0gcmVtYWluZGVyICYmIGhpZ2hlc3RSZW1haW5kZXJPYmoucmVtYWluZGVyICE9PSAnMC4wMCc7XG5cbiAgICAgIHRpZXMuZm9yRWFjaCgocGVyY2VudGFnZU9iaikgPT4ge1xuICAgICAgICBmaW5hbFBlcmNlbnRhZ2VzW3BlcmNlbnRhZ2VPYmoub3JpZ2luYWxJbmRleF0gPVxuICAgICAgICAgIE1hdGguZmxvb3IocGVyY2VudGFnZU9iai52YWx1ZSkgKyAodG9Sb3VuZFVwID8gMSA6IDApO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgcmVtYWluZGVyIGdpdmVuIGFkZGl0aW9ucyB0byB0aGUgcGVyY2VudGFnZXMuXG4gICAgICByZW1haW5kZXIgLT0gdG9Sb3VuZFVwID8gdGllcy5sZW5ndGggOiAwO1xuICAgIH1cblxuICAgIHByZXNlcnZlT3JpZ2luYWwuZm9yRWFjaCgocGVyY2VudGFnZU9iaikgPT4ge1xuICAgICAgZmluYWxQZXJjZW50YWdlc1twZXJjZW50YWdlT2JqLm9yaWdpbmFsSW5kZXhdID0gTWF0aC5mbG9vcihcbiAgICAgICAgcGVyY2VudGFnZU9iai52YWx1ZVxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBmaW5hbFBlcmNlbnRhZ2VzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIGNoYW5nZXMgdG8gY29tcG9uZW50IHN0YXRlIG9uIHJlc3BvbnNlIGludGVyYWN0aXZlLlxuICAgKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBvcHRpb25FbFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaGFuZGxlT3B0aW9uU2VsZWN0aW9uXyhvcHRpb25FbCkge1xuICAgIHRoaXMuYmFja2VuZERhdGFQcm9taXNlX1xuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5oYXNVc2VyU2VsZWN0aW9uXykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudHJpZ2dlckFuYWx5dGljc18ob3B0aW9uRWwpO1xuICAgICAgICB0aGlzLmhhc1VzZXJTZWxlY3Rpb25fID0gdHJ1ZTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zRGF0YV8pIHtcbiAgICAgICAgICB0aGlzLm9wdGlvbnNEYXRhX1tvcHRpb25FbC5vcHRpb25JbmRleF9dWydjb3VudCddKys7XG4gICAgICAgICAgdGhpcy5vcHRpb25zRGF0YV9bb3B0aW9uRWwub3B0aW9uSW5kZXhfXVsnc2VsZWN0ZWQnXSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm11dGF0ZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMudXBkYXRlVG9Qb3N0U2VsZWN0aW9uU3RhdGVfKG9wdGlvbkVsKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2VuZHBvaW50JykpIHtcbiAgICAgICAgICB0aGlzLmV4ZWN1dGVJbnRlcmFjdGl2ZVJlcXVlc3RfKCdQT1NUJywgb3B0aW9uRWwub3B0aW9uSW5kZXhfKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIC8vIElmIGJhY2tlbmQgaXMgbm90IHByb3Blcmx5IGNvbm5lY3RlZCwgc3RpbGwgdXBkYXRlIHN0YXRlLlxuICAgICAgICB0aGlzLnRyaWdnZXJBbmFseXRpY3NfKG9wdGlvbkVsKTtcbiAgICAgICAgdGhpcy5oYXNVc2VyU2VsZWN0aW9uXyA9IHRydWU7XG4gICAgICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy51cGRhdGVUb1Bvc3RTZWxlY3Rpb25TdGF0ZV8ob3B0aW9uRWwpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgSW50ZXJhY3RpdmUgZGF0YSBmcm9tIHRoZSBkYXRhc3RvcmVcbiAgICpcbiAgICogQHJldHVybiB7P1Byb21pc2U8P0ludGVyYWN0aXZlUmVzcG9uc2VUeXBlfD9Kc29uT2JqZWN0fHVuZGVmaW5lZD59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICByZXRyaWV2ZUludGVyYWN0aXZlRGF0YV8oKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY3V0ZUludGVyYWN0aXZlUmVxdWVzdF8oJ0dFVCcpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICB0aGlzLmhhbmRsZVN1Y2Nlc3NmdWxEYXRhUmV0cmlldmFsXyhcbiAgICAgICAgLyoqIEB0eXBlIHtJbnRlcmFjdGl2ZVJlc3BvbnNlVHlwZX0gKi8gKHJlc3BvbnNlKVxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlcyBhIEludGVyYWN0aXZlIEFQSSBjYWxsLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWV0aG9kIEdFVCBvciBQT1NULlxuICAgKiBAcGFyYW0ge251bWJlcj19IG9wdGlvblNlbGVjdGVkXG4gICAqIEByZXR1cm4geyFQcm9taXNlPCFJbnRlcmFjdGl2ZVJlc3BvbnNlVHlwZXxzdHJpbmc+fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZXhlY3V0ZUludGVyYWN0aXZlUmVxdWVzdF8obWV0aG9kLCBvcHRpb25TZWxlY3RlZCA9IHVuZGVmaW5lZCkge1xuICAgIGxldCB1cmwgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdlbmRwb2ludCcpO1xuICAgIGlmICghYXNzZXJ0QWJzb2x1dGVIdHRwT3JIdHRwc1VybCh1cmwpKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoRU5EUE9JTlRfSU5WQUxJRF9FUlJPUik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZ2V0Q2xpZW50SWRfKCkudGhlbigoY2xpZW50SWQpID0+IHtcbiAgICAgIGNvbnN0IHJlcXVlc3RPcHRpb25zID0geydtZXRob2QnOiBtZXRob2R9O1xuICAgICAgY29uc3QgcmVxdWVzdFBhcmFtcyA9IGRpY3Qoe1xuICAgICAgICAndHlwZSc6IHRoaXMuaW50ZXJhY3RpdmVUeXBlXyxcbiAgICAgICAgJ2NsaWVudCc6IGNsaWVudElkLFxuICAgICAgfSk7XG4gICAgICB1cmwgPSBhcHBlbmRQYXRoVG9VcmwoXG4gICAgICAgIHRoaXMudXJsU2VydmljZV8ucGFyc2UodXJsKSxcbiAgICAgICAgdGhpcy5nZXRJbnRlcmFjdGl2ZUlkXygpXG4gICAgICApO1xuICAgICAgaWYgKHJlcXVlc3RPcHRpb25zWydtZXRob2QnXSA9PT0gJ1BPU1QnKSB7XG4gICAgICAgIHJlcXVlc3RPcHRpb25zWydib2R5J10gPSB7J29wdGlvbl9zZWxlY3RlZCc6IG9wdGlvblNlbGVjdGVkfTtcbiAgICAgICAgcmVxdWVzdE9wdGlvbnNbJ2hlYWRlcnMnXSA9IHsnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nfTtcbiAgICAgICAgdXJsID0gYXBwZW5kUGF0aFRvVXJsKHRoaXMudXJsU2VydmljZV8ucGFyc2UodXJsKSwgJzp2b3RlJyk7XG4gICAgICB9XG4gICAgICB1cmwgPSBhZGRQYXJhbXNUb1VybCh1cmwsIHJlcXVlc3RQYXJhbXMpO1xuICAgICAgcmV0dXJuIHRoaXMucmVxdWVzdFNlcnZpY2VfXG4gICAgICAgIC5leGVjdXRlUmVxdWVzdCh1cmwsIHJlcXVlc3RPcHRpb25zKVxuICAgICAgICAuY2F0Y2goKGVycikgPT4gZGV2KCkuZXJyb3IoVEFHLCBlcnIpKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGluY29taW5nIGludGVyYWN0aXZlIGRhdGEgcmVzcG9uc2VcbiAgICpcbiAgICogUkVTUE9OU0UgRk9STUFUXG4gICAqIHtcbiAgICogIG9wdGlvbnM6IFtcbiAgICogICAge1xuICAgKiAgICAgIGluZGV4OlxuICAgKiAgICAgIGNvdW50OlxuICAgKiAgICAgIHNlbGVjdGVkOlxuICAgKiAgICB9LFxuICAgKiAgICAuLi5cbiAgICogIF1cbiAgICogfVxuICAgKiBAcGFyYW0ge0ludGVyYWN0aXZlUmVzcG9uc2VUeXBlfHVuZGVmaW5lZH0gcmVzcG9uc2VcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGhhbmRsZVN1Y2Nlc3NmdWxEYXRhUmV0cmlldmFsXyhyZXNwb25zZSkge1xuICAgIGlmICghKHJlc3BvbnNlICYmIHJlc3BvbnNlWydvcHRpb25zJ10pKSB7XG4gICAgICBkZXZBc3NlcnQoXG4gICAgICAgIHJlc3BvbnNlICYmICdvcHRpb25zJyBpbiByZXNwb25zZSxcbiAgICAgICAgYEludmFsaWQgaW50ZXJhY3RpdmUgcmVzcG9uc2UsIGV4cGVjdGVkIHsgZGF0YTogSW50ZXJhY3RpdmVSZXNwb25zZVR5cGUsIC4uLn0gYnV0IHJlY2VpdmVkICR7cmVzcG9uc2V9YFxuICAgICAgKTtcbiAgICAgIGRldigpLmVycm9yKFxuICAgICAgICBUQUcsXG4gICAgICAgIGBJbnZhbGlkIGludGVyYWN0aXZlIHJlc3BvbnNlLCBleHBlY3RlZCB7IGRhdGE6IEludGVyYWN0aXZlUmVzcG9uc2VUeXBlLCAuLi59IGJ1dCByZWNlaXZlZCAke3Jlc3BvbnNlfWBcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG51bU9wdGlvbnMgPSB0aGlzLnJvb3RFbF8ucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICcuaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW9wdGlvbidcbiAgICApLmxlbmd0aDtcbiAgICAvLyBPbmx5IGtlZXAgdGhlIHZpc2libGUgb3B0aW9ucyB0byBlbnN1cmUgdmlzaWJsZSBwZXJjZW50YWdlcyBhZGQgdXAgdG8gMTAwLlxuICAgIHRoaXMudXBkYXRlQ29tcG9uZW50T25EYXRhUmV0cmlldmFsXyhcbiAgICAgIHJlc3BvbnNlWydvcHRpb25zJ10uc2xpY2UoMCwgbnVtT3B0aW9ucylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHF1aXogdG8gcmVmbGVjdCB0aGUgc3RhdGUgb2YgdGhlIHJlbW90ZSBkYXRhLlxuICAgKiBAcGFyYW0geyFBcnJheTxJbnRlcmFjdGl2ZU9wdGlvblR5cGU+fSBkYXRhXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB1cGRhdGVDb21wb25lbnRPbkRhdGFSZXRyaWV2YWxfKGRhdGEpIHtcbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy5yb290RWxfLnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAnLmktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1vcHRpb24nXG4gICAgKTtcblxuICAgIHRoaXMub3B0aW9uc0RhdGFfID0gdGhpcy5vcmRlckRhdGFfKGRhdGEpO1xuICAgIHRoaXMub3B0aW9uc0RhdGFfLmZvckVhY2goKHJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAocmVzcG9uc2Uuc2VsZWN0ZWQpIHtcbiAgICAgICAgdGhpcy5oYXNVc2VyU2VsZWN0aW9uXyA9IHRydWU7XG4gICAgICAgIHRoaXMudXBkYXRlU3RvcnlTdG9yZVN0YXRlXyhyZXNwb25zZS5pbmRleCk7XG4gICAgICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy51cGRhdGVUb1Bvc3RTZWxlY3Rpb25TdGF0ZV8ob3B0aW9uc1tyZXNwb25zZS5pbmRleF0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBzZWxlY3RlZCBjbGFzc2VzIG9uIGNvbXBvbmVudCBhbmQgb3B0aW9uIHNlbGVjdGVkLlxuICAgKiBAcGFyYW0gez9FbGVtZW50fSBzZWxlY3RlZE9wdGlvblxuICAgKiBAcHJvdGVjdGVkXG4gICAqL1xuICB1cGRhdGVUb1Bvc3RTZWxlY3Rpb25TdGF0ZV8oc2VsZWN0ZWRPcHRpb24pIHtcbiAgICB0aGlzLnJvb3RFbF8uY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLXBvc3Qtc2VsZWN0aW9uJyk7XG4gICAgaWYgKHNlbGVjdGVkT3B0aW9uICE9IG51bGwpIHtcbiAgICAgIHNlbGVjdGVkT3B0aW9uLmNsYXNzTGlzdC5hZGQoXG4gICAgICAgICdpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtb3B0aW9uLXNlbGVjdGVkJ1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zRGF0YV8pIHtcbiAgICAgIHRoaXMucm9vdEVsXy5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtaGFzLWRhdGEnKTtcbiAgICAgIHRoaXMuZGlzcGxheU9wdGlvbnNEYXRhKHRoaXMub3B0aW9uc0RhdGFfKTtcbiAgICB9XG4gICAgdGhpcy5nZXRPcHRpb25FbGVtZW50cygpLmZvckVhY2goKGVsKSA9PiB7XG4gICAgICBlbC5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgLTEpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICogQHBhcmFtIHs/bnVtYmVyfSBvcHRpb25cbiAgICovXG4gIHVwZGF0ZVN0b3J5U3RvcmVTdGF0ZV8ob3B0aW9uID0gbnVsbCkge1xuICAgIGNvbnN0IHVwZGF0ZSA9IHtcbiAgICAgIG9wdGlvbjogb3B0aW9uICE9IG51bGwgPyB0aGlzLm9wdGlvbnNfW29wdGlvbl0gOiBudWxsLFxuICAgICAgaW50ZXJhY3RpdmVJZDogdGhpcy5nZXRJbnRlcmFjdGl2ZUlkXygpLFxuICAgICAgdHlwZTogdGhpcy5pbnRlcmFjdGl2ZVR5cGVfLFxuICAgIH07XG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKEFjdGlvbi5BRERfSU5URVJBQ1RJVkVfUkVBQ1QsIHVwZGF0ZSk7XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgdGFiYmFibGUgZWxlbWVudHMgKGJ1dHRvbnMsIGxpbmtzLCBldGMpIHRvIG9ubHkgcmVhY2ggdGhlbSB3aGVuIHBhZ2UgaXMgYWN0aXZlLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHRvZ2dsZVxuICAgKi9cbiAgdG9nZ2xlVGFiYmFibGVFbGVtZW50c18odG9nZ2xlKSB7XG4gICAgdGhpcy5yb290RWxfLnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbiwgYScpLmZvckVhY2goKGVsKSA9PiB7XG4gICAgICAvLyBEaXNhYmxlIHRhYmJpbmcgdGhyb3VnaCBvcHRpb25zIGlmIGFscmVhZHkgc2VsZWN0ZWQuXG4gICAgICBpZiAoXG4gICAgICAgIGVsLmNsYXNzTGlzdC5jb250YWlucygnaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW9wdGlvbicpICYmXG4gICAgICAgIHRoaXMuaGFzVXNlclNlbGVjdGlvbl9cbiAgICAgICkge1xuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgLTEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsIHRvZ2dsZSA/IDAgOiAtMSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVvcmRlcnMgb3B0aW9ucyBkYXRhIHRvIGFjY291bnQgZm9yIHNjcmFtYmxlZCBvciBpbmNvbXBsZXRlIGRhdGEuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7IUFycmF5PCFJbnRlcmFjdGl2ZU9wdGlvblR5cGU+fSBvcHRpb25zRGF0YVxuICAgKiBAcmV0dXJuIHshQXJyYXk8IUludGVyYWN0aXZlT3B0aW9uVHlwZT59XG4gICAqL1xuICBvcmRlckRhdGFfKG9wdGlvbnNEYXRhKSB7XG4gICAgY29uc3QgbnVtT3B0aW9uRWxlbWVudHMgPSB0aGlzLmdldE9wdGlvbkVsZW1lbnRzKCkubGVuZ3RoO1xuICAgIGNvbnN0IG9yZGVyZWREYXRhID0gbmV3IEFycmF5KG51bU9wdGlvbkVsZW1lbnRzKTtcbiAgICBvcHRpb25zRGF0YS5mb3JFYWNoKChvcHRpb24pID0+IHtcbiAgICAgIGNvbnN0IHtpbmRleH0gPSBvcHRpb247XG4gICAgICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IG51bU9wdGlvbkVsZW1lbnRzKSB7XG4gICAgICAgIG9yZGVyZWREYXRhW2luZGV4XSA9IG9wdGlvbjtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJlZERhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICghb3JkZXJlZERhdGFbaV0pIHtcbiAgICAgICAgb3JkZXJlZERhdGFbaV0gPSB7XG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgc2VsZWN0ZWQ6IGZhbHNlLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvcmRlcmVkRGF0YTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVucyB0aGUgZGlzY2xhaW1lciBkaWFsb2cgYW5kIHBvc2l0aW9ucyBpdCBhY2NvcmRpbmcgdG8gdGhlIHBhZ2UgYW5kIGl0c2VsZi5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9wZW5EaXNjbGFpbWVyXygpIHtcbiAgICBpZiAodGhpcy5kaXNjbGFpbWVyRWxfKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGRpciA9IHRoaXMucm9vdEVsXy5nZXRBdHRyaWJ1dGUoJ2RpcicpIHx8ICdsdHInO1xuICAgIHRoaXMuZGlzY2xhaW1lckVsXyA9IGJ1aWxkSW50ZXJhY3RpdmVEaXNjbGFpbWVyKHRoaXMsIHtkaXJ9KTtcblxuICAgIGxldCBzdHlsZXM7XG4gICAgdGhpcy5tZWFzdXJlTXV0YXRlRWxlbWVudChcbiAgICAgICgpID0+IHtcbiAgICAgICAgLy8gR2V0IHJlY3RzIGFuZCBjYWxjdWxhdGUgcG9zaXRpb24gZnJvbSBpY29uLlxuICAgICAgICBjb25zdCBpbnRlcmFjdGl2ZVJlY3QgPSB0aGlzLmVsZW1lbnQuLypPSyovIGdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCBwYWdlUmVjdCA9IHRoaXMuZ2V0UGFnZUVsXygpLi8qT0sqLyBnZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3QgaWNvblJlY3QgPSB0aGlzLmRpc2NsYWltZXJJY29uXy4vKk9LKi8gZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IGJvdHRvbUZyYWN0aW9uID1cbiAgICAgICAgICAxIC0gKGljb25SZWN0LnkgKyBpY29uUmVjdC5oZWlnaHQgLSBwYWdlUmVjdC55KSAvIHBhZ2VSZWN0LmhlaWdodDtcbiAgICAgICAgY29uc3Qgd2lkdGhGcmFjdGlvbiA9IGludGVyYWN0aXZlUmVjdC53aWR0aCAvIHBhZ2VSZWN0LndpZHRoO1xuXG4gICAgICAgIC8vIENsYW1wIHZhbHVlcyB0byBlbnN1cmUgZGlhbG9nIGhhcyBzcGFjZSB1cCBhbmQgbGVmdC5cbiAgICAgICAgY29uc3QgYm90dG9tUGVyY2VudGFnZSA9IGNsYW1wKGJvdHRvbUZyYWN0aW9uICogMTAwLCAwLCA4NSk7IC8vIEVuc3VyZSAxNSUgb2Ygc3BhY2UgdXAuXG4gICAgICAgIGNvbnN0IHdpZHRoUGVyY2VudGFnZSA9IE1hdGgubWF4KHdpZHRoRnJhY3Rpb24gKiAxMDAsIDY1KTsgLy8gRW5zdXJlIDY1JSBvZiBtYXgtd2lkdGguXG5cbiAgICAgICAgc3R5bGVzID0ge1xuICAgICAgICAgICdib3R0b20nOiBib3R0b21QZXJjZW50YWdlICsgJyUnLFxuICAgICAgICAgICdtYXgtd2lkdGgnOiB3aWR0aFBlcmNlbnRhZ2UgKyAnJScsXG4gICAgICAgICAgJ3Bvc2l0aW9uJzogJ2Fic29sdXRlJyxcbiAgICAgICAgICAnei1pbmRleCc6IDMsXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQWxpZ24gZGlzY2xhaW1lciB0byBsZWZ0IGlmIFJUTCwgb3RoZXJ3aXNlIGFsaWduIHRvIHRoZSByaWdodC5cbiAgICAgICAgaWYgKGRpciA9PT0gJ3J0bCcpIHtcbiAgICAgICAgICBjb25zdCBsZWZ0RnJhY3Rpb24gPSAoaWNvblJlY3QueCAtIHBhZ2VSZWN0LngpIC8gcGFnZVJlY3Qud2lkdGg7XG4gICAgICAgICAgc3R5bGVzWydsZWZ0J10gPSBjbGFtcChsZWZ0RnJhY3Rpb24gKiAxMDAsIDAsIDI1KSArICclJzsgLy8gRW5zdXJlIDc1JSBvZiBzcGFjZSB0byB0aGUgcmlnaHQuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgcmlnaHRGcmFjdGlvbiA9XG4gICAgICAgICAgICAxIC0gKGljb25SZWN0LnggKyBpY29uUmVjdC53aWR0aCAtIHBhZ2VSZWN0LngpIC8gcGFnZVJlY3Qud2lkdGg7XG4gICAgICAgICAgc3R5bGVzWydyaWdodCddID0gY2xhbXAocmlnaHRGcmFjdGlvbiAqIDEwMCwgMCwgMjUpICsgJyUnOyAvLyBFbnN1cmUgNzUlIG9mIHNwYWNlIHRvIHRoZSBsZWZ0LlxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgKCkgPT4ge1xuICAgICAgICBzZXRJbXBvcnRhbnRTdHlsZXMoXG4gICAgICAgICAgdGhpcy5kaXNjbGFpbWVyRWxfLFxuICAgICAgICAgIGFzc2VydERvZXNOb3RDb250YWluRGlzcGxheShzdHlsZXMpXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuZ2V0UGFnZUVsXygpLmFwcGVuZENoaWxkKHRoaXMuZGlzY2xhaW1lckVsXyk7XG4gICAgICAgIHRoaXMuZGlzY2xhaW1lckljb25fLnNldEF0dHJpYnV0ZSgnaGlkZScsICcnKTtcbiAgICAgICAgLy8gQWRkIGNsaWNrIGxpc3RlbmVyIHRocm91Z2ggdGhlIHNoYWRvdyBkb20gdXNpbmcgZS5wYXRoLlxuICAgICAgICB0aGlzLmRpc2NsYWltZXJFbF8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGUucGF0aFswXS5jbGFzc0xpc3QuY29udGFpbnMoXG4gICAgICAgICAgICAgICdpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtZGlzY2xhaW1lci1jbG9zZSdcbiAgICAgICAgICAgIClcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2VEaXNjbGFpbWVyXygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZXMgdGhlIGRpc2NsYWltZXIgZGlhbG9nIGlmIG9wZW4uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBjbG9zZURpc2NsYWltZXJfKCkge1xuICAgIGlmICghdGhpcy5kaXNjbGFpbWVyRWxfKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PiB7XG4gICAgICB0aGlzLmRpc2NsYWltZXJFbF8ucmVtb3ZlKCk7XG4gICAgICB0aGlzLmRpc2NsYWltZXJFbF8gPSBudWxsO1xuICAgICAgaWYgKHRoaXMuZGlzY2xhaW1lckljb25fKSB7XG4gICAgICAgIHRoaXMuZGlzY2xhaW1lckljb25fLnJlbW92ZUF0dHJpYnV0ZSgnaGlkZScpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-story-interactive/0.1/amp-story-interactive-abstract.js