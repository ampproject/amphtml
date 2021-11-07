import {throttle} from '#core/types/function';

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
      multiplier: 1,
    };
  }

  /**
   * Reacts to onTouchStart events. (Re)sets coordinates and timer.
   * Applies multiplier if criteria is met or resets it.
   * @param {number} timeStamp
   * @param {number} startY
   */
  onTouchStart(timeStamp, startY) {
    this.touchEventState_.startY = startY;
    this.touchEventState_.touchStartTimeMs = timeStamp;
    this.scrollState_.startY = this.win_./*OK*/ scrollY;

    if (
      this.scrollState_.isRunning &&
      this.touchEventState_.touchEndTimeMs -
        this.touchEventState_.touchStartTimeMs <
        this.scrollState_.maxTimeBetweenSwipesMs
    ) {
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
   */
  onTouchMove(timeStamp, currentY) {
    this.scrollState_.acceleration = Math.abs(
      this.scrollState_.deltaY /
        (timeStamp - this.touchEventState_.touchMoveTimeMs)
    );
    this.touchEventState_.touchMoveTimeMs = timeStamp;

    throttle(this.win_, this.thottledScroll_.bind(this, currentY), 50)();
  }

  /**
   * @param {number} currentY
   * @private
   */
  thottledScroll_(currentY) {
    this.scrollState_.deltaY = currentY - this.touchEventState_.startY;

    this.scrollState_.meetsDeltaYThreshold =
      Math.abs(this.scrollState_.deltaY) > this.scrollState_.deltaYThresholdPx;

    if (!this.scrollState_.meetsDeltaYThreshold) {
      return;
    }

    this.win_./*OK*/ scrollBy(0, -this.scrollState_.deltaY);
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
      this.scrollState_.durationMs = this.win_./*OK*/ innerHeight * 1.2;
      this.scrollState_.isRunning = true;

      requestAnimationFrame((timestamp) => {
        this.scrollState_.startTimeMs = timestamp;
        this.scrollState_.startY = this.win_./*OK*/ scrollY;
        this.scrollOnNextTick_(timestamp);
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
   */
  calculateOffset_() {
    const maxOffset =
      this.win_./*OK*/ innerHeight * this.scrollState_.speedLimit;

    let offset =
      Math.pow(this.scrollState_.acceleration, 2) *
      this.win_./*OK*/ innerHeight;

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

    const progress = this.easeOutQuartFn_(
      runTime / this.scrollState_.durationMs
    );

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
   * Ease out quart function.
   * @param {number} pTimeElapsed Percentage of time elapsed.
   * @return {number} Percentage progress, value between 0 and 1.
   * @private
   */
  easeOutQuartFn_(pTimeElapsed) {
    return 1 - --pTimeElapsed * pTimeElapsed * pTimeElapsed * pTimeElapsed;
  }
}
