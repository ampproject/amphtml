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
import {getStyle, setStyle} from '../../../src/style';

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

    /** @private @const {boolean} */
    this.hasLooping_ = this.element.hasAttribute('loop');

    /** @private @const {!boolean} */
    this.hasNativeSnapPoints_ = (
        getStyle(this.element, 'scrollSnapType') != undefined);
    this.element.classList.add('-amp-slidescroll');

    /** @private {!Array<!Element>} */
    this.slides_ = this.getRealChildren();

    /** @private {!Element} */
    this.slidesContainer_ = this.win_.document.createElement('div');
    this.slidesContainer_.classList.add('-amp-slides-container');

    // Workaround - https://bugs.webkit.org/show_bug.cgi?id=158821
    if (this.hasNativeSnapPoints_) {
      const start = this.win_.document.createElement('div');
      start.classList.add('-amp-carousel-start-marker');
      this.slidesContainer_.appendChild(start);

      const end = this.win_.document.createElement('div');
      end.classList.add('-amp-carousel-end-marker');
      this.slidesContainer_.appendChild(end);
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

    this.element.appendChild(this.slidesContainer_);

    /** @private {number} */
    this.noOfSlides_ = this.slides_.length;

    this.slidesContainer_.addEventListener(
        'scroll', this.scrollHandler_.bind(this));
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
    return this.hasLooping_ || this.slideIndex_ > 0;
  }

  /** @override */
  hasNext() {
    return this.hasLooping_ || this.slideIndex_ < this.slides_.length - 1;
  }

  /** @override */
  goCallback(dir, unusedAnimate) {
    if (this.slideIndex_ != null) {
      if ((dir == 1 && this.hasNext()) ||
          (dir == -1 && this.hasPrev())) {
        let newIndex = this.slideIndex_ + dir;
        if (newIndex == -1) {
          newIndex = this.noOfSlides_ - 1;
        } else if (newIndex >= this.noOfSlides_) {
          newIndex = 0;
        }
        this.showSlide_(newIndex);
      }
    }
  }

  /**
   * Handles scroll on the slides container.
   * @param {!Event} event Event object.
   * @private
   */
  scrollHandler_(event) {
    const currentScrollLeft = this.slidesContainer_./*REVIEW*/scrollLeft;
    if (this.hasNativeSnapPoints_) {
      this.snapHandler_(event, currentScrollLeft);
    } else {
      this.customScrollHandler_(event, currentScrollLeft);
    }
    this.previousScrollLeft_ = currentScrollLeft;
  }

  /**
   * Detects snap end and updates slides/slideIndex after snap.
   * @param {!Event} event Event object.
   * @param {number} currentScrollLeft scrollLeft value of the slides container.
   * @private
   */
  snapHandler_(event, currentScrollLeft) {
    // With snap points we know snapping happens precisely at the co-ordinates
    if (currentScrollLeft % this.slideWidth_ == 0) {
      this.updateOnScroll_(currentScrollLeft);
    }
  }

  /**
   * Updates to the right state of the new index on scroll.
   * @param {number} currentScrollLeft scrollLeft value of the slides container.
   */
  updateOnScroll_(currentScrollLeft) {
    // This can be only 0, 1 or 2, since only a max of 3 slides are shown at
    // a time.
    const shownSlideIndex = parseInt(currentScrollLeft / this.slideWidth_);
    // Update value can be -1, 0 or 1 depending upon the index of the current
    // shown slide.
    let updateValue;
    const lastSlideIndex = this.noOfSlides - 1;
    if (this.slideIndex_ === 0 && shownSlideIndex === 0) {
      // No need to update as slide has not moved from slide 0.
      updateValue = 0;
    } else if (this.slideIndex_ === 0 && shownSlideIndex ==1) {
      // Slide moved one position to it's right.
      updateValue = 1;
    } else if (this.slideIndex_ == lastSlideIndex && shownSlideIndex == 1) {
      // No need to update as slide has not moved from the last slide.
      updateValue = 0;
    } else if (this.slideIndex_ == lastSlideIndex && shownSlideIndex === 0) {
      // Slide has scrolled to one position to it's left.
      updateValue = -1;
    } else {
      // Handles shift for all slides except first and last.
      updateValue = shownSlideIndex - 1;
    }
    this.showSlide_(this.slideIndex_ + updateValue);
  }

  /**
   * Handles scroll on the slides container.
   * @param {!Event} event Event object.
   * @private
   */
  customScrollHandler_(event) {
  }

  /**
   * Makes the slide corresponding to the given index and the slides surrounding
   *    it available for display.
   * @param {number} newIndex Index of the slide to be displayed.
   * @private
   */
  showSlide_(newIndex) {
    console.log('skrish: ' + 'moving from: '+ this.slideIndex_ + ' to: '+ newIndex);
    const noOfSlides_ = this.noOfSlides_;
    if (newIndex < 0 ||
        newIndex >= noOfSlides_ ||
        this.slideIndex_ == newIndex) {
      return;
    }

    const prevIndex = (newIndex - 1 >= 0) ? newIndex - 1 :
        (this.hasLooping_) ? noOfSlides_ - 1 : null;
    const nextIndex = (newIndex + 1 < noOfSlides_) ? newIndex + 1 :
        (this.hasLooping_) ? 0 : null;

    const showIndexArr = [];
    if (prevIndex != null) {
      showIndexArr.push(prevIndex);
    }
    showIndexArr.push(newIndex);
    if (nextIndex != null) {
      showIndexArr.push(nextIndex);
    }
    if (this.slideIndex_ != null) {
      this.updateInViewport(this.slides_[this.slideIndex_], false);
    }
    this.updateInViewport(this.slides_[newIndex], true);
    showIndexArr.forEach((showIndex, loopIndex) => {
      if (this.hasLooping_) {
        setStyle(this.slideWrappers_[showIndex], 'order', loopIndex + 1);
      }
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
    let newScrollLeft = this.slideWidth_;
    if (!this.hasLooping_ && newIndex == 0) {
      newScrollLeft = 0;
    }
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
    const noOfSlides_ = this.noOfSlides_;
    for (let i = 0; i < noOfSlides_; i++) {
      if (i != index && i != index - 1 && i != index + 1 &&
          this.slideWrappers_[i]) {
        if (this.slideWrappers_[i].classList.contains(SHOWN_CSS_CLASS)) {
          if (this.hasLooping_) {
            if ((index == 0 && i == noOfSlides_ - 1) ||
                (index == noOfSlides_ - 1 && i == 0)) {
              continue;
            }
            setStyle(this.slideWrappers_[i], 'order', '');
          }
          this.slideWrappers_[i].classList.remove(SHOWN_CSS_CLASS);
          this.schedulePause(this.slides_[i]);
        }
      }
    }
  }
}
