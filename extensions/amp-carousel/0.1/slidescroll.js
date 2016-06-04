/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import {BaseCarousel} from './base-carousel';
import {Layout} from '../../../src/layout';

/** @const */
const DIR_FORWARD = 1;

/** @const */
const DIR_REVERSE = -1;


export class AmpSlideScroll extends BaseCarousel {
  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FIXED || layout == Layout.FIXED_HEIGHT;
  }
  /** @override */
  buildCarousel() {
    /** @private @const {!Window} */
    this.win_ = this.getWin();

    /** @private @const {!boolean} */
    this.hasNativeSnapPoints_ = (
        this.element.style.scrollSnapType != undefined ||
        this.element.style.webkitScrollSnapType != undefined);
    this.element.classList.add('-amp-slidescroll');

    /** @private {!Array<!Element>} */
    this.slides_ = this.getRealChildren();

    /** @private {!Element} */
    this.slidesContainer_ = this.win_.document.createElement('div');
    this.slidesContainer_.classList.add('-amp-slides-container');

    /** @private {!Array<!Element>} */
    this.slideWrappers_ = [];

    this.element.appendChild(this.slidesContainer_);
    this.slides_.forEach(slide => {
      this.setAsOwner(slide);
      const slideWrapper = this.win_.document.createElement('div');
      slideWrapper.appendChild(slide);
      slideWrapper.classList.add('-amp-slide-item');
      this.slidesContainer_.appendChild(slideWrapper);
      this.slideWrappers_.push(slideWrapper);
    });
    this.element.appendChild(this.slidesContainer_);

    /** @private {number} */
    this.noOfSlides_ = this.slides_.length;
  }

  /** @override */
  onLayoutMeasure() {
    /** @private {number} */
    this.slideWidth_ = this.slidesContainer_./*REVIEW*/offsetWidth;

    /** @private {number} */
    this.previousScrollLeft_ = this.slidesContainer_./*REVIEW*/scrollLeft;
  }

  /** @override */
  layoutCallback() {
    if (this.slideIndex_ == null) {
      return this.mutateElement(() => {
        this.showSlides_(0);
      }, this.slidesContainer_);
    }
    return Promise.resolve();
  }

  /** @override */
  viewportCallback(inViewport) {
    if (inViewport) {
      this.hintControls();
    }
  }

  /** @override */
  setupGestures() {
  }

  /** @override */
  hasPrev() {
    return this.slideIndex_ > 0;
  }

  /** @override */
  hasNext() {
    return this.slideIndex_ < this.slides_.length - 1;
  }

  /** @override */
  goCallback(dir, unusedAnimate) {
    if (this.slideIndex_ != null) {
      if ((dir == DIR_FORWARD && this.hasNext()) ||
          (dir == DIR_REVERSE && this.hasPrev())) {
        this.mutateElement(() => {
          this.showSlides_(this.slideIndex_ + dir);
        }, this.slidesContainer_);
      }
    }
  }

  /**
   * Makes the slide corresponding to the given index and the slides surrounding
   *    it available for display.
   * @param {number} newindex Index of the slide to be displayed.
   * @private
   */
  showSlides_(newindex) {
    const noOfSlides = this.noOfSlides_;
    if (newindex < 0 ||
        newindex >= this.noOfSlides_ ||
        this.slideIndex_ == newindex) {
      return;
    }
    const showIndexArr = [];
    let newScrollLeft;
    if (newindex == noOfSlides - 1) {
      // Last slide.
      showIndexArr.push(noOfSlides - 1, noOfSlides - 2);
    } else if (newindex === 0) {
      // First slide.
      showIndexArr.push(0, 1);
      newScrollLeft = 0;
    } else {
      showIndexArr.push(newindex - 1, newindex, newindex + 1);
    }

    if (newScrollLeft == null) {
      newScrollLeft = this.slideWidth_;
    }
    if (this.slideIndex_ != null) {
      this.updateInViewport(this.slides_[this.slideIndex_], false);
    }
    this.updateInViewport(this.slides_[newindex], true);
    this.slideIndex_ = newindex;
    showIndexArr.forEach(showIndex => {
      this.slideWrappers_[showIndex].setAttribute('show', '');
      this.scheduleLayout(this.slides_[showIndex]);
    });
    this.slidesContainer_./*REVIEW*/scrollLeft = newScrollLeft;
    this.hideRestOfTheSlides_(newindex);
    this.setControlsState();
  }

  /**
   * Given an index, hides rest of the slides that are not needed.
   * @param {number} index Index of the slide to be displayed.
   * @private
   */
  hideRestOfTheSlides_(index) {
    for (let i = 0; i < this.noOfSlides_; i++) {
      if (i != index && i != index - 1 && i != index + 1 &&
          this.slideWrappers_[i]) {
        this.slideWrappers_[i].removeAttribute('show');
        this.schedulePause(this.slides_[i]);
      }
    }
  }
}
