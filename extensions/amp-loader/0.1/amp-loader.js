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
import {createSpinnerDom} from './spinner';
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
 * Elements will get a default gray background if they don't already have a
 * placeholder. This list does not include video players which are detected
 * using `isIframeVideoPlayerComponent`
 * @enum {boolean}
 * @private  Visible for testing only!
 */
const LOADER_BACKGROUND_TAGS = {
  'AMP-IMG': true,
  'AMP-ANIM': true,
  'AMP-PINTEREST': true,
  'AMP-INSTAGRAM': true,
  'AMP-GOOGLE-DOCUMENT-EMBED': true,
};

/**
 * Used to cache the loader DOM once created, so we do not need to recreate it
 * each time.
 * @type {?Element}
 */
let loaderDom = null;

/**
 * @param {!AmpElement} element Used to get a document to build HTML with.
 * @return {!Element} The loader DOM.
 */
function getLoaderDom(element) {
  if (!loaderDom) {
    const html = htmlFor(element);
    /*
     * The outer div here is needed for two reasons:
     * 1. Applying a background color when there is no placeholder.
     * 2. Backwards compatibility with the existing method and documentation
     *    for customizing loaders, which includes a style to hide the old three
     *    dots via:
     *    ```
     *    .my-custom-loader .amp-active > div {
     *     display: none;
     *    }
     *    ```
     */
    loaderDom = html`
      <div class="i-amphtml-new-loader">
        <div class="i-amphtml-new-loader-shim"></div>
        <div class="i-amphtml-new-loader-logo"></div>
      </div>
    `;
    loaderDom.appendChild(createSpinnerDom(html));
  }

  return loaderDom.cloneNode(true);
}

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

    /** @private {?Element} */
    this.loaderRoot_ = null;
  }

  /**
   * Builds the loader's DOM.
   */
  build() {
    this.loaderRoot_ = getLoaderDom(this.element_);
    this.domRoot_.appendChild(this.loaderRoot_);
    this.maybeAddLoadingBackground_();
    this.maybeAddLoaderAnimation_();
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
      this.loaderRoot_.classList.add('i-amphtml-new-loader-has-shim');
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
      return this.loaderRoot_.classList.add(sizeClassDefault);
    }

    // Other than Ads, small spinner is always used if element is small.
    if (this.isSmall_()) {
      return this.loaderRoot_.classList.add(sizeClassSmall);
    }

    // If host is not small, default size spinner is normally used
    // unless due to branding guidelines (e.g. Instagram) a larger spinner is
    // required.
    if (this.requiresLargeSpinner_()) {
      return this.loaderRoot_.classList.add(sizeClassLarge);
    }
    return this.loaderRoot_.classList.add(sizeClassDefault);
  }

  /**
   * Adds the spinner.
   * @private
   */
  addLogo_() {
    const {color, content = this.getDefaultLogo_()} = this.getCustomLogo_();

    this.loaderRoot_
      .querySelector('.i-amphtml-new-loader-logo')
      .appendChild(content);

    if (color) {
      setStyle(this.loaderRoot_, 'color', color);
    }
  }

  /**
   * @return {boolean} True if the currently loading element has background
   * content via a placeholder or poster.
   * @private
   */
  hasBackgroundContent_() {
    const hasPlaceholder = !!this.element_.getPlaceholder();
    const hasPoster = this.element_.hasAttribute('poster');

    return hasPlaceholder || hasPoster;
  }

  /**
   * @return {boolean} True if the loaderBackground should be used for the
   * element.
   * @private
   */
  tagNeedsBackground_() {
    const {tagName} = this.element_;

    return (
      LOADER_BACKGROUND_TAGS[tagName] || isIframeVideoPlayerComponent(tagName)
    );
  }

  /**
   * Add a gray loading background if needed based on the element's content
   * and tagName.
   * @private
   */
  maybeAddLoadingBackground_() {
    if (!this.hasBackgroundContent_() && this.tagNeedsBackground_()) {
      this.domRoot_.classList.add('i-amphtml-loader-background');
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
    if (this.isAd_()) {
      return {
        content: this.getAdsLogo_(),
      };
    }

    if (isIframeVideoPlayerComponent(this.element_.tagName)) {
      return {
        content: this.getVideoPlayerLogo_(),
      };
    }

    return this.element_.createLoaderLogo();
  }

  /**
   * @return {!Element} The logo for video players
   * @private
   */
  getVideoPlayerLogo_() {
    // Keeping the video logo here short term.
    // This is because there is no single CSS for all players, there is
    // video-interface but not all players implement it. Also the SVG is not
    // that big.
    // TODO(sparhami) Figure out how to move this out of amp-loader.
    const html = htmlFor(this.element_);
    return html`
      <svg viewBox="0 0 72 72">
        <path
          class="i-amphtml-new-loader-white-on-shim"
          fill="currentColor"
          d="M41,34.5V31c0-0.5-0.4-1-1-1H27c-0.5,0-1,0.5-1,1v10c0,0.6,0.5,1,1,1h13c0.6,0,1-0.4,1-1v-3.5l5,4v-11L41,34.5z"
        />
      </svg>
    `;
  }

  /**
   * Returns the default logo.
   * @return {!Element}
   * @private
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
   * `<amp-ad>s` have several different classes, so putting the code here for
   * now since it is the safest way to make sure that they all get the correct
   * loader.
   *
   * Since the implementation may have a delay before loading, we would need to
   * make sure the ads loader is present, even if the implementation has not
   * yet downloaded.
   *
   * TODO(sparhami) Move this out of amp-loader into something common for ads.
   * @return {!Element}
   * @private
   */
  getAdsLogo_() {
    const html = htmlFor(this.element_);
    return html`
      <div class="i-amphtml-new-loader-ad-logo">
        <span class="i-amphtml-new-loader-ad-label">
          Ad
        </span>
      </div>
    `;
  }

  /**
   * Whether the element is an Ad. Note that this does not cover amp-embed
   * currently.
   * @private
   * @return {boolean}
   */
  isAd_() {
    return this.element_.tagName == 'AMP-AD';
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
