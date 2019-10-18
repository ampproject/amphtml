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

import {createShadowRootWithStyle} from '../../amp-story/0.1/utils';
import {htmlFor} from '../../../src/static-template';
import {isLayoutSizeDefined} from '../../../src/layout';

const css = `
.i-amp-quiz-container {
  font-family: "helvetica neue";
  font-weight: 400;
  background: #AAA;
  width: auto;
  height: 80%;
  padding: 10%;
  border-radius: 3px;
}

.i-amp-quiz-head-container {
  height: 20%;
  display: grid;
  justify-items: center;
}

.i-amp-quiz-option-container {
  height: 80%;
  display: grid;
  padding-left: 5%;
  padding-right: 5%;
  background-color: inherit;
}

.i-amp-quiz-option {
  height: 50%;
  display: grid;
  align-items: center;
  border-radius: 3px;
  padding-left: 5%;
  background-color: inherit;
}

.i-amp-quiz-option-selected[correct]::before {
  content: 'c';
}

.i-amp-quiz-option-selected:not([correct]) {
  background-color: red;
}

.i-amp-quiz-option-selected:not([correct])::before {
  content: 'x';
}

.i-amp-quiz-option-post-selection:not(i-amp-quiz-option-selected) {
  filter: brightness(80%);
}

.i-amp-quiz-option-post-selection[correct] {
  background-color: green;
}`;

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
          <div class="i-amp-quiz-option" correct>
            <slot name="option1">opt1</slot>
          </div>
          <div class="i-amp-quiz-option"><slot name="option2">opt2</slot></div>
          <div class="i-amp-quiz-option"><slot name="option3">opt3</slot></div>
          <div class="i-amp-quiz-option"><slot name="option4">opt4</slot></div>
        </div>
      </div>
    `;

    this.shadowRoot_ = createShadowRootWithStyle(
      this.element,
      this.shadowElement_,
      css
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

    prompt.setAttribute('slot', 'prompt');

    let i = 0;
    options.forEach(option => {
      option.setAttribute('slot', `option${++i}`);
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
