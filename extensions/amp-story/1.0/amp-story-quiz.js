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
import {CSS} from '../../../build/amp-story-quiz-1.0.css';
import {LocalizedStringId} from '../../../src/localized-strings';
import {Services} from '../../../src/services';
import {StateProperty, getStoreService} from './amp-story-store-service';
import {addParamsToUrl, assertAbsoluteHttpOrHttpsUrl} from '../../../src/url';
import {closest} from '../../../src/dom';
import {createShadowRootWithStyle} from './utils';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getRequestService} from './amp-story-request-service';
import {htmlFor} from '../../../src/static-template';
import {toArray} from '../../../src/types';

/** @const {string} */
const TAG = 'amp-story-quiz';

// TODO(jackbsteinberg): Refactor quiz to extend a general interactive element class
// and make this an enum on that class.
/** @const {number} */
const STORY_REACTION_TYPE_QUIZ = 0;

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
export let ReactionType;

/**
 * @typedef {{
 *    totalResponseCount: number,
 *    hasUserResponded: boolean,
 *    responses: !Array<ReactionType>,
 * }}
 */
export let ReactionResponseType;

/**
 * Generates the template for the quiz.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildQuizTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-story-quiz-container">
      <div class="i-amphtml-story-quiz-prompt-container"></div>
      <div class="i-amphtml-story-quiz-option-container"></div>
    </div>
  `;
};

/**
 * Generates the template for each option.
 *
 * @param {!Element} option
 * @return {!Element}
 */
const buildOptionTemplate = (option) => {
  const html = htmlFor(option);
  return html`
    <span class="i-amphtml-story-quiz-option">
      <span class="i-amphtml-story-quiz-answer-choice"></span>
    </span>
  `;
};

export class AmpStoryQuiz extends AMP.BaseElement {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element);

    /** @private @const {!./story-analytics.StoryAnalyticsService} */
    this.analyticsService_ = getAnalyticsService(this.win, element);

    /** @private {!Array<string>} */
    this.answerChoiceOptions_ = ['A', 'B', 'C', 'D'];

    /** @private {?Promise<!../../../src/service/cid-impl.CidDef>} */
    this.clientIdService_ = Services.cidForDoc(this.element);

    /** @private {?Promise<JsonObject>} */
    this.clientIdPromise_ = null;

    /** @private {boolean} */
    this.hasUserSelection_ = false;

    /** @private {!../../../src/service/localization.LocalizationService} */
    this.localizationService_ = Services.localizationService(this.win);

    /** @private {?Element} */
    this.quizEl_ = null;

    /** @private {?string} */
    this.reactionId_ = null;

    /** @private {!./amp-story-request-service.AmpStoryRequestService} */
    this.requestService_ = getRequestService(this.win, this.element);

    /** @private {?Promise<?ReactionResponseType|?JsonObject|undefined>} */
    this.responseDataPromise_ = null;

    /** @private {?ReactionResponseType} */
    this.responseData_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win);

    /** @const @private {!./variable-service.AmpStoryVariableService} */
    this.variableService_ = getVariableService(this.win);
  }

  /** @override */
  buildCallback() {
    this.quizEl_ = buildQuizTemplate(this.element);
    this.adjustGridLayer_();
    this.attachContent_();
    this.initializeListeners_();
    createShadowRootWithStyle(this.element, this.quizEl_, CSS);
  }

  /** @override */
  layoutCallback() {
    return (this.responseDataPromise_ = this.element.hasAttribute('endpoint')
      ? this.retrieveReactionData_()
      : Promise.resolve());
  }

  /**
   * Gets a Promise to return the unique AMP clientId
   *
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
   *
   * @param {boolean} rtlState
   * @private
   */
  onRtlStateUpdate_(rtlState) {
    this.mutateElement(() => {
      rtlState
        ? this.quizEl_.setAttribute('dir', 'rtl')
        : this.quizEl_.removeAttribute('dir');
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === 'container';
  }

  /**
   * @return {?Element}
   */
  getQuizElement() {
    return this.quizEl_;
  }

  /**
   * Add classes to adjust the bottom padding on the grid-layer
   * to prevent overlap with the quiz.
   *
   * @private
   */
  adjustGridLayer_() {
    const gridLayer = closest(dev().assertElement(this.element), (el) => {
      return el.tagName.toLowerCase() === 'amp-story-grid-layer';
    });

    gridLayer.classList.add('i-amphtml-story-has-quiz');

    if (gridLayer.parentElement.querySelector('amp-story-cta-layer')) {
      gridLayer.classList.add('i-amphtml-story-has-CTA-layer');
    }

    if (gridLayer.parentElement.querySelector('amp-story-page-attachment')) {
      gridLayer.classList.add('i-amphtml-story-has-page-attachment');
    }
  }

  /**
   * Finds the prompt and options content
   * and adds it to the quiz element.
   *
   * @private
   */
  attachContent_() {
    // TODO(jackbsteinberg): Optional prompt behavior must be implemented here
    const promptInput = this.element.children[0];
    const promptContainer = this.quizEl_.querySelector(
      '.i-amphtml-story-quiz-prompt-container'
    );

    // First child must be heading h1-h3
    if (!['h1', 'h2', 'h3'].includes(promptInput.tagName.toLowerCase())) {
      dev().error(
        TAG,
        'The first child must be a heading element <h1>, <h2>, or <h3>'
      );
      this.quizEl_.removeChild(promptContainer);
    } else {
      const prompt = document.createElement(promptInput.tagName);

      prompt.textContent = promptInput.textContent;
      prompt.classList.add('i-amphtml-story-quiz-prompt');

      this.element.removeChild(promptInput);
      promptContainer.appendChild(prompt);
    }

    const options = toArray(this.element.querySelectorAll('option'));
    if (options.length < 2 || options.length > 4) {
      dev().error(TAG, 'Improper number of options');
    }

    // Localize the answer choice options
    this.answerChoiceOptions_ = this.answerChoiceOptions_.map((choice) => {
      return this.localizationService_.getLocalizedString(
        LocalizedStringId[`AMP_STORY_QUIZ_ANSWER_CHOICE_${choice}`]
      );
    });
    options.forEach((option, index) => this.configureOption_(option, index));

    if (this.element.children.length !== 0) {
      dev().error(TAG, 'Too many children');
    }
  }

  /**
   * Creates an option container with option content,
   * adds styling and answer choices,
   * and adds it to the quiz element.
   *
   * @param {Element} option
   * @param {number} index
   * @private
   */
  configureOption_(option, index) {
    const convertedOption = buildOptionTemplate(dev().assertElement(option));

    // Fill in the answer choice and set the option ID
    convertedOption.querySelector(
      '.i-amphtml-story-quiz-answer-choice'
    ).textContent = this.answerChoiceOptions_[index];
    convertedOption.optionIndex_ = index;

    // Extract and structure the option information
    const optionText = document.createElement('span');
    optionText.classList.add('i-amphtml-story-quiz-option-text');
    optionText.textContent = option.textContent;
    convertedOption.appendChild(optionText);

    // Add text container for percentage display
    const percentageText = document.createElement('span');
    percentageText.classList.add('i-amphtml-story-quiz-percentage-text');
    convertedOption.appendChild(percentageText);

    if (option.hasAttribute('correct')) {
      convertedOption.setAttribute('correct', 'correct');
    }
    this.element.removeChild(option);

    this.quizEl_
      .querySelector('.i-amphtml-story-quiz-option-container')
      .appendChild(convertedOption);
  }

  /**
   * Attaches functions to each option to handle state transition.
   *
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
    this.quizEl_.addEventListener('click', (e) => this.handleTap_(e));
  }

  /**
   * Handles a tap event on the quiz element.
   *
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
        return element.classList.contains('i-amphtml-story-quiz-option');
      },
      this.quizEl_
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
      STORY_REACTION_TYPE_QUIZ
    );

    this.element[ANALYTICS_TAG_NAME] = 'amp-story-quiz';
    this.analyticsService_.triggerEvent(
      StoryAnalyticsEvent.REACTION,
      this.element
    );
  }

  /**
   * @param {Element} selectedOption
   * @private
   */
  updateQuizToPostSelectionState_(selectedOption) {
    this.quizEl_.classList.add('i-amphtml-story-quiz-post-selection');
    selectedOption.classList.add('i-amphtml-story-quiz-option-selected');

    if (this.responseData_) {
      this.quizEl_.classList.add('i-amphtml-story-quiz-has-data');
    }
  }

  /**
   * @private
   */
  updateOptionPercentages_() {
    if (!this.responseData_) {
      return;
    }

    const options = toArray(
      this.quizEl_.querySelectorAll('.i-amphtml-story-quiz-option')
    );

    const percentages = this.preprocessPercentages_(this.responseData_);

    /** @type {!Array} */ (this.responseData_['responses']).forEach(
      (response) => {
        // TODO(jackbsteinberg): Add i18n support for various ways of displaying percentages.
        options[response['reactionValue']].querySelector(
          '.i-amphtml-story-quiz-percentage-text'
        ).textContent = `${percentages[response['reactionValue']]}%`;
      }
    );

    this.quizEl_.setAttribute(
      'style',
      `
      --option-1-percentage: ${percentages[0]}%;
      --option-2-percentage: ${percentages[1]}%;
      --option-3-percentage: ${percentages[2]}%;
      --option-4-percentage: ${percentages[3]}%;
    `
    );
  }

  /**
   * Preprocess the percentages for display.
   *
   * @param {ReactionResponseType} responseData
   * @return {Array<number>}
   * @private
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
   * Triggers changes to quiz state on response interaction.
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
        this.updateOptionPercentages_();
        this.updateQuizToPostSelectionState_(optionEl);
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
    // TODO(jackbsteinberg): Add a default reactions endpoint.
    if (!assertAbsoluteHttpOrHttpsUrl(this.element.getAttribute('endpoint'))) {
      return Promise.reject(ENDPOINT_INVALID_ERROR);
    }

    if (this.reactionId_ === null) {
      const quizPageId = closest(dev().assertElement(this.element), (el) => {
        return el.tagName.toLowerCase() === 'amp-story-page';
      }).getAttribute('id');

      this.reactionId_ = `CANONICAL_URL#page=${quizPageId}`;
    }

    const requestVars = dict({
      'reactionType': STORY_REACTION_TYPE_QUIZ,
      'reactionId': this.reactionId_,
    });

    let url = this.element.getAttribute('endpoint');

    if (requestOptions['method'] === 'POST') {
      requestVars['reactionValue'] = reactionValue;
      requestOptions['body'] = requestVars;
    } else if (requestOptions['method'] === 'GET') {
      url = addParamsToUrl(url, requestVars);
    }

    return this.getClientId_().then((clientId) => {
      requestVars['clientId'] = clientId;
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
      this.updateQuizOnDataRetrieval_();
    }
  }

  /**
   * Updates the quiz to reflect the state of the remote data.
   *
   * @private
   */
  updateQuizOnDataRetrieval_() {
    let selectedOptionKey;
    /** @type {!Array} */ (this.responseData_['responses']).forEach(
      (response) => {
        if (response.selectedByUser) {
          selectedOptionKey = response.reactionValue;
        }
      }
    );

    if (selectedOptionKey === undefined) {
      dev().error(TAG, `The user-selected reaction could not be found`);
      return;
    }

    const options = this.quizEl_.querySelectorAll(
      '.i-amphtml-story-quiz-option'
    );

    if (selectedOptionKey >= options.length) {
      dev().error(
        TAG,
        `Quiz #${this.element.getAttribute('id')} does not have option ${
          this.answerChoiceOptions_[selectedOptionKey]
        }, but user selected option ${
          this.answerChoiceOptions_[selectedOptionKey]
        }`
      );
      return;
    }

    if (this.responseData_['responses'].length > options.length) {
      dev().error(
        TAG,
        `Quiz #${this.element.getAttribute('id')} has ${
          options.length
        } options, but response returned ${
          this.responseData_['responses'].length
        } options`
      );
      return;
    }

    this.mutateElement(() => {
      this.updateOptionPercentages_();
      this.updateQuizToPostSelectionState_(options[selectedOptionKey]);
    });
  }
}
