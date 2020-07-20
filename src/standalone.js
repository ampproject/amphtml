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

import {ChunkPriority, chunk} from './chunk';
import {Services} from './services';
import {isAmphtml} from './format';

/**
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installStandaloneExtension(ampdoc) {
  const {win} = ampdoc;
  // Only enabled when the document is tagged as <html amp> or <html ⚡>.
  if (!isAmphtml(win.document)) {
    return;
  }

  if (!Services.platformFor(ampdoc.win).isStandalone()) {
    return;
  }

  chunk(
    ampdoc,
    () => {
      Services.extensionsFor(win)
        .installExtensionForDoc(ampdoc, 'amp-standalone')
        .then(() => Services.standaloneServiceForDoc(ampdoc.getBody()))
        .then((standaloneService) => standaloneService.initialize());
    },
    ChunkPriority.LOW
  );
}
