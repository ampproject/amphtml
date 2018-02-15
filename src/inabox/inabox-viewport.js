/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {MessageType} from '../../src/3p-frame-messaging';
import {Observable} from '../observable';
import {Services} from '../services';
import {Viewport} from '../service/viewport/viewport-impl';
import {ViewportBindingDef} from '../service/viewport/viewport-binding-def';
import {dev} from '../log';
import {iframeMessagingClientFor} from './inabox-iframe-messaging-client';
import {
  layoutRectLtwh,
  moveLayoutRect,
} from '../layout-rect';
import {px, resetStyles, setImportantStyles} from '../../src/style';
import {registerServiceBuilderForDoc} from '../service';
import {throttle} from '../../src/utils/rate-limit';

/** @const {string} */
const TAG = 'inabox-viewport';

/** @const {number} */
const MIN_EVENT_INTERVAL = 100;

/** @visibleForTesting */
export function prepareBodyForOverlay(win, bodyElement) {
  return Services.vsyncFor(win).runPromise({
    measure: state => {
      state.width = win./*OK*/innerWidth;
      state.height = win./*OK*/innerHeight;
    },
    mutate: state => {
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
  }, {});
}


/** @visibleForTesting */
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

    const boxWidth = win./*OK*/innerWidth;
    const boxHeight = win./*OK*/innerHeight;

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

    /** @private @const {!../../3p/iframe-messaging-client.IframeMessagingClient} */
    this.iframeClient_ = iframeMessagingClientFor(win);

    /** @private {?Promise<!../layout-rect.LayoutRectDef>} */
    this.requestPositionPromise_ = null;

    /** @private {!../service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win);

    /** @private {function()} */
    this.fireScrollThrottle_ = throttle(this.win, () => {
      this.scrollObservable_.fire();
    }, MIN_EVENT_INTERVAL);

    dev().fine(TAG, 'initialized inabox viewport');
  }

  /** @override */
  connect() {
    this.listenForPosition_();
  }

  /** @private */
  listenForPosition_() {

    this.iframeClient_.makeRequest(
        MessageType.SEND_POSITIONS, MessageType.POSITION,
        data => this.updatePosition_(data));
  }

  /** @override */
  getLayoutRect(el) {
    const b = el./*OK*/getBoundingClientRect();
    return layoutRectLtwh(
        Math.round(b.left),
        Math.round(b.top),
        Math.round(b.width),
        Math.round(b.height));
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
    return this.viewportRect_.top - this.boxRect_.top;
  }

  /** @override */
  getScrollLeft() {
    return this.viewportRect_.left - this.boxRect_.left;
  }

  /** @override */
  getScrollingElement() {
    return this.getBodyElement();
  }

  /**
   * @param {?../layout-rect.LayoutRectDef|undefined} positionRect
   * @private
   */
  updatePosition_(positionRect) {
    dev().fine(TAG, 'Position changed: ', data);
    const oldViewport = this.viewportRect_;
    const oldBox = this.boxRect_;

    const viewportRect = data.viewportRect;
    let boxRect = data.targetRect;
    if (boxRect) {
      // positionRect is relative to the host's viewport, so we need to move it
      // into absolute position coordinates.
      boxRect = moveLayoutRect(positionRect, this.viewportRect_.left,
          this.viewportRect_.top);
    } else {
      boxRect = this.boxRect_;
    }

    this.viewportRect_ = viewportRect;
    this.boxRect_ = boxRect;

    if (isResized(boxRect, oldBox) || isResized(viewportRect, oldViewport)) {
      this.resizeObservable_.fire();
    }
    if (isMoved(boxRect, oldBox) || isMoved(viewportRect, oldViewport)) {
      this.fireScrollThrottle_();
    }
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
    if (!this.requestPositionPromise_) {
      this.requestPositionPromise_ = new Promise(resolve => {
        this.iframeClient_.requestOnce(
            MessageType.SEND_POSITIONS, MessageType.POSITION,
            data => {
              this.requestPositionPromise_ = null;
              dev().assert(data.targetRect, 'Host should send targetRect');
              resolve(data.targetRect);
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
    return this.prepareBodyForOverlay_()
        .then(() => this.requestFullOverlayFrame_());
  }

  /**
   * @return {!Promise}
   * @private
   */
  leaveOverlayMode_() {
    return this.requestCancelFullOverlayFrame_()
        .then(() => this.resetBodyForOverlay_());
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
      const unlisten = this.iframeClient_.makeRequest(
          MessageType.FULL_OVERLAY_FRAME,
          MessageType.FULL_OVERLAY_FRAME_RESPONSE,
          response => {
            unlisten();
            if (response.success) {
              this.updateBoxRect_(response.boxRect);
              resolve();
            } else {
              reject('Request to open lightbox rejected by host document');
            }
          });
    });
  }

  /**
   * @return {!Promise}
   * @private
   */
  requestCancelFullOverlayFrame_() {
    return new Promise(resolve => {
      const unlisten = this.iframeClient_.makeRequest(
          MessageType.CANCEL_FULL_OVERLAY_FRAME,
          MessageType.CANCEL_FULL_OVERLAY_FRAME_RESPONSE,
          response => {
            unlisten();
            this.updateBoxRect_(response.boxRect);
            resolve();
          });
    });
  }

  /** @visibleForTesting */
  getBodyElement() {
    return dev().assertElement(this.win.document.body);
  }

  /** @override */ disconnect() {/* no-op */}
  /** @override */ updatePaddingTop() {/* no-op */}
  /** @override */ hideViewerHeader() {/* no-op */}
  /** @override */ showViewerHeader() {/* no-op */}
  /** @override */ disableScroll() {/* no-op */}
  /** @override */ resetScroll() {/* no-op */}
  /** @override */ ensureReadyForElements() {/* no-op */}
  /** @override */ setScrollTop() {/* no-op */}
  /** @override */ getScrollWidth() {return 0;}
  /** @override */ getScrollHeight() {return 0;}
  /** @override */ getContentHeight() {return 0;}
  /** @override */ getBorderTop() {return 0;}
  /** @override */ requiresFixedLayerTransfer() {return false;}
}

/**
 * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installInaboxViewportService(ampdoc) {
  const binding = new ViewportBindingInabox(ampdoc.win);
  const viewer = Services.viewerForDoc(ampdoc);
  registerServiceBuilderForDoc(ampdoc,
      'viewport',
      function() {
        return new Viewport(ampdoc, binding, viewer);
      },
      /* opt_instantiate */ true);
}

/**
 * @param {!../layout-rect.LayoutRectDef} newRect
 * @param {!../layout-rect.LayoutRectDef} oldRect
 * @returns {boolean}
 */
function isMoved(newRect, oldRect) {
  return newRect.left != oldRect.left || newRect.top != oldRect.top;
}

/**
 * @param {!../layout-rect.LayoutRectDef} newRect
 * @param {!../layout-rect.LayoutRectDef} oldRect
 * @returns {boolean}
 */
function isResized(newRect, oldRect) {
  return newRect.width != oldRect.width || newRect.height != oldRect.height;
}
