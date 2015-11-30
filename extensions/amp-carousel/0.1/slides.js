/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import * as st from '../../../src/style';
import * as tr from '../../../src/transition';
import {Animation} from '../../../src/animation';
import {BaseCarousel} from './base-carousel';
import {Gestures} from '../../../src/gesture';
import {SwipeXRecognizer} from '../../../src/gesture-recognizers';
import {bezierCurve} from '../../../src/curve';
import {continueMotion} from '../../../src/motion';
import {isLayoutSizeDefined} from '../../../src/layout';
import {timer} from '../../../src/timer';


export class AmpSlides extends BaseCarousel {

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCarousel() {
    /** @private @const {boolean} */
    this.isLooping_ = this.element.hasAttribute('loop');

    /** @private @const {boolean} */
    this.isAutoplayRequested_ = this.element.hasAttribute('autoplay');

    /** @private @const {number} */
    this.autoplayDelay_ = 5000;

    /** @private {!Array<!Element>} */
    this.slides_ = this.getRealChildren();
    this.slides_.forEach((slide, i) => {
      this.setAsOwner(slide);
      // Only the first element is initially visible.
      slide.style.display = i > 0 ? 'none' : 'block';
      this.applyFillContent(slide);
    });

    /** @private {number} */
    this.currentIndex_ = 0;

    /** @private {?number} */
    this.autoplayTimeoutId_ = null;

    this.setupAutoplay_();
  }

  /** @override */
  layoutCallback() {
    this.scheduleLayout(this.slides_[this.currentIndex_]);
    this.preloadNext_(1);
    return Promise.resolve();
  }

  /** @override */
  viewportCallback(inViewport) {
    this.updateInViewport(this.slides_[this.currentIndex_], inViewport);
    this.tryAutoplay_(1, true);
  }

  /** @override */
  goCallback(dir, animate) {
    const newIndex = this.nextIndex_(dir);
    if (newIndex != this.currentIndex_) {
      const newSlide = this.slides_[newIndex];
      const oldSlide = this.slides_[this.currentIndex_];
      this.currentIndex_ = newIndex;
      this.prepareSlide_(newSlide, dir);
      if (!animate) {
        this.commitSwitch_(oldSlide, newSlide);
      } else {
        oldSlide.style.zIndex = 0;
        Animation.animate(this.createTransition_(oldSlide, newSlide, dir),
            200, 'ease-out').thenAlways(() => {
              this.commitSwitch_(oldSlide, newSlide);
              this.preloadNext_(dir);
            });
      }
    }
    this.tryAutoplay_(1, true);
  }

  /**
   * Sets up the `autoplay` configuration.
   * @private
   */
  setupAutoplay_() {
    if (!this.isAutoplayRequested_) {
      return;
    }

    const autoplayValue = Number(this.element.getAttribute('autoplay'));
    // If it isn't a number and is not greater than 0 then don't assign
    // and use the default.
    if (autoplayValue > 0) {
      // Guard against autoplayValue that is lower than 1s to prevent
      // people from crashing the runtime with providing very low delays.
      this.autoplayDelay_ = Math.max(1000, autoplayValue);
    }

    // By default `autoplay` should also mean that the current carousel slide
    // is looping. (to be able to advance past the last item)
    if (!this.element.hasAttribute('loop')) {
      this.element.setAttribute('loop', '');
      this.isLooping_ = true;
    }
  }

  /**
   * Sets up the autoplay delay if necessary.
   * @private
   * @param {number} dir -1 or 1
   * @param {boolean} animate
   */
  tryAutoplay_(dir, animate) {
    this.tryCancelAutoplayTimeout_();

    // If amp-carousel is not in viewport then no need to queue up new
    // call to `go`.
    if (!(this.isAutoplayRequested_ && this.isInViewport())) {
      return;
    }

    this.autoplayTimeoutId_ = timer.delay(this.go.bind(this, dir, animate),
        this.autoplayDelay_);
  }

  /**
   * Cancel `autoplay` timeout if one is in queue.
   * @private
   */
  tryCancelAutoplayTimeout_() {
    if (this.autoplayTimeoutId_ !== null) {
      timer.cancel(this.autoplayTimeoutId_);
      this.autoplayTimeoutId_ = null;
    }
  }

  /**
   * @param {!Element} slide
   * @param {number} dir
   */
  prepareSlide_(slide, dir) {
    const containerWidth = this.element./*OK*/offsetWidth;
    st.setStyles(slide, {
      transform: st.translateX(dir * containerWidth),
      zIndex: 1,
      display: 'block'
    });

    this.scheduleLayout(slide);
  }

  /**
   * @param {!Element} oldSlide
   * @param {!Element} newSlide
   * @param {number} dir
   * @return {!Transition}
   */
  createTransition_(oldSlide, newSlide, dir) {
    const containerWidth = this.element./*OK*/offsetWidth;
    return tr.all([
      tr.setStyles(newSlide, {
        transform: tr.translateX(tr.numeric(dir * containerWidth, 0)),
        opacity: tr.numeric(0.8, 1)
      }),
      tr.setStyles(oldSlide, {
        transform: tr.scale(tr.numeric(1, 0.98)),
        opacity: tr.numeric(1, 0.4)
      })
    ]);
  }

  /**
   * @param {!Element} oldSlide
   * @param {!Element} newSlide
   * @private
   */
  commitSwitch_(oldSlide, newSlide) {
    st.setStyles(oldSlide, {
      display: 'none',
      zIndex: 0,
      transform: '',
      opacity: 1
    });
    st.setStyles(newSlide, {
      display: 'block',
      zIndex: 0,
      transform: '',
      opacity: 1
    });
    this.scheduleLayout(newSlide);
    this.updateInViewport(oldSlide, false);
    this.updateInViewport(newSlide, true);
  }

  /**
   * @param {number} dir
   * @private
   */
  nextIndex_(dir) {
    // TODO(dvoytenko): disable loop by spec.
    let newIndex = this.currentIndex_ + dir;
    if (newIndex < 0) {
      newIndex = this.slides_.length + newIndex;
    } else if (newIndex >= this.slides_.length) {
      newIndex = newIndex % this.slides_.length;
    }
    return newIndex;
  }

  /**
   * @param {number} dir
   * @private
   */
  preloadNext_(dir) {
    // TODO(dvoytenko): can we actually preload it here? There's no
    // guarantee of it has display!=none.
    const nextIndex = this.nextIndex_(dir);
    if (nextIndex != this.currentIndex_) {
      this.schedulePreload(this.slides_[nextIndex]);
    }
  }

  /** @override */
  setupGestures() {
    /**
     * @private {?{
     *   containerWidth: number,
     *   prevTr: !Transition,
     *   nextTr: !Transition,
     *   min: number,
     *   max: number,
     *   pos: number,
     *   currentIndex: number
     * }} */
    this.swipeState_ = null;

    const gestures = Gestures.get(this.element);
    gestures.onGesture(SwipeXRecognizer, e => {
      if (e.data.first) {
        this.onSwipeStart_(e.data);
      }
      this.onSwipe_(e.data);
      if (e.data.last) {
        this.onSwipeEnd_(e.data);
      }
    });
  }

  /**
   * @param {!Swipe} swipe
   * @private
   */
  onSwipeStart_(swipe) {
    const currentSlide = this.slides_[this.currentIndex_];
    const containerWidth = this.element./*OK*/offsetWidth;
    let minDelta = 0;
    let maxDelta = 0;
    let prevTr = tr.NOOP;
    let nextTr = tr.NOOP;
    const prevIndex = AmpSlides.getRelativeIndex(this.currentIndex_,
        -1, this.slides_.length);
    const nextIndex = AmpSlides.getRelativeIndex(this.currentIndex_,
        1, this.slides_.length);

    if (this.isLooping_ || this.currentIndex_ - 1 >= 0) {
      const prevSlide = this.slides_[prevIndex];
      this.prepareSlide_(prevSlide, -1);
      prevTr = this.createTransition_(currentSlide, prevSlide, -1);
      minDelta = -1;
    }
    if (this.isLooping_ || this.currentIndex_ + 1 < this.slides_.length) {
      const nextSlide = this.slides_[nextIndex];
      this.prepareSlide_(nextSlide, 1);
      nextTr = this.createTransition_(currentSlide, nextSlide, 1);
      maxDelta = 1;
    }
    this.swipeState_ = {
      containerWidth: containerWidth,
      prevTr: prevTr,
      nextTr: nextTr,
      prevIndex: prevIndex,
      nextIndex: nextIndex,
      min: minDelta,
      max: maxDelta,
      pos: 0,
      currentIndex: this.currentIndex_
    };
  }

  /**
   * @param {!Swipe} swipe
   * @private
   */
  onSwipe_(swipe) {
    const s = this.swipeState_;
    if (!s || s.currentIndex != this.currentIndex_) {
      return;
    }

    // Translate the gesture position to be a number between -1 and 1,
    // with negative values indiamping sliding to the previous slide and
    // positive indiamping sliding to the next slide.
    const pos = Math.min(s.max, Math.max(s.min,
        -swipe.deltaX / s.containerWidth));

    s.nextTr(pos > 0 ? pos : 0);
    s.prevTr(pos < 0 ? -pos : 0);
    s.pos = pos;
  }

  /**
   * @param {!Swipe} swipe
   * @return {!Promise}
   * @private
   */
  onSwipeEnd_(swipe) {
    const s = this.swipeState_;
    if (!s || s.currentIndex != this.currentIndex_) {
      return;
    }
    this.swipeState_ = null;

    let advPos = s.pos;
    if (s.pos * -swipe.velocityX >= 0) {
      advPos = s.pos - Math.sign(swipe.velocityX) *
          (Math.abs(swipe.velocityX) > 0.2 ? 1 : 0);
    }
    advPos = Math.min(s.max, Math.max(s.min, advPos));
    const newPos = Math.abs(advPos) >= 0.55 ? Math.sign(advPos) : 0;
    let promise;
    if (newPos != s.pos) {
      const posFunc = tr.numeric(s.pos, newPos);
      promise = Animation.animate(time => {
        const pos = posFunc(time);
        s.nextTr(pos > 0 ? pos : 0);
        s.prevTr(pos < 0 ? -pos : 0);
        s.pos = pos;
      }, 150, bezierCurve(0.19, 0.49, 0.2, 1)).thenAlways();
    } else {
      promise = Promise.resolve();
    }
    return promise.then(() => {
      if (s.currentIndex != this.currentIndex_) {
        return;
      }
      const oldSlide = this.slides_[this.currentIndex_];
      if (newPos > 0.5) {
        s.nextTr(1);
        this.currentIndex_ = s.nextIndex;
        this.commitSwitch_(oldSlide, this.slides_[this.currentIndex_]);
      } else if (newPos < -0.5) {
        s.prevTr(1);
        this.currentIndex_ = s.prevIndex;
        this.commitSwitch_(oldSlide, this.slides_[this.currentIndex_]);
      } else {
        s.nextTr(0);
        s.prevTr(0);
      }
    });
  }

  /** @override */
  hasPrev() {
    if (this.isLooping_) {
      return true;
    }
    return this.currentIndex_ != 0;
  }

  /** @override */
  hasNext() {
    if (this.isLooping_) {
      return true;
    }
    return this.currentIndex_ != this.slides_.length - 1;
  }

  /**
   * Gets the relative index using a step value that loops around even if the
   * step goes out of bounds of the current length. (less than zero, greater
   * than current length - 1)
   * @param {number} index index position of item within length exclusive.
   * @param {number} step step amount to offset from index.
   * @param {number} length length of the vector.
   */
  static getRelativeIndex(index, step, length) {
    return (index + step + length) % length;
  }
}
