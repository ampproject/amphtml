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
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {numeric} from '../../../src/transition';
import {dev} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-scrollable-carousel';

export class AmpScrollableCarousel extends BaseCarousel {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {number} */
    this.pos_ = 0;

    /** @private {?Array<!Element>} */
    this.cells_ = null;

    /** @private {?Element} */
    this.container_ = null;

    /** @private {?number} */
    this.scrollTimerId_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FIXED || layout == Layout.FIXED_HEIGHT;
  }

  /** @override */
  buildCarousel() {
    this.cells_ = this.getRealChildren();

    this.container_ = this.element.ownerDocument.createElement('div');
    this.container_.classList.add('i-amphtml-scrollable-carousel-container');
    this.element.appendChild(this.container_);

    this.cells_.forEach(cell => {
      cell.classList.add('amp-carousel-slide');
      cell.classList.add('amp-scrollable-carousel-slide');
      this.container_.appendChild(cell);
    });
    this.declareLayer(this.container_);
  }

  /** @override */
  layoutCallback() {
    this.setControlsState();
    return Promise.resolve();
  }

  /** @override */
  goCallback(dir, animate) {
    const newPos = this.nextPos_(this.pos_, dir);
    const oldPos = this.pos_;

    if (newPos == oldPos) {
      return;
    }

    if (!animate) {
      this.commitSwitch_(newPos);
      this.container_./*OK*/scrollLeft = newPos;
    } else {
      /** @const {!TransitionDef<number>} */
      const interpolate = numeric(oldPos, newPos);
      const duration = 200;
      const curve = 'ease-in-out';
      Animation.animate(this.element, pos => {
        this.container_./*OK*/scrollLeft = interpolate(pos);
      }, duration, curve).thenAlways(() => {
        this.commitSwitch_(newPos);
      });
    }
  }

  /**
   * Handles scroll on the carousel container.
   * @private
   */
  scrollHandler_() {
    const currentScrollLeft = this.container_./*OK*/scrollLeft;
    this.pos_ = currentScrollLeft;

    if (this.scrollTimerId_ === null) {
      this.waitForScroll_(currentScrollLeft);
    }
  }

  /**
   * @param {!number} startingScrollLeft
   * @private
   */
  waitForScroll_(startingScrollLeft) {
    this.scrollTimerId_ = Services.timerFor(this.win).delay(() => {
      // TODO(yuxichen): test out the threshold for identifying fast scrolling
      if (Math.abs(startingScrollLeft - this.pos_) < 30) {
        dev().fine(TAG, 'slow scrolling: ' + startingScrollLeft + ' - '
            + this.pos_);
        this.scrollTimerId_ = null;
        this.commitSwitch_(this.pos_);
      } else {
        dev().fine(TAG, 'fast scrolling: ' + startingScrollLeft + ' - '
            + this.pos_);
        this.waitForScroll_(this.pos_);
      }
    }, 100);
  }

  /**
   * Update the slides need to be loaded given current position.
   * Preload next slides and update control button state.
   * @param {number} pos
   * @private
   */
  commitSwitch_(pos) {
    this.pos_ = pos;
    this.setControlsState();
  }

  /**
   * @param {number} pos
   * @param {number} dir
   * @return {number}
   * @private
   */
  nextPos_(pos, dir) {
    // TODO(jridgewell): this could be using cached values from Layers.
    const containerWidth = this.element./*OK*/offsetWidth;
    const fullWidth = this.container_./*OK*/scrollWidth;
    const newPos = pos + dir * containerWidth;
    if (newPos < 0) {
      return 0;
    }
    if (fullWidth >= containerWidth &&
            newPos > fullWidth - containerWidth) {
      return fullWidth - containerWidth;
    }
    return newPos;
  }

  /** @override */
  hasPrev() {
    return this.pos_ != 0;
  }

  /** @override */
  hasNext() {
    // TODO(jridgewell): this could be using cached values from Layers.
    const containerWidth = this.getLayoutWidth();
    const scrollWidth = this.container_./*OK*/scrollWidth;
    const maxPos = Math.max(scrollWidth - containerWidth, 0);
    return this.pos_ != maxPos;
  }

  /** @override */
  setupGestures() {
    this.container_.addEventListener('scroll', this.scrollHandler_.bind(this));

    // Cancels the touchmove events for the element so that viewer does not
    // consider the swipes in the carousel as swipes for changing AMP documents.
    // TODO(aghassemi, #4754): Ideally we only stop propagation of horizontal
    // touchmove events.
    this.element.addEventListener('touchmove', event => {
      event.stopPropagation();
    });
  }
}
