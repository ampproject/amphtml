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
import {isLayoutSizeDefined} from '../../../src/layout';
import * as st from '../../../src/style';
import * as tr from '../../../src/transition';


/**
 * @deprecated `amp-slides` is deprecated and will be deleted before 1.0.
 * Please see {@link AmpCarousel} with `type=slides` attribute instead.
 */
class AmpSlides extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    /** @private {!Array<!Element>} */
    this.slides_ = this.getRealChildren();
    this.slides_.forEach((slide, i) => {
      this.setAsOwner(slide);
      // Only the first element is initially visible.
      st.setStyle(slide, 'display', i > 0 ? 'none' : 'block');
      this.applyFillContent(slide);
    });

    /** @private {number} */
    this.currentIndex_ = 0;

    this.prevButton_ = this.element.ownerDocument.createElement('button');
    this.prevButton_.textContent = '\u276E';
    st.setStyles(this.prevButton_, {
      opacity: 0.6,
      position: 'absolute',
      zIndex: 10,
      left: '16px',
      top: '50%',
      padding: '8px',
      fontSize: '24px',
      marginTop: '-20px',
      pointerEvents: 'all',
    });
    this.prevButton_.onclick = () => {
      this.go(-1, true);
    };
    this.element.appendChild(this.prevButton_);

    this.nextButton_ = this.element.ownerDocument.createElement('button');
    this.nextButton_.textContent = '\u276F';
    st.setStyles(this.nextButton_, {
      opacity: 0.6,
      position: 'absolute',
      zIndex: 10,
      right: '16px',
      top: '50%',
      padding: '8px',
      fontSize: '24px',
      marginTop: '-20px',
      pointerEvents: 'all',
    });
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
    const newIndex = this.nextIndex_(dir);
    if (newIndex != this.currentIndex_) {
      const newSlide = this.slides_[newIndex];
      const oldSlide = this.slides_[this.currentIndex_];
      this.currentIndex_ = newIndex;
      this.prepareSlide_(newSlide, dir);
      if (!animate) {
        this.commitSwitch_(oldSlide, newSlide);
      } else {
        st.setStyle(oldSlide, 'zIndex', 0);
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
   */
  prepareSlide_(slide, dir) {
    const containerWidth = this.element./*OK*/offsetWidth;
    st.setStyles(slide, {
      transform: st.translateX(dir * containerWidth),
      zIndex: 1,
      display: 'block',
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
      display: 'none',
      zIndex: 0,
      transform: '',
      transition: '',
      opacity: 1,
    });
    st.setStyles(newSlide, {
      display: 'block',
      zIndex: 0,
      transform: '',
      transition: '',
      opacity: 1,
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
}

AMP.registerElement('amp-slides', AmpSlides);
