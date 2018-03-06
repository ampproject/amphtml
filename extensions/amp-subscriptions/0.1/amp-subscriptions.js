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
import {Entitlement} from './entitlement';
import {EntitlementStore} from './entitlement-store';
import {LocalSubscriptionPlatform} from './local-subscription-platform';
import {PageConfig, PageConfigResolver} from '../../../third_party/subscriptions-project/config';
import {Renderer} from './renderer';
import {ServiceAdapter} from './service-adapter';
import {SubscriptionPlatform} from './subscription-platform';
import {dev, user} from '../../../src/log';
import {installStylesForDoc} from '../../../src/style-installer';
import {tryParseJson} from '../../../src/json';

/** @const */
const TAG = 'amp-subscriptions';

export class SubscriptionService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    const configElement = ampdoc.getElementById(TAG);

    /** @const @private */
    this.ampdoc_ = ampdoc;

    // Install styles.
    installStylesForDoc(ampdoc, CSS, () => {}, false, TAG);

    /** @private {?Promise} */
    this.initialized_ = null;

    /** @private @const {!Renderer} */
    this.renderer_ = new Renderer(ampdoc);

    /** @private {?PageConfig} */
    this.pageConfig_ = null;

    /** @private {?JsonObject} */
    this.platformConfig_ = null;

    /** @private @const {!Object<string, !SubscriptionPlatform>} */
    this.subscriptionPlatforms_ = [];

    /** @private {?EntitlementStore} */
    this.entitlementStore_ = null;

    /** @const @private {!Element} */
    this.configElement_ = user().assertElement(configElement);

    /** @private {!ServiceAdapter} */
    this.serviceAdapter_ = new ServiceAdapter(this);
  }

  /**
   * @return {!Promise}
   * @private
   */
  initialize_() {
    if (!this.initialized_) {
      const pageConfigResolver = new PageConfigResolver(this.ampdoc_.win);
      this.initialized_ = Promise.all([
        this.getPlatformConfig_(),
        pageConfigResolver.resolveConfig(),
      ]).then(promiseValues => {
        /** @type {!JsonObject} */
        this.platformConfig_ = promiseValues[0];
        /** @type {!PageConfig} */
        this.pageConfig_ = promiseValues[1];
      });
    }
    return this.initialized_;
  }

  /**
   * @param {!JsonObject} serviceConfig
   * @private
   */
  initializeLocalPlatforms_(serviceConfig) {
    if ((serviceConfig['serviceId'] || 'local') == 'local') {
      this.subscriptionPlatforms_['local'] = new LocalSubscriptionPlatform(
          this.ampdoc_,
          serviceConfig,
          this.serviceAdapter_
      );
    }
  }

  /**
   * @private
   * @returns {!Promise<!JsonObject>}
   */
  getPlatformConfig_() {
    return new Promise((resolve, reject) => {
      const rawContent = tryParseJson(this.configElement_.textContent, e => {
        reject('Failed to parse "amp-subscriptions" JSON: ' + e);
      });
      resolve(rawContent);
    });
  }

  /**
   * This method registers an auto initialized subcription platform with this service.
   *
   * @param {string} serviceId
   * @param {function(!JsonObject, !ServiceAdapter):!SubscriptionPlatform} subscriptionPlatformFactory
   */
  registerPlatform(serviceId, subscriptionPlatformFactory) {
    return this.initialize_().then(() => {
      const matchedServices = this.platformConfig_['services'].filter(
          service => (service.serviceId || 'local') === serviceId);

      const matchedServiceConfig = user().assert(matchedServices[0],
          'No matching services for the ID found');

      const subscriptionPlatform = subscriptionPlatformFactory(
          matchedServiceConfig,
          this.serviceAdapter_);

      this.subscriptionPlatforms_[subscriptionPlatform.getServiceId()] =
          subscriptionPlatform;

      this.fetchEntitlements_(subscriptionPlatform);
    });
  }

  /**
   * @param {boolean} grantState
   * @private
   */
  processGrantState_(grantState) {
    this.renderer_.toggleLoading(false);
    this.renderer_.setGrantState(grantState);

    if (grantState === false) {
      // TODO(@prateekbh): Show UI that no eligible entitlement found
      return;
    }

  }

  /**
   * @param {!Entitlement} entitlement
   * @private
   */
  resolveEntitlementsToStore_(entitlement) {
    this.entitlementStore_.resolveEntitlement(entitlement.service, entitlement);
  }

  /**
   *
   * @param {!SubscriptionPlatform} subscriptionPlatform
   */
  fetchEntitlements_(subscriptionPlatform) {
    subscriptionPlatform.getEntitlements().then(entitlement =>
      this.resolveEntitlementsToStore_(entitlement));
  }

  /**
   * @return {!Promise}
   */
  start() {
    return this.initialize_().then(() => {

      this.renderer_.toggleLoading(true);

      user().assert(this.pageConfig_, 'Page config is null');

      user().assert(this.platformConfig_['services'],
          'Services not configured in service config');

      const serviceIds = this.platformConfig_['services'].map(service =>
        service['serviceId'] || 'local');

      this.entitlementStore_ = new EntitlementStore(serviceIds);

      this.platformConfig_['services'].forEach(service => {
        this.initializeLocalPlatforms_(service);
      });

      this.subscriptionPlatforms_.forEach(subscriptionPlatform => {
        this.fetchEntitlements_(subscriptionPlatform);
      });

      this.entitlementStore_.getGrantStatus()
          .then(grantState => {this.processGrantState_(grantState);});

      this.selectAndActivatePlatform_();
    });
  }

  selectAndActivatePlatform_() {
    this.entitlementStore_.selectPlatform().then(entitlement => {
      this.subscriptionPlatforms_.forEach(platform => {
        if (platform.getServiceId() == entitlement.service) {
          platform.activate();
        }
      });
    });
  }

  /**
   * Returns Page config
   * @returns {?PageConfig}
   */
  getPageConfig() {
    return this.pageConfig_;
  }

  /**
   * Re authorizes a platform
   * @param {SubscriptionPlatform} subscriptionPlatform
   */
  reAuthorizePlatform(subscriptionPlatform) {
    subscriptionPlatform.getEntitlements().then(() =>
      this.selectAndActivatePlatform_());
  }

  /**
   * Delegates an action to local platform
   * @param {string} action
   */
  delegateActionToLocal(action) {
    const localPlatform = /** @type {LocalSubscriptionPlatform} */ (
      dev().assert(this.subscriptionPlatforms_['local'],
          'Local platform is not registered'));
    dev().assert(localPlatform.executeAction,
        'executeAction not found on local platform');

    localPlatform.executeAction(action);
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
export function getEntitlementClassForTesting() {
  return Entitlement;
}


// Register the extension services.
AMP.extension(TAG, '0.1', function(AMP) {
  AMP.registerServiceForDoc('subscriptions', function(ampdoc) {
    return new SubscriptionService(ampdoc).start();
  });
});
