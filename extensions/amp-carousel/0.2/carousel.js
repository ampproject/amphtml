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

/* eslint-disable no-unused-vars */

import {
  Alignment,
  Axis,
  getDimension,
  scrollContainerToElement,
  updateLengthStyle,
} from './dimensions.js';
import {AutoAdvance} from './auto-advance';
import {
  backwardWrappingDistance,
  forwardWrappingDistance,
  wrappingDistance,
} from './array-util.js';
import {debounce} from '../../../src/utils/rate-limit';
import {getStyle, setStyle, setStyles} from '../../../src/style';
import {listenOnce} from '../../../src/event-helper';
import {mod} from '../../../src/utils/math';
import {toArray} from '../../../src/types';

/**
 * How long to wait prior to resetting the scrolling position after the last
 * scroll event. Ideally this should be low, so that once the user stops
 * scrolling, things are immediately centered again. Since there can be some
 * delay between scroll events, and we do not want to move things during a
 * scroll, it cannot be too small. 200ms seems to be around the lower limit for
 * this value on Android / iOS.
 */
const RESET_SCROLL_REFERENCE_POINT_WAIT_MS = 200;

/**
 * Runs a callback while disabling smooth scrolling by temporarily setting
 * the `scrollBehavior` to `auto`.
 * @param {!Element} el
 * @param {Function} cb
 */
function runDisablingSmoothScroll(el, cb) {
  const scrollBehavior = getStyle(el, 'scrollBehavior');

  setStyle(el, 'scrollBehavior', 'auto');
  cb();
  setStyle(el, 'scrollBehavior', scrollBehavior);
}

/**
 * @param {!Array<number>} arr
 * @return {number}
 */
function sum(arr) {
  return arr.reduce((p, c) => p + c, 0);
}

/**
 * How the carousel works when looping:
 *
 * We want to make sure that the user can scroll all the way to the opposite
 * end (either forwards or backwards) of the carousel, but no further (no
 * looping back past where you started). We use spacer elements to adjust the
 * scroll width of the scrolling area to allow the browser to scroll as well as
 * providing targets for the browser to snap on. This is important as these
 * targets need to be present before the scroll starts for things to work
 * correctly.
 *
 * The spacers come in 3 types:
 *
 * - beforeSpacers: These provide scroll/snap before the first slide
 * - replacementSpacers: These take up the spot of the slides as they are
 *   translated around
 * - afterSpacers: These provide scroll/snap targets after the last slide
 *
 * The spacers are then hidden/shown depending on the reference point, called
 * the restingIndex to allow full movement forwards and backwards. You can
 * imagine this looks like the following if you have 5 slides:
 *
 *                [r][r][r][r][r]
 * [b][b][b][b][b][1][2][3][4][5][a][a][a][a][a]
 *
 * b = beforeSpacer, r = replacementSpacer, a = afterSpacer
 *
 * The replacement spacers are stacked on top of the slides.
 * When the restingIndex is the first index, we should translate slides and
 * hide the spacers as follows:
 *
 * [h][ ][ ][4][5][1][2][3][ ][ ][h][h][h][h][h]
 *
 * h = hidden
 *
 * This ensures that if you move left or right, there is a slide to show. Note
 * that we have two empty slots at the start, where slides '2' and '3' will
 * be moved as the user scrolls. Likewise, we have two slots at the end, where
 * slides '4' and '5' will move. Since the other spacers are hidden, the
 * browser cannot scroll into that area.
 *
 * When the user stops scrolling, we update the restingIndex and show/hide the
 * appropriate spacers. For example, if the user started at slide '1' and moved
 * left to slide '4', the UI would update to the following as they scrolled:
 *
 * [h][2][3][4][5][1][ ][ ][ ][ ][h][h][h][h][h]
 *
 * Once scrolling stopped, the reference point would be reset and this would
 * update to:
 *
 * [h][h][h][h][ ][ ][2][3][4][5][1][ ][ ][h][h]
 *
 * Handling sideSlideCount:
 *
 * The carousel may be configured to only show a certain number of slides on
 * either side of the resting index. This limits how far the user can move at
 * a time. This simply hides any slides or spacers that are too far from the
 * resting index. For example, if we have a resting index of '1', we want:
 *
 * [h][h][h][h][5][1][2][h][h][h][h][h][h][h][h]
 *
 * Moving slides:
 *
 * Slides are moved around using `transform: translate` relative to their
 * original resting spot. Slides are moved to be before or after the current
 * slide as the user scrolls. Currently, half the slides are moved before and
 * half the slides are moved after. This could be a bit smarter and only move
 * as many as are necessary to have a sufficient amount of buffer. When slides
 * are moved, they are positioned on top of an existing spacer.
 */
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

    /** @private @const */
    this.debouncedResetScrollReferencePoint_ = debounce(
        win, () => this.resetScrollReferencePoint_(),
        RESET_SCROLL_REFERENCE_POINT_WAIT_MS);

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

    /**@private {!Array<!Element>} */
    this.beforeSpacers_ = [];

    /** @private {!Array<!Element>} */
    this.replacementSpacers_ = [];

    /** @private {!Array<!Element>} */
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
    const {slides_: slides, currentIndex_} = this;

    const newIndex = currentIndex_ + delta;
    const endIndex = slides.length - 1;
    const atStart = currentIndex_ == 0;
    const atEnd = currentIndex_ == endIndex;
    const passingStart = newIndex < 0;
    const passingEnd = newIndex > endIndex;

    if (this.loop_) {
      this.goToSlide(mod(newIndex, endIndex + 1));
    } else if (delta > 0 && this.inLastWindow_(currentIndex_) &&
        this.inLastWindow_(newIndex)) {
      this.goToSlide(0);
    } else if ((passingStart && atStart) || (passingEnd && !atEnd)) {
      this.goToSlide(endIndex);
    } else if ((passingStart && !atStart) || (passingEnd && atEnd)) {
      this.goToSlide(0);
    } else {
      this.goToSlide(newIndex);
    }
  }

  /**
   * Moves the carousel to a given index. If the index is out of range, the
   * carousel is not moved.
   * @param {number} index
   */
  goToSlide(index) {
    if (index < 0 || index > this.slides_.length - 1) {
      return;
    }

    this.updateCurrentIndex_(index);
    this.scrollCurrentIntoView_();
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
      this.updateSpacers_();
      this.setChildrenSnapAlign_();
      this.hideSpacersAndSlides_();
      this.resetScrollReferencePoint_(/* force */true);
      this.ignoreNextScroll_ = true;
      runDisablingSmoothScroll(this.scrollContainer_, () => {
        this.scrollCurrentIntoView_();
      });
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
   * Updates the current index as well as firing an event.
   * @param {number} currentIndex The new current index.
   * @private
   */
  updateCurrentIndex_(currentIndex) {
    this.currentIndex_ = currentIndex;
    // TODO(sparhami) Fire an event.
  }

  /**
   * Handles a touch start, preventing the restWindow_ from running until the
   * user stops touching.
   * @private
   */
  handleTouchStart_() {
    this.touching_ = true;

    listenOnce(window, 'touchend', () => {
      this.touching_ = false;
      this.debouncedResetScrollReferencePoint_();
    }, {
      capture: true,
    });
  }

  /**
   * Handles a scroll event, updating the the current index as well as moving
   * slides around as needed.
   * @private
   */
  handleScroll_() {
    if (this.ignoreNextScroll_) {
      this.ignoreNextScroll_ = false;
      return;
    }

    this.updateCurrent_();
    this.debouncedResetScrollReferencePoint_();
  }
  /**
   * @param {!Element} el The slide or spacer to move.
   * @param {number} revolutions How many revolutions forwards (or backwards)
   *    the slide or spacer should move.
   * @param {number} revolutionLength The length of a single revolution around
   *    the scrollable area.
   * @private
   */
  setElementTransform_(el, revolutions, revolutionLength) {
    // TODO(sparhami) implement
  }

  /**
   * Resets the transforms for all the slides, putting them back in their
   * natural position.
   * @private
   */
  resetSlideTransforms_() {
    // TODO(sparhami) implement
  }

  /**
   * @return {!Array<number>}} An array of the lengths of the slides.
   * @private
   */
  getSlideLengths_() {
    return this.slides_.map(s => getDimension(this.axis_, s).length);
  }

  /**
   * @param {number} count The number of spacers to create
   * @return {!Array<!Element>} An array of spacers.
   * @private
   */
  createSpacers_(count) {
    const spacers = [];
    for (let i = 0; i < count; i++) {
      const spacer = document.createElement('div');
      spacer.className = 'i-amphtml-carousel-spacer';
      spacers.push(spacer);
    }
    return spacers;
  }

  /**
   * Updates the spacers, removing the old ones and creating new ones.
   * @private
   */
  updateSpacers_() {
    const {axis_, slides_} = this;
    const slideLengths = this.getSlideLengths_();
    const totalLength = sum(slideLengths);
    const count = this.loop_ ? slides_.length : 0;

    // Replace the before spacers.
    this.beforeSpacers_.forEach(spacer => {
      this.scrollContainer_.removeChild(spacer);
    });
    this.beforeSpacers_ = this.createSpacers_(count);
    this.beforeSpacers_.forEach((spacer, i) => {
      updateLengthStyle(axis_, spacer, slideLengths[i]);
      this.scrollContainer_.insertBefore(spacer, slides_[0]);
    });

    // Replace the replacement spacers.
    this.replacementSpacers_.forEach(spacer => {
      this.scrollContainer_.removeChild(spacer);
    });
    this.replacementSpacers_ = this.createSpacers_(count);
    this.replacementSpacers_.forEach((spacer, i) => {
      updateLengthStyle(axis_, spacer, slideLengths[i]);
      // Translate these 1 revolution up, so they end up on top of the slides.
      this.setElementTransform_(spacer, -1, totalLength);
      this.scrollContainer_.appendChild(spacer);
    });

    // Replace the after spacers.
    this.afterSpacers_.forEach(spacer => {
      this.scrollContainer_.removeChild(spacer);
    });
    this.afterSpacers_ = this.createSpacers_(count);
    this.afterSpacers_.forEach((spacer, i) => {
      updateLengthStyle(axis_, spacer, slideLengths[i]);
      // Translate these 1 revolution up, so they end up right after the
      // slides (where the replacement spacers were).
      this.setElementTransform_(spacer, -1, totalLength);
      this.scrollContainer_.appendChild(spacer);
    });
  }

  /**
   * Updates the snap-align for all spacers/slides. The spacers have the same
   * snap property as the associated slide.
   * @private
   */
  setChildrenSnapAlign_() {
    const slideCount = this.slides_.length;
    const startAligned = this.alignment_ == Alignment.START ;
    const oddVisibleCount = mod(this.visibleCount_, 2) == 1;
    // For the legacy scroll-snap-coordinate, when center aligning with an odd
    // count, actually use a start coordinate. Otherwise it will snap to the
    // center of the slides near the edge of the container. That is
    //    ______________             _____________
    // [ | ][   ][   ][ | ]   vs.   [   ][   ][   ]
    //    ‾‾‾‾‾‾‾‾‾‾‾‾‾‾             ‾‾‾‾‾‾‾‾‾‾‾‾‾
    const coordinate = startAligned || oddVisibleCount ? '0%' : '50%';

    toArray(this.scrollContainer_.children).forEach((child, index) => {
      // Note that we are dealing with both spacers, so we need to make sure
      // we are always dealing with the slideIndex. Since we have the same
      // number of each type of spacer as we do slides, we can simply do a mod
      // to do the mapping.
      const slideIndex = mod(index, slideCount);
      // If an item is at the start of the group, it gets an aligned.
      const shouldSnap = mod(slideIndex, this.snapBy_ == 0);

      setStyles(child, {
        'scroll-snap-align': shouldSnap ? this.alignment_ : 'none',
        'scroll-snap-coordinate': shouldSnap ? coordinate : 'none',
      });
    });
  }

  /**
   * Hides any spacers or slides that are not currently necessary. Slides may
   * be hidden if sideSlideCount is specified. Enough spacers are shown to
   * allow 1 revolution of scrolling (not including the current slide) before
   * / after the current slide. The rest of the spacers are hidden.
   *
   * Note that spacers are sized the same as the slide that they replace. As a
   * result, we need to hide the correct spacers rather than simply the
   * correct number of them.
   *
   * @private
   */
  hideSpacersAndSlides_() {
    const {
      afterSpacers_,
      replacementSpacers_,
      beforeSpacers_,
      currentIndex_,
      loop_,
      slides_,
    } = this;
    const sideSlideCount = Math.min(slides_.length - 1, this.sideSlideCount_);
    const numBeforeSpacers = Math.max(0, slides_.length - currentIndex_ - 1);
    const numAfterSpacers = Math.max(0, currentIndex_ - 1);

    [slides_, replacementSpacers_].forEach(elements => {
      elements.forEach((el, i) => {
        const distance = loop_ ?
          wrappingDistance(currentIndex_, i, elements) :
          Math.abs(currentIndex_ - i);
        const tooFar = distance > sideSlideCount;
        el.hidden = tooFar;
      });
    });

    beforeSpacers_.forEach((el, i) => {
      const distance = backwardWrappingDistance(
          currentIndex_, i, beforeSpacers_);
      const tooFar = distance > sideSlideCount;
      el.hidden = tooFar || i < slides_.length - numBeforeSpacers;
    });

    afterSpacers_.forEach((el, i) => {
      const distance = forwardWrappingDistance(
          currentIndex_, i, afterSpacers_);
      const tooFar = distance > sideSlideCount;
      el.hidden = tooFar || i > numAfterSpacers;
    });
  }

  /**
   * Updates the current element. If the current element has changed, then
   * slides are moved around as necessary before/after the current slide.
   * @private
   */
  updateCurrent_() {
    // TODO(sparhami) implement
  }

  /**
   * Resets the frame of reference for scrolling, centering things around the
   * current index and moving things as appropriate.
   * @param {boolean} force Whether or not to force the window reset, ignoring
   *    whether or not the resting index has changed.
   * @private
   */
  resetScrollReferencePoint_(force = false) {
    // Make sure if the user is in the middle of a drag, we do not move
    // anything.
    if (this.touching_) {
      return;
    }

    // We are still on the same slide, so nothing needs to move.
    if (this.restingIndex_ == this.currentIndex_ && !force) {
      return;
    }

    const totalLength = sum(this.getSlideLengths_());

    this.runMutate_(() => {
      this.restingIndex_ = this.currentIndex_;

      this.resetSlideTransforms_();
      this.hideSpacersAndSlides_();
      this.moveSlides_(totalLength);
      this.restoreScrollStart_();
    });
  }

  /**
   * Updates the scroll start of the scrolling element. This restores the
   * scroll position to the same offset within the currentElement as before.
   * This is useful when some layout has occured that may change the existing
   * scroll position.
   * @private
   */
  restoreScrollStart_() {
    // TODO(sparhami) implement
  }

  /**
   * Scrolls the current element into view based on its alignment,
   * @private
   */
  scrollCurrentIntoView_() {
    scrollContainerToElement(
        this.slides_[this.currentIndex_],
        this.scrollContainer_,
        this.axis_,
        this.alignment_
    );
  }

  /**
   * Moves slides that are not at the current index before or after by
   * translating them if necessary.
   * @param {number} totalLength The total length of all the slides.
   * @private
   */
  moveSlides_(totalLength) {
    // TODO(sparhami) implement
  }

  /**
   * Checks if a given index is in the last window of items. For example, if
   * showing two slides at a time with the slides [a, b, c, d], both slide
   * b and c are in the last window.
   * @param {number} index The index to check.
   * @return {boolean} True if the slide is in the last window, false
   *    otherwise.
   */
  inLastWindow_(index) {
    const {alignment_, slides_, visibleCount_} = this;
    const startAligned = alignment_ == Alignment.START;
    const lastWindowSize = startAligned ? visibleCount_ : visibleCount_ / 2;

    return index >= slides_.length - lastWindowSize;
  }
}
