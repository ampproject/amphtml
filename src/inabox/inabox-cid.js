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

import {CidDef} from '../service/cid-impl';
import {registerServiceBuilderForDoc} from '../service';

/**
 * A dummy impl of CID service as CLIENT_ID is not supported
 * in inabox.
 *
 * @implements {CidDef}
 */
class InaboxCid {
  /** @override */
  get() {
    return Promise.resolve(null);
  }

  /** @override */
  optOut() {}
}

/**
 * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
 * @return {*} TODO(#23582): Specify return type
 */
export function installInaboxCidService(ampdoc) {
  return registerServiceBuilderForDoc(ampdoc, 'cid', InaboxCid);
}
