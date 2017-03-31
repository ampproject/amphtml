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

import {isExperimentOn} from '../experiments';
import {performanceForOrNull} from '../services';
import {dev} from '../log';

/** @const {number} */
const NTH_FRAME = 200;

export class JankMeter {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;
    /** @private {number} */
    this.jankCnt_ = 0;
    /** @private {number} */
    this.totalCnt_ = 0;
    /** @private {?number} */
    this.scheduledTime_ = null;
    /** @private {?./performance-impl.Performance} */
    this.perf_ = performanceForOrNull(win);

    if (isJankMeterEnabled(win)) {
      /** @private {!Element} */
      this.jankMeterDisplay_ = this.win_.document.createElement('div');
      this.jankMeterDisplay_.classList.add('i-amphtml-jank-meter');
      this.win_.document.body.appendChild(this.jankMeterDisplay_);
      this.updateMeterDisplay_(0);
    }
  }

  onScheduled() {
    if (!this.isEnabled_()) {
      return;
    }
    // only take the first schedule for the current frame.
    if (this.scheduledTime_ == null) {
      this.scheduledTime_ = this.win_.Date.now();
    }
  }

  onRun() {
    if (!this.isEnabled_() || this.scheduledTime_ == null) {
      return;
    }
    const paintLatency = this.win_.Date.now() - this.scheduledTime_;
    this.scheduledTime_ = null;
    this.totalCnt_++;
    if (paintLatency > 16) {
      this.jankCnt_++;
      dev().info('JANK', 'Paint latency: ' + paintLatency + 'ms');
    }

    // Report Good Frame Probability on Nth frame.
    if (this.perf_ && this.totalCnt_ == NTH_FRAME) {
      this.perf_.tickDelta('gfp', this.calculateGfp_());
      this.perf_.flush();
    }
    if (isJankMeterEnabled(this.win_)) {
      this.updateMeterDisplay_(paintLatency);
    }
  }

  isEnabled_() {
    return isJankMeterEnabled(this.win_)
        || (this.perf_
            && this.perf_.isPerformanceTrackingOn()
            && this.totalCnt_ < NTH_FRAME);
  }

  /**
   * @param {number} paintLatency
   * @private
   */
  updateMeterDisplay_(paintLatency) {
    const gfp = this.calculateGfp_();
    this.jankMeterDisplay_.textContent =
        `${gfp}%|${this.totalCnt_}|${paintLatency}ms`;
  }

  /**
   * Calculate Good Frame Probability, which is a value range from 0 to 100.
   * @returns {number}
   * @private
   */
  calculateGfp_() {
    return this.win_.Math.floor(
        (this.totalCnt_ - this.jankCnt_) / this.totalCnt_ * 100);
  }
}

function isJankMeterEnabled(win) {
  return isExperimentOn(win, 'jank-meter');
}
