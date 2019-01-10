/* eslint-disable no-unused-vars */

import {
  Alignment,
  Axis,
} from './dimensions.js';
import {AutoAdvance} from './auto-advance';

export class Carousel {
  /**
  * @param {{
  *   win: !Window,
  *   element: !Element,
  *   scrollContainer: !Element,
  *   runMutate: function(function()),
  * }} config
  */
  constructor({
    win,
    element,
    scrollContainer,
    runMutate,
  }) {
    /** @private @const */
    this.runMutate_ = runMutate;

    /** @private @const */
    this.element_ = element;

    /** @private @const */
    this.scrollContainer_ = scrollContainer;

    /** @private @const */
    this.autoAdvance_ = new AutoAdvance({
      win,
      scrollContainer,
      advanceable: this,
    });

    /** @private {number} */
    this.advanceCount_ = 1;

    /** @private {boolean} */
    this.mixedLength_ = false;

    /** @private {!Array<!Element>} */
    this.slides_ = [];

    /** @private {boolean} */
    this.userScrollable_ = true;

    /** @private {boolean} */
    this.updating_ = false;

    /**@private {!Array<Element>} */
    this.beforeSpacers_ = [];

    /** @private {!Array<Element>} */
    this.replacementSpacers_ = [];

    /** @private {!Array<Element>} */
    this.afterSpacers_ = [];

    /**
    * Set from sources of programmatic scrolls to avoid doing work associated
    * with regular scrolling.
    * @private {boolean}
    */
    this.ignoreNextScroll_ = false;

    /**
    * The offset from the start edge for the element at the current index.
    * This is used to preserve relative scroll position when updating the UI
    * after things have moved (e.g. on rotate).
    * @private {number}
    */
    this.currentElementOffset_ = 0;

    /**
    * The reference index where the the scrollable area last stopped
    * scrolling. This slide is not translated and other slides are translated
    * to move before  or after as needed. This is also used when looping to
    * prevent a single swipe from wrapping past the starting point.
    * @private {number}
    */
    this.restingIndex_ = NaN;

    /**
    * Whether or not the user is currently touching the scrollable area. This
    * is used to avoid resetting the resting point while the user is touching
    * (e.g. they have dragged part way to the next slide, but have not yet
    * released their finger).
    * @private {boolean}
    */
    this.touching_ = false;

    /** @private {!Alignment} */
    this.alignment_ = Alignment.START;

    /** @private {!Axis} */
    this.axis_ = Axis.X;

    /** @private {number} */
    this.currentIndex_ = 0;

    /** @private {boolean} */
    this.horizontal_ = true;

    /** @private {number} */
    this.initialIndex_ = 0;

    /** @private {boolean} */
    this.loop_ = false;

    /** @private {number} */
    this.sideSlideCount_ = Number.MAX_VALUE;

    /** @private {boolean} */
    this.snap_ = true;

    /** @private {number} */
    this.snapBy_ = 1;

    /** @private {number} */
    this.visibleCount_ = 1;

    this.scrollContainer_.addEventListener(
        'scroll', () => this.handleScroll_(), true);
    this.scrollContainer_.addEventListener(
        'touchstart', () => this.handleTouchStart_(), true);
  }

  /**
   * Moves forward by the current advance count.
   */
  next() {
    this.advance(this.advanceCount_);
  }

  /**
   * Moves backwards by the current advance count.
   */
  prev() {
    this.advance(-this.advanceCount_);
  }

  /**
   * Moves the current index forward/backwards by a given delta and scrolls
   * the new index into view. There are a few cases where this behaves
   * differently than might be expected when not looping:
   *
   * 1. The current index is in the last group, then the new index will be the
   * zeroth index. For example, say you have four slides, 'a', 'b', 'c' and 'd',
   * you are showing two at a time, start aligning slides and are advancing one
   * slide at a time. If you are on slide 'c', advancing will move back to 'a'
   * instead of moving to 'd', which would cause no scrolling since 'd' is
   * already visible and cannot start align itself.
   * 2. The delta would go past the start or the end and the the current index
   * is not at the start or end, then the advancement is capped to the start
   * or end respectively.
   * 3. The delta would go past the start or the end and the current index is
   * at the start or end, then the next index will be the opposite end of the
   * carousel.
   *
   * TODO(sparhami) How can we make this work well for accessibility?
   * @param {number} delta
   */
  advance(delta) {
    // TODO(sparhami) implement
  }

  /**
   * Moves the carousel to a given index. If the index is out of range, the
   * carousel is not moved.
   * @param {number} index
   */
  goToSlide(index) {
    // TODO(sparhami) implement
  }

  /**
   * @param {number} advanceCount How many slides to advance by. This is the
   *    number of slides moved forwards/backwards when calling prev/next.
   */
  updateAdvanceCount(advanceCount) {
    this.advanceCount_ = advanceCount;
  }

  /**
   * @param {string} alignment How to align slides when snapping or scrolling
   *    to the propgramatticaly (auto advance or next/prev). This should be
   *    either "start" or "cemter".
   */
  updateAlignment(alignment) {
    this.alignment_ = alignment == 'start' ? Alignment.START : Alignment.CENTER;
    this.updateUi();
  }

  /**
   * @param {boolean} autoAdvance Whether or not to autoadvance. Changing this
   *    will start or stop autoadvance.
   */
  updateAutoAdvance(autoAdvance) {
    this.autoAdvance_.updateAutoAdvance(autoAdvance);
  }

  /**
   * @param {number} autoAdvanceCount How many items to advance by. A positive
   *    number advances forwards, a negative number advances backwards.
   */
  updateAutoAdvanceCount(autoAdvanceCount) {
    this.autoAdvance_.updateAutoAdvanceCount(autoAdvanceCount);
  }

  /**
   * @param {number} autoAdvanceInterval How much time between auto advances.
   *    This time starts counting from when scrolling has stopped.
   */
  updateAutoAdvanceInterval(autoAdvanceInterval) {
    this.autoAdvance_.updateAutoAdvanceInterval(autoAdvanceInterval);
  }

  /**
   * @param {boolean} horizontal Whether the scrollable should lay out
   *    horizontally or vertically.
   */
  updateHorizontal(horizontal) {
    this.axis_ = horizontal ? Axis.X : Axis.Y;
    this.updateUi();
  }

  /**
   * @param {number} initialIndex The initial index that should be shown.
   */
  updateInitialIndex(initialIndex) {
    this.initialIndex_ = initialIndex;
    this.updateUi();
  }

  /**
   * @param {boolean} loop Whether or not the scrollable should loop when
   *    reaching the last slide.
   */
  updateLoop(loop) {
    this.loop_ = loop;
    this.updateUi();
  }

  /**
   * @param {boolean} mixedLength Whether the slides used mixed lengths or they
   *    should be have a length assigned in accordance to the visible count.
   */
  updateMixedLength(mixedLength) {
    this.mixedLength_ = mixedLength;
    this.updateUi();
  }

  /**
   * @param {number} sideSlideCount The number of slides to show on either side
   *    of the current slide. This can be used to limit how far the user can
   *    swipe at a time.
   */
  updateSideSlideCount(sideSlideCount) {
    this.sideSlideCount_ = sideSlideCount > 0 ? sideSlideCount :
      Number.MAX_VALUE;
    this.updateUi();
  }

  /**
   * Lets the scrollable know that the slides have changed. This is needed for
   * various internal calculations.
   * @param {!Array<!Element>} slides
   */
  updateSlides(slides) {
    this.slides_ = slides;
    this.updateUi();
  }

  /**
   * @param {boolean} snap Whether or not to snap.
   */
  updateSnap(snap) {
    this.snap_ = snap;
    this.updateUi();
  }

  /**
   * @param {number} snapBy Snaps on every nth slide, including the zeroth
   *    slide.
   */
  updateSnapBy(snapBy) {
    this.snapBy_ = Math.max(1, snapBy);
    this.updateUi();
  }

  /**
   *
   * @param {boolean} userScrollable Whether or not the carousel can be
   *    scrolled (e.g. via touch). If false, then the carousel can only be
   *    advanced via next, prev, goToIndex or autoAdvance.
   */
  updateUserScrollable(userScrollable) {
    this.userScrollable_ = userScrollable;
    this.updateUi();
  }

  /**
   * Updates the UI of the carousel. Since screen rotation can change scroll
   * position, this should be called to restore the scroll position (i.e. which
   * slide is at the start / center of the scrollable, depending on alignment).
   */
  updateUi() {
    if (this.updating_) {
      return;
    }

    this.updating_ = true;
    this.runMutate_(() => {
      this.updating_ = false;
      this.scrollContainer_.setAttribute('mixed-length', this.mixedLength_);
      this.scrollContainer_.setAttribute(
          'user-scrollable', this.userScrollable_);
      this.scrollContainer_.setAttribute('horizontal', this.axis_ == Axis.X);
      this.scrollContainer_.setAttribute('loop', this.loop_);
      this.scrollContainer_.setAttribute('snap', this.snap_);
      // TODO(sparhami) Do not use CSS custom property
      // this.scrollContainer_.style.setProperty(
      //     '--visible-count', this.visibleCount_);

      if (!this.slides_.length) {
        return;
      }

      // TODO(sparhami) implement
    });
  }

  /**
   * @param {number} visibleCount How many slides to show at a time within the
   *    scrollable. This option is ignored if mixed lengths is set.
   */
  updateVisibleCount(visibleCount) {
    this.visibleCount_ = Math.max(1, visibleCount);
    this.updateUi();
  }

  /**
   * @private
   */
  handleTouchStart_() {
    // TODO(sparhami) implement
  }

  /**
   * @private
   */
  handleScroll_() {
    // TODO(sparhami) implement
  }
}
