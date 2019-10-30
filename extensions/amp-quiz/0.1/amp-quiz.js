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

    /** @private {?HTMLElement} */
    this.shadowElement_ = null;

    /** @private {?ShadowRoot} */
    this.shadowRoot_ = null;

    /** @private {boolean} */
    this.hasReceivedResponse_ = false;

    /** @private {Array<number>} */
    this.percentages_ = this.generatePercentages_();
  }

  /** @override */
  buildCallback() {
    const html = htmlFor(this.element);
    this.shadowElement_ = html`
      <div class="i-amp-quiz-container">
        <div class="i-amp-quiz-prompt-container"></div>
        <div class="i-amp-quiz-option-container"></div>
      </div>
    `;

    this.shadowRoot_ = createShadowRootWithStyle(
      this.element,
      this.shadowElement_,
      CSS
    );

    // TODO: FIND A MORE JS-Y WAY TO DO THIS LOL
    this.attachContent_(e => {
      console.log('error!', e);
      throw new Error(e);
    });
    this.attachOptionHandlers_();

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
    // TODO: OPTIMIZE THIS ISH
    // AND TEST FOR THE EDGE CASES
    const prompt = this.element.children[0];
    // TODO: BAN H4-H6
    if (!(prompt instanceof HTMLHeadingElement)) {
      handleError('The first child must be a heading element');
    }

    const options = Array.from(this.element.querySelectorAll('option'));
    if (options.length < 2 || options.length > 4) {
      handleError('Improper number of options');
    }

    this.shadowRoot_
      .querySelector('.i-amp-quiz-prompt-container')
      .appendChild(prompt);

    const answerChoiceOptions = ['A', 'B', 'C', 'D'];
    options.forEach(option => {
      // TODO: THIS IS A MESS, DOCUMENT THIS
      const convertedOption = document.createElement('span');
      convertedOption.textContent = option.textContent;
      if (option.hasAttribute('correct')) {
        convertedOption.setAttribute('correct', 'correct');
      }
      option.remove();

      convertedOption.setAttribute('class', 'i-amp-quiz-option');
      this.shadowRoot_
        .querySelector('.i-amp-quiz-option-container')
        .appendChild(convertedOption);

      const answerChoice = document.createElement('span');
      answerChoice.textContent = answerChoiceOptions.shift();
      answerChoice.setAttribute('class', 'i-amp-quiz-answer-choice');
      convertedOption.prepend(answerChoice);

      const percentageBox = document.createElement('span');
      // TODO: FILL THIS IN WITH ACTUAL CONTENT
      percentageBox.textContent = '25%';
      percentageBox.setAttribute('class', 'i-amp-quiz-percentage');
      convertedOption.append(percentageBox);
    });

    if (this.element.children.length !== 0) {
      handleError('Too many children');
    }
  }

  /** @private
   * @return {Array<number>}
   */
  generatePercentages_() {
    const percentages = [];
    let pool = 100;
    let random;
    for (let i = 0; i < 3; i++) {
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
    // TODO: ASSIGN THE PERCENTAGES BETTER
    const percentage = this.percentages_.shift();
    let backgroundString;
    if (option.getAttribute('class').includes('i-amp-quiz-option-selected')) {
      if (option.hasAttribute('correct')) {
        backgroundString = `linear-gradient(90deg, var(--correct-color-shaded) ${50 +
          percentage / 2}%, var(--correct-color) ${percentage / 2}%)`;
      } else {
        backgroundString = `linear-gradient(90deg, var(--incorrect-color-shaded) ${50 +
          percentage / 2}%, var(--incorrect-color) ${percentage / 2}%)`;
      }
    } else {
      backgroundString = `linear-gradient(90deg, #d9d9d9 ${50 +
        percentage / 2}%, #ffffff ${percentage / 2}%)`;
    }
    setStyle(option, 'background', backgroundString);
    option.querySelector(
      '.i-amp-quiz-percentage'
    ).textContent = `${percentage}%`;
  }

  /** @private */
  attachOptionHandlers_() {
    const options = Array.from(
      this.shadowRoot_.querySelectorAll('.i-amp-quiz-option')
    );

    // attach listeners
    options.forEach(option => {
      option.addEventListener('click', () => {
        if (!this.hasReceivedResponse_) {
          options.forEach(o => {
            o.setAttribute(
              'class',
              `i-amp-quiz-option i-amp-quiz-option-post-selection`
            );

            if (o === option) {
              o.setAttribute(
                'class',
                `i-amp-quiz-option i-amp-quiz-option-post-selection i-amp-quiz-option-selected`
              );
            }

            const symbolContainer = o.querySelector(
              '.i-amp-quiz-answer-choice'
            );
            if (o.hasAttribute('correct')) {
              symbolContainer.textContent = '✓';
            } else {
              symbolContainer.textContent = '×';
              // TODO: IS THIS ONE ARIA LABEL ACCEPTABLE?
              symbolContainer.setAttribute('aria-label', 'X');
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
