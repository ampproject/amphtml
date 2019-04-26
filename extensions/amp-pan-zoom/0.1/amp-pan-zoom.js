/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {ActionTrust} from '../../../src/action-constants';
import {Animation} from '../../../src/animation';
import {CSS} from '../../../build/amp-pan-zoom-0.1.css';
import {
  DoubletapRecognizer,
  PinchRecognizer,
  SwipeXYRecognizer,
  TapRecognizer,
} from '../../../src/gesture-recognizers';
import {Gestures} from '../../../src/gesture';
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {bezierCurve} from '../../../src/curve';
import {clamp} from '../../../src/utils/math';
import {continueMotion} from '../../../src/motion';
import {createCustomEvent, listen} from '../../../src/event-helper';
import {dev, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {
  layoutRectFromDomRect,
  layoutRectLtwh,
} from '../../../src/layout-rect';
import {numeric} from '../../../src/transition';
import {px, scale, setStyles, translate} from '../../../src/style';

const PAN_ZOOM_CURVE_ = bezierCurve(0.4, 0, 0.2, 1.4);
const TAG = 'amp-pan-zoom';
const DEFAULT_MAX_SCALE = 3;
const MAX_ANIMATION_DURATION = 250;

const ELIGIBLE_TAGS = {
  'svg': true,
  'DIV': true,
  'AMP-IMG': true,
  'AMP-LAYOUT': true,
  'AMP-SELECTOR': true,
};

/**
 * @extends {AMP.BaseElement}
 */
export class AmpPanZoom extends AMP.BaseElement {
  // TODO (#15685): refactor this to share code with amp-image-viewer

  /** @param {!AmpElement} element */
  constructor(element) {

    super(element);

    /** @private {?Element} */
    this.content_ = null;

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.action_ = null;

    /** @private {number} */
    this.sourceWidth_ = 0;

    /** @private {number} */
    this.sourceHeight_ = 0;

    /** @private {?../../../src/layout-rect.LayoutRectDef} */
    this.elementBox_ = null;

    /** @private {?../../../src/layout-rect.LayoutRectDef} */
    this.contentBox_ = null;

    /** @private {?UnlistenDef} */
    this.unlistenOnSwipePan_ = null;

    /** @private */
    this.scale_ = 1;

    /** @private */
    this.startScale_ = 1;

    /** @private */
    this.minScale_ = 1;

    /** @private */
    this.maxScale_ = DEFAULT_MAX_SCALE;

    /** @private */
    this.initialX_ = 0;

    /** @private */
    this.initialY_ = 0;

    /** @private */
    this.initialScale_ = 1;

    /** @private */
    this.startX_ = 0;

    /** @private */
    this.startY_ = 0;

    /** @private */
    this.posX_ = 0;

    /** @private */
    this.posY_ = 0;

    /** @private */
    this.minX_ = 0;

    /** @private */
    this.minY_ = 0;

    /** @private */
    this.maxX_ = 0;

    /** @private */
    this.maxY_ = 0;

    /** @private {?../../../src/gesture.Gestures} */
    this.gestures_ = null;

    /** @private {?../../../src/motion.Motion} */
    this.motion_ = null;

    /** @private */
    this.resetOnResize_ = false;

    /** @private {?Element} */
    this.zoomButton_ = null;

    /** @private */
    this.disableDoubleTap_ = false;

    /** @private {UnlistenDef|null} */
    this.unlistenMouseDown_ = null;

    /** @private {UnlistenDef|null} */
    this.unlistenMouseUp_ = null;

    /** @private {UnlistenDef|null} */
    this.unlistenMouseMove_ = null;

    /** @private */
    this.mouseStartY_ = 0;

    /** @private */
    this.mouseStartX_ = 0;
  }

  /** @override */
  buildCallback() {
    this.action_ = Services.actionServiceForDoc(this.element);
    const children = this.getRealChildren();

    userAssert(
        children.length == 1,
        '%s should have its target element as its one and only child',
        TAG
    );
    userAssert(
        this.elementIsSupported_(children[0]),
        '%s is not supported by %s',
        children[0].tagName,
        TAG
    );
    this.element.classList.add('i-amphtml-pan-zoom');
    this.content_ = children[0];
    this.content_.classList.add('i-amphtml-pan-zoom-child');
    this.maxScale_ = this.getNumberAttributeOr_('max-scale', DEFAULT_MAX_SCALE);
    this.initialScale_ = this.getNumberAttributeOr_('initial-scale', 1);
    this.initialX_ = this.getNumberAttributeOr_('initial-x', 0);
    this.initialY_ = this.getNumberAttributeOr_('initial-y', 0);
    this.resetOnResize_ = this.element.hasAttribute('reset-on-resize');
    this.disableDoubleTap_ = this.element.hasAttribute('disable-double-tap');
    this.registerAction('transform', invocation => {
      const {args} = invocation;
      if (!args) {
        return;
      }
      const scale = args['scale'] || 1;
      const x = args['x'] || 0;
      const y = args['y'] || 0;
      return this.transform(x, y, scale);
    });
  }

  /**
   *
   * @param {number} x
   * @param {number} y
   * @param {number} scale
   */
  transform(x, y, scale) {
    this.updatePanZoomBounds_(scale);
    const boundX = this.boundX_(x, /*allowExtent*/ false);
    const boundY = this.boundY_(y, /*allowExtent*/ false);
    return this.set_(scale, boundX, boundY, /*animate*/ true)
        .then(() => this.onZoomRelease_());
  }

  /** @override */
  onMeasureChanged() {
    if (this.resetOnResize_) {
      this.resetContentDimensions_();
    }
  }

  /** @override */
  layoutCallback() {
    this.createZoomButton_();
    this.scheduleLayout(dev().assertElement(this.content_));
    return this.resetContentDimensions_().then(this.setupEvents_());
  }

  /** @override */
  pauseCallback() {
    this.cleanupEvents_();
  }

  /** @override */
  resumeCallback() {
    if (this.content_) {
      this.scheduleLayout(this.content_);
    }
    this.setupEvents_();
  }

  /** @override */
  unlayoutCallback() {
    this.cleanupEvents_();
    return true;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FIXED ||
      layout == Layout.FIXED_HEIGHT ||
      layout == Layout.FILL ||
      layout == Layout.RESPONSIVE;
  }

  /**
   * Checks to see if an element is supported.
   * @param {Element} element
   * @return {boolean}
   * @private
   */
  elementIsSupported_(element) {
    return ELIGIBLE_TAGS[element.tagName];
  }

  /**
   * Creates zoom buttoms
   * @private
   */
  createZoomButton_() {
    this.zoomButton_ = this.element.ownerDocument.createElement('div');
    this.zoomButton_.classList.add('amp-pan-zoom-in-icon');
    this.zoomButton_.classList.add('amp-pan-zoom-button');
    this.zoomButton_.addEventListener('click', () => {
      if (this.zoomButton_.classList.contains('amp-pan-zoom-in-icon')) {
        this.transform(0, 0, this.maxScale_);
        this.toggleZoomButtonOut_();
      } else {
        this.transform(0, 0, this.minScale_);
        this.toggleZoomButtonIn_();
      }
    });
    this.element.appendChild(this.zoomButton_);
  }

  /**
   * Tries to retrieve a number attribute, returns a default value
   * if unsuccessful.
   * @param {string} attribute
   * @param {number} defaultValue
   * @return {number}
   * @private
   */
  getNumberAttributeOr_(attribute, defaultValue) {
    const {element} = this;
    return element.hasAttribute(attribute)
      ? parseInt(element.getAttribute(attribute), 10)
      : defaultValue;
  }

  /**
   * Calculate the width and height of the content dimensions such
   * that they fit within amp-pan-zoom.
   * @param {number} aspectRatio
   * @private
   */
  updateContentDimensions_(aspectRatio) {
    // Calculate content height if we set width to amp-pan-zoom's width
    const heightToFit = this.elementBox_.width / aspectRatio;
    // Calculate content width if we set height to be amp-pan-zoom's height
    const widthToFit = this.elementBox_.height * aspectRatio;

    // The content should fit within amp-pan-zoom, so take the smaller value
    let height = Math.min(heightToFit, this.elementBox_.height);
    let width = Math.min(widthToFit, this.elementBox_.width);

    if (Math.abs(width - this.sourceWidth_) <= 16
        && Math.abs(height - this.sourceHeight_) <= 16) {
      width = this.sourceWidth_;
      height = this.sourceHeight_;
    }

    this.contentBox_ = layoutRectLtwh(
        0,
        0,
        Math.round(width),
        Math.round(height));
  }

  /**
   * Adjust max scale to at least fit the screen. This handles
   * the case of ridiculously long or wide content. We guarantee
   * that when zoomed to max, the smaller dimension fits the entire
   * amp-pan-zoom space.
   * @param {number} sourceAspectRatio
   * @private
   */
  updateMaxScale_(sourceAspectRatio) {
    const {width, height} = this.elementBox_;
    const elementBoxRatio = width / height;
    const maxScale = Math.max(
        elementBoxRatio / sourceAspectRatio,
        sourceAspectRatio / elementBoxRatio
    );
    if (!isNaN(maxScale)) {
      this.maxScale_ = Math.max(this.maxScale_, maxScale);
    }
  }

  /**
   * Measures the content viewer and content sizes and positioning.
   * This must be called AFTER the source element has already been
   * laid out.
   * @private
   */
  measure_() {
    this.sourceWidth_ = this.content_./*OK*/scrollWidth;
    this.sourceHeight_ = this.content_./*OK*/scrollHeight;

    const sourceAspectRatio = this.sourceWidth_ / this.sourceHeight_;

    this.elementBox_ = this.getViewport().getLayoutRect(this.element);

    this.updateContentDimensions_(sourceAspectRatio);
    this.updateMaxScale_(sourceAspectRatio);

    // Reset zoom and pan.
    this.startScale_ = this.scale_ = this.initialScale_;
    this.startX_ = this.posX_ = this.initialX_;
    this.startY_ = this.posY_ = this.initialY_;
  }

  /**
   * Measures and resets the content dimensions, after the element
   * dimensions changes.
   * @return {!Promise}
   * @private
   */
  resetContentDimensions_() {
    return this.mutateElement(() => this.clearDimensions_())
        .then(() => this.measureMutateElement(
            () => this.measure_(),
            () => this.setDimensions_(), dev().assertElement(this.content_))
        ).then(() => {
          this.setContentBoxOffsets_();
          this.updatePanZoomBounds_(this.scale_);
          return this.updatePanZoom_();
        });
  }

  /**
   * Sets the top and left values of the contentBox as offset from
   * pan-zoom container
   */
  setContentBoxOffsets_() {
    const contentBox =
    layoutRectFromDomRect(dev().assertElement(this.content_)
        ./*OK*/getBoundingClientRect());
    // Set content positions to offset from element box
    this.contentBox_.top = contentBox.top - this.elementBox_.top;
    this.contentBox_.left = contentBox.left - this.elementBox_.left;
  }

  /**
   * Set content dimensions so that they fit exactly within
   * amp-pan-zoom.
   */
  setDimensions_() {
    setStyles(dev().assertElement(this.content_), {
      width: px(this.contentBox_.width),
      height: px(this.contentBox_.height),
    });
  }

  /**
   * Clears content dimensions if any
   */
  clearDimensions_() {
    setStyles(dev().assertElement(this.content_), {
      width: '',
      height: '',
    });
  }

  /**
   * Given a x offset relative to the viewport, return the x offset
   * relative to the amp-pan-zoom component.
   * @param {number} clientX
   * @private
   */
  getOffsetX_(clientX) {
    const {left} = this.elementBox_;
    return clientX - (left - this.getViewport().getScrollLeft());
  }

  /**
   * Given a y offset relative to the viewport, return the y offset
   * relative to the amp-pan-zoom component.
   * @param {number} clientY
   * @private
   */
  getOffsetY_(clientY) {
    const {top} = this.elementBox_;
    return clientY - (top - this.getViewport().getScrollTop());
  }

  /**
   * @private
   */
  setupEvents_() {
    this.setupGestures_();
    this.unlistenMouseDown_ =
      listen(this.element, 'mousedown', e => this.onMouseDown_(e));
  }

  /**
   * Unlisten a listener and clear. If null, does nothing
   * @param {UnlistenDef|null} handle
   * @private
   */
  unlisten_(handle) {
    if (handle) {
      handle();
      handle = null;
    }
  }

  /**
   * @private
   */
  cleanupEvents_() {
    this.cleanupGestures_();
    this.unlisten_(this.unlistenMouseDown_);
    this.unlisten_(this.unlistenMouseMove_);
    this.unlisten_(this.unlistenMouseUp_);
  }

  /**
   * Mouse down handler for panning in desktop mode
   * @param {Event} e
   * @private
   */
  onMouseDown_(e) {
    // Return early for right click
    if (e.button == 2) {
      return;
    }
    e.preventDefault();
    const {clientX, clientY} = e;

    // This is to prevent right mouse button down when left still down
    this.unlisten_(this.unlistenMouseMove_);
    this.unlisten_(this.unlistenMouseUp_);

    this.mouseStartX_ = clientX;
    this.mouseStartY_ = clientY;

    this.unlistenMouseMove_ =
        listen(this.element, 'mousemove', e => this.onMouseMove_(e));
    this.unlistenMouseUp_ =
        listen(this.win, 'mouseup', e => this.onMouseUp_(e));
  }

  /**
   * @param {Event} e
   * @private
   */
  onMouseMove_(e) {
    // Prevent swiping by accident
    e.preventDefault();
    const {clientX, clientY} = e;
    const deltaX = clientX - this.mouseStartX_;
    const deltaY = clientY - this.mouseStartY_;
    this.onMove_(deltaX, deltaY, /*animate*/ false);
  }

  /**
   * Handler on mouse button up
   * @param {Event} e
   * @private
   */
  onMouseUp_(e) {
    e.preventDefault();
    this.release_();
    this.unlisten_(this.unlistenMouseMove_);
    this.unlisten_(this.unlistenMouseUp_);
  }

  /** @private */
  cleanupGestures_() {
    if (this.gestures_) {
      this.gestures_.cleanup();
      this.gestures_ = null;
    }
  }

  /** @private */
  setupGestures_() {
    if (this.gestures_) {
      return;
    }

    this.gestures_ = Gestures.get(this.element);

    this.gestures_.onPointerDown(() => {
      if (this.motion_) {
        this.motion_.halt();
      }
    });

    this.gestures_.onGesture(PinchRecognizer, e => this.handlePinch(e.data));

    // Having a doubletap gesture results in a 200ms delay in tap gestures in
    // order to differentiate the two gestures. Some users may choose to disable
    // it to avoid the 200ms tap delay.
    if (!this.disableDoubleTap_) {
      this.gestures_.onGesture(DoubletapRecognizer,
          e => this.handleDoubleTap(e.data));
      // Override all taps to enable tap events on content
      this.gestures_.onGesture(TapRecognizer, e => this.handleTap_(e.data));
    }
  }

  /**
   * @param {!../../../src/gesture-recognizers.DoubletapDef} data
   * @return {!Promise}
   * @visibleForTesting
   */
  handleDoubleTap(data) {
    const {clientX, clientY} = data;
    return this.onDoubletapZoom_(clientX, clientY)
        .then(() => this.onZoomRelease_());
  }

  /**
   * @param {!../../../src/gesture-recognizers.PinchDef} data
   * @return {!Promise}
   * @visibleForTesting
   */
  handlePinch(data) {
    const {
      centerClientX,
      centerClientY,
      deltaX,
      deltaY,
      dir,
      last,
    } = data;
    return this.onPinchZoom_(centerClientX, centerClientY,
        deltaX, deltaY, dir).then(() => {
      if (last) {
        return this.onZoomRelease_();
      }
    });
  }

  /**
   * @param {!../../../src/gesture-recognizers.SwipeDef} data
   * @return {!Promise}
   * @visibleForTesting
   */
  handleSwipe(data) {
    const {
      deltaX,
      deltaY,
      last,
      velocityX,
      velocityY,
    } = data;
    return this.onMove_(deltaX, deltaY, /*animate*/ false).then(() => {
      if (last) {
        return this.onMoveRelease_(velocityX, velocityY);
      }
    });
  }

  /**
   * @param {!../../../src/gesture-recognizers.TapDef} data
   */
  handleTap_(data) {
    // A custom event is necessary here (as opposed to the click() function)
    // because some targets (e.g. SVGs) may not be HTMLElements.
    const event = createCustomEvent(
        this.win,
        'click',
        null,
        {bubbles: true}
    );
    data.target.dispatchEvent(event);
  }

  /**
   * Registers a Swipe gesture to handle panning when the content is zoomed.
   * @private
   */
  registerPanningGesture_() {
    // Movable.
    this.unlistenOnSwipePan_ = this.gestures_
        .onGesture(SwipeXYRecognizer, e => this.handleSwipe(e.data));

  }

  /**
   * Deregisters the Swipe gesture for panning when the content is zoomed out.
   * @private
   */
  unregisterPanningGesture_() {
    if (this.unlistenOnSwipePan_) {
      this.unlistenOnSwipePan_();
      this.unlistenOnSwipePan_ = null;
      this.gestures_.removeGesture(SwipeXYRecognizer);
    }
  }

  /**
   * Returns value bound to min and max values +/- extent.
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @param {number} extent
   * @return {number}
   * @private
   */
  boundValue_(value, min, max, extent) {
    return clamp(value, min - extent, max + extent);
  }

  /**
   * Returns the scale within the allowed range with possible extent.
   * @param {number} s
   * @param {boolean} allowExtent
   * @return {number}
   * @private
   */
  boundScale_(s, allowExtent) {
    const extent = allowExtent ? 0.25 : 0;
    return this.boundValue_(s, this.minScale_, this.maxScale_, extent);
  }

  /**
   * Returns the X position within the allowed range with possible extent.
   * @param {number} x
   * @param {boolean} allowExtent
   * @return {number}
   * @private
   */
  boundX_(x, allowExtent) {
    const maxExtent = this.elementBox_.width * 0.25;
    const extent = allowExtent && this.scale_ > 1 ? maxExtent : 0;
    return this.boundValue_(x, this.minX_, this.maxX_, extent);
  }

  /**
   * Returns the Y position within the allowed range with possible extent.
   * @param {number} y
   * @param {boolean} allowExtent
   * @return {number}
   * @private
   */
  boundY_(y, allowExtent) {
    const maxExtent = this.elementBox_.height * 0.25;
    const extent = allowExtent && this.scale_ > 1 ? maxExtent : 0;
    return this.boundValue_(y, this.minY_, this.maxY_, extent);
  }

  /**
   * Updates X/Y bounds based on the provided scale value. The min/max bounds
   * are calculated to allow full pan of the content regardless of the scale
   * value. In the diagram below, assume content is y_offset from top of
   * amp-pan-zoom, and scaled by s. We should bound panning so that the edges
   * of the content do not exceed the amp-pan-zoom bounds.
   * Let s = scale, hc = content height, hp = pan zoom height, y_o = y offset
   *     maxY -       |------------------------------------|   -
   *          -       |           |------------| y_o       |   |         -
   *                  |           |------------| -         |   |         |
   *                  |           |            | | hc      |   | s * hc  |
   *                  |           |------------| -         |   |         |
   *                  |           |            |           |   |         |
   *          -       |-----------|------------|-----------|   -         |  hp
   *          |                   |            |                         |
   *    minY  |                   |            |                         |
   *          |                   |            |                         |
   *          -                   |------------|                         -
   *
   * maxY = 1/2 s * hc - 1/2 hc - y_o
   * minY = hp + minY - s * hc
   * Note that maxY and minY are max and minimum values for the CSS transform
   * translate y variable applied to the content. A positive value moves the
   * content down--we do not want the scaled content to move down more than
   * maxY. A negative value moves the content up--we do not want the content
   * to move up more than minY.
   *
   * @param {number} scale
   * @private
   */
  updatePanZoomBounds_(scale) {
    const {
      width: cWidth,
      left: xOffset,
      height: cHeight,
      top: yOffset,
    } = this.contentBox_;
    const {width: eWidth, height: eHeight} = this.elementBox_;

    this.minX_ = Math.min(0, eWidth - (xOffset + cWidth * (scale + 1) / 2));
    this.maxX_ = Math.max(0, (cWidth * scale - cWidth) / 2 - xOffset);
    this.minY_ = Math.min(0, eHeight - (yOffset + cHeight * (scale + 1) / 2));
    this.maxY_ = Math.max(0, (cHeight * scale - cHeight) / 2 - yOffset);
  }

  /**
   * Updates pan/zoom of the content based on the current values.
   * @return {!Promise}
   * @private
   */
  updatePanZoom_() {
    const {scale_: s, posX_: x, posY_: y, content_: content} = this;
    return this.mutateElement(() => {
      setStyles(dev().assertElement(content), {
        transform: translate(x, y) + ' ' + scale(s),
      });
    }, content);
  }

  /**
   * @param {number} scale
   * @param {number} x
   * @param {number} y
   * @private
   */
  triggerTransformEnd_(scale, x, y) {
    const transformEndEvent =
    createCustomEvent(this.win, `${TAG}.transformEnd`, dict({
      'scale': scale,
      'x': x,
      'y': y,
    }));
    this.action_.trigger(this.element, 'transformEnd', transformEndEvent,
        ActionTrust.HIGH);
    this.element.dispatchCustomEvent('transformEnd');
  }

  /**
   * Performs a one-step or an animated motion (panning).
   * @param {number} deltaX
   * @param {number} deltaY
   * @param {boolean} animate
   * @return {!Promise}
   * @private
   */
  onMove_(deltaX, deltaY, animate) {
    const newPosX = this.boundX_(this.startX_ + deltaX, true);
    const newPosY = this.boundY_(this.startY_ + deltaY, true);
    return this.set_(this.scale_, newPosX, newPosY, animate);
  }

  /**
   * Performs actions once the motion gesture has been complete. The motion
   * may continue based on the final velocity.
   * @param {number} veloX
   * @param {number} veloY
   * @return {!Promise}
   * @private
   */
  onMoveRelease_(veloX, veloY) {
    // Continue motion.
    this.motion_ = continueMotion(dev().assertElement(this.content_),
        this.posX_, this.posY_, veloX, veloY,
        (x, y) => {
          const newPosX = this.boundX_(x, true);
          const newPosY = this.boundY_(y, true);
          if (Math.abs(newPosX - this.posX_) < 1 &&
                Math.abs(newPosY - this.posY_) < 1) {
            // Hit the wall: stop motion.
            return false;
          }
          this.set_(this.scale_, newPosX, newPosY, false);
          return true;
        });

    // Snap back.
    return this.motion_.thenAlways(() => {
      this.motion_ = null;
      return this.release_();
    });
  }

  /**
   * @param {number} clientX
   * @param {number} clientY
   */
  onDoubletapZoom_(clientX, clientY) {
    const newScale = this.scale_ == this.minScale_ ?
      this.maxScale_ : this.minScale_;
    const dx = (this.elementBox_.width / 2) - this.getOffsetX_(clientX);
    const dy = (this.elementBox_.height / 2) - this.getOffsetY_(clientY);
    return this.onZoom_(newScale, dx, dy, /*animate*/ true);
  }

  /**
   * Performs a one-step pinch zoom action.
   * @param {number} centerClientX
   * @param {number} centerClientY
   * @param {number} deltaX
   * @param {number} deltaY
   * @param {number} dir
   * @return {!Promise}
   * @private
   */
  onPinchZoom_(centerClientX, centerClientY, deltaX, deltaY, dir) {
    if (dir == 0) {
      return Promise.resolve();
    }
    const {width, height} = this.elementBox_;
    const dist = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
    const newScale = this.startScale_ * (1 + (dir * dist / 100));
    const deltaCenterX = width / 2 - this.getOffsetX_(centerClientX);
    const deltaCenterY = height / 2 - this.getOffsetY_(centerClientY);
    const dx = Math.min(dist / 100, 1) * deltaCenterX;
    const dy = Math.min(dist / 100, 1) * deltaCenterY;
    return this.onZoom_(newScale, dx, dy, /*animate*/ false);
  }

  /**
   * Performs a one-step or an animated zoom action.
   * @param {number} scale
   * @param {number} deltaX
   * @param {number} deltaY
   * @param {boolean} animate
   * @return {!Promise}
   * @private
   */
  onZoom_(scale, deltaX, deltaY, animate) {
    const newScale = this.boundScale_(scale, true);
    if (newScale == this.scale_) {
      return Promise.resolve();
    }
    this.updatePanZoomBounds_(newScale);
    const newPosX = this.boundX_(this.startX_ + (deltaX * newScale), false);
    const newPosY = this.boundY_(this.startY_ + (deltaY * newScale), false);
    return this.set_(newScale, newPosX, newPosY, animate);
  }

  /**
   * @private
   */
  toggleZoomButtonIn_() {
    if (this.zoomButton_) {
      this.zoomButton_.classList.add('amp-pan-zoom-in-icon');
      this.zoomButton_.classList.remove('amp-pan-zoom-out-icon');
    }
  }

  /**
   * @private
   */
  toggleZoomButtonOut_() {
    if (this.zoomButton_) {
      this.zoomButton_.classList.remove('amp-pan-zoom-in-icon');
      this.zoomButton_.classList.add('amp-pan-zoom-out-icon');
    }
  }

  /**
   * Performs actions after the gesture that was performing zooming has been
   * released.
   * @return {!Promise}
   * @private
   */
  onZoomRelease_() {
    return this.release_().then(() => {
      // After the scale is updated, also register or unregister panning
      if (this.scale_ <= this.minScale_) {
        this.unregisterPanningGesture_();
        this.toggleZoomButtonIn_();
        this.content_.classList.remove('i-amphtml-pan-zoom-scrollable');
      } else {
        this.registerPanningGesture_();
        this.toggleZoomButtonOut_();
        this.content_.classList.add('i-amphtml-pan-zoom-scrollable');
      }
    });
  }

  /**
   * Sets or animates pan/zoom parameters.
   * @param {number} newScale
   * @param {number} newPosX
   * @param {number} newPosY
   * @param {boolean} animate
   * @return {!Promise}
   * @private
   */
  set_(newScale, newPosX, newPosY, animate) {
    const ds = newScale - this.scale_;
    const dx = newPosX - this.posX_;
    const dy = newPosY - this.posY_;
    const dist = Math.sqrt((dx * dx) + (dy * dy));

    const dur = animate ?
      Math.min(1, Math.max(
          dist * 0.01, // Distance
          Math.abs(ds) // Change in scale
      )) * MAX_ANIMATION_DURATION : 0;

    if (dur > 16 && animate) {
      const scaleFunc = numeric(this.scale_, newScale);
      const xFunc = numeric(this.posX_, newPosX);
      const yFunc = numeric(this.posY_, newPosY);
      return Animation.animate(dev().assertElement(this.content_), time => {
        this.scale_ = scaleFunc(time);
        this.posX_ = xFunc(time);
        this.posY_ = yFunc(time);
        this.updatePanZoom_();
      }, dur, PAN_ZOOM_CURVE_).thenAlways(() => {
        this.scale_ = newScale;
        this.posX_ = newPosX;
        this.posY_ = newPosY;
        this.updatePanZoom_();
      });
    } else {
      this.scale_ = newScale;
      this.posX_ = newPosX;
      this.posY_ = newPosY;
      return this.updatePanZoom_();
    }
  }

  /**
   * Sets or animates pan/zoom parameters after release of the gesture.
   * @return {!Promise}
   * @private
   */
  release_() {
    const newScale = this.boundScale_(this.scale_, false);
    if (newScale != this.scale_) {
      this.updatePanZoomBounds_(newScale);
    }
    const newPosX = this.boundX_(this.posX_ / this.scale_ * newScale, false);
    const newPosY = this.boundY_(this.posY_ / this.scale_ * newScale, false);
    return this.set_(newScale, newPosX, newPosY, true).then(() => {
      this.startScale_ = this.scale_;
      this.startX_ = this.posX_;
      this.startY_ = this.posY_;
      this.triggerTransformEnd_(this.scale_, this.posX_, this.posY_);
    });
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpPanZoom, CSS);
});
