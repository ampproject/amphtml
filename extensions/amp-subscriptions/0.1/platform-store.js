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

import {Observable} from '../../../src/observable';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';

/** @typedef {{serviceId: string, entitlement: (!./entitlement.Entitlement|undefined)}} */
export let EntitlementChangeEventDef;


export class PlatformStore {
  /**
   *
   * @param {!Array<string>} expectedServiceIds
   */
  constructor(expectedServiceIds) {

    /** @private @const {!Object<string, !./subscription-platform.SubscriptionPlatform>} */
    this.subscriptionPlatforms_ = dict();

    /** @private @const {!Array<string>} */
    this.serviceIds_ = expectedServiceIds;

    /** @private @const {!Object<string, !./entitlement.Entitlement|undefined>} */
    this.entitlements_ = {};

    /** @private @const {Observable<!EntitlementChangeEventDef>} */
    this.onChangeCallbacks_ = new Observable();

    /** @private {?Promise<boolean>} */
    this.grantStatusPromise_ = null;

    /** @private {?Promise<!Array<!./entitlement.Entitlement>>} */
    this.allResolvedPromise_ = null;

  }

  /**
   * Resolves a platform in the store
   * @param {string} servideId
   * @param {!./subscription-platform.SubscriptionPlatform} platform
   */
  resolvePlatform(servideId, platform) {
    this.subscriptionPlatforms_[servideId] = platform;
  }

  /**
   * Returns the platform for the given id
   * @param {string} servideId
   * @returns {!./subscription-platform.SubscriptionPlatform}
   */
  getPlatform(servideId) {
    const platform = this.subscriptionPlatforms_[servideId];
    dev().assert(platform, `Platform for id ${servideId} is not resolved`);
    return platform;
  }

  /**
   * Returns the local platform;
   * @returns {!./subscription-platform.SubscriptionPlatform}
   */
  getLocalPlatform() {
    return this.getPlatform('local');
  }

  /**
   * Returns all the platforms;
   * @returns {!Array<!./subscription-platform.SubscriptionPlatform>}
   */
  getAllResolvedPlatforms() {
    const platforms = [];
    for (const platformKey in this.subscriptionPlatforms_) {
      if (this.subscriptionPlatforms_.hasOwnProperty(platformKey)) {
        const subscriptionPlatform =
          this.subscriptionPlatforms_[platformKey];
        platforms.push(subscriptionPlatform);
      }
    }
    return platforms;
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
   * @param {!./entitlement.Entitlement} entitlement
   */
  resolveEntitlement(serviceId, entitlement) {
    if (entitlement) {
      entitlement.service = serviceId;
    }

    this.entitlements_[serviceId] = entitlement;
    // Call all onChange callbacks.
    this.onChangeCallbacks_.fire({serviceId, entitlement});
  }

  /**
   * Returns entitlement for a platform
   * @param {string} serviceId
   * @returns {!./entitlement.Entitlement} entitlement
   */
  getResolvedEntitlementFor(serviceId) {
    dev().assert(this.entitlements_[serviceId],
        'Platform ${serviceId} has not yet resolved with entitlements');
    return this.entitlements_[serviceId];
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
        const entitlement = (this.entitlements_[key]);
        if (entitlement.enablesThis()) {
          return resolve(true);
        }
      }

      if (this.areAllPlatformsResolved_()) {
        // Resolve with null if non of the entitlements unblocks the reader
        return resolve(false);
      } else {
        // Listen if any upcoming entitlements unblock the reader
        this.onChange(({entitlement}) => {
          if (entitlement.enablesThis()) {
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
   * Clears the grant status
   */
  reset() {
    this.grantStatusPromise_ = null;
  }

  /**
   * Returns entitlements when all services are done fetching them.
   * @private
   * @returns {!Promise<!Array<!./entitlement.Entitlement>>}
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
   * @returns {!Array<!./entitlement.Entitlement>}
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
   * @returns {!Promise<!./subscription-platform.SubscriptionPlatform>}
   */
  selectPlatform() {

    return this.getAllPlatformsEntitlements_().then(entitlements => {
      // TODO(@prateekbh): explain why sometimes a quick resolve is possible vs waiting for all entitlement.
      return this.selectApplicableEntitlement_(entitlements);
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
   * Returns most qualified platform.
   * Qualification of a platform is based on an integer weight.
   * Every platform starts with weight 0 and evaluated against the following parameters,
   * - user is subscribed with platform (Gives weight 10)
   * - supports the current viewer (Gives weight 9)
   *
   * In the end candidate with max weight is selected.
   * However if candidate's weight is equal to local platform, then local platform is selected.
   * @param {!Array<!./entitlement.Entitlement>} entitlements
   * @returns {!./subscription-platform.SubscriptionPlatform}
   */
  selectApplicableEntitlement_(entitlements) {
    const localPlatform = this.getLocalPlatform();

    /** @type {object<string, number>} */
    const platformWeights = {};

    // Subscriber, gains weight 10
    entitlements.forEach(entitlement => {
      if (!!entitlement.subscriptionToken) {
        platformWeights[entitlement.serviceId] = 10;
      }
    });

    // If supports the current viewer, gains weight 9
    this.getAllResolvedPlatforms().forEach(platform => {
      if (platform.supportsCurrentViewer()) {
        platformWeights[platform.getServiceId()] =
          (platformWeights[platform.getServiceId()] || 0) + 9;
      }
    });

    // Sort according to weight
    const weightSorter = [];
    for (const platformName in platformWeights) {
      weightSorter.push({serviceId: platformName,
        weight: platformWeights[platformName]});
    }

    weightSorter.sort(function(platform1, platform2) {
      return platform2.weight - platform1.weight;
    });

    // Nobody supports current viewer, nor is anybody subscribed
    if (weightSorter.length === 0) {
      return localPlatform;
    }

    const winningWeight = platformWeights[weightSorter[0].serviceId];
    const localWeight = platformWeights['local'];

    if (winningWeight > localWeight) {
      return this.getPlatform(weightSorter[0].serviceId);
    }

    return localPlatform;
  }
}
