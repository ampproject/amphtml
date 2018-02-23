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

import {
  ConfiguredRuntime,
} from '../../../third_party/subscriptions-project/swg';
import {Services} from '../../../src/services';

const TAG = 'amp-subscriptions-google';
const PLATFORM_ID = 'subscribe.google.com';


/**
 * @implements {../../amp-subscriptions/0.1/subscription-platform.SubscriptionPlatform}
 */
export class GoogleSubscriptionsPlatform {

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;
    /** @private {?ConfiguredRuntime} */
    this.runtime_ = null;
  }

  /** @override */
  configure(platformConfig, pageConfig) {
    this.runtime_ = new ConfiguredRuntime(this.ampdoc_.win, pageConfig);
  }

  /** @override */
  getEntitlements() {
    return this.runtime_.getEntitlements();
  }
}


// Register the extension services.
AMP.extension(TAG, '0.1', function(AMP) {
  AMP.registerServiceForDoc('subscriptions-google', function(ampdoc) {
    const platform = new GoogleSubscriptionsPlatform(ampdoc);
    Services.subscriptionsServiceForDoc(ampdoc).then(service => {
      service.registerPlatform(PLATFORM_ID, platform);
    });
    return platform;
  });
});
