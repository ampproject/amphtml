function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import { Disposable } from "../../service-helpers";

/**
 * @typedef {{
 *   relayoutAll: boolean,
 *   top: number,
 *   left: number,
 *   width: number,
 *   height: number,
 *   velocity: number
 * }}
 */
export var ViewportChangedEventDef;

/**
 * @typedef {{
 *   relayoutAll: boolean,
 *   width: number,
 *   height: number
 * }}
 */
export var ViewportResizedEventDef;

/* eslint-disable no-unused-vars */

/**
 * @interface
 */
export var ViewportInterface = /*#__PURE__*/function (_Disposable) {
  _inherits(ViewportInterface, _Disposable);

  var _super = _createSuper(ViewportInterface);

  function ViewportInterface() {
    _classCallCheck(this, ViewportInterface);

    return _super.apply(this, arguments);
  }

  _createClass(ViewportInterface, [{
    key: "ensureReadyForElements",
    value:
    /**
     * Called before a first AMP element is added to resources. Called in the
     * mutate context.
     */
    function ensureReadyForElements() {}
    /**
     * Returns the top padding mandated by the viewer.
     * @return {number}
     */

  }, {
    key: "getPaddingTop",
    value: function getPaddingTop() {}
    /**
     * Returns the viewport's vertical scroll position.
     * @return {number}
     */

  }, {
    key: "getScrollTop",
    value: function getScrollTop() {}
    /**
     * Returns the viewport's horizontal scroll position.
     * @return {number}
     */

  }, {
    key: "getScrollLeft",
    value: function getScrollLeft() {}
    /**
     * Sets the desired scroll position on the viewport.
     * @param {number} scrollPos
     */

  }, {
    key: "setScrollTop",
    value: function setScrollTop(scrollPos) {}
    /**
     * Sets the body padding bottom to the specified value.
     * @param {number} paddingBottom
     */

  }, {
    key: "updatePaddingBottom",
    value: function updatePaddingBottom(paddingBottom) {}
    /**
     * Returns the size of the viewport.
     * @return {!{width: number, height: number}}
     */

  }, {
    key: "getSize",
    value: function getSize() {}
    /**
     * Returns the height of the viewport.
     * @return {number}
     */

  }, {
    key: "getHeight",
    value: function getHeight() {}
    /**
     * Returns the width of the viewport.
     * @return {number}
     */

  }, {
    key: "getWidth",
    value: function getWidth() {}
    /**
     * Returns the scroll width of the content of the document. Note that this
     * method is not cached since we there's no indication when it might change.
     * @return {number}
     */

  }, {
    key: "getScrollWidth",
    value: function getScrollWidth() {}
    /**
     * Returns the scroll height of the content of the document, including the
     * padding top for the viewer header.
     * The scrollHeight will be the viewport height if there's not enough content
     * to fill up the viewport.
     * Note that this method is not cached since we there's no indication when
     * it might change.
     * @return {number}
     */

  }, {
    key: "getScrollHeight",
    value: function getScrollHeight() {}
    /**
     * Returns the height of the content of the document, including the
     * padding top for the viewer header.
     * contentHeight will match scrollHeight in all cases unless the viewport is
     * taller than the content.
     * Note that this method is not cached since we there's no indication when
     * it might change.
     * @return {number}
     */

  }, {
    key: "getContentHeight",
    value: function getContentHeight() {}
    /**
     * Resource manager signals to the viewport that content height is changed
     * and some action may need to be taken.
     * @restricted Use is restricted due to potentially very heavy performance
     *   impact. Can only be called when not actively scrolling.
     */

  }, {
    key: "contentHeightChanged",
    value: function contentHeightChanged() {}
    /**
     * Returns the rect of the viewport which includes scroll positions and size.
     * @return {!../../layout-rect.LayoutRectDef}}
     */

  }, {
    key: "getRect",
    value: function getRect() {}
    /**
     * Returns the rect of the element within the document.
     * Note that this function should be called in vsync measure. Please consider
     * using `getClientRectAsync` instead.
     * @param {!Element} el
     * @return {!../../layout-rect.LayoutRectDef}
     */

  }, {
    key: "getLayoutRect",
    value: function getLayoutRect(el) {}
    /**
     * Returns the clientRect of the element.
     * Note: This method does not taking intersection into account.
     * @param {!Element} el
     * @return {!Promise<!../../layout-rect.LayoutRectDef>}
     */

  }, {
    key: "getClientRectAsync",
    value: function getClientRectAsync(el) {}
    /**
     * Whether the binding supports fix-positioned elements.
     * @return {boolean}
     */

  }, {
    key: "supportsPositionFixed",
    value: function supportsPositionFixed() {}
    /**
     * Whether the element is declared as fixed in any of the user's stylesheets.
     * Will include any matches, not necessarily currently fixed elements.
     * @param {!Element} element
     * @return {boolean}
     */

  }, {
    key: "isDeclaredFixed",
    value: function isDeclaredFixed(element) {}
    /**
     * Scrolls element into view much like Element. scrollIntoView does but
     * in the AMP/Viewer environment.
     * @param {!Element} element
     * @return {!Promise}
     */

  }, {
    key: "scrollIntoView",
    value: function scrollIntoView(element) {}
    /**
     * Scrolls element into view much like Element. scrollIntoView does but
     * in the AMP/Viewer environment. Adds animation for the sccrollIntoView
     * transition.
     *
     * @param {!Element} element
     * @param {string=} pos (takes one of 'top', 'bottom', 'center')
     * @param {number=} opt_duration
     * @param {string=} opt_curve
     * @return {!Promise}
     */

  }, {
    key: "animateScrollIntoView",
    value: function animateScrollIntoView(element, pos, opt_duration, opt_curve) {
      if (pos === void 0) {
        pos = 'top';
      }
    }
    /**
     * @param {!Element} element
     * @param {!Element} parent Should be scrollable.
     * @param {string} pos (takes one of 'top', 'bottom', 'center')
     * @param {number=} opt_duration
     * @param {string=} opt_curve
     * @return {!Promise}
     */

  }, {
    key: "animateScrollWithinParent",
    value: function animateScrollWithinParent(element, parent, pos, opt_duration, opt_curve) {}
    /**
     * @return {!Element}
     */

  }, {
    key: "getScrollingElement",
    value: function getScrollingElement() {}
    /**
     * Registers the handler for ViewportChangedEventDef events.
     * @param {function(!ViewportChangedEventDef)} handler
     * @return {!UnlistenDef}
     */

  }, {
    key: "onChanged",
    value: function onChanged(handler) {}
    /**
     * Registers the handler for scroll events. These events DO NOT contain
     * scrolling offset and it's discouraged to read scrolling offset in the
     * event handler. The primary use case for this handler is to inform that
     * scrolling might be going on. To get more information {@link onChanged}
     * handler should be used.
     * @param {function()} handler
     * @return {!UnlistenDef}
     */

  }, {
    key: "onScroll",
    value: function onScroll(handler) {}
    /**
     * Registers the handler for ViewportResizedEventDef events.
     *
     * Note that there is a known bug in Webkit that causes window.innerWidth
     * and window.innerHeight values to be incorrect after resize. A temporary
     * fix is to add a 500 ms delay before computing these values.
     * Link: https://bugs.webkit.org/show_bug.cgi?id=170595
     *
     * @param {function(!ViewportResizedEventDef)} handler
     * @return {!UnlistenDef}
     */

  }, {
    key: "onResize",
    value: function onResize(handler) {}
    /**
     * Instruct the viewport to enter lightbox mode.
     * @param {!Element=} opt_requestingElement Must be provided to be able to
     *     enter lightbox mode under FIE cases.
     * @param {!Promise=} opt_onComplete Optional promise that's resolved when
     *     the caller finishes opening the lightbox e.g. transition animations.
     * @return {!Promise}
     */

  }, {
    key: "enterLightboxMode",
    value: function enterLightboxMode(opt_requestingElement, opt_onComplete) {}
    /**
     * Instruct the viewport to leave lightbox mode.
     * @param {!Element=} opt_requestingElement Must be provided to be able to
     *     enter lightbox mode under FIE cases.
     * @return {!Promise}
     */

  }, {
    key: "leaveLightboxMode",
    value: function leaveLightboxMode(opt_requestingElement) {}
    /**
     * Instruct the viewport to enter overlay mode.
     */

  }, {
    key: "enterOverlayMode",
    value: function enterOverlayMode() {}
    /**
     * Instruct the viewport to leave overlay mode.
     */

  }, {
    key: "leaveOverlayMode",
    value: function leaveOverlayMode() {}
    /**
     * Disable the scrolling by setting overflow: hidden.
     * Should only be used for temporarily disabling scroll.
     */

  }, {
    key: "disableScroll",
    value: function disableScroll() {}
    /**
     * Reset the scrolling by removing overflow: hidden.
     */

  }, {
    key: "resetScroll",
    value: function resetScroll() {}
    /**
     * Resets touch zoom to initial scale of 1.
     */

  }, {
    key: "resetTouchZoom",
    value: function resetTouchZoom() {}
    /**
     * Disables touch zoom on this viewport. Returns `true` if any actual
     * changes have been done.
     * @return {boolean}
     */

  }, {
    key: "disableTouchZoom",
    value: function disableTouchZoom() {}
    /**
     * Restores original touch zoom parameters. Returns `true` if any actual
     * changes have been done.
     * @return {boolean}
     */

  }, {
    key: "restoreOriginalTouchZoom",
    value: function restoreOriginalTouchZoom() {}
    /**
     * Updates the fixed layer.
     * @return {!Promise}
     */

  }, {
    key: "updateFixedLayer",
    value: function updateFixedLayer() {}
    /**
     * Adds the element to the fixed layer.
     * @param {!Element} element
     * @param {boolean=} opt_forceTransfer If set to true , then the element needs
     *    to be forcefully transferred to the fixed layer.
     * @return {!Promise}
     */

  }, {
    key: "addToFixedLayer",
    value: function addToFixedLayer(element, opt_forceTransfer) {}
    /**
     * Removes the element from the fixed layer.
     * @param {!Element} element
     */

  }, {
    key: "removeFromFixedLayer",
    value: function removeFromFixedLayer(element) {}
    /**
     * Create fixed layer from constructor (invoked by viewer integration)
     * @param {typeof ../fixed-layer.FixedLayer} constructor
     */

  }, {
    key: "createFixedLayer",
    value: function createFixedLayer(constructor) {}
  }]);

  return ViewportInterface;
}(Disposable);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZpZXdwb3J0LWludGVyZmFjZS5qcyJdLCJuYW1lcyI6WyJEaXNwb3NhYmxlIiwiVmlld3BvcnRDaGFuZ2VkRXZlbnREZWYiLCJWaWV3cG9ydFJlc2l6ZWRFdmVudERlZiIsIlZpZXdwb3J0SW50ZXJmYWNlIiwic2Nyb2xsUG9zIiwicGFkZGluZ0JvdHRvbSIsImVsIiwiZWxlbWVudCIsInBvcyIsIm9wdF9kdXJhdGlvbiIsIm9wdF9jdXJ2ZSIsInBhcmVudCIsImhhbmRsZXIiLCJvcHRfcmVxdWVzdGluZ0VsZW1lbnQiLCJvcHRfb25Db21wbGV0ZSIsIm9wdF9mb3JjZVRyYW5zZmVyIiwiY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsVUFBUjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sSUFBSUMsdUJBQUo7O0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQUlDLHVCQUFKOztBQUVQOztBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQWFDLGlCQUFiO0FBQUE7O0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUNFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0Usc0NBQXlCLENBQUU7QUFFM0I7QUFDRjtBQUNBO0FBQ0E7O0FBVkE7QUFBQTtBQUFBLFdBV0UseUJBQWdCLENBQUU7QUFFbEI7QUFDRjtBQUNBO0FBQ0E7O0FBaEJBO0FBQUE7QUFBQSxXQWlCRSx3QkFBZSxDQUFFO0FBRWpCO0FBQ0Y7QUFDQTtBQUNBOztBQXRCQTtBQUFBO0FBQUEsV0F1QkUseUJBQWdCLENBQUU7QUFFbEI7QUFDRjtBQUNBO0FBQ0E7O0FBNUJBO0FBQUE7QUFBQSxXQTZC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QUF5QyxDQUFFO0FBRTNDO0FBQ0Y7QUFDQTs7QUF4TkE7QUFBQTtBQUFBLFdBeU5FLDRCQUFtQixDQUFFO0FBRXJCO0FBQ0Y7QUFDQTs7QUE3TkE7QUFBQTtBQUFBLFdBOE5FLDRCQUFtQixDQUFFO0FBRXJCO0FBQ0Y7QUFDQTtBQUNBOztBQW5PQTtBQUFBO0FBQUEsV0FvT0UseUJBQWdCLENBQUU7QUFFbEI7QUFDRjtBQUNBOztBQXhPQTtBQUFBO0FBQUEsV0F5T0UsdUJBQWMsQ0FBRTtBQUVoQjtBQUNGO0FBQ0E7O0FBN09BO0FBQUE7QUFBQSxXQThPRSwwQkFBaUIsQ0FBRTtBQUVuQjtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQXBQQTtBQUFBO0FBQUEsV0FxUEUsNEJBQW1CLENBQUU7QUFFckI7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUEzUEE7QUFBQTtBQUFBLFdBNFBFLG9DQUEyQixDQUFFO0FBRTdCO0FBQ0Y7QUFDQTtBQUNBOztBQWpRQTtBQUFBO0FBQUEsV0FrUUUsNEJBQW1CLENBQUU7QUFFckI7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBMVFBO0FBQUE7QUFBQSxXQTJRRSx5QkFBZ0JOLE9BQWhCLEVBQXlCUSxpQkFBekIsRUFBNEMsQ0FBRTtBQUU5QztBQUNGO0FBQ0E7QUFDQTs7QUFoUkE7QUFBQTtBQUFBLFdBaVJFLDhCQUFxQlIsT0FBckIsRUFBOEIsQ0FBRTtBQUVoQztBQUNGO0FBQ0E7QUFDQTs7QUF0UkE7QUFBQTtBQUFBLFdBdVJFLDBCQUFpQlMsV0FBakIsRUFBOEIsQ0FBRTtBQXZSbEM7O0FBQUE7QUFBQSxFQUF1Q2hCLFVBQXZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7RGlzcG9zYWJsZX0gZnJvbSAnLi4vLi4vc2VydmljZS1oZWxwZXJzJztcblxuLyoqXG4gKiBAdHlwZWRlZiB7e1xuICogICByZWxheW91dEFsbDogYm9vbGVhbixcbiAqICAgdG9wOiBudW1iZXIsXG4gKiAgIGxlZnQ6IG51bWJlcixcbiAqICAgd2lkdGg6IG51bWJlcixcbiAqICAgaGVpZ2h0OiBudW1iZXIsXG4gKiAgIHZlbG9jaXR5OiBudW1iZXJcbiAqIH19XG4gKi9cbmV4cG9ydCBsZXQgVmlld3BvcnRDaGFuZ2VkRXZlbnREZWY7XG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqICAgcmVsYXlvdXRBbGw6IGJvb2xlYW4sXG4gKiAgIHdpZHRoOiBudW1iZXIsXG4gKiAgIGhlaWdodDogbnVtYmVyXG4gKiB9fVxuICovXG5leHBvcnQgbGV0IFZpZXdwb3J0UmVzaXplZEV2ZW50RGVmO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuLyoqXG4gKiBAaW50ZXJmYWNlXG4gKi9cbmV4cG9ydCBjbGFzcyBWaWV3cG9ydEludGVyZmFjZSBleHRlbmRzIERpc3Bvc2FibGUge1xuICAvKipcbiAgICogQ2FsbGVkIGJlZm9yZSBhIGZpcnN0IEFNUCBlbGVtZW50IGlzIGFkZGVkIHRvIHJlc291cmNlcy4gQ2FsbGVkIGluIHRoZVxuICAgKiBtdXRhdGUgY29udGV4dC5cbiAgICovXG4gIGVuc3VyZVJlYWR5Rm9yRWxlbWVudHMoKSB7fVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB0b3AgcGFkZGluZyBtYW5kYXRlZCBieSB0aGUgdmlld2VyLlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqL1xuICBnZXRQYWRkaW5nVG9wKCkge31cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdmlld3BvcnQncyB2ZXJ0aWNhbCBzY3JvbGwgcG9zaXRpb24uXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICovXG4gIGdldFNjcm9sbFRvcCgpIHt9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHZpZXdwb3J0J3MgaG9yaXpvbnRhbCBzY3JvbGwgcG9zaXRpb24uXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICovXG4gIGdldFNjcm9sbExlZnQoKSB7fVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkZXNpcmVkIHNjcm9sbCBwb3NpdGlvbiBvbiB0aGUgdmlld3BvcnQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzY3JvbGxQb3NcbiAgICovXG4gIHNldFNjcm9sbFRvcChzY3JvbGxQb3MpIHt9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGJvZHkgcGFkZGluZyBib3R0b20gdG8gdGhlIHNwZWNpZmllZCB2YWx1ZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHBhZGRpbmdCb3R0b21cbiAgICovXG4gIHVwZGF0ZVBhZGRpbmdCb3R0b20ocGFkZGluZ0JvdHRvbSkge31cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgc2l6ZSBvZiB0aGUgdmlld3BvcnQuXG4gICAqIEByZXR1cm4geyF7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fVxuICAgKi9cbiAgZ2V0U2l6ZSgpIHt9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGhlaWdodCBvZiB0aGUgdmlld3BvcnQuXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICovXG4gIGdldEhlaWdodCgpIHt9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHdpZHRoIG9mIHRoZSB2aWV3cG9ydC5cbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKi9cbiAgZ2V0V2lkdGgoKSB7fVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzY3JvbGwgd2lkdGggb2YgdGhlIGNvbnRlbnQgb2YgdGhlIGRvY3VtZW50LiBOb3RlIHRoYXQgdGhpc1xuICAgKiBtZXRob2QgaXMgbm90IGNhY2hlZCBzaW5jZSB3ZSB0aGVyZSdzIG5vIGluZGljYXRpb24gd2hlbiBpdCBtaWdodCBjaGFuZ2UuXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICovXG4gIGdldFNjcm9sbFdpZHRoKCkge31cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgc2Nyb2xsIGhlaWdodCBvZiB0aGUgY29udGVudCBvZiB0aGUgZG9jdW1lbnQsIGluY2x1ZGluZyB0aGVcbiAgICogcGFkZGluZyB0b3AgZm9yIHRoZSB2aWV3ZXIgaGVhZGVyLlxuICAgKiBUaGUgc2Nyb2xsSGVpZ2h0IHdpbGwgYmUgdGhlIHZpZXdwb3J0IGhlaWdodCBpZiB0aGVyZSdzIG5vdCBlbm91Z2ggY29udGVudFxuICAgKiB0byBmaWxsIHVwIHRoZSB2aWV3cG9ydC5cbiAgICogTm90ZSB0aGF0IHRoaXMgbWV0aG9kIGlzIG5vdCBjYWNoZWQgc2luY2Ugd2UgdGhlcmUncyBubyBpbmRpY2F0aW9uIHdoZW5cbiAgICogaXQgbWlnaHQgY2hhbmdlLlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqL1xuICBnZXRTY3JvbGxIZWlnaHQoKSB7fVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBoZWlnaHQgb2YgdGhlIGNvbnRlbnQgb2YgdGhlIGRvY3VtZW50LCBpbmNsdWRpbmcgdGhlXG4gICAqIHBhZGRpbmcgdG9wIGZvciB0aGUgdmlld2VyIGhlYWRlci5cbiAgICogY29udGVudEhlaWdodCB3aWxsIG1hdGNoIHNjcm9sbEhlaWdodCBpbiBhbGwgY2FzZXMgdW5sZXNzIHRoZSB2aWV3cG9ydCBpc1xuICAgKiB0YWxsZXIgdGhhbiB0aGUgY29udGVudC5cbiAgICogTm90ZSB0aGF0IHRoaXMgbWV0aG9kIGlzIG5vdCBjYWNoZWQgc2luY2Ugd2UgdGhlcmUncyBubyBpbmRpY2F0aW9uIHdoZW5cbiAgICogaXQgbWlnaHQgY2hhbmdlLlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqL1xuICBnZXRDb250ZW50SGVpZ2h0KCkge31cblxuICAvKipcbiAgICogUmVzb3VyY2UgbWFuYWdlciBzaWduYWxzIHRvIHRoZSB2aWV3cG9ydCB0aGF0IGNvbnRlbnQgaGVpZ2h0IGlzIGNoYW5nZWRcbiAgICogYW5kIHNvbWUgYWN0aW9uIG1heSBuZWVkIHRvIGJlIHRha2VuLlxuICAgKiBAcmVzdHJpY3RlZCBVc2UgaXMgcmVzdHJpY3RlZCBkdWUgdG8gcG90ZW50aWFsbHkgdmVyeSBoZWF2eSBwZXJmb3JtYW5jZVxuICAgKiAgIGltcGFjdC4gQ2FuIG9ubHkgYmUgY2FsbGVkIHdoZW4gbm90IGFjdGl2ZWx5IHNjcm9sbGluZy5cbiAgICovXG4gIGNvbnRlbnRIZWlnaHRDaGFuZ2VkKCkge31cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcmVjdCBvZiB0aGUgdmlld3BvcnQgd2hpY2ggaW5jbHVkZXMgc2Nyb2xsIHBvc2l0aW9ucyBhbmQgc2l6ZS5cbiAgICogQHJldHVybiB7IS4uLy4uL2xheW91dC1yZWN0LkxheW91dFJlY3REZWZ9fVxuICAgKi9cbiAgZ2V0UmVjdCgpIHt9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHJlY3Qgb2YgdGhlIGVsZW1lbnQgd2l0aGluIHRoZSBkb2N1bWVudC5cbiAgICogTm90ZSB0aGF0IHRoaXMgZnVuY3Rpb24gc2hvdWxkIGJlIGNhbGxlZCBpbiB2c3luYyBtZWFzdXJlLiBQbGVhc2UgY29uc2lkZXJcbiAgICogdXNpbmcgYGdldENsaWVudFJlY3RBc3luY2AgaW5zdGVhZC5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxcbiAgICogQHJldHVybiB7IS4uLy4uL2xheW91dC1yZWN0LkxheW91dFJlY3REZWZ9XG4gICAqL1xuICBnZXRMYXlvdXRSZWN0KGVsKSB7fVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjbGllbnRSZWN0IG9mIHRoZSBlbGVtZW50LlxuICAgKiBOb3RlOiBUaGlzIG1ldGhvZCBkb2VzIG5vdCB0YWtpbmcgaW50ZXJzZWN0aW9uIGludG8gYWNjb3VudC5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxcbiAgICogQHJldHVybiB7IVByb21pc2U8IS4uLy4uL2xheW91dC1yZWN0LkxheW91dFJlY3REZWY+fVxuICAgKi9cbiAgZ2V0Q2xpZW50UmVjdEFzeW5jKGVsKSB7fVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBiaW5kaW5nIHN1cHBvcnRzIGZpeC1wb3NpdGlvbmVkIGVsZW1lbnRzLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgc3VwcG9ydHNQb3NpdGlvbkZpeGVkKCkge31cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgZWxlbWVudCBpcyBkZWNsYXJlZCBhcyBmaXhlZCBpbiBhbnkgb2YgdGhlIHVzZXIncyBzdHlsZXNoZWV0cy5cbiAgICogV2lsbCBpbmNsdWRlIGFueSBtYXRjaGVzLCBub3QgbmVjZXNzYXJpbHkgY3VycmVudGx5IGZpeGVkIGVsZW1lbnRzLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBpc0RlY2xhcmVkRml4ZWQoZWxlbWVudCkge31cblxuICAvKipcbiAgICogU2Nyb2xscyBlbGVtZW50IGludG8gdmlldyBtdWNoIGxpa2UgRWxlbWVudC4gc2Nyb2xsSW50b1ZpZXcgZG9lcyBidXRcbiAgICogaW4gdGhlIEFNUC9WaWV3ZXIgZW52aXJvbm1lbnQuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICBzY3JvbGxJbnRvVmlldyhlbGVtZW50KSB7fVxuXG4gIC8qKlxuICAgKiBTY3JvbGxzIGVsZW1lbnQgaW50byB2aWV3IG11Y2ggbGlrZSBFbGVtZW50LiBzY3JvbGxJbnRvVmlldyBkb2VzIGJ1dFxuICAgKiBpbiB0aGUgQU1QL1ZpZXdlciBlbnZpcm9ubWVudC4gQWRkcyBhbmltYXRpb24gZm9yIHRoZSBzY2Nyb2xsSW50b1ZpZXdcbiAgICogdHJhbnNpdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcGFyYW0ge3N0cmluZz19IHBvcyAodGFrZXMgb25lIG9mICd0b3AnLCAnYm90dG9tJywgJ2NlbnRlcicpXG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gb3B0X2R1cmF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X2N1cnZlXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKi9cbiAgYW5pbWF0ZVNjcm9sbEludG9WaWV3KGVsZW1lbnQsIHBvcyA9ICd0b3AnLCBvcHRfZHVyYXRpb24sIG9wdF9jdXJ2ZSkge31cblxuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBwYXJlbnQgU2hvdWxkIGJlIHNjcm9sbGFibGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwb3MgKHRha2VzIG9uZSBvZiAndG9wJywgJ2JvdHRvbScsICdjZW50ZXInKVxuICAgKiBAcGFyYW0ge251bWJlcj19IG9wdF9kdXJhdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZz19IG9wdF9jdXJ2ZVxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIGFuaW1hdGVTY3JvbGxXaXRoaW5QYXJlbnQoZWxlbWVudCwgcGFyZW50LCBwb3MsIG9wdF9kdXJhdGlvbiwgb3B0X2N1cnZlKSB7fVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHshRWxlbWVudH1cbiAgICovXG4gIGdldFNjcm9sbGluZ0VsZW1lbnQoKSB7fVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgdGhlIGhhbmRsZXIgZm9yIFZpZXdwb3J0Q2hhbmdlZEV2ZW50RGVmIGV2ZW50cy5cbiAgICogQHBhcmFtIHtmdW5jdGlvbighVmlld3BvcnRDaGFuZ2VkRXZlbnREZWYpfSBoYW5kbGVyXG4gICAqIEByZXR1cm4geyFVbmxpc3RlbkRlZn1cbiAgICovXG4gIG9uQ2hhbmdlZChoYW5kbGVyKSB7fVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgdGhlIGhhbmRsZXIgZm9yIHNjcm9sbCBldmVudHMuIFRoZXNlIGV2ZW50cyBETyBOT1QgY29udGFpblxuICAgKiBzY3JvbGxpbmcgb2Zmc2V0IGFuZCBpdCdzIGRpc2NvdXJhZ2VkIHRvIHJlYWQgc2Nyb2xsaW5nIG9mZnNldCBpbiB0aGVcbiAgICogZXZlbnQgaGFuZGxlci4gVGhlIHByaW1hcnkgdXNlIGNhc2UgZm9yIHRoaXMgaGFuZGxlciBpcyB0byBpbmZvcm0gdGhhdFxuICAgKiBzY3JvbGxpbmcgbWlnaHQgYmUgZ29pbmcgb24uIFRvIGdldCBtb3JlIGluZm9ybWF0aW9uIHtAbGluayBvbkNoYW5nZWR9XG4gICAqIGhhbmRsZXIgc2hvdWxkIGJlIHVzZWQuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gaGFuZGxlclxuICAgKiBAcmV0dXJuIHshVW5saXN0ZW5EZWZ9XG4gICAqL1xuICBvblNjcm9sbChoYW5kbGVyKSB7fVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgdGhlIGhhbmRsZXIgZm9yIFZpZXdwb3J0UmVzaXplZEV2ZW50RGVmIGV2ZW50cy5cbiAgICpcbiAgICogTm90ZSB0aGF0IHRoZXJlIGlzIGEga25vd24gYnVnIGluIFdlYmtpdCB0aGF0IGNhdXNlcyB3aW5kb3cuaW5uZXJXaWR0aFxuICAgKiBhbmQgd2luZG93LmlubmVySGVpZ2h0IHZhbHVlcyB0byBiZSBpbmNvcnJlY3QgYWZ0ZXIgcmVzaXplLiBBIHRlbXBvcmFyeVxuICAgKiBmaXggaXMgdG8gYWRkIGEgNTAwIG1zIGRlbGF5IGJlZm9yZSBjb21wdXRpbmcgdGhlc2UgdmFsdWVzLlxuICAgKiBMaW5rOiBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTcwNTk1XG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIVZpZXdwb3J0UmVzaXplZEV2ZW50RGVmKX0gaGFuZGxlclxuICAgKiBAcmV0dXJuIHshVW5saXN0ZW5EZWZ9XG4gICAqL1xuICBvblJlc2l6ZShoYW5kbGVyKSB7fVxuXG4gIC8qKlxuICAgKiBJbnN0cnVjdCB0aGUgdmlld3BvcnQgdG8gZW50ZXIgbGlnaHRib3ggbW9kZS5cbiAgICogQHBhcmFtIHshRWxlbWVudD19IG9wdF9yZXF1ZXN0aW5nRWxlbWVudCBNdXN0IGJlIHByb3ZpZGVkIHRvIGJlIGFibGUgdG9cbiAgICogICAgIGVudGVyIGxpZ2h0Ym94IG1vZGUgdW5kZXIgRklFIGNhc2VzLlxuICAgKiBAcGFyYW0geyFQcm9taXNlPX0gb3B0X29uQ29tcGxldGUgT3B0aW9uYWwgcHJvbWlzZSB0aGF0J3MgcmVzb2x2ZWQgd2hlblxuICAgKiAgICAgdGhlIGNhbGxlciBmaW5pc2hlcyBvcGVuaW5nIHRoZSBsaWdodGJveCBlLmcuIHRyYW5zaXRpb24gYW5pbWF0aW9ucy5cbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICBlbnRlckxpZ2h0Ym94TW9kZShvcHRfcmVxdWVzdGluZ0VsZW1lbnQsIG9wdF9vbkNvbXBsZXRlKSB7fVxuXG4gIC8qKlxuICAgKiBJbnN0cnVjdCB0aGUgdmlld3BvcnQgdG8gbGVhdmUgbGlnaHRib3ggbW9kZS5cbiAgICogQHBhcmFtIHshRWxlbWVudD19IG9wdF9yZXF1ZXN0aW5nRWxlbWVudCBNdXN0IGJlIHByb3ZpZGVkIHRvIGJlIGFibGUgdG9cbiAgICogICAgIGVudGVyIGxpZ2h0Ym94IG1vZGUgdW5kZXIgRklFIGNhc2VzLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIGxlYXZlTGlnaHRib3hNb2RlKG9wdF9yZXF1ZXN0aW5nRWxlbWVudCkge31cblxuICAvKipcbiAgICogSW5zdHJ1Y3QgdGhlIHZpZXdwb3J0IHRvIGVudGVyIG92ZXJsYXkgbW9kZS5cbiAgICovXG4gIGVudGVyT3ZlcmxheU1vZGUoKSB7fVxuXG4gIC8qKlxuICAgKiBJbnN0cnVjdCB0aGUgdmlld3BvcnQgdG8gbGVhdmUgb3ZlcmxheSBtb2RlLlxuICAgKi9cbiAgbGVhdmVPdmVybGF5TW9kZSgpIHt9XG5cbiAgLyoqXG4gICAqIERpc2FibGUgdGhlIHNjcm9sbGluZyBieSBzZXR0aW5nIG92ZXJmbG93OiBoaWRkZW4uXG4gICAqIFNob3VsZCBvbmx5IGJlIHVzZWQgZm9yIHRlbXBvcmFyaWx5IGRpc2FibGluZyBzY3JvbGwuXG4gICAqL1xuICBkaXNhYmxlU2Nyb2xsKCkge31cblxuICAvKipcbiAgICogUmVzZXQgdGhlIHNjcm9sbGluZyBieSByZW1vdmluZyBvdmVyZmxvdzogaGlkZGVuLlxuICAgKi9cbiAgcmVzZXRTY3JvbGwoKSB7fVxuXG4gIC8qKlxuICAgKiBSZXNldHMgdG91Y2ggem9vbSB0byBpbml0aWFsIHNjYWxlIG9mIDEuXG4gICAqL1xuICByZXNldFRvdWNoWm9vbSgpIHt9XG5cbiAgLyoqXG4gICAqIERpc2FibGVzIHRvdWNoIHpvb20gb24gdGhpcyB2aWV3cG9ydC4gUmV0dXJucyBgdHJ1ZWAgaWYgYW55IGFjdHVhbFxuICAgKiBjaGFuZ2VzIGhhdmUgYmVlbiBkb25lLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgZGlzYWJsZVRvdWNoWm9vbSgpIHt9XG5cbiAgLyoqXG4gICAqIFJlc3RvcmVzIG9yaWdpbmFsIHRvdWNoIHpvb20gcGFyYW1ldGVycy4gUmV0dXJucyBgdHJ1ZWAgaWYgYW55IGFjdHVhbFxuICAgKiBjaGFuZ2VzIGhhdmUgYmVlbiBkb25lLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgcmVzdG9yZU9yaWdpbmFsVG91Y2hab29tKCkge31cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgZml4ZWQgbGF5ZXIuXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKi9cbiAgdXBkYXRlRml4ZWRMYXllcigpIHt9XG5cbiAgLyoqXG4gICAqIEFkZHMgdGhlIGVsZW1lbnQgdG8gdGhlIGZpeGVkIGxheWVyLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IG9wdF9mb3JjZVRyYW5zZmVyIElmIHNldCB0byB0cnVlICwgdGhlbiB0aGUgZWxlbWVudCBuZWVkc1xuICAgKiAgICB0byBiZSBmb3JjZWZ1bGx5IHRyYW5zZmVycmVkIHRvIHRoZSBmaXhlZCBsYXllci5cbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICBhZGRUb0ZpeGVkTGF5ZXIoZWxlbWVudCwgb3B0X2ZvcmNlVHJhbnNmZXIpIHt9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIGVsZW1lbnQgZnJvbSB0aGUgZml4ZWQgbGF5ZXIuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICovXG4gIHJlbW92ZUZyb21GaXhlZExheWVyKGVsZW1lbnQpIHt9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBmaXhlZCBsYXllciBmcm9tIGNvbnN0cnVjdG9yIChpbnZva2VkIGJ5IHZpZXdlciBpbnRlZ3JhdGlvbilcbiAgICogQHBhcmFtIHt0eXBlb2YgLi4vZml4ZWQtbGF5ZXIuRml4ZWRMYXllcn0gY29uc3RydWN0b3JcbiAgICovXG4gIGNyZWF0ZUZpeGVkTGF5ZXIoY29uc3RydWN0b3IpIHt9XG59XG4vKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG4iXX0=
// /Users/mszylkowski/src/amphtml/src/service/viewport/viewport-interface.js