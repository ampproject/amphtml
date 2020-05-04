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
import {dev} from '../../../src/log';
import {htmlFor} from '../../../src/static-template';
import {toArray} from '../../../src/types';

/** @const {string} */
const TAG = 'amp-story-reaction-poll-binary';

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
      <span class="i-amphtml-story-reaction-option-title"></span>
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
    createShadowRootWithStyle(this.element, this.rootEl_, CSS);
  }

  /** @override */
  buildComponent(element) {
    this.rootEl_ = buildBinaryPollTemplate(element);
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
    // Configure options.
    const options = toArray(this.element.querySelectorAll('option'));
    if (options.length != 2) {
      dev().error(TAG, 'Improper number of options');
    }
    options.forEach((option) => {
      root.appendChild(this.generateOption_(option));
      this.element.removeChild(option);
    });

    // Check all elements were processed.
    if (this.element.children.length !== 0) {
      dev().error(TAG, 'Too many children');
    }
  }

  /**
   * Creates an option template filled with the details from the <option> element.
   * @param {Element} option
   * @return {Element} option element
   * @private
   */
  generateOption_(option) {
    const convertedOption = buildOptionTemplate(dev().assertElement(option));

    const optionText = convertedOption.querySelector(
      '.i-amphtml-story-reaction-option-title'
    );
    optionText.textContent = option.textContent;
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
      const currOption = this.optionElements_[index].querySelector(
        '.i-amphtml-story-reaction-option-percentage-text'
      );
      currOption.textContent = `${percentages[index]}%`;
      this.optionElements_[index].setAttribute(
        'style',
        `flex-grow: ${percentages[index]}`
      );
    });
  }
}
