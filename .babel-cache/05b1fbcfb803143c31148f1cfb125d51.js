function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);} /**
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
export var ViewportInterface = /*#__PURE__*/function (_Disposable) {_inherits(ViewportInterface, _Disposable);var _super = _createSuper(ViewportInterface);function ViewportInterface() {_classCallCheck(this, ViewportInterface);return _super.apply(this, arguments);}_createClass(ViewportInterface, [{ key: "ensureReadyForElements", value:
    /**
     * Called before a first AMP element is added to resources. Called in the
     * mutate context.
     */
    function ensureReadyForElements() {}

    /**
     * Returns the top padding mandated by the viewer.
     * @return {number}
     */ }, { key: "getPaddingTop", value:
    function getPaddingTop() {}

    /**
     * Returns the viewport's vertical scroll position.
     * @return {number}
     */ }, { key: "getScrollTop", value:
    function getScrollTop() {}

    /**
     * Returns the viewport's horizontal scroll position.
     * @return {number}
     */ }, { key: "getScrollLeft", value:
    function getScrollLeft() {}

    /**
     * Sets the desired scroll position on the viewport.
     * @param {number} scrollPos
     */ }, { key: "setScrollTop", value:
    function setScrollTop(scrollPos) {}

    /**
     * Sets the body padding bottom to the specified value.
     * @param {number} paddingBottom
     */ }, { key: "updatePaddingBottom", value:
    function updatePaddingBottom(paddingBottom) {}

    /**
     * Returns the size of the viewport.
     * @return {!{width: number, height: number}}
     */ }, { key: "getSize", value:
    function getSize() {}

    /**
     * Returns the height of the viewport.
     * @return {number}
     */ }, { key: "getHeight", value:
    function getHeight() {}

    /**
     * Returns the width of the viewport.
     * @return {number}
     */ }, { key: "getWidth", value:
    function getWidth() {}

    /**
     * Returns the scroll width of the content of the document. Note that this
     * method is not cached since we there's no indication when it might change.
     * @return {number}
     */ }, { key: "getScrollWidth", value:
    function getScrollWidth() {}

    /**
     * Returns the scroll height of the content of the document, including the
     * padding top for the viewer header.
     * The scrollHeight will be the viewport height if there's not enough content
     * to fill up the viewport.
     * Note that this method is not cached since we there's no indication when
     * it might change.
     * @return {number}
     */ }, { key: "getScrollHeight", value:
    function getScrollHeight() {}

    /**
     * Returns the height of the content of the document, including the
     * padding top for the viewer header.
     * contentHeight will match scrollHeight in all cases unless the viewport is
     * taller than the content.
     * Note that this method is not cached since we there's no indication when
     * it might change.
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
     * Returns the rect of the viewport which includes scroll positions and size.
     * @return {!../../layout-rect.LayoutRectDef}}
     */ }, { key: "getRect", value:
    function getRect() {}

    /**
     * Returns the rect of the element within the document.
     * Note that this function should be called in vsync measure. Please consider
     * using `getClientRectAsync` instead.
     * @param {!Element} el
     * @return {!../../layout-rect.LayoutRectDef}
     */ }, { key: "getLayoutRect", value:
    function getLayoutRect(el) {}

    /**
     * Returns the clientRect of the element.
     * Note: This method does not taking intersection into account.
     * @param {!Element} el
     * @return {!Promise<!../../layout-rect.LayoutRectDef>}
     */ }, { key: "getClientRectAsync", value:
    function getClientRectAsync(el) {}

    /**
     * Whether the binding supports fix-positioned elements.
     * @return {boolean}
     */ }, { key: "supportsPositionFixed", value:
    function supportsPositionFixed() {}

    /**
     * Whether the element is declared as fixed in any of the user's stylesheets.
     * Will include any matches, not necessarily currently fixed elements.
     * @param {!Element} element
     * @return {boolean}
     */ }, { key: "isDeclaredFixed", value:
    function isDeclaredFixed(element) {}

    /**
     * Scrolls element into view much like Element. scrollIntoView does but
     * in the AMP/Viewer environment.
     * @param {!Element} element
     * @return {!Promise}
     */ }, { key: "scrollIntoView", value:
    function scrollIntoView(element) {}

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
     */ }, { key: "animateScrollIntoView", value:
    function animateScrollIntoView(element) {var pos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'top';var opt_duration = arguments.length > 2 ? arguments[2] : undefined;var opt_curve = arguments.length > 3 ? arguments[3] : undefined;}

    /**
     * @param {!Element} element
     * @param {!Element} parent Should be scrollable.
     * @param {string} pos (takes one of 'top', 'bottom', 'center')
     * @param {number=} opt_duration
     * @param {string=} opt_curve
     * @return {!Promise}
     */ }, { key: "animateScrollWithinParent", value:
    function animateScrollWithinParent(element, parent, pos, opt_duration, opt_curve) {}

    /**
     * @return {!Element}
     */ }, { key: "getScrollingElement", value:
    function getScrollingElement() {}

    /**
     * Registers the handler for ViewportChangedEventDef events.
     * @param {function(!ViewportChangedEventDef)} handler
     * @return {!UnlistenDef}
     */ }, { key: "onChanged", value:
    function onChanged(handler) {}

    /**
     * Registers the handler for scroll events. These events DO NOT contain
     * scrolling offset and it's discouraged to read scrolling offset in the
     * event handler. The primary use case for this handler is to inform that
     * scrolling might be going on. To get more information {@link onChanged}
     * handler should be used.
     * @param {function()} handler
     * @return {!UnlistenDef}
     */ }, { key: "onScroll", value:
    function onScroll(handler) {}

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
     */ }, { key: "onResize", value:
    function onResize(handler) {}

    /**
     * Instruct the viewport to enter lightbox mode.
     * @param {!Element=} opt_requestingElement Must be provided to be able to
     *     enter lightbox mode under FIE cases.
     * @param {!Promise=} opt_onComplete Optional promise that's resolved when
     *     the caller finishes opening the lightbox e.g. transition animations.
     * @return {!Promise}
     */ }, { key: "enterLightboxMode", value:
    function enterLightboxMode(opt_requestingElement, opt_onComplete) {}

    /**
     * Instruct the viewport to leave lightbox mode.
     * @param {!Element=} opt_requestingElement Must be provided to be able to
     *     enter lightbox mode under FIE cases.
     * @return {!Promise}
     */ }, { key: "leaveLightboxMode", value:
    function leaveLightboxMode(opt_requestingElement) {}

    /**
     * Instruct the viewport to enter overlay mode.
     */ }, { key: "enterOverlayMode", value:
    function enterOverlayMode() {}

    /**
     * Instruct the viewport to leave overlay mode.
     */ }, { key: "leaveOverlayMode", value:
    function leaveOverlayMode() {}

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
     * Resets touch zoom to initial scale of 1.
     */ }, { key: "resetTouchZoom", value:
    function resetTouchZoom() {}

    /**
     * Disables touch zoom on this viewport. Returns `true` if any actual
     * changes have been done.
     * @return {boolean}
     */ }, { key: "disableTouchZoom", value:
    function disableTouchZoom() {}

    /**
     * Restores original touch zoom parameters. Returns `true` if any actual
     * changes have been done.
     * @return {boolean}
     */ }, { key: "restoreOriginalTouchZoom", value:
    function restoreOriginalTouchZoom() {}

    /**
     * Updates the fixed layer.
     * @return {!Promise}
     */ }, { key: "updateFixedLayer", value:
    function updateFixedLayer() {}

    /**
     * Adds the element to the fixed layer.
     * @param {!Element} element
     * @param {boolean=} opt_forceTransfer If set to true , then the element needs
     *    to be forcefully transferred to the fixed layer.
     * @return {!Promise}
     */ }, { key: "addToFixedLayer", value:
    function addToFixedLayer(element, opt_forceTransfer) {}

    /**
     * Removes the element from the fixed layer.
     * @param {!Element} element
     */ }, { key: "removeFromFixedLayer", value:
    function removeFromFixedLayer(element) {}

    /**
     * Create fixed layer from constructor (invoked by viewer integration)
     * @param {typeof ../fixed-layer.FixedLayer} constructor
     */ }, { key: "createFixedLayer", value:
    function createFixedLayer(constructor) {} }]);return ViewportInterface;}(Disposable);
// /Users/mszylkowski/src/amphtml/src/service/viewport/viewport-interface.js