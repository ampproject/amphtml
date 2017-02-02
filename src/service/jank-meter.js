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
    /** @const {!Window} */
    this.win = win;

    /** @private {!Element} */
    this.jankMeterDisplay_ = this.win.document.createElement('div');
    this.jankMeterDisplay_.classList.add('i-amphtml-jank-meter');
    /** @private {number} */
    this.jankCounter_ = 0;
    /** @private {number} */
    this.bigJankCounter_ = 0;
    this.win.document.body.appendChild(this.jankMeterDisplay_);
    this.jankMeterDisplay_.textContent = '0|0|0ms';
    /** @private {number} */
    this.scheduledTime_ = -1;
  }

  onScheduled() {
    // only take the first schedule for the current frame.
    if (this.scheduledTime_ == -1) {
      this.scheduledTime_ = this.win.performance.now();
    }
  }

  onRun() {
    const paintLatency =
        Math.floor(this.win.performance.now() - this.scheduledTime_);
    if (paintLatency > 16) {
      this.jankCounter_++;
      if (paintLatency > 100) {
        this.bigJankCounter_++;
      }
      this.jankMeterDisplay_.textContent =
          `${this.jankCounter_}|${this.bigJankCounter_}|${paintLatency}ms`;
      dev().info('JANK', 'Paint latency: ' + paintLatency + 'ms');
    }
    this.scheduledTime_ = -1;
  }
}

export function isJankMeterSupported(win) {
  return isExperimentOn(win, 'jank-meter') && win.performance;
}
