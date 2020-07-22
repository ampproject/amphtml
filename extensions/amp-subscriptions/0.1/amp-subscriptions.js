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
  ActionStatus,
  SubscriptionAnalytics,
  SubscriptionAnalyticsEvents,
} from './analytics';
import {CSS} from '../../../build/amp-subscriptions-0.1.css';
import {CryptoHandler} from './crypto-handler';
import {Dialog} from './dialog';
import {DocImpl} from './doc-impl';
import {ENTITLEMENTS_REQUEST_TIMEOUT} from './constants';
import {Entitlement, GrantReason} from './entitlement';
import {
  PageConfig as PageConfigInterface,
  PageConfigResolver,
} from '../../../third_party/subscriptions-project/config';
import {PlatformStore} from './platform-store';
import {Renderer} from './renderer';
import {ServiceAdapter} from './service-adapter';
import {Services} from '../../../src/services';
import {SubscriptionPlatform as SubscriptionPlatformInterface} from './subscription-platform';
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

    /**
     * Resolves when page and platform configs are processed.
     * @private {?Promise}
     */
    this.initialized_ = null;

    /** @private @const {!Renderer} */
    this.renderer_ = new Renderer(ampdoc);

    /** @private {?PageConfigInterface} */
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

    /** @private @const {!../../../src/service/viewer-interface.ViewerInterface} */
    this.viewer_ = Services.viewerForDoc(ampdoc);

    /** @private {?Promise} */
    this.viewTrackerPromise_ = null;

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(ampdoc.win);

    /**
     * @private @const {boolean}
     * View substitutes for other services and handles auth. Usually an app
     * with a webview.
     */
    this.doesViewerProvideAuth_ = this.viewer_.hasCapability('auth');

    /**
     * @private @const {boolean}
     * Viewer also does paywall/metering so on page "local" paywall is not shown.
     */
    this.doesViewerProvidePaywall_ =
      this.doesViewerProvideAuth_ && this.viewer_.hasCapability('paywall');

    /** @private @const {!Promise<!../../../src/service/cid-impl.CidDef>} */
    this.cid_ = Services.cidForDoc(ampdoc);

    /** @private {!Object<string, ?Promise<string>>} */
    this.serviceIdToReaderIdPromiseMap_ = {};

    /** @private {!CryptoHandler} */
    this.cryptoHandler_ = new CryptoHandler(ampdoc);
  }

  /**
   * Starts the `amp-subscriptions` extension.
   * @return {SubscriptionService}
   */
  start() {
    this.initialize_().then(() => {
      this.subscriptionAnalytics_.event(SubscriptionAnalyticsEvents.STARTED);
      this.renderer_.toggleLoading(true);

      userAssert(this.pageConfig_, 'Page config is null');

      if (this.doesViewerProvideAuth_) {
        this.delegateAuthToViewer_();
        this.startAuthorizationFlow_(false /** doPlatformSelection */);
        return;
      }

      userAssert(
        this.platformConfig_['services'],
        'Services not configured in service config'
      );

      const serviceIds = this.platformConfig_['services'].map(
        (service) => service['serviceId'] || 'local'
      );

      this.initializePlatformStore_(serviceIds);

      /** @type {!Array} */ (this.platformConfig_['services']).forEach(
        (service) => {
          this.initializeLocalPlatforms_(service);
        }
      );

      this.platformStore_
        .getAvailablePlatforms()
        .forEach((subscriptionPlatform) => {
          this.fetchEntitlements_(subscriptionPlatform);
        });

      isStoryDocument(this.ampdoc_).then((isStory) => {
        // Delegates the platform selection and activation call if is story.
        this.startAuthorizationFlow_(!isStory /** doPlatformSelection */);
      });
    });
    return this;
  }

  /** @override from AccessVars */
  getAccessReaderId() {
    return this.initialize_().then(() => this.getReaderId('local'));
  }

  /**
   * Returns the analytics service for subscriptions.
   * @return {!./analytics.SubscriptionAnalytics}
   */
  getAnalytics() {
    return this.subscriptionAnalytics_;
  }

  /** @override from AccessVars */
  getAuthdataField(field) {
    return this.initialize_()
      .then(() => this.platformStore_.getEntitlementPromiseFor('local'))
      .then((entitlement) => getValueForExpr(entitlement.json(), field));
  }

  /**
   * Returns the singleton Dialog instance
   * @return {!Dialog}
   */
  getDialog() {
    return this.dialog_;
  }

  /**
   * Returns encrypted document key if it exists.
   * This key is needed for requesting a different key
   * that decrypts locked content on the page.
   * @param {string} serviceId Who you want to decrypt the key.
   *                           For example: 'google.com'
   * @return {?string}
   */
  getEncryptedDocumentKey(serviceId) {
    return this.cryptoHandler_.getEncryptedDocumentKey(serviceId);
  }

  /**
   * Returns Page config
   * @return {!PageConfigInterface}
   */
  getPageConfig() {
    const pageConfig = devAssert(
      this.pageConfig_,
      'Page config is not yet fetched'
    );
    return /** @type {!PageConfigInterface} */ (pageConfig);
  }

  /**
   * @param {string} serviceId
   * @return {!Promise<string>}
   */
  getReaderId(serviceId) {
    let readerIdPromise = this.serviceIdToReaderIdPromiseMap_[serviceId];
    if (!readerIdPromise) {
      const consent = Promise.resolve();
      // Scope is kept "amp-access" by default to avoid unnecessary CID
      // rotation.
      const scope =
        'amp-access' + (serviceId == 'local' ? '' : '-' + serviceId);
      readerIdPromise = this.cid_.then((cid) =>
        cid.get({scope, createCookieIfNotPresent: true}, consent)
      );
      this.serviceIdToReaderIdPromiseMap_[serviceId] = readerIdPromise;
    }
    return readerIdPromise;
  }

  /**
   * Gets Score Factors for all platforms
   * @return {!Promise<!JsonObject>}
   */
  getScoreFactorStates() {
    return this.platformStore_.getScoreFactorStates();
  }

  /**
   * This method registers an auto initialized subcription platform with this
   * service.
   *
   * @param {string} serviceId
   * @param {function(!JsonObject, !ServiceAdapter):!SubscriptionPlatformInterface} subscriptionPlatformFactory
   * @return {!Promise}
   */
  registerPlatform(serviceId, subscriptionPlatformFactory) {
    return this.initialize_().then(() => {
      if (this.doesViewerProvideAuth_) {
        return; // External platforms should not register if viewer provides auth
      }
      const matchedServices = this.platformConfig_['services'].filter(
        (service) => (service.serviceId || 'local') === serviceId
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
   * Evaluates platforms and select the one to be selected for login.
   * @return {!./subscription-platform.SubscriptionPlatform}
   */
  selectPlatformForLogin() {
    return this.platformStore_.selectPlatformForLogin();
  }

  /**
   * Returns promise that resolves when page and platform configs are processed.
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
      ]).then((promiseValues) => {
        /** @type {!JsonObject} */
        this.platformConfig_ = promiseValues[0];
        /** @type {!PageConfigInterface} */
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
    return new Promise((resolve) => {
      const rawContent = tryParseJson(this.configElement_.textContent, (e) => {
        throw user().createError(
          'Failed to parse "amp-subscriptions" JSON: ',
          e
        );
      });
      resolve(rawContent);
    });
  }

  /**
   * @param {boolean} grantState
   * @private
   */
  processGrantState_(grantState) {
    // Hide loading animation.
    this.renderer_.toggleLoading(false);

    // Track view.
    this.viewTrackerPromise_ = this.viewerTracker_.scheduleView(2000);

    // If the viewer is providing a paywall we don't want the publisher
    // paywall to render in the case of no grant so we leave the page
    // in the original "unknown" state.
    if (this.doesViewerProvidePaywall_ && !grantState) {
      return;
    }

    // Update UI.
    this.renderer_.setGrantState(grantState);
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
   * Internal function to wrap SwG decryption handling
   * @param {!SubscriptionPlatformInterface} platform
   * @return {!Promise<?./entitlement.Entitlement>}
   * @private
   */
  getEntitlements_(platform) {
    return platform.getEntitlements().then((entitlements) => {
      if (
        entitlements &&
        entitlements.granted &&
        this.cryptoHandler_.isDocumentEncrypted() &&
        !entitlements.decryptedDocumentKey
      ) {
        const logChannel = platform.getServiceId() == 'local' ? user() : dev();
        logChannel.error(
          TAG,
          `${platform.getServiceId()}: Subscription granted and encryption enabled, ` +
            'but no decrypted document key returned.'
        );
        return null;
      }
      return entitlements;
    });
  }

  /**
   * @param {!SubscriptionPlatformInterface} subscriptionPlatform
   * @return {!Promise}
   */
  fetchEntitlements_(subscriptionPlatform) {
    // Don't fetch entitlements on free pages.
    if (this.isPageFree_()) {
      return Promise.resolve();
    }

    let timeout = ENTITLEMENTS_REQUEST_TIMEOUT;
    if (getMode().development || getMode().localDev) {
      timeout = ENTITLEMENTS_REQUEST_TIMEOUT * 2;
    }
    // Prerender safe platforms don't have to wait for the
    // page to become visible, all others wait for whenFirstVisible()
    const visiblePromise = subscriptionPlatform.isPrerenderSafe()
      ? Promise.resolve()
      : this.ampdoc_.whenFirstVisible();
    return visiblePromise.then(() =>
      this.timer_
        .timeoutPromise(timeout, this.getEntitlements_(subscriptionPlatform))
        .then((entitlement) => {
          entitlement =
            entitlement ||
            Entitlement.empty(subscriptionPlatform.getServiceId());
          this.resolveEntitlementsToStore_(
            subscriptionPlatform.getServiceId(),
            entitlement
          );
          return entitlement;
        })
        .catch((reason) => {
          const serviceId = subscriptionPlatform.getServiceId();
          this.platformStore_.reportPlatformFailureAndFallback(serviceId);
          throw user().createError(
            `fetch entitlements failed for ${serviceId}`,
            reason
          );
        })
    );
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
    this.maybeAddFreeEntitlement_(this.platformStore_);
  }

  /**
   * Delegates authentication to viewer
   */
  delegateAuthToViewer_() {
    const serviceIds = ['local'];
    const origin = getWinOrigin(this.ampdoc_.win);
    this.initializePlatformStore_(serviceIds);

    /** @type {!Array} */ (this.platformConfig_['services']).forEach(
      (service) => {
        if ((service['serviceId'] || 'local') == 'local') {
          const viewerPlatform = new ViewerSubscriptionPlatform(
            this.ampdoc_,
            service,
            this.serviceAdapter_,
            origin
          );
          this.platformStore_.resolvePlatform('local', viewerPlatform);
          this.getEntitlements_(viewerPlatform)
            .then((entitlement) => {
              devAssert(entitlement, 'Entitlement is null');
              // Viewer authorization is redirected to use local platform instead.
              this.resolveEntitlementsToStore_(
                'local',
                /** @type {!./entitlement.Entitlement}*/ (entitlement)
              );
            })
            .catch((reason) => {
              this.platformStore_.reportPlatformFailureAndFallback('local');
              dev().error(TAG, 'Viewer auth failed:', reason);
            });
        }
      }
    );
  }

  /**
   * Unblock document based on grant state and selected platform
   * @param {boolean=} doPlatformSelection
   * @private
   */
  startAuthorizationFlow_(doPlatformSelection = true) {
    this.platformStore_.getGrantStatus().then((grantState) => {
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

    return requireValuesPromise.then((resolvedValues) => {
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
              (grantStateEntitlement) =>
                grantStateEntitlement || Entitlement.empty('local')
            );
        })
        .then((resolveEntitlements) => {
          if (localPlatform.isPingbackEnabled()) {
            localPlatform.pingback(resolveEntitlements);
          }
        });
    }
    return null;
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
      .forEach((subscriptionPlatform) => {
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
   * @param {?string} sourceId
   * @return {!Promise<boolean>}
   */
  delegateActionToLocal(action, sourceId) {
    return this.delegateActionToService(action, 'local', sourceId);
  }

  /**
   * Delegates an action to specified platform.
   * @param {string} action
   * @param {string} serviceId
   * @param {?string} sourceId
   * @return {!Promise<boolean>}
   */
  delegateActionToService(action, serviceId, sourceId = null) {
    return new Promise((resolve) => {
      this.platformStore_.onPlatformResolves(serviceId, (platform) => {
        devAssert(platform, 'Platform is not registered');
        this.subscriptionAnalytics_.event(
          SubscriptionAnalyticsEvents.ACTION_DELEGATED,
          dict({
            'action': action,
            'serviceId': serviceId,
          }),
          dict({
            'action': action,
            'status': ActionStatus.STARTED,
          })
        );
        resolve(platform.executeAction(action, sourceId));
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
    this.platformStore_.onPlatformResolves(serviceId, (platform) => {
      devAssert(platform, 'Platform is not registered');
      platform.decorateUI(element, action, options);
    });
  }

  /**
   * Adds entitlement on free pages.
   * @param {PlatformStore} platformStore
   * @private
   */
  maybeAddFreeEntitlement_(platformStore) {
    if (!this.isPageFree_()) {
      return;
    }

    platformStore.resolveEntitlement(
      'local',
      new Entitlement({
        source: '',
        raw: '',
        granted: true,
        grantReason: GrantReason.UNLOCKED,
        dataObject: {},
      })
    );
  }

  /**
   * Returns true if page is free.
   * @return {boolean}
   * @private
   */
  isPageFree_() {
    return !this.pageConfig_.isLocked() || this.platformConfig_['alwaysGrant'];
  }
}

// Register the `amp-subscriptions` extension.
AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerServiceForDoc('subscriptions', function (ampdoc) {
    return new SubscriptionService(ampdoc).start();
  });
});
