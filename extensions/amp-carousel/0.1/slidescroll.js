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
import {getStyle} from '../../../src/style';

/** @const {string} */
const SHOWN_CSS_CLASS = '-amp-slide-item-show';

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
        getStyle(this.element, 'scrollSnapType') != undefined);
    this.element.classList.add('-amp-slidescroll');

    /** @private {!Array<!Element>} */
    this.slides_ = this.getRealChildren();

    /** @private {!Element} */
    this.slidesContainer_ = this.win_.document.createElement('div');
    this.slidesContainer_.classList.add('-amp-slides-container');

    // workaround - https://bugs.webkit.org/show_bug.cgi?id=158821
    if (this.hasNativeSnapPoints_) {
      const dummy = this.win_.document.createElement('div');
      dummy.classList.add('-amp-carousel-start-marker');
      this.slidesContainer_.appendChild(dummy);
    }

    /** @private {!Array<!Element>} */
    this.slideWrappers_ = [];

    this.slides_.forEach(slide => {
      this.setAsOwner(slide);
      const slideWrapper = this.win_.document.createElement('div');
      slideWrapper.appendChild(slide);
      slideWrapper.classList.add('-amp-slide-item');
      this.slidesContainer_.appendChild(slideWrapper);
      this.slideWrappers_.push(slideWrapper);
    });

    // workaround - https://bugs.webkit.org/show_bug.cgi?id=158821
    if (this.hasNativeSnapPoints_) {
      const dummy = this.win_.document.createElement('div');
      dummy.classList.add('-amp-carousel-end-marker');
      this.slidesContainer_.appendChild(dummy);
    }

    this.element.appendChild(this.slidesContainer_);

    /** @private {number} */
    this.noOfSlides_ = this.slides_.length;
  }

  /** @override */
  onLayoutMeasure() {
    /** @private {number} */
    this.slideWidth_ = this.getLayoutWidth();

    /** @private {number} */
    this.previousScrollLeft_ = this.slidesContainer_./*OK*/scrollLeft;
  }

  /** @override */
  layoutCallback() {
    if (this.slideIndex_ == null) {
      this.showSlide_(0);
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
      if ((dir == 1 && this.hasNext()) ||
          (dir == -1 && this.hasPrev())) {
        this.showSlide_(this.slideIndex_ + dir);
      }
    }
  }

  /**
   * Makes the slide corresponding to the given index and the slides surrounding
   *    it available for display.
   * @param {number} newIndex Index of the slide to be displayed.
   * @private
   */
  showSlide_(newIndex) {
    const noOfSlides = this.noOfSlides_;
    if (newIndex < 0 ||
        newIndex >= this.noOfSlides_ ||
        this.slideIndex_ == newIndex) {
      return;
    }
    const showIndexArr = [];
    if (newIndex == noOfSlides - 1) {
      // Last slide.
      showIndexArr.push(noOfSlides - 1, noOfSlides - 2);
    } else if (newIndex == 0) {
      // First slide.
      showIndexArr.push(0, 1);
    } else {
      showIndexArr.push(newIndex - 1, newIndex, newIndex + 1);
    }
    if (this.slideIndex_ != null) {
      this.updateInViewport(this.slides_[this.slideIndex_], false);
    }
    this.updateInViewport(this.slides_[newIndex], true);
    showIndexArr.forEach(showIndex => {
      this.slideWrappers_[showIndex].classList.add(SHOWN_CSS_CLASS);
      if (showIndex == newIndex) {
        this.scheduleLayout(this.slides_[showIndex]);
      } else {
        this.schedulePreload(this.slides_[showIndex]);
      }
    });
    // A max of 3 slides are displayed at a time - we show the first slide
    // (which is at scrollLeft 0) when slide 0 is requested - for all other
    // instances we show the second slide (middle slide at
    // scrollLeft = slide's width).
    const newScrollLeft = (newIndex == 0) ? 0 : this.slideWidth_;
    this.slidesContainer_./*OK*/scrollLeft = newScrollLeft;
    this.slideIndex_ = newIndex;
    this.hideRestOfTheSlides_(newIndex);
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
        if (this.slideWrappers_[i].classList.contains(SHOWN_CSS_CLASS)) {
          this.slideWrappers_[i].classList.remove(SHOWN_CSS_CLASS);
          this.schedulePause(this.slides_[i]);
        }
      }
    }
  }
}
