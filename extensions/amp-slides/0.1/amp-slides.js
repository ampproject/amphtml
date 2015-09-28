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
import {SwipeXRecognizer} from '../../../src/swipe';
import {isLayoutSizeDefined} from '../../../src/layout';
import * as st from '../../../src/style';
import * as tr from '../../../src/transition';


class AmpSlides extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  isReadyToBuild() {
    return this.getRealChildren().length > 0;
  }

  /** @override */
  buildCallback() {
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

    /** @private @const */
    this.swipeX_ = new SwipeXRecognizer(this.element);

    /**
     * @private {?{
     *   containerWidth: number,
     *   prevTr: !Transition,
     *   nextTr: !Transition
     * }} */
    this.swipeState_ = null;

    this.swipeX_.onStart((e) => {
      let currentSlide = this.slides_[this.currentIndex_];
      let containerWidth = this.element.offsetWidth;
      let minDelta = 0;
      let maxDelta = 0;
      let prevTr = tr.NULL;
      let nextTr = tr.NULL;
      if (this.currentIndex_ - 1 >= 0) {
        let prevSlide = this.slides_[this.currentIndex_ - 1];
        this.prepareSlide_(prevSlide, -1);
        prevTr = this.createTransition_(currentSlide, prevSlide, -1);
        maxDelta = containerWidth;
      }
      if (this.currentIndex_ + 1 < this.slides_.length) {
        let nextSlide = this.slides_[this.currentIndex_ + 1];
        this.prepareSlide_(nextSlide, 1);
        nextTr = this.createTransition_(currentSlide, nextSlide, 1);
        minDelta = -containerWidth;
      }
      this.swipeState_ = {
        containerWidth: containerWidth,
        prevTr: prevTr,
        nextTr: nextTr
      };
      // Translate the gesture position to be a number between -1 and 1,
      // with negative values indiamping sliding to the previous slide and
      // positive indiamping sliding to the next slide.
      this.swipeX_.setPositionMultiplier(-1 / containerWidth);
      this.swipeX_.setBounds(minDelta, maxDelta, /* overshoot */ 0);
      this.swipeX_.continueMotion(/* snapPoint */ 0.55,
          /* stopOnTouch */ false);
    });
    this.swipeX_.onMove((e) => {
      let s = this.swipeState_;
      s.nextTr(e.position > 0 ? e.position : 0);
      s.prevTr(e.position < 0 ? -e.position : 0);
    });
    this.swipeX_.onEnd((e) => {
      let s = this.swipeState_;
      this.swipeState_ = null;
      let oldSlide = this.slides_[this.currentIndex_];
      if (e.position > 0.5) {
        s.nextTr(1);
        this.currentIndex_++;
        this.commitSwitch_(oldSlide, this.slides_[this.currentIndex_]);
      } else if (e.position < -0.5) {
        s.prevTr(-1);
        this.currentIndex_--;
        this.commitSwitch_(oldSlide, this.slides_[this.currentIndex_]);
      } else {
        s.nextTr(0);
        s.prevTr(0);
      }
    });

    this.prevButton_ = document.createElement('button');
    this.prevButton_.textContent = '\u276E';
    this.prevButton_.style.opacity = 0.6;
    this.prevButton_.style.position = 'absolute';
    this.prevButton_.style.zIndex = 10;
    this.prevButton_.style.left = '16px';
    this.prevButton_.style.top = '50%';
    this.prevButton_.style.padding = '8px';
    this.prevButton_.style.fontSize = '24px';
    this.prevButton_.style.marginTop = '-20px';
    this.prevButton_.style.pointerEvents = 'all';
    this.prevButton_.onclick = () => {
      this.go(-1, true);
    };
    this.element.appendChild(this.prevButton_);

    this.nextButton_ = document.createElement('button');
    this.nextButton_.textContent = '\u276F';
    this.nextButton_.style.opacity = 0.6;
    this.nextButton_.style.position = 'absolute';
    this.nextButton_.style.zIndex = 10;
    this.nextButton_.style.right = '16px';
    this.nextButton_.style.top = '50%';
    this.nextButton_.style.padding = '8px';
    this.nextButton_.style.fontSize = '24px';
    this.nextButton_.style.marginTop = '-20px';
    this.nextButton_.style.pointerEvents = 'all';
    this.nextButton_.onclick = () => {
      this.go(1, true);
    };
    this.element.appendChild(this.nextButton_);
  }

  /** @override */
  prerenderAllowed() {
    return true;
  }

  /** @override */
  isRelayoutNeeded() {
    return true;
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

  /**
   * Proceeds to the next slide in the desired direction.
   * @param {number} dir -1 or 1
   * @param {boolean} animate
   */
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
    oldSlide.style.display = 'none';
    oldSlide.style.zIndex = 0;
    oldSlide.style.transform = '';
    oldSlide.style.transition = '';
    oldSlide.style.opacity = 1;
    newSlide.style.display = 'block';
    newSlide.style.zIndex = 0;
    newSlide.style.transform = '';
    newSlide.style.transition = '';
    newSlide.style.opacity = 1;
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
}

AMP.registerElement('amp-slides', AmpSlides);
