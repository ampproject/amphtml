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
import {dev} from './log';

const LABEL_MAP = {
  0: 'cld',
  2: 'adld',
};

/**
 * Measures the time latency between "first time in viewport" and
 * "start to layout" of an element.
 */
export class LayoutDelayMeter {

  /**
   * @param {!Window} win
   * @param {number} priority
   */
  constructor(win, priority) {
    /** @private {!Window} */
    this.win_ = win;
    /** @private {?./service/performance-impl.Performance} */
    this.performance_ = Services.performanceForOrNull(win);
    /** @private {?number} */
    this.firstInViewportTime_ = null;
    /** @private {?number} */
    this.firstLayoutTime_ = null;
    /** @private {boolean} */
    this.done_ = false;
    /** @private {?string} */
    this.label_ = LABEL_MAP[priority];
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
    if (!this.firstInViewportTime_ || !this.firstLayoutTime_) {
      // Not ready yet.
      return;
    }
    const delay = this.win_.Math.max(
        this.firstLayoutTime_ - this.firstInViewportTime_, 0);
    this.performance_.tickDelta(dev().assertString(this.label_), delay);
    this.performance_.throttledFlush();
    this.done_ = true;
  }
}
