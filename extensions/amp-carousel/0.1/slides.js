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
import {BaseSlides} from './base-slides';
import {Gestures} from '../../../src/gesture';
import {SwipeXRecognizer} from '../../../src/gesture-recognizers';
import {bezierCurve} from '../../../src/curve';
import {isLayoutSizeDefined} from '../../../src/layout';
import {user} from '../../../src/log';


export class AmpSlides extends BaseSlides {

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildSlides() {
    /** @private {!Array<!Element>} */
    this.slides_ = this.getRealChildren();
    this.slides_.forEach((slide, i) => {
      this.setAsOwner(slide);
      // Only the first element is initially visible.
      slide.style.visibility = i > 0 ? 'hidden' : 'visible';
      this.applyFillContent(slide);
    });

    /** @private {number} */
    this.currentIndex_ = 0;

    user().assert(this.slides_.length >= 1,
        'amp-carousel with type=slides should have at least 1 slide.');
  }

  /** @override */
  isLoopingEligible() {
    return this.slides_.length > 2;
  }

  /** @override */
  layoutCallback() {
    const curSlide = this.curSlide_();
    if (curSlide) {
      this.scheduleLayout(curSlide);
      this.preloadNext_(1);
    }
    return Promise.resolve();
  }

  /** @override */
  updateViewportState(inViewport) {
    const curSlide = this.curSlide_();
    if (curSlide) {
      this.updateInViewport(curSlide, inViewport);
    }
  }

  /** @override */
  moveSlide(dir, animate) {
    const newIndex = this.nextIndex_(dir);
    // Guard again NaN by checking if greater than or equal to zero
    // since we can't have negative indexes anyways.
    if (newIndex >= 0 && newIndex != this.currentIndex_) {
      const newSlide = this.slides_[newIndex];
      const oldSlide = this.curSlide_();
      this.currentIndex_ = newIndex;
      this.prepareSlide_(newSlide, dir);
      if (!animate) {
        this.commitSwitch_(oldSlide, newSlide);
      } else {
        oldSlide.style.zIndex = 0;
        Animation.animate(this.element,
            this.createTransition_(oldSlide, newSlide, dir),
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
   * @private
   */
  prepareSlide_(slide, dir) {
    const containerWidth = this.element./*OK*/offsetWidth;
    st.setStyles(slide, {
      transform: st.translateX(dir * containerWidth),
      zIndex: 1,
      visibility: 'visible',
    });

    this.scheduleLayout(slide);
  }

  /**
   * @param {number} index
   * @private
   */
  resetSlide_(index) {
    const slide = this.slides_[index];
    if (index == this.currentIndex_) {
      st.setStyles(slide, {
        zIndex: 0,
        transform: '',
        opacity: 1,
      });
    } else {
      st.setStyles(slide, {
        visibility: 'hidden',
        zIndex: 0,
        transform: '',
        opacity: 1,
      });
    }
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
        opacity: tr.numeric(0.8, 1),
      }),
      tr.setStyles(oldSlide, {
        transform: tr.scale(tr.numeric(1, 0.98)),
        opacity: tr.numeric(1, 0.4),
      }),
    ]);
  }

  /**
   * @param {!Element} oldSlide
   * @param {!Element} newSlide
   * @private
   */
  commitSwitch_(oldSlide, newSlide) {
    st.setStyles(oldSlide, {
      visibility: 'hidden',
      zIndex: 0,
      transform: '',
      opacity: 1,
    });
    st.setStyles(newSlide, {
      visibility: 'visible',
      zIndex: 0,
      transform: '',
      opacity: 1,
    });
    this.updateInViewport(oldSlide, false);
    this.updateInViewport(newSlide, true);
    this.scheduleLayout(newSlide);
    this.scheduleResume(newSlide);
    this.setControlsState();
    this.schedulePause(oldSlide);
  }

  /**
   * @private
   * @return {?Element}
   */
  curSlide_() {
    return this.slides_[this.currentIndex_];
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
   * @param {!Swipe} unusedSwipe
   * @private
   */
  onSwipeStart_(unusedSwipe) {
    this.clearAutoplay();

    const currentSlide = this.curSlide_();
    const containerWidth = this.element./*OK*/offsetWidth;
    let minDelta = 0;
    let maxDelta = 0;
    let prevTr = tr.NOOP;
    let nextTr = tr.NOOP;
    const prevIndex = AmpSlides.getRelativeIndex(this.currentIndex_,
        -1, this.slides_.length);
    const nextIndex = AmpSlides.getRelativeIndex(this.currentIndex_,
        1, this.slides_.length);

    if (this.shouldLoop || this.currentIndex_ - 1 >= 0) {
      const prevSlide = this.slides_[prevIndex];
      this.prepareSlide_(prevSlide, -1);
      prevTr = this.createTransition_(currentSlide, prevSlide, -1);
      minDelta = -1;
    }
    if (this.shouldLoop || this.currentIndex_ + 1 < this.slides_.length) {
      const nextSlide = this.slides_[nextIndex];
      this.prepareSlide_(nextSlide, 1);
      nextTr = this.createTransition_(currentSlide, nextSlide, 1);
      maxDelta = 1;
    }
    this.swipeState_ = {
      containerWidth,
      prevTr,
      nextTr,
      prevIndex,
      nextIndex,
      min: minDelta,
      max: maxDelta,
      pos: 0,
      currentIndex: this.currentIndex_,
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
      promise = Animation.animate(this.element, time => {
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
      const oldSlide = this.curSlide_();
      if (newPos > 0.5) {
        s.nextTr(1);
        this.currentIndex_ = s.nextIndex;
        this.commitSwitch_(oldSlide, this.curSlide_());
        if (s.prevIndex != -1 && s.prevIndex != this.currentIndex_) {
          this.resetSlide_(s.prevIndex);
        }
      } else if (newPos < -0.5) {
        s.prevTr(1);
        this.currentIndex_ = s.prevIndex;
        this.commitSwitch_(oldSlide, this.curSlide_());
        if (s.nextIndex != -1 && s.nextIndex != this.currentIndex_) {
          this.resetSlide_(s.nextIndex);
        }
      } else {
        s.nextTr(0);
        s.prevTr(0);
        this.resetSlide_(this.currentIndex_);
        if (s.prevIndex != -1 && s.prevIndex != this.currentIndex_) {
          this.resetSlide_(s.prevIndex);
        }
        if (s.nextIndex != -1 && s.nextIndex != this.currentIndex_) {
          this.resetSlide_(s.nextIndex);
        }
      }
    });
  }

  /** @override */
  hasPrev() {
    if (this.shouldLoop) {
      return true;
    }
    return this.currentIndex_ != 0;
  }

  /** @override */
  hasNext() {
    if (this.shouldLoop) {
      return true;
    }
    return this.currentIndex_ < this.slides_.length - 1;
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
