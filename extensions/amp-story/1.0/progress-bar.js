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
import {StateProperty, getStoreService} from './amp-story-store-service';
import {dev, devAssert} from '../../../src/log';
import {escapeCssSelectorNth} from '../../../src/css';
import {hasOwn, map} from '../../../src/utils/object';
import {removeChildren, scopedQuerySelector} from '../../../src/dom';
import {scale, setImportantStyles} from '../../../src/style';

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
 * Progress bar for <amp-story>.
 */
export class ProgressBar {
  /**
   * @param {!Window} win
   */
  constructor(win) {
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
   */
  static create(win) {
    return new ProgressBar(win);
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
