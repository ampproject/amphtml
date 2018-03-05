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
    this.grantStatusPromise_ = null;

    /** @private {?Promise<!Array<!Entitlements>>} */
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
   * @returns {!Promise<boolean>}
   */
  getGrantStatus() {
    if (this.grantStatusPromise_ !== null) {
      return this.grantStatusPromise_;
    }

    this.grantStatusPromise_ = new Promise(resolve => {

      // Check if current entitlements unblocks the reader
      for (const key in this.entitlements_) {
        const entitlements = (this.entitlements_[key]);
        if (entitlements.enablesThis()) {
          return resolve(true);
        }
      }

      if (this.areAllPlatformsResolved_()) {
        // Resolve with null if non of the entitlements unblocks the reader
        return resolve(false);
      } else {
        // Listen if any upcoming entitlements unblock the reader
        this.onChange(({entitlements}) => {
          if (entitlements.enablesThis()) {
            resolve(true);
          } else if (this.areAllPlatformsResolved_()) {
            resolve(false);
          }
        });
      }
    });

    return this.grantStatusPromise_;
  }

  /**
   * Returns entitlements when all services are done fetching them.
   * @private
   * @returns {!Promise<!Array<!Entitlements>>}
   */
  getAllPlatformsEntitlements_() {
    if (this.allResolvedPromise_) {
      return this.allResolvedPromise_;
    }

    this.allResolvedPromise_ = new Promise(resolve => {
      if (this.areAllPlatformsResolved_()) {
        // Resolve with null if non of the entitlements unblocks the reader
        return resolve(this.getAvailablePlatformsEntitlements_());
      } else {
        // Listen if any upcoming entitlements unblock the reader
        this.onChange(() => {
          if (this.areAllPlatformsResolved_()) {
            resolve(this.getAvailablePlatformsEntitlements_());
          }
        });
      }
    });

    return this.allResolvedPromise_;
  }

  /**
   * Returns entitlements for resolved platforms.
   * @private
   * @returns {!Array<!Entitlements>}
   */
  getAvailablePlatformsEntitlements_() {
    const entitlements = [];
    for (const platform in this.entitlements_) {
      if (this.entitlements_.hasOwnProperty(platform)) {
        entitlements.push(this.entitlements_[platform]);
      }
    }
    return entitlements;
  }

  /**
   * Returns entitlements when all services are done fetching them.
   * @returns {!Promise<!Entitlements>}
   */
  selectPlatform() {
    return this.getAllPlatformsEntitlements_().then(entitlements => {
      // TODO(@prateekbh): explain why sometimes a quick resolve is possible vs waiting for all entitlements.
      return this.selectApplicablePlatform_(entitlements);
    });
  }

  /**
   * Returns the number of entitlements resolved
   * @returns {boolean}
   * @private
   */
  areAllPlatformsResolved_() {
    const entitlementsResolved = Object.keys(this.entitlements_).length;
    return entitlementsResolved === this.serviceIds_.length;
  }

  /**
   * Returns most qualified platform
   * @param {!Array<!Entitlements>} entitlements
   * @returns {!Entitlements}
   */
  selectApplicablePlatform_(entitlements) {
    let chosenPlatform;
    entitlements.forEach(platform => {
      // TODO(@prateekbh): add metering logic here
      if (platform.enablesThis()) {
        chosenPlatform = platform;
      }
    });
    return chosenPlatform;
  }
}


/** @package @visibleForTesting */
export function getEntitlementsClassForTesting() {
  return Entitlements;
}
