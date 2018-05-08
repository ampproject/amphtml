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
import {dev} from '../../../src/log';
import {escapeCssSelectorNth, scopedQuerySelector} from '../../../src/dom';
import {hasOwn, map} from '../../../src/utils/object';
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

    /** @private @const {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win_);

    /** @private {!Object<string, number>} */
    this.segmentIdMap_ = map();
  }

  /**
   * @param {!Window} win
   */
  static create(win) {
    return new ProgressBar(win);
  }

  /**
   * @param {!Array<string>} segmentIds The id of each segment in the story.
   * @return {!Element}
   */
  build(segmentIds) {
    if (this.isBuilt_) {
      return this.getRoot();
    }

    const segmentCount = segmentIds.length;
    dev().assert(segmentCount > 0);

    this.isBuilt_ = true;
    this.segmentCount_ = segmentCount;

    segmentIds.forEach((id, i) => this.segmentIdMap_[id] = i);

    this.root_ = this.win_.document.createElement('ol');
    this.root_.classList.add('i-amphtml-story-progress-bar');

    for (let i = 0; i < this.segmentCount_; i++) {
      const segmentProgressBar = this.win_.document.createElement('li');
      segmentProgressBar.classList.add('i-amphtml-story-page-progress-bar');
      const segmentProgressValue = this.win_.document.createElement('div');
      segmentProgressValue.classList.add('i-amphtml-story-page-progress-value');
      segmentProgressBar.appendChild(segmentProgressValue);
      this.root_.appendChild(segmentProgressBar);
    }

    return this.getRoot();
  }


  /**
   * @return {!Element}
   */
  getRoot() {
    return dev().assertElement(this.root_);
  }


  /**
   * @param {string} segmentId The index of the new active segment.
   * @public
   */
  setActiveSegmentId(segmentId) {
    this.assertVaildSegmentId_(segmentId);
    const segmentIndex = this.segmentIdMap_[segmentId];

    for (let i = 0; i < this.segmentCount_; i++) {
      if (i < segmentIndex) {
        this.updateProgressByIndex_(i, 1.0,
            /* withTransition */ i == segmentIndex - 1);
      } else {
        // The active segment manages its own progress by firing PAGE_PROGRESS
        // events to amp-story.
        this.updateProgressByIndex_(i, 0.0, /* withTransition */ (
          segmentIndex != 0 && this.activeSegmentIndex_ != 1));
      }
    }
  }

  /**
   * @param {string} segmentId The index to assert validity
   * @private
   */
  assertVaildSegmentId_(segmentId) {
    dev().assert(hasOwn(this.segmentIdMap_, segmentId),
        'Invalid segment-id passed to progress-bar');
  }

  /**
   * The
   * @param {string} segmentId the id of the segment whos progress to change
   * @param {number} progress A number from 0.0 to 1.0, representing the
   *     progress of the current segment.
   */
  updateProgress(segmentId, progress) {
    this.assertVaildSegmentId_(segmentId);
    const segmentIndex = this.segmentIdMap_[segmentId];
    this.updateProgressByIndex_(segmentIndex, progress);
  }


  /**
   * @param {number} segmentIndex The index of the progress bar segment whose progress should be
   *     changed.
   * @param {number} progress A number from 0.0 to 1.0, representing the
   *     progress of the current segment.
   * @param {boolean=} withTransition
   * @public
   */
  updateProgressByIndex_(segmentIndex, progress, withTransition = true) {
    this.activeSegmentIndex_ = segmentIndex;

    // Offset the index by 1, since nth-child indices start at 1 while
    // JavaScript indices start at 0.
    const nthChildIndex = segmentIndex + 1;
    const progressEl = scopedQuerySelector(this.getRoot(),
        `.i-amphtml-story-page-progress-bar:nth-child(${
          escapeCssSelectorNth(nthChildIndex)
        }) .i-amphtml-story-page-progress-value`);
    this.vsync_.mutate(() => {
      let transition = 'none';
      if (withTransition) {
        // Using an eased transition only if filling the bar to 0 or 1.
        transition =
            (progress === 1 || progress === 0) ?
              TRANSITION_EASE : TRANSITION_LINEAR;
      }
      setImportantStyles(dev().assertElement(progressEl), {
        'transform': scale(`${progress},1`),
        'transition': transition,
      });
    });
  }
}
