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

import {Services} from './services';
import {devAssert} from './log';
import {htmlFor} from './static-template';
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
/** @type {?Promise<!../extensions/amp-loader/0.1/amp-loader.LoaderService>} */
let loaderServicePromise = null;

/**
 * Gets a Promise for the LoaderService, initiating a request to download the
 * code.
 * @param {!./service/ampdoc-impl.AmpDoc} ampDoc
 * @param {!Element} element
 * @return {!Promise<!../extensions/amp-loader/0.1/amp-loader.LoaderService>}
 */
function getLoaderServicePromise(ampDoc, element) {
  if (!loaderServicePromise) {
    loaderServicePromise = Services.extensionsFor(ampDoc.win)
      .installExtensionForDoc(ampDoc, 'amp-loader')
      .then(() => Services.loaderServiceForDoc(element));
  }

  return loaderServicePromise;
}

/**
 * Creates a default "loading indicator" element based on the new design.
 *
 * Please see https://github.com/ampproject/amphtml/issues/20237 for details,
 * screenshots and various states of the new loader design.
 * @param {!./service/ampdoc-impl.AmpDoc} ampDoc
 * @param {!AmpElement} element
 * @param {number} elementWidth
 * @param {number} elementHeight
 * @return {!Element} New loader root element
 */
export function createNewLoaderElement(
  ampDoc,
  element,
  elementWidth,
  elementHeight
) {
  devAssert(isNewLoaderExperimentEnabled(element));
  const startTime = Date.now();
  // We create the loader root element up front, since it is needed
  // synchronously. We create the actually element with animations when the
  // service is ready.
  const loaderRoot = element.ownerDocument.createElement('div');
  loaderRoot.className = 'i-amphtml-new-loader';

  getLoaderServicePromise(ampDoc, element).then(loaderService => {
    const endTime = Date.now();
    const initDelay = endTime - startTime;

    loaderService.initializeLoader(
      element,
      loaderRoot,
      initDelay,
      elementWidth,
      elementHeight
    );
  });

  return loaderRoot;
}

/**
 * Whether the new loader experiment is enabled.
 * @param {!AmpElement} element
 * @return {boolean}
 */
export function isNewLoaderExperimentEnabled(element) {
  // TODO(sparhami): Implement loader for Ads
  // Temporarily excluding the amp-ads from this experiment
  if (element.tagName == 'AMP-AD' || element.tagName == 'AMP-EMBED') {
    return false;
  }
  const win = toWin(element.ownerDocument.defaultView);
  return isExperimentOn(win, 'new-loaders');
}
