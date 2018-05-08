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

import './access-vendor';
import {dev, user} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-access-vendor';


/**
 * The adapter for a vendor implementation that implements `AccessVendor`
 * interface and delivered via a separate extension. The vendor implementation
 * mainly requires two method: `authorize` and `pingback`. The actual
 * extension is registered via `registerVendor` method.
 * @implements {./amp-access-source.AccessTypeAdapterDef}
 */
export class AccessVendorAdapter {

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} configJson
   */
  constructor(ampdoc, configJson) {
    /** @const */
    this.ampdoc = ampdoc;

    /** @const @private {string} */
    this.vendorName_ = user().assert(configJson['vendor'],
        '"vendor" name must be specified');

    /** @const @private {!JsonObject} */
    this.vendorConfig_ = configJson[this.vendorName_] || {};

    /** @const @private {boolean} */
    this.isPingbackEnabled_ = !configJson['noPingback'];

    /** @private {?function(!./access-vendor.AccessVendor)} */
    this.vendorResolve_ = null;

    /** @const @private {!Promise<!./access-vendor.AccessVendor>} */
    this.vendorPromise_ = new Promise(resolve => {
      this.vendorResolve_ = resolve;
    });
  }

  /** @return {string} */
  getVendorName() {
    return this.vendorName_;
  }

  /** @override */
  getConfig() {
    return this.vendorConfig_;
  }

  /**
   * @param {!./access-vendor.AccessVendor} vendor
   */
  registerVendor(vendor) {
    user().assert(this.vendorResolve_, 'Vendor has already been registered');
    this.vendorResolve_(vendor);
    this.vendorResolve_ = null;
  }

  /** @override */
  isAuthorizationEnabled() {
    return true;
  }

  /** @override */
  authorize() {
    dev().fine(TAG, 'Start authorization via ', this.vendorName_);
    return this.vendorPromise_.then(vendor => {
      return vendor.authorize();
    });
  }

  /** @override */
  isPingbackEnabled() {
    return this.isPingbackEnabled_;
  }

  /** @override */
  pingback() {
    dev().fine(TAG, 'Pingback via ', this.vendorName_);
    return this.vendorPromise_.then(vendor => {
      return vendor.pingback();
    });
  }

  /** @override */
  postAction() {
    // TODO(dvoytenko): delegate to vendor adapter.
  }
}
