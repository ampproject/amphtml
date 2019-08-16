/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {POLL_INTERVAL_MS} from './page-advancement';
import {Services} from '../../../src/services';
import {
  StateProperty,
  UIType,
  getStoreService,
} from './amp-story-store-service';
import {dev, devAssert} from '../../../src/log';
import {escapeCssSelectorNth} from '../../../src/css';
import {findIndex} from '../../../src/utils/array';
import {hasOwn, map} from '../../../src/utils/object';
import {removeChildren, scopedQuerySelector} from '../../../src/dom';
import {scale, setImportantStyles, setStyle} from '../../../src/style';

/**
 * Transition used to show the progress of a media. Has to be linear so the
 * animation is smooth and constant.
 * @const {string}
 */
const TRANSITION_LINEAR = `transform ${POLL_INTERVAL_MS}ms linear`;

/**
 * Transition used to fully fill or unfill a progress bar item.
 * @const {string}
 */
const TRANSITION_EASE = 'transform 200ms ease';

/**
 * Maximum number of segments that can be shown at a time before collapsing
 * into ellipsis.
 * @const {number}
 */
const MAX_SEGMENTS = 20;

/**
 * Maximum number of segments that can be transformed into ellipsis on each
 * side.
 * @const {number}
 */
const MAX_SEGMENT_ELLIPSIS = 3;

/**
 * Size in pixels of the total side margins of a segment.
 * @const {number}
 */
const SEGMENTS_MARGIN_PX = 4;

/**
 * Size in pixels of a segment ellipse.
 * @const {number}
 */
const ELLIPSE_WIDTH_PX = 3;

/**
 * Max number of segments we introduce to the bar as we pass an overflow point
 * (when user reaches ellipsis).
 * @const {number}
 */
const MAX_SEGMENT_INCREMENT = 5;

/** @enum {number} */
const DIRECTION = {
  LEFT: -1,
  RIGHT: 1,
};

/**
 * Progress bar for <amp-story>.
 */
export class ProgressBar {
  /**
   * @param {!Window} win
   * @param {!Element} storyEl
   */
  constructor(win, storyEl) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /** @private {?Element} */
    this.root_ = null;

    /** @private {number} */
    this.segmentCount_ = 0;

    /** @private {number} */
    this.activeSegmentIndex_ = 0;

    /** @private {number} */
    this.activeSegmentProgress_ = 1;

    /** @private {!Element} */
    this.storyEl_ = storyEl;

    /** @private {boolean} */
    this.overflowProgressBarBuilt_ = false;

    /**
     * Width of the progress bar in pixels.
     * @private {number}
     */
    this.barWidthPx_ = 0;

    /**
     * Translate applied to a progress bar when the overflow point is passed.
     * @private {number}
     */
    this.barTranslateX_ = 0;

    /**
     * Ellipsis are applied when a story contains more pages than MAX_SEGMENTS.
     * Tail corresponds to the ellipsis on the opposite direction of navigation.
     * Head corresponds to the ellipsis towards the side of navigation.
     * @private {!Object}
     */
    this.ellipsis_ = {
      upperIndexTail: 0, // Index furthest from the active index in the tail ellipsis.
      upperIndexHead: 0, // Index furthest from the active index in the head ellipsis.
      headIndices: [],
      tailIndices: [],
    };

    /** @private @const {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win_);

    /** @private {!Object<string, number>} */
    this.segmentIdMap_ = map();

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    /** @private {string} */
    this.activeSegmentId_ = '';
  }

  /**
   * @param {!Window} win
   * @param {!Element} storyEl
   * @return {ProgressBar}
   */
  static create(win, storyEl) {
    return new ProgressBar(win, storyEl);
  }

  /**
   * Builds the progress bar.
   *
   * @return {!Element}
   */
  build() {
    if (this.isBuilt_) {
      return this.getRoot();
    }

    this.root_ = this.win_.document.createElement('ol');
    this.root_.classList.add('i-amphtml-story-progress-bar');
    this.barWidthPx_ = this.storyEl_
      .querySelector('amp-story-page')
      .getBoundingClientRect().width;

    this.storeService_.subscribe(
      StateProperty.PAGE_IDS,
      pageIds => {
        if (this.isBuilt_) {
          this.clear_();
        }

        pageIds.forEach(id => {
          if (!(id in this.segmentIdMap_)) {
            this.addSegment_(id);
          }
        });

        this.setSegmentSize_(this.getSegmentWidth_(0));

        if (this.isBuilt_) {
          this.updateProgress(
            this.activeSegmentId_,
            this.activeSegmentProgress_,
            true /** updateAllSegments */
          );
        }
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.RTL_STATE,
      rtlState => {
        this.onRtlStateUpdate_(rtlState);
      },
      true /** callToInitialize */
    );

    this.isBuilt_ = true;
    return this.getRoot();
  }

  /**
   * Reacts to RTL state updates and triggers the UI for RTL.
   * @param {boolean} rtlState
   * @private
   */
  onRtlStateUpdate_(rtlState) {
    this.vsync_.mutate(() => {
      rtlState
        ? this.getRoot().setAttribute('dir', 'rtl')
        : this.getRoot().removeAttribute('dir');
    });
  }

  /**
   * Builds a new segment element and appends it to the progress bar.
   *
   * @private
   */
  buildSegmentEl_() {
    const segmentProgressBar = this.win_.document.createElement('li');
    segmentProgressBar.classList.add('i-amphtml-story-page-progress-bar');
    const segmentProgressValue = this.win_.document.createElement('div');
    segmentProgressValue.classList.add('i-amphtml-story-page-progress-value');
    segmentProgressBar.appendChild(segmentProgressValue);
    this.root_.appendChild(segmentProgressBar);
  }

  /**
   * Clears the progress bar.
   */
  clear_() {
    removeChildren(devAssert(this.root_));
    this.segmentIdMap_ = map();
    this.segmentCount_ = 0;
  }

  /**
   * Adds a segment to the progress bar.
   *
   * @param {string} id The id of the segment.
   * @private
   */
  addSegment_(id) {
    this.segmentIdMap_[id] = this.segmentCount_++;
    this.buildSegmentEl_();
  }

  /**
   * Gets the root element of the progress bar.
   *
   * @return {!Element}
   */
  getRoot() {
    return dev().assertElement(this.root_);
  }

  /**
   * Validates that segment id exists.
   *
   * @param {string} segmentId The index to assert validity
   * @private
   */
  assertVaildSegmentId_(segmentId) {
    devAssert(
      hasOwn(this.segmentIdMap_, segmentId),
      'Invalid segment-id passed to progress-bar'
    );
  }

  /**
   * Sets progress bar and ellipsis for the initial set of pages. It only
   * happens once and only in segments < MAX_SEGMENTS because logic is a bit
   * different than the general case.
   * @private
   */
  setInitialStateForOverflow_() {
    const ellipsisCount =
      this.segmentCount_ >= MAX_SEGMENTS + MAX_SEGMENT_ELLIPSIS
        ? MAX_SEGMENT_ELLIPSIS
        : this.segmentCount_ % MAX_SEGMENTS;

    this.setSegmentSize_(this.getSegmentWidth_(ellipsisCount));

    const upperIndex =
      MAX_SEGMENTS +
      Math.min(MAX_SEGMENT_ELLIPSIS - 1, this.segmentCount_ % MAX_SEGMENTS);

    const segmentEls = this.getRoot().querySelectorAll(
      '.i-amphtml-story-page-progress-bar'
    );
    this.ellipsis_.headIndices = this.shrinkSegments_(
      MAX_SEGMENTS,
      upperIndex,
      segmentEls
    );
    this.overflowProgressBarBuilt_ = true;
  }

  /**
   * Checks if an index is past the overflow limit and updates the progress bar
   * accordingly.
   * @param {number} previousSegmentIndex
   * @param {number} segmentIndex
   * @param {boolean} pageReload
   * @private
   */
  checkIndexForOverflow_(
    previousSegmentIndex,
    segmentIndex,
    pageReload = false
  ) {
    if (
      this.segmentCount_ <= MAX_SEGMENTS ||
      this.storeService_.get(StateProperty.UI_STATE) !== UIType.MOBILE
    ) {
      return;
    }

    // If there was a page reload, snap the ellipsis to the position they would
    // have had when navigating through the story normally.
    if (pageReload && segmentIndex < MAX_SEGMENTS) {
      segmentIndex = 0;
    } else if (pageReload) {
      segmentIndex = segmentIndex - (segmentIndex % MAX_SEGMENT_INCREMENT);
      previousSegmentIndex = segmentIndex - 1;
    }

    // First time building overflow progress bar before hitting the overflow.
    if (segmentIndex === 0 && !this.overflowProgressBarBuilt_) {
      this.setInitialStateForOverflow_();
      return;
    }

    // Moving from a normal segment to an ellipse, update new ellipsis and
    // animate progress bar.
    if (
      this.ellipsis_.tailIndices.includes(segmentIndex) ||
      this.ellipsis_.headIndices.includes(segmentIndex) ||
      pageReload
    ) {
      const segmentEls = this.getRoot().querySelectorAll(
        '.i-amphtml-story-page-progress-bar'
      );
      this.growPreviousEllipsis_(segmentEls);

      const previous = {};
      previous.upperIndexTail = this.ellipsis_.upperIndexTail;
      previous.ellipsisToLeft =
        findIndex(this.ellipsis_.tailIndices, idx => idx < segmentIndex) >= 0
          ? 1
          : 0;

      const current = {};
      current.navigationDirection =
        segmentIndex > previousSegmentIndex ? DIRECTION.RIGHT : DIRECTION.LEFT;
      const nextIndexLimit =
        current.navigationDirection === DIRECTION.RIGHT
          ? Math.min(
              previousSegmentIndex + MAX_SEGMENT_INCREMENT,
              this.segmentCount_ - 1
            )
          : Math.max(previousSegmentIndex - MAX_SEGMENT_INCREMENT, 0);

      current.enteringSegmentsCount =
        current.navigationDirection === DIRECTION.RIGHT
          ? nextIndexLimit - previousSegmentIndex
          : previousSegmentIndex - nextIndexLimit;

      let ellipsisCount = this.updateTailEllipsis_(
        previousSegmentIndex,
        current,
        segmentEls
      );

      ellipsisCount += this.updateHeadEllipsis_(
        previousSegmentIndex,
        current,
        segmentEls
      );

      previous.segmentWidth = segmentEls[0].getBoundingClientRect().width;
      current.segmentWidth = this.getSegmentWidth_(ellipsisCount);
      current.segmentIndex = segmentIndex;

      this.setSegmentSize_(current.segmentWidth);
      this.slideProgressBar_(previous, current, segmentEls);
    }
  }

  /**
   * Grow segments that were previously ellipses.
   * @param {!Array<!Element>} segmentEls
   * @private
   */
  growPreviousEllipsis_(segmentEls) {
    this.ellipsis_.tailIndices.forEach(index =>
      segmentEls[index].classList.remove('i-amphtml-story-progress-ellipsis')
    );
    this.ellipsis_.headIndices.forEach(index =>
      segmentEls[index].classList.remove('i-amphtml-story-progress-ellipsis')
    );
  }

  /**
   * Calculates and applies transform to the progress bar for the sliding
   * animation.
   * @param {!Object} previous
   * @param {!Object} current
   * @param {!Array<!Element>} segmentEls
   * @private
   */
  slideProgressBar_(previous, current, segmentEls) {
    let translate;
    if (current.navigationDirection === DIRECTION.RIGHT) {
      translate = this.getForwardTranslate_(previous, current, segmentEls);
    } else {
      translate = this.getBackwardTranslate_(previous, current, segmentEls);
    }

    if (
      current.navigationDirection === DIRECTION.RIGHT &&
      current.segmentIndex + current.enteringSegmentsCount > this.segmentCount_
    ) {
      return;
    } else if (
      current.navigationDirection === DIRECTION.LEFT &&
      current.segmentIndex - MAX_SEGMENT_ELLIPSIS < 0
    ) {
      return;
    }

    this.barTranslateX_ += translate;
    setStyle(
      this.root_,
      'transform',
      `translate3d(${this.barTranslateX_}px, 0, 0)`
    );
  }

  /**
   * Calculates translate to be applied when navigating backwards on a
   * story and hitting the overflow ellipsis.
   * @param {!Object} previous
   * @param {!Object} current
   * @param {!Array<!Element>} segmentEls
   * @return {number}
   * @private
   */
  getBackwardTranslate_(previous, current, segmentEls) {
    const rtlState = this.storeService_.get(StateProperty.RTL_STATE);
    const translateDirection = rtlState ? DIRECTION.RIGHT : DIRECTION.LEFT;

    const upperIndexHeadRect = segmentEls[
      this.ellipsis_.upperIndexHead
    ].getBoundingClientRect();
    const sizeDiff =
      this.ellipsis_.upperIndexHead *
      (current.segmentWidth - previous.segmentWidth);
    const distanceFromOrigin = rtlState
      ? upperIndexHeadRect.right - this.barWidthPx_
      : Math.abs(upperIndexHeadRect.left);

    return (
      (distanceFromOrigin - sizeDiff + SEGMENTS_MARGIN_PX / 2) *
      (translateDirection * -1)
    );
  }

  /**
   * Calculates translate to be applied when navigating forwards on a
   * story and hitting the overflow ellipsis.
   * @param {!Object} previous
   * @param {!Object} current
   * @param {!Array<!Element>} segmentEls
   * @return {number}
   * @private
   */
  getForwardTranslate_(previous, current, segmentEls) {
    const rtlState = this.storeService_.get(StateProperty.RTL_STATE);
    const translateDirection = rtlState ? DIRECTION.RIGHT : DIRECTION.LEFT;

    const upperIndexTailDifference =
      this.ellipsis_.upperIndexTail - previous.upperIndexTail;

    // Only take into consideration ellipsis to the left of the new
    // upperIndexTail.
    const ellipsisGrownToLeft = Math.min(
      MAX_SEGMENT_ELLIPSIS,
      upperIndexTailDifference
    );

    // Since ellipsis growing to the left push the current segment to the
    // right, we have to take that into consideration when sliding the
    // progressbar.
    const ellipseToNormalSizeDiff =
      previous.ellipsisToLeft *
      ellipsisGrownToLeft *
      (current.segmentWidth - ELLIPSE_WIDTH_PX);
    const sizeDiff =
      this.ellipsis_.upperIndexTail *
      (current.segmentWidth - previous.segmentWidth);
    const upperIndexTailRect = segmentEls[
      this.ellipsis_.upperIndexTail
    ].getBoundingClientRect();

    const distanceFromOrigin = rtlState
      ? this.barWidthPx_ - upperIndexTailRect.right
      : upperIndexTailRect.left;

    return (
      translateDirection *
        (ellipseToNormalSizeDiff +
          distanceFromOrigin -
          SEGMENTS_MARGIN_PX / 2) +
      translateDirection * sizeDiff
    );
  }

  /**
   * Updates the ellipsis at the "head" of the progressbar. The "head" is the
   * the rightmost MAX_SEGMENT_ELLIPSIS when navigating from left to right.
   * @param {number} prevSegmentIndex
   * @param {!Object} current
   * @param {!Array<!Element>} segmentEls
   * @return {number}
   */
  updateHeadEllipsis_(prevSegmentIndex, current, segmentEls) {
    const lowerLimit =
      prevSegmentIndex +
      current.navigationDirection * current.enteringSegmentsCount +
      current.navigationDirection;
    if (
      (current.navigationDirection === DIRECTION.RIGHT &&
        lowerLimit < this.segmentCount_) ||
      (current.navigationDirection === DIRECTION.LEFT && lowerLimit > 0)
    ) {
      this.ellipsis_.upperIndexHead =
        lowerLimit +
        current.navigationDirection *
          Math.min(MAX_SEGMENT_ELLIPSIS - 1, current.enteringSegmentsCount);
      this.ellipsis_.upperIndexHead =
        this.ellipsis_.upperIndexHead < 0 ? 0 : this.ellipsis_.upperIndexHead;

      this.ellipsis_.headIndices = this.shrinkSegments_(
        lowerLimit,
        this.ellipsis_.upperIndexHead,
        segmentEls
      );

      return this.ellipsis_.headIndices.length;
    }
    // Clear the head ellipsis since we reached a point were there are none.
    this.ellipsis_.upperIndexHead = 0;
    this.ellipsis_.headIndices = [];
    return 0;
  }

  /**
   * Updates the ellipsis at the "tail" of the progressbar. The "head" is the
   * leftmost MAX_SEGMENT_ELLIPSIS when navigating from left to right.
   * @param {number} previousIndex
   * @param {!Object} current
   * @param {!Array<!Element>} segmentEls
   * @return {number}
   */
  updateTailEllipsis_(previousIndex, current, segmentEls) {
    const lowerIndexForTail =
      previousIndex +
      -1 * current.navigationDirection * MAX_SEGMENTS +
      current.navigationDirection * current.enteringSegmentsCount;

    this.ellipsis_.upperIndexTail =
      lowerIndexForTail +
      -1 *
        current.navigationDirection *
        Math.min(MAX_SEGMENT_ELLIPSIS - 1, current.enteringSegmentsCount);

    this.ellipsis_.upperIndexTail =
      this.ellipsis_.upperIndexTail >= 0 ? this.ellipsis_.upperIndexTail : 0;
    this.ellipsis_.tailIndices = this.shrinkSegments_(
      lowerIndexForTail,
      this.ellipsis_.upperIndexTail,
      segmentEls
    );
    return this.ellipsis_.tailIndices.length;
  }

  /**
   * Shrinks segments to become ellipse size.
   * @param {number} firstEllipsis
   * @param {number} secondEllipsis
   * @param {!Array<!Element>} segmentEls
   * @return {number}
   * @private
   */
  shrinkSegments_(firstEllipsis, secondEllipsis, segmentEls) {
    const ellipsisIndices = [];
    const upper = Math.max(firstEllipsis, secondEllipsis);
    const lower = Math.min(firstEllipsis, secondEllipsis);
    for (let i = lower; i < this.segmentCount_ && i <= upper; i++) {
      segmentEls[i].classList.add('i-amphtml-story-progress-ellipsis');
      ellipsisIndices.push(i);
    }
    return ellipsisIndices;
  }

  /**
   * @param {number} ellipsisCount
   * @return {number}
   * @private
   */
  getSegmentWidth_(ellipsisCount) {
    const ellipseSize = ELLIPSE_WIDTH_PX + SEGMENTS_MARGIN_PX;

    const segmentCount =
      this.segmentCount_ > MAX_SEGMENTS ? MAX_SEGMENTS : this.segmentCount_;

    return (
      (this.barWidthPx_ -
        segmentCount * SEGMENTS_MARGIN_PX -
        ellipsisCount * ellipseSize) /
      segmentCount
    );
  }

  /**
   * Sets size for the segments.
   * @param {?number} width
   */
  setSegmentSize_(width) {
    const segmentWidth = width ? width + 'px' : '100%';
    this.win_.document.documentElement.setAttribute(
      'style',
      this.win_.document.documentElement.getAttribute('style') +
        `--segment-width: ${segmentWidth};`
    );
  }

  /**
   * Updates a segment with its corresponding progress.
   *
   * @param {string} segmentId the id of the segment whos progress to change.
   * @param {number} progress A number from 0.0 to 1.0, representing the
   *     progress of the current segment.
   * @param {boolean} updateAllSegments Updates all of the segments.
   */
  updateProgress(segmentId, progress, updateAllSegments = false) {
    this.assertVaildSegmentId_(segmentId);
    const segmentIndex = this.segmentIdMap_[segmentId];

    // We can tell if the page was reloaded if this.activeSegmentIndex_ hasn't
    // yet been updated here.
    const pageReload = !this.activeSegmentId_;
    this.checkIndexForOverflow_(
      pageReload ? segmentIndex - 1 : this.activeSegmentIndex_,
      segmentIndex,
      pageReload
    );

    this.updateProgressByIndex_(segmentIndex, progress);

    // If updating progress for a new segment, update all the other progress
    // bar segments.
    if (this.activeSegmentIndex_ !== segmentIndex || updateAllSegments) {
      this.updateSegments_(
        segmentIndex,
        progress,
        this.activeSegmentIndex_,
        this.activeSegmentProgress_
      );
    }

    this.activeSegmentProgress_ = progress;
    this.activeSegmentIndex_ = segmentIndex;
    this.activeSegmentId_ = segmentId;
  }

  /**
   * Updates all the progress bar segments, and decides whether the update has
   * to be animated.
   *
   * @param {number} activeSegmentIndex
   * @param {number} activeSegmentProgress
   * @param {number} prevSegmentIndex
   * @param {number} prevSegmentProgress
   * @private
   */
  updateSegments_(
    activeSegmentIndex,
    activeSegmentProgress,
    prevSegmentIndex,
    prevSegmentProgress
  ) {
    let shouldAnimatePreviousSegment = false;

    // Animating the transition from one full segment to another, which is the
    // most common case.
    if (prevSegmentProgress === 1 && activeSegmentProgress === 1) {
      shouldAnimatePreviousSegment = true;
    }

    // When navigating forward, animate the previous segment only if the
    // following one does not get fully filled.
    if (activeSegmentIndex > prevSegmentIndex && activeSegmentProgress !== 1) {
      shouldAnimatePreviousSegment = true;
    }

    // When navigating backward, animate the previous segment only if the
    // following one gets fully filled.
    if (prevSegmentIndex > activeSegmentIndex && activeSegmentProgress === 1) {
      shouldAnimatePreviousSegment = true;
    }

    for (let i = 0; i < this.segmentCount_; i++) {
      // Active segment already gets updated through update progress events
      // dispatched by its amp-story-page.
      if (i === activeSegmentIndex) {
        continue;
      }

      const progress = i < activeSegmentIndex ? 1 : 0;

      // Only animate the segment corresponding to the previous page, if needed.
      const withTransition = shouldAnimatePreviousSegment
        ? i === prevSegmentIndex
        : false;

      this.updateProgressByIndex_(i, progress, withTransition);
    }
  }

  /**
   * Updates styles to show progress to a corresponding segment.
   *
   * @param {number} segmentIndex The index of the progress bar segment whose progress should be
   *     changed.
   * @param {number} progress A number from 0.0 to 1.0, representing the
   *     progress of the current segment.
   * @param {boolean=} withTransition
   * @public
   */
  updateProgressByIndex_(segmentIndex, progress, withTransition = true) {
    // Offset the index by 1, since nth-child indices start at 1 while
    // JavaScript indices start at 0.
    const nthChildIndex = segmentIndex + 1;
    const progressEl = scopedQuerySelector(
      this.getRoot(),
      `.i-amphtml-story-page-progress-bar:nth-child(${escapeCssSelectorNth(
        nthChildIndex
      )}) .i-amphtml-story-page-progress-value`
    );
    this.vsync_.mutate(() => {
      let transition = 'none';
      if (withTransition) {
        // Using an eased transition only if filling the bar to 0 or 1.
        transition =
          progress === 1 || progress === 0
            ? TRANSITION_EASE
            : TRANSITION_LINEAR;
      }
      setImportantStyles(dev().assertElement(progressEl), {
        'transform': scale(`${progress},1`),
        'transition': transition,
      });
    });
  }
}
