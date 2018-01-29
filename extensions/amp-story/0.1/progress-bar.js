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
import {dev} from '../../../src/log';
import {scale, setImportantStyles} from '../../../src/style';
import {scopedQuerySelector} from '../../../src/dom';
import {Services} from '../../../src/services';


/** @const {string} */
const TRANSITION = 'transform 0.2s ease';


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
  }

  /**
   * @param {!Window} win
   */
  static create(win) {
    return new ProgressBar(win);
  }

  /**
   * @param {number} pageCount The number of pages in the story.
   * @return {!Element}
   */
  build(pageCount) {
    if (this.isBuilt_) {
      return this.getRoot();
    }

    dev().assertNumber(pageCount);
    dev().assert(pageCount > 0);

    this.isBuilt_ = true;
    this.pageCount_ = pageCount;

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
   * @param {number} pageIndex The index of the new active page.
   * @public
   */
  setActivePageIndex(pageIndex) {
    this.assertValidPageIndex_(pageIndex);
    for (let i = 0; i < this.pageCount_; i++) {
      if (i < pageIndex) {
        this.updateProgress(i, 1.0, /* withTransition */ i == pageIndex - 1);
      } else {
        // The active page manages its own progress by firing PAGE_PROGRESS
        // events to amp-story.
        this.updateProgress(i, 0.0, /* withTransition */ (
          pageIndex != 0 && this.activePageIndex_ != 1));
      }
    }
  }

  /**
   * @param {number} pageIndex The index of the page whose progress should be
   *     changed.
   * @param {number} progress A number from 0.0 to 1.0, representing the
   *     progress of the current page.
   * @param {boolean=} withTransition
   * @public
   */
  updateProgress(pageIndex, progress, withTransition = true) {
    this.assertValidPageIndex_(pageIndex);

    this.activePageIndex_ = pageIndex;

    // Offset the index by 1, since nth-child indices start at 1 while
    // JavaScript indices start at 0.
    const nthChildIndex = pageIndex + 1;
    const progressEl = scopedQuerySelector(this.getRoot(),
        `.i-amphtml-story-page-progress-bar:nth-child(${nthChildIndex}) ` +
        '.i-amphtml-story-page-progress-value');
    this.vsync_.mutate(() => {
      setImportantStyles(dev().assertElement(progressEl), {
        'transform': scale(`${progress},1`),
        'transition': withTransition ? TRANSITION : 'none',
      });
    });
  }
}
