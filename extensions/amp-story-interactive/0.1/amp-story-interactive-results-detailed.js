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
 * @typedef {{
 *    element: !Element,
 *    answered: boolean
 * }} ResultElementType
 */

/** @const {number} */
const CENTER = 9;

/** @const {number} */
const MIN_SIZE = 3;

/** @const {number} */
const MAX_SIZE = 6;

/** @const {number} */
const MIN_DIST = 5;

/** @const {number} */
const MAX_DIST = 6;

/** @const {number} */
const BORDER_BUFFER = 0.125;

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

    /** @private {!Map<string, ResultElementType>} */
    this.resultEls_ = {};

    /** @private {?Element} */
    this.resultsContainer_ = null;

    /** @private {boolean} */
    this.usePercentage_ = false;
  }

  /** @override */
  buildCallback() {
    return super.buildCallback(CSS);
  }

  /** @override */
  buildComponent() {
    this.rootEl_ = buildResultsDetailedTemplate(this.element);
    this.buildTop();
    this.resultsContainer_ = this.rootEl_.querySelector(
      '.i-amphtml-story-interactive-results-detailed'
    );
    this.usePercentage_ = decideStrategy(this.options_) === 'percentage';
    return this.rootEl_;
  }

  /** @override */
  onInteractiveReactStateUpdate(interactiveState) {
    const components = Object.values(interactiveState);
    let updateLayout = false;

    components.forEach((e) => {
      if (
        (this.usePercentage_ && e.type === InteractiveType.QUIZ) ||
        (!this.usePercentage_ && e.type === InteractiveType.POLL)
      ) {
        if (!this.resultEls_[e.interactiveId]) {
          updateLayout = true;
          this.createResultEl_(e);
        }
        this.updateAnsweredResult_(e);
      }
    });

    if (updateLayout) {
      this.positionResultEls_();
    }

    super.onInteractiveReactStateUpdate(interactiveState);
  }

  /**
   * Create and store an element that will show the results
   * for an interactive component.
   *
   * @param {!./amp-story-interactive-results.InteractiveStateEntryType} e
   * @private
   */
  createResultEl_(e) {
    const element = document.createElement('div');
    element.classList.add('i-amphtml-story-interactive-results-result');
    const text = document.createElement('span');
    text.classList.add('i-amphtml-story-interactive-results-result-text');
    text.textContent = '?';
    element.append(text);
    this.resultsContainer_.prepend(element);
    this.resultEls_[e.interactiveId] = {
      element,
      answered: false,
    };
  }

  /**
   * Sets the background image or text content for an answered result.
   *
   * @param {!./amp-story-interactive-results.InteractiveStateEntryType} e
   * @private
   */
  updateAnsweredResult_(e) {
    if (!e.option || this.resultEls_[e.interactiveId].answered) {
      return;
    }

    if (e.option.image) {
      setImportantStyles(this.resultEls_[e.interactiveId].element, {
        'background-image': 'url(' + e.option.image + ')',
      });
      this.resultEls_[e.interactiveId].element.children[0].textContent = '';
    } else {
      this.resultEls_[e.interactiveId].element.children[0].textContent =
        e.option.text;
    }

    if (e.type === InteractiveType.QUIZ) {
      const correctnessClass =
        'i-amphtml-story-interactive-results-' +
        ('correct' in e.option ? '' : 'in') +
        'correct';
      this.resultEls_[e.interactiveId].element.classList.add(correctnessClass);
    }

    this.resultEls_[e.interactiveId].answered = true;
  }

  /**
   * Sets (or resets) the positioning and sizing of each result.
   *
   * @private
   */
  positionResultEls_() {
    const results = Object.values(this.resultEls_);
    // Size of the section each result will be placed in
    const slice = (2 * Math.PI) / results.length;
    // Randomly rotate slice alignment
    const offset = Math.random() * slice;

    results.forEach(({element}, index) => {
      // Distance from center of central category image to center of result; [MIN_DIST, MAX_DIST)
      const dist = Math.random() * (MAX_DIST - MIN_DIST) + MIN_DIST;
      // Size of the result at this distance if expanded to fill up the whole slice (only works when more than 1 slice)
      const sliceSize = 2 * (dist * Math.sin(slice / 2) - BORDER_BUFFER);
      const adjustedMaxSize =
        results.length === 1 ? MAX_SIZE : Math.min(MAX_SIZE, sliceSize);
      // Diameter of the result element; [MIN_SIZE, adjustedMaxSize)
      const size = Math.random() * (adjustedMaxSize - MIN_SIZE) + MIN_SIZE;
      // If the result gets too close to the edge of the slice, it will overlap onto the
      // next slice, so the angleBuffer sets a region to avoid placing the image in
      const angleBuffer = Math.asin((size / 2 + BORDER_BUFFER) / dist);
      // Angle to place the result at relative to its slice; [angleBuffer, slice - angleBuffer)
      const sliceRelAngle =
        Math.random() * (slice - 2 * angleBuffer) + angleBuffer;
      const angle = slice * index + sliceRelAngle + offset;

      /**
       * Transform the angle and distance (polar coordinates) of the result
       * into Cartesian coordinates to be used in CSS.
       *
       * @param {function} trig Math.cos (y-axis coordinate) or Math.sin (x-axis coordinate)
       * @return {string} CSS positioning value
       */
      const transform = (trig) => CENTER + trig(angle) * dist - size / 2 + 'em';

      setImportantStyles(element, {
        '--size': size + 'em',
        'top': transform(Math.cos),
        'left': transform(Math.sin),
      });
    });
  }
}
