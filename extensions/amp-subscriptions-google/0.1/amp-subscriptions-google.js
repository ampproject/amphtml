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
  ConfiguredRuntime,
  Fetcher,
  SubscribeResponse,
} from '../../../third_party/subscriptions-project/swg';
import {Entitlement} from '../../amp-subscriptions/0.1/entitlement';
import {PageConfig} from '../../../third_party/subscriptions-project/config';
import {Services} from '../../../src/services';

const TAG = 'amp-subscriptions-google';
const PLATFORM_ID = 'subscribe.google.com';


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
    return new GoogleSubscriptionsPlatform(this.ampdoc_,
        platformConfig, serviceAdapter);
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
    /** @private @const {!ConfiguredRuntime} */
    this.runtime_ = new ConfiguredRuntime(
        ampdoc.win,
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
    });
    this.runtime_.setOnNativeSubscribeRequest(() => {
      this.onNativeSubscribeRequest_();
    });
    this.runtime_.setOnSubscribeResponse(promise => {
      promise.then(response => {
        this.onSubscribeResponse_(response);
      });
    });
  }

  /**
   * @param {boolean} linkRequested
   * @private
   */
  onLoginRequest_(linkRequested) {
    if (linkRequested) {
      this.runtime_.linkAccount();
    } else {
      this.serviceAdapter_.delegateActionToLocal('login');
    }
    if (linkRequested === undefined) {
      this.serviceAdapter_.delegateActionToLocal('other');
    }
  }

  /** @private */
  onLinkComplete_() {
    this.runtime_.reset();
    this.serviceAdapter_.reAuthorizePlatform(this);
  }

  /** @private */
  onNativeSubscribeRequest_() {
    this.serviceAdapter_.delegateActionToLocal('subscribe');
  }

  /**
   * @param {!SubscribeResponse} response
   * @private
   */
  onSubscribeResponse_(response) {
    response.complete().then(() => {
      this.runtime_.reset();
      this.serviceAdapter_.reAuthorizePlatform(this);
    });
  }

  /** @override */
  getEntitlements() {
    return this.runtime_.getEntitlements().then(swgEntitlements => {
      const swgEntitlement = swgEntitlements.getEntitlementForThis();
      if (!swgEntitlement) {
        return null;
      }
      return new Entitlement(
          swgEntitlement.source,
          swgEntitlements.raw,
          PLATFORM_ID,
          swgEntitlement.products,
          swgEntitlement.subscriptionToken);
    });
  }

  /** @override */
  getServiceId() {
    return PLATFORM_ID;
  }

  /** @override */
  activate(renderState) {
    if (!renderState.granted) {
      // TODO(dvoytenko): vary between full and abbreviated offers.
      this.runtime_.showOffers();
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
    return this.xhr_.fetchJson(url, {
      credentials: 'include',
    }).then(response => response.json());
  }
}


// Register the extension services.
AMP.extension(TAG, '0.1', function(AMP) {
  AMP.registerServiceForDoc('subscriptions-google', ampdoc => {
    const platformService = new GoogleSubscriptionsPlatformService(ampdoc);
    Services.subscriptionsServiceForDoc(ampdoc).then(service => {
      service.registerPlatform(PLATFORM_ID,
          (platformConfig, serviceAdapter) => {
            return platformService.createPlatform(platformConfig,
                serviceAdapter);
          }
      );
    });
    return platformService;
  });
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
