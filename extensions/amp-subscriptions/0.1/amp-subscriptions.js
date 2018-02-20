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
import {Entitlements} from '../../../third_party/subscriptions-project/apis';
import {LocalSubscriptionPlatform} from './local-subscription-platform';
import {PageConfig, PageConfigResolver} from '../../../third_party/subscriptions-project/config';
import {Renderer} from './renderer';
import {SubscriptionPlatform} from './subscription-platform';
import {installStylesForDoc} from '../../../src/style-installer';
import {user} from '../../../src/log';

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
        .then(entitlements => this.resolveEntitlementsToStore_(entitlements));
  }

  /**
   * @param {?Entitlements} entitlements
   * @private
   */
  processEntitlements_(entitlements) {
    if (entitlements === null) {
      // TODO(@prateekbh): Show UI that no eligible entitlement found
      return;
    }

    this.renderer_.toggleLoading(false);
  }

  /**
   * @param {!Entitlements} entitlements
   * @private
   */
  resolveEntitlementsToStore_(entitlements) {
    user().assert(this.pageConfig_.getProductId() !== null,
        'Product id cannot be null');
    this.entitlementStore_.resolveEntitlement(
        this.pageConfig_.getProductId(), entitlements);
  }

  /** @private */
  start_() {
    this.initialize_().then(() => {
      this.renderer_.toggleLoading(true);
      // TODO(@prateekbh): Read the service ids in EntitlementStore constructor
      // from page config.
      this.entitlementStore_ =
          new EntitlementStore(['foo', 'bar']);

      this.subscriptionPlatforms_.forEach(subscriptionPlatform => {
        subscriptionPlatform.getEntitlements()
            .then(entitlements =>
              this.resolveEntitlementsToStore_(entitlements));
      });

      this.entitlementStore_.getFirstResolvedSubscription()
          .then(entitlements => {this.processEntitlements_(entitlements);});
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

/**
 * TODO(dvoytenko): remove once compiler type checking is fixed for third_party.
 * @package @VisibleForTesting
 */
export function getEntitlementsClassForTesting() {
  return Entitlements;
}


// Register the extension services.
AMP.extension(TAG, '0.1', function(AMP) {
  AMP.registerServiceForDoc(TAG, function(ampdoc) {
    return new SubscriptionService(ampdoc).start_();
  });
});
