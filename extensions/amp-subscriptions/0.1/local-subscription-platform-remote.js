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
import {LocalSubscriptionBasePlatform}
  from './local-subscription-platform-base';
import {Services} from '../../../src/services';
import {assertHttpsUrl} from '../../../src/url';
import {devAssert, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';

/**
 * Implments the remotel local subscriptions platform which uses
 * authorization and pingback urls
 *
 * @implements {./subscription-platform.SubscriptionPlatform}
 */
export class LocalSubscriptionRemotePlatform
  extends LocalSubscriptionBasePlatform {

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

    /** @const @private {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(this.ampdoc_.win);

    /** @private @const {?string} */
    this.pingbackUrl_ = this.serviceConfig_['pingbackUrl'] || null;

    this.initializeListeners_();
  }

  /** @override */
  getEntitlements() {
    return this.urlBuilder_.buildUrl(this.authorizationUrl_,
        /* useAuthData */ false)
        .then(fetchUrl => {
          const encryptedDocumentKey =
              this.serviceAdapter_.getEncryptedDocumentKey('local');
          if (encryptedDocumentKey) {
            //TODO(chenshay): if crypt, switch to 'post'
            fetchUrl = addParamToUrl(fetchUrl, 'crypt', encryptedDocumentKey);
          }
          this.xhr_.fetchJson(fetchUrl, {credentials: 'include'})
              .then(res => res.json())
              .then(resJson => {
                return Entitlement.parseFromJson(resJson);
              });
        });
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
