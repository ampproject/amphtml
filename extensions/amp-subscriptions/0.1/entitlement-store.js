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

import {Entitlements} from '../../../third_party/subscriptions-project/apis';
import {Observable} from '../../../src/observable';

/** @typedef {{serviceId: string, entitlements: !Entitlements}} */
export let EntitlementChangeEventDef;


export class EntitlementStore {
  /**
   *
   * @param {!Array<string>} expectedServiceIds
   */
  constructor(expectedServiceIds) {

    /** @private @const {!Array<string>} */
    this.serviceIds_ = expectedServiceIds;

    /** @private @const {!Object<string, !Entitlements>} */
    this.entitlements_ = {};

    /** @private @const {Observable<!EntitlementChangeEventDef>} */
    this.onChangeCallbacks_ = new Observable();

    /** @private {?Promise<boolean>} */
    this.firstResolvedPromise_ = null;

    /** @private {?Promise<!Object<string, !Entitlements>>} */
    this.allResolvedPromise_ = null;
  }

  /**
   * This registers a callback which is called whenever a service id is resolved with an entitlement.
   * @param {function(!EntitlementChangeEventDef):void} callback
   */
  onChange(callback) {
    this.onChangeCallbacks_.add(callback);
  }

  /**
   * This resolves the entitlement to a serviceId
   * @param {string} serviceId
   * @param {!Entitlements} entitlements
   */
  resolveEntitlement(serviceId, entitlements) {
    this.entitlements_[serviceId] = entitlements;

    // Call all onChange callbacks.
    this.onChangeCallbacks_.fire({serviceId, entitlements});
  }

  /**
   * TODO (@prateekbh): rename this to getGrantStatus
   * @returns {!Promise<boolean>}
   */
  getFirstResolvedSubscription() {
    if (this.firstResolvedPromise_ !== null) {
      return this.firstResolvedPromise_;
    }

    this.firstResolvedPromise_ = new Promise(resolve => {
      const entitlementsResolved = Object.keys(this.entitlements_).length;

      // Check if current entitlements unblocks the reader
      for (const key in this.entitlements_) {
        const entitlements = (this.entitlements_[key]);
        if (entitlements.enablesThis()) {
          return resolve(true);
        }
      }

      if (entitlementsResolved === this.serviceIds_.length) {
        // Resolve with null if non of the entitlements unblocks the reader
        return resolve(false);
      } else {
        // Listen if any upcoming entitlements unblock the reader
        this.onChange(({entitlements}) => {
          if (entitlements.enablesThis()) {
            resolve(true);
          }
        });
      }
    });

    return this.firstResolvedPromise_;
  }

  /**
   * Returns entitlements when all services are done fetching them.
   * @returns {!Promise<Entitlements>}
   */
  getAllPlatformsEntitlement() {
    // TODO(@prateekbh): implement this.
  }
}


/** @package @visibleForTesting */
export function getEntitlementsClassForTesting() {
  return Entitlements;
}
