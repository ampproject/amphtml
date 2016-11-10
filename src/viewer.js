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

import {getExistingServiceForDoc, getServicePromiseForDoc} from './service';


/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!./service/viewer-impl.Viewer}
 */
export function viewerForDoc(nodeOrDoc) {
  return /** @type {!./service/viewer-impl.Viewer} */ (
      getExistingServiceForDoc(nodeOrDoc, 'viewer'));
}


/**
 * Returns promise for the viewer. This is an unusual case and necessary only
 * for services that need reference to the viewer before it has been
 * initialized. Most of the code, however, just should use `viewerForDoc`.
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!Promise<!./service/viewer-impl.Viewer>}
 */
export function viewerPromiseForDoc(nodeOrDoc) {
  return /** @type {!Promise<!./service/viewer-impl.Viewer>} */ (
      getServicePromiseForDoc(nodeOrDoc, 'viewer'));
}
