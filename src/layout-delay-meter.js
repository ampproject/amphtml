/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {Services} from './services';
import {TickLabel} from './enums';
import {createViewportObserver} from './viewport-observer';
import {toWin} from './types';

const LABEL_MAP = {
  0: TickLabel.CONTENT_LAYOUT_DELAY,
  2: TickLabel.ADS_LAYOUT_DELAY,
};

/** @type {WeakMap<!Window, IntersectionObserver>} */
const viewportObservers = new WeakMap();

/**
 * Measures the time latency between "first time in viewport" and
 * "start to layout" of an element.
 */
export class LayoutDelayMeter {
  /**
   * @param {!Element} element
   * @param {number} priority
   */
  constructor(element, priority) {
    /** @private {!Element} */
    this.element_ = element;
    /** @private {!Window} */
    this.win_ = toWin(element.ownerDocument.defaultView);
    /** @private {?./service/performance-impl.Performance} */
    this.performance_ = Services.performanceForOrNull(this.win_);
    /** @private {?number} */
    this.firstInViewportTime_ = null;
    /** @private {?number} */
    this.firstLayoutTime_ = null;
    /** @private {boolean} */
    this.done_ = false;
    /** @private {?TickLabel} */
    this.label_ = LABEL_MAP[priority];

    this.initViewportObserver_();
  }

  /**
   * Initializes viewport observer for calling `enterViewport`.
   * @private
   */
  initViewportObserver_() {
    if (!viewportObservers.has(this.win_)) {
      viewportObservers.set(
        this.win_,
        createViewportObserver((entries) => {
          for (let i = 0; i < entries.length; i++) {
            const {target, isIntersecting} = entries[i];
            if (isIntersecting) {
              target.getLayoutDelayMeter().enterViewport();
            }
          }
        }, this.win_)
      );
    }
    viewportObservers.get(this.win_).observe(this.element_);
  }

  /**
   *
   */
  enterViewport() {
    if (!this.label_ || this.firstInViewportTime_) {
      return;
    }
    this.firstInViewportTime_ = this.win_.Date.now();
    this.tryMeasureDelay_();
  }

  /**
   * starts layout
   */
  startLayout() {
    if (!this.label_ || this.firstLayoutTime_) {
      return;
    }
    this.firstLayoutTime_ = this.win_.Date.now();
    this.tryMeasureDelay_();
  }

  /**
   * Tries to measure delay
   */
  tryMeasureDelay_() {
    if (!this.performance_ || !this.performance_.isPerformanceTrackingOn()) {
      return;
    }
    if (this.done_) {
      // Already measured.
      return;
    }
    if (this.firstInViewportTime_ == null || this.firstLayoutTime_ == null) {
      // Not ready yet.
      return;
    }
    const delay = this.win_.Math.max(
      this.firstLayoutTime_ - this.firstInViewportTime_,
      0
    );
    if (this.label_) {
      this.performance_.tickDelta(this.label_, delay);
    }
    this.performance_.throttledFlush();
    viewportObservers.get(this.win_).unobserve(this.element_);
    this.done_ = true;
  }
}
