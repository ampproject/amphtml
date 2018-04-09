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
import {Services} from '../../../src/services';
import {dev, user} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getSourceOrigin, getWinOrigin} from '../../../src/url';
/**
 * This implements the methods to interact with viewer subscription platform.
 *
 * @implements {./subscription-platform.SubscriptionPlatform}
 */
export class ViewerSubscriptionPlatform extends LocalSubscriptionPlatform {

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} platformConfig
   * @param {!./service-adapter.ServiceAdapter} serviceAdapter
   */
  constructor(ampdoc, platformConfig, serviceAdapter) {
    super(ampdoc, platformConfig, serviceAdapter);

    /** @const @private {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = Services.viewerForDoc(this.ampdoc_);

    /** @private @const {!JwtHelper} */
    this.jwtHelper_ = new JwtHelper(ampdoc.win);

    /** @private {?string} */
    this.publicationId_ = null;

    /** @private {?string} */
    this.currentProductId_ = null;

    /** @private {?string} */
    this.origin_ = null;
  }

  /**
   * Set details to send mesage to viewer;
   * @param {string} publicationId
   * @param {string} currentProductId
   * @param {string} origin
   */
  setMessageDetails(publicationId, currentProductId, origin) {
    this.publicationId_ = publicationId;
    this.currentProductId_ = currentProductId;
    this.origin_ = origin;
  }

  /** @override */
  getEntitlements() {
    dev().assert(this.publicationId_, 'Publication id is missing');
    dev().assert(this.currentProductId_, 'Publication id is missing');
    dev().assert(this.origin_, 'Publication id is missing');

    return this.viewer_.sendMessageAwaitResponse('auth', dict({
      'publicationId': this.publicationId_,
      'productId': this.currentProductId_,
      'origin': this.origin_,
    })).then(entitlementData => {
      const authData = (entitlementData || {})['authorization'];
      if (!authData) {
        return Entitlement.empty('local');
      }
      return this.verifyAuthToken_(authData).then(entitlement => {
        return entitlement;
      });
    }).then(entitlement => {
      this.entitlement_ = entitlement;
      return entitlement;
    }).catch(reason => {
      this.sendAuthTokenErrorToViewer_(reason.message);
      throw reason;
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
  activate() {
    user().error('This platform should not be activated');
  }
}
