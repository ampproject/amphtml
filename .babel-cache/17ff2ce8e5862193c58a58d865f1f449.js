function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
  function PageScroller(win) {
    _classCallCheck(this, PageScroller);

    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Object} */
    this.touchEventState_ = {
      startY: 0,
      lastDelta: 0,
      touchStartTimeMs: null,
      touchEndTimeMs: null,
      touchMoveTimeMs: null
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
      multiplier: 1
    };
  }

  /**
   * Reacts to onTouchStart events. (Re)sets coordinates and timer.
   * Applies multiplier if criteria is met or resets it.
   * @param {number} timeStamp
   * @param {number} startY
   */
  _createClass(PageScroller, [{
    key: "onTouchStart",
    value: function onTouchStart(timeStamp, startY) {
      this.touchEventState_.startY = startY;
      this.touchEventState_.touchStartTimeMs = timeStamp;
      this.scrollState_.startY = this.win_.
      /*OK*/
      scrollY;

      if (this.scrollState_.isRunning && this.touchEventState_.touchEndTimeMs - this.touchEventState_.touchStartTimeMs < this.scrollState_.maxTimeBetweenSwipesMs) {
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

  }, {
    key: "onTouchMove",
    value: function onTouchMove(timeStamp, currentY) {
      this.scrollState_.acceleration = Math.abs(this.scrollState_.deltaY / (timeStamp - this.touchEventState_.touchMoveTimeMs));
      this.touchEventState_.touchMoveTimeMs = timeStamp;
      throttle(this.win_, this.thottledScroll_.bind(this, currentY), 50)();
    }
    /**
     * @param {number} currentY
     * @private
     */

  }, {
    key: "thottledScroll_",
    value: function thottledScroll_(currentY) {
      this.scrollState_.deltaY = currentY - this.touchEventState_.startY;
      this.scrollState_.meetsDeltaYThreshold = Math.abs(this.scrollState_.deltaY) > this.scrollState_.deltaYThresholdPx;

      if (!this.scrollState_.meetsDeltaYThreshold) {
        return;
      }

      this.win_.
      /*OK*/
      scrollBy(0, -this.scrollState_.deltaY);
    }
    /**
     * Reacts to touchEnd events. Applies momentum scrolling if criteria is met.
     * @param {number} timeStamp
     */

  }, {
    key: "onTouchEnd",
    value: function onTouchEnd(timeStamp) {
      var _this = this;

      this.touchEventState_.touchEndTimeMs = timeStamp;

      if (!this.scrollState_.meetsDeltaYThreshold) {
        return;
      }

      var timeFromLastTouchMove = this.touchEventState_.touchEndTimeMs - this.touchEventState_.touchMoveTimeMs;
      this.scrollState_.offsetPx = this.calculateOffset_();

      if (timeFromLastTouchMove < this.scrollState_.moveTimeThresholdMs && Math.abs(this.scrollState_.offsetPx) > this.scrollState_.offsetThresholdPx) {
        // If timefromLastTouchMove is low enough and the offset is above the
        // threshold, (re)set the scroll parameters to include momentum.
        this.scrollState_.durationMs = this.win_.
        /*OK*/
        innerHeight * 1.2;
        this.scrollState_.isRunning = true;
        requestAnimationFrame(function (timestamp) {
          _this.scrollState_.startTimeMs = timestamp;
          _this.scrollState_.startY = _this.win_.
          /*OK*/
          scrollY;

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
     */

  }, {
    key: "calculateOffset_",
    value: function calculateOffset_() {
      var maxOffset = this.win_.
      /*OK*/
      innerHeight * this.scrollState_.speedLimit;
      var offset = Math.pow(this.scrollState_.acceleration, 2) * this.win_.
      /*OK*/
      innerHeight;
      offset = Math.min(maxOffset, offset);
      offset *= this.scrollState_.deltaY > 0 ? -this.scrollState_.multiplier : this.scrollState_.multiplier;
      return offset;
    }
    /**
     * Calculates scrolling position at each frame. Stops once durationMs is met
     * or scrollState stops running.
     * @param {number} timeStamp
     * @private
     */

  }, {
    key: "scrollOnNextTick_",
    value: function scrollOnNextTick_(timeStamp) {
      var runTime = timeStamp - this.scrollState_.startTimeMs;

      if (runTime > this.scrollState_.durationMs) {
        return;
      }

      var progress = this.easeOutQuartFn_(runTime / this.scrollState_.durationMs);
      var scrollDelta = progress * this.scrollState_.offsetPx;
      var scrollForThisTick = this.scrollState_.startY + scrollDelta;

      if (!this.scrollState_.isRunning) {
        cancelAnimationFrame(requestAnimationFrame(this.scrollOnNextTick_.bind(this)));
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

  }, {
    key: "easeOutQuartFn_",
    value: function easeOutQuartFn_(pTimeElapsed) {
      return 1 - --pTimeElapsed * pTimeElapsed * pTimeElapsed * pTimeElapsed;
    }
  }]);

  return PageScroller;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhZ2Utc2Nyb2xsZXIuanMiXSwibmFtZXMiOlsidGhyb3R0bGUiLCJQYWdlU2Nyb2xsZXIiLCJ3aW4iLCJ3aW5fIiwidG91Y2hFdmVudFN0YXRlXyIsInN0YXJ0WSIsImxhc3REZWx0YSIsInRvdWNoU3RhcnRUaW1lTXMiLCJ0b3VjaEVuZFRpbWVNcyIsInRvdWNoTW92ZVRpbWVNcyIsInNjcm9sbFN0YXRlXyIsImlzUnVubmluZyIsImFjY2VsZXJhdGlvbiIsInNwZWVkTGltaXQiLCJzdGFydFRpbWVNcyIsIm1heFRpbWVCZXR3ZWVuU3dpcGVzTXMiLCJtb3ZlVGltZVRocmVzaG9sZE1zIiwiZHVyYXRpb25NcyIsIm1lZXRzRGVsdGFZVGhyZXNob2xkIiwiZGVsdGFZVGhyZXNob2xkUHgiLCJkZWx0YVkiLCJvZmZzZXRUaHJlc2hvbGRQeCIsIm9mZnNldFB4IiwibXVsdGlwbGllciIsInRpbWVTdGFtcCIsInNjcm9sbFkiLCJjdXJyZW50WSIsIk1hdGgiLCJhYnMiLCJ0aG90dGxlZFNjcm9sbF8iLCJiaW5kIiwic2Nyb2xsQnkiLCJ0aW1lRnJvbUxhc3RUb3VjaE1vdmUiLCJjYWxjdWxhdGVPZmZzZXRfIiwiaW5uZXJIZWlnaHQiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJ0aW1lc3RhbXAiLCJzY3JvbGxPbk5leHRUaWNrXyIsIm1heE9mZnNldCIsIm9mZnNldCIsInBvdyIsIm1pbiIsInJ1blRpbWUiLCJwcm9ncmVzcyIsImVhc2VPdXRRdWFydEZuXyIsInNjcm9sbERlbHRhIiwic2Nyb2xsRm9yVGhpc1RpY2siLCJjYW5jZWxBbmltYXRpb25GcmFtZSIsInNjcm9sbCIsInBUaW1lRWxhcHNlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsUUFBUjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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T0FBTyxHQUFHbEIsU0FBUyxHQUFHLEtBQUtkLFlBQUwsQ0FBa0JJLFdBQTlDOztBQUVBLFVBQUk0QixPQUFPLEdBQUcsS0FBS2hDLFlBQUwsQ0FBa0JPLFVBQWhDLEVBQTRDO0FBQzFDO0FBQ0Q7O0FBRUQsVUFBTTBCLFFBQVEsR0FBRyxLQUFLQyxlQUFMLENBQ2ZGLE9BQU8sR0FBRyxLQUFLaEMsWUFBTCxDQUFrQk8sVUFEYixDQUFqQjtBQUlBLFVBQU00QixXQUFXLEdBQUdGLFFBQVEsR0FBRyxLQUFLakMsWUFBTCxDQUFrQlksUUFBakQ7QUFFQSxVQUFNd0IsaUJBQWlCLEdBQUcsS0FBS3BDLFlBQUwsQ0FBa0JMLE1BQWxCLEdBQTJCd0MsV0FBckQ7O0FBRUEsVUFBSSxDQUFDLEtBQUtuQyxZQUFMLENBQWtCQyxTQUF2QixFQUFrQztBQUNoQ29DLFFBQUFBLG9CQUFvQixDQUNsQloscUJBQXFCLENBQUMsS0FBS0UsaUJBQUwsQ0FBdUJQLElBQXZCLENBQTRCLElBQTVCLENBQUQsQ0FESCxDQUFwQjtBQUdELE9BSkQsTUFJTztBQUNMLGFBQUszQixJQUFMLENBQVU2QyxNQUFWLENBQWlCLENBQWpCLEVBQW9CRixpQkFBcEI7QUFDQVgsUUFBQUEscUJBQXFCLENBQUMsS0FBS0UsaUJBQUwsQ0FBdUJQLElBQXZCLENBQTRCLElBQTVCLENBQUQsQ0FBckI7QUFDRDtBQUNGO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWxNQTtBQUFBO0FBQUEsV0FtTUUseUJBQWdCbUIsWUFBaEIsRUFBOEI7QUFDNUIsYUFBTyxJQUFJLEVBQUVBLFlBQUYsR0FBaUJBLFlBQWpCLEdBQWdDQSxZQUFoQyxHQUErQ0EsWUFBMUQ7QUFDRDtBQXJNSDs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAyMCBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7dGhyb3R0bGV9IGZyb20gJyNjb3JlL3R5cGVzL2Z1bmN0aW9uJztcblxuLyoqXG4gKiBBcHBsaWVzIHNjcm9sbCBhbmQgbW9tZW50dW0gdG8gd2luZG93IGJ5IHVzaW5nIHRvdWNoIGV2ZW50cy5cbiAqXG4gKiBJdCB3b3JrcyB1c2luZyB0aGUgZm9sbG93aW5nIHByaW5jaXBsZXM6XG4gKlxuICogT24gdG91Y2hzdGFydDogKFJlKXNldCBjb29yZGluYXRlcyBhbmQgdGltZXIuIElmIHVzZXIgc3dpcGVkIHdoaWxlIHN0aWxsXG4gKiAgICAgICAgICAgICAgICBzY3JvbGxpbmcsIGluY3JlYXNlIG11bHRpcGxpZXIgZm9yIHNjcm9sbGluZyBvZmZzZXQuXG4gKiBPbiB0b3VjaG1vdmU6IFNjcm9sbCAxOjEgYW5kIGNhbGN1bGF0ZSBkaXN0YW5jZSAoZGVsdGFZKSBhbmQgYWNjZWxlcmF0aW9uIG9mXG4gKiAgICAgICAgICAgICAgIHRoZSB0b3VjaCBtb3ZlbWVudC5cbiAqIE9uIHRvdWNoZW5kOiBJZiBtZWV0aW5nIHRoZSBtb21lbnR1bSB0aHJlc2hvbGQsIHNjcm9sbCBieSBleHRyYSBwaXhlbHNcbiAqICAgICAgICAgICAgICAoc2Nyb2xsaW5nIG9mZnNldCkgYnkgYSBwcmUtc2V0IGR1cmF0aW9uIHVzaW5nIGFuIGVhc2luZyBmbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFBhZ2VTY3JvbGxlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKi9cbiAgY29uc3RydWN0b3Iod2luKSB7XG4gICAgLyoqIEBwcml2YXRlIHshV2luZG93fSAqL1xuICAgIHRoaXMud2luXyA9IHdpbjtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IU9iamVjdH0gKi9cbiAgICB0aGlzLnRvdWNoRXZlbnRTdGF0ZV8gPSB7XG4gICAgICBzdGFydFk6IDAsXG4gICAgICBsYXN0RGVsdGE6IDAsXG4gICAgICB0b3VjaFN0YXJ0VGltZU1zOiBudWxsLFxuICAgICAgdG91Y2hFbmRUaW1lTXM6IG51bGwsXG4gICAgICB0b3VjaE1vdmVUaW1lTXM6IG51bGwsXG4gICAgfTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IU9iamVjdH0gKi9cbiAgICB0aGlzLnNjcm9sbFN0YXRlXyA9IHtcbiAgICAgIHN0YXJ0WTogMCxcbiAgICAgIGlzUnVubmluZzogZmFsc2UsXG4gICAgICBhY2NlbGVyYXRpb246IDEsXG4gICAgICBzcGVlZExpbWl0OiAwLjMsXG4gICAgICBzdGFydFRpbWVNczogbnVsbCxcbiAgICAgIG1heFRpbWVCZXR3ZWVuU3dpcGVzTXM6IDI1MCxcbiAgICAgIG1vdmVUaW1lVGhyZXNob2xkTXM6IDEwMCxcbiAgICAgIGR1cmF0aW9uTXM6IG51bGwsXG4gICAgICBtZWV0c0RlbHRhWVRocmVzaG9sZDogZmFsc2UsXG4gICAgICBkZWx0YVlUaHJlc2hvbGRQeDogNSxcbiAgICAgIGRlbHRhWTogbnVsbCxcbiAgICAgIG9mZnNldFRocmVzaG9sZFB4OiAzMCxcbiAgICAgIG9mZnNldFB4OiBudWxsLFxuICAgICAgbXVsdGlwbGllcjogMSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0cyB0byBvblRvdWNoU3RhcnQgZXZlbnRzLiAoUmUpc2V0cyBjb29yZGluYXRlcyBhbmQgdGltZXIuXG4gICAqIEFwcGxpZXMgbXVsdGlwbGllciBpZiBjcml0ZXJpYSBpcyBtZXQgb3IgcmVzZXRzIGl0LlxuICAgKiBAcGFyYW0ge251bWJlcn0gdGltZVN0YW1wXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydFlcbiAgICovXG4gIG9uVG91Y2hTdGFydCh0aW1lU3RhbXAsIHN0YXJ0WSkge1xuICAgIHRoaXMudG91Y2hFdmVudFN0YXRlXy5zdGFydFkgPSBzdGFydFk7XG4gICAgdGhpcy50b3VjaEV2ZW50U3RhdGVfLnRvdWNoU3RhcnRUaW1lTXMgPSB0aW1lU3RhbXA7XG4gICAgdGhpcy5zY3JvbGxTdGF0ZV8uc3RhcnRZID0gdGhpcy53aW5fLi8qT0sqLyBzY3JvbGxZO1xuXG4gICAgaWYgKFxuICAgICAgdGhpcy5zY3JvbGxTdGF0ZV8uaXNSdW5uaW5nICYmXG4gICAgICB0aGlzLnRvdWNoRXZlbnRTdGF0ZV8udG91Y2hFbmRUaW1lTXMgLVxuICAgICAgICB0aGlzLnRvdWNoRXZlbnRTdGF0ZV8udG91Y2hTdGFydFRpbWVNcyA8XG4gICAgICAgIHRoaXMuc2Nyb2xsU3RhdGVfLm1heFRpbWVCZXR3ZWVuU3dpcGVzTXNcbiAgICApIHtcbiAgICAgIC8vIFVzZXIgc3dpcGVkIHdoaWxlIHN0aWxsIHNjcm9sbGluZywgaW5jcmVhc2UgdGhlIG11bHRpcGxpZXIgZm9yIHRoZVxuICAgICAgLy8gb2Zmc2V0LlxuICAgICAgdGhpcy5zY3JvbGxTdGF0ZV8ubXVsdGlwbGllciArPSB0aGlzLnNjcm9sbFN0YXRlXy5hY2NlbGVyYXRpb247XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2Nyb2xsU3RhdGVfLm11bHRpcGxpZXIgPSAxO1xuICAgIH1cblxuICAgIHRoaXMuc2Nyb2xsU3RhdGVfLmlzUnVubmluZyA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0cyB0byBvblRvdWNoTW92ZSBldmVudHMuIFNjcm9sbHMgMToxIGlmIGNyaXRlcmlhIGlzIG1ldC4gQ2FsY3VsYXRlc1xuICAgKiBkaXN0YW5jZSAoZGVsdGFZKSBhbmQgYWNjZWxlcmF0aW9uLlxuICAgKiBAcGFyYW0ge251bWJlcn0gdGltZVN0YW1wXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjdXJyZW50WVxuICAgKi9cbiAgb25Ub3VjaE1vdmUodGltZVN0YW1wLCBjdXJyZW50WSkge1xuICAgIHRoaXMuc2Nyb2xsU3RhdGVfLmFjY2VsZXJhdGlvbiA9IE1hdGguYWJzKFxuICAgICAgdGhpcy5zY3JvbGxTdGF0ZV8uZGVsdGFZIC9cbiAgICAgICAgKHRpbWVTdGFtcCAtIHRoaXMudG91Y2hFdmVudFN0YXRlXy50b3VjaE1vdmVUaW1lTXMpXG4gICAgKTtcbiAgICB0aGlzLnRvdWNoRXZlbnRTdGF0ZV8udG91Y2hNb3ZlVGltZU1zID0gdGltZVN0YW1wO1xuXG4gICAgdGhyb3R0bGUodGhpcy53aW5fLCB0aGlzLnRob3R0bGVkU2Nyb2xsXy5iaW5kKHRoaXMsIGN1cnJlbnRZKSwgNTApKCk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IGN1cnJlbnRZXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB0aG90dGxlZFNjcm9sbF8oY3VycmVudFkpIHtcbiAgICB0aGlzLnNjcm9sbFN0YXRlXy5kZWx0YVkgPSBjdXJyZW50WSAtIHRoaXMudG91Y2hFdmVudFN0YXRlXy5zdGFydFk7XG5cbiAgICB0aGlzLnNjcm9sbFN0YXRlXy5tZWV0c0RlbHRhWVRocmVzaG9sZCA9XG4gICAgICBNYXRoLmFicyh0aGlzLnNjcm9sbFN0YXRlXy5kZWx0YVkpID4gdGhpcy5zY3JvbGxTdGF0ZV8uZGVsdGFZVGhyZXNob2xkUHg7XG5cbiAgICBpZiAoIXRoaXMuc2Nyb2xsU3RhdGVfLm1lZXRzRGVsdGFZVGhyZXNob2xkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy53aW5fLi8qT0sqLyBzY3JvbGxCeSgwLCAtdGhpcy5zY3JvbGxTdGF0ZV8uZGVsdGFZKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFjdHMgdG8gdG91Y2hFbmQgZXZlbnRzLiBBcHBsaWVzIG1vbWVudHVtIHNjcm9sbGluZyBpZiBjcml0ZXJpYSBpcyBtZXQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lU3RhbXBcbiAgICovXG4gIG9uVG91Y2hFbmQodGltZVN0YW1wKSB7XG4gICAgdGhpcy50b3VjaEV2ZW50U3RhdGVfLnRvdWNoRW5kVGltZU1zID0gdGltZVN0YW1wO1xuXG4gICAgaWYgKCF0aGlzLnNjcm9sbFN0YXRlXy5tZWV0c0RlbHRhWVRocmVzaG9sZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRpbWVGcm9tTGFzdFRvdWNoTW92ZSA9XG4gICAgICB0aGlzLnRvdWNoRXZlbnRTdGF0ZV8udG91Y2hFbmRUaW1lTXMgLVxuICAgICAgdGhpcy50b3VjaEV2ZW50U3RhdGVfLnRvdWNoTW92ZVRpbWVNcztcblxuICAgIHRoaXMuc2Nyb2xsU3RhdGVfLm9mZnNldFB4ID0gdGhpcy5jYWxjdWxhdGVPZmZzZXRfKCk7XG5cbiAgICBpZiAoXG4gICAgICB0aW1lRnJvbUxhc3RUb3VjaE1vdmUgPCB0aGlzLnNjcm9sbFN0YXRlXy5tb3ZlVGltZVRocmVzaG9sZE1zICYmXG4gICAgICBNYXRoLmFicyh0aGlzLnNjcm9sbFN0YXRlXy5vZmZzZXRQeCkgPiB0aGlzLnNjcm9sbFN0YXRlXy5vZmZzZXRUaHJlc2hvbGRQeFxuICAgICkge1xuICAgICAgLy8gSWYgdGltZWZyb21MYXN0VG91Y2hNb3ZlIGlzIGxvdyBlbm91Z2ggYW5kIHRoZSBvZmZzZXQgaXMgYWJvdmUgdGhlXG4gICAgICAvLyB0aHJlc2hvbGQsIChyZSlzZXQgdGhlIHNjcm9sbCBwYXJhbWV0ZXJzIHRvIGluY2x1ZGUgbW9tZW50dW0uXG4gICAgICB0aGlzLnNjcm9sbFN0YXRlXy5kdXJhdGlvbk1zID0gdGhpcy53aW5fLi8qT0sqLyBpbm5lckhlaWdodCAqIDEuMjtcbiAgICAgIHRoaXMuc2Nyb2xsU3RhdGVfLmlzUnVubmluZyA9IHRydWU7XG5cbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgodGltZXN0YW1wKSA9PiB7XG4gICAgICAgIHRoaXMuc2Nyb2xsU3RhdGVfLnN0YXJ0VGltZU1zID0gdGltZXN0YW1wO1xuICAgICAgICB0aGlzLnNjcm9sbFN0YXRlXy5zdGFydFkgPSB0aGlzLndpbl8uLypPSyovIHNjcm9sbFk7XG4gICAgICAgIHRoaXMuc2Nyb2xsT25OZXh0VGlja18odGltZXN0YW1wKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuc2Nyb2xsU3RhdGVfLm11bHRpcGxpZXIgPSAxO1xuICAgIHRoaXMudG91Y2hFdmVudFN0YXRlXy5zdGFydFkgPSAwO1xuICAgIHRoaXMuc2Nyb2xsU3RhdGVfLmRlbHRhWSA9IDA7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlcyBwaXhlbCBvZmZzZXQgYW5kIGRpcmVjdGlvbiB0byBiZSBzY3JvbGxlZCBieSBnZXR0aW5nIGN1cnJlbnRcbiAgICogYWNjZWxlcmF0aW9uIGFuZCBwcmVzZXQgbGltaXRzLlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqL1xuICBjYWxjdWxhdGVPZmZzZXRfKCkge1xuICAgIGNvbnN0IG1heE9mZnNldCA9XG4gICAgICB0aGlzLndpbl8uLypPSyovIGlubmVySGVpZ2h0ICogdGhpcy5zY3JvbGxTdGF0ZV8uc3BlZWRMaW1pdDtcblxuICAgIGxldCBvZmZzZXQgPVxuICAgICAgTWF0aC5wb3codGhpcy5zY3JvbGxTdGF0ZV8uYWNjZWxlcmF0aW9uLCAyKSAqXG4gICAgICB0aGlzLndpbl8uLypPSyovIGlubmVySGVpZ2h0O1xuXG4gICAgb2Zmc2V0ID0gTWF0aC5taW4obWF4T2Zmc2V0LCBvZmZzZXQpO1xuXG4gICAgb2Zmc2V0ICo9XG4gICAgICB0aGlzLnNjcm9sbFN0YXRlXy5kZWx0YVkgPiAwXG4gICAgICAgID8gLXRoaXMuc2Nyb2xsU3RhdGVfLm11bHRpcGxpZXJcbiAgICAgICAgOiB0aGlzLnNjcm9sbFN0YXRlXy5tdWx0aXBsaWVyO1xuXG4gICAgcmV0dXJuIG9mZnNldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGVzIHNjcm9sbGluZyBwb3NpdGlvbiBhdCBlYWNoIGZyYW1lLiBTdG9wcyBvbmNlIGR1cmF0aW9uTXMgaXMgbWV0XG4gICAqIG9yIHNjcm9sbFN0YXRlIHN0b3BzIHJ1bm5pbmcuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lU3RhbXBcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHNjcm9sbE9uTmV4dFRpY2tfKHRpbWVTdGFtcCkge1xuICAgIGNvbnN0IHJ1blRpbWUgPSB0aW1lU3RhbXAgLSB0aGlzLnNjcm9sbFN0YXRlXy5zdGFydFRpbWVNcztcblxuICAgIGlmIChydW5UaW1lID4gdGhpcy5zY3JvbGxTdGF0ZV8uZHVyYXRpb25Ncykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHByb2dyZXNzID0gdGhpcy5lYXNlT3V0UXVhcnRGbl8oXG4gICAgICBydW5UaW1lIC8gdGhpcy5zY3JvbGxTdGF0ZV8uZHVyYXRpb25Nc1xuICAgICk7XG5cbiAgICBjb25zdCBzY3JvbGxEZWx0YSA9IHByb2dyZXNzICogdGhpcy5zY3JvbGxTdGF0ZV8ub2Zmc2V0UHg7XG5cbiAgICBjb25zdCBzY3JvbGxGb3JUaGlzVGljayA9IHRoaXMuc2Nyb2xsU3RhdGVfLnN0YXJ0WSArIHNjcm9sbERlbHRhO1xuXG4gICAgaWYgKCF0aGlzLnNjcm9sbFN0YXRlXy5pc1J1bm5pbmcpIHtcbiAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKFxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5zY3JvbGxPbk5leHRUaWNrXy5iaW5kKHRoaXMpKVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy53aW5fLnNjcm9sbCgwLCBzY3JvbGxGb3JUaGlzVGljayk7XG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5zY3JvbGxPbk5leHRUaWNrXy5iaW5kKHRoaXMpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRWFzZSBvdXQgcXVhcnQgZnVuY3Rpb24uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwVGltZUVsYXBzZWQgUGVyY2VudGFnZSBvZiB0aW1lIGVsYXBzZWQuXG4gICAqIEByZXR1cm4ge251bWJlcn0gUGVyY2VudGFnZSBwcm9ncmVzcywgdmFsdWUgYmV0d2VlbiAwIGFuZCAxLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZWFzZU91dFF1YXJ0Rm5fKHBUaW1lRWxhcHNlZCkge1xuICAgIHJldHVybiAxIC0gLS1wVGltZUVsYXBzZWQgKiBwVGltZUVsYXBzZWQgKiBwVGltZUVsYXBzZWQgKiBwVGltZUVsYXBzZWQ7XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/amp-story-player/page-scroller.js