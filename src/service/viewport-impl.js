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

import {Animation} from '../animation';
import {FixedLayer} from './fixed-layer';
import {Observable} from '../observable';
import {VisibilityState} from '../visibility-state';
import {checkAndFix as checkAndFixIosScrollfreezeBug} from
    './ios-scrollfreeze-bug';
import {
  getParentWindowFrameElement,
  registerServiceBuilderForDoc,
} from '../service';
import {layoutRectLtwh} from '../layout-rect';
import {dev} from '../log';
import {dict} from '../utils/object';
import {getFriendlyIframeEmbedOptional} from '../friendly-iframe-embed';
import {isExperimentOn} from '../experiments';
import {numeric} from '../transition';
import {onDocumentReady, whenDocumentReady} from '../document-ready';
import {platformFor} from '../services';
import {px, setStyle, setStyles, computedStyle} from '../style';
import {timerFor} from '../services';
import {vsyncFor} from '../services';
import {viewerForDoc} from '../services';
import {waitForBody, isIframed} from '../dom';
import {getMode} from '../mode';

const TAG_ = 'Viewport';


/** @const {string} */
const A4A_LIGHTBOX_EXPERIMENT = 'amp-lightbox-a4a-proto';


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
 * This object represents the viewport. It tracks scroll position, resize
 * and other events and notifies interesting parties when viewport has changed
 * and how.
 * @implements {../service.Disposable}
 */
export class Viewport {

  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {!ViewportBindingDef} binding
   * @param {!./viewer-impl.Viewer} viewer
   */
  constructor(ampdoc, binding, viewer) {
    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /**
     * Some viewport operations require the global document.
     * @private @const {!Document}
     */
    this.globalDoc_ = this.ampdoc.win.document;

    /** @const {!ViewportBindingDef} */
    this.binding_ = binding;

    /** @const {!./viewer-impl.Viewer} */
    this.viewer_ = viewer;

    /**
     * Used to cache the rect of the viewport.
     * @private {?../layout-rect.LayoutRectDef}
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

    /** @private {!./timer-impl.Timer} */
    this.timer_ = timerFor(this.ampdoc.win);

    /** @private {!./vsync-impl.Vsync} */
    this.vsync_ = vsyncFor(this.ampdoc.win);

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

    /** @private @const {!FixedLayer} */
    this.fixedLayer_ = new FixedLayer(
        this.ampdoc,
        this.vsync_,
        this.binding_.getBorderTop(),
        this.paddingTop_,
        this.binding_.requiresFixedLayerTransfer());
    this.ampdoc.whenReady().then(() => this.fixedLayer_.setup());

    /** @private @const (function()) */
    this.boundThrottledScroll_ = this.throttledScroll_.bind(this);

    this.viewer_.onMessage('viewport', this.updateOnViewportEvent_.bind(this));
    this.viewer_.onMessage('scroll', this.viewerSetScrollTop_.bind(this));
    this.binding_.updatePaddingTop(this.paddingTop_);

    this.binding_.onScroll(this.scroll_.bind(this));
    this.binding_.onResize(this.resize_.bind(this));

    this.onScroll(this.sendScrollMessage_.bind(this));

    /** @private {boolean} */
    this.visible_ = false;
    this.viewer_.onVisibilityChanged(this.updateVisibility_.bind(this));
    this.updateVisibility_();

    // Top-level mode classes.
    if (this.ampdoc.isSingleDoc()) {
      this.globalDoc_.documentElement.classList.add('i-amphtml-singledoc');
    }
    if (viewer.isEmbedded()) {
      this.globalDoc_.documentElement.classList.add('i-amphtml-embedded');
    } else {
      this.globalDoc_.documentElement.classList.add('i-amphtml-standalone');
    }
    if (isIframed(this.ampdoc.win)) {
      this.globalDoc_.documentElement.classList.add('i-amphtml-iframed');
    }
    if (viewer.getParam('webview') === '1') {
      this.globalDoc_.documentElement.classList.add('i-amphtml-webview');
    }

    // To avoid browser restore scroll position when traverse history
    if (isIframed(this.ampdoc.win) &&
        ('scrollRestoration' in this.ampdoc.win.history)) {
      this.ampdoc.win.history.scrollRestoration = 'manual';
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
   * Returns the rect of the viewport which includes scroll positions and size.
   * @return {!../layout-rect.LayoutRectDef}}
   */
  getRect() {
    if (this.rect_ == null) {
      const scrollTop = this.getScrollTop();
      const scrollLeft = this.getScrollLeft();
      const size = this.getSize();
      this.rect_ =
          layoutRectLtwh(scrollLeft, scrollTop, size.width, size.height);
    }
    return this.rect_;
  }

  /**
   * Returns the rect of the element within the document.
   * @param {!Element} el
   * @return {!../layout-rect.LayoutRectDef}}
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
   */
  scrollIntoView(element) {
    const elementTop = this.binding_.getLayoutRect(element).top;
    const newScrollTop = Math.max(0, elementTop - this.paddingTop_);
    this.binding_.setScrollTop(newScrollTop);
  }

  /**
   * Scrolls element into view much like Element. scrollIntoView does but
   * in the AMP/Viewer environment. Adds animation for the sccrollIntoView
   * transition.
   *
   * @param {!Element} element
   * @param {number=} duration
   * @param {string=} curve
   * @return {!Promise}
   */
  animateScrollIntoView(element, duration = 500, curve = 'ease-in') {
    const elementTop = this.binding_.getLayoutRect(element).top;
    const newScrollTop = Math.max(0, elementTop - this.paddingTop_);
    const curScrollTop = this.getScrollTop();
    if (newScrollTop == curScrollTop) {
      return Promise.resolve();
    }
    /** @const {!TransitionDef<number>} */
    const interpolate = numeric(curScrollTop, newScrollTop);
    // TODO(erwinm): the duration should not be a constant and should
    // be done in steps for better transition experience when things
    // are closer vs farther.
    return Animation.animate(this.ampdoc.getRootNode(), pos => {
      this.binding_.setScrollTop(interpolate(pos));
    }, duration, curve).then();
  }

  /**
   * Registers the handler for ViewportChangedEventDef events.
   * @param {!function(!ViewportChangedEventDef)} handler
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
   * @param {!function()} handler
   * @return {!UnlistenDef}
   */
  onScroll(handler) {
    return this.scrollObservable_.add(handler);
  }

  /**
   * Registers the handler for Resize events.
   * @param {!function()} handler
   * @return {!UnlistenDef}
   */
  onResize(handler) {
    return this.resizeObservable_.add(handler);
  }


  /**
   * Instruct the viewport to enter lightbox mode.
   * Requesting element is necessary to be able to enter lightbox mode under FIE
   * cases.
   * @param {!Element=} opt_requestingElement
   * @return {!Promise}
   */
  enterLightboxMode(opt_requestingElement) {
    this.viewer_.sendMessage(
        'requestFullOverlay', dict(), /* cancelUnsent */ true);

    this.enterOverlayMode();
    this.hideFixedLayer();

    if (opt_requestingElement) {
      this.maybeEnterFieLightboxMode(
          dev().assertElement(opt_requestingElement));
    }

    return this.binding_.updateLightboxMode(true);
  }

  /**
   * Instruct the viewport to leave lightbox mode.
   * Requesting element is necessary to be able to enter lightbox mode under FIE
   * cases.
   * @param {!Element=} opt_requestingElement
   * @return {!Promise}
   */
  leaveLightboxMode(opt_requestingElement) {
    this.viewer_.sendMessage(
        'cancelFullOverlay', dict(), /* cancelUnsent */ true);

    this.showFixedLayer();
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
    return isExperimentOn(this.ampdoc.win, A4A_LIGHTBOX_EXPERIMENT);
  }

  /**
   * Enters frame lightbox mode if under a Friendly Iframe Embed.
   * @param {!Element} requestingElement
   * @visibleForTesting
   */
  maybeEnterFieLightboxMode(requestingElement) {
    const fieOptional = this.getFriendlyIframeEmbed_(requestingElement);

    if (fieOptional) {
      dev().assert(this.isLightboxExperimentOn(),
          'Lightbox mode for A4A is only available when ' +
          `'${A4A_LIGHTBOX_EXPERIMENT}' experiment is on`);

      dev().assert(fieOptional).enterFullOverlayMode();
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
      dev().assert(fieOptional).leaveFullOverlayMode();
    }
  }

  /**
   * Get FriendlyIframeEmbed if available.
   * @param {!Element} element Element supposedly inside the FIE.
   * @return {?../friendly-iframe-embed.FriendlyIframeEmbed}
   * @private
   */
  getFriendlyIframeEmbed_(element) {
    const iframeOptional =
        getParentWindowFrameElement(element, this.ampdoc.win);

    return iframeOptional && getFriendlyIframeEmbedOptional(
        /** @type {!HTMLIFrameElement} */
        (dev().assertElement(iframeOptional)));
  }

  /*
   * Instruct the viewport to enter overlay mode.
   */
  enterOverlayMode() {
    this.disableTouchZoom();
    this.disableScroll();
  }

  /*
   * Instruct the viewport to leave overlay mode.
   */
  leaveOverlayMode() {
    this.resetScroll();
    this.restoreOriginalTouchZoom();
  }

  /*
   * Disable the scrolling by setting overflow: hidden.
   * Should only be used for temporarily disabling scroll.
   */
  disableScroll() {
    this.vsync_.mutate(() => {
      this.binding_.disableScroll();
    });
  }

  /*
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
   * Hides the fixed layer.
   */
  hideFixedLayer() {
    this.fixedLayer_.setVisible(false);
  }

  /**
   * Shows the fixed layer.
   */
  showFixedLayer() {
    this.fixedLayer_.setVisible(true);
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
   */
  removeFromFixedLayer(element) {
    this.fixedLayer_.removeElement(element);
  }

  /**
   * Updates touch zoom meta data. Returns `true` if any actual
   * changes have been done.
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
    if (this.paddingTop_ < this.lastPaddingTop_) {
      this.binding_.hideViewerHeader(transient, this.lastPaddingTop_);
      this.animateFixedElements_(duration, curve, transient);
    } else {
      this.animateFixedElements_(duration, curve, transient).then(() => {
        this.binding_.showViewerHeader(transient, this.paddingTop_);
      });
    }

  }

  /**
   * @param {number} duration
   * @param {string} curve
   * @param {boolean} transient
   * @return {!Promise}
   * @private
   */
  animateFixedElements_(duration, curve, transient) {
    this.fixedLayer_.updatePaddingTop(this.paddingTop_, transient);
    if (duration <= 0) {
      return Promise.resolve();
    }
    // Add transit effect on position fixed element
    const tr = numeric(this.lastPaddingTop_ - this.paddingTop_, 0);
    return Animation.animate(this.ampdoc.getRootNode(), time => {
      const p = tr(time);
      this.fixedLayer_.transformMutate(`translateY(${p}px)`);
    }, duration, curve).thenAlways(() => {
      this.fixedLayer_.transformMutate(null);
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
    this.size_ = null;  // Need to recalc.
    const newSize = this.getSize();
    this.fixedLayer_.update().then(() => {
      this.changed_(!oldSize || oldSize.width != newSize.width, 0);
      this.resizeObservable_.fire();
    });
  }
}


/**
 * ViewportBindingDef is an interface that defines an underlying technology
 * behind the {@link Viewport}.
 * @interface
 */
export class ViewportBindingDef {

  /**
   * Called before a first AMP element is added to resources. The final
   * preparations must be completed here. Called in the mutate context.
   */
  ensureReadyForElements() {}

  /**
   * Add listeners for global resources.
   */
  connect() {}

  /**
   * Remove listeners for global resources.
   */
  disconnect() {}

  /**
   * Returns the width of top border if this type of viewport needs border
   * offsetting. This is currently only needed for iOS to avoid scroll freeze.
   * @return {number}
   */
  getBorderTop() {}

  /**
   * Whether the binding requires fixed elements to be transfered to a
   * independent fixed layer.
   * @return {boolean}
   */
  requiresFixedLayerTransfer() {}

  /**
   * Register a callback for scroll events.
   * @param {function()} unusedCallback
   */
  onScroll(unusedCallback) {}

  /**
   * Register a callback for resize events.
   * @param {function()} unusedCallback
   */
  onResize(unusedCallback) {}

  /**
   * Updates binding with the new padding.
   * @param {number} unusedPaddingTop
   */
  updatePaddingTop(unusedPaddingTop) {}

  /**
   * Updates binding with the new padding when hiding viewer header.
   * @param {boolean} unusedTransient
   * @param {number} unusedLastPaddingTop
   */
  hideViewerHeader(unusedTransient, unusedLastPaddingTop) {}

  /**
   * Updates binding with the new padding when showing viewer header.
   * @param {boolean} unusedTransient
   * @param {number} unusedPaddingTop
   */
  showViewerHeader(unusedTransient, unusedPaddingTop) {}

  /*
   * Disable the scrolling by setting overflow: hidden.
   * Should only be used for temporarily disabling scroll.
   */
  disableScroll() {}

  /*
   * Reset the scrolling by removing overflow: hidden.
   */
  resetScroll() {}

  /**
   * Updates the viewport whether it's currently in the lightbox or a normal
   * mode.
   * @param {boolean} unusedLightboxMode
   * @return {!Promise}
   */
  updateLightboxMode(unusedLightboxMode) {}

  /**
   * Returns the size of the viewport.
   * @return {!{width: number, height: number}}
   */
  getSize() {}

  /**
   * Returns the top scroll position for the viewport.
   * @return {number}
   */
  getScrollTop() {}

  /**
   * Sets scroll top position to the specified value or the nearest possible.
   * @param {number} unusedScrollTop
   */
  setScrollTop(unusedScrollTop) {}

  /**
   * Returns the left scroll position for the viewport.
   * @return {number}
   */
  getScrollLeft() {}

  /**
   * Returns the scroll width of the content of the document.
   * @return {number}
   */
  getScrollWidth() {}

  /**
   * Returns the scroll height of the content of the document, including the
   * padding top for the viewer header.
   * The scrollHeight will be the viewport height if there's not enough content
   * to fill up the viewport.
   * @return {number}
   */
  getScrollHeight() {}

  /**
   * Returns the rect of the element within the document.
   * @param {!Element} unusedEl
   * @param {number=} unusedScrollLeft Optional arguments that the caller may
   *     pass in, if they cached these values and would like to avoid
   *     remeasure. Requires appropriate updating the values on scroll.
   * @param {number=} unusedScrollTop Same comment as above.
   * @return {!../layout-rect.LayoutRectDef}
   */
  getLayoutRect(unusedEl, unusedScrollLeft, unusedScrollTop) {}
}


/**
 * Implementation of ViewportBindingDef based on the native window. It assumes that
 * the native window is sized properly and events represent the actual
 * scroll/resize events. This mode is applicable to a standalone document
 * display or when an iframe has a fixed size.
 *
 * Visible for testing.
 *
 * @implements {ViewportBindingDef}
 */
export class ViewportBindingNatural_ {

  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {!./viewer-impl.Viewer} viewer
   */
  constructor(ampdoc, viewer) {
    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const {!Window} */
    this.win = ampdoc.win;

    /** @const {!../service/platform-impl.Platform} */
    this.platform_ = platformFor(this.win);

    /** @private @const {!./viewer-impl.Viewer} */
    this.viewer_ = viewer;

    /** @private @const {!Observable} */
    this.scrollObservable_ = new Observable();

    /** @private @const {!Observable} */
    this.resizeObservable_ = new Observable();

    /** @const {function()} */
    this.boundScrollEventListener_ = () => this.scrollObservable_.fire();

    /** @const {function()} */
    this.boundResizeEventListener_ = () => this.resizeObservable_.fire();

    dev().fine(TAG_, 'initialized natural viewport');
  }

  /** @override */
  connect() {
    this.win.addEventListener('scroll', this.boundScrollEventListener_);
    this.win.addEventListener('resize', this.boundResizeEventListener_);
  }

  /** @override */
  disconnect() {
    this.win.removeEventListener('scroll', this.boundScrollEventListener_);
    this.win.removeEventListener('resize', this.boundResizeEventListener_);
  }

  /** @override */
  ensureReadyForElements() {
    // Nothing.
  }

  /** @override */
  getBorderTop() {
    return 0;
  }

  /** @override */
  requiresFixedLayerTransfer() {
    return false;
  }

  /** @override */
  onScroll(callback) {
    this.scrollObservable_.add(callback);
  }

  /** @override */
  onResize(callback) {
    this.resizeObservable_.add(callback);
  }

  /** @override */
  updatePaddingTop(paddingTop) {
    setStyle(this.win.document.documentElement, 'paddingTop', px(paddingTop));
  }

  /** @override */
  hideViewerHeader(transient, unusedLastPaddingTop) {
    if (!transient) {
      this.updatePaddingTop(0);
    }
  }

  /** @override */
  showViewerHeader(transient, paddingTop) {
    if (!transient) {
      this.updatePaddingTop(paddingTop);
    }
  }

  /** @override */
  disableScroll() {
    this.win.document.documentElement.classList.add(
        'i-amphtml-scroll-disabled');
  }

  /** @override */
  resetScroll() {
    this.win.document.documentElement.classList.remove(
        'i-amphtml-scroll-disabled');
  }

  /** @override */
  updateLightboxMode(unusedLightboxMode) {
    // The layout is always accurate.
    return Promise.resolve();
  }

  /** @override */
  getSize() {
    // Prefer window innerWidth/innerHeight but fall back to
    // documentElement clientWidth/clientHeight.
    // documentElement./*OK*/clientHeight is buggy on iOS Safari
    // and thus cannot be used.
    const winWidth = this.win./*OK*/innerWidth;
    const winHeight = this.win./*OK*/innerHeight;
    if (winWidth && winHeight) {
      return {width: winWidth, height: winHeight};
    }
    const el = this.win.document.documentElement;
    return {width: el./*OK*/clientWidth, height: el./*OK*/clientHeight};
  }

  /** @override */
  getScrollTop() {
    const pageScrollTop = this.getScrollingElement_()./*OK*/scrollTop ||
        this.win./*OK*/pageYOffset;
    const host = this.ampdoc.getRootNode().host;
    return (host ? pageScrollTop - host./*OK*/offsetTop : pageScrollTop);
  }

  /** @override */
  getScrollLeft() {
    // The html is set to overflow-x: hidden so the document cannot be
    // scrolled horizontally. The scrollLeft will always be 0.
    return 0;
  }

  /** @override */
  getScrollWidth() {
    return this.getScrollingElement_()./*OK*/scrollWidth;
  }

  /** @override */
  getScrollHeight() {
    return this.getScrollingElement_()./*OK*/scrollHeight;
  }

  /** @override */
  getLayoutRect(el, opt_scrollLeft, opt_scrollTop) {
    const scrollTop = opt_scrollTop != undefined
        ? opt_scrollTop
        : this.getScrollTop();
    const scrollLeft = opt_scrollLeft != undefined
        ? opt_scrollLeft
        : this.getScrollLeft();
    const b = el./*OK*/getBoundingClientRect();
    return layoutRectLtwh(Math.round(b.left + scrollLeft),
        Math.round(b.top + scrollTop),
        Math.round(b.width),
        Math.round(b.height));
  }

  /** @override */
  setScrollTop(scrollTop) {
    this.getScrollingElement_()./*OK*/scrollTop = scrollTop;
  }

  /**
   * @return {!Element}
   * @private
   */
  getScrollingElement_() {
    const doc = this.win.document;
    if (doc./*OK*/scrollingElement) {
      return doc./*OK*/scrollingElement;
    }
    if (doc.body
        // Due to https://bugs.webkit.org/show_bug.cgi?id=106133, WebKit
        // browsers have to use `body` and NOT `documentElement` for
        // scrolling purposes. This has mostly being resolved via
        // `scrollingElement` property, but this branch is still necessary
        // for backward compatibility purposes.
        && this.platform_.isWebKit()) {
      return doc.body;
    }
    return doc.documentElement;
  }
}


/**
 * Implementation of ViewportBindingDef based on the native window in case when
 * the AMP document is embedded in a IFrame on iOS. It assumes that the native
 * window is sized properly and events represent the actual resize events.
 * The main difference from natural binding is that in this case, the document
 * itself is not scrollable, but instead only "body" is scrollable.
 *
 * Visible for testing.
 *
 * @implements {ViewportBindingDef}
 */
export class ViewportBindingNaturalIosEmbed_ {
  /**
   * @param {!Window} win
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(win, ampdoc) {
    /** @const {!Window} */
    this.win = win;

    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @private {?Element} */
    this.scrollPosEl_ = null;

    /** @private {?Element} */
    this.scrollMoveEl_ = null;

    /** @private {?Element} */
    this.endPosEl_ = null;

    /** @private {!{x: number, y: number}} */
    this.pos_ = {x: 0, y: 0};

    /** @private @const {!Observable} */
    this.scrollObservable_ = new Observable();

    /** @private @const {!Observable} */
    this.resizeObservable_ = new Observable();

    /** @private {number} */
    this.paddingTop_ = 0;

    // Mark as a legacy viewport.
    this.win.document.documentElement.classList.add(
        'i-amphtml-ios-embed-legacy');

    // Microtask is necessary here to let Safari to recalculate scrollWidth
    // post DocumentReady signal.
    whenDocumentReady(this.win.document).then(() => this.setup_());
    this.win.addEventListener('resize', () => this.resizeObservable_.fire());

    dev().fine(TAG_, 'initialized natural viewport for iOS embeds');
  }

  /** @override */
  ensureReadyForElements() {
    // Nothing.
  }

  /** @override */
  getBorderTop() {
    return 0;
  }

  /** @override */
  requiresFixedLayerTransfer() {
    return true;
  }

  /** @private */
  setup_() {
    const documentElement = this.win.document.documentElement;
    const documentBody = dev().assertElement(
        this.win.document.body);

    // Embedded scrolling on iOS is rather complicated. IFrames cannot be sized
    // and be scrollable. Sizing iframe by scrolling height has a big negative
    // that "fixed" position is essentially impossible. The only option we
    // found is to reset scrolling on the AMP doc, which overrides natural BODY
    // scrolling with overflow:auto. We need the following styling:
    // html {
    //   overflow: auto;
    //   -webkit-overflow-scrolling: touch;
    // }
    // body {
    //   position: absolute;
    //   overflow: auto;
    //   -webkit-overflow-scrolling: touch;
    // }
    setStyles(documentElement, {
      overflowY: 'auto',
      webkitOverflowScrolling: 'touch',
    });
    setStyles(documentBody, {
      overflowX: 'hidden',
      overflowY: 'auto',
      webkitOverflowScrolling: 'touch',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    });

    // Insert scrollPos element into DOM. See {@link onScrolled_} for why
    // this is needed.
    this.scrollPosEl_ = this.win.document.createElement('div');
    this.scrollPosEl_.id = 'i-amphtml-scrollpos';
    setStyles(this.scrollPosEl_, {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      visibility: 'hidden',
    });
    documentBody.appendChild(this.scrollPosEl_);

    // Insert scrollMove element into DOM. See {@link adjustScrollPos_} for why
    // this is needed.
    this.scrollMoveEl_ = this.win.document.createElement('div');
    this.scrollMoveEl_.id = 'i-amphtml-scrollmove';
    setStyles(this.scrollMoveEl_, {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      visibility: 'hidden',
    });
    documentBody.appendChild(this.scrollMoveEl_);

    // Insert endPos element into DOM. See {@link getScrollHeight} for why
    // this is needed.
    this.endPosEl_ = this.win.document.createElement('div');
    this.endPosEl_.id = 'i-amphtml-endpos';
    setStyles(this.endPosEl_, {
      width: 0,
      height: 0,
      visibility: 'hidden',
    });
    // TODO(dvoytenko): not only it should be at the bottom at setup time,
    // but it must always be at the bottom. Consider using BODY "childList"
    // mutations to track this. For now, however, this is ok since we don't
    // allow arbitrary content inserted into BODY.
    documentBody.appendChild(this.endPosEl_);

    documentBody.addEventListener('scroll', this.onScrolled_.bind(this));

    // Correct iOS Safari scroll freezing issues if applicable.
    checkAndFixIosScrollfreezeBug(this.ampdoc);
  }

  /** @override */
  connect() {
    // Do nothing: ViewportBindingNaturalIosEmbed_ can only be used in the
    // single-doc mode.
  }

  /** @override */
  disconnect() {
    // Do nothing: ViewportBindingNaturalIosEmbed_ can only be used in the
    // single-doc mode.
  }

  /** @override */
  hideViewerHeader(transient, lastPaddingTop) {
    if (transient) {
      // Add extra paddingTop to make the content stay at the same position
      // when the hiding header operation is transient
      onDocumentReady(this.win.document, doc => {
        const body = dev().assertElement(doc.body);
        const existingPaddingTop =
            computedStyle(this.win, body).paddingTop || '0';
        setStyles(body, {
          paddingTop: `calc(${existingPaddingTop} + ${lastPaddingTop}px)`,
          borderTop: '',
        });
      });
    } else {
      this.updatePaddingTop(0);
    }
  }

  /** @override */
  showViewerHeader(transient, paddingTop) {
    if (!transient) {
      this.updatePaddingTop(paddingTop);
    }
    // No need to adjust borderTop and paddingTop when the showing header
    // operation is transient
  }

  /** @override */
  disableScroll() {
    // This is not supported in ViewportBindingNaturalIosEmbed_
  }

  /** @override */
  resetScroll() {
    // This is not supported in ViewportBindingNaturalIosEmbed_
  }

  /** @override */
  updatePaddingTop(paddingTop) {
    onDocumentReady(this.win.document, doc => {
      this.paddingTop_ = paddingTop;
      setStyles(dev().assertElement(doc.body), {
        borderTop: `${paddingTop}px solid transparent`,
        paddingTop: '',
      });
    });
  }

  /** @override */
  updateLightboxMode(lightboxMode) {
    // This code will no longer be needed with the newer iOS viewport
    // implementation.
    return new Promise(resolve => {
      onDocumentReady(this.win.document, doc => {
        vsyncFor(this.win).mutatePromise(() => {
          setStyle(doc.body, 'borderTopStyle', lightboxMode ? 'none' : 'solid');
        }).then(resolve);
      });
    });
  }

  /** @override */
  onScroll(callback) {
    this.scrollObservable_.add(callback);
  }

  /** @override */
  onResize(callback) {
    this.resizeObservable_.add(callback);
  }

  /** @override */
  getSize() {
    return {
      width: this.win./*OK*/innerWidth,
      height: this.win./*OK*/innerHeight,
    };
  }

  /** @override */
  getScrollTop() {
    return Math.round(this.pos_.y);
  }

  /** @override */
  getScrollLeft() {
    // The html is set to overflow-x: hidden so the document cannot be
    // scrolled horizontally. The scrollLeft will always be 0.
    return 0;
  }

  /** @override */
  getScrollWidth() {
    // There's no good way to calculate scroll width on iOS in this mode.
    return this.win./*OK*/innerWidth;
  }

  /** @override */
  getScrollHeight() {
    // We have to use a special "tail" element on iOS due to the issues outlined
    // in the {@link onScrolled_} method. Because we are forced to layout BODY
    // with position:absolute, we can no longer use BODY's scrollHeight to
    // determine scrolling height - it will always return the viewport height.
    // Instead, we append the "tail" element as the last child of BODY and use
    // it's viewport-relative position to calculate scrolling height.
    if (!this.endPosEl_) {
      return 0;
    }
    return Math.round(this.endPosEl_./*OK*/getBoundingClientRect().top -
        this.scrollPosEl_./*OK*/getBoundingClientRect().top);
  }

  /** @override */
  getLayoutRect(el) {
    const b = el./*OK*/getBoundingClientRect();
    return layoutRectLtwh(Math.round(b.left + this.pos_.x),
        Math.round(b.top + this.pos_.y),
        Math.round(b.width),
        Math.round(b.height));
  }

  /** @override */
  setScrollTop(scrollTop) {
    this.setScrollPos_(scrollTop || 1);
  }

  /**
   * @param {!Event} event
   * @private
   */
  onScrolled_(event) {
    // We have to use a special "positioning" element on iOS due to the
    // following bugs:
    // - https://code.google.com/p/chromium/issues/detail?id=2891
    // - https://code.google.com/p/chromium/issues/detail?id=157855
    // - https://bugs.webkit.org/show_bug.cgi?id=106133
    // - https://bugs.webkit.org/show_bug.cgi?id=149264
    // This is an iOS-specific issue in the context of AMP, but Chrome bugs
    // are listed for reference. In a nutshell, this is because WebKit (and
    // Chrome as well) redirect body's scrollTop to documentElement instead of
    // body. Since in this case we are actually using direct body scrolling,
    // body's scrollTop would always return wrong values.
    // This will all change with a complete migration when
    // document./*OK*/scrollingElement will point to document.documentElement.
    // This already works correctly in Chrome with "scroll-top-left-interop"
    // flag turned on "chrome://flags/#scroll-top-left-interop".
    if (!this.scrollPosEl_) {
      return;
    }
    this.adjustScrollPos_(event);
    const rect = this.scrollPosEl_./*OK*/getBoundingClientRect();
    if (this.pos_.x != -rect.left || this.pos_.y != -rect.top) {
      this.pos_.x = -rect.left;
      this.pos_.y = -rect.top + this.paddingTop_;
      this.scrollObservable_.fire();
    }
  }

  /** @private */
  setScrollPos_(scrollPos) {
    if (!this.scrollMoveEl_) {
      return;
    }
    setStyle(this.scrollMoveEl_, 'transform',
        `translateY(${scrollPos - this.paddingTop_}px)`);
    this.scrollMoveEl_./*OK*/scrollIntoView(true);
  }

  /**
   * @param {!Event=} opt_event
   * @private
   */
  adjustScrollPos_(opt_event) {
    if (!this.scrollPosEl_ || !this.scrollMoveEl_) {
      return;
    }
    // Scroll document into a safe position to avoid scroll freeze on iOS.
    // This means avoiding scrollTop to be minimum (0) or maximum value.
    // This is very sad but very necessary. See #330 for more details.
    // Unfortunately, the same is very expensive to do on the bottom, due to
    // costly scrollHeight.
    const scrollTop = -this.scrollPosEl_./*OK*/getBoundingClientRect().top +
        this.paddingTop_;
    if (scrollTop == 0) {
      this.setScrollPos_(1);
      if (opt_event) {
        opt_event.preventDefault();
      }
      return;
    }
  }
}


/**
 * Implementation of ViewportBindingDef based for iframed iOS case where iframes
 * are not scrollable. Scrolling accomplished here by inserting a scrollable
 * wrapper `<html id="i-amphtml-wrapper">` inside the `<html>` element and
 * reparenting the original `<body>` inside.
 *
 * @implements {ViewportBindingDef}
 * @visibleForTesting
 */
export class ViewportBindingIosEmbedWrapper_ {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;
    const topClasses = this.win.document.documentElement.className;
    this.win.document.documentElement.className = '';
    this.win.document.documentElement.classList.add('i-amphtml-ios-embed');

    /** @private @const {!Element} */
    this.wrapper_ = this.win.document.createElement('html');
    this.wrapper_.id = 'i-amphtml-wrapper';
    this.wrapper_.className = topClasses;

    /** @private @const {!Observable} */
    this.scrollObservable_ = new Observable();

    /** @private @const {!Observable} */
    this.resizeObservable_ = new Observable();

    /** @const {function()} */
    this.boundScrollEventListener_ = this.onScrolled_.bind(this);

    /** @const {function()} */
    this.boundResizeEventListener_ = () => this.resizeObservable_.fire();

    // Setup UI.
    /** @private {boolean} */
    this.setupDone_ = false;
    waitForBody(this.win.document, this.setup_.bind(this));

    // Set overscroll (`-webkit-overflow-scrolling: touch`) later to avoid
    // iOS rendering bugs. See #8798 for details.
    whenDocumentReady(this.win.document).then(() => {
      this.win.document.documentElement.classList.add(
          'i-amphtml-ios-overscroll');
    });

    dev().fine(TAG_, 'initialized ios-embed-wrapper viewport');
  }

  /** @override */
  ensureReadyForElements() {
    this.setup_();
  }

  /** @private */
  setup_() {
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
    const doc = this.win.document;
    const body = dev().assertElement(doc.body, 'body is not available');
    doc.documentElement.appendChild(this.wrapper_);
    this.wrapper_.appendChild(body);
    // Redefine `document.body`, otherwise it'd be `null`.
    Object.defineProperty(doc, 'body', {
      get: () => body,
    });

    // TODO(dvoytenko): test if checkAndFixIosScrollfreezeBug is required.

    // Make sure the scroll position is adjusted correctly.
    this.onScrolled_();
  }

  /** @override */
  connect() {
    this.win.addEventListener('resize', this.boundResizeEventListener_);
    this.wrapper_.addEventListener('scroll', this.boundScrollEventListener_);
  }

  /** @override */
  disconnect() {
    this.win.removeEventListener('resize', this.boundResizeEventListener_);
    this.wrapper_.removeEventListener('scroll', this.boundScrollEventListener_);
  }

  /** @override */
  getBorderTop() {
    // iOS needs an extra pixel to avoid scroll freezing.
    return 1;
  }

  /** @override */
  requiresFixedLayerTransfer() {
    return true;
  }

  /** @override */
  onScroll(callback) {
    this.scrollObservable_.add(callback);
  }

  /** @override */
  onResize(callback) {
    this.resizeObservable_.add(callback);
  }

  /** @override */
  updatePaddingTop(paddingTop) {
    setStyle(this.wrapper_, 'paddingTop', px(paddingTop));
  }

  /** @override */
  hideViewerHeader(transient, unusedLastPaddingTop) {
    if (!transient) {
      this.updatePaddingTop(0);
    }
  }

  /** @override */
  showViewerHeader(transient, paddingTop) {
    if (!transient) {
      this.updatePaddingTop(paddingTop);
    }
  }

  /** @override */
  disableScroll() {
    this.wrapper_.classList.add('i-amphtml-scroll-disabled');
  }

  /** @override */
  resetScroll() {
    this.wrapper_.classList.remove('i-amphtml-scroll-disabled');
  }

  /** @override */
  updateLightboxMode(unusedLightboxMode) {
    // The layout is always accurate.
    return Promise.resolve();
  }

  /** @override */
  getSize() {
    return {
      width: this.win./*OK*/innerWidth,
      height: this.win./*OK*/innerHeight,
    };
  }

  /** @override */
  getScrollTop() {
    return this.wrapper_./*OK*/scrollTop;
  }

  /** @override */
  getScrollLeft() {
    // The wrapper is set to overflow-x: hidden so the document cannot be
    // scrolled horizontally. The scrollLeft will always be 0.
    return 0;
  }

  /** @override */
  getScrollWidth() {
    return this.wrapper_./*OK*/scrollWidth;
  }

  /** @override */
  getScrollHeight() {
    return this.wrapper_./*OK*/scrollHeight;
  }

  /** @override */
  getLayoutRect(el, opt_scrollLeft, opt_scrollTop) {
    const scrollTop = opt_scrollTop != undefined
        ? opt_scrollTop
        : this.getScrollTop();
    const scrollLeft = opt_scrollLeft != undefined
        ? opt_scrollLeft
        : this.getScrollLeft();
    const b = el./*OK*/getBoundingClientRect();
    return layoutRectLtwh(Math.round(b.left + scrollLeft),
        Math.round(b.top + scrollTop),
        Math.round(b.width),
        Math.round(b.height));
  }

  /** @override */
  setScrollTop(scrollTop) {
    // If scroll top is 0, it's set to 1 to avoid scroll-freeze issue. See
    // `onScrolled_` for more details.
    this.wrapper_./*OK*/scrollTop = scrollTop || 1;
  }

  /**
   * @param {!Event=} opt_event
   * @private
   */
  onScrolled_(opt_event) {
    // Scroll document into a safe position to avoid scroll freeze on iOS.
    // This means avoiding scrollTop to be minimum (0) or maximum value.
    // This is very sad but very necessary. See #330 for more details.
    // Unfortunately, the same is very expensive to do on the bottom, due to
    // costly scrollHeight.
    if (this.wrapper_./*OK*/scrollTop == 0) {
      this.wrapper_./*OK*/scrollTop = 1;
      if (opt_event) {
        opt_event.preventDefault();
      }
    }
    if (opt_event) {
      this.scrollObservable_.fire();
    }
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
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {!Viewport}
 * @private
 */
function createViewport(ampdoc) {
  const viewer = viewerForDoc(ampdoc);
  let binding;
  if (ampdoc.isSingleDoc() &&
      getViewportType(ampdoc.win, viewer) == ViewportType.NATURAL_IOS_EMBED) {
    // The overriding of document.body fails in iOS7.
    // Also, iOS8 sometimes freezes scrolling.
    if (platformFor(ampdoc.win).getIosMajorVersion() > 8) {
      binding = new ViewportBindingIosEmbedWrapper_(ampdoc.win);
    } else {
      binding = new ViewportBindingNaturalIosEmbed_(ampdoc.win, ampdoc);
    }
  } else {
    binding = new ViewportBindingNatural_(ampdoc, viewer);
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
   * and {@link ViewportBindingNaturalIosEmbed_} for more details.
   */
  NATURAL_IOS_EMBED: 'natural-ios-embed',
};

/**
 * @param {!Window} win
 * @param {!./viewer-impl.Viewer} viewer
 * @return {string}
 */
function getViewportType(win, viewer) {
  const viewportType = viewer.getParam('viewportType') || ViewportType.NATURAL;
  if (!platformFor(win).isIos() || viewportType != ViewportType.NATURAL) {
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
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installViewportServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc,
      'viewport',
      createViewport,
      /* opt_instantiate */ true);
}
