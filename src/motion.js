/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

/** @const {function()} */
const NOOP_CALLBACK_ = function() {};

/** @const {number} */
const MIN_VELOCITY_ = 0.02;

/** @const {number} */
const FRAME_CONST_ = 16.67;

/** @const {number} */
const EXP_FRAME_CONST_ = Math.round(-FRAME_CONST_ / Math.log(0.95));

/**
 * Depreciation factor of 1/100 of a millisecond. This is how much previous
 * velocity is depreciated when calculating the new velocity.
 * @const {number}
 */
const VELOCITY_DEPR_FACTOR_ = FRAME_CONST_ * 2;


/**
 * Calculates velocity for an object traveling the distance deltaV in the
 * time deltaTime given the previous velocity prevVelocity. The calculation
 * assumes a basic informational depreciation of previous velocity.
 * @param {number} deltaV
 * @param {time} deltaTime
 * @param {number} prevVelocity
 * @return {number}
 */
export function calcVelocity(deltaV, deltaTime, prevVelocity) {
  if (deltaTime < 1) {
    deltaTime = 1;
  }

  // Calculate speed and speed depreciation.
  const speed = deltaV / deltaTime;

  // Depreciation is simply an informational quality. It basically means:
  // we can't ignore the velocity we knew recently, but we'd only consider
  // it proportionally to how long ago we've seen it. Currently, this
  // depreciation factor is 1/100 of a millisecond. New average velocity is
  // calculated by weighing toward the new velocity and away from old
  // velocity based on the depreciation.
  const depr = 0.5 + Math.min(deltaTime / VELOCITY_DEPR_FACTOR_, 0.5);
  return speed * depr + prevVelocity * (1 - depr);
}


/**
 * Returns a motion process that will yield when the velocity has run down to
 * zerp. For each iteration, the velocity is depreciated and the coordinates
 * are advanced from start X/Y to the destination according to velocity
 * vectors. For each such iteration the callback is called with the new x and y.
 * @param {!Node} contextNode
 * @param {number} startX Start X coordinate.
 * @param {number} startY Start Y coordinate.
 * @param {number} veloX Starting X velocity.
 * @param {number} veloY Starting Y velocity.
 * @param {function(number, number):boolean} callback The callback for each
 *   step of the deceleration motion.
 * @param {!./service/vsync-impl.Vsync=} opt_vsync Mostly for testing only.
 * @return {!Motion}
 */
export function continueMotion(contextNode, startX, startY, veloX, veloY,
  callback, opt_vsync) {
  return new Motion(contextNode, startX, startY, veloX, veloY,
      callback, opt_vsync).start_();
}


/**
 * Motion process that allows tracking and monitoring of the running motion.
 * Most importantly it exposes methods "then" and "thenAlways" that have the
 * semantics of a Promise and signal when the motion has completed or failed.
 * Additionally, it exposes the method "halt" which allows to stop/reset the
 * motion.
 * @implements {IThenable}
 */
export class Motion {
  /**
   * @param {!Node} contextNode Context node.
   * @param {number} startX Start X coordinate.
   * @param {number} startY Start Y coordinate.
   * @param {number} veloX Starting X velocity.
   * @param {number} veloY Starting Y velocity.
   * @param {function(number, number):boolean} callback The callback for each
   *   step of the deceleration motion.
   * @param {!./service/vsync-impl.Vsync=} opt_vsync
   */
  constructor(contextNode, startX, startY, veloX, veloY, callback, opt_vsync) {
    /** @private @const {!./service/vsync-impl.Vsync} */
    this.vsync_ = opt_vsync || Services.vsyncFor(self);

    /** @private @const {!Node} */
    this.contextNode_ = contextNode;

    /** @private @const */
    this.callback_ = callback;

    /** @private {number} */
    this.lastX_ = startX;

    /** @private {number} */
    this.lastY_ = startY;

    /** @private {number} */
    this.maxVelocityX_ = veloX;

    /** @private {number} */
    this.maxVelocityY_ = veloY;

    /** @private {number} */
    this.velocityX_ = 0;

    /** @private {number} */
    this.velocityY_ = 0;

    /** @private {time} */
    this.startTime_ = Date.now();

    /** @private {time} */
    this.lastTime_ = this.startTime_;

    /** @private {!Function} */
    this.resolve_;

    /** @private {!Function} */
    this.reject_;

    /** @private {!Promise} */
    this.promise_ = new Promise((resolve, reject) => {
      this.resolve_ = resolve;
      this.reject_ = reject;
    });

    /** @private {boolean} */
    this.continuing_ = false;
  }

  /** @private */
  start_() {
    this.continuing_ = true;
    if (Math.abs(this.maxVelocityX_) <= MIN_VELOCITY_ &&
            Math.abs(this.maxVelocityY_) <= MIN_VELOCITY_) {
      this.fireMove_();
      this.completeContinue_(true);
    } else {
      this.runContinuing_();
    }
    return this;
  }

  /**
   * Halts the motion. The motion promise will be rejected since the motion
   * has been interrupted.
   */
  halt() {
    if (this.continuing_) {
      this.completeContinue_(false);
    }
  }

  /**
   * Chains to the motion's promise that will resolve when the motion has
   * completed or will reject if motion has failed or was interrupted.
   * @override
   */
  then(opt_resolve, opt_reject) {
    if (!opt_resolve && !opt_reject) {
      return this.promise_;
    }
    return this.promise_.then(opt_resolve, opt_reject);
  }

  /**
   * Callback for regardless whether the motion succeeds or fails.
   * @param {function()=} opt_callback
   * @return {!Promise}
   */
  thenAlways(opt_callback) {
    const callback = opt_callback || NOOP_CALLBACK_;
    return /** @type {!Promise} */ (this.then(callback, callback));
  }

  /**
   * @return {!Promise}
   * @private
   */
  runContinuing_() {
    this.velocityX_ = this.maxVelocityX_;
    this.velocityY_ = this.maxVelocityY_;
    const boundStep = this.stepContinue_.bind(this);
    const boundComplete = this.completeContinue_.bind(this, true);
    return this.vsync_.runAnimMutateSeries(this.contextNode_, boundStep, 5000)
        .then(boundComplete, boundComplete);
  }

  /**
   * Returns "true" to continue and "false" to stop motion process.
   * @param {time} timeSinceStart
   * @param {time} timeSincePrev
   * @return {boolean}
   * @private
   */
  stepContinue_(timeSinceStart, timeSincePrev) {
    if (!this.continuing_) {
      return false;
    }

    this.lastTime_ = Date.now();
    this.lastX_ += timeSincePrev * this.velocityX_;
    this.lastY_ += timeSincePrev * this.velocityY_;
    if (!this.fireMove_()) {
      return false;
    }

    const decel = Math.exp(-timeSinceStart / EXP_FRAME_CONST_);
    this.velocityX_ = this.maxVelocityX_ * decel;
    this.velocityY_ = this.maxVelocityY_ * decel;
    return (Math.abs(this.velocityX_) > MIN_VELOCITY_ ||
        Math.abs(this.velocityY_) > MIN_VELOCITY_);
  }

  /**
   * @param {boolean} success
   * @private
   */
  completeContinue_(success) {
    if (!this.continuing_) {
      return;
    }
    this.continuing_ = false;
    this.lastTime_ = Date.now();
    this.fireMove_();
    if (success) {
      this.resolve_();
    } else {
      this.reject_();
    }
  }

  /** @private */
  fireMove_() {
    return this.callback_(this.lastX_, this.lastY_);
  }
}
