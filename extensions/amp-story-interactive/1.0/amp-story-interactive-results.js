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
import {StateProperty} from '../../amp-story/1.0/amp-story-store-service';
import {htmlFor} from '../../../src/static-template';
import {setStyle} from '../../../src/style';

/**
 * @typedef {{
 *    category: string,
 * }}
 */
export let InteractiveResultsDef;

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
      <div class="i-amphtml-story-interactive-results-line"></div>
      <div class="i-amphtml-story-interactive-results-visuals">
        <div class="i-amphtml-story-interactive-results-dots"></div>
        <div class="i-amphtml-story-interactive-results-image-border">
          <div class="i-amphtml-story-interactive-results-image"></div>
        </div>
        <div class="i-amphtml-story-interactive-results-dots"></div>
      </div>
      <div class="i-amphtml-story-interactive-results-prompt"></div>
      <div class="i-amphtml-story-interactive-results-title"></div>
      <div class="i-amphtml-story-interactive-results-description"></div>
    </div>
  `;
};

/**
 * Processes the state and returns the condensed results.
 * @param {!Map<string, {option: ?./amp-story-interactive.OptionConfigType, interactiveId: string}>} interactiveState
 * @param {?Array<!./amp-story-interactive.OptionConfigType>} options needed to ensure the first options take precedence on ties
 * @return {InteractiveResultsDef} the results
 */
const processResults = (interactiveState, options) => {
  const categories = {};
  // Add options in order to prefer earlier categories before later ones.
  options.forEach((option) => {
    categories[option.resultscategory] = 0;
  });
  Object.values(interactiveState).forEach((e) => {
    if (e.option != null) {
      categories[e.option.resultscategory] += 1;
    }
  });
  return {
    category: Object.keys(categories).reduce((a, b) =>
      categories[a] >= categories[b] ? a : b
    ),
  };
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
      StateProperty.INTERACTIVE_REACT_STATE,
      (data) => this.onInteractiveReactStateUpdate_(data),
      true
    );
  }

  /**
   * Receives state updates and fills up DOM with the result
   * @param {!Map<string, {option: ?./amp-story-interactive.OptionConfigType, interactiveId: string}>} interactiveState
   * @private
   */
  onInteractiveReactStateUpdate_(interactiveState) {
    const results = processResults(interactiveState, this.options_);
    this.options_.forEach((e) => {
      if (e.resultscategory === results.category) {
        this.mutateElement(() => {
          this.updateCategory_(e);
          this.updateToPostSelectionState_(null);
        });
      }
    });
  }

  /**
   * Updates the element with the correct category
   * @param {./amp-story-interactive.OptionConfigType} categorySelected
   * @private
   */
  updateCategory_(categorySelected) {
    setStyle(
      this.rootEl_.querySelector('.i-amphtml-story-interactive-results-image'),
      'background',
      'url(' + categorySelected.image + ')'
    );
    this.rootEl_.querySelector(
      '.i-amphtml-story-interactive-results-title'
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
