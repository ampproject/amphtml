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

import {ActionSource} from './action-source';
import {
  Alignment,
  Axis,
  findOverlappingIndex,
  getDimension,
  getScrollPosition,
  scrollContainerToElement,
  setScrollPosition,
  setTransformTranslateStyle,
  updateLengthStyle,
} from './dimensions.js';
import {AutoAdvance} from './auto-advance';
import {CarouselAccessibility} from './carousel-accessibility';
import {backwardWrappingDistance, forwardWrappingDistance} from './array-util';
import {clamp, mod} from '../../../src/utils/math';
import {createCustomEvent, listen, listenOnce} from '../../../src/event-helper';
import {debounce} from '../../../src/utils/rate-limit';
import {dict} from '../../../src/utils/object';
import {
  getStyle,
  setImportantStyles,
  setStyle,
  setStyles,
} from '../../../src/style';
import {iterateCursor} from '../../../src/dom';

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
 * Moving slides:
 *
 * Slides are moved around using `transform: translate` relative to their
 * original resting spot. Slides are moved to be before or after the current
 * slide as the user scrolls. Currently, half the slides are moved before and
 * half the slides are moved after. This could be a bit smarter and only move
 * as many as are necessary to have a sufficient amount of buffer. When slides
 * are moved, they are positioned on top of an existing spacer.
 *
 * Initial index:
 *
 * The initial index can be specified, which will make the carousel scroll to
 * the desired index when it first renders. Since the layout of the slides is
 * asynchronous, this should be used instead of calling `goToSlide` after
 * creating the carousel.
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
  constructor({win, element, scrollContainer, runMutate}) {
    /** @private @const */
    this.win_ = win;

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
    this.carouselAccessibility_ = new CarouselAccessibility({
      win,
      element,
      scrollContainer,
      runMutate,
      stoppable: this.autoAdvance_,
    });

    /** @private @const */
    this.debouncedResetScrollReferencePoint_ = debounce(
      win,
      () => this.resetScrollReferencePoint_(),
      RESET_SCROLL_REFERENCE_POINT_WAIT_MS
    );

    /** @private {number} */
    this.advanceCount_ = 1;

    /** @private {number} */
    this.autoAdvanceLoops_ = Number.POSITIVE_INFINITY;

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

    /** @private {!Array<!Element>} */
    this.allSpacers_ = [];

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
     * Keeps track of an index that was requested to be scrolled to
     * programmatically. This is used to make sure that the carousel ends on
     * the  right slide if a UI update was requested during a programmatic
     * scroll. This is cleared when the user manually scrolls.
     * @private {number?}
     */
    this.requestedIndex_ = null;

    /**
     * The reference index where the the scrollable area last stopped
     * scrolling. This slide is not translated and other slides are translated
     * to move before or after as needed. This is also used when looping to
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

    /**
     * Whether or not there is a scroll in progress. This is tracked from the
     * first scroll event, until RESET_SCROLL_REFERENCE_POINT_WAIT_MS after the
     * last scroll event is received. This is used to prevent programmatic
     * scroll requests while a scroll is in progress.
     * @private {boolean}
     */
    this.scrolling_ = false;

    /**
     * Tracks the source of what cause the carousel to change index. This can
     * be provided when moving the carousel programmatically, and the value
     * will be propagated.
     * @private {!ActionSource|undefined}
     */
    this.actionSource_ = undefined;

    /** @private {!Alignment} */
    this.alignment_ = Alignment.START;

    /** @private {!Axis} */
    this.axis_ = Axis.X;

    /**
     * Whether slides are laid out in the forwards or reverse direction. When
     * using rtl (right to left), this should be false. This is used to set the
     * transforms for slides and spacers correctly when the flex direction is
     * reversed due to a rtl direction. TODO(sparhami) is there some way we
     * could get this to work without needing to be explicitly told what the
     * direction is?
     * @private {boolean}
     */
    this.forwards_ = true;

    /**
     * TODO(sparhami) Rename this to `activeIndex`. We do not want to expose
     * this as it changes, only when the user stops scrolling. Also change
     * restingIndex to currentIndex.
     * @private {number}
     */
    this.currentIndex_ = 0;

    /**
     * Whether or not looping is requested. Do not use directly, but rather use
     * `isLooping` instead.
     * @private {boolean}
     */
    this.loop_ = false;

    /** @private {boolean} */
    this.snap_ = true;

    /** @private {number} */
    this.snapBy_ = 1;

    /** @private {number} */
    this.visibleCount_ = 1;

    this.scrollContainer_.addEventListener(
      'scroll',
      () => this.handleScroll_(),
      true
    );
    this.scrollContainer_.addEventListener(
      'scrollend',
      () => this.handleScrollEnd_(),
      true
    );
    listen(
      this.scrollContainer_,
      'touchstart',
      () => this.handleTouchStart_(),
      {capture: true, passive: true}
    );
    listen(this.scrollContainer_, 'wheel', () => this.handleWheel_(), {
      capture: true,
      passive: true,
    });
  }

  /**
   * Moves forward by the current advance count.
   * @param {!ActionSource=} actionSource
   */
  next(actionSource) {
    this.advance(this.advanceCount_, {actionSource});
  }

  /**
   * Moves backwards by the current advance count.
   * @param {!ActionSource=} actionSource
   */
  prev(actionSource) {
    this.advance(-this.advanceCount_, {actionSource});
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
   * @param {{
   *   actionSource: (!ActionSource|undefined),
   *   allowWrap: (boolean|undefined),
   * }=} options
   */
  advance(delta, {actionSource, allowWrap = false} = {}) {
    const {slides_, currentIndex_, requestedIndex_} = this;

    // If we have a requested index, use that as the reference point. The
    // current index may not be updated yet.This allows calling `advance`
    // multiple times in a row and ending on the correct slide.
    const index = requestedIndex_ != null ? requestedIndex_ : currentIndex_;
    const newIndex = index + delta;
    const endIndex = slides_.length - 1;
    const atStart = index == 0;
    const atEnd = index == endIndex;
    const passingStart = newIndex < 0;
    const passingEnd = newIndex > endIndex;

    let slideIndex;
    if (this.isLooping()) {
      slideIndex = mod(newIndex, endIndex + 1);
    } else if (!allowWrap) {
      slideIndex = clamp(0, newIndex, endIndex);
    } else if (
      delta > 0 &&
      this.inLastWindow_(index) &&
      this.inLastWindow_(newIndex)
    ) {
      slideIndex = 0;
    } else if ((passingStart && atStart) || (passingEnd && !atEnd)) {
      slideIndex = endIndex;
    } else if ((passingStart && !atStart) || (passingEnd && atEnd)) {
      slideIndex = 0;
    } else {
      slideIndex = newIndex;
    }

    this.goToSlide(slideIndex, {actionSource});
  }

  /**
   * Pauses the auto advance temporarily. This can be resumed by calling
   * resumeAutoAdvance. This should only be used internally for the carousel
   * implementation and not exposed.
   */
  pauseAutoAdvance() {
    this.autoAdvance_.pause();
  }

  /**
   * Resumes auto advance when paused by pauseAutoAdvance. Note that if the
   * autoadvance has been stopped, this has no effect. This should only be used
   * internally for the carousel implementation and not exposed.
   */
  resumeAutoAdvance() {
    this.autoAdvance_.resume();
  }

  /**
   * @return {number} The current index of the carousel.
   */
  getCurrentIndex() {
    return this.currentIndex_;
  }

  /**
   * @return {number} The number of items visible at a time.
   */
  getVisibleCount() {
    return this.visibleCount_;
  }

  /**
   * Checks whether or not looping is enabled. This requires that looping is
   * configured and that there are enough slides to do looping.
   * @return {boolean} Whether or not looping is enabled.
   */
  isLooping() {
    return this.loop_ && this.slides_.length / this.visibleCount_ >= 3;
  }

  /**
   * Moves the carousel to a given index. If the index is out of range, the
   * carousel is not moved.
   * @param {number} index
   * @param {{
   *   smoothScroll: (boolean|undefined),
   *   actionSource: (!ActionSource|undefined),
   * }=} options
   */
  goToSlide(index, {smoothScroll = true, actionSource} = {}) {
    if (index < 0 || index > this.slides_.length - 1 || isNaN(index)) {
      return;
    }

    if (index == this.currentIndex_) {
      return;
    }

    // If the user is interacting with the carousel, either by touching or by
    // a momentum scroll, ignore programmatic requests as the user's
    // interaction is much more important.
    if (this.touching_ || this.isUserScrolling_()) {
      return;
    }

    this.requestedIndex_ = index;
    this.actionSource_ = actionSource;
    this.scrollSlideIntoView_(this.slides_[index], {smoothScroll});
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
   * @param {number} autoAdvanceLoops The number of loops through the carousel
   *    that should be autoadvanced before stopping. This defaults to infinite
   *    loops.
   */
  updateAutoAdvanceLoops(autoAdvanceLoops) {
    this.autoAdvanceLoops_ = autoAdvanceLoops;
    this.updateUi();
  }

  /**
   * @param {boolean} forwards Whether or not the advancement direction is
   *    forwards (e.g. ltr) or reverse (e.g. rtl).
   */
  updateForwards(forwards) {
    this.forwards_ = forwards;
    this.updateUi();
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
    this.carouselAccessibility_.updateMixedLength(mixedLength);
    this.updateUi();
  }

  /**
   * Lets the scrollable know that the slides have changed. This is needed for
   * various internal calculations.
   * @param {!Array<!Element>} slides
   */
  updateSlides(slides) {
    this.slides_ = slides;
    this.carouselAccessibility_.updateSlides(slides);
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
   *    advanced via next, prev, goToSlide or autoAdvance.
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
        'user-scrollable',
        this.userScrollable_
      );
      this.scrollContainer_.setAttribute('horizontal', this.axis_ == Axis.X);
      this.scrollContainer_.setAttribute('loop', this.isLooping());
      this.scrollContainer_.setAttribute('snap', this.snap_);
      // TODO(sparhami) Do not use CSS custom property
      setImportantStyles(this.scrollContainer_, {
        '--visible-count': this.visibleCount_,
      });

      if (!this.slides_.length) {
        return;
      }

      this.autoAdvance_.updateMaxAdvances(
        this.autoAdvanceLoops_ * this.slides_.length - 1
      );
      this.updateSpacers_();
      this.setChildrenSnapAlign_();
      this.hideSpacersAndSlides_();
      this.resetScrollReferencePoint_(/* force */ true);
    });
  }

  /**
   * @param {number} visibleCount How many slides to show at a time within the
   *    scrollable. This option is ignored if mixed lengths is set.
   */
  updateVisibleCount(visibleCount) {
    this.visibleCount_ = Math.max(1, visibleCount);
    this.carouselAccessibility_.updateVisibleCount(visibleCount);
    this.updateUi();
  }

  /**
   * Updates the resting index as well as firing an event.
   * @param {number} restingIndex The new resting index.
   * @private
   */
  updateRestingIndex_(restingIndex) {
    this.restingIndex_ = restingIndex;
    this.element_.dispatchEvent(
      createCustomEvent(
        this.win_,
        'indexchange',
        dict({
          'index': restingIndex,
          'actionSource': this.actionSource_,
        })
      )
    );
  }

  /**
   * Fires an event when the scroll position has changed, once scrolling has
   * settled. In some situations, the index may not change, but you still want
   * to react to the scroll position changing.
   */
  notifyScrollPositionChanged_() {
    this.element_.dispatchEvent(
      createCustomEvent(this.win_, 'scrollpositionchange', null)
    );
  }

  /**
   * Handles a touch start, preventing `resetScrollReferencePoint_` from
   * running until the user stops touching.
   * @private
   */
  handleTouchStart_() {
    this.touching_ = true;
    this.actionSource_ = ActionSource.TOUCH;
    this.requestedIndex_ = null;

    listenOnce(
      window,
      'touchend',
      () => {
        this.touching_ = false;
        this.debouncedResetScrollReferencePoint_();
      },
      {
        capture: true,
        passive: true,
      }
    );
  }

  /**
   * Handles a wheel event.
   * @private
   */
  handleWheel_() {
    this.actionSource_ = ActionSource.WHEEL;
    this.requestedIndex_ = null;
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

    this.scrolling_ = true;
    this.updateCurrent_();
    this.debouncedResetScrollReferencePoint_();
  }

  /**
   * For browsers that support the scrollend event, reset the reference point
   * immediately. This prevents users from hitting the wrapping point while
   * scrolling continually.
   */
  handleScrollEnd_() {
    this.resetScrollReferencePoint_();
  }

  /**
   * @return {boolean} Whether or not the user is scrolling. For example, the
   *    user flicked the carousel and there is a momentum scroll in progress.
   */
  isUserScrolling_() {
    return (
      this.scrolling_ &&
      (this.actionSource_ == ActionSource.TOUCH ||
        this.actionSource_ == ActionSource.WHEEL)
    );
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
    const dir = this.forwards_ ? 1 : -1;
    const delta = revolutions * revolutionLength * dir;
    setTransformTranslateStyle(this.axis_, el, delta);
    el._revolutions = revolutions;
  }

  /**
   * Resets the transforms for all the slides, putting them back in their
   * natural position.
   * @param {number} totalLength The total length of all the slides.
   * @private
   */
  resetSlideTransforms_(totalLength) {
    const revolutions = 0; // Sets the slide back to the initial position.
    this.slides_.forEach(slide => {
      this.setElementTransform_(slide, revolutions, totalLength);
    });
  }

  /**
   * @return {!Array<number>}} An array of the lengths of the slides.
   * @private
   */
  getSlideLengths_() {
    return this.slides_.map(s => getDimension(this.axis_, s).length);
  }

  /**
   * @return {boolean} True if the carousel is not looping, and is at the
   *    start, false otherwise.
   */
  isAtEnd() {
    if (this.isLooping()) {
      return false;
    }

    const el = this.scrollContainer_;
    const {width} = el./*OK*/ getBoundingClientRect();
    return el./*OK*/ scrollLeft + width >= el./*OK*/ scrollWidth;
  }

  /**
   * @return {boolean} True if the carousel is not looping, and is at the
   *    end, false otherwise.
   */
  isAtStart() {
    if (this.isLooping()) {
      return false;
    }

    return this.scrollContainer_./*OK*/ scrollLeft <= 0;
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
    const count = this.isLooping() ? slides_.length : 0;

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

    this.allSpacers_ = this.beforeSpacers_.concat(
      this.replacementSpacers_,
      this.afterSpacers_
    );
  }

  /**
   * Updates the snap-align for all spacers/slides. The spacers have the same
   * snap property as the associated slide.
   * @private
   */
  setChildrenSnapAlign_() {
    const slideCount = this.slides_.length;
    const startAligned = this.alignment_ == Alignment.START;
    const oddVisibleCount = mod(this.visibleCount_, 2) == 1;
    // For the legacy scroll-snap-coordinate, when center aligning with an odd
    // count, actually use a start coordinate. Otherwise it will snap to the
    // center of the slides near the edge of the container. That is
    //    ______________             _____________
    // [ | ][   ][   ][ | ]   vs.   [   ][   ][   ]
    //    ‾‾‾‾‾‾‾‾‾‾‾‾‾‾             ‾‾‾‾‾‾‾‾‾‾‾‾‾
    const coordinate = startAligned || oddVisibleCount ? '0%' : '50%';

    iterateCursor(this.scrollContainer_.children, (child, index) => {
      // Note that we are dealing with both spacers, so we need to make sure
      // we are always dealing with the slideIndex. Since we have the same
      // number of each type of spacer as we do slides, we can simply do a mod
      // to do the mapping.
      const slideIndex = mod(index, slideCount);
      // If an item is at the start of the group, it gets an aligned.
      const shouldSnap = mod(slideIndex, this.snapBy_) == 0;

      setStyles(child, {
        'scroll-snap-align': shouldSnap ? this.alignment_ : 'none',
        'scroll-snap-coordinate': shouldSnap ? coordinate : 'none',
      });
    });
  }

  /**
   * Hides any spacers or slides that are not currently necessary. Enough
   * spacers are shown to allow 1 revolution of scrolling (not including the
   * current slide) before / after the current slide. The rest of the spacers
   * are hidden.
   *
   * Note that spacers are sized the same as the slide that they replace. As a
   * result, we need to hide the correct spacers rather than simply the
   * correct number of them.
   *
   * @private
   */
  hideSpacersAndSlides_() {
    const {afterSpacers_, beforeSpacers_, currentIndex_, slides_} = this;
    const numBeforeSpacers = Math.max(0, slides_.length - currentIndex_ - 1);
    const numAfterSpacers = Math.max(0, currentIndex_ - 1);

    beforeSpacers_.forEach((el, i) => {
      const distance = backwardWrappingDistance(
        currentIndex_,
        i,
        beforeSpacers_
      );
      const tooFar = distance > slides_.length - 1;
      el.hidden = tooFar || i < slides_.length - numBeforeSpacers;
    });

    afterSpacers_.forEach((el, i) => {
      const distance = forwardWrappingDistance(currentIndex_, i, afterSpacers_);
      const tooFar = distance > slides_.length - 1;
      el.hidden = tooFar || i > numAfterSpacers;
    });
  }

  /**
   * Updates the current element. If the current element has changed, then
   * slides are moved around as necessary before/after the current slide.
   * @private
   */
  updateCurrent_() {
    const {
      allSpacers_,
      alignment_,
      axis_,
      currentIndex_,
      scrollContainer_,
      slides_,
    } = this;
    const totalLength = sum(this.getSlideLengths_());
    // When looping, we translate the slides, but the slides might decide to
    // translate their content instead of the whole slide. As a result, we need
    // to use the spacers to figure out where we are rather than the slides
    // themselves.
    // Note: we do not check looping directly, since the spacers / layout are
    // updated asynchronously.
    const hasSpacers = !!allSpacers_.length;
    const items = hasSpacers ? allSpacers_ : slides_;
    const startIndex = hasSpacers
      ? currentIndex_ + slides_.length
      : currentIndex_;
    const overlappingIndex = findOverlappingIndex(
      axis_,
      alignment_,
      scrollContainer_,
      items,
      startIndex
    );

    // Currently not over a slide (e.g. on top of overscroll area).
    if (overlappingIndex === undefined) {
      return;
    }

    // Since we are potentially looking accross all spacers, we need to convert
    // to a slide index.
    const newIndex = overlappingIndex % slides_.length;
    // Update the current offset on each scroll so that we have it up to date
    // in case of a resize.
    const currentElement = slides_[newIndex];
    const {start: elementStart} = getDimension(axis_, currentElement);
    const {start: containerStart} = getDimension(axis_, scrollContainer_);

    this.currentElementOffset_ = elementStart - containerStart;

    // We did not move at all.
    if (newIndex == currentIndex_) {
      return;
    }

    this.runMutate_(() => {
      this.currentIndex_ = newIndex;
      this.moveSlides_(totalLength);
    });
  }

  /**
   * Resets the frame of reference for scrolling, centering things around the
   * current index and moving things as appropriate.
   * @param {boolean} force Whether or not to force the window reset, ignoring
   *    whether or not the resting index has changed.
   * @private
   */
  resetScrollReferencePoint_(force = false) {
    this.scrolling_ = false;
    this.runMutate_(() => {
      this.notifyScrollPositionChanged_();
    });

    // Make sure if the user is in the middle of a drag, we do not move
    // anything.
    if (this.touching_) {
      return;
    }

    // Check if the resting index we are centered around is the same as where
    // we stopped scrolling. If so, we do not want move anything or fire an
    // event. If we have a programmatic scroll request, we still need to move
    // to that index.
    if (
      this.restingIndex_ == this.currentIndex_ &&
      this.requestedIndex_ == null &&
      !force
    ) {
      return;
    }

    // We are updating during a programmatic scroll, so go to the correct
    // index.
    if (this.requestedIndex_ != null) {
      this.currentIndex_ = this.requestedIndex_;
      this.requestedIndex_ = null;
    }

    const totalLength = sum(this.getSlideLengths_());

    this.runMutate_(() => {
      this.updateRestingIndex_(this.currentIndex_);

      this.resetSlideTransforms_(totalLength);
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
    const {
      axis_,
      currentElementOffset_,
      currentIndex_,
      scrollContainer_,
      slides_,
    } = this;
    const currentElement = slides_[currentIndex_];
    const {length: containerLength, start: containerStart} = getDimension(
      axis_,
      scrollContainer_
    );
    const {start: elementStart} = getDimension(axis_, currentElement);
    const scrollPos = getScrollPosition(axis_, scrollContainer_);
    const offset =
      Math.abs(currentElementOffset_) <= containerLength
        ? currentElementOffset_
        : 0;
    const pos = elementStart - offset - containerStart + scrollPos;

    this.ignoreNextScroll_ = true;
    runDisablingSmoothScroll(scrollContainer_, () => {
      setScrollPosition(axis_, scrollContainer_, pos);
    });
  }

  /**
   * Scrolls a slide into view based on its alignment.
   * @param {!Element} slide
   * @param {{
   *   smoothScroll: boolean,
   * }} options
   * @private
   */
  scrollSlideIntoView_(slide, {smoothScroll}) {
    const runner = smoothScroll ? (el, cb) => cb() : runDisablingSmoothScroll;
    runner(this.scrollContainer_, () => {
      scrollContainerToElement(
        slide,
        this.scrollContainer_,
        this.axis_,
        this.alignment_
      );
    });
  }

  /**
   * Moves slides before or after the current index by setting setting a
   * translate.
   * @param {number} totalLength The total length of all the slides.
   * @param {number} count How many slides to move.
   * @param {boolean} isAfter Whether the slides should move after or before.
   * @private
   */
  moveSlidesBeforeOrAfter__(totalLength, count, isAfter) {
    const {currentIndex_, restingIndex_, slides_} = this;
    const current = slides_[currentIndex_];
    const currentRevolutions = current._revolutions || 0;
    const dir = isAfter ? 1 : -1;

    for (let i = 1; i <= count; i++) {
      const elIndex = mod(currentIndex_ + i * dir, slides_.length);

      // We do not want to move the slide that we started at.
      if (elIndex === restingIndex_ && currentIndex_ !== restingIndex_) {
        break;
      }

      const el = slides_[elIndex];
      // Check if the element is on the wrong side of the current index.
      const needsMove = elIndex > currentIndex_ !== isAfter;
      const revolutions = needsMove
        ? currentRevolutions + dir
        : currentRevolutions;

      this.setElementTransform_(el, revolutions, totalLength);
    }
  }

  /**
   * Moves slides that are not at the current index before or after by
   * translating them if necessary.
   * @param {number} totalLength The total length of all the slides.
   * @private
   */
  moveSlides_(totalLength) {
    if (!this.isLooping()) {
      return;
    }

    // TODO(sparhami) We could only the number of slides needed to have enough
    // buffer between scrolls. One thing we need to look out for is to make
    // sure the mixed length and visibleCount cases are handled correctly.
    // TODO(sparhami) The current approach of moving a set number of slides
    // does not work well for the mixed length use case.
    const {alignment_, slides_, visibleCount_} = this;
    const isStartAligned = alignment_ == Alignment.START;
    // How many slides fit into the current "window" of slides. When center
    // aligning, we can ignore this as we want to have the same amount on both
    // sides.
    const windowSlideCount = isStartAligned ? visibleCount_ - 1 : 0;
    const beforeCount = (slides_.length - 1 - windowSlideCount) / 2;
    const afterCount = (slides_.length - 1 + windowSlideCount) / 2;

    this.moveSlidesBeforeOrAfter__(totalLength, Math.round(beforeCount), false);
    this.moveSlidesBeforeOrAfter__(totalLength, Math.round(afterCount), true);
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
