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

/**
 * This implements the methods to interact with various subscription platforms.
 */
export class SubscriptionPlatform {

  /**
   * @param {string} entitlementURL
   */
  constructor(ampdoc, serviceUrl) {
    /** @const */
    this.ampdoc_ = ampdoc;

    /** @const @private {string} */
    this.serviceUrl_ = serviceUrl;
  }

  /**
   * @return {string}
   */
  getEntitlementsUrl() {
    return this.serviceUrl_;
  }

  /**
   * TODO(@prateekbh): Define object below once we have a defination of entitlement
   * @return {!Promise<Object>}
   */
  getEntitlements() {
    return Services.xhrFor(this.ampdoc_.win)
        .fetchJson(this.serviceUrl_)
        .then(res => res.json());
  }

}

