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

import {CSS} from '../../../build/amp-subscriptions-0.1.css';
import {EntitlementStore} from './entitlement-store';
import {LocalSubscriptionPlatform} from './local-subscription-platform';
import {
  PageConfig,
  PageConfigResolver,
} from 'third_party/subscriptions-project/config';
import {Renderer} from './renderer';
import {SubscriptionPlatform} from './subscription-platform';
import {installStylesForDoc} from '../../../src/style-installer';

/** @const */
const TAG = 'amp-subscriptions';


export class SubscriptionService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const @private */
    this.ampdoc_ = ampdoc;

    // Install styles.
    installStylesForDoc(ampdoc, CSS, () => {}, false, TAG);

    /** @private @const {!Renderer} */
    this.renderer_ = new Renderer(ampdoc);

    /** @private {?PageConfig} */
    this.pageConfig_ = null;

    /** @private @const {!Array<!SubscriptionPlatform>} */
    this.subscriptionPlatforms_ = [];

    /** @private {?EntitlementStore} */
    this.entitlementStore_ = null;
  }

  /**
   * @private
   * @return {!Promise}
   */
  initialize_() {
    const pageConfigResolver = new PageConfigResolver(this.ampdoc_.win);

    // TODO(@prateekbh): read this config from the document.
    const platformConfigs = [
      {
        paywallUrl: '/subscription/1/entitlements',
      },
      {
        paywallUrl: '/subscription/2/entitlements',
      },
    ];

    return pageConfigResolver.resolveConfig().then(pageConfig => {
      this.pageConfig_ = pageConfig;
      platformConfigs.forEach(platformConfig => {
        this.subscriptionPlatforms_.push(
            new LocalSubscriptionPlatform(
                this.ampdoc_,
                platformConfig
            )
        );
      });
    });
  }

  /**
   * This method registers an auto initialized subcription platform with this service.
   *
   * @param {string} serviceId
   * @param {!SubscriptionPlatform} subscriptionPlatform
   */
  registerService(serviceId, subscriptionPlatform) {
    this.subscriptionPlatforms_.push(subscriptionPlatform);

    subscriptionPlatform.getEntitlements()
        .then(() => this.processEntitlement_());
  }

  /** @private */
  processEntitlement_() {
    // TODO(@prateekbh): process and unblock marup here.
  }

  /** @private */
  start_() {
    this.initialize_().then(() => {
      // TODO(@prateekbh): Start and stop loading indicator. See
      // `Renderer.toggleLoading`.
      // TODO(@prateekbh): Read the service ids in EntitlementStore constructor
      // from page config.
      this.entitlementStore_ = new EntitlementStore(['foo', 'bar']);
      this.subscriptionPlatforms_.forEach(subscriptionPlatform => {
        subscriptionPlatform.getEntitlements()
            .then(() => this.processEntitlement_());
      });
    });
  }
}


/** @package @VisibleForTesting */
export function getPlatformClassForTesting() {
  return SubscriptionPlatform;
}

/**
 * TODO(dvoytenko): remove once compiler type checking is fixed for third_party.
 * @package @VisibleForTesting
 */
export function getPageConfigClassForTesting() {
  return PageConfig;
}


// Register the extension services.
AMP.extension(TAG, '0.1', function(AMP) {
  AMP.registerServiceForDoc(TAG, function(ampdoc) {
    return new SubscriptionService(ampdoc).start_();
  });
});
