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

import {Layout} from '../../../src/layout';
import {createCustomEvent, getDetail} from '../../../src/event-helper';
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

    this.total_ = 0;

    this.useDots_ = null;

    this.paginationDots_ = null;
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

    this.element.addEventListener('offsetchange-update', event => {
      this.handleOffsetChangeUpdate_(event);
    });
    this.element.addEventListener('indexchange-update', event => {
      this.handleIndexChangeUpdate_(event);
    });
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
   */
  createDom_() {
    const html = htmlFor(this.element);
    return html`
      <div class="i-amphtml-inline-gallery-pagination-container">
        <div
          class="i-amphtml-inline-gallery-pagination-dots"
          aria-hidden="true"
          hidden
        >
          <div class="i-amphtml-inline-gallery-pagination-backdrop"></div>
          <div class="i-amphtml-inline-gallery-pagination-background"></div>
        </div>
        <div class="i-amphtml-inline-gallery-pagination-numbers" hidden>
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
        'goToSlide',
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
   * @param {number} total
   * @param {boolean} force
   */
  updateTotal_(total, force = false) {
    if (total == this.total_ && !force) {
      return;
    }

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

    this.paginationDots_.hidden = !useDots;
    this.paginationNumbersEl_.hidden = useDots;
    this.paginationTotalEl_.textContent = total;
    this.createDots_(dotCount);
  }

  /**
   * @return {!Array<!Element>}
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
   * @param {number} dotCount
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
   *
   * @param {number} index
   * @param {number} offset
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
   *
   * @param {number} index
   */
  updateIndex_(index) {
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
      this.updateIndex_(index);
    });
  }

  /**
   * @param {!Event} event
   */
  handleOffsetChangeUpdate_(event) {
    const detail = getDetail(event);
    const total = detail['total'];
    const index = detail['index'];
    const offset = detail['offset'];

    this.updateProgress(total, index, offset);
  }

  /**
   * @param {!Event} event
   */
  handleIndexChangeUpdate_(event) {
    const detail = getDetail(event);
    const index = detail['index'];
    const total = detail['total'];

    this.updateProgress(total, index, 0);
  }
}
