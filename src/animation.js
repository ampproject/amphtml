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

import {getCurve} from './curve';
import {log} from './log';
import {timer} from './timer';
import {vsyncFor} from './vsync';

const TAG_ = 'Animation';

const NOOP_CALLBACK = function() {};


/**
 * The animation class allows construction of arbitrary animation processes.
 * The main method is "add" that adds a segment of animation at particular
 * time offset (delay) and duration. All animation segments are simply functions
 * of type Transition which are iterated from 0 to 1 in animation frames to
 * achieve the desired effect.
 */
export class Animation {

  /**
   * Creates and starts animation with a single segment. Returns AnimationPlayer
   * object that can be used to monitor or control animation.
   *
   * @param {!Transition<?>} transition Transition to animate.
   * @param {time} duration Duration in milliseconds.
   * @param {(!Curve|string)=} opt_curve Optional curve to use for animation.
   *   Default is the linear animation.
   * @return {!AnimationPlayer}
   */
  static animate(transition, duration, opt_curve) {
    return new Animation()
        .setCurve(opt_curve)
        .add(0, transition, 1)
        .start(duration);
  }

  /**
   * @param {!Vsync=} opt_vsync
   */
  constructor(opt_vsync) {
    /** @private @const */
    this.vsync_ = opt_vsync || vsyncFor(window);

    /** @private {?Curve} */
    this.curve_ = null;

    /**
     * @private @const {!Array<!Segment_>}
     */
    this.segments_ = [];
  }

  /**
   * Sets the default curve for the animation. Each segment is allowed to have
   * its own curve, but this curve will be used if a segment doesn't specify
   * its own.
   * @param {!Curve|string} curve
   * @return {!Animation}
   */
  setCurve(curve) {
    this.curve_ = getCurve(curve);
    return this;
  }

  /**
   * Adds a segment to the animation. Each segment starts at offset (delay)
   * and runs for a portion of the overall animation (duration). Note that
   * both delay and duration and normtime types which accept values from 0 to 1.
   * Optionally, the time is pushed through a curve. If curve is not specified,
   * the default animation curve will be used. The specified transition is
   * animated over the specified duration from 0 to 1.
   *
   * @param {normtime} delay
   * @param {!Transition<?>} transition
   * @param {normtime} duration
   * @param {(!Curve|string)=} opt_curve
   * @return {!Animation}
   */
  add(delay, transition, duration, opt_curve) {
    this.segments_.push({delay: delay, func: transition, duration: duration,
        curve: getCurve(opt_curve)});
    return this;
  }

  /**
   * Starts the animation and returns the AnimationPlayer object that can be
   * used to monitor and control the animation.
   *
   * @param {time} duration Absolute time in milliseconds.
   * @return {!AnimationPlayer}
   */
  start(duration) {
    const player = new AnimationPlayer(this.vsync_, this.segments_, this.curve_,
        duration);
    player.start_();
    return player;
  }
}


/**
 * AnimationPlayer allows tracking and monitoring of the running animation.
 * Most importantly it exposes methods "then" and "thenAlways" that have the
 * semantics of a Promise and signal when the animation completed or failed.
 * Additionally, it exposes the method "halt" which allows to stop/reset the
 * animation.
 * @implements {IThenable}
 */
class AnimationPlayer {

  /**
   * @param {!Vsync} vsync
   * @param {!Array<!Segment_>} segments
   * @param {?Curve} defaultCurve
   * @param {time} duration
   */
  constructor(vsync, segments, defaultCurve, duration) {

    /** @private @const {!Array<!SegmentRuntime_>} */
    this.segments_ = [];
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      this.segments_.push({
        delay: segment.delay,
        func: segment.func,
        duration: segment.duration,
        curve: segment.curve || defaultCurve,
        started: false,
        completed: false
      });
    }

    /** @private @const */
    this.duration_ = duration;

    /** @private {time} */
    this.startTime_ = 0;

    /** @private {normtime} */
    this.normLinearTime_ = 0;

    /** @private {normtime} */
    this.normTime_ = 0;

    /** @private {boolean} */
    this.running_ = false;

    /** @private {!Object<string, *>} */
    this.state_ = {};

    /** @const {function()} */
    this.resolve_;

    /** @const {function()} */
    this.reject_;

    /** @private {!Promise} */
    this.promise_ = new Promise((resolve, reject) => {
      this.resolve_ = resolve;
      this.reject_ = reject;
    });

    /** @const */
    this.task_ = vsync.createTask({
      mutate: this.stepMutate_.bind(this)
    });

    // TODO(dvoytenko): slow requestAnimationFrame buster, e.g. when Tab becomes
    // inactive.
  }

  /**
   * Chains to the animation's promise that will resolve when the animation has
   * completed or will reject if animation has failed or was interrupted.
   * @param {!Function=} opt_resolve
   * @param {!Function=} opt_reject
   * @return {!Promise}
   */
  then(opt_resolve, opt_reject) {
    if (!opt_resolve && !opt_reject) {
      return this.promise_;
    }
    return this.promise_.then(opt_resolve, opt_reject);
  }

  /**
   * Callback for regardless whether the animation succeeds or fails.
   * @param {!Function=} opt_callback
   * @return {!Promise}
   */
  thenAlways(opt_callback) {
    const callback = opt_callback || NOOP_CALLBACK;
    return this.then(callback, callback);
  }

  /**
   * Halts the animation. Depending on the opt_dir value, the following actions
   * can be performed:
   * 0: No action. The state will be as at the moment of halting (default)
   * 1: Final state. Transitionable will be set to state = 1.
   * -1: Reset state. Transitionable will be reset to state = 0.
   * The animation's promise will be rejected since the transition has been
   * interrupted.
   * @param {number=} opt_dir
   */
  halt(opt_dir) {
    this.complete_(/* success */ false, /* dir */ opt_dir || 0);
  }

  /**
   * @private
   */
  start_() {
    this.startTime_ = timer.now();
    this.running_ = true;
    this.task_(this.state_);
  }

  /**
   * @param {boolean} success
   * @param {number} dir
   * @private
   */
  complete_(success, dir) {
    if (!this.running_) {
      return;
    }
    this.running_ = false;
    if (dir != 0) {
      // Sort in the completion order.
      if (this.segments_.length > 1) {
        this.segments_.sort((s1, s2) => {
          return (s1.delay + s1.duration) - (s2.delay + s2.duration);
        });
      }
      try {
        if (dir > 0) {
          // Natural order - all set to 1.
          for (let i = 0; i < this.segments_.length; i++) {
            this.segments_[i].func(1, true);
          }
        } else {
          // Reverse order - all set to 0.
          for (let i = this.segments_.length - 1; i >= 0; i--) {
            this.segments_[i].func(0, false);
          }
        }
      } catch (e) {
        log.error(TAG_, 'completion failed: ' + e, e);
        success = false;
      }
    }
    if (success) {
      this.resolve_();
    } else {
      this.reject_();
    }
  }

  /**
   * @param {!Object<string, *>} state
   * @private
   */
  stepMutate_(state) {
    if (!this.running_) {
      return;
    }
    const currentTime = timer.now();
    const normLinearTime = Math.min((currentTime - this.startTime_) /
        this.duration_, 1);

    // Start segments due to be started
    for (let i = 0; i < this.segments_.length; i++) {
      const segment = this.segments_[i];
      if (!segment.started && normLinearTime >= segment.delay) {
        segment.started = true;
      }
    }

    // Execute all pending segments.
    for (let i = 0; i < this.segments_.length; i++) {
      const segment = this.segments_[i];
      if (!segment.started || segment.completed) {
        continue;
      }
      this.mutateSegment_(segment, normLinearTime);
    }

    // Complete or start next cycle.
    if (normLinearTime == 1) {
      this.complete_(/* success */ true, /* dir */ 0);
    } else {
      this.task_(this.state_);
    }
  }

  /**
   * @param {!SegmentRuntime_} segment
   * @param {number} totalLinearTime
   */
  mutateSegment_(segment, totalLinearTime) {
    let normLinearTime;
    let normTime;
    if (segment.duration > 0) {
      normLinearTime = Math.min((totalLinearTime - segment.delay) /
          segment.duration, 1);
      normTime = normLinearTime;
      if (segment.curve && normTime != 1) {
        try {
          normTime = segment.curve(normLinearTime);
        } catch (e) {
          log.error(TAG_, 'step curve failed: ' + e, e);
          this.complete_(/* success */ false, /* dir */ 0);
          return;
        }
      }
    } else {
      normLinearTime = 1;
      normTime = 1;
    }
    if (normLinearTime == 1) {
      segment.completed = true;
    }
    try {
      segment.func(normTime, segment.completed);
    } catch (e) {
      log.error(TAG_, 'step mutate failed: ' + e, e);
      this.complete_(/* success */ false, /* dir */ 0);
      return;
    }
  }
}


/**
 * @typedef {{
 *   delay: normtime,
 *   func: !Transition,
 *   duration: normtime,
 *   curve: ?Curve
 * }}
 */
class Segment_ {}


/**
 * @typedef {{
 *   delay: normtime,
 *   func: !Transition,
 *   duration: normtime,
 *   curve: ?Curve,
 *   started: boolean,
 *   completed: boolean
 * }}
 */
class SegmentRuntime_ {}
