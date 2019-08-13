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
 * Rate at which we increment the segments as we pass an overflow point in the
 * progress bar.
 * @const {number}
 */
const SEGMENT_INCREMENT = 5;

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

    /**
     * Translate applied to a progress bar when the overflow point is passed.
     * @private {number}
     */
    this.barTranslateX_ = 0;

    /**
     * Ellipsis are applied when a story contains more pages than MAX_SEGMENTS.
     * @private {!Object}
     */
    this.ellipsis_ = {
      upperIndexTail: 0,
      upperIndexHead: 0,
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

        if (
          this.segmentCount_ > MAX_SEGMENTS &&
          this.storeService_.get(StateProperty.UI_STATE) !==
            UIType.DESKTOP_PANELS
        ) {
          this.initializeOverflowProgressBar_();
        } else {
          this.setSegmentSize_(this.getSegmentWidth_(0));
        }

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

    this.isBuilt_ = true;
    return this.getRoot();
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
   * Initializes progressbar with ellipsis when it overflows.
   */
  initializeOverflowProgressBar_() {
    const ellipsisCount =
      this.segmentCount_ >= MAX_SEGMENTS + MAX_SEGMENT_ELLIPSIS
        ? MAX_SEGMENT_ELLIPSIS
        : this.segmentCount_ % MAX_SEGMENTS;

    this.setSegmentSize_(this.getSegmentWidth_(ellipsisCount));

    const upperIndexHead =
      MAX_SEGMENTS +
      Math.min(MAX_SEGMENT_ELLIPSIS - 1, this.segmentCount_ % MAX_SEGMENTS);

    this.ellipsis_.tailIndices = this.shrinkSegments_(
      MAX_SEGMENTS,
      upperIndexHead
    );
  }
  /**
   * Checks if an index is past the overlfow limit.
   * @param {number} previousSegmentIndex
   * @param {number} segmentIndex
   * @param {boolean} force
   */
  checkIndexForOverflow_(previousSegmentIndex, segmentIndex, force = false) {
    if (
      this.storeService_.get(StateProperty.UI_STATE) === UIType.DESKTOP_PANELS
    ) {
      return;
    }

    if (force) {
      segmentIndex = segmentIndex - (segmentIndex % SEGMENT_INCREMENT);
      previousSegmentIndex = segmentIndex - 1;
    }
    if (
      this.ellipsis_.tailIndices.includes(segmentIndex) ||
      this.ellipsis_.headIndices.includes(segmentIndex) ||
      force
    ) {
      const segs = this.getRoot().querySelectorAll(
        '.i-amphtml-story-page-progress-bar'
      );
      // grow previous ellipsis
      const ellipses = this.getRoot().querySelectorAll(
        '.i-amphtml-story-progress-ellipsis'
      );
      ellipses.forEach(ellipsis =>
        ellipsis.classList.remove('i-amphtml-story-progress-ellipsis')
      );

      const previousTailLength = this.ellipsis_.tailIndices.length;
      const prevDotsLeft =
        findIndex(this.ellipsis_.tailIndices, idx => idx < segmentIndex) >= 0
          ? 1
          : 0;

      // todo(use enum)
      const navigationDirection = segmentIndex > previousSegmentIndex ? 1 : -1;
      const nextIndexLimit =
        navigationDirection === 1
          ? Math.min(
              previousSegmentIndex + SEGMENT_INCREMENT,
              this.segmentCount_ - 1
            )
          : Math.max(previousSegmentIndex - SEGMENT_INCREMENT, 0);
      const enteringSegs =
        navigationDirection === 1
          ? nextIndexLimit - previousSegmentIndex
          : previousSegmentIndex - nextIndexLimit;

      let ellipsisCount = this.updateTailEllipsis_(
        previousSegmentIndex,
        enteringSegs,
        navigationDirection
      );

      ellipsisCount += this.updateHeadEllipsis_(
        previousSegmentIndex,
        enteringSegs,
        navigationDirection
      );

      // update segment size [if there are now 2 set of ellipsis] and apply transform
      const prevWidth = segs[0].getBoundingClientRect().width;
      const segWidth = this.getSegmentWidth_(ellipsisCount);
      this.setSegmentSize_(segWidth);

      let translate;
      if (navigationDirection === 1) {
        // previously shrank dots on the left

        const shrinkDiff =
          prevDotsLeft * previousTailLength * (prevWidth - ELLIPSE_WIDTH_PX);

        const sizeDiff = this.ellipsis_.upperIndexTail * (segWidth - prevWidth);
        translate =
          -1 *
            (shrinkDiff +
              segs[this.ellipsis_.upperIndexTail].getBoundingClientRect().left -
              SEGMENTS_MARGIN_PX / 2) -
          sizeDiff;
      } else {
        const segRect = segs[
          this.ellipsis_.upperIndexHead
        ].getBoundingClientRect();
        const sizeDiff = this.ellipsis_.upperIndexHead * (segWidth - prevWidth);

        translate = Math.abs(segRect.left) - sizeDiff + SEGMENTS_MARGIN_PX / 2;
      }

      if (
        navigationDirection === 1 &&
        segmentIndex + MAX_SEGMENT_ELLIPSIS > this.segmentCount_
      ) {
        return;
      } else if (
        navigationDirection === -1 &&
        segmentIndex - MAX_SEGMENT_ELLIPSIS < 0
      ) {
        return;
      }

      this.barTransladeDelta_ = translate;
      this.barTranslateX_ += translate;
      this.previousDirection_ = navigationDirection;

      setStyle(
        this.root_,
        'transform',
        `translate3d(${this.barTranslateX_}px, 0, 0)`
      );
    }
  }

  /**
   * Updates the ellipsis at the "head" of the progressbar. The "head" is the
   * the rightmost MAX_SEGMENT_ELLIPSIS when navigating from left to right.
   * @param {number} segmentIndex
   * @param {number} enteringSegs
   * @param {number} navigationDirection
   * @return {number}
   */
  updateHeadEllipsis_(segmentIndex, enteringSegs, navigationDirection) {
    const lowerLimit =
      segmentIndex + navigationDirection * enteringSegs + navigationDirection;
    if (
      (navigationDirection === 1 && lowerLimit < this.segmentCount_) ||
      (navigationDirection === -1 && lowerLimit > 0)
    ) {
      this.ellipsis_.upperIndexHead =
        lowerLimit +
        navigationDirection * Math.min(MAX_SEGMENT_ELLIPSIS - 1, enteringSegs);

      this.ellipsis_.headIndices = this.shrinkSegments_(
        lowerLimit,
        this.ellipsis_.upperIndexHead
      );

      return this.ellipsis_.headIndices.length;
    }
    this.ellipsis_.upperIndexHead = 0;
    this.ellipsis_.headIndices = [];
    return 0;
  }

  /**
   * Updates the ellipsis at the "tail" of the progressbar. The "head" is the
   * leftmost MAX_SEGMENT_ELLIPSIS when navigating from left to right.
   * @param {number} previousIndex
   * @param {number} enteringSegs
   * @param {number} navigationDirection
   * @return {number}
   */
  updateTailEllipsis_(previousIndex, enteringSegs, navigationDirection) {
    let lowerIndexForTail =
      previousIndex +
      -1 * navigationDirection * MAX_SEGMENTS +
      navigationDirection * enteringSegs;

    // Check boundaries.
    lowerIndexForTail =
      lowerIndexForTail >= MAX_SEGMENT_ELLIPSIS
        ? lowerIndexForTail
        : MAX_SEGMENT_ELLIPSIS;

    this.ellipsis_.upperIndexTail =
      lowerIndexForTail +
      -1 *
        navigationDirection *
        Math.min(MAX_SEGMENT_ELLIPSIS - 1, enteringSegs);

    this.ellipsis_.upperIndexTail =
      this.ellipsis_.upperIndexTail >= 0 ? this.ellipsis_.upperIndexTail : 0;
    this.ellipsis_.tailIndices = this.shrinkSegments_(
      lowerIndexForTail,
      this.ellipsis_.upperIndexTail
    );
    return this.ellipsis_.tailIndices.length;
  }

  /**
   * Shrinks segments to become ellipse size.
   * @param {number} firstEllipsis
   * @param {number} secondEllipsis
   * @return {number}
   * @private
   */
  shrinkSegments_(firstEllipsis, secondEllipsis) {
    const ellipsisIndices = [];
    const segs = this.getRoot().querySelectorAll(
      '.i-amphtml-story-page-progress-bar'
    );
    const upper = Math.max(firstEllipsis, secondEllipsis);
    const lower = Math.min(firstEllipsis, secondEllipsis);
    for (let i = lower; i < this.segmentCount_ && i <= upper; i++) {
      segs[i].classList.add('i-amphtml-story-progress-ellipsis');
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
    // todo: Move somewhere else where it's computed only 1 time.
    const barWidth = this.storyEl_
      .querySelector('amp-story-page')
      .getBoundingClientRect().width;
    const ellipseSize = ELLIPSE_WIDTH_PX + SEGMENTS_MARGIN_PX;

    const segmentCount =
      this.segmentCount_ > MAX_SEGMENTS ? MAX_SEGMENTS : this.segmentCount_;

    return (
      (barWidth -
        segmentCount * SEGMENTS_MARGIN_PX -
        ellipsisCount * ellipseSize) /
      segmentCount
    );
  }

  /**
   * Sets size for the segments or 100% width if not specified.
   * @param {?number} width
   */
  setSegmentSize_(width = null) {
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
    const pageReloadAndPastOverflow =
      segmentIndex - this.activeSegmentIndex_ > 1 &&
      segmentIndex >= MAX_SEGMENTS;
    this.checkIndexForOverflow_(
      pageReloadAndPastOverflow ? segmentIndex - 1 : this.activeSegmentIndex_,
      segmentIndex,
      pageReloadAndPastOverflow
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
