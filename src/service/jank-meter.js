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
import {dev} from '../log';

export class JankMeter {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;
    /** @private {!Element} */
    this.jankMeterDisplay_ = this.win_.document.createElement('div');
    this.jankMeterDisplay_.classList.add('i-amphtml-jank-meter');
    /** @private {number} */
    this.jankCounter_ = 0;
    /** @private {number} */
    this.bigJankCounter_ = 0;
    this.win_.document.body.appendChild(this.jankMeterDisplay_);
    this.updateMeterDisplay_(0);
    /** @private {number} */
    this.scheduledTime_ = -1;
  }

  onScheduled() {
    // only take the first schedule for the current frame.
    if (this.scheduledTime_ == -1) {
      this.scheduledTime_ = this.win_.performance.now();
    }
  }

  onRun() {
    const paintLatency =
        Math.floor(this.win_.performance.now() - this.scheduledTime_);
    this.scheduledTime_ = -1;
    if (paintLatency > 16) {
      this.jankCounter_++;
      if (paintLatency > 100) {
        this.bigJankCounter_++;
      }
      this.updateMeterDisplay_(paintLatency);
      dev().info('JANK', 'Paint latency: ' + paintLatency + 'ms');
    }
  }

  /**
   * @param {number} paintLatency
   * @private
   */
  updateMeterDisplay_(paintLatency) {
    this.jankMeterDisplay_.textContent =
        `${this.jankCounter_}|${this.bigJankCounter_}|${paintLatency}ms`;
  }
}

export function isJankMeterEnabled(win) {
  return isExperimentOn(win, 'jank-meter') && win.performance;
}
