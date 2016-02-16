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

import {getService} from '../service';
import {timer} from '../timer';
import {viewerFor} from '../viewer';
import {performanceFor} from '../performance';

const collectTime = 5000;

/**
 * Collects framerate data and reports it via the performance service.
 */
export class Framerate {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window}  */
    this.win = win;

    /**
     * Return value of requestAnimationFrame for use with
     * cancelRequestAnimationFrame.
     * @private {number}
     */
    this.requestedFrame_ = null;

    /** @private {number}  */
    this.lastFrameTime_ = 0;

    /** @private {number}  */
    this.collectUntilTime_ = 0;

    /** @private {number}  */
    this.collectStartTime_ = 0;

    /** @private {number}  */
    this.frameCount_ = 0;

    /**
     * Whether we loaded an ad on this page.
     * @private {boolean}
     */
    this.loadedAd_ = false;

    /** @private @const {!Viewer} */
    this.viewer_ = viewerFor(this.win);

    /**
     * We do not make measurements when the window is hidden, because
     * animation frames not not fire in that case.
     * @private {boolean}
     */
    this.isActive_ = this.isActive();

    this.viewer_.onVisibilityChanged(() => {
      this.isActive_ = this.isActive();
      this.reset_();
      if (this.isActive_) {
        this.collect();
      }
    });

    this.collect();
  }

  /**
   * Framerate instrumentation should only be on if viewer is visible
   * and csi is actually on.
   * @return {boolean}
   */
  isActive() {
    return this.viewer_.isPerformanceTrackingOn() && this.viewer_.isVisible();
  }

  /**
   * Call this when something interesting is about to happen on screen.
   * This class will then measure the framerate for the next few seconds.
   * @param {!Element=} opt_element Element for which the current
   *     collection is requested.
   */
  collect(opt_element) {
    if (!this.isActive_ || !this.win.requestAnimationFrame) {
      return;
    }
    const now = timer.now();
    if (this.lastFrameTime_ == 0) {
      this.collectStartTime_ = now;
    }
    if (opt_element && opt_element.tagName == 'AMP-AD') {
      this.loadedAd_ = true;
    }
    this.collectUntilTime_ = now + collectTime;
    this.requestFrame_(now);
  }

  reset_() {
    this.frameCount_ = 0;
    this.lastFrameTime_ = 0;
    if (this.win.cancelAnimationFrame) {
      this.win.cancelAnimationFrame(this.requestedFrame_);
    }
    this.requestedFrame_ = null;
  }

  requestFrame_(now) {
    if (this.requestedFrame_ != null) {
      return;
    }
    if (now > this.collectUntilTime_) {
      // Done.
      const duration = now - this.collectStartTime_;
      const framerate = 1000 / (duration / this.frameCount_);
      const performance = performanceFor(this.win);
      performance.tickDelta('fps', framerate);
      if (this.loadedAd_) {
        performance.tickDelta('fal', framerate);
      }
      performance.flush();
      this.reset_();
      return;
    }
    this.requestedFrame_ = this.win.requestAnimationFrame(() => {
      this.requestedFrame_ = null;
      const lastFrameTime = this.lastFrameTime_;
      const now = this.lastFrameTime_ = timer.now();
      if (lastFrameTime != 0 &&
          // Chrome bug?
          lastFrameTime != now) {
        this.frameCount_++;
      }
      this.requestFrame_(now);
    });
  }

};


/**
 * @param {!Window} win
 * @return {!ActionService}
 */
export function installFramerateService(win) {
  return getService(win, 'framerate', () => {
    return new Framerate(win);
  });
};
