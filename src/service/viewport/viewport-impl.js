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

import {Animation} from '../../animation';
import {Deferred, tryResolve} from '../../utils/promise';
import {FixedLayer} from './../fixed-layer';
import {Observable} from '../../observable';
import {Services} from '../../services';
import {ViewportBindingDef} from './viewport-binding-def';
import {
  ViewportBindingIosEmbedShadowRoot_,
} from './viewport-binding-ios-embed-sd';
import {
  ViewportBindingIosEmbedWrapper_,
} from './viewport-binding-ios-embed-wrapper';
import {ViewportBindingNatural_} from './viewport-binding-natural';
import {VisibilityState} from '../../visibility-state';
import {clamp} from '../../utils/math';
import {closestAncestorElementBySelector, isIframed} from '../../dom';
import {dev, devAssert} from '../../log';
import {dict} from '../../utils/object';
import {getFriendlyIframeEmbedOptional} from '../../friendly-iframe-embed';
import {getMode} from '../../mode';
import {
  getParentWindowFrameElement,
  registerServiceBuilderForDoc,
} from '../../service';
import {installLayersServiceForDoc} from '../layers-impl';
import {isExperimentOn} from '../../experiments';
import {
  layoutRectFromDomRect,
  layoutRectLtwh,
  moveLayoutRect,
} from '../../layout-rect';
import {numeric} from '../../transition';
import {setStyle} from '../../style';


const TAG_ = 'Viewport';


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
export let ViewportChangedEventDef;

/**
 * @typedef {{
 *   relayoutAll: boolean,
 *   width: number,
 *   height: number
 * }}
 */
export let ViewportResizedEventDef;

/**
 * Params:
 *  - afterAnimation. Promise.
 *  - lastPaddingTop in px.
 *  - paddingTop in px.
 *
 * Returns the animation offset at beginning of animation. End will always be 0.
 * @typedef {function(!Promise, number, number):number}
 */
export let FixedElementMeasureFnDef;

/**
 * This object represents the viewport. It tracks scroll position, resize
 * and other events and notifies interesting parties when viewport has changed
 * and how.
 * @implements {../../service.Disposable}
 */
export class Viewport {

  /**
   * @param {!../ampdoc-impl.AmpDoc} ampdoc
   * @param {!ViewportBindingDef} binding
   * @param {!../viewer-impl.Viewer} viewer
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

    /** @const {!../viewer-impl.Viewer} */
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
    this./*OK*/scrollTop_ = null;

    /** @private {boolean} */
    this.scrollAnimationFrameThrottled_ = false;

    /** @private {?number} */
    this./*OK*/scrollLeft_ = null;

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

    /** @private {number} */
    this.scrollCount_ = 0;

    /** @private @const {!Observable<!ViewportChangedEventDef>} */
    this.changeObservable_ = new Observable();

    /** @private @const {!Observable} */
    this.scrollObservable_ = new Observable();

    /** @private @const {!Observable} */
    this.resizeObservable_ = new Observable();

    /** @private {?Element|undefined} */
    this.viewportMeta_ = undefined;

    /** @private {string|undefined} */
    this.originalViewportMetaString_ = undefined;

    /** @private {!Array<{element: !Element, measure: !FixedElementMeasureFnDef}>} */
    this.fixedMeasurers_ = [];

    /** @private @const {boolean} */
    this.useLayers_ = isExperimentOn(win, 'layers');
    if (this.useLayers_) {
      installLayersServiceForDoc(ampdoc,
          binding.getScrollingElement(),
          binding.getScrollingElementScrollsLikeViewport());
    }

    /** @private @const {!FixedLayer} */
    this.fixedLayer_ = new FixedLayer(
        ampdoc,
        this.vsync_,
        binding.getBorderTop(),
        this.paddingTop_,
        binding.requiresFixedLayerTransfer());
    ampdoc.whenReady().then(() => this.fixedLayer_.setup());

    viewer.onMessage('viewport', this.updateOnViewportEvent_.bind(this));
    viewer.onMessage('scroll', this.viewerSetScrollTop_.bind(this));
    viewer.onMessage(
        'disableScroll', this.disableScrollEventHandler_.bind(this));
    binding.updatePaddingTop(this.paddingTop_);

    binding.onScroll(this.scroll_.bind(this));
    binding.onResize(this.resize_.bind(this));

    this.onScroll(this.sendScrollMessage_.bind(this));

    /** @private {boolean} */
    this.visible_ = false;
    viewer.onVisibilityChanged(this.updateVisibility_.bind(this));
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
    if (isIframed(win) && ('scrollRestoration' in win.history)) {
      win.history.scrollRestoration = 'manual';
    }
  }

  /** @override */
  dispose() {
    this.binding_.disconnect();
  }

  /**
   * Called before a first AMP element is added to resources. Called in the
   * mutate context.
   */
  ensureReadyForElements() {
    this.binding_.ensureReadyForElements();
  }

  /** @private */
  updateVisibility_() {
    const visible = this.viewer_.isVisible();
    if (visible != this.visible_) {
      this.visible_ = visible;
      if (visible) {
        this.binding_.connect();
        if (this.size_) {
          // If the size has already been intialized, check it again in case
          // the size has changed between `disconnect` and `connect`.
          this.resize_();
        }
      } else {
        this.binding_.disconnect();
      }
    }
  }

  /**
   * Returns the top padding mandated by the viewer.
   * @return {number}
   */
  getPaddingTop() {
    return this.paddingTop_;
  }

  /**
   * Returns the viewport's top position in the document. This is essentially
   * the scroll position.
   * @return {number}
   * @deprecated Use {@link getScrollTop}
   */
  getTop() {
    return this.getScrollTop();
  }

  /**
   * Returns the viewport's vertical scroll position.
   * @return {number}
   */
  getScrollTop() {
    if (this./*OK*/scrollTop_ == null) {
      this./*OK*/scrollTop_ = this.binding_.getScrollTop();
    }
    return this./*OK*/scrollTop_;
  }

  /**
   * Returns the viewport's horizontal scroll position.
   * @return {number}
   */
  getScrollLeft() {
    if (this./*OK*/scrollLeft_ == null) {
      this./*OK*/scrollLeft_ = this.binding_.getScrollLeft();
    }
    return this./*OK*/scrollLeft_;
  }

  /**
   * Sets the desired scroll position on the viewport.
   * @param {number} scrollPos
   */
  setScrollTop(scrollPos) {
    this./*OK*/scrollTop_ = null;
    this.binding_.setScrollTop(scrollPos);
  }

  /**
   * Sets the body padding bottom to the specified value.
   * @param {number} paddingBottom
   */
  updatePaddingBottom(paddingBottom) {
    this.ampdoc.whenBodyAvailable().then(body => {
      setStyle(body, 'borderBottom', `${paddingBottom}px solid transparent`);
    });
  }

  /**
   * Returns the size of the viewport.
   * @return {!{width: number, height: number}}
   */
  getSize() {
    if (this.size_) {
      return this.size_;
    }
    this.size_ = this.binding_.getSize();
    if (this.size_.width == 0 || this.size_.height == 0) {
      // Only report when the visibility is "visible" or "prerender".
      const visibilityState = this.viewer_.getVisibilityState();
      if (visibilityState == VisibilityState.PRERENDER ||
          visibilityState == VisibilityState.VISIBLE) {
        if (Math.random() < 0.01) {
          dev().error(TAG_, 'viewport has zero dimensions');
        }
      }
    }
    return this.size_;
  }

  /**
   * Returns the height of the viewport.
   * @return {number}
   */
  getHeight() {
    return this.getSize().height;
  }

  /**
   * Returns the width of the viewport.
   * @return {number}
   */
  getWidth() {
    return this.getSize().width;
  }

  /**
   * Returns the scroll width of the content of the document. Note that this
   * method is not cached since we there's no indication when it might change.
   * @return {number}
   */
  getScrollWidth() {
    return this.binding_.getScrollWidth();
  }

  /**
   * Returns the scroll height of the content of the document, including the
   * padding top for the viewer header.
   * The scrollHeight will be the viewport height if there's not enough content
   * to fill up the viewport.
   * Note that this method is not cached since we there's no indication when
   * it might change.
   * @return {number}
   */
  getScrollHeight() {
    return this.binding_.getScrollHeight();
  }

  /**
   * Returns the height of the content of the document, including the
   * padding top for the viewer header.
   * contentHeight will match scrollHeight in all cases unless the viewport is
   * taller than the content.
   * Note that this method is not cached since we there's no indication when
   * it might change.
   * @return {number}
   */
  getContentHeight() {
    return this.binding_.getContentHeight();
  }

  /**
   * Resource manager signals to the viewport that content height is changed
   * and some action may need to be taken.
   * @restricted Use is restricted due to potentially very heavy performance
   *   impact. Can only be called when not actively scrolling.
   */
  contentHeightChanged() {
    this.binding_.contentHeightChanged();
  }

  /**
   * Returns the rect of the viewport which includes scroll positions and size.
   * @return {!../../layout-rect.LayoutRectDef}}
   */
  getRect() {
    if (this.rect_ == null) {
      let scrollTop = 0;
      let scrollLeft = 0;
      if (!this.useLayers_) {
        scrollTop = this.getScrollTop();
        scrollLeft = this.getScrollLeft();
      }
      const size = this.getSize();
      this.rect_ =
          layoutRectLtwh(scrollLeft, scrollTop, size.width, size.height);
    }
    return this.rect_;
  }

  /**
   * Returns the rect of the element within the document.
   * Note that this function should be called in vsync measure. Please consider
   * using `getLayoutRectAsync` instead.
   * @param {!Element} el
   * @return {!../../layout-rect.LayoutRectDef}
   */
  getLayoutRect(el) {
    const scrollLeft = this.getScrollLeft();
    const scrollTop = this.getScrollTop();

    // Go up the window hierarchy through friendly iframes.
    const frameElement = getParentWindowFrameElement(el, this.ampdoc.win);
    if (frameElement) {
      const b = this.binding_.getLayoutRect(el, 0, 0);
      const c = this.binding_.getLayoutRect(
          frameElement, scrollLeft, scrollTop);
      return layoutRectLtwh(Math.round(b.left + c.left),
          Math.round(b.top + c.top),
          Math.round(b.width),
          Math.round(b.height));
    }

    return this.binding_.getLayoutRect(el, scrollLeft, scrollTop);
  }

  /**
   * Returns the clientRect of the element.
   * Note: This method does not taking intersection into account.
   * TODO(@zhouyx): We may need to return info on the intersectionRect.
   * @param {!Element} el
   * @return {!Promise<!../../layout-rect.LayoutRectDef>}
   */
  getClientRectAsync(el) {
    if (this.useLayers_) {
      return this.vsync_.measurePromise(() => {
        return this.getLayoutRect(el);
      });
    }

    const local = this.vsync_.measurePromise(() => {
      return el./*OK*/getBoundingClientRect();
    });

    let root = this.binding_.getRootClientRectAsync();
    const frameElement = getParentWindowFrameElement(el, this.ampdoc.win);
    if (frameElement) {
      root = this.vsync_.measurePromise(() => {
        return frameElement./*OK*/getBoundingClientRect();
      });
    }

    return Promise.all([local, root]).then(values => {
      const l = values[0];
      const r = values[1];
      if (!r) {
        return layoutRectFromDomRect(l);
      }
      return moveLayoutRect(l, r.left, r.top);
    });
  }

  /**
   * Whether the binding supports fix-positioned elements.
   * @return {boolean}
   */
  supportsPositionFixed() {
    return this.binding_.supportsPositionFixed();
  }

  /**
   * Whether the element is declared as fixed in any of the user's stylesheets.
   * Will include any matches, not necessarily currently fixed elements.
   * @param {!Element} element
   * @return {boolean}
   */
  isDeclaredFixed(element) {
    return this.fixedLayer_.isDeclaredFixed(element);
  }

  /**
   * Scrolls element into view much like Element. scrollIntoView does but
   * in the AMP/Viewer environment.
   * @param {!Element} element
   * @return {!Promise}
   */
  scrollIntoView(element) {
    return this.getScrollingContainerFor_(element).then(parent =>
      this.scrollIntoViewInternal_(element, parent));
  }

  /**
   * @param {!Element} element
   * @param {!Element} parent
   */
  scrollIntoViewInternal_(element, parent) {
    const elementTop = this.binding_.getLayoutRect(element).top;

    const newScrollTopPromise = this.useLayers_ ?
      this.getElementScrollTop_(parent)
          .then(scrollTop => elementTop + scrollTop) :
      tryResolve(() => Math.max(0, elementTop - this.paddingTop_));

    newScrollTopPromise.then(newScrollTop =>
      this.setElementScrollTop_(parent, newScrollTop));
  }

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
  animateScrollIntoView(element, pos = 'top', opt_duration, opt_curve) {
    devAssert(!opt_curve || opt_duration !== undefined,
        'Curve without duration doesn\'t make sense.');

    return this.getScrollingContainerFor_(element).then(parent =>
      this.animateScrollWithinParent(
          element,
          parent,
          dev().assertString(pos),
          opt_duration,
          opt_curve));
  }

  /**
   * @param {!Element} element
   * @param {!Element} parent Should be scrollable.
   * @param {string} pos (takes one of 'top', 'bottom', 'center')
   * @param {number=} opt_duration
   * @param {string=} opt_curve
   * @return {!Promise}
   */
  animateScrollWithinParent(element, parent, pos, opt_duration, opt_curve) {
    devAssert(!opt_curve || opt_duration !== undefined,
        'Curve without duration doesn\'t make sense.');

    const elementRect = this.binding_.getLayoutRect(element);

    const {height: parentHeight} = this.isScrollingElement_(parent) ?
      this.getSize() :
      this.getLayoutRect(parent);

    let offset = 0;
    if (pos == 'bottom') {
      offset = -parentHeight + elementRect.height;
    }
    if (pos == 'center') {
      offset = (-parentHeight / 2) + (elementRect.height / 2);
    }

    return this.getElementScrollTop_(parent).then(curScrollTop => {
      let newScrollTop;
      if (this.useLayers_) {
        newScrollTop = elementRect.top + offset + curScrollTop;
      } else {
        newScrollTop = elementRect.top - this.paddingTop_ + offset;
      }
      newScrollTop = Math.max(0, newScrollTop);
      if (newScrollTop == curScrollTop) {
        return;
      }
      return this.interpolateScrollIntoView_(
          parent, curScrollTop, newScrollTop, opt_duration, opt_curve);
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
    parent, curScrollTop, newScrollTop, opt_duration, curve = 'ease-in') {

    const duration = opt_duration !== undefined ?
      dev().assertNumber(opt_duration) :
      getDefaultScrollAnimationDuration(curScrollTop, newScrollTop);

    /** @const {!TransitionDef<number>} */
    const interpolate = numeric(curScrollTop, newScrollTop);
    return Animation.animate(parent, position => {
      this.setElementScrollTop_(parent, interpolate(position));
    }, duration, curve).thenAlways(() => {
      this.setElementScrollTop_(parent, newScrollTop);
    });
  }

  /**
   * @param {!Element} element
   * @return {!Promise<!Element>}
   */
  getScrollingContainerFor_(element) {
    return this.vsync_.measurePromise(() =>
      closestAncestorElementBySelector(element, '.i-amphtml-scrollable') ||
        this.binding_.getScrollingElement());
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
      element./*OK*/scrollTop = scrollTop;
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
    return this.vsync_.measurePromise(() => element./*OK*/scrollTop);
  }

  /**
   * @param {!Element} element
   * @return {boolean}
   */
  isScrollingElement_(element) {
    return element == this.binding_.getScrollingElement();
  }

  /**
   * @return {!Element}
   */
  getScrollingElement() {
    return this.binding_.getScrollingElement();
  }


  /**
   * Registers the handler for ViewportChangedEventDef events.
   * @param {function(!ViewportChangedEventDef)} handler
   * @return {!UnlistenDef}
   */
  onChanged(handler) {
    return this.changeObservable_.add(handler);
  }

  /**
   * Registers the handler for scroll events. These events DO NOT contain
   * scrolling offset and it's discouraged to read scrolling offset in the
   * event handler. The primary use case for this handler is to inform that
   * scrolling might be going on. To get more information {@link onChanged}
   * handler should be used.
   * @param {function()} handler
   * @return {!UnlistenDef}
   */
  onScroll(handler) {
    return this.scrollObservable_.add(handler);
  }

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
  onResize(handler) {
    return this.resizeObservable_.add(handler);
  }

  /**
   * Instruct the viewport to enter lightbox mode.
   * @param {!Element=} opt_requestingElement Must be provided to be able to
   *     enter lightbox mode under FIE cases.
   * @param {!Promise=} opt_onComplete Optional promise that's resolved when
   *     the caller finishes opening the lightbox e.g. transition animations.
   * @return {!Promise}
   */
  enterLightboxMode(opt_requestingElement, opt_onComplete) {
    this.viewer_.sendMessage(
        'requestFullOverlay', dict(), /* cancelUnsent */ true);

    this.enterOverlayMode();
    this.fixedLayer_.enterLightbox(opt_requestingElement, opt_onComplete);

    if (opt_requestingElement) {
      this.maybeEnterFieLightboxMode(
          dev().assertElement(opt_requestingElement));
    }

    return this.binding_.updateLightboxMode(true);
  }

  /**
   * Instruct the viewport to leave lightbox mode.
   * @param {!Element=} opt_requestingElement Must be provided to be able to
   *     enter lightbox mode under FIE cases.
   * @return {!Promise}
   */
  leaveLightboxMode(opt_requestingElement) {
    this.viewer_.sendMessage(
        'cancelFullOverlay', dict(), /* cancelUnsent */ true);

    this.fixedLayer_.leaveLightbox();
    this.leaveOverlayMode();

    if (opt_requestingElement) {
      this.maybeLeaveFieLightboxMode(
          dev().assertElement(opt_requestingElement));
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
      devAssert(this.isLightboxExperimentOn(),
          'Lightbox mode for A4A is only available when ' +
          "'amp-lightbox-a4a-proto' experiment is on");

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
    const iframeOptional =
        getParentWindowFrameElement(element, this.ampdoc.win);

    return iframeOptional && getFriendlyIframeEmbedOptional(
        /** @type {!HTMLIFrameElement} */
        (dev().assertElement(iframeOptional)));
  }

  /**
   * Instruct the viewport to enter overlay mode.
   */
  enterOverlayMode() {
    this.disableTouchZoom();
    this.disableScroll();
  }

  /**
   * Instruct the viewport to leave overlay mode.
   */
  leaveOverlayMode() {
    this.resetScroll();
    this.restoreOriginalTouchZoom();
  }

  /**
   * Disable the scrolling by setting overflow: hidden.
   * Should only be used for temporarily disabling scroll.
   */
  disableScroll() {
    this.vsync_.mutate(() => {
      this.binding_.disableScroll();
    });
  }

  /**
   * Reset the scrolling by removing overflow: hidden.
   */
  resetScroll() {
    this.vsync_.mutate(() => {
      this.binding_.resetScroll();
    });
  }

  /**
   * Resets touch zoom to initial scale of 1.
   */
  resetTouchZoom() {
    const windowHeight = this.ampdoc.win./*OK*/innerHeight;
    const documentHeight = this.globalDoc_.documentElement./*OK*/clientHeight;
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

  /**
   * Disables touch zoom on this viewport. Returns `true` if any actual
   * changes have been done.
   * @return {boolean}
   */
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

  /**
   * Restores original touch zoom parameters. Returns `true` if any actual
   * changes have been done.
   * @return {boolean}
   */
  restoreOriginalTouchZoom() {
    if (this.originalViewportMetaString_ !== undefined) {
      return this.setViewportMetaString_(this.originalViewportMetaString_);
    }
    return false;
  }

  /**
   * Returns whether the user has scrolled yet.
   * @return {boolean}
   */
  hasScrolled() {
    return this.scrollCount_ > 0;
  }

  /**
   * Updates the fixed layer.
   */
  updateFixedLayer() {
    this.fixedLayer_.update();
  }

  /**
   * Adds the element to the fixed layer.
   * @param {!Element} element
   * @param {boolean=} opt_forceTransfer If set to true , then the element needs
   *    to be forcefully transferred to the fixed layer.
   * @return {!Promise}
   */
  addToFixedLayer(element, opt_forceTransfer) {
    return this.fixedLayer_.addElement(element, opt_forceTransfer);
  }

  /**
   * Removes the element from the fixed layer.
   * @param {!Element} element
   * @param {boolean=} opt_onlyTearDown Keep element in transfer layer
   * @param {boolean=} opt_keepOffset Keep offset applied per top-padding.
   */
  removeFromFixedLayer(element, opt_onlyTearDown, opt_keepOffset) {
    this.fixedLayer_.removeElement(element, opt_onlyTearDown, opt_keepOffset);
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
   * @return {?Element}
   * @private
   */
  getViewportMeta_() {
    if (isIframed(this.ampdoc.win)) {
      // An embedded document does not control its viewport meta tag.
      return null;
    }
    if (this.viewportMeta_ === undefined) {
      this.viewportMeta_ = /** @type {?HTMLMetaElement} */ (
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
   */
  viewerSetScrollTop_(data) {
    const targetScrollTop = data['scrollTop'];
    this.setScrollTop(targetScrollTop);
  }

  /**
   * @param {!JsonObject} data
   * @return {!Promise|undefined}
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

    const animPromise =
        this.updateFixedElementsOffset_(duration, curve, transient);

    if (paddingTop < this.lastPaddingTop_) {
      this.binding_.hideViewerHeader(transient, this.lastPaddingTop_);
      return;
    }

    return animPromise.then(() => {
      this.binding_.showViewerHeader(transient, paddingTop);
    });
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
   * Specifies a callback for measuring an element's fixed offset when the
   * viewport's padding top changes.
   *
   * `measure` runs in a measure phase and takes:
   *  - afterAnimation
   *    a promise that resolves after a running translation is finished.
   *  - lastPaddingTop in px.
   *  - paddingTop in px.
   *
   * And returns a vertical offset at start of animation. End will always be 0.
   *
   * This tears down the element from the fixed layer (but does NOT remove from
   * the transfer layer), so its offset needs to be managed independently
   * afterwards.
   *
   * @param {!Element} element
   * @param {!FixedElementMeasureFnDef} measure
   */
  setFixedElementMeasurer(element, measure) {
    this.removeFromFixedLayer(
        element, /* onlyTearDown */ true, /* keepOffset */ true);
    this.fixedMeasurers_.push({element, measure});
  }

  /**
   * @param {number} duration
   * @param {string} curve
   * @param {boolean} transient
   * @return {!Promise}
   * @private
   */
  updateFixedElementsOffset_(duration, curve, transient) {
    const {
      paddingTop_: paddingTop,
      lastPaddingTop_: lastPaddingTop,
    } = this;

    const isAnimated = duration > 0;

    let doneResolver;
    let animOffsetsPromise;

    if (this.fixedMeasurers_.length > 0) {
      let donePromise;
      if (isAnimated) {
        const doneDeferred = new Deferred();
        donePromise = doneDeferred.promise;
        doneResolver = doneDeferred.resolve;
      } else {
        donePromise = Promise.resolve();
      }
      animOffsetsPromise = this.vsync_.measurePromise(() => {
        return this.fixedMeasurers_.map(def =>
          def.measure(donePromise, lastPaddingTop, paddingTop));
      });
      animOffsetsPromise.then(() => {
        this.fixedLayer_.updatePaddingTop(paddingTop, transient);
      });
    } else {
      this.fixedLayer_.updatePaddingTop(paddingTop, transient);
    }

    if (!isAnimated) {
      return Promise.resolve();
    }

    const defaultAnimOffset = lastPaddingTop - paddingTop;

    if (animOffsetsPromise) {
      return animOffsetsPromise
          .then(animOffsets =>
            this.animateFixedElements_(
                duration, curve, defaultAnimOffset, animOffsets))
          .then(devAssert(doneResolver));
    }

    return this.animateFixedElements_(duration, curve, defaultAnimOffset);
  }

  /**
   * @param {number} duration
   * @param {string} curve
   * @param {number} defaultAnimOffset
   * @param {!Array<number>=} opt_animOffsets
   * @private
   */
  animateFixedElements_(duration, curve, defaultAnimOffset, opt_animOffsets) {
    const interpolations =
        opt_animOffsets
          ? opt_animOffsets.map(animOffset => numeric(animOffset, 0))
          : null;

    const defaultInterpolation = numeric(defaultAnimOffset, 0);

    return Animation.animate(this.ampdoc.getRootNode(), time => {
      this.fixedLayer_.transformMutate(
          `translateY(${defaultInterpolation(time)}px)`);

      // Translate independent elements that have their own animation offset
      // definition.
      if (interpolations) {
        interpolations.forEach((interpolation, i) => {
          setStyle(this.fixedMeasurers_[i].element, 'transform',
              `translateY(${interpolation(time)}px)`);
        });
      }
    }, duration, curve).thenAlways(() => {
      this.fixedLayer_.transformMutate(); // reset all transforms.
    });
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
    dev().fine(TAG_, 'changed event:',
        'relayoutAll=', relayoutAll,
        'top=', scrollTop,
        'left=', scrollLeft,
        'bottom=', (scrollTop + size.height),
        'velocity=', velocity);
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
      velocity = (newScrollTop - referenceTop) /
          (now - referenceTime);
    }
    dev().fine(TAG_, 'scroll: ' +
        'scrollTop=' + newScrollTop + '; ' +
        'velocity=' + velocity);
    if (Math.abs(velocity) < 0.03) {
      this.changed_(/* relayoutAll */ false, velocity);
      this.scrollTracking_ = false;
    } else {
      this.timer_.delay(() => this.vsync_.measure(
          this.throttledScroll_.bind(this, now, newScrollTop)), 20);
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
        this.viewer_.sendMessage('scroll',
            dict({'scrollTop': this.getScrollTop()}),
            /* cancelUnsent */true);
      });
    }
  }

  /** @private */
  resize_() {
    this.rect_ = null;
    const oldSize = this.size_;
    this.size_ = null; // Need to recalc.
    const newSize = this.getSize();
    this.fixedLayer_.update().then(() => {
      const widthChanged = !oldSize || oldSize.width != newSize.width;
      this.changed_(/*relayoutAll*/widthChanged, 0);
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
 * @return {!Object<string, (string|undefined)>}
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
 * @param {!Object<string, string>} params
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
 * @param {!Object<string, string|undefined>} updateParams
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
 * @return {!Viewport}
 * @private
 */
function createViewport(ampdoc) {
  const viewer = Services.viewerForDoc(ampdoc);
  const {win} = ampdoc;
  let binding;
  if (ampdoc.isSingleDoc() &&
      getViewportType(win, viewer) == ViewportType.NATURAL_IOS_EMBED) {
    if (isExperimentOn(win, 'ios-embed-sd') &&
        win.Element.prototype.attachShadow &&
        // Even though iOS 10 supports Shadow DOM, the support is buggy.
        Services.platformFor(win).getMajorVersion() >= 11) {
      binding = new ViewportBindingIosEmbedShadowRoot_(win);
    } else {
      binding = new ViewportBindingIosEmbedWrapper_(win);
    }
  } else {
    binding = new ViewportBindingNatural_(ampdoc);
  }
  return new Viewport(ampdoc, binding, viewer);
}

/**
 * The type of the viewport.
 * @enum {string}
 */
const ViewportType = {

  /**
   * Viewer leaves sizing and scrolling up to the AMP document's window.
   */
  NATURAL: 'natural',

  /**
   * This is AMP-specific type and doesn't come from viewer. This is the type
   * that AMP sets when Viewer has requested "natural" viewport on a iOS
   * device.
   * See:
   * https://github.com/ampproject/amphtml/blob/master/spec/amp-html-layout.md
   */
  NATURAL_IOS_EMBED: 'natural-ios-embed',
};

/**
 * @param {!Window} win
 * @param {!../viewer-impl.Viewer} viewer
 * @return {string}
 */
function getViewportType(win, viewer) {
  const viewportType = viewer.getParam('viewportType') || ViewportType.NATURAL;
  if (!Services.platformFor(win).isIos() ||
      viewportType != ViewportType.NATURAL) {
    return viewportType;
  }
  // Enable iOS Embedded mode so that it's easy to test against a more
  // realistic iOS environment w/o an iframe.
  if (!isIframed(win) && (getMode(win).localDev || getMode(win).development)) {
    return ViewportType.NATURAL_IOS_EMBED;
  }

  // Enable iOS Embedded mode for iframed tests (e.g. integration tests).
  if (isIframed(win) && getMode(win).test) {
    return ViewportType.NATURAL_IOS_EMBED;
  }

  // Override to ios-embed for iframe-viewer mode.
  if (isIframed(win) && viewer.isEmbedded()) {
    return ViewportType.NATURAL_IOS_EMBED;
  }
  return viewportType;
}

/**
 * @param {!../ampdoc-impl.AmpDoc} ampdoc
 */
export function installViewportServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc,
      'viewport',
      createViewport,
      /* opt_instantiate */ true);
}
