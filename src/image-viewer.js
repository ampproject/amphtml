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

/**
 * This class is responsible providing all operations necessary for viewing
 * an image, such as full-bleed display, zoom and pan, etc.
 * // TODO (cathyzhu): figure out what package visibility means
 * @package  Visible for testing only!
 */
import {Animation} from './animation';
import {Gestures} from './gesture';
import {
  DoubletapRecognizer,
  SwipeXYRecognizer,
  TapzoomRecognizer,
  PinchRecognizer,
} from './gesture-recognizers';
import {bezierCurve} from './curve';
import {isLoaded} from './event-helper';
import {Services} from './services';
import {continueMotion} from './motion';
import {srcsetFromElement} from './srcset';
import {
  layoutRectFromDomRect,
  layoutRectLtwh,
  moveLayoutRect,
} from './layout-rect';
import * as st from './style';
import * as tr from './transition';

/** @private @const {!./curve.CurveDef} */
const PAN_ZOOM_CURVE_ = bezierCurve(0.4, 0, 0.2, 1.4);

export class ImageViewer {
  /**
   * @param {!./base-element.BaseElement} lightbox
   * @param {!Window} win
   * @param {!function(T, number=):Promise<T>} parentLoadPromise
   * @template T
   */
  constructor(lightbox, win, parentLoadPromise) {
    /** @private {!./base-element.BaseElement} */
    this.lightbox_ = lightbox;

    /** @const {!Window} */
    this.win = win;

    /** @private {function(T, number=):Promise<T>} */
    this.loadPromise_ = parentLoadPromise;

    /** @private {!Element} */
    this.viewer_ = lightbox.element.ownerDocument.createElement('div');
    this.viewer_.classList.add('i-amphtml-image-lightbox-viewer');

    /** @private {!Element} */
    this.image_ = lightbox.element.ownerDocument.createElement('img');
    this.image_.classList.add('i-amphtml-image-lightbox-viewer-image');
    this.viewer_.appendChild(this.image_);

    /** @private {./srcset.Srcset} */
    this.srcset_ = null;

    /** @private {!Object} */
    this.ariaAttributes_ = {
      'alt': null,
      'aria-label': null,
      'aria-labelledby': null,
    };

    /** @private {number} */
    this.sourceWidth_ = 0;

    /** @private {number} */
    this.sourceHeight_ = 0;

    /** @private {./layout-rect.LayoutRectDef} */
    this.viewerBox_ = layoutRectLtwh(0, 0, 0, 0);

    /** @private {./layout-rect.LayoutRectDef} */
    this.imageBox_ = layoutRectLtwh(0, 0, 0, 0);

    /** @private {number} */
    this.scale_ = 1;
    /** @private {number} */
    this.startScale_ = 1;
    /** @private {number} */
    this.maxSeenScale_ = 1;
    /** @private {number} */
    this.minScale_ = 1;
    /** @private {number} */
    this.maxScale_ = 2;

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
    /** @private {?./gesture.Gestures} */
    this.gestures_ = null;
    /** @private {?function()} */
    this.unlistenOnSwipePan_ = null;

    /** @private {?./motion.Motion} */
    this.motion_ = null;

    this.setupGestures_();
  }

  /**
   * Returns the root element of the image viewer.
   * @return {!Element}
   */
  getElement() {
    return this.viewer_;
  }

  /**
   * Returns the img element of the image viewer.
   * @return {!Element}
   */
  getImage() {
    return this.image_;
  }

  /**
   * Returns the boundaries of the viewer.
   * @return {!./layout-rect.LayoutRectDef}
   */
  getViewerBox() {
    return this.viewerBox_;
  }

  /**
   * Returns the boundaries of the image element.
   * @return {!./layout-rect.LayoutRectDef}
   */
  getImageBox() {
    return this.imageBox_;
  }

  /**
   * Returns true if the image is enlarged and not at its original scale
   * @return {!boolean}
   */
  isScaled() {
    return this.scale_ !== 1;
  }

  /**
   * Returns the boundaries of the image element with the offset if it was
   * moved by a gesture.
   * @return {!./layout-rect.LayoutRectDef}
   */
  getImageBoxWithOffset() {
    if (this.posX_ == 0 && this.posY_ == 0) {
      return this.imageBox_;
    }
    return moveLayoutRect(this.imageBox_, this.posX_, this.posY_);
  }

  /**
   * Resets the image viewer to the initial state.
   */
  reset() {
    this.image_.setAttribute('src', '');
    Object.keys(this.ariaAttributes_).forEach(key => {
      this.image_.removeAttribute(key);
      this.ariaAttributes_[key] = null;
    });
    this.image_.removeAttribute('aria-describedby');
    this.srcset_ = null;
    this.imageBox_ = layoutRectLtwh(0, 0, 0, 0);
    this.sourceWidth_ = 0;
    this.sourceHeight_ = 0;

    this.maxSeenScale_ = 1;
    this.scale_ = 1;
    this.startScale_ = 1;
    this.maxScale_ = 2;

    this.startX_ = 0;
    this.startY_ = 0;
    this.posX_ = 0;
    this.posY_ = 0;
    this.minX_ = 0;
    this.minY_ = 0;
    this.maxX_ = 0;
    this.maxY_ = 0;

    if (this.motion_) {
      this.motion_.halt();
    }
    this.motion_ = null;
  }

  /**
   * Initializes the image viewer to the target image element such as
   * "amp-img". The target image element may or may not yet have the img
   * element initialized.
   * @param {!Element} sourceElement
   * @param {?Element} sourceImage
   */
  init(sourceElement, sourceImage = null) {
    this.sourceWidth_ = sourceElement./*OK*/offsetWidth;
    this.sourceHeight_ = sourceElement./*OK*/offsetHeight;
    this.srcset_ = srcsetFromElement(sourceElement);

    Object.keys(this.ariaAttributes_).forEach(key => {
      this.ariaAttributes_[key] = sourceElement.getAttribute(key);
      if (this.ariaAttributes_[key]) {
        this.image_.setAttribute(key, this.ariaAttributes_[key]);
      }
    });

    if (sourceImage && isLoaded(sourceImage) && sourceImage.src) {
      // Set src provisionally to the known loaded value for fast display.
      // It will be updated later.
      this.image_.setAttribute('src', sourceImage.src);
    }

    st.setStyles(this.image_, {
      top: st.px(0),
      left: st.px(0),
      width: st.px(0),
      height: st.px(0),
    });
  }

  /**
   * Measures the image viewer and image sizes and positioning.
   * @return {!Promise}
   */
  measure() {
    return this.lightbox_.getVsync().measurePromise(() => {
      this.viewerBox_ = layoutRectFromDomRect(this.viewer_
          ./*OK*/getBoundingClientRect());

      const sourceAspectRatio = this.sourceWidth_ / this.sourceHeight_;
      let height = Math.min(this.viewerBox_.width / sourceAspectRatio,
          this.viewerBox_.height);
      let width = Math.min(this.viewerBox_.height * sourceAspectRatio,
          this.viewerBox_.width);

      // TODO(dvoytenko): This is to reduce very small expansions that often
      // look like a stutter. To be evaluated if this is still the right
      // idea.
      if (width - this.sourceWidth_ <= 16
          && height - this.sourceHeight_ <= 16) {
        width = this.sourceWidth_;
        height = this.sourceHeight_;
      }

      this.imageBox_ = layoutRectLtwh(
          Math.round((this.viewerBox_.width - width) / 2),
          Math.round((this.viewerBox_.height - height) / 2),
          Math.round(width),
          Math.round(height));

      st.setStyles(this.image_, {
        top: st.px(this.imageBox_.top),
        left: st.px(this.imageBox_.left),
        width: st.px(this.imageBox_.width),
        height: st.px(this.imageBox_.height),
      });

      // Reset zoom and pan.
      this.startScale_ = this.scale_ = 1;
      this.startX_ = this.posX_ = 0;
      this.startY_ = this.posY_ = 0;
      this.updatePanZoomBounds_(this.scale_);
      this.updatePanZoom_();

    }).then(() => this.updateSrc_());
  }

  /**
   * @return {!Promise}
   * @private
   */
  updateSrc_() {
    if (!this.srcset_) {
      // Do not update source if the lightbox has already exited.
      return Promise.resolve();
    }
    this.maxSeenScale_ = Math.max(this.maxSeenScale_, this.scale_);
    const width = this.imageBox_.width * this.maxSeenScale_;
    const src = this.srcset_.select(width, this.lightbox_.getDpr()).url;
    if (src == this.image_.getAttribute('src')) {
      return Promise.resolve();
    }
    // Notice that we will wait until the next event cycle to set the "src".
    // This ensures that the already available image will show immediately
    // and then naturally upgrade to a higher quality image.
    return Services.timerFor(this.win).promise(1).then(() => {
      this.image_.setAttribute('src', src);
      return this.loadPromise_(this.image_);
    });
  }

  /** @private */
  setupGestures_() {
    const gesturesWithoutPreventDefault = Gestures.get(this.image_,
        /* opt_shouldNotPreventDefault */true);
    gesturesWithoutPreventDefault.onPointerDown(() => {
      if (this.motion_) {
        this.motion_.halt();
      }
    });

    this.gestures_ = Gestures.get(this.viewer_);

    // Zoomable.
    this.gestures_.onGesture(DoubletapRecognizer, e => {
      let newScale;
      if (this.scale_ == 1) {
        newScale = this.maxScale_;
      } else {
        newScale = this.minScale_;
      }
      const deltaX = this.viewerBox_.width / 2 - e.data.clientX;
      const deltaY = this.viewerBox_.height / 2 - e.data.clientY;
      this.onZoom_(newScale, deltaX, deltaY, true).then(() => {
        return this.onZoomRelease_();
      });
    });

    this.gestures_.onGesture(TapzoomRecognizer, e => {
      this.onTapZoom_(e.data.centerClientX, e.data.centerClientY,
          e.data.deltaX, e.data.deltaY);
      if (e.data.last) {
        this.onTapZoomRelease_(e.data.centerClientX, e.data.centerClientY,
            e.data.deltaX, e.data.deltaY, e.data.velocityY, e.data.velocityY);
      }
    });

    this.gestures_.onGesture(PinchRecognizer, e => {
      this.onPinchZoom_(e.data.centerClientX, e.data.centerClientY,
          e.data.deltaX, e.data.deltaY, e.data.dir);
      if (e.data.last) {
        this.onZoomRelease_();
      }
    });
  }

  /**
   * Registers a Swipe gesture to handle panning when the image is zoomed.
   * @private
   */
  registerPanningGesture_() {
    // Movable.
    this.unlistenOnSwipePan_ = this.gestures_
        .onGesture(SwipeXYRecognizer, e => {
          this.onMove_(e.data.deltaX, e.data.deltaY, false);
          if (e.data.last) {
            this.onMoveRelease_(e.data.velocityX, e.data.velocityY);
          }
        });
  }

  /**
   * Deregisters the Swipe gesture for panning when the image is zoomed out.
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
        allowExtent && this.scale_ > 1 ? this.viewerBox_.width * 0.25 : 0);
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
        allowExtent ? this.viewerBox_.height * 0.25 : 0);
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
    const dh = this.viewerBox_.height - this.imageBox_.height * scale;
    if (dh >= 0) {
      minY = maxY = 0;
    } else {
      minY = dh / 2;
      maxY = -minY;
    }

    let maxX = 0;
    let minX = 0;
    const dw = this.viewerBox_.width - this.imageBox_.width * scale;
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
    st.setStyles(this.image_, {
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
    const newPosX = this.boundX_(this.startX_ + deltaX, true);
    const newPosY = this.boundY_(this.startY_ + deltaY, true);
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
    this.motion_ = continueMotion(this.image_,
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
    const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const newScale = this.startScale_ * (1 + dir * dist / 100);
    const deltaCenterX = this.viewerBox_.width / 2 - centerClientX;
    const deltaCenterY = this.viewerBox_.height / 2 - centerClientY;
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

    const newPosX = this.boundX_(this.startX_ + deltaX * newScale, false);
    const newPosY = this.boundY_(this.startY_ + deltaY * newScale, false);
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
      promise = continueMotion(this.image_,
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
      // After the scale is updated, also register or unregister panning
      if (this.scale_ <= 1) {
        this.unregisterPanningGesture_();
      } else {
        this.registerPanningGesture_();
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
    const dist = Math.sqrt(dx * dx + dy * dy);

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
      promise = Animation.animate(this.image_, time => {
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

