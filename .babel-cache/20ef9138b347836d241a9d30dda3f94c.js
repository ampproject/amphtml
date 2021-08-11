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
import { Observable } from "./core/data-structures/observable";
import { isElement } from "./core/types";
import { dev } from "./log";
import { Services } from "./service";

/**
 * FocusHistory keeps track of recent focused elements. This history can be
 * purged using `purgeBefore` method.
 */
export var FocusHistory = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {number} purgeTimeout
   */
  function FocusHistory(win, purgeTimeout) {
    var _this = this;

    _classCallCheck(this, FocusHistory);

    /** @const {!Window} */
    this.win = win;

    /** @private @const {number} */
    this.purgeTimeout_ = purgeTimeout;

    /** @private @const {!Array<!{el: !Element, time: time}>} */
    this.history_ = [];

    /** @private @const {!Observable<!Element>} */
    this.observeFocus_ = new Observable();

    /**
     * @private
     * @param {!Event} e
     */
    this.captureFocus_ = function (e) {
      // Hack (#15079) due to Firefox firing focus events on the entire page
      if (isElement(e.target)) {
        _this.pushFocus_(dev().assertElement(e.target));
      }
    };

    /**
     * @private
     * @param {*} unusedE
     */
    this.captureBlur_ = function (unusedE) {
      // IFrame elements do not receive `focus` event. An alternative way is
      // implemented here. We wait for a blur to arrive on the main window
      // and after a short time check which element is active.
      Services.timerFor(win).delay(function () {
        if (_this.win.document.activeElement) {
          _this.pushFocus_(_this.win.document.activeElement);
        }
      }, 500);
    };

    this.win.document.addEventListener('focus', this.captureFocus_, true);
    this.win.addEventListener('blur', this.captureBlur_);
  }

  /** @visibleForTesting */
  _createClass(FocusHistory, [{
    key: "cleanup_",
    value: function cleanup_() {
      this.win.document.removeEventListener('focus', this.captureFocus_, true);
      this.win.removeEventListener('blur', this.captureBlur_);
    }
    /**
     * Add a listener for focus events.
     * @param {function(!Element)} handler
     * @return {!UnlistenDef}
     */

  }, {
    key: "onFocus",
    value: function onFocus(handler) {
      return this.observeFocus_.add(handler);
    }
    /**
     * @param {!Element} element
     * @private
     */

  }, {
    key: "pushFocus_",
    value: function pushFocus_(element) {
      var now = Date.now();

      if (this.history_.length == 0 || this.history_[this.history_.length - 1].el != element) {
        this.history_.push({
          el: element,
          time: now
        });
      } else {
        this.history_[this.history_.length - 1].time = now;
      }

      this.purgeBefore(now - this.purgeTimeout_);
      this.observeFocus_.fire(element);
    }
    /**
     * Returns the element that was focused last.
     * @return {?Element}
     */

  }, {
    key: "getLast",
    value: function getLast() {
      if (this.history_.length == 0) {
        return null;
      }

      return this.history_[this.history_.length - 1].el;
    }
    /**
     * Removes elements from the history older than the specified time.
     * @param {time} time
     */

  }, {
    key: "purgeBefore",
    value: function purgeBefore(time) {
      var index = this.history_.length - 1;

      for (var i = 0; i < this.history_.length; i++) {
        if (this.history_[i].time >= time) {
          index = i - 1;
          break;
        }
      }

      if (index != -1) {
        this.history_.splice(0, index + 1);
      }
    }
    /**
     * Returns `true` if the specified element contains any of the elements in
     * the history.
     * @param {!Element} element
     * @return {boolean}
     */

  }, {
    key: "hasDescendantsOf",
    value: function hasDescendantsOf(element) {
      if (this.win.document.activeElement) {
        this.pushFocus_(this.win.document.activeElement);
      }

      for (var i = 0; i < this.history_.length; i++) {
        if (element.contains(this.history_[i].el)) {
          return true;
        }
      }

      return false;
    }
  }]);

  return FocusHistory;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvY3VzLWhpc3RvcnkuanMiXSwibmFtZXMiOlsiT2JzZXJ2YWJsZSIsImlzRWxlbWVudCIsImRldiIsIlNlcnZpY2VzIiwiRm9jdXNIaXN0b3J5Iiwid2luIiwicHVyZ2VUaW1lb3V0IiwicHVyZ2VUaW1lb3V0XyIsImhpc3RvcnlfIiwib2JzZXJ2ZUZvY3VzXyIsImNhcHR1cmVGb2N1c18iLCJlIiwidGFyZ2V0IiwicHVzaEZvY3VzXyIsImFzc2VydEVsZW1lbnQiLCJjYXB0dXJlQmx1cl8iLCJ1bnVzZWRFIiwidGltZXJGb3IiLCJkZWxheSIsImRvY3VtZW50IiwiYWN0aXZlRWxlbWVudCIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiaGFuZGxlciIsImFkZCIsImVsZW1lbnQiLCJub3ciLCJEYXRlIiwibGVuZ3RoIiwiZWwiLCJwdXNoIiwidGltZSIsInB1cmdlQmVmb3JlIiwiZmlyZSIsImluZGV4IiwiaSIsInNwbGljZSIsImNvbnRhaW5zIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxVQUFSO0FBQ0EsU0FBUUMsU0FBUjtBQUNBLFNBQVFDLEdBQVI7QUFDQSxTQUFRQyxRQUFSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBYUMsWUFBYjtBQUNFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0Usd0JBQVlDLEdBQVosRUFBaUJDLFlBQWpCLEVBQStCO0FBQUE7O0FBQUE7O0FBQzdCO0FBQ0EsU0FBS0QsR0FBTCxHQUFXQSxHQUFYOztBQUVBO0FBQ0EsU0FBS0UsYUFBTCxHQUFxQkQsWUFBckI7O0FBRUE7QUFDQSxTQUFLRSxRQUFMLEdBQWdCLEVBQWhCOztBQUVBO0FBQ0EsU0FBS0MsYUFBTCxHQUFxQixJQUFJVCxVQUFKLEVBQXJCOztBQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0ks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QUNBLFdBQUssSUFBSU8sQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBRyxLQUFLM0IsUUFBTCxDQUFjb0IsTUFBbEMsRUFBMENPLENBQUMsRUFBM0MsRUFBK0M7QUFDN0MsWUFBSSxLQUFLM0IsUUFBTCxDQUFjMkIsQ0FBZCxFQUFpQkosSUFBakIsSUFBeUJBLElBQTdCLEVBQW1DO0FBQ2pDRyxVQUFBQSxLQUFLLEdBQUdDLENBQUMsR0FBRyxDQUFaO0FBQ0E7QUFDRDtBQUNGOztBQUNELFVBQUlELEtBQUssSUFBSSxDQUFDLENBQWQsRUFBaUI7QUFDZixhQUFLMUIsUUFBTCxDQUFjNEIsTUFBZCxDQUFxQixDQUFyQixFQUF3QkYsS0FBSyxHQUFHLENBQWhDO0FBQ0Q7QUFDRjtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFqSEE7QUFBQTtBQUFBLFdBa0hFLDBCQUFpQlQsT0FBakIsRUFBMEI7QUFDeEIsVUFBSSxLQUFLcEIsR0FBTCxDQUFTYyxRQUFULENBQWtCQyxhQUF0QixFQUFxQztBQUNuQyxhQUFLUCxVQUFMLENBQWdCLEtBQUtSLEdBQUwsQ0FBU2MsUUFBVCxDQUFrQkMsYUFBbEM7QUFDRDs7QUFDRCxXQUFLLElBQUllLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUcsS0FBSzNCLFFBQUwsQ0FBY29CLE1BQWxDLEVBQTBDTyxDQUFDLEVBQTNDLEVBQStDO0FBQzdDLFlBQUlWLE9BQU8sQ0FBQ1ksUUFBUixDQUFpQixLQUFLN0IsUUFBTCxDQUFjMkIsQ0FBZCxFQUFpQk4sRUFBbEMsQ0FBSixFQUEyQztBQUN6QyxpQkFBTyxJQUFQO0FBQ0Q7QUFDRjs7QUFDRCxhQUFPLEtBQVA7QUFDRDtBQTVISDs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAnLi9jb3JlL2RhdGEtc3RydWN0dXJlcy9vYnNlcnZhYmxlJztcbmltcG9ydCB7aXNFbGVtZW50fSBmcm9tICcuL2NvcmUvdHlwZXMnO1xuaW1wb3J0IHtkZXZ9IGZyb20gJy4vbG9nJztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJy4vc2VydmljZSc7XG5cbi8qKlxuICogRm9jdXNIaXN0b3J5IGtlZXBzIHRyYWNrIG9mIHJlY2VudCBmb2N1c2VkIGVsZW1lbnRzLiBUaGlzIGhpc3RvcnkgY2FuIGJlXG4gKiBwdXJnZWQgdXNpbmcgYHB1cmdlQmVmb3JlYCBtZXRob2QuXG4gKi9cbmV4cG9ydCBjbGFzcyBGb2N1c0hpc3Rvcnkge1xuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHB1cmdlVGltZW91dFxuICAgKi9cbiAgY29uc3RydWN0b3Iod2luLCBwdXJnZVRpbWVvdXQpIHtcbiAgICAvKiogQGNvbnN0IHshV2luZG93fSAqL1xuICAgIHRoaXMud2luID0gd2luO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7bnVtYmVyfSAqL1xuICAgIHRoaXMucHVyZ2VUaW1lb3V0XyA9IHB1cmdlVGltZW91dDtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFBcnJheTwhe2VsOiAhRWxlbWVudCwgdGltZTogdGltZX0+fSAqL1xuICAgIHRoaXMuaGlzdG9yeV8gPSBbXTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFPYnNlcnZhYmxlPCFFbGVtZW50Pn0gKi9cbiAgICB0aGlzLm9ic2VydmVGb2N1c18gPSBuZXcgT2JzZXJ2YWJsZSgpO1xuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0geyFFdmVudH0gZVxuICAgICAqL1xuICAgIHRoaXMuY2FwdHVyZUZvY3VzXyA9IChlKSA9PiB7XG4gICAgICAvLyBIYWNrICgjMTUwNzkpIGR1ZSB0byBGaXJlZm94IGZpcmluZyBmb2N1cyBldmVudHMgb24gdGhlIGVudGlyZSBwYWdlXG4gICAgICBpZiAoaXNFbGVtZW50KGUudGFyZ2V0KSkge1xuICAgICAgICB0aGlzLnB1c2hGb2N1c18oZGV2KCkuYXNzZXJ0RWxlbWVudChlLnRhcmdldCkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7Kn0gdW51c2VkRVxuICAgICAqL1xuICAgIHRoaXMuY2FwdHVyZUJsdXJfID0gKHVudXNlZEUpID0+IHtcbiAgICAgIC8vIElGcmFtZSBlbGVtZW50cyBkbyBub3QgcmVjZWl2ZSBgZm9jdXNgIGV2ZW50LiBBbiBhbHRlcm5hdGl2ZSB3YXkgaXNcbiAgICAgIC8vIGltcGxlbWVudGVkIGhlcmUuIFdlIHdhaXQgZm9yIGEgYmx1ciB0byBhcnJpdmUgb24gdGhlIG1haW4gd2luZG93XG4gICAgICAvLyBhbmQgYWZ0ZXIgYSBzaG9ydCB0aW1lIGNoZWNrIHdoaWNoIGVsZW1lbnQgaXMgYWN0aXZlLlxuICAgICAgU2VydmljZXMudGltZXJGb3Iod2luKS5kZWxheSgoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLndpbi5kb2N1bWVudC5hY3RpdmVFbGVtZW50KSB7XG4gICAgICAgICAgdGhpcy5wdXNoRm9jdXNfKHRoaXMud2luLmRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9LCA1MDApO1xuICAgIH07XG4gICAgdGhpcy53aW4uZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLmNhcHR1cmVGb2N1c18sIHRydWUpO1xuICAgIHRoaXMud2luLmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCB0aGlzLmNhcHR1cmVCbHVyXyk7XG4gIH1cblxuICAvKiogQHZpc2libGVGb3JUZXN0aW5nICovXG4gIGNsZWFudXBfKCkge1xuICAgIHRoaXMud2luLmRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5jYXB0dXJlRm9jdXNfLCB0cnVlKTtcbiAgICB0aGlzLndpbi5yZW1vdmVFdmVudExpc3RlbmVyKCdibHVyJywgdGhpcy5jYXB0dXJlQmx1cl8pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIGxpc3RlbmVyIGZvciBmb2N1cyBldmVudHMuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIUVsZW1lbnQpfSBoYW5kbGVyXG4gICAqIEByZXR1cm4geyFVbmxpc3RlbkRlZn1cbiAgICovXG4gIG9uRm9jdXMoaGFuZGxlcikge1xuICAgIHJldHVybiB0aGlzLm9ic2VydmVGb2N1c18uYWRkKGhhbmRsZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHB1c2hGb2N1c18oZWxlbWVudCkge1xuICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgaWYgKFxuICAgICAgdGhpcy5oaXN0b3J5Xy5sZW5ndGggPT0gMCB8fFxuICAgICAgdGhpcy5oaXN0b3J5X1t0aGlzLmhpc3RvcnlfLmxlbmd0aCAtIDFdLmVsICE9IGVsZW1lbnRcbiAgICApIHtcbiAgICAgIHRoaXMuaGlzdG9yeV8ucHVzaCh7ZWw6IGVsZW1lbnQsIHRpbWU6IG5vd30pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmhpc3RvcnlfW3RoaXMuaGlzdG9yeV8ubGVuZ3RoIC0gMV0udGltZSA9IG5vdztcbiAgICB9XG4gICAgdGhpcy5wdXJnZUJlZm9yZShub3cgLSB0aGlzLnB1cmdlVGltZW91dF8pO1xuICAgIHRoaXMub2JzZXJ2ZUZvY3VzXy5maXJlKGVsZW1lbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGVsZW1lbnQgdGhhdCB3YXMgZm9jdXNlZCBsYXN0LlxuICAgKiBAcmV0dXJuIHs/RWxlbWVudH1cbiAgICovXG4gIGdldExhc3QoKSB7XG4gICAgaWYgKHRoaXMuaGlzdG9yeV8ubGVuZ3RoID09IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5oaXN0b3J5X1t0aGlzLmhpc3RvcnlfLmxlbmd0aCAtIDFdLmVsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgZWxlbWVudHMgZnJvbSB0aGUgaGlzdG9yeSBvbGRlciB0aGFuIHRoZSBzcGVjaWZpZWQgdGltZS5cbiAgICogQHBhcmFtIHt0aW1lfSB0aW1lXG4gICAqL1xuICBwdXJnZUJlZm9yZSh0aW1lKSB7XG4gICAgbGV0IGluZGV4ID0gdGhpcy5oaXN0b3J5Xy5sZW5ndGggLSAxO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5oaXN0b3J5Xy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMuaGlzdG9yeV9baV0udGltZSA+PSB0aW1lKSB7XG4gICAgICAgIGluZGV4ID0gaSAtIDE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaW5kZXggIT0gLTEpIHtcbiAgICAgIHRoaXMuaGlzdG9yeV8uc3BsaWNlKDAsIGluZGV4ICsgMSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYHRydWVgIGlmIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBjb250YWlucyBhbnkgb2YgdGhlIGVsZW1lbnRzIGluXG4gICAqIHRoZSBoaXN0b3J5LlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBoYXNEZXNjZW5kYW50c09mKGVsZW1lbnQpIHtcbiAgICBpZiAodGhpcy53aW4uZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkge1xuICAgICAgdGhpcy5wdXNoRm9jdXNfKHRoaXMud2luLmRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpO1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaGlzdG9yeV8ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChlbGVtZW50LmNvbnRhaW5zKHRoaXMuaGlzdG9yeV9baV0uZWwpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/focus-history.js