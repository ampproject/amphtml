import { resolvedPromise as _resolvedPromise3 } from "./../../core/data-structures/promise";import { resolvedPromise as _resolvedPromise2 } from "./../../core/data-structures/promise";import { resolvedPromise as _resolvedPromise } from "./../../core/data-structures/promise";function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { VisibilityState } from "../../core/constants/visibility-state";
import { Observable } from "../../core/data-structures/observable";
import { tryResolve } from "../../core/data-structures/promise";
import { getVerticalScrollbarWidth, isIframed } from "../../core/dom";
import {
layoutRectFromDomRect,
layoutRectLtwh,
moveLayoutRect } from "../../core/dom/layout/rect";

import { closestAncestorElementBySelector } from "../../core/dom/query";
import { computedStyle, setStyle } from "../../core/dom/style";
import { clamp } from "../../core/math";
import { dict } from "../../core/types/object";

import { isExperimentOn } from "../../experiments";

import { Services } from "./..";

import { ViewportBindingDef } from "./viewport-binding-def";
import { ViewportBindingIosEmbedWrapper_ } from "./viewport-binding-ios-embed-wrapper";
import { ViewportBindingNatural_ } from "./viewport-binding-natural";
import { ViewportInterface } from "./viewport-interface";

import { Animation } from "../../animation";
import { getFriendlyIframeEmbedOptional } from "../../iframe-helper";
import { dev, devAssert } from "../../log";
import { getMode } from "../../mode";
import {
getParentWindowFrameElement,
registerServiceBuilderForDoc } from "../../service-helpers";

import { numeric } from "../../transition";

var TAG_ = 'Viewport';
var SCROLL_POS_TO_BLOCK = {
  'top': 'start',
  'center': 'center',
  'bottom': 'end' };

var SMOOTH_SCROLL_DELAY_ = 300;

/**
 * @param {!Window} win
 * @param {!Element} element
 * @param {string=} property
 * @return {number}
 */
function getComputedStylePropertyPixels(win, element, property) {
  var value = parseInt(computedStyle(win, element)[property], 10);
  return isNaN(value) ? 0 : value;
}

/**
 * @param {!Window} win
 * @param {!Element} element
 * @param {string=} property
 * @return {number}
 */
function getScrollPadding(win, element, property) {
  // Due to https://bugs.webkit.org/show_bug.cgi?id=106133, WebKit browsers use
  // use `body` and NOT `documentElement` for scrolling purposes.
  // (We get this node from `ViewportBindingNatural`.)
  // However, `scroll-padding-*` properties are effective only on the `html`
  // selector across browsers, thus we use the `documentElement`.
  var effectiveElement =
  element === win.document.body ? win.document.documentElement : element;
  return getComputedStylePropertyPixels(win, effectiveElement, property);
}

/**
 * @param {!Window} win
 * @param {!Element} element
 * @return {number}
 */
function getScrollPaddingTop(win, element) {
  return getScrollPadding(win, element, 'scrollPaddingTop');
}

/**
 * @param {!Window} win
 * @param {!Element} element
 * @return {number}
 */
function getScrollPaddingBottom(win, element) {
  return getScrollPadding(win, element, 'scrollPaddingBottom');
}

/**
 * This object represents the viewport. It tracks scroll position, resize
 * and other events and notifies interesting parties when viewport has changed
 * and how.
 *
 * @implements {ViewportInterface}
 */
export var ViewportImpl = /*#__PURE__*/function () {
  /**
   * @param {!../ampdoc-impl.AmpDoc} ampdoc
   * @param {!ViewportBindingDef} binding
   * @param {!../viewer-interface.ViewerInterface} viewer
   */
  function ViewportImpl(ampdoc, binding, viewer) {var _this = this;_classCallCheck(this, ViewportImpl);
    var win = ampdoc.win;

    /** @const {!../ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /**
     * Some viewport operations require the global document.
     * @private @const {!Document}
     */
    this.globalDoc_ = this.ampdoc.win.document;

    /** @const {!ViewportBindingDef} */
    this.binding_ = binding;

    /** @const {!../viewer-interface.ViewerInterface} */
    this.viewer_ = viewer;

    /**
     * Used to cache the rect of the viewport.
     * @private {?../../layout-rect.LayoutRectDef}
     */
    this.rect_ = null;

    /**
     * Used to cache the size of the viewport. Also used as last known size,
     * so users should call getSize early on to get a value. The timing should
     * be chosen to avoid extra style recalcs.
     * @private {{width: number, height: number}|null}
     */
    this.size_ = null;

    /** @private {?number} */
    this. /*OK*/scrollTop_ = null;

    /** @private {boolean} */
    this.scrollAnimationFrameThrottled_ = false;

    /** @private {?number} */
    this. /*OK*/scrollLeft_ = null;

    /** @private {number} */
    this.paddingTop_ = Number(viewer.getParam('paddingTop') || 0);

    /** @private {number} */
    this.lastPaddingTop_ = 0;

    /** @private {!../timer-impl.Timer} */
    this.timer_ = Services.timerFor(win);

    /** @private {!../vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(win);

    /** @private {boolean} */
    this.scrollTracking_ = false;

    /** @private {Element} */
    this.scrollingElement_ = null;

    /** @private {number} */
    this.scrollCount_ = 0;

    /** @private @const {!Observable<!./viewport-interface.ViewportChangedEventDef>} */
    this.changeObservable_ = new Observable();

    /** @private @const {!Observable} */
    this.scrollObservable_ = new Observable();

    /** @private @const {!Observable<!./viewport-interface.ViewportResizedEventDef>} */
    this.resizeObservable_ = new Observable();

    /** @private {?HTMLMetaElement|undefined} */
    this.viewportMeta_ = undefined;

    /** @private {string|undefined} */
    this.originalViewportMetaString_ = undefined;

    /** @private {?../fixed-layer.FixedLayer} */
    this.fixedLayer_ = null;

    this.viewer_.onMessage('viewport', this.updateOnViewportEvent_.bind(this));
    this.viewer_.onMessage('scroll', this.viewerSetScrollTop_.bind(this));
    this.viewer_.onMessage(
    'disableScroll',
    this.disableScrollEventHandler_.bind(this));

    if (this.viewer_.isEmbedded()) {
      this.binding_.updatePaddingTop(this.paddingTop_);
    }

    this.binding_.onScroll(this.scroll_.bind(this));
    this.binding_.onResize(this.resize_.bind(this));

    this.onScroll(this.sendScrollMessage_.bind(this));

    /** @private {boolean} */
    this.visible_ = false;
    this.ampdoc.onVisibilityChanged(this.updateVisibility_.bind(this));
    this.updateVisibility_();

    // Top-level mode classes.
    var globalDocElement = this.globalDoc_.documentElement;
    if (ampdoc.isSingleDoc()) {
      globalDocElement.classList.add('i-amphtml-singledoc');
    }
    if (viewer.isEmbedded()) {
      globalDocElement.classList.add('i-amphtml-embedded');
    } else {
      globalDocElement.classList.add('i-amphtml-standalone');
    }
    if (isIframed(win)) {
      globalDocElement.classList.add('i-amphtml-iframed');
    }
    if (viewer.getParam('webview') === '1') {
      globalDocElement.classList.add('i-amphtml-webview');
    }

    // To avoid browser restore scroll position when traverse history
    if (isIframed(win) && 'scrollRestoration' in win.history) {
      win.history.scrollRestoration = 'manual';
    }

    // Override global scrollTo if requested.
    if (this.binding_.overrideGlobalScrollTo()) {
      try {
        Object.defineProperty(win, 'scrollTo', {
          value: function value(x, y) {return _this.setScrollTop(y);} });

        ['pageYOffset', 'scrollY'].forEach(function (prop) {
          Object.defineProperty(win, prop, {
            get: function get() {return _this.getScrollTop();} });

        });
      } catch (e) {
        // Ignore errors.
      }
    }

    // BF-cache navigation sometimes breaks clicks in an iframe on iOS. See
    // https://github.com/ampproject/amphtml/issues/30838 for more details.
    // The solution is to make a "fake" scrolling API call.
    var isIframedIos = Services.platformFor(win).isIos() && isIframed(win);
    // We dont want to scroll if we're in a shadow doc, so check that we're
    // in a single doc. Fix for
    // https://github.com/ampproject/amphtml/issues/32165.
    if (isIframedIos && this.ampdoc.isSingleDoc()) {
      this.ampdoc.whenReady().then(function () {
        win. /*OK*/scrollTo(-0.1, 0);
      });
    }
  }

  /** @override */_createClass(ViewportImpl, [{ key: "dispose", value:
    function dispose() {
      this.binding_.disconnect();
    }

    /** @override */ }, { key: "ensureReadyForElements", value:
    function ensureReadyForElements() {
      this.binding_.ensureReadyForElements();
    }

    /** @private */ }, { key: "updateVisibility_", value:
    function updateVisibility_() {
      var visible = this.ampdoc.isVisible();
      if (visible != this.visible_) {
        this.visible_ = visible;
        if (visible) {
          this.binding_.connect();
          if (this.size_) {
            // If the size has already been intialized, check it again in case
            // the size has changed between `disconnect` and `connect`.
            this.resize_();
          }
          if (this.scrollTop_) {
            // Remeasure scrollTop when resource becomes visible to fix #11983
            this. /*OK*/scrollTop_ = null;
            this.getScrollTop();
          }
        } else {
          this.binding_.disconnect();
        }
      }
    }

    /** @override */ }, { key: "getPaddingTop", value:
    function getPaddingTop() {
      return this.paddingTop_;
    }

    /** @override */ }, { key: "getScrollTop", value:
    function getScrollTop() {
      if (this. /*OK*/scrollTop_ == null) {
        this. /*OK*/scrollTop_ = this.binding_.getScrollTop();
      }
      return this. /*OK*/scrollTop_;
    }

    /** @override */ }, { key: "getScrollLeft", value:
    function getScrollLeft() {
      if (this. /*OK*/scrollLeft_ == null) {
        this. /*OK*/scrollLeft_ = this.binding_.getScrollLeft();
      }
      return this. /*OK*/scrollLeft_;
    }

    /** @override */ }, { key: "setScrollTop", value:
    function setScrollTop(scrollPos) {
      this. /*OK*/scrollTop_ = null;
      this.binding_.setScrollTop(scrollPos);
    }

    /** @override */ }, { key: "updatePaddingBottom", value:
    function updatePaddingBottom(paddingBottom) {
      this.ampdoc.waitForBodyOpen().then(function (body) {
        setStyle(body, 'borderBottom', "".concat(paddingBottom, "px solid transparent"));
      });
    }

    /** @override */ }, { key: "getSize", value:
    function getSize() {
      if (this.size_) {
        return this.size_;
      }
      this.size_ = this.binding_.getSize();
      if (this.size_.width == 0 || this.size_.height == 0) {
        // Only report when the visibility is "visible" or "prerender".
        var visibilityState = this.ampdoc.getVisibilityState();
        if (
        visibilityState == VisibilityState.PRERENDER ||
        visibilityState == VisibilityState.VISIBLE)
        {
          if (Math.random() < 0.01) {
            dev().error(TAG_, 'viewport has zero dimensions');
          }
        }
      }
      return this.size_;
    }

    /** @override */ }, { key: "getHeight", value:
    function getHeight() {
      return this.getSize().height;
    }

    /** @override */ }, { key: "getWidth", value:
    function getWidth() {
      return this.getSize().width;
    }

    /** @override */ }, { key: "getScrollWidth", value:
    function getScrollWidth() {
      return this.binding_.getScrollWidth();
    }

    /** @override */ }, { key: "getScrollHeight", value:
    function getScrollHeight() {
      return this.binding_.getScrollHeight();
    }

    /** @override */ }, { key: "getContentHeight", value:
    function getContentHeight() {
      return this.binding_.getContentHeight();
    }

    /** @override */ }, { key: "contentHeightChanged", value:
    function contentHeightChanged() {
      this.binding_.contentHeightChanged();
    }

    /** @override */ }, { key: "getRect", value:
    function getRect() {
      if (this.rect_ == null) {
        var scrollTop = this.getScrollTop();
        var scrollLeft = this.getScrollLeft();
        var size = this.getSize();
        this.rect_ = layoutRectLtwh(
        scrollLeft,
        scrollTop,
        size.width,
        size.height);

      }
      return this.rect_;
    }

    /** @override */ }, { key: "getLayoutRect", value:
    function getLayoutRect(el) {
      var scrollLeft = this.getScrollLeft();
      var scrollTop = this.getScrollTop();

      // Go up the window hierarchy through friendly iframes.
      var frameElement = getParentWindowFrameElement(el, this.ampdoc.win);
      if (frameElement) {
        var b = this.binding_.getLayoutRect(el, 0, 0);
        var c = this.binding_.getLayoutRect(
        frameElement,
        scrollLeft,
        scrollTop);

        return layoutRectLtwh(
        Math.round(b.left + c.left),
        Math.round(b.top + c.top),
        Math.round(b.width),
        Math.round(b.height));

      }

      return this.binding_.getLayoutRect(el, scrollLeft, scrollTop);
    }

    /** @override */ }, { key: "getClientRectAsync", value:
    function getClientRectAsync(el) {
      var local = this.vsync_.measurePromise(function () {
        return el. /*OK*/getBoundingClientRect();
      });

      var root = this.binding_.getRootClientRectAsync();
      var frameElement = getParentWindowFrameElement(el, this.ampdoc.win);
      if (frameElement) {
        root = this.vsync_.measurePromise(function () {
          return frameElement. /*OK*/getBoundingClientRect();
        });
      }

      return Promise.all([local, root]).then(function (values) {
        var l = values[0];
        var r = values[1];
        if (!r) {
          return layoutRectFromDomRect(l);
        }
        return moveLayoutRect(l, r.left, r.top);
      });
    }

    /** @override */ }, { key: "supportsPositionFixed", value:
    function supportsPositionFixed() {
      return this.binding_.supportsPositionFixed();
    }

    /** @override */ }, { key: "isDeclaredFixed", value:
    function isDeclaredFixed(element) {
      if (!this.fixedLayer_) {
        return false;
      }
      return this.fixedLayer_.isDeclaredFixed(element);
    }

    /** @override */ }, { key: "scrollIntoView", value:
    function scrollIntoView(element) {var _this2 = this;
      if (false) {
        element. /* OK */scrollIntoView();
        return _resolvedPromise();
      } else {
        return this.getScrollingContainerFor_(element).then(function (parent) {return (
            _this2.scrollIntoViewInternal_(element, parent));});

      }
    }

    /**
     * @param {!Element} element
     * @param {!Element} parent
     */ }, { key: "scrollIntoViewInternal_", value:
    function scrollIntoViewInternal_(element, parent) {var _this3 = this;
      var elementTop = this.binding_.getLayoutRect(element).top;
      var scrollPaddingTop = getScrollPaddingTop(this.ampdoc.win, parent);
      var newScrollTopPromise = tryResolve(function () {return (
          Math.max(0, elementTop - _this3.paddingTop_ - scrollPaddingTop));});


      newScrollTopPromise.then(function (newScrollTop) {return (
          _this3.setElementScrollTop_(parent, newScrollTop));});

    }

    /** @override */ }, { key: "animateScrollIntoView", value:
    function animateScrollIntoView(element) {var _this4 = this;var pos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'top';var opt_duration = arguments.length > 2 ? arguments[2] : undefined;var opt_curve = arguments.length > 3 ? arguments[3] : undefined;
      if (false) {
        return new Promise(function (resolve, opt_) {
          element. /* OK */scrollIntoView({
            block: SCROLL_POS_TO_BLOCK[pos],
            behavior: 'smooth' });

          setTimeout(resolve, SMOOTH_SCROLL_DELAY_);
        });
      } else {
        devAssert(
        !opt_curve || opt_duration !== undefined);



        return this.getScrollingContainerFor_(element).then(function (parent) {return (
            _this4.animateScrollWithinParent(
            element,
            parent, /** @type {string} */(
            pos),
            opt_duration,
            opt_curve));});


      }
    }

    /** @override */ }, { key: "animateScrollWithinParent", value:
    function animateScrollWithinParent(element, parent, pos, opt_duration, opt_curve) {var _this5 = this;
      devAssert(
      !opt_curve || opt_duration !== undefined);



      var elementRect = this.binding_.getLayoutRect(element);

      var _ref = this.isScrollingElement_(parent) ?
      this.getSize() :
      this.getLayoutRect(parent),parentHeight = _ref.height;

      var win = this.ampdoc.win;
      var scrollPaddingTop = getScrollPaddingTop(win, parent);
      var scrollPaddingBottom = getScrollPaddingBottom(win, parent);

      var offset = -scrollPaddingTop; // default pos === 'top'

      if (pos === 'bottom') {
        offset = -parentHeight + scrollPaddingBottom + elementRect.height;
      } else if (pos === 'center') {
        var effectiveParentHeight =
        parentHeight - scrollPaddingTop - scrollPaddingBottom;
        offset = -effectiveParentHeight / 2 + elementRect.height / 2;
      }

      return this.getElementScrollTop_(parent).then(function (curScrollTop) {
        var calculatedScrollTop = elementRect.top - _this5.paddingTop_ + offset;
        var newScrollTop = Math.max(0, calculatedScrollTop);
        if (newScrollTop == curScrollTop) {
          return;
        }
        return _this5.interpolateScrollIntoView_(
        parent,
        curScrollTop,
        newScrollTop,
        opt_duration,
        opt_curve);

      });
    }

    /**
     * @param {!Element} parent
     * @param {number} curScrollTop
     * @param {number} newScrollTop
     * @param {number=} opt_duration
     * @param {string=} curve
     * @private
     */ }, { key: "interpolateScrollIntoView_", value:
    function interpolateScrollIntoView_(
    parent,
    curScrollTop,
    newScrollTop,
    opt_duration)

    {var _this6 = this;var curve = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'ease-in';
      var duration =
      opt_duration !== undefined ? /** @type {number} */(
      opt_duration) :
      getDefaultScrollAnimationDuration(curScrollTop, newScrollTop);

      /** @const {!TransitionDef<number>} */
      var interpolate = numeric(curScrollTop, newScrollTop);
      return Animation.animate(
      parent,
      function (position) {
        _this6.setElementScrollTop_(parent, interpolate(position));
      },
      duration,
      curve).
      thenAlways(function () {
        _this6.setElementScrollTop_(parent, newScrollTop);
      });
    }

    /**
     * @param {!Element} element
     * @return {!Promise<!Element>}
     */ }, { key: "getScrollingContainerFor_", value:
    function getScrollingContainerFor_(element) {var _this7 = this;
      return this.vsync_.measurePromise(
      function () {return (
          closestAncestorElementBySelector(element, '.i-amphtml-scrollable') ||
          _this7.binding_.getScrollingElement());});

    }

    /**
     * @param {!Element} element
     * @param {number} scrollTop
     */ }, { key: "setElementScrollTop_", value:
    function setElementScrollTop_(element, scrollTop) {
      if (this.isScrollingElement_(element)) {
        this.binding_.setScrollTop(scrollTop);
        return;
      }
      this.vsync_.mutate(function () {
        element. /*OK*/scrollTop = scrollTop;
      });
    }

    /**
     * @param {!Element} element
     * @return {!Promise<number>}
     */ }, { key: "getElementScrollTop_", value:
    function getElementScrollTop_(element) {var _this8 = this;
      if (this.isScrollingElement_(element)) {
        return tryResolve(function () {return _this8.getScrollTop();});
      }
      return this.vsync_.measurePromise(function () {return element. /*OK*/scrollTop;});
    }

    /**
     * @param {!Element} element
     * @return {boolean}
     */ }, { key: "isScrollingElement_", value:
    function isScrollingElement_(element) {
      return element == this.binding_.getScrollingElement();
    }

    /** @override */ }, { key: "getScrollingElement", value:
    function getScrollingElement() {
      if (this.scrollingElement_) {
        return this.scrollingElement_;
      }
      return (this.scrollingElement_ = this.binding_.getScrollingElement());
    }

    /** @override */ }, { key: "onChanged", value:
    function onChanged(handler) {
      return this.changeObservable_.add(handler);
    }

    /** @override */ }, { key: "onScroll", value:
    function onScroll(handler) {
      return this.scrollObservable_.add(handler);
    }

    /** @override */ }, { key: "onResize", value:
    function onResize(handler) {
      return this.resizeObservable_.add(handler);
    }

    /** @override */ }, { key: "enterLightboxMode", value:
    function enterLightboxMode(opt_requestingElement, opt_onComplete) {
      this.viewer_.sendMessage(
      'requestFullOverlay',
      dict(),
      /* cancelUnsent */true);


      this.enterOverlayMode();
      if (this.fixedLayer_) {
        this.fixedLayer_.enterLightbox(opt_requestingElement, opt_onComplete);
      }

      if (opt_requestingElement) {
        this.maybeEnterFieLightboxMode( /** @type {!Element} */(
        opt_requestingElement));

      }

      return this.binding_.updateLightboxMode(true);
    }

    /** @override */ }, { key: "leaveLightboxMode", value:
    function leaveLightboxMode(opt_requestingElement) {
      this.viewer_.sendMessage(
      'cancelFullOverlay',
      dict(),
      /* cancelUnsent */true);


      if (this.fixedLayer_) {
        this.fixedLayer_.leaveLightbox();
      }
      this.leaveOverlayMode();

      if (opt_requestingElement) {
        this.maybeLeaveFieLightboxMode( /** @type {!Element} */(
        opt_requestingElement));

      }

      return this.binding_.updateLightboxMode(false);
    }

    /**
     * @return {boolean}
     * @visibleForTesting
     */ }, { key: "isLightboxExperimentOn", value:
    function isLightboxExperimentOn() {
      return isExperimentOn(this.ampdoc.win, 'amp-lightbox-a4a-proto');
    }

    /**
     * Enters frame lightbox mode if under a Friendly Iframe Embed.
     * @param {!Element} requestingElement
     * @visibleForTesting
     */ }, { key: "maybeEnterFieLightboxMode", value:
    function maybeEnterFieLightboxMode(requestingElement) {
      var fieOptional = this.getFriendlyIframeEmbed_(requestingElement);

      if (fieOptional) {
        devAssert(
        this.isLightboxExperimentOn());




        fieOptional.enterFullOverlayMode();
      }
    }

    /**
     * Leaves frame lightbox mode if under a Friendly Iframe Embed.
     * @param {!Element} requestingElement
     * @visibleForTesting
     */ }, { key: "maybeLeaveFieLightboxMode", value:
    function maybeLeaveFieLightboxMode(requestingElement) {
      var fieOptional = this.getFriendlyIframeEmbed_(requestingElement);

      if (fieOptional) {
        devAssert(fieOptional).leaveFullOverlayMode();
      }
    }

    /**
     * Get FriendlyIframeEmbed if available.
     * @param {!Element} element Element supposedly inside the FIE.
     * @return {?../../friendly-iframe-embed.FriendlyIframeEmbed}
     * @private
     */ }, { key: "getFriendlyIframeEmbed_", value:
    function getFriendlyIframeEmbed_(element) {
      var iframeOptional = getParentWindowFrameElement(
      element,
      this.ampdoc.win);


      return (
      iframeOptional &&
      getFriendlyIframeEmbedOptional( /** @type {!Element} */
      /** @type {!HTMLIFrameElement} */(
      iframeOptional)));


    }

    /** @override */ }, { key: "enterOverlayMode", value:
    function enterOverlayMode() {
      this.disableTouchZoom();
      this.disableScroll();
    }

    /** @override */ }, { key: "leaveOverlayMode", value:
    function leaveOverlayMode() {
      this.resetScroll();
      this.restoreOriginalTouchZoom();
    }

    /** @override */ }, { key: "disableScroll", value:
    function disableScroll() {var _this9 = this;
      var win = this.ampdoc.win;
      var documentElement = win.document.documentElement;
      var requestedMarginRight;

      // Calculate the scrollbar width so we can set it as a right margin. This
      // is so that we do not cause content to shift when we disable scroll on
      // platforms that have a width-taking scrollbar.
      this.vsync_.measure(function () {
        var existingMargin = computedStyle(win, documentElement).marginRight;
        var scrollbarWidth = getVerticalScrollbarWidth(_this9.ampdoc.win);

        requestedMarginRight = parseInt(existingMargin, 10) + scrollbarWidth;
      });

      this.vsync_.mutate(function () {
        setStyle(documentElement, 'margin-right', requestedMarginRight, 'px');
        _this9.binding_.disableScroll();
      });
    }

    /** @override */ }, { key: "resetScroll", value:
    function resetScroll() {var _this10 = this;
      var win = this.ampdoc.win;
      var documentElement = win.document.documentElement;

      this.vsync_.mutate(function () {
        setStyle(documentElement, 'margin-right', '');
        _this10.binding_.resetScroll();
      });
    }

    /** @override */ }, { key: "resetTouchZoom", value:
    function resetTouchZoom() {var _this11 = this;
      var windowHeight = this.ampdoc.win. /*OK*/innerHeight;
      var documentHeight = this.globalDoc_.documentElement. /*OK*/clientHeight;
      if (windowHeight && documentHeight && windowHeight === documentHeight) {
        // This code only works when scrollbar overlay content and take no space,
        // which is fine on mobile. For non-mobile devices this code is
        // irrelevant.
        return;
      }
      if (this.disableTouchZoom()) {
        this.timer_.delay(function () {
          _this11.restoreOriginalTouchZoom();
        }, 50);
      }
    }

    /** @override */ }, { key: "disableTouchZoom", value:
    function disableTouchZoom() {
      var viewportMeta = this.getViewportMeta_();
      if (!viewportMeta) {
        // This should never happen in a valid AMP document, thus shortcircuit.
        return false;
      }
      // Setting maximum-scale=1 and user-scalable=no zooms page back to normal
      // and prohibit further default zooming.
      var newValue = updateViewportMetaString(viewportMeta.content, {
        'maximum-scale': '1',
        'user-scalable': 'no' });

      return this.setViewportMetaString_(newValue);
    }

    /** @override */ }, { key: "restoreOriginalTouchZoom", value:
    function restoreOriginalTouchZoom() {
      if (this.originalViewportMetaString_ !== undefined) {
        return this.setViewportMetaString_(this.originalViewportMetaString_);
      }
      return false;
    }

    /** @override */ }, { key: "updateFixedLayer", value:
    function updateFixedLayer() {
      if (!this.fixedLayer_) {
        return _resolvedPromise2();
      }
      return this.fixedLayer_.update();
    }

    /** @override */ }, { key: "addToFixedLayer", value:
    function addToFixedLayer(element, opt_forceTransfer) {
      if (!this.fixedLayer_) {
        return _resolvedPromise3();
      }
      return this.fixedLayer_.addElement(element, opt_forceTransfer);
    }

    /** @override */ }, { key: "removeFromFixedLayer", value:
    function removeFromFixedLayer(element) {
      if (!this.fixedLayer_) {
        return;
      }
      this.fixedLayer_.removeElement(element);
    }

    /** @override */ }, { key: "createFixedLayer", value:
    function createFixedLayer(constructor) {var _this12 = this;
      this.fixedLayer_ = new constructor(
      this.ampdoc,
      this.vsync_,
      this.binding_.getBorderTop(),
      this.paddingTop_,
      this.binding_.requiresFixedLayerTransfer());

      this.ampdoc.whenReady().then(function () {return _this12.fixedLayer_.setup();});
    }

    /**
     * Updates touch zoom meta data. Returns `true` if any actual
     * changes have been done.
     * @param {string} viewportMetaString
     * @return {boolean}
     */ }, { key: "setViewportMetaString_", value:
    function setViewportMetaString_(viewportMetaString) {
      var viewportMeta = this.getViewportMeta_();
      if (viewportMeta && viewportMeta.content != viewportMetaString) {
        dev().fine(TAG_, 'changed viewport meta to:', viewportMetaString);
        viewportMeta.content = viewportMetaString;
        return true;
      }
      return false;
    }

    /**
     * @return {?HTMLMetaElement}
     * @private
     */ }, { key: "getViewportMeta_", value:
    function getViewportMeta_() {
      if (isIframed(this.ampdoc.win)) {
        // An embedded document does not control its viewport meta tag.
        return null;
      }
      if (this.viewportMeta_ === undefined) {
        this.viewportMeta_ = /** @type {?HTMLMetaElement} */(
        this.globalDoc_.querySelector('meta[name=viewport]'));

        if (this.viewportMeta_) {
          this.originalViewportMetaString_ = this.viewportMeta_.content;
        }
      }
      return this.viewportMeta_;
    }

    /**
     * @param {!JsonObject} data
     * @private
     */ }, { key: "viewerSetScrollTop_", value:
    function viewerSetScrollTop_(data) {
      var targetScrollTop = data['scrollTop'];
      this.setScrollTop(targetScrollTop);
    }

    /**
     * @param {!JsonObject} data
     * @private
     */ }, { key: "updateOnViewportEvent_", value:
    function updateOnViewportEvent_(data) {var _this13 = this;
      var paddingTop = data['paddingTop'];
      var duration = data['duration'] || 0;
      var curve = data['curve'];
      /** @const {boolean} */
      var transient = data['transient'];

      if (paddingTop == undefined || paddingTop == this.paddingTop_) {
        return;
      }

      this.lastPaddingTop_ = this.paddingTop_;
      this.paddingTop_ = paddingTop;

      if (this.fixedLayer_) {
        var animPromise = this.fixedLayer_.animateFixedElements(
        this.paddingTop_,
        this.lastPaddingTop_,
        duration,
        curve,
        transient);

        if (paddingTop < this.lastPaddingTop_) {
          this.binding_.hideViewerHeader(transient, this.lastPaddingTop_);
        } else {
          animPromise.then(function () {
            _this13.binding_.showViewerHeader(transient, paddingTop);
          });
        }
      }
    }

    /**
     * @param {!JsonObject} data
     * @private
     */ }, { key: "disableScrollEventHandler_", value:
    function disableScrollEventHandler_(data) {
      if (!!data) {
        this.disableScroll();
      } else {
        this.resetScroll();
      }
    }

    /**
     * @param {boolean} relayoutAll
     * @param {number} velocity
     * @private
     */ }, { key: "changed_", value:
    function changed_(relayoutAll, velocity) {
      var size = this.getSize();
      var scrollTop = this.getScrollTop();
      var scrollLeft = this.getScrollLeft();
      dev().fine(
      TAG_,
      'changed event:',
      'relayoutAll=',
      relayoutAll,
      'top=',
      scrollTop,
      'left=',
      scrollLeft,
      'bottom=',
      scrollTop + size.height,
      'velocity=',
      velocity);

      this.changeObservable_.fire({
        relayoutAll: relayoutAll,
        top: scrollTop,
        left: scrollLeft,
        width: size.width,
        height: size.height,
        velocity: velocity });

    }

    /** @private */ }, { key: "scroll_", value:
    function scroll_() {var _this14 = this;
      this.rect_ = null;
      this.scrollCount_++;
      this.scrollLeft_ = this.binding_.getScrollLeft();
      var newScrollTop = this.binding_.getScrollTop();
      if (newScrollTop < 0) {
        // iOS and some other browsers use negative values of scrollTop for
        // overscroll. Overscroll does not affect the viewport and thus should
        // be ignored here.
        return;
      }
      this.scrollTop_ = newScrollTop;
      if (!this.scrollTracking_) {
        this.scrollTracking_ = true;
        var now = Date.now();
        // Wait 2 frames and then request an animation frame.
        this.timer_.delay(function () {
          _this14.vsync_.measure(function () {
            _this14.throttledScroll_(now, newScrollTop);
          });
        }, 36);
      }
      this.scrollObservable_.fire();
    }

    /**
     * This method is called about every 3 frames (assuming 60hz) and it
     * is called in a vsync measure task.
     * @param {number} referenceTime Time when the scroll measurement, that
     *     triggered this call made, was made.
     * @param {number} referenceTop Scrolltop at that time.
     * @private
     */ }, { key: "throttledScroll_", value:
    function throttledScroll_(referenceTime, referenceTop) {var _this15 = this;
      this.scrollTop_ = this.binding_.getScrollTop();
      /**  @const {number} */
      var newScrollTop = this.scrollTop_;
      var now = Date.now();
      var velocity = 0;
      if (now != referenceTime) {
        velocity = (newScrollTop - referenceTop) / (now - referenceTime);
      }
      dev().fine(
      TAG_,
      'scroll: scrollTop=' + newScrollTop + '; velocity=' + velocity);

      if (Math.abs(velocity) < 0.03) {
        this.changed_( /* relayoutAll */false, velocity);
        this.scrollTracking_ = false;
      } else {
        this.timer_.delay(
        function () {return (
            _this15.vsync_.measure(
            _this15.throttledScroll_.bind(_this15, now, newScrollTop)));},

        20);

      }
    }

    /**
     * Send scroll message via the viewer per animation frame
     * @private
     */ }, { key: "sendScrollMessage_", value:
    function sendScrollMessage_() {var _this16 = this;
      if (!this.scrollAnimationFrameThrottled_) {
        this.scrollAnimationFrameThrottled_ = true;
        this.vsync_.measure(function () {
          _this16.scrollAnimationFrameThrottled_ = false;
          _this16.viewer_.sendMessage(
          'scroll',
          dict({ 'scrollTop': _this16.getScrollTop() }),
          /* cancelUnsent */true);

        });
      }
    }

    /** @private */ }, { key: "resize_", value:
    function resize_() {var _this17 = this;
      this.rect_ = null;
      var oldSize = this.size_;
      this.size_ = null; // Need to recalc.
      var newSize = this.getSize();
      this.updateFixedLayer().then(function () {
        var widthChanged = !oldSize || oldSize.width != newSize.width;
        _this17.changed_( /*relayoutAll*/widthChanged, 0);
        var sizeChanged = widthChanged || oldSize.height != newSize.height;
        if (sizeChanged) {
          _this17.resizeObservable_.fire({
            relayoutAll: widthChanged,
            width: newSize.width,
            height: newSize.height });

        }
      });
    } }]);return ViewportImpl;}();


/**
 * Parses viewport meta value. It usually looks like:
 * ```
 * width=device-width,initial-scale=1,minimum-scale=1
 * ```
 * @param {string} content
 * @return {!Object<string, (string|undefined)>}
 * @private Visible for testing only.
 */
export function parseViewportMeta(content) {
  // Ex: width=device-width,initial-scale=1,minimal-ui
  var params = Object.create(null);
  if (!content) {
    return params;
  }
  var pairs = content.split(/,|;/);
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    var split = pair.split('=');
    var name = split[0].trim();
    var value = split[1];
    value = (value || '').trim();
    if (name) {
      params[name] = value;
    }
  }
  return params;
}

/**
 * Stringifies viewport meta value based on the provided map. It usually looks
 * like:
 * ```
 * width=device-width,initial-scale=1,minimum-scale=1
 * ```
 * @param {!Object<string, string>} params
 * @return {string}
 * @private Visible for testing only.
 */
export function stringifyViewportMeta(params) {
  // Ex: width=device-width,initial-scale=1,minimal-ui
  var content = '';
  for (var k in params) {
    if (content.length > 0) {
      content += ',';
    }
    if (params[k]) {
      content += k + '=' + params[k];
    } else {
      content += k;
    }
  }
  return content;
}

/**
 * This method makes a minimal effort to keep the original viewport string
 * unchanged if in fact none of the values have been updated. Returns the
 * updated string or the `currentValue` if no changes were necessary.
 *
 * @param {string} currentValue
 * @param {!Object<string, string|undefined>} updateParams
 * @return {string}
 * @private Visible for testing only.
 */
export function updateViewportMetaString(currentValue, updateParams) {
  var params = parseViewportMeta(currentValue);
  var changed = false;
  for (var k in updateParams) {
    if (params[k] !== updateParams[k]) {
      changed = true;
      if (updateParams[k] !== undefined) {
        params[k] = /** @type {string} */(updateParams[k]);
      } else {
        delete params[k];
      }
    }
  }
  if (!changed) {
    return currentValue;
  }
  return stringifyViewportMeta(params);
}

/**
 * Calculates a default duration for a scrollTop animation.
 * @param {number} scrollTopA commutative with b.
 * @param {number} scrollTopB commutative with a.
 * @param {number=} max in ms. default 500ms.
 * @return {number}
 */
function getDefaultScrollAnimationDuration(scrollTopA, scrollTopB) {var max = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 500;
  // 65% of scroll Δ to ms, eg 1000px -> 650ms, integer between 0 and max
  return Math.floor(clamp(0.65 * Math.abs(scrollTopA - scrollTopB), 0, max));
}

/**
 * @param {!../ampdoc-impl.AmpDoc} ampdoc
 * @return {!ViewportImpl}
 * @private
 */
function createViewport(ampdoc) {
  var viewer = Services.viewerForDoc(ampdoc);
  var win = ampdoc.win;
  var binding;
  if (
  ampdoc.isSingleDoc() &&
  getViewportType(win, viewer) == ViewportType.NATURAL_IOS_EMBED &&
  !false)
  {
    binding = new ViewportBindingIosEmbedWrapper_(win);
  } else {
    binding = new ViewportBindingNatural_(ampdoc);
  }
  return new ViewportImpl(ampdoc, binding, viewer);
}

/**
 * The type of the viewport.
 * @enum {string}
 */
var ViewportType = {
  /**
   * Viewer leaves sizing and scrolling up to the AMP document's window.
   */
  NATURAL: 'natural',

  /**
   * This is AMP-specific type and doesn't come from viewer. This is the type
   * that AMP sets when Viewer has requested "natural" viewport on a iOS
   * device.
   * See:
   * https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-html-layout.md
   */
  NATURAL_IOS_EMBED: 'natural-ios-embed' };


/**
 * @param {!Window} win
 * @param {!../viewer-interface.ViewerInterface} viewer
 * @return {string}
 */
function getViewportType(win, viewer) {
  var isIframedIos = Services.platformFor(win).isIos() && isIframed(win);

  // Enable iOS Embedded mode for iframed tests (e.g. integration tests).
  if (false && isIframedIos) {
    return ViewportType.NATURAL_IOS_EMBED;
  }

  // Override to ios-embed for iframe-viewer mode.
  if (
  isIframedIos &&
  viewer.isEmbedded() &&
  !viewer.hasCapability('iframeScroll'))
  {
    return ViewportType.NATURAL_IOS_EMBED;
  }
  return ViewportType.NATURAL;
}

/**
 * @param {!../ampdoc-impl.AmpDoc} ampdoc
 */
export function installViewportServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(
  ampdoc,
  'viewport',
  createViewport,
  /* opt_instantiate */true);

}
// /Users/mszylkowski/src/amphtml/src/service/viewport/viewport-impl.js