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

import {
  ANALYTICS_TAG_NAME,
  StoryAnalyticsEvent,
  getAnalyticsService,
} from './story-analytics';
import {AnalyticsVariable, getVariableService} from './variable-service';
import {CSS} from '../../../build/amp-story-reaction-1.0.css';
import {Services} from '../../../src/services';
import {StateProperty, getStoreService} from './amp-story-store-service';
import {
  addParamsToUrl,
  appendPathToUrl,
  assertAbsoluteHttpOrHttpsUrl,
} from '../../../src/url';
import {closest} from '../../../src/dom';
import {createShadowRootWithStyle} from './utils';
import {dev, devAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getRequestService} from './amp-story-request-service';
import {toArray} from '../../../src/types';

/** @const {string} */
const TAG = 'amp-story-reaction';

/**
 * @const @enum {number}
 */
export const ReactionType = {
  QUIZ: 0,
  POLL: 1,
};

/** @const {string} */
const ENDPOINT_INVALID_ERROR =
  'The publisher has specified an invalid datastore endpoint';

/**
 * @typedef {{
 *    optionIndex: number,
 *    totalCount: number,
 *    selectedByUser: boolean,
 * }}
 */
export let ReactionOptionType;

/**
 * @typedef {{
 *    options: !Array<ReactionOptionType>,
 * }}
 */
export let ReactionResponseType;

/**
 * @typedef {{
 *    optionIndex: number,
 *    text: string,
 *    correct: ?string
 * }}
 */
export let OptionConfigType;

/**
 * Reaction abstract class with shared functionality for interactive components.
 *
 * Lifecycle:
 * 1) When created, the abstract class will call the buildComponent() method implemented by each concrete class.
 *   NOTE: When created, the component will receive a .i-amphtml-story-reaction, inheriting useful CSS variables.
 *
 * 2) If an endpoint is specified, it will retrieve aggregate results from the backend and process them. If the clientId
 *   has responded in a previous session, the component will change to a post-selection state. Otherwise it will wait
 *   for user selection.
 *   NOTE: Click listeners will be attached to all options, which require .i-amphtml-story-reaction-option.
 *
 * 3) On user selection, it will process the backend results (if endpoint specified) and display the selected option.
 *   Analytic events will be sent, percentages updated (implemented by the concrete class), and backend posted with the
 *   user response. Classes will be added to the component and options accordingly.
 *   NOTE: On option selected, the selection will receive a .i-amphtml-story-reaction-option-selected, and the root element
 *   will receive a .i-amphtml-story-reaction-post-selection. Optionally, if the endpoint returned aggregate results,
 *   the root element will also receive a .i-amphtml-story-reaction-has-data.
 *
 * @abstract
 */
export class AmpStoryReaction extends AMP.BaseElement {
  /**
   * @param {!AmpElement} element
   * @param {!ReactionType} type
   * @param {!Array<number>} bounds the bounds on number of options, inclusive
   */
  constructor(element, type, bounds = [2, 4]) {
    super(element);

    /** @protected @const {ReactionType} */
    this.reactionType_ = type;

    /** @protected @const {!./story-analytics.StoryAnalyticsService} */
    this.analyticsService_ = getAnalyticsService(this.win, element);

    /** @protected {?Promise<?ReactionResponseType|?JsonObject|undefined>} */
    this.backendDataPromise_ = null;

    /** @protected {?Promise<!../../../src/service/cid-impl.CidDef>} */
    this.clientIdService_ = Services.cidForDoc(this.element);

    /** @protected {?Promise<JsonObject>} */
    this.clientIdPromise_ = null;

    /** @protected {boolean} */
    this.hasUserSelection_ = false;

    /** @private {!Array<number>} min and max number of options, inclusive */
    this.optionBounds_ = bounds;

    /** @private {?Array<!Element>} */
    this.optionElements_ = null;

    /** @protected {?Array<!OptionConfigType>} */
    this.options_ = null;

    /** @protected {?Array<!ReactionOptionType>} */
    this.optionsData_ = null;

    /** @protected {?Element} */
    this.rootEl_ = null;

    /** @protected {?string} */
    this.reactionId_ = null;

    /** @protected {!./amp-story-request-service.AmpStoryRequestService} */
    this.requestService_ = getRequestService(this.win, this.element);

    /** @const @protected {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win);

    /** @protected {../../../src/service/url-impl.Url} */
    this.urlService_ = Services.urlForDoc(this.element);

    /** @const @protected {!./variable-service.AmpStoryVariableService} */
    this.variableService_ = getVariableService(this.win);
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
        this.rootEl_.querySelectorAll('.i-amphtml-story-reaction-option')
      );
    }
    return this.optionElements_;
  }

  /** @override */
  buildCallback(concreteCSS = '') {
    this.options_ = this.parseOptions_();
    this.rootEl_ = this.buildComponent();
    this.rootEl_.classList.add('i-amphtml-story-reaction');
    this.element.classList.add('i-amphtml-story-reaction-component');
    this.adjustGridLayer_();
    this.initializeListeners_();
    devAssert(this.element.children.length == 0, 'Too many children');
    createShadowRootWithStyle(
      this.element,
      dev().assertElement(this.rootEl_),
      CSS + concreteCSS
    );
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
      if (attr.name.match(/^option-\d+-\w+$/)) {
        const splitParts = attr.name.split('-');
        const optionNumber = parseInt(splitParts[1], 10);
        // Add all options in order on the array with correct index.
        while (options.length < optionNumber) {
          options.push({'optionIndex': options.length});
        }
        options[optionNumber - 1][splitParts[2]] = attr.value;
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
    return (this.backendDataPromise_ = this.element.hasAttribute('endpoint')
      ? this.retrieveReactionData_()
      : Promise.resolve());
  }

  /**
   * Gets a Promise to return the unique AMP clientId
   * @private
   * @return {Promise<string>}
   */
  getClientId_() {
    if (!this.clientIdPromise_) {
      this.clientIdPromise_ = this.clientIdService_.then((data) => {
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

    gridLayer.classList.add('i-amphtml-story-has-reaction');

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
    // Add a listener for changes in the RTL state
    this.storeService_.subscribe(
      StateProperty.RTL_STATE,
      (rtlState) => {
        this.onRtlStateUpdate_(rtlState);
      },
      true /** callToInitialize */
    );

    // Add a click listener to the element to trigger the class change
    this.rootEl_.addEventListener('click', (e) => this.handleTap_(e));
  }

  /**
   * Handles a tap event on the quiz element.
   * @param {Event} e
   * @private
   */
  handleTap_(e) {
    if (this.hasUserSelection_) {
      return;
    }

    const optionEl = closest(
      dev().assertElement(e.target),
      (element) => {
        return element.classList.contains('i-amphtml-story-reaction-option');
      },
      this.rootEl_
    );

    if (optionEl) {
      this.handleOptionSelection_(optionEl);
    }
  }

  /**
   * Triggers the analytics event for quiz response.
   *
   * @param {!Element} optionEl
   * @private
   */
  triggerAnalytics_(optionEl) {
    this.variableService_.onVariableUpdate(
      AnalyticsVariable.STORY_REACTION_ID,
      this.element.getAttribute('id')
    );
    this.variableService_.onVariableUpdate(
      AnalyticsVariable.STORY_REACTION_RESPONSE,
      optionEl.optionIndex_
    );
    this.variableService_.onVariableUpdate(
      AnalyticsVariable.STORY_REACTION_TYPE,
      this.reactionType_
    );

    this.element[ANALYTICS_TAG_NAME] = this.element.tagName;
    this.analyticsService_.triggerEvent(
      StoryAnalyticsEvent.REACTION,
      this.element
    );
  }

  /**
   * Update component to reflect values in the data obtained.
   * Called when user has responded (in this session or before).
   *
   * @protected @abstract
   * @param {!Array<!ReactionOptionType>} unusedOptionsData
   */
  updateOptionPercentages_(unusedOptionsData) {
    // Subclass must implement
  }

  /**
   * Preprocess the percentages for display.
   *
   * @param {!Array<!ReactionOptionType>} optionsData
   * @return {Array<number>}
   * @protected
   */
  preprocessPercentages_(optionsData) {
    const totalResponseCount = optionsData.reduce(
      (acc, response) => acc + response['totalCount'],
      0
    );

    let percentages = optionsData.map((e) =>
      ((100 * e['totalCount']) / totalResponseCount).toFixed(2)
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
   * Triggers changes to component state on response interaction.
   *
   * @param {!Element} optionEl
   * @private
   */
  handleOptionSelection_(optionEl) {
    this.backendDataPromise_
      .then(() => {
        if (this.hasUserSelection_) {
          return;
        }

        this.triggerAnalytics_(optionEl);
        this.hasUserSelection_ = true;

        if (this.optionsData_) {
          this.optionsData_[optionEl.optionIndex_]['totalCount']++;
          this.optionsData_[optionEl.optionIndex_]['selectedByUser'] = true;
        }

        this.mutateElement(() => {
          if (this.optionsData_) {
            this.updateOptionPercentages_(this.optionsData_);
          }
          this.updateToPostSelectionState_(optionEl);
        });

        if (this.element.hasAttribute('endpoint')) {
          this.executeReactionRequest_('POST', optionEl.optionIndex_);
        }
      })
      .catch(() => {
        // If backend is not properly connected, still update state.
        this.triggerAnalytics_(optionEl);
        this.hasUserSelection_ = true;
        this.mutateElement(() => {
          this.updateToPostSelectionState_(optionEl);
        });
      });
  }

  /**
   * Get the Reaction data from the datastore
   *
   * @return {?Promise<?ReactionResponseType|?JsonObject|undefined>}
   * @private
   */
  retrieveReactionData_() {
    return this.executeReactionRequest_('GET').then((response) => {
      this.handleSuccessfulDataRetrieval_(
        /** @type {ReactionResponseType} */ (response)
      );
    });
  }

  /**
   * Executes a Reactions API call.
   *
   * @param {string} method GET or POST.
   * @param {number=} optionSelected
   * @return {!Promise<!ReactionResponseType|string>}
   * @private
   */
  executeReactionRequest_(method, optionSelected = undefined) {
    let url = this.element.getAttribute('endpoint');
    if (!assertAbsoluteHttpOrHttpsUrl(url)) {
      return Promise.reject(ENDPOINT_INVALID_ERROR);
    }

    if (!this.reactionId_) {
      const pageId = closest(dev().assertElement(this.element), (el) => {
        return el.tagName.toLowerCase() === 'amp-story-page';
      }).getAttribute('id');
      this.reactionId_ = `CANONICAL_URL+${pageId}`;
    }

    return this.getClientId_().then((clientId) => {
      const requestOptions = {'method': method};
      const requestParams = dict({
        'reactionType': this.reactionType_,
        'clientId': clientId,
      });
      url = appendPathToUrl(
        this.urlService_.parse(url),
        dev().assertString(this.reactionId_)
      );
      if (requestOptions['method'] === 'POST') {
        requestOptions['body'] = {'optionSelected': optionSelected};
        requestOptions['headers'] = {'Content-Type': 'application/json'};
        url = appendPathToUrl(this.urlService_.parse(url), '/react');
      }
      url = addParamsToUrl(url, requestParams);
      return this.requestService_
        .executeRequest(url, requestOptions)
        .catch((err) => dev().error(TAG, err));
    });
  }

  /**
   * Handles incoming reaction data response
   *
   * RESPONSE FORMAT
   * {
   *  options: [
   *    {
   *      optionIndex:
   *      totalCount:
   *      selectedByUser:
   *    },
   *    ...
   *  ]
   * }
   * @param {ReactionResponseType|undefined} response
   * @private
   */
  handleSuccessfulDataRetrieval_(response) {
    if (!(response && response['options'])) {
      devAssert(
        response && 'options' in response,
        `Invalid reaction response, expected { data: ReactionResponseType, ...} but received ${response}`
      );
      dev().error(
        TAG,
        `Invalid reaction response, expected { data: ReactionResponseType, ...} but received ${response}`
      );
      return;
    }
    const numOptions = this.rootEl_.querySelectorAll(
      '.i-amphtml-story-reaction-option'
    ).length;
    // Only keep the visible options to ensure visible percentages add up to 100.
    this.updateReactionOnDataRetrieval_(
      response['options'].slice(0, numOptions)
    );
  }

  /**
   * Updates the quiz to reflect the state of the remote data.
   * @param {!Array<ReactionOptionType>} data
   * @private
   */
  updateReactionOnDataRetrieval_(data) {
    const options = this.rootEl_.querySelectorAll(
      '.i-amphtml-story-reaction-option'
    );

    this.optionsData_ = data;
    data.forEach((response, index) => {
      if (response.selectedByUser) {
        this.hasUserSelection_ = true;
        this.mutateElement(() => {
          this.updateOptionPercentages_(data);
          this.updateToPostSelectionState_(options[index]);
        });
      }
    });
  }

  /**
   * Updates the selected classes on option selected.
   * @param {!Element} selectedOption
   * @private
   */
  updateToPostSelectionState_(selectedOption) {
    this.rootEl_.classList.add('i-amphtml-story-reaction-post-selection');
    selectedOption.classList.add('i-amphtml-story-reaction-option-selected');

    if (this.optionsData_) {
      this.rootEl_.classList.add('i-amphtml-story-reaction-has-data');
    }
  }
}
