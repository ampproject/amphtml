import {getValueForExpr} from '#core/types/object';
import {tryParseJson} from '#core/types/object/json';

import {Services} from '#service';

import {dev, devAssert, user, userAssert} from '#utils/log';
import {isStoryDocument} from '#utils/story';

import {
  PageConfig as PageConfigInterface,
  PageConfigResolver,
} from '#third_party/subscriptions-project/config';

import {
  ActionStatus,
  SubscriptionAnalytics,
  SubscriptionAnalyticsEvents,
} from './analytics';
import {ENTITLEMENTS_REQUEST_TIMEOUT} from './constants';
import {CryptoHandler} from './crypto-handler';
import {Dialog} from './dialog';
import {DocImpl} from './doc-impl';
import {Entitlement, GrantReason} from './entitlement';
import {localSubscriptionPlatformFactory} from './local-subscription-platform';
import {Metering} from './metering';
import {PlatformStore} from './platform-store';
import {Renderer} from './renderer';
import {ServiceAdapter} from './service-adapter';
import {SubscriptionPlatform as SubscriptionPlatformInterface} from './subscription-platform';
import {ViewerSubscriptionPlatform} from './viewer-subscription-platform';
import {ViewerTracker} from './viewer-tracker';

import {CSS} from '../../../build/amp-subscriptions-0.1.css';
import {getMode} from '../../../src/mode';
import {installStylesForDoc} from '../../../src/style-installer';
import {getWinOrigin} from '../../../src/url';

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

    /** @private {!{[key: string]: ?Promise<string>}} */
    this.platformKeyToReaderIdPromiseMap_ = {};

    /** @private {!CryptoHandler} */
    this.cryptoHandler_ = new CryptoHandler(ampdoc);

    /** @private {?Metering} */
    this.metering_ = null;
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
        this.startAuthorizationFlow_(false /** shouldActivatePlatform */);
        return;
      }

      userAssert(
        this.platformConfig_['services'],
        'Services not configured in service config'
      );

      const platformKeys = this.platformConfig_['services'].map(
        (service) => service['serviceId'] || 'local'
      );

      this.initializePlatformStore_(platformKeys);

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
        if (isStory) {
          // Make the dialog with round corners for AMP Story.
          const dialogWrapperEl = this.dialog_.getRoot();
          dialogWrapperEl.classList.add(
            'i-amphtml-story-subscriptions-dialog-wrapper'
          );
        }
        // Delegates the platform selection and activation call if is story.
        this.startAuthorizationFlow_(!isStory /** shouldActivatePlatform */);
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
   * Maybe renders and opens the dialog using the cached entitlements. Do nothing if the viewer can authorize the user.
   * @return {!Promise}
   */
  maybeRenderDialogForSelectedPlatform() {
    return this.initialize_().then(() => {
      if (this.doesViewerProvideAuth_ || this.platformConfig_['alwaysGrant']) {
        return;
      }

      return this.selectAndActivatePlatform_();
    });
  }

  /**
   * @return {!Promise<boolean>}
   */
  getGrantStatus() {
    return this.platformStore_.getGrantStatus();
  }

  /**
   * This registers a callback which is called whenever a platform key is resolved
   * with an entitlement.
   * @param {function(!EntitlementChangeEventDef):void} callback
   */
  addOnEntitlementResolvedCallback(callback) {
    this.platformStore_.addOnEntitlementResolvedCallback(callback);
  }

  /**
   * Returns encrypted document key if it exists.
   * This key is needed for requesting a different key
   * that decrypts locked content on the page.
   * @param {string} platformKey Who you want to decrypt the key.
   *                             For example: 'google.com'
   * @return {?string}
   */
  getEncryptedDocumentKey(platformKey) {
    return this.cryptoHandler_.getEncryptedDocumentKey(platformKey);
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
   * @param {string} platformKey
   * @return {!Promise<string>}
   */
  getReaderId(platformKey) {
    let readerIdPromise = this.platformKeyToReaderIdPromiseMap_[platformKey];
    if (!readerIdPromise) {
      const consent = Promise.resolve();
      // Scope is kept "amp-access" by default to avoid unnecessary CID
      // rotation.
      const scope =
        'amp-access' + (platformKey == 'local' ? '' : '-' + platformKey);
      readerIdPromise = this.cid_.then((cid) =>
        cid.get({scope, createCookieIfNotPresent: true}, consent)
      );
      this.platformKeyToReaderIdPromiseMap_[platformKey] = readerIdPromise;
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
   * @param {string} platformKey
   * @param {function(!JsonObject, !ServiceAdapter):!SubscriptionPlatformInterface} subscriptionPlatformFactory
   * @return {!Promise}
   */
  registerPlatform(platformKey, subscriptionPlatformFactory) {
    return this.initialize_().then(() => {
      if (this.doesViewerProvideAuth_) {
        return; // External platforms should not register if viewer provides auth
      }
      const matchedServices = this.platformConfig_['services'].filter(
        (service) => (service.serviceId || 'local') === platformKey
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
        subscriptionPlatform.getPlatformKey(),
        subscriptionPlatform
      );
      this.subscriptionAnalytics_.serviceEvent(
        SubscriptionAnalyticsEvents.PLATFORM_REGISTERED,
        subscriptionPlatform.getPlatformKey()
      );
      // Deprecated event fired for backward compatibility
      this.subscriptionAnalytics_.serviceEvent(
        SubscriptionAnalyticsEvents.PLATFORM_REGISTERED_DEPRECATED,
        subscriptionPlatform.getPlatformKey()
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
      ])
        .then((promiseValues) => {
          /** @type {!JsonObject} */
          this.platformConfig_ = promiseValues[0];
          /** @type {!PageConfigInterface} */
          this.pageConfig_ = promiseValues[1];
        })
        .then(() => {
          this.maybeEnableMetering_();
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

    // Set Pingback viewer timer
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
   * @param {string} platformKey
   * @param {!./entitlement.Entitlement} entitlement
   * @private
   */
  resolveEntitlementsToStore_(platformKey, entitlement) {
    this.platformStore_.resolveEntitlement(platformKey, entitlement);
    if (entitlement.decryptedDocumentKey) {
      this.cryptoHandler_.tryToDecryptDocument(
        entitlement.decryptedDocumentKey
      );
    }
    this.subscriptionAnalytics_.serviceEvent(
      SubscriptionAnalyticsEvents.ENTITLEMENT_RESOLVED,
      platformKey
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
        const logChannel =
          platform.getPlatformKey() == 'local' ? user() : dev();
        logChannel.error(
          TAG,
          `${platform.getPlatformKey()}: Subscription granted and encryption enabled, ` +
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
            Entitlement.empty(subscriptionPlatform.getPlatformKey());
          this.resolveEntitlementsToStore_(
            subscriptionPlatform.getPlatformKey(),
            entitlement
          );
          return entitlement;
        })
        .catch((reason) => {
          const platformKey = subscriptionPlatform.getPlatformKey();
          this.platformStore_.reportPlatformFailureAndFallback(platformKey);
          throw user().createError(
            `fetch entitlements failed for ${platformKey}`,
            reason
          );
        })
    );
  }

  /**
   * Initializes the PlatformStore with a list of platform keys.
   * @param {!Array<string>} platformKeys
   */
  initializePlatformStore_(platformKeys) {
    const fallbackEntitlement = this.platformConfig_['fallbackEntitlement']
      ? Entitlement.parseFromJson(this.platformConfig_['fallbackEntitlement'])
      : Entitlement.empty('local');
    this.platformStore_ = new PlatformStore(
      platformKeys,
      this.platformConfig_['score'],
      fallbackEntitlement
    );
    this.maybeAddFreeEntitlement_(this.platformStore_);
  }

  /**
   * Delegates authentication to viewer
   */
  delegateAuthToViewer_() {
    const platformKeys = ['local'];
    const origin = getWinOrigin(this.ampdoc_.win);
    this.initializePlatformStore_(platformKeys);

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
   * @param {boolean=} shouldActivatePlatform
   * @return {!Promise}
   * @private
   */
  startAuthorizationFlow_(shouldActivatePlatform = true) {
    const grantStatusPromise = this.platformStore_.getGrantStatus();
    const grantEntitlementPromise = this.platformStore_.getGrantEntitlement();
    const promises = Promise.all([grantStatusPromise, grantEntitlementPromise]);

    return promises.then((results) => {
      const granted = results[0];
      const entitlement = results[1];

      // Create shortcut to continue authorization flow.
      const continueAuthorizationFlow = () =>
        this.handleGrantState_({granted, shouldActivatePlatform});

      if (!this.metering_) {
        // Move along. This article doesn't need AMP metering's logic.
        continueAuthorizationFlow();
        return;
      }

      // AMP metering's logic:
      // - Granted?
      //   - Yes.
      //     - From AMP metering?
      //       - Yes. Consume entitlements.
      //       - No. Handle grant state normally.
      //   - No.
      //     - Have we fetched AMP metering entitlements before?
      //       - Yes. Handle grant state normally.
      //       - No.
      //         - Do we have AMP metering state?
      //           - Yes. Fetch metering entitlements.
      //           - No. Show regwall.

      const meteringPlatform = this.platformStore_.getPlatform(
        this.metering_.platformKey
      );

      if (granted) {
        const grantCameFromAmpMetering =
          entitlement &&
          entitlement.grantReason === GrantReason.METERING &&
          entitlement.service === this.metering_.platformKey;

        if (!grantCameFromAmpMetering) {
          // Move along. AMP metering isn't responsible for this grant.
          continueAuthorizationFlow();
          return;
        }

        // Consume metering entitlements.
        const finishAuthorizationFlow = () => {
          this.handleGrantState_({
            granted: true,
            shouldActivatePlatform: false,
          });
        };
        meteringPlatform.activate(
          entitlement,
          entitlement,
          finishAuthorizationFlow
        );
        return;
      }

      if (this.metering_.entitlementsWereFetchedWithCurrentMeteringState) {
        // Move along.
        // The current metering state isn't granting.
        continueAuthorizationFlow();
        return;
      }

      // Ask metering platform to either (1) fetch entitlements or (2) show regwall.
      this.metering_.loadMeteringState().then((meteringState) => {
        if (meteringState) {
          // Fetch metering entitlements.
          this.resetPlatform(this.metering_.platformKey);
        } else {
          // Show regwall.
          const emptyEntitlement = Entitlement.empty('local');
          const restartAuthorizationFlow = () => this.startAuthorizationFlow_();
          meteringPlatform.activate(
            emptyEntitlement,
            emptyEntitlement,
            restartAuthorizationFlow
          );
        }
      });
    });
  }

  /**
   * Handles grant status updates.
   * @param {{
   *   granted: boolean,
   *   shouldActivatePlatform: boolean,
   * }} params
   * @private
   */
  handleGrantState_({granted, shouldActivatePlatform}) {
    this.processGrantState_(granted);
    this.performPingback_();

    if (shouldActivatePlatform) {
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
        selectedPlatform.getPlatformKey()
      );
      const bestEntitlement = grantEntitlement || selectedEntitlement;

      selectedPlatform.activate(selectedEntitlement, grantEntitlement);

      this.subscriptionAnalytics_.serviceEvent(
        SubscriptionAnalyticsEvents.PLATFORM_ACTIVATED,
        selectedPlatform.getPlatformKey()
      );
      // Deprecated events are fire for backwards compatibility
      this.subscriptionAnalytics_.serviceEvent(
        SubscriptionAnalyticsEvents.PLATFORM_ACTIVATED_DEPRECATED,
        selectedPlatform.getPlatformKey()
      );
      if (bestEntitlement.granted) {
        this.subscriptionAnalytics_.serviceEvent(
          SubscriptionAnalyticsEvents.ACCESS_GRANTED,
          bestEntitlement.service
        );
      } else {
        this.subscriptionAnalytics_.serviceEvent(
          SubscriptionAnalyticsEvents.PAYWALL_ACTIVATED,
          selectedPlatform.getPlatformKey()
        );
        this.subscriptionAnalytics_.serviceEvent(
          SubscriptionAnalyticsEvents.ACCESS_DENIED,
          selectedPlatform.getPlatformKey()
        );
      }
    });
  }

  /**
   * Performs pingback on configured platforms.
   * @return {?Promise}
   * @private
   */
  performPingback_() {
    if (this.viewTrackerPromise_) {
      return this.viewTrackerPromise_.then(() => {
        this.platformStore_
          .getAvailablePlatforms()
          .forEach((subscriptionPlatform) => {
            // Iterate the platforms and pingback if it's enabled on that platform
            if (subscriptionPlatform.isPingbackEnabled()) {
              // Platforms can choose if they want all entitlements
              // or just the granting entitlement
              if (subscriptionPlatform.pingbackReturnsAllEntitlements()) {
                this.platformStore_
                  .getAllPlatformsEntitlements()
                  .then((resolvedEntitlments) =>
                    subscriptionPlatform.pingback(resolvedEntitlments)
                  );
              } else {
                this.platformStore_
                  .getGrantEntitlement()
                  .then((grantStateEntitlement) =>
                    subscriptionPlatform.pingback(
                      grantStateEntitlement || Entitlement.empty('local')
                    )
                  );
              }
            }
          });
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

    if (this.metering_) {
      this.metering_.entitlementsWereFetchedWithCurrentMeteringState = false;
    }

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
   * Resets a platform and re-fetches its entitlements.
   * @param {string} platformId
   */
  resetPlatform(platformId) {
    // Show loading UX.
    this.renderer_.toggleLoading(true);
    this.platformStore_.resetPlatform(platformId);

    // Re-fetch entitlements.
    const platform = this.platformStore_.getPlatform(platformId);
    this.fetchEntitlements_(platform);

    // Start auth flow.
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
   * @param {string} platformKey
   * @param {?string} sourceId
   * @return {!Promise<boolean>}
   */
  delegateActionToService(action, platformKey, sourceId = null) {
    return new Promise((resolve) => {
      this.platformStore_.onPlatformResolves(platformKey, (platform) => {
        devAssert(platform, 'Platform is not registered');
        this.subscriptionAnalytics_.event(
          SubscriptionAnalyticsEvents.ACTION_DELEGATED,
          {
            'action': action,
            'serviceId': platformKey,
          },
          {
            'action': action,
            'status': ActionStatus.STARTED,
          }
        );
        resolve(platform.executeAction(action, sourceId));
      });
    });
  }

  /**
   * Delegate UI decoration to another service.
   * @param {!Element} element
   * @param {string} platformKey
   * @param {string} action
   * @param {?JsonObject} options
   */
  decorateServiceAction(element, platformKey, action, options) {
    this.platformStore_.onPlatformResolves(platformKey, (platform) => {
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
        grantReason: GrantReason.FREE,
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

  /**
   * Enables metering, if a platform needs it.
   * @private
   */
  maybeEnableMetering_() {
    const {services} = this.platformConfig_;
    const meteringPlatform = services.find(
      (service) => service['enableMetering']
    );

    if (meteringPlatform) {
      this.metering_ = new Metering({
        platformKey: meteringPlatform.serviceId,
      });
    }
  }
}

// Register the `amp-subscriptions` extension.
AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerServiceForDoc('subscriptions', function (ampdoc) {
    return new SubscriptionService(ampdoc).start();
  });
});
