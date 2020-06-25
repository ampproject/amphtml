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

import {AmpStoryInteractive, InteractiveType} from './amp-story-interactive';
import {CSS} from '../../../build/amp-story-interactive-results-1.0.css';
import {StateProperty} from './amp-story-store-service';
import {htmlFor} from '../../../src/static-template';
import {setStyle} from '../../../src/style';

/**
 * Generates the template for the quiz.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildResultsTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-story-interactive-results-container">
      <div class="i-amphtml-story-interactive-results-pre-select">
        <span>Come back when you're done</span>
      </div>
      <div class="i-amphtml-story-interactive-results-post-select">
        <div class="i-amphtml-story-interactive-results-line"></div>
        <div class="i-amphtml-story-interactive-results-visuals">
          <div class="i-amphtml-story-interactive-results-dots"></div>
          <div class="i-amphtml-story-interactive-results-image-border">
            <div class="i-amphtml-story-interactive-results-image"></div>
          </div>
          <div class="i-amphtml-story-interactive-results-dots"></div>
        </div>
        <div class="i-amphtml-story-interactive-results-prompt"></div>
        <div class="i-amphtml-story-interactive-results-text"></div>
        <div class="i-amphtml-story-interactive-results-description"></div>
      </div>
    </div>
  `;
};

export class AmpStoryInteractiveResults extends AmpStoryInteractive {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element, InteractiveType.RESULTS, [2, 4]);
  }

  /** @override */
  buildCallback() {
    super.buildCallback(CSS);
  }

  /** @override */
  buildComponent() {
    this.rootEl_ = buildResultsTemplate(this.element);
    return this.rootEl_;
  }

  /** @override */
  layoutCallback() {
    if (this.element.hasAttribute('prompt-text')) {
      this.rootEl_.querySelector(
        '.i-amphtml-story-interactive-results-prompt'
      ).textContent = this.element.getAttribute('prompt-text');
    }
    this.storeService_.subscribe(
      StateProperty.INTERACTIVE_RESULTS_STATE,
      (data) => {
        if (data.finished) {
          this.options_.forEach((e) => {
            if (e.category == data.resultscategory) {
              this.mutateElement(() => {
                this.updateCategory(e);
                this.updateToPostSelectionState_(null);
              });
            }
          });
        }
      },
      true
    );
  }

  /**
   * Updates the element with the correct category
   * @param {./amp-story-interactive.OptionConfigType} categorySelected
   */
  updateCategory(categorySelected) {
    setStyle(
      this.rootEl_.querySelector('.i-amphtml-story-interactive-results-image'),
      'background',
      'url(' + categorySelected.image + ')'
    );
    this.rootEl_.querySelector(
      '.i-amphtml-story-interactive-results-text'
    ).textContent = categorySelected.resultscategory;
    this.rootEl_.querySelector(
      '.i-amphtml-story-interactive-results-description'
    ).textContent = categorySelected.text || '';
  }

  /** @override */
  handleTap_(unusedEvent) {
    // Disallow click handler since there are no options.
  }

  /** @override */
  updateOptionPercentages_(unusedOptionsData) {
    // TODO(mszylkowski): Show percentages of categories if endpoint.
  }

  /** @override */
  updateStoryStoreState_(unusedOption) {
    // Prevent from updating the state.
  }
}
