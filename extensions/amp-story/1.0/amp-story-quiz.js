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
import {createShadowRootWithStyle} from './utils';
import {htmlFor} from '../../../src/static-template';
import {isLayoutSizeDefined} from '../../../src/layout';
import {toArray} from '../../../src/types';
import {user} from '../../../src/log';

/** @const {Array<string>} */
const answerChoiceOptions = ['A', 'B', 'C', 'D'];

/** @const {string} */
const TAG = 'amp-story-quiz';

const buildQuizTemplate = element => {
  const html = htmlFor(element);
  const shadowElement = html`
    <div class="i-amp-story-quiz-container">
      <div class="i-amp-story-quiz-prompt-container"></div>
      <div class="i-amp-story-quiz-option-container"></div>
    </div>
  `;
  return shadowElement;
};

export class AmpStoryQuiz extends AMP.BaseElement {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element);

    /** @private {boolean} */
    this.hasReceivedResponse_ = false;

    /** @private {?ShadowRoot|HTMLDivElement} */
    this.shadowRoot_ = null;
  }

  /** @override */
  buildCallback() {
    this.configureShadowRoot_();
    this.attachContent_();
    this.attachOptionActionHandlers_();

    // TODO(jackbsteinberg): Add support for custom CSS to appropriate areas
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /**
   * @return {?ShadowRoot|HTMLDivElement}
   */
  getShadowRoot() {
    return this.shadowRoot_;
  }

  /**
   * Sets up the shadow root for the component, including a light DOM fallback for unsupported browsers
   * @private
   */
  configureShadowRoot_() {
    createShadowRootWithStyle(
      this.element,
      buildQuizTemplate(this.element),
      CSS
    );

    this.shadowRoot_ = this.element.shadowRoot;
    if (!this.element.shadowRoot) {
      const childrenLength = this.element.children.length;
      // grab the last two elements (the style container and the content container)
      const shadowStyle = this.element.children[childrenLength - 2];
      const shadowContent = this.element.children[childrenLength - 1];
      // put them together into a temp container
      const tempShadowContainer = document.createElement('div');
      tempShadowContainer.appendChild(shadowStyle);
      tempShadowContainer.appendChild(shadowContent);
      // set the shadowRoot_ equal to that container
      this.shadowRoot_ = tempShadowContainer;
    }
  }

  /**
   * Finds the prompt and options content
   * and adds it to the shadow DOM.
   * @private
   */
  attachContent_() {
    // TODO(jackbsteinberg): Optional prompt behavior must be implemented here
    const prompt = this.element.children[0];
    // First child must be heading h1-h3
    if (!['h1', 'h2', 'h3'].includes(prompt.tagName.toLowerCase())) {
      user().error(
        TAG,
        'The first child must be a heading element <h1>, <h2>, or <h3>'
      );
    }

    prompt.classList.add('i-amp-story-quiz-prompt');

    const options = toArray(this.element.querySelectorAll('option'));
    if (options.length < 2 || options.length > 4) {
      user().error(TAG, 'Improper number of options');
    }

    this.shadowRoot_
      .querySelector('.i-amp-story-quiz-prompt-container')
      .appendChild(prompt);

    options.forEach((option, index) => this.configureOption_(option, index));

    if (this.element.children.length !== 0) {
      user().error(TAG, 'Too many children');
    }

    if (this.shadowRoot_ !== this.element.shadowRoot) {
      this.element.append(this.shadowRoot_);
    }
  }

  /**
   * Creates an option container with option content,
   * adds styling and answer choices,
   * and adds it to the shadow DOM.
   * @param {HTMLOptionElement} option
   * @param {number} index
   * @private
   */
  configureOption_(option, index) {
    const html = htmlFor(option);
    const convertedOption = html`
      <span class="i-amp-story-quiz-option">
        <span class="i-amp-story-quiz-answer-choice"></span>
      </span>
    `;

    // Fill in the answer choice
    convertedOption.querySelector(
      '.i-amp-story-quiz-answer-choice'
    ).textContent = answerChoiceOptions[index];

    // Transfer the option information into a span then remove the option
    const optionText = document.createTextNode(option.textContent);
    convertedOption.append(optionText);

    if (option.hasAttribute('correct')) {
      convertedOption.setAttribute('correct', 'correct');
    }
    option.remove();

    // Add the option to the shadow root
    this.shadowRoot_
      .querySelector('.i-amp-story-quiz-option-container')
      .appendChild(convertedOption);
  }

  /**
   * Attaches functions to each option to handle state transition.
   * @private
   */
  attachOptionActionHandlers_() {
    const options = toArray(
      this.shadowRoot_.querySelectorAll('.i-amp-story-quiz-option')
    );

    // Add a click listener to the element to handle option selection and navigation via tapping the prompt
    this.element.addEventListener('click', e => {
      let resolved = false;
      e.composedPath().forEach(p => {
        if (!resolved) {
          // An option was selected
          if (p.getAttribute('class').includes('i-amp-story-quiz-option')) {
            if (!this.hasReceivedResponse_) {
              p.classList.add('i-amp-story-quiz-option-selected');
              options.forEach(o => {
                o.classList.add('i-amp-story-quiz-option-post-selection');

                const symbolContainer = o.querySelector(
                  '.i-amp-story-quiz-answer-choice'
                );

                // TODO(jackbsteinberg): Replace text with icons when the assets are ready
                if (o.hasAttribute('correct')) {
                  symbolContainer.textContent = '✓';
                } else {
                  symbolContainer.textContent = '×';
                  symbolContainer.setAttribute('aria-label', 'x');
                }
              });

              this.hasReceivedResponse_ = true;
            }
            resolved = true;
          }
          // the prompt was tapped
          else if (
            p.getAttribute('class').includes('i-amp-story-quiz-prompt')
          ) {
            console.log('wrong!');
            // TODO(jackbsteinberg): Initiate page navigation on prompt tap
            resolved = true;
          }
        }
      });
    });
  }
}
