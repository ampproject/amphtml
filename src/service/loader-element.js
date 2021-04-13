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

import {Services} from '../services';

/**
 * Gets a Promise for the LoaderService, initiating a request to download the
 * code.
 * @param {!./ampdoc-impl.AmpDoc} ampDoc
 * @param {!Element} element
 * @return {!Promise<!../../extensions/amp-loader/0.1/amp-loader.LoaderService>}
 */
function getLoaderServicePromise(ampDoc, element) {
  return Services.extensionsFor(ampDoc.win)
    .installExtensionForDoc(ampDoc, 'amp-loader')
    .then(() => Services.loaderServiceForDoc(element));
}

/**
 * Creates a default "loading indicator" element based on the new design.
 *
 * Please see https://github.com/ampproject/amphtml/issues/20237 for details,
 * screenshots and various states of the new loader design.
 * @param {!./ampdoc-impl.AmpDoc} ampDoc
 * @param {!AmpElement} element
 * @param {number} elementWidth
 * @param {number} elementHeight
 * @param {number=} startTime
 * @return {!Element} The loader root element.
 */
export function createLoaderElement(
  ampDoc,
  element,
  elementWidth,
  elementHeight,
  startTime = ampDoc.win.Date.now()
) {
  // We create the loader root element up front, since it is needed
  // synchronously. We create the actual element with animations when the
  // service is ready.
  const loaderRoot = element.ownerDocument.createElement('div');

  getLoaderServicePromise(ampDoc, element).then((loaderService) => {
    const endTime = ampDoc.win.Date.now();
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
