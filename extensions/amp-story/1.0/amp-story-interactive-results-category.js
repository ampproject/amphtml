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
import {CSS} from '../../../build/amp-story-interactive-results-category-1.0.css';
import {StateProperty} from './amp-story-store-service';
import {htmlFor} from '../../../src/static-template';
import {setStyle} from '../../../src/style';

/**
 * Generates the template for the quiz.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildResultsCategoryTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-story-interactive-results-category-container">
      <div class="i-amphtml-story-interactive-results-pre-select">
        <span>Come back when you're done</span>
        <span
          class="i-amphtml-story-interactive-results-percentage-completed"
        ></span>
      </div>
      <div class="i-amphtml-story-interactive-results-post-select">
        <div class="i-amphtml-story-interactive-results-line"></div>
        <div class="i-amphtml-story-interactive-results-visuals">
          <div class="i-amphtml-story-interactive-results-dots"></div>
          <div class="i-amphtml-story-interactive-results-image">
            <div
              class="i-amphtml-story-interactive-results-category-image"
            ></div>
          </div>
          <div class="i-amphtml-story-interactive-results-dots"></div>
        </div>
        <div class="i-amphtml-story-interactive-results-prompt">You are a</div>
        <div class="i-amphtml-story-interactive-results-category-text">
          Category
        </div>
        <div class="i-amphtml-story-interactive-results-category-description">
          You love jumping around and having fun. Your bubbly personality is
          contagious, and your love for carrots is unconditional.
        </div>
      </div>
    </div>
  `;
};

export class AmpStoryInteractiveResultsCategory extends AmpStoryInteractive {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element, InteractiveType.CATEGORY, [2, 10]);
  }

  /** @override */
  buildCallback() {
    super.buildCallback(CSS);
  }

  /** @override */
  buildComponent() {
    this.rootEl_ = buildResultsCategoryTemplate(this.element);
    return this.rootEl_;
  }

  /** @override */
  layoutCallback() {
    // TODO(mszylkowski): If accepts endpoint, then call super.layoutCallback().
    this.storeService_.subscribe(
      StateProperty.INTERACTION_RESULTS_STATE,
      (data) => {
        console.log(data);
        if (data.finished) {
          this.options_.forEach((e) => {
            if (e.category == data.category) {
              this.mutateElement(() => {
                this.updateCategory(e);
                this.updateToPostSelectionState_();
              });
            }
          });
        } else {
          this.rootEl_.querySelector(
            '.i-amphtml-story-interactive-results-percentage-completed'
          ).textContent = data.percentageCompleted + '%';
        }
      },
      true
    );
  }

  /**
   * Updates the element with the correct category
   * @param {OptionConfigType} categorySelected
   */
  updateCategory(categorySelected) {
    setStyle(
      this.rootEl_.querySelector(
        '.i-amphtml-story-interactive-results-category-image'
      ),
      'background',
      'url(' + categorySelected.image + ')'
    );
    this.rootEl_.querySelector(
      '.i-amphtml-story-interactive-results-category-text'
    ).textContent = categorySelected.text;
    this.rootEl_.querySelector(
      '.i-amphtml-story-interactive-results-category-description'
    ).textContent = categorySelected.description || '';
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
