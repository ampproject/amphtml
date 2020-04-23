/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
import {Services} from '../../../src/services';
import {UrlBuilder} from '../../amp-subscriptions/0.1/url-builder';
import {stringifyForPingback} from '../../../src/utils/xhr-utils';

const LOCAL_STORAGE_KEYS = {
  HAS_PUBLISHER_ACCOUNT: 'account-exists-on-publisher-side',
  HAS_REJECTED_ACCOUNT_CREATION: 'user-rejected-account-creation-request',
};
/**
 * AMP-side implementation of deferred account creation, a flow responsible
 * for reconciling account existance discrepancies across platforms.
 */
export class DeferredAccountFlow {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {string} hasAssociatedAccountUrl
   * @param {string} accountCreationRedirectUrl
   * @param {../subscription-platform.SubscriptionPlatform} platform
   */
  constructor(
    ampdoc,
    hasAssociatedAccountUrl,
    accountCreationRedirectUrl,
    platform
  ) {
    /** @const @private {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(ampdoc.win);
    /**
     * @const @private {function(string):void}
     * @param {string} url
     */
    this.navigateTo_ = (url) => {
      Services.navigationForDoc(ampdoc).navigateTo(ampdoc.win, url);
    };

    /** @const @private {!../../../src/service/storage-impl.Storage} */
    this.storage_ = Services.storageForDoc(ampdoc);

    /** @private @const {?string} */
    this.hasAssociatedAccountUrl_ = hasAssociatedAccountUrl || null;

    /** @private @const {?string} */
    this.accountCreationRedirectUrl_ = accountCreationRedirectUrl || null;
    /**
     * @private @const {!UrlBuilder}
     */
    this.urlBuilder_ = new UrlBuilder(ampdoc, platform.getServiceId());

    /**
     * @private @const {../subscription-platform.SubscriptionPlatform}
     */
    this.platform_ = platform;
  }

  /**
   * @return {bool} whether deferred account creation is enabled.
   */
  isDeferredAccountCreationEnabled() {
    return this.hasAssociatedAccountUrl_ && this.accountCreationRedirectUrl_;
  }

  /**
   * @param {?./entitlement.Entitlement} selectedEntitlement
   * @return {!Promise<{found: boolean}>}
   * @private
   */
  hasAssociatedUserAccount_(selectedEntitlement) {
    let storage;
    return this.storage_
      .then((s) => {
        storage = s;
        return s.get(LOCAL_STORAGE_KEYS.HAS_PUBLISHER_ACCOUNT);
      })
      .then((publisherAccountLocalValue) => {
        if (publisherAccountLocalValue !== undefined) {
          // We found a cached value for the API call, return.
          return {found: publisherAccountLocalValue};
        }

        // Do the actual call and then store the value in storage
        return this.urlBuilder_
          .buildUrl(this.hasAssociatedAccountUrl_, /* useAuthData */ true)
          .then((url) =>
            this.xhr_.fetchJson(url, {
              method: 'POST',
              credentials: 'include',
              body: {
                entitlements: stringifyForPingback(selectedEntitlement),
              },
            })
          )
          .then((result) => result.json())
          .then((jsonResult) => {
            storage.set(
              LOCAL_STORAGE_KEYS.HAS_PUBLISHER_ACCOUNT,
              jsonResult.found
            );

            return jsonResult;
          });
      });
  }

  /**
   * Runs the flow, checking if an account corresponding to the
   * entitlement exists on the platform. If the account doesn't
   * exist and the user gives consent, the user will then be redirected
   * to the accountCreationRedirectUrl passed in the constructor.
   *
   * @param {?./entitlement.Entitlement} entitlements
   * @return {!Promise|undefined}
   */
  run(entitlements) {
    // Check if user has denied account creation already
    let storage;
    return this.storage_
      .then((s) => {
        storage = s;
        return s.get(LOCAL_STORAGE_KEYS.HAS_REJECTED_ACCOUNT_CREATION);
      })
      .then((rejected) => {
        if (rejected) {
          return;
        }
        // Check if there is an associated user account
        return this.hasAssociatedUserAccount_(entitlements).then(
          (jsonResult) => {
            if (jsonResult.found) {
              return;
            }

            this.platform_
              .completeDeferredAccountCreation()
              .then((accepted) => {
                if (accepted) {
                  // ...redirect the user to URL provided for this purpose.
                  this.navigateTo_(this.accountCreationRedirectUrl_);
                } else {
                  // The user did not authorize the creation of a linked account.
                  // Save response so we won't ask again (for a while).
                  return storage.set(
                    LOCAL_STORAGE_KEYS.HAS_REJECTED_ACCOUNT_CREATION,
                    true
                  );
                }
              });
          }
        );
      });
  }
}
