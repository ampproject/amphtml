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

import {htmlFor} from './static-template';

/**
 * Creates a default "loading indicator" element based on the new design.
 *
 * Please see https://github.com/ampproject/amphtml/issues/20237 for details,
 * screenshots and various states of the new loader design.
 *
 * @param {!Document} doc
 * @param {!Element} container
 * @param {!AmpElement} element
 * @return {!Element}
 */
export function createLoaderElement(doc, container, element) {
  const loader = new LoaderBuilder();
  return loader.build();
}

class LoaderBuilder {
  /**
   *
   */
  constructor() {
    this.loaderDom_;
  }

  /**
   *
   */
  build() {
    this.buildBase();
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
    if (this.isAd(element)) {
      return this.addDefaultSpinner();
    }

    // Other than Ads, small spinner is always used if host element is small.
    if (this.isSmall(element)) {
      return this.addSmallSpinner();
    }

    // If host is not small, default size spinner is normally used
    // unless due to branding guidelines (e.g. Instagram) a larger spinner is
    // required.
    if (this.requiresLargeSpinner(element)) {
      return this.addLargeSpinner();
    }
    return this.addDefaultSpinner();
  }

  /**
   *
   */
  maybeAddLogo() {
    // Ads always get the logo regardless of size
    if (this.isAd(element)) {
      return this.addLogo(AD_LOGO);
    }

    // Small hosts do not get a logo
    if (this.isSmall(element)) {
      return;
    }

    const logo = this.getCustomLogo(element);
    if (logo) {
     return this.addLogo(logo);
    }

    return this.addLogo(DEFAULT_LOGO);
  }

  /**
   *
   */
  maybeAddBackgroundShim() {
    if(!this.hasImagePlaceholder()) {
      return;
    }

    // Add shim

    return;
  }
}