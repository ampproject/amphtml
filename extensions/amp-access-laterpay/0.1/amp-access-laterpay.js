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

import {LaterpayVendor} from './laterpay-impl';
import {Services} from '../../../src/services';

AMP.extension('amp-access-laterpay', '0.1', function (AMP) {
  AMP.registerServiceForDoc(
    'laterpay',
    /**
     * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
     * @return {*} TODO(#23582): Specify return type
     */
    function (ampdoc) {
      const element = ampdoc.getHeadNode();
      return Services.accessServiceForDoc(element).then((accessService) => {
        const source = accessService.getVendorSource('laterpay');
        const vendor = new LaterpayVendor(accessService, source);
        const adapter = /** @type {
            !../../amp-access/0.1/amp-access-vendor.AccessVendorAdapter
          } */ (source.getAdapter());
        adapter.registerVendor(vendor);
        return vendor;
      });
    }
  );
});
