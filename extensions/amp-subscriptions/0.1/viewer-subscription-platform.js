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


import {Entitlement} from './entitlement';
import {JwtHelper} from '../../amp-access/0.1/jwt';
import {LocalSubscriptionPlatform} from './local-subscription-platform';
import {PageConfig} from '../../../third_party/subscriptions-project/config';
import {Services} from '../../../src/services';
import {dev, user} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getSourceOrigin, getWinOrigin} from '../../../src/url';


/**
 * This implements the methods to interact with viewer subscription platform.
 * @implements {./subscription-platform.SubscriptionPlatform}
 */
export class ViewerSubscriptionPlatform {

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} platformConfig
   * @param {!./service-adapter.ServiceAdapter} serviceAdapter
   * @param {string} origin
   * @param {!./analytics.SubscriptionAnalytics} subscriptionAnalytics
   */
  constructor(ampdoc, platformConfig, serviceAdapter, origin,
    subscriptionAnalytics) {
    /** @private @const */
    this.ampdoc_ = ampdoc;

    /** @private @const {!PageConfig} */
    this.pageConfig_ = serviceAdapter.getPageConfig();

    /** @private @const {!LocalSubscriptionPlatform} */
    this.platform_ = new LocalSubscriptionPlatform(
        ampdoc, platformConfig, serviceAdapter, subscriptionAnalytics);

    /** @const @private {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = Services.viewerForDoc(this.ampdoc_);

    /** @private @const {!JwtHelper} */
    this.jwtHelper_ = new JwtHelper(ampdoc.win);

    /** @private @const {string} */
    this.publicationId_ = this.pageConfig_.getPublicationId();

    /** @private @const {?string} */
    this.currentProductId_ = this.pageConfig_.getProductId();

    /** @private @const {string} */
    this.origin_ = origin;
  }

  /** @override */
  getEntitlements() {
    dev().assert(this.currentProductId_, 'Current product is not set');

    const entitlementPromise = this.viewer_.sendMessageAwaitResponse(
        'auth',
        dict({
          'publicationId': this.publicationId_,
          'productId': this.currentProductId_,
          'origin': this.origin_,
        })
    ).then(entitlementData => {
      const authData = (entitlementData || {})['authorization'];
      if (!authData) {
        return Entitlement.empty('local');
      }
      return this.verifyAuthToken_(authData);
    }).catch(reason => {
      this.sendAuthTokenErrorToViewer_(reason.message);
      throw reason;
    });
    return /** @type{!Promise<Entitlement>} */ (entitlementPromise);
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
      let entitlement = Entitlement.empty('local');
      if (Array.isArray(entitlements)) {
        for (let index = 0; index < entitlements.length; index++) {
          const entitlementObject =
              Entitlement.parseFromJson(entitlements[index], token);
          if (entitlementObject.enables(currentProductId)) {
            entitlement = entitlementObject;
            break;
          }
        }
      } else if (decodedData['metering'] && !decodedData['entitlements']) { // No entitlements
        dev().assert(this.currentProductId_, 'Current product is not set');
        entitlement = new Entitlement({
          source: decodedData['iss'] || '',
          raw: token,
          service: 'local',
          products: [this.currentProductId_],
          subscriptionToken: null,
          loggedIn: false,
          metering: decodedData['metering'],
        });
      } else if (entitlements) { // Not null
        entitlement = Entitlement.parseFromJson(entitlements, token);
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

  /** @override */
  getServiceId() {
    return this.platform_.getServiceId();
  }

  /** @override */
  activate() {
  }

  /** @override */
  isPingbackEnabled() {
    return this.platform_.isPingbackEnabled();
  }

  /** @override */
  pingback(selectedPlatform) {
    this.platform_.pingback(selectedPlatform);
  }

  /** @override */
  supportsCurrentViewer() {
    return this.platform_.supportsCurrentViewer();
  }

  /** @override */
  getBaseScore() {
    return 0;
  }

  /** @override */
  executeAction(action) {
    return this.platform_.executeAction(action);
  }

  /** @override */
  decorateUI(element, action, options) {
    return this.platform_.decorateUI(element, action, options);
  }
}

/**
 * TODO(dvoytenko): remove once compiler type checking is fixed for third_party.
 * @package @visibleForTesting
 */
export function getPageConfigClassForTesting() {
  return PageConfig;
}
