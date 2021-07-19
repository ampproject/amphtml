/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {CommonSignals} from '#core/constants/common-signals';
import {scopedQuerySelectorAll} from '#core/dom/query';
import {setImportantStyles} from '#core/dom/style';
import {user} from '../../../src/log';
import {whenUpgradedToCustomElement} from '../../../src/amp-element-helpers';

/** @const {number} */
const CANVAS_SIZE = 3;

/** @const {number} */
const DURATION_MS = 400;

/** @const {string} */
const CLASS_NAME = 'BACKGROUND-BLUR';

/**
 * readyState for first rendrable frame of video element.
 * @const {number}
 */
const HAVE_CURRENT_DATA = 2;

export class BackgroundBlur {
  /**
   * @param {!Window} win
   * @param {!Element} element
   */
  constructor(win, element) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!Element} */
    this.element_ = element;

    /** @private @const {!Element} */
    this.canvas_ = null;

    /** @private @const {Element} */
    this.offscreenCanvas_ = this.win_.document.createElement('canvas');
    this.offscreenCanvas_.width = this.offscreenCanvas_.height = CANVAS_SIZE;

    /**  @private {?number} */
    this.currentRAF_ = null;

    /**  @private {?boolean} */
    this.firstLoad_ = true;
  }

  /**
   * Setup canvas and attach it to the document.
   */
  attach() {
    this.canvas_ = this.win_.document.createElement('canvas');
    this.canvas_.width = this.canvas_.height = CANVAS_SIZE;
    setImportantStyles(this.canvas_, {
      width: '100%',
      height: '100%',
      position: 'absolute',
      left: 0,
      top: 0,
    });
    this.element_.appendChild(this.canvas_);
  }

  /**
   * Remove canvas from the document and cancel the RAF.
   */
  detach() {
    this.element_.removeChild(this.canvas_);
    cancelAnimationFrame(this.currentRAF_);
  }

  /**
   * Update the background to the specified page's background.
   * @param {!Element} pageElement
   */
  update(pageElement) {
    cancelAnimationFrame(this.currentRAF_);
    const mediaEl = this.getBiggestMediaEl_(pageElement);
    if (!mediaEl) {
      user().info(CLASS_NAME, 'No amp-img or amp-video found.');
      this.animate_();
      return;
    }

    // Ensure element is loaded before calling animate.
    whenUpgradedToCustomElement(mediaEl)
      .then(() => mediaEl.signals().whenSignal(CommonSignals.LOAD_END))
      .then(
        () => {
          // If image, render it.
          if (mediaEl.tagName === 'AMP-IMG') {
            this.animate_(mediaEl.querySelector('img'));
            return;
          }

          // If video, render first frame or poster image.
          const innerVideoEl = mediaEl.querySelector('video');
          const alreadyHasData = innerVideoEl.readyState >= HAVE_CURRENT_DATA;
          if (alreadyHasData) {
            this.animateVideo_(innerVideoEl);
            return;
          }
          // If video doesnt have data, render from the poster image.
          const posterSrc = mediaEl.getAttribute('poster');
          if (!posterSrc) {
            this.animate_();
            user().info(CLASS_NAME, 'No "poster" attribute on amp-video.');
            return;
          }
          const img = new Image();
          img.onload = () => this.animate_(img);
          img.src = posterSrc;
        },
        () => {
          user().error(CLASS_NAME, 'Failed to load the amp-img or amp-video.');
        }
      );
  }

  animateVideo_(fillElement) {
    const nextFrame = () => {
      this.drawOffscreenCanvas_(fillElement);
      this.drawCanvas_(0.05);
      this.currentRAF_ = requestAnimationFrame(nextFrame);
    };
    this.currentRAF_ = requestAnimationFrame(nextFrame);
  }

  /**
   * Animated background transition.
   * @private
   * @param {?Element} fillElement
   */
  animate_(fillElement) {
    this.drawOffscreenCanvas_(fillElement);
    // Do not animate on first load.
    if (this.firstLoad_) {
      this.drawCanvas_(1 /** easing **/);
      this.firstLoad_ = false;
      return;
    }

    // Animation loop for fade.
    let startTime;
    const nextFrame = (currTime) => {
      if (!startTime) {
        startTime = currTime;
      }
      const elapsed = currTime - startTime;
      if (elapsed < DURATION_MS) {
        const easing = elapsed / DURATION_MS;
        this.drawCanvas_(easing);
        this.currentRAF_ = requestAnimationFrame(nextFrame);
      }
    };
    // Cancels the previous animation loop before starting a new one.
    cancelAnimationFrame(this.currentRAF_);
    this.currentRAF_ = requestAnimationFrame(nextFrame);
  }

  /**
   * Draws to the canvas with opacity.
   * @private
   * @param {number} alphaPercentage
   */
  drawCanvas_(alphaPercentage) {
    const context = this.canvas_.getContext('2d');
    context.globalAlpha = alphaPercentage;
    context.drawImage(this.offscreenCanvas_, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }

  /**
   * Composes the image offscreen at 100% opacity, then uses it for fading in.
   * If these draw calls are done with opacity, a flash would be visible.
   * This is due to the black fill being a high contrast compared to the image.
   * The black fill is always needed in case the image is a transparent png.
   * @private
   * @param {?Element} fillElement
   */
  drawOffscreenCanvas_(fillElement) {
    const context = this.offscreenCanvas_.getContext('2d');
    // A black background in drawn first in case the image is a transparent PNG.
    context.fillStyle = 'black';
    context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    if (fillElement) {
      context.drawImage(fillElement, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
      // For background protection.
      context.fillStyle = 'rgba(0, 0, 0, .3)';
      context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }
  }

  /**
   * Get active page's biggest amp-img or amp-video element.
   * @private
   * @param {!Element} pageElement
   * @return {?Element} An amp-img, amp-video or null.
   */
  getBiggestMediaEl_(pageElement) {
    const getSize = (el) => {
      if (!el) {
        return false;
      }
      const layoutBox = el.getLayoutBox();
      return layoutBox.width * layoutBox.height;
    };
    return Array.from(
      scopedQuerySelectorAll(
        pageElement,
        'amp-story-grid-layer amp-img, amp-story-grid-layer amp-video'
      )
    ).sort((firstEl, secondEl) => getSize(secondEl) - getSize(firstEl))[0];
  }
}
