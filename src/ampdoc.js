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

import {getExistingServiceForWindow} from './service';


/**
 * Returns the global instance of the `AmpDocService` service that can be
 * used to resolve an ampdoc for any node: either in the single-doc or
 * shadow-doc environment.
 * @param {!Window} window
 * @return {!./service/ampdoc-impl.AmpDocService}
 */
export function ampdocServiceFor(window) {
  return /** @type {!./service/ampdoc-impl.AmpDocService} */ (
      getExistingServiceForWindow(window, 'ampdoc'));
}


/**
 * Returns the ampdoc for the specified node..
 * @param {!Node} node
 * @return {!./service/ampdoc-impl.AmpDoc}
 */
export function getAmpDoc(node) {
  const win = (node.ownerDocument || node).defaultView;
  return ampdocServiceFor(win).getAmpDoc(node);
}
