function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { NormTimeDef, getCurve } from "./core/data-structures/curve";
import { Deferred } from "./core/data-structures/promise";
import { TimestampDef } from "./core/types/date";
import { dev } from "./log";
import { Services } from "./service";
var TAG_ = 'Animation';

var NOOP_CALLBACK = function NOOP_CALLBACK() {};

/**
 * The animation class allows construction of arbitrary animation processes.
 * The main method is "add" that adds a segment of animation at particular
 * time offset (delay) and duration. All animation segments are simply functions
 * of type Transition which are iterated from 0 to 1 in animation frames to
 * achieve the desired effect.
 */
export var Animation = /*#__PURE__*/function () {
  /**
   * @param {!Node} contextNode
   * @param {!./service/vsync-impl.Vsync=} opt_vsync
   */
  function Animation(contextNode, opt_vsync) {
    _classCallCheck(this, Animation);

    /** @private @const {!Node} */
    this.contextNode_ = contextNode;

    /** @private @const {!./service/vsync-impl.Vsync} */
    this.vsync_ = opt_vsync || Services.vsyncFor(self);

    /** @private {?./core/data-structures/curve.CurveDef} */
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
   * @param {!./core/data-structures/curve.CurveDef|string|undefined} curve
   * @return {!Animation}
   */
  _createClass(Animation, [{
    key: "setCurve",
    value: function setCurve(curve) {
      if (curve) {
        this.curve_ = getCurve(curve);
      }

      return this;
    }
    /**
     * Adds a segment to the animation. Each segment starts at offset (delay) and
     * runs for a portion of the overall animation (duration). Note that both
     * delay and duration and NormTimeDef types which accept values from 0 to 1.
     * Optionally, the time is pushed through a curve. If curve is not specified,
     * the default animation curve will be used. The specified transition is
     * animated over the specified duration from 0 to 1.
     *
     * @param {!NormTimeDef} delay
     * @param {!TransitionDef<?>} transition
     * @param {!NormTimeDef} duration
     * @param {(!./core/data-structures/curve.CurveDef|string)=} opt_curve
     * @return {!Animation}
     */

  }, {
    key: "add",
    value: function add(delay, transition, duration, opt_curve) {
      this.segments_.push({
        delay: delay,
        func: transition,
        duration: duration,
        curve: getCurve(opt_curve)
      });
      return this;
    }
    /**
     * Starts the animation and returns the AnimationPlayer object that can be
     * used to monitor and control the animation.
     *
     * @param {!TimestampDef} duration Absolute time in milliseconds.
     * @return {!AnimationPlayer}
     */

  }, {
    key: "start",
    value: function start(duration) {
      var player = new AnimationPlayer(this.vsync_, this.contextNode_, this.segments_, this.curve_, duration);
      return player;
    }
  }], [{
    key: "animate",
    value:
    /**
     * Creates and starts animation with a single segment. Returns AnimationPlayer
     * object that can be used to monitor or control animation.
     *
     * @param {!Node} contextNode The context node.
     * @param {!TransitionDef<?>} transition Transition to animate.
     * @param {TimestampDef} duration Duration in milliseconds.
     * @param {(!./core/data-structures/curve.CurveDef|string)=} opt_curve Optional curve to use for
     *   animation. Default is the linear animation.
     * @return {!AnimationPlayer}
     */
    function animate(contextNode, transition, duration, opt_curve) {
      return new Animation(contextNode).setCurve(opt_curve).add(0, transition, 1).start(duration);
    }
  }]);

  return Animation;
}();

/**
 * AnimationPlayer allows tracking and monitoring of the running animation.
 * Most importantly it exposes methods "then" and "thenAlways" that have the
 * semantics of a Promise and signal when the animation completed or failed.
 * Additionally, it exposes the method "halt" which allows to stop/reset the
 * animation.
 * // TODO(@cramforce) Actually fully implement.
 * implements {IThenable}
 */
var AnimationPlayer = /*#__PURE__*/function () {
  /**
   * @param {!./service/vsync-impl.Vsync} vsync
   * @param {!Node} contextNode
   * @param {!Array<!SegmentDef>} segments
   * @param {?./core/data-structures/curve.CurveDef} defaultCurve
   * @param {!TimestampDef} duration
   */
  function AnimationPlayer(vsync, contextNode, segments, defaultCurve, duration) {
    _classCallCheck(this, AnimationPlayer);

    /** @private @const {!./service/vsync-impl.Vsync} */
    this.vsync_ = vsync;

    /** @private @const {!Node} */
    this.contextNode_ = contextNode;

    /** @private @const {!Array<!SegmentRuntimeDef>} */
    this.segments_ = [];

    for (var i = 0; i < segments.length; i++) {
      var segment = segments[i];
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

    /** @private {!TimestampDef} */
    this.startTime_ = Date.now();

    /** @private {!NormTimeDef} */
    // this.normLinearTime_ = 0;

    /** @private {!NormTimeDef} */
    // this.normTime_ = 0;

    /** @private {boolean} */
    this.running_ = true;

    /** @private {!Object<string, *>} */
    this.state_ = {};
    var deferred = new Deferred();

    /** @const @private */
    this.promise_ = deferred.promise;

    /** @const @private */
    this.resolve_ = deferred.resolve;

    /** @const @private */
    this.reject_ = deferred.reject;

    /** @const */
    this.task_ = this.vsync_.createAnimTask(this.contextNode_, {
      mutate: this.stepMutate_.bind(this)
    });

    if (this.vsync_.canAnimate(this.contextNode_)) {
      this.task_(this.state_);
    } else {
      dev().warn(TAG_, 'cannot animate');
      this.complete_(
      /* success */
      false,
      /* dir */
      0);
    }
  }

  /**
   * Chains to the animation's promise that will resolve when the animation has
   * completed or will reject if animation has failed or was interrupted.
   * @param {!Function=} opt_resolve
   * @param {!Function=} opt_reject
   * @return {!Promise}
   */
  _createClass(AnimationPlayer, [{
    key: "then",
    value: function then(opt_resolve, opt_reject) {
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

  }, {
    key: "thenAlways",
    value: function thenAlways(opt_callback) {
      var callback = opt_callback || NOOP_CALLBACK;
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

  }, {
    key: "halt",
    value: function halt(opt_dir) {
      this.complete_(
      /* success */
      false,
      /* dir */
      opt_dir || 0);
    }
    /**
     * @param {boolean} success
     * @param {number} dir
     * @private
     */

  }, {
    key: "complete_",
    value: function complete_(success, dir) {
      if (!this.running_) {
        return;
      }

      this.running_ = false;

      if (dir != 0) {
        // Sort in the completion order.
        if (this.segments_.length > 1) {
          this.segments_.sort(function (s1, s2) {
            return s1.delay + s1.duration - (s2.delay + s2.duration);
          });
        }

        try {
          if (dir > 0) {
            // Natural order - all set to 1.
            for (var i = 0; i < this.segments_.length; i++) {
              this.segments_[i].func(1, true);
            }
          } else {
            // Reverse order - all set to 0.
            for (var _i = this.segments_.length - 1; _i >= 0; _i--) {
              this.segments_[_i].func(0, false);
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

  }, {
    key: "stepMutate_",
    value: function stepMutate_(unusedState) {
      if (!this.running_) {
        return;
      }

      var currentTime = Date.now();
      var normLinearTime = Math.min((currentTime - this.startTime_) / this.duration_, 1);

      // Start segments due to be started
      for (var i = 0; i < this.segments_.length; i++) {
        var segment = this.segments_[i];

        if (!segment.started && normLinearTime >= segment.delay) {
          segment.started = true;
        }
      }

      // Execute all pending segments.
      for (var _i2 = 0; _i2 < this.segments_.length; _i2++) {
        var _segment = this.segments_[_i2];

        if (!_segment.started || _segment.completed) {
          continue;
        }

        this.mutateSegment_(_segment, normLinearTime);
      }

      // Complete or start next cycle.
      if (normLinearTime == 1) {
        this.complete_(
        /* success */
        true,
        /* dir */
        0);
      } else {
        if (this.vsync_.canAnimate(this.contextNode_)) {
          this.task_(this.state_);
        } else {
          dev().warn(TAG_, 'cancel animation');
          this.complete_(
          /* success */
          false,
          /* dir */
          0);
        }
      }
    }
    /**
     * @param {!SegmentRuntimeDef} segment
     * @param {number} totalLinearTime
     */

  }, {
    key: "mutateSegment_",
    value: function mutateSegment_(segment, totalLinearTime) {
      var normLinearTime;
      var normTime;

      if (segment.duration > 0) {
        normLinearTime = Math.min((totalLinearTime - segment.delay) / segment.duration, 1);
        normTime = normLinearTime;

        if (segment.curve && normTime != 1) {
          try {
            normTime = segment.curve(normLinearTime);
          } catch (e) {
            dev().error(TAG_, 'step curve failed: ' + e, e);
            this.complete_(
            /* success */
            false,
            /* dir */
            0);
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
        this.complete_(
        /* success */
        false,
        /* dir */
        0);
        return;
      }
    }
  }]);

  return AnimationPlayer;
}();

/**
 * @typedef {{
 *   delay: NormTimeDef,
 *   func: !TransitionDef,
 *   duration: NormTimeDef,
 *   curve: ?./core/data-structures/curve.CurveDef
 * }}
 */
var SegmentDef;

/**
 * @typedef {{
 *   delay: NormTimeDef,
 *   func: !TransitionDef,
 *   duration: NormTimeDef,
 *   curve: ?./core/data-structures/curve.CurveDef,
 *   started: boolean,
 *   completed: boolean
 * }}
 */
var SegmentRuntimeDef;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFuaW1hdGlvbi5qcyJdLCJuYW1lcyI6WyJOb3JtVGltZURlZiIsImdldEN1cnZlIiwiRGVmZXJyZWQiLCJUaW1lc3RhbXBEZWYiLCJkZXYiLCJTZXJ2aWNlcyIsIlRBR18iLCJOT09QX0NBTExCQUNLIiwiQW5pbWF0aW9uIiwiY29udGV4dE5vZGUiLCJvcHRfdnN5bmMiLCJjb250ZXh0Tm9kZV8iLCJ2c3luY18iLCJ2c3luY0ZvciIsInNlbGYiLCJjdXJ2ZV8iLCJzZWdtZW50c18iLCJjdXJ2ZSIsImRlbGF5IiwidHJhbnNpdGlvbiIsImR1cmF0aW9uIiwib3B0X2N1cnZlIiwicHVzaCIsImZ1bmMiLCJwbGF5ZXIiLCJBbmltYXRpb25QbGF5ZXIiLCJzZXRDdXJ2ZSIsImFkZCIsInN0YXJ0IiwidnN5bmMiLCJzZWdtZW50cyIsImRlZmF1bHRDdXJ2ZSIsImkiLCJsZW5ndGgiLCJzZWdtZW50Iiwic3RhcnRlZCIsImNvbXBsZXRlZCIsImR1cmF0aW9uXyIsInN0YXJ0VGltZV8iLCJEYXRlIiwibm93IiwicnVubmluZ18iLCJzdGF0ZV8iLCJkZWZlcnJlZCIsInByb21pc2VfIiwicHJvbWlzZSIsInJlc29sdmVfIiwicmVzb2x2ZSIsInJlamVjdF8iLCJyZWplY3QiLCJ0YXNrXyIsImNyZWF0ZUFuaW1UYXNrIiwibXV0YXRlIiwic3RlcE11dGF0ZV8iLCJiaW5kIiwiY2FuQW5pbWF0ZSIsIndhcm4iLCJjb21wbGV0ZV8iLCJvcHRfcmVzb2x2ZSIsIm9wdF9yZWplY3QiLCJ0aGVuIiwib3B0X2NhbGxiYWNrIiwiY2FsbGJhY2siLCJvcHRfZGlyIiwic3VjY2VzcyIsImRpciIsInNvcnQiLCJzMSIsInMyIiwiZSIsImVycm9yIiwidW51c2VkU3RhdGUiLCJjdXJyZW50VGltZSIsIm5vcm1MaW5lYXJUaW1lIiwiTWF0aCIsIm1pbiIsIm11dGF0ZVNlZ21lbnRfIiwidG90YWxMaW5lYXJUaW1lIiwibm9ybVRpbWUiLCJTZWdtZW50RGVmIiwiU2VnbWVudFJ1bnRp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QUFBVSxhQUE5QztBQUNBO0FBQ0Q7QUFDRjtBQUNGLE9BZkQsTUFlTztBQUNMZ0IsUUFBQUEsY0FBYyxHQUFHLENBQWpCO0FBQ0FLLFFBQUFBLFFBQVEsR0FBRyxDQUFYO0FBQ0Q7O0FBQ0QsVUFBSUwsY0FBYyxJQUFJLENBQXRCLEVBQXlCO0FBQ3ZCdkMsUUFBQUEsT0FBTyxDQUFDRSxTQUFSLEdBQW9CLElBQXBCO0FBQ0Q7O0FBQ0QsVUFBSTtBQUNGRixRQUFBQSxPQUFPLENBQUNYLElBQVIsQ0FBYXVELFFBQWIsRUFBdUI1QyxPQUFPLENBQUNFLFNBQS9CO0FBQ0QsT0FGRCxDQUVFLE9BQU9pQyxDQUFQLEVBQVU7QUFDVmpFLFFBQUFBLEdBQUcsR0FBR2tFLEtBQU4sQ0FBWWhFLElBQVosRUFBa0IseUJBQXlCK0QsQ0FBM0MsRUFBOENBLENBQTlDO0FBQ0EsYUFBS1osU0FBTDtBQUFlO0FBQWMsYUFBN0I7QUFBb0M7QUFBVSxTQUE5QztBQUNBO0FBQ0Q7QUFDRjs7Ozs7O0FBR0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUlzQixVQUFKOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSUMsaUJBQUoiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE1IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtOb3JtVGltZURlZiwgZ2V0Q3VydmV9IGZyb20gJy4vY29yZS9kYXRhLXN0cnVjdHVyZXMvY3VydmUnO1xuaW1wb3J0IHtEZWZlcnJlZH0gZnJvbSAnLi9jb3JlL2RhdGEtc3RydWN0dXJlcy9wcm9taXNlJztcbmltcG9ydCB7VGltZXN0YW1wRGVmfSBmcm9tICcuL2NvcmUvdHlwZXMvZGF0ZSc7XG5pbXBvcnQge2Rldn0gZnJvbSAnLi9sb2cnO1xuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnLi9zZXJ2aWNlJztcblxuY29uc3QgVEFHXyA9ICdBbmltYXRpb24nO1xuXG5jb25zdCBOT09QX0NBTExCQUNLID0gZnVuY3Rpb24gKCkge307XG5cbi8qKlxuICogVGhlIGFuaW1hdGlvbiBjbGFzcyBhbGxvd3MgY29uc3RydWN0aW9uIG9mIGFyYml0cmFyeSBhbmltYXRpb24gcHJvY2Vzc2VzLlxuICogVGhlIG1haW4gbWV0aG9kIGlzIFwiYWRkXCIgdGhhdCBhZGRzIGEgc2VnbWVudCBvZiBhbmltYXRpb24gYXQgcGFydGljdWxhclxuICogdGltZSBvZmZzZXQgKGRlbGF5KSBhbmQgZHVyYXRpb24uIEFsbCBhbmltYXRpb24gc2VnbWVudHMgYXJlIHNpbXBseSBmdW5jdGlvbnNcbiAqIG9mIHR5cGUgVHJhbnNpdGlvbiB3aGljaCBhcmUgaXRlcmF0ZWQgZnJvbSAwIHRvIDEgaW4gYW5pbWF0aW9uIGZyYW1lcyB0b1xuICogYWNoaWV2ZSB0aGUgZGVzaXJlZCBlZmZlY3QuXG4gKi9cbmV4cG9ydCBjbGFzcyBBbmltYXRpb24ge1xuICAvKipcbiAgICogQ3JlYXRlcyBhbmQgc3RhcnRzIGFuaW1hdGlvbiB3aXRoIGEgc2luZ2xlIHNlZ21lbnQuIFJldHVybnMgQW5pbWF0aW9uUGxheWVyXG4gICAqIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIG1vbml0b3Igb3IgY29udHJvbCBhbmltYXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSB7IU5vZGV9IGNvbnRleHROb2RlIFRoZSBjb250ZXh0IG5vZGUuXG4gICAqIEBwYXJhbSB7IVRyYW5zaXRpb25EZWY8Pz59IHRyYW5zaXRpb24gVHJhbnNpdGlvbiB0byBhbmltYXRlLlxuICAgKiBAcGFyYW0ge1RpbWVzdGFtcERlZn0gZHVyYXRpb24gRHVyYXRpb24gaW4gbWlsbGlzZWNvbmRzLlxuICAgKiBAcGFyYW0geyghLi9jb3JlL2RhdGEtc3RydWN0dXJlcy9jdXJ2ZS5DdXJ2ZURlZnxzdHJpbmcpPX0gb3B0X2N1cnZlIE9wdGlvbmFsIGN1cnZlIHRvIHVzZSBmb3JcbiAgICogICBhbmltYXRpb24uIERlZmF1bHQgaXMgdGhlIGxpbmVhciBhbmltYXRpb24uXG4gICAqIEByZXR1cm4geyFBbmltYXRpb25QbGF5ZXJ9XG4gICAqL1xuICBzdGF0aWMgYW5pbWF0ZShjb250ZXh0Tm9kZSwgdHJhbnNpdGlvbiwgZHVyYXRpb24sIG9wdF9jdXJ2ZSkge1xuICAgIHJldHVybiBuZXcgQW5pbWF0aW9uKGNvbnRleHROb2RlKVxuICAgICAgLnNldEN1cnZlKG9wdF9jdXJ2ZSlcbiAgICAgIC5hZGQoMCwgdHJhbnNpdGlvbiwgMSlcbiAgICAgIC5zdGFydChkdXJhdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshTm9kZX0gY29udGV4dE5vZGVcbiAgICogQHBhcmFtIHshLi9zZXJ2aWNlL3ZzeW5jLWltcGwuVnN5bmM9fSBvcHRfdnN5bmNcbiAgICovXG4gIGNvbnN0cnVjdG9yKGNvbnRleHROb2RlLCBvcHRfdnN5bmMpIHtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshTm9kZX0gKi9cbiAgICB0aGlzLmNvbnRleHROb2RlXyA9IGNvbnRleHROb2RlO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4vc2VydmljZS92c3luYy1pbXBsLlZzeW5jfSAqL1xuICAgIHRoaXMudnN5bmNfID0gb3B0X3ZzeW5jIHx8IFNlcnZpY2VzLnZzeW5jRm9yKHNlbGYpO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/Li9jb3JlL2RhdGEtc3RydWN0dXJlcy9jdXJ2ZS5DdXJ2ZURlZn0gKi9cbiAgICB0aGlzLmN1cnZlXyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZSBAY29uc3QgeyFBcnJheTwhU2VnbWVudERlZj59XG4gICAgICovXG4gICAgdGhpcy5zZWdtZW50c18gPSBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkZWZhdWx0IGN1cnZlIGZvciB0aGUgYW5pbWF0aW9uLiBFYWNoIHNlZ21lbnQgaXMgYWxsb3dlZCB0byBoYXZlXG4gICAqIGl0cyBvd24gY3VydmUsIGJ1dCB0aGlzIGN1cnZlIHdpbGwgYmUgdXNlZCBpZiBhIHNlZ21lbnQgZG9lc24ndCBzcGVjaWZ5XG4gICAqIGl0cyBvd24uXG4gICAqIEBwYXJhbSB7IS4vY29yZS9kYXRhLXN0cnVjdHVyZXMvY3VydmUuQ3VydmVEZWZ8c3RyaW5nfHVuZGVmaW5lZH0gY3VydmVcbiAgICogQHJldHVybiB7IUFuaW1hdGlvbn1cbiAgICovXG4gIHNldEN1cnZlKGN1cnZlKSB7XG4gICAgaWYgKGN1cnZlKSB7XG4gICAgICB0aGlzLmN1cnZlXyA9IGdldEN1cnZlKGN1cnZlKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIHNlZ21lbnQgdG8gdGhlIGFuaW1hdGlvbi4gRWFjaCBzZWdtZW50IHN0YXJ0cyBhdCBvZmZzZXQgKGRlbGF5KSBhbmRcbiAgICogcnVucyBmb3IgYSBwb3J0aW9uIG9mIHRoZSBvdmVyYWxsIGFuaW1hdGlvbiAoZHVyYXRpb24pLiBOb3RlIHRoYXQgYm90aFxuICAgKiBkZWxheSBhbmQgZHVyYXRpb24gYW5kIE5vcm1UaW1lRGVmIHR5cGVzIHdoaWNoIGFjY2VwdCB2YWx1ZXMgZnJvbSAwIHRvIDEuXG4gICAqIE9wdGlvbmFsbHksIHRoZSB0aW1lIGlzIHB1c2hlZCB0aHJvdWdoIGEgY3VydmUuIElmIGN1cnZlIGlzIG5vdCBzcGVjaWZpZWQsXG4gICAqIHRoZSBkZWZhdWx0IGFuaW1hdGlvbiBjdXJ2ZSB3aWxsIGJlIHVzZWQuIFRoZSBzcGVjaWZpZWQgdHJhbnNpdGlvbiBpc1xuICAgKiBhbmltYXRlZCBvdmVyIHRoZSBzcGVjaWZpZWQgZHVyYXRpb24gZnJvbSAwIHRvIDEuXG4gICAqXG4gICAqIEBwYXJhbSB7IU5vcm1UaW1lRGVmfSBkZWxheVxuICAgKiBAcGFyYW0geyFUcmFuc2l0aW9uRGVmPD8+fSB0cmFuc2l0aW9uXG4gICAqIEBwYXJhbSB7IU5vcm1UaW1lRGVmfSBkdXJhdGlvblxuICAgKiBAcGFyYW0geyghLi9jb3JlL2RhdGEtc3RydWN0dXJlcy9jdXJ2ZS5DdXJ2ZURlZnxzdHJpbmcpPX0gb3B0X2N1cnZlXG4gICAqIEByZXR1cm4geyFBbmltYXRpb259XG4gICAqL1xuICBhZGQoZGVsYXksIHRyYW5zaXRpb24sIGR1cmF0aW9uLCBvcHRfY3VydmUpIHtcbiAgICB0aGlzLnNlZ21lbnRzXy5wdXNoKHtcbiAgICAgIGRlbGF5LFxuICAgICAgZnVuYzogdHJhbnNpdGlvbixcbiAgICAgIGR1cmF0aW9uLFxuICAgICAgY3VydmU6IGdldEN1cnZlKG9wdF9jdXJ2ZSksXG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIHRoZSBhbmltYXRpb24gYW5kIHJldHVybnMgdGhlIEFuaW1hdGlvblBsYXllciBvYmplY3QgdGhhdCBjYW4gYmVcbiAgICogdXNlZCB0byBtb25pdG9yIGFuZCBjb250cm9sIHRoZSBhbmltYXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSB7IVRpbWVzdGFtcERlZn0gZHVyYXRpb24gQWJzb2x1dGUgdGltZSBpbiBtaWxsaXNlY29uZHMuXG4gICAqIEByZXR1cm4geyFBbmltYXRpb25QbGF5ZXJ9XG4gICAqL1xuICBzdGFydChkdXJhdGlvbikge1xuICAgIGNvbnN0IHBsYXllciA9IG5ldyBBbmltYXRpb25QbGF5ZXIoXG4gICAgICB0aGlzLnZzeW5jXyxcbiAgICAgIHRoaXMuY29udGV4dE5vZGVfLFxuICAgICAgdGhpcy5zZWdtZW50c18sXG4gICAgICB0aGlzLmN1cnZlXyxcbiAgICAgIGR1cmF0aW9uXG4gICAgKTtcbiAgICByZXR1cm4gcGxheWVyO1xuICB9XG59XG5cbi8qKlxuICogQW5pbWF0aW9uUGxheWVyIGFsbG93cyB0cmFja2luZyBhbmQgbW9uaXRvcmluZyBvZiB0aGUgcnVubmluZyBhbmltYXRpb24uXG4gKiBNb3N0IGltcG9ydGFudGx5IGl0IGV4cG9zZXMgbWV0aG9kcyBcInRoZW5cIiBhbmQgXCJ0aGVuQWx3YXlzXCIgdGhhdCBoYXZlIHRoZVxuICogc2VtYW50aWNzIG9mIGEgUHJvbWlzZSBhbmQgc2lnbmFsIHdoZW4gdGhlIGFuaW1hdGlvbiBjb21wbGV0ZWQgb3IgZmFpbGVkLlxuICogQWRkaXRpb25hbGx5LCBpdCBleHBvc2VzIHRoZSBtZXRob2QgXCJoYWx0XCIgd2hpY2ggYWxsb3dzIHRvIHN0b3AvcmVzZXQgdGhlXG4gKiBhbmltYXRpb24uXG4gKiAvLyBUT0RPKEBjcmFtZm9yY2UpIEFjdHVhbGx5IGZ1bGx5IGltcGxlbWVudC5cbiAqIGltcGxlbWVudHMge0lUaGVuYWJsZX1cbiAqL1xuY2xhc3MgQW5pbWF0aW9uUGxheWVyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4vc2VydmljZS92c3luYy1pbXBsLlZzeW5jfSB2c3luY1xuICAgKiBAcGFyYW0geyFOb2RlfSBjb250ZXh0Tm9kZVxuICAgKiBAcGFyYW0geyFBcnJheTwhU2VnbWVudERlZj59IHNlZ21lbnRzXG4gICAqIEBwYXJhbSB7Py4vY29yZS9kYXRhLXN0cnVjdHVyZXMvY3VydmUuQ3VydmVEZWZ9IGRlZmF1bHRDdXJ2ZVxuICAgKiBAcGFyYW0geyFUaW1lc3RhbXBEZWZ9IGR1cmF0aW9uXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih2c3luYywgY29udGV4dE5vZGUsIHNlZ21lbnRzLCBkZWZhdWx0Q3VydmUsIGR1cmF0aW9uKSB7XG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4vc2VydmljZS92c3luYy1pbXBsLlZzeW5jfSAqL1xuICAgIHRoaXMudnN5bmNfID0gdnN5bmM7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshTm9kZX0gKi9cbiAgICB0aGlzLmNvbnRleHROb2RlXyA9IGNvbnRleHROb2RlO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IUFycmF5PCFTZWdtZW50UnVudGltZURlZj59ICovXG4gICAgdGhpcy5zZWdtZW50c18gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNlZ21lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBzZWdtZW50ID0gc2VnbWVudHNbaV07XG4gICAgICB0aGlzLnNlZ21lbnRzXy5wdXNoKHtcbiAgICAgICAgZGVsYXk6IHNlZ21lbnQuZGVsYXksXG4gICAgICAgIGZ1bmM6IHNlZ21lbnQuZnVuYyxcbiAgICAgICAgZHVyYXRpb246IHNlZ21lbnQuZHVyYXRpb24sXG4gICAgICAgIGN1cnZlOiBzZWdtZW50LmN1cnZlIHx8IGRlZmF1bHRDdXJ2ZSxcbiAgICAgICAgc3RhcnRlZDogZmFsc2UsXG4gICAgICAgIGNvbXBsZXRlZDogZmFsc2UsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0ICovXG4gICAgdGhpcy5kdXJhdGlvbl8gPSBkdXJhdGlvbjtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IVRpbWVzdGFtcERlZn0gKi9cbiAgICB0aGlzLnN0YXJ0VGltZV8gPSBEYXRlLm5vdygpO1xuXG4gICAgLyoqIEBwcml2YXRlIHshTm9ybVRpbWVEZWZ9ICovXG4gICAgLy8gdGhpcy5ub3JtTGluZWFyVGltZV8gPSAwO1xuXG4gICAgLyoqIEBwcml2YXRlIHshTm9ybVRpbWVEZWZ9ICovXG4gICAgLy8gdGhpcy5ub3JtVGltZV8gPSAwO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMucnVubmluZ18gPSB0cnVlO1xuXG4gICAgLyoqIEBwcml2YXRlIHshT2JqZWN0PHN0cmluZywgKj59ICovXG4gICAgdGhpcy5zdGF0ZV8gPSB7fTtcblxuICAgIGNvbnN0IGRlZmVycmVkID0gbmV3IERlZmVycmVkKCk7XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlICovXG4gICAgdGhpcy5wcm9taXNlXyA9IGRlZmVycmVkLnByb21pc2U7XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlICovXG4gICAgdGhpcy5yZXNvbHZlXyA9IGRlZmVycmVkLnJlc29sdmU7XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlICovXG4gICAgdGhpcy5yZWplY3RfID0gZGVmZXJyZWQucmVqZWN0O1xuXG4gICAgLyoqIEBjb25zdCAqL1xuICAgIHRoaXMudGFza18gPSB0aGlzLnZzeW5jXy5jcmVhdGVBbmltVGFzayh0aGlzLmNvbnRleHROb2RlXywge1xuICAgICAgbXV0YXRlOiB0aGlzLnN0ZXBNdXRhdGVfLmJpbmQodGhpcyksXG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy52c3luY18uY2FuQW5pbWF0ZSh0aGlzLmNvbnRleHROb2RlXykpIHtcbiAgICAgIHRoaXMudGFza18odGhpcy5zdGF0ZV8pO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZXYoKS53YXJuKFRBR18sICdjYW5ub3QgYW5pbWF0ZScpO1xuICAgICAgdGhpcy5jb21wbGV0ZV8oLyogc3VjY2VzcyAqLyBmYWxzZSwgLyogZGlyICovIDApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFpbnMgdG8gdGhlIGFuaW1hdGlvbidzIHByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgd2hlbiB0aGUgYW5pbWF0aW9uIGhhc1xuICAgKiBjb21wbGV0ZWQgb3Igd2lsbCByZWplY3QgaWYgYW5pbWF0aW9uIGhhcyBmYWlsZWQgb3Igd2FzIGludGVycnVwdGVkLlxuICAgKiBAcGFyYW0geyFGdW5jdGlvbj19IG9wdF9yZXNvbHZlXG4gICAqIEBwYXJhbSB7IUZ1bmN0aW9uPX0gb3B0X3JlamVjdFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIHRoZW4ob3B0X3Jlc29sdmUsIG9wdF9yZWplY3QpIHtcbiAgICBpZiAoIW9wdF9yZXNvbHZlICYmICFvcHRfcmVqZWN0KSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9taXNlXztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucHJvbWlzZV8udGhlbihvcHRfcmVzb2x2ZSwgb3B0X3JlamVjdCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGJhY2sgZm9yIHJlZ2FyZGxlc3Mgd2hldGhlciB0aGUgYW5pbWF0aW9uIHN1Y2NlZWRzIG9yIGZhaWxzLlxuICAgKiBAcGFyYW0geyFGdW5jdGlvbj19IG9wdF9jYWxsYmFja1xuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIHRoZW5BbHdheXMob3B0X2NhbGxiYWNrKSB7XG4gICAgY29uc3QgY2FsbGJhY2sgPSBvcHRfY2FsbGJhY2sgfHwgTk9PUF9DQUxMQkFDSztcbiAgICByZXR1cm4gdGhpcy50aGVuKGNhbGxiYWNrLCBjYWxsYmFjayk7XG4gIH1cblxuICAvKipcbiAgICogSGFsdHMgdGhlIGFuaW1hdGlvbi4gRGVwZW5kaW5nIG9uIHRoZSBvcHRfZGlyIHZhbHVlLCB0aGUgZm9sbG93aW5nIGFjdGlvbnNcbiAgICogY2FuIGJlIHBlcmZvcm1lZDpcbiAgICogMDogTm8gYWN0aW9uLiBUaGUgc3RhdGUgd2lsbCBiZSBhcyBhdCB0aGUgbW9tZW50IG9mIGhhbHRpbmcgKGRlZmF1bHQpXG4gICAqIDE6IEZpbmFsIHN0YXRlLiBUcmFuc2l0aW9uYWJsZSB3aWxsIGJlIHNldCB0byBzdGF0ZSA9IDEuXG4gICAqIC0xOiBSZXNldCBzdGF0ZS4gVHJhbnNpdGlvbmFibGUgd2lsbCBiZSByZXNldCB0byBzdGF0ZSA9IDAuXG4gICAqIFRoZSBhbmltYXRpb24ncyBwcm9taXNlIHdpbGwgYmUgcmVqZWN0ZWQgc2luY2UgdGhlIHRyYW5zaXRpb24gaGFzIGJlZW5cbiAgICogaW50ZXJydXB0ZWQuXG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gb3B0X2RpclxuICAgKi9cbiAgaGFsdChvcHRfZGlyKSB7XG4gICAgdGhpcy5jb21wbGV0ZV8oLyogc3VjY2VzcyAqLyBmYWxzZSwgLyogZGlyICovIG9wdF9kaXIgfHwgMCk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtib29sZWFufSBzdWNjZXNzXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkaXJcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNvbXBsZXRlXyhzdWNjZXNzLCBkaXIpIHtcbiAgICBpZiAoIXRoaXMucnVubmluZ18pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5ydW5uaW5nXyA9IGZhbHNlO1xuICAgIGlmIChkaXIgIT0gMCkge1xuICAgICAgLy8gU29ydCBpbiB0aGUgY29tcGxldGlvbiBvcmRlci5cbiAgICAgIGlmICh0aGlzLnNlZ21lbnRzXy5sZW5ndGggPiAxKSB7XG4gICAgICAgIHRoaXMuc2VnbWVudHNfLnNvcnQoKHMxLCBzMikgPT4ge1xuICAgICAgICAgIHJldHVybiBzMS5kZWxheSArIHMxLmR1cmF0aW9uIC0gKHMyLmRlbGF5ICsgczIuZHVyYXRpb24pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChkaXIgPiAwKSB7XG4gICAgICAgICAgLy8gTmF0dXJhbCBvcmRlciAtIGFsbCBzZXQgdG8gMS5cbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc2VnbWVudHNfLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnNlZ21lbnRzX1tpXS5mdW5jKDEsIHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBSZXZlcnNlIG9yZGVyIC0gYWxsIHNldCB0byAwLlxuICAgICAgICAgIGZvciAobGV0IGkgPSB0aGlzLnNlZ21lbnRzXy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgdGhpcy5zZWdtZW50c19baV0uZnVuYygwLCBmYWxzZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGRldigpLmVycm9yKFRBR18sICdjb21wbGV0aW9uIGZhaWxlZDogJyArIGUsIGUpO1xuICAgICAgICBzdWNjZXNzID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICB0aGlzLnJlc29sdmVfKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVqZWN0XygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFPYmplY3Q8c3RyaW5nLCAqPn0gdW51c2VkU3RhdGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHN0ZXBNdXRhdGVfKHVudXNlZFN0YXRlKSB7XG4gICAgaWYgKCF0aGlzLnJ1bm5pbmdfKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICBjb25zdCBub3JtTGluZWFyVGltZSA9IE1hdGgubWluKFxuICAgICAgKGN1cnJlbnRUaW1lIC0gdGhpcy5zdGFydFRpbWVfKSAvIHRoaXMuZHVyYXRpb25fLFxuICAgICAgMVxuICAgICk7XG5cbiAgICAvLyBTdGFydCBzZWdtZW50cyBkdWUgdG8gYmUgc3RhcnRlZFxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zZWdtZW50c18ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHNlZ21lbnQgPSB0aGlzLnNlZ21lbnRzX1tpXTtcbiAgICAgIGlmICghc2VnbWVudC5zdGFydGVkICYmIG5vcm1MaW5lYXJUaW1lID49IHNlZ21lbnQuZGVsYXkpIHtcbiAgICAgICAgc2VnbWVudC5zdGFydGVkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBFeGVjdXRlIGFsbCBwZW5kaW5nIHNlZ21lbnRzLlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zZWdtZW50c18ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHNlZ21lbnQgPSB0aGlzLnNlZ21lbnRzX1tpXTtcbiAgICAgIGlmICghc2VnbWVudC5zdGFydGVkIHx8IHNlZ21lbnQuY29tcGxldGVkKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgdGhpcy5tdXRhdGVTZWdtZW50XyhzZWdtZW50LCBub3JtTGluZWFyVGltZSk7XG4gICAgfVxuXG4gICAgLy8gQ29tcGxldGUgb3Igc3RhcnQgbmV4dCBjeWNsZS5cbiAgICBpZiAobm9ybUxpbmVhclRpbWUgPT0gMSkge1xuICAgICAgdGhpcy5jb21wbGV0ZV8oLyogc3VjY2VzcyAqLyB0cnVlLCAvKiBkaXIgKi8gMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLnZzeW5jXy5jYW5BbmltYXRlKHRoaXMuY29udGV4dE5vZGVfKSkge1xuICAgICAgICB0aGlzLnRhc2tfKHRoaXMuc3RhdGVfKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRldigpLndhcm4oVEFHXywgJ2NhbmNlbCBhbmltYXRpb24nKTtcbiAgICAgICAgdGhpcy5jb21wbGV0ZV8oLyogc3VjY2VzcyAqLyBmYWxzZSwgLyogZGlyICovIDApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFTZWdtZW50UnVudGltZURlZn0gc2VnbWVudFxuICAgKiBAcGFyYW0ge251bWJlcn0gdG90YWxMaW5lYXJUaW1lXG4gICAqL1xuICBtdXRhdGVTZWdtZW50XyhzZWdtZW50LCB0b3RhbExpbmVhclRpbWUpIHtcbiAgICBsZXQgbm9ybUxpbmVhclRpbWU7XG4gICAgbGV0IG5vcm1UaW1lO1xuICAgIGlmIChzZWdtZW50LmR1cmF0aW9uID4gMCkge1xuICAgICAgbm9ybUxpbmVhclRpbWUgPSBNYXRoLm1pbihcbiAgICAgICAgKHRvdGFsTGluZWFyVGltZSAtIHNlZ21lbnQuZGVsYXkpIC8gc2VnbWVudC5kdXJhdGlvbixcbiAgICAgICAgMVxuICAgICAgKTtcbiAgICAgIG5vcm1UaW1lID0gbm9ybUxpbmVhclRpbWU7XG4gICAgICBpZiAoc2VnbWVudC5jdXJ2ZSAmJiBub3JtVGltZSAhPSAxKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbm9ybVRpbWUgPSBzZWdtZW50LmN1cnZlKG5vcm1MaW5lYXJUaW1lKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGRldigpLmVycm9yKFRBR18sICdzdGVwIGN1cnZlIGZhaWxlZDogJyArIGUsIGUpO1xuICAgICAgICAgIHRoaXMuY29tcGxldGVfKC8qIHN1Y2Nlc3MgKi8gZmFsc2UsIC8qIGRpciAqLyAwKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbm9ybUxpbmVhclRpbWUgPSAxO1xuICAgICAgbm9ybVRpbWUgPSAxO1xuICAgIH1cbiAgICBpZiAobm9ybUxpbmVhclRpbWUgPT0gMSkge1xuICAgICAgc2VnbWVudC5jb21wbGV0ZWQgPSB0cnVlO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgc2VnbWVudC5mdW5jKG5vcm1UaW1lLCBzZWdtZW50LmNvbXBsZXRlZCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZGV2KCkuZXJyb3IoVEFHXywgJ3N0ZXAgbXV0YXRlIGZhaWxlZDogJyArIGUsIGUpO1xuICAgICAgdGhpcy5jb21wbGV0ZV8oLyogc3VjY2VzcyAqLyBmYWxzZSwgLyogZGlyICovIDApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEB0eXBlZGVmIHt7XG4gKiAgIGRlbGF5OiBOb3JtVGltZURlZixcbiAqICAgZnVuYzogIVRyYW5zaXRpb25EZWYsXG4gKiAgIGR1cmF0aW9uOiBOb3JtVGltZURlZixcbiAqICAgY3VydmU6ID8uL2NvcmUvZGF0YS1zdHJ1Y3R1cmVzL2N1cnZlLkN1cnZlRGVmXG4gKiB9fVxuICovXG5sZXQgU2VnbWVudERlZjtcblxuLyoqXG4gKiBAdHlwZWRlZiB7e1xuICogICBkZWxheTogTm9ybVRpbWVEZWYsXG4gKiAgIGZ1bmM6ICFUcmFuc2l0aW9uRGVmLFxuICogICBkdXJhdGlvbjogTm9ybVRpbWVEZWYsXG4gKiAgIGN1cnZlOiA/Li9jb3JlL2RhdGEtc3RydWN0dXJlcy9jdXJ2ZS5DdXJ2ZURlZixcbiAqICAgc3RhcnRlZDogYm9vbGVhbixcbiAqICAgY29tcGxldGVkOiBib29sZWFuXG4gKiB9fVxuICovXG5sZXQgU2VnbWVudFJ1bnRpbWVEZWY7XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/animation.js