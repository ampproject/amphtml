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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1pbnRlcmFjdGl2ZS1hYnN0cmFjdC5qcyJdLCJuYW1lcyI6WyJBTkFMWVRJQ1NfVEFHX05BTUUiLCJTdG9yeUFuYWx5dGljc0V2ZW50IiwiY2xhbXAiLCJBY3Rpb24iLCJTdGF0ZVByb3BlcnR5IiwiQW5hbHl0aWNzVmFyaWFibGUiLCJDU1MiLCJTZXJ2aWNlcyIsImFkZFBhcmFtc1RvVXJsIiwiYXBwZW5kUGF0aFRvVXJsIiwiYXNzZXJ0QWJzb2x1dGVIdHRwT3JIdHRwc1VybCIsImJhc2U2NFVybEVuY29kZUZyb21TdHJpbmciLCJhc3NlcnREb2VzTm90Q29udGFpbkRpc3BsYXkiLCJidWlsZEludGVyYWN0aXZlRGlzY2xhaW1lciIsImJ1aWxkSW50ZXJhY3RpdmVEaXNjbGFpbWVySWNvbiIsImNsb3Nlc3QiLCJjcmVhdGVTaGFkb3dSb290V2l0aFN0eWxlIiwibWF5YmVNYWtlUHJveHlVcmwiLCJkZWR1cGxpY2F0ZUludGVyYWN0aXZlSWRzIiwiZGV2IiwiZGV2QXNzZXJ0IiwiZGljdCIsImVtb2ppQ29uZmV0dGkiLCJ0b0FycmF5Iiwic2V0SW1wb3J0YW50U3R5bGVzIiwiaXNFeHBlcmltZW50T24iLCJUQUciLCJJbnRlcmFjdGl2ZVR5cGUiLCJRVUlaIiwiUE9MTCIsIlJFU1VMVFMiLCJTTElERVIiLCJFTkRQT0lOVF9JTlZBTElEX0VSUk9SIiwiSU5URVJBQ1RJVkVfQUNUSVZFX0NMQVNTIiwiSW50ZXJhY3RpdmVPcHRpb25UeXBlIiwiSW50ZXJhY3RpdmVSZXNwb25zZVR5cGUiLCJPcHRpb25Db25maWdUeXBlIiwiZm9udHNUb0xvYWQiLCJmYW1pbHkiLCJ3ZWlnaHQiLCJzcmMiLCJBbXBTdG9yeUludGVyYWN0aXZlIiwiZWxlbWVudCIsInR5cGUiLCJib3VuZHMiLCJpbnRlcmFjdGl2ZVR5cGVfIiwiYW5hbHl0aWNzU2VydmljZV8iLCJiYWNrZW5kRGF0YVByb21pc2VfIiwiY2xpZW50SWRQcm9taXNlXyIsImRpc2NsYWltZXJFbF8iLCJkaXNjbGFpbWVySWNvbl8iLCJoYXNVc2VyU2VsZWN0aW9uXyIsIm9wdGlvbkJvdW5kc18iLCJvcHRpb25FbGVtZW50c18iLCJvcHRpb25zXyIsIm9wdGlvbnNEYXRhXyIsInBhZ2VFbF8iLCJyb290RWxfIiwibG9jYWxpemF0aW9uU2VydmljZSIsInJlcXVlc3RTZXJ2aWNlXyIsInN0b3JlU2VydmljZV8iLCJ1cmxTZXJ2aWNlXyIsInZhcmlhYmxlU2VydmljZV8iLCJxdWVyeVNlbGVjdG9yQWxsIiwiY2Fub25pY2FsVXJsNjQiLCJ3aW4iLCJkb2N1bWVudCIsImRvY3VtZW50SW5mb0ZvckRvYyIsImNhbm9uaWNhbFVybCIsImlkIiwiYXNzZXJ0RWxlbWVudCIsImVsIiwidGFnTmFtZSIsInRvTG93ZXJDYXNlIiwiY29uY3JldGVDU1MiLCJsb2FkRm9udHNfIiwicGFyc2VPcHRpb25zXyIsImNsYXNzTGlzdCIsImFkZCIsImFkanVzdEdyaWRMYXllcl8iLCJjaGlsZHJlbiIsImxlbmd0aCIsInVybEZvckRvYyIsIlByb21pc2UiLCJhbGwiLCJzdG9yeVZhcmlhYmxlU2VydmljZUZvck9yTnVsbCIsInRoZW4iLCJzZXJ2aWNlIiwic3RvcnlTdG9yZVNlcnZpY2VGb3JPck51bGwiLCJ1cGRhdGVTdG9yeVN0b3JlU3RhdGVfIiwic3RvcnlSZXF1ZXN0U2VydmljZUZvck9yTnVsbCIsInN0b3J5QW5hbHl0aWNzU2VydmljZUZvck9yTnVsbCIsImxvY2FsaXphdGlvblNlcnZpY2VGb3JPck51bGwiLCJidWlsZENvbXBvbmVudCIsImhhc0F0dHJpYnV0ZSIsInByZXBlbmQiLCJsb2FkZWRGb250cyIsImZvbnRzIiwiRm9udEZhY2UiLCJmb3JFYWNoIiwiZm9udFByb3BlcnRpZXMiLCJmb250Iiwic3R5bGUiLCJsb2FkIiwib3B0aW9ucyIsImF0dHJpYnV0ZXMiLCJhdHRyIiwibmFtZSIsIm1hdGNoIiwic3BsaXRQYXJ0cyIsInNwbGl0Iiwib3B0aW9uTnVtYmVyIiwicGFyc2VJbnQiLCJwdXNoIiwia2V5Iiwic2xpY2UiLCJqb2luIiwidmFsdWUiLCJnZXRBbXBEb2MiLCJlcnJvciIsInJvb3QiLCJwcm9tcHRDb250YWluZXIiLCJxdWVyeVNlbGVjdG9yIiwicmVtb3ZlQ2hpbGQiLCJwcm9tcHQiLCJjcmVhdGVFbGVtZW50IiwidGV4dENvbnRlbnQiLCJnZXRBdHRyaWJ1dGUiLCJhcHBlbmRDaGlsZCIsImluaXRpYWxpemVMaXN0ZW5lcnNfIiwicmV0cmlldmVJbnRlcmFjdGl2ZURhdGFfIiwiY2lkRm9yRG9jIiwiZGF0YSIsImdldCIsInNjb3BlIiwiY3JlYXRlQ29va2llSWZOb3RQcmVzZW50IiwicnRsU3RhdGUiLCJtdXRhdGVFbGVtZW50Iiwic2V0QXR0cmlidXRlIiwicmVtb3ZlQXR0cmlidXRlIiwibGF5b3V0IiwiZ3JpZExheWVyIiwicGFyZW50RWxlbWVudCIsInN1YnNjcmliZSIsIlJUTF9TVEFURSIsIm9uUnRsU3RhdGVVcGRhdGVfIiwiQ1VSUkVOVF9QQUdFX0lEIiwiY3VyclBhZ2VJZCIsInRvZ2dsZSIsImdldFBhZ2VFbCIsInRvZ2dsZVRhYmJhYmxlRWxlbWVudHNfIiwiY2xvc2VEaXNjbGFpbWVyXyIsImFkZEV2ZW50TGlzdGVuZXIiLCJlIiwiaGFuZGxlVGFwXyIsInRhcmdldCIsIm9wZW5EaXNjbGFpbWVyXyIsIm9wdGlvbkVsIiwiY29udGFpbnMiLCJvcHRpb25JbmRleF8iLCJoYW5kbGVPcHRpb25TZWxlY3Rpb25fIiwiY29uZmV0dGlFbW9qaSIsImNvbmZldHRpIiwib25WYXJpYWJsZVVwZGF0ZSIsIlNUT1JZX0lOVEVSQUNUSVZFX0lEIiwiU1RPUllfSU5URVJBQ1RJVkVfUkVTUE9OU0UiLCJTVE9SWV9JTlRFUkFDVElWRV9UWVBFIiwidHJpZ2dlckV2ZW50IiwiSU5URVJBQ1RJVkUiLCJ1bnVzZWRPcHRpb25zRGF0YSIsIm9wdGlvbnNEYXRhIiwidG90YWxSZXNwb25zZUNvdW50IiwicmVkdWNlIiwiYWNjIiwicmVzcG9uc2UiLCJwZXJjZW50YWdlcyIsIm1hcCIsInRvRml4ZWQiLCJ0b3RhbCIsIngiLCJNYXRoIiwicm91bmQiLCJwZXJjZW50YWdlIiwiZmxvb3IiLCJyZW1haW5kZXIiLCJwcmVzZXJ2ZU9yaWdpbmFsIiwiaW5kZXgiLCJvcmlnaW5hbEluZGV4Iiwic29ydCIsImxlZnQiLCJyaWdodCIsImZpbmFsUGVyY2VudGFnZXMiLCJoaWdoZXN0UmVtYWluZGVyT2JqIiwidGllcyIsImZpbHRlciIsInBlcmNlbnRhZ2VPYmoiLCJ0b1JvdW5kVXAiLCJ0cmlnZ2VyQW5hbHl0aWNzXyIsInVwZGF0ZVRvUG9zdFNlbGVjdGlvblN0YXRlXyIsImV4ZWN1dGVJbnRlcmFjdGl2ZVJlcXVlc3RfIiwiY2F0Y2giLCJoYW5kbGVTdWNjZXNzZnVsRGF0YVJldHJpZXZhbF8iLCJtZXRob2QiLCJvcHRpb25TZWxlY3RlZCIsInVuZGVmaW5lZCIsInVybCIsInJlamVjdCIsImdldENsaWVudElkXyIsImNsaWVudElkIiwicmVxdWVzdE9wdGlvbnMiLCJyZXF1ZXN0UGFyYW1zIiwicGFyc2UiLCJnZXRJbnRlcmFjdGl2ZUlkXyIsImV4ZWN1dGVSZXF1ZXN0IiwiZXJyIiwibnVtT3B0aW9ucyIsInVwZGF0ZUNvbXBvbmVudE9uRGF0YVJldHJpZXZhbF8iLCJvcmRlckRhdGFfIiwic2VsZWN0ZWQiLCJzZWxlY3RlZE9wdGlvbiIsImRpc3BsYXlPcHRpb25zRGF0YSIsImdldE9wdGlvbkVsZW1lbnRzIiwib3B0aW9uIiwidXBkYXRlIiwiaW50ZXJhY3RpdmVJZCIsImRpc3BhdGNoIiwiQUREX0lOVEVSQUNUSVZFX1JFQUNUIiwibnVtT3B0aW9uRWxlbWVudHMiLCJvcmRlcmVkRGF0YSIsIkFycmF5IiwiaSIsImNvdW50IiwiZGlyIiwic3R5bGVzIiwibWVhc3VyZU11dGF0ZUVsZW1lbnQiLCJpbnRlcmFjdGl2ZVJlY3QiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJwYWdlUmVjdCIsImljb25SZWN0IiwiYm90dG9tRnJhY3Rpb24iLCJ5IiwiaGVpZ2h0Iiwid2lkdGhGcmFjdGlvbiIsIndpZHRoIiwiYm90dG9tUGVyY2VudGFnZSIsIndpZHRoUGVyY2VudGFnZSIsIm1heCIsImxlZnRGcmFjdGlvbiIsInJpZ2h0RnJhY3Rpb24iLCJwYXRoIiwicmVtb3ZlIiwiQU1QIiwiQmFzZUVsZW1lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQ0VBLGtCQURGLEVBRUVDLG1CQUZGO0FBSUEsU0FBUUMsS0FBUjtBQUNBLFNBQ0VDLE1BREYsRUFFRUMsYUFGRjtBQUlBLFNBQVFDLGlCQUFSO0FBQ0EsU0FBUUMsR0FBUjtBQUNBLFNBQVFDLFFBQVI7QUFDQSxTQUNFQyxjQURGLEVBRUVDLGVBRkYsRUFHRUMsNEJBSEY7QUFLQSxTQUFRQyx5QkFBUjtBQUNBLFNBQVFDLDJCQUFSO0FBQ0EsU0FDRUMsMEJBREYsRUFFRUMsOEJBRkY7QUFJQSxTQUFRQyxPQUFSO0FBQ0EsU0FDRUMseUJBREYsRUFFRUMsaUJBRkY7QUFJQSxTQUFRQyx5QkFBUjtBQUNBLFNBQVFDLEdBQVIsRUFBYUMsU0FBYjtBQUNBLFNBQVFDLElBQVI7QUFDQSxTQUFRQyxhQUFSO0FBQ0EsU0FBUUMsT0FBUjtBQUNBLFNBQVFDLGtCQUFSO0FBQ0EsU0FBUUMsY0FBUjs7QUFFQTtBQUNBLElBQU1DLEdBQUcsR0FBRyx1QkFBWjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQU1DLGVBQWUsR0FBRztBQUM3QkMsRUFBQUEsSUFBSSxFQUFFLENBRHVCO0FBRTdCQyxFQUFBQSxJQUFJLEVBQUUsQ0FGdUI7QUFHN0JDLEVBQUFBLE9BQU8sRUFBRSxDQUhvQjtBQUk3QkMsRUFBQUEsTUFBTSxFQUFFO0FBSnFCLENBQXhCOztBQU9QO0FBQ0EsSUFBTUMsc0JBQXNCLEdBQzFCLDJEQURGOztBQUdBO0FBQ0EsSUFBTUMsd0JBQXdCLEdBQUcsb0NBQWpDOztBQUVBO0FB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QUt0RyxhQUFWLEVBQXlCO0FBQ3ZCO0FBQ0Q7O0FBQ0QsV0FBS3dGLGFBQUwsQ0FBbUIsWUFBTTtBQUN2QixRQUFBLE9BQUksQ0FBQ3hGLGFBQUwsQ0FBbUJ5TSxNQUFuQjs7QUFDQSxRQUFBLE9BQUksQ0FBQ3pNLGFBQUwsR0FBcUIsSUFBckI7O0FBQ0EsWUFBSSxPQUFJLENBQUNDLGVBQVQsRUFBMEI7QUFDeEIsVUFBQSxPQUFJLENBQUNBLGVBQUwsQ0FBcUJ5RixlQUFyQixDQUFxQyxNQUFyQztBQUNEO0FBQ0YsT0FORDtBQU9EO0FBMXpCSDs7QUFBQTtBQUFBLEVBQXlDZ0gsR0FBRyxDQUFDQyxXQUE3QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTkgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1xuICBBTkFMWVRJQ1NfVEFHX05BTUUsXG4gIFN0b3J5QW5hbHl0aWNzRXZlbnQsXG59IGZyb20gJy4uLy4uL2FtcC1zdG9yeS8xLjAvc3RvcnktYW5hbHl0aWNzJztcbmltcG9ydCB7Y2xhbXB9IGZyb20gJyNjb3JlL21hdGgnO1xuaW1wb3J0IHtcbiAgQWN0aW9uLFxuICBTdGF0ZVByb3BlcnR5LFxufSBmcm9tICcuLi8uLi9hbXAtc3RvcnkvMS4wL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlJztcbmltcG9ydCB7QW5hbHl0aWNzVmFyaWFibGV9IGZyb20gJy4uLy4uL2FtcC1zdG9yeS8xLjAvdmFyaWFibGUtc2VydmljZSc7XG5pbXBvcnQge0NTU30gZnJvbSAnLi4vLi4vLi4vYnVpbGQvYW1wLXN0b3J5LWludGVyYWN0aXZlLTAuMS5jc3MnO1xuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHtcbiAgYWRkUGFyYW1zVG9VcmwsXG4gIGFwcGVuZFBhdGhUb1VybCxcbiAgYXNzZXJ0QWJzb2x1dGVIdHRwT3JIdHRwc1VybCxcbn0gZnJvbSAnLi4vLi4vLi4vc3JjL3VybCc7XG5pbXBvcnQge2Jhc2U2NFVybEVuY29kZUZyb21TdHJpbmd9IGZyb20gJyNjb3JlL3R5cGVzL3N0cmluZy9iYXNlNjQnO1xuaW1wb3J0IHthc3NlcnREb2VzTm90Q29udGFpbkRpc3BsYXl9IGZyb20gJy4uLy4uLy4uL3NyYy9hc3NlcnQtZGlzcGxheSc7XG5pbXBvcnQge1xuICBidWlsZEludGVyYWN0aXZlRGlzY2xhaW1lcixcbiAgYnVpbGRJbnRlcmFjdGl2ZURpc2NsYWltZXJJY29uLFxufSBmcm9tICcuL2ludGVyYWN0aXZlLWRpc2NsYWltZXInO1xuaW1wb3J0IHtjbG9zZXN0fSBmcm9tICcjY29yZS9kb20vcXVlcnknO1xuaW1wb3J0IHtcbiAgY3JlYXRlU2hhZG93Um9vdFdpdGhTdHlsZSxcbiAgbWF5YmVNYWtlUHJveHlVcmwsXG59IGZyb20gJy4uLy4uL2FtcC1zdG9yeS8xLjAvdXRpbHMnO1xuaW1wb3J0IHtkZWR1cGxpY2F0ZUludGVyYWN0aXZlSWRzfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7ZGV2LCBkZXZBc3NlcnR9IGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuaW1wb3J0IHtkaWN0fSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtlbW9qaUNvbmZldHRpfSBmcm9tICcuL2ludGVyYWN0aXZlLWNvbmZldHRpJztcbmltcG9ydCB7dG9BcnJheX0gZnJvbSAnI2NvcmUvdHlwZXMvYXJyYXknO1xuaW1wb3J0IHtzZXRJbXBvcnRhbnRTdHlsZXN9IGZyb20gJyNjb3JlL2RvbS9zdHlsZSc7XG5pbXBvcnQge2lzRXhwZXJpbWVudE9ufSBmcm9tICcjZXhwZXJpbWVudHMvJztcblxuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgVEFHID0gJ2FtcC1zdG9yeS1pbnRlcmFjdGl2ZSc7XG5cbi8qKlxuICogQGNvbnN0IEBlbnVtIHtudW1iZXJ9XG4gKi9cbmV4cG9ydCBjb25zdCBJbnRlcmFjdGl2ZVR5cGUgPSB7XG4gIFFVSVo6IDAsXG4gIFBPTEw6IDEsXG4gIFJFU1VMVFM6IDIsXG4gIFNMSURFUjogMyxcbn07XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IEVORFBPSU5UX0lOVkFMSURfRVJST1IgPVxuICAnVGhlIHB1Ymxpc2hlciBoYXMgc3BlY2lmaWVkIGFuIGludmFsaWQgZGF0YXN0b3JlIGVuZHBvaW50JztcblxuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgSU5URVJBQ1RJVkVfQUNUSVZFX0NMQVNTID0gJ2ktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1hY3RpdmUnO1xuXG4vKipcbiAqIEB0eXBlZGVmIHt7XG4gKiAgICBpbmRleDogbnVtYmVyLFxuICogICAgY291bnQ6IG51bWJlcixcbiAqICAgIHNlbGVjdGVkOiBib29sZWFuLFxuICogfX1cbiAqL1xuZXhwb3J0IGxldCBJbnRlcmFjdGl2ZU9wdGlvblR5cGU7XG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqICAgIG9wdGlvbnM6ICFBcnJheTxJbnRlcmFjdGl2ZU9wdGlvblR5cGU+LFxuICogfX1cbiAqL1xuZXhwb3J0IGxldCBJbnRlcmFjdGl2ZVJlc3BvbnNlVHlwZTtcblxuLyoqXG4gKiBAdHlwZWRlZiB7e1xuICogICAgb3B0aW9uSW5kZXg6IG51bWJlcixcbiAqICAgIHRleHQ6IHN0cmluZyxcbiAqICAgIGNvcnJlY3Q6ID9zdHJpbmcsXG4gKiAgICByZXN1bHRzY2F0ZWdvcnk6ID9zdHJpbmcsXG4gKiAgICBpbWFnZTogP3N0cmluZyxcbiAqICAgIGNvbmZldHRpOiA/c3RyaW5nLFxuICogICAgcmVzdWx0c3RocmVzaG9sZDogP3N0cmluZyxcbiAqIH19XG4gKi9cbmV4cG9ydCBsZXQgT3B0aW9uQ29uZmlnVHlwZTtcblxuLyoqIEBjb25zdCB7QXJyYXk8T2JqZWN0Pn0gZm9udEZhY2VzIHdpdGggdXJscyBmcm9tIGh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzMj9mYW1pbHk9UG9wcGluczp3Z2h0QDQwMDs3MDAmYW1wO2Rpc3BsYXk9c3dhcCAqL1xuY29uc3QgZm9udHNUb0xvYWQgPSBbXG4gIHtcbiAgICBmYW1pbHk6ICdQb3BwaW5zJyxcbiAgICB3ZWlnaHQ6ICc0MDAnLFxuICAgIHNyYzogXCJ1cmwoaHR0cHM6Ly9mb250cy5nc3RhdGljLmNvbS9zL3BvcHBpbnMvdjkvcHhpRXlwOGt2OEpIZ0ZWckpKZmVjbkZIR1BjLndvZmYyKSBmb3JtYXQoJ3dvZmYyJylcIixcbiAgfSxcbiAge1xuICAgIGZhbWlseTogJ1BvcHBpbnMnLFxuICAgIHdlaWdodDogJzcwMCcsXG4gICAgc3JjOiBcInVybChodHRwczovL2ZvbnRzLmdzdGF0aWMuY29tL3MvcG9wcGlucy92OS9weGlCeXA4a3Y4SkhnRlZyTEN6N1oxeGxGZDJKUUVrLndvZmYyKSBmb3JtYXQoJ3dvZmYyJylcIixcbiAgfSxcbl07XG5cbi8qKlxuICogSW50ZXJhY3RpdmUgYWJzdHJhY3QgY2xhc3Mgd2l0aCBzaGFyZWQgZnVuY3Rpb25hbGl0eSBmb3IgaW50ZXJhY3RpdmUgY29tcG9uZW50cy5cbiAqXG4gKiBMaWZlY3ljbGU6XG4gKiAxKSBXaGVuIGNyZWF0ZWQsIHRoZSBhYnN0cmFjdCBjbGFzcyB3aWxsIGNhbGwgdGhlIGJ1aWxkQ29tcG9uZW50KCkgbWV0aG9kIGltcGxlbWVudGVkIGJ5IGVhY2ggY29uY3JldGUgY2xhc3MuXG4gKiAgIE5PVEU6IFdoZW4gY3JlYXRlZCwgdGhlIGNvbXBvbmVudCB3aWxsIHJlY2VpdmUgYSAuaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLWNvbXBvbmVudCwgaW5oZXJpdGluZyB1c2VmdWwgQ1NTIHZhcmlhYmxlcy5cbiAqXG4gKiAyKSBJZiBhbiBlbmRwb2ludCBpcyBzcGVjaWZpZWQsIGl0IHdpbGwgcmV0cmlldmUgYWdncmVnYXRlIHJlc3VsdHMgZnJvbSB0aGUgYmFja2VuZCBhbmQgcHJvY2VzcyB0aGVtLiBJZiB0aGUgY2xpZW50SWRcbiAqICAgaGFzIHJlc3BvbmRlZCBpbiBhIHByZXZpb3VzIHNlc3Npb24sIHRoZSBjb21wb25lbnQgd2lsbCBjaGFuZ2UgdG8gYSBwb3N0LXNlbGVjdGlvbiBzdGF0ZS4gT3RoZXJ3aXNlIGl0IHdpbGwgd2FpdFxuICogICBmb3IgdXNlciBzZWxlY3Rpb24uXG4gKiAgIE5PVEU6IENsaWNrIGxpc3RlbmVycyB3aWxsIGJlIGF0dGFjaGVkIHRvIGFsbCBvcHRpb25zLCB3aGljaCByZXF1aXJlIC5pLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtb3B0aW9uLlxuICpcbiAqIDMpIE9uIHVzZXIgc2VsZWN0aW9uLCBpdCB3aWxsIHByb2Nlc3MgdGhlIGJhY2tlbmQgcmVzdWx0cyAoaWYgZW5kcG9pbnQgc3BlY2lmaWVkKSBhbmQgZGlzcGxheSB0aGUgc2VsZWN0ZWQgb3B0aW9uLlxuICogICBBbmFseXRpYyBldmVudHMgd2lsbCBiZSBzZW50LCBwZXJjZW50YWdlcyB1cGRhdGVkIChpbXBsZW1lbnRlZCBieSB0aGUgY29uY3JldGUgY2xhc3MpLCBhbmQgYmFja2VuZCBwb3N0ZWQgd2l0aCB0aGVcbiAqICAgdXNlciByZXNwb25zZS4gQ2xhc3NlcyB3aWxsIGJlIGFkZGVkIHRvIHRoZSBjb21wb25lbnQgYW5kIG9wdGlvbnMgYWNjb3JkaW5nbHkuXG4gKiAgIE5PVEU6IE9uIG9wdGlvbiBzZWxlY3RlZCwgdGhlIHNlbGVjdGlvbiB3aWxsIHJlY2VpdmUgYSAuaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW9wdGlvbi1zZWxlY3RlZCwgYW5kIHRoZSByb290IGVsZW1lbnRcbiAqICAgd2lsbCByZWNlaXZlIGEgLmktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1wb3N0LXNlbGVjdGlvbi4gT3B0aW9uYWxseSwgaWYgdGhlIGVuZHBvaW50IHJldHVybmVkIGFnZ3JlZ2F0ZSByZXN1bHRzLFxuICogICB0aGUgcm9vdCBlbGVtZW50IHdpbGwgYWxzbyByZWNlaXZlIGEgLmktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1oYXMtZGF0YS5cbiAqXG4gKiBAYWJzdHJhY3RcbiAqL1xuZXhwb3J0IGNsYXNzIEFtcFN0b3J5SW50ZXJhY3RpdmUgZXh0ZW5kcyBBTVAuQmFzZUVsZW1lbnQge1xuICAvKipcbiAgICogQHBhcmFtIHshQW1wRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcGFyYW0geyFJbnRlcmFjdGl2ZVR5cGV9IHR5cGVcbiAgICogQHBhcmFtIHshQXJyYXk8bnVtYmVyPn0gYm91bmRzIHRoZSBib3VuZHMgb24gbnVtYmVyIG9mIG9wdGlvbnMsIGluY2x1c2l2ZVxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgdHlwZSwgYm91bmRzID0gWzIsIDRdKSB7XG4gICAgc3VwZXIoZWxlbWVudCk7XG5cbiAgICAvKiogQHByb3RlY3RlZCBAY29uc3Qge0ludGVyYWN0aXZlVHlwZX0gKi9cbiAgICB0aGlzLmludGVyYWN0aXZlVHlwZV8gPSB0eXBlO1xuXG4gICAgLyoqIEBwcm90ZWN0ZWQgez8uLi8uLi9hbXAtc3RvcnkvMS4wL3N0b3J5LWFuYWx5dGljcy5TdG9yeUFuYWx5dGljc1NlcnZpY2V9ICovXG4gICAgdGhpcy5hbmFseXRpY3NTZXJ2aWNlXyA9IG51bGw7XG5cbiAgICAvKiogQHByb3RlY3RlZCB7P1Byb21pc2U8P0ludGVyYWN0aXZlUmVzcG9uc2VUeXBlfD9Kc29uT2JqZWN0fHVuZGVmaW5lZD59ICovXG4gICAgdGhpcy5iYWNrZW5kRGF0YVByb21pc2VfID0gbnVsbDtcblxuICAgIC8qKiBAcHJvdGVjdGVkIHs/UHJvbWlzZTxKc29uT2JqZWN0Pn0gKi9cbiAgICB0aGlzLmNsaWVudElkUHJvbWlzZV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/RWxlbWVudH0gdGhlIGRpc2NsYWltZXIgZGlhbG9nIGlmIG9wZW4sIG51bGwgaWYgY2xvc2VkICovXG4gICAgdGhpcy5kaXNjbGFpbWVyRWxfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5kaXNjbGFpbWVySWNvbl8gPSBudWxsO1xuXG4gICAgLyoqIEBwcm90ZWN0ZWQge2Jvb2xlYW59ICovXG4gICAgdGhpcy5oYXNVc2VyU2VsZWN0aW9uXyA9IGZhbHNlO1xuXG4gICAgLyoqIEBwcml2YXRlIHshQXJyYXk8bnVtYmVyPn0gbWluIGFuZCBtYXggbnVtYmVyIG9mIG9wdGlvbnMsIGluY2x1c2l2ZSAqL1xuICAgIHRoaXMub3B0aW9uQm91bmRzXyA9IGJvdW5kcztcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0FycmF5PCFFbGVtZW50Pn0gRE9NIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW9wdGlvbiBjbGFzcyAqL1xuICAgIHRoaXMub3B0aW9uRWxlbWVudHNfID0gbnVsbDtcblxuICAgIC8qKiBAcHJvdGVjdGVkIHs/QXJyYXk8IU9wdGlvbkNvbmZpZ1R5cGU+fSBvcHRpb24gY29uZmlnIHZhbHVlcyBmcm9tIGF0dHJpYnV0ZXMgKHRleHQsIGNvcnJlY3QuLi4pICovXG4gICAgdGhpcy5vcHRpb25zXyA9IG51bGw7XG5cbiAgICAvKiogQHByb3RlY3RlZCB7P0FycmF5PCFJbnRlcmFjdGl2ZU9wdGlvblR5cGU+fSByZXRyaWV2ZWQgcmVzdWx0cyBmcm9tIHRoZSBiYWNrZW5kICovXG4gICAgdGhpcy5vcHRpb25zRGF0YV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/RWxlbWVudH0gdGhlIHBhZ2UgZWxlbWVudCB0aGUgY29tcG9uZW50IGlzIG9uICovXG4gICAgdGhpcy5wYWdlRWxfID0gbnVsbDtcblxuICAgIC8qKiBAcHJvdGVjdGVkIHs/RWxlbWVudH0gKi9cbiAgICB0aGlzLnJvb3RFbF8gPSBudWxsO1xuXG4gICAgLyoqIEBwdWJsaWMgey4uLy4uLy4uL3NyYy9zZXJ2aWNlL2xvY2FsaXphdGlvblNlcnZpY2V9ICovXG4gICAgdGhpcy5sb2NhbGl6YXRpb25TZXJ2aWNlID0gbnVsbDtcblxuICAgIC8qKiBAcHJvdGVjdGVkIHs/Li4vLi4vYW1wLXN0b3J5LzEuMC9hbXAtc3RvcnktcmVxdWVzdC1zZXJ2aWNlLkFtcFN0b3J5UmVxdWVzdFNlcnZpY2V9ICovXG4gICAgdGhpcy5yZXF1ZXN0U2VydmljZV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcm90ZWN0ZWQgez8uLi8uLi9hbXAtc3RvcnkvMS4wL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlLkFtcFN0b3J5U3RvcmVTZXJ2aWNlfSAqL1xuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXyA9IG51bGw7XG5cbiAgICAvKiogQHByb3RlY3RlZCB7Py4uLy4uLy4uL3NyYy9zZXJ2aWNlL3VybC1pbXBsLlVybH0gKi9cbiAgICB0aGlzLnVybFNlcnZpY2VfID0gbnVsbDtcblxuICAgIC8qKiBAcHJvdGVjdGVkIHs/Li4vLi4vYW1wLXN0b3J5LzEuMC92YXJpYWJsZS1zZXJ2aWNlLkFtcFN0b3J5VmFyaWFibGVTZXJ2aWNlfSAqL1xuICAgIHRoaXMudmFyaWFibGVTZXJ2aWNlXyA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgcm9vdCBlbGVtZW50LlxuICAgKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAgICogQHJldHVybiB7P0VsZW1lbnR9XG4gICAqL1xuICBnZXRSb290RWxlbWVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5yb290RWxfO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG9wdGlvbnMuXG4gICAqIEBwcm90ZWN0ZWRcbiAgICogQHJldHVybiB7IUFycmF5PCFFbGVtZW50Pn1cbiAgICovXG4gIGdldE9wdGlvbkVsZW1lbnRzKCkge1xuICAgIGlmICghdGhpcy5vcHRpb25FbGVtZW50c18pIHtcbiAgICAgIHRoaXMub3B0aW9uRWxlbWVudHNfID0gdG9BcnJheShcbiAgICAgICAgdGhpcy5yb290RWxfLnF1ZXJ5U2VsZWN0b3JBbGwoJy5pLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtb3B0aW9uJylcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm9wdGlvbkVsZW1lbnRzXztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBpbnRlcmFjdGl2ZSBJRFxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBnZXRJbnRlcmFjdGl2ZUlkXygpIHtcbiAgICBpZiAoIUFtcFN0b3J5SW50ZXJhY3RpdmUuY2Fub25pY2FsVXJsNjQpIHtcbiAgICAgIGRlZHVwbGljYXRlSW50ZXJhY3RpdmVJZHModGhpcy53aW4uZG9jdW1lbnQpO1xuICAgICAgQW1wU3RvcnlJbnRlcmFjdGl2ZS5jYW5vbmljYWxVcmw2NCA9IGJhc2U2NFVybEVuY29kZUZyb21TdHJpbmcoXG4gICAgICAgIFNlcnZpY2VzLmRvY3VtZW50SW5mb0ZvckRvYyh0aGlzLmVsZW1lbnQpLmNhbm9uaWNhbFVybFxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIGAke0FtcFN0b3J5SW50ZXJhY3RpdmUuY2Fub25pY2FsVXJsNjR9KyR7dGhpcy5lbGVtZW50LmlkfWA7XG4gIH1cblxuICAvKipcbiAgICogQHByb3RlY3RlZFxuICAgKiBAcmV0dXJuIHtFbGVtZW50fSB0aGUgcGFnZSBlbGVtZW50XG4gICAqL1xuICBnZXRQYWdlRWwoKSB7XG4gICAgaWYgKHRoaXMucGFnZUVsXyA9PSBudWxsKSB7XG4gICAgICB0aGlzLnBhZ2VFbF8gPSBjbG9zZXN0KGRldigpLmFzc2VydEVsZW1lbnQodGhpcy5lbGVtZW50KSwgKGVsKSA9PiB7XG4gICAgICAgIHJldHVybiBlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdhbXAtc3RvcnktcGFnZSc7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucGFnZUVsXztcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgYnVpbGRDYWxsYmFjayhjb25jcmV0ZUNTUyA9ICcnKSB7XG4gICAgdGhpcy5sb2FkRm9udHNfKCk7XG4gICAgdGhpcy5vcHRpb25zXyA9IHRoaXMucGFyc2VPcHRpb25zXygpO1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtY29tcG9uZW50Jyk7XG4gICAgdGhpcy5hZGp1c3RHcmlkTGF5ZXJfKCk7XG4gICAgZGV2QXNzZXJ0KHRoaXMuZWxlbWVudC5jaGlsZHJlbi5sZW5ndGggPT0gMCwgJ1RvbyBtYW55IGNoaWxkcmVuJyk7XG5cbiAgICAvLyBJbml0aWFsaXplIGFsbCB0aGUgc2VydmljZXMgYmVmb3JlIHByb2NlZWRpbmcsIGFuZCB1cGRhdGUgc3RvcmUgd2l0aCBzdGF0ZVxuICAgIHRoaXMudXJsU2VydmljZV8gPSBTZXJ2aWNlcy51cmxGb3JEb2ModGhpcy5lbGVtZW50KTtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAgU2VydmljZXMuc3RvcnlWYXJpYWJsZVNlcnZpY2VGb3JPck51bGwodGhpcy53aW4pLnRoZW4oKHNlcnZpY2UpID0+IHtcbiAgICAgICAgdGhpcy52YXJpYWJsZVNlcnZpY2VfID0gc2VydmljZTtcbiAgICAgIH0pLFxuICAgICAgU2VydmljZXMuc3RvcnlTdG9yZVNlcnZpY2VGb3JPck51bGwodGhpcy53aW4pLnRoZW4oKHNlcnZpY2UpID0+IHtcbiAgICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfID0gc2VydmljZTtcbiAgICAgICAgdGhpcy51cGRhdGVTdG9yeVN0b3JlU3RhdGVfKG51bGwpO1xuICAgICAgfSksXG4gICAgICBTZXJ2aWNlcy5zdG9yeVJlcXVlc3RTZXJ2aWNlRm9yT3JOdWxsKHRoaXMud2luKS50aGVuKChzZXJ2aWNlKSA9PiB7XG4gICAgICAgIHRoaXMucmVxdWVzdFNlcnZpY2VfID0gc2VydmljZTtcbiAgICAgIH0pLFxuICAgICAgU2VydmljZXMuc3RvcnlBbmFseXRpY3NTZXJ2aWNlRm9yT3JOdWxsKHRoaXMud2luKS50aGVuKChzZXJ2aWNlKSA9PiB7XG4gICAgICAgIHRoaXMuYW5hbHl0aWNzU2VydmljZV8gPSBzZXJ2aWNlO1xuICAgICAgfSksXG4gICAgICBTZXJ2aWNlcy5sb2NhbGl6YXRpb25TZXJ2aWNlRm9yT3JOdWxsKHRoaXMuZWxlbWVudCkudGhlbigoc2VydmljZSkgPT4ge1xuICAgICAgICB0aGlzLmxvY2FsaXphdGlvblNlcnZpY2UgPSBzZXJ2aWNlO1xuICAgICAgfSksXG4gICAgXSkudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLnJvb3RFbF8gPSB0aGlzLmJ1aWxkQ29tcG9uZW50KCk7XG4gICAgICB0aGlzLnJvb3RFbF8uY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLWNvbnRhaW5lcicpO1xuICAgICAgaWYgKFxuICAgICAgICBpc0V4cGVyaW1lbnRPbih0aGlzLndpbiwgJ2FtcC1zdG9yeS1pbnRlcmFjdGl2ZS1kaXNjbGFpbWVyJykgJiZcbiAgICAgICAgdGhpcy5lbGVtZW50Lmhhc0F0dHJpYnV0ZSgnZW5kcG9pbnQnKVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuZGlzY2xhaW1lckljb25fID0gYnVpbGRJbnRlcmFjdGl2ZURpc2NsYWltZXJJY29uKHRoaXMpO1xuICAgICAgICB0aGlzLnJvb3RFbF8ucHJlcGVuZCh0aGlzLmRpc2NsYWltZXJJY29uXyk7XG4gICAgICB9XG4gICAgICBjcmVhdGVTaGFkb3dSb290V2l0aFN0eWxlKFxuICAgICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICAgIGRldigpLmFzc2VydEVsZW1lbnQodGhpcy5yb290RWxfKSxcbiAgICAgICAgQ1NTICsgY29uY3JldGVDU1NcbiAgICAgICk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGxvYWRGb250c18oKSB7XG4gICAgaWYgKFxuICAgICAgIUFtcFN0b3J5SW50ZXJhY3RpdmUubG9hZGVkRm9udHMgJiZcbiAgICAgIHRoaXMud2luLmRvY3VtZW50LmZvbnRzICYmXG4gICAgICBGb250RmFjZVxuICAgICkge1xuICAgICAgZm9udHNUb0xvYWQuZm9yRWFjaCgoZm9udFByb3BlcnRpZXMpID0+IHtcbiAgICAgICAgY29uc3QgZm9udCA9IG5ldyBGb250RmFjZShmb250UHJvcGVydGllcy5mYW1pbHksIGZvbnRQcm9wZXJ0aWVzLnNyYywge1xuICAgICAgICAgIHdlaWdodDogZm9udFByb3BlcnRpZXMud2VpZ2h0LFxuICAgICAgICAgIHN0eWxlOiAnbm9ybWFsJyxcbiAgICAgICAgfSk7XG4gICAgICAgIGZvbnQubG9hZCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHRoaXMud2luLmRvY3VtZW50LmZvbnRzLmFkZChmb250KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgQW1wU3RvcnlJbnRlcmFjdGl2ZS5sb2FkZWRGb250cyA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogUmVhZHMgdGhlIGVsZW1lbnQgYXR0cmlidXRlcyBwcmVmaXhlZCB3aXRoIG9wdGlvbi0gYW5kIHJldHVybnMgdGhlbSBhcyBhIGxpc3QuXG4gICAqIGVnOiBbXG4gICAqICAgICAge29wdGlvbkluZGV4OiAwLCB0ZXh0OiAnS29hbGEnfSxcbiAgICogICAgICB7b3B0aW9uSW5kZXg6IDEsIHRleHQ6ICdEZXZlbG9wZXJzJywgY29ycmVjdDogJyd9XG4gICAqICAgIF1cbiAgICogQHByb3RlY3RlZFxuICAgKiBAcmV0dXJuIHs/QXJyYXk8IU9wdGlvbkNvbmZpZ1R5cGU+fVxuICAgKi9cbiAgcGFyc2VPcHRpb25zXygpIHtcbiAgICBjb25zdCBvcHRpb25zID0gW107XG4gICAgdG9BcnJheSh0aGlzLmVsZW1lbnQuYXR0cmlidXRlcykuZm9yRWFjaCgoYXR0cikgPT4ge1xuICAgICAgLy8gTWF0Y2ggJ29wdGlvbi0jLXR5cGUnIChlZzogb3B0aW9uLTEtdGV4dCwgb3B0aW9uLTItaW1hZ2UsIG9wdGlvbi0zLWNvcnJlY3QuLi4pXG4gICAgICBpZiAoYXR0ci5uYW1lLm1hdGNoKC9eb3B0aW9uLVxcZCsoLVxcdyspKyQvKSkge1xuICAgICAgICBjb25zdCBzcGxpdFBhcnRzID0gYXR0ci5uYW1lLnNwbGl0KCctJyk7XG4gICAgICAgIGNvbnN0IG9wdGlvbk51bWJlciA9IHBhcnNlSW50KHNwbGl0UGFydHNbMV0sIDEwKTtcbiAgICAgICAgLy8gQWRkIGFsbCBvcHRpb25zIGluIG9yZGVyIG9uIHRoZSBhcnJheSB3aXRoIGNvcnJlY3QgaW5kZXguXG4gICAgICAgIHdoaWxlIChvcHRpb25zLmxlbmd0aCA8IG9wdGlvbk51bWJlcikge1xuICAgICAgICAgIG9wdGlvbnMucHVzaCh7J29wdGlvbkluZGV4Jzogb3B0aW9ucy5sZW5ndGh9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBrZXkgPSBzcGxpdFBhcnRzLnNsaWNlKDIpLmpvaW4oJycpO1xuICAgICAgICBpZiAoa2V5ID09PSAnaW1hZ2UnKSB7XG4gICAgICAgICAgb3B0aW9uc1tvcHRpb25OdW1iZXIgLSAxXVtrZXldID0gbWF5YmVNYWtlUHJveHlVcmwoXG4gICAgICAgICAgICBhdHRyLnZhbHVlLFxuICAgICAgICAgICAgdGhpcy5nZXRBbXBEb2MoKVxuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3B0aW9uc1tvcHRpb25OdW1iZXIgLSAxXVtrZXldID0gYXR0ci52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChcbiAgICAgIG9wdGlvbnMubGVuZ3RoID49IHRoaXMub3B0aW9uQm91bmRzX1swXSAmJlxuICAgICAgb3B0aW9ucy5sZW5ndGggPD0gdGhpcy5vcHRpb25Cb3VuZHNfWzFdXG4gICAgKSB7XG4gICAgICByZXR1cm4gb3B0aW9ucztcbiAgICB9XG4gICAgZGV2QXNzZXJ0KFxuICAgICAgb3B0aW9ucy5sZW5ndGggPj0gdGhpcy5vcHRpb25Cb3VuZHNfWzBdICYmXG4gICAgICAgIG9wdGlvbnMubGVuZ3RoIDw9IHRoaXMub3B0aW9uQm91bmRzX1sxXSxcbiAgICAgIGBJbXByb3BlciBudW1iZXIgb2Ygb3B0aW9ucy4gRXhwZWN0ZWQgJHt0aGlzLm9wdGlvbkJvdW5kc19bMF19IDw9IG9wdGlvbnMgPD0gJHt0aGlzLm9wdGlvbkJvdW5kc19bMV19IGJ1dCBnb3QgJHtvcHRpb25zLmxlbmd0aH0uYFxuICAgICk7XG4gICAgZGV2KCkuZXJyb3IoXG4gICAgICBUQUcsXG4gICAgICBgSW1wcm9wZXIgbnVtYmVyIG9mIG9wdGlvbnMuIEV4cGVjdGVkICR7dGhpcy5vcHRpb25Cb3VuZHNfWzBdfSA8PSBvcHRpb25zIDw9ICR7dGhpcy5vcHRpb25Cb3VuZHNfWzFdfSBidXQgZ290ICR7b3B0aW9ucy5sZW5ndGh9LmBcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmRzIHRoZSBwcm9tcHQgYW5kIGFkZHMgaXQgdG8gdGhlIHByb21wdC1jb250YWluZXJcbiAgICpcbiAgICogQHByb3RlY3RlZFxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IHJvb3RcbiAgICovXG4gIGF0dGFjaFByb21wdF8ocm9vdCkge1xuICAgIGNvbnN0IHByb21wdENvbnRhaW5lciA9IHJvb3QucXVlcnlTZWxlY3RvcihcbiAgICAgICcuaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLXByb21wdC1jb250YWluZXInXG4gICAgKTtcblxuICAgIGlmICghdGhpcy5lbGVtZW50Lmhhc0F0dHJpYnV0ZSgncHJvbXB0LXRleHQnKSkge1xuICAgICAgdGhpcy5yb290RWxfLnJlbW92ZUNoaWxkKHByb21wdENvbnRhaW5lcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHByb21wdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICAgIHByb21wdC50ZXh0Q29udGVudCA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3Byb21wdC10ZXh0Jyk7XG4gICAgICBwcm9tcHQuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLXByb21wdCcpO1xuICAgICAgcHJvbXB0Q29udGFpbmVyLmFwcGVuZENoaWxkKHByb21wdCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlcyB0aGUgdGVtcGxhdGUgZnJvbSB0aGUgY29uZmlnXyBNYXAuXG4gICAqXG4gICAqIEByZXR1cm4geyFFbGVtZW50fSByb290RWxfXG4gICAqIEBwcm90ZWN0ZWQgQGFic3RyYWN0XG4gICAqL1xuICBidWlsZENvbXBvbmVudCgpIHtcbiAgICAvLyBTdWJjbGFzcyBtdXN0IG92ZXJyaWRlLlxuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBsYXlvdXRDYWxsYmFjaygpIHtcbiAgICB0aGlzLmluaXRpYWxpemVMaXN0ZW5lcnNfKCk7XG4gICAgcmV0dXJuICh0aGlzLmJhY2tlbmREYXRhUHJvbWlzZV8gPSB0aGlzLmVsZW1lbnQuaGFzQXR0cmlidXRlKCdlbmRwb2ludCcpXG4gICAgICA/IHRoaXMucmV0cmlldmVJbnRlcmFjdGl2ZURhdGFfKClcbiAgICAgIDogUHJvbWlzZS5yZXNvbHZlKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBQcm9taXNlIHRvIHJldHVybiB0aGUgdW5pcXVlIEFNUCBjbGllbnRJZFxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPHN0cmluZz59XG4gICAqL1xuICBnZXRDbGllbnRJZF8oKSB7XG4gICAgaWYgKCF0aGlzLmNsaWVudElkUHJvbWlzZV8pIHtcbiAgICAgIHRoaXMuY2xpZW50SWRQcm9taXNlXyA9IFNlcnZpY2VzLmNpZEZvckRvYyh0aGlzLmVsZW1lbnQpLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgcmV0dXJuIGRhdGEuZ2V0KFxuICAgICAgICAgIHtzY29wZTogJ2FtcC1zdG9yeScsIGNyZWF0ZUNvb2tpZUlmTm90UHJlc2VudDogdHJ1ZX0sXG4gICAgICAgICAgLyogY29uc2VudCAqLyBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNsaWVudElkUHJvbWlzZV87XG4gIH1cblxuICAvKipcbiAgICogUmVhY3RzIHRvIFJUTCBzdGF0ZSB1cGRhdGVzIGFuZCB0cmlnZ2VycyB0aGUgVUkgZm9yIFJUTC5cbiAgICogQHBhcmFtIHtib29sZWFufSBydGxTdGF0ZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25SdGxTdGF0ZVVwZGF0ZV8ocnRsU3RhdGUpIHtcbiAgICB0aGlzLm11dGF0ZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgcnRsU3RhdGVcbiAgICAgICAgPyB0aGlzLnJvb3RFbF8uc2V0QXR0cmlidXRlKCdkaXInLCAncnRsJylcbiAgICAgICAgOiB0aGlzLnJvb3RFbF8ucmVtb3ZlQXR0cmlidXRlKCdkaXInKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaXNMYXlvdXRTdXBwb3J0ZWQobGF5b3V0KSB7XG4gICAgcmV0dXJuIGxheW91dCA9PT0gJ2NvbnRhaW5lcic7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGNsYXNzZXMgdG8gYWRqdXN0IHRoZSBib3R0b20gcGFkZGluZyBvbiB0aGUgZ3JpZC1sYXllclxuICAgKiB0byBwcmV2ZW50IG92ZXJsYXAgd2l0aCB0aGUgY29tcG9uZW50LlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYWRqdXN0R3JpZExheWVyXygpIHtcbiAgICBjb25zdCBncmlkTGF5ZXIgPSBjbG9zZXN0KGRldigpLmFzc2VydEVsZW1lbnQodGhpcy5lbGVtZW50KSwgKGVsKSA9PiB7XG4gICAgICByZXR1cm4gZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnYW1wLXN0b3J5LWdyaWQtbGF5ZXInO1xuICAgIH0pO1xuXG4gICAgZ3JpZExheWVyLmNsYXNzTGlzdC5hZGQoJ2ktYW1waHRtbC1zdG9yeS1oYXMtaW50ZXJhY3RpdmUnKTtcblxuICAgIGlmIChncmlkTGF5ZXIucGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKCdhbXAtc3RvcnktY3RhLWxheWVyJykpIHtcbiAgICAgIGdyaWRMYXllci5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3RvcnktaGFzLUNUQS1sYXllcicpO1xuICAgIH1cblxuICAgIGlmIChncmlkTGF5ZXIucGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKCdhbXAtc3RvcnktcGFnZS1hdHRhY2htZW50JykpIHtcbiAgICAgIGdyaWRMYXllci5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3RvcnktaGFzLXBhZ2UtYXR0YWNobWVudCcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyBmdW5jdGlvbnMgdG8gZWFjaCBvcHRpb24gdG8gaGFuZGxlIHN0YXRlIHRyYW5zaXRpb24uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpbml0aWFsaXplTGlzdGVuZXJzXygpIHtcbiAgICB0aGlzLnN0b3JlU2VydmljZV8uc3Vic2NyaWJlKFxuICAgICAgU3RhdGVQcm9wZXJ0eS5SVExfU1RBVEUsXG4gICAgICAocnRsU3RhdGUpID0+IHtcbiAgICAgICAgdGhpcy5vblJ0bFN0YXRlVXBkYXRlXyhydGxTdGF0ZSk7XG4gICAgICB9LFxuICAgICAgdHJ1ZSAvKiogY2FsbFRvSW5pdGlhbGl6ZSAqL1xuICAgICk7XG5cbiAgICAvLyBDaGVjayBpZiB0aGUgY29tcG9uZW50IHBhZ2UgaXMgYWN0aXZlLCBhbmQgYWRkIGNsYXNzLlxuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5zdWJzY3JpYmUoXG4gICAgICBTdGF0ZVByb3BlcnR5LkNVUlJFTlRfUEFHRV9JRCxcbiAgICAgIChjdXJyUGFnZUlkKSA9PiB7XG4gICAgICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PiB7XG4gICAgICAgICAgY29uc3QgdG9nZ2xlID0gY3VyclBhZ2VJZCA9PT0gdGhpcy5nZXRQYWdlRWwoKS5nZXRBdHRyaWJ1dGUoJ2lkJyk7XG4gICAgICAgICAgdGhpcy5yb290RWxfLmNsYXNzTGlzdC50b2dnbGUoSU5URVJBQ1RJVkVfQUNUSVZFX0NMQVNTLCB0b2dnbGUpO1xuICAgICAgICAgIHRoaXMudG9nZ2xlVGFiYmFibGVFbGVtZW50c18odG9nZ2xlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY2xvc2VEaXNjbGFpbWVyXygpO1xuICAgICAgfSxcbiAgICAgIHRydWUgLyoqIGNhbGxUb0luaXRpYWxpemUgKi9cbiAgICApO1xuXG4gICAgdGhpcy5yb290RWxfLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHRoaXMuaGFuZGxlVGFwXyhlKSk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBhIHRhcCBldmVudCBvbiB0aGUgcXVpeiBlbGVtZW50LlxuICAgKiBAcGFyYW0ge0V2ZW50fSBlXG4gICAqIEBwcm90ZWN0ZWRcbiAgICovXG4gIGhhbmRsZVRhcF8oZSkge1xuICAgIGlmIChlLnRhcmdldCA9PSB0aGlzLmRpc2NsYWltZXJJY29uXyAmJiAhdGhpcy5kaXNjbGFpbWVyRWxfKSB7XG4gICAgICB0aGlzLm9wZW5EaXNjbGFpbWVyXygpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmhhc1VzZXJTZWxlY3Rpb25fKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgb3B0aW9uRWwgPSBjbG9zZXN0KFxuICAgICAgZGV2KCkuYXNzZXJ0RWxlbWVudChlLnRhcmdldCksXG4gICAgICAoZWxlbWVudCkgPT4ge1xuICAgICAgICByZXR1cm4gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2ktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1vcHRpb24nKTtcbiAgICAgIH0sXG4gICAgICB0aGlzLnJvb3RFbF9cbiAgICApO1xuXG4gICAgaWYgKG9wdGlvbkVsKSB7XG4gICAgICB0aGlzLnVwZGF0ZVN0b3J5U3RvcmVTdGF0ZV8ob3B0aW9uRWwub3B0aW9uSW5kZXhfKTtcbiAgICAgIHRoaXMuaGFuZGxlT3B0aW9uU2VsZWN0aW9uXyhvcHRpb25FbCk7XG4gICAgICBjb25zdCBjb25mZXR0aUVtb2ppID0gdGhpcy5vcHRpb25zX1tvcHRpb25FbC5vcHRpb25JbmRleF9dLmNvbmZldHRpO1xuICAgICAgaWYgKGNvbmZldHRpRW1vamkpIHtcbiAgICAgICAgZW1vamlDb25mZXR0aShcbiAgICAgICAgICBkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMucm9vdEVsXyksXG4gICAgICAgICAgdGhpcy53aW4sXG4gICAgICAgICAgY29uZmV0dGlFbW9qaVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgdGhpcy5jbG9zZURpc2NsYWltZXJfKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIHRoZSBhbmFseXRpY3MgZXZlbnQgZm9yIHF1aXogcmVzcG9uc2UuXG4gICAqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IG9wdGlvbkVsXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB0cmlnZ2VyQW5hbHl0aWNzXyhvcHRpb25FbCkge1xuICAgIHRoaXMudmFyaWFibGVTZXJ2aWNlXy5vblZhcmlhYmxlVXBkYXRlKFxuICAgICAgQW5hbHl0aWNzVmFyaWFibGUuU1RPUllfSU5URVJBQ1RJVkVfSUQsXG4gICAgICB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdpZCcpXG4gICAgKTtcbiAgICB0aGlzLnZhcmlhYmxlU2VydmljZV8ub25WYXJpYWJsZVVwZGF0ZShcbiAgICAgIEFuYWx5dGljc1ZhcmlhYmxlLlNUT1JZX0lOVEVSQUNUSVZFX1JFU1BPTlNFLFxuICAgICAgb3B0aW9uRWwub3B0aW9uSW5kZXhfXG4gICAgKTtcbiAgICB0aGlzLnZhcmlhYmxlU2VydmljZV8ub25WYXJpYWJsZVVwZGF0ZShcbiAgICAgIEFuYWx5dGljc1ZhcmlhYmxlLlNUT1JZX0lOVEVSQUNUSVZFX1RZUEUsXG4gICAgICB0aGlzLmludGVyYWN0aXZlVHlwZV9cbiAgICApO1xuXG4gICAgdGhpcy5lbGVtZW50W0FOQUxZVElDU19UQUdfTkFNRV0gPSB0aGlzLmVsZW1lbnQudGFnTmFtZTtcbiAgICB0aGlzLmFuYWx5dGljc1NlcnZpY2VfLnRyaWdnZXJFdmVudChcbiAgICAgIFN0b3J5QW5hbHl0aWNzRXZlbnQuSU5URVJBQ1RJVkUsXG4gICAgICB0aGlzLmVsZW1lbnRcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBjb21wb25lbnQgdG8gcmVmbGVjdCB2YWx1ZXMgaW4gdGhlIGRhdGEgb2J0YWluZWQuXG4gICAqIENhbGxlZCB3aGVuIHVzZXIgaGFzIHJlc3BvbmRlZCAoaW4gdGhpcyBzZXNzaW9uIG9yIGJlZm9yZSkuXG4gICAqXG4gICAqIEBwcm90ZWN0ZWQgQGFic3RyYWN0XG4gICAqIEBwYXJhbSB7IUFycmF5PCFJbnRlcmFjdGl2ZU9wdGlvblR5cGU+fSB1bnVzZWRPcHRpb25zRGF0YVxuICAgKi9cbiAgZGlzcGxheU9wdGlvbnNEYXRhKHVudXNlZE9wdGlvbnNEYXRhKSB7XG4gICAgLy8gU3ViY2xhc3MgbXVzdCBpbXBsZW1lbnRcbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVwcm9jZXNzIHRoZSBwZXJjZW50YWdlcyBmb3IgZGlzcGxheS5cbiAgICpcbiAgICogQHBhcmFtIHshQXJyYXk8IUludGVyYWN0aXZlT3B0aW9uVHlwZT59IG9wdGlvbnNEYXRhXG4gICAqIEByZXR1cm4ge0FycmF5PG51bWJlcj59XG4gICAqIEBwcm90ZWN0ZWRcbiAgICovXG4gIHByZXByb2Nlc3NQZXJjZW50YWdlc18ob3B0aW9uc0RhdGEpIHtcbiAgICBjb25zdCB0b3RhbFJlc3BvbnNlQ291bnQgPSBvcHRpb25zRGF0YS5yZWR1Y2UoXG4gICAgICAoYWNjLCByZXNwb25zZSkgPT4gYWNjICsgcmVzcG9uc2VbJ2NvdW50J10sXG4gICAgICAwXG4gICAgKTtcblxuICAgIGxldCBwZXJjZW50YWdlcyA9IG9wdGlvbnNEYXRhLm1hcCgoZSkgPT5cbiAgICAgICgoMTAwICogZVsnY291bnQnXSkgLyB0b3RhbFJlc3BvbnNlQ291bnQpLnRvRml4ZWQoMilcbiAgICApO1xuICAgIGxldCB0b3RhbCA9IHBlcmNlbnRhZ2VzLnJlZHVjZSgoYWNjLCB4KSA9PiBhY2MgKyBNYXRoLnJvdW5kKHgpLCAwKTtcblxuICAgIC8vIFNwZWNpYWwgY2FzZTogZGl2aWRlIHJlbWFpbmRlcnMgYnkgdGhyZWUgaWYgdGhleSBicmVhayAxMDAsXG4gICAgLy8gMyBpcyB0aGUgbWF4aW11bSBhYm92ZSAxMDAgdGhlIHJlbWFpbmRlcnMgY2FuIGFkZC5cbiAgICBpZiAodG90YWwgPiAxMDApIHtcbiAgICAgIHBlcmNlbnRhZ2VzID0gcGVyY2VudGFnZXMubWFwKChwZXJjZW50YWdlKSA9PlxuICAgICAgICAocGVyY2VudGFnZSAtICgyICogKHBlcmNlbnRhZ2UgLSBNYXRoLmZsb29yKHBlcmNlbnRhZ2UpKSkgLyAzKS50b0ZpeGVkKFxuICAgICAgICAgIDJcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICAgIHRvdGFsID0gcGVyY2VudGFnZXMucmVkdWNlKChhY2MsIHgpID0+IChhY2MgKz0gTWF0aC5yb3VuZCh4KSksIDApO1xuICAgIH1cblxuICAgIGlmICh0b3RhbCA9PT0gMTAwKSB7XG4gICAgICByZXR1cm4gcGVyY2VudGFnZXMubWFwKChwZXJjZW50YWdlKSA9PiBNYXRoLnJvdW5kKHBlcmNlbnRhZ2UpKTtcbiAgICB9XG5cbiAgICAvLyBUcnVuY2F0ZSBhbGwgYW5kIHJvdW5kIHVwIHRob3NlIHdpdGggdGhlIGhpZ2hlc3QgcmVtYWluZGVycyxcbiAgICAvLyBwcmVzZXJ2aW5nIG9yZGVyIGFuZCB0aWVzIGFuZCBhZGRpbmcgdG8gMTAwIChpZiBwb3NzaWJsZSBnaXZlbiB0aWVzIGFuZCBvcmRlcmluZykuXG4gICAgbGV0IHJlbWFpbmRlciA9IDEwMCAtIHRvdGFsO1xuXG4gICAgbGV0IHByZXNlcnZlT3JpZ2luYWwgPSBwZXJjZW50YWdlcy5tYXAoKHBlcmNlbnRhZ2UsIGluZGV4KSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBvcmlnaW5hbEluZGV4OiBpbmRleCxcbiAgICAgICAgdmFsdWU6IHBlcmNlbnRhZ2UsXG4gICAgICAgIHJlbWFpbmRlcjogKHBlcmNlbnRhZ2UgLSBNYXRoLmZsb29yKHBlcmNlbnRhZ2UpKS50b0ZpeGVkKDIpLFxuICAgICAgfTtcbiAgICB9KTtcbiAgICBwcmVzZXJ2ZU9yaWdpbmFsLnNvcnQoXG4gICAgICAobGVmdCwgcmlnaHQpID0+XG4gICAgICAgIC8vIEJyZWFrIHJlbWFpbmRlciB0aWVzIHVzaW5nIHRoZSBoaWdoZXIgdmFsdWUuXG4gICAgICAgIHJpZ2h0LnJlbWFpbmRlciAtIGxlZnQucmVtYWluZGVyIHx8IHJpZ2h0LnZhbHVlIC0gbGVmdC52YWx1ZVxuICAgICk7XG5cbiAgICBjb25zdCBmaW5hbFBlcmNlbnRhZ2VzID0gW107XG4gICAgd2hpbGUgKHJlbWFpbmRlciA+IDAgJiYgcHJlc2VydmVPcmlnaW5hbC5sZW5ndGggIT09IDApIHtcbiAgICAgIGNvbnN0IGhpZ2hlc3RSZW1haW5kZXJPYmogPSBwcmVzZXJ2ZU9yaWdpbmFsWzBdO1xuXG4gICAgICBjb25zdCB0aWVzID0gcHJlc2VydmVPcmlnaW5hbC5maWx0ZXIoXG4gICAgICAgIChwZXJjZW50YWdlT2JqKSA9PiBwZXJjZW50YWdlT2JqLnZhbHVlID09PSBoaWdoZXN0UmVtYWluZGVyT2JqLnZhbHVlXG4gICAgICApO1xuICAgICAgcHJlc2VydmVPcmlnaW5hbCA9IHByZXNlcnZlT3JpZ2luYWwuZmlsdGVyKFxuICAgICAgICAocGVyY2VudGFnZU9iaikgPT4gcGVyY2VudGFnZU9iai52YWx1ZSAhPT0gaGlnaGVzdFJlbWFpbmRlck9iai52YWx1ZVxuICAgICAgKTtcblxuICAgICAgY29uc3QgdG9Sb3VuZFVwID1cbiAgICAgICAgdGllcy5sZW5ndGggPD0gcmVtYWluZGVyICYmIGhpZ2hlc3RSZW1haW5kZXJPYmoucmVtYWluZGVyICE9PSAnMC4wMCc7XG5cbiAgICAgIHRpZXMuZm9yRWFjaCgocGVyY2VudGFnZU9iaikgPT4ge1xuICAgICAgICBmaW5hbFBlcmNlbnRhZ2VzW3BlcmNlbnRhZ2VPYmoub3JpZ2luYWxJbmRleF0gPVxuICAgICAgICAgIE1hdGguZmxvb3IocGVyY2VudGFnZU9iai52YWx1ZSkgKyAodG9Sb3VuZFVwID8gMSA6IDApO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgcmVtYWluZGVyIGdpdmVuIGFkZGl0aW9ucyB0byB0aGUgcGVyY2VudGFnZXMuXG4gICAgICByZW1haW5kZXIgLT0gdG9Sb3VuZFVwID8gdGllcy5sZW5ndGggOiAwO1xuICAgIH1cblxuICAgIHByZXNlcnZlT3JpZ2luYWwuZm9yRWFjaCgocGVyY2VudGFnZU9iaikgPT4ge1xuICAgICAgZmluYWxQZXJjZW50YWdlc1twZXJjZW50YWdlT2JqLm9yaWdpbmFsSW5kZXhdID0gTWF0aC5mbG9vcihcbiAgICAgICAgcGVyY2VudGFnZU9iai52YWx1ZVxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBmaW5hbFBlcmNlbnRhZ2VzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIGNoYW5nZXMgdG8gY29tcG9uZW50IHN0YXRlIG9uIHJlc3BvbnNlIGludGVyYWN0aXZlLlxuICAgKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBvcHRpb25FbFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaGFuZGxlT3B0aW9uU2VsZWN0aW9uXyhvcHRpb25FbCkge1xuICAgIHRoaXMuYmFja2VuZERhdGFQcm9taXNlX1xuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5oYXNVc2VyU2VsZWN0aW9uXykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudHJpZ2dlckFuYWx5dGljc18ob3B0aW9uRWwpO1xuICAgICAgICB0aGlzLmhhc1VzZXJTZWxlY3Rpb25fID0gdHJ1ZTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zRGF0YV8pIHtcbiAgICAgICAgICB0aGlzLm9wdGlvbnNEYXRhX1tvcHRpb25FbC5vcHRpb25JbmRleF9dWydjb3VudCddKys7XG4gICAgICAgICAgdGhpcy5vcHRpb25zRGF0YV9bb3B0aW9uRWwub3B0aW9uSW5kZXhfXVsnc2VsZWN0ZWQnXSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm11dGF0ZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMudXBkYXRlVG9Qb3N0U2VsZWN0aW9uU3RhdGVfKG9wdGlvbkVsKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2VuZHBvaW50JykpIHtcbiAgICAgICAgICB0aGlzLmV4ZWN1dGVJbnRlcmFjdGl2ZVJlcXVlc3RfKCdQT1NUJywgb3B0aW9uRWwub3B0aW9uSW5kZXhfKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIC8vIElmIGJhY2tlbmQgaXMgbm90IHByb3Blcmx5IGNvbm5lY3RlZCwgc3RpbGwgdXBkYXRlIHN0YXRlLlxuICAgICAgICB0aGlzLnRyaWdnZXJBbmFseXRpY3NfKG9wdGlvbkVsKTtcbiAgICAgICAgdGhpcy5oYXNVc2VyU2VsZWN0aW9uXyA9IHRydWU7XG4gICAgICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy51cGRhdGVUb1Bvc3RTZWxlY3Rpb25TdGF0ZV8ob3B0aW9uRWwpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgSW50ZXJhY3RpdmUgZGF0YSBmcm9tIHRoZSBkYXRhc3RvcmVcbiAgICpcbiAgICogQHJldHVybiB7P1Byb21pc2U8P0ludGVyYWN0aXZlUmVzcG9uc2VUeXBlfD9Kc29uT2JqZWN0fHVuZGVmaW5lZD59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICByZXRyaWV2ZUludGVyYWN0aXZlRGF0YV8oKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY3V0ZUludGVyYWN0aXZlUmVxdWVzdF8oJ0dFVCcpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICB0aGlzLmhhbmRsZVN1Y2Nlc3NmdWxEYXRhUmV0cmlldmFsXyhcbiAgICAgICAgLyoqIEB0eXBlIHtJbnRlcmFjdGl2ZVJlc3BvbnNlVHlwZX0gKi8gKHJlc3BvbnNlKVxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlcyBhIEludGVyYWN0aXZlIEFQSSBjYWxsLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWV0aG9kIEdFVCBvciBQT1NULlxuICAgKiBAcGFyYW0ge251bWJlcj19IG9wdGlvblNlbGVjdGVkXG4gICAqIEByZXR1cm4geyFQcm9taXNlPCFJbnRlcmFjdGl2ZVJlc3BvbnNlVHlwZXxzdHJpbmc+fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZXhlY3V0ZUludGVyYWN0aXZlUmVxdWVzdF8obWV0aG9kLCBvcHRpb25TZWxlY3RlZCA9IHVuZGVmaW5lZCkge1xuICAgIGxldCB1cmwgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdlbmRwb2ludCcpO1xuICAgIGlmICghYXNzZXJ0QWJzb2x1dGVIdHRwT3JIdHRwc1VybCh1cmwpKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoRU5EUE9JTlRfSU5WQUxJRF9FUlJPUik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZ2V0Q2xpZW50SWRfKCkudGhlbigoY2xpZW50SWQpID0+IHtcbiAgICAgIGNvbnN0IHJlcXVlc3RPcHRpb25zID0geydtZXRob2QnOiBtZXRob2R9O1xuICAgICAgY29uc3QgcmVxdWVzdFBhcmFtcyA9IGRpY3Qoe1xuICAgICAgICAndHlwZSc6IHRoaXMuaW50ZXJhY3RpdmVUeXBlXyxcbiAgICAgICAgJ2NsaWVudCc6IGNsaWVudElkLFxuICAgICAgfSk7XG4gICAgICB1cmwgPSBhcHBlbmRQYXRoVG9VcmwoXG4gICAgICAgIHRoaXMudXJsU2VydmljZV8ucGFyc2UodXJsKSxcbiAgICAgICAgdGhpcy5nZXRJbnRlcmFjdGl2ZUlkXygpXG4gICAgICApO1xuICAgICAgaWYgKHJlcXVlc3RPcHRpb25zWydtZXRob2QnXSA9PT0gJ1BPU1QnKSB7XG4gICAgICAgIHJlcXVlc3RPcHRpb25zWydib2R5J10gPSB7J29wdGlvbl9zZWxlY3RlZCc6IG9wdGlvblNlbGVjdGVkfTtcbiAgICAgICAgcmVxdWVzdE9wdGlvbnNbJ2hlYWRlcnMnXSA9IHsnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nfTtcbiAgICAgICAgdXJsID0gYXBwZW5kUGF0aFRvVXJsKHRoaXMudXJsU2VydmljZV8ucGFyc2UodXJsKSwgJzp2b3RlJyk7XG4gICAgICB9XG4gICAgICB1cmwgPSBhZGRQYXJhbXNUb1VybCh1cmwsIHJlcXVlc3RQYXJhbXMpO1xuICAgICAgcmV0dXJuIHRoaXMucmVxdWVzdFNlcnZpY2VfXG4gICAgICAgIC5leGVjdXRlUmVxdWVzdCh1cmwsIHJlcXVlc3RPcHRpb25zKVxuICAgICAgICAuY2F0Y2goKGVycikgPT4gZGV2KCkuZXJyb3IoVEFHLCBlcnIpKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGluY29taW5nIGludGVyYWN0aXZlIGRhdGEgcmVzcG9uc2VcbiAgICpcbiAgICogUkVTUE9OU0UgRk9STUFUXG4gICAqIHtcbiAgICogIG9wdGlvbnM6IFtcbiAgICogICAge1xuICAgKiAgICAgIGluZGV4OlxuICAgKiAgICAgIGNvdW50OlxuICAgKiAgICAgIHNlbGVjdGVkOlxuICAgKiAgICB9LFxuICAgKiAgICAuLi5cbiAgICogIF1cbiAgICogfVxuICAgKiBAcGFyYW0ge0ludGVyYWN0aXZlUmVzcG9uc2VUeXBlfHVuZGVmaW5lZH0gcmVzcG9uc2VcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGhhbmRsZVN1Y2Nlc3NmdWxEYXRhUmV0cmlldmFsXyhyZXNwb25zZSkge1xuICAgIGlmICghKHJlc3BvbnNlICYmIHJlc3BvbnNlWydvcHRpb25zJ10pKSB7XG4gICAgICBkZXZBc3NlcnQoXG4gICAgICAgIHJlc3BvbnNlICYmICdvcHRpb25zJyBpbiByZXNwb25zZSxcbiAgICAgICAgYEludmFsaWQgaW50ZXJhY3RpdmUgcmVzcG9uc2UsIGV4cGVjdGVkIHsgZGF0YTogSW50ZXJhY3RpdmVSZXNwb25zZVR5cGUsIC4uLn0gYnV0IHJlY2VpdmVkICR7cmVzcG9uc2V9YFxuICAgICAgKTtcbiAgICAgIGRldigpLmVycm9yKFxuICAgICAgICBUQUcsXG4gICAgICAgIGBJbnZhbGlkIGludGVyYWN0aXZlIHJlc3BvbnNlLCBleHBlY3RlZCB7IGRhdGE6IEludGVyYWN0aXZlUmVzcG9uc2VUeXBlLCAuLi59IGJ1dCByZWNlaXZlZCAke3Jlc3BvbnNlfWBcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG51bU9wdGlvbnMgPSB0aGlzLnJvb3RFbF8ucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICcuaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW9wdGlvbidcbiAgICApLmxlbmd0aDtcbiAgICAvLyBPbmx5IGtlZXAgdGhlIHZpc2libGUgb3B0aW9ucyB0byBlbnN1cmUgdmlzaWJsZSBwZXJjZW50YWdlcyBhZGQgdXAgdG8gMTAwLlxuICAgIHRoaXMudXBkYXRlQ29tcG9uZW50T25EYXRhUmV0cmlldmFsXyhcbiAgICAgIHJlc3BvbnNlWydvcHRpb25zJ10uc2xpY2UoMCwgbnVtT3B0aW9ucylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHF1aXogdG8gcmVmbGVjdCB0aGUgc3RhdGUgb2YgdGhlIHJlbW90ZSBkYXRhLlxuICAgKiBAcGFyYW0geyFBcnJheTxJbnRlcmFjdGl2ZU9wdGlvblR5cGU+fSBkYXRhXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB1cGRhdGVDb21wb25lbnRPbkRhdGFSZXRyaWV2YWxfKGRhdGEpIHtcbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy5yb290RWxfLnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAnLmktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1vcHRpb24nXG4gICAgKTtcblxuICAgIHRoaXMub3B0aW9uc0RhdGFfID0gdGhpcy5vcmRlckRhdGFfKGRhdGEpO1xuICAgIHRoaXMub3B0aW9uc0RhdGFfLmZvckVhY2goKHJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAocmVzcG9uc2Uuc2VsZWN0ZWQpIHtcbiAgICAgICAgdGhpcy5oYXNVc2VyU2VsZWN0aW9uXyA9IHRydWU7XG4gICAgICAgIHRoaXMudXBkYXRlU3RvcnlTdG9yZVN0YXRlXyhyZXNwb25zZS5pbmRleCk7XG4gICAgICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy51cGRhdGVUb1Bvc3RTZWxlY3Rpb25TdGF0ZV8ob3B0aW9uc1tyZXNwb25zZS5pbmRleF0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBzZWxlY3RlZCBjbGFzc2VzIG9uIGNvbXBvbmVudCBhbmQgb3B0aW9uIHNlbGVjdGVkLlxuICAgKiBAcGFyYW0gez9FbGVtZW50fSBzZWxlY3RlZE9wdGlvblxuICAgKiBAcHJvdGVjdGVkXG4gICAqL1xuICB1cGRhdGVUb1Bvc3RTZWxlY3Rpb25TdGF0ZV8oc2VsZWN0ZWRPcHRpb24pIHtcbiAgICB0aGlzLnJvb3RFbF8uY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLXBvc3Qtc2VsZWN0aW9uJyk7XG4gICAgaWYgKHNlbGVjdGVkT3B0aW9uICE9IG51bGwpIHtcbiAgICAgIHNlbGVjdGVkT3B0aW9uLmNsYXNzTGlzdC5hZGQoXG4gICAgICAgICdpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtb3B0aW9uLXNlbGVjdGVkJ1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zRGF0YV8pIHtcbiAgICAgIHRoaXMucm9vdEVsXy5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtaGFzLWRhdGEnKTtcbiAgICAgIHRoaXMuZGlzcGxheU9wdGlvbnNEYXRhKHRoaXMub3B0aW9uc0RhdGFfKTtcbiAgICB9XG4gICAgdGhpcy5nZXRPcHRpb25FbGVtZW50cygpLmZvckVhY2goKGVsKSA9PiB7XG4gICAgICBlbC5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgLTEpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICogQHBhcmFtIHs/bnVtYmVyfSBvcHRpb25cbiAgICovXG4gIHVwZGF0ZVN0b3J5U3RvcmVTdGF0ZV8ob3B0aW9uID0gbnVsbCkge1xuICAgIGNvbnN0IHVwZGF0ZSA9IHtcbiAgICAgIG9wdGlvbjogb3B0aW9uICE9IG51bGwgPyB0aGlzLm9wdGlvbnNfW29wdGlvbl0gOiBudWxsLFxuICAgICAgaW50ZXJhY3RpdmVJZDogdGhpcy5nZXRJbnRlcmFjdGl2ZUlkXygpLFxuICAgICAgdHlwZTogdGhpcy5pbnRlcmFjdGl2ZVR5cGVfLFxuICAgIH07XG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKEFjdGlvbi5BRERfSU5URVJBQ1RJVkVfUkVBQ1QsIHVwZGF0ZSk7XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgdGFiYmFibGUgZWxlbWVudHMgKGJ1dHRvbnMsIGxpbmtzLCBldGMpIHRvIG9ubHkgcmVhY2ggdGhlbSB3aGVuIHBhZ2UgaXMgYWN0aXZlLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHRvZ2dsZVxuICAgKi9cbiAgdG9nZ2xlVGFiYmFibGVFbGVtZW50c18odG9nZ2xlKSB7XG4gICAgdGhpcy5yb290RWxfLnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbiwgYScpLmZvckVhY2goKGVsKSA9PiB7XG4gICAgICAvLyBEaXNhYmxlIHRhYmJpbmcgdGhyb3VnaCBvcHRpb25zIGlmIGFscmVhZHkgc2VsZWN0ZWQuXG4gICAgICBpZiAoXG4gICAgICAgIGVsLmNsYXNzTGlzdC5jb250YWlucygnaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW9wdGlvbicpICYmXG4gICAgICAgIHRoaXMuaGFzVXNlclNlbGVjdGlvbl9cbiAgICAgICkge1xuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgLTEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsIHRvZ2dsZSA/IDAgOiAtMSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVvcmRlcnMgb3B0aW9ucyBkYXRhIHRvIGFjY291bnQgZm9yIHNjcmFtYmxlZCBvciBpbmNvbXBsZXRlIGRhdGEuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7IUFycmF5PCFJbnRlcmFjdGl2ZU9wdGlvblR5cGU+fSBvcHRpb25zRGF0YVxuICAgKiBAcmV0dXJuIHshQXJyYXk8IUludGVyYWN0aXZlT3B0aW9uVHlwZT59XG4gICAqL1xuICBvcmRlckRhdGFfKG9wdGlvbnNEYXRhKSB7XG4gICAgY29uc3QgbnVtT3B0aW9uRWxlbWVudHMgPSB0aGlzLmdldE9wdGlvbkVsZW1lbnRzKCkubGVuZ3RoO1xuICAgIGNvbnN0IG9yZGVyZWREYXRhID0gbmV3IEFycmF5KG51bU9wdGlvbkVsZW1lbnRzKTtcbiAgICBvcHRpb25zRGF0YS5mb3JFYWNoKChvcHRpb24pID0+IHtcbiAgICAgIGNvbnN0IHtpbmRleH0gPSBvcHRpb247XG4gICAgICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IG51bU9wdGlvbkVsZW1lbnRzKSB7XG4gICAgICAgIG9yZGVyZWREYXRhW2luZGV4XSA9IG9wdGlvbjtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJlZERhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICghb3JkZXJlZERhdGFbaV0pIHtcbiAgICAgICAgb3JkZXJlZERhdGFbaV0gPSB7XG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgc2VsZWN0ZWQ6IGZhbHNlLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvcmRlcmVkRGF0YTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVucyB0aGUgZGlzY2xhaW1lciBkaWFsb2cgYW5kIHBvc2l0aW9ucyBpdCBhY2NvcmRpbmcgdG8gdGhlIHBhZ2UgYW5kIGl0c2VsZi5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9wZW5EaXNjbGFpbWVyXygpIHtcbiAgICBpZiAodGhpcy5kaXNjbGFpbWVyRWxfKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGRpciA9IHRoaXMucm9vdEVsXy5nZXRBdHRyaWJ1dGUoJ2RpcicpIHx8ICdsdHInO1xuICAgIHRoaXMuZGlzY2xhaW1lckVsXyA9IGJ1aWxkSW50ZXJhY3RpdmVEaXNjbGFpbWVyKHRoaXMsIHtkaXJ9KTtcblxuICAgIGxldCBzdHlsZXM7XG4gICAgdGhpcy5tZWFzdXJlTXV0YXRlRWxlbWVudChcbiAgICAgICgpID0+IHtcbiAgICAgICAgLy8gR2V0IHJlY3RzIGFuZCBjYWxjdWxhdGUgcG9zaXRpb24gZnJvbSBpY29uLlxuICAgICAgICBjb25zdCBpbnRlcmFjdGl2ZVJlY3QgPSB0aGlzLmVsZW1lbnQuLypPSyovIGdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCBwYWdlUmVjdCA9IHRoaXMuZ2V0UGFnZUVsKCkuLypPSyovIGdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCBpY29uUmVjdCA9IHRoaXMuZGlzY2xhaW1lckljb25fLi8qT0sqLyBnZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3QgYm90dG9tRnJhY3Rpb24gPVxuICAgICAgICAgIDEgLSAoaWNvblJlY3QueSArIGljb25SZWN0LmhlaWdodCAtIHBhZ2VSZWN0LnkpIC8gcGFnZVJlY3QuaGVpZ2h0O1xuICAgICAgICBjb25zdCB3aWR0aEZyYWN0aW9uID0gaW50ZXJhY3RpdmVSZWN0LndpZHRoIC8gcGFnZVJlY3Qud2lkdGg7XG5cbiAgICAgICAgLy8gQ2xhbXAgdmFsdWVzIHRvIGVuc3VyZSBkaWFsb2cgaGFzIHNwYWNlIHVwIGFuZCBsZWZ0LlxuICAgICAgICBjb25zdCBib3R0b21QZXJjZW50YWdlID0gY2xhbXAoYm90dG9tRnJhY3Rpb24gKiAxMDAsIDAsIDg1KTsgLy8gRW5zdXJlIDE1JSBvZiBzcGFjZSB1cC5cbiAgICAgICAgY29uc3Qgd2lkdGhQZXJjZW50YWdlID0gTWF0aC5tYXgod2lkdGhGcmFjdGlvbiAqIDEwMCwgNjUpOyAvLyBFbnN1cmUgNjUlIG9mIG1heC13aWR0aC5cblxuICAgICAgICBzdHlsZXMgPSB7XG4gICAgICAgICAgJ2JvdHRvbSc6IGJvdHRvbVBlcmNlbnRhZ2UgKyAnJScsXG4gICAgICAgICAgJ21heC13aWR0aCc6IHdpZHRoUGVyY2VudGFnZSArICclJyxcbiAgICAgICAgICAncG9zaXRpb24nOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICd6LWluZGV4JzogMyxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBBbGlnbiBkaXNjbGFpbWVyIHRvIGxlZnQgaWYgUlRMLCBvdGhlcndpc2UgYWxpZ24gdG8gdGhlIHJpZ2h0LlxuICAgICAgICBpZiAoZGlyID09PSAncnRsJykge1xuICAgICAgICAgIGNvbnN0IGxlZnRGcmFjdGlvbiA9IChpY29uUmVjdC54IC0gcGFnZVJlY3QueCkgLyBwYWdlUmVjdC53aWR0aDtcbiAgICAgICAgICBzdHlsZXNbJ2xlZnQnXSA9IGNsYW1wKGxlZnRGcmFjdGlvbiAqIDEwMCwgMCwgMjUpICsgJyUnOyAvLyBFbnN1cmUgNzUlIG9mIHNwYWNlIHRvIHRoZSByaWdodC5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCByaWdodEZyYWN0aW9uID1cbiAgICAgICAgICAgIDEgLSAoaWNvblJlY3QueCArIGljb25SZWN0LndpZHRoIC0gcGFnZVJlY3QueCkgLyBwYWdlUmVjdC53aWR0aDtcbiAgICAgICAgICBzdHlsZXNbJ3JpZ2h0J10gPSBjbGFtcChyaWdodEZyYWN0aW9uICogMTAwLCAwLCAyNSkgKyAnJSc7IC8vIEVuc3VyZSA3NSUgb2Ygc3BhY2UgdG8gdGhlIGxlZnQuXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHNldEltcG9ydGFudFN0eWxlcyhcbiAgICAgICAgICB0aGlzLmRpc2NsYWltZXJFbF8sXG4gICAgICAgICAgYXNzZXJ0RG9lc05vdENvbnRhaW5EaXNwbGF5KHN0eWxlcylcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5nZXRQYWdlRWwoKS5hcHBlbmRDaGlsZCh0aGlzLmRpc2NsYWltZXJFbF8pO1xuICAgICAgICB0aGlzLmRpc2NsYWltZXJJY29uXy5zZXRBdHRyaWJ1dGUoJ2hpZGUnLCAnJyk7XG4gICAgICAgIC8vIEFkZCBjbGljayBsaXN0ZW5lciB0aHJvdWdoIHRoZSBzaGFkb3cgZG9tIHVzaW5nIGUucGF0aC5cbiAgICAgICAgdGhpcy5kaXNjbGFpbWVyRWxfLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBlLnBhdGhbMF0uY2xhc3NMaXN0LmNvbnRhaW5zKFxuICAgICAgICAgICAgICAnaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLWRpc2NsYWltZXItY2xvc2UnXG4gICAgICAgICAgICApXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlRGlzY2xhaW1lcl8oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQ2xvc2VzIHRoZSBkaXNjbGFpbWVyIGRpYWxvZyBpZiBvcGVuLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY2xvc2VEaXNjbGFpbWVyXygpIHtcbiAgICBpZiAoIXRoaXMuZGlzY2xhaW1lckVsXykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLm11dGF0ZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgdGhpcy5kaXNjbGFpbWVyRWxfLnJlbW92ZSgpO1xuICAgICAgdGhpcy5kaXNjbGFpbWVyRWxfID0gbnVsbDtcbiAgICAgIGlmICh0aGlzLmRpc2NsYWltZXJJY29uXykge1xuICAgICAgICB0aGlzLmRpc2NsYWltZXJJY29uXy5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGUnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-story-interactive/0.1/amp-story-interactive-abstract.js