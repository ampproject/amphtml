import {getValueForExpr} from '#core/types/object';
import {parseQueryString} from '#core/types/string/url';
import {WindowInterface} from '#core/window/interface';

import {experimentToggles, isExperimentOn} from '#experiments';

import {Services} from '#service';

import {getData} from '#utils/event-helper';
import {devAssert, user, userAssert} from '#utils/log';

import {
  AnalyticsEvent,
  ConfiguredRuntime,
  EventOriginator,
  Fetcher as FetcherInterface,
  FilterResult,
  SubscribeResponse as SubscribeResponseInterface,
} from '#third_party/subscriptions-project/swg';
import {GaaMeteringRegwall} from '#third_party/subscriptions-project/swg-gaa';

import {CSS} from '../../../build/amp-subscriptions-google-0.1.css';
import {getMode} from '../../../src/mode';
import {installStylesForDoc} from '../../../src/style-installer';
import {assertHttpsUrl, parseUrlDeprecated} from '../../../src/url';
import {
  Action,
  ActionStatus,
  SubscriptionAnalyticsEvents,
} from '../../amp-subscriptions/0.1/analytics';
import {SubscriptionsScoreFactor} from '../../amp-subscriptions/0.1/constants';
import {DocImpl} from '../../amp-subscriptions/0.1/doc-impl';
import {
  Entitlement,
  GrantReason,
} from '../../amp-subscriptions/0.1/entitlement';
import {UrlBuilder} from '../../amp-subscriptions/0.1/url-builder';

const TAG = 'amp-subscriptions-google';
const PLATFORM_KEY = 'subscribe.google.com';
const GOOGLE_DOMAIN_RE = /(^|\.)google\.(com?|[a-z]{2}|com?\.[a-z]{2}|cat)$/;

/** @enum {number} */
const ShowcaseStrategy = {
  NONE: 1,
  LEAD_ARTICLE: 2,
  EXTENDED_ACCESS: 3,
};

/** @const */
const SERVICE_TIMEOUT = 3000;

const SWG_EVENTS_TO_SUPPRESS = {
  [AnalyticsEvent.IMPRESSION_PAYWALL]: true,
  [AnalyticsEvent.IMPRESSION_PAGE_LOAD]: true,
};

const AMP_EVENT_TO_SWG_EVENT = {
  [SubscriptionAnalyticsEvents.PAYWALL_ACTIVATED]:
    AnalyticsEvent.IMPRESSION_PAYWALL,
};

const AMP_ACTION_TO_SWG_EVENT = {
  [Action.SHOW_OFFERS]: {
    [ActionStatus.STARTED]: null, //ex: AnalyticsEvent.IMPRESSION_OFFERS
  },
};

/**
 */
export class GoogleSubscriptionsPlatformService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;
  }

  /**
   * @param {!JsonObject} platformConfig
   * @param {!../../amp-subscriptions/0.1/service-adapter.ServiceAdapter} serviceAdapter
   * @return {!GoogleSubscriptionsPlatform}
   */
  createPlatform(platformConfig, serviceAdapter) {
    return new GoogleSubscriptionsPlatform(
      this.ampdoc_,
      platformConfig,
      serviceAdapter
    );
  }
}

/**
 * @implements {../../amp-subscriptions/0.1/subscription-platform.SubscriptionPlatform}
 */
export class GoogleSubscriptionsPlatform {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} platformConfig
   * @param {!../../amp-subscriptions/0.1/service-adapter.ServiceAdapter} serviceAdapter
   */
  constructor(ampdoc, platformConfig, serviceAdapter) {
    /**
     * @private @const
     * {!../../amp-subscriptions/0.1/service-adapter.ServiceAdapter}
     */
    this.serviceAdapter_ = serviceAdapter;

    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(ampdoc.win);

    /** @private @const {boolean} */
    this.isDev_ = getMode().development || getMode().localDev;

    /**
     * @private @const
     * {!../../amp-subscriptions/0.1/analytics.SubscriptionAnalytics}
     */
    this.subscriptionAnalytics_ = serviceAdapter.getAnalytics();
    this.subscriptionAnalytics_.registerEventListener(
      this.handleAnalyticsEvent_.bind(this)
    );

    /** @private @const {!UrlBuilder} */
    this.urlBuilder_ = new UrlBuilder(
      this.ampdoc_,
      this.serviceAdapter_.getReaderId('local')
    );

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.ampdoc_.win);

    //* @const @private */
    this.fetcher_ = new AmpFetcher(ampdoc.win);

    // Map AMP experiments prefixed with 'swg-' to SwG experiments.
    const ampExperimentsForSwg = Object.keys(experimentToggles(ampdoc.win))
      .filter(
        (exp) =>
          exp.startsWith('swg-') && isExperimentOn(ampdoc.win, /*OK*/ exp)
      )
      .map((exp) => exp.substring(4));

    // Force skipping the account creation screen in the buyflow
    const swgConfig = {
      'experiments': ampExperimentsForSwg,
    };
    const clientOptions = {
      'skipAccountCreationScreen': true,
    };
    let resolver = null;
    /** @private @const {!ConfiguredRuntime} */
    this.runtime_ = new ConfiguredRuntime(
      new DocImpl(ampdoc),
      serviceAdapter.getPageConfig(),
      {
        fetcher: new AmpFetcher(ampdoc.win),
        configPromise: new Promise((resolve) => (resolver = resolve)),
      },
      swgConfig,
      clientOptions
    );

    /** @private @const {!../../../third_party/subscriptions-project/swg.ClientEventManagerApi} */
    this.eventManager_ = this.runtime_.eventManager();
    this.eventManager_.registerEventFilterer(
      GoogleSubscriptionsPlatform.filterSwgEvent_
    );
    this.eventManager_.logEvent({
      eventType: AnalyticsEvent.IMPRESSION_PAGE_LOAD,
      eventOriginator: EventOriginator.AMP_CLIENT,
      isFromUserAction: false,
      additionalParameters: null,
    });
    this.runtime_.analytics().setUrl(ampdoc.getUrl());
    resolver();

    this.runtime_.setOnLoginRequest((request) => {
      this.onLoginRequest_(request && request.linkRequested);
    });
    this.runtime_.setOnLinkComplete(() => {
      this.onLinkComplete_();
      this.subscriptionAnalytics_.actionEvent(
        this.getPlatformKey(),
        Action.LINK,
        ActionStatus.SUCCESS
      );
      // TODO(dvoytenko): deprecate separate "link" events.
      this.subscriptionAnalytics_.serviceEvent(
        SubscriptionAnalyticsEvents.LINK_COMPLETE,
        this.getPlatformKey()
      );
    });
    this.runtime_.setOnFlowStarted((e) => {
      // This information is used by Propensity.
      const params = /** @type {!JsonObject} */ ({});
      const data = /** @type {!JsonObject} */ (getData(e) || {});
      switch (e.flow) {
        case Action.SUBSCRIBE:
          params['product'] =
            data['skuId'] || data['product'] || 'unknown productId';
          params['active'] = true;
          break;
        case Action.SHOW_OFFERS:
          params['skus'] = data['skus'] || '*';
          params['source'] = data['source'] || 'unknown triggering source';
          params['active'] = data['active'] || null;
          break;
      }
      if (
        e.flow == Action.SUBSCRIBE ||
        e.flow == Action.CONTRIBUTE ||
        e.flow == Action.SHOW_CONTRIBUTION_OPTIONS ||
        e.flow == Action.SHOW_OFFERS
      ) {
        this.subscriptionAnalytics_.actionEvent(
          this.getPlatformKey(),
          e.flow,
          ActionStatus.STARTED,
          params
        );
      }
    });
    this.runtime_.setOnFlowCanceled((e) => {
      if (e.flow == 'linkAccount') {
        this.onLinkComplete_();
        this.subscriptionAnalytics_.actionEvent(
          this.getPlatformKey(),
          Action.LINK,
          ActionStatus.REJECTED
        );
        // TODO(dvoytenko): deprecate separate "link" events.
        this.subscriptionAnalytics_.serviceEvent(
          SubscriptionAnalyticsEvents.LINK_CANCELED,
          this.getPlatformKey()
        );
      } else if (
        e.flow == Action.SUBSCRIBE ||
        e.flow == Action.CONTRIBUTE ||
        e.flow == Action.SHOW_CONTRIBUTION_OPTIONS ||
        e.flow == Action.SHOW_OFFERS
      ) {
        this.subscriptionAnalytics_.actionEvent(
          this.getPlatformKey(),
          e.flow,
          ActionStatus.REJECTED
        );
      }
    });
    this.runtime_.setOnNativeSubscribeRequest(() => {
      this.onNativeSubscribeRequest_();
    });
    this.runtime_.setOnPaymentResponse((promise) => {
      promise.then((response) => {
        this.onSubscribeResponse_(
          response,
          response.productType === 'CONTRIBUTION'
            ? Action.CONTRIBUTE
            : Action.SUBSCRIBE
        );
      });
    });

    /** @const @private {!JsonObject} */
    this.serviceConfig_ = platformConfig;

    /** @private viewer */
    this.viewerPromise_ = Services.viewerForDoc(ampdoc);

    /** @private {boolean} */
    this.isGoogleViewer_ = false;
    this.resolveGoogleViewer_(this.viewerPromise_);

    /** @private {boolean} */
    this.isReadyToPay_ = false;

    // Install styles.
    installStylesForDoc(ampdoc, CSS, () => {}, false, TAG);

    /** @private @const {boolean} */
    this.enableMetering_ = !!this.serviceConfig_['enableMetering'];

    /** @private @const {boolean} */
    this.enableLAA_ = !!this.serviceConfig_['enableLAA'];

    /**
     * Allows publishers to turn off SwG entitlement checks.
     * Some publishers just use LAA entitlements.
     * SwG entitlement checks are enabled by default, for backward compatibility.
     * @private @const {boolean}
     */
    this.enableEntitlements_ =
      this.serviceConfig_['enableEntitlements'] === false ? false : true;

    userAssert(
      !(this.enableLAA_ && this.enableMetering_),
      'enableLAA and enableMetering are mutually exclusive.'
    );

    /** @private @const {string} */
    this.skuMapUrl_ = this.serviceConfig_['skuMapUrl'] || null;

    /** @private {JsonObject} */
    this.skuMap_ = /** @type {!JsonObject} */ ({});

    /** @private {!Promise} */
    this.rtcPromise_ = this.maybeFetchRealTimeConfig();
  }

  /**
   * Determines whether an event manager event should be canceled.
   * @param {!../../../third_party/subscriptions-project/swg.ClientEvent} event
   */
  static filterSwgEvent_(event) {
    if (event.eventOriginator !== EventOriginator.SWG_CLIENT) {
      return FilterResult.PROCESS_EVENT;
    }
    return SWG_EVENTS_TO_SUPPRESS[event.eventType]
      ? FilterResult.CANCEL_EVENT
      : FilterResult.PROCESS_EVENT;
  }

  /**
   * Listens for events from analytics and transmits them to the SwG event
   * manager if appropriate.
   * @param {!SubscriptionAnalyticsEvents|string} event
   * @param {!JsonObject} optVarsUnused
   * @param {!JsonObject} internalVars
   */
  handleAnalyticsEvent_(event, optVarsUnused, internalVars) {
    let eventType = null;
    const action = internalVars['action'];
    const status = internalVars['status'];

    if (AMP_EVENT_TO_SWG_EVENT[event]) {
      eventType = AMP_EVENT_TO_SWG_EVENT[event];
    } else if (action && AMP_ACTION_TO_SWG_EVENT[action]) {
      eventType = AMP_ACTION_TO_SWG_EVENT[action][status];
    }

    if (!eventType) {
      return;
    }

    this.eventManager_.logEvent({
      eventType,
      eventOriginator: EventOriginator.AMP_CLIENT,
      isFromUserAction: null,
      additionalParameters: null,
    });
  }

  /**
   * @param {boolean} linkRequested
   * @private
   */
  onLoginRequest_(linkRequested) {
    if (linkRequested && this.isGoogleViewer_) {
      this.loginWithAmpReaderId_();
      this.subscriptionAnalytics_.actionEvent(
        this.getPlatformKey(),
        Action.LINK,
        ActionStatus.STARTED
      );
      // TODO(dvoytenko): deprecate separate "link" events.
      this.subscriptionAnalytics_.serviceEvent(
        SubscriptionAnalyticsEvents.LINK_REQUESTED,
        this.getPlatformKey()
      );
    } else {
      this.maybeComplete_(
        this.serviceAdapter_.delegateActionToLocal('login', null)
      );
    }
  }

  /**
   * Kicks off login flow for account linking, and passes AMP Reader ID to authorization URL.
   * @private
   */
  loginWithAmpReaderId_() {
    // Get local AMP reader ID, to match the ID sent to local entitlement endpoints.
    this.serviceAdapter_.getReaderId('local').then((ampReaderId) => {
      this.runtime_.linkAccount({ampReaderId});
    });
  }

  /** @private */
  onLinkComplete_() {
    this.serviceAdapter_.resetPlatforms();
  }

  /* TODO(jpettitt): should local suppoort 'contribute' action? */
  /** @private */
  onNativeSubscribeRequest_() {
    this.maybeComplete_(
      this.serviceAdapter_.delegateActionToLocal(Action.SUBSCRIBE, null)
    );
  }

  /**
   * @param {!Promise<boolean>} promise
   * @private
   */
  maybeComplete_(promise) {
    promise.then((result) => {
      if (result) {
        this.runtime_.reset();
      }
    });
  }

  /**
   * Fetch a real time config if appropriate.
   *
   * Note that we don't return the skuMap, instead we save it.
   * The creates an intentional race condition.  If the server
   * doesn't return a skuMap before the user clicks the subscribe button
   * the button wil lbe disabled.
   *
   * We can't wait for the skumap in the button click becasue it will be popup blocked.
   *
   * @return {!Promise}
   */
  maybeFetchRealTimeConfig() {
    let timeout = SERVICE_TIMEOUT;
    if (this.isDev_) {
      timeout = SERVICE_TIMEOUT * 2;
    }

    if (!this.skuMapUrl_) {
      return Promise.resolve();
    }

    assertHttpsUrl(this.skuMapUrl_, 'skuMapUrl must be valid https Url');
    // RTC is never pre-render safe
    return this.ampdoc_
      .whenFirstVisible()
      .then(() =>
        this.urlBuilder_.buildUrl(
          /**  @type {string } */ (this.skuMapUrl_),
          /* useAuthData */ false
        )
      )
      .then((url) =>
        this.timer_.timeoutPromise(
          timeout,
          this.fetcher_.fetchCredentialedJson(url)
        )
      )
      .then((resJson) => {
        userAssert(
          resJson['subscribe.google.com'],
          'skuMap does not contain subscribe.google.com section'
        );
        this.skuMap_ = resJson['subscribe.google.com'];
      })
      .catch((reason) => {
        throw user().createError(
          `fetch skuMap failed for ${PLATFORM_KEY}`,
          reason
        );
      });
  }

  /**
   * @param {!SubscribeResponseInterface} response
   * @param {string} eventType
   * @private
   */
  onSubscribeResponse_(response, eventType) {
    response.complete().then(() => {
      this.serviceAdapter_.resetPlatforms();
    });
    let product;
    try {
      const entitlement =
        response.entitlements && response.entitlements.getEntitlementForThis();
      if (entitlement) {
        product = entitlement.getSku();
      }
    } catch (ex) {}
    const params = /** @type {!JsonObject} */ ({
      'active': true,
      'product': product || 'unknown subscriptionToken',
    });

    this.subscriptionAnalytics_.actionEvent(
      this.getPlatformKey(),
      eventType,
      ActionStatus.SUCCESS,
      params
    );
  }

  /**
   * Returns URL params - in its own method so we can stub it for testing.
   * @return {{[key: string]: string}}
   * @private
   */
  getUrlParams_() {
    // GAA params should be in the hash for AMP
    // to avoid being seen as discrete documents
    // by the AMP cache. However we check for
    // both just in case.
    if (/gaa_n=/.test(this.ampdoc_.win.location.hash)) {
      return parseQueryString(this.ampdoc_.win.location.hash);
    }
    return parseQueryString(this.ampdoc_.win.location.search);
  }

  /**
   * Returns a LAA entitlement for this article, if it's appropriate.
   * @return {!Promise<?Entitlement>}
   * @private
   */
  maybeGetLAAEntitlement_() {
    return this.getShowcaseStrategy_().then((strategy) => {
      // Verify Google's Showcase strategy for this article.
      if (strategy !== ShowcaseStrategy.LEAD_ARTICLE) {
        return null;
      }

      // All the criteria are met to return an LAA entitlement
      return new Entitlement({
        source: 'google:laa',
        raw: '',
        service: PLATFORM_KEY,
        granted: true,
        grantReason: GrantReason.LAA,
        dataObject: {},
        decryptedDocumentKey: null,
      });
    });
  }

  /**
   * Returns Google's Showcase strategy for this article.
   * @private
   * @return {!Promise<!ShowcaseStrategy>}
   */
  getShowcaseStrategy_() {
    // Verify the service config enables a Google Showcase strategy.
    if (!this.enableLAA_ && !this.enableMetering_) {
      return Promise.resolve(ShowcaseStrategy.NONE);
    }

    return this.viewerPromise_.getReferrerUrl().then((referrer) => {
      // Check referrer.
      const parsedReferrer = parseUrlDeprecated(referrer);
      if (
        (parsedReferrer.protocol !== 'https:' ||
          !GOOGLE_DOMAIN_RE.test(parsedReferrer.hostname)) &&
        // Note we don't use the more generic this.isDev_ flag because that can be
        // triggered by a hash value which would allow non google hostnames to
        // construct LAA urls.
        !getMode(this.ampdoc_.win).localDev
      ) {
        return ShowcaseStrategy.NONE;
      }

      // Parse URL params.
      const urlParams = this.getUrlParams_();

      // Verify timestamp.
      if (parseInt(urlParams[`gaa_ts`], 16) < Date.now() / 1000) {
        return ShowcaseStrategy.NONE;
      }

      // Verify a few params exist.
      if (!urlParams[`gaa_n`] || !urlParams[`gaa_sig`]) {
        return ShowcaseStrategy.NONE;
      }

      // Determine Google's Showcase strategy.
      if (urlParams[`gaa_at`] === 'la' && this.enableLAA_) {
        return ShowcaseStrategy.LEAD_ARTICLE;
      } else if (
        (urlParams[`gaa_at`] === 'la' || urlParams[`gaa_at`] === 'g') &&
        this.enableMetering_
      ) {
        return ShowcaseStrategy.EXTENDED_ACCESS;
      } else {
        return ShowcaseStrategy.NONE;
      }
    });
  }

  /** @override */
  isPrerenderSafe() {
    /**
     * If it's a google viewer then calling google for an
     * entitlement at prerender time does not leak any private
     * information.  If it's not a google viewer then we wait
     * for the page to be visible to avoid leaking that the
     * page was prerendered.
     *
     * If this article enables Showcase metering, then it's not prerender safe.
     * This extension could load a publisher URL to render a Google Sign-In button.
     */
    return this.isGoogleViewer_ && !this.enableMetering_;
  }

  /** @override */
  getEntitlements() {
    const encryptedDocumentKey =
      this.serviceAdapter_.getEncryptedDocumentKey('google.com');
    userAssert(
      !(this.enableLAA_ && encryptedDocumentKey),
      `enableLAA cannot be used when the document is encrypted`
    );

    return this.maybeGetLAAEntitlement_().then((laaEntitlement) => {
      if (laaEntitlement) {
        return laaEntitlement;
      }

      // Allow publishers to disable SwG entitlement checks.
      // Some publishers just want LAA entitlements.
      if (!this.enableEntitlements_) {
        return null;
      }

      const showcaseStrategyPromise = this.getShowcaseStrategy_();
      const meteringStatePromise = this.serviceAdapter_.loadMeteringState();
      const promises = Promise.all([
        showcaseStrategyPromise,
        meteringStatePromise,
      ]);

      return promises.then((results) => {
        const showcaseStrategy = results[0];
        const meteringState = results[1];

        const entitlementsParams = {};

        // Add encryption param.
        if (encryptedDocumentKey) {
          entitlementsParams.encryption = {encryptedDocumentKey};
        }

        // Add metering param.
        if (
          showcaseStrategy === ShowcaseStrategy.EXTENDED_ACCESS &&
          meteringState
        ) {
          // Make sure SwG sends a fresh request, instead of using cache.
          this.runtime_.clear();

          entitlementsParams.metering = {state: meteringState};

          // Remember we requested metering entitlements.
          // This helps avoid redundant fetches for metering entitlements.
          this.serviceAdapter_.rememberMeteringEntitlementsWereFetched();
        }

        return this.runtime_
          .getEntitlements(entitlementsParams)
          .then((swgEntitlements) =>
            this.createAmpEntitlement(swgEntitlements)
          );
      });
    });
  }

  /**
   * Returns an AMP entitlement based on SwG entitlements.
   * @param {!Entitlements} swgEntitlements
   * @return {Entitlement}
   */
  createAmpEntitlement(swgEntitlements) {
    // Get and store the isReadyToPay signal which is independent of
    // any entitlments existing.
    if (swgEntitlements.isReadyToPay) {
      this.isReadyToPay_ = true;
    }

    let swgEntitlement = swgEntitlements.getEntitlementForThis();
    let granted = false;
    if (swgEntitlement && swgEntitlement.source) {
      granted = true;
    } else if (
      swgEntitlements.entitlements.length &&
      swgEntitlements.entitlements[0].products.length
    ) {
      // We didn't find a grant so see if there is a non granting
      // and return that. Note if we start returning multiple non
      // granting we'll need to refactor to handle returning an
      // array of Entitlement objects.
      // #TODO(jpettitt) - refactor to handle multi entitlement case
      swgEntitlement = swgEntitlements.entitlements[0];
    } else {
      return null;
    }
    swgEntitlements.ack();

    // Determine grant reason.
    let grantReason;
    if (granted) {
      if (swgEntitlement.source === 'google:metering') {
        grantReason = GrantReason.METERING;
      } else {
        grantReason = GrantReason.SUBSCRIBER;
      }
    } else {
      grantReason = null;
    }

    return new Entitlement({
      source: swgEntitlement.source,
      raw: swgEntitlements.raw,
      service: PLATFORM_KEY,
      granted,
      // if it's granted it must be a subscriber
      grantReason,
      dataObject: swgEntitlement.json(),
      decryptedDocumentKey: swgEntitlements.decryptedDocumentKey,
    });
  }

  /** @override */
  getPlatformKey() {
    return PLATFORM_KEY;
  }

  /** @override */
  activate(entitlement, grantEntitlement, continueAuthorizationFlow) {
    const best = grantEntitlement || entitlement;

    const showcaseStrategyPromise = this.getShowcaseStrategy_();
    const meteringStatePromise = this.serviceAdapter_.loadMeteringState();
    const promises = Promise.all([
      showcaseStrategyPromise,
      meteringStatePromise,
    ]);

    promises.then((results) => {
      const showcaseStrategy = results[0];
      const meteringState = results[1];

      if (showcaseStrategy === ShowcaseStrategy.EXTENDED_ACCESS) {
        // Show the Regwall, so the user can get
        // a metering state that leads to a
        // granting entitlement.
        // After the Regwall flow completes, then continue authorization flow.
        if (!best.granted && !meteringState) {
          this.showMeteringRegwall_().then(continueAuthorizationFlow);
          return;
        }

        // Consume the metering entitlement.
        if (best.granted && !best.isSubscriber()) {
          this.runtime_.consumeShowcaseEntitlementJwt(
            best.raw,
            continueAuthorizationFlow
          );
          return;
        }
      }

      // Offers or abbreviated offers may need to be shown depending on
      // whether the access has been granted and whether user is a subscriber.
      if (!best.granted) {
        this.runtime_.showOffers({list: 'amp'});
      } else if (!best.isSubscriber()) {
        this.runtime_.showAbbrvOffer({list: 'amp'});
      }
    });
  }

  /**
   * Asks user to register an account with the publisher.
   * Returns a promise that resolves when the process completes.
   * @return {!Promise}
   */
  showMeteringRegwall_() {
    // Show the Showcase Regwall.
    const googleSignInDetailsPromise = GaaMeteringRegwall.show({
      // Specify a URL that renders a Google Sign-In button.
      iframeUrl: this.serviceConfig_['googleSignInHelperUrl'],
    });
    const ampReaderIdPromise = this.serviceAdapter_.getReaderId('local');

    // Register the user with the publisher.
    const registerUserPromise = Promise.all([
      googleSignInDetailsPromise,
      ampReaderIdPromise,
    ]).then((results) => {
      const googleSignInDetails = results[0];
      const ampReaderId = results[1];

      const url = this.serviceConfig_['extendedAccessRegistrationUrl'];
      const postBody = {
        googleSignInDetails,
        ampReaderId,
      };

      return this.fetcher_.sendPostToPublisher(url, postBody);
    });

    // The publisher responds with a metering state.
    // Let's save it.
    const saveMeteringStatePromise = registerUserPromise.then(
      (publisherResponse) => {
        const meteringState =
          publisherResponse &&
          publisherResponse['metering'] &&
          publisherResponse['metering']['state'];

        return this.serviceAdapter_.saveMeteringState(meteringState);
      }
    );

    // That's all.
    return saveMeteringStatePromise;
  }

  /** @override */
  reset() {
    this.runtime_.reset();
  }

  /**
   * Returns if pingback is enabled for this platform
   * @return {boolean}
   */
  isPingbackEnabled() {
    return false;
  }

  /** @override */
  pingbackReturnsAllEntitlements() {
    return false;
  }

  /**
   * Performs the pingback to the subscription platform
   */
  pingback() {}

  /** @override */
  getSupportedScoreFactor(factorName) {
    switch (factorName) {
      case SubscriptionsScoreFactor.SUPPORTS_VIEWER:
        return this.isGoogleViewer_ ? 1 : 0;
      case SubscriptionsScoreFactor.IS_READY_TO_PAY:
        return this.isReadyToPay_ ? 1 : 0;
      default:
        return 0;
    }
  }

  /**
   * @param {!../../../src/service/viewer-interface.ViewerInterface} viewer
   * @private
   */
  resolveGoogleViewer_(viewer) {
    // This is a very light veiwer resolution since there's no real security
    // implication - this only affects on-platform preferences.
    const viewerUrl = viewer.getParam('viewerUrl');
    if (viewerUrl) {
      this.isGoogleViewer_ = GOOGLE_DOMAIN_RE.test(
        parseUrlDeprecated(viewerUrl).hostname
      );
    } else {
      // This can only be resolved asynchronously in this case. However, the
      // action execution must be done synchronously. Thus we have to allow
      // a minimal race condition here.
      viewer.getViewerOrigin().then((origin) => {
        if (origin) {
          this.isGoogleViewer_ = GOOGLE_DOMAIN_RE.test(
            parseUrlDeprecated(origin).hostname
          );
        }
      });
    }
  }

  /** @override */
  getBaseScore() {
    return this.serviceConfig_['baseScore'] || 0;
  }

  /** @override */
  executeAction(action, sourceId) {
    /**
     * Note: we do handle events form the contribute and
     * subscribe flows elsewhere since they are invoked after
     * offer selection.
     */
    let mappedSku, carouselOptions;
    /*
     * If the id of the source element (sourceId) is in a map supplied via
     * the skuMap Url we use that to lookup which sku to associate this button
     * with.
     */
    const rtcPending = sourceId
      ? this.ampdoc_
          .getElementById(sourceId)
          .hasAttribute('subscriptions-google-rtc')
      : false;
    // if subscriptions-google-rtc is set then this element is configured by the
    // rtc url but has not yet been configured so we ignore it.
    // Once the rtc resolves the attribute is changed to subscriptions-google-rtc-set.
    if (rtcPending) {
      return;
    }
    if (sourceId && this.skuMap_) {
      mappedSku = getValueForExpr(this.skuMap_, `${sourceId}.sku`);
      carouselOptions = getValueForExpr(
        this.skuMap_,
        `${sourceId}.carouselOptions`
      );
    }
    if (action == Action.SUBSCRIBE) {
      if (mappedSku) {
        // publisher provided single sku
        this.runtime_.subscribe(mappedSku);
      } else if (carouselOptions) {
        // publisher provided carousel options, must always be closable
        carouselOptions.isClosable = true;
        this.runtime_.showOffers(carouselOptions);
      } else {
        // no mapping just use the amp carousel
        this.runtime_.showOffers({
          list: 'amp',
          isClosable: true,
        });
      }
      return Promise.resolve(true);
    }
    // Same idea as above but it's contribute instead of subscribe
    if (action == Action.CONTRIBUTE) {
      if (mappedSku) {
        // publisher provided single sku
        this.runtime_.contribute(mappedSku);
      } else if (carouselOptions) {
        // publisher provided carousel options, must always be closable
        carouselOptions.isClosable = true;
        this.runtime_.showContributionOptions(carouselOptions);
      } else {
        // no mapping just use the amp carousel
        this.runtime_.showContributionOptions({
          list: 'amp',
          isClosable: true,
        });
      }
      return Promise.resolve(true);
    }
    if (action == Action.LOGIN) {
      this.loginWithAmpReaderId_();
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  /** @override */
  decorateUI(element, action, options) {
    const opts = options ? options : {};

    switch (action) {
      case Action.SUBSCRIBE:
        element.textContent = '';
        this.runtime_.attachButton(element, options, () => {});
        break;
      case 'subscribe-smartbutton':
      case 'subscribe-smartbutton-light':
      case 'subscribe-smartbutton-dark':
        element.textContent = '';
        opts.theme = action === 'subscribe-smartbutton-dark' ? 'dark' : 'light';
        opts.lang = userAssert(
          element.getAttribute('subscriptions-lang'),
          'subscribe-smartbutton must have a language attribute'
        );
        const messageTextColor = element.getAttribute(
          'subscriptions-message-text-color'
        );
        if (messageTextColor) {
          opts.messageTextColor = messageTextColor;
        }
        const messageNumber = element.getAttribute(
          'subscriptions-message-number'
        );
        if (messageNumber) {
          opts.messageNumber = messageNumber;
        }
        this.runtime_.attachSmartButton(element, opts, () => {});
        break;
      default:
      // do nothing
    }
    // enable any real time buttons once it's resolved.
    this.rtcPromise_.then(() => {
      this.vsync_.mutate(() =>
        Object.keys(/** @type {!Object} */ (this.skuMap_)).forEach(
          (elementId) => {
            const element = this.ampdoc_.getElementById(elementId);
            if (element) {
              devAssert(
                element.hasAttribute('subscriptions-google-rtc'),
                `Trying to set real time config on element '${elementId}' with missing 'subscriptions-google-rtc' attrbute`
              );
              element.setAttribute('subscriptions-google-rtc-set', '');
              element.removeAttribute('subscriptions-google-rtc');
            } else {
              user().warn(
                TAG,
                `Element "{elemendId}" in real time config not found`
              );
            }
          }
        )
      );
    });
  }
}

/**
 * Adopts fetcher protocol required for SwG to AMP fetching rules.
 * @implements {FetcherInterface}
 * @visibleForTesting
 */
export class AmpFetcher {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const @private {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(win);

    /** @private @const {!Window} */
    this.win_ = win;
  }

  /** @override */
  fetchCredentialedJson(url) {
    return this.xhr_
      .fetchJson(url, {
        credentials: 'include',
        prerenderSafe: true,
      })
      .then((response) => response.json());
  }

  /** @override */
  fetch(input, opt_init) {
    return this.xhr_.fetch(input, opt_init); //needed to kepp closure happy
  }

  /** @override */
  sendPost(url, message) {
    const init = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      credentials: 'include',
      body:
        'f.req=' +
        JSON.stringify(/** @type {JsonObject} */ (message.toArray(false))),
    };
    return this.fetch(url, init).then(
      (response) => (response && response.json()) || {}
    );
  }

  /**
   * POST data to a URL endpoint, do not wait for a response.
   * @param {string} url
   * @param {string|!Object} data
   */
  sendBeacon(url, data) {
    const contentType = 'application/x-www-form-urlencoded;charset=UTF-8';
    const body =
      'f.req=' +
      JSON.stringify(/** @type {JsonObject} */ (data.toArray(false)));
    const sendBeacon = WindowInterface.getSendBeacon(this.win_);

    if (sendBeacon) {
      const blob = new Blob([body], {type: contentType});
      sendBeacon(url, blob);
      return;
    }

    // Only newer browsers support beacon.  Fallback to standard XHR POST.
    const init = {
      method: 'POST',
      headers: {'Content-Type': contentType},
      credentials: 'include',
      body,
    };
    this.fetch(url, init);
  }

  /**
   * Sends POST request, with a JSON payload, to a publisher URL.
   * @param {string} url
   * @param {!JsonObject} payload
   * @return {!Promise<!JsonObject>}
   */
  sendPostToPublisher(url, payload) {
    const init = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      ampCors: true,
      credentials: 'include',
      body: JSON.stringify(payload),
    };

    const fetchPromise = this.fetch(url, init);
    const responsePromise = fetchPromise.then(
      (response) => (response && response.json()) || {}
    );

    return responsePromise;
  }
}

// Register the extension services.
AMP.extension(TAG, '0.1', function (AMP) {
  AMP.registerServiceForDoc(
    'subscriptions-google',
    /**
     * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
     * @return {!GoogleSubscriptionsPlatformService}
     */
    function (ampdoc) {
      const platformService = new GoogleSubscriptionsPlatformService(ampdoc);
      const element = ampdoc.getHeadNode();
      Services.subscriptionsServiceForDoc(element).then((service) => {
        service.registerPlatform(
          PLATFORM_KEY,
          (platformConfig, serviceAdapter) => {
            return platformService.createPlatform(
              platformConfig,
              serviceAdapter
            );
          }
        );
      });
      return platformService;
    }
  );
});
