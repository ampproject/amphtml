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
import { whenDocumentReady } from "../../core/document-ready";
import { waitForBodyOpen } from "../../core/dom";
import { layoutRectLtwh } from "../../core/dom/layout/rect";
import { computedStyle, px, setImportantStyles } from "../../core/dom/style";

import { isExperimentOn } from "../../experiments";

import { Services } from "./..";

import {
ViewportBindingDef,
marginBottomOfLastChild } from "./viewport-binding-def";


import { dev } from "../../log";

var TAG_ = 'Viewport';

/**
 * Implementation of ViewportBindingDef based for iframed iOS case where iframes
 * are not scrollable. Scrolling accomplished here by inserting a scrollable
 * wrapper `<html id="i-amphtml-wrapper">` inside the `<html>` element and
 * reparenting the original `<body>` inside.
 *
 * @implements {ViewportBindingDef}
 * @visibleForTesting
 */
export var ViewportBindingIosEmbedWrapper_ = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function ViewportBindingIosEmbedWrapper_(win) {var _this = this;_classCallCheck(this, ViewportBindingIosEmbedWrapper_);
    /** @const {!Window} */
    this.win = win;

    /** @protected {!../vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(win);

    var doc = this.win.document;
    var documentElement = doc.documentElement;
    var topClasses = documentElement.className;
    documentElement.classList.add('i-amphtml-ios-embed');

    var wrapper = doc.createElement('html');
    /** @private @const {!Element} */
    this.wrapper_ = wrapper;
    wrapper.id = 'i-amphtml-wrapper';
    wrapper.className = topClasses;

    /** @private @const {!Observable} */
    this.scrollObservable_ = new Observable();

    /** @private @const {!Observable} */
    this.resizeObservable_ = new Observable();

    /** @const {function()} */
    this.boundScrollEventListener_ = this.onScrolled_.bind(this);

    /** @const {function()} */
    this.boundResizeEventListener_ = function () {return _this.resizeObservable_.fire();};

    /** @private {number} */
    this.paddingTop_ = 0;

    // Setup UI.
    /** @private {boolean} */
    this.setupDone_ = false;
    waitForBodyOpen(doc, this.setup_.bind(this));

    // Set overscroll (`-webkit-overflow-scrolling: touch`) later to avoid
    // iOS rendering bugs. See #8798 for details.
    whenDocumentReady(doc).then(function () {
      documentElement.classList.add('i-amphtml-ios-overscroll');
    });

    dev().fine(TAG_, 'initialized ios-embed-wrapper viewport');
  }

  /** @override */_createClass(ViewportBindingIosEmbedWrapper_, [{ key: "ensureReadyForElements", value:
    function ensureReadyForElements() {
      this.setup_();
    }

    /** @private */ }, { key: "setup_", value:
    function setup_() {
      if (this.setupDone_) {
        return;
      }
      this.setupDone_ = true;

      // Embedded scrolling on iOS is rather complicated. IFrames cannot be sized
      // and be scrollable. Sizing iframe by scrolling height has a big negative
      // that "fixed" position is essentially impossible. The only option we
      // found is to reset scrolling on the AMP doc, which wraps the natural BODY
      // inside the `overflow:auto` element. For reference, here are related
      // iOS issues (Chrome issues are also listed for reference):
      // - https://code.google.com/p/chromium/issues/detail?id=2891
      // - https://code.google.com/p/chromium/issues/detail?id=157855
      // - https://bugs.webkit.org/show_bug.cgi?id=106133
      // - https://bugs.webkit.org/show_bug.cgi?id=149264
      var doc = this.win.document;
      var body = /** @type {!Element} */(doc.body);
      doc.documentElement.appendChild(this.wrapper_);
      this.wrapper_.appendChild(body);
      // Redefine `document.body`, otherwise it'd be `null`.
      Object.defineProperty(doc, 'body', {
        get: function get() {return body;} });


      // Make sure the scroll position is adjusted correctly.
      this.onScrolled_();
    }

    /** @override */ }, { key: "connect", value:
    function connect() {
      this.win.addEventListener('resize', this.boundResizeEventListener_);
      this.wrapper_.addEventListener('scroll', this.boundScrollEventListener_);
    }

    /** @override */ }, { key: "disconnect", value:
    function disconnect() {
      this.win.removeEventListener('resize', this.boundResizeEventListener_);
      this.wrapper_.removeEventListener('scroll', this.boundScrollEventListener_);
    }

    /** @override */ }, { key: "getBorderTop", value:
    function getBorderTop() {
      // iOS needs an extra pixel to avoid scroll freezing.
      return 1;
    }

    /** @override */ }, { key: "requiresFixedLayerTransfer", value:
    function requiresFixedLayerTransfer() {
      if (!isExperimentOn(this.win, 'ios-fixed-no-transfer')) {
        return true;
      }
      // The jumping fixed elements have been fixed in iOS 12.2.
      var iosVersion = parseFloat(
      Services.platformFor(this.win).getIosVersionString());

      return iosVersion < 12.2;
    }

    /** @override */ }, { key: "overrideGlobalScrollTo", value:
    function overrideGlobalScrollTo() {
      return true;
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
      this.paddingTop_ = paddingTop;
      setImportantStyles(this.wrapper_, {
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
      this.wrapper_.classList.add('i-amphtml-scroll-disabled');
    }

    /** @override */ }, { key: "resetScroll", value:
    function resetScroll() {
      // TODO(jridgewell): Recursively disable scroll
      this.wrapper_.classList.remove('i-amphtml-scroll-disabled');
    }

    /** @override */ }, { key: "updateLightboxMode", value:
    function updateLightboxMode(unusedLightboxMode) {
      // The layout is always accurate.
      return _resolvedPromise();
    }

    /** @override */ }, { key: "getSize", value:
    function getSize() {
      return {
        width: this.win. /*OK*/innerWidth,
        height: this.win. /*OK*/innerHeight };

    }

    /** @override */ }, { key: "getScrollTop", value:
    function getScrollTop() {
      return this.wrapper_. /*OK*/scrollTop;
    }

    /** @override */ }, { key: "getScrollLeft", value:
    function getScrollLeft() {
      // The wrapper is set to overflow-x: hidden so the document cannot be
      // scrolled horizontally. The scrollLeft will always be 0.
      return 0;
    }

    /** @override */ }, { key: "getScrollWidth", value:
    function getScrollWidth() {
      return this.wrapper_. /*OK*/scrollWidth;
    }

    /** @override */ }, { key: "getScrollHeight", value:
    function getScrollHeight() {
      return this.wrapper_. /*OK*/scrollHeight;
    }

    /** @override */ }, { key: "getContentHeight", value:
    function getContentHeight() {
      // The wrapped body, not this.wrapper_ itself, will have the correct height.
      var content = this.win.document.body;
      var _content$getBoundingC = content. /*OK*/getBoundingClientRect(),height = _content$getBoundingC.height;

      // Unlike other viewport bindings, there's no need to include the
      // rect top since the wrapped body accounts for the top margin of children.
      // However, the parent's padding-top (this.paddingTop_) must be added.

      // As of Safari 12.1.1, the getBoundingClientRect().height does not include
      // the bottom margin of children and there's no other API that does.
      var childMarginBottom = marginBottomOfLastChild(this.win, content);

      var style = computedStyle(this.win, content);
      return (
      parseInt(style.marginTop, 10) +
      this.paddingTop_ +
      height +
      childMarginBottom +
      parseInt(style.marginBottom, 10));

    }

    /** @override */ }, { key: "contentHeightChanged", value:
    function contentHeightChanged() {}

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
      // If scroll top is 0, it's set to 1 to avoid scroll-freeze issue. See
      // `onScrolled_` for more details.
      this.wrapper_. /*OK*/scrollTop = scrollTop || 1;
    }

    /**
     * @param {!Event=} opt_event
     * @private
     */ }, { key: "onScrolled_", value:
    function onScrolled_(opt_event) {
      // Scroll document into a safe position to avoid scroll freeze on iOS.
      // This means avoiding scrollTop to be minimum (0) or maximum value.
      // This is very sad but very necessary. See #330 for more details.
      // Unfortunately, the same is very expensive to do on the bottom, due to
      // costly scrollHeight.
      if (this.wrapper_. /*OK*/scrollTop == 0) {
        this.wrapper_. /*OK*/scrollTop = 1;
        if (opt_event) {
          opt_event.preventDefault();
        }
      }
      if (opt_event) {
        this.scrollObservable_.fire();
      }
    }

    /** @override */ }, { key: "getScrollingElement", value:
    function getScrollingElement() {
      return this.wrapper_;
    }

    /** @override */ }, { key: "getScrollingElementScrollsLikeViewport", value:
    function getScrollingElementScrollsLikeViewport() {
      return false;
    } }]);return ViewportBindingIosEmbedWrapper_;}();
// /Users/mszylkowski/src/amphtml/src/service/viewport/viewport-binding-ios-embed-wrapper.js