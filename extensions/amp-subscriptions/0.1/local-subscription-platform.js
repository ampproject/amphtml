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
import {Deferred} from '../../../src/utils/promise';
import {Entitlement} from './entitlement';
import {
  LocalSubscriptionPlatformRenderer,
} from './local-subscription-platform-renderer';
import {Messenger} from '../../amp-access/0.1/iframe-api/messenger';
import {PageConfig} from '../../../third_party/subscriptions-project/config';
import {Services} from '../../../src/services';
import {UrlBuilder} from './url-builder';
import {assertHttpsUrl} from '../../../src/url';
import {closestAncestorElementBySelector} from '../../../src/dom';
import {dev, devAssert, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {isArray} from '../../../src/types';
import {parseUrlDeprecated} from '../../../src/url';
import {parseJson} from '../../../src/json';
import {toggle} from '../../../src/style';

/**
 * Local subscription platform factory method.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!JsonObject} platformConfig
 * @param {!./service-adapter.ServiceAdapter} serviceAdapter
 * @return {./subscription-platform.SubscriptionPlatform}
 */
export function LocalSubscriptionPlatformFactory(ampdoc, platformConfig, serviceAdapter) {
  /* Return the correxct platform based on the config */
  if(platformConfig['iframeUrl']) {
    return new LocalSubscriptionIframePlatform(ampdoc, platformConfig, serviceAdapter);
  }
  return new LocalSubscriptionRemotePlatform(ampdoc, platformConfig, serviceAdapter);
}

/**
 * This implements the methods to interact with various subscription platforms.
 *
 * @implements {./subscription-platform.SubscriptionPlatform}
 */
export class LocalSubscriptionBasePlatform {

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

    /** @const @private {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(this.ampdoc_.win);

    /** @private @const {!UrlBuilder} */
    this.urlBuilder_ = new UrlBuilder(
        this.ampdoc_,
        this.serviceAdapter_.getReaderId('local'));

    /** @private @const {!./analytics.SubscriptionAnalytics} */
    this.subscriptionAnalytics_ = serviceAdapter.getAnalytics();

    userAssert(this.serviceConfig_['actions'],
        'Actions have not been defined in the service config');

    /** @private @const {!Actions} */
    this.actions_ = new Actions(
        this.ampdoc_, this.urlBuilder_,
        this.subscriptionAnalytics_,
        this.validateActionMap(this.serviceConfig_['actions'])
    );

    /** @private @const {!LocalSubscriptionPlatformRenderer}*/
    this.renderer_ = new LocalSubscriptionPlatformRenderer(this.ampdoc_,
        serviceAdapter.getDialog(), this.serviceAdapter_);
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
   * @return {!JsonObject<string, string>}
   */
  validateActionMap(actionMap) {
    userAssert(actionMap['login'],
        'Action "login" is not present in action map');
    userAssert(actionMap['subscribe'],
        'Action "subscribe" is not present in action map');
    return actionMap;
  }

  /**
   * Add event listener for the subscriptions action
   * @private
   */
  initializeListeners_() {
    this.rootNode_.addEventListener('click', e => {
      const element =
        closestAncestorElementBySelector(dev().assertElement(e.target),
            '[subscriptions-action]');
      this.handleClick_(element);
    });
  }

  /**
   * Handle click on subscription-action
   * @private
   * @param {Node} element
   */
  handleClick_(element) {
    if (element) {
      const action = element.getAttribute('subscriptions-action');
      const serviceAttr = element.getAttribute('subscriptions-service');
      if (serviceAttr == 'local') {
        this.executeAction(action);
      } else if ((serviceAttr || 'auto') == 'auto') {
        if (action == 'login') {
          // The "login" action is somewhat special b/c viewers can
          // enhance this action, e.g. to provide save/link feature.
          const platform = this.serviceAdapter_.selectPlatformForLogin();
          this.serviceAdapter_.delegateActionToService(
              action, platform.getServiceId());
        } else {
          this.executeAction(action);
        }
      } else if (serviceAttr) {
        this.serviceAdapter_.delegateActionToService(action, serviceAttr);
      }
    }
  }

  /** @override */
  activate(entitlement) {
    const renderState = entitlement.json();
    this.urlBuilder_.setAuthResponse(renderState);
    this.actions_.build().then(() => {
      this.renderer_.render(renderState);
    });
  }

  /** @override */
  reset() {
    this.renderer_.reset();
  }

  /** @override */
  executeAction(action) {
    const actionExecution = this.actions_.execute(action);
    return actionExecution.then(result => {
      if (result) {
        this.serviceAdapter_.resetPlatforms();
      }
      return !!result;
    });
  }

  /** @override */
  isPrerenderSafe() {
    // Local platform can never be allowed to prerender in a viewer
    return false;
  }

  /** @override */
  getSupportedScoreFactor(unusedFactor) {
    return 0;
  }

  /** @override */
  getBaseScore() {
    return this.serviceConfig_['baseScore'] || 0;
  }

  /** @override */
  decorateUI(unusedNode, unusedAction, unusedOptions) {}
}

/**
 * Implments the remotel local subscriptions platform which uses 
 * authorization and pingback urls
 *
 * @implements {./subscription-platform.SubscriptionPlatform}
 */
export class LocalSubscriptionRemotePlatform extends LocalSubscriptionBasePlatform {

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} platformConfig
   * @param {!./service-adapter.ServiceAdapter} serviceAdapter
   */
  constructor(ampdoc, platformConfig, serviceAdapter) {
    super(ampdoc, platformConfig, serviceAdapter);
   
    /** @private @const {string} */
    this.authorizationUrl_ = assertHttpsUrl(
        userAssert(
            this.serviceConfig_['authorizationUrl'],
            'Service config does not have authorization Url'
        ),
        'Authorization Url'
    );

    /** @private @const {?string} */
    this.pingbackUrl_ = this.serviceConfig_['pingbackUrl'] || null;

    this.initializeListeners_();
  }

  /** @override */
  getEntitlements() {
    return this.urlBuilder_.buildUrl(this.authorizationUrl_,
        /* useAuthData */ false)
        .then(fetchUrl =>
          this.xhr_.fetchJson(fetchUrl, {credentials: 'include'})
              .then(res => res.json())
              .then(resJson => {
                return Entitlement.parseFromJson(resJson);
              }));
  }

  /** @override */
  isPingbackEnabled() {
    return !!this.pingbackUrl_;
  }

  /** @override */
  pingback(selectedEntitlement) {
    if (!this.isPingbackEnabled) {
      return;
    }
    const pingbackUrl = /** @type {string} */ (devAssert(this.pingbackUrl_,
        'pingbackUrl is null'));

    const promise = this.urlBuilder_.buildUrl(pingbackUrl,
        /* useAuthData */ true);
    return promise.then(url => {
      // Content should be 'text/plain' to avoid CORS preflight.
      return this.xhr_.sendSignal(url, {
        method: 'POST',
        credentials: 'include',
        headers: dict({
          'Content-Type': 'text/plain',
        }),
        body: JSON.stringify(selectedEntitlement.jsonForPingback()),
      });
    });
  }
}

/**
 * Implments the iframe local subscriptions platform which provides 
 * authorization and pingback via an iframe
 *
 * @implements {./subscription-platform.SubscriptionPlatform}
 */
export class LocalSubscriptionIframePlatform extends LocalSubscriptionBasePlatform {

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} platformConfig
   * @param {!./service-adapter.ServiceAdapter} serviceAdapter
   */
  constructor(ampdoc, platformConfig, serviceAdapter) {
    super(ampdoc, platformConfig, serviceAdapter);
    
    /** @const @private {string} */
    this.iframeSrc_ = userAssert(this.serviceConfig_['iframeUrl'],
        '"iframeUrl" URL must be specified');
    assertHttpsUrl(this.iframeSrc_, 'iframe Url');


    /** @const @private {?Array} */
    this.iframeVars_ = this.serviceConfig_['iframeVars'] || null;
    if (this.iframeVars_) {
      userAssert(isArray(this.iframeVars_),
          '"iframeVars" must be an array');
    }

    /** @private @const {!./service-adapter.ServiceAdapter} */
    this.serviceAdapter_ = serviceAdapter;

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.ampdoc_.win);

    /** @private @const {string} */
    this.targetOrigin_ = parseUrlDeprecated(this.iframeSrc_).origin;

    /** @private {?function()} */
    this.connectedResolver_ = null;

    /** @private {?Promise} */
    this.connectedPromise_ = null;

    /** @private @const {!Element} */
    this.iframe_ = ampdoc.win.document.createElement('iframe');
    toggle(this.iframe_, false);

    /** @private @const {!Messenger} */
    this.messenger_ = new Messenger(
        this.ampdoc_.win,
        () => this.iframe_.contentWindow,
        this.targetOrigin_);

    /** @private {?Promise<!JsonObject>} */
    this.configPromise_ = null;

    this.initializeListeners_();
  }

  

  /** @override */
  getEntitlements() {
    return this.connect().then(() => {
      return this.messenger_.sendCommandRsvp('authorize', {});
    });
  }

  /** @override */
  isPingbackEnabled() {
    return true;
  }

  /** @override */
  pingback(selectedEntitlement) {
    return this.connect().then(() => {
      return this.messenger_.sendCommandRsvp('pingback', {});
    });
  }

  /**
   * @return {!Promise}
   * @package Visible for testing only.
   */
  connect() {
    if (!this.connectedPromise_) {
      const deferred = new Deferred();
      this.connectedPromise_ = deferred.promise;
      this.connectedResolver_ = deferred.resolve;

      this.configPromise_ = this.resolveConfig_();
      // Connect.
      this.messenger_.connect(this.handleCommand_.bind(this));
      this.ampdoc_.getBody().appendChild(this.iframe_);
      this.iframe_.src = this.iframeSrc_;
    }
    return this.connectedPromise_;
  }

  /**
   * @return {!Promise<!JsonObject>}
   * @private
   */
  resolveConfig_() {
    return new Promise(resolve => {
      const configJson = parseJson(JSON.stringify(this.serviceConfig_));
      if (this.iframeVars_) {
        const varsString = this.iframeVars_.join('&');
        this.urlBuilder_.collectUrlVars(
            varsString,
            /* useAuthData */ false)
        .then(vars => {
          configJson['iframeVars'] = vars;
          resolve(configJson);
        });
      } else {
        resolve(configJson);
      }
    });
  }

  /**
   * @param {string} cmd
   * @param {?Object} unusedPayload
   * @return {*}
   * @private
   */
  handleCommand_(cmd, unusedPayload) {
    if (cmd == 'connect') {
      // First ever message. Indicates that the receiver is listening.
      this.configPromise_.then(configJson => {
        this.messenger_.sendCommandRsvp('start', {
          'protocol': 'amp-subscriptions',
          'config': configJson,
        }).then(() => {
          // Confirmation that connection has been successful.
          if (this.connectedResolver_) {
            this.connectedResolver_();
            this.connectedResolver_ = null;
          }
        });
      });
      return;
    }
  }
}

/**
 * TODO(dvoytenko): remove once compiler type checking is fixed for third_party.
 * @package @VisibleForTesting
 */
export function getPageConfigClassForTesting() {
  return PageConfig;
}
