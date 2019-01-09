import {AutoAdvance} from './auto-advance';
import {SlideManager} from './slide-manager';

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
    this.scrollContainer_ = scrollContainer;

    /** @private @const */
    this.slideManager_ = new SlideManager({
      win,
      element,
      scrollContainer,
      runMutate,
    });

    /** @private @const */
    this.autoAdvance_ = new AutoAdvance({
      win,
      scrollContainer,
      advanceable: this.slideManager_,
    });

    /** @private {number} */
    this.advanceCount_ = 1;

    /** @private {boolean} */
    this.mixedLength_ = false;

    /** @private {!Array<!Element>} */
    this.slides_ = [];

    /** @private {boolean} */
    this.userScrollable_ = true;
  }

  /**
   * Moves forward by the current advance count.
   */
  next() {
    this.slideManager_.advance(this.advanceCount_);
  }

  /**
   * Moves backwards by the current advance count.
   */
  prev() {
    this.slideManager_.advance(-this.advanceCount_);
  }

  /**
   * Moves the carousel to a given index. If the index is out of range, the
   * carousel is not moved.
   * @param {number} index
   */
  goToSlide(index) {
    this.slideManager_.goToSlide(index);
  }

  /**
   * @param {number} advanceCount How many slides to advance by. This is the
   *    number of slides moved forwards/backwards when calling prev/next.
   */
  updateAdvanceCount(advanceCount) {
    this.slideManager_.updateAdvanceCount(advanceCount);
  }

  /**
   * @param {string} alignment How to align slides when snapping or scrolling
   *    to the propgramatticaly (auto advance or next/prev).
   */
  updateAlignment(alignment) {
    this.slideManager_.updateAlignment(alignment);
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
   * @param {boolean} horizontal Whether the carousel should lay out
   *    horizontally or vertically.
   */
  updateHorizontal(horizontal) {
    this.slideManager_.updateHorizontal(horizontal);
  }

  /**
   * @param {number} initialIndex The initial index that should be shown.
   */
  updateInitialIndex(initialIndex) {
    this.slideManager_.updateInitialIndex(initialIndex);
  }

  /**
   * @param {boolean} loop Whether or not the carousel should loop when
   *    reaching the last slide.
   */
  updateLoop(loop) {
    this.slideManager_.updateLoop(loop);
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
    this.slideManager_.updateSideSlideCount(sideSlideCount);
  }

  /**
   * Lets the carousel know that the slides have changed. This is needed for
   * various internal calculations.
   * @param {!Array<!Element>} slides
   */
  updateSlides(slides) {
    this.slideManager_.updateSlides(slides);
  }

  /**
   * @param {boolean} snap Whether or not scrolling should snap on slides.
   */
  updateSnap(snap) {
    this.slideManager_.updateSnap(snap);
  }

  /**
   * @param {number} snapBy Tells the carousel to snap on every nth slide. This
   *    can be useful when used with the visible count to group sets of slides
   *    together.
   */
  updateSnapBy(snapBy) {
    this.slideManager_.updateSnapBy(snapBy);
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
   * slide is at the start / center of the carousel, depending on alignment).
   */
  updateUi() {
    this.runMutate_(() => {
      this.scrollContainer_.setAttribute('mixed-length', this.mixedLength_);
      this.scrollContainer_.setAttribute(
          'user-scrollable', this.userScrollable_);
    });
    this.slideManager_.updateUi();
  }

  /**
   * @param {number} visibleCount How many slides to show at a time within the
   *    carousel. This option is ignored if mixed lengths is set.
   */
  updateVisibleCount(visibleCount) {
    this.slideManager_.updateVisibleCount(visibleCount);
  }
}
