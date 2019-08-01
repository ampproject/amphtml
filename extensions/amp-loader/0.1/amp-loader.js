/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {CSS} from '../../../build/amp-loader-0.1.css';
import {Services} from '../../../src/services';
import {htmlFor} from '../../../src/static-template';
import {installStylesForDoc} from '../../../src/style-installer';
import {isIframeVideoPlayerComponent} from '../../../src/layout';
import {setImportantStyles, setStyle} from '../../../src/style';

/**
 * @fileoverview This file implements the new AMP loader as an extension. This
 *    allows loading the runtime without incurring the cost of the loader code.
 *    The loader has a 600ms delay before appearing. This delay is offset by
 *    the amount of time it took to load the extension.
 */

// How long before the loader appears, in milliseconds. This matches the
// minimum animation delay specified in the CSS.
const LOADER_APPEAR_TIME = 600;

/**
 * Elements will get a default gray placeholder if they don't already have a
 * placeholder. This list does not include video players which are detected
 * using `isIframeVideoPlayerComponent`
 * @enum {boolean}
 * @private  Visible for testing only!
 */
const DEFAULT_PLACEHOLDER_WHITELIST_NONE_VIDEO = {
  'AMP-IMG': true,
  'AMP-ANIM': true,
  'AMP-PINTEREST': true,
  'AMP-INSTAGRAM': true,
  'AMP-GOOGLE-DOCUMENT-EMBED': true,
};

/**
 * Helper class to build the new loader's DOM.
 */
class LoaderBuilder {
  /**
   * @param {!AmpElement} element
   * @param {!Element} domRoot
   * @param {number} elementWidth
   * @param {number} elementHeight
   */
  constructor(element, domRoot, elementWidth, elementHeight) {
    /** @private @const {!AmpElement} */
    this.element_ = element;

    /** @private @const {?Element} */
    this.domRoot_ = domRoot;

    /** @private @const  {number} */
    this.layoutWidth_ = elementWidth;

    /** @private @const  {number} */
    this.layoutHeight_ = elementHeight;
  }

  /**
   * Builds the loader's DOM.
   */
  build() {
    this.buildContainers_();
    this.maybeAddDefaultPlaceholder_();
    this.maybeAddLoaderAnimation_();
  }

  /**
   * Builds the wrappers for the loader.
   * @private
   */
  buildContainers_() {
    // TODO(sparhami) Cache the generated spinner DOM and `cloneNode(true)`.
    this.domRoot_.appendChild(this.createSpinnerDom_());
  }

  /**
   * @return {!Element}
   */
  createSpinnerDom_() {
    /*
     * There is an extra inner div here for backward compatibility with
     * customizing loaders. The common and documented CSS for customizing
     * loaders includes a style to hide the old three dots via:
     *  .my-custom-loader .amp-active > div {
     *     display: none;
     *  }
     * The extra div mimic a similar DOM.
     */
    const html = htmlFor(this.element_);
    return html`
      <div>
        <div class="i-amphtml-new-loader-shim"></div>
        <div class="i-amphtml-new-loader-logo"></div>
        <svg class="i-amphtml-new-loader-spinner" viewbox="0 0 48 48">
          <path
            class="i-amphtml-new-loader-spinner-path"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5px"
            d="
                M 24 2 A 22 22 0 1 0 24.01 2
                M 24.00 2.00 a 22 22 0 1 0 0.00 0.00
                M 73.15 2.03 a 22 22 0 1 0 3.42 0.45
                M 122.30 2.12 a 22 22 0 1 0 6.65 1.78
                M 171.44 2.27 a 22 22 0 1 0 9.49 3.93
                M 220.57 2.48 a 22 22 0 1 0 11.78 6.80
                M 269.69 2.75 a 22 22 0 1 0 13.36 10.25
                M 318.80 3.08 a 22 22 0 1 0 14.12 14.12
                M 367.88 3.46 a 22 22 0 1 0 14.00 18.24
                M 416.95 3.90 a 22 22 0 1 0 12.93 22.40
                M 465.99 4.40 a 22 22 0 1 0 10.94 26.40
                M 515.00 4.95 a 22 22 0 1 0 8.05 30.05
                M 563.98 5.55 a 22 22 0 1 0 4.37 33.17
                M 612.93 6.20 a 22 22 0 1 0 0.00 35.60
                M 661.85 6.90 a 22 22 0 1 0 -4.90 37.20
                M 710.72 7.65 a 22 22 0 1 0 -10.15 37.87
                M 759.56 8.44 a 22 22 0 1 0 -15.56 37.56
                M 808.35 9.28 a 22 22 0 1 0 -20.92 36.24
                M 857.10 10.15 a 22 22 0 1 0 -26.05 33.94
                M 905.80 11.07 a 22 22 0 1 0 -30.73 30.73
                M 954.45 12.02 a 22 22 0 1 0 -34.80 26.70
                M 1003.05 13.00 a 22 22 0 1 0 -38.11 22.00
                M 1051.60 14.01 a 22 22 0 0 0 -40.53 16.79
                M 1100.10 15.05 a 22 22 0 0 0 -41.98 11.25
                M 1148.54 16.12 a 22 22 0 0 0 -42.42 5.58
                M 1196.92 17.20 a 22 22 0 0 0 -41.85 -0.00
                M 1245.25 18.31 a 22 22 0 0 0 -40.30 -5.31
                M 1293.52 19.43 a 22 22 0 0 0 -37.87 -10.15
                M 1341.73 20.56 a 22 22 0 0 0 -34.66 -14.36
                M 1389.88 21.70 a 22 22 0 0 0 -30.83 -17.80
                M 1438.00 24.00 a 22 22 0 0 0 -22.00 -22.00
                M 1485.73 27.44 a 22 22 0 0 0 -20.58 -25.41
                M 1532.92 30.80 a 22 22 0 0 0 -18.62 -28.68
                M 1579.60 33.99 a 22 22 0 0 0 -16.16 -31.72
                M 1625.80 36.93 a 22 22 0 0 0 -13.22 -34.45
                M 1671.56 39.56 a 22 22 0 0 0 -9.86 -36.81
                M 1716.93 41.80 a 22 22 0 0 0 -6.13 -38.72
                M 1761.99 43.60 a 22 22 0 0 0 -2.10 -40.14
                M 1806.80 44.92 a 22 22 0 0 0 2.15 -41.02
                M 1851.44 45.73 a 22 22 0 0 0 6.55 -41.33
                M 1896.00 46.00 a 22 22 0 0 0 11.00 -41.05
                M 1940.56 45.73 a 22 22 0 0 0 15.42 -40.18
                M 1985.20 44.92 a 22 22 0 0 0 19.73 -38.72
                M 2030.01 43.60 a 22 22 0 0 0 23.83 -36.70
                M 2075.07 41.80 a 22 22 0 0 0 27.65 -34.15
                M 2120.44 39.56 a 22 22 0 0 0 31.11 -31.11
                M 2166.20 36.93 a 22 22 0 1 0 34.15 -27.65
                M 2212.40 33.99 a 22 22 0 1 0 36.70 -23.83
                M 2259.08 30.80 a 22 22 0 1 0 38.72 -19.73
                M 2306.27 27.44 a 22 22 0 1 0 40.18 -15.42
                M 2354.00 24.00 a 22 22 0 1 0 41.05 -11.00
                M 2402.27 20.56 a 22 22 0 1 0 41.33 -6.55
                M 2451.08 17.20 a 22 22 0 1 0 41.02 -2.15
                M 2500.40 14.01 a 22 22 0 1 0 40.14 2.10
                M 2550.20 11.07 a 22 22 0 1 0 38.72 6.13
                M 2600.44 8.44 a 22 22 0 1 0 36.81 9.86
                M 2651.07 6.20 a 22 22 0 1 0 34.45 13.22
                M 2702.01 4.40 a 22 22 0 1 0 31.72 16.16
                M 2753.20 3.08 a 22 22 0 1 0 28.68 18.62
                M 2804.56 2.27 a 22 22 0 1 0 25.41 20.58
                M 2856.00 2.00 a 22 22 0 1 0 22.00 22.00
                M 2905.15 2.03 a 22 22 0 1 0 20.58 25.41
                M 2954.30 2.12 a 22 22 0 1 0 18.62 28.68
                M 3003.44 2.27 a 22 22 0 1 0 16.16 31.72
                M 3052.57 2.48 a 22 22 0 1 0 13.22 34.45
                M 3101.69 2.75 a 22 22 0 1 0 9.86 36.81
                M 3150.80 3.08 a 22 22 0 1 0 6.13 38.72
                M 3199.88 3.46 a 22 22 0 1 0 2.10 40.14
                M 3248.95 3.90 a 22 22 0 1 0 -2.15 41.02
                M 3297.99 4.40 a 22 22 0 1 0 -6.55 41.33
                M 3347.00 4.95 a 22 22 0 1 0 -11.00 41.05
                M 3395.98 5.55 a 22 22 0 1 0 -15.42 40.18
                M 3444.93 6.20 a 22 22 0 1 0 -19.73 38.72
                M 3493.85 6.90 a 22 22 0 1 0 -23.83 36.70
                M 3542.72 7.65 a 22 22 0 1 0 -27.65 34.15
                M 3591.56 8.44 a 22 22 0 0 0 -31.11 31.11
                M 3640.35 9.28 a 22 22 0 0 0 -34.15 27.65
                M 3689.10 10.15 a 22 22 0 0 0 -36.70 23.83
                M 3737.80 11.07 a 22 22 0 0 0 -38.72 19.73
                M 3786.45 12.02 a 22 22 0 0 0 -40.18 15.42
                M 3835.05 13.00 a 22 22 0 0 0 -41.05 11.00
                M 3883.60 14.01 a 22 22 0 0 0 -41.33 6.55
                M 3932.10 15.05 a 22 22 0 0 0 -41.02 2.15
                M 3980.54 16.12 a 22 22 0 0 0 -40.14 -2.10
                M 4028.92 17.20 a 22 22 0 0 0 -38.72 -6.13
                M 4077.25 18.31 a 22 22 0 0 0 -36.81 -9.86
                M 4125.52 19.43 a 22 22 0 0 0 -34.45 -13.22
                M 4173.73 20.56 a 22 22 0 0 0 -31.72 -16.16
                M 4221.88 21.70 a 22 22 0 0 0 -28.68 -18.62
                M 4269.97 22.85 a 22 22 0 0 0 -25.41 -20.58
            "
          />
        </svg>
      </div>
    `;
  }

  /**
   * Adds a combination of spinner/logo if element is eligible based on
   * certain heuristics.
   */
  maybeAddLoaderAnimation_() {
    // If very small or already has image placeholder, no loader animation.
    if (this.isTiny_() || this.hasBlurryImagePlaceholder_()) {
      return;
    }

    this.setSize_();
    if (this.requiresBackgroundShim_()) {
      this.domRoot_.classList.add('i-amphtml-new-loader-has-shim');
    }
    this.addLogo_();
  }

  /**
   * Sets the size of the loader based element's size and a few special cases.
   * @private
   * @return {undefined}
   */
  setSize_() {
    const sizeClassDefault = 'i-amphtml-new-loader-size-default';
    const sizeClassSmall = 'i-amphtml-new-loader-size-small';
    const sizeClassLarge = 'i-amphtml-new-loader-size-large';

    // Ads always get the default spinner regardless of the element size
    if (this.isAd_()) {
      return this.domRoot_.classList.add(sizeClassDefault);
    }

    // Other than Ads, small spinner is always used if element is small.
    if (this.isSmall_()) {
      return this.domRoot_.classList.add(sizeClassSmall);
    }

    // If host is not small, default size spinner is normally used
    // unless due to branding guidelines (e.g. Instagram) a larger spinner is
    // required.
    if (this.requiresLargeSpinner_()) {
      return this.domRoot_.classList.add(sizeClassLarge);
    }
    return this.domRoot_.classList.add(sizeClassDefault);
  }

  /**
   * Adds the spinner.
   * @private
   */
  addLogo_() {
    const {color, content = this.getDefaultLogo_()} = this.getCustomLogo_();

    this.domRoot_
      .querySelector('.i-amphtml-new-loader-logo')
      .appendChild(content);

    if (color) {
      setStyle(this.domRoot_, 'color', color);
    }
  }

  /**
   * Add a gray default placeholder if there isn't a placeholder already and
   * other special cases.
   * @private
   */
  maybeAddDefaultPlaceholder_() {
    const hasPlaceholder = !!this.element_.getPlaceholder();
    const hasPoster = this.element_.hasAttribute('poster');
    if (hasPlaceholder || hasPoster) {
      return;
    }

    // Is it whitelisted for default placeholder?
    const tagName = this.element_.tagName.toUpperCase();
    if (
      DEFAULT_PLACEHOLDER_WHITELIST_NONE_VIDEO[tagName] || // static white list
      isIframeVideoPlayerComponent(tagName) // regex for various video players
    ) {
      const html = htmlFor(this.element_);
      const defaultPlaceholder = html`
        <div placeholder class="i-amphtml-default-placeholder"></div>
      `;
      this.element_.insertBefore(defaultPlaceholder, this.element_.lastChild);
    }
  }

  /**
   * Returns the custom logo for the element if there is one.
   * @private
   * @return {{
   *  content: (!Element|undefined),
   *  color: (string|undefined),
   * }}
   */
  getCustomLogo_() {
    // Keeping the video logo here short term.
    // This is because there is no single CSS for all players, there is
    // video-interface but not all players implement it. Also the SVG is not
    // that big.
    // We need to move most of loaders code out of v0 anyway, see
    // https://github.com/ampproject/amphtml/issues/23108.
    if (isIframeVideoPlayerComponent(this.element_.tagName)) {
      const html = htmlFor(this.element_);
      const content = html`
        <svg viewBox="0 0 72 72">
          <path
            class="i-amphtml-new-loader-white-on-shim"
            fill="currentColor"
            d="M41,34.5V31c0-0.5-0.4-1-1-1H27c-0.5,0-1,0.5-1,1v10c0,0.6,0.5,1,1,1h13c0.6,0,1-0.4,1-1v-3.5l5,4v-11L41,34.5z"
          />
        </svg>
      `;
      return {
        content,
      };
    }
    return this.element_.createLoaderLogo();
  }

  /**
   * Returns the default logo.
   * @private
   * @return {!Element}
   */
  getDefaultLogo_() {
    const html = htmlFor(this.element_);
    return html`
      <svg class="i-amphtml-new-loader-logo-default" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r="12"></circle>
      </svg>
    `;
  }

  /**
   * Whether the element is an Ad.
   * @private
   * @return {boolean}
   */
  isAd_() {
    // Not Implemented
    return false;
  }

  /**
   * Whether the element is small.
   * Small elements get a different loader with does not have a logo and is
   * just a spinner.
   * @private
   * @return {boolean}
   */
  isSmall_() {
    return (
      !this.isTiny_() && (this.layoutWidth_ <= 100 || this.layoutHeight_ <= 100)
    );
  }

  /**
   * Very small layout are not eligible for new loaders.
   * @return {boolean}
   */
  isTiny_() {
    return this.layoutWidth_ < 50 || this.layoutHeight_ < 50;
  }

  /**
   * Whether element has an image blurry placeholder
   * @return {boolean}
   */
  hasBlurryImagePlaceholder_() {
    const placeholder = this.element_.getPlaceholder();
    return (
      placeholder &&
      placeholder.classList.contains('i-amphtml-blurry-placeholder')
    );
  }

  /**
   * Whether loaders needs the translucent background shim, this is normally
   * needed when the loader is on top of an image placeholder:
   *    - placeholder is `amp-img` or `img` (`img` handles component
   *      placeholders like `amp-youtube`)
   *    - Element has implicit placeholder like a `poster` on video
   * @private
   * @return {boolean}
   */
  requiresBackgroundShim_() {
    if (this.element_.hasAttribute('poster')) {
      return true;
    }
    const placeholder = this.element_.getPlaceholder();
    if (!placeholder) {
      return false;
    }

    if (placeholder.tagName == 'AMP-IMG' || placeholder.tagName == 'IMG') {
      return true;
    }
    return false;
  }

  /**
   * Some components such as Instagram require larger spinner due to
   * branding guidelines.
   * @private
   * @return {boolean}
   */
  requiresLargeSpinner_() {
    // Not Implemented
    return false;
  }
}

export class LoaderService {
  /**
   * @param {!AmpElement} element
   * @param {!Element} loaderRoot
   * @param {number} initDelay
   * @param {number} elementWidth
   * @param {number} elementHeight
   */
  initializeLoader(
    element,
    loaderRoot,
    initDelay,
    elementWidth,
    elementHeight
  ) {
    // Cap the loader delay so that the loader appears immediately, rather than
    // starting part way through the animation.
    const loaderDelay = Math.min(initDelay, LOADER_APPEAR_TIME);
    const lb = new LoaderBuilder(
      element,
      loaderRoot,
      elementWidth,
      elementHeight
    );
    lb.build();

    setImportantStyles(element, {
      '--loader-delay-offset': `${loaderDelay}ms`,
    });
  }
}

AMP.extension('amp-loader', '0.1', AMP => {
  AMP.registerServiceForDoc('loader', LoaderService);
  Services.extensionsFor(AMP.win).addDocFactory(ampDoc => {
    installStylesForDoc(ampDoc, CSS, () => {}, false, 'amp-loader');
  });
});
