/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {ANALYTICS_CONFIG} from './vendors';

/**
 * @visibleForTesting
 */
export class IframeTransportResponses {
    /**
   * Binding of 3p analytics vendors' responses, used amp-ad-exit
   * @return {!Object<string, !Object<string, Object<string,string>>>}
   */
  static getResponses() {
    return IframeTransportResponses.iframeTransportResponses_;
  }

  /**
   * Checks whether a vendor is valid (i.e. listed in vendors.js and has
   * transport/iframe defined.
   * @param {string} vendor The vendor name that should be listed in vendors.js
   * @returns {boolean}
   */
  static isValidVendor(vendor) {
    return ANALYTICS_CONFIG &&
        ANALYTICS_CONFIG[vendor] !== undefined &&
        ANALYTICS_CONFIG[vendor]['transport'] !== undefined &&
        ANALYTICS_CONFIG[vendor]['transport']['iframe'] !== undefined;
  }
}

/** @private {!Object<string, !Object<string, Object<string,string>>>} */
IframeTransportResponses.iframeTransportResponses_ = {};
