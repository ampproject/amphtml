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
   * @param {!Array<string>} expectedServiceIds
   */
  constructor(expectedServiceIds) {

    /** @private @const {!Array<string>} */
    this.serviceIds_ = expectedServiceIds;

    /** @private @typedef {{serviceId: string, entitlements: ./entitlements.Entitlements}} */
    this.entitlements_ = {};

    /** @private @const {!Array<function(string, ./entitlements.Entitlements)>} */
    this.onChangeCallbacks_ = [];

    /** @private {?Promise<string>} */
    this.firstResolvedPromise_ = null;
  }

  /**
   * This registers a callback which is called whenever a service id is resolved with an entitlement.
   * @param {function(string, ./entitlements.Entitlements)} callback
   */
  onChange(callback) {
    this.onChangeCallbacks_.push(callback);
  }

  /**
   * This resolves the entitlement to a serviceId
   * @param {string} serviceId
   * @param {./entitlements.Entitlements} entitlements
   */
  resolveEntitlement(serviceId, entitlements) {
    this.entitlements_[serviceId] = entitlements;

    // Call all onChange callbacks.
    this.onChangeCallbacks_.forEach(callback => {
      callback(serviceId, entitlements);
    });
  }

  /**
   * @returns {!Promise<string>}
   */
  getFirstResolvedSubscription() {
    if (this.firstResolvedPromise_ !== null) {
      return this.firstResolvedPromise_;
    }

    this.firstResolvedPromise_ = new Promise(resolve => {
      this.onChange((serviceId, entitlements) => {
        if (entitlements.enablesThis()) {
          resolve();
        }
      });
    });
    return this.firstResolvedPromise_;

  }
}

