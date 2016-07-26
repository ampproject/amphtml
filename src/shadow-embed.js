/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {ampdocFor} from './ampdoc';
import {extensionsFor} from './extensions';
import {copyRuntimeStylesToShadowRoot} from './styles';


/**
 * @param {!Element} hostElement
 * @param {!Array<string>} extensionIds
 * @return {!ShadowRoot}
 */
export function createShadowEmbedRoot(hostElement, extensionIds) {
  if (hostElement.shadowRoot) {
    hostElement.shadowRoot./*OK*/innerHTML = '';
  }
  const shadowRoot = hostElement.shadowRoot || hostElement.createShadowRoot();
  shadowRoot.AMP = {};

  const win = hostElement.ownerDocument.defaultView;
  const extensions = extensionsFor(win);
  const ampdocService = ampdocFor(win);
  const ampdoc = ampdocService.getAmpDoc(hostElement);

  // Instal runtime CSS.
  copyRuntimeStylesToShadowRoot(ampdoc, shadowRoot);

  // Install extensions.
  extensionIds.forEach(extensionId => extensions.loadExtension(extensionId));

  // Apply extensions factories, such as CSS.
  extensions.installFactoriesInShadowRoot(shadowRoot, extensionIds);

  return shadowRoot;
}
