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
import { Deferred } from "./core/data-structures/promise";
import { Services } from "./service";

/** @const {function()} */
var NOOP_CALLBACK_ = function NOOP_CALLBACK_() {};

/** @const {number} */
var MIN_VELOCITY_ = 0.02;

/** @const {number} */
var FRAME_CONST_ = 16.67;

/** @const {number} */
var EXP_FRAME_CONST_ = Math.round(-FRAME_CONST_ / Math.log(0.95));

/**
 * Depreciation factor of 1/100 of a millisecond. This is how much previous
 * velocity is depreciated when calculating the new velocity.
 * @const {number}
 */
var VELOCITY_DEPR_FACTOR_ = FRAME_CONST_ * 2;

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
  var speed = deltaV / deltaTime;
  // Depreciation is simply an informational quality. It basically means:
  // we can't ignore the velocity we knew recently, but we'd only consider
  // it proportionally to how long ago we've seen it. Currently, this
  // depreciation factor is 1/100 of a millisecond. New average velocity is
  // calculated by weighing toward the new velocity and away from old
  // velocity based on the depreciation.
  var depr = 0.5 + Math.min(deltaTime / VELOCITY_DEPR_FACTOR_, 0.5);
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
export function continueMotion(contextNode, startX, startY, veloX, veloY, callback, opt_vsync) {
  return new Motion(contextNode, startX, startY, veloX, veloY, callback, opt_vsync).start();
}

/**
 * Motion process that allows tracking and monitoring of the running motion.
 * Most importantly it exposes methods "then" and "thenAlways" that have the
 * semantics of a Promise and signal when the motion has completed or failed.
 * Additionally, it exposes the method "halt" which allows to stop/reset the
 * motion.
 * @implements {IThenable}
 */
export var Motion = /*#__PURE__*/function () {
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
  function Motion(contextNode, startX, startY, veloX, veloY, callback, opt_vsync) {
    _classCallCheck(this, Motion);

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
    var deferred = new Deferred();

    /** @private {!Promise} */
    this.promise_ = deferred.promise;

    /** @private {!Function} */
    this.resolve_ = deferred.resolve;

    /** @private {!Function} */
    this.reject_ = deferred.reject;

    /** @private {boolean} */
    this.continuing_ = false;
  }

  /** */
  _createClass(Motion, [{
    key: "start",
    value: function start() {
      this.continuing_ = true;

      if (Math.abs(this.maxVelocityX_) <= MIN_VELOCITY_ && Math.abs(this.maxVelocityY_) <= MIN_VELOCITY_) {
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

  }, {
    key: "halt",
    value: function halt() {
      if (this.continuing_) {
        this.completeContinue_(false);
      }
    }
    /**
     * Chains to the motion's promise that will resolve when the motion has
     * completed or will reject if motion has failed or was interrupted.
     * @override
     */

  }, {
    key: "then",
    value: function then(opt_resolve, opt_reject) {
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

  }, {
    key: "thenAlways",
    value: function thenAlways(opt_callback) {
      var callback = opt_callback || NOOP_CALLBACK_;
      return (
        /** @type {!Promise} */
        this.then(callback, callback)
      );
    }
    /**
     * @return {!Promise}
     * @private
     */

  }, {
    key: "runContinuing_",
    value: function runContinuing_() {
      this.velocityX_ = this.maxVelocityX_;
      this.velocityY_ = this.maxVelocityY_;
      var boundStep = this.stepContinue_.bind(this);
      var boundComplete = this.completeContinue_.bind(this, true);
      return this.vsync_.runAnimMutateSeries(this.contextNode_, boundStep, 5000).then(boundComplete, boundComplete);
    }
    /**
     * Returns "true" to continue and "false" to stop motion process.
     * @param {time} timeSinceStart
     * @param {time} timeSincePrev
     * @return {boolean}
     * @private
     */

  }, {
    key: "stepContinue_",
    value: function stepContinue_(timeSinceStart, timeSincePrev) {
      if (!this.continuing_) {
        return false;
      }

      this.lastX_ += timeSincePrev * this.velocityX_;
      this.lastY_ += timeSincePrev * this.velocityY_;

      if (!this.fireMove_()) {
        return false;
      }

      var decel = Math.exp(-timeSinceStart / EXP_FRAME_CONST_);
      this.velocityX_ = this.maxVelocityX_ * decel;
      this.velocityY_ = this.maxVelocityY_ * decel;
      return Math.abs(this.velocityX_) > MIN_VELOCITY_ || Math.abs(this.velocityY_) > MIN_VELOCITY_;
    }
    /**
     * @param {boolean} success
     * @private
     */

  }, {
    key: "completeContinue_",
    value: function completeContinue_(success) {
      if (!this.continuing_) {
        return;
      }

      this.continuing_ = false;
      this.fireMove_();

      if (success) {
        this.resolve_();
      } else {
        this.reject_();
      }
    }
    /** @private */

  }, {
    key: "fireMove_",
    value: function fireMove_() {
      return this.callback_(this.lastX_, this.lastY_);
    }
  }]);

  return Motion;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vdGlvbi5qcyJdLCJuYW1lcyI6WyJEZWZlcnJlZCIsIlNlcnZpY2VzIiwiTk9PUF9DQUxMQkFDS18iLCJNSU5fVkVMT0NJVFlfIiwiRlJBTUVfQ09OU1RfIiwiRVhQX0ZSQU1FX0NPTlNUXyIsIk1hdGgiLCJyb3VuZCIsImxvZyIsIlZFTE9DSVRZX0RFUFJfRkFDVE9SXyIsImNhbGNWZWxvY2l0eSIsImRlbHRhViIsImRlbHRhVGltZSIsInByZXZWZWxvY2l0eSIsInNwZWVkIiwiZGVwciIsIm1pbiIsImNvbnRpbnVlTW90aW9uIiwiY29udGV4dE5vZGUiLCJzdGFydFgiLCJzdGFydFkiLCJ2ZWxvWCIsInZlbG9ZIiwiY2FsbGJhY2siLCJvcHRfdnN5bmMiLCJNb3Rpb24iLCJzdGFydCIsInZzeW5jXyIsInZzeW5jRm9yIiwic2VsZiIsImNvbnRleHROb2RlXyIsImNhbGxiYWNrXyIsImxhc3RYXyIsImxhc3RZXyIsIm1heFZlbG9jaXR5WF8iLCJtYXhWZWxvY2l0eVlfIiwidmVsb2NpdHlYXyIsInZlbG9jaXR5WV8iLCJkZWZlcnJlZCIsInByb21pc2VfIiwicHJvbWlzZSIsInJlc29sdmVfIiwicmVzb2x2ZSIsInJlamVjdF8iLCJyZWplY3QiLCJjb250aW51aW5nXyIsImFicyIsImZpcmVNb3ZlXyIsImNvbXBsZXRlQ29udGludWVfIiwicnVuQ29udGludWluZ18iLCJvcHRfcmVzb2x2ZSIsIm9wdF9yZWplY3QiLCJ0aGVuIiwib3B0X2NhbGxiYWNrIiwiYm91bmRTdGVwIiwic3RlcENvbnRpbnVlXyIsImJpbmQiLCJib3VuZENvbXBsZXRlIiwicnVuQW5pbU11dGF0ZVNlcmllcyIsInRpbWVTaW5jZVN0YXJ0IiwidGltZVNpbmNlUHJldiIsImRlY2VsIiwiZXhwIiwic3VjY2VzcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QTtBQUFBLFdBa0pFLDJCQUFrQjRELE9BQWxCLEVBQTJCO0FBQ3pCLFVBQUksQ0FBQyxLQUFLbEIsV0FBVixFQUF1QjtBQUNyQjtBQUNEOztBQUNELFdBQUtBLFdBQUwsR0FBbUIsS0FBbkI7QUFDQSxXQUFLRSxTQUFMOztBQUNBLFVBQUlnQixPQUFKLEVBQWE7QUFDWCxhQUFLdEIsUUFBTDtBQUNELE9BRkQsTUFFTztBQUNMLGFBQUtFLE9BQUw7QUFDRDtBQUNGO0FBRUQ7O0FBL0pGO0FBQUE7QUFBQSxXQWdLRSxxQkFBWTtBQUNWLGFBQU8sS0FBS1osU0FBTCxDQUFlLEtBQUtDLE1BQXBCLEVBQTRCLEtBQUtDLE1BQWpDLENBQVA7QUFDRDtBQWxLSDs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7RGVmZXJyZWR9IGZyb20gJy4vY29yZS9kYXRhLXN0cnVjdHVyZXMvcHJvbWlzZSc7XG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcuL3NlcnZpY2UnO1xuXG4vKiogQGNvbnN0IHtmdW5jdGlvbigpfSAqL1xuY29uc3QgTk9PUF9DQUxMQkFDS18gPSBmdW5jdGlvbiAoKSB7fTtcblxuLyoqIEBjb25zdCB7bnVtYmVyfSAqL1xuY29uc3QgTUlOX1ZFTE9DSVRZXyA9IDAuMDI7XG5cbi8qKiBAY29uc3Qge251bWJlcn0gKi9cbmNvbnN0IEZSQU1FX0NPTlNUXyA9IDE2LjY3O1xuXG4vKiogQGNvbnN0IHtudW1iZXJ9ICovXG5jb25zdCBFWFBfRlJBTUVfQ09OU1RfID0gTWF0aC5yb3VuZCgtRlJBTUVfQ09OU1RfIC8gTWF0aC5sb2coMC45NSkpO1xuXG4vKipcbiAqIERlcHJlY2lhdGlvbiBmYWN0b3Igb2YgMS8xMDAgb2YgYSBtaWxsaXNlY29uZC4gVGhpcyBpcyBob3cgbXVjaCBwcmV2aW91c1xuICogdmVsb2NpdHkgaXMgZGVwcmVjaWF0ZWQgd2hlbiBjYWxjdWxhdGluZyB0aGUgbmV3IHZlbG9jaXR5LlxuICogQGNvbnN0IHtudW1iZXJ9XG4gKi9cbmNvbnN0IFZFTE9DSVRZX0RFUFJfRkFDVE9SXyA9IEZSQU1FX0NPTlNUXyAqIDI7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB2ZWxvY2l0eSBmb3IgYW4gb2JqZWN0IHRyYXZlbGluZyB0aGUgZGlzdGFuY2UgZGVsdGFWIGluIHRoZVxuICogdGltZSBkZWx0YVRpbWUgZ2l2ZW4gdGhlIHByZXZpb3VzIHZlbG9jaXR5IHByZXZWZWxvY2l0eS4gVGhlIGNhbGN1bGF0aW9uXG4gKiBhc3N1bWVzIGEgYmFzaWMgaW5mb3JtYXRpb25hbCBkZXByZWNpYXRpb24gb2YgcHJldmlvdXMgdmVsb2NpdHkuXG4gKiBAcGFyYW0ge251bWJlcn0gZGVsdGFWXG4gKiBAcGFyYW0ge3RpbWV9IGRlbHRhVGltZVxuICogQHBhcmFtIHtudW1iZXJ9IHByZXZWZWxvY2l0eVxuICogQHJldHVybiB7bnVtYmVyfVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FsY1ZlbG9jaXR5KGRlbHRhViwgZGVsdGFUaW1lLCBwcmV2VmVsb2NpdHkpIHtcbiAgaWYgKGRlbHRhVGltZSA8IDEpIHtcbiAgICBkZWx0YVRpbWUgPSAxO1xuICB9XG5cbiAgLy8gQ2FsY3VsYXRlIHNwZWVkIGFuZCBzcGVlZCBkZXByZWNpYXRpb24uXG4gIGNvbnN0IHNwZWVkID0gZGVsdGFWIC8gZGVsdGFUaW1lO1xuXG4gIC8vIERlcHJlY2lhdGlvbiBpcyBzaW1wbHkgYW4gaW5mb3JtYXRpb25hbCBxdWFsaXR5LiBJdCBiYXNpY2FsbHkgbWVhbnM6XG4gIC8vIHdlIGNhbid0IGlnbm9yZSB0aGUgdmVsb2NpdHkgd2Uga25ldyByZWNlbnRseSwgYnV0IHdlJ2Qgb25seSBjb25zaWRlclxuICAvLyBpdCBwcm9wb3J0aW9uYWxseSB0byBob3cgbG9uZyBhZ28gd2UndmUgc2VlbiBpdC4gQ3VycmVudGx5LCB0aGlzXG4gIC8vIGRlcHJlY2lhdGlvbiBmYWN0b3IgaXMgMS8xMDAgb2YgYSBtaWxsaXNlY29uZC4gTmV3IGF2ZXJhZ2UgdmVsb2NpdHkgaXNcbiAgLy8gY2FsY3VsYXRlZCBieSB3ZWlnaGluZyB0b3dhcmQgdGhlIG5ldyB2ZWxvY2l0eSBhbmQgYXdheSBmcm9tIG9sZFxuICAvLyB2ZWxvY2l0eSBiYXNlZCBvbiB0aGUgZGVwcmVjaWF0aW9uLlxuICBjb25zdCBkZXByID0gMC41ICsgTWF0aC5taW4oZGVsdGFUaW1lIC8gVkVMT0NJVFlfREVQUl9GQUNUT1JfLCAwLjUpO1xuICByZXR1cm4gc3BlZWQgKiBkZXByICsgcHJldlZlbG9jaXR5ICogKDEgLSBkZXByKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgbW90aW9uIHByb2Nlc3MgdGhhdCB3aWxsIHlpZWxkIHdoZW4gdGhlIHZlbG9jaXR5IGhhcyBydW4gZG93biB0b1xuICogemVycC4gRm9yIGVhY2ggaXRlcmF0aW9uLCB0aGUgdmVsb2NpdHkgaXMgZGVwcmVjaWF0ZWQgYW5kIHRoZSBjb29yZGluYXRlc1xuICogYXJlIGFkdmFuY2VkIGZyb20gc3RhcnQgWC9ZIHRvIHRoZSBkZXN0aW5hdGlvbiBhY2NvcmRpbmcgdG8gdmVsb2NpdHlcbiAqIHZlY3RvcnMuIEZvciBlYWNoIHN1Y2ggaXRlcmF0aW9uIHRoZSBjYWxsYmFjayBpcyBjYWxsZWQgd2l0aCB0aGUgbmV3IHggYW5kIHkuXG4gKiBAcGFyYW0geyFOb2RlfSBjb250ZXh0Tm9kZVxuICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0WCBTdGFydCBYIGNvb3JkaW5hdGUuXG4gKiBAcGFyYW0ge251bWJlcn0gc3RhcnRZIFN0YXJ0IFkgY29vcmRpbmF0ZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSB2ZWxvWCBTdGFydGluZyBYIHZlbG9jaXR5LlxuICogQHBhcmFtIHtudW1iZXJ9IHZlbG9ZIFN0YXJ0aW5nIFkgdmVsb2NpdHkuXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKG51bWJlciwgbnVtYmVyKTpib29sZWFufSBjYWxsYmFjayBUaGUgY2FsbGJhY2sgZm9yIGVhY2hcbiAqICAgc3RlcCBvZiB0aGUgZGVjZWxlcmF0aW9uIG1vdGlvbi5cbiAqIEBwYXJhbSB7IS4vc2VydmljZS92c3luYy1pbXBsLlZzeW5jPX0gb3B0X3ZzeW5jIE1vc3RseSBmb3IgdGVzdGluZyBvbmx5LlxuICogQHJldHVybiB7IU1vdGlvbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnRpbnVlTW90aW9uKFxuICBjb250ZXh0Tm9kZSxcbiAgc3RhcnRYLFxuICBzdGFydFksXG4gIHZlbG9YLFxuICB2ZWxvWSxcbiAgY2FsbGJhY2ssXG4gIG9wdF92c3luY1xuKSB7XG4gIHJldHVybiBuZXcgTW90aW9uKFxuICAgIGNvbnRleHROb2RlLFxuICAgIHN0YXJ0WCxcbiAgICBzdGFydFksXG4gICAgdmVsb1gsXG4gICAgdmVsb1ksXG4gICAgY2FsbGJhY2ssXG4gICAgb3B0X3ZzeW5jXG4gICkuc3RhcnQoKTtcbn1cblxuLyoqXG4gKiBNb3Rpb24gcHJvY2VzcyB0aGF0IGFsbG93cyB0cmFja2luZyBhbmQgbW9uaXRvcmluZyBvZiB0aGUgcnVubmluZyBtb3Rpb24uXG4gKiBNb3N0IGltcG9ydGFudGx5IGl0IGV4cG9zZXMgbWV0aG9kcyBcInRoZW5cIiBhbmQgXCJ0aGVuQWx3YXlzXCIgdGhhdCBoYXZlIHRoZVxuICogc2VtYW50aWNzIG9mIGEgUHJvbWlzZSBhbmQgc2lnbmFsIHdoZW4gdGhlIG1vdGlvbiBoYXMgY29tcGxldGVkIG9yIGZhaWxlZC5cbiAqIEFkZGl0aW9uYWxseSwgaXQgZXhwb3NlcyB0aGUgbWV0aG9kIFwiaGFsdFwiIHdoaWNoIGFsbG93cyB0byBzdG9wL3Jlc2V0IHRoZVxuICogbW90aW9uLlxuICogQGltcGxlbWVudHMge0lUaGVuYWJsZX1cbiAqL1xuZXhwb3J0IGNsYXNzIE1vdGlvbiB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFOb2RlfSBjb250ZXh0Tm9kZSBDb250ZXh0IG5vZGUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydFggU3RhcnQgWCBjb29yZGluYXRlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gc3RhcnRZIFN0YXJ0IFkgY29vcmRpbmF0ZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHZlbG9YIFN0YXJ0aW5nIFggdmVsb2NpdHkuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2ZWxvWSBTdGFydGluZyBZIHZlbG9jaXR5LlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKG51bWJlciwgbnVtYmVyKTpib29sZWFufSBjYWxsYmFjayBUaGUgY2FsbGJhY2sgZm9yIGVhY2hcbiAgICogICBzdGVwIG9mIHRoZSBkZWNlbGVyYXRpb24gbW90aW9uLlxuICAgKiBAcGFyYW0geyEuL3NlcnZpY2UvdnN5bmMtaW1wbC5Wc3luYz19IG9wdF92c3luY1xuICAgKi9cbiAgY29uc3RydWN0b3IoY29udGV4dE5vZGUsIHN0YXJ0WCwgc3RhcnRZLCB2ZWxvWCwgdmVsb1ksIGNhbGxiYWNrLCBvcHRfdnN5bmMpIHtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshLi9zZXJ2aWNlL3ZzeW5jLWltcGwuVnN5bmN9ICovXG4gICAgdGhpcy52c3luY18gPSBvcHRfdnN5bmMgfHwgU2VydmljZXMudnN5bmNGb3Ioc2VsZik7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshTm9kZX0gKi9cbiAgICB0aGlzLmNvbnRleHROb2RlXyA9IGNvbnRleHROb2RlO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCAqL1xuICAgIHRoaXMuY2FsbGJhY2tfID0gY2FsbGJhY2s7XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLmxhc3RYXyA9IHN0YXJ0WDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMubGFzdFlfID0gc3RhcnRZO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy5tYXhWZWxvY2l0eVhfID0gdmVsb1g7XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLm1heFZlbG9jaXR5WV8gPSB2ZWxvWTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMudmVsb2NpdHlYXyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLnZlbG9jaXR5WV8gPSAwO1xuXG4gICAgY29uc3QgZGVmZXJyZWQgPSBuZXcgRGVmZXJyZWQoKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IVByb21pc2V9ICovXG4gICAgdGhpcy5wcm9taXNlXyA9IGRlZmVycmVkLnByb21pc2U7XG5cbiAgICAvKiogQHByaXZhdGUgeyFGdW5jdGlvbn0gKi9cbiAgICB0aGlzLnJlc29sdmVfID0gZGVmZXJyZWQucmVzb2x2ZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IUZ1bmN0aW9ufSAqL1xuICAgIHRoaXMucmVqZWN0XyA9IGRlZmVycmVkLnJlamVjdDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmNvbnRpbnVpbmdfID0gZmFsc2U7XG4gIH1cblxuICAvKiogKi9cbiAgc3RhcnQoKSB7XG4gICAgdGhpcy5jb250aW51aW5nXyA9IHRydWU7XG4gICAgaWYgKFxuICAgICAgTWF0aC5hYnModGhpcy5tYXhWZWxvY2l0eVhfKSA8PSBNSU5fVkVMT0NJVFlfICYmXG4gICAgICBNYXRoLmFicyh0aGlzLm1heFZlbG9jaXR5WV8pIDw9IE1JTl9WRUxPQ0lUWV9cbiAgICApIHtcbiAgICAgIHRoaXMuZmlyZU1vdmVfKCk7XG4gICAgICB0aGlzLmNvbXBsZXRlQ29udGludWVfKHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJ1bkNvbnRpbnVpbmdfKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbHRzIHRoZSBtb3Rpb24uIFRoZSBtb3Rpb24gcHJvbWlzZSB3aWxsIGJlIHJlamVjdGVkIHNpbmNlIHRoZSBtb3Rpb25cbiAgICogaGFzIGJlZW4gaW50ZXJydXB0ZWQuXG4gICAqL1xuICBoYWx0KCkge1xuICAgIGlmICh0aGlzLmNvbnRpbnVpbmdfKSB7XG4gICAgICB0aGlzLmNvbXBsZXRlQ29udGludWVfKGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hhaW5zIHRvIHRoZSBtb3Rpb24ncyBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIHdoZW4gdGhlIG1vdGlvbiBoYXNcbiAgICogY29tcGxldGVkIG9yIHdpbGwgcmVqZWN0IGlmIG1vdGlvbiBoYXMgZmFpbGVkIG9yIHdhcyBpbnRlcnJ1cHRlZC5cbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICB0aGVuKG9wdF9yZXNvbHZlLCBvcHRfcmVqZWN0KSB7XG4gICAgaWYgKCFvcHRfcmVzb2x2ZSAmJiAhb3B0X3JlamVjdCkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvbWlzZV87XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnByb21pc2VfLnRoZW4ob3B0X3Jlc29sdmUsIG9wdF9yZWplY3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIGZvciByZWdhcmRsZXNzIHdoZXRoZXIgdGhlIG1vdGlvbiBzdWNjZWVkcyBvciBmYWlscy5cbiAgICogQHBhcmFtIHtmdW5jdGlvbigpPX0gb3B0X2NhbGxiYWNrXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKi9cbiAgdGhlbkFsd2F5cyhvcHRfY2FsbGJhY2spIHtcbiAgICBjb25zdCBjYWxsYmFjayA9IG9wdF9jYWxsYmFjayB8fCBOT09QX0NBTExCQUNLXztcbiAgICByZXR1cm4gLyoqIEB0eXBlIHshUHJvbWlzZX0gKi8gKHRoaXMudGhlbihjYWxsYmFjaywgY2FsbGJhY2spKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHJ1bkNvbnRpbnVpbmdfKCkge1xuICAgIHRoaXMudmVsb2NpdHlYXyA9IHRoaXMubWF4VmVsb2NpdHlYXztcbiAgICB0aGlzLnZlbG9jaXR5WV8gPSB0aGlzLm1heFZlbG9jaXR5WV87XG4gICAgY29uc3QgYm91bmRTdGVwID0gdGhpcy5zdGVwQ29udGludWVfLmJpbmQodGhpcyk7XG4gICAgY29uc3QgYm91bmRDb21wbGV0ZSA9IHRoaXMuY29tcGxldGVDb250aW51ZV8uYmluZCh0aGlzLCB0cnVlKTtcbiAgICByZXR1cm4gdGhpcy52c3luY19cbiAgICAgIC5ydW5BbmltTXV0YXRlU2VyaWVzKHRoaXMuY29udGV4dE5vZGVfLCBib3VuZFN0ZXAsIDUwMDApXG4gICAgICAudGhlbihib3VuZENvbXBsZXRlLCBib3VuZENvbXBsZXRlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIFwidHJ1ZVwiIHRvIGNvbnRpbnVlIGFuZCBcImZhbHNlXCIgdG8gc3RvcCBtb3Rpb24gcHJvY2Vzcy5cbiAgICogQHBhcmFtIHt0aW1lfSB0aW1lU2luY2VTdGFydFxuICAgKiBAcGFyYW0ge3RpbWV9IHRpbWVTaW5jZVByZXZcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHN0ZXBDb250aW51ZV8odGltZVNpbmNlU3RhcnQsIHRpbWVTaW5jZVByZXYpIHtcbiAgICBpZiAoIXRoaXMuY29udGludWluZ18pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLmxhc3RYXyArPSB0aW1lU2luY2VQcmV2ICogdGhpcy52ZWxvY2l0eVhfO1xuICAgIHRoaXMubGFzdFlfICs9IHRpbWVTaW5jZVByZXYgKiB0aGlzLnZlbG9jaXR5WV87XG4gICAgaWYgKCF0aGlzLmZpcmVNb3ZlXygpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgZGVjZWwgPSBNYXRoLmV4cCgtdGltZVNpbmNlU3RhcnQgLyBFWFBfRlJBTUVfQ09OU1RfKTtcbiAgICB0aGlzLnZlbG9jaXR5WF8gPSB0aGlzLm1heFZlbG9jaXR5WF8gKiBkZWNlbDtcbiAgICB0aGlzLnZlbG9jaXR5WV8gPSB0aGlzLm1heFZlbG9jaXR5WV8gKiBkZWNlbDtcbiAgICByZXR1cm4gKFxuICAgICAgTWF0aC5hYnModGhpcy52ZWxvY2l0eVhfKSA+IE1JTl9WRUxPQ0lUWV8gfHxcbiAgICAgIE1hdGguYWJzKHRoaXMudmVsb2NpdHlZXykgPiBNSU5fVkVMT0NJVFlfXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHN1Y2Nlc3NcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNvbXBsZXRlQ29udGludWVfKHN1Y2Nlc3MpIHtcbiAgICBpZiAoIXRoaXMuY29udGludWluZ18pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5jb250aW51aW5nXyA9IGZhbHNlO1xuICAgIHRoaXMuZmlyZU1vdmVfKCk7XG4gICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgIHRoaXMucmVzb2x2ZV8oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZWplY3RfKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGZpcmVNb3ZlXygpIHtcbiAgICByZXR1cm4gdGhpcy5jYWxsYmFja18odGhpcy5sYXN0WF8sIHRoaXMubGFzdFlfKTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/src/motion.js