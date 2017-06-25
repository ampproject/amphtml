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

import {BaseElement} from '../src/base-element';
import {isLayoutSizeDefined} from '../src/layout';
import {listen} from '../src/event-helper';
import {registerElement} from '../src/custom-element';
import {srcsetFromElement} from '../src/srcset';
import {user} from '../src/log';
import {removeElement} from '../src/dom';
import {mapRange} from '../src/utils/math';


/**
 * Attributes to propagate to internal image when changed externally.
 * @type {!Array<string>}
 */
const ATTRIBUTES_TO_PROPAGATE = ['alt', 'title', 'referrerpolicy', 'aria-label',
  'aria-describedby', 'aria-labelledby'];

/**
 * Number of accelerometer data points to use for bezier smoothing
 * @type {number}
 */
const TILT_SMOOTHING = 15;

/**
 * The zoomed-in image is panned farthest to the left when the device is tilted
 * at angle -TILT_MAX_ANGLE and is panned farthest to the right when the device
 * is tilted at angle TILT_MAX_ANGLE
 * @type {number}
 */
const TILT_MAX_ANGLE = 18;

/**
 * Percentage of the width of the viewport taken by the tilt indicator
 * @type {number}
 */
const TILT_INDICATOR_WIDTH = 30;

/**
 * Name of the tilt indicator container's class
 * @type {string}
 */
const INDIC_CONT_CLASS = 'amp-tilt-to-pan-indicator-container';

/**
 * Name of the tilt indicator's class
 * @type {string}
 */
const INDIC_CLASS = 'amp-tilt-to-pan-indicator';

export class AmpImg extends BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {boolean} */
    this.allowImgLoadFallback_ = true;

    /** @private {boolean} */
    this.isPrerenderAllowed_ = true;

    /** @private {?Element} */
    this.img_ = null;

    /** @private {?../src/srcset.Srcset} */
    this.srcset_ = null;

    /** @private {boolean} */
    this.hasTiltToPan_ = element.hasAttribute('tilt-to-pan');

    /** @private {?number} */
    this.tiltCenterAngle_ = null;

    /** @private {Array} */
    this.bezierPoints_ = [];

    /** @private {number} */
    this.initialHeight = 0;

    /** @private {number} */
    this.initialWidth = 0;
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    if (mutations['src'] !== undefined || mutations['srcset'] !== undefined) {
      this.srcset_ = srcsetFromElement(this.element);
      // This element may not have been laid out yet.
      if (this.img_) {
        this.updateImageSrc_();
      }
    }

    if (this.img_) {
      const attrs = ATTRIBUTES_TO_PROPAGATE.filter(
          value => mutations[value] !== undefined);
      this.propagateAttributes(
          attrs, this.img_, /* opt_removeMissingAttrs */ true);
    }
  }

  /** @override */
  preconnectCallback(onLayout) {
    // NOTE(@wassgha): since parseSrcset is computationally expensive and can
    // not be inside the `buildCallback`, we went with preconnecting to the
    // `src` url if it exists or the first srcset url.
    const src = this.element.getAttribute('src');
    if (src) {
      this.preconnect.url(src, onLayout);
    } else {
      const srcset = this.element.getAttribute('srcset');
      if (!srcset) {
        return;
      }
      // We try to find the first url in the srcset
      const srcseturls = srcset.match(/https?:\/\/[^\s]+/);
      // Connect to the first url if it exists
      if (srcseturls) {
        this.preconnect.url(srcseturls[0], onLayout);
      }
    }
  }

  /** @override */
  buildCallback() {
    this.isPrerenderAllowed_ = !this.element.hasAttribute('noprerender');
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /**
   * Create the actual image element and set up instance variables.
   * Called lazily in the first `#layoutCallback`.
   */
  initialize_() {
    if (this.img_) {
      return;
    }
    if (!this.srcset_) {
      this.srcset_ = srcsetFromElement(this.element);
    }
    this.allowImgLoadFallback_ = true;
    // If this amp-img IS the fallback then don't allow it to have its own
    // fallback to stop from nested fallback abuse.
    if (this.element.hasAttribute('fallback')) {
      this.allowImgLoadFallback_ = false;
    }

    this.img_ = new Image();
    if (this.element.id) {
      this.img_.setAttribute('amp-img-id', this.element.id);
    }

    // Remove role=img otherwise this breaks screen-readers focus and
    // only read "Graphic" when using only 'alt'.
    if (this.element.getAttribute('role') == 'img') {
      this.element.removeAttribute('role');
      user().error('AMP-IMG', 'Setting role=img on amp-img elements breaks ' +
        'screen readers please just set alt or ARIA attributes, they will ' +
        'be correctly propagated for the underlying <img> element.');
    }

    this.propagateAttributes(ATTRIBUTES_TO_PROPAGATE, this.img_);
    this.applyFillContent(this.img_, true);

    this.element.appendChild(this.img_);

    this.maybeInstallTiltObserver_();
  }

  /** @override */
  prerenderAllowed() {
    return this.isPrerenderAllowed_;
  }

  /** @override */
  isRelayoutNeeded() {
    return true;
  }

  /** @override */
  reconstructWhenReparented() {
    return false;
  }

  /** @override */
  layoutCallback() {
    this.initialize_();
    let promise = this.updateImageSrc_();

    // We only allow to fallback on error on the initial layoutCallback
    // or else this would be pretty expensive.
    if (this.allowImgLoadFallback_) {
      promise = promise.catch(e => {
        this.onImgLoadingError_();
        throw e;
      });
      this.allowImgLoadFallback_ = false;
    }

    this.initialHeight = this.element.offsetHeight;
    this.initialWidth = this.element.offsetWidth;

    this.img_.style.height = this.initialHeight + 'px';
    this.element.style.height = this.initialHeight + 'px';
    this.img_.style.width = this.initialWidth + 'px';
    this.element.style.width = this.initialWidth + 'px';

    return promise;
  }

  /**
   * @private
   */
  maybeInstallTiltObserver_() {
    if (!this.hasTiltToPan_) {
      return;
    }

    this.element.classList.add('i-amphtml-tilt-to-pan');

    listen(this.element, 'click', () => {
      if (this.element.classList.contains('i-amphtml-tilt-to-pan-expanded')) {
        this.img_.style.transform = 'translateX(0px)';
        this.img_.style.height = this.initialHeight + 'px';
        this.img_.style.width = this.initialWidth + 'px';
        this.element.style.height = this.initialHeight + 'px';
        this.element.style.width = this.initialWidth + 'px';
        this.element.classList.remove('i-amphtml-tilt-to-pan-expanded');
        const indicCont = this.element.querySelector(INDIC_CONT_CLASS);
        removeElement(indicCont);
        this.tiltCenterAngle_ = null;
      } else {
        this.element.classList.add('i-amphtml-tilt-to-pan-expanded');
        this.getViewport().animateScrollIntoView(this.element, 200);
        const indicCont = document.createElement(INDIC_CONT_CLASS);
        const indic = document.createElement(INDIC_CLASS);
        indic.style.width = TILT_INDICATOR_WIDTH + '%';
        indicCont.appendChild(indic);
        this.element.appendChild(indicCont);
        const imageRatio = this.initialWidth/this.initialHeight;
        const fullscreenWidth =  imageRatio * window.innerHeight;
        const middle = window.innerWidth/2 - fullscreenWidth/2;
        this.img_.style.transform = 'translateX(' + middle + 'px)';
        const indicator_middle = (indicCont.offsetWidth - indic.offsetWidth)/2;
        indic.style.transform = 'translateX(' + indicator_middle + 'px)';
        this.img_.style.height = window.innerHeight + 'px';
        this.img_.style.width = fullscreenWidth + 'px';
        this.element.style.height = window.innerHeight + 'px';
        this.element.style.width = window.innerWidth + 'px';
      }
    });

    if (window.DeviceOrientationEvent) {
      listen(window, 'deviceorientation', event => {
        this.updateTilt_(event.gamma);
      });
    } else if (window.DeviceMotionEvent) {
      listen(window, 'devicemotion', event => {
        this.updateTilt_(event.acceleration.y * 2);
      });
    } else {
      listen(window, 'MozOrientation', event => {
        this.updateTilt_(event.y * 50);
      });
    }
  }

  /**
   * @param {number} gamme The Y-value of the accelerometer
   * @private
   */
  updateTilt_(gamma) {

    if (!this.element.classList.contains('i-amphtml-tilt-to-pan-expanded')) {
      return;
    }

    if (!this.tiltCenterAngle_) {
      this.tiltCenterAngle_ = gamma;
    }

    if (this.bezierPoints_.length > TILT_SMOOTHING) {
      this.bezierPoints_.shift();
    }

    this.bezierPoints_.push(gamma);

    const currentGamma = this.bezierPoints_.reduce(function(a, b) {
                                              return a+b;
                                            }) / TILT_SMOOTHING;

    const max_translate = this.element.offsetWidth - this.img_.offsetWidth;

    const translateX = Math.round(
                        mapRange(
                          currentGamma,
                          -TILT_MAX_ANGLE + this.tiltCenterAngle_, TILT_MAX_ANGLE + this.tiltCenterAngle_,
                          0, max_translate)
                        );

    this.img_.style.transform = 'translateX(' + translateX + 'px)';
    const indicCont = this.element.querySelector(INDIC_CONT_CLASS);
    const indic = this.element.querySelector(INDIC_CLASS);
    indic.style.transform = 'translateX(' + Math.round(
                                mapRange(
                                  currentGamma,
                                  -TILT_MAX_ANGLE + this.tiltCenterAngle_, TILT_MAX_ANGLE + this.tiltCenterAngle_,
                                  0, indicCont.offsetWidth - indic.offsetWidth)
                                ) + 'px)';
  }

  /**
   * @return {!Promise}
   * @private
   */
  updateImageSrc_() {
    if (this.getLayoutWidth() <= 0) {
      return Promise.resolve();
    }
    const src = this.srcset_.select(this.getLayoutWidth(), this.getDpr()).url;
    if (src == this.img_.getAttribute('src')) {
      return Promise.resolve();
    }

    this.img_.setAttribute('src', src);

    return this.loadPromise(this.img_).then(() => {
      // Clean up the fallback if the src has changed.
      if (!this.allowImgLoadFallback_ &&
          this.img_.classList.contains('i-amphtml-ghost')) {
        this.getVsync().mutate(() => {
          this.img_.classList.remove('i-amphtml-ghost');
          this.toggleFallback(false);
        });
      }
    });
  }

  onImgLoadingError_() {
    this.getVsync().mutate(() => {
      this.img_.classList.add('i-amphtml-ghost');
      this.toggleFallback(true);
    });
  }
};

/**
 * @param {!Window} win Destination window for the new element.
 * @this {undefined}  // Make linter happy
 * @return {undefined}
 */
export function installImg(win) {
  registerElement(win, 'amp-img', AmpImg);
}
