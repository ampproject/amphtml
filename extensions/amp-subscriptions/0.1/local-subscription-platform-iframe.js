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

import {Deferred} from '../../../src/utils/promise';
import {Entitlement} from './entitlement';
import {LocalSubscriptionBasePlatform}
  from './local-subscription-platform-base';
import {Messenger} from '../../amp-access/0.1/iframe-api/messenger';
import {assertHttpsUrl, parseUrlDeprecated} from '../../../src/url';
import {devAssert, userAssert} from '../../../src/log';
import {isArray} from '../../../src/types';
import {parseJson} from '../../../src/json';
import {toggle} from '../../../src/style';


/**
 * Implments the iframe local subscriptions platform which provides
 * authorization and pingback via an iframe
 *
 * @implements {./subscription-platform.SubscriptionPlatform}
 */
export class LocalSubscriptionIframePlatform
  extends LocalSubscriptionBasePlatform {

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} platformConfig
   * @param {!./service-adapter.ServiceAdapter} serviceAdapter
   */
  constructor(ampdoc, platformConfig, serviceAdapter) {
    super(ampdoc, platformConfig, serviceAdapter);

    devAssert(this.serviceConfig_['type'] == 'iframe',
        'iframe initialized called without iframe config type');

    /** @const @private {string} */
    this.iframeSrc_ = userAssert(this.serviceConfig_['iframeSrc'],
        '"iframeSrc" URL must be specified');
    assertHttpsUrl(this.iframeSrc_, 'iframe Url');


    /** @const @private {?Array} */
    this.iframeVars_ = this.serviceConfig_['iframeVars'] || null;
    if (this.iframeVars_) {
      userAssert(isArray(this.iframeVars_),
          '"iframeVars" must be an array');
    }

    /** @private @const {string} */
    this.targetOrigin_ = parseUrlDeprecated(this.iframeSrc_).origin;

    /** @private {?function()} */
    this.connectedResolver_ = null;

    /** @private {?Promise} */
    this.connectedPromise_ = null;

    // TODO(jpettitt) maybe allow the iframe to render UI?
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
      return this.messenger_.sendCommandRsvp('authorize', {})
          .then(res => {
            res.source = 'local-iframe';
            return JSON.stringify(res)
          })
          .then(resJson => Entitlement.parseFromJson(resJson));
    });
  }

  /** @override */
  isPingbackEnabled() {
    return true;
  }

  /** @override */
  pingback(selectedEntitlement) {
    return this.connect().then(() => {
      return this.messenger_.sendCommandRsvp(
          'pingback', {entitlement: selectedEntitlement});
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
      const pageConfig = this.serviceAdapter_.getPageConfig();
      // Pass id's to the iframe for context.
      configJson['pageConfig'] = {
        publicationId: pageConfig.getPublicationId(),
        productId: pageConfig.getProductId(),
        encryptedDocumentKey: 
            this.serviceAdapter_.getEncryptedDocumentKey('local') || null,
      };
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
