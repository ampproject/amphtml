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

import * as st from '../../../src/style';
import * as tr from '../../../src/transition';
import {Animation} from '../../../src/animation';
import {CSS} from '../../../build/amp-image-viewer-0.1.css';
import {CommonSignals} from '../../../src/common-signals';
import {
  DoubletapRecognizer,
  PinchRecognizer,
  SwipeXYRecognizer,
  TapRecognizer,
  TapzoomRecognizer,
} from '../../../src/gesture-recognizers';
import {Gestures} from '../../../src/gesture';
import {Layout} from '../../../src/layout';
import {bezierCurve} from '../../../src/curve';
import {closestAncestorElementBySelector, elementByTag} from '../../../src/dom';
import {continueMotion} from '../../../src/motion';
import {createCustomEvent} from '../../../src/event-helper';
import {dev, userAssert} from '../../../src/log';
import {
  expandLayoutRect,
  layoutRectFromDomRect,
  layoutRectLtwh,
  moveLayoutRect,
} from '../../../src/layout-rect';
import {setStyles} from '../../../src/style';
import {srcsetFromElement} from '../../../src/srcset';

const PAN_ZOOM_CURVE_ = bezierCurve(0.4, 0, 0.2, 1.4);
const TAG = 'amp-image-viewer';
const ARIA_ATTRIBUTES = ['aria-label', 'aria-describedby',
  'aria-labelledby'];
const DEFAULT_MAX_SCALE = 2;

const ELIGIBLE_TAGS = {
  'amp-img': true,
  'amp-anim': true,
};

export class AmpImageViewer extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {

    super(element);

    /** @private {?Element} */
    this.image_ = null;

    /** @private {?../../../src/srcset.Srcset} */
    this.srcset_ = null;

    /** @private {number} */
    this.sourceWidth_ = 0;

    /** @private {number} */
    this.sourceHeight_ = 0;

    /** @private {?../../../src/layout-rect.LayoutRectDef} */
    this.elementBox_ = null;

    /** @private {?../../../src/layout-rect.LayoutRectDef} */
    this.imageBox_ = null;

    /** @private {?UnlistenDef} */
    this.unlistenOnSwipePan_ = null;

    /** @private {?UnlistenDef} */
    this.unlistenOnClickHaltMotion_ = null;

    /** @private {number} */
    this.scale_ = 1;
    /** @private {number} */
    this.startScale_ = 1;
    /** @private {number} */
    this.maxSeenScale_ = 1;
    /** @private {number} */
    this.minScale_ = 1;
    /** @private {number} */
    this.maxScale_ = DEFAULT_MAX_SCALE;
    /** @private {number} */
    this.startX_ = 0;
    /** @private {number} */
    this.startY_ = 0;
    /** @private {number} */
    this.posX_ = 0;
    /** @private {number} */
    this.posY_ = 0;
    /** @private {number} */
    this.minX_ = 0;
    /** @private {number} */
    this.minY_ = 0;
    /** @private {number} */
    this.maxX_ = 0;
    /** @private {number} */
    this.maxY_ = 0;

    /** @private {?../../../src/gesture.Gestures} */
    this.gestures_ = null;

    /** @private {?../../../src/motion.Motion} */
    this.motion_ = null;

    /** @private {?Element} */
    this.sourceAmpImage_ = null;

    /** @private {?Promise} */
    this.loadPromise_ = null;
  }

  /** @override */
  buildCallback() {
    this.element.classList.add('i-amphtml-image-viewer');
    const children = this.getRealChildren();

    userAssert(
        children.length == 1,
        '%s should have its target element as its one and only child',
        TAG);
    userAssert(
        this.elementIsSupported_(children[0]),
        '%s is not supported by %s',
        children[0].tagName,
        TAG
    );

    this.sourceAmpImage_ = children[0];
    this.setAsOwner(this.sourceAmpImage_);
  }

  /** @override */
  onMeasureChanged() {
    // TODO(sparhami) #19259 Tracks a more generic way to do this. Remove once
    // we have something better.
    const isScaled = closestAncestorElementBySelector(
        this.element, '[i-amphtml-scale-animation]');
    if (isScaled) {
      return;
    }

    if (this.loadPromise_) {
      this.loadPromise_.then(() => this.resetImageDimensions_());
    }
  }

  /** @override */
  layoutCallback() {
    if (this.loadPromise_) {
      return this.loadPromise_;
    }
    // TODO(sparhami) #19259 Tracks a more generic way to do this. Remove once
    // we have something better.
    const isScaled = closestAncestorElementBySelector(
        this.element, '[i-amphtml-scale-animation]');
    if (isScaled) {
      return Promise.resolve();
    }
    const ampImg = dev().assertElement(this.sourceAmpImage_);
    this.scheduleLayout(ampImg);
    
    return ampImg.signals()
        .whenSignal(CommonSignals.LOAD_END)
        .then(() => this.init_())
        .then(() => this.resetImageDimensions_())
        .then(() => this.setupGestures_());
  }

  /** @override */
  pauseCallback() {
    if (!this.loadPromise_) {
      return;
    }
    this.loadPromise_.then(() => {
      this.resetImageDimensions_();
      this.cleanupGestures_();
    });
  }

  /** @override */
  resumeCallback() {
    if (!this.loadPromise_) {
      return;
    }
    this.loadPromise_.then(() => {
      this.resetImageDimensions_();
      this.setupGestures_();
    });
  }

  /** @override */
  unlayoutCallback() {
    this.cleanupGestures_();
    this.loadPromise_ = null;
    return true;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FILL;
  }

  /**
   * Returns the boundaries of the image element.
   * @return {?../../../src/layout-rect.LayoutRectDef}
   */
  getImageBox() {
    return this.imageBox_;
  }

  /**
   * Returns the boundaries of the image element.
   * @return {?Element}
   */
  getImage() {
    return this.image_;
  }

  /**
   * Returns the boundaries of the image element with the offset if it was
   * moved by a gesture.
   * @return {?../../../src/layout-rect.LayoutRectDef}
   */
  getImageBoxWithOffset() {
    if ((this.posX_ == 0 && this.posY_ == 0) || !this.imageBox_) {
      return this.imageBox_;
    }
    const expansionScale = (this.scale_ - 1) / 2;
    return moveLayoutRect(
        expandLayoutRect(this.imageBox_, expansionScale, expansionScale),
        this.posX_,
        this.posY_
    );
  }

  /**
   * Checks to see if an element is supported.
   * @param {Element} element
   * @return {boolean}
   * @private
   */
  elementIsSupported_(element) {
    return ELIGIBLE_TAGS[element.tagName.toLowerCase()];
  }

  /**
   * Sets the source width and height based the natural dimensions of the
   * source image if loaded, and the offset dimensions of amp-img element
   * if not.
   * @param {!Element} ampImg
   * @private
   */
  setSourceDimensions_(ampImg) {
    const img = elementByTag(ampImg, 'img');
    this.measureElement(() => {
      if (img) {
        this.sourceWidth_ = img.naturalWidth || ampImg./*OK*/offsetWidth;
        this.sourceHeight_ = img.naturalHeight || ampImg./*OK*/offsetHeight;
      } else {
        this.sourceWidth_ = ampImg./*OK*/offsetWidth;
        this.sourceHeight_ = ampImg./*OK*/offsetHeight;
      }
    });
  }

  /**
   * Initializes the image viewer to the target image element such as
   * "amp-img". The target image element may or may not yet have the img
   * element initialized.
   * @return {!Promise}
   */
  init_() {
    if (this.image_) {
      return Promise.resolve();
    }

    this.image_ = this.element.ownerDocument.createElement('img');
    this.image_.classList.add('i-amphtml-image-viewer-image');
    const ampImg = dev().assertElement(this.sourceAmpImage_);
    this.setSourceDimensions_(ampImg);
    this.srcset_ = srcsetFromElement(ampImg);

    return this.mutateElement(() => {
      setStyles(dev().assertElement(this.image_), {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      });
      st.toggle(ampImg, false);
      this.element.appendChild(this.image_);
      return ampImg.getImpl().then(ampImg => {
        ampImg.propagateAttributes(ARIA_ATTRIBUTES, this.image_);
      });
    });
  }

  /**
   * Measures the image viewer and image sizes and positioning.
   * This must be called AFTER the source element has already been
   * laid out.
   * @private
   */
  measure_() {
    this.elementBox_ = layoutRectFromDomRect(this.element
        ./*OK*/getBoundingClientRect());

    const sourceAspectRatio = this.sourceWidth_ / this.sourceHeight_;
    let height = Math.min(this.elementBox_.width / sourceAspectRatio,
        this.elementBox_.height);
    let width = Math.min(this.elementBox_.height * sourceAspectRatio,
        this.elementBox_.width);

    if (Math.abs(width - this.sourceWidth_) <= 16
    && Math.abs(height - this.sourceHeight_ <= 16)) {
      width = this.sourceWidth_;
      height = this.sourceHeight_;
    }

    this.imageBox_ = layoutRectLtwh(
        Math.round((this.elementBox_.width - width) / 2),
        Math.round((this.elementBox_.height - height) / 2),
        Math.round(width),
        Math.round(height));

    // Adjust max scale to at least fit the screen.
    const elementBoxRatio = this.elementBox_.width /
     this.elementBox_.height;
    const maxScale = Math.max(
        elementBoxRatio / sourceAspectRatio,
        sourceAspectRatio / elementBoxRatio
    );
    this.maxScale_ = Math.max(DEFAULT_MAX_SCALE, maxScale);

    // Reset zoom and pan.
    this.startScale_ = this.scale_ = 1;
    this.startX_ = this.posX_ = 0;
    this.startY_ = this.posY_ = 0;
    this.updatePanZoomBounds_(this.scale_);
  }

  /**
   * Measures and resets the image dimensions, after the element
   * dimensions changes.
   * @return {!Promise}
   */
  resetImageDimensions_() {
    return this.measureElement(() => this.measure_()).then(() => {
      const image = dev().assertElement(this.image_);
      return this.mutateElement(() => {
        // Set the actual dimensions of the image
        setStyles(image, {
          top: st.px(this.imageBox_.top),
          left: st.px(this.imageBox_.left),
          width: st.px(this.imageBox_.width),
          height: st.px(this.imageBox_.height),
        });

        // Update translation and scaling
        this.updatePanZoom_();
      },image);
    }).then(() => this.updateSrc_());
  }

  /**
   * @return {!Promise}
   * @private
   */
  updateSrc_() {
    if (!this.srcset_) {
      return Promise.resolve();
    }
    this.maxSeenScale_ = Math.max(this.maxSeenScale_, this.scale_);
    const width = Math.max(
        this.imageBox_.width * this.maxSeenScale_,
        this.sourceWidth_
    );
    const src = this.srcset_.select(width, this.getDpr());
    if (src == this.image_.getAttribute('src')) {
      return Promise.resolve();
    }
    return this.mutateElement(() => {
      this.image_.setAttribute('src', src);
    }, this.image_);
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
    this.gestures_ = Gestures.get(this.element);

    // Zoomable.
    this.gestures_.onGesture(DoubletapRecognizer, gesture => {
      const {data} = gesture;
      const newScale = this.scale_ == 1 ? this.maxScale_ : this.minScale_;
      const deltaX = (this.elementBox_.width / 2) - data.clientX;
      const deltaY = (this.elementBox_.height / 2) - data.clientY;
      this.onZoom_(newScale, deltaX, deltaY, true).then(() => {
        return this.onZoomRelease_();
      });
    });

    // Propagate click on tap, since the double tap gesture would prevent it
    // from occurring otherwise. This allows interested parties (e.g. lightbox
    // gallery) to react to clicks, though there will be a delay.
    this.gestures_.onGesture(TapRecognizer, gesture => {
      this.propagateClickEvent_(gesture.data.target);
    });

    this.gestures_.onGesture(TapzoomRecognizer, gesture => {
      const {data} = gesture;
      this.onTapZoom_(data.centerClientX, data.centerClientY,
          data.deltaX, data.deltaY);
      if (data.last) {
        this.onTapZoomRelease_(data.centerClientX, data.centerClientY,
            data.deltaX, data.deltaY, data.velocityY, data.velocityY);
      }
    });

    this.gestures_.onGesture(PinchRecognizer, gesture => {
      const {data} = gesture;
      this.onPinchZoom_(data.centerClientX, data.centerClientY,
          data.deltaX, data.deltaY, data.dir);
      if (data.last) {
        this.onZoomRelease_();
      }
    });
  }

  /**
   * @param {!EventTarget} target
   * @private
   */
  propagateClickEvent_(target) {
    const event = createCustomEvent(
        this.win,
        'click',
        null,
        {bubbles: true}
    );
    target.dispatchEvent(event);
  }

  /**
   * Registers a Swipe gesture and motion halt handler to handle panning when
   * the image is zoomed.
   * @private
   */
  onZoomedIn_() {
    // Movable.
    this.unlistenOnSwipePan_ = this.gestures_
        .onGesture(SwipeXYRecognizer, gesture => {
          const {data} = gesture;
          this.onMove_(data.deltaX, data.deltaY, false);
          if (data.last) {
            this.onMoveRelease_(data.velocityX, data.velocityY);
          }
        });

    this.unlistenOnClickHaltMotion_ = this.gestures_.onPointerDown(() => {
      if (this.motion_) {
        this.motion_.halt();
      }
    });
  }

  /**
   * Deregisters the Swipe gesture and motion halt handler for panning when
   * the image is zoomed out.
   * @private
   */
  onZoomedOut_() {
    if (this.unlistenOnSwipePan_) {
      this.unlistenOnSwipePan_();
      this.unlistenOnSwipePan_ = null;
      this.gestures_.removeGesture(SwipeXYRecognizer);
    }

    if (this.unlistenOnClickHaltMotion_) {
      this.unlistenOnClickHaltMotion_();
      this.unlistenOnClickHaltMotion_ = null;
    }
  }

  /**
   * Returns value bound to min and max values +/- extent.
   * @param {number} v
   * @param {number} min
   * @param {number} max
   * @param {number} extent
   * @return {number}
   * @private
   */
  boundValue_(v, min, max, extent) {
    return Math.max(min - extent, Math.min(max + extent, v));
  }

  /**
   * Returns the scale within the allowed range with possible extent.
   * @param {number} s
   * @param {boolean} allowExtent
   * @return {number}
   * @private
   */
  boundScale_(s, allowExtent) {
    return this.boundValue_(s, this.minScale_, this.maxScale_,
        allowExtent ? 0.25 : 0);
  }

  /**
   * Returns the X position within the allowed range with possible extent.
   * @param {number} x
   * @param {boolean} allowExtent
   * @return {number}
   * @private
   */
  boundX_(x, allowExtent) {
    return this.boundValue_(x, this.minX_, this.maxX_,
        allowExtent && this.scale_ > 1 ? this.elementBox_.width * 0.25 : 0);
  }

  /**
   * Returns the Y position within the allowed range with possible extent.
   * @param {number} y
   * @param {boolean} allowExtent
   * @return {number}
   * @private
   */
  boundY_(y, allowExtent) {
    return this.boundValue_(y, this.minY_, this.maxY_,
        allowExtent ? this.elementBox_.height * 0.25 : 0);
  }

  /**
   * Updates X/Y bounds based on the provided scale value. The min/max bounds
   * are calculated to allow full pan of the image regardless of the scale
   * value.
   * @param {number} scale
   * @private
   */
  updatePanZoomBounds_(scale) {
    let maxY = 0;
    let minY = 0;
    const dh = this.elementBox_.height - (this.imageBox_.height * scale);
    if (dh >= 0) {
      minY = maxY = 0;
    } else {
      minY = dh / 2;
      maxY = -minY;
    }

    let maxX = 0;
    let minX = 0;
    const dw = this.elementBox_.width - (this.imageBox_.width * scale);
    if (dw >= 0) {
      minX = maxX = 0;
    } else {
      minX = dw / 2;
      maxX = -minX;
    }

    this.minX_ = minX;
    this.minY_ = minY;
    this.maxX_ = maxX;
    this.maxY_ = maxY;
  }

  /**
   * Updates pan/zoom of the image based on the current values.
   * @private
   */
  updatePanZoom_() {
    setStyles(dev().assertElement(this.image_), {
      transform: st.translate(this.posX_, this.posY_) +
          ' ' + st.scale(this.scale_),
    });
  }

  /**
   * Performs a one-step or an animated motion (panning).
   * @param {number} deltaX
   * @param {number} deltaY
   * @param {boolean} animate
   * @private
   */
  onMove_(deltaX, deltaY, animate) {
    const newPosX = this.boundX_(this.startX_ + deltaX, false);
    const newPosY = this.boundY_(this.startY_ + deltaY, false);
    this.set_(this.scale_, newPosX, newPosY, animate);
  }

  /**
   * Performs actions once the motion gesture has been complete. The motion
   * may continue based on the final velocity.
   * @param {number} veloX
   * @param {number} veloY
   * @private
   */
  onMoveRelease_(veloX, veloY) {
    // Continue motion.
    this.motion_ = continueMotion(dev().assertElement(this.image_),
        this.posX_, this.posY_, veloX, veloY,
        (x, y) => {
          const newPosX = this.boundX_(x, false);
          const newPosY = this.boundY_(y, false);
          if (Math.abs(newPosX - this.posX_) < 1 &&
                Math.abs(newPosY - this.posY_) < 1) {
            // Hit the wall: stop motion.
            return false;
          }
          this.set_(this.scale_, newPosX, newPosY, false);
          return true;
        });

    // Snap back.
    this.motion_.thenAlways(() => {
      this.motion_ = null;
      return this.release_();
    });
  }

  /**
   * Performs a one-step pinch zoom action.
   * @param {number} centerClientX
   * @param {number} centerClientY
   * @param {number} deltaX
   * @param {number} deltaY
   *  @param {number} dir
   * @private
   */
  onPinchZoom_(centerClientX, centerClientY, deltaX, deltaY, dir) {
    this.zoomToPoint_(centerClientX, centerClientY, deltaX, deltaY, dir);
  }

  /**
   * Performs a one-step tap zoom action.
   * @param {number} centerClientX
   * @param {number} centerClientY
   * @param {number} deltaX
   * @param {number} deltaY
   * @private
   */
  onTapZoom_(centerClientX, centerClientY, deltaX, deltaY) {
    const dir = Math.abs(deltaY) > Math.abs(deltaX) ?
      Math.sign(deltaY) : Math.sign(-deltaX);
    this.zoomToPoint_(centerClientX, centerClientY, deltaX, deltaY, dir);
  }

  /**
   * Given center position, zoom delta, and zoom position, computes
   * and updates a zoom action on the image.
   * @param {number} centerClientX
   * @param {number} centerClientY
   * @param {number} deltaX
   * @param {number} deltaY
   * @param {number} dir
   * @private
   */
  zoomToPoint_(centerClientX, centerClientY, deltaX, deltaY, dir) {
    if (dir == 0) {
      return;
    }
    const dist = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
    const newScale = this.startScale_ * (1 + (dir * dist / 100));
    const deltaCenterX = (this.elementBox_.width / 2) - centerClientX;
    const deltaCenterY = (this.elementBox_.height / 2) - centerClientY;
    deltaX = Math.min(deltaCenterX, deltaCenterX * (dist / 100));
    deltaY = Math.min(deltaCenterY, deltaCenterY * (dist / 100));
    this.onZoom_(newScale, deltaX, deltaY, false);
  }

  /**
   * Performs a one-step or an animated zoom action.
   * @param {number} scale
   * @param {number} deltaX
   * @param {number} deltaY
   * @param {boolean} animate
   * @return {!Promise|undefined}
   * @private
   */
  onZoom_(scale, deltaX, deltaY, animate) {
    const newScale = this.boundScale_(scale, true);
    if (newScale == this.scale_) {
      return;
    }

    this.updatePanZoomBounds_(newScale);

    const newPosX = this.boundX_(this.startX_ + (deltaX * newScale), false);
    const newPosY = this.boundY_(this.startY_ + (deltaY * newScale), false);
    return /** @type {!Promise|undefined} */ (
      this.set_(newScale, newPosX, newPosY, animate));
  }

  /**
   * Performs actions after the gesture that was performing zooming has been
   * released. The zooming may continue based on the final velocity.
   * @param {number} centerClientX
   * @param {number} centerClientY
   * @param {number} deltaX
   * @param {number} deltaY
   * @param {number} veloX
   * @param {number} veloY
   * @return {!Promise}
   * @private
   */
  onTapZoomRelease_(centerClientX, centerClientY,
    deltaX, deltaY, veloX, veloY) {
    let promise;
    if (veloX == 0 && veloY == 0) {
      promise = Promise.resolve();
    } else {
      promise = continueMotion(dev().assertElement(this.image_),
          deltaX, deltaY, veloX, veloY,
          (x, y) => {
            this.onTapZoom_(centerClientX, centerClientY, x, y);
            return true;
          }).thenAlways();
    }
    return promise.then(() => {
      this.onZoomRelease_();
    });
  }

  /**
   * Performs actions after the gesture that was performing zooming has been
   * released.
   * @return {!Promise}
   * @private
   */
  onZoomRelease_() {
    const relayout = this.scale_ > this.startScale_;
    return this.release_().then(() => {
      if (relayout) {
        this.updateSrc_();
      }
      // After updating the scale, register or deregister zoomed-in actions
      if (this.scale_ > 1) {
        this.onZoomedIn_();
      } else {
        this.onZoomedOut_();
      }
    });
  }

  /**
   * Sets or animates pan/zoom parameters.
   * @param {number} newScale
   * @param {number} newPosX
   * @param {number} newPosY
   * @param {boolean} animate
   * @return {!Promise|undefined}
   * @private
   */
  set_(newScale, newPosX, newPosY, animate) {
    const ds = newScale - this.scale_;
    const dx = newPosX - this.posX_;
    const dy = newPosY - this.posY_;
    const dist = Math.sqrt((dx * dx) + (dy * dy));

    let dur = 0;
    if (animate) {
      const maxDur = 250;
      dur = Math.min(maxDur, Math.max(
          maxDur * dist * 0.01, // Moving component.
          maxDur * Math.abs(ds))); // Zooming component.
    }

    let promise;
    if (dur > 16 && animate) {
      /** @const {!TransitionDef<number>} */
      const scaleFunc = tr.numeric(this.scale_, newScale);
      /** @const {!TransitionDef<number>} */
      const xFunc = tr.numeric(this.posX_, newPosX);
      /** @const {!TransitionDef<number>} */
      const yFunc = tr.numeric(this.posY_, newPosY);
      promise = Animation.animate(dev().assertElement(this.image_), time => {
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
      this.updatePanZoom_();
      if (animate) {
        promise = Promise.resolve();
      } else {
        promise = undefined;
      }
    }

    return promise;
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
    });
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpImageViewer, CSS);
});
