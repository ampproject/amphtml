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

import {ActionTrust} from '../../../src/action-constants';
import {BaseCarousel} from './base-carousel';
import {Services} from '../../../src/services';
import {isFiniteNumber} from '../../../src/types';
import {userAssert} from '../../../src/log';

export class BaseSlides extends BaseCarousel {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?number} */
    this.autoplayTimeoutId_ = null;

    /** @private {boolean} */
    this.hasLoop_ = false;

    /** @private {boolean} */
    this.loopAdded_ = false;

    /** @private {boolean} */
    this.hasAutoplay_ = false;

    /** @private {number} */
    this.autoplayDelay_ = 5000;

    /** @protected {?number} */
    this.autoplayLoops_ = null;

    /** @protected {number} */
    this.loopsMade_ = 0;

    /** @protected {boolean} */
    this.shouldLoop = false;

    /** @private {boolean} */
    this.shouldAutoplay_ = false;
  }

  /** @override */
  buildCarousel() {
    this.hasLoop_ = this.element.hasAttribute('loop');

    this.hasAutoplay_ = this.element.hasAttribute('autoplay');
    const autoplayVal = this.element.getAttribute('autoplay');
    if (autoplayVal) {
      this.autoplayLoops_ = parseInt(autoplayVal, 10);
      userAssert(isFiniteNumber(this.autoplayLoops_));
    }
    this.buildSlides();

    this.shouldLoop = this.hasLoop_ && this.isLoopingEligible();

    this.shouldAutoplay_ = this.hasAutoplay_ && this.isLoopingEligible();

    if (this.shouldAutoplay_ && this.autoplayLoops_ != 0) {
      this.setupAutoplay_();
    }

    this.registerAction('toggleAutoplay', invocation => {
      const {args} = invocation;
      if (args && args['toggleOn'] !== undefined) {
        this.toggleAutoplay_(args['toggleOn']);
      } else {
        this.toggleAutoplay_(!this.hasAutoplay_);
      }
    }, ActionTrust.LOW);
  }

  /**
   * Builds slides
   */
  buildSlides() {
    // Subclasses may override
  }

  /** @override */
  onViewportCallback(inViewport) {
    this.updateViewportState(inViewport);
    if (inViewport) {
      this.autoplay_();
    } else {
      this.clearAutoplay();
    }
  }

  /** @override */
  goCallback(dir, animate, opt_autoplay) {
    this.moveSlide(dir, animate);
    if (opt_autoplay) {
      this.autoplay_();
    } else {
      this.clearAutoplay();
    }
  }

  /**
   * Proceeds to the next slide in the desired direction.
   * @param {number} unusedDir -1 or 1
   * @param {boolean} unusedAnimate
   * @protected
   */
  moveSlide(unusedDir, unusedAnimate) {
    // Subclasses may override.
  }

  /**
   * Updates the viewport state when there is a viewport callback.
   * @param {boolean} unusedInViewport
   * @protected
   */
  updateViewportState(unusedInViewport) {}

  /**
  * Checks if a carousel is eligible to loop, regardless of the loop attribute.
  * @return {boolean}
  * @protected
  */
  isLoopingEligible() {
    return false;
  }

  /**
  * Sets up the `autoplay` configuration.
  * @private
  */
  setupAutoplay_() {
    const delayValue = Number(this.element.getAttribute('delay'));
    // If it isn't a number and is not greater than 0 then don't assign
    // and use the default.
    if (delayValue > 0) {
      // Guard against autoplayValue that is lower than 1s to prevent
      // people from crashing the runtime with providing very low delays.
      this.autoplayDelay_ = Math.max(1000, delayValue);
    }

    // By default `autoplay` should also mean that the current carousel slide
    // is looping. (to be able to advance past the last item)
    if (!this.hasLoop_) {
      this.element.setAttribute('loop', '');
      this.loopAdded_ = true;
      this.hasLoop_ = true;
      this.shouldLoop = true;
    }
  }

  /**
  * Starts the autoplay delay if allowed.
  * @private
  */
  autoplay_() {
    if (!this.shouldAutoplay_ || this.autoplayLoops_ == 0) {
      return;
    }
    this.clearAutoplay();
    this.autoplayTimeoutId_ = /** @type {number} */ (
      Services.timerFor(this.win).delay(
          this.go.bind(
              this, /* dir */ 1, /* animate */ true, /* autoplay */ true),
          this.autoplayDelay_));
  }

  /**
   * Called by toggleAutoplay action to toggle the autoplay feature.
   * @param {boolean} toggleOn
   * @private
   */
  toggleAutoplay_(toggleOn) {
    if (toggleOn == this.shouldAutoplay_) {
      return;
    }

    const prevAutoplayStatus = this.shouldAutoplay_;

    this.hasAutoplay_ = toggleOn;
    this.shouldAutoplay_ = this.hasAutoplay_ && this.isLoopingEligible();

    if (!prevAutoplayStatus && this.shouldAutoplay_) {
      this.setupAutoplay_();
    }

    if (this.shouldAutoplay_) {
      this.autoplay_();
    } else {
      this.clearAutoplay();
    }
  }

  /**
  * Clear the autoplay timer.
  * @protected
  */
  clearAutoplay() {
    if (this.autoplayTimeoutId_ !== null) {
      Services.timerFor(this.win).cancel(this.autoplayTimeoutId_);
      this.autoplayTimeoutId_ = null;
    }
  }

  /**
  * Remove autoplay.
  * @protected
  */
  removeAutoplay() {
    this.clearAutoplay();
    if (this.loopAdded_) {
      // Only remove if specified due to the `autoplay` attribute
      this.element.removeAttribute('loop');
      this.loopAdded_ = false;
      this.hasLoop_ = false;
      this.shouldLoop = false;
    }
    this.hasAutoplay_ = false;
    this.shouldAutoplay_ = this.hasAutoplay_ && this.isLoopingEligible();
  }
}
