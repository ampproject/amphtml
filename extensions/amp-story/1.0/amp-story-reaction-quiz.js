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

import {AmpStoryReaction, ReactionType} from './amp-story-reaction';
import {CSS} from '../../../build/amp-story-reaction-quiz-1.0.css';
import {LocalizedStringId} from '../../../src/localized-strings';
import {Services} from '../../../src/services';
import {createShadowRootWithStyle} from './utils';
import {dev} from '../../../src/log';
import {htmlFor} from '../../../src/static-template';
import {toArray} from '../../../src/types';

/** @const {string} */
const TAG = 'amp-story-reaction-quiz';

/**
 * Generates the template for the quiz.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildQuizTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div
      class="i-amphtml-story-reaction-quiz-container i-amphtml-story-reaction-container"
    >
      <div class="i-amphtml-story-reaction-quiz-prompt-container"></div>
      <div class="i-amphtml-story-reaction-quiz-option-container"></div>
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
    <span
      class="i-amphtml-story-reaction-quiz-option i-amphtml-story-reaction-option"
    >
      <span class="i-amphtml-story-reaction-quiz-answer-choice"></span>
      <span class="i-amphtml-story-reaction-quiz-option-text"></span>
      <span class="i-amphtml-story-reaction-quiz-percentage-text"></span>
    </span>
  `;
};

export class AmpStoryReactionQuiz extends AmpStoryReaction {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element, ReactionType.QUIZ);

    /** @private {!../../../src/service/localization.LocalizationService} */
    this.localizationService_ = Services.localizationService(this.win);
  }

  /** @override */
  buildCallback() {
    super.buildCallback();
    createShadowRootWithStyle(this.element, this.rootEl_, CSS);
  }

  /** @override */
  buildComponent(element) {
    this.rootEl_ = buildQuizTemplate(element);
    this.attachContent_(this.rootEl_);
    this.localizeComponent(this.rootEl_);
    return this.rootEl_;
  }

  /**
   * Finds the prompt and options content
   * and adds it to the quiz element.
   *
   * @private
   * @param {Element} root
   */
  attachContent_(root) {
    // Configure header.
    const promptInput = this.element.children[0];
    const promptContainer = root.querySelector(
      '.i-amphtml-story-reaction-quiz-prompt-container'
    );
    if (!['h1', 'h2', 'h3'].includes(promptInput.tagName.toLowerCase())) {
      dev().error(
        TAG,
        'The first child must be a heading element <h1>, <h2>, or <h3>'
      );
      this.rootEl_.removeChild(promptContainer);
    } else {
      const prompt = document.createElement(promptInput.tagName);
      prompt.textContent = promptInput.textContent;
      prompt.classList.add('i-amphtml-story-reaction-quiz-prompt');

      this.element.removeChild(promptInput);
      promptContainer.appendChild(prompt);
    }

    // Configure options.
    const options = toArray(this.element.querySelectorAll('option'));
    if (options.length < 2 || options.length > 4) {
      dev().error(TAG, 'Improper number of options');
    }
    const optionsContainer = root.querySelector(
      '.i-amphtml-story-reaction-quiz-option-container'
    );
    options.forEach((option) =>
      optionsContainer.appendChild(this.generateOption_(option))
    );

    // Check all elements were processed.
    if (this.element.children.length !== 0) {
      dev().error(TAG, 'Too many children');
    }
  }

  /**
   * Localize the answer choice options if available.
   * @param {Element} root
   */
  localizeComponent(root) {
    // Get localized answer choice options, if exsting.
    let answerChoiceOptions = ['A', 'B', 'C', 'D'];
    answerChoiceOptions = answerChoiceOptions.map((choice) => {
      return this.localizationService_.getLocalizedString(
        LocalizedStringId[`AMP_STORY_QUIZ_ANSWER_CHOICE_${choice}`]
      );
    });
    // Set content of answer choices to options.
    toArray(
      root.querySelectorAll('.i-amphtml-story-reaction-quiz-answer-choice')
    ).forEach((option, index) => {
      option.textContent = answerChoiceOptions[index];
    });
  }

  /**
   * Creates an option template filled with the option details from the <option> element.
   *
   * @param {Element} option
   * @return {Element} option element
   * @private
   */
  generateOption_(option) {
    const convertedOption = buildOptionTemplate(dev().assertElement(option));

    const optionText = convertedOption.querySelector(
      '.i-amphtml-story-reaction-quiz-option-text'
    );
    optionText.textContent = option.textContent;

    if (option.hasAttribute('correct')) {
      convertedOption.setAttribute('correct', 'correct');
    }
    this.element.removeChild(option);
    return convertedOption;
  }

  /**
   * @override
   */
  updateOptionPercentages_(responseData) {
    if (!responseData) {
      return;
    }

    const percentages = this.preprocessPercentages_(responseData);

    responseData.forEach((response, index) => {
      // TODO(jackbsteinberg): Add i18n support for various ways of displaying percentages.
      this.optionElements_[index].querySelector(
        '.i-amphtml-story-reaction-quiz-percentage-text'
      ).textContent = `${percentages[index]}%`;
    });

    this.rootEl_.setAttribute(
      'style',
      `
      --option-1-percentage: ${percentages[0]}%;
      --option-2-percentage: ${percentages[1]}%;
      --option-3-percentage: ${percentages[2]}%;
      --option-4-percentage: ${percentages[3]}%;
    `
    );
  }
}
