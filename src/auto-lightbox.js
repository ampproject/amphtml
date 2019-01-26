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

import {ChunkPriority, chunk} from './chunk';
import {Services} from './services';
import {isExperimentOn} from './experiments';


/** @const @enum {string} */
export const AutoLightboxEvents = {
  // Triggered when the lightbox attribute is newly set on an item in order to
  // process by the renderer extension (e.g. amp-lightbox-gallery).
  NEWLY_SET: 'amp-auto-lightbox:newly-set',
};


/**
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installAutoLightboxExtension(ampdoc) {
  const {win} = ampdoc;
  if (!isExperimentOn(win, 'amp-auto-lightbox')) {
    return;
  }
  chunk(ampdoc, () => {
    Services.extensionsFor(win)
        .installExtensionForDoc(ampdoc, 'amp-auto-lightbox');
  }, ChunkPriority.LOW);
}
