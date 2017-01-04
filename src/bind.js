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

import {getElementServiceForDoc} from './element-service';

// TODO(choumx): Investigate why amp-bind.Bind type reference not recognized.
/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!Promise<*>}
 */
export function bindForDoc(nodeOrDoc) {
  return /** @type {!Promise<*>} */ (
      getElementServiceForDoc(nodeOrDoc, 'bind', 'amp-bind'));
}
