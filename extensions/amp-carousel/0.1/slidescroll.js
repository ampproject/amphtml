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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import {getStyle} from '../../../src/style';
=======
import {getStyle, setStyle} from '../../../src/style';
import {timer} from '../../../src/timer';
>>>>>>> ampproject/master
=======
import {getStyle, setStyle} from '../../../src/style';
import {timer} from '../../../src/timer';
>>>>>>> ampproject/master
=======
import {getStyle, setStyle} from '../../../src/style';
import {timer} from '../../../src/timer';
>>>>>>> ampproject/master

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

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
    /** @const @private {!Vsync} */
    this.vsync_ = this.getVsync();

>>>>>>> ampproject/master
=======
    /** @const @private {!Vsync} */
    this.vsync_ = this.getVsync();

>>>>>>> ampproject/master
=======
    /** @const @private {!Vsync} */
    this.vsync_ = this.getVsync();

>>>>>>> ampproject/master
    /** @private @const {!boolean} */
    this.hasNativeSnapPoints_ = (
        getStyle(this.element, 'scrollSnapType') != undefined);
    this.element.classList.add('-amp-slidescroll');

    /** @private {!Array<!Element>} */
    this.slides_ = this.getRealChildren();

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
    /** @private {number} */
    this.noOfSlides_ = this.slides_.length;

    /** @private @const {boolean} */
    this.hasLooping_ =
        this.element.hasAttribute('loop') && this.noOfSlides_ > 1;

<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
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

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    /** @private {number} */
    this.noOfSlides_ = this.slides_.length;
=======
=======
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
    /** @private @const {boolean} */
    this.snappingInProgress_ = false;

    /** @private {?number}*/
    this.scrollTimeout_ = null;

    this.slidesContainer_.addEventListener(
        'scroll', this.scrollHandler_.bind(this));
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
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
  hasPrev() {
    return this.hasLooping_ || this.slideIndex_ > 0;
  }

  /** @override */
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  hasPrev() {
    return this.slideIndex_ > 0;
  }

  /** @override */
  hasNext() {
    return this.slideIndex_ < this.slides_.length - 1;
  }

  /** @override */
=======
=======
>>>>>>> ampproject/master
  hasNext() {
    return this.hasLooping_ || this.slideIndex_ < this.slides_.length - 1;
  }

  /** @override */
<<<<<<< HEAD
>>>>>>> ampproject/master
=======
  hasNext() {
    return this.hasLooping_ || this.slideIndex_ < this.slides_.length - 1;
  }

  /** @override */
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
  goCallback(dir, unusedAnimate) {
    if (this.slideIndex_ != null) {
      if ((dir == 1 && this.hasNext()) ||
          (dir == -1 && this.hasPrev())) {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
        this.showSlide_(this.slideIndex_ + dir);
      }
    }
=======
=======
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
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
   * @param {!Event} unusedEvent Event object.
   * @private
   */
  scrollHandler_(unusedEvent) {
    if (this.scrollTimeout_) {
      timer.cancel(this.scrollTimeout_);
    }
    const currentScrollLeft = this.slidesContainer_./*OK*/scrollLeft;
    if (currentScrollLeft != this.previousScrollLeft_ &&
        !this.hasNativeSnapPoints_) {
      // TODO(sriramkrish85): Handle custom scroll here.
    }

    // Timer that detects scroll end and/or end of snap scroll.
    this.scrollTimeout_ = timer.delay(() => {
      if (this.snappingInProgress_) {
        return;
      }
      if (this.hasNativeSnapPoints_) {
        this.updateOnScroll_(currentScrollLeft);
      }
    }, 100);
    this.previousScrollLeft_ = currentScrollLeft;
  }


  /**
   * Updates to the right state of the new index on scroll.
   * @param {number} currentScrollLeft scrollLeft value of the slides container.
   */
  updateOnScroll_(currentScrollLeft) {
    this.snappingInProgress_ = true;
    // This can be only 0, 1 or 2, since only a max of 3 slides are shown at
    // a time.
    const scrolledSlideIndex = Math.round(currentScrollLeft / this.slideWidth_);
    // Update value can be -1, 0 or 1 depending upon the index of the current
    // shown slide.
    let updateValue = 0;

    const hasPrev_ = this.hasPrev();
    const hasNext_ = this.hasNext();

    if (hasPrev_ && hasNext_) {
      updateValue = scrolledSlideIndex - 1;
    } else if (hasNext_) {
      // Has next and does not have a prev. (slideIndex 0)
      updateValue = scrolledSlideIndex;
    } else if (hasPrev_) {
      // Has prev and no next slide (last slide)
      updateValue = scrolledSlideIndex - 1;
    }

    let newIndex = this.slideIndex_ + updateValue;

    if (this.hasLooping_) {
      newIndex = (newIndex < 0) ? this.noOfSlides_ - 1 :
          (newIndex >= this.noOfSlides_) ? 0 : newIndex;
    } else {
      newIndex = (newIndex < 0) ? 0 :
          (newIndex >= this.noOfSlides_) ? this.noOfSlides_ - 1 : newIndex;
    }
    this.vsync_.mutate(() => {
      // Make the container non scrollable to stop scroll events.
      this.slidesContainer_.classList.add('no-scroll');
      // Scroll to new slide and update scrollLeft to the correct slide.
      this.showSlide_(newIndex);
      this.vsync_.mutate(() => {
        // Make the container scrollable again to enable user swiping.
        this.slidesContainer_.classList.remove('no-scroll');
        this.snappingInProgress_ = false;
      });
    });
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
  }

  /**
   * Makes the slide corresponding to the given index and the slides surrounding
   *    it available for display.
   * @param {number} newIndex Index of the slide to be displayed.
   * @private
   */
  showSlide_(newIndex) {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
=======
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
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
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
    }
    if (this.slideIndex_ != null) {
      this.updateInViewport(this.slides_[this.slideIndex_], false);
    }
    this.updateInViewport(this.slides_[newIndex], true);
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    showIndexArr.forEach(showIndex => {
=======
=======
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
    showIndexArr.forEach((showIndex, loopIndex) => {
      if (this.hasLooping_) {
        setStyle(this.slideWrappers_[showIndex], 'order', loopIndex + 1);
      }
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    const newScrollLeft = (newIndex == 0) ? 0 : this.slideWidth_;
    this.slidesContainer_./*OK*/scrollLeft = newScrollLeft;
    this.slideIndex_ = newIndex;
    this.hideRestOfTheSlides_(newIndex);
=======
=======
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
    let newScrollLeft = this.slideWidth_;
    if (!this.hasLooping_ && newIndex == 0) {
      newScrollLeft = 0;
    }

    this.slidesContainer_./*OK*/scrollLeft = newScrollLeft;
    this.slideIndex_ = newIndex;
    this.hideRestOfTheSlides_(showIndexArr);
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
    this.setControlsState();
  }

  /**
   * Given an index, hides rest of the slides that are not needed.
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
=======
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
   * @param {!Array<number>} indexArr Array of indices that
   *    should not be hidden.
   * @private
   */
  hideRestOfTheSlides_(indexArr) {
    const noOfSlides_ = this.noOfSlides_;
    for (let i = 0; i < noOfSlides_; i++) {
      if (indexArr.indexOf(i) == -1 &&
          this.slideWrappers_[i].classList.contains(SHOWN_CSS_CLASS)) {
        if (this.hasLooping_) {
          setStyle(this.slideWrappers_[i], 'order', '');
        }
        this.slideWrappers_[i].classList.remove(SHOWN_CSS_CLASS);
        this.schedulePause(this.slides_[i]);
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
      }
    }
  }
}
