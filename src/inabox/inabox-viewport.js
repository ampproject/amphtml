import {getFrameOverlayManager} from '#ads/inabox/frame-overlay-manager';
import {getPositionObserver} from '#ads/inabox/position-observer';

import {MessageType_Enum} from '#core/3p-frame-messaging';
import {devAssert, devAssertElement} from '#core/assert';
import {Observable} from '#core/data-structures/observable';
import {isIframed} from '#core/dom';
import {
  layoutRectFromDomRect,
  layoutRectLtwh,
  moveLayoutRect,
} from '#core/dom/layout/rect';
import {px, resetStyles, setImportantStyles} from '#core/dom/style';
import {throttle} from '#core/types/function';

import {Services} from '#service';
import {ViewportBindingDef} from '#service/viewport/viewport-binding-def';
import {ViewportInterface} from '#service/viewport/viewport-interface';

import {dev} from '#utils/log';

import {iframeMessagingClientFor} from './inabox-iframe-messaging-client';

import {canInspectWindow} from '../iframe-helper';
import {registerServiceBuilderForDoc} from '../service-helpers';

/** @const {string} */
const TAG = 'inabox-viewport';

/** @const {number} */
const MIN_EVENT_INTERVAL = 100;

/**
 * @param {!Window} win
 * @param {!Element} bodyElement
 * @return {!Promise}
 * @visibleForTesting
 */
export function prepareBodyForOverlay(win, bodyElement) {
  return Services.vsyncFor(win).runPromise(
    {
      measure: (state) => {
        state.width = win./*OK*/ innerWidth;
        state.height = win./*OK*/ innerHeight;
      },
      mutate: (state) => {
        // We need to override runtime-level !important rules
        setImportantStyles(bodyElement, {
          'background': 'transparent',
          'left': '50%',
          'top': '50%',
          'right': 'auto',
          'bottom': 'auto',
          'position': 'absolute',
          'height': px(state.height),
          'width': px(state.width),
          'margin-top': px(-state.height / 2),
          'margin-left': px(-state.width / 2),
        });
      },
    },
    {}
  );
}

/**
 * @param {!Window} win
 * @param {!Element} bodyElement
 * @return {!Promise}
 * @visibleForTesting
 */
export function resetBodyForOverlay(win, bodyElement) {
  return Services.vsyncFor(win).mutatePromise(() => {
    // We're not resetting background here as it's supposed to remain
    // transparent.
    resetStyles(bodyElement, [
      'position',
      'left',
      'top',
      'right',
      'bottom',
      'width',
      'height',
      'margin-left',
      'margin-top',
    ]);
  });
}

/**
 * This object represents the viewport. It tracks scroll position, resize
 * and other events and notifies interesting parties when viewport has changed
 * and how.
 * @implements {ViewportInterface}
 */
class InaboxViewportImpl {
  /**
   * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!ViewportBindingDef} binding
   */
  constructor(ampdoc, binding) {
    const {win} = ampdoc;

    /** @const {!../service/ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const {!ViewportBindingDef} */
    this.binding_ = binding;

    /**
     * Used to cache the rect of the viewport.
     * @private {?../layout-rect.LayoutRectDef}
     */
    this.rect_ = null;

    /** @private @const {!Observable<!../service/viewport/viewport-interface.ViewportChangedEventDef>} */
    this.changeObservable_ = new Observable();

    /** @private @const {!Observable} */
    this.scrollObservable_ = new Observable();

    /** @private @const {!Observable<!../service/viewport/viewport-interface.ViewportResizedEventDef>} */
    this.resizeObservable_ = new Observable();

    this.binding_.onScroll(this.scroll_.bind(this));
    this.binding_.onResize(this.resize_.bind(this));

    /** @private {boolean} */
    this.visible_ = false;
    this.ampdoc.onVisibilityChanged(this.updateVisibility_.bind(this));
    this.updateVisibility_();

    // Workaround for Safari not firing visibilityChange when the page is
    // unloaded (https://bugs.webkit.org/show_bug.cgi?id=151234).
    // TODO(zombifier): Remove this when ampdoc can handle this event.
    /** @private @const {function()} */
    this.boundDispose_ = this.dispose.bind(this);
    win.addEventListener('pagehide', this.boundDispose_);

    // Top-level mode classes.
    const docElement = win.document.documentElement;
    docElement.classList.add('i-amphtml-singledoc');
    docElement.classList.add('i-amphtml-standalone');
    if (isIframed(win)) {
      docElement.classList.add('i-amphtml-iframed');
    }
  }

  /** @override */
  dispose() {
    this.binding_.disconnect();
    this.ampdoc.win.removeEventListener('pagehide', this.boundDispose_);
  }

  /** @override */
  ensureReadyForElements() {}

  /** @override */
  getPaddingTop() {
    return 0;
  }

  /** @override */
  getScrollTop() {
    return this.binding_.getScrollTop();
  }

  /** @override */
  getScrollLeft() {
    return this.binding_.getScrollLeft();
  }

  /** @override */
  setScrollTop(unusedScrollPos) {}

  /** @override */
  updatePaddingBottom(unusedPaddingBottom) {}

  /** @override */
  getSize() {
    return this.binding_.getSize();
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
  contentHeightChanged() {}

  /** @override */
  getRect() {
    if (this.rect_ == null) {
      const size = this.getSize();
      this.rect_ = layoutRectLtwh(
        this.getScrollLeft(),
        this.getScrollTop(),
        size.width,
        size.height
      );
    }
    return this.rect_;
  }

  /** @override */
  getLayoutRect(el) {
    return this.binding_.getLayoutRect(el);
  }

  /**
   * @override
   * Note: This method does not taking intersection into account.
   * TODO(@zhouyx): We may need to return info on the intersectionRect.
   */
  getClientRectAsync(el) {
    const local = el./*OK*/ getBoundingClientRect();
    return this.binding_.getRootClientRectAsync().then((root) => {
      if (!root) {
        return layoutRectFromDomRect(local);
      }
      return moveLayoutRect(local, root.left, root.top);
    });
  }

  /** @override */
  supportsPositionFixed() {
    return false;
  }

  /** @override */
  isDeclaredFixed(unusedElement) {
    return false;
  }

  /** @override */
  scrollIntoView(unusedElement) {
    return Promise.resolve();
  }

  /** @override */
  animateScrollIntoView(unusedElement, unusedPos, opt_duration, opt_curve) {
    return Promise.resolve();
  }

  /** @override */
  animateScrollWithinParent(
    unusedElement,
    unusedParent,
    unusedPos,
    opt_duration,
    opt_curve
  ) {
    return Promise.resolve();
  }

  /** @override */
  getScrollingElement() {
    return this.binding_.getScrollingElement();
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
    this.enterOverlayMode();
    return this.binding_.updateLightboxMode(true);
  }

  /** @override */
  leaveLightboxMode(opt_requestingElement) {
    this.leaveOverlayMode();
    return this.binding_.updateLightboxMode(false);
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
  disableScroll() {}

  /** @override */
  resetScroll() {}

  /** @override */
  resetTouchZoom() {}

  /** @override */
  disableTouchZoom() {
    return false;
  }

  /** @override */
  restoreOriginalTouchZoom() {
    return false;
  }

  /** @override */
  updateFixedLayer() {
    return Promise.resolve();
  }

  /** @override */
  addToFixedLayer(unusedElement, opt_forceTransfer) {
    return Promise.resolve();
  }

  /** @override */
  removeFromFixedLayer(unusedElement) {}

  /** @override */
  createFixedLayer(unusedConstructor) {}

  /**
   * @private
   */
  changed_() {
    const size = this.getSize();
    const scrollTop = this.getScrollTop();
    const scrollLeft = this.getScrollLeft();
    this.changeObservable_.fire({
      relayoutAll: false,
      top: scrollTop,
      left: scrollLeft,
      width: size.width,
      height: size.height,
      velocity: 0,
    });
  }

  /** @private */
  scroll_() {
    this.rect_ = null;
    if (this.binding_.getScrollTop() < 0) {
      // iOS and some other browsers use negative values of scrollTop for
      // overscroll. Overscroll does not affect the viewport and thus should
      // be ignored here.
      return;
    }
    this.changed_();
    this.scrollObservable_.fire();
  }

  /** @private */
  resize_() {
    this.rect_ = null;
    const newSize = this.getSize();
    this.changed_();
    this.resizeObservable_.fire({
      relayoutAll: false,
      width: newSize.width,
      height: newSize.height,
    });
  }

  /** @private */
  updateVisibility_() {
    const visible = this.ampdoc.isVisible();
    if (visible != this.visible_) {
      this.visible_ = visible;
      if (visible) {
        this.binding_.connect();
        // Check the size again in case it has changed between `disconnect` and
        // `connect`.
        this.resize_();
      } else {
        this.binding_.disconnect();
      }
    }
  }
}

/**
 * Implementation of ViewportBindingDef that works inside an non-scrollable
 * iframe box by listening to host doc for position and resize updates.
 *
 * @visibleForTesting
 * @implements {ViewportBindingDef}
 */
export class ViewportBindingInabox {
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

    const boxWidth = win./*OK*/ innerWidth;
    const boxHeight = win./*OK*/ innerHeight;

    /**
     * The current viewport rect.
     * Before hearing from host doc, we're blind about the viewport position
     * and iframe position. 0 scroll is not a bad guess.
     * Meanwhile, use iframe box size as the viewport size gives a good
     * initial resource scheduling.
     * @private {!../layout-rect.LayoutRectDef}
     */
    this.viewportRect_ = layoutRectLtwh(0, 0, boxWidth, boxHeight);

    /**
     * The current layout rect of the iframe box.
     * TODO(lannka, #7971): The best way to stop visibility from firing
     * is to move this functionality to the InOb polyfill.
     * ~To not trigger amp-analytics visibility immediately,
     * we start with an initial position right below the fold.~
     * @private {!../layout-rect.LayoutRectDef}
     */
    this.boxRect_ = layoutRectLtwh(0, boxHeight + 1, boxWidth, boxHeight);

    /** @private @const {?../../3p/iframe-messaging-client.IframeMessagingClient} */
    this.iframeClient_ = iframeMessagingClientFor(win);

    /** @private {?Promise<!../layout-rect.LayoutRectDef>} */
    this.requestPositionPromise_ = null;

    /** @private {function()} */
    this.fireScrollThrottle_ = throttle(
      this.win,
      () => {
        this.scrollObservable_.fire();
      },
      MIN_EVENT_INTERVAL
    );

    /** @private @const {boolean} */
    this.isFriendlyIframed_ = canInspectWindow(this.win.top);

    /** @private {?../../ads/inabox/position-observer.PositionObserver} */
    this.topWindowPositionObserver_ = this.isFriendlyIframed_
      ? getPositionObserver(this.win.top)
      : null;

    /** @private {?../../ads/inabox/frame-overlay-manager.FrameOverlayManager} */
    this.topWindowFrameOverlayManager_ = this.isFriendlyIframed_
      ? getFrameOverlayManager(this.win.top)
      : null;

    /** @private {?UnlistenDef} */
    this.unobserveFunction_ = null;

    dev().fine(TAG, 'initialized inabox viewport');
  }

  /** @override */
  connect() {
    if (this.isFriendlyIframed_) {
      return this.listenForPositionSameDomain_();
    } else {
      return this.listenForPosition_();
    }
  }

  /** @private */
  listenForPosition_() {
    this.iframeClient_.makeRequest(
      MessageType_Enum.SEND_POSITIONS,
      MessageType_Enum.POSITION,
      (data) => {
        dev().fine(TAG, 'Position changed: ', data);
        this.updateLayoutRects_(data['viewportRect'], data['targetRect']);
      }
    );
    return Promise.resolve();
  }

  /** @private */
  listenForPositionSameDomain_() {
    // Set up listener but only after the resources service is properly
    // registered (since it's registered after the inabox services so it won't
    // be available immediately).
    // TODO(lannka): Investigate why this is the case.
    return Services.resourcesPromiseForDoc(
      this.win.document.documentElement
    ).then(() => {
      this.unobserveFunction_ =
        this.unobserveFunction_ ||
        this.topWindowPositionObserver_.observe(
          // If the window is the top window (not sitting in an iframe) then
          // frameElement doesn't exist. In that case we observe the scrolling
          // element.
          /** @type {!HTMLIFrameElement|!HTMLElement} */
          (this.win.frameElement || this.getScrollingElement()),
          (data) => {
            this.updateLayoutRects_(data['viewportRect'], data['targetRect']);
          }
        );
    });
  }

  /**
   * @private
   * @param {!../layout-rect.LayoutRectDef} viewportRect
   * @param {!../layout-rect.LayoutRectDef} targetRect
   */
  updateLayoutRects_(viewportRect, targetRect) {
    const oldViewportRect = this.viewportRect_;
    this.viewportRect_ = viewportRect;
    this.updateBoxRect_(targetRect);
    if (isResized(this.viewportRect_, oldViewportRect)) {
      this.resizeObservable_.fire();
    }
    if (isMoved(this.viewportRect_, oldViewportRect)) {
      this.fireScrollThrottle_();
    }
  }

  /** @override */
  getLayoutRect(el) {
    const b = el./*OK*/ getBoundingClientRect();
    const {left, top} = b;
    return layoutRectLtwh(
      Math.round(left + this.boxRect_.left),
      Math.round(top + this.boxRect_.top),
      Math.round(b.width),
      Math.round(b.height)
    );
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
      width: this.viewportRect_.width,
      height: this.viewportRect_.height,
    };
  }

  /** @override */
  getScrollTop() {
    return this.viewportRect_.top;
  }

  /** @override */
  getScrollLeft() {
    return this.viewportRect_.left;
  }

  /** @override */
  getScrollingElement() {
    return this.getBodyElement();
  }

  /** @override */
  getScrollingElementScrollsLikeViewport() {
    return true;
  }

  /** @override */
  supportsPositionFixed() {
    return false;
  }

  /**
   * @param {?../layout-rect.LayoutRectDef|undefined} positionRect
   * @private
   */
  updateBoxRect_(positionRect) {
    if (!positionRect) {
      return;
    }

    const boxRect = moveLayoutRect(
      positionRect,
      this.viewportRect_.left,
      this.viewportRect_.top
    );

    if (isChanged(boxRect, this.boxRect_)) {
      dev().fine(TAG, 'Updating viewport box rect: ', boxRect);

      this.boxRect_ = boxRect;
      // Remeasure all AMP elements once iframe position or size are changed.
      // Because all layout boxes are calculated relatively to the
      // iframe position.
      this.remeasureAllElements_();
      // TODO: fire DOM mutation event once we handle them
    }
  }

  /**
   * @return {!Array<!../service/resource.Resource>}
   * @visibleForTesting
   */
  getChildResources() {
    return Services.resourcesForDoc(this.win.document.documentElement).get();
  }

  /** @private */
  remeasureAllElements_() {
    this.getChildResources().forEach((resource) => resource.measure());
  }

  /** @override */
  updateLightboxMode(lightboxMode) {
    if (lightboxMode) {
      return this.tryToEnterOverlayMode_();
    }
    return this.leaveOverlayMode_();
  }

  /** @override */
  getRootClientRectAsync() {
    if (this.isFriendlyIframed_) {
      // Set up the listener if we haven't already.
      return this.listenForPositionSameDomain_().then(() =>
        this.topWindowPositionObserver_.getTargetRect(
          /** @type {!HTMLIFrameElement|!HTMLElement} */
          (this.win.frameElement || this.getScrollingElement())
        )
      );
    }
    if (!this.requestPositionPromise_) {
      this.requestPositionPromise_ = new Promise((resolve) => {
        this.iframeClient_.requestOnce(
          MessageType_Enum.SEND_POSITIONS,
          MessageType_Enum.POSITION,
          (data) => {
            this.requestPositionPromise_ = null;
            devAssert(data['targetRect'], 'Host should send targetRect');
            resolve(data['targetRect']);
          }
        );
      });
    }
    return this.requestPositionPromise_;
  }

  /**
   * @return {!Promise}
   * @private
   */
  tryToEnterOverlayMode_() {
    return this.prepareBodyForOverlay_().then(() =>
      this.requestFullOverlayFrame_()
    );
  }

  /**
   * @return {!Promise}
   * @private
   */
  leaveOverlayMode_() {
    return this.requestCancelFullOverlayFrame_().then(() =>
      this.resetBodyForOverlay_()
    );
  }

  /**
   * Prepares the "fixed" container before expanding frame.
   * @return {!Promise}
   * @private
   */
  prepareBodyForOverlay_() {
    return prepareBodyForOverlay(this.win, this.getBodyElement());
  }

  /**
   * Resets the "fixed" container to its original position after collapse.
   * @return {!Promise}
   * @private
   */
  resetBodyForOverlay_() {
    return resetBodyForOverlay(this.win, this.getBodyElement());
  }

  /**
   * @return {!Promise}
   * @private
   */
  requestFullOverlayFrame_() {
    return new Promise((resolve, reject) => {
      if (this.isFriendlyIframed_) {
        const iframe = /** @type {?HTMLIFrameElement}*/ (this.win.frameElement);
        if (iframe) {
          this.topWindowFrameOverlayManager_.expandFrame(iframe, (boxRect) => {
            this.updateBoxRect_(boxRect);
            resolve();
          });
        } else {
          reject('Request to open lightbox failed; frame does not exist.');
        }
      } else {
        this.iframeClient_.requestOnce(
          MessageType_Enum.FULL_OVERLAY_FRAME,
          MessageType_Enum.FULL_OVERLAY_FRAME_RESPONSE,
          (response) => {
            if (response['success']) {
              this.updateBoxRect_(response['boxRect']);
              resolve();
            } else {
              reject('Request to open lightbox rejected by host document');
            }
          }
        );
      }
    });
  }

  /**
   * @return {!Promise}
   * @private
   */
  requestCancelFullOverlayFrame_() {
    return new Promise((resolve, reject) => {
      if (this.isFriendlyIframed_) {
        const iframe = /** @type {?HTMLIFrameElement}*/ (this.win.frameElement);
        if (iframe) {
          this.topWindowFrameOverlayManager_.collapseFrame(
            iframe,
            (boxRect) => {
              this.updateBoxRect_(boxRect);
              resolve();
            }
          );
        } else {
          reject('Request to open lightbox failed; frame does not exist.');
        }
      } else {
        this.iframeClient_.requestOnce(
          MessageType_Enum.CANCEL_FULL_OVERLAY_FRAME,
          MessageType_Enum.CANCEL_FULL_OVERLAY_FRAME_RESPONSE,
          (response) => {
            this.updateBoxRect_(response['boxRect']);
            resolve();
          }
        );
      }
    });
  }

  /** @visibleForTesting */
  getBodyElement() {
    return devAssertElement(this.win.document.body);
  }

  /** @override */
  disconnect() {
    if (this.unobserveFunction_) {
      this.unobserveFunction_();
      this.unobserveFunction_ = null;
    }
  }

  /** @override */
  getScrollWidth() {
    // Get actual width of document body, regardless of iframe size.
    return this.getScrollingElement()./*OK*/ offsetWidth;
  }

  /** @override */
  getScrollHeight() {
    // Get actual height of document body, regardless of iframe size.
    return this.getScrollingElement()./*OK*/ offsetHeight;
  }

  /** @override */
  getContentHeight() {
    return this.getScrollHeight();
  }

  /** @override */ updatePaddingTop() {
    /* no-op */
  }
  /** @override */ hideViewerHeader() {
    /* no-op */
  }
  /** @override */ showViewerHeader() {
    /* no-op */
  }
  /** @override */ disableScroll() {
    /* no-op */
  }
  /** @override */ resetScroll() {
    /* no-op */
  }
  /** @override */ ensureReadyForElements() {
    /* no-op */
  }
  /** @override */ setScrollTop() {
    /* no-op */
  }
  /** @override */ contentHeightChanged() {}
  /** @override */ getBorderTop() {
    return 0;
  }
  /** @override */ requiresFixedLayerTransfer() {
    return false;
  }
  /** @override */ overrideGlobalScrollTo() {
    return false;
  }
}

/**
 * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installInaboxViewportService(ampdoc) {
  const binding = new ViewportBindingInabox(ampdoc.win);
  registerServiceBuilderForDoc(
    ampdoc,
    'viewport',
    function () {
      return new InaboxViewportImpl(ampdoc, binding);
    },
    /* opt_instantiate */ true
  );
}

/**
 * @param {!../layout-rect.LayoutRectDef} newRect
 * @param {!../layout-rect.LayoutRectDef} oldRect
 * @return {boolean}
 */
function isChanged(newRect, oldRect) {
  return isMoved(newRect, oldRect) || isResized(newRect, oldRect);
}

/**
 * @param {!../layout-rect.LayoutRectDef} newRect
 * @param {!../layout-rect.LayoutRectDef} oldRect
 * @return {boolean}
 */
function isMoved(newRect, oldRect) {
  return newRect.left != oldRect.left || newRect.top != oldRect.top;
}

/**
 * @param {!../layout-rect.LayoutRectDef} newRect
 * @param {!../layout-rect.LayoutRectDef} oldRect
 * @return {boolean}
 */
function isResized(newRect, oldRect) {
  return newRect.width != oldRect.width || newRect.height != oldRect.height;
}
