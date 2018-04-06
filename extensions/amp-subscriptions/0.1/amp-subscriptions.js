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

import {CSS} from '../../../build/amp-subscriptions-0.1.css';
import {Dialog} from './dialog';
import {DocImpl} from './doc-impl';
import {Entitlement} from './entitlement';
import {JwtHelper} from '../../amp-access/0.1/jwt';
import {LocalSubscriptionPlatform} from './local-subscription-platform';
import {PageConfig, PageConfigResolver} from '../../../third_party/subscriptions-project/config';
import {PlatformStore} from './platform-store';
import {Renderer} from './renderer';
import {ServiceAdapter} from './service-adapter';
import {Services} from '../../../src/services';
import {SubscriptionPlatform} from './subscription-platform';
import {ViewerTracker} from './viewer-tracker';
import {dev, user} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getMode} from '../../../src/mode';
import {getSourceOrigin, getWinOrigin} from '../../../src/url';
import {installStylesForDoc} from '../../../src/style-installer';
import {tryParseJson} from '../../../src/json';

/** @const */
const TAG = 'amp-subscriptions';

/** @const */
const SERVICE_TIMEOUT = 3000;

/** @typedef {{loggedIn: boolean, subscribed: boolean, granted: boolean, entitlement: !JsonObject, metered: boolean}} */
export let RenderState;

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

    /** @private {?Promise} */
    this.initialized_ = null;

    /** @private @const {!Renderer} */
    this.renderer_ = new Renderer(ampdoc);

    /** @private {?PageConfig} */
    this.pageConfig_ = null;

    /** @private {?JsonObject} */
    this.platformConfig_ = null;

    /** @private {?PlatformStore} */
    this.platformStore_ = null;

    /** @const @private {!Element} */
    this.configElement_ = user().assertElement(configElement);

    /** @private {!ServiceAdapter} */
    this.serviceAdapter_ = new ServiceAdapter(this);

    /** @private {!Dialog} */
    this.dialog_ = new Dialog(ampdoc);

    /** @private {!ViewerTracker} */
    this.viewerTracker_ = new ViewerTracker(ampdoc);

    /** @private @const {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = Services.viewerForDoc(ampdoc);

    /** @private {?Promise} */
    this.viewTrackerPromise_ = null;

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(ampdoc.win);

    /** @private @const {boolean} */
    this.doesViewerProvideAuth_ = this.viewer_.hasCapability('auth');

    /** @private @const {!JwtHelper} */
    this.jwtHelper_ = new JwtHelper(ampdoc.win);
  }

  /**
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
      ]).then(promiseValues => {
        /** @type {!JsonObject} */
        this.platformConfig_ = promiseValues[0];
        /** @type {!PageConfig} */
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
      this.platformStore_.resolvePlatform('local',
          new LocalSubscriptionPlatform(
              this.ampdoc_,
              serviceConfig,
              this.serviceAdapter_
          )
      );
    }
  }

  /**
   * @private
   * @returns {!Promise<!JsonObject>}
   */
  getPlatformConfig_() {
    return new Promise((resolve, reject) => {
      const rawContent = tryParseJson(this.configElement_.textContent, e => {
        reject('Failed to parse "amp-subscriptions" JSON: ' + e);
      });
      resolve(rawContent);
    });
  }

  /**
   * This method registers an auto initialized subcription platform with this service.
   *
   * @param {string} serviceId
   * @param {function(!JsonObject, !ServiceAdapter):!SubscriptionPlatform} subscriptionPlatformFactory
   */
  registerPlatform(serviceId, subscriptionPlatformFactory) {
    return this.initialize_().then(() => {
      if (this.doesViewerProvideAuth_) {
        return; // External platforms should not register if viewer provides auth
      }
      const matchedServices = this.platformConfig_['services'].filter(
          service => (service.serviceId || 'local') === serviceId);

      const matchedServiceConfig = user().assert(matchedServices[0],
          'No matching services for the ID found');

      const subscriptionPlatform = subscriptionPlatformFactory(
          matchedServiceConfig,
          this.serviceAdapter_);

      this.platformStore_.resolvePlatform(subscriptionPlatform.getServiceId(),
          subscriptionPlatform);

      this.fetchEntitlements_(subscriptionPlatform);
    });
  }

  /**
   * @param {boolean} grantState
   * @private
   */
  processGrantState_(grantState) {
    this.renderer_.toggleLoading(false);
    this.renderer_.setGrantState(grantState);

    if (grantState === false) {
      // TODO(@prateekbh): Show UI that no eligible entitlement found
      return;
    } else {
      this.viewTrackerPromise_ = this.viewerTracker_.scheduleView(2000);
    }

  }

  /**
   * @param {string} serviceId
   * @param {!./entitlement.Entitlement} entitlement
   * @private
   */
  resolveEntitlementsToStore_(serviceId, entitlement) {
    const productId = /** @type {string} */ (dev().assert(
        this.pageConfig_.getProductId(),
        'Product id is null'
    ));
    entitlement.setCurrentProduct(productId);
    this.platformStore_.resolveEntitlement(serviceId, entitlement);
  }

  /**
   * @param {!SubscriptionPlatform} subscriptionPlatform
   * @return {!Promise}
   */
  fetchEntitlements_(subscriptionPlatform) {
    let timeout = SERVICE_TIMEOUT;
    if (getMode().development || getMode().localDev) {
      timeout = SERVICE_TIMEOUT * 2;
    }
    return this.viewer_.whenFirstVisible().then(() => {
      return this.timer_.timeoutPromise(
          timeout,
          subscriptionPlatform.getEntitlements()
      ).then(entitlement => {
        entitlement = entitlement || Entitlement.empty(
            subscriptionPlatform.getServiceId());
        this.resolveEntitlementsToStore_(subscriptionPlatform.getServiceId(),
            entitlement);
        return entitlement;
      }).catch(reason => {
        const serviceId = subscriptionPlatform.getServiceId();
        this.platformStore_.reportPlatformFailure(serviceId);
        throw user().createError(
            `fetch entitlements failed for ${serviceId}`, reason
        );
      });
    });
  }

  /**
   * Starts the amp-subscription Service
   * @returns {SubscriptionService}
   */
  start() {
    this.initialize_().then(() => {

      this.renderer_.toggleLoading(true);

      user().assert(this.pageConfig_, 'Page config is null');

      if (this.doesViewerProvideAuth_) {
        this.delegateAuthToViewer_();
        this.startAuthorizationFlow_(false);
        return;
      }

      user().assert(this.platformConfig_['services'],
          'Services not configured in service config');

      const serviceIds = this.platformConfig_['services'].map(service =>
        service['serviceId'] || 'local');

      this.platformStore_ = new PlatformStore(serviceIds);

      this.platformConfig_['services'].forEach(service => {
        this.initializeLocalPlatforms_(service);
      });

      this.platformStore_.getAllRegisteredPlatforms().forEach(
          subscriptionPlatform => {
            this.fetchEntitlements_(subscriptionPlatform);
          }
      );
      this.startAuthorizationFlow_();

    });
    return this;
  }

  /**
   * Delegates authentication to viewer
   */
  delegateAuthToViewer_() {
    const serviceIds = ['local'];
    const publicationId = /** @type {string} */ (user().assert(
        this.pageConfig_.getPublicationId(),
        'Publication id is null'
    ));
    const origin = getWinOrigin(this.ampdoc_.win);
    const currentProductId = /** @type {string} */ (user().assert(
        this.pageConfig_.getProductId(),
        'Product id is null'
    ));
    this.platformStore_ = new PlatformStore(serviceIds);
    this.platformConfig_['services'].forEach(service => {
      this.initializeLocalPlatforms_(service);
    });
    this.viewer_.sendMessageAwaitResponse('auth', dict({
      'publicationId': publicationId,
      'productId': currentProductId,
      'origin': origin,
    })).then(entitlementData => {
      const authData = (entitlementData || {})['authorization'];
      if (!authData) {
        return this.platformStore_.resolveEntitlement('local',
            Entitlement.empty('local'));
      }

      return this.verifyAuthToken_(authData).then(entitlement => {
        entitlement.setCurrentProduct(currentProductId);
        // Viewer authorization is redirected to use local platform instead.
        this.platformStore_.resolveEntitlement('local', entitlement);
      }).catch(reason => {
        this.sendAuthTokenErrorToViewer_(String(reason));
        throw reason;
      });

    }, reason => {
      throw user().createError('Viewer authorization failed', reason);
    });
  }

  /**
   * Logs error and sends message to viewer
   * @param {string} token
   * @return {!Promise<!Entitlement>}
   * @private
   */
  verifyAuthToken_(token) {
    return new Promise(resolve => {
      const origin = getWinOrigin(this.ampdoc_.win);
      const sourceOrigin = getSourceOrigin(this.ampdoc_.win.location);
      const decodedData = this.jwtHelper_.decode(token);
      const currentProductId = /** @type {string} */ (user().assert(
          this.pageConfig_.getProductId(),
          'Product id is null'
      ));
      if (decodedData['aud'] != origin && decodedData['aud'] != sourceOrigin) {
        throw user().createError(
            `The mismatching "aud" field: ${decodedData['aud']}`);
      }
      if (decodedData['exp'] < Math.floor(Date.now() / 1000)) {
        throw user().createError('Payload is expired');
      }

      const entitlements = decodedData['entitlements'];
      let entitlementJson;
      if (Array.isArray(entitlements)) {
        for (let index = 0; index < entitlements.length; index++) {
          const entitlementObject =
              Entitlement.parseFromJson(entitlements[index]);
          if (entitlementObject.enables(currentProductId)) {
            entitlementJson = entitlements[index];
            break;
          }
        }
      } else if (entitlements) { // Not null
        entitlementJson = entitlements;
      }

      let entitlement;
      if (entitlementJson) {
        entitlement = Entitlement.parseFromJson(entitlementJson, token);
      } else {
        entitlement = Entitlement.empty('local');
      }
      entitlement.service = 'local';
      resolve(entitlement);
    });
  }

  /**
   * Logs error and sends message to viewer
   * @param {string} errorString
   * @private
   */
  sendAuthTokenErrorToViewer_(errorString) {
    this.viewer_.sendMessage('auth-rejected', dict({
      'reason': errorString,
    }));
  }

  /**
   * Returns the singleton Dialog instance
   * @returns {!Dialog}
   */
  getDialog() {
    return this.dialog_;
  }

  /**
   * Unblock document based on grant state and selected platform
   * @param {boolean=} doPlatformSelection
   * @private
   */
  startAuthorizationFlow_(doPlatformSelection = true) {
    this.platformStore_.getGrantStatus()
        .then(grantState => {this.processGrantState_(grantState);});

    doPlatformSelection && this.selectAndActivatePlatform_();
  }

  /** @private */
  selectAndActivatePlatform_() {
    let preferViewerSupport = true;
    if ('preferViewerSupport' in this.platformConfig_) {
      preferViewerSupport = this.platformConfig_['preferViewerSupport'];
    }
    const requireValuesPromise = Promise.all([
      this.platformStore_.getGrantStatus(),
      this.platformStore_.selectPlatform(preferViewerSupport),
    ]);

    return requireValuesPromise.then(resolvedValues => {
      const grantState = resolvedValues[0];
      const selectedPlatform = resolvedValues[1];
      const selectedEntitlement = this.platformStore_.getResolvedEntitlementFor(
          selectedPlatform.getServiceId());

      /** @type {!RenderState} */
      const renderState = {
        entitlement: selectedEntitlement.json(),
        loggedIn: selectedEntitlement.loggedIn,
        subscribed: !!selectedEntitlement.subscriptionToken,
        granted: grantState,
        metered: !!selectedEntitlement.metering,
      };

      selectedPlatform.activate(renderState);

      if (this.viewTrackerPromise_) {
        this.viewTrackerPromise_.then(() => {
          const localPlatform = this.platformStore_.getLocalPlatform();

          if (selectedPlatform.isPingbackEnabled()) {
            selectedPlatform.pingback(selectedEntitlement);
          }

          if (selectedPlatform.getServiceId() !== localPlatform.getServiceId()
              && localPlatform.isPingbackEnabled()) {
            localPlatform.pingback(selectedEntitlement);
          }
        });
      }
    });
  }

  /**
   * Returns Page config
   * @returns {!PageConfig}
   */
  getPageConfig() {
    const pageConfig = dev().assert(this.pageConfig_,
        'Page config is not yet fetched');
    return /** @type {!PageConfig} */(pageConfig);
  }

  /**
   * Re authorizes a platform
   * @param {!SubscriptionPlatform} subscriptionPlatform
   * @return {!Promise}
   */
  reAuthorizePlatform(subscriptionPlatform) {
    return this.fetchEntitlements_(subscriptionPlatform).then(() => {
      this.platformStore_.reset();
      this.startAuthorizationFlow_();
    });
  }

  /**
   * Delegates an action to local platform
   * @param {string} action
   * @return {!Promise<boolean>}
   */
  delegateActionToLocal(action) {
    const localPlatform = /** @type {LocalSubscriptionPlatform} */ (
      dev().assert(this.platformStore_.getLocalPlatform(),
          'Local platform is not registered'));

    return localPlatform.executeAction(action);
  }
}


/** @package @VisibleForTesting */
export function getPlatformClassForTesting() {
  return SubscriptionPlatform;
}

/**
 * TODO(dvoytenko): remove once compiler type checking is fixed for third_party.
 * @package @VisibleForTesting
 */
export function getPageConfigClassForTesting() {
  return PageConfig;
}


// Register the extension services.
AMP.extension(TAG, '0.1', function(AMP) {
  AMP.registerServiceForDoc('subscriptions', function(ampdoc) {
    return new SubscriptionService(ampdoc).start();
  });
});
