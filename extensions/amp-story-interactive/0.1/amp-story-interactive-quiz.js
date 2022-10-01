import objstr from 'obj-str';

import {htmlFor} from '#core/dom/static-template';
import {setStyle} from '#core/dom/style';

import {LocalizedStringId_Enum} from '#service/localization/strings';

import {localizeTemplate} from 'extensions/amp-story/1.0/amp-story-localization-service';

import {
  AmpStoryInteractive,
  InteractiveType,
} from './amp-story-interactive-abstract';

import {CSS} from '../../../build/amp-story-interactive-quiz-0.1.css';

/**
 * Generates the template for the quiz.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildQuizTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-story-interactive-quiz-container">
      <div class="i-amphtml-story-interactive-prompt-container"></div>
      <div class="i-amphtml-story-interactive-quiz-option-container"></div>
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
    <button
      class="i-amphtml-story-interactive-quiz-option i-amphtml-story-interactive-option"
      aria-live="polite"
    >
      <span
        class="i-amphtml-story-interactive-quiz-answer-choice notranslate"
      ></span>
    </button>
  `;
};

export class AmpStoryInteractiveQuiz extends AmpStoryInteractive {
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
    return super.buildCallback(CSS);
  }

  /** @override */
  buildComponent() {
    this.rootEl_ = buildQuizTemplate(this.element);
    this.attachContent_(this.rootEl_);
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
    this.attachPrompt_(root);

    // Localize the answer choice options
    this.localizedAnswerChoices_ = [
      LocalizedStringId_Enum.AMP_STORY_INTERACTIVE_QUIZ_ANSWER_CHOICE_A,
      LocalizedStringId_Enum.AMP_STORY_INTERACTIVE_QUIZ_ANSWER_CHOICE_B,
      LocalizedStringId_Enum.AMP_STORY_INTERACTIVE_QUIZ_ANSWER_CHOICE_C,
      LocalizedStringId_Enum.AMP_STORY_INTERACTIVE_QUIZ_ANSWER_CHOICE_D,
    ];
    const optionContainer = this.rootEl_.querySelector(
      '.i-amphtml-story-interactive-quiz-option-container'
    );
    this.options_.forEach((option, index) =>
      optionContainer.appendChild(this.configureOption_(option, index))
    );
    localizeTemplate(optionContainer, this.element);
  }

  /**
   * Creates an option container with option content,
   * adds styling and answer choices,
   * and adds it to the quiz element.
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
      '.i-amphtml-story-interactive-quiz-answer-choice'
    );
    answerChoiceEl.setAttribute(
      'i-amphtml-i18n-text-content',
      this.localizedAnswerChoices_[index]
    );
    convertedOption.optionIndex_ = option['optionIndex'];

    // Extract and structure the option information
    const optionText = document.createElement('span');
    optionText.classList.add('i-amphtml-story-interactive-quiz-option-text');
    optionText.textContent = option['text'];
    convertedOption.appendChild(optionText);

    // Add text container for percentage display
    const percentageText = document.createElement('span');
    percentageText.classList.add(
      'i-amphtml-story-interactive-quiz-percentage-text'
    );
    convertedOption.appendChild(percentageText);

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
      el.querySelector(
        '.i-amphtml-story-interactive-quiz-answer-choice'
      ).setAttribute('aria-hidden', true);
      const optionText = el.querySelector(
        '.i-amphtml-story-interactive-quiz-option-text'
      );
      optionText.setAttribute(
        'aria-label',
        ariaDescription + ' ' + optionText.textContent
      );
      // Update percentage text
      el.querySelector(
        '.i-amphtml-story-interactive-quiz-percentage-text'
      ).textContent = `${percentages[index]}%`;
      setStyle(el, '--option-percentage', `${percentages[index]}%`);
    });
  }
}
