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
import {addParamsToUrl, assertAbsoluteHttpOrHttpsUrl} from '../../../src/url';
import {closest} from '../../../src/dom';
import {createShadowRootWithStyle} from './utils';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getRequestService} from './amp-story-request-service';

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
 *    reactionValue: number,
 *    totalCount: number,
 *    selectedByUser: boolean,
 * }}
 */
export let ReactionOptionType;

/**
 * @typedef {{
 *    totalResponseCount: number,
 *    hasUserResponded: boolean,
 *    responses: !Array<ReactionOptionType>,
 * }}
 */
export let ReactionResponseType;

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
   */
  constructor(element, type) {
    super(element);

    /** @protected @const {ReactionType} */
    this.reactionType_ = type;

    /** @protected @const {!./story-analytics.StoryAnalyticsService} */
    this.analyticsService_ = getAnalyticsService(this.win, element);

    /** @protected {?Promise<!../../../src/service/cid-impl.CidDef>} */
    this.clientIdService_ = Services.cidForDoc(this.element);

    /** @protected {?Promise<JsonObject>} */
    this.clientIdPromise_ = null;

    /** @protected {boolean} */
    this.hasUserSelection_ = false;

    /** @protected {!Element} */
    this.rootEl_;

    /** @protected {?string} */
    this.reactionId_ = null;

    /** @protected {!./amp-story-request-service.AmpStoryRequestService} */
    this.requestService_ = getRequestService(this.win, this.element);

    /** @protected {?Promise<?ReactionResponseType|?JsonObject|undefined>} */
    this.responseDataPromise_ = null;

    /** @protected {?ReactionResponseType} */
    this.responseData_ = null;

    /** @const @protected {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win);

    /** @const @protected {!./variable-service.AmpStoryVariableService} */
    this.variableService_ = getVariableService(this.win);
  }

  /** @override */
  buildCallback() {
    this.buildComponent(this.element);
    this.element.classList.add('i-amphtml-story-reaction');
    this.adjustGridLayer_();
    this.initializeListeners_();
    createShadowRootWithStyle(this.element, this.rootEl_, CSS);
  }

  /**
   * Generates the template in rootEl_ and fills up with options.
   * @param {!Element} unusedElement
   * @protected @abstract
   */
  buildComponent(unusedElement) {
    // Subclass must override.
  }

  /** @override */
  layoutCallback() {
    return (this.responseDataPromise_ = this.element.hasAttribute('endpoint')
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
   * @param {!ReactionResponseType} unusedResponseData
   */
  updateOptionPercentages_(unusedResponseData) {
    // Subclass must implement
  }

  /**
   * Preprocess the percentages for display.
   *
   * @param {ReactionResponseType} responseData
   * @return {Array<number>}
   * @protected
   */
  preprocessPercentages_(responseData) {
    let percentages = [];

    for (let i = 0; i < responseData['responses'].length; i++) {
      percentages[i] = (
        100 *
        (responseData['responses'][i]['totalCount'] /
          responseData['totalResponseCount'])
      ).toFixed(2);
    }

    let total = percentages.reduce(
      (currentTotal, currentValue) =>
        (currentTotal += Math.round(currentValue)),
      0
    );

    // Special case: divide remainders by three if they break 100,
    // 3 is the maximum above 100 the remainders can add.
    if (total > 100) {
      percentages = percentages.map((percentage) =>
        (percentage - (2 * (percentage - Math.floor(percentage))) / 3).toFixed(
          2
        )
      );

      total = percentages.reduce(
        (currentTotal, currentValue) =>
          (currentTotal += Math.round(currentValue)),
        0
      );
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

    percentages = finalPercentages;

    return percentages;
  }

  /**
   * Triggers changes to component state on response interaction.
   *
   * @param {!Element} optionEl
   * @private
   */
  handleOptionSelection_(optionEl) {
    this.responseDataPromise_.then(() => {
      if (this.hasUserSelection_) {
        return;
      }

      this.triggerAnalytics_(optionEl);
      this.hasUserSelection_ = true;

      if (this.responseData_) {
        this.responseData_['totalResponseCount']++;
        /** @type {!Array} */ (this.responseData_['responses']).forEach(
          (response) => {
            if (Number(response['reactionValue']) === optionEl.optionIndex_) {
              response['totalCount']++;
            }
          }
        );
      }

      this.mutateElement(() => {
        if (this.responseData_) {
          this.updateOptionPercentages_(this.responseData_);
        }
        this.updateToPostSelectionState_(optionEl);
      });

      if (this.element.hasAttribute('endpoint')) {
        this.updateReactionData_(optionEl.optionIndex_);
      }
    });
  }

  /**
   * Get the Reaction data from the datastore
   *
   * @return {?Promise<?ReactionResponseType|?JsonObject|undefined>}
   * @private
   */
  retrieveReactionData_() {
    return this.executeReactionRequest_(
      dict({
        'method': 'GET',
      })
    )
      .then((response) => {
        this.handleSuccessfulDataRetrieval_(response);
      })
      .catch((error) => {
        dev().error(TAG, error);
      });
  }

  /**
   * Update the Reaction data in the datastore
   *
   * @param {number} reactionValue
   * @private
   */
  updateReactionData_(reactionValue) {
    this.executeReactionRequest_(
      dict({
        'method': 'POST',
      }),
      reactionValue
    ).catch((error) => {
      dev().error(TAG, error);
    });
  }

  /**
   * Executes a Reactions API call.
   *
   * @param {Object} requestOptions
   * @param {number=} reactionValue
   * @return {Promise<ReactionResponseType|undefined>}
   * @private
   */
  executeReactionRequest_(requestOptions, reactionValue) {
    if (!assertAbsoluteHttpOrHttpsUrl(this.element.getAttribute('endpoint'))) {
      return Promise.reject(ENDPOINT_INVALID_ERROR);
    }

    if (this.reactionId_ === null) {
      const pageId = closest(dev().assertElement(this.element), (el) => {
        return el.tagName.toLowerCase() === 'amp-story-page';
      }).getAttribute('id');

      this.reactionId_ = `CANONICAL_URL#page=${pageId}`;
    }

    const requestVars = dict({
      'reactionType': this.reactionType_,
      'reactionId': this.reactionId_,
    });

    let url = this.element.getAttribute('endpoint');

    return this.getClientId_().then((clientId) => {
      requestVars['clientId'] = clientId;
      if (requestOptions['method'] === 'POST') {
        requestVars['reactionValue'] = reactionValue;
        requestOptions['body'] = requestVars;
      }
      url = addParamsToUrl(url, requestVars);
      return this.requestService_.executeRequest(url, requestOptions);
    });
  }

  /**
   * Handles incoming reaction data response
   *
   * RESPONSE FORMAT
   * {
   *  totalResponseCount: <number>
   *  hasUserResponded: <boolean>
   *  responses: [
   *    {
   *      reactionValue:
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
    if (!(response && 'data' in response)) {
      dev().error(
        TAG,
        `Invalid reaction response, expected { data: ReactionResponseType, ...} but received ${response}`
      );
      return;
    }

    this.responseData_ = response.data;

    this.hasUserSelection_ = this.responseData_.hasUserResponded;
    if (this.hasUserSelection_) {
      this.updateReactionOnDataRetrieval_(response.data);
    }
  }

  /**
   * Updates the quiz to reflect the state of the remote data.
   * @param {!ReactionResponseType} data
   * @private
   */
  updateReactionOnDataRetrieval_(data) {
    let selectedOptionKey;
    /** @type {!Array} */ (data['responses']).forEach((response) => {
      if (response.selectedByUser) {
        selectedOptionKey = response.reactionValue;
      }
    });

    if (selectedOptionKey === undefined) {
      dev().error(TAG, `The user-selected reaction could not be found`);
      return;
    }

    const options = this.rootEl_.querySelectorAll(
      '.i-amphtml-story-reaction-option'
    );

    this.mutateElement(() => {
      this.updateOptionPercentages_(data);
      this.updateToPostSelectionState_(options[selectedOptionKey]);
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

    if (this.responseData_) {
      this.rootEl_.classList.add('i-amphtml-story-reaction-has-data');
    }
  }
}
