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
import {Dialog} from './dialog';
import {Entitlement} from './entitlement';
import {LocalSubscriptionPlatform} from './local-subscription-platform';
import {PageConfig, PageConfigResolver} from '../../../third_party/subscriptions-project/config';
import {PlatformStore} from './platform-store';
import {Renderer} from './renderer';
import {ServiceAdapter} from './service-adapter';
import {SubscriptionPlatform} from './subscription-platform';
import {ViewerTracker} from './viewer-tracker';
import {dev, user} from '../../../src/log';
import {installStylesForDoc} from '../../../src/style-installer';
import {tryParseJson} from '../../../src/json';

/** @const */
const TAG = 'amp-subscriptions';

/** @typedef {{loggedIn: boolean, subscribed: boolean, granted: boolean, entitlement: !JsonObject}} */
export let RenderState;

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

    /** @private {?PlatformStore} */
    this.platformStore_ = null;

    /** @const @private {!Element} */
    this.configElement_ = user().assertElement(configElement);

    /** @private {!ServiceAdapter} */
    this.serviceAdapter_ = new ServiceAdapter(this);

    /** @private {!Dialog} */
    this.dialog_ = new Dialog(ampdoc);

    /** @private {!ViewerTracker} */
    this.viewerTracker_ = new ViewerTracker(ampdoc);

    /** @private {?Promise} */
    this.viewTrackerPromise_ = null;
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
      this.platformStore_.resolvePlatform('local',
          new LocalSubscriptionPlatform(
              this.ampdoc_,
              serviceConfig,
              this.serviceAdapter_
          )
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

      this.platformStore_.resolvePlatform(subscriptionPlatform.getServiceId(),
          subscriptionPlatform);

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
    } else {
      this.viewTrackerPromise_ = this.viewerTracker_.scheduleView(2000);
    }

  }

  /**
   * @param {string} serviceId
   * @param {!./entitlement.Entitlement} entitlement
   * @private
   */
  resolveEntitlementsToStore_(serviceId, entitlement) {
    const productId = /** @type {string} */ (dev().assert(
        this.pageConfig_.getProductId(),
        'Product id is null'
    ));
    entitlement.setCurrentProduct(productId);
    this.platformStore_.resolveEntitlement(serviceId, entitlement);
  }

  /**
   * @param {!SubscriptionPlatform} subscriptionPlatform
   * @return {!Promise<!./entitlement.Entitlement>}
   */
  fetchEntitlements_(subscriptionPlatform) {
    return subscriptionPlatform.getEntitlements().then(entitlement => {
      if (!entitlement) {
        entitlement = Entitlement.empty(subscriptionPlatform.getServiceId());
      }
      this.resolveEntitlementsToStore_(subscriptionPlatform.getServiceId(),
          entitlement);
      return entitlement;
    });
  }

  /**
   * Starts the amp-subscription Service
   * @returns {SubscriptionService}
   */
  start() {
    this.initialize_().then(() => {

      this.renderer_.toggleLoading(true);

      user().assert(this.pageConfig_, 'Page config is null');

      user().assert(this.platformConfig_['services'],
          'Services not configured in service config');

      const serviceIds = this.platformConfig_['services'].map(service =>
        service['serviceId'] || 'local');

      this.platformStore_ = new PlatformStore(serviceIds);

      this.platformConfig_['services'].forEach(service => {
        this.initializeLocalPlatforms_(service);
      });

      this.platformStore_.getAllRegisteredPlatforms_().forEach(
          subscriptionPlatform => {
            this.fetchEntitlements_(subscriptionPlatform);
          }
      );

      this.startAuthorizationFlow_();
    });
    return this;
  }

  /**
   * Returns the singleton Dialog instance
   * @returns {!Dialog}
   */
  getDialog() {
    return this.dialog_;
  }

  /**
   * Unblock document based on grant state and selected platform
   * @private
   */
  startAuthorizationFlow_() {
    this.platformStore_.getGrantStatus()
        .then(grantState => {this.processGrantState_(grantState);});

    this.selectAndActivatePlatform_();
  }

  /** @private */
  selectAndActivatePlatform_() {
    const requireValuesPromise = Promise.all([
      this.platformStore_.getGrantStatus(),
      this.platformStore_.selectPlatform(),
    ]);

    return requireValuesPromise.then(resolvedValues => {
      const grantState = resolvedValues[0];
      const selectedPlatform = resolvedValues[1];
      const selectedEntitlement = this.platformStore_.getResolvedEntitlementFor(
          selectedPlatform.getServiceId());

      /** @type {!RenderState} */
      const renderState = {
        entitlement: selectedEntitlement.json(),
        loggedIn: selectedEntitlement.loggedIn,
        subscribed: !!selectedEntitlement.subscriptionToken,
        granted: grantState,
      };

      selectedPlatform.activate(renderState);

      if (this.viewTrackerPromise_) {
        this.viewTrackerPromise_.then(() => {
          const localPlatform = this.platformStore_.getLocalPlatform();

          if (selectedPlatform.isPingbackEnabled()) {
            selectedPlatform.pingback(selectedEntitlement);
          }

          if (selectedPlatform.getServiceId() !== localPlatform.getServiceId()
              && localPlatform.isPingbackEnabled()) {
            localPlatform.pingback(selectedEntitlement);
          }
        });
      }
    });
  }

  /**
   * Returns Page config
   * @returns {!PageConfig}
   */
  getPageConfig() {
    const pageConfig = dev().assert(this.pageConfig_,
        'Page config is not yet fetched');
    return /** @type {!PageConfig} */(pageConfig);
  }

  /**
   * Re authorizes a platform
   * @param {!SubscriptionPlatform} subscriptionPlatform
   * @return {!Promise}
   */
  reAuthorizePlatform(subscriptionPlatform) {
    return this.fetchEntitlements_(subscriptionPlatform).then(() => {
      this.platformStore_.reset();
      this.startAuthorizationFlow_();
    });
  }

  /**
   * Delegates an action to local platform
   * @param {string} action
   */
  delegateActionToLocal(action) {
    const localPlatform = /** @type {LocalSubscriptionPlatform} */ (
      dev().assert(this.platformStore_.getLocalPlatform(),
          'Local platform is not registered'));

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


// Register the extension services.
AMP.extension(TAG, '0.1', function(AMP) {
  AMP.registerServiceForDoc('subscriptions', function(ampdoc) {
    return new SubscriptionService(ampdoc).start();
  });
});
