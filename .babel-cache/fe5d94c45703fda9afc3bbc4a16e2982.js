import { resolvedPromise as _resolvedPromise3 } from "./../../core/data-structures/promise";
import { resolvedPromise as _resolvedPromise2 } from "./../../core/data-structures/promise";
import { resolvedPromise as _resolvedPromise } from "./../../core/data-structures/promise";

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
import { VisibilityState } from "../../core/constants/visibility-state";
import { Observable } from "../../core/data-structures/observable";
import { tryResolve } from "../../core/data-structures/promise";
import { getVerticalScrollbarWidth, isIframed } from "../../core/dom";
import { layoutRectFromDomRect, layoutRectLtwh, moveLayoutRect } from "../../core/dom/layout/rect";
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
import { getParentWindowFrameElement, registerServiceBuilderForDoc } from "../../service-helpers";
import { numeric } from "../../transition";
var TAG_ = 'Viewport';
var SCROLL_POS_TO_BLOCK = {
  'top': 'start',
  'center': 'center',
  'bottom': 'end'
};
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
  var effectiveElement = element === win.document.body ? win.document.documentElement : element;
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
  function ViewportImpl(ampdoc, binding, viewer) {
    var _this = this;

    _classCallCheck(this, ViewportImpl);

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
    this.
    /*OK*/
    scrollTop_ = null;

    /** @private {boolean} */
    this.scrollAnimationFrameThrottled_ = false;

    /** @private {?number} */
    this.
    /*OK*/
    scrollLeft_ = null;

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
    this.viewer_.onMessage('disableScroll', this.disableScrollEventHandler_.bind(this));

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
          value: function value(x, y) {
            return _this.setScrollTop(y);
          }
        });
        ['pageYOffset', 'scrollY'].forEach(function (prop) {
          Object.defineProperty(win, prop, {
            get: function get() {
              return _this.getScrollTop();
            }
          });
        });
      } catch (e) {// Ignore errors.
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
        win.
        /*OK*/
        scrollTo(-0.1, 0);
      });
    }
  }

  /** @override */
  _createClass(ViewportImpl, [{
    key: "dispose",
    value: function dispose() {
      this.binding_.disconnect();
    }
    /** @override */

  }, {
    key: "ensureReadyForElements",
    value: function ensureReadyForElements() {
      this.binding_.ensureReadyForElements();
    }
    /** @private */

  }, {
    key: "updateVisibility_",
    value: function updateVisibility_() {
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
            this.
            /*OK*/
            scrollTop_ = null;
            this.getScrollTop();
          }
        } else {
          this.binding_.disconnect();
        }
      }
    }
    /** @override */

  }, {
    key: "getPaddingTop",
    value: function getPaddingTop() {
      return this.paddingTop_;
    }
    /** @override */

  }, {
    key: "getScrollTop",
    value: function getScrollTop() {
      if (this.
      /*OK*/
      scrollTop_ == null) {
        this.
        /*OK*/
        scrollTop_ = this.binding_.getScrollTop();
      }

      return this.
      /*OK*/
      scrollTop_;
    }
    /** @override */

  }, {
    key: "getScrollLeft",
    value: function getScrollLeft() {
      if (this.
      /*OK*/
      scrollLeft_ == null) {
        this.
        /*OK*/
        scrollLeft_ = this.binding_.getScrollLeft();
      }

      return this.
      /*OK*/
      scrollLeft_;
    }
    /** @override */

  }, {
    key: "setScrollTop",
    value: function setScrollTop(scrollPos) {
      this.
      /*OK*/
      scrollTop_ = null;
      this.binding_.setScrollTop(scrollPos);
    }
    /** @override */

  }, {
    key: "updatePaddingBottom",
    value: function updatePaddingBottom(paddingBottom) {
      this.ampdoc.waitForBodyOpen().then(function (body) {
        setStyle(body, 'borderBottom', paddingBottom + "px solid transparent");
      });
    }
    /** @override */

  }, {
    key: "getSize",
    value: function getSize() {
      if (this.size_) {
        return this.size_;
      }

      this.size_ = this.binding_.getSize();

      if (this.size_.width == 0 || this.size_.height == 0) {
        // Only report when the visibility is "visible" or "prerender".
        var visibilityState = this.ampdoc.getVisibilityState();

        if (visibilityState == VisibilityState.PRERENDER || visibilityState == VisibilityState.VISIBLE) {
          if (Math.random() < 0.01) {
            dev().error(TAG_, 'viewport has zero dimensions');
          }
        }
      }

      return this.size_;
    }
    /** @override */

  }, {
    key: "getHeight",
    value: function getHeight() {
      return this.getSize().height;
    }
    /** @override */

  }, {
    key: "getWidth",
    value: function getWidth() {
      return this.getSize().width;
    }
    /** @override */

  }, {
    key: "getScrollWidth",
    value: function getScrollWidth() {
      return this.binding_.getScrollWidth();
    }
    /** @override */

  }, {
    key: "getScrollHeight",
    value: function getScrollHeight() {
      return this.binding_.getScrollHeight();
    }
    /** @override */

  }, {
    key: "getContentHeight",
    value: function getContentHeight() {
      return this.binding_.getContentHeight();
    }
    /** @override */

  }, {
    key: "contentHeightChanged",
    value: function contentHeightChanged() {
      this.binding_.contentHeightChanged();
    }
    /** @override */

  }, {
    key: "getRect",
    value: function getRect() {
      if (this.rect_ == null) {
        var scrollTop = this.getScrollTop();
        var scrollLeft = this.getScrollLeft();
        var size = this.getSize();
        this.rect_ = layoutRectLtwh(scrollLeft, scrollTop, size.width, size.height);
      }

      return this.rect_;
    }
    /** @override */

  }, {
    key: "getLayoutRect",
    value: function getLayoutRect(el) {
      var scrollLeft = this.getScrollLeft();
      var scrollTop = this.getScrollTop();
      // Go up the window hierarchy through friendly iframes.
      var frameElement = getParentWindowFrameElement(el, this.ampdoc.win);

      if (frameElement) {
        var b = this.binding_.getLayoutRect(el, 0, 0);
        var c = this.binding_.getLayoutRect(frameElement, scrollLeft, scrollTop);
        return layoutRectLtwh(Math.round(b.left + c.left), Math.round(b.top + c.top), Math.round(b.width), Math.round(b.height));
      }

      return this.binding_.getLayoutRect(el, scrollLeft, scrollTop);
    }
    /** @override */

  }, {
    key: "getClientRectAsync",
    value: function getClientRectAsync(el) {
      var local = this.vsync_.measurePromise(function () {
        return el.
        /*OK*/
        getBoundingClientRect();
      });
      var root = this.binding_.getRootClientRectAsync();
      var frameElement = getParentWindowFrameElement(el, this.ampdoc.win);

      if (frameElement) {
        root = this.vsync_.measurePromise(function () {
          return frameElement.
          /*OK*/
          getBoundingClientRect();
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
    /** @override */

  }, {
    key: "supportsPositionFixed",
    value: function supportsPositionFixed() {
      return this.binding_.supportsPositionFixed();
    }
    /** @override */

  }, {
    key: "isDeclaredFixed",
    value: function isDeclaredFixed(element) {
      if (!this.fixedLayer_) {
        return false;
      }

      return this.fixedLayer_.isDeclaredFixed(element);
    }
    /** @override */

  }, {
    key: "scrollIntoView",
    value: function scrollIntoView(element) {
      var _this2 = this;

      if (false) {
        element.
        /* OK */
        scrollIntoView();
        return _resolvedPromise();
      } else {
        return this.getScrollingContainerFor_(element).then(function (parent) {
          return _this2.scrollIntoViewInternal_(element, parent);
        });
      }
    }
    /**
     * @param {!Element} element
     * @param {!Element} parent
     */

  }, {
    key: "scrollIntoViewInternal_",
    value: function scrollIntoViewInternal_(element, parent) {
      var _this3 = this;

      var elementTop = this.binding_.getLayoutRect(element).top;
      var scrollPaddingTop = getScrollPaddingTop(this.ampdoc.win, parent);
      var newScrollTopPromise = tryResolve(function () {
        return Math.max(0, elementTop - _this3.paddingTop_ - scrollPaddingTop);
      });
      newScrollTopPromise.then(function (newScrollTop) {
        return _this3.setElementScrollTop_(parent, newScrollTop);
      });
    }
    /** @override */

  }, {
    key: "animateScrollIntoView",
    value: function animateScrollIntoView(element, pos, opt_duration, opt_curve) {
      var _this4 = this;

      if (pos === void 0) {
        pos = 'top';
      }

      if (false) {
        return new Promise(function (resolve, opt_) {
          element.
          /* OK */
          scrollIntoView({
            block: SCROLL_POS_TO_BLOCK[pos],
            behavior: 'smooth'
          });
          setTimeout(resolve, SMOOTH_SCROLL_DELAY_);
        });
      } else {
        devAssert(!opt_curve || opt_duration !== undefined, "Curve without duration doesn't make sense.");
        return this.getScrollingContainerFor_(element).then(function (parent) {
          return _this4.animateScrollWithinParent(element, parent, dev().assertString(pos), opt_duration, opt_curve);
        });
      }
    }
    /** @override */

  }, {
    key: "animateScrollWithinParent",
    value: function animateScrollWithinParent(element, parent, pos, opt_duration, opt_curve) {
      var _this5 = this;

      devAssert(!opt_curve || opt_duration !== undefined, "Curve without duration doesn't make sense.");
      var elementRect = this.binding_.getLayoutRect(element);

      var _ref = this.isScrollingElement_(parent) ? this.getSize() : this.getLayoutRect(parent),
          parentHeight = _ref.height;

      var win = this.ampdoc.win;
      var scrollPaddingTop = getScrollPaddingTop(win, parent);
      var scrollPaddingBottom = getScrollPaddingBottom(win, parent);
      var offset = -scrollPaddingTop;

      // default pos === 'top'
      if (pos === 'bottom') {
        offset = -parentHeight + scrollPaddingBottom + elementRect.height;
      } else if (pos === 'center') {
        var effectiveParentHeight = parentHeight - scrollPaddingTop - scrollPaddingBottom;
        offset = -effectiveParentHeight / 2 + elementRect.height / 2;
      }

      return this.getElementScrollTop_(parent).then(function (curScrollTop) {
        var calculatedScrollTop = elementRect.top - _this5.paddingTop_ + offset;
        var newScrollTop = Math.max(0, calculatedScrollTop);

        if (newScrollTop == curScrollTop) {
          return;
        }

        return _this5.interpolateScrollIntoView_(parent, curScrollTop, newScrollTop, opt_duration, opt_curve);
      });
    }
    /**
     * @param {!Element} parent
     * @param {number} curScrollTop
     * @param {number} newScrollTop
     * @param {number=} opt_duration
     * @param {string=} curve
     * @private
     */

  }, {
    key: "interpolateScrollIntoView_",
    value: function interpolateScrollIntoView_(parent, curScrollTop, newScrollTop, opt_duration, curve) {
      var _this6 = this;

      if (curve === void 0) {
        curve = 'ease-in';
      }

      var duration = opt_duration !== undefined ? dev().assertNumber(opt_duration) : getDefaultScrollAnimationDuration(curScrollTop, newScrollTop);

      /** @const {!TransitionDef<number>} */
      var interpolate = numeric(curScrollTop, newScrollTop);
      return Animation.animate(parent, function (position) {
        _this6.setElementScrollTop_(parent, interpolate(position));
      }, duration, curve).thenAlways(function () {
        _this6.setElementScrollTop_(parent, newScrollTop);
      });
    }
    /**
     * @param {!Element} element
     * @return {!Promise<!Element>}
     */

  }, {
    key: "getScrollingContainerFor_",
    value: function getScrollingContainerFor_(element) {
      var _this7 = this;

      return this.vsync_.measurePromise(function () {
        return closestAncestorElementBySelector(element, '.i-amphtml-scrollable') || _this7.binding_.getScrollingElement();
      });
    }
    /**
     * @param {!Element} element
     * @param {number} scrollTop
     */

  }, {
    key: "setElementScrollTop_",
    value: function setElementScrollTop_(element, scrollTop) {
      if (this.isScrollingElement_(element)) {
        this.binding_.setScrollTop(scrollTop);
        return;
      }

      this.vsync_.mutate(function () {
        element.
        /*OK*/
        scrollTop = scrollTop;
      });
    }
    /**
     * @param {!Element} element
     * @return {!Promise<number>}
     */

  }, {
    key: "getElementScrollTop_",
    value: function getElementScrollTop_(element) {
      var _this8 = this;

      if (this.isScrollingElement_(element)) {
        return tryResolve(function () {
          return _this8.getScrollTop();
        });
      }

      return this.vsync_.measurePromise(function () {
        return element.
        /*OK*/
        scrollTop;
      });
    }
    /**
     * @param {!Element} element
     * @return {boolean}
     */

  }, {
    key: "isScrollingElement_",
    value: function isScrollingElement_(element) {
      return element == this.binding_.getScrollingElement();
    }
    /** @override */

  }, {
    key: "getScrollingElement",
    value: function getScrollingElement() {
      if (this.scrollingElement_) {
        return this.scrollingElement_;
      }

      return this.scrollingElement_ = this.binding_.getScrollingElement();
    }
    /** @override */

  }, {
    key: "onChanged",
    value: function onChanged(handler) {
      return this.changeObservable_.add(handler);
    }
    /** @override */

  }, {
    key: "onScroll",
    value: function onScroll(handler) {
      return this.scrollObservable_.add(handler);
    }
    /** @override */

  }, {
    key: "onResize",
    value: function onResize(handler) {
      return this.resizeObservable_.add(handler);
    }
    /** @override */

  }, {
    key: "enterLightboxMode",
    value: function enterLightboxMode(opt_requestingElement, opt_onComplete) {
      this.viewer_.sendMessage('requestFullOverlay', dict(),
      /* cancelUnsent */
      true);
      this.enterOverlayMode();

      if (this.fixedLayer_) {
        this.fixedLayer_.enterLightbox(opt_requestingElement, opt_onComplete);
      }

      if (opt_requestingElement) {
        this.maybeEnterFieLightboxMode(dev().assertElement(opt_requestingElement));
      }

      return this.binding_.updateLightboxMode(true);
    }
    /** @override */

  }, {
    key: "leaveLightboxMode",
    value: function leaveLightboxMode(opt_requestingElement) {
      this.viewer_.sendMessage('cancelFullOverlay', dict(),
      /* cancelUnsent */
      true);

      if (this.fixedLayer_) {
        this.fixedLayer_.leaveLightbox();
      }

      this.leaveOverlayMode();

      if (opt_requestingElement) {
        this.maybeLeaveFieLightboxMode(dev().assertElement(opt_requestingElement));
      }

      return this.binding_.updateLightboxMode(false);
    }
    /**
     * @return {boolean}
     * @visibleForTesting
     */

  }, {
    key: "isLightboxExperimentOn",
    value: function isLightboxExperimentOn() {
      return isExperimentOn(this.ampdoc.win, 'amp-lightbox-a4a-proto');
    }
    /**
     * Enters frame lightbox mode if under a Friendly Iframe Embed.
     * @param {!Element} requestingElement
     * @visibleForTesting
     */

  }, {
    key: "maybeEnterFieLightboxMode",
    value: function maybeEnterFieLightboxMode(requestingElement) {
      var fieOptional = this.getFriendlyIframeEmbed_(requestingElement);

      if (fieOptional) {
        devAssert(this.isLightboxExperimentOn(), 'Lightbox mode for A4A is only available when ' + "'amp-lightbox-a4a-proto' experiment is on");
        fieOptional.enterFullOverlayMode();
      }
    }
    /**
     * Leaves frame lightbox mode if under a Friendly Iframe Embed.
     * @param {!Element} requestingElement
     * @visibleForTesting
     */

  }, {
    key: "maybeLeaveFieLightboxMode",
    value: function maybeLeaveFieLightboxMode(requestingElement) {
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
     */

  }, {
    key: "getFriendlyIframeEmbed_",
    value: function getFriendlyIframeEmbed_(element) {
      var iframeOptional = getParentWindowFrameElement(element, this.ampdoc.win);
      return iframeOptional && getFriendlyIframeEmbedOptional(
      /** @type {!HTMLIFrameElement} */
      dev().assertElement(iframeOptional));
    }
    /** @override */

  }, {
    key: "enterOverlayMode",
    value: function enterOverlayMode() {
      this.disableTouchZoom();
      this.disableScroll();
    }
    /** @override */

  }, {
    key: "leaveOverlayMode",
    value: function leaveOverlayMode() {
      this.resetScroll();
      this.restoreOriginalTouchZoom();
    }
    /** @override */

  }, {
    key: "disableScroll",
    value: function disableScroll() {
      var _this9 = this;

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
    /** @override */

  }, {
    key: "resetScroll",
    value: function resetScroll() {
      var _this10 = this;

      var win = this.ampdoc.win;
      var documentElement = win.document.documentElement;
      this.vsync_.mutate(function () {
        setStyle(documentElement, 'margin-right', '');

        _this10.binding_.resetScroll();
      });
    }
    /** @override */

  }, {
    key: "resetTouchZoom",
    value: function resetTouchZoom() {
      var _this11 = this;

      var windowHeight = this.ampdoc.win.
      /*OK*/
      innerHeight;
      var documentHeight = this.globalDoc_.documentElement.
      /*OK*/
      clientHeight;

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
    /** @override */

  }, {
    key: "disableTouchZoom",
    value: function disableTouchZoom() {
      var viewportMeta = this.getViewportMeta_();

      if (!viewportMeta) {
        // This should never happen in a valid AMP document, thus shortcircuit.
        return false;
      }

      // Setting maximum-scale=1 and user-scalable=no zooms page back to normal
      // and prohibit further default zooming.
      var newValue = updateViewportMetaString(viewportMeta.content, {
        'maximum-scale': '1',
        'user-scalable': 'no'
      });
      return this.setViewportMetaString_(newValue);
    }
    /** @override */

  }, {
    key: "restoreOriginalTouchZoom",
    value: function restoreOriginalTouchZoom() {
      if (this.originalViewportMetaString_ !== undefined) {
        return this.setViewportMetaString_(this.originalViewportMetaString_);
      }

      return false;
    }
    /** @override */

  }, {
    key: "updateFixedLayer",
    value: function updateFixedLayer() {
      if (!this.fixedLayer_) {
        return _resolvedPromise2();
      }

      return this.fixedLayer_.update();
    }
    /** @override */

  }, {
    key: "addToFixedLayer",
    value: function addToFixedLayer(element, opt_forceTransfer) {
      if (!this.fixedLayer_) {
        return _resolvedPromise3();
      }

      return this.fixedLayer_.addElement(element, opt_forceTransfer);
    }
    /** @override */

  }, {
    key: "removeFromFixedLayer",
    value: function removeFromFixedLayer(element) {
      if (!this.fixedLayer_) {
        return;
      }

      this.fixedLayer_.removeElement(element);
    }
    /** @override */

  }, {
    key: "createFixedLayer",
    value: function createFixedLayer(constructor) {
      var _this12 = this;

      this.fixedLayer_ = new constructor(this.ampdoc, this.vsync_, this.binding_.getBorderTop(), this.paddingTop_, this.binding_.requiresFixedLayerTransfer());
      this.ampdoc.whenReady().then(function () {
        return _this12.fixedLayer_.setup();
      });
    }
    /**
     * Updates touch zoom meta data. Returns `true` if any actual
     * changes have been done.
     * @param {string} viewportMetaString
     * @return {boolean}
     */

  }, {
    key: "setViewportMetaString_",
    value: function setViewportMetaString_(viewportMetaString) {
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
     */

  }, {
    key: "getViewportMeta_",
    value: function getViewportMeta_() {
      if (isIframed(this.ampdoc.win)) {
        // An embedded document does not control its viewport meta tag.
        return null;
      }

      if (this.viewportMeta_ === undefined) {
        this.viewportMeta_ =
        /** @type {?HTMLMetaElement} */
        this.globalDoc_.querySelector('meta[name=viewport]');

        if (this.viewportMeta_) {
          this.originalViewportMetaString_ = this.viewportMeta_.content;
        }
      }

      return this.viewportMeta_;
    }
    /**
     * @param {!JsonObject} data
     * @private
     */

  }, {
    key: "viewerSetScrollTop_",
    value: function viewerSetScrollTop_(data) {
      var targetScrollTop = data['scrollTop'];
      this.setScrollTop(targetScrollTop);
    }
    /**
     * @param {!JsonObject} data
     * @private
     */

  }, {
    key: "updateOnViewportEvent_",
    value: function updateOnViewportEvent_(data) {
      var _this13 = this;

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
        var animPromise = this.fixedLayer_.animateFixedElements(this.paddingTop_, this.lastPaddingTop_, duration, curve, transient);

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
     */

  }, {
    key: "disableScrollEventHandler_",
    value: function disableScrollEventHandler_(data) {
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
     */

  }, {
    key: "changed_",
    value: function changed_(relayoutAll, velocity) {
      var size = this.getSize();
      var scrollTop = this.getScrollTop();
      var scrollLeft = this.getScrollLeft();
      dev().fine(TAG_, 'changed event:', 'relayoutAll=', relayoutAll, 'top=', scrollTop, 'left=', scrollLeft, 'bottom=', scrollTop + size.height, 'velocity=', velocity);
      this.changeObservable_.fire({
        relayoutAll: relayoutAll,
        top: scrollTop,
        left: scrollLeft,
        width: size.width,
        height: size.height,
        velocity: velocity
      });
    }
    /** @private */

  }, {
    key: "scroll_",
    value: function scroll_() {
      var _this14 = this;

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
     */

  }, {
    key: "throttledScroll_",
    value: function throttledScroll_(referenceTime, referenceTop) {
      var _this15 = this;

      this.scrollTop_ = this.binding_.getScrollTop();

      /**  @const {number} */
      var newScrollTop = this.scrollTop_;
      var now = Date.now();
      var velocity = 0;

      if (now != referenceTime) {
        velocity = (newScrollTop - referenceTop) / (now - referenceTime);
      }

      dev().fine(TAG_, 'scroll: scrollTop=' + newScrollTop + '; velocity=' + velocity);

      if (Math.abs(velocity) < 0.03) {
        this.changed_(
        /* relayoutAll */
        false, velocity);
        this.scrollTracking_ = false;
      } else {
        this.timer_.delay(function () {
          return _this15.vsync_.measure(_this15.throttledScroll_.bind(_this15, now, newScrollTop));
        }, 20);
      }
    }
    /**
     * Send scroll message via the viewer per animation frame
     * @private
     */

  }, {
    key: "sendScrollMessage_",
    value: function sendScrollMessage_() {
      var _this16 = this;

      if (!this.scrollAnimationFrameThrottled_) {
        this.scrollAnimationFrameThrottled_ = true;
        this.vsync_.measure(function () {
          _this16.scrollAnimationFrameThrottled_ = false;

          _this16.viewer_.sendMessage('scroll', dict({
            'scrollTop': _this16.getScrollTop()
          }),
          /* cancelUnsent */
          true);
        });
      }
    }
    /** @private */

  }, {
    key: "resize_",
    value: function resize_() {
      var _this17 = this;

      this.rect_ = null;
      var oldSize = this.size_;
      this.size_ = null;
      // Need to recalc.
      var newSize = this.getSize();
      this.updateFixedLayer().then(function () {
        var widthChanged = !oldSize || oldSize.width != newSize.width;

        _this17.changed_(
        /*relayoutAll*/
        widthChanged, 0);

        var sizeChanged = widthChanged || oldSize.height != newSize.height;

        if (sizeChanged) {
          _this17.resizeObservable_.fire({
            relayoutAll: widthChanged,
            width: newSize.width,
            height: newSize.height
          });
        }
      });
    }
  }]);

  return ViewportImpl;
}();

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
        params[k] =
        /** @type {string} */
        updateParams[k];
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
function getDefaultScrollAnimationDuration(scrollTopA, scrollTopB, max) {
  if (max === void 0) {
    max = 500;
  }

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

  if (ampdoc.isSingleDoc() && getViewportType(win, viewer) == ViewportType.NATURAL_IOS_EMBED && !false) {
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
  NATURAL_IOS_EMBED: 'natural-ios-embed'
};

/**
 * @param {!Window} win
 * @param {!../viewer-interface.ViewerInterface} viewer
 * @return {string}
 */
function getViewportType(win, viewer) {
  var isIframedIos = Services.platformFor(win).isIos() && isIframed(win);

  // Enable iOS Embedded mode for iframed tests (e.g. integration tests).
  if (getMode(win).test && isIframedIos) {
    return ViewportType.NATURAL_IOS_EMBED;
  }

  // Override to ios-embed for iframe-viewer mode.
  if (isIframedIos && viewer.isEmbedded() && !viewer.hasCapability('iframeScroll')) {
    return ViewportType.NATURAL_IOS_EMBED;
  }

  return ViewportType.NATURAL;
}

/**
 * @param {!../ampdoc-impl.AmpDoc} ampdoc
 */
export function installViewportServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'viewport', createViewport,
  /* opt_instantiate */
  true);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZpZXdwb3J0LWltcGwuanMiXSwibmFtZXMiOlsiVmlzaWJpbGl0eVN0YXRlIiwiT2JzZXJ2YWJsZSIsInRyeVJlc29sdmUiLCJnZXRWZXJ0aWNhbFNjcm9sbGJhcldpZHRoIiwiaXNJZnJhbWVkIiwibGF5b3V0UmVjdEZyb21Eb21SZWN0IiwibGF5b3V0UmVjdEx0d2giLCJtb3ZlTGF5b3V0UmVjdCIsImNsb3Nlc3RBbmNlc3RvckVsZW1lbnRCeVNlbGVjdG9yIiwiY29tcHV0ZWRTdHlsZSIsInNldFN0eWxlIiwiY2xhbXAiLCJkaWN0IiwiaXNFeHBlcmltZW50T24iLCJTZXJ2aWNlcyIsIlZpZXdwb3J0QmluZGluZ0RlZiIsIlZpZXdwb3J0QmluZGluZ0lvc0VtYmVkV3JhcHBlcl8iLCJWaWV3cG9ydEJpbmRpbmdOYXR1cmFsXyIsIlZpZXdwb3J0SW50ZXJmYWNlIiwiQW5pbWF0aW9uIiwiZ2V0RnJpZW5kbHlJZnJhbWVFbWJlZE9wdGlvbmFsIiwiZGV2IiwiZGV2QXNzZXJ0IiwiZ2V0TW9kZSIsImdldFBhcmVudFdpbmRvd0ZyYW1lRWxlbWVudCIsInJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MiLCJudW1lcmljIiwiVEFHXyIsIlNDUk9MTF9QT1NfVE9fQkxPQ0siLCJTTU9PVEhfU0NST0xMX0RFTEFZXyIsImdldENvbXB1dGVkU3R5bGVQcm9wZXJ0eVBpeGVscyIsIndpbiIsImVsZW1lbnQiLCJwcm9wZXJ0eSIsInZhbHVlIiwicGFyc2VJbnQiLCJpc05hTiIsImdldFNjcm9sbFBhZGRpbmciLCJlZmZlY3RpdmVFbGVtZW50IiwiZG9jdW1lbnQiLCJib2R5IiwiZG9jdW1lbnRFbGVtZW50IiwiZ2V0U2Nyb2xsUGFkZGluZ1RvcCIsImdldFNjcm9sbFBhZGRpbmdCb3R0b20iLCJWaWV3cG9ydEltcGwiLCJhbXBkb2MiLCJiaW5kaW5nIiwidmlld2VyIiwiZ2xvYmFsRG9jXyIsImJpbmRpbmdfIiwidmlld2VyXyIsInJlY3RfIiwic2l6ZV8iLCJzY3JvbGxUb3BfIiwic2Nyb2xsQW5pbWF0aW9uRnJhbWVUaHJvdHRsZWRfIiwic2Nyb2xsTGVmdF8iLCJwYWRkaW5nVG9wXyIsIk51bWJlciIsImdldFBhcmFtIiwibGFzdFBhZGRpbmdUb3BfIiwidGltZXJfIiwidGltZXJGb3IiLCJ2c3luY18iLCJ2c3luY0ZvciIsInNjcm9sbFRyYWNraW5nXyIsInNjcm9sbGluZ0VsZW1lbnRfIiwic2Nyb2xsQ291bnRfIiwiY2hhbmdlT2JzZXJ2YWJsZV8iLCJzY3JvbGxPYnNlcnZhYmxlXyIsInJlc2l6ZU9ic2VydmFibGVfIiwidmlld3BvcnRNZXRhXyIsInVuZGVmaW5lZCIsIm9yaWdpbmFsVmlld3BvcnRNZXRhU3RyaW5nXyIsImZpeGVkTGF5ZXJfIiwib25NZXNzYWdlIiwidXBkYXRlT25WaWV3cG9ydEV2ZW50XyIsImJpbmQiLCJ2aWV3ZXJTZXRTY3JvbGxUb3BfIiwiZGlzYWJsZVNjcm9sbEV2ZW50SGFuZGxlcl8iLCJpc0VtYmVkZGVkIiwidXBkYXRlUGFkZGluZ1RvcCIsIm9uU2Nyb2xsIiwic2Nyb2xsXyIsIm9uUmVzaXplIiwicmVzaXplXyIsInNlbmRTY3JvbGxNZXNzYWdlXyIsInZpc2libGVfIiwib25WaXNpYmlsaXR5Q2hhbmdlZCIsInVwZGF0ZVZpc2liaWxpdHlfIiwiZ2xvYmFsRG9jRWxlbWVudCIsImlzU2luZ2xlRG9jIiwiY2xhc3NMaXN0IiwiYWRkIiwiaGlzdG9yeSIsInNjcm9sbFJlc3RvcmF0aW9uIiwib3ZlcnJpZGVHbG9iYWxTY3JvbGxUbyIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwieCIsInkiLCJzZXRTY3JvbGxUb3AiLCJmb3JFYWNoIiwicHJvcCIsImdldCIsImdldFNjcm9sbFRvcCIsImUiLCJpc0lmcmFtZWRJb3MiLCJwbGF0Zm9ybUZvciIsImlzSW9zIiwid2hlblJlYWR5IiwidGhlbiIsInNjcm9sbFRvIiwiZGlzY29ubmVjdCIsImVuc3VyZVJlYWR5Rm9yRWxlbWVudHMiLCJ2aXNpYmxlIiwiaXNWaXNpYmxlIiwiY29ubmVjdCIsImdldFNjcm9sbExlZnQiLCJzY3JvbGxQb3MiLCJwYWRkaW5nQm90dG9tIiwid2FpdEZvckJvZHlPcGVuIiwiZ2V0U2l6ZSIsIndpZHRoIiwiaGVpZ2h0IiwidmlzaWJpbGl0eVN0YXRlIiwiZ2V0VmlzaWJpbGl0eVN0YXRlIiwiUFJFUkVOREVSIiwiVklTSUJMRSIsIk1hdGgiLCJyYW5kb20iLCJlcnJvciIsImdldFNjcm9sbFdpZHRoIiwiZ2V0U2Nyb2xsSGVpZ2h0IiwiZ2V0Q29udGVudEhlaWdodCIsImNvbnRlbnRIZWlnaHRDaGFuZ2VkIiwic2Nyb2xsVG9wIiwic2Nyb2xsTGVmdCIsInNpemUiLCJlbCIsImZyYW1lRWxlbWVudCIsImIiLCJnZXRMYXlvdXRSZWN0IiwiYyIsInJvdW5kIiwibGVmdCIsInRvcCIsImxvY2FsIiwibWVhc3VyZVByb21pc2UiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJyb290IiwiZ2V0Um9vdENsaWVudFJlY3RBc3luYyIsIlByb21pc2UiLCJhbGwiLCJ2YWx1ZXMiLCJsIiwiciIsInN1cHBvcnRzUG9zaXRpb25GaXhlZCIsImlzRGVjbGFyZWRGaXhlZCIsInNjcm9sbEludG9WaWV3IiwiZ2V0U2Nyb2xsaW5nQ29udGFpbmVyRm9yXyIsInBhcmVudCIsInNjcm9sbEludG9WaWV3SW50ZXJuYWxfIiwiZWxlbWVudFRvcCIsInNjcm9sbFBhZGRpbmdUb3AiLCJuZXdTY3JvbGxUb3BQcm9taXNlIiwibWF4IiwibmV3U2Nyb2xsVG9wIiwic2V0RWxlbWVudFNjcm9sbFRvcF8iLCJwb3MiLCJvcHRfZHVyYXRpb24iLCJvcHRfY3VydmUiLCJyZXNvbHZlIiwib3B0XyIsImJsb2NrIiwiYmVoYXZpb3IiLCJzZXRUaW1lb3V0IiwiYW5pbWF0ZVNjcm9sbFdpdGhpblBhcmVudCIsImFzc2VydFN0cmluZyIsImVsZW1lbnRSZWN0IiwiaXNTY3JvbGxpbmdFbGVtZW50XyIsInBhcmVudEhlaWdodCIsInNjcm9sbFBhZGRpbmdCb3R0b20iLCJvZmZzZXQiLCJlZmZlY3RpdmVQYXJlbnRIZWlnaHQiLCJnZXRFbGVtZW50U2Nyb2xsVG9wXyIsImN1clNjcm9sbFRvcCIsImNhbGN1bGF0ZWRTY3JvbGxUb3AiLCJpbnRlcnBvbGF0ZVNjcm9sbEludG9WaWV3XyIsImN1cnZlIiwiZHVyYXRpb24iLCJhc3NlcnROdW1iZXIiLCJnZXREZWZhdWx0U2Nyb2xsQW5pbWF0aW9uRHVyYXRpb24iLCJpbnRlcnBvbGF0ZSIsImFuaW1hdGUiLCJwb3NpdGlvbiIsInRoZW5BbHdheXMiLCJnZXRTY3JvbGxpbmdFbGVtZW50IiwibXV0YXRlIiwiaGFuZGxlciIsIm9wdF9yZXF1ZXN0aW5nRWxlbWVudCIsIm9wdF9vbkNvbXBsZXRlIiwic2VuZE1lc3NhZ2UiLCJlbnRlck92ZXJsYXlNb2RlIiwiZW50ZXJMaWdodGJveCIsIm1heWJlRW50ZXJGaWVMaWdodGJveE1vZGUiLCJhc3NlcnRFbGVtZW50IiwidXBkYXRlTGlnaHRib3hNb2RlIiwibGVhdmVMaWdodGJveCIsImxlYXZlT3ZlcmxheU1vZGUiLCJtYXliZUxlYXZlRmllTGlnaHRib3hNb2RlIiwicmVxdWVzdGluZ0VsZW1lbnQiLCJmaWVPcHRpb25hbCIsImdldEZyaWVuZGx5SWZyYW1lRW1iZWRfIiwiaXNMaWdodGJveEV4cGVyaW1lbnRPbiIsImVudGVyRnVsbE92ZXJsYXlNb2RlIiwibGVhdmVGdWxsT3ZlcmxheU1vZGUiLCJpZnJhbWVPcHRpb25hbCIsImRpc2FibGVUb3VjaFpvb20iLCJkaXNhYmxlU2Nyb2xsIiwicmVzZXRTY3JvbGwiLCJyZXN0b3JlT3JpZ2luYWxUb3VjaFpvb20iLCJyZXF1ZXN0ZWRNYXJnaW5SaWdodCIsIm1lYXN1cmUiLCJleGlzdGluZ01hcmdpbiIsIm1hcmdpblJpZ2h0Iiwic2Nyb2xsYmFyV2lkdGgiLCJ3aW5kb3dIZWlnaHQiLCJpbm5lckhlaWdodCIsImRvY3VtZW50SGVpZ2h0IiwiY2xpZW50SGVpZ2h0IiwiZGVsYXkiLCJ2aWV3cG9ydE1ldGEiLCJnZXRWaWV3cG9ydE1ldGFfIiwibmV3VmFsdWUiLCJ1cGRhdGVWaWV3cG9ydE1ldGFTdHJpbmciLCJjb250ZW50Iiwic2V0Vmlld3BvcnRNZXRhU3RyaW5nXyIsInVwZGF0ZSIsIm9wdF9mb3JjZVRyYW5zZmVyIiwiYWRkRWxlbWVudCIsInJlbW92ZUVsZW1lbnQiLCJjb25zdHJ1Y3RvciIsImdldEJvcmRlclRvcCIsInJlcXVpcmVzRml4ZWRMYXllclRyYW5zZmVyIiwic2V0dXAiLCJ2aWV3cG9ydE1ldGFTdHJpbmciLCJmaW5lIiwicXVlcnlTZWxlY3RvciIsImRhdGEiLCJ0YXJnZXRTY3JvbGxUb3AiLCJwYWRkaW5nVG9wIiwidHJhbnNpZW50IiwiYW5pbVByb21pc2UiLCJhbmltYXRlRml4ZWRFbGVtZW50cyIsImhpZGVWaWV3ZXJIZWFkZXIiLCJzaG93Vmlld2VySGVhZGVyIiwicmVsYXlvdXRBbGwiLCJ2ZWxvY2l0eSIsImZpcmUiLCJub3ciLCJEYXRlIiwidGhyb3R0bGVkU2Nyb2xsXyIsInJlZmVyZW5jZVRpbWUiLCJyZWZlcmVuY2VUb3AiLCJhYnMiLCJjaGFuZ2VkXyIsIm9sZFNpemUiLCJuZXdTaXplIiwidXBkYXRlRml4ZWRMYXllciIsIndpZHRoQ2hhbmdlZCIsInNpemVDaGFuZ2VkIiwicGFyc2VWaWV3cG9ydE1ldGEiLCJwYXJhbXMiLCJjcmVhdGUiLCJwYWlycyIsInNwbGl0IiwiaSIsImxlbmd0aCIsInBhaXIiLCJuYW1lIiwidHJpbSIsInN0cmluZ2lmeVZpZXdwb3J0TWV0YSIsImsiLCJjdXJyZW50VmFsdWUiLCJ1cGRhdGVQYXJhbXMiLCJjaGFuZ2VkIiwic2Nyb2xsVG9wQSIsInNjcm9sbFRvcEIiLCJmbG9vciIsImNyZWF0ZVZpZXdwb3J0Iiwidmlld2VyRm9yRG9jIiwiZ2V0Vmlld3BvcnRUeXBlIiwiVmlld3BvcnRUeXBlIiwiTkFUVVJBTF9JT1NfRU1CRUQiLCJOQVRVUkFMIiwidGVzdCIsImhhc0NhcGFiaWxpdHkiLCJpbnN0YWxsVmlld3BvcnRTZXJ2aWNlRm9yRG9jIl0sIm1hcHBpbmdzIjoiOzs7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O0FBQ0E7QUFDQSxTQUFTRixlQUFULENBQXlCcFEsR0FBekIsRUFBOEJnQixNQUE5QixFQUFzQztBQUNwQyxNQUFNMkQsWUFBWSxHQUFHNUYsUUFBUSxDQUFDNkYsV0FBVCxDQUFxQjVFLEdBQXJCLEVBQTBCNkUsS0FBMUIsTUFBcUN4RyxTQUFTLENBQUMyQixHQUFELENBQW5FOztBQUVBO0FBQ0EsTUFBSVIsT0FBTyxDQUFDUSxHQUFELENBQVAsQ0FBYXdRLElBQWIsSUFBcUI3TCxZQUF6QixFQUF1QztBQUNyQyxXQUFPMEwsWUFBWSxDQUFDQyxpQkFBcEI7QUFDRDs7QUFFRDtBQUNBLE1BQ0UzTCxZQUFZLElBQ1ozRCxNQUFNLENBQUNnQyxVQUFQLEVBREEsSUFFQSxDQUFDaEMsTUFBTSxDQUFDeVAsYUFBUCxDQUFxQixjQUFyQixDQUhILEVBSUU7QUFDQSxXQUFPSixZQUFZLENBQUNDLGlCQUFwQjtBQUNEOztBQUNELFNBQU9ELFlBQVksQ0FBQ0UsT0FBcEI7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNHLDRCQUFULENBQXNDNVAsTUFBdEMsRUFBOEM7QUFDbkRwQixFQUFBQSw0QkFBNEIsQ0FDMUJvQixNQUQwQixFQUUxQixVQUYwQixFQUcxQm9QLGNBSDBCO0FBSTFCO0FBQXNCLE1BSkksQ0FBNUI7QUFNRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTUgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1Zpc2liaWxpdHlTdGF0ZX0gZnJvbSAnI2NvcmUvY29uc3RhbnRzL3Zpc2liaWxpdHktc3RhdGUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICcjY29yZS9kYXRhLXN0cnVjdHVyZXMvb2JzZXJ2YWJsZSc7XG5pbXBvcnQge3RyeVJlc29sdmV9IGZyb20gJyNjb3JlL2RhdGEtc3RydWN0dXJlcy9wcm9taXNlJztcbmltcG9ydCB7Z2V0VmVydGljYWxTY3JvbGxiYXJXaWR0aCwgaXNJZnJhbWVkfSBmcm9tICcjY29yZS9kb20nO1xuaW1wb3J0IHtcbiAgbGF5b3V0UmVjdEZyb21Eb21SZWN0LFxuICBsYXlvdXRSZWN0THR3aCxcbiAgbW92ZUxheW91dFJlY3QsXG59IGZyb20gJyNjb3JlL2RvbS9sYXlvdXQvcmVjdCc7XG5pbXBvcnQge2Nsb3Nlc3RBbmNlc3RvckVsZW1lbnRCeVNlbGVjdG9yfSBmcm9tICcjY29yZS9kb20vcXVlcnknO1xuaW1wb3J0IHtjb21wdXRlZFN0eWxlLCBzZXRTdHlsZX0gZnJvbSAnI2NvcmUvZG9tL3N0eWxlJztcbmltcG9ydCB7Y2xhbXB9IGZyb20gJyNjb3JlL21hdGgnO1xuaW1wb3J0IHtkaWN0fSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuXG5pbXBvcnQge2lzRXhwZXJpbWVudE9ufSBmcm9tICcjZXhwZXJpbWVudHMnO1xuXG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5cbmltcG9ydCB7Vmlld3BvcnRCaW5kaW5nRGVmfSBmcm9tICcuL3ZpZXdwb3J0LWJpbmRpbmctZGVmJztcbmltcG9ydCB7Vmlld3BvcnRCaW5kaW5nSW9zRW1iZWRXcmFwcGVyX30gZnJvbSAnLi92aWV3cG9ydC1iaW5kaW5nLWlvcy1lbWJlZC13cmFwcGVyJztcbmltcG9ydCB7Vmlld3BvcnRCaW5kaW5nTmF0dXJhbF99IGZyb20gJy4vdmlld3BvcnQtYmluZGluZy1uYXR1cmFsJztcbmltcG9ydCB7Vmlld3BvcnRJbnRlcmZhY2V9IGZyb20gJy4vdmlld3BvcnQtaW50ZXJmYWNlJztcblxuaW1wb3J0IHtBbmltYXRpb259IGZyb20gJy4uLy4uL2FuaW1hdGlvbic7XG5pbXBvcnQge2dldEZyaWVuZGx5SWZyYW1lRW1iZWRPcHRpb25hbH0gZnJvbSAnLi4vLi4vaWZyYW1lLWhlbHBlcic7XG5pbXBvcnQge2RldiwgZGV2QXNzZXJ0fSBmcm9tICcuLi8uLi9sb2cnO1xuaW1wb3J0IHtnZXRNb2RlfSBmcm9tICcuLi8uLi9tb2RlJztcbmltcG9ydCB7XG4gIGdldFBhcmVudFdpbmRvd0ZyYW1lRWxlbWVudCxcbiAgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvYyxcbn0gZnJvbSAnLi4vLi4vc2VydmljZS1oZWxwZXJzJztcbmltcG9ydCB7bnVtZXJpY30gZnJvbSAnLi4vLi4vdHJhbnNpdGlvbic7XG5cbmNvbnN0IFRBR18gPSAnVmlld3BvcnQnO1xuY29uc3QgU0NST0xMX1BPU19UT19CTE9DSyA9IHtcbiAgJ3RvcCc6ICdzdGFydCcsXG4gICdjZW50ZXInOiAnY2VudGVyJyxcbiAgJ2JvdHRvbSc6ICdlbmQnLFxufTtcbmNvbnN0IFNNT09USF9TQ1JPTExfREVMQVlfID0gMzAwO1xuXG4vKipcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0ge3N0cmluZz19IHByb3BlcnR5XG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGdldENvbXB1dGVkU3R5bGVQcm9wZXJ0eVBpeGVscyh3aW4sIGVsZW1lbnQsIHByb3BlcnR5KSB7XG4gIGNvbnN0IHZhbHVlID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZSh3aW4sIGVsZW1lbnQpW3Byb3BlcnR5XSwgMTApO1xuICByZXR1cm4gaXNOYU4odmFsdWUpID8gMCA6IHZhbHVlO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0ge3N0cmluZz19IHByb3BlcnR5XG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGdldFNjcm9sbFBhZGRpbmcod2luLCBlbGVtZW50LCBwcm9wZXJ0eSkge1xuICAvLyBEdWUgdG8gaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTEwNjEzMywgV2ViS2l0IGJyb3dzZXJzIHVzZVxuICAvLyB1c2UgYGJvZHlgIGFuZCBOT1QgYGRvY3VtZW50RWxlbWVudGAgZm9yIHNjcm9sbGluZyBwdXJwb3Nlcy5cbiAgLy8gKFdlIGdldCB0aGlzIG5vZGUgZnJvbSBgVmlld3BvcnRCaW5kaW5nTmF0dXJhbGAuKVxuICAvLyBIb3dldmVyLCBgc2Nyb2xsLXBhZGRpbmctKmAgcHJvcGVydGllcyBhcmUgZWZmZWN0aXZlIG9ubHkgb24gdGhlIGBodG1sYFxuICAvLyBzZWxlY3RvciBhY3Jvc3MgYnJvd3NlcnMsIHRodXMgd2UgdXNlIHRoZSBgZG9jdW1lbnRFbGVtZW50YC5cbiAgY29uc3QgZWZmZWN0aXZlRWxlbWVudCA9XG4gICAgZWxlbWVudCA9PT0gd2luLmRvY3VtZW50LmJvZHkgPyB3aW4uZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IDogZWxlbWVudDtcbiAgcmV0dXJuIGdldENvbXB1dGVkU3R5bGVQcm9wZXJ0eVBpeGVscyh3aW4sIGVmZmVjdGl2ZUVsZW1lbnQsIHByb3BlcnR5KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybiB7bnVtYmVyfVxuICovXG5mdW5jdGlvbiBnZXRTY3JvbGxQYWRkaW5nVG9wKHdpbiwgZWxlbWVudCkge1xuICByZXR1cm4gZ2V0U2Nyb2xsUGFkZGluZyh3aW4sIGVsZW1lbnQsICdzY3JvbGxQYWRkaW5nVG9wJyk7XG59XG5cbi8qKlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xuZnVuY3Rpb24gZ2V0U2Nyb2xsUGFkZGluZ0JvdHRvbSh3aW4sIGVsZW1lbnQpIHtcbiAgcmV0dXJuIGdldFNjcm9sbFBhZGRpbmcod2luLCBlbGVtZW50LCAnc2Nyb2xsUGFkZGluZ0JvdHRvbScpO1xufVxuXG4vKipcbiAqIFRoaXMgb2JqZWN0IHJlcHJlc2VudHMgdGhlIHZpZXdwb3J0LiBJdCB0cmFja3Mgc2Nyb2xsIHBvc2l0aW9uLCByZXNpemVcbiAqIGFuZCBvdGhlciBldmVudHMgYW5kIG5vdGlmaWVzIGludGVyZXN0aW5nIHBhcnRpZXMgd2hlbiB2aWV3cG9ydCBoYXMgY2hhbmdlZFxuICogYW5kIGhvdy5cbiAqXG4gKiBAaW1wbGVtZW50cyB7Vmlld3BvcnRJbnRlcmZhY2V9XG4gKi9cbmV4cG9ydCBjbGFzcyBWaWV3cG9ydEltcGwge1xuICAvKipcbiAgICogQHBhcmFtIHshLi4vYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAgICogQHBhcmFtIHshVmlld3BvcnRCaW5kaW5nRGVmfSBiaW5kaW5nXG4gICAqIEBwYXJhbSB7IS4uL3ZpZXdlci1pbnRlcmZhY2UuVmlld2VySW50ZXJmYWNlfSB2aWV3ZXJcbiAgICovXG4gIGNvbnN0cnVjdG9yKGFtcGRvYywgYmluZGluZywgdmlld2VyKSB7XG4gICAgY29uc3Qge3dpbn0gPSBhbXBkb2M7XG5cbiAgICAvKiogQGNvbnN0IHshLi4vYW1wZG9jLWltcGwuQW1wRG9jfSAqL1xuICAgIHRoaXMuYW1wZG9jID0gYW1wZG9jO1xuXG4gICAgLyoqXG4gICAgICogU29tZSB2aWV3cG9ydCBvcGVyYXRpb25zIHJlcXVpcmUgdGhlIGdsb2JhbCBkb2N1bWVudC5cbiAgICAgKiBAcHJpdmF0ZSBAY29uc3QgeyFEb2N1bWVudH1cbiAgICAgKi9cbiAgICB0aGlzLmdsb2JhbERvY18gPSB0aGlzLmFtcGRvYy53aW4uZG9jdW1lbnQ7XG5cbiAgICAvKiogQGNvbnN0IHshVmlld3BvcnRCaW5kaW5nRGVmfSAqL1xuICAgIHRoaXMuYmluZGluZ18gPSBiaW5kaW5nO1xuXG4gICAgLyoqIEBjb25zdCB7IS4uL3ZpZXdlci1pbnRlcmZhY2UuVmlld2VySW50ZXJmYWNlfSAqL1xuICAgIHRoaXMudmlld2VyXyA9IHZpZXdlcjtcblxuICAgIC8qKlxuICAgICAqIFVzZWQgdG8gY2FjaGUgdGhlIHJlY3Qgb2YgdGhlIHZpZXdwb3J0LlxuICAgICAqIEBwcml2YXRlIHs/Li4vLi4vbGF5b3V0LXJlY3QuTGF5b3V0UmVjdERlZn1cbiAgICAgKi9cbiAgICB0aGlzLnJlY3RfID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFVzZWQgdG8gY2FjaGUgdGhlIHNpemUgb2YgdGhlIHZpZXdwb3J0LiBBbHNvIHVzZWQgYXMgbGFzdCBrbm93biBzaXplLFxuICAgICAqIHNvIHVzZXJzIHNob3VsZCBjYWxsIGdldFNpemUgZWFybHkgb24gdG8gZ2V0IGEgdmFsdWUuIFRoZSB0aW1pbmcgc2hvdWxkXG4gICAgICogYmUgY2hvc2VuIHRvIGF2b2lkIGV4dHJhIHN0eWxlIHJlY2FsY3MuXG4gICAgICogQHByaXZhdGUge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn18bnVsbH1cbiAgICAgKi9cbiAgICB0aGlzLnNpemVfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P251bWJlcn0gKi9cbiAgICB0aGlzLi8qT0sqLyBzY3JvbGxUb3BfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLnNjcm9sbEFuaW1hdGlvbkZyYW1lVGhyb3R0bGVkXyA9IGZhbHNlO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/bnVtYmVyfSAqL1xuICAgIHRoaXMuLypPSyovIHNjcm9sbExlZnRfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMucGFkZGluZ1RvcF8gPSBOdW1iZXIodmlld2VyLmdldFBhcmFtKCdwYWRkaW5nVG9wJykgfHwgMCk7XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLmxhc3RQYWRkaW5nVG9wXyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUgeyEuLi90aW1lci1pbXBsLlRpbWVyfSAqL1xuICAgIHRoaXMudGltZXJfID0gU2VydmljZXMudGltZXJGb3Iod2luKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IS4uL3ZzeW5jLWltcGwuVnN5bmN9ICovXG4gICAgdGhpcy52c3luY18gPSBTZXJ2aWNlcy52c3luY0Zvcih3aW4pO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuc2Nyb2xsVHJhY2tpbmdfID0gZmFsc2U7XG5cbiAgICAvKiogQHByaXZhdGUge0VsZW1lbnR9ICovXG4gICAgdGhpcy5zY3JvbGxpbmdFbGVtZW50XyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLnNjcm9sbENvdW50XyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshT2JzZXJ2YWJsZTwhLi92aWV3cG9ydC1pbnRlcmZhY2UuVmlld3BvcnRDaGFuZ2VkRXZlbnREZWY+fSAqL1xuICAgIHRoaXMuY2hhbmdlT2JzZXJ2YWJsZV8gPSBuZXcgT2JzZXJ2YWJsZSgpO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IU9ic2VydmFibGV9ICovXG4gICAgdGhpcy5zY3JvbGxPYnNlcnZhYmxlXyA9IG5ldyBPYnNlcnZhYmxlKCk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshT2JzZXJ2YWJsZTwhLi92aWV3cG9ydC1pbnRlcmZhY2UuVmlld3BvcnRSZXNpemVkRXZlbnREZWY+fSAqL1xuICAgIHRoaXMucmVzaXplT2JzZXJ2YWJsZV8gPSBuZXcgT2JzZXJ2YWJsZSgpO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/SFRNTE1ldGFFbGVtZW50fHVuZGVmaW5lZH0gKi9cbiAgICB0aGlzLnZpZXdwb3J0TWV0YV8gPSB1bmRlZmluZWQ7XG5cbiAgICAvKiogQHByaXZhdGUge3N0cmluZ3x1bmRlZmluZWR9ICovXG4gICAgdGhpcy5vcmlnaW5hbFZpZXdwb3J0TWV0YVN0cmluZ18gPSB1bmRlZmluZWQ7XG5cbiAgICAvKiogQHByaXZhdGUgez8uLi9maXhlZC1sYXllci5GaXhlZExheWVyfSAqL1xuICAgIHRoaXMuZml4ZWRMYXllcl8gPSBudWxsO1xuXG4gICAgdGhpcy52aWV3ZXJfLm9uTWVzc2FnZSgndmlld3BvcnQnLCB0aGlzLnVwZGF0ZU9uVmlld3BvcnRFdmVudF8uYmluZCh0aGlzKSk7XG4gICAgdGhpcy52aWV3ZXJfLm9uTWVzc2FnZSgnc2Nyb2xsJywgdGhpcy52aWV3ZXJTZXRTY3JvbGxUb3BfLmJpbmQodGhpcykpO1xuICAgIHRoaXMudmlld2VyXy5vbk1lc3NhZ2UoXG4gICAgICAnZGlzYWJsZVNjcm9sbCcsXG4gICAgICB0aGlzLmRpc2FibGVTY3JvbGxFdmVudEhhbmRsZXJfLmJpbmQodGhpcylcbiAgICApO1xuICAgIGlmICh0aGlzLnZpZXdlcl8uaXNFbWJlZGRlZCgpKSB7XG4gICAgICB0aGlzLmJpbmRpbmdfLnVwZGF0ZVBhZGRpbmdUb3AodGhpcy5wYWRkaW5nVG9wXyk7XG4gICAgfVxuXG4gICAgdGhpcy5iaW5kaW5nXy5vblNjcm9sbCh0aGlzLnNjcm9sbF8uYmluZCh0aGlzKSk7XG4gICAgdGhpcy5iaW5kaW5nXy5vblJlc2l6ZSh0aGlzLnJlc2l6ZV8uYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLm9uU2Nyb2xsKHRoaXMuc2VuZFNjcm9sbE1lc3NhZ2VfLmJpbmQodGhpcykpO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMudmlzaWJsZV8gPSBmYWxzZTtcbiAgICB0aGlzLmFtcGRvYy5vblZpc2liaWxpdHlDaGFuZ2VkKHRoaXMudXBkYXRlVmlzaWJpbGl0eV8uYmluZCh0aGlzKSk7XG4gICAgdGhpcy51cGRhdGVWaXNpYmlsaXR5XygpO1xuXG4gICAgLy8gVG9wLWxldmVsIG1vZGUgY2xhc3Nlcy5cbiAgICBjb25zdCBnbG9iYWxEb2NFbGVtZW50ID0gdGhpcy5nbG9iYWxEb2NfLmRvY3VtZW50RWxlbWVudDtcbiAgICBpZiAoYW1wZG9jLmlzU2luZ2xlRG9jKCkpIHtcbiAgICAgIGdsb2JhbERvY0VsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLXNpbmdsZWRvYycpO1xuICAgIH1cbiAgICBpZiAodmlld2VyLmlzRW1iZWRkZWQoKSkge1xuICAgICAgZ2xvYmFsRG9jRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtZW1iZWRkZWQnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ2xvYmFsRG9jRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3RhbmRhbG9uZScpO1xuICAgIH1cbiAgICBpZiAoaXNJZnJhbWVkKHdpbikpIHtcbiAgICAgIGdsb2JhbERvY0VsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLWlmcmFtZWQnKTtcbiAgICB9XG4gICAgaWYgKHZpZXdlci5nZXRQYXJhbSgnd2VidmlldycpID09PSAnMScpIHtcbiAgICAgIGdsb2JhbERvY0VsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLXdlYnZpZXcnKTtcbiAgICB9XG5cbiAgICAvLyBUbyBhdm9pZCBicm93c2VyIHJlc3RvcmUgc2Nyb2xsIHBvc2l0aW9uIHdoZW4gdHJhdmVyc2UgaGlzdG9yeVxuICAgIGlmIChpc0lmcmFtZWQod2luKSAmJiAnc2Nyb2xsUmVzdG9yYXRpb24nIGluIHdpbi5oaXN0b3J5KSB7XG4gICAgICB3aW4uaGlzdG9yeS5zY3JvbGxSZXN0b3JhdGlvbiA9ICdtYW51YWwnO1xuICAgIH1cblxuICAgIC8vIE92ZXJyaWRlIGdsb2JhbCBzY3JvbGxUbyBpZiByZXF1ZXN0ZWQuXG4gICAgaWYgKHRoaXMuYmluZGluZ18ub3ZlcnJpZGVHbG9iYWxTY3JvbGxUbygpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luLCAnc2Nyb2xsVG8nLCB7XG4gICAgICAgICAgdmFsdWU6ICh4LCB5KSA9PiB0aGlzLnNldFNjcm9sbFRvcCh5KSxcbiAgICAgICAgfSk7XG4gICAgICAgIFsncGFnZVlPZmZzZXQnLCAnc2Nyb2xsWSddLmZvckVhY2goKHByb3ApID0+IHtcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luLCBwcm9wLCB7XG4gICAgICAgICAgICBnZXQ6ICgpID0+IHRoaXMuZ2V0U2Nyb2xsVG9wKCksXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBJZ25vcmUgZXJyb3JzLlxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEJGLWNhY2hlIG5hdmlnYXRpb24gc29tZXRpbWVzIGJyZWFrcyBjbGlja3MgaW4gYW4gaWZyYW1lIG9uIGlPUy4gU2VlXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FtcHByb2plY3QvYW1waHRtbC9pc3N1ZXMvMzA4MzggZm9yIG1vcmUgZGV0YWlscy5cbiAgICAvLyBUaGUgc29sdXRpb24gaXMgdG8gbWFrZSBhIFwiZmFrZVwiIHNjcm9sbGluZyBBUEkgY2FsbC5cbiAgICBjb25zdCBpc0lmcmFtZWRJb3MgPSBTZXJ2aWNlcy5wbGF0Zm9ybUZvcih3aW4pLmlzSW9zKCkgJiYgaXNJZnJhbWVkKHdpbik7XG4gICAgLy8gV2UgZG9udCB3YW50IHRvIHNjcm9sbCBpZiB3ZSdyZSBpbiBhIHNoYWRvdyBkb2MsIHNvIGNoZWNrIHRoYXQgd2UncmVcbiAgICAvLyBpbiBhIHNpbmdsZSBkb2MuIEZpeCBmb3JcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW1wcHJvamVjdC9hbXBodG1sL2lzc3Vlcy8zMjE2NS5cbiAgICBpZiAoaXNJZnJhbWVkSW9zICYmIHRoaXMuYW1wZG9jLmlzU2luZ2xlRG9jKCkpIHtcbiAgICAgIHRoaXMuYW1wZG9jLndoZW5SZWFkeSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICB3aW4uLypPSyovIHNjcm9sbFRvKC0wLjEsIDApO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuYmluZGluZ18uZGlzY29ubmVjdCgpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBlbnN1cmVSZWFkeUZvckVsZW1lbnRzKCkge1xuICAgIHRoaXMuYmluZGluZ18uZW5zdXJlUmVhZHlGb3JFbGVtZW50cygpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIHVwZGF0ZVZpc2liaWxpdHlfKCkge1xuICAgIGNvbnN0IHZpc2libGUgPSB0aGlzLmFtcGRvYy5pc1Zpc2libGUoKTtcbiAgICBpZiAodmlzaWJsZSAhPSB0aGlzLnZpc2libGVfKSB7XG4gICAgICB0aGlzLnZpc2libGVfID0gdmlzaWJsZTtcbiAgICAgIGlmICh2aXNpYmxlKSB7XG4gICAgICAgIHRoaXMuYmluZGluZ18uY29ubmVjdCgpO1xuICAgICAgICBpZiAodGhpcy5zaXplXykge1xuICAgICAgICAgIC8vIElmIHRoZSBzaXplIGhhcyBhbHJlYWR5IGJlZW4gaW50aWFsaXplZCwgY2hlY2sgaXQgYWdhaW4gaW4gY2FzZVxuICAgICAgICAgIC8vIHRoZSBzaXplIGhhcyBjaGFuZ2VkIGJldHdlZW4gYGRpc2Nvbm5lY3RgIGFuZCBgY29ubmVjdGAuXG4gICAgICAgICAgdGhpcy5yZXNpemVfKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc2Nyb2xsVG9wXykge1xuICAgICAgICAgIC8vIFJlbWVhc3VyZSBzY3JvbGxUb3Agd2hlbiByZXNvdXJjZSBiZWNvbWVzIHZpc2libGUgdG8gZml4ICMxMTk4M1xuICAgICAgICAgIHRoaXMuLypPSyovIHNjcm9sbFRvcF8gPSBudWxsO1xuICAgICAgICAgIHRoaXMuZ2V0U2Nyb2xsVG9wKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYmluZGluZ18uZGlzY29ubmVjdCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0UGFkZGluZ1RvcCgpIHtcbiAgICByZXR1cm4gdGhpcy5wYWRkaW5nVG9wXztcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0U2Nyb2xsVG9wKCkge1xuICAgIGlmICh0aGlzLi8qT0sqLyBzY3JvbGxUb3BfID09IG51bGwpIHtcbiAgICAgIHRoaXMuLypPSyovIHNjcm9sbFRvcF8gPSB0aGlzLmJpbmRpbmdfLmdldFNjcm9sbFRvcCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy4vKk9LKi8gc2Nyb2xsVG9wXztcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0U2Nyb2xsTGVmdCgpIHtcbiAgICBpZiAodGhpcy4vKk9LKi8gc2Nyb2xsTGVmdF8gPT0gbnVsbCkge1xuICAgICAgdGhpcy4vKk9LKi8gc2Nyb2xsTGVmdF8gPSB0aGlzLmJpbmRpbmdfLmdldFNjcm9sbExlZnQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuLypPSyovIHNjcm9sbExlZnRfO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBzZXRTY3JvbGxUb3Aoc2Nyb2xsUG9zKSB7XG4gICAgdGhpcy4vKk9LKi8gc2Nyb2xsVG9wXyA9IG51bGw7XG4gICAgdGhpcy5iaW5kaW5nXy5zZXRTY3JvbGxUb3Aoc2Nyb2xsUG9zKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgdXBkYXRlUGFkZGluZ0JvdHRvbShwYWRkaW5nQm90dG9tKSB7XG4gICAgdGhpcy5hbXBkb2Mud2FpdEZvckJvZHlPcGVuKCkudGhlbigoYm9keSkgPT4ge1xuICAgICAgc2V0U3R5bGUoYm9keSwgJ2JvcmRlckJvdHRvbScsIGAke3BhZGRpbmdCb3R0b219cHggc29saWQgdHJhbnNwYXJlbnRgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0U2l6ZSgpIHtcbiAgICBpZiAodGhpcy5zaXplXykge1xuICAgICAgcmV0dXJuIHRoaXMuc2l6ZV87XG4gICAgfVxuICAgIHRoaXMuc2l6ZV8gPSB0aGlzLmJpbmRpbmdfLmdldFNpemUoKTtcbiAgICBpZiAodGhpcy5zaXplXy53aWR0aCA9PSAwIHx8IHRoaXMuc2l6ZV8uaGVpZ2h0ID09IDApIHtcbiAgICAgIC8vIE9ubHkgcmVwb3J0IHdoZW4gdGhlIHZpc2liaWxpdHkgaXMgXCJ2aXNpYmxlXCIgb3IgXCJwcmVyZW5kZXJcIi5cbiAgICAgIGNvbnN0IHZpc2liaWxpdHlTdGF0ZSA9IHRoaXMuYW1wZG9jLmdldFZpc2liaWxpdHlTdGF0ZSgpO1xuICAgICAgaWYgKFxuICAgICAgICB2aXNpYmlsaXR5U3RhdGUgPT0gVmlzaWJpbGl0eVN0YXRlLlBSRVJFTkRFUiB8fFxuICAgICAgICB2aXNpYmlsaXR5U3RhdGUgPT0gVmlzaWJpbGl0eVN0YXRlLlZJU0lCTEVcbiAgICAgICkge1xuICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA8IDAuMDEpIHtcbiAgICAgICAgICBkZXYoKS5lcnJvcihUQUdfLCAndmlld3BvcnQgaGFzIHplcm8gZGltZW5zaW9ucycpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnNpemVfO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRIZWlnaHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U2l6ZSgpLmhlaWdodDtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0V2lkdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U2l6ZSgpLndpZHRoO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRTY3JvbGxXaWR0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5iaW5kaW5nXy5nZXRTY3JvbGxXaWR0aCgpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRTY3JvbGxIZWlnaHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuYmluZGluZ18uZ2V0U2Nyb2xsSGVpZ2h0KCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldENvbnRlbnRIZWlnaHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuYmluZGluZ18uZ2V0Q29udGVudEhlaWdodCgpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBjb250ZW50SGVpZ2h0Q2hhbmdlZCgpIHtcbiAgICB0aGlzLmJpbmRpbmdfLmNvbnRlbnRIZWlnaHRDaGFuZ2VkKCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldFJlY3QoKSB7XG4gICAgaWYgKHRoaXMucmVjdF8gPT0gbnVsbCkge1xuICAgICAgY29uc3Qgc2Nyb2xsVG9wID0gdGhpcy5nZXRTY3JvbGxUb3AoKTtcbiAgICAgIGNvbnN0IHNjcm9sbExlZnQgPSB0aGlzLmdldFNjcm9sbExlZnQoKTtcbiAgICAgIGNvbnN0IHNpemUgPSB0aGlzLmdldFNpemUoKTtcbiAgICAgIHRoaXMucmVjdF8gPSBsYXlvdXRSZWN0THR3aChcbiAgICAgICAgc2Nyb2xsTGVmdCxcbiAgICAgICAgc2Nyb2xsVG9wLFxuICAgICAgICBzaXplLndpZHRoLFxuICAgICAgICBzaXplLmhlaWdodFxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucmVjdF87XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldExheW91dFJlY3QoZWwpIHtcbiAgICBjb25zdCBzY3JvbGxMZWZ0ID0gdGhpcy5nZXRTY3JvbGxMZWZ0KCk7XG4gICAgY29uc3Qgc2Nyb2xsVG9wID0gdGhpcy5nZXRTY3JvbGxUb3AoKTtcblxuICAgIC8vIEdvIHVwIHRoZSB3aW5kb3cgaGllcmFyY2h5IHRocm91Z2ggZnJpZW5kbHkgaWZyYW1lcy5cbiAgICBjb25zdCBmcmFtZUVsZW1lbnQgPSBnZXRQYXJlbnRXaW5kb3dGcmFtZUVsZW1lbnQoZWwsIHRoaXMuYW1wZG9jLndpbik7XG4gICAgaWYgKGZyYW1lRWxlbWVudCkge1xuICAgICAgY29uc3QgYiA9IHRoaXMuYmluZGluZ18uZ2V0TGF5b3V0UmVjdChlbCwgMCwgMCk7XG4gICAgICBjb25zdCBjID0gdGhpcy5iaW5kaW5nXy5nZXRMYXlvdXRSZWN0KFxuICAgICAgICBmcmFtZUVsZW1lbnQsXG4gICAgICAgIHNjcm9sbExlZnQsXG4gICAgICAgIHNjcm9sbFRvcFxuICAgICAgKTtcbiAgICAgIHJldHVybiBsYXlvdXRSZWN0THR3aChcbiAgICAgICAgTWF0aC5yb3VuZChiLmxlZnQgKyBjLmxlZnQpLFxuICAgICAgICBNYXRoLnJvdW5kKGIudG9wICsgYy50b3ApLFxuICAgICAgICBNYXRoLnJvdW5kKGIud2lkdGgpLFxuICAgICAgICBNYXRoLnJvdW5kKGIuaGVpZ2h0KVxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5iaW5kaW5nXy5nZXRMYXlvdXRSZWN0KGVsLCBzY3JvbGxMZWZ0LCBzY3JvbGxUb3ApO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRDbGllbnRSZWN0QXN5bmMoZWwpIHtcbiAgICBjb25zdCBsb2NhbCA9IHRoaXMudnN5bmNfLm1lYXN1cmVQcm9taXNlKCgpID0+IHtcbiAgICAgIHJldHVybiBlbC4vKk9LKi8gZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgfSk7XG5cbiAgICBsZXQgcm9vdCA9IHRoaXMuYmluZGluZ18uZ2V0Um9vdENsaWVudFJlY3RBc3luYygpO1xuICAgIGNvbnN0IGZyYW1lRWxlbWVudCA9IGdldFBhcmVudFdpbmRvd0ZyYW1lRWxlbWVudChlbCwgdGhpcy5hbXBkb2Mud2luKTtcbiAgICBpZiAoZnJhbWVFbGVtZW50KSB7XG4gICAgICByb290ID0gdGhpcy52c3luY18ubWVhc3VyZVByb21pc2UoKCkgPT4ge1xuICAgICAgICByZXR1cm4gZnJhbWVFbGVtZW50Li8qT0sqLyBnZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLmFsbChbbG9jYWwsIHJvb3RdKS50aGVuKCh2YWx1ZXMpID0+IHtcbiAgICAgIGNvbnN0IGwgPSB2YWx1ZXNbMF07XG4gICAgICBjb25zdCByID0gdmFsdWVzWzFdO1xuICAgICAgaWYgKCFyKSB7XG4gICAgICAgIHJldHVybiBsYXlvdXRSZWN0RnJvbURvbVJlY3QobCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbW92ZUxheW91dFJlY3QobCwgci5sZWZ0LCByLnRvcCk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHN1cHBvcnRzUG9zaXRpb25GaXhlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5iaW5kaW5nXy5zdXBwb3J0c1Bvc2l0aW9uRml4ZWQoKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaXNEZWNsYXJlZEZpeGVkKGVsZW1lbnQpIHtcbiAgICBpZiAoIXRoaXMuZml4ZWRMYXllcl8pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZml4ZWRMYXllcl8uaXNEZWNsYXJlZEZpeGVkKGVsZW1lbnQpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBzY3JvbGxJbnRvVmlldyhlbGVtZW50KSB7XG4gICAgaWYgKElTX1NYRykge1xuICAgICAgZWxlbWVudC4vKiBPSyAqLyBzY3JvbGxJbnRvVmlldygpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRTY3JvbGxpbmdDb250YWluZXJGb3JfKGVsZW1lbnQpLnRoZW4oKHBhcmVudCkgPT5cbiAgICAgICAgdGhpcy5zY3JvbGxJbnRvVmlld0ludGVybmFsXyhlbGVtZW50LCBwYXJlbnQpXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHBhcmVudFxuICAgKi9cbiAgc2Nyb2xsSW50b1ZpZXdJbnRlcm5hbF8oZWxlbWVudCwgcGFyZW50KSB7XG4gICAgY29uc3QgZWxlbWVudFRvcCA9IHRoaXMuYmluZGluZ18uZ2V0TGF5b3V0UmVjdChlbGVtZW50KS50b3A7XG4gICAgY29uc3Qgc2Nyb2xsUGFkZGluZ1RvcCA9IGdldFNjcm9sbFBhZGRpbmdUb3AodGhpcy5hbXBkb2Mud2luLCBwYXJlbnQpO1xuICAgIGNvbnN0IG5ld1Njcm9sbFRvcFByb21pc2UgPSB0cnlSZXNvbHZlKCgpID0+XG4gICAgICBNYXRoLm1heCgwLCBlbGVtZW50VG9wIC0gdGhpcy5wYWRkaW5nVG9wXyAtIHNjcm9sbFBhZGRpbmdUb3ApXG4gICAgKTtcblxuICAgIG5ld1Njcm9sbFRvcFByb21pc2UudGhlbigobmV3U2Nyb2xsVG9wKSA9PlxuICAgICAgdGhpcy5zZXRFbGVtZW50U2Nyb2xsVG9wXyhwYXJlbnQsIG5ld1Njcm9sbFRvcClcbiAgICApO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBhbmltYXRlU2Nyb2xsSW50b1ZpZXcoZWxlbWVudCwgcG9zID0gJ3RvcCcsIG9wdF9kdXJhdGlvbiwgb3B0X2N1cnZlKSB7XG4gICAgaWYgKElTX1NYRykge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCBvcHRfKSA9PiB7XG4gICAgICAgIGVsZW1lbnQuLyogT0sgKi8gc2Nyb2xsSW50b1ZpZXcoe1xuICAgICAgICAgIGJsb2NrOiBTQ1JPTExfUE9TX1RPX0JMT0NLW3Bvc10sXG4gICAgICAgICAgYmVoYXZpb3I6ICdzbW9vdGgnLFxuICAgICAgICB9KTtcbiAgICAgICAgc2V0VGltZW91dChyZXNvbHZlLCBTTU9PVEhfU0NST0xMX0RFTEFZXyk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGV2QXNzZXJ0KFxuICAgICAgICAhb3B0X2N1cnZlIHx8IG9wdF9kdXJhdGlvbiAhPT0gdW5kZWZpbmVkLFxuICAgICAgICBcIkN1cnZlIHdpdGhvdXQgZHVyYXRpb24gZG9lc24ndCBtYWtlIHNlbnNlLlwiXG4gICAgICApO1xuXG4gICAgICByZXR1cm4gdGhpcy5nZXRTY3JvbGxpbmdDb250YWluZXJGb3JfKGVsZW1lbnQpLnRoZW4oKHBhcmVudCkgPT5cbiAgICAgICAgdGhpcy5hbmltYXRlU2Nyb2xsV2l0aGluUGFyZW50KFxuICAgICAgICAgIGVsZW1lbnQsXG4gICAgICAgICAgcGFyZW50LFxuICAgICAgICAgIGRldigpLmFzc2VydFN0cmluZyhwb3MpLFxuICAgICAgICAgIG9wdF9kdXJhdGlvbixcbiAgICAgICAgICBvcHRfY3VydmVcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGFuaW1hdGVTY3JvbGxXaXRoaW5QYXJlbnQoZWxlbWVudCwgcGFyZW50LCBwb3MsIG9wdF9kdXJhdGlvbiwgb3B0X2N1cnZlKSB7XG4gICAgZGV2QXNzZXJ0KFxuICAgICAgIW9wdF9jdXJ2ZSB8fCBvcHRfZHVyYXRpb24gIT09IHVuZGVmaW5lZCxcbiAgICAgIFwiQ3VydmUgd2l0aG91dCBkdXJhdGlvbiBkb2Vzbid0IG1ha2Ugc2Vuc2UuXCJcbiAgICApO1xuXG4gICAgY29uc3QgZWxlbWVudFJlY3QgPSB0aGlzLmJpbmRpbmdfLmdldExheW91dFJlY3QoZWxlbWVudCk7XG5cbiAgICBjb25zdCB7aGVpZ2h0OiBwYXJlbnRIZWlnaHR9ID0gdGhpcy5pc1Njcm9sbGluZ0VsZW1lbnRfKHBhcmVudClcbiAgICAgID8gdGhpcy5nZXRTaXplKClcbiAgICAgIDogdGhpcy5nZXRMYXlvdXRSZWN0KHBhcmVudCk7XG5cbiAgICBjb25zdCB7d2lufSA9IHRoaXMuYW1wZG9jO1xuICAgIGNvbnN0IHNjcm9sbFBhZGRpbmdUb3AgPSBnZXRTY3JvbGxQYWRkaW5nVG9wKHdpbiwgcGFyZW50KTtcbiAgICBjb25zdCBzY3JvbGxQYWRkaW5nQm90dG9tID0gZ2V0U2Nyb2xsUGFkZGluZ0JvdHRvbSh3aW4sIHBhcmVudCk7XG5cbiAgICBsZXQgb2Zmc2V0ID0gLXNjcm9sbFBhZGRpbmdUb3A7IC8vIGRlZmF1bHQgcG9zID09PSAndG9wJ1xuXG4gICAgaWYgKHBvcyA9PT0gJ2JvdHRvbScpIHtcbiAgICAgIG9mZnNldCA9IC1wYXJlbnRIZWlnaHQgKyBzY3JvbGxQYWRkaW5nQm90dG9tICsgZWxlbWVudFJlY3QuaGVpZ2h0O1xuICAgIH0gZWxzZSBpZiAocG9zID09PSAnY2VudGVyJykge1xuICAgICAgY29uc3QgZWZmZWN0aXZlUGFyZW50SGVpZ2h0ID1cbiAgICAgICAgcGFyZW50SGVpZ2h0IC0gc2Nyb2xsUGFkZGluZ1RvcCAtIHNjcm9sbFBhZGRpbmdCb3R0b207XG4gICAgICBvZmZzZXQgPSAtZWZmZWN0aXZlUGFyZW50SGVpZ2h0IC8gMiArIGVsZW1lbnRSZWN0LmhlaWdodCAvIDI7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZ2V0RWxlbWVudFNjcm9sbFRvcF8ocGFyZW50KS50aGVuKChjdXJTY3JvbGxUb3ApID0+IHtcbiAgICAgIGNvbnN0IGNhbGN1bGF0ZWRTY3JvbGxUb3AgPSBlbGVtZW50UmVjdC50b3AgLSB0aGlzLnBhZGRpbmdUb3BfICsgb2Zmc2V0O1xuICAgICAgY29uc3QgbmV3U2Nyb2xsVG9wID0gTWF0aC5tYXgoMCwgY2FsY3VsYXRlZFNjcm9sbFRvcCk7XG4gICAgICBpZiAobmV3U2Nyb2xsVG9wID09IGN1clNjcm9sbFRvcCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5pbnRlcnBvbGF0ZVNjcm9sbEludG9WaWV3XyhcbiAgICAgICAgcGFyZW50LFxuICAgICAgICBjdXJTY3JvbGxUb3AsXG4gICAgICAgIG5ld1Njcm9sbFRvcCxcbiAgICAgICAgb3B0X2R1cmF0aW9uLFxuICAgICAgICBvcHRfY3VydmVcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudH0gcGFyZW50XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjdXJTY3JvbGxUb3BcbiAgICogQHBhcmFtIHtudW1iZXJ9IG5ld1Njcm9sbFRvcFxuICAgKiBAcGFyYW0ge251bWJlcj19IG9wdF9kdXJhdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZz19IGN1cnZlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpbnRlcnBvbGF0ZVNjcm9sbEludG9WaWV3XyhcbiAgICBwYXJlbnQsXG4gICAgY3VyU2Nyb2xsVG9wLFxuICAgIG5ld1Njcm9sbFRvcCxcbiAgICBvcHRfZHVyYXRpb24sXG4gICAgY3VydmUgPSAnZWFzZS1pbidcbiAgKSB7XG4gICAgY29uc3QgZHVyYXRpb24gPVxuICAgICAgb3B0X2R1cmF0aW9uICE9PSB1bmRlZmluZWRcbiAgICAgICAgPyBkZXYoKS5hc3NlcnROdW1iZXIob3B0X2R1cmF0aW9uKVxuICAgICAgICA6IGdldERlZmF1bHRTY3JvbGxBbmltYXRpb25EdXJhdGlvbihjdXJTY3JvbGxUb3AsIG5ld1Njcm9sbFRvcCk7XG5cbiAgICAvKiogQGNvbnN0IHshVHJhbnNpdGlvbkRlZjxudW1iZXI+fSAqL1xuICAgIGNvbnN0IGludGVycG9sYXRlID0gbnVtZXJpYyhjdXJTY3JvbGxUb3AsIG5ld1Njcm9sbFRvcCk7XG4gICAgcmV0dXJuIEFuaW1hdGlvbi5hbmltYXRlKFxuICAgICAgcGFyZW50LFxuICAgICAgKHBvc2l0aW9uKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0RWxlbWVudFNjcm9sbFRvcF8ocGFyZW50LCBpbnRlcnBvbGF0ZShwb3NpdGlvbikpO1xuICAgICAgfSxcbiAgICAgIGR1cmF0aW9uLFxuICAgICAgY3VydmVcbiAgICApLnRoZW5BbHdheXMoKCkgPT4ge1xuICAgICAgdGhpcy5zZXRFbGVtZW50U2Nyb2xsVG9wXyhwYXJlbnQsIG5ld1Njcm9sbFRvcCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhRWxlbWVudD59XG4gICAqL1xuICBnZXRTY3JvbGxpbmdDb250YWluZXJGb3JfKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gdGhpcy52c3luY18ubWVhc3VyZVByb21pc2UoXG4gICAgICAoKSA9PlxuICAgICAgICBjbG9zZXN0QW5jZXN0b3JFbGVtZW50QnlTZWxlY3RvcihlbGVtZW50LCAnLmktYW1waHRtbC1zY3JvbGxhYmxlJykgfHxcbiAgICAgICAgdGhpcy5iaW5kaW5nXy5nZXRTY3JvbGxpbmdFbGVtZW50KClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNjcm9sbFRvcFxuICAgKi9cbiAgc2V0RWxlbWVudFNjcm9sbFRvcF8oZWxlbWVudCwgc2Nyb2xsVG9wKSB7XG4gICAgaWYgKHRoaXMuaXNTY3JvbGxpbmdFbGVtZW50XyhlbGVtZW50KSkge1xuICAgICAgdGhpcy5iaW5kaW5nXy5zZXRTY3JvbGxUb3Aoc2Nyb2xsVG9wKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy52c3luY18ubXV0YXRlKCgpID0+IHtcbiAgICAgIGVsZW1lbnQuLypPSyovIHNjcm9sbFRvcCA9IHNjcm9sbFRvcDtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqIEByZXR1cm4geyFQcm9taXNlPG51bWJlcj59XG4gICAqL1xuICBnZXRFbGVtZW50U2Nyb2xsVG9wXyhlbGVtZW50KSB7XG4gICAgaWYgKHRoaXMuaXNTY3JvbGxpbmdFbGVtZW50XyhlbGVtZW50KSkge1xuICAgICAgcmV0dXJuIHRyeVJlc29sdmUoKCkgPT4gdGhpcy5nZXRTY3JvbGxUb3AoKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnZzeW5jXy5tZWFzdXJlUHJvbWlzZSgoKSA9PiBlbGVtZW50Li8qT0sqLyBzY3JvbGxUb3ApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGlzU2Nyb2xsaW5nRWxlbWVudF8oZWxlbWVudCkge1xuICAgIHJldHVybiBlbGVtZW50ID09IHRoaXMuYmluZGluZ18uZ2V0U2Nyb2xsaW5nRWxlbWVudCgpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRTY3JvbGxpbmdFbGVtZW50KCkge1xuICAgIGlmICh0aGlzLnNjcm9sbGluZ0VsZW1lbnRfKSB7XG4gICAgICByZXR1cm4gdGhpcy5zY3JvbGxpbmdFbGVtZW50XztcbiAgICB9XG4gICAgcmV0dXJuICh0aGlzLnNjcm9sbGluZ0VsZW1lbnRfID0gdGhpcy5iaW5kaW5nXy5nZXRTY3JvbGxpbmdFbGVtZW50KCkpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBvbkNoYW5nZWQoaGFuZGxlcikge1xuICAgIHJldHVybiB0aGlzLmNoYW5nZU9ic2VydmFibGVfLmFkZChoYW5kbGVyKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgb25TY3JvbGwoaGFuZGxlcikge1xuICAgIHJldHVybiB0aGlzLnNjcm9sbE9ic2VydmFibGVfLmFkZChoYW5kbGVyKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgb25SZXNpemUoaGFuZGxlcikge1xuICAgIHJldHVybiB0aGlzLnJlc2l6ZU9ic2VydmFibGVfLmFkZChoYW5kbGVyKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZW50ZXJMaWdodGJveE1vZGUob3B0X3JlcXVlc3RpbmdFbGVtZW50LCBvcHRfb25Db21wbGV0ZSkge1xuICAgIHRoaXMudmlld2VyXy5zZW5kTWVzc2FnZShcbiAgICAgICdyZXF1ZXN0RnVsbE92ZXJsYXknLFxuICAgICAgZGljdCgpLFxuICAgICAgLyogY2FuY2VsVW5zZW50ICovIHRydWVcbiAgICApO1xuXG4gICAgdGhpcy5lbnRlck92ZXJsYXlNb2RlKCk7XG4gICAgaWYgKHRoaXMuZml4ZWRMYXllcl8pIHtcbiAgICAgIHRoaXMuZml4ZWRMYXllcl8uZW50ZXJMaWdodGJveChvcHRfcmVxdWVzdGluZ0VsZW1lbnQsIG9wdF9vbkNvbXBsZXRlKTtcbiAgICB9XG5cbiAgICBpZiAob3B0X3JlcXVlc3RpbmdFbGVtZW50KSB7XG4gICAgICB0aGlzLm1heWJlRW50ZXJGaWVMaWdodGJveE1vZGUoXG4gICAgICAgIGRldigpLmFzc2VydEVsZW1lbnQob3B0X3JlcXVlc3RpbmdFbGVtZW50KVxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5iaW5kaW5nXy51cGRhdGVMaWdodGJveE1vZGUodHJ1ZSk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGxlYXZlTGlnaHRib3hNb2RlKG9wdF9yZXF1ZXN0aW5nRWxlbWVudCkge1xuICAgIHRoaXMudmlld2VyXy5zZW5kTWVzc2FnZShcbiAgICAgICdjYW5jZWxGdWxsT3ZlcmxheScsXG4gICAgICBkaWN0KCksXG4gICAgICAvKiBjYW5jZWxVbnNlbnQgKi8gdHJ1ZVxuICAgICk7XG5cbiAgICBpZiAodGhpcy5maXhlZExheWVyXykge1xuICAgICAgdGhpcy5maXhlZExheWVyXy5sZWF2ZUxpZ2h0Ym94KCk7XG4gICAgfVxuICAgIHRoaXMubGVhdmVPdmVybGF5TW9kZSgpO1xuXG4gICAgaWYgKG9wdF9yZXF1ZXN0aW5nRWxlbWVudCkge1xuICAgICAgdGhpcy5tYXliZUxlYXZlRmllTGlnaHRib3hNb2RlKFxuICAgICAgICBkZXYoKS5hc3NlcnRFbGVtZW50KG9wdF9yZXF1ZXN0aW5nRWxlbWVudClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuYmluZGluZ18udXBkYXRlTGlnaHRib3hNb2RlKGZhbHNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAgICovXG4gIGlzTGlnaHRib3hFeHBlcmltZW50T24oKSB7XG4gICAgcmV0dXJuIGlzRXhwZXJpbWVudE9uKHRoaXMuYW1wZG9jLndpbiwgJ2FtcC1saWdodGJveC1hNGEtcHJvdG8nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbnRlcnMgZnJhbWUgbGlnaHRib3ggbW9kZSBpZiB1bmRlciBhIEZyaWVuZGx5IElmcmFtZSBFbWJlZC5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gcmVxdWVzdGluZ0VsZW1lbnRcbiAgICogQHZpc2libGVGb3JUZXN0aW5nXG4gICAqL1xuICBtYXliZUVudGVyRmllTGlnaHRib3hNb2RlKHJlcXVlc3RpbmdFbGVtZW50KSB7XG4gICAgY29uc3QgZmllT3B0aW9uYWwgPSB0aGlzLmdldEZyaWVuZGx5SWZyYW1lRW1iZWRfKHJlcXVlc3RpbmdFbGVtZW50KTtcblxuICAgIGlmIChmaWVPcHRpb25hbCkge1xuICAgICAgZGV2QXNzZXJ0KFxuICAgICAgICB0aGlzLmlzTGlnaHRib3hFeHBlcmltZW50T24oKSxcbiAgICAgICAgJ0xpZ2h0Ym94IG1vZGUgZm9yIEE0QSBpcyBvbmx5IGF2YWlsYWJsZSB3aGVuICcgK1xuICAgICAgICAgIFwiJ2FtcC1saWdodGJveC1hNGEtcHJvdG8nIGV4cGVyaW1lbnQgaXMgb25cIlxuICAgICAgKTtcblxuICAgICAgZmllT3B0aW9uYWwuZW50ZXJGdWxsT3ZlcmxheU1vZGUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTGVhdmVzIGZyYW1lIGxpZ2h0Ym94IG1vZGUgaWYgdW5kZXIgYSBGcmllbmRseSBJZnJhbWUgRW1iZWQuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHJlcXVlc3RpbmdFbGVtZW50XG4gICAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICAgKi9cbiAgbWF5YmVMZWF2ZUZpZUxpZ2h0Ym94TW9kZShyZXF1ZXN0aW5nRWxlbWVudCkge1xuICAgIGNvbnN0IGZpZU9wdGlvbmFsID0gdGhpcy5nZXRGcmllbmRseUlmcmFtZUVtYmVkXyhyZXF1ZXN0aW5nRWxlbWVudCk7XG5cbiAgICBpZiAoZmllT3B0aW9uYWwpIHtcbiAgICAgIGRldkFzc2VydChmaWVPcHRpb25hbCkubGVhdmVGdWxsT3ZlcmxheU1vZGUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IEZyaWVuZGx5SWZyYW1lRW1iZWQgaWYgYXZhaWxhYmxlLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50IEVsZW1lbnQgc3VwcG9zZWRseSBpbnNpZGUgdGhlIEZJRS5cbiAgICogQHJldHVybiB7Py4uLy4uL2ZyaWVuZGx5LWlmcmFtZS1lbWJlZC5GcmllbmRseUlmcmFtZUVtYmVkfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0RnJpZW5kbHlJZnJhbWVFbWJlZF8oZWxlbWVudCkge1xuICAgIGNvbnN0IGlmcmFtZU9wdGlvbmFsID0gZ2V0UGFyZW50V2luZG93RnJhbWVFbGVtZW50KFxuICAgICAgZWxlbWVudCxcbiAgICAgIHRoaXMuYW1wZG9jLndpblxuICAgICk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgaWZyYW1lT3B0aW9uYWwgJiZcbiAgICAgIGdldEZyaWVuZGx5SWZyYW1lRW1iZWRPcHRpb25hbChcbiAgICAgICAgLyoqIEB0eXBlIHshSFRNTElGcmFtZUVsZW1lbnR9ICovXG4gICAgICAgIChkZXYoKS5hc3NlcnRFbGVtZW50KGlmcmFtZU9wdGlvbmFsKSlcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBlbnRlck92ZXJsYXlNb2RlKCkge1xuICAgIHRoaXMuZGlzYWJsZVRvdWNoWm9vbSgpO1xuICAgIHRoaXMuZGlzYWJsZVNjcm9sbCgpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBsZWF2ZU92ZXJsYXlNb2RlKCkge1xuICAgIHRoaXMucmVzZXRTY3JvbGwoKTtcbiAgICB0aGlzLnJlc3RvcmVPcmlnaW5hbFRvdWNoWm9vbSgpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBkaXNhYmxlU2Nyb2xsKCkge1xuICAgIGNvbnN0IHt3aW59ID0gdGhpcy5hbXBkb2M7XG4gICAgY29uc3Qge2RvY3VtZW50RWxlbWVudH0gPSB3aW4uZG9jdW1lbnQ7XG4gICAgbGV0IHJlcXVlc3RlZE1hcmdpblJpZ2h0O1xuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBzY3JvbGxiYXIgd2lkdGggc28gd2UgY2FuIHNldCBpdCBhcyBhIHJpZ2h0IG1hcmdpbi4gVGhpc1xuICAgIC8vIGlzIHNvIHRoYXQgd2UgZG8gbm90IGNhdXNlIGNvbnRlbnQgdG8gc2hpZnQgd2hlbiB3ZSBkaXNhYmxlIHNjcm9sbCBvblxuICAgIC8vIHBsYXRmb3JtcyB0aGF0IGhhdmUgYSB3aWR0aC10YWtpbmcgc2Nyb2xsYmFyLlxuICAgIHRoaXMudnN5bmNfLm1lYXN1cmUoKCkgPT4ge1xuICAgICAgY29uc3QgZXhpc3RpbmdNYXJnaW4gPSBjb21wdXRlZFN0eWxlKHdpbiwgZG9jdW1lbnRFbGVtZW50KS5tYXJnaW5SaWdodDtcbiAgICAgIGNvbnN0IHNjcm9sbGJhcldpZHRoID0gZ2V0VmVydGljYWxTY3JvbGxiYXJXaWR0aCh0aGlzLmFtcGRvYy53aW4pO1xuXG4gICAgICByZXF1ZXN0ZWRNYXJnaW5SaWdodCA9IHBhcnNlSW50KGV4aXN0aW5nTWFyZ2luLCAxMCkgKyBzY3JvbGxiYXJXaWR0aDtcbiAgICB9KTtcblxuICAgIHRoaXMudnN5bmNfLm11dGF0ZSgoKSA9PiB7XG4gICAgICBzZXRTdHlsZShkb2N1bWVudEVsZW1lbnQsICdtYXJnaW4tcmlnaHQnLCByZXF1ZXN0ZWRNYXJnaW5SaWdodCwgJ3B4Jyk7XG4gICAgICB0aGlzLmJpbmRpbmdfLmRpc2FibGVTY3JvbGwoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgcmVzZXRTY3JvbGwoKSB7XG4gICAgY29uc3Qge3dpbn0gPSB0aGlzLmFtcGRvYztcbiAgICBjb25zdCB7ZG9jdW1lbnRFbGVtZW50fSA9IHdpbi5kb2N1bWVudDtcblxuICAgIHRoaXMudnN5bmNfLm11dGF0ZSgoKSA9PiB7XG4gICAgICBzZXRTdHlsZShkb2N1bWVudEVsZW1lbnQsICdtYXJnaW4tcmlnaHQnLCAnJyk7XG4gICAgICB0aGlzLmJpbmRpbmdfLnJlc2V0U2Nyb2xsKCk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHJlc2V0VG91Y2hab29tKCkge1xuICAgIGNvbnN0IHdpbmRvd0hlaWdodCA9IHRoaXMuYW1wZG9jLndpbi4vKk9LKi8gaW5uZXJIZWlnaHQ7XG4gICAgY29uc3QgZG9jdW1lbnRIZWlnaHQgPSB0aGlzLmdsb2JhbERvY18uZG9jdW1lbnRFbGVtZW50Li8qT0sqLyBjbGllbnRIZWlnaHQ7XG4gICAgaWYgKHdpbmRvd0hlaWdodCAmJiBkb2N1bWVudEhlaWdodCAmJiB3aW5kb3dIZWlnaHQgPT09IGRvY3VtZW50SGVpZ2h0KSB7XG4gICAgICAvLyBUaGlzIGNvZGUgb25seSB3b3JrcyB3aGVuIHNjcm9sbGJhciBvdmVybGF5IGNvbnRlbnQgYW5kIHRha2Ugbm8gc3BhY2UsXG4gICAgICAvLyB3aGljaCBpcyBmaW5lIG9uIG1vYmlsZS4gRm9yIG5vbi1tb2JpbGUgZGV2aWNlcyB0aGlzIGNvZGUgaXNcbiAgICAgIC8vIGlycmVsZXZhbnQuXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLmRpc2FibGVUb3VjaFpvb20oKSkge1xuICAgICAgdGhpcy50aW1lcl8uZGVsYXkoKCkgPT4ge1xuICAgICAgICB0aGlzLnJlc3RvcmVPcmlnaW5hbFRvdWNoWm9vbSgpO1xuICAgICAgfSwgNTApO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZGlzYWJsZVRvdWNoWm9vbSgpIHtcbiAgICBjb25zdCB2aWV3cG9ydE1ldGEgPSB0aGlzLmdldFZpZXdwb3J0TWV0YV8oKTtcbiAgICBpZiAoIXZpZXdwb3J0TWV0YSkge1xuICAgICAgLy8gVGhpcyBzaG91bGQgbmV2ZXIgaGFwcGVuIGluIGEgdmFsaWQgQU1QIGRvY3VtZW50LCB0aHVzIHNob3J0Y2lyY3VpdC5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gU2V0dGluZyBtYXhpbXVtLXNjYWxlPTEgYW5kIHVzZXItc2NhbGFibGU9bm8gem9vbXMgcGFnZSBiYWNrIHRvIG5vcm1hbFxuICAgIC8vIGFuZCBwcm9oaWJpdCBmdXJ0aGVyIGRlZmF1bHQgem9vbWluZy5cbiAgICBjb25zdCBuZXdWYWx1ZSA9IHVwZGF0ZVZpZXdwb3J0TWV0YVN0cmluZyh2aWV3cG9ydE1ldGEuY29udGVudCwge1xuICAgICAgJ21heGltdW0tc2NhbGUnOiAnMScsXG4gICAgICAndXNlci1zY2FsYWJsZSc6ICdubycsXG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuc2V0Vmlld3BvcnRNZXRhU3RyaW5nXyhuZXdWYWx1ZSk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHJlc3RvcmVPcmlnaW5hbFRvdWNoWm9vbSgpIHtcbiAgICBpZiAodGhpcy5vcmlnaW5hbFZpZXdwb3J0TWV0YVN0cmluZ18gIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0Vmlld3BvcnRNZXRhU3RyaW5nXyh0aGlzLm9yaWdpbmFsVmlld3BvcnRNZXRhU3RyaW5nXyk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgdXBkYXRlRml4ZWRMYXllcigpIHtcbiAgICBpZiAoIXRoaXMuZml4ZWRMYXllcl8pIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZml4ZWRMYXllcl8udXBkYXRlKCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGFkZFRvRml4ZWRMYXllcihlbGVtZW50LCBvcHRfZm9yY2VUcmFuc2Zlcikge1xuICAgIGlmICghdGhpcy5maXhlZExheWVyXykge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5maXhlZExheWVyXy5hZGRFbGVtZW50KGVsZW1lbnQsIG9wdF9mb3JjZVRyYW5zZmVyKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgcmVtb3ZlRnJvbUZpeGVkTGF5ZXIoZWxlbWVudCkge1xuICAgIGlmICghdGhpcy5maXhlZExheWVyXykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmZpeGVkTGF5ZXJfLnJlbW92ZUVsZW1lbnQoZWxlbWVudCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGNyZWF0ZUZpeGVkTGF5ZXIoY29uc3RydWN0b3IpIHtcbiAgICB0aGlzLmZpeGVkTGF5ZXJfID0gbmV3IGNvbnN0cnVjdG9yKFxuICAgICAgdGhpcy5hbXBkb2MsXG4gICAgICB0aGlzLnZzeW5jXyxcbiAgICAgIHRoaXMuYmluZGluZ18uZ2V0Qm9yZGVyVG9wKCksXG4gICAgICB0aGlzLnBhZGRpbmdUb3BfLFxuICAgICAgdGhpcy5iaW5kaW5nXy5yZXF1aXJlc0ZpeGVkTGF5ZXJUcmFuc2ZlcigpXG4gICAgKTtcbiAgICB0aGlzLmFtcGRvYy53aGVuUmVhZHkoKS50aGVuKCgpID0+IHRoaXMuZml4ZWRMYXllcl8uc2V0dXAoKSk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0b3VjaCB6b29tIG1ldGEgZGF0YS4gUmV0dXJucyBgdHJ1ZWAgaWYgYW55IGFjdHVhbFxuICAgKiBjaGFuZ2VzIGhhdmUgYmVlbiBkb25lLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmlld3BvcnRNZXRhU3RyaW5nXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBzZXRWaWV3cG9ydE1ldGFTdHJpbmdfKHZpZXdwb3J0TWV0YVN0cmluZykge1xuICAgIGNvbnN0IHZpZXdwb3J0TWV0YSA9IHRoaXMuZ2V0Vmlld3BvcnRNZXRhXygpO1xuICAgIGlmICh2aWV3cG9ydE1ldGEgJiYgdmlld3BvcnRNZXRhLmNvbnRlbnQgIT0gdmlld3BvcnRNZXRhU3RyaW5nKSB7XG4gICAgICBkZXYoKS5maW5lKFRBR18sICdjaGFuZ2VkIHZpZXdwb3J0IG1ldGEgdG86Jywgdmlld3BvcnRNZXRhU3RyaW5nKTtcbiAgICAgIHZpZXdwb3J0TWV0YS5jb250ZW50ID0gdmlld3BvcnRNZXRhU3RyaW5nO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHs/SFRNTE1ldGFFbGVtZW50fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0Vmlld3BvcnRNZXRhXygpIHtcbiAgICBpZiAoaXNJZnJhbWVkKHRoaXMuYW1wZG9jLndpbikpIHtcbiAgICAgIC8vIEFuIGVtYmVkZGVkIGRvY3VtZW50IGRvZXMgbm90IGNvbnRyb2wgaXRzIHZpZXdwb3J0IG1ldGEgdGFnLlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLnZpZXdwb3J0TWV0YV8gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy52aWV3cG9ydE1ldGFfID0gLyoqIEB0eXBlIHs/SFRNTE1ldGFFbGVtZW50fSAqLyAoXG4gICAgICAgIHRoaXMuZ2xvYmFsRG9jXy5xdWVyeVNlbGVjdG9yKCdtZXRhW25hbWU9dmlld3BvcnRdJylcbiAgICAgICk7XG4gICAgICBpZiAodGhpcy52aWV3cG9ydE1ldGFfKSB7XG4gICAgICAgIHRoaXMub3JpZ2luYWxWaWV3cG9ydE1ldGFTdHJpbmdfID0gdGhpcy52aWV3cG9ydE1ldGFfLmNvbnRlbnQ7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnZpZXdwb3J0TWV0YV87XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshSnNvbk9iamVjdH0gZGF0YVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdmlld2VyU2V0U2Nyb2xsVG9wXyhkYXRhKSB7XG4gICAgY29uc3QgdGFyZ2V0U2Nyb2xsVG9wID0gZGF0YVsnc2Nyb2xsVG9wJ107XG4gICAgdGhpcy5zZXRTY3JvbGxUb3AodGFyZ2V0U2Nyb2xsVG9wKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFKc29uT2JqZWN0fSBkYXRhXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB1cGRhdGVPblZpZXdwb3J0RXZlbnRfKGRhdGEpIHtcbiAgICBjb25zdCBwYWRkaW5nVG9wID0gZGF0YVsncGFkZGluZ1RvcCddO1xuICAgIGNvbnN0IGR1cmF0aW9uID0gZGF0YVsnZHVyYXRpb24nXSB8fCAwO1xuICAgIGNvbnN0IGN1cnZlID0gZGF0YVsnY3VydmUnXTtcbiAgICAvKiogQGNvbnN0IHtib29sZWFufSAqL1xuICAgIGNvbnN0IHRyYW5zaWVudCA9IGRhdGFbJ3RyYW5zaWVudCddO1xuXG4gICAgaWYgKHBhZGRpbmdUb3AgPT0gdW5kZWZpbmVkIHx8IHBhZGRpbmdUb3AgPT0gdGhpcy5wYWRkaW5nVG9wXykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMubGFzdFBhZGRpbmdUb3BfID0gdGhpcy5wYWRkaW5nVG9wXztcbiAgICB0aGlzLnBhZGRpbmdUb3BfID0gcGFkZGluZ1RvcDtcblxuICAgIGlmICh0aGlzLmZpeGVkTGF5ZXJfKSB7XG4gICAgICBjb25zdCBhbmltUHJvbWlzZSA9IHRoaXMuZml4ZWRMYXllcl8uYW5pbWF0ZUZpeGVkRWxlbWVudHMoXG4gICAgICAgIHRoaXMucGFkZGluZ1RvcF8sXG4gICAgICAgIHRoaXMubGFzdFBhZGRpbmdUb3BfLFxuICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgY3VydmUsXG4gICAgICAgIHRyYW5zaWVudFxuICAgICAgKTtcbiAgICAgIGlmIChwYWRkaW5nVG9wIDwgdGhpcy5sYXN0UGFkZGluZ1RvcF8pIHtcbiAgICAgICAgdGhpcy5iaW5kaW5nXy5oaWRlVmlld2VySGVhZGVyKHRyYW5zaWVudCwgdGhpcy5sYXN0UGFkZGluZ1RvcF8pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYW5pbVByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5iaW5kaW5nXy5zaG93Vmlld2VySGVhZGVyKHRyYW5zaWVudCwgcGFkZGluZ1RvcCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFKc29uT2JqZWN0fSBkYXRhXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBkaXNhYmxlU2Nyb2xsRXZlbnRIYW5kbGVyXyhkYXRhKSB7XG4gICAgaWYgKCEhZGF0YSkge1xuICAgICAgdGhpcy5kaXNhYmxlU2Nyb2xsKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVzZXRTY3JvbGwoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtib29sZWFufSByZWxheW91dEFsbFxuICAgKiBAcGFyYW0ge251bWJlcn0gdmVsb2NpdHlcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNoYW5nZWRfKHJlbGF5b3V0QWxsLCB2ZWxvY2l0eSkge1xuICAgIGNvbnN0IHNpemUgPSB0aGlzLmdldFNpemUoKTtcbiAgICBjb25zdCBzY3JvbGxUb3AgPSB0aGlzLmdldFNjcm9sbFRvcCgpO1xuICAgIGNvbnN0IHNjcm9sbExlZnQgPSB0aGlzLmdldFNjcm9sbExlZnQoKTtcbiAgICBkZXYoKS5maW5lKFxuICAgICAgVEFHXyxcbiAgICAgICdjaGFuZ2VkIGV2ZW50OicsXG4gICAgICAncmVsYXlvdXRBbGw9JyxcbiAgICAgIHJlbGF5b3V0QWxsLFxuICAgICAgJ3RvcD0nLFxuICAgICAgc2Nyb2xsVG9wLFxuICAgICAgJ2xlZnQ9JyxcbiAgICAgIHNjcm9sbExlZnQsXG4gICAgICAnYm90dG9tPScsXG4gICAgICBzY3JvbGxUb3AgKyBzaXplLmhlaWdodCxcbiAgICAgICd2ZWxvY2l0eT0nLFxuICAgICAgdmVsb2NpdHlcbiAgICApO1xuICAgIHRoaXMuY2hhbmdlT2JzZXJ2YWJsZV8uZmlyZSh7XG4gICAgICByZWxheW91dEFsbCxcbiAgICAgIHRvcDogc2Nyb2xsVG9wLFxuICAgICAgbGVmdDogc2Nyb2xsTGVmdCxcbiAgICAgIHdpZHRoOiBzaXplLndpZHRoLFxuICAgICAgaGVpZ2h0OiBzaXplLmhlaWdodCxcbiAgICAgIHZlbG9jaXR5LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIHNjcm9sbF8oKSB7XG4gICAgdGhpcy5yZWN0XyA9IG51bGw7XG4gICAgdGhpcy5zY3JvbGxDb3VudF8rKztcbiAgICB0aGlzLnNjcm9sbExlZnRfID0gdGhpcy5iaW5kaW5nXy5nZXRTY3JvbGxMZWZ0KCk7XG4gICAgY29uc3QgbmV3U2Nyb2xsVG9wID0gdGhpcy5iaW5kaW5nXy5nZXRTY3JvbGxUb3AoKTtcbiAgICBpZiAobmV3U2Nyb2xsVG9wIDwgMCkge1xuICAgICAgLy8gaU9TIGFuZCBzb21lIG90aGVyIGJyb3dzZXJzIHVzZSBuZWdhdGl2ZSB2YWx1ZXMgb2Ygc2Nyb2xsVG9wIGZvclxuICAgICAgLy8gb3ZlcnNjcm9sbC4gT3ZlcnNjcm9sbCBkb2VzIG5vdCBhZmZlY3QgdGhlIHZpZXdwb3J0IGFuZCB0aHVzIHNob3VsZFxuICAgICAgLy8gYmUgaWdub3JlZCBoZXJlLlxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnNjcm9sbFRvcF8gPSBuZXdTY3JvbGxUb3A7XG4gICAgaWYgKCF0aGlzLnNjcm9sbFRyYWNraW5nXykge1xuICAgICAgdGhpcy5zY3JvbGxUcmFja2luZ18gPSB0cnVlO1xuICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgIC8vIFdhaXQgMiBmcmFtZXMgYW5kIHRoZW4gcmVxdWVzdCBhbiBhbmltYXRpb24gZnJhbWUuXG4gICAgICB0aGlzLnRpbWVyXy5kZWxheSgoKSA9PiB7XG4gICAgICAgIHRoaXMudnN5bmNfLm1lYXN1cmUoKCkgPT4ge1xuICAgICAgICAgIHRoaXMudGhyb3R0bGVkU2Nyb2xsXyhub3csIG5ld1Njcm9sbFRvcCk7XG4gICAgICAgIH0pO1xuICAgICAgfSwgMzYpO1xuICAgIH1cbiAgICB0aGlzLnNjcm9sbE9ic2VydmFibGVfLmZpcmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgYWJvdXQgZXZlcnkgMyBmcmFtZXMgKGFzc3VtaW5nIDYwaHopIGFuZCBpdFxuICAgKiBpcyBjYWxsZWQgaW4gYSB2c3luYyBtZWFzdXJlIHRhc2suXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZWZlcmVuY2VUaW1lIFRpbWUgd2hlbiB0aGUgc2Nyb2xsIG1lYXN1cmVtZW50LCB0aGF0XG4gICAqICAgICB0cmlnZ2VyZWQgdGhpcyBjYWxsIG1hZGUsIHdhcyBtYWRlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmVmZXJlbmNlVG9wIFNjcm9sbHRvcCBhdCB0aGF0IHRpbWUuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB0aHJvdHRsZWRTY3JvbGxfKHJlZmVyZW5jZVRpbWUsIHJlZmVyZW5jZVRvcCkge1xuICAgIHRoaXMuc2Nyb2xsVG9wXyA9IHRoaXMuYmluZGluZ18uZ2V0U2Nyb2xsVG9wKCk7XG4gICAgLyoqICBAY29uc3Qge251bWJlcn0gKi9cbiAgICBjb25zdCBuZXdTY3JvbGxUb3AgPSB0aGlzLnNjcm9sbFRvcF87XG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICBsZXQgdmVsb2NpdHkgPSAwO1xuICAgIGlmIChub3cgIT0gcmVmZXJlbmNlVGltZSkge1xuICAgICAgdmVsb2NpdHkgPSAobmV3U2Nyb2xsVG9wIC0gcmVmZXJlbmNlVG9wKSAvIChub3cgLSByZWZlcmVuY2VUaW1lKTtcbiAgICB9XG4gICAgZGV2KCkuZmluZShcbiAgICAgIFRBR18sXG4gICAgICAnc2Nyb2xsOiBzY3JvbGxUb3A9JyArIG5ld1Njcm9sbFRvcCArICc7IHZlbG9jaXR5PScgKyB2ZWxvY2l0eVxuICAgICk7XG4gICAgaWYgKE1hdGguYWJzKHZlbG9jaXR5KSA8IDAuMDMpIHtcbiAgICAgIHRoaXMuY2hhbmdlZF8oLyogcmVsYXlvdXRBbGwgKi8gZmFsc2UsIHZlbG9jaXR5KTtcbiAgICAgIHRoaXMuc2Nyb2xsVHJhY2tpbmdfID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudGltZXJfLmRlbGF5KFxuICAgICAgICAoKSA9PlxuICAgICAgICAgIHRoaXMudnN5bmNfLm1lYXN1cmUoXG4gICAgICAgICAgICB0aGlzLnRocm90dGxlZFNjcm9sbF8uYmluZCh0aGlzLCBub3csIG5ld1Njcm9sbFRvcClcbiAgICAgICAgICApLFxuICAgICAgICAyMFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBzY3JvbGwgbWVzc2FnZSB2aWEgdGhlIHZpZXdlciBwZXIgYW5pbWF0aW9uIGZyYW1lXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBzZW5kU2Nyb2xsTWVzc2FnZV8oKSB7XG4gICAgaWYgKCF0aGlzLnNjcm9sbEFuaW1hdGlvbkZyYW1lVGhyb3R0bGVkXykge1xuICAgICAgdGhpcy5zY3JvbGxBbmltYXRpb25GcmFtZVRocm90dGxlZF8gPSB0cnVlO1xuICAgICAgdGhpcy52c3luY18ubWVhc3VyZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuc2Nyb2xsQW5pbWF0aW9uRnJhbWVUaHJvdHRsZWRfID0gZmFsc2U7XG4gICAgICAgIHRoaXMudmlld2VyXy5zZW5kTWVzc2FnZShcbiAgICAgICAgICAnc2Nyb2xsJyxcbiAgICAgICAgICBkaWN0KHsnc2Nyb2xsVG9wJzogdGhpcy5nZXRTY3JvbGxUb3AoKX0pLFxuICAgICAgICAgIC8qIGNhbmNlbFVuc2VudCAqLyB0cnVlXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgcmVzaXplXygpIHtcbiAgICB0aGlzLnJlY3RfID0gbnVsbDtcbiAgICBjb25zdCBvbGRTaXplID0gdGhpcy5zaXplXztcbiAgICB0aGlzLnNpemVfID0gbnVsbDsgLy8gTmVlZCB0byByZWNhbGMuXG4gICAgY29uc3QgbmV3U2l6ZSA9IHRoaXMuZ2V0U2l6ZSgpO1xuICAgIHRoaXMudXBkYXRlRml4ZWRMYXllcigpLnRoZW4oKCkgPT4ge1xuICAgICAgY29uc3Qgd2lkdGhDaGFuZ2VkID0gIW9sZFNpemUgfHwgb2xkU2l6ZS53aWR0aCAhPSBuZXdTaXplLndpZHRoO1xuICAgICAgdGhpcy5jaGFuZ2VkXygvKnJlbGF5b3V0QWxsKi8gd2lkdGhDaGFuZ2VkLCAwKTtcbiAgICAgIGNvbnN0IHNpemVDaGFuZ2VkID0gd2lkdGhDaGFuZ2VkIHx8IG9sZFNpemUuaGVpZ2h0ICE9IG5ld1NpemUuaGVpZ2h0O1xuICAgICAgaWYgKHNpemVDaGFuZ2VkKSB7XG4gICAgICAgIHRoaXMucmVzaXplT2JzZXJ2YWJsZV8uZmlyZSh7XG4gICAgICAgICAgcmVsYXlvdXRBbGw6IHdpZHRoQ2hhbmdlZCxcbiAgICAgICAgICB3aWR0aDogbmV3U2l6ZS53aWR0aCxcbiAgICAgICAgICBoZWlnaHQ6IG5ld1NpemUuaGVpZ2h0LFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIFBhcnNlcyB2aWV3cG9ydCBtZXRhIHZhbHVlLiBJdCB1c3VhbGx5IGxvb2tzIGxpa2U6XG4gKiBgYGBcbiAqIHdpZHRoPWRldmljZS13aWR0aCxpbml0aWFsLXNjYWxlPTEsbWluaW11bS1zY2FsZT0xXG4gKiBgYGBcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50XG4gKiBAcmV0dXJuIHshT2JqZWN0PHN0cmluZywgKHN0cmluZ3x1bmRlZmluZWQpPn1cbiAqIEBwcml2YXRlIFZpc2libGUgZm9yIHRlc3Rpbmcgb25seS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVmlld3BvcnRNZXRhKGNvbnRlbnQpIHtcbiAgLy8gRXg6IHdpZHRoPWRldmljZS13aWR0aCxpbml0aWFsLXNjYWxlPTEsbWluaW1hbC11aVxuICBjb25zdCBwYXJhbXMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBpZiAoIWNvbnRlbnQpIHtcbiAgICByZXR1cm4gcGFyYW1zO1xuICB9XG4gIGNvbnN0IHBhaXJzID0gY29udGVudC5zcGxpdCgvLHw7Lyk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcGFpcnMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBwYWlyID0gcGFpcnNbaV07XG4gICAgY29uc3Qgc3BsaXQgPSBwYWlyLnNwbGl0KCc9Jyk7XG4gICAgY29uc3QgbmFtZSA9IHNwbGl0WzBdLnRyaW0oKTtcbiAgICBsZXQgdmFsdWUgPSBzcGxpdFsxXTtcbiAgICB2YWx1ZSA9ICh2YWx1ZSB8fCAnJykudHJpbSgpO1xuICAgIGlmIChuYW1lKSB7XG4gICAgICBwYXJhbXNbbmFtZV0gPSB2YWx1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBhcmFtcztcbn1cblxuLyoqXG4gKiBTdHJpbmdpZmllcyB2aWV3cG9ydCBtZXRhIHZhbHVlIGJhc2VkIG9uIHRoZSBwcm92aWRlZCBtYXAuIEl0IHVzdWFsbHkgbG9va3NcbiAqIGxpa2U6XG4gKiBgYGBcbiAqIHdpZHRoPWRldmljZS13aWR0aCxpbml0aWFsLXNjYWxlPTEsbWluaW11bS1zY2FsZT0xXG4gKiBgYGBcbiAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsIHN0cmluZz59IHBhcmFtc1xuICogQHJldHVybiB7c3RyaW5nfVxuICogQHByaXZhdGUgVmlzaWJsZSBmb3IgdGVzdGluZyBvbmx5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5naWZ5Vmlld3BvcnRNZXRhKHBhcmFtcykge1xuICAvLyBFeDogd2lkdGg9ZGV2aWNlLXdpZHRoLGluaXRpYWwtc2NhbGU9MSxtaW5pbWFsLXVpXG4gIGxldCBjb250ZW50ID0gJyc7XG4gIGZvciAoY29uc3QgayBpbiBwYXJhbXMpIHtcbiAgICBpZiAoY29udGVudC5sZW5ndGggPiAwKSB7XG4gICAgICBjb250ZW50ICs9ICcsJztcbiAgICB9XG4gICAgaWYgKHBhcmFtc1trXSkge1xuICAgICAgY29udGVudCArPSBrICsgJz0nICsgcGFyYW1zW2tdO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZW50ICs9IGs7XG4gICAgfVxuICB9XG4gIHJldHVybiBjb250ZW50O1xufVxuXG4vKipcbiAqIFRoaXMgbWV0aG9kIG1ha2VzIGEgbWluaW1hbCBlZmZvcnQgdG8ga2VlcCB0aGUgb3JpZ2luYWwgdmlld3BvcnQgc3RyaW5nXG4gKiB1bmNoYW5nZWQgaWYgaW4gZmFjdCBub25lIG9mIHRoZSB2YWx1ZXMgaGF2ZSBiZWVuIHVwZGF0ZWQuIFJldHVybnMgdGhlXG4gKiB1cGRhdGVkIHN0cmluZyBvciB0aGUgYGN1cnJlbnRWYWx1ZWAgaWYgbm8gY2hhbmdlcyB3ZXJlIG5lY2Vzc2FyeS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY3VycmVudFZhbHVlXG4gKiBAcGFyYW0geyFPYmplY3Q8c3RyaW5nLCBzdHJpbmd8dW5kZWZpbmVkPn0gdXBkYXRlUGFyYW1zXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKiBAcHJpdmF0ZSBWaXNpYmxlIGZvciB0ZXN0aW5nIG9ubHkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVWaWV3cG9ydE1ldGFTdHJpbmcoY3VycmVudFZhbHVlLCB1cGRhdGVQYXJhbXMpIHtcbiAgY29uc3QgcGFyYW1zID0gcGFyc2VWaWV3cG9ydE1ldGEoY3VycmVudFZhbHVlKTtcbiAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcbiAgZm9yIChjb25zdCBrIGluIHVwZGF0ZVBhcmFtcykge1xuICAgIGlmIChwYXJhbXNba10gIT09IHVwZGF0ZVBhcmFtc1trXSkge1xuICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICBpZiAodXBkYXRlUGFyYW1zW2tdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcGFyYW1zW2tdID0gLyoqIEB0eXBlIHtzdHJpbmd9ICovICh1cGRhdGVQYXJhbXNba10pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVsZXRlIHBhcmFtc1trXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKCFjaGFuZ2VkKSB7XG4gICAgcmV0dXJuIGN1cnJlbnRWYWx1ZTtcbiAgfVxuICByZXR1cm4gc3RyaW5naWZ5Vmlld3BvcnRNZXRhKHBhcmFtcyk7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyBhIGRlZmF1bHQgZHVyYXRpb24gZm9yIGEgc2Nyb2xsVG9wIGFuaW1hdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBzY3JvbGxUb3BBIGNvbW11dGF0aXZlIHdpdGggYi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBzY3JvbGxUb3BCIGNvbW11dGF0aXZlIHdpdGggYS5cbiAqIEBwYXJhbSB7bnVtYmVyPX0gbWF4IGluIG1zLiBkZWZhdWx0IDUwMG1zLlxuICogQHJldHVybiB7bnVtYmVyfVxuICovXG5mdW5jdGlvbiBnZXREZWZhdWx0U2Nyb2xsQW5pbWF0aW9uRHVyYXRpb24oc2Nyb2xsVG9wQSwgc2Nyb2xsVG9wQiwgbWF4ID0gNTAwKSB7XG4gIC8vIDY1JSBvZiBzY3JvbGwgzpQgdG8gbXMsIGVnIDEwMDBweCAtPiA2NTBtcywgaW50ZWdlciBiZXR3ZWVuIDAgYW5kIG1heFxuICByZXR1cm4gTWF0aC5mbG9vcihjbGFtcCgwLjY1ICogTWF0aC5hYnMoc2Nyb2xsVG9wQSAtIHNjcm9sbFRvcEIpLCAwLCBtYXgpKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyEuLi9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICogQHJldHVybiB7IVZpZXdwb3J0SW1wbH1cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVZpZXdwb3J0KGFtcGRvYykge1xuICBjb25zdCB2aWV3ZXIgPSBTZXJ2aWNlcy52aWV3ZXJGb3JEb2MoYW1wZG9jKTtcbiAgY29uc3Qge3dpbn0gPSBhbXBkb2M7XG4gIGxldCBiaW5kaW5nO1xuICBpZiAoXG4gICAgYW1wZG9jLmlzU2luZ2xlRG9jKCkgJiZcbiAgICBnZXRWaWV3cG9ydFR5cGUod2luLCB2aWV3ZXIpID09IFZpZXdwb3J0VHlwZS5OQVRVUkFMX0lPU19FTUJFRCAmJlxuICAgICFJU19TWEdcbiAgKSB7XG4gICAgYmluZGluZyA9IG5ldyBWaWV3cG9ydEJpbmRpbmdJb3NFbWJlZFdyYXBwZXJfKHdpbik7XG4gIH0gZWxzZSB7XG4gICAgYmluZGluZyA9IG5ldyBWaWV3cG9ydEJpbmRpbmdOYXR1cmFsXyhhbXBkb2MpO1xuICB9XG4gIHJldHVybiBuZXcgVmlld3BvcnRJbXBsKGFtcGRvYywgYmluZGluZywgdmlld2VyKTtcbn1cblxuLyoqXG4gKiBUaGUgdHlwZSBvZiB0aGUgdmlld3BvcnQuXG4gKiBAZW51bSB7c3RyaW5nfVxuICovXG5jb25zdCBWaWV3cG9ydFR5cGUgPSB7XG4gIC8qKlxuICAgKiBWaWV3ZXIgbGVhdmVzIHNpemluZyBhbmQgc2Nyb2xsaW5nIHVwIHRvIHRoZSBBTVAgZG9jdW1lbnQncyB3aW5kb3cuXG4gICAqL1xuICBOQVRVUkFMOiAnbmF0dXJhbCcsXG5cbiAgLyoqXG4gICAqIFRoaXMgaXMgQU1QLXNwZWNpZmljIHR5cGUgYW5kIGRvZXNuJ3QgY29tZSBmcm9tIHZpZXdlci4gVGhpcyBpcyB0aGUgdHlwZVxuICAgKiB0aGF0IEFNUCBzZXRzIHdoZW4gVmlld2VyIGhhcyByZXF1ZXN0ZWQgXCJuYXR1cmFsXCIgdmlld3BvcnQgb24gYSBpT1NcbiAgICogZGV2aWNlLlxuICAgKiBTZWU6XG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hbXBwcm9qZWN0L2FtcGh0bWwvYmxvYi9tYWluL2RvY3Mvc3BlYy9hbXAtaHRtbC1sYXlvdXQubWRcbiAgICovXG4gIE5BVFVSQUxfSU9TX0VNQkVEOiAnbmF0dXJhbC1pb3MtZW1iZWQnLFxufTtcblxuLyoqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHBhcmFtIHshLi4vdmlld2VyLWludGVyZmFjZS5WaWV3ZXJJbnRlcmZhY2V9IHZpZXdlclxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBnZXRWaWV3cG9ydFR5cGUod2luLCB2aWV3ZXIpIHtcbiAgY29uc3QgaXNJZnJhbWVkSW9zID0gU2VydmljZXMucGxhdGZvcm1Gb3Iod2luKS5pc0lvcygpICYmIGlzSWZyYW1lZCh3aW4pO1xuXG4gIC8vIEVuYWJsZSBpT1MgRW1iZWRkZWQgbW9kZSBmb3IgaWZyYW1lZCB0ZXN0cyAoZS5nLiBpbnRlZ3JhdGlvbiB0ZXN0cykuXG4gIGlmIChnZXRNb2RlKHdpbikudGVzdCAmJiBpc0lmcmFtZWRJb3MpIHtcbiAgICByZXR1cm4gVmlld3BvcnRUeXBlLk5BVFVSQUxfSU9TX0VNQkVEO1xuICB9XG5cbiAgLy8gT3ZlcnJpZGUgdG8gaW9zLWVtYmVkIGZvciBpZnJhbWUtdmlld2VyIG1vZGUuXG4gIGlmIChcbiAgICBpc0lmcmFtZWRJb3MgJiZcbiAgICB2aWV3ZXIuaXNFbWJlZGRlZCgpICYmXG4gICAgIXZpZXdlci5oYXNDYXBhYmlsaXR5KCdpZnJhbWVTY3JvbGwnKVxuICApIHtcbiAgICByZXR1cm4gVmlld3BvcnRUeXBlLk5BVFVSQUxfSU9TX0VNQkVEO1xuICB9XG4gIHJldHVybiBWaWV3cG9ydFR5cGUuTkFUVVJBTDtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyEuLi9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbFZpZXdwb3J0U2VydmljZUZvckRvYyhhbXBkb2MpIHtcbiAgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvYyhcbiAgICBhbXBkb2MsXG4gICAgJ3ZpZXdwb3J0JyxcbiAgICBjcmVhdGVWaWV3cG9ydCxcbiAgICAvKiBvcHRfaW5zdGFudGlhdGUgKi8gdHJ1ZVxuICApO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/service/viewport/viewport-impl.js