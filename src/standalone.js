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

/** @type {?Promise<!../extensions/amp-standalone/0.1/amp-standalone.StandaloneService>} */
const standaloneServicePromise = null;

/**
 * Gets a Promise for the LoaderService, initiating a request to download the
 * code.
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Element} element
 * @return {!Promise<!../extensions/amp-standalone/0.1/amp-standalone.StandaloneService>}
 */
function getStandaloneServicePromise(ampdoc, element) {
  if (!standaloneServicePromise) {
    standaloneServicePromise = Services.extensionsFor(ampdoc.win)
      .installExtensionForDoc(ampdoc, 'amp-standalone')
      .then(() => Services.standaloneServiceForDoc(element));
  }

  return standaloneServicePromise;
}

/**
 * Creates a default "loading indicator" element based on the new design.
 *
 * Please see https://github.com/ampproject/amphtml/issues/20237 for details,
 * screenshots and various states of the new loader design.
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 */
export function initializeStandalone(ampdoc) {
  if (!Services.platformFor(ampdoc.win).isStandalone()) {
    return;
  }

  getStandaloneServicePromise(ampdoc).then(standaloneService => {
    standaloneService.initialize();
  });
}
