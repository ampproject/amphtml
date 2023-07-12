import {VisibilityState_Enum} from '#core/constants/visibility-state';
import {Observable} from '#core/data-structures/observable';
import {tryResolve} from '#core/data-structures/promise';
import {getVerticalScrollbarWidth, isIframed} from '#core/dom';
import {
  layoutRectFromDomRect,
  layoutRectLtwh,
  moveLayoutRect,
} from '#core/dom/layout/rect';
import {closestAncestorElementBySelector} from '#core/dom/query';
import {computedStyle, setStyle} from '#core/dom/style';
import {numeric} from '#core/dom/transition';
import {clamp} from '#core/math';

import {isExperimentOn} from '#experiments';

import {Services} from '#service';

import {Animation} from '#utils/animation';
import {dev, devAssert} from '#utils/log';

import {ViewportBindingDef} from './viewport-binding-def';
import {ViewportBindingIosEmbedWrapper_} from './viewport-binding-ios-embed-wrapper';
import {ViewportBindingNatural_} from './viewport-binding-natural';
import {ViewportInterface} from './viewport-interface';

import {getFriendlyIframeEmbedOptional} from '../../iframe-helper';
import {getMode} from '../../mode';
import {
  getParentWindowFrameElement,
  registerServiceBuilderForDoc,
} from '../../service-helpers';

const TAG_ = 'Viewport';
const SCROLL_POS_TO_BLOCK = {
  'top': 'start',
  'center': 'center',
  'bottom': 'end',
};
const SMOOTH_SCROLL_DELAY_ = 300;

/**
 * @param {!Window} win
 * @param {!Element} element
 * @param {string=} property
 * @return {number}
 */
function getComputedStylePropertyPixels(win, element, property) {
  const value = parseInt(computedStyle(win, element)[property], 10);
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
  const effectiveElement =
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
export class ViewportImpl {
  /**
   * @param {!../ampdoc-impl.AmpDoc} ampdoc
   * @param {!ViewportBindingDef} binding
   * @param {!../viewer-interface.ViewerInterface} viewer
   */
  constructor(ampdoc, binding, viewer) {
    const {win} = ampdoc;

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
    this./*OK*/ scrollTop_ = null;

    /** @private {boolean} */
    this.scrollAnimationFrameThrottled_ = false;

    /** @private {?number} */
    this./*OK*/ scrollLeft_ = null;

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
      this.disableScrollEventHandler_.bind(this)
    );
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
    const globalDocElement = this.globalDoc_.documentElement;
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
          value: (x, y) => this.setScrollTop(y),
        });
        ['pageYOffset', 'scrollY'].forEach((prop) => {
          Object.defineProperty(win, prop, {
            get: () => this.getScrollTop(),
          });
        });
      } catch (e) {
        // Ignore errors.
      }
    }

    // BF-cache navigation sometimes breaks clicks in an iframe on iOS. See
    // https://github.com/ampproject/amphtml/issues/30838 for more details.
    // The solution is to make a "fake" scrolling API call.
    const isIframedIos = Services.platformFor(win).isIos() && isIframed(win);
    // We dont want to scroll if we're in a shadow doc, so check that we're
    // in a single doc. Fix for
    // https://github.com/ampproject/amphtml/issues/32165.
    if (isIframedIos && this.ampdoc.isSingleDoc()) {
      this.ampdoc.whenReady().then(() => {
        win./*OK*/ scrollTo(-0.1, 0);
      });
    }
  }

  /** @override */
  dispose() {
    this.binding_.disconnect();
  }

  /** @override */
  ensureReadyForElements() {
    this.binding_.ensureReadyForElements();
  }

  /** @private */
  updateVisibility_() {
    const visible = this.ampdoc.isVisible();
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
          this./*OK*/ scrollTop_ = null;
          this.getScrollTop();
        }
      } else {
        this.binding_.disconnect();
      }
    }
  }

  /** @override */
  getPaddingTop() {
    return this.paddingTop_;
  }

  /** @override */
  getScrollTop() {
    if (this./*OK*/ scrollTop_ == null) {
      this./*OK*/ scrollTop_ = this.binding_.getScrollTop();
    }
    return this./*OK*/ scrollTop_;
  }

  /** @override */
  getScrollLeft() {
    if (this./*OK*/ scrollLeft_ == null) {
      this./*OK*/ scrollLeft_ = this.binding_.getScrollLeft();
    }
    return this./*OK*/ scrollLeft_;
  }

  /** @override */
  setScrollTop(scrollPos) {
    this./*OK*/ scrollTop_ = null;
    this.binding_.setScrollTop(scrollPos);
  }

  /** @override */
  updatePaddingBottom(paddingBottom) {
    this.ampdoc.waitForBodyOpen().then((body) => {
      setStyle(body, 'borderBottom', `${paddingBottom}px solid transparent`);
    });
  }

  /** @override */
  getSize() {
    if (this.size_) {
      return this.size_;
    }
    this.size_ = this.binding_.getSize();
    if (this.size_.width == 0 || this.size_.height == 0) {
      // Only report when the visibility is "visible" or "prerender".
      const visibilityState = this.ampdoc.getVisibilityState();
      // We do NOT want to report for PREVIEW mode.
      if (
        visibilityState == VisibilityState_Enum.PRERENDER ||
        visibilityState == VisibilityState_Enum.VISIBLE
      ) {
        if (Math.random() < 0.01) {
          dev().error(TAG_, 'viewport has zero dimensions');
        }
      }
    }
    return this.size_;
  }

  /** @override */
  getHeight() {
    return this.getSize().height;
  }

  /** @override */
  getWidth() {
    return this.getSize().width;
  }

  /** @override */
  getScrollWidth() {
    return this.binding_.getScrollWidth();
  }

  /** @override */
  getScrollHeight() {
    return this.binding_.getScrollHeight();
  }

  /** @override */
  getContentHeight() {
    return this.binding_.getContentHeight();
  }

  /** @override */
  contentHeightChanged() {
    this.binding_.contentHeightChanged();
  }

  /** @override */
  getRect() {
    if (this.rect_ == null) {
      const scrollTop = this.getScrollTop();
      const scrollLeft = this.getScrollLeft();
      const size = this.getSize();
      this.rect_ = layoutRectLtwh(
        scrollLeft,
        scrollTop,
        size.width,
        size.height
      );
    }
    return this.rect_;
  }

  /** @override */
  getLayoutRect(el) {
    const scrollLeft = this.getScrollLeft();
    const scrollTop = this.getScrollTop();

    // Go up the window hierarchy through friendly iframes.
    const frameElement = getParentWindowFrameElement(el, this.ampdoc.win);
    if (frameElement) {
      const b = this.binding_.getLayoutRect(el, 0, 0);
      const c = this.binding_.getLayoutRect(
        frameElement,
        scrollLeft,
        scrollTop
      );
      return layoutRectLtwh(
        Math.round(b.left + c.left),
        Math.round(b.top + c.top),
        Math.round(b.width),
        Math.round(b.height)
      );
    }

    return this.binding_.getLayoutRect(el, scrollLeft, scrollTop);
  }

  /** @override */
  getClientRectAsync(el) {
    const local = this.vsync_.measurePromise(() => {
      return el./*OK*/ getBoundingClientRect();
    });

    let root = this.binding_.getRootClientRectAsync();
    const frameElement = getParentWindowFrameElement(el, this.ampdoc.win);
    if (frameElement) {
      root = this.vsync_.measurePromise(() => {
        return frameElement./*OK*/ getBoundingClientRect();
      });
    }

    return Promise.all([local, root]).then((values) => {
      const l = values[0];
      const r = values[1];
      if (!r) {
        return layoutRectFromDomRect(l);
      }
      return moveLayoutRect(l, r.left, r.top);
    });
  }

  /** @override */
  supportsPositionFixed() {
    return this.binding_.supportsPositionFixed();
  }

  /** @override */
  isDeclaredFixed(element) {
    if (!this.fixedLayer_) {
      return false;
    }
    return this.fixedLayer_.isDeclaredFixed(element);
  }

  /** @override */
  scrollIntoView(element) {
    if (IS_SXG) {
      element./* OK */ scrollIntoView();
      return Promise.resolve();
    } else {
      return this.getScrollingContainerFor_(element).then((parent) =>
        this.scrollIntoViewInternal_(element, parent)
      );
    }
  }

  /**
   * @param {!Element} element
   * @param {!Element} parent
   */
  scrollIntoViewInternal_(element, parent) {
    const elementTop = this.binding_.getLayoutRect(element).top;
    const scrollPaddingTop = getScrollPaddingTop(this.ampdoc.win, parent);
    const newScrollTopPromise = tryResolve(() =>
      Math.max(0, elementTop - this.paddingTop_ - scrollPaddingTop)
    );

    newScrollTopPromise.then((newScrollTop) =>
      this.setElementScrollTop_(parent, newScrollTop)
    );
  }

  /** @override */
  animateScrollIntoView(element, pos = 'top', opt_duration, opt_curve) {
    if (IS_SXG) {
      return new Promise((resolve, opt_) => {
        element./* OK */ scrollIntoView({
          block: SCROLL_POS_TO_BLOCK[pos],
          behavior: 'smooth',
        });
        setTimeout(resolve, SMOOTH_SCROLL_DELAY_);
      });
    } else {
      devAssert(
        !opt_curve || opt_duration !== undefined,
        "Curve without duration doesn't make sense."
      );

      return this.getScrollingContainerFor_(element).then((parent) =>
        this.animateScrollWithinParent(
          element,
          parent,
          dev().assertString(pos),
          opt_duration,
          opt_curve
        )
      );
    }
  }

  /** @override */
  animateScrollWithinParent(element, parent, pos, opt_duration, opt_curve) {
    devAssert(
      !opt_curve || opt_duration !== undefined,
      "Curve without duration doesn't make sense."
    );

    const elementRect = this.binding_.getLayoutRect(element);

    const {height: parentHeight} = this.isScrollingElement_(parent)
      ? this.getSize()
      : this.getLayoutRect(parent);

    const {win} = this.ampdoc;
    const scrollPaddingTop = getScrollPaddingTop(win, parent);
    const scrollPaddingBottom = getScrollPaddingBottom(win, parent);

    let offset = -scrollPaddingTop; // default pos === 'top'

    if (pos === 'bottom') {
      offset = -parentHeight + scrollPaddingBottom + elementRect.height;
    } else if (pos === 'center') {
      const effectiveParentHeight =
        parentHeight - scrollPaddingTop - scrollPaddingBottom;
      offset = -effectiveParentHeight / 2 + elementRect.height / 2;
    }

    return this.getElementScrollTop_(parent).then((curScrollTop) => {
      const calculatedScrollTop = elementRect.top - this.paddingTop_ + offset;
      const newScrollTop = Math.max(0, calculatedScrollTop);
      if (newScrollTop == curScrollTop) {
        return;
      }
      return this.interpolateScrollIntoView_(
        parent,
        curScrollTop,
        newScrollTop,
        opt_duration,
        opt_curve
      );
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
  interpolateScrollIntoView_(
    parent,
    curScrollTop,
    newScrollTop,
    opt_duration,
    curve = 'ease-in'
  ) {
    const duration =
      opt_duration !== undefined
        ? dev().assertNumber(opt_duration)
        : getDefaultScrollAnimationDuration(curScrollTop, newScrollTop);

    /** @const {!TransitionDef<number>} */
    const interpolate = numeric(curScrollTop, newScrollTop);
    return Animation.animate(
      parent,
      (position) => {
        this.setElementScrollTop_(parent, interpolate(position));
      },
      duration,
      curve
    ).thenAlways(() => {
      this.setElementScrollTop_(parent, newScrollTop);
    });
  }

  /**
   * @param {!Element} element
   * @return {!Promise<!Element>}
   */
  getScrollingContainerFor_(element) {
    return this.vsync_.measurePromise(
      () =>
        closestAncestorElementBySelector(element, '.i-amphtml-scrollable') ||
        this.binding_.getScrollingElement()
    );
  }

  /**
   * @param {!Element} element
   * @param {number} scrollTop
   */
  setElementScrollTop_(element, scrollTop) {
    if (this.isScrollingElement_(element)) {
      this.binding_.setScrollTop(scrollTop);
      return;
    }
    this.vsync_.mutate(() => {
      element./*OK*/ scrollTop = scrollTop;
    });
  }

  /**
   * @param {!Element} element
   * @return {!Promise<number>}
   */
  getElementScrollTop_(element) {
    if (this.isScrollingElement_(element)) {
      return tryResolve(() => this.getScrollTop());
    }
    return this.vsync_.measurePromise(() => element./*OK*/ scrollTop);
  }

  /**
   * @param {!Element} element
   * @return {boolean}
   */
  isScrollingElement_(element) {
    return element == this.binding_.getScrollingElement();
  }

  /** @override */
  getScrollingElement() {
    if (this.scrollingElement_) {
      return this.scrollingElement_;
    }
    return (this.scrollingElement_ = this.binding_.getScrollingElement());
  }

  /** @override */
  onChanged(handler) {
    return this.changeObservable_.add(handler);
  }

  /** @override */
  onScroll(handler) {
    return this.scrollObservable_.add(handler);
  }

  /** @override */
  onResize(handler) {
    return this.resizeObservable_.add(handler);
  }

  /** @override */
  enterLightboxMode(opt_requestingElement, opt_onComplete) {
    this.viewer_.sendMessage('requestFullOverlay', {}, /* cancelUnsent */ true);

    this.enterOverlayMode();
    if (this.fixedLayer_) {
      this.fixedLayer_.enterLightbox(opt_requestingElement, opt_onComplete);
    }

    if (opt_requestingElement) {
      this.maybeEnterFieLightboxMode(
        dev().assertElement(opt_requestingElement)
      );
    }

    return this.binding_.updateLightboxMode(true);
  }

  /** @override */
  leaveLightboxMode(opt_requestingElement) {
    this.viewer_.sendMessage('cancelFullOverlay', {}, /* cancelUnsent */ true);

    if (this.fixedLayer_) {
      this.fixedLayer_.leaveLightbox();
    }
    this.leaveOverlayMode();

    if (opt_requestingElement) {
      this.maybeLeaveFieLightboxMode(
        dev().assertElement(opt_requestingElement)
      );
    }

    return this.binding_.updateLightboxMode(false);
  }

  /**
   * @return {boolean}
   * @visibleForTesting
   */
  isLightboxExperimentOn() {
    return isExperimentOn(this.ampdoc.win, 'amp-lightbox-a4a-proto');
  }

  /**
   * Enters frame lightbox mode if under a Friendly Iframe Embed.
   * @param {!Element} requestingElement
   * @visibleForTesting
   */
  maybeEnterFieLightboxMode(requestingElement) {
    const fieOptional = this.getFriendlyIframeEmbed_(requestingElement);

    if (fieOptional) {
      devAssert(
        this.isLightboxExperimentOn(),
        'Lightbox mode for A4A is only available when ' +
          "'amp-lightbox-a4a-proto' experiment is on"
      );

      fieOptional.enterFullOverlayMode();
    }
  }

  /**
   * Leaves frame lightbox mode if under a Friendly Iframe Embed.
   * @param {!Element} requestingElement
   * @visibleForTesting
   */
  maybeLeaveFieLightboxMode(requestingElement) {
    const fieOptional = this.getFriendlyIframeEmbed_(requestingElement);

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
  getFriendlyIframeEmbed_(element) {
    const iframeOptional = getParentWindowFrameElement(
      element,
      this.ampdoc.win
    );

    return (
      iframeOptional &&
      getFriendlyIframeEmbedOptional(
        /** @type {!HTMLIFrameElement} */
        (dev().assertElement(iframeOptional))
      )
    );
  }

  /** @override */
  enterOverlayMode() {
    this.disableTouchZoom();
    this.disableScroll();
  }

  /** @override */
  leaveOverlayMode() {
    this.resetScroll();
    this.restoreOriginalTouchZoom();
  }

  /** @override */
  disableScroll() {
    const {win} = this.ampdoc;
    const {documentElement} = win.document;
    let requestedMarginRight;

    // Calculate the scrollbar width so we can set it as a right margin. This
    // is so that we do not cause content to shift when we disable scroll on
    // platforms that have a width-taking scrollbar.
    this.vsync_.measure(() => {
      const existingMargin = computedStyle(win, documentElement).marginRight;
      const scrollbarWidth = getVerticalScrollbarWidth(this.ampdoc.win);

      requestedMarginRight = parseInt(existingMargin, 10) + scrollbarWidth;
    });

    this.vsync_.mutate(() => {
      setStyle(documentElement, 'margin-right', requestedMarginRight, 'px');
      this.binding_.disableScroll();
    });
  }

  /** @override */
  resetScroll() {
    const {win} = this.ampdoc;
    const {documentElement} = win.document;

    this.vsync_.mutate(() => {
      setStyle(documentElement, 'margin-right', '');
      this.binding_.resetScroll();
    });
  }

  /** @override */
  resetTouchZoom() {
    const windowHeight = this.ampdoc.win./*OK*/ innerHeight;
    const documentHeight = this.globalDoc_.documentElement./*OK*/ clientHeight;
    if (windowHeight && documentHeight && windowHeight === documentHeight) {
      // This code only works when scrollbar overlay content and take no space,
      // which is fine on mobile. For non-mobile devices this code is
      // irrelevant.
      return;
    }
    if (this.disableTouchZoom()) {
      this.timer_.delay(() => {
        this.restoreOriginalTouchZoom();
      }, 50);
    }
  }

  /** @override */
  disableTouchZoom() {
    const viewportMeta = this.getViewportMeta_();
    if (!viewportMeta) {
      // This should never happen in a valid AMP document, thus shortcircuit.
      return false;
    }
    // Setting maximum-scale=1 and user-scalable=no zooms page back to normal
    // and prohibit further default zooming.
    const newValue = updateViewportMetaString(viewportMeta.content, {
      'maximum-scale': '1',
      'user-scalable': 'no',
    });
    return this.setViewportMetaString_(newValue);
  }

  /** @override */
  restoreOriginalTouchZoom() {
    if (this.originalViewportMetaString_ !== undefined) {
      return this.setViewportMetaString_(this.originalViewportMetaString_);
    }
    return false;
  }

  /** @override */
  updateFixedLayer() {
    if (!this.fixedLayer_) {
      return Promise.resolve();
    }
    return this.fixedLayer_.update();
  }

  /** @override */
  addToFixedLayer(element, opt_forceTransfer) {
    if (!this.fixedLayer_) {
      return Promise.resolve();
    }
    return this.fixedLayer_.addElement(element, opt_forceTransfer);
  }

  /** @override */
  removeFromFixedLayer(element) {
    if (!this.fixedLayer_) {
      return;
    }
    this.fixedLayer_.removeElement(element);
  }

  /** @override */
  createFixedLayer(constructor) {
    this.fixedLayer_ = new constructor(
      this.ampdoc,
      this.vsync_,
      this.binding_.getBorderTop(),
      this.paddingTop_,
      this.binding_.requiresFixedLayerTransfer()
    );
    this.ampdoc.whenReady().then(() => this.fixedLayer_.setup());
  }

  /**
   * Updates touch zoom meta data. Returns `true` if any actual
   * changes have been done.
   * @param {string} viewportMetaString
   * @return {boolean}
   */
  setViewportMetaString_(viewportMetaString) {
    const viewportMeta = this.getViewportMeta_();
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
  getViewportMeta_() {
    if (isIframed(this.ampdoc.win)) {
      // An embedded document does not control its viewport meta tag.
      return null;
    }
    if (this.viewportMeta_ === undefined) {
      this.viewportMeta_ = /** @type {?HTMLMetaElement} */ (
        this.globalDoc_.querySelector('meta[name=viewport]')
      );
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
  viewerSetScrollTop_(data) {
    const targetScrollTop = data['scrollTop'];
    this.setScrollTop(targetScrollTop);
  }

  /**
   * @param {!JsonObject} data
   * @private
   */
  updateOnViewportEvent_(data) {
    const paddingTop = data['paddingTop'];
    const duration = data['duration'] || 0;
    const curve = data['curve'];
    /** @const {boolean} */
    const transient = data['transient'];

    if (paddingTop == undefined || paddingTop == this.paddingTop_) {
      return;
    }

    this.lastPaddingTop_ = this.paddingTop_;
    this.paddingTop_ = paddingTop;

    if (this.fixedLayer_) {
      const animPromise = this.fixedLayer_.animateFixedElements(
        this.paddingTop_,
        this.lastPaddingTop_,
        duration,
        curve,
        transient
      );
      if (paddingTop < this.lastPaddingTop_) {
        this.binding_.hideViewerHeader(transient, this.lastPaddingTop_);
      } else {
        animPromise.then(() => {
          this.binding_.showViewerHeader(transient, paddingTop);
        });
      }
    }
  }

  /**
   * @param {!JsonObject} data
   * @private
   */
  disableScrollEventHandler_(data) {
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
  changed_(relayoutAll, velocity) {
    const size = this.getSize();
    const scrollTop = this.getScrollTop();
    const scrollLeft = this.getScrollLeft();
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
      velocity
    );
    this.changeObservable_.fire({
      relayoutAll,
      top: scrollTop,
      left: scrollLeft,
      width: size.width,
      height: size.height,
      velocity,
    });
  }

  /** @private */
  scroll_() {
    this.rect_ = null;
    this.scrollCount_++;
    this.scrollLeft_ = this.binding_.getScrollLeft();
    const newScrollTop = this.binding_.getScrollTop();
    if (newScrollTop < 0) {
      // iOS and some other browsers use negative values of scrollTop for
      // overscroll. Overscroll does not affect the viewport and thus should
      // be ignored here.
      return;
    }
    this.scrollTop_ = newScrollTop;
    if (!this.scrollTracking_) {
      this.scrollTracking_ = true;
      const now = Date.now();
      // Wait 2 frames and then request an animation frame.
      this.timer_.delay(() => {
        this.vsync_.measure(() => {
          this.throttledScroll_(now, newScrollTop);
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
  throttledScroll_(referenceTime, referenceTop) {
    this.scrollTop_ = this.binding_.getScrollTop();
    /**  @const {number} */
    const newScrollTop = this.scrollTop_;
    const now = Date.now();
    let velocity = 0;
    if (now != referenceTime) {
      velocity = (newScrollTop - referenceTop) / (now - referenceTime);
    }
    dev().fine(
      TAG_,
      'scroll: scrollTop=' + newScrollTop + '; velocity=' + velocity
    );
    if (Math.abs(velocity) < 0.03) {
      this.changed_(/* relayoutAll */ false, velocity);
      this.scrollTracking_ = false;
    } else {
      this.timer_.delay(
        () =>
          this.vsync_.measure(
            this.throttledScroll_.bind(this, now, newScrollTop)
          ),
        20
      );
    }
  }

  /**
   * Send scroll message via the viewer per animation frame
   * @private
   */
  sendScrollMessage_() {
    if (!this.scrollAnimationFrameThrottled_) {
      this.scrollAnimationFrameThrottled_ = true;
      this.vsync_.measure(() => {
        this.scrollAnimationFrameThrottled_ = false;
        this.viewer_.sendMessage(
          'scroll',
          {'scrollTop': this.getScrollTop()},
          /* cancelUnsent */ true
        );
      });
    }
  }

  /** @private */
  resize_() {
    this.rect_ = null;
    const oldSize = this.size_;
    this.size_ = null; // Need to recalc.
    const newSize = this.getSize();
    this.updateFixedLayer().then(() => {
      const widthChanged = !oldSize || oldSize.width != newSize.width;
      this.changed_(/*relayoutAll*/ widthChanged, 0);
      const sizeChanged = widthChanged || oldSize.height != newSize.height;
      if (sizeChanged) {
        this.resizeObservable_.fire({
          relayoutAll: widthChanged,
          width: newSize.width,
          height: newSize.height,
        });
      }
    });
  }
}

/**
 * Parses viewport meta value. It usually looks like:
 * ```
 * width=device-width,initial-scale=1,minimum-scale=1
 * ```
 * @param {string} content
 * @return {!{[key: string]: (string|undefined)}}
 * @private Visible for testing only.
 */
export function parseViewportMeta(content) {
  // Ex: width=device-width,initial-scale=1,minimal-ui
  const params = Object.create(null);
  if (!content) {
    return params;
  }
  const pairs = content.split(/,|;/);
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    const split = pair.split('=');
    const name = split[0].trim();
    let value = split[1];
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
 * @param {!{[key: string]: string}} params
 * @return {string}
 * @private Visible for testing only.
 */
export function stringifyViewportMeta(params) {
  // Ex: width=device-width,initial-scale=1,minimal-ui
  let content = '';
  for (const k in params) {
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
 * @param {!{[key: string]: string|undefined}} updateParams
 * @return {string}
 * @private Visible for testing only.
 */
export function updateViewportMetaString(currentValue, updateParams) {
  const params = parseViewportMeta(currentValue);
  let changed = false;
  for (const k in updateParams) {
    if (params[k] !== updateParams[k]) {
      changed = true;
      if (updateParams[k] !== undefined) {
        params[k] = /** @type {string} */ (updateParams[k]);
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
function getDefaultScrollAnimationDuration(scrollTopA, scrollTopB, max = 500) {
  // 65% of scroll Δ to ms, eg 1000px -> 650ms, integer between 0 and max
  return Math.floor(clamp(0.65 * Math.abs(scrollTopA - scrollTopB), 0, max));
}

/**
 * @param {!../ampdoc-impl.AmpDoc} ampdoc
 * @return {!ViewportImpl}
 * @private
 */
function createViewport(ampdoc) {
  const viewer = Services.viewerForDoc(ampdoc);
  const {win} = ampdoc;
  let binding;
  if (
    ampdoc.isSingleDoc() &&
    getViewportType(win, viewer) == ViewportType_Enum.NATURAL_IOS_EMBED &&
    !IS_SXG
  ) {
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
const ViewportType_Enum = {
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
  NATURAL_IOS_EMBED: 'natural-ios-embed',
};

/**
 * @param {!Window} win
 * @param {!../viewer-interface.ViewerInterface} viewer
 * @return {string}
 */
function getViewportType(win, viewer) {
  const isIframedIos = Services.platformFor(win).isIos() && isIframed(win);

  // Enable iOS Embedded mode for iframed tests (e.g. integration tests).
  if (getMode(win).test && isIframedIos) {
    return ViewportType_Enum.NATURAL_IOS_EMBED;
  }

  // Override to ios-embed for iframe-viewer mode.
  if (
    isIframedIos &&
    viewer.isEmbedded() &&
    !viewer.hasCapability('iframeScroll')
  ) {
    return ViewportType_Enum.NATURAL_IOS_EMBED;
  }
  return ViewportType_Enum.NATURAL;
}

/**
 * @param {!../ampdoc-impl.AmpDoc} ampdoc
 */
export function installViewportServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(
    ampdoc,
    'viewport',
    createViewport,
    /* opt_instantiate */ true
  );
}
