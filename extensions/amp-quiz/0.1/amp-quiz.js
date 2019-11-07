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

import {CSS} from '../../../build/amp-quiz-0.1.css';
import {createShadowRootWithStyle} from '../../amp-story/0.1/utils';
import {htmlFor} from '../../../src/static-template';
import {isLayoutSizeDefined} from '../../../src/layout';
import {setStyle} from '../../../src/style';

export class AmpQuiz extends AMP.BaseElement {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element);

    /** @private {?ShadowRoot} */
    this.shadowRoot_ = null;

    /** @private {boolean} */
    this.hasReceivedResponse_ = false;

    /** @private {Array<number>} */
    this.percentages_ = this.TEMPgenerateRandomPercentages_();

    /** @private {Array<string>} */
    this.answerChoiceOptions_ = ['A', 'B', 'C', 'D'];

    this.configureOption_ = this.configureOption_.bind(this);
  }

  /** @override */
  buildCallback() {
    const html = htmlFor(this.element);
    const shadowElement = html`
      <div class="i-amp-quiz-container">
        <div class="i-amp-quiz-prompt-container"></div>
        <div class="i-amp-quiz-option-container"></div>
      </div>
    `;

    this.shadowRoot_ = createShadowRootWithStyle(
      this.element,
      shadowElement,
      CSS
    );

    // TODO: CONVERT THIS TO STANDARD AMP ERROR REPORTING
    this.attachContent_(e => {
      console.log('error!', e);
      throw new Error(e);
    });
    this.attachOptionActionHandlers_();

    // TODO: ATTACH SURFACE OPTIONS USING CSS CUSTOM PROPERTIES
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @private
   * @param {Function} handleError
   */
  attachContent_(handleError) {
    // TODO: If prompt is optional I need to handle the case where it's not present
    const prompt = this.element.children[0];
    // First child must be heading h1-h3
    if (
      !(prompt instanceof HTMLHeadingElement) ||
      prompt.tagName[prompt.tagName.length - 1] > 3
    ) {
      handleError(
        'The first child must be a heading element <h1>, <h2>, or <h3>'
      );
    }

    prompt.setAttribute('class', 'i-amp-quiz-prompt');

    const options = Array.from(this.element.querySelectorAll('option'));
    if (options.length < 2 || options.length > 4) {
      handleError('Improper number of options');
    }

    this.shadowRoot_
      .querySelector('.i-amp-quiz-prompt-container')
      .appendChild(prompt);

    options.forEach(this.configureOption_);

    if (this.element.children.length !== 0) {
      handleError('Too many children');
    }
  }

  /**
   * @private
   * @param {HTMLOptionElement} option
   */
  configureOption_(option) {
    // Transfer the option information into a span
    const convertedOption = document.createElement('span');
    convertedOption.textContent = option.textContent;
    if (option.hasAttribute('correct')) {
      convertedOption.setAttribute('correct', 'correct');
    }
    option.remove();

    // Set up the class and add it to the shadow root
    convertedOption.setAttribute('class', 'i-amp-quiz-option');
    this.shadowRoot_
      .querySelector('.i-amp-quiz-option-container')
      .appendChild(convertedOption);

    // Create a container for the answer choice and add it to the shadow root
    const answerChoice = document.createElement('span');
    answerChoice.textContent = this.answerChoiceOptions_.shift();
    answerChoice.setAttribute('class', 'i-amp-quiz-answer-choice');
    convertedOption.prepend(answerChoice);

    // Create a container for the percentage and add it to the shadow root
    const percentageBox = document.createElement('span');
    percentageBox.setAttribute('class', 'i-amp-quiz-percentage');
    convertedOption.append(percentageBox);
  }

  /** @private
   * Temporary method to generate random percentages
   * @return {Array<number>}
   */
  TEMPgenerateRandomPercentages_() {
    const percentages = [];
    let pool = 100;
    let random;

    const numOptions = Array.from(this.element.querySelectorAll('option'))
      .length;
    for (let i = 0; i < numOptions - 1; i++) {
      random = Math.floor(Math.random() * pool);
      percentages.push(random);
      pool -= random;
    }
    percentages.push(pool);
    return percentages;
  }

  /** @private
   * @param {Node} option
   */
  setOptionPercentage_(option) {
    // TODO: FIND AN ORDER-CONSCIOUS WAY OF ASSIGNING PERCENTAGES
    const percentage = this.percentages_.shift();
    // TODO: CHECK THAT EACH IS A NUMBER

    let backgroundString;
    if (option.getAttribute('class').includes('i-amp-quiz-option-selected')) {
      const colorPrefix = option.hasAttribute('correct') ? '' : 'in';
      backgroundString = `linear-gradient(90deg, var(--${colorPrefix}correct-color-shaded) ${10 +
        (9 * percentage) / 10}%, var(--${colorPrefix}correct-color) ${10 +
        (9 * percentage) / 10}%)`;
    } else {
      backgroundString = `linear-gradient(90deg, #ECEDEF ${10 +
        (9 * percentage) / 10}%, #ffffff ${10 + (9 * percentage) / 10}%)`;
    }
    setStyle(option, 'background', backgroundString);
    option.querySelector(
      '.i-amp-quiz-percentage'
    ).textContent = `${percentage}%`;
  }

  /** @private */
  attachOptionActionHandlers_() {
    const options = Array.from(
      this.shadowRoot_.querySelectorAll('.i-amp-quiz-option')
    );

    // attach listeners
    options.forEach(option => {
      option.addEventListener('click', () => {
        if (!this.hasReceivedResponse_) {
          options.forEach(o => {
            o === option
              ? o.setAttribute(
                  'class',
                  `i-amp-quiz-option i-amp-quiz-option-post-selection i-amp-quiz-option-selected`
                )
              : o.setAttribute(
                  'class',
                  `i-amp-quiz-option i-amp-quiz-option-post-selection`
                );

            const symbolContainer = o.querySelector(
              '.i-amp-quiz-answer-choice'
            );
            // TODO: REPLACE THESE WITH ICONS
            if (o.hasAttribute('correct')) {
              symbolContainer.textContent = '✓';
            } else {
              symbolContainer.textContent = '×';
              symbolContainer.setAttribute('aria-label', 'x');
            }

            this.setOptionPercentage_(o);
          });

          this.hasReceivedResponse_ = true;
        }
      });
    });
  }
}

AMP.extension('amp-quiz', '0.1', AMP => {
  AMP.registerElement('amp-quiz', AmpQuiz);
});
