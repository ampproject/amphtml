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

import {performanceForOrNull} from '../../../src/services';

/**
 * Measures the time latency between "first time in viewport" and
 * "start to layout" of an element.
 */
export class LayoutDelayMeter {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;
    /** @private {?../../../src/service/performance-impl.Performance} */
    this.performance_ = performanceForOrNull(win);
    /** @private {?number} */
    this.firstInViewportTime_ = null;
    /** @private {?number} */
    this.firstLayoutTime_ = null;
    /** @private {boolean} */
    this.done_ = false;
  }

  enterViewport() {
    if (this.firstInViewportTime_) {
      return;
    }
    this.firstInViewportTime_ = this.win_.Date.now();
    this.tryMeasureDelay_();
  }

  startLayout() {
    if (this.firstLayoutTime_) {
      return;
    }
    this.firstLayoutTime_ = this.win_.Date.now();
    this.tryMeasureDelay_();
  }

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
    this.performance_.tickDelta('adld', delay);
    // have to flush after tickDelta to prevent being overridden.
    this.performance_.flush();
    this.done_ = true;
  }
}
