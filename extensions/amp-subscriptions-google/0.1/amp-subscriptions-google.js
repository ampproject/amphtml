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

import {CSS} from '../../../build/amp-subscriptions-google-0.1.css';
import {
  ConfiguredRuntime,
  Fetcher,
  SubscribeResponse,
} from '../../../third_party/subscriptions-project/swg';
import {DocImpl} from '../../amp-subscriptions/0.1/doc-impl';
import {
  Entitlement,
  GrantReason,
} from '../../amp-subscriptions/0.1/entitlement';
import {PageConfig} from '../../../third_party/subscriptions-project/config';
import {Services} from '../../../src/services';
import {SubscriptionAnalyticsEvents} from '../../amp-subscriptions/0.1/analytics';
import {SubscriptionsScoreFactor} from '../../amp-subscriptions/0.1/score-factors.js';
import {installStylesForDoc} from '../../../src/style-installer';
import {parseUrlDeprecated} from '../../../src/url';
import {userAssert} from '../../../src/log';

const TAG = 'amp-subscriptions-google';
const PLATFORM_ID = 'subscribe.google.com';
const GOOGLE_DOMAIN_RE = /(^|\.)google\.(com?|[a-z]{2}|com?\.[a-z]{2}|cat)$/;

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

    /**
     * @private @const
     * {!../../amp-subscriptions/0.1/analytics.SubscriptionAnalytics}
     */
    this.subscriptionAnalytics_ = serviceAdapter.getAnalytics();

    /** @private @const {!ConfiguredRuntime} */
    this.runtime_ = new ConfiguredRuntime(
      new DocImpl(ampdoc),
      serviceAdapter.getPageConfig(),
      {
        fetcher: new AmpFetcher(ampdoc.win),
      }
    );
    this.runtime_.setOnLoginRequest(request => {
      this.onLoginRequest_(request && request.linkRequested);
    });
    this.runtime_.setOnLinkComplete(() => {
      this.onLinkComplete_();
      this.subscriptionAnalytics_.actionEvent(
        this.getServiceId(),
        'link',
        'success'
      );
      // TODO(dvoytenko): deprecate separate "link" events.
      this.subscriptionAnalytics_.serviceEvent(
        SubscriptionAnalyticsEvents.LINK_COMPLETE,
        this.getServiceId()
      );
    });
    this.runtime_.setOnFlowStarted(e => {
      if (
        e.flow == 'subscribe' ||
        e.flow == 'contribute' ||
        e.flow == 'showContributionOptions' ||
        e.flow == 'showOffers'
      ) {
        this.subscriptionAnalytics_.actionEvent(
          this.getServiceId(),
          e.flow,
          'started'
        );
      }
    });
    this.runtime_.setOnFlowCanceled(e => {
      if (e.flow == 'linkAccount') {
        this.onLinkComplete_();
        this.subscriptionAnalytics_.actionEvent(
          this.getServiceId(),
          'link',
          'rejected'
        );
        // TODO(dvoytenko): deprecate separate "link" events.
        this.subscriptionAnalytics_.serviceEvent(
          SubscriptionAnalyticsEvents.LINK_CANCELED,
          this.getServiceId()
        );
      } else if (
        e.flow == 'subscribe' ||
        e.flow == 'contribute' ||
        e.flow == 'showContributionOptions' ||
        e.flow == 'showOffers'
      ) {
        this.subscriptionAnalytics_.actionEvent(
          this.getServiceId(),
          e.flow,
          'rejected'
        );
      }
    });
    this.runtime_.setOnNativeSubscribeRequest(() => {
      this.onNativeSubscribeRequest_();
    });
    this.runtime_.setOnSubscribeResponse(promise => {
      promise.then(response => {
        this.onSubscribeResponse_(response, 'subscribe');
      });
    });
    this.runtime_.setOnContributionResponse(promise => {
      promise.then(response => {
        this.onSubscribeResponse_(response, 'contribute');
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
  }

  /**
   * @param {boolean} linkRequested
   * @private
   */
  onLoginRequest_(linkRequested) {
    if (linkRequested && this.isGoogleViewer_) {
      this.runtime_.linkAccount();
      this.subscriptionAnalytics_.actionEvent(
        this.getServiceId(),
        'link',
        'started'
      );
      // TODO(dvoytenko): deprecate separate "link" events.
      this.subscriptionAnalytics_.serviceEvent(
        SubscriptionAnalyticsEvents.LINK_REQUESTED,
        this.getServiceId()
      );
    } else {
      this.maybeComplete_(this.serviceAdapter_.delegateActionToLocal('login'));
    }
  }

  /** @private */
  onLinkComplete_() {
    this.serviceAdapter_.resetPlatforms();
  }

  /* TODO(jpettitt): should local suppoort 'contribute' action? */
  /** @private */
  onNativeSubscribeRequest_() {
    this.maybeComplete_(
      this.serviceAdapter_.delegateActionToLocal('subscribe')
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
      'success'
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
        const swgEntitlement = swgEntitlements.getEntitlementForThis();
        if (!swgEntitlement) {
          return null;
        }
        swgEntitlements.ack();
        return new Entitlement({
          source: swgEntitlement.source,
          raw: swgEntitlements.raw,
          service: PLATFORM_ID,
          granted: true, //swgEntitlements.getEntitlementForThis makes sure this is true.
          grantReason: GrantReason.SUBSCRIBER, // there is no other case of subscription for SWG as of now.
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
   * @param {!../../../src/service/viewer-impl.Viewer} viewer
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
  executeAction(action) {
    /**
     * The contribute and subscribe flows are not called
     * directly with a sku to avoid baking sku detail into
     * a page that may be cached for an extended time.
     * Instead we use showOffers and showContributionOptions
     * which get sku info from the server.
     *
     * Note: we do handle events form the contribute and
     * subscribe flows elsewhere since they are invoked after
     * offer selection.
     */
    if (action == 'subscribe') {
      this.runtime_.showOffers({
        list: 'amp',
        isClosable: true,
      });
      return Promise.resolve(true);
    }
    if (action == 'contribute') {
      this.runtime_.showContributionOptions({
        list: 'amp',
        isClosable: true,
      });
      return Promise.resolve(true);
    }
    if (action == 'login') {
      this.runtime_.linkAccount();
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  /** @override */
  decorateUI(element, action, options) {
    const opts = options ? options : {};

    switch (action) {
      case 'subscribe':
        element.textContent = '';
        this.runtime_.attachButton(element, options, () => {});
        break;
      case 'subscribe-smartbutton':
      case 'subscribe-smartbutton-light':
        element.textContent = '';
        opts.theme = 'light';
        opts.lang = userAssert(
          element.getAttribute('subscriptions-lang'),
          'subscribe-smartbutton must have a language attrbiute'
        );
        this.runtime_.attachSmartButton(element, opts, () => {});
        break;
      case 'subscribe-smartbutton-dark':
        element.textContent = '';
        opts.theme = 'dark';
        opts.lang = userAssert(
          element.getAttribute('subscriptions-lang'),
          'subscribe-smartbutton must have a language attrbiute'
        );
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
      })
      .then(response => response.json());
  }
}

// Register the extension services.
AMP.extension(TAG, '0.1', function(AMP) {
  AMP.registerServiceForDoc(
    'subscriptions-google',
    /** @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc */
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
 * @package @visibleForTesting
 */
export function getFetcherClassForTesting() {
  return Fetcher;
}

/**
 * TODO(dvoytenko): remove once compiler type checking is fixed for third_party.
 * @package @visibleForTesting
 */
export function getPageConfigClassForTesting() {
  return PageConfig;
}

/**
 * TODO(dvoytenko): remove once compiler type checking is fixed for third_party.
 * @package @visibleForTesting
 */
export function getSubscribeResponseClassForTesting() {
  return SubscribeResponse;
}
