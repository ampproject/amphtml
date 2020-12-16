/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {throttle} from '../utils/rate-limit';

/** @const {number} */
const SCROLL_THROTTLE_MS = 500;

/**
 * Creates an IntersectionObserver or fallback using scroll events.
 * Fires viewportCb when criteria is met and unobserves immediately after.
 */
export class AmpStoryPlayerViewportObserver {
  /**
   * @param {!Window} win
   * @param {!Element} element
   * @param {function} viewportCb
   * @param {number} distance Minimum of viewports away for triggering viewportCb
   */
  constructor(win, element, viewportCb, distance = 0) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Element} */
    this.element_ = element;

    /** @private {function} */
    this.cb_ = viewportCb;

    /** @private {number} */
    this.viewportDistance_ = distance;

    /** @private {?function} */
    this.scrollHandler_ = null;

    this.initializeInObOrFallback_();
  }

  /** @private */
  initializeInObOrFallback_() {
    if (!this.win_.IntersectionObserver || this.win_ !== this.win_.parent) {
      this.createInObFallback_();
      return;
    }

    this.createInOb_();
  }

  /**
   * Creates an IntersectionObserver.
   * @private
   */
  createInOb_() {
    const inObCallback = (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        this.cb_();
        observer.unobserve(this.element_);
      });
    };

    const observer = new this.win_.IntersectionObserver(inObCallback, {
      rootMargin: `${this.viewportDistance_ * 100}%`,
    });

    observer.observe(this.element_);
  }

  /**
   * Fallback for when IntersectionObserver is not supported. Calls
   * layoutCallback on the element when it is close to the viewport.
   * @private
   */
  createInObFallback_() {
    this.scrollHandler_ = throttle(
      this.win_,
      this.checkIfVisibleFallback_.bind(this),
      SCROLL_THROTTLE_MS
    );

    this.win_.addEventListener('scroll', this.scrollHandler_);

    this.checkIfVisibleFallback_(this.element_);
  }

  /**
   * Checks if element is close to the viewport and calls the callback when it
   * is.
   * @private
   */
  checkIfVisibleFallback_() {
    const elTop = this.element_./*OK*/ getBoundingClientRect().top;
    const winInnerHeight = this.win_./*OK*/ innerHeight;
    const multiplier = this.viewportDistance_ > 0 ? this.viewportDistance_ : 1;

    if (winInnerHeight * multiplier > elTop) {
      this.cb_();
      this.win_.removeEventListener('scroll', this.scrollHandler_);
    }
  }
}
