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

import {dev} from './log';
import {htmlFor} from './static-template';
import {isExperimentOn} from './experiments';
import {toWin} from './types';

/**
 * Creates a default "loading indicator" element based on the new design.
 *
 * Please see https://github.com/ampproject/amphtml/issues/20237 for details,
 * screenshots and various states of the new loader design.
 *
 * @param {!Document} doc
 * @param {!Element} container
 * @return {!Element}
 */
export function createLoaderElement(doc, element) {
  dev().assert(!isLoaderIneligible(element));
  dev().assert(isNewLoaderExperimentEnabled(toWin(doc.defaultView)));

  const loader = new LoaderBuilder(doc, element);
  return loader.build();
}

/**
 * @param {!Document} win
 */
export function isNewLoaderExperimentEnabled(win) {
  return isExperimentOn(win, 'new-loaders');
}

/**
 * @param {!AmpElement} element
 */
export function isLoaderIneligible(element) {
  return isTiny(element);
}

/**
 *
 * @param {*} doc
 */
export function getDefaultPlaceholder(doc) {
  return htmlFor(doc)`<div placeholder style="background:#f8f8f8"></div>`;
}

/**
 *
 * @param {*} element
 */
function isTiny(element) {
  const box = element.getLayoutBox();
  return box.width < 50 || box.height < 50;
}

/**
 *
 */
class LoaderBuilder {
  /**
   *
   * @param {*} doc
   * @param {*} element
   */
  constructor(doc, element) {
    this.doc_ = doc;
    this.element_ = element;
    this.loaderDom_ = htmlFor(this.element_)`<div class="i-amphtml-new-loader">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="24 24 72 72">
    </svg>
    </div>`;
  }

  /**
   *
   */
  build() {
    this.addSpinner();
    this.maybeAddLogo();
    this.maybeAddBackgroundShim();
    return this.loaderDom_;
  }

  /**
   * Add a spinner based on host element's size and a few special cases
   */
  addSpinner() {
    // Ads always get the default spinner regardless of the host size
    if (this.isAd()) {
      return this.addDefaultSpinner();
    }

    // Other than Ads, small spinner is always used if host element is small.
    if (this.isSmall()) {
      return this.addSmallSpinner();
    }

    // If host is not small, default size spinner is normally used
    // unless due to branding guidelines (e.g. Instagram) a larger spinner is
    // required.
    if (this.requiresLargeSpinner()) {
      return this.addLargeSpinner();
    }
    return this.addDefaultSpinner();
  }

  /**
   *
   */
  isAd() {
    return false;
  }

  /**
   *
   */
  isSmall() {
    const box = this.element_.getLayoutBox();
    return !isTiny(this.element_) && (box.width <= 100 || box.height <= 100);
  }

  /**
   *
   */
  requiresLargeSpinner() {
    return false;
  }

  /**
   *
   */
  addDefaultSpinner() {
    const spinner = htmlFor(this.doc_)`<div>Default Spinner</div>`;

    this.loaderDom_.appendChild(spinner);
  }

  /**
   *
   */
  addSmallSpinner() {
    const spinner = htmlFor(this.doc_)`<div>Small Spinner</div>`;

    this.loaderDom_.appendChild(spinner);
  }

  /**
   *
   */
  addLargeSpinner() {
    const spinner = htmlFor(this.doc_)`<div>Large Spinner</div>`;

    this.loaderDom_.appendChild(spinner);
  }

  /**
   *
   */
  maybeAddLogo() {
    // Ads always get the logo regardless of size
    if (this.isAd(this.element_)) {
      return this.addLogo(this.getAdLogo());
    }

    // Small hosts do not get a logo
    if (this.isSmall(this.element_)) {
      return;
    }

    const logo = this.getCustomLogo(this.element_);
    if (logo) {
      return this.addLogo(logo);
    }

    return this.addLogo(this.getDefaultLogo());
  }

  /**
   *
   */
  getCustomLogo() {
    return null;
  }

  /**
   *
   */
  getDefaultLogo() {
    return htmlFor(this.doc_)`<div>Default Logo</div>`;
  }

  /**
   *
   * @param {*} logo
   */
  addLogo(logo) {
    this.loaderDom_.appendChild(logo);
  }

  /**
   *
   */
  maybeAddBackgroundShim() {
    if (!this.hasImagePlaceholder()) {
      return;
    }

    // Add shim

    return;
  }

  /**
   *
   */
  hasImagePlaceholder() {
    return false;
  }
}
