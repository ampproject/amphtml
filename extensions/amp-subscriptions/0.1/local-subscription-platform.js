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
import {LocalSubscriptionPlatformRenderer} from './local-subscription-platform-renderer';
import {PageConfig} from '../../../third_party/subscriptions-project/config';
import {Services} from '../../../src/services';
import {SubscriptionAnalytics} from './analytics';
import {UrlBuilder} from './url-builder';
import {assertHttpsUrl} from '../../../src/url';
import {closestBySelector} from '../../../src/dom';
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

    /** @private @const */
    this.document_ = this.ampdoc_.win.document;

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

    /** @private {!SubscriptionAnalytics} */
    this.subscriptionAnalytics_ = new SubscriptionAnalytics();

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

    /** @private {!LocalSubscriptionPlatformRenderer}*/
    this.renderer_ = new LocalSubscriptionPlatformRenderer(this.ampdoc_);

    /** @private {?Entitlements}*/
    this.entitlements_ = null;

    this.initializeListeners_();
  }

  /**
   * @override
   */
  getServiceId() {
    return 'local';
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

  /**
   * Add event listener for the subscriptions action
   * @private
   */
  initializeListeners_() {
    this.document_.addEventListener('click', e => {
      const element = closestBySelector(e.target, '[subscriptions-action]');
      if (element) {
        const action = element.getAttribute('subscriptions-action');
        this.executeAction(action);
      }
    });
  }

  /**
   * Renders the platform specific UI
   */
  render() {
    this.renderer_.render();
  }

  /**
   * Executes action for the local platform.
   * @param {string} action
   */
  executeAction(action) {
    const actionExecution = this.actions_.execute(action);
    actionExecution.then(result => {
      if (result) {
        this.getEntitlements();
      }
    });
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
          const entitlements = new Entitlements(
              this.serviceConfig_['serviceId'] || 'local',
              JSON.stringify(resJson),
              Entitlement.parseListFromJson(resJson),
              currentProductId
          );
          this.entitlements_ = entitlements;
          return entitlements;
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
