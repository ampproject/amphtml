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

// import {CSS} from './amp-quiz.css';
import {isLayoutSizeDefined} from '../../../src/layout';

// TODO: A TEMP UNTIL I FIGURE OUT AMP CSS
// TODO: DO THIS PROPERLY WITH GRID
const STYLE_TEXT = `
.amp-quiz-container {
  font-family: "helvetica neue";
  font-weight: 400;
  background: #AAA;
  width: auto;
  height: 80%;
  padding: 10%;
  border-radius: 3px;
}

.amp-quiz-head-container {
  height: 20%;
  display: grid;
  justify-items: center;
}

.amp-quiz-option-container {
  height: 80%;
  display: grid;
  padding-left: 5%;
  padding-right: 5%;
  background-color: inherit;
}

.amp-quiz-option {
  height: 50%;
  display: grid;
  align-items: center;
  border-radius: 3px;
  padding-left: 5%;
  background-color: inherit;
}

.amp-quiz-option-selected[correct]{
  background-color: green;
}

.amp-quiz-option-selected:not([correct]){
  background-color: red;
}

.amp-quiz-option-not-selected {
  filter: brightness(50%);
}

.amp-quiz-option-not-selected[correct] {
  background-color: green;
}`;

// TODO: CONFIGURE TO LOOK LIKE NORMAL AMP
export class AmpQuiz extends AMP.BaseElement {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element);

    /** @private {string} */
    // this.myText_ = this.element.getAttribute('text');

    /** @private {?Element} */
    this.container_ = null;

    /** @private {?Array<Node>} */
    this.options_ = null;

    /** @private {?Node} */
    this.stylesheetTag_ = null;

    /** @private {string} */
    this.stylesheet_ = STYLE_TEXT;
  }

  /** @override */
  buildCallback() {
    this.container_ = this.win.document.createElement('div');
    this.element.appendChild(this.container_);
    // this.applyFillContent(this.container_, /* replacedContent */ true);
    // TODO: ATTACH A SURFACE LEVEL CLASS
    // TODO: ATTACH A STYLESHEET
    this.stylesheetTag_ = this.win.document.createElement('style');
    this.stylesheetTag_.innerHTML = this.stylesheet_;
    this.element.prepend(this.stylesheetTag_);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    // TODO: GRAB QUIZ OPTIONS
    this.attachOptions_();
    console.log(this.options_);
    console.log(this.element);
  }

  /** @private */
  attachOptions_() {
    this.options_ = Array.from(
      this.element.querySelectorAll('.amp-quiz-option')
    );
    // attach listeners
    this.options_.forEach(option => {
      option.addEventListener('click', () => {
        // CHANGE STYLES ON OTHER STORIES
        // add an overall style then override it!
        this.options_.forEach(o => {
          o.setAttribute(
            'class',
            `amp-quiz-option amp-quiz-option-not-selected`
          );
        });
        option.setAttribute(
          'class',
          `amp-quiz-option amp-quiz-option-selected`
        );
      });
    });
  }
}

AMP.extension('amp-quiz', '0.1', AMP => {
  AMP.registerElement('amp-quiz', AmpQuiz);
});
