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
import {map} from '../../../src/utils/object';
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
    this.pageCount_ = 0;

    /** @private {number} */
    this.activePageIndex_ = 0;

    /** @private @const {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win_);

    /** @private {!Object<string, number>} */
    this.pageIdMap_ = map();
  }

  /**
   * @param {!Window} win
   */
  static create(win) {
    return new ProgressBar(win);
  }

  /**
   * @param {!Array} pages The number of pages in the story.
   * @return {!Element}
   */
  build(pages) {
    if (this.isBuilt_) {
      return this.getRoot();
    }

    const pageCount = pages.length;
    dev().assertNumber(pageCount);
    dev().assert(pageCount > 0);

    this.isBuilt_ = true;
    this.pageCount_ = pageCount;

    this.makePageIdMap_(pages);

    this.root_ = this.win_.document.createElement('ol');
    this.root_.classList.add('i-amphtml-story-progress-bar');

    for (let i = 0; i < this.pageCount_; i++) {
      const pageProgressBar = this.win_.document.createElement('li');
      pageProgressBar.classList.add('i-amphtml-story-page-progress-bar');
      const pageProgressValue = this.win_.document.createElement('div');
      pageProgressValue.classList.add('i-amphtml-story-page-progress-value');
      pageProgressBar.appendChild(pageProgressValue);
      this.root_.appendChild(pageProgressBar);
    }

    return this.getRoot();
  }

  /**
   * create mapping of pageIds to position in progress bar
   * @param {Array} pages
   */
  makePageIdMap_(pages) {
    pages.forEach((page, i) => this.pageIdMap_[page.element.id] = i);
  }


  /**
   * @return {!Element}
   */
  getRoot() {
    return dev().assertElement(this.root_);
  }


  /**
   * @param {number} pageIndex The index to assert whether it is in bounds.
   * @private
   */
  assertValidPageIndex_(pageIndex) {
    dev().assert(pageIndex >= 0 && pageIndex < this.pageCount_,
        `Page index ${pageIndex} is not between 0 and ${this.pageCount_}.`);
  }


  /**
   * @param {string} pageId The index of the new active page.
   * @public
   */
  setActivePageIndex(pageId) {
    const progressBarIndex = this.pageIdMap_[pageId];
    this.assertValidPageIndex_(progressBarIndex);
    for (let i = 0; i < this.pageCount_; i++) {
      if (i < progressBarIndex) {
        this.updateProgressByIndex_(i, 1.0,
            /* withTransition */ i == progressBarIndex - 1);
      } else {
        // The active page manages its own progress by firing PAGE_PROGRESS
        // events to amp-story.
        this.updateProgressByIndex_(i, 0.0, /* withTransition */ (
          progressBarIndex != 0 && this.activePageIndex_ != 1));
      }
    }
  }


  /**
   * The
   * @param {string} pageId the id of the page whos progress to change
   * @param {number} progress A number from 0.0 to 1.0, representing the
   *     progress of the current page.
   */
  updateProgress(pageId, progress) {
    const progressBarIndex = this.pageIdMap_[pageId];
    this.updateProgressByIndex_(progressBarIndex, progress);
  }


  /**
   * @param {number} progressBarIndex The index of the progress bar segment whose progress should be
   *     changed.
   * @param {number} progress A number from 0.0 to 1.0, representing the
   *     progress of the current page.
   * @param {boolean=} withTransition
   * @public
   */
  updateProgressByIndex_(progressBarIndex, progress, withTransition = true) {
    this.assertValidPageIndex_(progressBarIndex);
    this.activePageIndex_ = progressBarIndex;

    // Offset the index by 1, since nth-child indices start at 1 while
    // JavaScript indices start at 0.
    const nthChildIndex = progressBarIndex + 1;
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
