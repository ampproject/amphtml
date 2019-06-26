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

import {dev, devAssert} from './log';
import {htmlFor, htmlRefs, svgFor} from './static-template';
import {isExperimentOn} from './experiments';
import {toWin} from './types';

/* LEGACY LOADER */

/** @private @const */
const LINE_LOADER_ELEMENTS = {
  'AMP-AD': true,
};

/**
 * Creates a default "loading indicator" element. This element accepts
 * `amp-active` class in which case it may choose to run an animation.
 * @param {!Document} doc
 * @param {string} elementName
 * @return {!Element}
 */
export function createLegacyLoaderElement(doc, elementName) {
  if (LINE_LOADER_ELEMENTS[elementName.toUpperCase()]) {
    return htmlFor(doc)`<div class="i-amphtml-loader-line">
          <div class="i-amphtml-loader-moving-line"></div>
        </div>`;
  }
  return htmlFor(doc)`<div class="i-amphtml-loader">
        <div class="i-amphtml-loader-dot"></div>
        <div class="i-amphtml-loader-dot"></div>
        <div class="i-amphtml-loader-dot"></div>
      </div>`;
}

/* NEW LOADER */

/**
 * Creates a default "loading indicator" element based on the new design.
 *
 * Please see https://github.com/ampproject/amphtml/issues/20237 for details,
 * screenshots and various states of the new loader design.
 *
 * @param {!Document} doc
 * @param {!Element} loadingContainer
 * @param {!Element} element
 * @return {!Element} new loader root element
 */
export function createNewLoaderElement(doc, loadingContainer, element) {
  devAssert(!isNewLoaderIneligible(element));
  devAssert(isNewLoaderExperimentEnabled(toWin(doc.defaultView)));

  const loader = new LoaderBuilder(doc, loadingContainer, element);
  return loader.build();
}

/**
 * Helper class to build the new loader's DOM.
 */
class LoaderBuilder {
  /**
   * @param {!Document} doc
   * @param {!Element} loadingContainer
   * @param {!Element} element
   */
  constructor(doc, loadingContainer, element) {
    /** @private {!Document} */
    this.doc_ = doc;

    /** @private {!Element} */
    this.loadingContainer_ = loadingContainer;

    /** @private {!Element} */
    this.element_ = element;

    /** @private {?Element} */
    this.domRoot_;

    /** @private {?Element} */
    this.svgRoot_;
  }

  /**
   * Builds the loader's DOM and returns the element.
   * @return {!Element} new loader root element
   */
  build() {
    this.buildContainers_();
    this.setSize_();
    this.addSpinner_();
    this.maybeAddLogo_();
    this.maybeAddBackgroundShim_();
    this.maybeAddDefaultPlaceholder_();
    return dev().assertElement(this.domRoot_);
  }

  /**
   * Builds the wrappers for the loader.
   * @private
   */
  buildContainers_() {
    const html = htmlFor(this.element_);
    this.domRoot_ = html`
      <div class="i-amphtml-new-loader">
        <div ref="innerContainer">
          <svg
            ref="svgRoot"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="24 24 72 72"
          ></svg>
        </div>
      </div>
    `;

    /**
     * There is an extra inner div here for backward compatibility with
     * customizing loaders. The common and documented CSS for customizing
     * loaders includes a style to hide the old three dots via:
     *  .my-custom-loader .amp-active > div {
     *     display: none;
     *  }
     * The extra div mimic a similar DOM.
     */
    const refs = htmlRefs(this.domRoot_);
    const innerContainer = dev().assertElement(refs['innerContainer']);
    this.svgRoot_ = dev().assertElement(refs['svgRoot']);

    innerContainer.appendChild(this.svgRoot_);
  }

  /**
   * Add a spinner based on element's size and a few special cases.
   * @private
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
  addSpinner_() {
    const svg = svgFor(this.doc_);
    const spinner = svg`
      <g class="i-amphtml-new-loader-spinner">
        <circle class="i-amphtml-new-loader-spinner-segment" cx="60" cy="60">
        </circle>
        <circle class="i-amphtml-new-loader-spinner-segment" cx="60" cy="60">
        </circle>
        <circle class="i-amphtml-new-loader-spinner-segment" cx="60" cy="60">
        </circle>
        <circle class="i-amphtml-new-loader-spinner-segment" cx="60" cy="60">
        </circle>
      </g>
    `;

    this.svgRoot_.appendChild(spinner);
  }

  /**
   * Adds the default or branded logo.
   * @private
   */
  maybeAddLogo_() {
    const logo = this.getLogo_();

    // Ads always get the logo regardless of size
    if (this.isAd_()) {
      return this.addLogo_(logo);
    }

    // Small hosts do not get a logo
    if (this.isSmall_()) {
      return;
    }

    return this.addLogo_(logo);
  }

  /**
   * Returns the logo for the element.
   * @private
   * @return {!Element}
   */
  getLogo_() {
    const logo = this.getCustomLogo_();
    return logo || this.getDefaultLogo_();
  }

  /**
   * Returns the custom logo for the element if there is one.
   * @private
   * @return {?Element}
   */
  getCustomLogo_() {
    // Not Implemented
    return null;
  }

  /**
   * Returns the default logo.
   * @private
   * @return {!Element}
   */
  getDefaultLogo_() {
    const svg = svgFor(this.doc_);
    return svg`
      <circle
        class="i-amphtml-new-loader-logo"
        cx="60"
        cy="60"
        r="12"
        fill="#aaaaaa"
      >
      </circle>
    `;
  }

  /**
   * Adds the given logo to the loader.
   * @param {!Element} logo
   */
  addLogo_(logo) {
    this.svgRoot_.appendChild(logo);
  }

  /**
   * Adds the background shim under the loader for cases where loader is on
   * top of an image.
   * @private
   */
  maybeAddBackgroundShim_() {
    if (!this.hasImagePlaceholder_()) {
      return;
    }

    // Not Implemented

    return;
  }

  /**
   * Add a gray default placeholder if there isn't a placeholder already and
   * other special cases.
   * @private
   */
  maybeAddDefaultPlaceholder_() {
    // NOTE(aghassemi): I do believe we need to exclude amp-list here, but
    // let's see how experimentation goes. Maybe a better idea is to have a
    // white list, any component that does not fully load a new background may
    // look bad if a gray placeholder shows up and goes away quickly. This
    // default placeholder is good for image, video, etc.. but amp-list which
    // usually just loads text is debatable. amp-iframe is also a candidate
    // to exclude, often it does load a video or maps but it may not load
    // text on transparent background in certain cases.
    if (!hasPlaceholder(this.element_)) {
      this.loadingContainer_.classList.add('i-amphtml-default-placeholder');
    }
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
    const box = this.element_.getLayoutBox();
    return !isTiny(this.element_) && (box.width <= 100 || box.height <= 100);
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

  /**
   * Whether element has an existing image placeholder.
   * @private
   * @return {boolean}
   */
  hasImagePlaceholder_() {
    // Not Implemented
    return false;
  }
}

/**
 * Whether the new loader experiment is enabled.
 * @param {!Window} win
 * @return {boolean}
 */
export function isNewLoaderExperimentEnabled(win) {
  return isExperimentOn(win, 'new-loaders');
}

/**
 * Whether the element is eligible for loaders based on new loader heuristics
 * This is is called by `isLoadingEnabled_` in `custom-element.js`
 * and is additional heuristics to what `isLoadingEnabled_` checks.
 * @param {!AmpElement} element
 * @return {boolean}
 */
export function isNewLoaderIneligible(element) {
  const result = isTiny(element) || hasBlurryImagePlaceholder(element);
  return result;
}

/**
 * Very small layout are not eligible for new loaders.
 * @param {!AmpElement} element
 * @return {boolean}
 */
function isTiny(element) {
  const box = element.getLayoutBox();
  return box.width < 50 || box.height < 50;
}

/**
 * Whether element has an image blurry placeholder
 * @param {!AmpElement} element
 * @return {boolean}
 */
function hasBlurryImagePlaceholder(element) {
  const placeholder = element.getPlaceholder();
  return (
    placeholder &&
    placeholder.classList.contains('i-amphtml-blurry-placeholder')
  );
}

/**
 * Whether an element already has a placeholder or not.
 * @param {!AmpElement} element
 * @return {boolean}
 */
function hasPlaceholder(element) {
  return !!element.getPlaceholder();
}
