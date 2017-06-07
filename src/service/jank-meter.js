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
import {dev, user} from '../log';

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
    this.badFrameCnt_ = 0;
    /** @private {number} */
    this.totalFrameCnt_ = 0;
    /** @private {number} */
    this.longTaskChild_ = 0;
    /** @private {number} */
    this.longTaskSelf_ = 0;
    /** @private {?number} */
    this.scheduledTime_ = null;
    /** @private {?./performance-impl.Performance} */
    this.perf_ = performanceForOrNull(win);

    /** @private {?BatteryManager} */
    this.batteryManager_ = null;
    /** @private {?number} */
    this.batteryLevelStart_ = null;
    this.initializeBatteryManager_();

    /** @private {?PerformanceObserver} */
    this.longTaskObserver_ = null;
    this.initializeLongTaskObserver_();
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
    this.totalFrameCnt_++;
    if (paintLatency > 16) {
      this.badFrameCnt_++;
      dev().info('JANK', 'Paint latency: ' + paintLatency + 'ms');
    }

    // Report metrics on Nth frame, so we have sort of normalized numbers.
    if (this.perf_ && this.totalFrameCnt_ == NTH_FRAME) {
      // gfp: Good Frame Probability
      const gfp = this.calculateGfp_();
      this.perf_.tickDelta('gfp', gfp);
      // bf: Bad Frames
      this.perf_.tickDelta('bf', this.badFrameCnt_);
      if (this.longTaskObserver_) {
        // lts: Long Tasks of Self frame
        this.perf_.tickDelta('lts', this.longTaskSelf_);
        // ltc: Long Tasks of Child frames
        this.perf_.tickDelta('ltc', this.longTaskChild_);
        this.longTaskObserver_.disconnect();
        this.longTaskObserver_ = null;
      }
      let batteryDrop = 0;
      if (this.batteryManager_ && (this.batteryLevelStart_ != null)) {
        batteryDrop = this.win_.Math.max(0, this.win_.Math.floor(
            this.batteryManager_.level * 100 - this.batteryLevelStart_));
        // bd: Battery Drop
        this.perf_.tickDelta('bd', batteryDrop);
      }
      this.perf_.flush();
      if (isJankMeterEnabled(this.win_)) {
        this.displayMeterDisplay_(batteryDrop);
      }
    }
  }

  isEnabled_() {
    return isJankMeterEnabled(this.win_)
        || (this.perf_
            && this.perf_.isPerformanceTrackingOn()
            && this.totalFrameCnt_ < NTH_FRAME);
  }

  /**
   * @param {number} batteryDrop
   * @private
   */
  displayMeterDisplay_(batteryDrop) {
    const display = this.win_.document.createElement('div');
    display.classList.add('i-amphtml-jank-meter');
    display.textContent =
        `bf:${this.badFrameCnt_}, lts: ${this.longTaskSelf_}, ` +
        `ltc:${this.longTaskChild_}, bd:${batteryDrop}`;
    this.win_.document.body.appendChild(display);
  }

  /**
   * Calculate Good Frame Probability, which is a value range from 0 to 100.
   * @returns {number}
   * @private
   */
  calculateGfp_() {
    return this.win_.Math.floor(
        (this.totalFrameCnt_ - this.badFrameCnt_) / this.totalFrameCnt_ * 100);
  }

  initializeLongTaskObserver_() {
    if (!this.isEnabled_() || !isLongTaskApiSupported(this.win_)) {
      return;
    }
    this.longTaskObserver_ = new this.win_.PerformanceObserver(entryList => {
      const entries = entryList.getEntries();
      for (let i = 0; i < entries.length; i++) {
        if (entries[i].entryType == 'longtask') {
          // longtask is any task with duration of bigger than 50ms
          // we sum up the number of 50ms a task spans.
          const span = this.win_.Math.floor(entries[i].duration / 50);
          if (entries[i].name == 'cross-origin-descendant') {
            this.longTaskChild_ += span;
            user().info(
                'LONGTASK', `from child frame ${entries[i].duration}ms`);
          } else {
            this.longTaskSelf_ += span;
            dev().info('LONGTASK', `from self frame ${entries[i].duration}ms`);
          }
        }
      }
    });
    this.longTaskObserver_.observe({entryTypes: ['longtask']});
  }

  initializeBatteryManager_() {
    if (isBatteryApiSupported(this.win_)) {
      this.win_.navigator.getBattery().then(battery => {
        this.batteryManager_ = battery;
        this.batteryLevelStart_ = battery.level * 100;
      });
    }
  }
}

/**
 * @param {!Window} win
 * @returns {boolean}
 */
function isJankMeterEnabled(win) {
  return isExperimentOn(win, 'jank-meter');
}

/**
 * @param {!Window} win
 * @returns {boolean}
 */
function isLongTaskApiSupported(win) {
  return !!win.PerformanceObserver
      && !!win.TaskAttributionTiming
      && ('containerName' in win.TaskAttributionTiming.prototype);
}

/**
 * @param {!Window} win
 * @returns {boolean}
 */
function isBatteryApiSupported(win) {
  // TODO: (@lannka, #9749)
  return false;
  return typeof win.navigator.getBattery === 'function';
}
