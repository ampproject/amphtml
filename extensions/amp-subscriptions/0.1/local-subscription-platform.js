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
import {Entitlement} from './entitlement';
import {LocalSubscriptionPlatformRenderer} from './local-subscription-platform-renderer';
import {PageConfig} from '../../../third_party/subscriptions-project/config';
import {Services} from '../../../src/services';
import {SubscriptionAnalytics} from './analytics';
import {UrlBuilder} from './url-builder';
import {assertHttpsUrl} from '../../../src/url';
import {closestBySelector} from '../../../src/dom';
import {dev, user} from '../../../src/log';

/**
 * This implements the methods to interact with various subscription platforms.
 *
 * @implements {./subscription-platform.SubscriptionPlatform}
 */
export class LocalSubscriptionPlatform {

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} platformConfig
   * @param {!./service-adapter.ServiceAdapter} serviceAdapter
   */
  constructor(ampdoc, platformConfig, serviceAdapter) {
    /** @const */
    this.ampdoc_ = ampdoc;

    /** @private @const */
    this.rootNode_ = ampdoc.getRootNode();

    /** @const @private {!JsonObject} */
    this.serviceConfig_ = platformConfig;

    /** @private @const {!./service-adapter.ServiceAdapter} */
    this.serviceAdapter_ = serviceAdapter;

    /** @const @private {!PageConfig} */
    this.pageConfig_ = serviceAdapter.getPageConfig();

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
    this.renderer_ = new LocalSubscriptionPlatformRenderer(this.ampdoc_,
        serviceAdapter.getDialog());

    /** @private {?Entitlement}*/
    this.entitlement_ = null;

    /** @private @const {boolean} */
    this.isPingbackEnabled_ = true;

    /** @private @const {string} */
    this.pingbackUrl_ = dev().assert(this.serviceConfig_['pingbackUrl'],
        '"pingbackUrl" is required in config');

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
        'Action "login" is not present in action map');
    user().assert(actionMap['subscribe'],
        'Action "subscribe" is not present in action map');
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
    this.rootNode_.addEventListener('click', e => {
      const element = closestBySelector(dev().assertElement(e.target),
          '[subscriptions-action]');
      if (element) {
        const action = element.getAttribute('subscriptions-action');
        this.executeAction(action);
      }
    });
  }

  /**
   * Renders the platform specific UI
   * @param {!./amp-subscriptions.RenderState} renderState
   */
  activate(renderState) {
    this.renderer_.render(renderState);
  }

  /**
   * Executes action for the local platform.
   * @param {string} action
   * @returns {!Promise}
   */
  executeAction(action) {
    const actionExecution = this.actions_.execute(action);
    return actionExecution.then(result => {
      if (result) {
        this.serviceAdapter_.reAuthorizePlatform(this);
      }
      return result;
    });
  }

  /** @override */
  getEntitlements() {
    return this.xhr_
        .fetchJson(this.authorizationUrl_, {
          credentials: 'include',
        })
        .then(res => res.json())
        .then(resJson => {
          const entitlement = Entitlement.parseFromJson(resJson);
          this.entitlement_ = entitlement;
          return entitlement;
        });
  }

  /** @override */
  isPingbackEnabled() {
    return this.isPingbackEnabled_;
  }

  /** @override */
  pingback() {
    const promise = this.urlBuilder_.buildUrl(this.pingbackUrl_,
        /* useAuthData */ true);
    return promise.then(url => {
      dev().fine(this.getServiceId(), 'Pingback URL: ', url);
      return this.xhr_.sendSignal(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.entitlement_.json()),
      });
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
