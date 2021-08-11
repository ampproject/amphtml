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

/** @const {number} */
var SCROLL_THROTTLE_MS = 500;

/**
 * Creates an IntersectionObserver or fallback using scroll events.
 * Fires viewportCb when criteria is met and unobserves immediately after.
 */
export var AmpStoryPlayerViewportObserver = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Element} element
   * @param {function():void} viewportCb
   */
  function AmpStoryPlayerViewportObserver(win, element, viewportCb) {
    _classCallCheck(this, AmpStoryPlayerViewportObserver);

    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Element} */
    this.element_ = element;

    /** @private {function():void} */
    this.cb_ = viewportCb;

    /** @private {?function():void} */
    this.scrollHandler_ = null;
    this.initializeInObOrFallback_();
  }

  /** @private */
  _createClass(AmpStoryPlayerViewportObserver, [{
    key: "initializeInObOrFallback_",
    value: function initializeInObOrFallback_() {
      if (!this.win_.IntersectionObserver || this.win_ !== this.win_.parent) {
        this.createInObFallback_();
        return;
      }

      this.createInOb_();
    }
    /**
     * Creates an IntersectionObserver.
     * @private
     */

  }, {
    key: "createInOb_",
    value: function createInOb_() {
      var _this = this;

      var inObCallback = function inObCallback(entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          _this.cb_();

          observer.unobserve(_this.element_);
        });
      };

      var observer = new this.win_.IntersectionObserver(inObCallback);
      observer.observe(this.element_);
    }
    /**
     * Fallback for when IntersectionObserver is not supported. Calls
     * layoutPlayer on the element when it is close to the viewport.
     * @private
     */

  }, {
    key: "createInObFallback_",
    value: function createInObFallback_() {
      this.scrollHandler_ = throttle(this.win_, this.checkIfVisibleFallback_.bind(this), SCROLL_THROTTLE_MS);
      this.win_.addEventListener('scroll', this.scrollHandler_);
      this.checkIfVisibleFallback_(this.element_);
    }
    /**
     * Checks if element is close to the viewport and calls the callback when it
     * is.
     * @private
     */

  }, {
    key: "checkIfVisibleFallback_",
    value: function checkIfVisibleFallback_() {
      var elTop = this.element_.
      /*OK*/
      getBoundingClientRect().top;
      var winInnerHeight = this.win_.
      /*OK*/
      innerHeight;

      if (winInnerHeight > elTop) {
        this.cb_();
        this.win_.removeEventListener('scroll', this.scrollHandler_);
      }
    }
  }]);

  return AmpStoryPlayerViewportObserver;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1wbGF5ZXItdmlld3BvcnQtb2JzZXJ2ZXIuanMiXSwibmFtZXMiOlsidGhyb3R0bGUiLCJTQ1JPTExfVEhST1RUTEVfTVMiLCJBbXBTdG9yeVBsYXllclZpZXdwb3J0T2JzZXJ2ZXIiLCJ3aW4iLCJlbGVtZW50Iiwidmlld3BvcnRDYiIsIndpbl8iLCJlbGVtZW50XyIsImNiXyIsInNjcm9sbEhhbmRsZXJfIiwiaW5pdGlhbGl6ZUluT2JPckZhbGxiYWNrXyIsIkludGVyc2VjdGlvbk9ic2VydmVyIiwicGFyZW50IiwiY3JlYXRlSW5PYkZhbGxiYWNrXyIsImNyZWF0ZUluT2JfIiwiaW5PYkNhbGxiYWNrIiwiZW50cmllcyIsImZvckVhY2giLCJlbnRyeSIsImlzSW50ZXJzZWN0aW5nIiwib2JzZXJ2ZXIiLCJ1bm9ic2VydmUiLCJvYnNlcnZlIiwiY2hlY2tJZlZpc2libGVGYWxsYmFja18iLCJiaW5kIiwiYWRkRXZlbnRMaXN0ZW5lciIsImVsVG9wIiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwidG9wIiwid2luSW5uZXJIZWlnaHQiLCJpbm5lckhlaWdodCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFFBQVI7O0FBRUE7QUFDQSxJQUFNQyxrQkFBa0IsR0FBRyxHQUEzQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQWFDLDhCQUFiO0FBQ0U7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNFLDBDQUFZQyxHQUFaLEVBQWlCQyxPQUFqQixFQUEwQkMsVUFBMUIsRUFBc0M7QUFBQTs7QUFDcEM7QUFDQSxTQUFLQyxJQUFMLEdBQVlILEdBQVo7O0FBRUE7QUFDQSxTQUFLSSxRQUFMLEdBQWdCSCxPQUFoQjs7QUFFQTtBQUNBLFNBQUtJLEdBQUwsR0FBV0gsVUFBWDs7QUFFQTtBQUNBLFNBQUtJLGNBQUwsR0FBc0IsSUFBdEI7QUFFQSxTQUFLQyx5QkFBTDtBQUNEOztBQUVEO0FBdEJGO0FBQUE7QUFBQSxXQXVCRSxxQ0FBNEI7QUFDMUIsVUFBSSxDQUFDLEtBQUtKLElBQUwsQ0FBVUssb0JBQVgsSUFBbUMsS0FBS0wsSUFBTCxLQUFjLEtBQUtBLElBQUwsQ0FBVU0sTUFBL0QsRUFBdUU7QUFDckUsYUFBS0MsbUJBQUw7QUFDQTtBQUNEOztBQUVELFdBQUtDLFdBQUw7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQW5DQTtBQUFBO0FBQUEsV0FvQ0UsdUJBQWM7QUFBQTs7QUFDWixVQUFNQyxZQUFZLEdBQUcsU0FBZkEsWUFBZSxDQUFDQyxPQUFELEVBQWE7QUFDaENBLFFBQUFBLE9BQU8sQ0FBQ0MsT0FBUixDQUFnQixVQUFDQyxLQUFELEVBQVc7QUFDekIsY0FBSSxDQUFDQSxLQUFLLENBQUNDLGNBQVgsRUFBMkI7QUFDekI7QUFDRDs7QUFDRCxVQUFBLEtBQUksQ0FBQ1gsR0FBTDs7QUFDQVksVUFBQUEsUUFBUSxDQUFDQyxTQUFULENBQW1CLEtBQUksQ0FBQ2QsUUFBeEI7QUFDRCxTQU5EO0FBT0QsT0FSRDs7QUFVQSxVQUFNYSxRQUFRLEdBQUcsSUFBSSxLQUFLZCxJQUFMLENBQVVLLG9CQUFkLENBQW1DSSxZQUFuQyxDQUFqQjtBQUVBSyxNQUFBQSxRQUFRLENBQUNFLE9BQVQsQ0FBaUIsS0FBS2YsUUFBdEI7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBeERBO0FBQUE7QUFBQSxXQXlERSwrQkFBc0I7QUFDcEIsV0FBS0UsY0FBTCxHQUFzQlQsUUFBUSxDQUM1QixLQUFLTSxJQUR1QixFQUU1QixLQUFLaUIsdUJBQUwsQ0FBNkJDLElBQTdCLENBQWtDLElBQWxDLENBRjRCLEVBRzVCdkIsa0JBSDRCLENBQTlCO0FBTUEsV0FBS0ssSUFBTCxDQUFVbUIsZ0JBQVYsQ0FBMkIsUUFBM0IsRUFBcUMsS0FBS2hCLGNBQTFDO0FBRUEsV0FBS2MsdUJBQUwsQ0FBNkIsS0FBS2hCLFFBQWxDO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQXpFQTtBQUFBO0FBQUEsV0EwRUUsbUNBQTBCO0FBQ3hCLFVBQU1tQixLQUFLLEdBQUcsS0FBS25CLFFBQUw7QUFBYztBQUFPb0IsTUFBQUEscUJBQXJCLEdBQTZDQyxHQUEzRDtBQUNBLFVBQU1DLGNBQWMsR0FBRyxLQUFLdkIsSUFBTDtBQUFVO0FBQU93QixNQUFBQSxXQUF4Qzs7QUFFQSxVQUFJRCxjQUFjLEdBQUdILEtBQXJCLEVBQTRCO0FBQzFCLGFBQUtsQixHQUFMO0FBQ0EsYUFBS0YsSUFBTCxDQUFVeUIsbUJBQVYsQ0FBOEIsUUFBOUIsRUFBd0MsS0FBS3RCLGNBQTdDO0FBQ0Q7QUFDRjtBQWxGSDs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAyMCBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7dGhyb3R0bGV9IGZyb20gJyNjb3JlL3R5cGVzL2Z1bmN0aW9uJztcblxuLyoqIEBjb25zdCB7bnVtYmVyfSAqL1xuY29uc3QgU0NST0xMX1RIUk9UVExFX01TID0gNTAwO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gSW50ZXJzZWN0aW9uT2JzZXJ2ZXIgb3IgZmFsbGJhY2sgdXNpbmcgc2Nyb2xsIGV2ZW50cy5cbiAqIEZpcmVzIHZpZXdwb3J0Q2Igd2hlbiBjcml0ZXJpYSBpcyBtZXQgYW5kIHVub2JzZXJ2ZXMgaW1tZWRpYXRlbHkgYWZ0ZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBBbXBTdG9yeVBsYXllclZpZXdwb3J0T2JzZXJ2ZXIge1xuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCk6dm9pZH0gdmlld3BvcnRDYlxuICAgKi9cbiAgY29uc3RydWN0b3Iod2luLCBlbGVtZW50LCB2aWV3cG9ydENiKSB7XG4gICAgLyoqIEBwcml2YXRlIHshV2luZG93fSAqL1xuICAgIHRoaXMud2luXyA9IHdpbjtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IUVsZW1lbnR9ICovXG4gICAgdGhpcy5lbGVtZW50XyA9IGVsZW1lbnQ7XG5cbiAgICAvKiogQHByaXZhdGUge2Z1bmN0aW9uKCk6dm9pZH0gKi9cbiAgICB0aGlzLmNiXyA9IHZpZXdwb3J0Q2I7XG5cbiAgICAvKiogQHByaXZhdGUgez9mdW5jdGlvbigpOnZvaWR9ICovXG4gICAgdGhpcy5zY3JvbGxIYW5kbGVyXyA9IG51bGw7XG5cbiAgICB0aGlzLmluaXRpYWxpemVJbk9iT3JGYWxsYmFja18oKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBpbml0aWFsaXplSW5PYk9yRmFsbGJhY2tfKCkge1xuICAgIGlmICghdGhpcy53aW5fLkludGVyc2VjdGlvbk9ic2VydmVyIHx8IHRoaXMud2luXyAhPT0gdGhpcy53aW5fLnBhcmVudCkge1xuICAgICAgdGhpcy5jcmVhdGVJbk9iRmFsbGJhY2tfKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5jcmVhdGVJbk9iXygpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gSW50ZXJzZWN0aW9uT2JzZXJ2ZXIuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBjcmVhdGVJbk9iXygpIHtcbiAgICBjb25zdCBpbk9iQ2FsbGJhY2sgPSAoZW50cmllcykgPT4ge1xuICAgICAgZW50cmllcy5mb3JFYWNoKChlbnRyeSkgPT4ge1xuICAgICAgICBpZiAoIWVudHJ5LmlzSW50ZXJzZWN0aW5nKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2JfKCk7XG4gICAgICAgIG9ic2VydmVyLnVub2JzZXJ2ZSh0aGlzLmVsZW1lbnRfKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb25zdCBvYnNlcnZlciA9IG5ldyB0aGlzLndpbl8uSW50ZXJzZWN0aW9uT2JzZXJ2ZXIoaW5PYkNhbGxiYWNrKTtcblxuICAgIG9ic2VydmVyLm9ic2VydmUodGhpcy5lbGVtZW50Xyk7XG4gIH1cblxuICAvKipcbiAgICogRmFsbGJhY2sgZm9yIHdoZW4gSW50ZXJzZWN0aW9uT2JzZXJ2ZXIgaXMgbm90IHN1cHBvcnRlZC4gQ2FsbHNcbiAgICogbGF5b3V0UGxheWVyIG9uIHRoZSBlbGVtZW50IHdoZW4gaXQgaXMgY2xvc2UgdG8gdGhlIHZpZXdwb3J0LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY3JlYXRlSW5PYkZhbGxiYWNrXygpIHtcbiAgICB0aGlzLnNjcm9sbEhhbmRsZXJfID0gdGhyb3R0bGUoXG4gICAgICB0aGlzLndpbl8sXG4gICAgICB0aGlzLmNoZWNrSWZWaXNpYmxlRmFsbGJhY2tfLmJpbmQodGhpcyksXG4gICAgICBTQ1JPTExfVEhST1RUTEVfTVNcbiAgICApO1xuXG4gICAgdGhpcy53aW5fLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMuc2Nyb2xsSGFuZGxlcl8pO1xuXG4gICAgdGhpcy5jaGVja0lmVmlzaWJsZUZhbGxiYWNrXyh0aGlzLmVsZW1lbnRfKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgZWxlbWVudCBpcyBjbG9zZSB0byB0aGUgdmlld3BvcnQgYW5kIGNhbGxzIHRoZSBjYWxsYmFjayB3aGVuIGl0XG4gICAqIGlzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY2hlY2tJZlZpc2libGVGYWxsYmFja18oKSB7XG4gICAgY29uc3QgZWxUb3AgPSB0aGlzLmVsZW1lbnRfLi8qT0sqLyBnZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XG4gICAgY29uc3Qgd2luSW5uZXJIZWlnaHQgPSB0aGlzLndpbl8uLypPSyovIGlubmVySGVpZ2h0O1xuXG4gICAgaWYgKHdpbklubmVySGVpZ2h0ID4gZWxUb3ApIHtcbiAgICAgIHRoaXMuY2JfKCk7XG4gICAgICB0aGlzLndpbl8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5zY3JvbGxIYW5kbGVyXyk7XG4gICAgfVxuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/amp-story-player/amp-story-player-viewport-observer.js