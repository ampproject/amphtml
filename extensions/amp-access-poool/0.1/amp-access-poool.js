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

import {PooolVendor} from './poool-impl';
import {Services} from '../../../src/services';

AMP.extension('amp-access-poool', '0.1', function(AMP) {
  AMP.registerServiceForDoc(
    'poool',
    /** @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc */
    function(ampdoc) {
      const element = ampdoc.getHeadNode();
      return Services.accessServiceForDoc(element).then(accessService => {
        const source = accessService.getVendorSource('poool');
        const vendor = new PooolVendor(accessService, source);
        const adapter = /** @type {
            !../../amp-access/0.1/amp-access-vendor.AccessVendorAdapter
          } */ (source.getAdapter());
        adapter.registerVendor(vendor);
        return vendor;
      });
    }
  );
});
