import {htmlFor} from '#core/dom/static-template';
import {computedStyle, setStyle} from '#core/dom/style';
import {toArray} from '#core/types/array';

import {dev} from '#utils/log';

import {
  AmpStoryInteractive,
  InteractiveType,
} from './amp-story-interactive-abstract';

import {CSS} from '../../../build/amp-story-interactive-poll-0.1.css';

/**
 * Generates the template for the poll.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildPollTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-story-interactive-poll-container">
      <div class="i-amphtml-story-interactive-prompt-container"></div>
      <div class="i-amphtml-story-interactive-option-container"></div>
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
    <button class="i-amphtml-story-interactive-option" aria-live="polite">
      <span class="i-amphtml-story-interactive-option-text"></span>
      <span class="i-amphtml-story-interactive-option-percentage">
        <span class="i-amphtml-story-interactive-option-percentage-text"></span>
        <span class="i-amphtml-story-interactive-option-percentage-sign"
          >%</span
        >
      </span>
    </button>
  `;
};

export class AmpStoryInteractivePoll extends AmpStoryInteractive {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element, InteractiveType.POLL, [2, 4]);
  }

  /** @override */
  buildCallback() {
    return super.buildCallback(CSS);
  }

  /** @override */
  buildComponent() {
    this.rootEl_ = buildPollTemplate(this.element);
    this.attachContent_(this.rootEl_);
    return this.rootEl_;
  }

  /** @override */
  layoutCallback() {
    return this.adaptFontSize_(dev().assertElement(this.rootEl_)).then(() =>
      super.layoutCallback()
    );
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
    this.options_.forEach((option, index) =>
      this.configureOption_(option, index)
    );
  }

  /**
   * Creates an option container with option content,
   * adds styling and answer choices,
   * and adds it to the quiz element.
   *
   * @param {!./amp-story-interactive-abstract.OptionConfigType} option
   * @param {number} index
   * @private
   */
  configureOption_(option, index) {
    const convertedOption = buildOptionTemplate(this.element);
    convertedOption.optionIndex_ = index;

    // Extract and structure the option information
    convertedOption.querySelector(
      '.i-amphtml-story-interactive-option-text'
    ).textContent = option.text;

    this.rootEl_
      .querySelector('.i-amphtml-story-interactive-option-container')
      .appendChild(convertedOption);
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
      if (optionsData[index].selected) {
        const textEl = el.querySelector(
          '.i-amphtml-story-interactive-option-text'
        );
        textEl.setAttribute('aria-label', 'selected ' + textEl.textContent);
      }
      el.querySelector(
        '.i-amphtml-story-interactive-option-percentage-text'
      ).textContent = percentages[index];
      setStyle(el, '--option-percentage', percentages[index] + '%');
    });
  }

  /**
   * This method changes the font-size to best display the options, measured only once on create.
   *
   * If two lines appear, it will add the class 'i-amphtml-story-interactive-poll-two-lines'
   * It measures the number of lines on all options and generates the best size.
   * - font-size: 22px (1.375em) - All options are one line
   * - font-size: 18px (1.125em) - Any option is two lines if displayed at 22px.
   *
   * @private
   * @param {!Element} root
   * @return {!Promise}
   */
  adaptFontSize_(root) {
    let hasTwoLines = false;
    const allOptionTexts = toArray(
      root.querySelectorAll('.i-amphtml-story-interactive-option-text')
    );
    return this.measureMutateElement(
      () => {
        hasTwoLines = allOptionTexts.some((e) => {
          const lines = Math.round(
            e./*OK*/ clientHeight /
              parseFloat(
                computedStyle(this.win, e)['line-height'].replace('px', '')
              )
          );
          return lines >= 2;
        });
      },
      () => {
        this.rootEl_.classList.toggle(
          'i-amphtml-story-interactive-poll-two-lines',
          hasTwoLines
        );
      },
      root
    );
  }
}
