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

import {AmpStoryReaction, ReactionType} from './amp-story-reaction';
import {CSS} from '../../../build/amp-story-reaction-poll-binary-1.0.css';
import {createShadowRootWithStyle} from './utils';
import {dev, devAssert} from '../../../src/log';
import {htmlFor} from '../../../src/static-template';
import {scopedQuerySelector, scopedQuerySelectorAll} from '../../../src/dom';
import {toArray} from '../../../src/types';

/** @const {string} */
const TAG = 'amp-story-reaction-poll-binary';

/** @const @enum {number} */
export const FontSize = {
  EMOJI: 28,
  SINGLE_LINE: 16,
  DOUBLE_LINE: 14,
};

/**
 * Generates the template for the binary poll.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildBinaryPollTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-story-reaction-poll-binary-container"></div>
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
    <div class="i-amphtml-story-reaction-option">
      <span class="i-amphtml-story-reaction-option-title"><span></span></span>
      <span class="i-amphtml-story-reaction-option-percentage-text">0%</span>
    </div>
  `;
};

export class AmpStoryReactionPollBinary extends AmpStoryReaction {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element, ReactionType.POLL);
  }

  /** @override */
  buildCallback() {
    super.buildCallback();
    createShadowRootWithStyle(
      this.element,
      dev().assertElement(this.rootEl_),
      CSS
    );
  }

  /** @override */
  buildComponent() {
    this.rootEl_ = buildBinaryPollTemplate(this.element);
    this.attachContent_(this.rootEl_);
    return this.rootEl_;
  }

  /**
   * Gets the options and adds them to the element
   *
   * @private
   * @param {Element} root
   */
  attachContent_(root) {
    // Configure options.
    if (this.options_.length != 2) {
      devAssert(this.options_.length == 2, 'Improper number of options');
      dev().error(TAG, 'Improper number of options');
    }
    this.options_.forEach((option) => {
      root.appendChild(this.generateOption_(option));
    });
    this.adaptFontSize_(root);
  }

  /**
   * @private
   * @param {Element} root
   */
  adaptFontSize_(root) {
    this.mutateElement(() => {
      let largestFontSize = FontSize.EMOJI;
      toArray(
        scopedQuerySelectorAll(
          dev().assertElement(root),
          '.i-amphtml-story-reaction-option-title > span'
        )
      ).forEach((e) => {
        console.log(e.textContent, e./*OK*/ clientHeight);

        if (e.textContent.length <= 3 && largestFontSize >= FontSize.EMOJI) {
          largestFontSize = FontSize.EMOJI;
        } else if (
          e./*OK*/ clientHeight <= 30 &&
          largestFontSize >= FontSize.SINGLE_LINE
        ) {
          largestFontSize = FontSize.SINGLE_LINE;
        } else if (e./*OK*/ clientHeight > 30) {
          largestFontSize = FontSize.DOUBLE_LINE;
        }
      });
      root.setAttribute(
        'style',
        `--post-select-scale-variable: ${(
          largestFontSize / FontSize.DOUBLE_LINE
        ).toFixed(2)} !important;`
      );
      console.log(largestFontSize, largestFontSize / FontSize.DOUBLE_LINE);
    });
  }

  /**
   * Creates an option template filled with the details the attributes.
   * @param {./amp-story-reaction.OptionConfigType} option
   * @return {Element} option element
   * @private
   */
  generateOption_(option) {
    const convertedOption = buildOptionTemplate(this.element);

    const optionText = scopedQuerySelector(
      convertedOption,
      '.i-amphtml-story-reaction-option-title > span'
    );
    optionText.textContent = option['text'];
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

    percentages.forEach((percentage, index) => {
      // TODO(jackbsteinberg): Add i18n support for various ways of displaying percentages.
      const currOption = this.getOptionElements()[index];
      currOption.querySelector(
        '.i-amphtml-story-reaction-option-percentage-text'
      ).textContent = `${percentage}%`;
      currOption.setAttribute('style', `flex-grow: ${percentage}`);
    });
  }
}
