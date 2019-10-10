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

import {InlineGalleryEvents} from './inline-gallery-events';
import {Layout} from '../../../src/layout';
import {createCustomEvent} from '../../../src/event-helper';
import {dict} from '../../../src/utils/object';
import {htmlFor} from '../../../src/static-template';
import {scopedQuerySelectorAll} from '../../../src/dom';
import {setImportantStyles} from '../../../src/style.js';
import {toArray} from '../../../src/types';

/**
 * The max percentage of the gallery width the pagination dots should take
 * before being turned into a number count.
 */
const MAX_WIDTH_PERCENTAGE = 0.6;

/**
 * The width of a single dot. This should match the value in CSS.
 */
const dotWidth = 10;

/**
 * The minimum spacing between two dots. This plus dotWidth should match the
 * min-width of the dot container in CSS.
 */
const dotMinSpacing = 8;

/**
 * Returns a number falling off from one to zero, based on a distance
 * progress percentage and a power to decay at.
 * @param {number} percentage
 * @param {number} power
 * @return {number}
 */
function exponentialFalloff(percentage, power) {
  return Math.max(0, 1 - 1 / Math.pow(percentage, power));
}

export class AmpInlineGalleryPagination extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {number} */
    this.total_ = 0;

    /** @private {?boolean} */
    this.useDots_ = null;

    /** @private {?Element} */
    this.paginationDots_ = null;

    /** @private {?Element} */
    this.paginationNumbersEl_ = null;

    /** @private {?Element} */
    this.paginationIndexEl_ = null;

    /** @private {?Element} */
    this.paginationTotalEl_ = null;
  }

  /** @override */
  isRelayoutNeeded() {
    return true;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FIXED_HEIGHT;
  }

  /** @override */
  buildCallback() {
    this.element.appendChild(this.createDom_());

    this.paginationDots_ = this.element.querySelector(
      '.i-amphtml-inline-gallery-pagination-dots'
    );
    this.paginationNumbersEl_ = this.element.querySelector(
      '.i-amphtml-inline-gallery-pagination-numbers'
    );
    this.paginationIndexEl_ = this.element.querySelector(
      '.i-amphtml-inline-gallery-pagination-index'
    );
    this.paginationTotalEl_ = this.element.querySelector(
      '.i-amphtml-inline-gallery-pagination-total'
    );
  }

  /**
   * @override
   */
  layoutCallback() {
    // Since we have `isRelayoutNeeded`, this will potentially change between
    // dots and numbers depending on the available space on resize.
    this.updateTotal_(this.total_, true);
  }

  /**
   * @return {!Element}
   * @private
   */
  createDom_() {
    const html = htmlFor(this.element);
    return html`
      <div
        class="i-amphtml-inline-gallery-pagination-container"
        aria-hidden="true"
      >
        <div class="i-amphtml-inline-gallery-pagination-dots" hidden>
          <div class="i-amphtml-inline-gallery-pagination-frosting"></div>
          <div class="i-amphtml-inline-gallery-pagination-backdrop"></div>
          <div class="i-amphtml-inline-gallery-pagination-background"></div>
        </div>
        <div class="i-amphtml-inline-gallery-pagination-numbers" hidden>
          <div class="i-amphtml-inline-gallery-pagination-frosting"></div>
          <div class="i-amphtml-inline-gallery-pagination-backdrop"></div>
          <div class="i-amphtml-inline-gallery-pagination-background"></div>
          <span class="i-amphtml-inline-gallery-pagination-index"></span>
          &nbsp;/&nbsp;
          <span class="i-amphtml-inline-gallery-pagination-total"></span>
        </div>
      </div>
    `;
  }

  /**
   * @param {number} index
   * @return {!Element}
   * @private
   */
  createPaginationDot_(index) {
    const html = htmlFor(this.element);
    const content = html`
      <div class="i-amphtml-inline-gallery-pagination-dot-container">
        <div class="i-amphtml-inline-gallery-pagination-dot">
          <div class="i-amphtml-inline-gallery-pagination-dot-progress"></div>
        </div>
      </div>
    `;

    content.onclick = () => {
      const event = createCustomEvent(
        this.win,
        InlineGalleryEvents.GO_TO_SLIDE,
        dict({
          'index': index,
        }),
        {
          bubbles: true,
        }
      );
      this.element.dispatchEvent(event);
    };

    return content;
  }

  /**
   * Updates the total number of slides, switching between dots mode / numbers
   * mode depending on the available space.
   * @param {number} total
   * @param {boolean} force
   * @private
   */
  updateTotal_(total, force = false) {
    if (total == this.total_ && !force) {
      return;
    }

    // Figure out if the number of dots needed to represent the slides will fit
    // within the available space.
    const dotWidthTotal = total * dotWidth;
    const dotSpacingTotal = (total + 1) * dotMinSpacing;
    const {width} = this.getLayoutBox();
    const useDots =
      width * MAX_WIDTH_PERCENTAGE > dotWidthTotal + dotSpacingTotal;
    const dotCount = useDots ? total : 0;

    if (total === this.total_ && useDots === this.useDots_) {
      return;
    }

    this.total_ = total;
    this.useDots_ = useDots;

    // Update the UI for both dots / numbers.
    this.paginationDots_.hidden = !useDots;
    this.paginationNumbersEl_.hidden = useDots;
    this.paginationTotalEl_.textContent = total;
    this.createDots_(dotCount);
  }

  /**
   * @return {!Array<!Element>}
   * @private
   */
  getDots_() {
    return toArray(
      scopedQuerySelectorAll(
        this.paginationDots_,
        '> .i-amphtml-inline-gallery-pagination-dot-container'
      )
    );
  }

  /**
   * Creates the correct number of dots, removing any extras.
   * @param {number} dotCount
   * @private
   */
  createDots_(dotCount) {
    const dots = this.getDots_();
    for (let i = dotCount; i < dots.length; i++) {
      this.paginationDots_.removeChild(dots[i]);
    }
    for (let i = dots.length; i < dotCount; i++) {
      this.paginationDots_.appendChild(this.createPaginationDot_(i));
    }
  }

  /**
   * Updates all the dots, if there are any (not using numbers).
   * @param {number} index
   * @param {number} offset
   * @private
   */
  updateDots_(index, offset) {
    this.getDots_().forEach((dot, i) => {
      const distance = i + offset - index;
      const percentage = Math.max(1 - Math.abs(distance), 0);
      const percentageFalloff = exponentialFalloff(percentage, -0.5);

      setImportantStyles(dot, {
        '--percentage-falloff': percentageFalloff,
      });

      // Apply a class to style dots when custom properties are not supported.
      if (offset == 0) {
        dot.setAttribute(
          'i-amphtml-inline-gallery-pagination-dot-active',
          i === index
        );
      }
    });
  }

  /**
   * Updates the progress numbers display.
   * @param {number} index
   * @private
   */
  updateNumbers_(index) {
    this.paginationIndexEl_.textContent = index + 1;
  }

  /**
   *
   * @param {number} total
   * @param {number} index
   * @param {number} offset
   */
  updateProgress(total, index, offset) {
    this.mutateElement(() => {
      this.updateTotal_(total);
      this.updateDots_(index, offset);
      this.updateNumbers_(index);
    });
  }
}
