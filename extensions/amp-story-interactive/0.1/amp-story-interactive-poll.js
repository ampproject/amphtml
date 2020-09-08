/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
import {CSS} from '../../../build/amp-story-interactive-poll-0.1.css';
import {dev} from '../../../src/log';
import {htmlFor} from '../../../src/static-template';
import {setStyle} from '../../../src/style';

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
    <span class="i-amphtml-story-interactive-option">
      <span class="i-amphtml-story-interactive-option-text"></span>
      <span class="i-amphtml-story-interactive-option-percentage">
        <span class="i-amphtml-story-interactive-option-percentage-text"></span>
        <span class="i-amphtml-story-interactive-option-percentage-sign"
          >%</span
        >
      </span>
    </span>
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
  updateOptionPercentages_(optionsData) {
    if (!optionsData) {
      return;
    }

    const percentages = this.preprocessPercentages_(optionsData);

    percentages.forEach((percentage, index) => {
      const currOption = this.getOptionElements()[index];
      currOption.querySelector(
        '.i-amphtml-story-interactive-option-percentage-text'
      ).textContent = `${percentage}`;
      setStyle(currOption, '--option-percentage', percentages[index] + '%');
    });
  }

  /**
   * This method changes the font-size on post-select to best display the titles.
   *
   * It measures the number of lines and chars on the titles and generates an appropriate font-size.
   * - font-size: 28px - Both titles are emojis or short text (yes/no)
   * - font-size: 16px - Both titles have at most one line
   * - font-size: 14px - At least one title has two lines
   *
   * The title container will shrink 50% on post-select to indicate the safe-zone for the title is smaller.
   * To keep the font-size (original font-size:28px) true to the guidelines above, a post-select-scale is applied counteracting it.
   * Eg. post-select-scale:1 corresponds to font-size:14px after the 50% scale (for 2-lined title),
   * but post-select-scale:1.14 corresponds to font-size:16px after the 50% scale (for 1-lined titles),
   * and post-select-scale:2 corresponds to font-size:28px after the 50% scale (for emoji titles).
   * @private
   * @param {!Element} root
   * @return {!Promise}
   */
  adaptFontSize_(root) {
    let largestFontSize = FontSize.EMOJI;
    const allTitles = toArray(
      root.querySelectorAll('.i-amphtml-story-interactive-option-title-text')
    );
    return this.measureMutateElement(
      () => {
        allTitles.forEach((e) => {
          const lines = Math.round(
            e./*OK*/ clientHeight /
              parseFloat(
                computedStyle(this.win, e)['line-height'].replace('px', '')
              )
          );
          if (e.textContent.length <= 3 && largestFontSize >= FontSize.EMOJI) {
            largestFontSize = FontSize.EMOJI;
          } else if (lines == 1 && largestFontSize >= FontSize.SINGLE_LINE) {
            largestFontSize = FontSize.SINGLE_LINE;
          } else if (lines == 2) {
            largestFontSize = FontSize.DOUBLE_LINE;
          }
        });
      },
      () => {
        setStyle(
          root,
          '--post-select-scale-variable',
          `${(largestFontSize / FontSize.DOUBLE_LINE).toFixed(2)}`
        );
      },
      root
    );
  }
}
