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

/**
 * @fileoverview Factory for ./service/cid-impl.js
 */

import {
  getElementServiceForDoc,
  getElementServiceIfAvailableForDoc,
} from './element-service';


/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!Promise<!../extensions/amp-analytics/0.1/cid-impl.Cid>}
 */
export function cidForDoc(nodeOrDoc) {
  return /** @type {!Promise<!../extensions/amp-analytics/0.1/cid-impl.Cid>} */ ( // eslint-disable-line max-len
      getElementServiceForDoc(nodeOrDoc, 'cid', 'amp-analytics'));
};

/**
 * Returns a promise for the CID service or a promise for null if the service
 * is not available on the current page.
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!Promise<?../extensions/amp-analytics/0.1/cid-impl.Cid>}
 */
export function cidForDocOrNull(nodeOrDoc) {
  return /** @type {!Promise<?../extensions/amp-analytics/0.1/cid-impl.Cid>} */ ( // eslint-disable-line max-len
      getElementServiceIfAvailableForDoc(nodeOrDoc, 'cid', 'amp-analytics'));
};
