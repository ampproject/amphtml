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

import {CSS} from '../../../build/amp-story-quiz-1.0.css';
import {createShadowRootWithStyle} from '../0.1/utils';
import {htmlFor} from '../../../src/static-template';
import {isLayoutSizeDefined} from '../../../src/layout';

/** @private {Array<string>} */
const answerChoiceOptions = ['A', 'B', 'C', 'D'];

export class AmpStoryQuiz extends AMP.BaseElement {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element);

    /** @private {?ShadowRoot} */
    this.shadowRoot_ = null;

    /** @private {boolean} */
    this.hasReceivedResponse_ = false;
  }

  /** @override */
  buildCallback() {
    const html = htmlFor(this.element);
    const shadowElement = html`
      <div class="i-amp-story-quiz-container">
        <div class="i-amp-story-quiz-prompt-container"></div>
        <div class="i-amp-story-quiz-option-container"></div>
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

  /**
   * @private
   * Finds the prompt and options content
   * and adds it to the shadow DOM.
   *
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

    prompt.setAttribute('class', 'i-amp-story-quiz-prompt');

    const options = Array.from(this.element.querySelectorAll('option'));
    if (options.length < 2 || options.length > 4) {
      handleError('Improper number of options');
    }

    this.shadowRoot_
      .querySelector('.i-amp-story-quiz-prompt-container')
      .appendChild(prompt);

    options.forEach((option, index) => this.configureOption_(option, index));

    if (this.element.children.length !== 0) {
      handleError('Too many children');
    }
  }

  /**
   * @private
   * Creates an option container with option content,
   * adds styling and answer choices,
   * and adds it to the shadow DOM.
   * @param {HTMLOptionElement} option
   * @param {number} index
   */
  configureOption_(option, index) {
    // Transfer the option information into a span -
    // this allows the option container to house other markup,
    // such as the answer choices
    const convertedOption = document.createElement('span');
    convertedOption.textContent = option.textContent;
    if (option.hasAttribute('correct')) {
      convertedOption.setAttribute('correct', 'correct');
    }
    option.remove();

    // Set up the class and add it to the shadow root
    convertedOption.setAttribute('class', 'i-amp-story-quiz-option');
    this.shadowRoot_
      .querySelector('.i-amp-story-quiz-option-container')
      .appendChild(convertedOption);

    // Create a container for the answer choice and add it to the shadow root
    const answerChoice = document.createElement('span');
    answerChoice.textContent = answerChoiceOptions[index];
    answerChoice.setAttribute('class', 'i-amp-story-quiz-answer-choice');
    convertedOption.prepend(answerChoice);
  }

  /**
   * @private
   * Attaches functions to each option to handle state transition.
   *
   */
  attachOptionActionHandlers_() {
    const options = Array.from(
      this.shadowRoot_.querySelectorAll('.i-amp-story-quiz-option')
    );

    // attach listeners
    options.forEach(option => {
      option.addEventListener('click', () => {
        if (!this.hasReceivedResponse_) {
          options.forEach(o => {
            o === option
              ? o.setAttribute(
                  'class',
                  `i-amp-story-quiz-option i-amp-story-quiz-option-post-selection i-amp-story-quiz-option-selected`
                )
              : o.setAttribute(
                  'class',
                  `i-amp-story-quiz-option i-amp-story-quiz-option-post-selection`
                );

            const symbolContainer = o.querySelector(
              '.i-amp-story-quiz-answer-choice'
            );
            // TODO: REPLACE THESE WITH ICONS
            if (o.hasAttribute('correct')) {
              symbolContainer.textContent = '✓';
            } else {
              symbolContainer.textContent = '×';
              symbolContainer.setAttribute('aria-label', 'x');
            }
          });

          this.hasReceivedResponse_ = true;
        }
      });
    });
  }
}
