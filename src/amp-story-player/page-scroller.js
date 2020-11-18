/**
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

/**
 * Applies scroll and momentum to window by using touch events.
 */
export class PageScroller {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Object} */
    this.touchEventState_ = {
      startY: 0,
      lastDelta: 0,
      touchStartTimeMs: null,
      touchEndTimeMs: null,
      touchMoveTimeMs: null,
    };

    /** @private {!Object} */
    this.scrollState_ = {
      startY: 0,
      isRunning: false,
      acceleration: 1,
      speedLimit: 1.2,
      startTimeMs: null,
      maxTimeBetweenSwipesMs: 250,
      moveTimeThresholdMs: 100,
      durationMs: null,
      meetsDeltaYThreshold: false,
      deltaYThresholdPx: 5,
      deltaY: null,
      offsetThresholdPx: 30,
      offsetPx: null,
      multiplier: 1,
    };
  }

  /**
   * Reacts to onTouchStart events. Applies multiplier if criteria is met.
   * @param {number} timeStamp
   * @param {number} startY
   */
  onTouchStart(timeStamp, startY) {
    this.touchEventState_.startY = startY;
    this.touchEventState_.touchStartTimeMs = timeStamp;
    this.scrollState_.startY = this.win_.scrollY;

    if (
      this.scrollState_.isRunning &&
      this.touchEventState_.touchEndTimeMs -
        this.touchEventState_.touchStartTimeMs <
        this.scrollState_.maxTimeBetweenSwipesMs
    ) {
      // User swiped while still scrolling, increase the multiplier for the offset.
      this.scrollState_.multiplier += this.scrollState_.acceleration;
    } else {
      this.scrollState_.multiplier = 1;
    }

    this.scrollState_.isRunning = false;
  }

  /**
   * Reacts to onTouchMove events. Scrolls 1:1 if criteria is met.
   * @param {number} timeStamp
   * @param {number} currentY
   */
  onTouchMove(timeStamp, currentY) {
    this.touchEventState_.touchMoveTimeMs = timeStamp;
    currentY += this.scrollState_.deltaY;
    this.scrollState_.deltaY = currentY - this.touchEventState_.startY;

    this.scrollState_.meetsDeltaYThreshold =
      Math.abs(this.scrollState_.deltaY) > this.scrollState_.deltaYThresholdPx;

    if (!this.scrollState_.meetsDeltaYThreshold) {
      return;
    }

    this.scrollState_.acceleration = Math.abs(
      this.scrollState_.deltaY /
        (this.touchEventState_.touchMoveTimeMs -
          this.touchEventState_.touchStartTimeMs)
    );

    this.win_.scroll(0, this.scrollState_.startY - this.scrollState_.deltaY);
  }

  /**
   * Reacts to touchEnd events. Applies momentum scrolling if criteria is met.
   * @param {number} timeStamp
   */
  onTouchEnd(timeStamp) {
    this.touchEventState_.touchEndTimeMs = timeStamp;

    if (!this.scrollState_.meetsDeltaYThreshold) {
      return;
    }

    const timeFromLastTouchMove =
      this.touchEventState_.touchEndTimeMs -
      this.touchEventState_.touchMoveTimeMs;

    this.scrollState_.offsetPx = this.calculateOffset_();

    if (
      timeFromLastTouchMove < this.scrollState_.moveTimeThresholdMs &&
      Math.abs(this.scrollState_.offsetPx) > this.scrollState_.offsetThresholdPx
    ) {
      // If timefromLastTouchMove is low enough and the offset is above the
      // threshold, (re)set the scroll parameters to include momentum.
      this.scrollState_.durationMs = this.win_.innerHeight * 1.2;
      this.scrollState_.isRunning = true;
      this.scrollState_.multiplier = 1;

      requestAnimationFrame((timestamp) => {
        this.scrollState_.startTimeMs = timestamp;
        this.scrollState_.startY = this.win_.scrollY;
        this.scrollOnNextTick_(timestamp);
      });
    }

    this.touchEventState_.startY = 0;
    this.scrollState_.deltaY = 0;
  }

  /**
   * Calculates pixel offset and direction to be scrolled by getting current
   * acceleration and preset limits.
   * @private
   * @return {number}
   */
  calculateOffset_() {
    const maxOffset = this.win_.innerHeight * this.scrollState_.speedLimit;

    let offset =
      Math.pow(this.scrollState_.acceleration, 2) * this.win_.innerHeight;

    offset = Math.min(maxOffset, offset);

    offset *=
      this.scrollState_.deltaY > 0
        ? -this.scrollState_.multiplier
        : this.scrollState_.multiplier;

    return offset;
  }

  /**
   * Calculates scrolling position at each frame. Stops once durationMs is met
   * or scrollState stops running.
   * @param {number} timeStamp
   * @private
   */
  scrollOnNextTick_(timeStamp) {
    const runTime = timeStamp - this.scrollState_.startTimeMs;

    if (runTime > this.scrollState_.durationMs) {
      return;
    }

    const percentageElapsed = runTime / this.scrollState_.durationMs;

    const progress = this.getScrollTo_({
      percentTimeElapsed: Math.min(percentageElapsed, 1),
      x1: 0.2,
      y1: 0.46,
      x2: 0.5,
      y2: 0.9,
    });

    const scrollDelta = progress * this.scrollState_.offsetPx;

    const scrollForThisTick = this.scrollState_.startY + scrollDelta;

    if (!this.scrollState_.isRunning) {
      cancelAnimationFrame(
        requestAnimationFrame(this.scrollOnNextTick_.bind(this))
      );
    } else {
      this.win_.scroll(0, scrollForThisTick);
      requestAnimationFrame(this.scrollOnNextTick_.bind(this));
    }
  }

  /**
   * Uses the cubic bezier function to return scrolling position given percent
   * of time elapsed and 2 points in the graph.
   * P0: (0, 0)
   * P1: (x1, y1)
   * P2: (x2, y2)
   * P3: (1, 1)
   * @param {!Object} cubicBezierParams
   * @return {number} percentage progress (value between 0 and 1).
   * @private
   */
  getScrollTo_({percentTimeElapsed, x1, y1, x2, y2}) {
    const B1 = (t) => {
      return Math.pow(t, 3);
    };

    const B2 = (t) => {
      return 3 * t * t * (1 - t);
    };

    const B3 = (t) => {
      return 3 * t * Math.pow(1 - t, 2);
    };

    const B4 = (t) => {
      return Math.pow(1 - t, 3);
    };

    return (
      1 -
      (x1 * B1(percentTimeElapsed) +
        y1 * B2(percentTimeElapsed) +
        x2 * B3(percentTimeElapsed) +
        y2 * B4(percentTimeElapsed))
    );
  }
}
