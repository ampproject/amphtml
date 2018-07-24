/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import {Services} from '../../../src/services';
import {installStylesForDoc} from '../../../src/style-installer';
const TAG = 'amp-access-poool';
/**
 * @implements {../../amp-access/0.1/access-vendor.AccessVendor}
 */
export class PooolVendor {
  /**
   * @param {!../../amp-access/0.1/amp-access.AccessService} accessService
   * @param {!../../amp-access/0.1/amp-access-source.AccessSource} accessSource
   */
  constructor(accessService, accessSource) {

    /** @const */
    this.ampdoc = accessService.ampdoc;

    /** @private {!../../amp-access/0.1/amp-access-source.AccessSource} */
    this.accessSource_ = accessSource;

    installStylesForDoc(this.ampdoc, CSS, () => {}, false, TAG);
  /**
   * @return {!Promise<!JsonObject>}
   */
  authorize() {
    return {access: true};
  }
