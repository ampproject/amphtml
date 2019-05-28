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
import {CryptoHandler} from './crypto-handler';
import {Dialog} from './dialog';
import {DocImpl} from './doc-impl';
import {Entitlement} from './entitlement';
import {
  PageConfig,
  PageConfigResolver,
} from '../../../third_party/subscriptions-project/config';
import {PlatformStore} from './platform-store';
import {Renderer} from './renderer';
import {ServiceAdapter} from './service-adapter';
import {Services} from '../../../src/services';
import {SubscriptionAnalytics, SubscriptionAnalyticsEvents} from './analytics';
import {SubscriptionPlatform} from './subscription-platform';
import {ViewerSubscriptionPlatform} from './viewer-subscription-platform';
import {ViewerTracker} from './viewer-tracker';
import {dev, devAssert, user, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getMode} from '../../../src/mode';
import {getValueForExpr, tryParseJson} from '../../../src/json';
import {getWinOrigin} from '../../../src/url';
import {installStylesForDoc} from '../../../src/style-installer';
import {isStoryDocument} from '../../../src/utils/story';
import {localSubscriptionPlatformFactory} from './local-subscription-platform';

/** @const */
const TAG = 'amp-subscriptions';

/** @const */
const SERVICE_TIMEOUT = 3000;

/**
 * @implements {../../amp-access/0.1/access-vars.AccessVars}
 */
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

    /** @private {!SubscriptionAnalytics} */
    this.subscriptionAnalytics_ = new SubscriptionAnalytics(
      this.configElement_
    );

    /** @private {!ServiceAdapter} */
    this.serviceAdapter_ = new ServiceAdapter(this);

    /** @private {!Dialog} */
    this.dialog_ = new Dialog(ampdoc);

    /** @private {!ViewerTracker} */
    this.viewerTracker_ = new ViewerTracker(ampdoc);

    /** @private @const {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = Services.viewerForDoc(ampdoc);

    /** @private {?Promise} */
    this.viewTrackerPromise_ = null;

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(ampdoc.win);

    /** @private @const {boolean} */
    this.doesViewerProvideAuth_ = this.viewer_.hasCapability('auth');

    /** @private @const {!Promise<!../../../src/service/cid-impl.Cid>} */
    this.cid_ = Services.cidForDoc(ampdoc);

    /** @private {!Object<string, ?Promise<string>>} */
    this.readerIdPromiseMap_ = {};

    /** @private {!CryptoHandler} */
    this.cryptoHandler_ = new CryptoHandler(ampdoc);
  }

  /**
   * @return {!Promise}
   * @private
   */
  initialize_() {
    if (!this.initialized_) {
      const doc = new DocImpl(this.ampdoc_);
      const pageConfigResolver = new PageConfigResolver(doc);
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
      this.platformStore_.resolvePlatform(
        'local',
        localSubscriptionPlatformFactory(
          this.ampdoc_,
          serviceConfig,
          this.serviceAdapter_
        )
      );
    }
  }

  /**
   * @return {!Promise<!JsonObject>}
   * @private
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
   * Returns the analytics service for subscriptions.
   * @return {!./analytics.SubscriptionAnalytics}
   */
  getAnalytics() {
    return this.subscriptionAnalytics_;
  }

  /**
   * This method registers an auto initialized subcription platform with this
   * service.
   *
   * @param {string} serviceId
   * @param {function(!JsonObject, !ServiceAdapter):!SubscriptionPlatform} subscriptionPlatformFactory
   */
  registerPlatform(serviceId, subscriptionPlatformFactory) {
    return this.initialize_().then(() => {
      if (this.doesViewerProvideAuth_) {
        return; // External platforms should not register if viewer provides auth
      }
      const matchedServices = this.platformConfig_['services'].filter(
        service => (service.serviceId || 'local') === serviceId
      );

      const matchedServiceConfig = userAssert(
        matchedServices[0],
        'No matching services for the ID found'
      );

      const subscriptionPlatform = subscriptionPlatformFactory(
        matchedServiceConfig,
        this.serviceAdapter_
      );

      this.platformStore_.resolvePlatform(
        subscriptionPlatform.getServiceId(),
        subscriptionPlatform
      );
      this.subscriptionAnalytics_.serviceEvent(
        SubscriptionAnalyticsEvents.PLATFORM_REGISTERED,
        subscriptionPlatform.getServiceId()
      );
      // Deprecated event fired for backward compatibility
      this.subscriptionAnalytics_.serviceEvent(
        SubscriptionAnalyticsEvents.PLATFORM_REGISTERED_DEPRECATED,
        subscriptionPlatform.getServiceId()
      );
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
    this.viewTrackerPromise_ = this.viewerTracker_.scheduleView(2000);
    if (grantState === false) {
      // TODO(@prateekbh): Show UI that no eligible entitlement found
      return;
    }
  }

  /**
   * @param {string} serviceId
   * @param {!./entitlement.Entitlement} entitlement
   * @private
   */
  resolveEntitlementsToStore_(serviceId, entitlement) {
    this.platformStore_.resolveEntitlement(serviceId, entitlement);
    if (entitlement.decryptedDocumentKey) {
      this.cryptoHandler_.tryToDecryptDocument(
        entitlement.decryptedDocumentKey
      );
    }
    this.subscriptionAnalytics_.serviceEvent(
      SubscriptionAnalyticsEvents.ENTITLEMENT_RESOLVED,
      serviceId
    );
  }

  /**
   * @param {!SubscriptionPlatform} subscriptionPlatform
   * @return {!Promise}
   */
  fetchEntitlements_(subscriptionPlatform) {
    let timeout = SERVICE_TIMEOUT;
    if (getMode().development || getMode().localDev) {
      timeout = SERVICE_TIMEOUT * 2;
    }
    // Prerender safe platforms don't have to wait for the
    // page to become visible, all others wait for whenFirstVisible()
    const visiblePromise = subscriptionPlatform.isPrerenderSafe()
      ? Promise.resolve()
      : this.viewer_.whenFirstVisible();
    return visiblePromise.then(() => {
      return this.timer_
        .timeoutPromise(timeout, subscriptionPlatform.getEntitlements())
        .then(entitlement => {
          entitlement =
            entitlement ||
            Entitlement.empty(subscriptionPlatform.getServiceId());
          this.resolveEntitlementsToStore_(
            subscriptionPlatform.getServiceId(),
            entitlement
          );
          return entitlement;
        })
        .catch(reason => {
          const serviceId = subscriptionPlatform.getServiceId();
          this.platformStore_.reportPlatformFailureAndFallback(serviceId);
          throw user().createError(
            `fetch entitlements failed for ${serviceId}`,
            reason
          );
        });
    });
  }

  /**
   * Starts the amp-subscription Service
   * @return {SubscriptionService}
   */
  start() {
    this.initialize_().then(() => {
      this.subscriptionAnalytics_.event(SubscriptionAnalyticsEvents.STARTED);
      this.renderer_.toggleLoading(true);

      userAssert(this.pageConfig_, 'Page config is null');

      if (this.doesViewerProvideAuth_) {
        this.delegateAuthToViewer_();
        this.startAuthorizationFlow_(false);
        return;
      } else if (this.platformConfig_['alwaysGrant']) {
        // If service config has `alwaysGrant` key as true, publisher wants it
        // to be open always until a sviewer decides otherwise.
        this.processGrantState_(true);
        return;
      }

      userAssert(
        this.platformConfig_['services'],
        'Services not configured in service config'
      );

      const serviceIds = this.platformConfig_['services'].map(
        service => service['serviceId'] || 'local'
      );

      this.initializePlatformStore_(serviceIds);

      this.platformConfig_['services'].forEach(service => {
        this.initializeLocalPlatforms_(service);
      });

      this.platformStore_
        .getAvailablePlatforms()
        .forEach(subscriptionPlatform => {
          this.fetchEntitlements_(subscriptionPlatform);
        });

      isStoryDocument(this.ampdoc_).then(isStory => {
        // Delegates the platform selection and activation call if is story.
        this.startAuthorizationFlow_(!isStory /** doPlatformSelection */);
      });
    });
    return this;
  }

  /**
   * Initializes the PlatformStore with the service ids.
   * @param {!Array<string>} serviceIds
   */
  initializePlatformStore_(serviceIds) {
    const fallbackEntitlement = this.platformConfig_['fallbackEntitlement']
      ? Entitlement.parseFromJson(this.platformConfig_['fallbackEntitlement'])
      : Entitlement.empty('local');
    this.platformStore_ = new PlatformStore(
      serviceIds,
      this.platformConfig_['score'],
      fallbackEntitlement
    );
  }

  /**
   * Delegates authentication to viewer
   */
  delegateAuthToViewer_() {
    const serviceIds = ['local'];
    const origin = getWinOrigin(this.ampdoc_.win);
    this.initializePlatformStore_(serviceIds);

    this.platformConfig_['services'].forEach(service => {
      if ((service['serviceId'] || 'local') == 'local') {
        const viewerPlatform = new ViewerSubscriptionPlatform(
          this.ampdoc_,
          service,
          this.serviceAdapter_,
          origin
        );
        this.platformStore_.resolvePlatform('local', viewerPlatform);
        viewerPlatform
          .getEntitlements()
          .then(entitlement => {
            devAssert(entitlement, 'Entitlement is null');
            // Viewer authorization is redirected to use local platform instead.
            this.resolveEntitlementsToStore_(
              'local',
              /** @type {!./entitlement.Entitlement}*/ (entitlement)
            );
          })
          .catch(reason => {
            this.platformStore_.reportPlatformFailureAndFallback('local');
            dev().error(TAG, 'Viewer auth failed:', reason);
          });
      }
    });
  }

  /**
   * @param {string} serviceId
   * @return {!Promise<string>}
   */
  getReaderId(serviceId) {
    let readerId = this.readerIdPromiseMap_[serviceId];
    if (!readerId) {
      const consent = Promise.resolve();
      // Scope is kept "amp-access" by default to avoid unnecessary CID
      // rotation.
      const scope =
        'amp-access' + (serviceId == 'local' ? '' : '-' + serviceId);
      readerId = this.cid_.then(cid => {
        return cid.get({scope, createCookieIfNotPresent: true}, consent);
      });
      this.readerIdPromiseMap_[serviceId] = readerId;
    }
    return readerId;
  }

  /**
   * @param {string} serviceId
   * @return {?string}
   */
  getEncryptedDocumentKey(serviceId) {
    return this.cryptoHandler_.getEncryptedDocumentKey(serviceId);
  }

  /**
   * Returns the singleton Dialog instance
   * @return {!Dialog}
   */
  getDialog() {
    return this.dialog_;
  }

  /**
   * Selects and activates a platform.
   */
  maybeSelectAndActivatePlatform() {
    this.initialize_().then(() => {
      if (this.doesViewerProvideAuth_ || this.platformConfig_['alwaysGrant']) {
        return;
      }

      this.selectAndActivatePlatform_();
    });
  }

  /**
   * Unblock document based on grant state and selected platform
   * @param {boolean=} doPlatformSelection
   * @private
   */
  startAuthorizationFlow_(doPlatformSelection = true) {
    this.platformStore_.getGrantStatus().then(grantState => {
      this.processGrantState_(grantState);
      this.performPingback_();
    });

    if (doPlatformSelection) {
      this.selectAndActivatePlatform_();
    }
  }

  /**
   * @return {!Promise}
   * @private
   */
  selectAndActivatePlatform_() {
    const requireValuesPromise = Promise.all([
      this.platformStore_.getGrantStatus(),
      this.platformStore_.selectPlatform(),
      this.platformStore_.getGrantEntitlement(),
    ]);

    return requireValuesPromise.then(resolvedValues => {
      const selectedPlatform = resolvedValues[1];
      const grantEntitlement = resolvedValues[2];
      const selectedEntitlement = this.platformStore_.getResolvedEntitlementFor(
        selectedPlatform.getServiceId()
      );
      const bestEntitlement = grantEntitlement || selectedEntitlement;

      selectedPlatform.activate(selectedEntitlement, grantEntitlement);

      this.subscriptionAnalytics_.serviceEvent(
        SubscriptionAnalyticsEvents.PLATFORM_ACTIVATED,
        selectedPlatform.getServiceId()
      );
      // Deprecated events are fire for backwards compatibility
      this.subscriptionAnalytics_.serviceEvent(
        SubscriptionAnalyticsEvents.PLATFORM_ACTIVATED_DEPRECATED,
        selectedPlatform.getServiceId()
      );
      if (bestEntitlement.granted) {
        this.subscriptionAnalytics_.serviceEvent(
          SubscriptionAnalyticsEvents.ACCESS_GRANTED,
          bestEntitlement.service
        );
      } else {
        this.subscriptionAnalytics_.serviceEvent(
          SubscriptionAnalyticsEvents.PAYWALL_ACTIVATED,
          selectedPlatform.getServiceId()
        );
        this.subscriptionAnalytics_.serviceEvent(
          SubscriptionAnalyticsEvents.ACCESS_DENIED,
          selectedPlatform.getServiceId()
        );
      }
    });
  }

  /**
   * Performs pingback on local platform.
   * @return {?Promise}
   * @private
   */
  performPingback_() {
    if (this.viewTrackerPromise_) {
      const localPlatform = this.platformStore_.getLocalPlatform();
      return this.viewTrackerPromise_
        .then(() => {
          if (localPlatform.pingbackReturnsAllEntitlements()) {
            return this.platformStore_.getAllPlatformsEntitlements();
          }
          return this.platformStore_
            .getGrantEntitlement()
            .then(
              grantStateEntitlement =>
                grantStateEntitlement || Entitlement.empty('local')
            );
        })
        .then(resolveEntitlements => {
          if (localPlatform.isPingbackEnabled()) {
            localPlatform.pingback(resolveEntitlements);
          }
        });
    }
    return null;
  }

  /**
   * Returns Page config
   * @return {!PageConfig}
   */
  getPageConfig() {
    const pageConfig = devAssert(
      this.pageConfig_,
      'Page config is not yet fetched'
    );
    return /** @type {!PageConfig} */ (pageConfig);
  }

  /**
   * Reset all platforms and re-fetch entitlements after an
   * external event (for example a login)
   */
  resetPlatforms() {
    this.platformStore_ = this.platformStore_.resetPlatformStore();
    this.renderer_.toggleLoading(true);

    this.platformStore_
      .getAvailablePlatforms()
      .forEach(subscriptionPlatform => {
        this.fetchEntitlements_(subscriptionPlatform);
      });
    this.subscriptionAnalytics_.serviceEvent(
      SubscriptionAnalyticsEvents.PLATFORM_REAUTHORIZED,
      ''
    );
    // deprecated event fired for backward compatibility
    this.subscriptionAnalytics_.serviceEvent(
      SubscriptionAnalyticsEvents.PLATFORM_REAUTHORIZED_DEPRECATED,
      ''
    );
    this.startAuthorizationFlow_();
  }

  /**
   * Delegates an action to local platform.
   * @param {string} action
   * @return {!Promise<boolean>}
   */
  delegateActionToLocal(action) {
    return this.delegateActionToService(action, 'local');
  }

  /**
   * Delegates an action to specified platform.
   * @param {string} action
   * @param {string} serviceId
   * @return {!Promise<boolean>}
   */
  delegateActionToService(action, serviceId) {
    return new Promise(resolve => {
      this.platformStore_.onPlatformResolves(serviceId, platform => {
        devAssert(platform, 'Platform is not registered');
        this.subscriptionAnalytics_.event(
          SubscriptionAnalyticsEvents.ACTION_DELEGATED,
          dict({
            'action': action,
            'serviceId': serviceId,
          })
        );
        resolve(platform.executeAction(action));
      });
    });
  }

  /**
   * Delegate UI decoration to another service.
   * @param {!Element} element
   * @param {string} serviceId
   * @param {string} action
   * @param {?JsonObject} options
   */
  decorateServiceAction(element, serviceId, action, options) {
    this.platformStore_.onPlatformResolves(serviceId, platform => {
      devAssert(platform, 'Platform is not registered');
      platform.decorateUI(element, action, options);
    });
  }

  /**
   * Evaluates platforms and select the one to be selected for login.
   * @return {!./subscription-platform.SubscriptionPlatform}
   */
  selectPlatformForLogin() {
    return this.platformStore_.selectPlatformForLogin();
  }

  /** @override from AccessVars */
  getAccessReaderId() {
    return this.initialize_().then(() => this.getReaderId('local'));
  }

  /** @override from AccessVars */
  getAuthdataField(field) {
    return this.initialize_()
      .then(() => {
        return this.platformStore_.getEntitlementPromiseFor('local');
      })
      .then(entitlement => {
        return getValueForExpr(entitlement.json(), field);
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
  AMP.registerServiceForDoc('subscriptions', function(ampdoc) {
    return new SubscriptionService(ampdoc).start();
  });
});
