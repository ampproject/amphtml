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

import {Entitlement, Entitlements} from '../../../third_party/subscriptions-project/apis';

import {Services} from '../../../src/services';
import {user} from '../../../src/log';

/**
 * This implements the methods to interact with various subscription platforms.
 *
 * @implements {./subscription-platform.SubscriptionPlatform}
 */
export class LocalSubscriptionPlatform {

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} serviceConfig
   */
  constructor(ampdoc, serviceConfig) {
    /** @const */
    this.ampdoc_ = ampdoc;

    /** @const @private {!JsonObject} */
    this.serviceConfig_ = serviceConfig;

    /** @const @private {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(this.ampdoc_.win);
  }

  /**
   * Returns the Entitlements object for the subscription platform.
   *
   * @return {!Promise<!Entitlements>}
   */
  getEntitlements() {
    user().assert(this.serviceConfig_['paywallUrl'],
        'service config does not have paywall Url');
    return this.xhr_
        .fetchJson(this.serviceConfig_['paywallUrl'])
        .then(res => res.json())
        .then(resJson => {
          return new Entitlements(
              this.serviceConfig_['serviceId'],
              JSON.stringify(resJson),
              Entitlement.parseListFromJson(resJson),
              'product1' // TODO(@prateekbh): read this from pageConfig
          );
        });
  }
}

