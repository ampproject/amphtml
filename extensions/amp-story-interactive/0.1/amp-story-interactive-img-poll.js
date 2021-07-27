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
import {CSS} from '../../../build/amp-story-interactive-img-poll-0.1.css';
import {CSS as ImgCSS} from '../../../build/amp-story-interactive-img-0.1.css';
import {buildImgTemplate} from './utils';
import {htmlFor} from '#core/dom/static-template';
import {setImportantStyles} from '#core/dom/style';

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
    </button>
  `;
};

export class AmpStoryInteractiveImgPoll extends AmpStoryInteractive {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element, InteractiveType.POLL);
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

  /**
   * Finds the prompt and options content
   * and adds it to the poll element.
   *
   * @private
   * @param {Element} root
   */
  attachContent_(root) {
    this.attachPrompt_(root);

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
   * @return {!Element}
   * @private
   */
  configureOption_(option) {
    const convertedOption = buildOptionTemplate(this.element);
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
      if (optionsData[index].selected) {
        el.setAttribute(
          'aria-label',
          'selected ' + this.options_[index]['imagealt']
        );
      }
      el.querySelector(
        '.i-amphtml-story-interactive-img-option-percentage-text'
      ).textContent = `${percentages[index]}%`;
      setImportantStyles(el, {'--option-percentage': percentages[index] / 100});
    });
  }
}
