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
import {checkAndFix as checkAndFixIosScrollfreezeBug,} from
    './ios-scrollfreeze-bug';
import {getService} from '../service';
import {layoutRectLtwh} from '../layout-rect';
import {dev} from '../log';
import {numeric} from '../transition';
import {onDocumentReady} from '../document-ready';
import {platform} from '../platform';
import {px, setStyle, setStyles} from '../style';
import {timer} from '../timer';
import {installVsyncService} from './vsync-impl';
import {installViewerService} from './viewer-impl';
import {waitForBody} from '../dom';


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
let ViewportChangedEventDef;


/**
 * This object represents the viewport. It tracks scroll position, resize
 * and other events and notifies interesting parties when viewport has changed
 * and how.
 * @package Visible for type.
 */
export class Viewport {

  /**
   * @param {!Window} win
   * @param {!ViewportBindingDef} binding
   * @param {!./viewer-impl.Viewer} viewer
   */
  constructor(win, binding, viewer) {
    /** @const {!Window} */
    this.win_ = win;

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

    /** @private {?number} */
    this.lastMeasureScrollTop_ = null;

    /** @private {boolean} */
    this.scrollAnimationFrameThrottled_ = false;

    /** @private {?number} */
    this./*OK*/scrollLeft_ = null;

    /** @private {number} */
    this.paddingTop_ = viewer.getPaddingTop();

    /** @private {number} */
    this.scrollMeasureTime_ = 0;

    /** @private {!./vsync-impl.Vsync} */
    this.vsync_ = installVsyncService(win);

    /** @private {boolean} */
    this.scrollTracking_ = false;

    /** @private {number} */
    this.scrollCount_ = 0;

    /** @private @const {!Observable<!ViewportChangedEventDef>} */
    this.changeObservable_ = new Observable();

    /** @private @const {!Observable} */
    this.scrollObservable_ = new Observable();

    /** @private {?HTMLMetaElement|undefined} */
    this.viewportMeta_ = undefined;

    /** @private {string|undefined} */
    this.originalViewportMetaString_ = undefined;

    /** @private @const {!FixedLayer} */
    this.fixedLayer_ = new FixedLayer(
        this.win_.document,
        this.vsync_,
        this.paddingTop_,
        this.binding_.requiresFixedLayerTransfer());
    onDocumentReady(this.win_.document, () => this.fixedLayer_.setup());

    /** @private @const (function()) */
    this.boundThrottledScroll_ = this.throttledScroll_.bind(this);

    this.viewer_.onViewportEvent(() => {
      this.binding_.updateViewerViewport(this.viewer_);
      const paddingTop = this.viewer_.getPaddingTop();
      if (paddingTop != this.paddingTop_) {
        this.paddingTop_ = paddingTop;
        this.binding_.updatePaddingTop(this.paddingTop_);
        this.fixedLayer_.updatePaddingTop(this.paddingTop_);
      }
    });
    this.binding_.updateViewerViewport(this.viewer_);
    this.binding_.updatePaddingTop(this.paddingTop_);

    this.binding_.onScroll(this.scroll_.bind(this));
    this.binding_.onResize(this.resize_.bind(this));

    this.onScroll(this.sendScrollMessage_.bind(this));
  }

  /** For testing. */
  cleanup_() {
    this.binding_.cleanup_();
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
    onDocumentReady(this.win_.document, () => {
      this.win_.document.body.style.borderBottom =
          `${paddingBottom}px solid transparent`;
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
    return this.size_ = this.binding_.getSize();
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
   * Returns the scroll height of the content of the document. Note that this
   * method is not cached since we there's no indication when it might change.
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
    return this.binding_.getLayoutRect(el,
        this.getScrollLeft(), this.getScrollTop());
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
    const interpolate = numeric(curScrollTop, newScrollTop);
    // TODO(erwinm): the duration should not be a constant and should
    // be done in steps for better transition experience when things
    // are closer vs farther.
    // TODO(dvoytenko, #3742): documentElement will be replaced by ampdoc.
    return Animation.animate(this.win_.document.documentElement, pos => {
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
   * Instruct the viewport to enter lightbox mode.
   */
  enterLightboxMode() {
    this.viewer_.requestFullOverlay();
    this.disableTouchZoom();
    this.hideFixedLayer();
    this.vsync_.mutate(() => this.binding_.updateLightboxMode(true));
  }

  /**
   * Instruct the viewport to enter lightbox mode.
   */
  leaveLightboxMode() {
    this.viewer_.cancelFullOverlay();
    this.showFixedLayer();
    this.restoreOriginalTouchZoom();
    this.vsync_.mutate(() => this.binding_.updateLightboxMode(false));
  }

  /**
   * Resets touch zoom to initial scale of 1.
   */
  resetTouchZoom() {
    const windowHeight = this.win_./*OK*/innerHeight;
    const documentHeight = this.win_.document
        .documentElement./*OK*/clientHeight;
    if (windowHeight && documentHeight && windowHeight === documentHeight) {
      // This code only works when scrollbar overlay content and take no space,
      // which is fine on mobile. For non-mobile devices this code is
      // irrelevant.
      return;
    }
    if (this.disableTouchZoom()) {
      timer.delay(() => {
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
  updatedFixedLayer() {
    this.fixedLayer_.update();
  }

  /**
   * Adds the element to the fixed layer.
   * @param {!Element} element
   */
  addToFixedLayer(element) {
    this.fixedLayer_.addElement(element);
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
      dev.fine(TAG_, 'changed viewport meta to:', viewportMetaString);
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
    if (this.viewer_.isIframed()) {
      // An embedded document does not control its viewport meta tag.
      return null;
    }
    if (this.viewportMeta_ === undefined) {
      this.viewportMeta_ = this.win_.document.querySelector(
          'meta[name=viewport]');
      if (this.viewportMeta_) {
        this.originalViewportMetaString_ = this.viewportMeta_.content;
      }
    }
    return this.viewportMeta_;
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
    dev.fine(TAG_, 'changed event:',
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
      const now = timer.now();
      // Wait 2 frames and then request an animation frame.
      timer.delay(() => {
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
    const newScrollTop = this.scrollTop_ = this.binding_.getScrollTop();
    const now = timer.now();
    let velocity = 0;
    if (now != referenceTime) {
      velocity = (newScrollTop - referenceTop) /
          (now - referenceTime);
    }
    dev.fine(TAG_, 'scroll: ' +
        'scrollTop=' + newScrollTop + '; ' +
        'velocity=' + velocity);
    if (Math.abs(velocity) < 0.03) {
      this.changed_(/* relayoutAll */ false, velocity);
      this.scrollTracking_ = false;
    } else {
      timer.delay(() => this.vsync_.measure(
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
        this.viewer_.postScroll(this.getScrollTop());
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
    });
  }
}


/**
 * ViewportBindingDef is an interface that defines an underlying technology
 * behind the {@link Viewport}.
 * @interface
 * @visibleForTesting
 */
export class ViewportBindingDef {

  /**
   * Whether the binding requires fixed elements to be transfered to a
   * independent fixed layer.
   * @return {boolean}
   */
  requiresFixedLayerTransfer() {
    return false;
  }

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
   * Updates binding with the new viewer's viewport info.
   * @param {!./viewer-impl.Viewer} unusedViewer
   */
  updateViewerViewport(unusedViewer) {}

  /**
   * Updates binding with the new padding.
   * @param {number} unusedPaddingTop
   */
  updatePaddingTop(unusedPaddingTop) {}

  /**
   * Updates the viewport whether it's currently in the lightbox or a normal
   * mode.
   * @param {boolean} unusedLightboxMode
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
   * Returns the scroll height of the content of the document.
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

  /** For testing. */
  cleanup_() {}
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
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;

    /** @private @const {!Observable} */
    this.scrollObservable_ = new Observable();

    /** @private @const {!Observable} */
    this.resizeObservable_ = new Observable();

    this.win.addEventListener('scroll', () => this.scrollObservable_.fire());
    this.win.addEventListener('resize', () => this.resizeObservable_.fire());

    // Override a user-supplied `body{overflow}` to be always visible. This
    // style is set in runtime vs css to avoid conflicts with ios-embedded
    // mode and fixed transfer layer.
    if (this.win.document.defaultView) {
      waitForBody(this.win.document, () => {
        this.win.document.body.style.overflow = 'visible';
      });
    }

    dev.fine(TAG_, 'initialized natural viewport');
  }

  /** @override */
  cleanup_() {
    // TODO(dvoytenko): remove listeners
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
  updateViewerViewport(unusedViewer) {
    // Viewer's viewport is ignored since this window is fully accurate.
  }

  /** @override */
  updatePaddingTop(paddingTop) {
    this.win.document.documentElement.style.paddingTop = px(paddingTop);
  }

  /** @override */
  updateLightboxMode(unusedLightboxMode) {
    // The layout is always accurate.
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
    return this.getScrollingElement_()./*OK*/scrollTop ||
        this.win./*OK*/pageYOffset;
  }

  /** @override */
  getScrollLeft() {
    return this.getScrollingElement_()./*OK*/scrollLeft ||
        this.win./*OK*/pageXOffset;
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
        && platform.isWebKit()) {
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
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;

    /** @private {?Element} */
    this.scrollPosEl_ = null;

    /** @private {?Element} */
    this.scrollMoveEl_ = null;

    /** @private {!{x: number, y: number}} */
    this.pos_ = {x: 0, y: 0};

    /** @private @const {!Observable} */
    this.scrollObservable_ = new Observable();

    /** @private @const {!Observable} */
    this.resizeObservable_ = new Observable();

    /** @private {number} */
    this.paddingTop_ = 0;

    onDocumentReady(this.win.document, () => {
      // Microtask is necessary here to let Safari to recalculate scrollWidth
      // post DocumentReady signal.
      timer.delay(() => {
        this.setup_();
      }, 0);
    });
    this.win.addEventListener('resize', () => this.resizeObservable_.fire());

    dev.fine(TAG_, 'initialized natural viewport for iOS embeds');
  }

  /** @override */
  requiresFixedLayerTransfer() {
    return true;
  }

  /** @private */
  setup_() {
    const documentElement = this.win.document.documentElement;
    const documentBody = this.win.document.body;

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
    this.scrollPosEl_.id = '-amp-scrollpos';
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
    this.scrollMoveEl_.id = '-amp-scrollmove';
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
    this.endPosEl_.id = '-amp-endpos';
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
    checkAndFixIosScrollfreezeBug(this.win);
  }

  /** @override */
  updateViewerViewport(unusedViewer) {
    // Viewer's viewport is ignored since this window is fully accurate.
  }

  /** @override */
  updatePaddingTop(paddingTop) {
    onDocumentReady(this.win.document, () => {
      this.paddingTop_ = paddingTop;
      // Also tried `paddingTop` but it didn't work for `position:absolute`
      // on iOS.
      this.win.document.body.style.borderTop =
          `${paddingTop}px solid transparent`;
    });
  }

  /** @override */
  updateLightboxMode(lightboxMode) {
    // This code will no longer be needed with the newer iOS viewport
    // implementation.
    onDocumentReady(this.win.document, () => {
      this.win.document.body.style.borderStyle =
          lightboxMode ? 'none' : 'solid';
    });
  }

  /** @override */
  cleanup_() {
    // TODO(dvoytenko): remove listeners
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
    return Math.round(this.pos_.x);
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
    const scrollTop = -this.scrollPosEl_./*OK*/getBoundingClientRect().top +
        this.paddingTop_;
    if (scrollTop == 0) {
      this.setScrollPos_(1);
      if (opt_event) {
        opt_event.preventDefault();
      }
      return;
    }

    // TODO(dvoytenko, #330): Ideally we would do the same for the overscroll
    // on the bottom. Unfortunately, iOS Safari misreports scrollHeight in
    // this case.
  }
}


/**
 * Parses viewport meta value. It usually looks like:
 * ```
 * width=device-width,initial-scale=1,minimum-scale=1
 * ```
 * @param {string} content
 * @return {!Object<string, string>}
 * @private Visible for testing only.
 */
export function parseViewportMeta(content) {
  // Ex: width=device-width,initial-scale=1,minimal-ui
  const params = Object.create(null);
  if (!content) {
    return params;
  }
  const pairs = content.split(',');
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
        params[k] = updateParams[k];
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
 * @param {!Window} window
 * @return {!Viewport}
 * @private
 */
function createViewport_(window) {
  const viewer = installViewerService(window);
  let binding;
  if (viewer.getViewportType() == 'natural-ios-embed') {
    binding = new ViewportBindingNaturalIosEmbed_(window);
  } else {
    binding = new ViewportBindingNatural_(window);
  }
  return new Viewport(window, binding, viewer);
}


/**
 * @param {!Window} window
 * @return {!Viewport}
 */
export function installViewportService(window) {
  return getService(window, 'viewport', () => {
    return createViewport_(window);
  });
};
