/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {InteractiveType} from './amp-story-interactive-abstract';
import {
  AmpStoryInteractiveResults,
  decideStrategy,
} from './amp-story-interactive-results';
import {CSS} from '../../../build/amp-story-interactive-results-detailed-0.1.css';
import {htmlFor} from '#core/dom/static-template';
import {setImportantStyles} from '#core/dom/style';

/**
 * Generates the template for the detailed results component.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildResultsDetailedTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-story-interactive-results-container">
      <div class="i-amphtml-story-interactive-results-prompt"></div>
      <div class="i-amphtml-story-interactive-results-title"></div>
      <div class="i-amphtml-story-interactive-results-detailed">
        <div class="i-amphtml-story-interactive-results-image"></div>
      </div>
      <div class="i-amphtml-story-interactive-results-description"></div>
    </div>
  `;
};

export class AmpStoryInteractiveResultsDetailed extends AmpStoryInteractiveResults {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element);

    /** @private {?Object} */
    this.selectedResultEls_ = null;
  }

  /** @override */
  buildCallback() {
    return super.buildCallback(CSS);
  }

  /** @override */
  buildComponent() {
    this.rootEl_ = buildResultsDetailedTemplate(this.element);
    this.buildTop();
    return this.rootEl_;
  }

  /** @override */
  onInteractiveReactStateUpdate(interactiveState) {
    const components = Object.values(interactiveState);
    if (this.selectedResultEls_) {
      // Function not passed in directly to ensure "this" works correctly
      components.forEach((e) => this.updateSelectedResult_(e));
    } else {
      this.initializeSelectedResultContainers_(components);
    }

    super.onInteractiveReactStateUpdate(interactiveState);
  }

  /**
   * Create and store elements that will show results
   * for each interactive component.
   *
   * @param {!Array<Object>} components
   * @private
   */
  initializeSelectedResultContainers_(components) {
    this.selectedResultEls_ = {};
    const detailedResultsContainer = this.rootEl_.querySelector(
      '.i-amphtml-story-interactive-results-detailed'
    );
    const usePercentage = decideStrategy(this.options_) === 'percentage';
    components.forEach((e) => {
      if (
        (usePercentage && e.type === InteractiveType.QUIZ) ||
        (!usePercentage && e.type === InteractiveType.POLL)
      ) {
        const container = document.createElement('div');
        container.classList.add(
          'i-amphtml-story-interactive-results-selected-result'
        );
        setImportantStyles(container, {
          'height': '5em',
          'width': '5em',
        });
        detailedResultsContainer.appendChild(container);
        this.selectedResultEls_[e.interactiveId] = {
          el: container,
          updated: false,
        };
        this.updateSelectedResult_(e);
      }
    });
  }

  /**
   * Sets the background image or text content for an updated result.
   *
   * @param {!Object} e
   * @private
   */
  updateSelectedResult_(e) {
    if (
      e.option &&
      e.interactiveId in this.selectedResultEls_ &&
      !this.selectedResultEls_[e.interactiveId].updated
    ) {
      if (e.option.image) {
        setImportantStyles(this.selectedResultEls_[e.interactiveId].el, {
          'background-image': 'url(' + e.option.image + ')',
        });
      } else {
        this.selectedResultEls_[e.interactiveId].el.textContent = e.option.text;
      }
      this.selectedResultEls_[e.interactiveId].updated = true;
    }
  }
}
