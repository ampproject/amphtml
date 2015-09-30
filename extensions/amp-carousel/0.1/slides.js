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

import {Animation} from '../../../src/animation';
import {BaseCarousel} from './base-carousel';
import {Gestures} from '../../../src/gesture';
import {SwipeXRecognizer} from '../../../src/gesture-recognizers';
import {bezierCurve} from '../../../src/curve';
import {continueMotion} from '../../../src/motion';
import {isLayoutSizeDefined} from '../../../src/layout';
import * as st from '../../../src/style';
import * as tr from '../../../src/transition';


export class AmpSlides extends BaseCarousel {

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCarousel() {
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
  }

  /** @override */
  go(dir, animate) {
    var newIndex = this.nextIndex_(dir);
    if (newIndex != this.currentIndex_) {
      var newSlide = this.slides_[newIndex];
      var oldSlide = this.slides_[this.currentIndex_];
      this.currentIndex_ = newIndex;
      this.prepareSlide_(newSlide, dir);
      var containerWidth = this.element.offsetWidth;
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
  }

  /**
   * @param {!Element} slide
   * @param {number} dir
   */
  prepareSlide_(slide, dir) {
    var containerWidth = this.element.offsetWidth;
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
    var containerWidth = this.element.offsetWidth;
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
    var nextIndex = this.nextIndex_(dir);
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

    let gestures = Gestures.get(this.element);
    gestures.onGesture(SwipeXRecognizer, (e) => {
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
    let currentSlide = this.slides_[this.currentIndex_];
    let containerWidth = this.element.offsetWidth;
    let minDelta = 0;
    let maxDelta = 0;
    let prevTr = tr.NOOP;
    let nextTr = tr.NOOP;
    if (this.currentIndex_ - 1 >= 0) {
      let prevSlide = this.slides_[this.currentIndex_ - 1];
      this.prepareSlide_(prevSlide, -1);
      prevTr = this.createTransition_(currentSlide, prevSlide, -1);
      minDelta = -1;
    }
    if (this.currentIndex_ + 1 < this.slides_.length) {
      let nextSlide = this.slides_[this.currentIndex_ + 1];
      this.prepareSlide_(nextSlide, 1);
      nextTr = this.createTransition_(currentSlide, nextSlide, 1);
      maxDelta = 1;
    }
    this.swipeState_ = {
      containerWidth: containerWidth,
      prevTr: prevTr,
      nextTr: nextTr,
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
    let s = this.swipeState_;
    if (!s || s.currentIndex != this.currentIndex_) {
      return;
    }

    // Translate the gesture position to be a number between -1 and 1,
    // with negative values indiamping sliding to the previous slide and
    // positive indiamping sliding to the next slide.
    let pos = Math.min(s.max, Math.max(s.min,
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
    let s = this.swipeState_;
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
    let newPos = Math.abs(advPos) >= 0.55 ? Math.sign(advPos) : 0;
    let promise;
    if (newPos != s.pos) {
      let posFunc = tr.numeric(s.pos, newPos);
      promise = Animation.animate((time) => {
        let pos = posFunc(time);
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
      let oldSlide = this.slides_[this.currentIndex_];
      if (newPos > 0.5) {
        s.nextTr(1);
        this.currentIndex_++;
        this.commitSwitch_(oldSlide, this.slides_[this.currentIndex_]);
      } else if (newPos < -0.5) {
        s.prevTr(1);
        this.currentIndex_--;
        this.commitSwitch_(oldSlide, this.slides_[this.currentIndex_]);
      } else {
        s.nextTr(0);
        s.prevTr(0);
      }
    });
  }
}
