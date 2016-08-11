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
import {Animation} from '../../../src/animation';
import {BaseSlides} from './base-slides';
import {Gestures} from '../../../src/gesture';
import {isLayoutSizeDefined} from '../../../src/layout';
import {SwipeXRecognizer} from '../../../src/gesture-recognizers';
import {getStyle, setStyle} from '../../../src/style';
import {numeric} from '../../../src/transition';
import {timerFor} from '../../../src/timer';

/** @const {string} */
const SHOWN_CSS_CLASS = '-amp-slide-item-show';

/** @const {number} */
const NATIVE_SNAP_TIMEOUT = 35;

/** @const {number} */
const NATIVE_TOUCH_TIMEOUT = 120;

/** @const {number} */
const CUSTOM_SNAP_TIMEOUT = 100;

export class AmpSlideScroll extends BaseSlides {
  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }
  /** @override */
  buildSlides() {
    /** @private @const {!Window} */
    this.win_ = this.win;

    /** @const @private {!Vsync} */
    this.vsync_ = this.getVsync();

    /** @private @const {!boolean} */
    this.hasNativeSnapPoints_ = (
        getStyle(this.element, 'scrollSnapType') != undefined);
    this.element.classList.add('-amp-slidescroll');

    /** @private {!Array<!Element>} */
    this.slides_ = this.getRealChildren();

    /** @private {number} */
    this.noOfSlides_ = this.slides_.length;

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

    /** @private @const {boolean} */
    this.snappingInProgress_ = false;

    /** @private {?number} */
    this.scrollTimeout_ = null;

    /** @private {?number} */
    this.touchEndTimeout_ = null;

    /** @private {boolean} */
    this.hasTouchMoved_ = false;

    /**
     * 0 - not in an elastic state.
     * -1 - elastic scrolling (back) to the left of scrollLeft 0.
     * 1 - elastic scrolling (fwd) to the right of the max scrollLeft possible.
     * @private {number}
     */
    this.elasticScrollState_ = 0;


    const gestures =
        Gestures.get(this.element, /* shouldNotPreventDefault */true);
    gestures.onGesture(SwipeXRecognizer, () => {});

    this.slidesContainer_.addEventListener(
        'scroll', this.scrollHandler_.bind(this));

    if (this.hasNativeSnapPoints_) {
      this.slidesContainer_.addEventListener(
          'touchend', this.touchEndHandler_.bind(this));

      this.slidesContainer_.addEventListener(
          'touchmove', this.touchMoveHandler_.bind(this));
    }
  }

  /** @override */
  isLoopingEligible() {
    return this.noOfSlides_ > 2;
  }

  /**
   * Handles touchmove event.
   * @private
   */
  touchMoveHandler_() {
    this.clearAutoplay();
    this.hasTouchMoved_ = true;
    if (this.touchEndTimeout_) {
      timerFor(this.win).cancel(this.touchEndTimeout_);
    }
  }

  /**
   * Handles touchend event.
   * @private
   */
  touchEndHandler_() {
    if (this.hasTouchMoved_) {
      if (this.scrollTimeout_) {
        timerFor(this.win).cancel(this.scrollTimeout_);
      }
      // Timer that detects scroll end and/or end of snap scroll.
      this.touchEndTimeout_ = timerFor(this.win).delay(() => {
        const currentScrollLeft = this.slidesContainer_./*OK*/scrollLeft;

        if (this.snappingInProgress_) {
          return;
        }
        this.updateOnScroll_(currentScrollLeft);
        this.touchEndTimeout_ = null;
      }, NATIVE_TOUCH_TIMEOUT);
    }
    this.hasTouchMoved_ = false;
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
  updateViewportState(inViewport) {
    if (this.slideIndex_ != null) {
      this.updateInViewport(this.slides_[this.slideIndex_], inViewport);
    }
  }

  /** @override */
  hasPrev() {
    return this.shouldLoop || this.slideIndex_ > 0;
  }

  /** @override */
  hasNext() {
    return this.shouldLoop || this.slideIndex_ < this.slides_.length - 1;
  }

  /** @override */
  moveSlide(dir, animate) {
    if (this.slideIndex_ != null) {
      const hasNext = this.hasNext();
      const hasPrev = this.hasPrev();
      if ((dir == 1 && hasNext) ||
          (dir == -1 && hasPrev)) {
        let newIndex = this.slideIndex_ + dir;
        if (newIndex == -1) {
          newIndex = this.noOfSlides_ - 1;
        } else if (newIndex >= this.noOfSlides_) {
          newIndex = 0;
        }
        if (animate) {
          const currentScrollLeft =
              (dir == 1 && !hasPrev) ? 0 : this.slideWidth_;
          this.customSnap_(currentScrollLeft, dir);
        } else {
          this.showSlide_(newIndex);
        }
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
      timerFor(this.win).cancel(this.scrollTimeout_);
    }

    // TODO (sriram): clear autoplay timer on user scroll.
    //    event.isTarget is set on non-user scrolls as well.

    const currentScrollLeft = this.slidesContainer_./*OK*/scrollLeft;
    if (!this.hasNativeSnapPoints_) {
      this.handleCustomElasticScroll_(currentScrollLeft);
    }

    if (!this.touchEndTimeout_) {
      const timeout =
          this.hasNativeSnapPoints_ ? NATIVE_SNAP_TIMEOUT : CUSTOM_SNAP_TIMEOUT;
      // Timer that detects scroll end and/or end of snap scroll.
      this.scrollTimeout_ = timerFor(this.win).delay(() => {

        if (this.snappingInProgress_) {
          return;
        }
        if (this.hasNativeSnapPoints_) {
          this.updateOnScroll_(currentScrollLeft);
        } else {
          this.customSnap_(currentScrollLeft);
        }
      }, timeout);
    }
    this.previousScrollLeft_ = currentScrollLeft;
  }

  /**
   * Handles custom elastic scroll (snap points polyfill).
   * @param {number} currentScrollLeft scrollLeft value of the slides container.
   */
  handleCustomElasticScroll_(currentScrollLeft) {
    const scrollWidth = this.slidesContainer_./*OK*/scrollWidth;
    if (this.elasticScrollState_ == -1 &&
        currentScrollLeft >= this.previousScrollLeft_) {
      // Elastic Scroll is reversing direction take control.
      this.customSnap_(currentScrollLeft).then(() => {
        this.elasticScrollState_ = 0;
      });
    } else if (this.elasticScrollState_ == 1 &&
          currentScrollLeft <= this.previousScrollLeft_) {
      // Elastic Scroll is reversing direction take control.
      this.customSnap_(currentScrollLeft).then(() => {
        this.elasticScrollState_ = 0;
      });
    } else if (currentScrollLeft < 0) {
      // Direction = -1.
      this.elasticScrollState_ = -1;
    } else if ((currentScrollLeft + this.slideWidth_) >= scrollWidth) {
      // Direction = +1.
      this.elasticScrollState_ = 1;
    } else {
      this.elasticScrollState_ = 0;
    }
  }

  /**
   * Animate and snap to the correct slide for a given scrollLeft.
   * @param {number} currentScrollLeft scrollLeft value of the slides container.
   * @param {number=} opt_forceDir if a valid direction is given force it to
   *    move 1 slide in that direction.
   * @return {!Promise}
   */
  customSnap_(currentScrollLeft, opt_forceDir) {
    this.snappingInProgress_ = true;
    const newIndex = this.getNextSlideIndex_(currentScrollLeft);
    let toScrollLeft;
    let diff = newIndex - this.slideIndex_;
    const hasPrev = this.hasPrev();

    if (diff == 0 && (opt_forceDir == 1 || opt_forceDir == -1)) {
      diff = opt_forceDir;
    }

    if (diff == 0) {
      // Snap and stay.
      toScrollLeft = hasPrev ? this.slideWidth_ : 0;
    } else if (diff == 1 || diff == -1 * (this.noOfSlides_ - 1)) {
      // Move fwd.
      toScrollLeft = hasPrev ? this.slideWidth_ * 2 : this.slideWidth_;
    } else if (diff == -1 || diff == this.noOfSlides_ - 1) {
      // Move backward.
      toScrollLeft = 0;
    }

    return this.animateScrollLeft_(currentScrollLeft, toScrollLeft).then(() => {
      this.updateOnScroll_(toScrollLeft);
    });
  }

  /**
   * Gets the slideIndex of the potential next slide based on the
   *    current scrollLeft.
   * @param {number} currentScrollLeft scrollLeft value of the slides container.
   * @return {number} a number representing the next slide index.
   */
  getNextSlideIndex_(currentScrollLeft) {
    // This can be only 0, 1 or 2, since only a max of 3 slides are shown at
    // a time.
    const scrolledSlideIndex = Math.round(currentScrollLeft / this.slideWidth_);
    // Update value can be -1, 0 or 1 depending upon the index of the current
    // shown slide.
    let updateValue = 0;

    const hasPrev = this.hasPrev();
    const hasNext = this.hasNext();

    if (hasPrev && hasNext) {
      updateValue = scrolledSlideIndex - 1;
    } else if (hasNext) {
      // Has next and does not have a prev. (slideIndex 0)
      updateValue = scrolledSlideIndex;
    } else if (hasPrev) {
      // Has prev and no next slide (last slide)
      updateValue = scrolledSlideIndex - 1;
    }

    let newIndex = this.slideIndex_ + updateValue;

    if (this.shouldLoop) {
      newIndex = (newIndex < 0) ? this.noOfSlides_ - 1 :
          (newIndex >= this.noOfSlides_) ? 0 : newIndex;
    } else {
      newIndex = (newIndex < 0) ? 0 :
          (newIndex >= this.noOfSlides_) ? this.noOfSlides_ - 1 : newIndex;
    }
    return newIndex;
  }

  /**
   * Updates to the right state of the new index on scroll.
   * @param {number} currentScrollLeft scrollLeft value of the slides container.
   */
  updateOnScroll_(currentScrollLeft) {
    this.snappingInProgress_ = true;
    const newIndex = this.getNextSlideIndex_(currentScrollLeft);
    this.vsync_.mutate(() => {
      // Make the container non scrollable to stop scroll events.
      this.slidesContainer_.classList.add('-amp-no-scroll');
      // Scroll to new slide and update scrollLeft to the correct slide.
      this.showSlide_(newIndex);
      this.vsync_.mutate(() => {
        // Make the container scrollable again to enable user swiping.
        this.slidesContainer_.classList.remove('-amp-no-scroll');
        this.snappingInProgress_ = false;
      });
    });
  }

  /**
   * Makes the slide corresponding to the given index and the slides surrounding
   *    it available for display.
   * @param {number} newIndex Index of the slide to be displayed.
   * @private
   */
  showSlide_(newIndex) {
    const noOfSlides_ = this.noOfSlides_;
    if (newIndex < 0 ||
      newIndex >= noOfSlides_ ||
      this.slideIndex_ == newIndex) {
      return;
    }
    const prevIndex = (newIndex - 1 >= 0) ? newIndex - 1 :
        (this.shouldLoop) ? noOfSlides_ - 1 : null;
    const nextIndex = (newIndex + 1 < noOfSlides_) ? newIndex + 1 :
        (this.shouldLoop) ? 0 : null;

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
      if (this.shouldLoop) {
        setStyle(this.slideWrappers_[showIndex], 'order', loopIndex + 1);
      }
      this.slideWrappers_[showIndex].classList.add(SHOWN_CSS_CLASS);
      if (showIndex == newIndex) {
        this.scheduleLayout(this.slides_[showIndex]);
        this.scheduleResume(this.slides_[showIndex]);
      } else {
        this.schedulePreload(this.slides_[showIndex]);
      }
    });
    // A max of 3 slides are displayed at a time - we show the first slide
    // (which is at scrollLeft 0) when slide 0 is requested - for all other
    // instances we show the second slide (middle slide at
    // scrollLeft = slide's width).
    let newScrollLeft = this.slideWidth_;
    if (!this.shouldLoop && newIndex == 0) {
      newScrollLeft = 0;
    }

    this.slidesContainer_./*OK*/scrollLeft = newScrollLeft;
    this.slideIndex_ = newIndex;
    this.hideRestOfTheSlides_(showIndexArr);
    this.setControlsState();
  }

  /**
   * Given an index, hides rest of the slides that are not needed.
   * @param {!Array<number>} indexArr Array of indices that
   *    should not be hidden.
   * @private
   */
  hideRestOfTheSlides_(indexArr) {
    const noOfSlides_ = this.noOfSlides_;
    for (let i = 0; i < noOfSlides_; i++) {
      if (indexArr.indexOf(i) == -1 &&
          this.slideWrappers_[i].classList.contains(SHOWN_CSS_CLASS)) {
        if (this.shouldLoop) {
          setStyle(this.slideWrappers_[i], 'order', '');
        }
        this.slideWrappers_[i].classList.remove(SHOWN_CSS_CLASS);
        this.schedulePause(this.slides_[i]);
      }
    }
  }

  /**
   * Animate scrollLeft of the container.
   * @param {number} fromScrollLeft.
   * @param {number} toScrollLeft.
   * @return {!Promise}
   */
  animateScrollLeft_(fromScrollLeft, toScrollLeft) {
    if (fromScrollLeft == toScrollLeft) {
      return Promise.resolve();
    }
    const interpolate = numeric(fromScrollLeft, toScrollLeft);
    return Animation.animate(this.slidesContainer_, pos => {
      this.slidesContainer_./*OK*/scrollLeft = interpolate(pos);
    }, 80, 'ease-out').thenAlways();
  }
}
