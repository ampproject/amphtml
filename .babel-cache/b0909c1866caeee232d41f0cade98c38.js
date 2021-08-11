function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}import { computedStyle } from "../../core/dom/style";

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
export var ViewportBindingDef = /*#__PURE__*/function () {function ViewportBindingDef() {_classCallCheck(this, ViewportBindingDef);}_createClass(ViewportBindingDef, [{ key: "ensureReadyForElements", value:
    /**
     * Called before a first AMP element is added to resources. The final
     * preparations must be completed here. Called in the mutate context.
     */
    function ensureReadyForElements() {}

    /**
     * Add listeners for global resources.
     */ }, { key: "connect", value:
    function connect() {}

    /**
     * Remove listeners for global resources.
     */ }, { key: "disconnect", value:
    function disconnect() {}

    /**
     * Returns the width of top border if this type of viewport needs border
     * offsetting. This is currently only needed for iOS to avoid scroll freeze.
     * @return {number}
     */ }, { key: "getBorderTop", value:
    function getBorderTop() {}

    /**
     * Whether the binding requires fixed elements to be transfered to a
     * independent fixed layer.
     * @return {boolean}
     */ }, { key: "requiresFixedLayerTransfer", value:
    function requiresFixedLayerTransfer() {}

    /**
     * Whether the binding requires the global window's `scrollTo` to be
     * indirected via methods of this binding.
     * @return {boolean}
     */ }, { key: "overrideGlobalScrollTo", value:
    function overrideGlobalScrollTo() {}

    /**
     * Whether the binding supports fix-positioned elements.
     * @return {boolean}
     */ }, { key: "supportsPositionFixed", value:
    function supportsPositionFixed() {}

    /**
     * Register a callback for scroll events.
     * @param {function()} unusedCallback
     */ }, { key: "onScroll", value:
    function onScroll(unusedCallback) {}

    /**
     * Register a callback for resize events.
     * @param {function()} unusedCallback
     */ }, { key: "onResize", value:
    function onResize(unusedCallback) {}

    /**
     * Updates binding with the new padding.
     * @param {number} unusedPaddingTop
     */ }, { key: "updatePaddingTop", value:
    function updatePaddingTop(unusedPaddingTop) {}

    /**
     * Updates binding with the new padding when hiding viewer header.
     * @param {boolean} unusedTransient
     * @param {number} unusedLastPaddingTop
     */ }, { key: "hideViewerHeader", value:
    function hideViewerHeader(unusedTransient, unusedLastPaddingTop) {}

    /**
     * Updates binding with the new padding when showing viewer header.
     * @param {boolean} unusedTransient
     * @param {number} unusedPaddingTop
     */ }, { key: "showViewerHeader", value:
    function showViewerHeader(unusedTransient, unusedPaddingTop) {}

    /**
     * Disable the scrolling by setting overflow: hidden.
     * Should only be used for temporarily disabling scroll.
     */ }, { key: "disableScroll", value:
    function disableScroll() {}

    /**
     * Reset the scrolling by removing overflow: hidden.
     */ }, { key: "resetScroll", value:
    function resetScroll() {}

    /**
     * Updates the viewport whether it's currently in the lightbox or a normal
     * mode.
     * @param {boolean} unusedLightboxMode
     * @return {!Promise}
     */ }, { key: "updateLightboxMode", value:
    function updateLightboxMode(unusedLightboxMode) {}

    /**
     * Returns the size of the viewport.
     * @return {!{width: number, height: number}}
     */ }, { key: "getSize", value:
    function getSize() {}

    /**
     * Returns the top scroll position for the viewport.
     * @return {number}
     */ }, { key: "getScrollTop", value:
    function getScrollTop() {}

    /**
     * Sets scroll top position to the specified value or the nearest possible.
     * @param {number} unusedScrollTop
     */ }, { key: "setScrollTop", value:
    function setScrollTop(unusedScrollTop) {}

    /**
     * Returns the left scroll position for the viewport.
     * @return {number}
     */ }, { key: "getScrollLeft", value:
    function getScrollLeft() {}

    /**
     * Returns the scroll width of the content of the document.
     * @return {number}
     */ }, { key: "getScrollWidth", value:
    function getScrollWidth() {}

    /**
     * Returns the scroll height of the content of the document, including the
     * padding top for the viewer header.
     * The scrollHeight will be the viewport height if there's not enough content
     * to fill up the viewport.
     * @return {number}
     */ }, { key: "getScrollHeight", value:
    function getScrollHeight() {}

    /**
     * Returns the height of the content of the document, including the
     * padding top for the viewer header.
     * contentHeight will match scrollHeight in all cases unless the viewport is
     * taller than the content.
     * @return {number}
     */ }, { key: "getContentHeight", value:
    function getContentHeight() {}

    /**
     * Resource manager signals to the viewport that content height is changed
     * and some action may need to be taken.
     * @restricted Use is restricted due to potentially very heavy performance
     *   impact. Can only be called when not actively scrolling.
     */ }, { key: "contentHeightChanged", value:
    function contentHeightChanged() {}

    /**
     * Returns the rect of the element within the document.
     * @param {!Element} unusedEl
     * @param {number=} unusedScrollLeft Optional arguments that the caller may
     *     pass in, if they cached these values and would like to avoid
     *     remeasure. Requires appropriate updating the values on scroll.
     * @param {number=} unusedScrollTop Same comment as above.
     * @return {!../../layout-rect.LayoutRectDef}
     */ }, { key: "getLayoutRect", value:
    function getLayoutRect(unusedEl, unusedScrollLeft, unusedScrollTop) {}

    /**
     * Returns the client rect of the current window.
     * @return {Promise<null>|Promise<!../../layout-rect.LayoutRectDef>}
     */ }, { key: "getRootClientRectAsync", value:
    function getRootClientRectAsync() {}

    /**
     * Returns the element considered the root scroller for this binding.
     * @return {!Element}
     */ }, { key: "getScrollingElement", value:
    function getScrollingElement() {}

    /**
     * Whether the root scroller is a native root scroller (behaves like a
     * viewport), or an overflow scroller (scrolls like an element).
     * @return {boolean}
     */ }, { key: "getScrollingElementScrollsLikeViewport", value:
    function getScrollingElementScrollsLikeViewport() {} }]);return ViewportBindingDef;}();


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
    var r = n. /*OK*/getBoundingClientRect();
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
// /Users/mszylkowski/src/amphtml/src/service/viewport/viewport-binding-def.js