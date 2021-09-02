import {isIframeVideoPlayerComponent} from '#core/dom/layout';
import {htmlFor} from '#core/dom/static-template';
import {setImportantStyles, setStyle} from '#core/dom/style';

import {Services} from '#service';

import {CSS} from '../../../build/amp-loader-0.1.css';
import {installStylesForDoc} from '../../../src/style-installer';

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
 * @param {function(!Array<string>):!Element} html
 * @return {!Element}
 */
function createSpinnerDom(html) {
  // Extra wrapping div here is to workaround:
  // https://bugs.chromium.org/p/chromium/issues/detail?id=1002748
  // eslint-disable max-len
  const content = html`
    <div class="i-amphtml-new-loader-spinner-wrapper">
      <svg class="i-amphtml-new-loader-spinner" viewBox="0 0 48 48">
        <path
          class="i-amphtml-new-loader-spinner-path"
          fill="none"
          d="M24 2a22 22 0 10.01 0m33.27 5.65a22 22 0 102.74-2.1m46.13 1.35a22 22 0 105.96-3.44m42.96 2.74a22 22 0 109.49-3.93m39.46 3.28a22 22 0 1013.13-3.52M253 4.95a22 22 0 1016.69-2.2m32.32 1.65a22 22 0 1019.98 0m29.06-.5a22 22 0 1022.79 3m26.28-3.44a22 22 0 1024.98 6.69m24.1-7.07a22 22 0 1026.4 10.94m22.71-11.27a22 22 0 1026.94 15.56m22.18-15.83a22 22 0 1026.54 20.37m22.59-20.58a22 22 0 1025.17 25.17M645.7 2.12a22 22 0 1022.84 29.76m26.31-29.85a22 22 0 1019.6 33.95M744 2a22 22 0 1015.56 37.56m33.59-37.53a22 22 0 1010.83 40.42M842.3 2.12a22 22 0 105.58 42.42m43.56-42.27a22 22 0 100 43.46m49.13-43.25a22 22 0 10-5.73 43.49m54.85-43.22a22 22 0 10-11.39 42.5m60.5-42.17a22 22 0 00-16.79 40.53m65.87-40.15a22 22 0 00-21.73 37.64m70.8-37.2a22 22 0 00-26.05 33.94m75.09-33.44a22 22 0 00-29.59 29.59M1235 4.95a22 22 0 00-32.25 24.75m81.23-24.15a22 22 0 00-33.95 19.6m82.9-18.95a22 22 0 00-34.66 14.36m83.58-13.66a22 22 0 00-34.38 9.21m83.25-8.46a22 22 0 00-33.17 4.37m82.01-3.58a22 22 0 00-31.11 0m81.35 2.63a22 22 0 00-32.52-3.42m82.32 6.36a22 22 0 00-33.45-7.11m82.77 10.3a22 22 0 00-33.85-11m82.66 14.36a22 22 0 00-33.71-15.01M1726 24a22 22 0 00-33-19.05m80.73 22.49a22 22 0 00-31.72-23.04m78.91 26.4a22 22 0 00-29.87-26.9m76.55 30.09a22 22 0 00-27.49-30.53m73.69 33.47a22 22 0 00-24.6-33.85m70.36 36.48a22 22 0 00-21.25-36.81m66.62 39.05a22 22 0 00-17.51-39.32m62.57 41.12a22 22 0 00-13.43-41.33m58.24 42.65a22 22 0 00-9.1-42.8m53.74 43.61a22 22 0 00-4.59-43.7M2184 46a22 22 0 100-44m44.56 43.73a22 22 0 104.59-43.7m40.05 42.89a22 22 0 109.1-42.8m35.71 41.48a22 22 0 1013.43-41.33m31.63 39.53a22 22 0 1017.51-39.32m27.86 37.08a22 22 0 1021.25-36.81m24.51 34.18a22 22 0 1024.6-33.85m21.6 30.91a22 22 0 1027.49-30.53m19.19 27.34a22 22 0 1029.87-26.9m17.32 23.54a22 22 0 1031.72-23.04M2642 24a22 22 0 1033-19.05m15.27 15.61a22 22 0 1033.71-15.01m15.1 11.65a22 22 0 1033.85-11m15.47 7.81a22 22 0 1033.45-7.11m16.35 4.17a22 22 0 1032.52-3.42m17.72.79a22 22 0 1031.11 0m17.73-.79a22 22 0 1032.52 3.42m16.35-4.17a22 22 0 1033.45 7.11m15.47-7.81a22 22 0 1033.85 11m15.1-11.65a22 22 0 1033.71 15.01M3133 4.95A22 22 0 103166 24m16.01-19.6a22 22 0 1031.72 23.04m17.32-23.54a22 22 0 1029.87 26.9m19.2-27.34a22 22 0 1027.49 30.53m21.59-30.91a22 22 0 1024.6 33.85m24.51-34.18a22 22 0 1021.25 36.81m27.87-37.08a22 22 0 1017.51 39.32m31.62-39.53a22 22 0 1013.43 41.33m35.71-41.48a22 22 0 109.1 42.8m40.05-42.89a22 22 0 104.59 43.7M3624 2a22 22 0 100 44m49.15-43.97a22 22 0 00-4.59 43.7m53.74-43.61a22 22 0 00-9.1 42.8m58.24-42.65a22 22 0 00-13.43 41.33m62.56-41.12a22 22 0 00-17.51 39.32m66.63-39.05a22 22 0 00-21.25 36.81m70.36-36.48a22 22 0 00-24.6 33.85m73.68-33.47a22 22 0 00-27.49 30.53m76.56-30.09a22 22 0 00-29.87 26.9m78.91-26.4a22 22 0 00-31.72 23.04M4115 4.95A22 22 0 004082 24m81.98-18.45a22 22 0 00-33.71 15.01m82.66-14.36a22 22 0 00-33.85 11m82.77-10.3a22 22 0 00-33.45 7.11m82.32-6.36a22 22 0 00-32.52 3.42"
        ></path>
      </svg>
    </div>
  `;
  // eslint-enable max-len

  return content;
}

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
        ></path>
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
        <span class="i-amphtml-new-loader-ad-label"> Ad </span>
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

AMP.extension('amp-loader', '0.1', (AMP) => {
  AMP.registerServiceForDoc('loader', LoaderService);
  Services.extensionsFor(AMP.win).addDocFactory((ampDoc) => {
    installStylesForDoc(ampDoc, CSS, () => {}, false, 'amp-loader');
  });
});
