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
  Action,
  ActionStatus,
  SubscriptionAnalyticsEvents,
} from '../../amp-subscriptions/0.1/analytics';
import {
  AnalyticsEvent,
  ConfiguredRuntime,
  EventOriginator,
  Fetcher,
  FilterResult,
  SubscribeResponse,
} from '../../../third_party/subscriptions-project/swg';
import {CSS} from '../../../build/amp-subscriptions-google-0.1.css';
import {DocImpl} from '../../amp-subscriptions/0.1/doc-impl';
import {
  Entitlement,
  GrantReason,
} from '../../amp-subscriptions/0.1/entitlement';
import {PageConfig} from '../../../third_party/subscriptions-project/config';
import {Services} from '../../../src/services';
import {SubscriptionsScoreFactor} from '../../amp-subscriptions/0.1/score-factors.js';
import {UrlBuilder} from '../../amp-subscriptions/0.1/url-builder';
import {assertHttpsUrl, parseUrlDeprecated} from '../../../src/url';
import {experimentToggles, isExperimentOn} from '../../../src/experiments';
import {getMode} from '../../../src/mode';
import {getValueForExpr} from '../../../src/json';
import {installStylesForDoc} from '../../../src/style-installer';

import {startsWith} from '../../../src/string';
import {user, userAssert} from '../../../src/log';

const TAG = 'amp-subscriptions-google';
const PLATFORM_ID = 'subscribe.google.com';
const GOOGLE_DOMAIN_RE = /(^|\.)google\.(com?|[a-z]{2}|com?\.[a-z]{2}|cat)$/;

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
        exp => startsWith(exp, 'swg-') && isExperimentOn(ampdoc.win, /*OK*/ exp)
      )
      .map(exp => exp.substring(4));

    const swgConfig = {'experiments': ampExperimentsForSwg};
    let resolver = null;
    /** @private @const {!ConfiguredRuntime} */
    this.runtime_ = new ConfiguredRuntime(
      new DocImpl(ampdoc),
      serviceAdapter.getPageConfig(),
      {
        fetcher: this.fetcher_,
        configPromise: new Promise(resolve => (resolver = resolve)),
      },
      swgConfig
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
    resolver();

    this.runtime_.setOnLoginRequest(request => {
      this.onLoginRequest_(request && request.linkRequested);
    });
    this.runtime_.setOnLinkComplete(() => {
      this.onLinkComplete_();
      this.subscriptionAnalytics_.actionEvent(
        this.getServiceId(),
        Action.LINK,
        ActionStatus.SUCCESS
      );
      // TODO(dvoytenko): deprecate separate "link" events.
      this.subscriptionAnalytics_.serviceEvent(
        SubscriptionAnalyticsEvents.LINK_COMPLETE,
        this.getServiceId()
      );
    });
    this.runtime_.setOnFlowStarted(e => {
      if (
        e.flow == Action.SUBSCRIBE ||
        e.flow == Action.CONTRIBUTE ||
        e.flow == Action.SHOW_CONTRIBUTION_OPTIONS ||
        e.flow == Action.SHOW_OFFERS
      ) {
        this.subscriptionAnalytics_.actionEvent(
          this.getServiceId(),
          e.flow,
          ActionStatus.STARTED
        );
      }
    });
    this.runtime_.setOnFlowCanceled(e => {
      if (e.flow == 'linkAccount') {
        this.onLinkComplete_();
        this.subscriptionAnalytics_.actionEvent(
          this.getServiceId(),
          Action.LINK,
          ActionStatus.REJECTED
        );
        // TODO(dvoytenko): deprecate separate "link" events.
        this.subscriptionAnalytics_.serviceEvent(
          SubscriptionAnalyticsEvents.LINK_CANCELED,
          this.getServiceId()
        );
      } else if (
        e.flow == Action.SUBSCRIBE ||
        e.flow == Action.CONTRIBUTE ||
        e.flow == Action.SHOW_CONTRIBUTION_OPTIONS ||
        e.flow == Action.SHOW_OFFERS
      ) {
        this.subscriptionAnalytics_.actionEvent(
          this.getServiceId(),
          e.flow,
          ActionStatus.REJECTED
        );
      }
    });
    this.runtime_.setOnNativeSubscribeRequest(() => {
      this.onNativeSubscribeRequest_();
    });
    this.runtime_.setOnPaymentResponse(promise => {
      promise.then(response => {
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

    /** @private {boolean} */
    this.isGoogleViewer_ = false;
    this.resolveGoogleViewer_(Services.viewerForDoc(ampdoc));

    /** @private {boolean} */
    this.isReadyToPay_ = false;

    // Install styles.
    installStylesForDoc(ampdoc, CSS, () => {}, false, TAG);

    /** @private @const {string} */
    this.skuMapUrl_ = this.serviceConfig_['skuMapUrl'] || null;

    /** @private {?JsonObject} */
    this.skuMap_ = null;
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
        this.getServiceId(),
        Action.LINK,
        ActionStatus.STARTED
      );
      // TODO(dvoytenko): deprecate separate "link" events.
      this.subscriptionAnalytics_.serviceEvent(
        SubscriptionAnalyticsEvents.LINK_REQUESTED,
        this.getServiceId()
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
    this.serviceAdapter_.getReaderId('local').then(ampReaderId => {
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
    promise.then(result => {
      if (result) {
        this.runtime_.reset();
      }
    });
  }

  /**
   * Fetch a real time config if appropriate.
   *
   * Note that we don't return the skuMap, instead we save it.
   * The creates an intentional reace condition.  If the server
   * doesn't return a skuMap before the user clicks the subscribe button
   * it will default the server side configured offer carousel.
   * We do this so that a failure to return a skuMap doesn't block
   * a user purchase.
   * @return {Promise}
   */
  maybeFetchRealTimeConfig() {
    let timeout = SERVICE_TIMEOUT;
    if (getMode().development || getMode().localDev) {
      timeout = SERVICE_TIMEOUT * 2;
    }

    if (!this.skuMapUrl_) {
      return Promise.resolve(null);
    }

    assertHttpsUrl(this.skuMapUrl_, 'skuMapUrl must be valid https Url');
    // Prerender safe platforms don't have to wait for the
    // page to become visible, all others wait for whenFirstVisible()
    const visiblePromise = this.isPrerenderSafe()
      ? Promise.resolve()
      : this.ampdoc_.whenFirstVisible();
    return visiblePromise
      .then(() =>
        this.urlBuilder_.buildUrl(
          /**  @type {string } */ (this.skuMapUrl_),
          /* useAuthData */ false
        )
      )
      .then(url =>
        this.timer_.timeoutPromise(
          timeout,
          this.fetcher_.fetchCredentialedJson(url)
        )
      )
      .then(resJson => {
        this.skuMap_ = resJson;
      })
      .catch(reason => {
        throw user().createError(
          `fetch skuMap failed for ${PLATFORM_ID}`,
          reason
        );
      });
  }

  /**
   * @param {!SubscribeResponse} response
   * @param {string} eventType
   * @private
   */
  onSubscribeResponse_(response, eventType) {
    response.complete().then(() => {
      this.serviceAdapter_.resetPlatforms();
    });
    this.subscriptionAnalytics_.actionEvent(
      this.getServiceId(),
      eventType,
      ActionStatus.SUCCESS
    );
  }

  /** @override */
  isPrerenderSafe() {
    /**
     * If it's a google viewer then calling google for an
     * entitlement at prerender time does not leak any private
     * information.  If it's not a google viewer then we wait
     * for the page to be visible to avoid leaking that the
     * page was prerendered
     */
    return this.isGoogleViewer_;
  }

  /** @override */
  getEntitlements() {
    const encryptedDocumentKey = this.serviceAdapter_.getEncryptedDocumentKey(
      'google.com'
    );
    return this.runtime_
      .getEntitlements(encryptedDocumentKey)
      .then(swgEntitlements => {
        // Get and store the isReadyToPay signal which is independent of
        // any entitlments existing.
        if (swgEntitlements.isReadyToPay) {
          this.isReadyToPay_ = true;
        }

        // Get the specifc entitlement we're looking for
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
        return new Entitlement({
          source: swgEntitlement.source,
          raw: swgEntitlements.raw,
          service: PLATFORM_ID,
          granted,
          // if it's granted it must be a subscriber
          grantReason: granted ? GrantReason.SUBSCRIBER : null,
          dataObject: swgEntitlement.json(),
          decryptedDocumentKey: swgEntitlements.decryptedDocumentKey,
        });
      });
  }

  /** @override */
  getServiceId() {
    return PLATFORM_ID;
  }

  /** @override */
  activate(entitlement, grantEntitlement) {
    const best = grantEntitlement || entitlement;
    // Offers or abbreviated offers may need to be shown depending on
    // whether the access has been granted and whether user is a subscriber.
    if (!best.granted) {
      this.runtime_.showOffers({list: 'amp'});
    } else if (!best.isSubscriber()) {
      this.runtime_.showAbbrvOffer({list: 'amp'});
    }
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
      viewer.getViewerOrigin().then(origin => {
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
     * the skuMap Url we use that to lookip which sku to associate this button
     * with.
     *
     * if '
     */
    if (sourceId && this.skuMap_) {
      mappedSku = getValueForExpr(
        this.skuMap_,
        `subscribe.google.com.${sourceId}.sku`
      );
      carouselOptions = getValueForExpr(
        this.skuMap_,
        `subscribe.google.com.${sourceId}.carouselOptions`
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
        this.runtime_.attachSmartButton(element, opts, () => {});
        break;
      default:
      // do nothing
    }
  }
}

/**
 * Adopts fetcher protocol required for SwG to AMP fetching rules.
 * @implements {Fetcher}
 */
class AmpFetcher {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const @private {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(win);
  }

  /** @override */
  fetchCredentialedJson(url) {
    return this.xhr_
      .fetchJson(url, {
        credentials: 'include',
        prerenderSafe: true,
      })
      .then(response => response.json());
  }

  /** @override */
  fetch(input, opt_init) {
    return this.xhr_.fetch(input, opt_init); //needed to kepp closure happy
  }
}

// Register the extension services.
AMP.extension(TAG, '0.1', function(AMP) {
  AMP.registerServiceForDoc(
    'subscriptions-google',
    /**
     * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
     * @return {*} TODO(#23582): Specify return type
     */
    ampdoc => {
      const platformService = new GoogleSubscriptionsPlatformService(ampdoc);
      const element = ampdoc.getHeadNode();
      Services.subscriptionsServiceForDoc(element).then(service => {
        service.registerPlatform(
          PLATFORM_ID,
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

/**
 * TODO(dvoytenko): remove once compiler type checking is fixed for third_party.
 * @package
 * @visibleForTesting
 * @return {*} TODO(#23582): Specify return type
 */
export function getFetcherClassForTesting() {
  return Fetcher;
}

/**
 * TODO(dvoytenko): remove once compiler type checking is fixed for third_party.
 * @package
 * @visibleForTesting
 * @return {*} TODO(#23582): Specify return type
 */
export function getPageConfigClassForTesting() {
  return PageConfig;
}

/**
 * TODO(dvoytenko): remove once compiler type checking is fixed for third_party.
 * @package
 * @visibleForTesting
 * @return {*} TODO(#23582): Specify return type
 */
export function getSubscribeResponseClassForTesting() {
  return SubscribeResponse;
}
