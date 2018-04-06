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
import {Services} from '../../../src/services';
import {dev, user} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getSourceOrigin, getWinOrigin} from '../../../src/url';
/**
 * This implements the methods to interact with viewer subscription platform.
 *
 * @implements {./subscription-platform.SubscriptionPlatform}
 */
export class ViewerSubscriptionPlatform {

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} platformConfig
   * @param {!./service-adapter.ServiceAdapter} serviceAdapter
   */
  constructor(ampdoc, platformConfig, serviceAdapter) {
    /** @const */
    this.ampdoc_ = ampdoc;

    /** @const @private {!JsonObject} */
    this.serviceConfig_ = platformConfig;

    /** @private @const {!./service-adapter.ServiceAdapter} */
    this.serviceAdapter_ = serviceAdapter;

    /** @const @private {!PageConfig} */
    this.pageConfig_ = serviceAdapter.getPageConfig();

    /** @private {?Entitlement}*/
    this.entitlement_ = null;

    /** @private @const {boolean} */
    this.isPingbackEnabled_ = true;

    /** @private @const {?string} */
    this.pingbackUrl_ = this.serviceConfig_['pingbackUrl'] || null;

    /** @private @const {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = Services.viewerForDoc(ampdoc);

    /** @private @const {!JwtHelper} */
    this.jwtHelper_ = new JwtHelper(ampdoc.win);
  }

  /** @override */
  getServiceId() {
    return 'local';
  }

  /**
   * Returns entitlement from the viewer
   * @param {string} publicationId
   * @param {string} currentProductId
   * @param {string} origin
   * @returns {!Promise<!Entitlement>}
   */
  getEntitlements(publicationId, currentProductId, origin) {
    return this.viewer_.sendMessageAwaitResponse('auth', dict({
      'publicationId': publicationId,
      'productId': currentProductId,
      'origin': origin,
    })).then(entitlementData => {
      const authData = (entitlementData || {})['authorization'];
      if (!authData) {
        return Entitlement.empty('local');
      }

      return this.verifyAuthToken_(authData).then(entitlement => {
        return entitlement;
      }).catch(reason => {
        this.sendAuthTokenErrorToViewer_(reason.message);
        throw reason;
      });
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

  /** @override */
  activate() {
    user().error('This platform should not be activated');
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
    const pingbackUrl = /** @type {string} */ (dev().assert(this.pingbackUrl_,
        'pingbackUrl is null'));

    const promise = this.urlBuilder_.buildUrl(pingbackUrl,
        /* useAuthData */ true);
    return promise.then(url => {
      return this.xhr_.sendSignal(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: selectedEntitlement.raw,
      });
    });
  }

  /** @override */
  supportsCurrentViewer() {
    return false;
  }
}
