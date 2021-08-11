import { resolvedPromise as _resolvedPromise } from "./../../core/data-structures/promise";function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { Observable } from "../../core/data-structures/observable";
import { layoutRectLtwh } from "../../core/dom/layout/rect";
import { computedStyle, px, setImportantStyles } from "../../core/dom/style";

import { Services } from "./..";

import {
ViewportBindingDef,
marginBottomOfLastChild } from "./viewport-binding-def";


import { dev } from "../../log";

var TAG_ = 'Viewport';

/**
 * Implementation of ViewportBindingDef based on the native window. It assumes
 * that the native window is sized properly and events represent the actual
 * scroll/resize events. This mode is applicable to a standalone document
 * display or when an iframe has a fixed size.
 *
 * Visible for testing.
 *
 * @implements {ViewportBindingDef}
 */
export var ViewportBindingNatural_ = /*#__PURE__*/function () {
  /**
   * @param {!../ampdoc-impl.AmpDoc} ampdoc
   */
  function ViewportBindingNatural_(ampdoc) {var _this = this;_classCallCheck(this, ViewportBindingNatural_);
    /** @const {!../ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const {!Window} */
    this.win = ampdoc.win;

    /** @const {!../../service/platform-impl.Platform} */
    this.platform_ = Services.platformFor(this.win);

    /** @private @const {!Observable} */
    this.scrollObservable_ = new Observable();

    /** @private @const {!Observable} */
    this.resizeObservable_ = new Observable();

    /** @const {function()} */
    this.boundScrollEventListener_ = this.handleScrollEvent_.bind(this);

    /** @const {function()} */
    this.boundResizeEventListener_ = function () {return _this.resizeObservable_.fire();};

    dev().fine(TAG_, 'initialized natural viewport');
  }

  /** @private */_createClass(ViewportBindingNatural_, [{ key: "handleScrollEvent_", value:
    function handleScrollEvent_() {
      this.scrollObservable_.fire();
    }

    /** @override */ }, { key: "connect", value:
    function connect() {
      this.win.addEventListener('scroll', this.boundScrollEventListener_);
      this.win.addEventListener('resize', this.boundResizeEventListener_);
    }

    /** @override */ }, { key: "disconnect", value:
    function disconnect() {
      this.win.removeEventListener('scroll', this.boundScrollEventListener_);
      this.win.removeEventListener('resize', this.boundResizeEventListener_);
    }

    /** @override */ }, { key: "ensureReadyForElements", value:
    function ensureReadyForElements() {
      // Nothing.
    }

    /** @override */ }, { key: "getBorderTop", value:
    function getBorderTop() {
      return 0;
    }

    /** @override */ }, { key: "requiresFixedLayerTransfer", value:
    function requiresFixedLayerTransfer() {
      return false;
    }

    /** @override */ }, { key: "overrideGlobalScrollTo", value:
    function overrideGlobalScrollTo() {
      return false;
    }

    /** @override */ }, { key: "supportsPositionFixed", value:
    function supportsPositionFixed() {
      return true;
    }

    /** @override */ }, { key: "onScroll", value:
    function onScroll(callback) {
      this.scrollObservable_.add(callback);
    }

    /** @override */ }, { key: "onResize", value:
    function onResize(callback) {
      this.resizeObservable_.add(callback);
    }

    /** @override */ }, { key: "updatePaddingTop", value:
    function updatePaddingTop(paddingTop) {
      setImportantStyles(this.win.document.documentElement, {
        'padding-top': px(paddingTop) });

    }

    /** @override */ }, { key: "hideViewerHeader", value:
    function hideViewerHeader(transient, unusedLastPaddingTop) {
      if (!transient) {
        this.updatePaddingTop(0);
      }
    }

    /** @override */ }, { key: "showViewerHeader", value:
    function showViewerHeader(transient, paddingTop) {
      if (!transient) {
        this.updatePaddingTop(paddingTop);
      }
    }

    /** @override */ }, { key: "disableScroll", value:
    function disableScroll() {
      // TODO(jridgewell): Recursively disable scroll
      this.win.document.documentElement.classList.add(
      'i-amphtml-scroll-disabled');

    }

    /** @override */ }, { key: "resetScroll", value:
    function resetScroll() {
      // TODO(jridgewell): Recursively disable scroll
      this.win.document.documentElement.classList.remove(
      'i-amphtml-scroll-disabled');

    }

    /** @override */ }, { key: "updateLightboxMode", value:
    function updateLightboxMode(unusedLightboxMode) {
      // The layout is always accurate.
      return _resolvedPromise();
    }

    /** @override */ }, { key: "getSize", value:
    function getSize() {
      // Prefer window innerWidth/innerHeight but fall back to
      // documentElement clientWidth/clientHeight.
      // documentElement./*OK*/clientHeight is buggy on iOS Safari
      // and thus cannot be used.
      var winWidth = this.win. /*OK*/innerWidth;
      var winHeight = this.win. /*OK*/innerHeight;
      if (winWidth && winHeight) {
        return { width: winWidth, height: winHeight };
      }
      var el = this.win.document.documentElement;
      return { width: el. /*OK*/clientWidth, height: el. /*OK*/clientHeight };
    }

    /** @override */ }, { key: "getScrollTop", value:
    function getScrollTop() {
      var pageScrollTop =
      this.getScrollingElement(). /*OK*/scrollTop ||
      this.win. /*OK*/pageYOffset;
      var _this$ampdoc$getRootN = this.ampdoc.getRootNode(),host = _this$ampdoc$getRootN.host;
      return host ?
      pageScrollTop - /** @type {!HTMLElement} */(host). /*OK*/offsetTop :
      pageScrollTop;
    }

    /** @override */ }, { key: "getScrollLeft", value:
    function getScrollLeft() {
      // The html is set to overflow-x: hidden so the document cannot be
      // scrolled horizontally. The scrollLeft will always be 0.
      return 0;
    }

    /** @override */ }, { key: "getScrollWidth", value:
    function getScrollWidth() {
      return this.getScrollingElement(). /*OK*/scrollWidth;
    }

    /** @override */ }, { key: "getScrollHeight", value:
    function getScrollHeight() {
      return this.getScrollingElement(). /*OK*/scrollHeight;
    }

    /** @override */ }, { key: "getContentHeight", value:
    function getContentHeight() {
      // Don't use scrollHeight, since it returns `MAX(viewport_height,
      // document_height)` (we only want the latter), and it doesn't account
      // for margins. Also, don't use documentElement's rect height because
      // there's no workable analog for either ios-embed-* modes.
      var content = this.getScrollingElement();
      var rect = content. /*OK*/getBoundingClientRect();

      // The Y-position of `content` can be offset by the vertical margin
      // of its first child, and this is _not_ accounted for in `rect.height`.
      // This causes smaller than expected content height, so add it manually.
      // Note this "top" value already includes padding-top of ancestor elements
      // and getBorderTop().
      var top = rect.top + this.getScrollTop();

      // As of Safari 12.1.1, the getBoundingClientRect().height does not include
      // the bottom margin of children and there's no other API that does.
      var childMarginBottom = Services.platformFor(this.win).isSafari() ?
      marginBottomOfLastChild(this.win, content) :
      0;

      var style = computedStyle(this.win, content);
      return (
      top +
      parseInt(style.marginTop, 10) +
      rect.height +
      childMarginBottom +
      parseInt(style.marginBottom, 10));

    }

    /** @override */ }, { key: "contentHeightChanged", value:
    function contentHeightChanged() {
      // Nothing to do here.
    }

    /** @override */ }, { key: "getLayoutRect", value:
    function getLayoutRect(el, opt_scrollLeft, opt_scrollTop) {
      var b = el. /*OK*/getBoundingClientRect();
      var scrollTop =
      opt_scrollTop != undefined ? opt_scrollTop : this.getScrollTop();
      var scrollLeft =
      opt_scrollLeft != undefined ? opt_scrollLeft : this.getScrollLeft();
      return layoutRectLtwh(
      Math.round(b.left + scrollLeft),
      Math.round(b.top + scrollTop),
      Math.round(b.width),
      Math.round(b.height));

    }

    /** @override */ }, { key: "getRootClientRectAsync", value:
    function getRootClientRectAsync() {
      return Promise.resolve(null);
    }

    /** @override */ }, { key: "setScrollTop", value:
    function setScrollTop(scrollTop) {
      this.getScrollingElement(). /*OK*/scrollTop = scrollTop;
    }

    /** @override */ }, { key: "getScrollingElement", value:
    function getScrollingElement() {
      var doc = this.win.document;
      if (doc. /*OK*/scrollingElement) {
        return doc. /*OK*/scrollingElement;
      }
      if (
      doc.body &&
      // Due to https://bugs.webkit.org/show_bug.cgi?id=106133, WebKit
      // browsers have to use `body` and NOT `documentElement` for
      // scrolling purposes. This has mostly being resolved via
      // `scrollingElement` property, but this branch is still necessary
      // for backward compatibility purposes.
      this.platform_.isWebKit())
      {
        return doc.body;
      }
      return doc.documentElement;
    }

    /** @override */ }, { key: "getScrollingElementScrollsLikeViewport", value:
    function getScrollingElementScrollsLikeViewport() {
      return true;
    } }]);return ViewportBindingNatural_;}();
// /Users/mszylkowski/src/amphtml/src/service/viewport/viewport-binding-natural.js