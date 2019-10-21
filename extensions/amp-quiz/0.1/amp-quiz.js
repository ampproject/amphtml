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

// TODO: FIGURE OUT HOW TO IMPORT POPPINS

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
  }

  /** @override */
  buildCallback() {
    const html = htmlFor(this.element);
    this.shadowElement_ = html`
      <div class="i-amp-quiz-container">
        <div class="i-amp-quiz-head-container">
          <div><slot name="prompt">prompt</slot></div>
        </div>
        <div class="i-amp-quiz-option-container">
          <slot class="i-amp-quiz-option" name="option1"></slot>
          <slot class="i-amp-quiz-option" name="option2"></slot>
          <slot class="i-amp-quiz-option" name="option3"></slot>
          <slot class="i-amp-quiz-option" name="option4"></slot>
        </div>
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

    // // TODO: ATTACH A SURFACE LEVEL CLASS
    // // TODO: ATTACH A STYLESHEET NORMALLY
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
    // grab content
    const prompt = this.element.children[0];
    if (!(prompt instanceof HTMLHeadingElement)) {
      handleError('Heading missing');
    }

    const options = Array.from(this.element.querySelectorAll('option'));
    if (options.length < 2 || options.length > 4) {
      handleError('Improper number of options');
    }

    // TODO: FIX CSS SETUP!

    prompt.setAttribute('slot', 'prompt');

    let i = 0;
    options.forEach(option => {
      option.setAttribute('slot', `option${++i}`);
      // TODO: MANUALLY PASS THROUGH CORRECT
      // TODO: FIX THIS SO IT WORKS WITH THE CSS
      if (option.hasAttribute('correct')) {
        this.shadowRoot_
          // eslint-disable-next-line local/query-selector
          .querySelector(`[name=${option.slot}]`)
          .setAttribute('correct', 'correct');
      }
    });
    // check constraints
  }

  /** @private */
  attachOptionHandlers_() {
    const options = Array.from(
      this.shadowRoot_.querySelectorAll('.i-amp-quiz-option')
    );

    // attach listeners
    options.forEach(option => {
      option.addEventListener('click', () => {
        // CHANGE STYLES ON OTHER STORIES
        // add an overall style then override it!
        options.forEach(o => {
          o.setAttribute(
            'class',
            `i-amp-quiz-option i-amp-quiz-option-post-selection`
          );
        });
        option.setAttribute(
          'class',
          `i-amp-quiz-option i-amp-quiz-option-post-selection i-amp-quiz-option-selected`
        );
      });
    });
  }
}

AMP.extension('amp-quiz', '0.1', AMP => {
  AMP.registerElement('amp-quiz', AmpQuiz);
});
