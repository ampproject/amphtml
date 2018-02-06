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

import {installStylesForDoc} from '../../../src/style-installer';
import {SubscriptionPlatform} from './amp-subscription-platform';

/** @const */
const TAG = 'amp-subscription';

export class SubscriptionSubscription {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const @private */
    this.ampdoc_ = ampdoc;

    // Install styles.
    installStylesForDoc(ampdoc, CSS, () => {}, false, TAG);

    /** @private @const {!Array<./SubscriptionPlatform>} */
    this.subscriptionPlatforms_ = [];
  }

  /**
   * @return {Object}
   * @private
   */
  getConfig_() {
    // TODO(@prateekbh): get this config from the document config
    return [
      {
        paywallUrl: '/subscription/subsplatform1',
      },
      {
        paywallUrl: '/subscription/subsplatform2',
      },
    ];
  }

  /**
   * @private
   */
  buildSubscriptionPlatforms_() {
    this.getConfig_().forEach(subscriptionPlatformConfig => {
      this.subscriptionPlatforms_.push(new SubscriptionPlatform(this.ampdoc_,
          subscriptionPlatformConfig.paywallUrl));
    });
  }

  /**
   * @private
   */
  processEntitlement_() {
    // TODO(@prateekbh): process and unblock marup here.
  }

  /**
   * @private
   */
  start_() {
    this.buildSubscriptionPlatforms_();
    this.subscriptionPlatforms_.forEach(subscriptionPlatform => {
      subscriptionPlatform.getEntitlements()
          .then(entitlement => this.processEntitlement_(entitlement))
          .catch(() => {});
    });
  }

}

// Register the extension services.
AMP.extension(TAG, '0.1', function(AMP) {
  AMP.registerServiceForDoc('access', function(ampdoc) {
    return new SubscriptionSubscription(ampdoc).start_();
  });
});
