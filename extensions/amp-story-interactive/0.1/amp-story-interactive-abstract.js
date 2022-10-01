import {closest} from '#core/dom/query';
import {assertDoesNotContainDisplay, setImportantStyles} from '#core/dom/style';
import {clamp} from '#core/math';
import {toArray} from '#core/types/array';
import {base64UrlEncodeFromString} from '#core/types/string/base64';

import {isExperimentOn} from '#experiments/';

import {Services} from '#service';

import {dev, devAssert} from '#utils/log';

import {executeRequest} from 'extensions/amp-story/1.0/request-utils';
import {installStylesForDoc} from 'src/style-installer';

import {emojiConfetti} from './interactive-confetti';
import {
  buildInteractiveDisclaimer,
  buildInteractiveDisclaimerIcon,
} from './interactive-disclaimer';
import {deduplicateInteractiveIds} from './utils';

import {CSS as hostCss} from '../../../build/amp-story-interactive-host-0.1.css';
import {CSS as shadowCss} from '../../../build/amp-story-interactive-shadow-0.1.css';
import {addParamsToUrl, appendPathToUrl} from '../../../src/url';
import {
  Action,
  StateProperty,
} from '../../amp-story/1.0/amp-story-store-service';
import {
  ANALYTICS_TAG_NAME,
  StoryAnalyticsEvent,
} from '../../amp-story/1.0/story-analytics';
import {
  createShadowRootWithStyle,
  maybeMakeProxyUrl,
} from '../../amp-story/1.0/utils';
import {AnalyticsVariable} from '../../amp-story/1.0/variable-service';

/** @const {string} */
const TAG = 'amp-story-interactive';

/** @const {string} */
export const MID_SELECTION_CLASS = 'i-amphtml-story-interactive-mid-selection';
/** @const {string} */
export const POST_SELECTION_CLASS =
  'i-amphtml-story-interactive-post-selection';

/**
 * @const @enum {number}
 */
export const InteractiveType = {
  QUIZ: 0,
  POLL: 1,
  RESULTS: 2,
  SLIDER: 3,
};

/** @const {string} */
const ENDPOINT_INVALID_ERROR =
  'The publisher has specified an invalid datastore endpoint';

/** @const {string} */
const INTERACTIVE_ACTIVE_CLASS = 'i-amphtml-story-interactive-active';

/**
 * @typedef {{
 *    index: number,
 *    count: number,
 *    selected: boolean,
 * }}
 */
export let InteractiveOptionType;

/**
 * @typedef {{
 *    options: !Array<InteractiveOptionType>,
 * }}
 */
export let InteractiveResponseType;

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
export let OptionConfigType;

/** @const {Array<Object>} fontFaces with urls from https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&amp;display=swap */
const fontsToLoad = [
  {
    family: 'Poppins',
    weight: '400',
    src: "url(https://fonts.gstatic.com/s/poppins/v9/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2) format('woff2')",
  },
  {
    family: 'Poppins',
    weight: '700',
    src: "url(https://fonts.gstatic.com/s/poppins/v9/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.woff2) format('woff2')",
  },
];

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
export class AmpStoryInteractive extends AMP.BaseElement {
  /**
   * @param {!AmpElement} element
   * @param {!InteractiveType} type
   * @param {!Array<number>} bounds the bounds on number of options, inclusive
   */
  constructor(element, type, bounds = [2, 4]) {
    super(element);

    /** @protected @const {InteractiveType} */
    this.interactiveType_ = type;

    /** @protected {?../../amp-story/1.0/story-analytics.StoryAnalyticsService} */
    this.analyticsService_ = null;

    /** @protected {?Promise<?InteractiveResponseType|?JsonObject|undefined>} */
    this.backendDataPromise_ = null;

    /** @protected {?Promise<JsonObject>} */
    this.clientIdPromise_ = null;

    /** @private {?Element} the disclaimer dialog if open, null if closed */
    this.disclaimerEl_ = null;

    /** @private {?Element} */
    this.disclaimerIcon_ = null;

    /** @protected {boolean} */
    this.hasUserSelection_ = false;

    /** @private {!Array<number>} min and max number of options, inclusive */
    this.optionBounds_ = bounds;

    /** @private {?Array<!Element>} DOM elements that have the i-amphtml-story-interactive-option class */
    this.optionElements_ = null;

    /** @protected {?Array<!OptionConfigType>} option config values from attributes (text, correct...) */
    this.options_ = null;

    /** @protected {?Array<!InteractiveOptionType>} retrieved results from the backend */
    this.optionsData_ = null;

    /** @private {?Element} the page element the component is on */
    this.pageEl_ = null;

    /** @protected {?Element} */
    this.rootEl_ = null;

    /** @public {../../../src/service/localizationService} */
    this.localizationService = null;

    /** @protected {?../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    /** @protected {?../../../src/service/url-impl.Url} */
    this.urlService_ = null;

    /** @protected {?../../amp-story/1.0/variable-service.AmpStoryVariableService} */
    this.variableService_ = null;

    // We install host CSS directly instead of during `registerElement` since
    // components with different names extend from this class. As such, we'd
    // unnnecessarily install the same styles once for each type of inheriting
    // component present on the page.
    // Instead, we ensure that we only install once by preserving the extension
    // name "amp-story-interactive".
    installStylesForDoc(
      this.getAmpDoc(),
      hostCss,
      /* whenReady */ null,
      /* isRuntimeCss */ false,
      /* ext */ TAG
    );
  }

  /**
   * Gets the root element.
   * @visibleForTesting
   * @return {?Element}
   */
  getRootElement() {
    return this.rootEl_;
  }

  /**
   * Gets the options.
   * @protected
   * @return {!Array<!Element>}
   */
  getOptionElements() {
    if (!this.optionElements_) {
      this.optionElements_ = toArray(
        this.rootEl_.querySelectorAll('.i-amphtml-story-interactive-option')
      );
    }
    return this.optionElements_;
  }

  /**
   * Gets the interactive ID
   * @private
   * @return {string}
   */
  getInteractiveId_() {
    if (!AmpStoryInteractive.canonicalUrl64) {
      deduplicateInteractiveIds(this.win.document);
      AmpStoryInteractive.canonicalUrl64 = base64UrlEncodeFromString(
        Services.documentInfoForDoc(this.element).canonicalUrl
      );
    }
    return `${AmpStoryInteractive.canonicalUrl64}+${this.element.id}`;
  }

  /**
   * @protected
   * @return {Element} the page element
   */
  getPageEl() {
    if (this.pageEl_ == null) {
      this.pageEl_ = closest(dev().assertElement(this.element), (el) => {
        return el.tagName.toLowerCase() === 'amp-story-page';
      });
    }
    return this.pageEl_;
  }

  /** @override */
  buildCallback(concreteCSS = '') {
    this.options_ = this.parseOptions_();
    this.element.classList.add('i-amphtml-story-interactive-component');
    this.adjustGridLayer_();
    devAssert(this.element.children.length == 0, 'Too many children');

    // Initialize all the services before proceeding, and update store with state
    this.urlService_ = Services.urlForDoc(this.element);
    return Promise.all([
      Services.storyVariableServiceForOrNull(this.win).then((service) => {
        this.variableService_ = service;
      }),
      Services.storyStoreServiceForOrNull(this.win).then((service) => {
        this.storeService_ = service;
        this.updateStoryStoreState_(null);
      }),
      Services.storyAnalyticsServiceForOrNull(this.win).then((service) => {
        this.analyticsService_ = service;
      }),
      Services.localizationServiceForOrNull(this.element).then((service) => {
        this.localizationService = service;
      }),
    ]).then(() => {
      this.rootEl_ = this.buildComponent();
      this.rootEl_.classList.add('i-amphtml-story-interactive-container');
      if (
        isExperimentOn(this.win, 'amp-story-interactive-disclaimer') &&
        this.element.hasAttribute('endpoint')
      ) {
        this.disclaimerIcon_ = buildInteractiveDisclaimerIcon(this);
        this.rootEl_.prepend(this.disclaimerIcon_);
      }
      createShadowRootWithStyle(
        this.element,
        dev().assertElement(this.rootEl_),
        shadowCss + concreteCSS
      );
      return Promise.resolve();
    });
  }

  /** @private */
  loadFonts_() {
    if (
      !AmpStoryInteractive.loadedFonts &&
      this.win.document.fonts &&
      FontFace
    ) {
      fontsToLoad.forEach(({family, src, style = 'normal', weight}) =>
        new FontFace(family, src, {weight, style})
          .load()
          .then((font) => this.win.document.fonts.add(font))
      );
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
  parseOptions_() {
    const options = [];
    toArray(this.element.attributes).forEach((attr) => {
      // Match 'option-#-type' (eg: option-1-text, option-2-image, option-3-correct...)
      if (attr.name.match(/^option-\d+(-\w+)+$/)) {
        const splitParts = attr.name.split('-');
        const optionNumber = parseInt(splitParts[1], 10);
        // Add all options in order on the array with correct index.
        while (options.length < optionNumber) {
          options.push({'optionIndex': options.length});
        }
        const key = splitParts.slice(2).join('');
        if (key === 'image') {
          options[optionNumber - 1][key] = maybeMakeProxyUrl(
            attr.value,
            this.getAmpDoc()
          );
        } else {
          options[optionNumber - 1][key] = attr.value;
        }
      }
    });
    if (
      options.length >= this.optionBounds_[0] &&
      options.length <= this.optionBounds_[1]
    ) {
      return options;
    }
    devAssert(
      options.length >= this.optionBounds_[0] &&
        options.length <= this.optionBounds_[1],
      `Improper number of options. Expected ${this.optionBounds_[0]} <= options <= ${this.optionBounds_[1]} but got ${options.length}.`
    );
    dev().error(
      TAG,
      `Improper number of options. Expected ${this.optionBounds_[0]} <= options <= ${this.optionBounds_[1]} but got ${options.length}.`
    );
  }

  /**
   * Finds the prompt and adds it to the prompt-container
   *
   * @protected
   * @param {Element} root
   */
  attachPrompt_(root) {
    const promptContainer = root.querySelector(
      '.i-amphtml-story-interactive-prompt-container'
    );

    if (!this.element.hasAttribute('prompt-text')) {
      this.rootEl_.removeChild(promptContainer);
    } else {
      const prompt = document.createElement('p');
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
  buildComponent() {
    // Subclass must override.
  }

  /** @override */
  layoutCallback() {
    this.loadFonts_();
    this.initializeListeners_();
    return (this.backendDataPromise_ = this.element.hasAttribute('endpoint')
      ? this.retrieveInteractiveData_()
      : Promise.resolve());
  }

  /**
   * Gets a Promise to return the unique AMP clientId
   * @private
   * @return {Promise<string>}
   */
  getClientId_() {
    if (!this.clientIdPromise_) {
      this.clientIdPromise_ = Services.cidForDoc(this.element).then((data) => {
        return data.get(
          {scope: 'amp-story', createCookieIfNotPresent: true},
          /* consent */ Promise.resolve()
        );
      });
    }
    return this.clientIdPromise_;
  }

  /**
   * Reacts to RTL state updates and triggers the UI for RTL.
   * @param {boolean} rtlState
   * @private
   */
  onRtlStateUpdate_(rtlState) {
    this.mutateElement(() => {
      rtlState
        ? this.rootEl_.setAttribute('dir', 'rtl')
        : this.rootEl_.removeAttribute('dir');
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === 'container';
  }

  /**
   * Add classes to adjust the bottom padding on the grid-layer
   * to prevent overlap with the component.
   *
   * @private
   */
  adjustGridLayer_() {
    const gridLayer = closest(dev().assertElement(this.element), (el) => {
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
  initializeListeners_() {
    this.storeService_.subscribe(
      StateProperty.RTL_STATE,
      (rtlState) => {
        this.onRtlStateUpdate_(rtlState);
      },
      true /** callToInitialize */
    );

    // Check if the component page is active, and add class.
    this.storeService_.subscribe(
      StateProperty.CURRENT_PAGE_ID,
      (currPageId) => {
        this.mutateElement(() => {
          const toggle = currPageId === this.getPageEl().getAttribute('id');
          this.rootEl_.classList.toggle(INTERACTIVE_ACTIVE_CLASS, toggle);
          this.toggleTabbableElements_(toggle);
        });
        this.closeDisclaimer_();
      },
      true /** callToInitialize */
    );

    this.rootEl_.addEventListener('click', (e) => this.handleTap_(e));
  }

  /**
   * Handles a tap event on the quiz element.
   * @param {Event} e
   * @protected
   */
  handleTap_(e) {
    if (e.target == this.disclaimerIcon_ && !this.disclaimerEl_) {
      this.openDisclaimer_();
      return;
    }

    if (this.hasUserSelection_) {
      return;
    }

    const optionEl = closest(
      dev().assertElement(e.target),
      (element) => {
        return element.classList.contains('i-amphtml-story-interactive-option');
      },
      this.rootEl_
    );

    if (optionEl) {
      this.updateStoryStoreState_(optionEl.optionIndex_);
      this.handleOptionSelection_(optionEl.optionIndex_, optionEl);
      const confettiEmoji = this.options_[optionEl.optionIndex_].confetti;
      if (confettiEmoji) {
        emojiConfetti(
          dev().assertElement(this.rootEl_),
          this.win,
          confettiEmoji
        );
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
  triggerAnalytics_(optionIndex) {
    this.variableService_.onVariableUpdate(
      AnalyticsVariable.STORY_INTERACTIVE_ID,
      this.element.getAttribute('id')
    );
    this.variableService_.onVariableUpdate(
      AnalyticsVariable.STORY_INTERACTIVE_RESPONSE,
      optionIndex
    );
    this.variableService_.onVariableUpdate(
      AnalyticsVariable.STORY_INTERACTIVE_TYPE,
      this.interactiveType_
    );

    this.element[ANALYTICS_TAG_NAME] = this.element.tagName;
    this.analyticsService_.triggerEvent(
      StoryAnalyticsEvent.INTERACTIVE,
      this.element
    );
  }

  /**
   * Update component to reflect values in the data obtained.
   * Called when user has responded (in this session or before).
   *
   * @protected @abstract
   * @param {!Array<!InteractiveOptionType>} unusedOptionsData
   */
  displayOptionsData(unusedOptionsData) {
    // Subclass must implement
  }

  /**
   * Preprocess the percentages for display.
   *
   * @param {!Array<!InteractiveOptionType>} optionsData
   * @return {Array<number>}
   * @protected
   */
  preprocessPercentages_(optionsData) {
    const totalResponseCount = optionsData.reduce(
      (acc, response) => acc + response['count'],
      0
    );

    let percentages = optionsData.map((e) =>
      ((100 * e['count']) / totalResponseCount).toFixed(2)
    );
    let total = percentages.reduce((acc, x) => acc + Math.round(x), 0);

    // Special case: divide remainders by three if they break 100,
    // 3 is the maximum above 100 the remainders can add.
    if (total > 100) {
      percentages = percentages.map((percentage) =>
        (percentage - (2 * (percentage - Math.floor(percentage))) / 3).toFixed(
          2
        )
      );
      total = percentages.reduce((acc, x) => (acc += Math.round(x)), 0);
    }

    if (total === 100) {
      return percentages.map((percentage) => Math.round(percentage));
    }

    // Truncate all and round up those with the highest remainders,
    // preserving order and ties and adding to 100 (if possible given ties and ordering).
    let remainder = 100 - total;

    let preserveOriginal = percentages.map((percentage, index) => {
      return {
        originalIndex: index,
        value: percentage,
        remainder: (percentage - Math.floor(percentage)).toFixed(2),
      };
    });
    preserveOriginal.sort(
      (left, right) =>
        // Break remainder ties using the higher value.
        right.remainder - left.remainder || right.value - left.value
    );

    const finalPercentages = [];
    while (remainder > 0 && preserveOriginal.length !== 0) {
      const highestRemainderObj = preserveOriginal[0];

      const ties = preserveOriginal.filter(
        (percentageObj) => percentageObj.value === highestRemainderObj.value
      );
      preserveOriginal = preserveOriginal.filter(
        (percentageObj) => percentageObj.value !== highestRemainderObj.value
      );

      const toRoundUp =
        ties.length <= remainder && highestRemainderObj.remainder !== '0.00';

      ties.forEach((percentageObj) => {
        finalPercentages[percentageObj.originalIndex] =
          Math.floor(percentageObj.value) + (toRoundUp ? 1 : 0);
      });

      // Update the remainder given additions to the percentages.
      remainder -= toRoundUp ? ties.length : 0;
    }

    preserveOriginal.forEach((percentageObj) => {
      finalPercentages[percentageObj.originalIndex] = Math.floor(
        percentageObj.value
      );
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
  handleOptionSelection_(optionIndex, optionEl) {
    this.backendDataPromise_
      .then(() => {
        if (this.hasUserSelection_) {
          return;
        }

        this.triggerAnalytics_(optionIndex);
        this.hasUserSelection_ = true;

        if (this.optionsData_) {
          this.optionsData_[optionIndex]['count']++;
          this.optionsData_[optionIndex]['selected'] = true;
        }

        this.mutateElement(() => {
          this.updateToPostSelectionState_(optionEl);
        });

        if (this.element.hasAttribute('endpoint')) {
          this.executeInteractiveRequest_('POST', optionIndex);
        }
      })
      .catch(() => {
        // If backend is not properly connected, still update state.
        this.triggerAnalytics_(optionIndex);
        this.hasUserSelection_ = true;
        this.mutateElement(() => {
          this.updateToPostSelectionState_(optionEl);
        });
      });
  }

  /**
   * Get the Interactive data from the datastore
   *
   * @return {?Promise<?InteractiveResponseType|?JsonObject|undefined>}
   * @private
   */
  retrieveInteractiveData_() {
    return this.executeInteractiveRequest_('GET').then((response) => {
      this.onDataRetrieved_(/** @type {InteractiveResponseType} */ (response));
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
  executeInteractiveRequest_(method, optionSelected = undefined) {
    let url = this.element.getAttribute('endpoint');
    if (!Services.urlForDoc(this.element).assertAbsoluteHttpOrHttpsUrl(url)) {
      return Promise.reject(ENDPOINT_INVALID_ERROR);
    }

    return this.getClientId_().then((clientId) => {
      const requestOptions = {'method': method};
      const requestParams = {
        'type': this.interactiveType_,
        'client': clientId,
      };
      url = appendPathToUrl(
        this.urlService_.parse(url),
        this.getInteractiveId_()
      );
      if (requestOptions['method'] === 'POST') {
        requestOptions['body'] = {'option_selected': optionSelected};
        requestOptions['headers'] = {'Content-Type': 'application/json'};
        url = appendPathToUrl(this.urlService_.parse(url), ':vote');
      }
      url = addParamsToUrl(url, requestParams);
      return executeRequest(this.element, url, requestOptions).catch((err) =>
        dev().error(TAG, err)
      );
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
  onDataRetrieved_(response) {
    if (!(response && response['options'])) {
      devAssert(
        response && 'options' in response,
        `Invalid interactive response, expected { data: InteractiveResponseType, ...} but received ${response}`
      );
      dev().error(
        TAG,
        `Invalid interactive response, expected { data: InteractiveResponseType, ...} but received ${response}`
      );
      return;
    }
    const numOptions = this.getNumberOfOptions();
    // Only keep the visible options to ensure visible percentages add up to 100.
    this.updateComponentWithData(response['options'].slice(0, numOptions));
  }

  /**
   * Updates the quiz to reflect the state of the remote data.
   * @param {!Array<InteractiveOptionType>} data
   * @protected
   */
  updateComponentWithData(data) {
    const options = this.rootEl_.querySelectorAll(
      '.i-amphtml-story-interactive-option'
    );

    this.optionsData_ = this.orderData_(data);
    this.optionsData_.forEach((response) => {
      if (response.selected) {
        this.hasUserSelection_ = true;
        this.updateStoryStoreState_(response.index);
        this.mutateElement(() => {
          this.updateToPostSelectionState_(options[response.index]);
        });
      }
    });
  }

  /**
   * Updates the selected classes on component and option selected.
   * @param {?Element} selectedOption
   * @protected
   */
  updateToPostSelectionState_(selectedOption) {
    this.rootEl_.classList.add(POST_SELECTION_CLASS);
    if (selectedOption != null) {
      selectedOption.classList.add(
        'i-amphtml-story-interactive-option-selected'
      );
    }

    if (this.optionsData_) {
      this.rootEl_.classList.add('i-amphtml-story-interactive-has-data');
      this.displayOptionsData(this.optionsData_);
    }
    this.getOptionElements().forEach((el) => {
      el.setAttribute('tabindex', -1);
    });
  }

  /**
   * @public
   * @param {?number} option
   */
  updateStoryStoreState_(option = null) {
    const update = {
      option: option != null ? this.options_[option] : null,
      interactiveId: this.getInteractiveId_(),
      type: this.interactiveType_,
    };
    this.storeService_.dispatch(Action.ADD_INTERACTIVE_REACT, update);
  }

  /**
   * Toggles the tabbable elements (buttons, links, etc) to only reach them when page is active.
   * @param {boolean} toggle
   */
  toggleTabbableElements_(toggle) {
    this.rootEl_.querySelectorAll('button, a, input').forEach((el) => {
      // Disable tabbing through options if already selected.
      if (
        el.classList.contains('i-amphtml-story-interactive-option') &&
        this.hasUserSelection_
      ) {
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
  getNumberOfOptions() {
    return this.getOptionElements().length;
  }

  /**
   * Reorders options data to account for scrambled or incomplete data.
   *
   * @private
   * @param {!Array<!InteractiveOptionType>} optionsData
   * @return {!Array<!InteractiveOptionType>}
   */
  orderData_(optionsData) {
    const numOptionElements = this.getNumberOfOptions();
    const orderedData = new Array(numOptionElements);
    optionsData.forEach((option) => {
      const {index} = option;
      if (index >= 0 && index < numOptionElements) {
        orderedData[index] = option;
      }
    });

    for (let i = 0; i < orderedData.length; i++) {
      if (!orderedData[i]) {
        orderedData[i] = {
          count: 0,
          index: i,
          selected: false,
        };
      }
    }

    return orderedData;
  }

  /**
   * Opens the disclaimer dialog and positions it according to the page and itself.
   * @private
   */
  openDisclaimer_() {
    if (this.disclaimerEl_) {
      return;
    }
    const dir = this.rootEl_.getAttribute('dir') || 'ltr';
    this.disclaimerEl_ = buildInteractiveDisclaimer(this, {dir});

    let styles;
    this.measureMutateElement(
      () => {
        // Get rects and calculate position from icon.
        const interactiveRect = this.element./*OK*/ getBoundingClientRect();
        const pageRect = this.getPageEl()./*OK*/ getBoundingClientRect();
        const iconRect = this.disclaimerIcon_./*OK*/ getBoundingClientRect();
        const bottomFraction =
          1 - (iconRect.y + iconRect.height - pageRect.y) / pageRect.height;
        const widthFraction = interactiveRect.width / pageRect.width;

        // Clamp values to ensure dialog has space up and left.
        const bottomPercentage = clamp(bottomFraction * 100, 0, 85); // Ensure 15% of space up.
        const widthPercentage = Math.max(widthFraction * 100, 65); // Ensure 65% of max-width.

        styles = {
          'bottom': bottomPercentage + '%',
          'max-width': widthPercentage + '%',
          'position': 'absolute',
          'z-index': 3,
        };

        // Align disclaimer to left if RTL, otherwise align to the right.
        if (dir === 'rtl') {
          const leftFraction = (iconRect.x - pageRect.x) / pageRect.width;
          styles['left'] = clamp(leftFraction * 100, 0, 25) + '%'; // Ensure 75% of space to the right.
        } else {
          const rightFraction =
            1 - (iconRect.x + iconRect.width - pageRect.x) / pageRect.width;
          styles['right'] = clamp(rightFraction * 100, 0, 25) + '%'; // Ensure 75% of space to the left.
        }
      },
      () => {
        setImportantStyles(
          this.disclaimerEl_,
          assertDoesNotContainDisplay(styles)
        );
        this.getPageEl().appendChild(this.disclaimerEl_);
        this.disclaimerIcon_.setAttribute('hide', '');
        // Add click listener through the shadow dom using e.path.
        this.disclaimerEl_.addEventListener('click', (e) => {
          if (
            e.path[0].classList.contains(
              'i-amphtml-story-interactive-disclaimer-close'
            )
          ) {
            this.closeDisclaimer_();
          }
        });
      }
    );
  }

  /**
   * Closes the disclaimer dialog if open.
   * @private
   */
  closeDisclaimer_() {
    if (!this.disclaimerEl_) {
      return;
    }
    this.mutateElement(() => {
      this.disclaimerEl_.remove();
      this.disclaimerEl_ = null;
      if (this.disclaimerIcon_) {
        this.disclaimerIcon_.removeAttribute('hide');
      }
    });
  }
}
