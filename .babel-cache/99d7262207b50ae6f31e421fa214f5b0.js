function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

import { computedStyle } from "../../core/dom/style";

/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
 * ViewportBindingDef is an interface that defines an underlying technology
 * behind the {@link ViewportInterface}.
 * @interface
 */
export var ViewportBindingDef = /*#__PURE__*/function () {
  function ViewportBindingDef() {
    _classCallCheck(this, ViewportBindingDef);
  }

  _createClass(ViewportBindingDef, [{
    key: "ensureReadyForElements",
    value:
    /**
     * Called before a first AMP element is added to resources. The final
     * preparations must be completed here. Called in the mutate context.
     */
    function ensureReadyForElements() {}
    /**
     * Add listeners for global resources.
     */

  }, {
    key: "connect",
    value: function connect() {}
    /**
     * Remove listeners for global resources.
     */

  }, {
    key: "disconnect",
    value: function disconnect() {}
    /**
     * Returns the width of top border if this type of viewport needs border
     * offsetting. This is currently only needed for iOS to avoid scroll freeze.
     * @return {number}
     */

  }, {
    key: "getBorderTop",
    value: function getBorderTop() {}
    /**
     * Whether the binding requires fixed elements to be transfered to a
     * independent fixed layer.
     * @return {boolean}
     */

  }, {
    key: "requiresFixedLayerTransfer",
    value: function requiresFixedLayerTransfer() {}
    /**
     * Whether the binding requires the global window's `scrollTo` to be
     * indirected via methods of this binding.
     * @return {boolean}
     */

  }, {
    key: "overrideGlobalScrollTo",
    value: function overrideGlobalScrollTo() {}
    /**
     * Whether the binding supports fix-positioned elements.
     * @return {boolean}
     */

  }, {
    key: "supportsPositionFixed",
    value: function supportsPositionFixed() {}
    /**
     * Register a callback for scroll events.
     * @param {function()} unusedCallback
     */

  }, {
    key: "onScroll",
    value: function onScroll(unusedCallback) {}
    /**
     * Register a callback for resize events.
     * @param {function()} unusedCallback
     */

  }, {
    key: "onResize",
    value: function onResize(unusedCallback) {}
    /**
     * Updates binding with the new padding.
     * @param {number} unusedPaddingTop
     */

  }, {
    key: "updatePaddingTop",
    value: function updatePaddingTop(unusedPaddingTop) {}
    /**
     * Updates binding with the new padding when hiding viewer header.
     * @param {boolean} unusedTransient
     * @param {number} unusedLastPaddingTop
     */

  }, {
    key: "hideViewerHeader",
    value: function hideViewerHeader(unusedTransient, unusedLastPaddingTop) {}
    /**
     * Updates binding with the new padding when showing viewer header.
     * @param {boolean} unusedTransient
     * @param {number} unusedPaddingTop
     */

  }, {
    key: "showViewerHeader",
    value: function showViewerHeader(unusedTransient, unusedPaddingTop) {}
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
     * Updates the viewport whether it's currently in the lightbox or a normal
     * mode.
     * @param {boolean} unusedLightboxMode
     * @return {!Promise}
     */

  }, {
    key: "updateLightboxMode",
    value: function updateLightboxMode(unusedLightboxMode) {}
    /**
     * Returns the size of the viewport.
     * @return {!{width: number, height: number}}
     */

  }, {
    key: "getSize",
    value: function getSize() {}
    /**
     * Returns the top scroll position for the viewport.
     * @return {number}
     */

  }, {
    key: "getScrollTop",
    value: function getScrollTop() {}
    /**
     * Sets scroll top position to the specified value or the nearest possible.
     * @param {number} unusedScrollTop
     */

  }, {
    key: "setScrollTop",
    value: function setScrollTop(unusedScrollTop) {}
    /**
     * Returns the left scroll position for the viewport.
     * @return {number}
     */

  }, {
    key: "getScrollLeft",
    value: function getScrollLeft() {}
    /**
     * Returns the scroll width of the content of the document.
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
     * Returns the rect of the element within the document.
     * @param {!Element} unusedEl
     * @param {number=} unusedScrollLeft Optional arguments that the caller may
     *     pass in, if they cached these values and would like to avoid
     *     remeasure. Requires appropriate updating the values on scroll.
     * @param {number=} unusedScrollTop Same comment as above.
     * @return {!../../layout-rect.LayoutRectDef}
     */

  }, {
    key: "getLayoutRect",
    value: function getLayoutRect(unusedEl, unusedScrollLeft, unusedScrollTop) {}
    /**
     * Returns the client rect of the current window.
     * @return {Promise<null>|Promise<!../../layout-rect.LayoutRectDef>}
     */

  }, {
    key: "getRootClientRectAsync",
    value: function getRootClientRectAsync() {}
    /**
     * Returns the element considered the root scroller for this binding.
     * @return {!Element}
     */

  }, {
    key: "getScrollingElement",
    value: function getScrollingElement() {}
    /**
     * Whether the root scroller is a native root scroller (behaves like a
     * viewport), or an overflow scroller (scrolls like an element).
     * @return {boolean}
     */

  }, {
    key: "getScrollingElementScrollsLikeViewport",
    value: function getScrollingElementScrollsLikeViewport() {}
  }]);

  return ViewportBindingDef;
}();

/**
 * Returns the margin-bottom of the last child of `element` that affects
 * document height (is static/relative position with non-zero height),
 * if any. Otherwise, returns 0.
 *
 * TODO(choumx): This is a weird location, so refactor to improve code sharing
 * among implementations of ViewportBindingDef generally.
 *
 * @param {!Window} win
 * @param {!Element} element
 * @return {number}
 */
export function marginBottomOfLastChild(win, element) {
  var style;

  for (var n = element.lastElementChild; n; n = n.previousElementSibling) {
    var r = n.
    /*OK*/
    getBoundingClientRect();

    if (r.height > 0) {
      var s = computedStyle(win, n);

      if (s.position == 'static' || s.position == 'relative') {
        style = s;
        break;
      }
    }
  }

  return style ? parseInt(style.marginBottom, 10) : 0;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZpZXdwb3J0LWJpbmRpbmctZGVmLmpzIl0sIm5hbWVzIjpbImNvbXB1dGVkU3R5bGUiLCJWaWV3cG9ydEJpbmRpbmdEZWYiLCJ1bnVzZWRDYWxsYmFjayIsInVudXNlZFBhZGRpbmdUb3AiLCJ1bnVzZWRUcmFuc2llbnQiLCJ1bnVzZWRMYXN0UGFkZGluZ1RvcCIsInVudXNlZExpZ2h0Ym94TW9kZSIsInVudXNlZFNjcm9sbFRvcCIsInVudXNlZEVsIiwidW51c2VkU2Nyb2xsTGVmdCIsIm1hcmdpbkJvdHRvbU9mTGFzdENoaWxkIiwid2luIiwiZWxlbWVudCIsInN0eWxlIiwibiIsImxhc3RFbGVtZW50Q2hpbGQiLCJwcmV2aW91c0VsZW1lbnRTaWJsaW5nIiwiciIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsImhlaWdodCIsInMiLCJwb3NpdGlvbiIsInBhcnNlSW50IiwibWFyZ2luQm90dG9tIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxTQUFRQSxhQUFSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBYUMsa0JBQWI7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQ0U7QUFDRjtBQUNBO0FBQ0E7QUFDRSxzQ0FBeUIsQ0FBRTtBQUUzQjtBQUNGO0FBQ0E7O0FBVEE7QUFBQTtBQUFBLFdBVUUsbUJBQVUsQ0FBRTtBQUVaO0FBQ0Y7QUFDQTs7QUFkQTtBQUFBO0FBQUEsV0FlRSxzQkFBYSxDQUFFO0FBRWY7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUFyQkE7QUFBQTtBQUFBLFdBc0JFLHdCQUFlLENBQUU7QUFFakI7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUE1QkE7QUFBQTtBQUFBLFdBNkJFLHNDQUE2QixDQUFFO0FBRS9CO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBbkNBO0FBQUE7QUFBQSxX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cEIsYUFBYSxDQUFDVyxHQUFELEVBQU1HLENBQU4sQ0FBdkI7O0FBQ0EsVUFBSU0sQ0FBQyxDQUFDQyxRQUFGLElBQWMsUUFBZCxJQUEwQkQsQ0FBQyxDQUFDQyxRQUFGLElBQWMsVUFBNUMsRUFBd0Q7QUFDdERSLFFBQUFBLEtBQUssR0FBR08sQ0FBUjtBQUNBO0FBQ0Q7QUFDRjtBQUNGOztBQUNELFNBQU9QLEtBQUssR0FBR1MsUUFBUSxDQUFDVCxLQUFLLENBQUNVLFlBQVAsRUFBcUIsRUFBckIsQ0FBWCxHQUFzQyxDQUFsRDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjb21wdXRlZFN0eWxlfSBmcm9tICcjY29yZS9kb20vc3R5bGUnO1xuXG4vKipcbiAqIENvcHlyaWdodCAyMDE3IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBWaWV3cG9ydEJpbmRpbmdEZWYgaXMgYW4gaW50ZXJmYWNlIHRoYXQgZGVmaW5lcyBhbiB1bmRlcmx5aW5nIHRlY2hub2xvZ3lcbiAqIGJlaGluZCB0aGUge0BsaW5rIFZpZXdwb3J0SW50ZXJmYWNlfS5cbiAqIEBpbnRlcmZhY2VcbiAqL1xuZXhwb3J0IGNsYXNzIFZpZXdwb3J0QmluZGluZ0RlZiB7XG4gIC8qKlxuICAgKiBDYWxsZWQgYmVmb3JlIGEgZmlyc3QgQU1QIGVsZW1lbnQgaXMgYWRkZWQgdG8gcmVzb3VyY2VzLiBUaGUgZmluYWxcbiAgICogcHJlcGFyYXRpb25zIG11c3QgYmUgY29tcGxldGVkIGhlcmUuIENhbGxlZCBpbiB0aGUgbXV0YXRlIGNvbnRleHQuXG4gICAqL1xuICBlbnN1cmVSZWFkeUZvckVsZW1lbnRzKCkge31cblxuICAvKipcbiAgICogQWRkIGxpc3RlbmVycyBmb3IgZ2xvYmFsIHJlc291cmNlcy5cbiAgICovXG4gIGNvbm5lY3QoKSB7fVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgbGlzdGVuZXJzIGZvciBnbG9iYWwgcmVzb3VyY2VzLlxuICAgKi9cbiAgZGlzY29ubmVjdCgpIHt9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHdpZHRoIG9mIHRvcCBib3JkZXIgaWYgdGhpcyB0eXBlIG9mIHZpZXdwb3J0IG5lZWRzIGJvcmRlclxuICAgKiBvZmZzZXR0aW5nLiBUaGlzIGlzIGN1cnJlbnRseSBvbmx5IG5lZWRlZCBmb3IgaU9TIHRvIGF2b2lkIHNjcm9sbCBmcmVlemUuXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICovXG4gIGdldEJvcmRlclRvcCgpIHt9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGJpbmRpbmcgcmVxdWlyZXMgZml4ZWQgZWxlbWVudHMgdG8gYmUgdHJhbnNmZXJlZCB0byBhXG4gICAqIGluZGVwZW5kZW50IGZpeGVkIGxheWVyLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgcmVxdWlyZXNGaXhlZExheWVyVHJhbnNmZXIoKSB7fVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBiaW5kaW5nIHJlcXVpcmVzIHRoZSBnbG9iYWwgd2luZG93J3MgYHNjcm9sbFRvYCB0byBiZVxuICAgKiBpbmRpcmVjdGVkIHZpYSBtZXRob2RzIG9mIHRoaXMgYmluZGluZy5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIG92ZXJyaWRlR2xvYmFsU2Nyb2xsVG8oKSB7fVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBiaW5kaW5nIHN1cHBvcnRzIGZpeC1wb3NpdGlvbmVkIGVsZW1lbnRzLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgc3VwcG9ydHNQb3NpdGlvbkZpeGVkKCkge31cblxuICAvKipcbiAgICogUmVnaXN0ZXIgYSBjYWxsYmFjayBmb3Igc2Nyb2xsIGV2ZW50cy5cbiAgICogQHBhcmFtIHtmdW5jdGlvbigpfSB1bnVzZWRDYWxsYmFja1xuICAgKi9cbiAgb25TY3JvbGwodW51c2VkQ2FsbGJhY2spIHt9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGEgY2FsbGJhY2sgZm9yIHJlc2l6ZSBldmVudHMuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gdW51c2VkQ2FsbGJhY2tcbiAgICovXG4gIG9uUmVzaXplKHVudXNlZENhbGxiYWNrKSB7fVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIGJpbmRpbmcgd2l0aCB0aGUgbmV3IHBhZGRpbmcuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB1bnVzZWRQYWRkaW5nVG9wXG4gICAqL1xuICB1cGRhdGVQYWRkaW5nVG9wKHVudXNlZFBhZGRpbmdUb3ApIHt9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgYmluZGluZyB3aXRoIHRoZSBuZXcgcGFkZGluZyB3aGVuIGhpZGluZyB2aWV3ZXIgaGVhZGVyLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHVudXNlZFRyYW5zaWVudFxuICAgKiBAcGFyYW0ge251bWJlcn0gdW51c2VkTGFzdFBhZGRpbmdUb3BcbiAgICovXG4gIGhpZGVWaWV3ZXJIZWFkZXIodW51c2VkVHJhbnNpZW50LCB1bnVzZWRMYXN0UGFkZGluZ1RvcCkge31cblxuICAvKipcbiAgICogVXBkYXRlcyBiaW5kaW5nIHdpdGggdGhlIG5ldyBwYWRkaW5nIHdoZW4gc2hvd2luZyB2aWV3ZXIgaGVhZGVyLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHVudXNlZFRyYW5zaWVudFxuICAgKiBAcGFyYW0ge251bWJlcn0gdW51c2VkUGFkZGluZ1RvcFxuICAgKi9cbiAgc2hvd1ZpZXdlckhlYWRlcih1bnVzZWRUcmFuc2llbnQsIHVudXNlZFBhZGRpbmdUb3ApIHt9XG5cbiAgLyoqXG4gICAqIERpc2FibGUgdGhlIHNjcm9sbGluZyBieSBzZXR0aW5nIG92ZXJmbG93OiBoaWRkZW4uXG4gICAqIFNob3VsZCBvbmx5IGJlIHVzZWQgZm9yIHRlbXBvcmFyaWx5IGRpc2FibGluZyBzY3JvbGwuXG4gICAqL1xuICBkaXNhYmxlU2Nyb2xsKCkge31cblxuICAvKipcbiAgICogUmVzZXQgdGhlIHNjcm9sbGluZyBieSByZW1vdmluZyBvdmVyZmxvdzogaGlkZGVuLlxuICAgKi9cbiAgcmVzZXRTY3JvbGwoKSB7fVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSB2aWV3cG9ydCB3aGV0aGVyIGl0J3MgY3VycmVudGx5IGluIHRoZSBsaWdodGJveCBvciBhIG5vcm1hbFxuICAgKiBtb2RlLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHVudXNlZExpZ2h0Ym94TW9kZVxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIHVwZGF0ZUxpZ2h0Ym94TW9kZSh1bnVzZWRMaWdodGJveE1vZGUpIHt9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHNpemUgb2YgdGhlIHZpZXdwb3J0LlxuICAgKiBAcmV0dXJuIHshe3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX1cbiAgICovXG4gIGdldFNpemUoKSB7fVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB0b3Agc2Nyb2xsIHBvc2l0aW9uIGZvciB0aGUgdmlld3BvcnQuXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICovXG4gIGdldFNjcm9sbFRvcCgpIHt9XG5cbiAgLyoqXG4gICAqIFNldHMgc2Nyb2xsIHRvcCBwb3NpdGlvbiB0byB0aGUgc3BlY2lmaWVkIHZhbHVlIG9yIHRoZSBuZWFyZXN0IHBvc3NpYmxlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gdW51c2VkU2Nyb2xsVG9wXG4gICAqL1xuICBzZXRTY3JvbGxUb3AodW51c2VkU2Nyb2xsVG9wKSB7fVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBsZWZ0IHNjcm9sbCBwb3NpdGlvbiBmb3IgdGhlIHZpZXdwb3J0LlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqL1xuICBnZXRTY3JvbGxMZWZ0KCkge31cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgc2Nyb2xsIHdpZHRoIG9mIHRoZSBjb250ZW50IG9mIHRoZSBkb2N1bWVudC5cbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKi9cbiAgZ2V0U2Nyb2xsV2lkdGgoKSB7fVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzY3JvbGwgaGVpZ2h0IG9mIHRoZSBjb250ZW50IG9mIHRoZSBkb2N1bWVudCwgaW5jbHVkaW5nIHRoZVxuICAgKiBwYWRkaW5nIHRvcCBmb3IgdGhlIHZpZXdlciBoZWFkZXIuXG4gICAqIFRoZSBzY3JvbGxIZWlnaHQgd2lsbCBiZSB0aGUgdmlld3BvcnQgaGVpZ2h0IGlmIHRoZXJlJ3Mgbm90IGVub3VnaCBjb250ZW50XG4gICAqIHRvIGZpbGwgdXAgdGhlIHZpZXdwb3J0LlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqL1xuICBnZXRTY3JvbGxIZWlnaHQoKSB7fVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBoZWlnaHQgb2YgdGhlIGNvbnRlbnQgb2YgdGhlIGRvY3VtZW50LCBpbmNsdWRpbmcgdGhlXG4gICAqIHBhZGRpbmcgdG9wIGZvciB0aGUgdmlld2VyIGhlYWRlci5cbiAgICogY29udGVudEhlaWdodCB3aWxsIG1hdGNoIHNjcm9sbEhlaWdodCBpbiBhbGwgY2FzZXMgdW5sZXNzIHRoZSB2aWV3cG9ydCBpc1xuICAgKiB0YWxsZXIgdGhhbiB0aGUgY29udGVudC5cbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKi9cbiAgZ2V0Q29udGVudEhlaWdodCgpIHt9XG5cbiAgLyoqXG4gICAqIFJlc291cmNlIG1hbmFnZXIgc2lnbmFscyB0byB0aGUgdmlld3BvcnQgdGhhdCBjb250ZW50IGhlaWdodCBpcyBjaGFuZ2VkXG4gICAqIGFuZCBzb21lIGFjdGlvbiBtYXkgbmVlZCB0byBiZSB0YWtlbi5cbiAgICogQHJlc3RyaWN0ZWQgVXNlIGlzIHJlc3RyaWN0ZWQgZHVlIHRvIHBvdGVudGlhbGx5IHZlcnkgaGVhdnkgcGVyZm9ybWFuY2VcbiAgICogICBpbXBhY3QuIENhbiBvbmx5IGJlIGNhbGxlZCB3aGVuIG5vdCBhY3RpdmVseSBzY3JvbGxpbmcuXG4gICAqL1xuICBjb250ZW50SGVpZ2h0Q2hhbmdlZCgpIHt9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHJlY3Qgb2YgdGhlIGVsZW1lbnQgd2l0aGluIHRoZSBkb2N1bWVudC5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gdW51c2VkRWxcbiAgICogQHBhcmFtIHtudW1iZXI9fSB1bnVzZWRTY3JvbGxMZWZ0IE9wdGlvbmFsIGFyZ3VtZW50cyB0aGF0IHRoZSBjYWxsZXIgbWF5XG4gICAqICAgICBwYXNzIGluLCBpZiB0aGV5IGNhY2hlZCB0aGVzZSB2YWx1ZXMgYW5kIHdvdWxkIGxpa2UgdG8gYXZvaWRcbiAgICogICAgIHJlbWVhc3VyZS4gUmVxdWlyZXMgYXBwcm9wcmlhdGUgdXBkYXRpbmcgdGhlIHZhbHVlcyBvbiBzY3JvbGwuXG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gdW51c2VkU2Nyb2xsVG9wIFNhbWUgY29tbWVudCBhcyBhYm92ZS5cbiAgICogQHJldHVybiB7IS4uLy4uL2xheW91dC1yZWN0LkxheW91dFJlY3REZWZ9XG4gICAqL1xuICBnZXRMYXlvdXRSZWN0KHVudXNlZEVsLCB1bnVzZWRTY3JvbGxMZWZ0LCB1bnVzZWRTY3JvbGxUb3ApIHt9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNsaWVudCByZWN0IG9mIHRoZSBjdXJyZW50IHdpbmRvdy5cbiAgICogQHJldHVybiB7UHJvbWlzZTxudWxsPnxQcm9taXNlPCEuLi8uLi9sYXlvdXQtcmVjdC5MYXlvdXRSZWN0RGVmPn1cbiAgICovXG4gIGdldFJvb3RDbGllbnRSZWN0QXN5bmMoKSB7fVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBlbGVtZW50IGNvbnNpZGVyZWQgdGhlIHJvb3Qgc2Nyb2xsZXIgZm9yIHRoaXMgYmluZGluZy5cbiAgICogQHJldHVybiB7IUVsZW1lbnR9XG4gICAqL1xuICBnZXRTY3JvbGxpbmdFbGVtZW50KCkge31cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgcm9vdCBzY3JvbGxlciBpcyBhIG5hdGl2ZSByb290IHNjcm9sbGVyIChiZWhhdmVzIGxpa2UgYVxuICAgKiB2aWV3cG9ydCksIG9yIGFuIG92ZXJmbG93IHNjcm9sbGVyIChzY3JvbGxzIGxpa2UgYW4gZWxlbWVudCkuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBnZXRTY3JvbGxpbmdFbGVtZW50U2Nyb2xsc0xpa2VWaWV3cG9ydCgpIHt9XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWFyZ2luLWJvdHRvbSBvZiB0aGUgbGFzdCBjaGlsZCBvZiBgZWxlbWVudGAgdGhhdCBhZmZlY3RzXG4gKiBkb2N1bWVudCBoZWlnaHQgKGlzIHN0YXRpYy9yZWxhdGl2ZSBwb3NpdGlvbiB3aXRoIG5vbi16ZXJvIGhlaWdodCksXG4gKiBpZiBhbnkuIE90aGVyd2lzZSwgcmV0dXJucyAwLlxuICpcbiAqIFRPRE8oY2hvdW14KTogVGhpcyBpcyBhIHdlaXJkIGxvY2F0aW9uLCBzbyByZWZhY3RvciB0byBpbXByb3ZlIGNvZGUgc2hhcmluZ1xuICogYW1vbmcgaW1wbGVtZW50YXRpb25zIG9mIFZpZXdwb3J0QmluZGluZ0RlZiBnZW5lcmFsbHkuXG4gKlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1hcmdpbkJvdHRvbU9mTGFzdENoaWxkKHdpbiwgZWxlbWVudCkge1xuICBsZXQgc3R5bGU7XG4gIGZvciAobGV0IG4gPSBlbGVtZW50Lmxhc3RFbGVtZW50Q2hpbGQ7IG47IG4gPSBuLnByZXZpb3VzRWxlbWVudFNpYmxpbmcpIHtcbiAgICBjb25zdCByID0gbi4vKk9LKi8gZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgaWYgKHIuaGVpZ2h0ID4gMCkge1xuICAgICAgY29uc3QgcyA9IGNvbXB1dGVkU3R5bGUod2luLCBuKTtcbiAgICAgIGlmIChzLnBvc2l0aW9uID09ICdzdGF0aWMnIHx8IHMucG9zaXRpb24gPT0gJ3JlbGF0aXZlJykge1xuICAgICAgICBzdHlsZSA9IHM7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gc3R5bGUgPyBwYXJzZUludChzdHlsZS5tYXJnaW5Cb3R0b20sIDEwKSA6IDA7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/service/viewport/viewport-binding-def.js