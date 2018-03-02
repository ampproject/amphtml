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

import {Actions} from './actions';
import {Entitlement, Entitlements} from '../../../third_party/subscriptions-project/apis';
import {PageConfig} from '../../../third_party/subscriptions-project/config';
import {Services} from '../../../src/services';
import {SubscriptionAnalytics} from './analytics';
import {UrlBuilder} from './url-builder';
import {assertHttpsUrl} from '../../../src/url';
import {user} from '../../../src/log';

/**
 * This implements the methods to interact with various subscription platforms.
 *
 * @implements {./subscription-platform.SubscriptionPlatform}
 */
export class LocalSubscriptionPlatform {

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} serviceConfig
   * @param {!PageConfig} pageConfig
   */
  constructor(ampdoc, serviceConfig, pageConfig) {
    /** @const */
    this.ampdoc_ = ampdoc;

    /** @const @private {!JsonObject} */
    this.serviceConfig_ = serviceConfig;

    /** @const @private {!PageConfig} */
    this.pageConfig_ = pageConfig;

    /** @const @private {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(this.ampdoc_.win);

    /** @private @const {string} */
    this.authorizationUrl_ = assertHttpsUrl(
        user().assert(
            this.serviceConfig_['authorizationUrl'],
            'Service config does not have authorization Url'
        ),
        'Authorization Url'
    );

    /** @private @const {!Promise<!../../../src/service/cid-impl.Cid>} */
    this.cid_ = Services.cidForDoc(ampdoc);

    /** @private {!UrlBuilder} */
    this.urlBuilder_ = new UrlBuilder(this.ampdoc_, this.getReaderId_());

    user().assert(this.serviceConfig_['actions'],
        'Actions have not been defined in the service config');

    /** @private {!Actions} */
    this.actions_ = new Actions(
        this.ampdoc_, this.urlBuilder_,
        this.subscriptionAnalytics_,
        this.validateActionMap(this.serviceConfig_['actions'])
    );

    /** @private {?Promise<string>} */
    this.readerIdPromise_ = null;

    /** @private {!SubscriptionAnalytics} */
    this.subscriptionAnalytics_ = new SubscriptionAnalytics();
  }

  /**
   * Validates the action map
   * @param {!JsonObject<string, string>} actionMap
   * @returns {!JsonObject<string, string>}
   */
  validateActionMap(actionMap) {
    user().assert(actionMap['login'],
        'Action `Login` is not present in action map');
    user().assert(actionMap['subscribe'],
        'Action `Subscribe` is not present in action map');
    return actionMap;
  }

  /**
   * @return {!Promise<string>}
   * @private
   */
  getReaderId_() {
    if (!this.readerIdPromise_) {
      const consent = Promise.resolve();
      this.readerIdPromise_ = this.cid_.then(cid => {
        return cid.get(
            {scope: 'amp-access', createCookieIfNotPresent: true},
            consent
        );
      });
    }
    return this.readerIdPromise_;
  }

  /** @override */
  getEntitlements() {
    const currentProductId = user().assertString(
        this.pageConfig_.getProductId(), 'Current Product ID is null');

    return this.xhr_
        .fetchJson(this.authorizationUrl_, {
          credentials: 'include',
        })
        .then(res => res.json())
        .then(resJson => {
          return new Entitlements(
              this.serviceConfig_['serviceId'] || 'local',
              JSON.stringify(resJson),
              Entitlement.parseListFromJson(resJson),
              currentProductId
          );
        });
  }
}

/**
 * TODO(dvoytenko): remove once compiler type checking is fixed for third_party.
 * @package @VisibleForTesting
 */
export function getPageConfigClassForTesting() {
  return PageConfig;
}
