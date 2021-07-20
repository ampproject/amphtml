/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
  AmpStoryInteractive,
  InteractiveType,
} from './amp-story-interactive-abstract';
import {CSS} from '../../../build/amp-story-interactive-img-quiz-0.1.css';
import {CSS as ImgCSS} from '../../../build/amp-story-interactive-img-0.1.css';
import {LocalizedStringId} from '#service/localization/strings';
import {buildImgTemplate} from './utils';
import {dev} from '../../../src/log';
import {
  getRGBFromCssColorValue,
  getTextColorForRGB,
} from '../../amp-story/1.0/utils';
import {htmlFor} from '#core/dom/static-template';
import {computedStyle, setImportantStyles} from '#core/dom/style';
import objstr from 'obj-str';

/**
 * Generates the template for each option.
 *
 * @param {!Element} option
 * @return {!Element}
 */
const buildOptionTemplate = (option) => {
  const html = htmlFor(option);
  return html`
    <button
      class="i-amphtml-story-interactive-img-option i-amphtml-story-interactive-option"
      aria-live="polite"
    >
      <div class="i-amphtml-story-interactive-img-option-img">
        <span
          class="i-amphtml-story-interactive-img-option-percentage-text"
        ></span>
      </div>
      <div
        class="i-amphtml-story-interactive-img-quiz-answer-choice notranslate"
      ></div>
    </button>
  `;
};

export class AmpStoryInteractiveImgQuiz extends AmpStoryInteractive {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element, InteractiveType.QUIZ);

    /** @private {!Array<string>} */
    this.localizedAnswerChoices_ = [];
  }

  /** @override */
  buildCallback() {
    return super.buildCallback(CSS + ImgCSS);
  }

  /** @override */
  buildComponent() {
    this.rootEl_ = buildImgTemplate(this.element);
    this.attachContent_(this.rootEl_);
    return this.rootEl_;
  }

  /** @override */
  layoutCallback() {
    this.setBubbleTextColor_(dev().assertElement(this.rootEl_));
    return super.layoutCallback();
  }

  /**
   * Finds the prompt and options content
   * and adds it to the quiz element.
   *
   * @private
   * @param {Element} root
   */
  attachContent_(root) {
    this.attachPrompt_(root);

    // Localize the answer choice options
    this.localizedAnswerChoices_ = [
      LocalizedStringId.AMP_STORY_INTERACTIVE_QUIZ_ANSWER_CHOICE_A,
      LocalizedStringId.AMP_STORY_INTERACTIVE_QUIZ_ANSWER_CHOICE_B,
      LocalizedStringId.AMP_STORY_INTERACTIVE_QUIZ_ANSWER_CHOICE_C,
      LocalizedStringId.AMP_STORY_INTERACTIVE_QUIZ_ANSWER_CHOICE_D,
    ].map((choice) => this.localizationService.getLocalizedString(choice));
    const optionContainer = this.rootEl_.querySelector(
      '.i-amphtml-story-interactive-img-option-container'
    );
    this.options_.forEach((option, index) =>
      optionContainer.appendChild(this.configureOption_(option, index))
    );
  }

  /**
   * Creates and returns an option container with option content,
   * adds styling and answer choices.
   *
   * @param {!./amp-story-interactive-abstract.OptionConfigType} option
   * @param {number} index
   * @return {!Element}
   * @private
   */
  configureOption_(option, index) {
    const convertedOption = buildOptionTemplate(this.element);

    // Fill in the answer choice and set the option ID
    const answerChoiceEl = convertedOption.querySelector(
      '.i-amphtml-story-interactive-img-quiz-answer-choice'
    );
    answerChoiceEl.textContent = this.localizedAnswerChoices_[index];
    convertedOption.optionIndex_ = option['optionIndex'];

    // Extract and structure the option information
    // TODO: Rewrite image URL (https://github.com/ampproject/amphtml/pull/35043#discussion_r660874389)
    setImportantStyles(
      convertedOption.querySelector(
        '.i-amphtml-story-interactive-img-option-img'
      ),
      {'background-image': 'url(' + option['image'] + ')'}
    );

    convertedOption.setAttribute('aria-label', option['imagealt']);

    if ('correct' in option) {
      convertedOption.setAttribute('correct', 'correct');
    }

    return convertedOption;
  }

  /**
   * @override
   */
  displayOptionsData(optionsData) {
    if (!optionsData) {
      return;
    }

    const percentages = this.preprocessPercentages_(optionsData);

    this.getOptionElements().forEach((el, index) => {
      // Update the aria-label so they read "selected" and "correct" or "incorrect"
      const ariaDescription = objstr({
        selected: optionsData[index].selected,
        correct: el.hasAttribute('correct'),
        incorrect: !el.hasAttribute('correct'),
      });
      el.setAttribute(
        'aria-label',
        ariaDescription + ' ' + this.options_[index]['imagealt']
      );
      // Update percentage text
      el.querySelector(
        '.i-amphtml-story-interactive-img-option-percentage-text'
      ).textContent = `${percentages[index]}%`;
      setImportantStyles(el, {'--option-percentage': percentages[index] / 100});
    });
  }

  /**
   * Set the text color of the answer choice bubble to be readable and
   * accessible according to the background color.
   *
   * @param {!Element} root
   * @private
   */
  setBubbleTextColor_(root) {
    // Only retrieves first bubble, but styles all bubbles accordingly
    const answerChoiceEl = root.querySelector(
      '.i-amphtml-story-interactive-img-quiz-answer-choice'
    );
    const {backgroundColor} = computedStyle(this.win, answerChoiceEl);
    const rgb = getRGBFromCssColorValue(backgroundColor);
    const contrastColor = getTextColorForRGB(rgb);
    setImportantStyles(root, {
      '--i-amphtml-interactive-option-answer-choice-color': contrastColor,
    });
  }
}
