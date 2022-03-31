import objstr from 'obj-str';

import {htmlFor} from '#core/dom/static-template';
import {computedStyle, setImportantStyles} from '#core/dom/style';

import {LocalizedStringId_Enum} from '#service/localization/strings';

import {dev} from '#utils/log';

import {localizeTemplate} from 'extensions/amp-story/1.0/amp-story-localization-service';

import {
  AmpStoryInteractive,
  InteractiveType,
} from './amp-story-interactive-abstract';
import {buildImgTemplate} from './utils';

import {CSS as ImgCSS} from '../../../build/amp-story-interactive-img-0.1.css';
import {CSS} from '../../../build/amp-story-interactive-img-quiz-0.1.css';
import {
  getRGBFromCssColorValue,
  getTextColorForRGB,
} from '../../amp-story/1.0/utils';

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
      LocalizedStringId_Enum.AMP_STORY_INTERACTIVE_QUIZ_ANSWER_CHOICE_A,
      LocalizedStringId_Enum.AMP_STORY_INTERACTIVE_QUIZ_ANSWER_CHOICE_B,
      LocalizedStringId_Enum.AMP_STORY_INTERACTIVE_QUIZ_ANSWER_CHOICE_C,
      LocalizedStringId_Enum.AMP_STORY_INTERACTIVE_QUIZ_ANSWER_CHOICE_D,
    ];
    const optionContainer = this.rootEl_.querySelector(
      '.i-amphtml-story-interactive-img-option-container'
    );
    this.options_.forEach((option, index) =>
      optionContainer.appendChild(this.configureOption_(option, index))
    );
    localizeTemplate(optionContainer, this.element);
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
    answerChoiceEl.setAttribute(
      'i-amphtml-i18n-text-content',
      this.localizedAnswerChoices_[index]
    );
    convertedOption.optionIndex_ = option['optionIndex'];

    // Extract and structure the option information
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
