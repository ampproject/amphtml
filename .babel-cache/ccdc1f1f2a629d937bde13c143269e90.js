function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import { Observable } from "../../../src/core/data-structures/observable";
import { Services } from "../../../src/service";
import { devAssert } from "../../../src/log";

/**
 * @typedef {{
 *   top: number,
 *   left: number,
 *   width: number,
 *   height: number,
 *   scrollHeight: number,
 *   scrollWidth: number,
 *   initialSize: {
 *      scrollHeight: number,
 *      scrollWidth: number
 *  }
 * }}
 */
export var ScrollEventDef;

/**
 * A manager for handling multiple Scroll Event Trackers.
 * The instance of this class corresponds 1:1 to `AnalyticsRoot`. It represents
 * a collection of all scroll triggers declared within the `AnalyticsRoot`.
 * @implements {../../../src/service.Disposable}
 */
export var ScrollManager = /*#__PURE__*/function () {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function ScrollManager(root) {
    _classCallCheck(this, ScrollManager);

    /** @const @private {!../../../src/service/viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = Services.viewportForDoc(root.ampdoc);

    /** @const @private {!../../../src/service/mutator-interface.MutatorInterface} */
    this.mutator_ = Services.mutatorForDoc(root.ampdoc);

    /** @private {?UnlistenDef} */
    this.viewportOnChangedUnlistener_ = null;

    /** @private {!Observable<!./scroll-manager.ScrollEventDef>} */
    this.scrollObservable_ = new Observable();

    /** @const @private {!Element} */
    this.root_ = root.getRootElement();

    /**  @private {?Promise} */
    this.initialRootRectPromise_ = null;
  }

  /**
   * Function to dispose of all handlers on the scroll observable
   */
  _createClass(ScrollManager, [{
    key: "dispose",
    value: function dispose() {
      this.scrollObservable_.removeAll();
      this.removeViewportOnChangedListener_();
    }
    /**
     * @param {function(!Object)} handler
     */

  }, {
    key: "removeScrollHandler",
    value: function removeScrollHandler(handler) {
      this.scrollObservable_.remove(handler);

      if (this.scrollObservable_.getHandlerCount() <= 0) {
        this.removeViewportOnChangedListener_();
      }
    }
    /**
     * @param {function(!Object)} handler
     * @return {!UnlistenDef}
     */

  }, {
    key: "addScrollHandler",
    value: function addScrollHandler(handler) {
      var _this = this;

      // Trigger an event to fire events that might have already happened.
      var size = this.viewport_.getSize();
      this.getInitRootElementRect_().then(function (initRootElementRect) {
        // In the case of shadow/embedded documents, the root element's
        // layoutRect is relative to the parent doc's origin
        var scrollHeight = initRootElementRect.height,
            scrollLeft = initRootElementRect.left,
            scrollTop = initRootElementRect.top,
            scrollWidth = initRootElementRect.width;

        /** {./scroll-manager.ScrollEventDef} */
        var scrollEvent = {
          // In the case of shadow documents (e.g. amp-next-page), we offset
          // the event's top and left coordinates by the top/left position of
          // the document's container element (so that scroll triggers become relative to
          // container instead of the top-level host page). In the case of a top-level
          // page, the container/root is the document body so scrollTop and scrollLeft
          // are both 0 and the measurements are not affected
          top: _this.viewport_.getScrollTop() - scrollTop,
          left: _this.viewport_.getScrollLeft() - scrollLeft,
          width: size.width,
          height: size.height,
          scrollHeight: scrollHeight,
          scrollWidth: scrollWidth,
          initialSize: {
            scrollHeight: scrollHeight,
            scrollWidth: scrollWidth
          }
        };
        handler(scrollEvent);
      });

      if (this.scrollObservable_.getHandlerCount() === 0) {
        this.addViewportOnChangedListener_();
      }

      return this.scrollObservable_.add(handler);
    }
    /**
     * @param {!../../../src/service/viewport/viewport-interface.ViewportChangedEventDef} e
     * @return {!Promise}
     * @private
     */

  }, {
    key: "onScroll_",
    value: function onScroll_(e) {
      var _this2 = this;

      return Promise.all([// Initial root layout rectangle
      this.getInitRootElementRect_(), // Current root layout rectangle
      this.measureRootElement_()]).then(function (rects) {
        // Initial root layout rectangle
        var _rects$ = rects[0],
            initialScrollHeight = _rects$.height,
            initialScrollWidth = _rects$.width;
        // Current root layout rectangle
        var _rects$2 = rects[1],
            scrollHeight = _rects$2.height,
            scrollLeft = _rects$2.left,
            scrollTop = _rects$2.top,
            scrollWidth = _rects$2.width;

        /** {./scroll-manager.ScrollEventDef} */
        var scrollEvent = {
          // In the case of shadow documents (e.g. amp-next-page), we offset
          // the event's top and left coordinates by the top/left position of
          // the document's container element (so that scroll triggers become relative to
          // container instead of the top-level host page). In the case of a top-level
          // page, the container/root is the document body so scrollTop and scrollLeft
          // are both 0 and the measurements are not affected
          top: e.top - scrollTop,
          left: e.left - scrollLeft,
          width: e.width,
          height: e.height,
          scrollWidth: scrollWidth,
          scrollHeight: scrollHeight,
          initialSize: {
            scrollHeight: initialScrollHeight,
            scrollWidth: initialScrollWidth
          }
        };

        // Fire all of our children scroll observables
        _this2.scrollObservable_.fire(scrollEvent);
      });
    }
    /**
     * Function to remove the viewport onChanged listener
     * @private
     */

  }, {
    key: "removeViewportOnChangedListener_",
    value: function removeViewportOnChangedListener_() {
      if (this.viewportOnChangedUnlistener_) {
        this.viewportOnChangedUnlistener_();
        this.viewportOnChangedUnlistener_ = null;
      }
    }
    /**
     * Function to add the viewport onChanged listener
     * @private
     */

  }, {
    key: "addViewportOnChangedListener_",
    value: function addViewportOnChangedListener_() {
      this.viewportOnChangedUnlistener_ = this.viewport_.onChanged(this.onScroll_.bind(this));
    }
    /**
     * Gets the cached layout rectangle of the root element
     * @return {!Promise<!../../../src/layout-rect.LayoutRectDef>}
     */

  }, {
    key: "getInitRootElementRect_",
    value: function getInitRootElementRect_() {
      return devAssert(this.initialRootRectPromise_ || this.measureRootElement_());
    }
    /**
     * Gets the layout rectangle of the root element
     * @return {!Promise<!../../../src/layout-rect.LayoutRectDef>}
     */

  }, {
    key: "measureRootElement_",
    value: function measureRootElement_() {
      var _this3 = this;

      var rectPromise = this.mutator_.measureElement(function () {
        return _this3.viewport_.getLayoutRect(_this3.root_);
      });
      this.initialRootRectPromise_ = this.initialRootRectPromise_ || rectPromise;
      return rectPromise;
    }
  }]);

  return ScrollManager;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcm9sbC1tYW5hZ2VyLmpzIl0sIm5hbWVzIjpbIk9ic2VydmFibGUiLCJTZXJ2aWNlcyIsImRldkFzc2VydCIsIlNjcm9sbEV2ZW50RGVmIiwiU2Nyb2xsTWFuYWdlciIsInJvb3QiLCJ2aWV3cG9ydF8iLCJ2aWV3cG9ydEZvckRvYyIsImFtcGRvYyIsIm11dGF0b3JfIiwibXV0YXRvckZvckRvYyIsInZpZXdwb3J0T25DaGFuZ2VkVW5saXN0ZW5lcl8iLCJzY3JvbGxPYnNlcnZhYmxlXyIsInJvb3RfIiwiZ2V0Um9vdEVsZW1lbnQiLCJpbml0aWFsUm9vdFJlY3RQcm9taXNlXyIsInJlbW92ZUFsbCIsInJlbW92ZVZpZXdwb3J0T25DaGFuZ2VkTGlzdGVuZXJfIiwiaGFuZGxlciIsInJlbW92ZSIsImdldEhhbmRsZXJDb3VudCIsInNpemUiLCJnZXRTaXplIiwiZ2V0SW5pdFJvb3RFbGVtZW50UmVjdF8iLCJ0aGVuIiwiaW5pdFJvb3RFbGVtZW50UmVjdCIsInNjcm9sbEhlaWdodCIsImhlaWdodCIsInNjcm9sbExlZnQiLCJsZWZ0Iiwic2Nyb2xsVG9wIiwidG9wIiwic2Nyb2xsV2lkdGgiLCJ3aWR0aCIsInNjcm9sbEV2ZW50IiwiZ2V0U2Nyb2xsVG9wIiwiZ2V0U2Nyb2xsTGVmdCIsImluaXRpYWxTaXplIiwiYWRkVmlld3BvcnRPbkNoYW5nZWRMaXN0ZW5lcl8iLCJhZGQiLCJlIiwiUHJvbWlzZSIsImFsbCIsIm1lYXN1cmVSb290RWxlbWVudF8iLCJyZWN0cyIsImluaXRpYWxTY3JvbGxIZWlnaHQiLCJpbml0aWFsU2Nyb2xsV2lkdGgiLCJmaXJlIiwib25DaGFuZ2VkIiwib25TY3JvbGxfIiwiYmluZCIsInJlY3RQcm9taXNlIiwibWVhc3VyZUVsZW1lbnQiLCJnZXRMYXlvdXRSZWN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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LENBQVA7QUFxQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUF2SUE7QUFBQTtBQUFBLFdBd0lFLDRDQUFtQztBQUNqQyxVQUFJLEtBQUt2Qiw0QkFBVCxFQUF1QztBQUNyQyxhQUFLQSw0QkFBTDtBQUNBLGFBQUtBLDRCQUFMLEdBQW9DLElBQXBDO0FBQ0Q7QUFDRjtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQWxKQTtBQUFBO0FBQUEsV0FtSkUseUNBQWdDO0FBQzlCLFdBQUtBLDRCQUFMLEdBQW9DLEtBQUtMLFNBQUwsQ0FBZTBDLFNBQWYsQ0FDbEMsS0FBS0MsU0FBTCxDQUFlQyxJQUFmLENBQW9CLElBQXBCLENBRGtDLENBQXBDO0FBR0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUE1SkE7QUFBQTtBQUFBLFdBNkpFLG1DQUEwQjtBQUN4QixhQUFPaEQsU0FBUyxDQUNkLEtBQUthLHVCQUFMLElBQWdDLEtBQUs0QixtQkFBTCxFQURsQixDQUFoQjtBQUdEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBdEtBO0FBQUE7QUFBQSxXQXVLRSwrQkFBc0I7QUFBQTs7QUFDcEIsVUFBTVEsV0FBVyxHQUFHLEtBQUsxQyxRQUFMLENBQWMyQyxjQUFkLENBQTZCO0FBQUEsZUFDL0MsTUFBSSxDQUFDOUMsU0FBTCxDQUFlK0MsYUFBZixDQUE2QixNQUFJLENBQUN4QyxLQUFsQyxDQUQrQztBQUFBLE9BQTdCLENBQXBCO0FBR0EsV0FBS0UsdUJBQUwsR0FBK0IsS0FBS0EsdUJBQUwsSUFBZ0NvQyxXQUEvRDtBQUNBLGFBQU9BLFdBQVA7QUFDRDtBQTdLSDs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOCBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAnI2NvcmUvZGF0YS1zdHJ1Y3R1cmVzL29ic2VydmFibGUnO1xuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHtkZXZBc3NlcnR9IGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuXG4vKipcbiAqIEB0eXBlZGVmIHt7XG4gKiAgIHRvcDogbnVtYmVyLFxuICogICBsZWZ0OiBudW1iZXIsXG4gKiAgIHdpZHRoOiBudW1iZXIsXG4gKiAgIGhlaWdodDogbnVtYmVyLFxuICogICBzY3JvbGxIZWlnaHQ6IG51bWJlcixcbiAqICAgc2Nyb2xsV2lkdGg6IG51bWJlcixcbiAqICAgaW5pdGlhbFNpemU6IHtcbiAqICAgICAgc2Nyb2xsSGVpZ2h0OiBudW1iZXIsXG4gKiAgICAgIHNjcm9sbFdpZHRoOiBudW1iZXJcbiAqICB9XG4gKiB9fVxuICovXG5leHBvcnQgbGV0IFNjcm9sbEV2ZW50RGVmO1xuXG4vKipcbiAqIEEgbWFuYWdlciBmb3IgaGFuZGxpbmcgbXVsdGlwbGUgU2Nyb2xsIEV2ZW50IFRyYWNrZXJzLlxuICogVGhlIGluc3RhbmNlIG9mIHRoaXMgY2xhc3MgY29ycmVzcG9uZHMgMToxIHRvIGBBbmFseXRpY3NSb290YC4gSXQgcmVwcmVzZW50c1xuICogYSBjb2xsZWN0aW9uIG9mIGFsbCBzY3JvbGwgdHJpZ2dlcnMgZGVjbGFyZWQgd2l0aGluIHRoZSBgQW5hbHl0aWNzUm9vdGAuXG4gKiBAaW1wbGVtZW50cyB7Li4vLi4vLi4vc3JjL3NlcnZpY2UuRGlzcG9zYWJsZX1cbiAqL1xuZXhwb3J0IGNsYXNzIFNjcm9sbE1hbmFnZXIge1xuICAvKipcbiAgICogQHBhcmFtIHshLi9hbmFseXRpY3Mtcm9vdC5BbmFseXRpY3NSb290fSByb290XG4gICAqL1xuICBjb25zdHJ1Y3Rvcihyb290KSB7XG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL3ZpZXdwb3J0L3ZpZXdwb3J0LWludGVyZmFjZS5WaWV3cG9ydEludGVyZmFjZX0gKi9cbiAgICB0aGlzLnZpZXdwb3J0XyA9IFNlcnZpY2VzLnZpZXdwb3J0Rm9yRG9jKHJvb3QuYW1wZG9jKTtcblxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgeyEuLi8uLi8uLi9zcmMvc2VydmljZS9tdXRhdG9yLWludGVyZmFjZS5NdXRhdG9ySW50ZXJmYWNlfSAqL1xuICAgIHRoaXMubXV0YXRvcl8gPSBTZXJ2aWNlcy5tdXRhdG9yRm9yRG9jKHJvb3QuYW1wZG9jKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P1VubGlzdGVuRGVmfSAqL1xuICAgIHRoaXMudmlld3BvcnRPbkNoYW5nZWRVbmxpc3RlbmVyXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgeyFPYnNlcnZhYmxlPCEuL3Njcm9sbC1tYW5hZ2VyLlNjcm9sbEV2ZW50RGVmPn0gKi9cbiAgICB0aGlzLnNjcm9sbE9ic2VydmFibGVfID0gbmV3IE9ic2VydmFibGUoKTtcblxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgeyFFbGVtZW50fSAqL1xuICAgIHRoaXMucm9vdF8gPSByb290LmdldFJvb3RFbGVtZW50KCk7XG5cbiAgICAvKiogIEBwcml2YXRlIHs/UHJvbWlzZX0gKi9cbiAgICB0aGlzLmluaXRpYWxSb290UmVjdFByb21pc2VfID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBGdW5jdGlvbiB0byBkaXNwb3NlIG9mIGFsbCBoYW5kbGVycyBvbiB0aGUgc2Nyb2xsIG9ic2VydmFibGVcbiAgICovXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5zY3JvbGxPYnNlcnZhYmxlXy5yZW1vdmVBbGwoKTtcbiAgICB0aGlzLnJlbW92ZVZpZXdwb3J0T25DaGFuZ2VkTGlzdGVuZXJfKCk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtmdW5jdGlvbighT2JqZWN0KX0gaGFuZGxlclxuICAgKi9cbiAgcmVtb3ZlU2Nyb2xsSGFuZGxlcihoYW5kbGVyKSB7XG4gICAgdGhpcy5zY3JvbGxPYnNlcnZhYmxlXy5yZW1vdmUoaGFuZGxlcik7XG5cbiAgICBpZiAodGhpcy5zY3JvbGxPYnNlcnZhYmxlXy5nZXRIYW5kbGVyQ291bnQoKSA8PSAwKSB7XG4gICAgICB0aGlzLnJlbW92ZVZpZXdwb3J0T25DaGFuZ2VkTGlzdGVuZXJfKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIU9iamVjdCl9IGhhbmRsZXJcbiAgICogQHJldHVybiB7IVVubGlzdGVuRGVmfVxuICAgKi9cbiAgYWRkU2Nyb2xsSGFuZGxlcihoYW5kbGVyKSB7XG4gICAgLy8gVHJpZ2dlciBhbiBldmVudCB0byBmaXJlIGV2ZW50cyB0aGF0IG1pZ2h0IGhhdmUgYWxyZWFkeSBoYXBwZW5lZC5cbiAgICBjb25zdCBzaXplID0gdGhpcy52aWV3cG9ydF8uZ2V0U2l6ZSgpO1xuXG4gICAgdGhpcy5nZXRJbml0Um9vdEVsZW1lbnRSZWN0XygpLnRoZW4oKGluaXRSb290RWxlbWVudFJlY3QpID0+IHtcbiAgICAgIC8vIEluIHRoZSBjYXNlIG9mIHNoYWRvdy9lbWJlZGRlZCBkb2N1bWVudHMsIHRoZSByb290IGVsZW1lbnQnc1xuICAgICAgLy8gbGF5b3V0UmVjdCBpcyByZWxhdGl2ZSB0byB0aGUgcGFyZW50IGRvYydzIG9yaWdpblxuICAgICAgY29uc3Qge1xuICAgICAgICBoZWlnaHQ6IHNjcm9sbEhlaWdodCxcbiAgICAgICAgbGVmdDogc2Nyb2xsTGVmdCxcbiAgICAgICAgdG9wOiBzY3JvbGxUb3AsXG4gICAgICAgIHdpZHRoOiBzY3JvbGxXaWR0aCxcbiAgICAgIH0gPSBpbml0Um9vdEVsZW1lbnRSZWN0O1xuXG4gICAgICAvKiogey4vc2Nyb2xsLW1hbmFnZXIuU2Nyb2xsRXZlbnREZWZ9ICovXG4gICAgICBjb25zdCBzY3JvbGxFdmVudCA9IHtcbiAgICAgICAgLy8gSW4gdGhlIGNhc2Ugb2Ygc2hhZG93IGRvY3VtZW50cyAoZS5nLiBhbXAtbmV4dC1wYWdlKSwgd2Ugb2Zmc2V0XG4gICAgICAgIC8vIHRoZSBldmVudCdzIHRvcCBhbmQgbGVmdCBjb29yZGluYXRlcyBieSB0aGUgdG9wL2xlZnQgcG9zaXRpb24gb2ZcbiAgICAgICAgLy8gdGhlIGRvY3VtZW50J3MgY29udGFpbmVyIGVsZW1lbnQgKHNvIHRoYXQgc2Nyb2xsIHRyaWdnZXJzIGJlY29tZSByZWxhdGl2ZSB0b1xuICAgICAgICAvLyBjb250YWluZXIgaW5zdGVhZCBvZiB0aGUgdG9wLWxldmVsIGhvc3QgcGFnZSkuIEluIHRoZSBjYXNlIG9mIGEgdG9wLWxldmVsXG4gICAgICAgIC8vIHBhZ2UsIHRoZSBjb250YWluZXIvcm9vdCBpcyB0aGUgZG9jdW1lbnQgYm9keSBzbyBzY3JvbGxUb3AgYW5kIHNjcm9sbExlZnRcbiAgICAgICAgLy8gYXJlIGJvdGggMCBhbmQgdGhlIG1lYXN1cmVtZW50cyBhcmUgbm90IGFmZmVjdGVkXG4gICAgICAgIHRvcDogdGhpcy52aWV3cG9ydF8uZ2V0U2Nyb2xsVG9wKCkgLSBzY3JvbGxUb3AsXG4gICAgICAgIGxlZnQ6IHRoaXMudmlld3BvcnRfLmdldFNjcm9sbExlZnQoKSAtIHNjcm9sbExlZnQsXG4gICAgICAgIHdpZHRoOiBzaXplLndpZHRoLFxuICAgICAgICBoZWlnaHQ6IHNpemUuaGVpZ2h0LFxuICAgICAgICBzY3JvbGxIZWlnaHQsXG4gICAgICAgIHNjcm9sbFdpZHRoLFxuICAgICAgICBpbml0aWFsU2l6ZToge3Njcm9sbEhlaWdodCwgc2Nyb2xsV2lkdGh9LFxuICAgICAgfTtcbiAgICAgIGhhbmRsZXIoc2Nyb2xsRXZlbnQpO1xuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMuc2Nyb2xsT2JzZXJ2YWJsZV8uZ2V0SGFuZGxlckNvdW50KCkgPT09IDApIHtcbiAgICAgIHRoaXMuYWRkVmlld3BvcnRPbkNoYW5nZWRMaXN0ZW5lcl8oKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zY3JvbGxPYnNlcnZhYmxlXy5hZGQoaGFuZGxlcik7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshLi4vLi4vLi4vc3JjL3NlcnZpY2Uvdmlld3BvcnQvdmlld3BvcnQtaW50ZXJmYWNlLlZpZXdwb3J0Q2hhbmdlZEV2ZW50RGVmfSBlXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25TY3JvbGxfKGUpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAgLy8gSW5pdGlhbCByb290IGxheW91dCByZWN0YW5nbGVcbiAgICAgIHRoaXMuZ2V0SW5pdFJvb3RFbGVtZW50UmVjdF8oKSxcbiAgICAgIC8vIEN1cnJlbnQgcm9vdCBsYXlvdXQgcmVjdGFuZ2xlXG4gICAgICB0aGlzLm1lYXN1cmVSb290RWxlbWVudF8oKSxcbiAgICBdKS50aGVuKChyZWN0cykgPT4ge1xuICAgICAgLy8gSW5pdGlhbCByb290IGxheW91dCByZWN0YW5nbGVcbiAgICAgIGNvbnN0IHtoZWlnaHQ6IGluaXRpYWxTY3JvbGxIZWlnaHQsIHdpZHRoOiBpbml0aWFsU2Nyb2xsV2lkdGh9ID0gcmVjdHNbMF07XG4gICAgICAvLyBDdXJyZW50IHJvb3QgbGF5b3V0IHJlY3RhbmdsZVxuICAgICAgY29uc3Qge1xuICAgICAgICBoZWlnaHQ6IHNjcm9sbEhlaWdodCxcbiAgICAgICAgbGVmdDogc2Nyb2xsTGVmdCxcbiAgICAgICAgdG9wOiBzY3JvbGxUb3AsXG4gICAgICAgIHdpZHRoOiBzY3JvbGxXaWR0aCxcbiAgICAgIH0gPSByZWN0c1sxXTtcbiAgICAgIC8qKiB7Li9zY3JvbGwtbWFuYWdlci5TY3JvbGxFdmVudERlZn0gKi9cbiAgICAgIGNvbnN0IHNjcm9sbEV2ZW50ID0ge1xuICAgICAgICAvLyBJbiB0aGUgY2FzZSBvZiBzaGFkb3cgZG9jdW1lbnRzIChlLmcuIGFtcC1uZXh0LXBhZ2UpLCB3ZSBvZmZzZXRcbiAgICAgICAgLy8gdGhlIGV2ZW50J3MgdG9wIGFuZCBsZWZ0IGNvb3JkaW5hdGVzIGJ5IHRoZSB0b3AvbGVmdCBwb3NpdGlvbiBvZlxuICAgICAgICAvLyB0aGUgZG9jdW1lbnQncyBjb250YWluZXIgZWxlbWVudCAoc28gdGhhdCBzY3JvbGwgdHJpZ2dlcnMgYmVjb21lIHJlbGF0aXZlIHRvXG4gICAgICAgIC8vIGNvbnRhaW5lciBpbnN0ZWFkIG9mIHRoZSB0b3AtbGV2ZWwgaG9zdCBwYWdlKS4gSW4gdGhlIGNhc2Ugb2YgYSB0b3AtbGV2ZWxcbiAgICAgICAgLy8gcGFnZSwgdGhlIGNvbnRhaW5lci9yb290IGlzIHRoZSBkb2N1bWVudCBib2R5IHNvIHNjcm9sbFRvcCBhbmQgc2Nyb2xsTGVmdFxuICAgICAgICAvLyBhcmUgYm90aCAwIGFuZCB0aGUgbWVhc3VyZW1lbnRzIGFyZSBub3QgYWZmZWN0ZWRcbiAgICAgICAgdG9wOiBlLnRvcCAtIHNjcm9sbFRvcCxcbiAgICAgICAgbGVmdDogZS5sZWZ0IC0gc2Nyb2xsTGVmdCxcbiAgICAgICAgd2lkdGg6IGUud2lkdGgsXG4gICAgICAgIGhlaWdodDogZS5oZWlnaHQsXG4gICAgICAgIHNjcm9sbFdpZHRoLFxuICAgICAgICBzY3JvbGxIZWlnaHQsXG4gICAgICAgIGluaXRpYWxTaXplOiB7XG4gICAgICAgICAgc2Nyb2xsSGVpZ2h0OiBpbml0aWFsU2Nyb2xsSGVpZ2h0LFxuICAgICAgICAgIHNjcm9sbFdpZHRoOiBpbml0aWFsU2Nyb2xsV2lkdGgsXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgICAgLy8gRmlyZSBhbGwgb2Ygb3VyIGNoaWxkcmVuIHNjcm9sbCBvYnNlcnZhYmxlc1xuICAgICAgdGhpcy5zY3JvbGxPYnNlcnZhYmxlXy5maXJlKHNjcm9sbEV2ZW50KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGdW5jdGlvbiB0byByZW1vdmUgdGhlIHZpZXdwb3J0IG9uQ2hhbmdlZCBsaXN0ZW5lclxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcmVtb3ZlVmlld3BvcnRPbkNoYW5nZWRMaXN0ZW5lcl8oKSB7XG4gICAgaWYgKHRoaXMudmlld3BvcnRPbkNoYW5nZWRVbmxpc3RlbmVyXykge1xuICAgICAgdGhpcy52aWV3cG9ydE9uQ2hhbmdlZFVubGlzdGVuZXJfKCk7XG4gICAgICB0aGlzLnZpZXdwb3J0T25DaGFuZ2VkVW5saXN0ZW5lcl8gPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGdW5jdGlvbiB0byBhZGQgdGhlIHZpZXdwb3J0IG9uQ2hhbmdlZCBsaXN0ZW5lclxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYWRkVmlld3BvcnRPbkNoYW5nZWRMaXN0ZW5lcl8oKSB7XG4gICAgdGhpcy52aWV3cG9ydE9uQ2hhbmdlZFVubGlzdGVuZXJfID0gdGhpcy52aWV3cG9ydF8ub25DaGFuZ2VkKFxuICAgICAgdGhpcy5vblNjcm9sbF8uYmluZCh0aGlzKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgY2FjaGVkIGxheW91dCByZWN0YW5nbGUgb2YgdGhlIHJvb3QgZWxlbWVudFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhLi4vLi4vLi4vc3JjL2xheW91dC1yZWN0LkxheW91dFJlY3REZWY+fVxuICAgKi9cbiAgZ2V0SW5pdFJvb3RFbGVtZW50UmVjdF8oKSB7XG4gICAgcmV0dXJuIGRldkFzc2VydChcbiAgICAgIHRoaXMuaW5pdGlhbFJvb3RSZWN0UHJvbWlzZV8gfHwgdGhpcy5tZWFzdXJlUm9vdEVsZW1lbnRfKClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGxheW91dCByZWN0YW5nbGUgb2YgdGhlIHJvb3QgZWxlbWVudFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhLi4vLi4vLi4vc3JjL2xheW91dC1yZWN0LkxheW91dFJlY3REZWY+fVxuICAgKi9cbiAgbWVhc3VyZVJvb3RFbGVtZW50XygpIHtcbiAgICBjb25zdCByZWN0UHJvbWlzZSA9IHRoaXMubXV0YXRvcl8ubWVhc3VyZUVsZW1lbnQoKCkgPT5cbiAgICAgIHRoaXMudmlld3BvcnRfLmdldExheW91dFJlY3QodGhpcy5yb290XylcbiAgICApO1xuICAgIHRoaXMuaW5pdGlhbFJvb3RSZWN0UHJvbWlzZV8gPSB0aGlzLmluaXRpYWxSb290UmVjdFByb21pc2VfIHx8IHJlY3RQcm9taXNlO1xuICAgIHJldHVybiByZWN0UHJvbWlzZTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/scroll-manager.js