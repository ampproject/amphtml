import {Layout_Enum} from '#core/dom/layout';
import {scopedQuerySelectorAll} from '#core/dom/query';
import {htmlFor} from '#core/dom/static-template';
import {setImportantStyles} from '#core/dom/style';
import {toArray} from '#core/types/array';

import {createCustomEvent} from '#utils/event-helper';
import {devAssert} from '#utils/log';

import {InlineGalleryEvents} from './inline-gallery-events';

/**
 * The maximum number of dots to show before converting to a count.
 */
const MAX_DOT_COUNT = 8;

/**
 * Returns a number falling off from one to zero, based on a progress
 * percentage and a power to decay at.
 * TODO(sparhami) Move to math.js.
 * @param {number} percentage A number between one and zero.
 * @param {number} power A number greater than or equal to one.
 * @return {number} A number between one and zero.
 */
export function exponentialFalloff(percentage, power) {
  devAssert(percentage >= 0);
  devAssert(percentage <= 1);
  devAssert(power >= 1);
  return Math.max(0, 1 - 1 / Math.pow(percentage, -1 / power));
}

export class AmpInlineGalleryPagination extends AMP.BaseElement {
  /** @override  */
  static prerenderAllowed() {
    return true;
  }

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
  isLayoutSupported(layout) {
    return layout == Layout_Enum.FIXED_HEIGHT;
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
          <div class="i-amphtml-inline-gallery-pagination-count">
            <span class="i-amphtml-inline-gallery-pagination-index"></span>
            <span> / </span>
            <span class="i-amphtml-inline-gallery-pagination-total"></span>
          </div>
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
        {
          'index': index,
        },
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

    const useDots = total <= MAX_DOT_COUNT;
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
        devAssert(this.paginationDots_),
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
      const distance = i - (index + offset);
      const percentage = Math.max(1 - Math.abs(distance), 0);
      const percentageFalloff = exponentialFalloff(percentage, 2);

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
   * @param {number} total
   * @param {number} index
   * @param {number} offset
   * @param {!Array<!Element>} unusedSlides
   */
  updateProgress(total, index, offset, unusedSlides) {
    this.mutateElement(() => {
      this.updateTotal_(total);
      this.updateDots_(index, offset);
      this.updateNumbers_(index);
    });
  }
}
