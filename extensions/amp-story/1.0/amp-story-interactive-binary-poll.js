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

import {AmpStoryInteractive, InteractiveType} from './amp-story-interactive';
import {CSS} from '../../../build/amp-story-interactive-binary-poll-1.0.css';
import {dev} from '../../../src/log';
import {htmlFor} from '../../../src/static-template';
import {setStyle} from '../../../src/style';
import {toArray} from '../../../src/types';

/** @const @enum {number} */
export const FontSize = {
  EMOJI: 28,
  SINGLE_LINE: 16,
  DOUBLE_LINE: 14,
};

/**
 * Minimum transformX value.
 * Prevents small percentages from moving outside of poll.
 *
/** @const {number} */
const MIN_HORIZONTAL_TRANSFORM = -20;

/**
 * Generates the template for the binary poll.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildBinaryPollTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-story-interactive-binary-poll-container">
      <div class="i-amphtml-story-interactive-prompt-container"></div>
      <div
        class="i-amphtml-story-interactive-binary-poll-option-container"
      ></div>
    </div>
  `;
};

/**
 * Generates the template for the binary poll option.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildOptionTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-story-interactive-option">
      <span class="i-amphtml-story-interactive-option-percent-bar"></span>
      <span class="i-amphtml-story-interactive-option-text-container">
        <span class="i-amphtml-story-interactive-option-title"
          ><span class="i-amphtml-story-interactive-option-title-text"></span
        ></span>
        <span class="i-amphtml-story-interactive-option-percentage-text"
          >0%</span
        >
      </span>
    </div>
  `;
};

/**
 * Generates the template for the option divider.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildBinaryOptionDividerTemplate = (element) => {
  const html = htmlFor(element);
  return html` <div class="i-amphtml-story-interactive-option-divider"></div> `;
};

export class AmpStoryInteractiveBinaryPoll extends AmpStoryInteractive {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element, InteractiveType.POLL, /* bounds */ [2, 2]);
  }

  /** @override */
  buildCallback() {
    super.buildCallback(CSS);
  }

  /** @override */
  buildComponent() {
    this.rootEl_ = buildBinaryPollTemplate(this.element);
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
   * Gets the options and adds them to the element
   *
   * @private
   * @param {!Element} root
   */
  attachContent_(root) {
    this.attachPrompt_(root);
    const options = root.querySelector(
      '.i-amphtml-story-interactive-binary-poll-option-container'
    );
    options.appendChild(this.generateOption_(this.options_[0]));
    options.appendChild(buildBinaryOptionDividerTemplate(root));
    options.appendChild(this.generateOption_(this.options_[1]));
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
          if (e.textContent.length <= 3 && largestFontSize >= FontSize.EMOJI) {
            largestFontSize = FontSize.EMOJI;
          } else if (
            e./*OK*/ clientHeight <= 36 &&
            largestFontSize >= FontSize.SINGLE_LINE
          ) {
            largestFontSize = FontSize.SINGLE_LINE;
          } else if (e./*OK*/ clientHeight > 36) {
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

  /**
   * Creates an option template filled with the details the attributes.
   * @param {./amp-story-interactive.OptionConfigType} option
   * @return {Element} option element
   * @private
   */
  generateOption_(option) {
    const convertedOption = buildOptionTemplate(this.element);

    const optionText = convertedOption.querySelector(
      '.i-amphtml-story-interactive-option-title-text'
    );
    optionText.textContent = option['text'];
    convertedOption.optionIndex_ = option['optionIndex'];
    return convertedOption;
  }

  /**
   * Creates a number to transfrom the x axis of binary poll text.
   * @param {number} percentage
   * @return {number}
   * @private
   */
  getTransformVal_(percentage) {
    let mappedVal = Math.max(percentage - 50, MIN_HORIZONTAL_TRANSFORM);
    if (document.dir === 'rtl') {
      mappedVal *= -1;
    }
    return mappedVal;
  }

  /**
   * @override
   */
  updateOptionPercentages_(responseData) {
    if (!responseData) {
      return;
    }

    const percentages = this.preprocessPercentages_(responseData);

    percentages.forEach((percentage, index) => {
      // TODO(jackbsteinberg): Add i18n support for various ways of displaying percentages.
      const currOption = this.getOptionElements()[index];
      currOption.querySelector(
        '.i-amphtml-story-interactive-option-percentage-text'
      ).textContent = `${percentage}%`;

      setStyle(
        currOption.querySelector(
          '.i-amphtml-story-interactive-option-percent-bar'
        ),
        'transform',
        `scaleX(${percentage * 0.01 * 2})`
      );

      const textContainer = currOption.querySelector(
        '.i-amphtml-story-interactive-option-text-container'
      );

      textContainer.setAttribute(
        'style',
        `transform: translateX(${
          this.getTransformVal_(percentage) * (index === 0 ? 1 : -1)
        }%) !important`
      );

      if (percentage === 0) {
        setStyle(textContainer, 'opacity', '0');
      }
    });
  }
}
