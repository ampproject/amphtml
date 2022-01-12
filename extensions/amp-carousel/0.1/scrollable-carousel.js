import {ActionTrust_Enum} from '#core/constants/action-constants';
import {Keys_Enum} from '#core/constants/key-codes';
import {isLayoutSizeFixed} from '#core/dom/layout';
import {observeIntersections} from '#core/dom/layout/viewport-observer';
import {numeric} from '#core/dom/transition';

import {Services} from '#service';

import {Animation} from '#utils/animation';
import {listen} from '#utils/event-helper';
import {dev} from '#utils/log';

import {buildDom} from './build-dom';
import {CarouselControls} from './carousel-controls';

/** @const {string} */
const TAG = 'amp-scrollable-carousel';

export class AmpScrollableCarousel extends AMP.BaseElement {
  /** @param {AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {number} */
    this.pos_ = 0;

    /** @private {number} */
    this.oldPos_ = 0;

    /** @private {?Array<Element>} */
    this.cells_ = null;

    /** @private {?Element} */
    this.container_ = null;

    /** @private {?number} */
    this.scrollTimerId_ = null;

    /** @private {?UnlistenDef} */
    this.unobserveIntersections_ = null;

    /** @private {CarouselControls} */
    this.controls_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeFixed(layout);
  }

  /** @override */
  isRelayoutNeeded() {
    return true;
  }

  /**
   * Attaches event handlers.
   * @private
   */
  setupBehavior_() {
    this.cancelTouchEvents_();

    this.container_.addEventListener('scroll', this.scrollHandler_.bind(this));
    this.container_.addEventListener(
      'keydown',
      this.keydownHandler_.bind(this)
    );

    this.cells_.forEach((cell) => {
      Services.ownersForDoc(this.element).setOwner(cell, this.element);
    });

    this.registerAction(
      'goToSlide',
      (invocation) => {
        const {args} = invocation;
        if (args) {
          const index = parseInt(args['index'], 10);
          this.goToSlide(index);
        }
      },
      ActionTrust_Enum.LOW
    );
    /** If the element is in an email document, allow its `goToSlide` action. */
    Services.actionServiceForDoc(this.element).addToAllowlist(
      'amp-carousel',
      'goToSlide',
      ['email']
    );
  }

  /** @override */
  buildCallback() {
    const {cells, container, nextButton, prevButton} = buildDom(this.element);
    this.container_ = container;
    this.cells_ = cells;

    this.controls_ = new CarouselControls({
      element: this.element,
      prevButton,
      nextButton,
      go: this.go.bind(this),
    });
    this.setupBehavior_();
  }

  /** @override */
  layoutCallback() {
    this.unobserveIntersections_ = observeIntersections(
      this.element,
      ({isIntersecting}) => this.viewportCallback(isIntersecting)
    );

    this.doLayout_(this.pos_);
    this.preloadNext_(this.pos_, 1);
    this.controls_.setControlsState({
      prev: this.hasPrev_(),
      next: this.hasNext_(),
    });
    return Promise.resolve();
  }

  /** @override */
  unlayoutCallback() {
    this.unobserveIntersections_?.();
    this.unobserveIntersections_ = null;
    return true;
  }

  /**
   * Handles when carousel comes into and out of viewport.
   * @param {boolean} inViewport
   */
  viewportCallback(inViewport) {
    this.updateInViewport_(this.pos_, this.pos_);
    if (inViewport) {
      this.controls_.hintControls();
    }
  }

  /**
   * Does all the work needed to proceed to next
   * desired direction.
   * @param {number} dir -1 or 1
   * @param {boolean} animate
   */
  go(dir, animate) {
    const newPos = this.nextPos_(this.pos_, dir);
    const oldPos = this.pos_;

    if (newPos == oldPos) {
      return;
    }

    if (!animate) {
      this.commitSwitch_(newPos);
      this.container_./*OK*/ scrollLeft = newPos;
    } else {
      /** @const {TransitionDef<number>} */
      const interpolate = numeric(oldPos, newPos);
      const duration = 200;
      const curve = 'ease-in-out';
      Animation.animate(
        this.element,
        (pos) => {
          this.container_./*OK*/ scrollLeft = interpolate(pos);
        },
        duration,
        curve
      ).thenAlways(() => {
        this.commitSwitch_(newPos);
      });
    }
  }

  /**
   * Scrolls to the slide at the given slide index.
   * @param {number} index
   * @return {*} TODO(#23582): Specify return type
   */
  goToSlide(index) {
    const noOfSlides = this.cells_.length;

    if (!isFinite(index) || index < 0 || index >= noOfSlides) {
      this.user().error(TAG, 'Invalid [slide] value: %s', index);
      return Promise.resolve();
    }

    const oldPos = this.pos_;
    let newPos = oldPos;

    const measureNewPosition = () => {
      newPos = this.getPosForSlideIndex_(index);
    };

    const mutateNewPosition = () => {
      if (newPos == oldPos) {
        return;
      }
      /** @const {TransitionDef<number>} */
      const interpolate = numeric(oldPos, newPos);
      const duration = 200;
      const curve = 'ease-in-out';
      Animation.animate(
        this.element,
        (pos) => {
          this.container_./*OK*/ scrollLeft = interpolate(pos);
        },
        duration,
        curve
      ).thenAlways(() => {
        this.commitSwitch_(newPos);
      });
    };

    this.measureMutateElement(measureNewPosition, mutateNewPosition);
  }

  /**
   * Calculates the target scroll position for the given slide index.
   * @param {number} index
   * @return {number}
   */
  getPosForSlideIndex_(index) {
    const containerWidth = this.element./*OK*/ offsetWidth;
    const targetPosition = this.cells_[index]./*OK*/ offsetLeft;
    const targetWidth = this.cells_[index]./*OK*/ offsetWidth;
    return targetPosition - (containerWidth - targetWidth) / 2;
  }

  /**
   * Handles scroll on the carousel container.
   * @private
   */
  scrollHandler_() {
    const currentScrollLeft = this.container_./*OK*/ scrollLeft;
    this.pos_ = currentScrollLeft;

    if (this.scrollTimerId_ === null) {
      this.waitForScroll_(currentScrollLeft);
    }
  }

  /**
   * Escapes Left and Right arrow key events on the carousel container.
   * This is to prevent them from doubly interacting with surrounding viewer
   * contexts such as email clients when interacting with the amp-carousel.
   * @param {KeyboardEvent} event
   * @private
   */
  keydownHandler_(event) {
    const {key} = event;
    if (key == Keys_Enum.LEFT_ARROW || key == Keys_Enum.RIGHT_ARROW) {
      event.stopPropagation();
    }
  }

  /**
   * @param {number} startingScrollLeft
   * @private
   */
  waitForScroll_(startingScrollLeft) {
    this.scrollTimerId_ = /** @type {number} */ (
      Services.timerFor(this.win).delay(() => {
        // TODO(yuxichen): test out the threshold for identifying fast scrolling
        if (Math.abs(startingScrollLeft - this.pos_) < 30) {
          dev().fine(
            TAG,
            'slow scrolling: %s - %s',
            startingScrollLeft,
            this.pos_
          );
          this.scrollTimerId_ = null;
          this.commitSwitch_(this.pos_);
        } else {
          dev().fine(
            TAG,
            'fast scrolling: %s - %s',
            startingScrollLeft,
            this.pos_
          );
          this.waitForScroll_(this.pos_);
        }
      }, 100)
    );
  }

  /**
   * Update the slides need to be loaded given current position.
   * Preload next slides and update control button state.
   * @param {number} pos
   * @private
   */
  commitSwitch_(pos) {
    this.updateInViewport_(pos, this.oldPos_);
    this.doLayout_(pos);
    this.preloadNext_(pos, Math.sign(pos - this.oldPos_));
    this.oldPos_ = pos;
    this.pos_ = pos;
    this.controls_.setControlsState({
      prev: this.hasPrev_(),
      next: this.hasNext_(),
    });
  }

  /**
   * @param {number} pos
   * @param {number} dir
   * @return {number}
   * @private
   */
  nextPos_(pos, dir) {
    const containerWidth = this.element./*OK*/ offsetWidth;
    const fullWidth = this.container_./*OK*/ scrollWidth;
    const newPos = pos + dir * containerWidth;
    if (newPos < 0) {
      return 0;
    }
    if (fullWidth >= containerWidth && newPos > fullWidth - containerWidth) {
      return fullWidth - containerWidth;
    }
    return newPos;
  }

  /**
   * @param {number} pos
   * @param {function(Element):void} callback
   * @private
   */
  withinWindow_(pos, callback) {
    const containerWidth = this.element./*OK*/ offsetWidth;
    for (let i = 0; i < this.cells_.length; i++) {
      const cell = this.cells_[i];
      if (
        cell./*OK*/ offsetLeft + cell./*OK*/ offsetWidth >= pos &&
        cell./*OK*/ offsetLeft <= pos + containerWidth
      ) {
        callback(cell);
      }
    }
  }

  /**
   * @param {number} pos
   * @private
   */
  doLayout_(pos) {
    this.withinWindow_(pos, (cell) => {
      Services.ownersForDoc(this.element).scheduleLayout(this.element, cell);
    });
  }

  /**
   * @param {number} pos
   * @param {number} dir
   * @private
   */
  preloadNext_(pos, dir) {
    const nextPos = this.nextPos_(pos, dir);
    if (nextPos != pos) {
      this.withinWindow_(nextPos, (cell) => {
        Services.ownersForDoc(this.element).schedulePreload(this.element, cell);
      });
    }
  }

  /**
   * @param {number} newPos
   * @param {number} oldPos
   * @private
   */
  updateInViewport_(newPos, oldPos) {
    const seen = [];
    this.withinWindow_(newPos, (cell) => {
      seen.push(cell);
    });
    if (oldPos != newPos) {
      this.withinWindow_(oldPos, (cell) => {
        if (!seen.includes(cell)) {
          const owners = Services.ownersForDoc(this.element);
          owners.schedulePause(this.element, cell);
        }
      });
    }
  }

  /**
   * @return {boolean}
   * @private
   */
  hasPrev_() {
    return this.pos_ != 0;
  }

  /**
   * @return {boolean}
   * @private
   */
  hasNext_() {
    const containerWidth = this.element./*OK*/ offsetWidth;
    const scrollWidth = this.container_./*OK*/ scrollWidth;
    const maxPos = Math.max(scrollWidth - containerWidth, 0);
    return this.pos_ != maxPos;
  }

  /** Used by amp-lightbox-gallery */
  interactionNext() {
    this.controls_.handleNext();
  }

  /** Used by amp-lightbox-gallery */
  interactionPrev() {
    this.controls_.handlePrev();
  }

  /**
   * Used by amp-lightbox-gallery
   *
   * Does all the work needed to proceed to next
   * desired direction.
   * @param {number} dir -1 or 1
   * @param {boolean} animate
   */
  goCallback(dir, animate) {
    this.go(dir, animate);
  }

  /**
   * Cancels the touchmove events for the element so that viewer does not
   * consider the swipes in the carousel as swipes for changing AMP documents.
   * @private
   */
  cancelTouchEvents_() {
    // TODO(aghassemi, #4754): Ideally we only stop propagation of horizontal
    // touchmove events.
    listen(this.element, 'touchmove', (event) => event.stopPropagation(), {
      passive: true,
    });
  }
}
