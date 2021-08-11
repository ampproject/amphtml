function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import { throttle } from "../core/types/function";

/**
 * Applies scroll and momentum to window by using touch events.
 *
 * It works using the following principles:
 *
 * On touchstart: (Re)set coordinates and timer. If user swiped while still
 *                scrolling, increase multiplier for scrolling offset.
 * On touchmove: Scroll 1:1 and calculate distance (deltaY) and acceleration of
 *               the touch movement.
 * On touchend: If meeting the momentum threshold, scroll by extra pixels
 *              (scrolling offset) by a pre-set duration using an easing fn.
 */
export var PageScroller = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function PageScroller(win) {_classCallCheck(this, PageScroller);
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Object} */
    this.touchEventState_ = {
      startY: 0,
      lastDelta: 0,
      touchStartTimeMs: null,
      touchEndTimeMs: null,
      touchMoveTimeMs: null };


    /** @private {!Object} */
    this.scrollState_ = {
      startY: 0,
      isRunning: false,
      acceleration: 1,
      speedLimit: 0.3,
      startTimeMs: null,
      maxTimeBetweenSwipesMs: 250,
      moveTimeThresholdMs: 100,
      durationMs: null,
      meetsDeltaYThreshold: false,
      deltaYThresholdPx: 5,
      deltaY: null,
      offsetThresholdPx: 30,
      offsetPx: null,
      multiplier: 1 };

  }

  /**
   * Reacts to onTouchStart events. (Re)sets coordinates and timer.
   * Applies multiplier if criteria is met or resets it.
   * @param {number} timeStamp
   * @param {number} startY
   */_createClass(PageScroller, [{ key: "onTouchStart", value:
    function onTouchStart(timeStamp, startY) {
      this.touchEventState_.startY = startY;
      this.touchEventState_.touchStartTimeMs = timeStamp;
      this.scrollState_.startY = this.win_. /*OK*/scrollY;

      if (
      this.scrollState_.isRunning &&
      this.touchEventState_.touchEndTimeMs -
      this.touchEventState_.touchStartTimeMs <
      this.scrollState_.maxTimeBetweenSwipesMs)
      {
        // User swiped while still scrolling, increase the multiplier for the
        // offset.
        this.scrollState_.multiplier += this.scrollState_.acceleration;
      } else {
        this.scrollState_.multiplier = 1;
      }

      this.scrollState_.isRunning = false;
    }

    /**
     * Reacts to onTouchMove events. Scrolls 1:1 if criteria is met. Calculates
     * distance (deltaY) and acceleration.
     * @param {number} timeStamp
     * @param {number} currentY
     */ }, { key: "onTouchMove", value:
    function onTouchMove(timeStamp, currentY) {
      this.scrollState_.acceleration = Math.abs(
      this.scrollState_.deltaY / (
      timeStamp - this.touchEventState_.touchMoveTimeMs));

      this.touchEventState_.touchMoveTimeMs = timeStamp;

      throttle(this.win_, this.thottledScroll_.bind(this, currentY), 50)();
    }

    /**
     * @param {number} currentY
     * @private
     */ }, { key: "thottledScroll_", value:
    function thottledScroll_(currentY) {
      this.scrollState_.deltaY = currentY - this.touchEventState_.startY;

      this.scrollState_.meetsDeltaYThreshold =
      Math.abs(this.scrollState_.deltaY) > this.scrollState_.deltaYThresholdPx;

      if (!this.scrollState_.meetsDeltaYThreshold) {
        return;
      }

      this.win_. /*OK*/scrollBy(0, -this.scrollState_.deltaY);
    }

    /**
     * Reacts to touchEnd events. Applies momentum scrolling if criteria is met.
     * @param {number} timeStamp
     */ }, { key: "onTouchEnd", value:
    function onTouchEnd(timeStamp) {var _this = this;
      this.touchEventState_.touchEndTimeMs = timeStamp;

      if (!this.scrollState_.meetsDeltaYThreshold) {
        return;
      }

      var timeFromLastTouchMove =
      this.touchEventState_.touchEndTimeMs -
      this.touchEventState_.touchMoveTimeMs;

      this.scrollState_.offsetPx = this.calculateOffset_();

      if (
      timeFromLastTouchMove < this.scrollState_.moveTimeThresholdMs &&
      Math.abs(this.scrollState_.offsetPx) > this.scrollState_.offsetThresholdPx)
      {
        // If timefromLastTouchMove is low enough and the offset is above the
        // threshold, (re)set the scroll parameters to include momentum.
        this.scrollState_.durationMs = this.win_. /*OK*/innerHeight * 1.2;
        this.scrollState_.isRunning = true;

        requestAnimationFrame(function (timestamp) {
          _this.scrollState_.startTimeMs = timestamp;
          _this.scrollState_.startY = _this.win_. /*OK*/scrollY;
          _this.scrollOnNextTick_(timestamp);
        });
      }

      this.scrollState_.multiplier = 1;
      this.touchEventState_.startY = 0;
      this.scrollState_.deltaY = 0;
    }

    /**
     * Calculates pixel offset and direction to be scrolled by getting current
     * acceleration and preset limits.
     * @private
     * @return {number}
     */ }, { key: "calculateOffset_", value:
    function calculateOffset_() {
      var maxOffset =
      this.win_. /*OK*/innerHeight * this.scrollState_.speedLimit;

      var offset =
      Math.pow(this.scrollState_.acceleration, 2) *
      this.win_. /*OK*/innerHeight;

      offset = Math.min(maxOffset, offset);

      offset *=
      this.scrollState_.deltaY > 0 ?
      -this.scrollState_.multiplier :
      this.scrollState_.multiplier;

      return offset;
    }

    /**
     * Calculates scrolling position at each frame. Stops once durationMs is met
     * or scrollState stops running.
     * @param {number} timeStamp
     * @private
     */ }, { key: "scrollOnNextTick_", value:
    function scrollOnNextTick_(timeStamp) {
      var runTime = timeStamp - this.scrollState_.startTimeMs;

      if (runTime > this.scrollState_.durationMs) {
        return;
      }

      var progress = this.easeOutQuartFn_(
      runTime / this.scrollState_.durationMs);


      var scrollDelta = progress * this.scrollState_.offsetPx;

      var scrollForThisTick = this.scrollState_.startY + scrollDelta;

      if (!this.scrollState_.isRunning) {
        cancelAnimationFrame(
        requestAnimationFrame(this.scrollOnNextTick_.bind(this)));

      } else {
        this.win_.scroll(0, scrollForThisTick);
        requestAnimationFrame(this.scrollOnNextTick_.bind(this));
      }
    }

    /**
     * Ease out quart function.
     * @param {number} pTimeElapsed Percentage of time elapsed.
     * @return {number} Percentage progress, value between 0 and 1.
     * @private
     */ }, { key: "easeOutQuartFn_", value:
    function easeOutQuartFn_(pTimeElapsed) {
      return 1 - --pTimeElapsed * pTimeElapsed * pTimeElapsed * pTimeElapsed;
    } }]);return PageScroller;}();
// /Users/mszylkowski/src/amphtml/src/amp-story-player/page-scroller.js