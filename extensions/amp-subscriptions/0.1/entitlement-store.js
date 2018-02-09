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

export class EntitlementStore {
  /**
   *
   * @param {!Array<string>} serviceIds
   */
  constructor(serviceIds) {

    /** @private @const {!Array<string>} */
    this.serviceIds_ = serviceIds;

    /** @private @typedef {{serviceId: string, entitlements: <./entitlement.Entitlement>}} */
    this.entitlements_ = {};

    /** @private @const {!Array<Function(string, ./entitlement.Entitlement)>} */
    this.onChangeCallbacks_ = [];

    /** @private {?Promise<string>} */
    this.firstResolvedPromise_ = null;
  }

  /**
   * This registers a callback which is called whenever a service id is resolved with an entitlement.
   * @param {Function(string, ./entitlement.Entitlement)} callback
   */
  onChange(callback) {
    this.onChangeCallbacks_.push(callback);
  }

  /**
   * This resolves the entitlement to a serviceId
   * @param {string} serviceId
   * @param {./entitlement.Entitlement} entitlement
   */
  resolveEntitlement(serviceId, entitlement) {
    this.entitlements_[serviceId] = entitlement;

    // Call all onChange callbacks.
    this.onChangeCallbacks_.forEach(callback => {
      callback(serviceId, entitlement);
    });
  }

  /**
   * @param {string} product
   * @returns {!Promise<string>}
   */
  getFirstResolvedSubscription(product) {
    this.firstResolvedPromise_ = new Promise(resolve => {
      this.onChange((serviceId, entitlement) => {
        if (entitlement.enables(product)) {
          resolve();
        }
      });
    });
    return this.firstResolvedPromise_;
  }
}

