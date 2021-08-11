function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { CommonSignals } from "../../../src/core/constants/common-signals";
import { scopedQuerySelectorAll } from "../../../src/core/dom/query";
import { setImportantStyles } from "../../../src/core/dom/style";
import { user } from "../../../src/log";
import { whenUpgradedToCustomElement } from "../../../src/amp-element-helpers";

/** @const {number} */
var CANVAS_SIZE = 3;

/** @const {number} */
var DURATION_MS = 400;

/** @const {string} */
var CLASS_NAME = 'BACKGROUND-BLUR';

/**
 * readyState for first rendrable frame of video element.
 * @const {number}
 */
var HAVE_CURRENT_DATA = 2;

export var BackgroundBlur = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Element} element
   */
  function BackgroundBlur(win, element) {_classCallCheck(this, BackgroundBlur);
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
   */_createClass(BackgroundBlur, [{ key: "attach", value:
    function attach() {
      this.canvas_ = this.win_.document.createElement('canvas');
      this.canvas_.width = this.canvas_.height = CANVAS_SIZE;
      setImportantStyles(this.canvas_, {
        width: '100%',
        height: '100%',
        position: 'absolute',
        left: 0,
        top: 0 });

      this.element_.appendChild(this.canvas_);
    }

    /**
     * Remove canvas from the document and cancel the RAF.
     */ }, { key: "detach", value:
    function detach() {
      this.element_.removeChild(this.canvas_);
      cancelAnimationFrame(this.currentRAF_);
    }

    /**
     * Update the background to the specified page's background.
     * @param {!Element} pageElement
     */ }, { key: "update", value:
    function update(pageElement) {var _this = this;
      var mediaEl = this.getBiggestMediaEl_(pageElement);
      if (!mediaEl) {
        user().info(CLASS_NAME, 'No amp-img or amp-video found.');
        this.animate_();
        return;
      }

      // Ensure element is loaded before calling animate.
      whenUpgradedToCustomElement(mediaEl).
      then(function () {return mediaEl.signals().whenSignal(CommonSignals.LOAD_END);}).
      then(
      function () {
        // If image, render it.
        if (mediaEl.tagName === 'AMP-IMG') {
          _this.animate_(mediaEl.querySelector('img'));
          return;
        }

        // If video, render first frame or poster image.
        var innerVideoEl = mediaEl.querySelector('video');
        var alreadyHasData = innerVideoEl.readyState >= HAVE_CURRENT_DATA;
        if (alreadyHasData) {
          _this.animate_(innerVideoEl);
          return;
        }
        // If video doesnt have data, render from the poster image.
        var posterSrc = mediaEl.getAttribute('poster');
        if (!posterSrc) {
          _this.animate_();
          user().info(CLASS_NAME, 'No "poster" attribute on amp-video.');
          return;
        }
        var img = new Image();
        img.onload = function () {return _this.animate_(img);};
        img.src = posterSrc;
      },
      function () {
        user().error(CLASS_NAME, 'Failed to load the amp-img or amp-video.');
      });

    }

    /**
     * Animated background transition.
     * @private
     * @param {?Element} fillElement
     */ }, { key: "animate_", value:
    function animate_(fillElement) {var _this2 = this;
      this.drawOffscreenCanvas_(fillElement);
      // Do not animate on first load.
      if (this.firstLoad_) {
        this.drawCanvas_(1 /** easing **/);
        this.firstLoad_ = false;
        return;
      }

      // Animation loop for fade.
      var startTime;
      var nextFrame = function nextFrame(currTime) {
        if (!startTime) {
          startTime = currTime;
        }
        var elapsed = currTime - startTime;
        if (elapsed < DURATION_MS) {
          var easing = elapsed / DURATION_MS;
          _this2.drawCanvas_(easing);
          _this2.currentRAF_ = requestAnimationFrame(nextFrame);
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
     */ }, { key: "drawCanvas_", value:
    function drawCanvas_(alphaPercentage) {
      var context = this.canvas_.getContext('2d');
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
     */ }, { key: "drawOffscreenCanvas_", value:
    function drawOffscreenCanvas_(fillElement) {
      var context = this.offscreenCanvas_.getContext('2d');
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
     */ }, { key: "getBiggestMediaEl_", value:
    function getBiggestMediaEl_(pageElement) {
      var getSize = function getSize(el) {
        if (!el) {
          return false;
        }
        var layoutBox = el.getLayoutBox();
        return layoutBox.width * layoutBox.height;
      };
      return Array.from(
      scopedQuerySelectorAll(
      pageElement,
      'amp-story-grid-layer amp-img, amp-story-grid-layer amp-video')).

      sort(function (firstEl, secondEl) {return getSize(secondEl) - getSize(firstEl);})[0];
    } }]);return BackgroundBlur;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/background-blur.js