import {CommonSignals_Enum} from '#core/constants/common-signals';
import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';
import {scopedQuerySelectorAll} from '#core/dom/query';
import {setImportantStyles} from '#core/dom/style';

import {user} from '#utils/log';

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

    /** @private @const {!Array<Element>} */
    this.mediaElements_ = null;

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
   * Update the media elements and call the first iteration of media element to blur.
   * @param {!Element} pageElement
   */
  update(pageElement) {
    this.mediaElements_ = this.getBiggestMediaElements_(pageElement);
    this.findAndBlurMediaEl_(this.mediaElements_[0]);
  }

  /**
   * Ensures element exists, is loaded and is not a transparent png or gif.
   * Recursive if the mediaEl is png or gif with transparent pixels.
   * @private
   * @param {?Element} mediaEl
   */
  findAndBlurMediaEl_(mediaEl) {
    if (!mediaEl) {
      user().info(CLASS_NAME, 'No amp-img or amp-video found.');
      this.animateBlur_();
      return;
    }

    this.ensureMediaLoaded_(mediaEl).then((loadedMediaEl) => {
      // If image:
      if (loadedMediaEl.tagName === 'AMP-IMG') {
        // First check if it has transparent pixels.
        if (this.isTransparentGifOrPng_(loadedMediaEl)) {
          // If transparent, try again with the next element in the array.
          this.findAndBlurMediaEl_(this.getNextMediaEl_(loadedMediaEl));
          return;
        }
        this.animateBlur_(loadedMediaEl.querySelector('img'));
        return;
      }

      // If video, render first frame or poster image.
      const innerVideoEl = loadedMediaEl.querySelector('video');
      const alreadyHasData = innerVideoEl.readyState >= HAVE_CURRENT_DATA;
      if (alreadyHasData) {
        this.animateBlur_(innerVideoEl);
        return;
      }
      // If video doesnt have data, render from the poster image.
      const posterSrc = loadedMediaEl.getAttribute('poster');
      if (!posterSrc) {
        this.animateBlur_();
        user().info(CLASS_NAME, 'No "poster" attribute on amp-video.');
        return;
      }
      const img = new Image();
      img.onload = () => this.animateBlur_(img);
      img.src = posterSrc;
    });
  }

  /**
   * @private
   * @param {?Element} mediaEl
   * @return {boolean}
   */
  isTransparentGifOrPng_(mediaEl) {
    if (!this.isGifOrPng_(mediaEl)) {
      return false;
    }
    const imgEl = mediaEl.querySelector('img');
    const canvas = this.win_.document.createElement('canvas');
    canvas.width = canvas.height = CANVAS_SIZE;
    const context = canvas.getContext('2d');
    context.drawImage(imgEl, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    const imgData = context.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data;
    // Image data pixel values are in sets of 4: r, g, b, a.
    // For this reason we increment in 4.
    for (let i = 0; i < imgData.length; i += 4) {
      const pixelAlphaVal = imgData[i + 3];
      if (pixelAlphaVal < 255) {
        return true;
      }
    }
    return false;
  }

  /**
   * @private
   * @param {?Element} mediaEl
   * @return {boolean}
   */
  isGifOrPng_(mediaEl) {
    const src = mediaEl.getAttribute('src').toLowerCase();
    return src.includes('.png') || src.includes('.gif');
  }

  /**
   * @private
   * @param {?Element} mediaEl
   * @return {?Element}
   */
  getNextMediaEl_(mediaEl) {
    const currentMediaElIdx = this.mediaElements_.indexOf(mediaEl);
    return this.mediaElements_[currentMediaElIdx + 1];
  }

  /**
   * @private
   * @param {?Element} mediaEl
   * @return {Promise}
   */
  ensureMediaLoaded_(mediaEl) {
    return new Promise((resolve) => {
      whenUpgradedToCustomElement(mediaEl)
        .then(() => mediaEl.signals().whenSignal(CommonSignals_Enum.LOAD_END))
        .then(() => {
          resolve(mediaEl);
        })
        .catch(() => {
          user().error(CLASS_NAME, 'Failed to load the amp-img or amp-video.');
        });
    });
  }

  /**
   * Animate background transition.
   * @private
   * @param {?Element} fillElement
   */
  animateBlur_(fillElement) {
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
   * Gets a list of the active page's amp-img or amp-video elements
   * sorted by size (possibly empty).
   * @private
   * @param {!Element} pageElement
   * @return {!Array<Element>}
   */
  getBiggestMediaElements_(pageElement) {
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
    ).sort((firstEl, secondEl) => getSize(secondEl) - getSize(firstEl));
  }
}
