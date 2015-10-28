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

import {Observable} from './observable';
import {assert} from './asserts';
import {timer} from './timer';
import {vsync} from './vsync';
import * as tr from './transition';

// TODO(dvoytenko): when gesturing, there should be at least one event every
// 0.5 seconds since listeners may want to know when gesture is standing still.

/**
 * @typedef {{}}
 */
var SwipeStartEvent;

/**
 * A gesture move event includes the following fields:
 * - delta: The number of pixels traveled in either direction from the starting
 *   point.
 * - velocity: The velocity of motion in pixels per millisecond.
 * - position: A convenience field that translated delta into a client coord
 *   system. This value is calculated as
 *      "delta * positionMultipler + postionOffset"
 * - synthetic: Whether the event is the result of an underlying touch event or
 *   synthesized by the controller.
 * - continued: Whether the event is the result of a continued motion after
 *   user has completed the gesture itself.
 *
 * @typedef {{
 *   delta: number,
 *   velocity: number,
 *   position: number,
 *   startPosition: number,
 *   synthetic: boolean,
 *   continued: boolean
 * }}
 */
var SwipeMoveEvent;

/**
 * @typedef {{
 *   delta: number,
 *   velocity: number,
 *   position: number,
 *   startPosition: number
 * }}
 */
var SwipeEndEvent;

/** @const {number} */
var MIN_VELOCITY_ = 0.02;

/** @const {number} */
var FRAME_CONST_ = Math.round(-16.67 / Math.log(0.95) / 2);

/**
 * A gesture recognizer for swipes in horizontal plane.
 * @deprecated  Deprecated in preference to motion.js and gestures.js.
 */
export class SwipeXRecognizer {

  /**
   * @param {!Element} element
   * @param {!Vsync=} opt_vsync
   */
  constructor(element, opt_vsync) {
    /** @private @const */
    this.vsync_ = opt_vsync || vsync;

    /** @private @const */
    this.element_ = element;

    /** @private {boolean} */
    this.tracking_ = false;

    /** @private {boolean} */
    this.eventing_ = false;

    /** @private {boolean} */
    this.continuing_ = false;

    /** @private {number} */
    this.startX_ = 0;

    /** @private {number} */
    this.startY_ = 0;

    /** @private {time} */
    this.startTime_ = 0;

    /** @private {number} */
    this.lastX_ = 0;

    /** @private {time} */
    this.lastTime_ = 0;

    /** @private {number} */
    this.velocity_ = 0;

    /** @private {number} */
    this.positionOffset_ = 0;

    /** @private {number} */
    this.positionMultiplier_ = 1;

    /** @private {number} */
    this.minDelta_ = -Infinity;

    /** @private {number} */
    this.maxDelta_ = Infinity;

    /** @private {number} */
    this.overshoot_ = 0;

    /** @private {boolean} */
    this.continueMotion_ = false;

    /** @private {number} */
    this.snapPoint_ = 0;

    /** @private {boolean} */
    this.stopOnTouch_ = false;

    /** @private @const {!Observable<!SwipeStartEvent>} */
    this.startObservable_ = new Observable();

    /** @private @const {!Observable<!SwipeMoveEvent>} */
    this.moveObservable_ = new Observable();

    /** @private @const {!Observable<!SwipeEndEvent>} */
    this.endObservable_ = new Observable();

    this.element_.addEventListener('touchstart', this.touchStart_.bind(this));
    this.element_.addEventListener('touchmove', this.touchMove_.bind(this));
    this.element_.addEventListener('touchend', this.touchEnd_.bind(this));
    this.element_.addEventListener('touchcancel', this.touchCancel_.bind(this));
  }

  /**
   * @param {function(!SwipeStartEvent)} handler
   * @return {!Unlisten}
   */
  onStart(handler) {
    return this.startObservable_.add(handler);
  }

  /**
   * @param {function(!SwipeMoveEvent)} handler
   * @return {!Unlisten}
   */
  onMove(handler) {
    return this.moveObservable_.add(handler);
  }

  /**
   * @param {function(!SwipeEndEvent)} handler
   * @return {!Unlisten}
   */
  onEnd(handler) {
    return this.endObservable_.add(handler);
  }

  /**
   * Sets the offset for the calculated position field in gesture events.
   * See "position" field in the SwipeMoveEvent structure for the
   * explanation.
   * @param {number} offset
   */
  setPositionOffset(offset) {
    this.positionOffset_ = offset;
  }

  /**
   * Sets the multiplier for the calculated position field in gesture events.
   * See "position" field in the SwipeMoveEvent structure for the
   * explanation. This value cannot be 0.
   * @param {number} positionMultiplier
   */
  setPositionMultiplier(positionMultiplier) {
    assert(positionMultiplier);
    this.positionMultiplier_ = positionMultiplier;
  }

  /**
   * Sets bounds of how far can gesture travel in either direction in terms of
   * delta field.
   * @param {number} minDelta Minimum delta.
   * @param {number} maxDelta Maximum delta.
   * @param {number} overshoot The number of pixels the delta is allowed to move
   *   outside of min/maxDelta range.
   */
  setBounds(minDelta, maxDelta, overshoot) {
    this.minDelta_ = minDelta;
    this.maxDelta_ = maxDelta;
    this.overshoot_ = overshoot;
  }

  /**
   * Whether the system should complete motion when the gesture itself is
   * complete. By default the motion will stop immediately as soon as touchend
   * event will arrive. However, this method allows the swipe controller to
   * synthesize motion events that emulate rundown of velocity of the original
   * motion.
   * @param {number} snapPoint If the motion has not traveled this far the
   *   motion will return to the original position or otherwise it will
   *   continue until it reaches min/max delta.
   * @param {boolean} stopOnTouch Whether a touchstart event stops continued
   *   motion.
   */
  continueMotion(snapPoint, stopOnTouch) {
    this.continueMotion_ = true;
    this.snapPoint_ = snapPoint;
    this.stopOnTouch_ = stopOnTouch;
  }

  /**
   * @param {!Event} e
   * @private
   */
  touchStart_(e) {
    this.tracking_ = false;
    if (this.continuing_ && !this.stopOnTouch_) {
      return;
    }
    if (this.eventing_) {
      this.velocity_ = 0;
      this.end_(/* allowContinuing */ false);
    }
    let touches = e.changedTouches || e.touches;
    if (touches && touches.length == 1) {
      this.tracking_ = true;
      this.startX_ = touches[0].clientX;
      this.startY_ = touches[0].clientY;
    }
  }

  /**
   * @param {!Event} e
   * @private
   */
  touchMove_(e) {
    if (!this.tracking_) {
      return;
    }
    let touches = e.changedTouches || e.touches;
    if (touches && touches.length > 0) {
      let x = touches[0].clientX;
      let y = touches[0].clientY;
      if (this.eventing_) {
        this.move_(x);
      } else {
        if (Math.abs(y - this.startY_) >= 8) {
          this.end_(/* allowContinuing */ false);
        } else if (Math.abs(x - this.startX_) >= 8) {
          this.start_(x);
        }
      }
    }
  }

  /**
   * @param {!Event} e
   * @private
   */
  touchEnd_(e) {
    if (!this.tracking_) {
      return;
    }
    let touches = e.changedTouches || e.touches;
    if (this.eventing_ && touches && touches.length > 0) {
      if (this.lastX != touches[0].clientX) {
        this.move_(touches[0].clientX);
      }
    }
    this.end_(/* allowContinuing */ true);
  }

  /**
   * @param {!Event} e
   * @private
   */
  touchCancel_(e) {
    if (!this.tracking_) {
      return;
    }
    this.end_(/* allowContinuing */ false);
  }

  /**
   * @param {number} x
   * @private
   */
  start_(x) {
    this.eventing_ = true;
    this.startX_ = x;
    this.startTime_ = timer.now();
    this.lastX_ = x;
    this.velocity_ = 0;
    this.startObservable_.fire({});
  }

  /**
   * @param {number} x
   * @private
   */
  move_(x) {
    let prevX = this.lastX_;
    let prevTime = this.lastTime_;
    this.lastX_ = x;
    this.lastTime_ = timer.now();
    if (this.lastTime_ - prevTime > 2) {
      this.velocity_ = this.calcVelocity_(
          prevX, this.lastX_, prevTime, this.lastTime_, this.velocity_);
    }
    this.fireMove_(/* synthetic */ false, /* continued */ false);
  }

  /**
   * @param {boolean} synthetic
   * @param {boolean} continued
   * @private
   */
  fireMove_(synthetic, continued) {
    let delta = this.calcDelta_(this.startX_, this.lastX_);
    this.moveObservable_.fire({
      delta: delta,
      velocity: this.velocity_,
      position: this.positionOffset_ + delta * this.positionMultiplier_,
      startPosition: this.positionOffset_,
      synthetic: synthetic,
      continued: continued
    });
  }

  /**
   * @param {boolean} allowContinuing
   * @private
   */
  end_(allowContinuing) {
    this.tracking_ = false;
    if (this.continuing_) {
      this.endFinal_();
    }
    if (!this.eventing_) {
      return;
    }
    let endTime = timer.now();
    if (endTime - this.lastTime_ > 2) {
      this.velocity_ = this.calcVelocity_(
          this.lastX_, this.lastX_, this.lastTime_, endTime, this.velocity_);
    }

    if (allowContinuing && this.continueMotion_) {
      this.startContinuing_();
    } else {
      this.endFinal_();
    }
  }

  /** @private */
  endFinal_() {
    this.continuing_ = false;
    this.eventing_ = false;
    let delta = this.calcDelta_(this.startX_, this.lastX_);
    this.endObservable_.fire({
      delta: delta,
      velocity: this.velocity_,
      position: this.positionOffset_ + delta * this.positionMultiplier_,
      startPosition: this.positionOffset_
    });
  }

  /**
   * @return {!Promise}
   * @private
   */
  startContinuing_() {
    this.continuing_ = true;

    let delta = this.calcDelta_(this.startX_, this.lastX_);

    // 1. The user overpulls - spring back
    if (delta > this.maxDelta_ || delta < this.minDelta_) {
      let retDelta = delta > this.maxDelta_ ? this.maxDelta_ - delta
                                            : this.minDelta_ - delta;
      // Reverse the velocity.
      let maxVelocity =
          Math.sign(retDelta) * Math.max(Math.abs(this.velocity_) * 0.8, 0.25);
      this.lastX_ = this.startX_ + delta;
      let endX = this.lastX_ + retDelta;
      let overshoot = Math.abs(retDelta) * maxVelocity;
      let spring = tr.spring(this.lastX_, endX, endX + overshoot, 0.8);
      return this.runContinuing_(maxVelocity, false, (velocity) => {
        let vnorm = 1 - Math.abs(velocity / maxVelocity);
        return spring(vnorm);
      });
    }

    // 2. Pull to one of the boundaries
    if (this.snapPoint_) {
      let snapPoint = Math.abs(this.snapPoint_ / this.positionMultiplier_);
      let newDelta = 0;
      if (delta < 0 && Math.abs(delta) > snapPoint || this.velocity_ < -0.1) {
        newDelta = this.minDelta_;
      } else if (delta > 0 && Math.abs(delta) > snapPoint ||
                 this.velocity_ > 0.1) {
        newDelta = this.maxDelta_;
      } else if (delta != 0) {
        newDelta = 0;
      }
      if (newDelta != delta) {
        // Reverse the velocity.
        let maxVelocity = Math.sign(newDelta - delta) *
                          Math.max(Math.abs(this.velocity_) * 0.95, 0.5);
        this.lastX_ = this.startX_ + delta;
        let endX = this.startX_ + newDelta;
        let func = tr.numeric(this.lastX_, endX);
        return this.runContinuing_(maxVelocity, false, (velocity) => {
          let vnorm = 1 - Math.abs(velocity / maxVelocity);
          return func(vnorm);
        });
      }
    }

    // Intertia.
    if (Math.abs(this.velocity_) > MIN_VELOCITY_) {
      let maxVelocity = this.velocity_ * 0.95; // First exponential order
      return this.runContinuing_(
          maxVelocity, true, (velocity, timeSinceStart, timeSincePrev) => {
            return this.lastX_ + timeSincePrev * velocity;
          });
    }

    this.endFinal_();
    return Promise.resolve();
  }

  /**
   * @param {number} maxVelocity
   * @param {boolean} repeatContinue
   * @param {function(number, time, time)} velocityFunc A callback with the
   *   following arguments: velocity, timeSinceStart and timeSincePrev.
   * @return {!Promise}
   * @private
   */
  runContinuing_(maxVelocity, repeatContinue, velocityFunc) {
    if (Math.abs(maxVelocity) <= MIN_VELOCITY_) {
      velocityFunc(0);
      this.endFinal_();
      return Promise.resolve();
    }

    this.velocity_ = maxVelocity;
    let completeContinue = () => {
      this.lastTime_ = timer.now();
      this.lastX_ = velocityFunc(0, 0, 0);
      this.fireMove_(/* synthetic */ true, /* continued */ true);
      if (repeatContinue) {
        return this.startContinuing_();
      }
      this.endFinal_();
    };

    return this.vsync_.runMutateSeries((timeSinceStart, timeSincePrev) => {
                        if (!this.continuing_) {
                          return false;
                        }
                        this.lastTime_ = timer.now();
                        this.lastX_ = velocityFunc(
                            this.velocity_, timeSinceStart, timeSincePrev);
                        this.fireMove_(
                            /* synthetic */ true, /* continued */ true);
                        let prevVelocity = this.velocity_;
                        this.velocity_ =
                            maxVelocity *
                            Math.exp(-timeSinceStart / FRAME_CONST_);
                        return Math.abs(this.velocity_) > MIN_VELOCITY_;
                      }, 5000).then(completeContinue, completeContinue);
  }

  /**
   * @param {number} x
   * @return {number}
   * @private
   */
  calcDelta_(start, end) {
    return Math.min(Math.max(end - start, this.minDelta_ - this.overshoot_),
        this.maxDelta_ + this.overshoot_);
  }

  /**
   * @param {number} prevX
   * @param {number} newX
   * @param {time} prevTime
   * @param {time} newTime
   * @return {number}
   * @private
   */
  calcVelocity_(prevX, newX, prevTime, newTime, prevVelocity) {
    let dx = newX - prevX;
    let dt = newTime - prevTime;
    if (Math.abs(dt) < 2) {
      return 0;
    }

    // Calculate speed and speed depreciation.
    let speed = dx / dt;

    // Depreciation is simply an informational quality. It basically means:
    // we can't ignore the velocity we knew recently, but we'd only consider
    // it proportionally to how long ago we've seen it. Currently, this
    // depreciation factor is 1/100 of a millisecond. New average velocity is
    // calculated by weighing toward the new velocity and away from old
    // velocity based on the depreciation.
    let deprFactor = 100;
    let depr = 0.5 + Math.min(dt / deprFactor, 0.5);
    return speed * depr + prevVelocity * (1 - depr);
  }
}
