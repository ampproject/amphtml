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

import {Deferred} from './utils/promise';
import {Services} from './services';
import {dev} from './log';
import {getCurve} from './curve';

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
   * @param {!Node} contextNode The context node.
   * @param {!TransitionDef<?>} transition Transition to animate.
   * @param {./time.timeDef} duration Duration in milliseconds.
   * @param {(!./curve.CurveDef|string)=} opt_curve Optional curve to use for
   *   animation. Default is the linear animation.
   * @return {!AnimationPlayer}
   */
  static animate(contextNode, transition, duration, opt_curve) {
    return new Animation(contextNode)
      .setCurve(opt_curve)
      .add(0, transition, 1)
      .start(duration);
  }

  /**
   * @param {!Node} contextNode
   * @param {!./service/vsync-impl.Vsync=} opt_vsync
   */
  constructor(contextNode, opt_vsync) {
    /** @private @const {!Node} */
    this.contextNode_ = contextNode;

    /** @private @const {!./service/vsync-impl.Vsync} */
    this.vsync_ = opt_vsync || Services.vsyncFor(self);

    /** @private {?./curve.CurveDef} */
    this.curve_ = null;

    /**
     * @private @const {!Array<!SegmentDef>}
     */
    this.segments_ = [];
  }

  /**
   * Sets the default curve for the animation. Each segment is allowed to have
   * its own curve, but this curve will be used if a segment doesn't specify
   * its own.
   * @param {!./curve.CurveDef|string|undefined} curve
   * @return {!Animation}
   */
  setCurve(curve) {
    if (curve) {
      this.curve_ = getCurve(curve);
    }
    return this;
  }

  /**
   * Adds a segment to the animation. Each segment starts at offset (delay) and
   * runs for a portion of the overall animation (duration). Note that both
   * delay and duration and normtimeDef types which accept values from 0 to 1.
   * Optionally, the time is pushed through a curve. If curve is not specified,
   * the default animation curve will be used. The specified transition is
   * animated over the specified duration from 0 to 1.
   *
   * @param {./time.normtimeDef} delay
   * @param {!TransitionDef<?>} transition
   * @param {./time.normtimeDef} duration
   * @param {(!./curve.CurveDef|string)=} opt_curve
   * @return {!Animation}
   */
  add(delay, transition, duration, opt_curve) {
    this.segments_.push({
      delay,
      func: transition,
      duration,
      curve: getCurve(opt_curve),
    });
    return this;
  }

  /**
   * Starts the animation and returns the AnimationPlayer object that can be
   * used to monitor and control the animation.
   *
   * @param {./time.timeDef} duration Absolute time in milliseconds.
   * @return {!AnimationPlayer}
   */
  start(duration) {
    const player = new AnimationPlayer(
      this.vsync_,
      this.contextNode_,
      this.segments_,
      this.curve_,
      duration
    );
    return player;
  }
}

/**
 * AnimationPlayer allows tracking and monitoring of the running animation.
 * Most importantly it exposes methods "then" and "thenAlways" that have the
 * semantics of a Promise and signal when the animation completed or failed.
 * Additionally, it exposes the method "halt" which allows to stop/reset the
 * animation.
 * // TODO(@cramforce) Actually fully implement.
 * implements {IThenable}
 */
class AnimationPlayer {
  /**
   * @param {!./service/vsync-impl.Vsync} vsync
   * @param {!Node} contextNode
   * @param {!Array<!SegmentDef>} segments
   * @param {?./curve.CurveDef} defaultCurve
   * @param {./time.timeDef} duration
   */
  constructor(vsync, contextNode, segments, defaultCurve, duration) {
    /** @private @const {!./service/vsync-impl.Vsync} */
    this.vsync_ = vsync;

    /** @private @const {!Node} */
    this.contextNode_ = contextNode;

    /** @private @const {!Array<!SegmentRuntimeDef>} */
    this.segments_ = [];
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      this.segments_.push({
        delay: segment.delay,
        func: segment.func,
        duration: segment.duration,
        curve: segment.curve || defaultCurve,
        started: false,
        completed: false,
      });
    }

    /** @private @const */
    this.duration_ = duration;

    /** @private {./time.timeDef} */
    this.startTime_ = Date.now();

    /** @private {./time.normtimeDef} */
    // this.normLinearTime_ = 0;

    /** @private {./time.normtimeDef} */
    // this.normTime_ = 0;

    /** @private {boolean} */
    this.running_ = true;

    /** @private {!Object<string, *>} */
    this.state_ = {};

    const deferred = new Deferred();

    /** @const @private */
    this.promise_ = deferred.promise;

    /** @const @private */
    this.resolve_ = deferred.resolve;

    /** @const @private */
    this.reject_ = deferred.reject;

    /** @const */
    this.task_ = this.vsync_.createAnimTask(this.contextNode_, {
      mutate: this.stepMutate_.bind(this),
    });

    if (this.vsync_.canAnimate(this.contextNode_)) {
      this.task_(this.state_);
    } else {
      dev().warn(TAG_, 'cannot animate');
      this.complete_(/* success */ false, /* dir */ 0);
    }
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
          return s1.delay + s1.duration - (s2.delay + s2.duration);
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
        dev().error(TAG_, 'completion failed: ' + e, e);
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
   * @param {!Object<string, *>} unusedState
   * @private
   */
  stepMutate_(unusedState) {
    if (!this.running_) {
      return;
    }
    const currentTime = Date.now();
    const normLinearTime = Math.min(
      (currentTime - this.startTime_) / this.duration_,
      1
    );

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
      if (this.vsync_.canAnimate(this.contextNode_)) {
        this.task_(this.state_);
      } else {
        dev().warn(TAG_, 'cancel animation');
        this.complete_(/* success */ false, /* dir */ 0);
      }
    }
  }

  /**
   * @param {!SegmentRuntimeDef} segment
   * @param {number} totalLinearTime
   */
  mutateSegment_(segment, totalLinearTime) {
    let normLinearTime;
    let normTime;
    if (segment.duration > 0) {
      normLinearTime = Math.min(
        (totalLinearTime - segment.delay) / segment.duration,
        1
      );
      normTime = normLinearTime;
      if (segment.curve && normTime != 1) {
        try {
          normTime = segment.curve(normLinearTime);
        } catch (e) {
          dev().error(TAG_, 'step curve failed: ' + e, e);
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
      dev().error(TAG_, 'step mutate failed: ' + e, e);
      this.complete_(/* success */ false, /* dir */ 0);
      return;
    }
  }
}

/**
 * @typedef {{
 *   delay: ./time.normtimeDef,
 *   func: !TransitionDef,
 *   duration: ./time.normtimeDef,
 *   curve: ?./curve.CurveDef
 * }}
 */
let SegmentDef;

/**
 * @typedef {{
 *   delay: ./time.normtimeDef,
 *   func: !TransitionDef,
 *   duration: ./time.normtimeDef,
 *   curve: ?./curve.CurveDef,
 *   started: boolean,
 *   completed: boolean
 * }}
 */
let SegmentRuntimeDef;
