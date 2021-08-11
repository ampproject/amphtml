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
import { Services } from "./service";

/**
 * Installs "pull-to-refresh" (P2R) blocker if viewer has requested. P2R can
 * be very disruptive for different viewer scenarios. This is currently only
 * done on Chrome (both Android and iOS).
 * @param {!Window} win
 */
export function installPullToRefreshBlocker(win) {
  // Only do when requested and don't even try it on Safari!
  // This mode is only executed in the single-doc mode.
  var documentElement = win.document.documentElement;

  if (Services.viewerForDoc(documentElement).getParam('p2r') == '0' && Services.platformFor(win).isChrome()) {
    new PullToRefreshBlocker(win.document, Services.viewportForDoc(documentElement));
  }
}

/**
 * Visible for testing only.
 * @private
 */
export var PullToRefreshBlocker = /*#__PURE__*/function () {
  /**
   * @param {!Document} doc
   * @param {!./service/viewport/viewport-interface.ViewportInterface} viewport
   */
  function PullToRefreshBlocker(doc, viewport) {
    _classCallCheck(this, PullToRefreshBlocker);

    /** @private {!Document} */
    this.doc_ = doc;

    /** @private @const */
    this.viewport_ = viewport;

    /** @private {boolean} */
    this.tracking_ = false;

    /** @private {number} */
    this.startPos_ = 0;

    /** @private {!Function} */
    this.boundTouchStart_ = this.onTouchStart_.bind(this);

    /** @private {!Function} */
    this.boundTouchMove_ = this.onTouchMove_.bind(this);

    /** @private {!Function} */
    this.boundTouchEnd_ = this.onTouchEnd_.bind(this);

    /** @private {!Function} */
    this.boundTouchCancel_ = this.onTouchCancel_.bind(this);
    this.doc_.addEventListener('touchstart', this.boundTouchStart_, true);
  }

  /** */
  _createClass(PullToRefreshBlocker, [{
    key: "cleanup",
    value: function cleanup() {
      this.stopTracking_();
      this.doc_.removeEventListener('touchstart', this.boundTouchStart_, true);
    }
    /**
     * @param {!Event} event
     * @private
     */

  }, {
    key: "onTouchStart_",
    value: function onTouchStart_(event) {
      // P2R won't trigger when document is scrolled. Also can ignore when we are
      // already tracking this touch and for non-single-touch events.
      if (this.tracking_ || !(event.touches && event.touches.length == 1) || this.viewport_.getScrollTop() > 0) {
        return;
      }

      this.startTracking_(event.touches[0].clientY);
    }
    /**
     * @param {number} startPos
     * @private
     */

  }, {
    key: "startTracking_",
    value: function startTracking_(startPos) {
      this.tracking_ = true;
      this.startPos_ = startPos;
      this.doc_.addEventListener('touchmove', this.boundTouchMove_, true);
      this.doc_.addEventListener('touchend', this.boundTouchEnd_, true);
      this.doc_.addEventListener('touchcancel', this.boundTouchCancel_, true);
    }
    /** @private */

  }, {
    key: "stopTracking_",
    value: function stopTracking_() {
      this.tracking_ = false;
      this.startPos_ = 0;
      this.doc_.removeEventListener('touchmove', this.boundTouchMove_, true);
      this.doc_.removeEventListener('touchend', this.boundTouchEnd_, true);
      this.doc_.removeEventListener('touchcancel', this.boundTouchCancel_, true);
    }
    /**
     * @param {!Event} event
     * @private
     */

  }, {
    key: "onTouchMove_",
    value: function onTouchMove_(event) {
      if (!this.tracking_) {
        return;
      }

      var dy = event.touches[0].clientY - this.startPos_;

      // Immediately cancel the P2R if dragging down.
      if (dy > 0) {
        event.preventDefault();
      }

      // Stop tracking if there was any motion at all.
      if (dy != 0) {
        this.stopTracking_();
      }
    }
    /**
     * @param {!Event} unusedEvent
     * @private
     */

  }, {
    key: "onTouchEnd_",
    value: function onTouchEnd_(unusedEvent) {
      this.stopTracking_();
    }
    /**
     * @param {!Event} unusedEvent
     * @private
     */

  }, {
    key: "onTouchCancel_",
    value: function onTouchCancel_(unusedEvent) {
      this.stopTracking_();
    }
  }]);

  return PullToRefreshBlocker;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInB1bGwtdG8tcmVmcmVzaC5qcyJdLCJuYW1lcyI6WyJTZXJ2aWNlcyIsImluc3RhbGxQdWxsVG9SZWZyZXNoQmxvY2tlciIsIndpbiIsImRvY3VtZW50RWxlbWVudCIsImRvY3VtZW50Iiwidmlld2VyRm9yRG9jIiwiZ2V0UGFyYW0iLCJwbGF0Zm9ybUZvciIsImlzQ2hyb21lIiwiUHVsbFRvUmVmcmVzaEJsb2NrZXIiLCJ2aWV3cG9ydEZvckRvYyIsImRvYyIsInZpZXdwb3J0IiwiZG9jXyIsInZpZXdwb3J0XyIsInRyYWNraW5nXyIsInN0YXJ0UG9zXyIsImJvdW5kVG91Y2hTdGFydF8iLCJvblRvdWNoU3RhcnRfIiwiYmluZCIsImJvdW5kVG91Y2hNb3ZlXyIsIm9uVG91Y2hNb3ZlXyIsImJvdW5kVG91Y2hFbmRfIiwib25Ub3VjaEVuZF8iLCJib3VuZFRvdWNoQ2FuY2VsXyIsIm9uVG91Y2hDYW5jZWxfIiwiYWRkRXZlbnRMaXN0ZW5lciIsInN0b3BUcmFja2luZ18iLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJ0b3VjaGVzIiwibGVuZ3RoIiwiZ2V0U2Nyb2xsVG9wIiwic3RhcnRUcmFja2luZ18iLCJjbGllbnRZIiwic3RhcnRQb3MiLCJkeSIsInByZXZlbnREZWZhdWx0IiwidW51c2VkRXZlbnQiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFFBQVI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQywyQkFBVCxDQUFxQ0MsR0FBckMsRUFBMEM7QUFDL0M7QUFDQTtBQUNBLE1BQU9DLGVBQVAsR0FBMEJELEdBQUcsQ0FBQ0UsUUFBOUIsQ0FBT0QsZUFBUDs7QUFDQSxNQUNFSCxRQUFRLENBQUNLLFlBQVQsQ0FBc0JGLGVBQXRCLEVBQXVDRyxRQUF2QyxDQUFn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S0osaUJBQWxELEVBQXFFLElBQXJFO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUE5RUE7QUFBQTtBQUFBLFdBK0VFLHNCQUFhSyxLQUFiLEVBQW9CO0FBQ2xCLFVBQUksQ0FBQyxLQUFLZCxTQUFWLEVBQXFCO0FBQ25CO0FBQ0Q7O0FBRUQsVUFBTXFCLEVBQUUsR0FBR1AsS0FBSyxDQUFDQyxPQUFOLENBQWMsQ0FBZCxFQUFpQkksT0FBakIsR0FBMkIsS0FBS2xCLFNBQTNDOztBQUVBO0FBQ0EsVUFBSW9CLEVBQUUsR0FBRyxDQUFULEVBQVk7QUFDVlAsUUFBQUEsS0FBSyxDQUFDUSxjQUFOO0FBQ0Q7O0FBRUQ7QUFDQSxVQUFJRCxFQUFFLElBQUksQ0FBVixFQUFhO0FBQ1gsYUFBS1QsYUFBTDtBQUNEO0FBQ0Y7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUFwR0E7QUFBQTtBQUFBLFdBcUdFLHFCQUFZVyxXQUFaLEVBQXlCO0FBQ3ZCLFdBQUtYLGFBQUw7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQTVHQTtBQUFBO0FBQUEsV0E2R0Usd0JBQWVXLFdBQWYsRUFBNEI7QUFDMUIsV0FBS1gsYUFBTDtBQUNEO0FBL0dIOztBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE1IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnLi9zZXJ2aWNlJztcblxuLyoqXG4gKiBJbnN0YWxscyBcInB1bGwtdG8tcmVmcmVzaFwiIChQMlIpIGJsb2NrZXIgaWYgdmlld2VyIGhhcyByZXF1ZXN0ZWQuIFAyUiBjYW5cbiAqIGJlIHZlcnkgZGlzcnVwdGl2ZSBmb3IgZGlmZmVyZW50IHZpZXdlciBzY2VuYXJpb3MuIFRoaXMgaXMgY3VycmVudGx5IG9ubHlcbiAqIGRvbmUgb24gQ2hyb21lIChib3RoIEFuZHJvaWQgYW5kIGlPUykuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbFB1bGxUb1JlZnJlc2hCbG9ja2VyKHdpbikge1xuICAvLyBPbmx5IGRvIHdoZW4gcmVxdWVzdGVkIGFuZCBkb24ndCBldmVuIHRyeSBpdCBvbiBTYWZhcmkhXG4gIC8vIFRoaXMgbW9kZSBpcyBvbmx5IGV4ZWN1dGVkIGluIHRoZSBzaW5nbGUtZG9jIG1vZGUuXG4gIGNvbnN0IHtkb2N1bWVudEVsZW1lbnR9ID0gd2luLmRvY3VtZW50O1xuICBpZiAoXG4gICAgU2VydmljZXMudmlld2VyRm9yRG9jKGRvY3VtZW50RWxlbWVudCkuZ2V0UGFyYW0oJ3AycicpID09ICcwJyAmJlxuICAgIFNlcnZpY2VzLnBsYXRmb3JtRm9yKHdpbikuaXNDaHJvbWUoKVxuICApIHtcbiAgICBuZXcgUHVsbFRvUmVmcmVzaEJsb2NrZXIoXG4gICAgICB3aW4uZG9jdW1lbnQsXG4gICAgICBTZXJ2aWNlcy52aWV3cG9ydEZvckRvYyhkb2N1bWVudEVsZW1lbnQpXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIFZpc2libGUgZm9yIHRlc3Rpbmcgb25seS5cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBjbGFzcyBQdWxsVG9SZWZyZXNoQmxvY2tlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFEb2N1bWVudH0gZG9jXG4gICAqIEBwYXJhbSB7IS4vc2VydmljZS92aWV3cG9ydC92aWV3cG9ydC1pbnRlcmZhY2UuVmlld3BvcnRJbnRlcmZhY2V9IHZpZXdwb3J0XG4gICAqL1xuICBjb25zdHJ1Y3Rvcihkb2MsIHZpZXdwb3J0KSB7XG4gICAgLyoqIEBwcml2YXRlIHshRG9jdW1lbnR9ICovXG4gICAgdGhpcy5kb2NfID0gZG9jO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCAqL1xuICAgIHRoaXMudmlld3BvcnRfID0gdmlld3BvcnQ7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy50cmFja2luZ18gPSBmYWxzZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMuc3RhcnRQb3NfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IUZ1bmN0aW9ufSAqL1xuICAgIHRoaXMuYm91bmRUb3VjaFN0YXJ0XyA9IHRoaXMub25Ub3VjaFN0YXJ0Xy5iaW5kKHRoaXMpO1xuICAgIC8qKiBAcHJpdmF0ZSB7IUZ1bmN0aW9ufSAqL1xuICAgIHRoaXMuYm91bmRUb3VjaE1vdmVfID0gdGhpcy5vblRvdWNoTW92ZV8uYmluZCh0aGlzKTtcbiAgICAvKiogQHByaXZhdGUgeyFGdW5jdGlvbn0gKi9cbiAgICB0aGlzLmJvdW5kVG91Y2hFbmRfID0gdGhpcy5vblRvdWNoRW5kXy5iaW5kKHRoaXMpO1xuICAgIC8qKiBAcHJpdmF0ZSB7IUZ1bmN0aW9ufSAqL1xuICAgIHRoaXMuYm91bmRUb3VjaENhbmNlbF8gPSB0aGlzLm9uVG91Y2hDYW5jZWxfLmJpbmQodGhpcyk7XG5cbiAgICB0aGlzLmRvY18uYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuYm91bmRUb3VjaFN0YXJ0XywgdHJ1ZSk7XG4gIH1cblxuICAvKiogKi9cbiAgY2xlYW51cCgpIHtcbiAgICB0aGlzLnN0b3BUcmFja2luZ18oKTtcbiAgICB0aGlzLmRvY18ucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuYm91bmRUb3VjaFN0YXJ0XywgdHJ1ZSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRXZlbnR9IGV2ZW50XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblRvdWNoU3RhcnRfKGV2ZW50KSB7XG4gICAgLy8gUDJSIHdvbid0IHRyaWdnZXIgd2hlbiBkb2N1bWVudCBpcyBzY3JvbGxlZC4gQWxzbyBjYW4gaWdub3JlIHdoZW4gd2UgYXJlXG4gICAgLy8gYWxyZWFkeSB0cmFja2luZyB0aGlzIHRvdWNoIGFuZCBmb3Igbm9uLXNpbmdsZS10b3VjaCBldmVudHMuXG4gICAgaWYgKFxuICAgICAgdGhpcy50cmFja2luZ18gfHxcbiAgICAgICEoZXZlbnQudG91Y2hlcyAmJiBldmVudC50b3VjaGVzLmxlbmd0aCA9PSAxKSB8fFxuICAgICAgdGhpcy52aWV3cG9ydF8uZ2V0U2Nyb2xsVG9wKCkgPiAwXG4gICAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zdGFydFRyYWNraW5nXyhldmVudC50b3VjaGVzWzBdLmNsaWVudFkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydFBvc1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc3RhcnRUcmFja2luZ18oc3RhcnRQb3MpIHtcbiAgICB0aGlzLnRyYWNraW5nXyA9IHRydWU7XG4gICAgdGhpcy5zdGFydFBvc18gPSBzdGFydFBvcztcbiAgICB0aGlzLmRvY18uYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5ib3VuZFRvdWNoTW92ZV8sIHRydWUpO1xuICAgIHRoaXMuZG9jXy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuYm91bmRUb3VjaEVuZF8sIHRydWUpO1xuICAgIHRoaXMuZG9jXy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIHRoaXMuYm91bmRUb3VjaENhbmNlbF8sIHRydWUpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIHN0b3BUcmFja2luZ18oKSB7XG4gICAgdGhpcy50cmFja2luZ18gPSBmYWxzZTtcbiAgICB0aGlzLnN0YXJ0UG9zXyA9IDA7XG4gICAgdGhpcy5kb2NfLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuYm91bmRUb3VjaE1vdmVfLCB0cnVlKTtcbiAgICB0aGlzLmRvY18ucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLmJvdW5kVG91Y2hFbmRfLCB0cnVlKTtcbiAgICB0aGlzLmRvY18ucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCB0aGlzLmJvdW5kVG91Y2hDYW5jZWxfLCB0cnVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFdmVudH0gZXZlbnRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uVG91Y2hNb3ZlXyhldmVudCkge1xuICAgIGlmICghdGhpcy50cmFja2luZ18pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBkeSA9IGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WSAtIHRoaXMuc3RhcnRQb3NfO1xuXG4gICAgLy8gSW1tZWRpYXRlbHkgY2FuY2VsIHRoZSBQMlIgaWYgZHJhZ2dpbmcgZG93bi5cbiAgICBpZiAoZHkgPiAwKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIC8vIFN0b3AgdHJhY2tpbmcgaWYgdGhlcmUgd2FzIGFueSBtb3Rpb24gYXQgYWxsLlxuICAgIGlmIChkeSAhPSAwKSB7XG4gICAgICB0aGlzLnN0b3BUcmFja2luZ18oKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRXZlbnR9IHVudXNlZEV2ZW50XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblRvdWNoRW5kXyh1bnVzZWRFdmVudCkge1xuICAgIHRoaXMuc3RvcFRyYWNraW5nXygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUV2ZW50fSB1bnVzZWRFdmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25Ub3VjaENhbmNlbF8odW51c2VkRXZlbnQpIHtcbiAgICB0aGlzLnN0b3BUcmFja2luZ18oKTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/src/pull-to-refresh.js