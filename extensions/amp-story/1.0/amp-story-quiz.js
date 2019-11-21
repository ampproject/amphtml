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

import {CSS} from '../../../build/amp-story-quiz-1.0.css';
import {StateProperty, getStoreService} from './amp-story-store-service';
import {closest} from '../../../src/dom';
import {createShadowRootWithStyle} from './utils';
import {dev} from '../../../src/log';
import {htmlFor} from '../../../src/static-template';
import {toArray} from '../../../src/types';

/** @const {!Array<string>} */
const answerChoiceOptions = ['A', 'B', 'C', 'D'];

/** @const {string} */
const TAG = 'amp-story-quiz';

/**
 * Generates the template for the quiz
 * @param {!Element} element
 * @return {!Element}
 */
const buildQuizTemplate = element => {
  const html = htmlFor(element);
  return html`
    <div class="i-amp-story-quiz-container">
      <div class="i-amp-story-quiz-prompt-container"></div>
      <div class="i-amp-story-quiz-option-container"></div>
    </div>
  `;
};

/**
 * Generates the template for each option
 *
 * @param {!Element} option
 * @return {!Element}
 */
const buildOptionTemplate = option => {
  const html = htmlFor(option);
  return html`
    <span class="i-amp-story-quiz-option">
      <span class="i-amp-story-quiz-answer-choice"></span>
    </span>
  `;
};

export class AmpStoryQuiz extends AMP.BaseElement {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element);

    /** @private {boolean} */
    this.hasReceivedResponse_ = false;

    /** @private {?ShadowRoot|HTMLDivElement} */
    this.quizEl_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win);
  }

  /** @override */
  buildCallback() {
    this.quizEl_ = buildQuizTemplate(this.element);
    this.attachContent_();
    this.initializeListeners_();
    createShadowRootWithStyle(this.element, this.quizEl_, CSS);
  }

  /**
   * Reacts to RTL state updates and triggers the UI for RTL.
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
    return layout === 'flex-item';
  }

  /**
   * @return {?Element}
   */
  getQuizElement() {
    return this.quizEl_;
  }

  /**
   * Finds the prompt and options content
   * and adds it to the quiz element.
   * @private
   */
  attachContent_() {
    // TODO(jackbsteinberg): Optional prompt behavior must be implemented here
    const promptInput = this.element.children[0];
    // First child must be heading h1-h3
    if (!['h1', 'h2', 'h3'].includes(promptInput.tagName.toLowerCase())) {
      dev().error(
        TAG,
        'The first child must be a heading element <h1>, <h2>, or <h3>'
      );
    }

    const prompt = document.createElement(promptInput.tagName);
    prompt.textContent = promptInput.textContent;
    prompt.classList.add('i-amp-story-quiz-prompt');
    promptInput.remove();

    const options = toArray(this.element.querySelectorAll('option'));
    if (options.length < 2 || options.length > 4) {
      dev().error(TAG, 'Improper number of options');
    }

    this.quizEl_
      .querySelector('.i-amp-story-quiz-prompt-container')
      .appendChild(prompt);

    options.forEach((option, index) => this.configureOption_(option, index));

    if (this.element.children.length !== 0) {
      dev().error(TAG, 'Too many children');
    }
  }

  /**
   * Creates an option container with option content,
   * adds styling and answer choices,
   * and adds it to the quiz element.
   * @param {HTMLOptionElement} option
   * @param {number} index
   * @private
   */
  configureOption_(option, index) {
    const convertedOption = buildOptionTemplate(option);

    // Fill in the answer choice
    convertedOption.querySelector(
      '.i-amp-story-quiz-answer-choice'
    ).textContent = answerChoiceOptions[index];

    // Transfer the option information into a span then remove the option
    const optionText = document.createElement('span');
    optionText.setAttribute('class', 'i-amp-story-quiz-option-text');
    optionText.textContent = option.textContent;
    // const optionText = document.createTextNode(option.textContent);
    convertedOption.append(optionText);

    if (option.hasAttribute('correct')) {
      convertedOption.setAttribute('correct', 'correct');
    }
    option.remove();

    // Add the option to the quiz element
    this.quizEl_
      .querySelector('.i-amp-story-quiz-option-container')
      .appendChild(convertedOption);
  }

  /**
   * Attaches functions to each option to handle state transition.
   * @private
   */
  initializeListeners_() {
    // Add a listener for changes in the RTL state
    this.storeService_.subscribe(
      StateProperty.RTL_STATE,
      rtlState => {
        this.onRtlStateUpdate_(rtlState);
      },
      true /** callToInitialize */
    );

    // Add a click listener to the element to handle option selection and navigation via tapping the prompt
    this.quizEl_.addEventListener('click', e => {
      const optionElement = closest(
        e.target,
        element => {
          return element.classList.contains('i-amp-story-quiz-option');
        },
        this.quizEl_
      );

      if (optionElement) {
        this.handleOptionClick_(optionElement);
        this.hasReceivedResponse_ = true;
      }
    });
  }

  /**
   * @param {!Element} p
   * @private
   */
  handleOptionClick_(p) {
    if (this.hasReceivedResponse_) {
      return;
    }

    p.classList.add('i-amp-story-quiz-option-selected');
    this.quizEl_.classList.add('i-amp-story-quiz-post-selection');
  }
}
