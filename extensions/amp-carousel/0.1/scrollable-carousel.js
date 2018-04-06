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

import {ActionTrust} from '../../../src/action-trust';
import {Animation} from '../../../src/animation';
import {BaseCarousel} from './base-carousel';
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {dev} from '../../../src/log';
import {isExperimentOn} from '../../../src/experiments';
import {numeric} from '../../../src/transition';

/** @const {string} */
const TAG = 'amp-scrollable-carousel';

export class AmpScrollableCarousel extends BaseCarousel {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {number} */
    this.pos_ = 0;

    /** @private {number} */
    this.oldPos_ = 0;

    /** @private {?Array<!Element>} */
    this.cells_ = null;

    /** @private {?Element} */
    this.container_ = null;

    /** @private {?number} */
    this.scrollTimerId_ = null;

    /** @private {boolean} */
    this.useLayers_ = false;
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

    this.useLayers_ = isExperimentOn(this.win, 'layers');

    this.cells_.forEach(cell => {
      if (!this.useLayers_) {
        this.setAsOwner(cell);
      }
      cell.classList.add('amp-carousel-slide');
      cell.classList.add('amp-scrollable-carousel-slide');
      this.container_.appendChild(cell);
    });

    this.cancelTouchEvents_();

    this.container_.addEventListener(
        'scroll', this.scrollHandler_.bind(this));

    this.registerAction('goToSlide', invocation => {
      const args = invocation.args;
      if (args) {
        this.goToSlide_(args['index']);
      }
    }, ActionTrust.HIGH);

    if (this.useLayers_) {
      this.declareLayer(this.container_);
    }
  }

  /** @override */
  layoutCallback() {
    if (!this.useLayers_) {
      this.doLayout_(this.pos_);
      this.preloadNext_(this.pos_, 1);
    }
    this.setControlsState();
    return Promise.resolve();
  }

  /** @override */
  onViewportCallback(unusedInViewport) {
    if (!this.useLayers_) {
      this.updateInViewport_(this.pos_, this.pos_);
    }
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
   * Scrolls to the slide at the given slide index.
   * @param {*} value
   * @private
   */
  goToSlide_(value) {
    const index = parseInt(value, 10);
    const noOfSlides = this.cells_.length;

    if (!isFinite(index) || index < 0 || index >= noOfSlides) {
      this.user().error(TAG, 'Invalid [slide] value: %s', value);
      return;
    }
    const newPos = this.getPosForSlideIndex_(index);
    const oldPos = this.pos_;

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

  /**
   * Calculates the target scroll position for the given slide index.
   * @param {number} index
   */
  getPosForSlideIndex_(index) {
    const cell = this.cells_[index];
    return cell./*OK*/offsetLeft;
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
   * @param {number} startingScrollLeft
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
    if (!this.useLayers_) {
      this.updateInViewport_(pos, this.oldPos_);
      this.doLayout_(pos);
      this.preloadNext_(pos, Math.sign(pos - this.oldPos_));
      this.oldPos_ = pos;
    }
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

  /**
   * @param {number} pos
   * @param {function(!Element)} callback
   * @private
   */
  withinWindow_(pos, callback) {
    const containerWidth = this.getLayoutWidth();
    for (let i = 0; i < this.cells_.length; i++) {
      const cell = this.cells_[i];
      if (cell./*OK*/offsetLeft + cell./*OK*/offsetWidth >= pos &&
            cell./*OK*/offsetLeft <= pos + containerWidth) {
        callback(cell);
      }
    }
  }

  /**
   * @param {number} pos
   * @private
   */
  doLayout_(pos) {
    this.withinWindow_(pos, cell => {
      this.scheduleLayout(cell);
    });
  }

  /**
   * @param {number} pos
   * @param {number} dir
   * @private
   */
  preloadNext_(pos, dir) {
    const nextPos = this.nextPos_(pos, dir);
    if (nextPos != pos) {
      this.withinWindow_(nextPos, cell => {
        this.schedulePreload(cell);
      });
    }
  }

  /**
   * @param {number} newPos
   * @param {number} oldPos
   * @private
   */
  updateInViewport_(newPos, oldPos) {
    const seen = [];
    this.withinWindow_(newPos, cell => {
      seen.push(cell);
      this.updateInViewport(cell, true);
    });
    if (oldPos != newPos) {
      this.withinWindow_(oldPos, cell => {
        if (!seen.includes(cell)) {
          this.updateInViewport(cell, false);
          this.schedulePause(cell);
        }
      });
    }
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

  /**
   * Cancels the touchmove events for the element so that viewer does not
   * consider the swipes in the carousel as swipes for changing AMP documents.
   * @private
   */
  cancelTouchEvents_() {
    // TODO(aghassemi, #4754): Ideally we only stop propagation of horizontal
    // touchmove events.
    this.element.addEventListener('touchmove', event => {
      event.stopPropagation();
    });
  }
}
