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

import {DEFAULT_SCORE_CONFIG, SubscriptionsScoreFactor}
  from './score-factors.js';
import {Deferred} from '../../../src/utils/promise';
import {Entitlement} from './entitlement';
import {Observable} from '../../../src/observable';
import {dev, user} from '../../../src/log';
import {dict, hasOwn} from '../../../src/utils/object';


/** @typedef {{serviceId: string, entitlement: (!./entitlement.Entitlement|undefined)}} */
export let EntitlementChangeEventDef;

/** @const */
const TAG = 'amp-subscriptions';

export class PlatformStore {
  /**
   * @param {!Array<string>} expectedServiceIds
   * @param {!JsonObject} scoreConfig
   * @param {!./entitlement.Entitlement} fallbackEntitlement
   */
  constructor(expectedServiceIds, scoreConfig, fallbackEntitlement) {

    /** @private @const {!Object<string, !./subscription-platform.SubscriptionPlatform>} */
    this.subscriptionPlatforms_ = dict();

    /** @private @const {!Array<string>} */
    this.serviceIds_ = expectedServiceIds;

    /** @private @const {!Object<string, !./entitlement.Entitlement>} */
    this.entitlements_ = {};

    /**
     * @private @const
     * {!Object<string, !Deferred<!./entitlement.Entitlement>>}
     */
    this.entitlementDeferredMap_ = {};
    expectedServiceIds.forEach(serviceId => {
      this.entitlementDeferredMap_[serviceId] = new Deferred();
    });

    /** @private @const {!Observable<!EntitlementChangeEventDef>} */
    this.onEntitlementResolvedCallbacks_ = new Observable();

    /** @private @const {!Observable<{serviceId: string}>} */
    this.onPlatformResolvedCallbacks_ = new Observable();

    /** @private {?Deferred} */
    this.grantStatusPromise_ = null;

    /** @private @const {!Observable} */
    this.onGrantStateResolvedCallbacks_ = new Observable();

    /** @private {?Entitlement} */
    this.grantStatusEntitlement_ = null;

    /** @private {?Deferred<?Entitlement>} */
    this.grantStatusEntitlementPromise_ = null;

    /** @private {?Deferred<!Array<!./entitlement.Entitlement>>} */
    this.allResolvedPromise_ = null;

    /** @private {!Array<string>} */
    this.failedPlatforms_ = [];

    /** @private @canst {!./entitlement.Entitlement} */
    this.fallbackEntitlement_ = fallbackEntitlement;

    /** @private @const {!Object<string, number>} */
    this.scoreConfig_ = Object.assign(DEFAULT_SCORE_CONFIG, scoreConfig);
  }

  /**
   * Resolves a platform in the store
   * @param {string} serviceId
   * @param {!./subscription-platform.SubscriptionPlatform} platform
   */
  resolvePlatform(serviceId, platform) {
    this.subscriptionPlatforms_[serviceId] = platform;
    this.onPlatformResolvedCallbacks_.fire({
      serviceId,
    });
  }

  /**
   *Calls a callback for when a platform is resolved.
   * @param {string} serviceId
   * @param {!Function} callback
   */
  onPlatformResolves(serviceId, callback) {
    const platform = this.subscriptionPlatforms_[serviceId];
    if (platform) {
      callback(platform);
    } else {
      this.onPlatformResolvedCallbacks_.add(e => {
        if (e.serviceId === serviceId) {
          callback(this.getPlatform(serviceId));
        }
      });
    }
  }

  /**
   * Returns the platform for the given id
   * @param {string} serviceId
   * @return {!./subscription-platform.SubscriptionPlatform}
   */
  getPlatform(serviceId) {
    const platform = this.subscriptionPlatforms_[serviceId];
    dev().assert(platform, `Platform for id ${serviceId} is not resolved`);
    return platform;
  }

  /**
   * Returns the local platform;
   * @return {!./local-subscription-platform.LocalSubscriptionPlatform}
   */
  getLocalPlatform() {
    const localPlatform =
        /** @type{!./local-subscription-platform.LocalSubscriptionPlatform} */
        (this.getPlatform('local'));
    return localPlatform;
  }

  /**
   * Returns all available platforms.
   *
   * @return {!Array<!./subscription-platform.SubscriptionPlatform>}
   */
  getAvailablePlatforms() {
    const platforms = [];
    for (const platformKey in this.subscriptionPlatforms_) {
      const subscriptionPlatform =
        this.subscriptionPlatforms_[platformKey];
      platforms.push(subscriptionPlatform);
    }
    return platforms;
  }

  /**
   * This registers a callback which is called whenever a service id is resolved
   * with an entitlement.
   * @param {function(!EntitlementChangeEventDef):void} callback
   */
  onChange(callback) {
    this.onEntitlementResolvedCallbacks_.add(callback);
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
    const deferred = this.entitlementDeferredMap_[serviceId];
    if (deferred) {
      deferred.resolve(entitlement);
    }
    // Remove this serviceId as a failed platform now
    if (this.failedPlatforms_.indexOf(serviceId) != -1) {
      this.failedPlatforms_.splice(this.failedPlatforms_.indexOf(serviceId));
    }
    // Call all onChange callbacks.
    this.onEntitlementResolvedCallbacks_.fire({serviceId, entitlement});
  }

  /**
   * Returns entitlement for a platform.
   * @param {string} serviceId
   * @return {!./entitlement.Entitlement} entitlement
   */
  getResolvedEntitlementFor(serviceId) {
    dev().assert(this.entitlements_[serviceId],
        `Platform ${serviceId} has not yet resolved with entitlements`);
    return this.entitlements_[serviceId];
  }

  /**
   * Returns entitlement for a platform once it's resolved.
   * @param {string} serviceId
   * @return {!Promise<!./entitlement.Entitlement>} entitlement
   */
  getEntitlementPromiseFor(serviceId) {
    dev().assert(this.entitlementDeferredMap_[serviceId],
        `Platform ${serviceId} is not declared`);
    return this.entitlementDeferredMap_[serviceId].promise;
  }

  /**
   * @param {string} serviceId
   */
  resetEntitlementFor(serviceId) {
    dev().assert(this.entitlementDeferredMap_[serviceId],
        `Platform ${serviceId} is not declared`);
    this.entitlementDeferredMap_[serviceId] = new Deferred();
  }

  /**
   * @return {!Promise<boolean>}
   */
  getGrantStatus() {
    if (this.grantStatusPromise_ !== null) {
      return this.grantStatusPromise_.promise;
    }

    this.grantStatusPromise_ = new Deferred();

    // Check if current entitlements unblocks the reader
    for (const key in this.entitlements_) {
      const entitlement = (this.entitlements_[key]);
      if (entitlement.granted) {
        this.saveGrantEntitlement_(entitlement);
        this.grantStatusPromise_.resolve(true);
      }
    }

    if (this.areAllPlatformsResolved_()) {
      // Resolve with null if non of the entitlements unblocks the reader
      this.grantStatusPromise_.resolve(false);
    } else {
      // Listen if any upcoming entitlements unblock the reader
      this.onChange(({entitlement}) => {
        if (entitlement.granted) {
          this.saveGrantEntitlement_(entitlement);
          this.grantStatusPromise_.resolve(true);
        } else if (this.areAllPlatformsResolved_()) {
          this.grantStatusPromise_.resolve(false);
        }
      });
    }

    return this.grantStatusPromise_.promise;
  }

  /**
   * Checks and saves the entitlement for grant status
   * @param {!Entitlement} entitlement
   * @private
   */
  saveGrantEntitlement_(entitlement) {
    // The entitlement will be stored either if its the first one to grant
    // or the new one has full subscription but the last one didn't.
    if ((!this.grantStatusEntitlement_ && entitlement.granted)
        || (this.grantStatusEntitlement_
          && !this.grantStatusEntitlement_.isSubscriber()
          && entitlement.isSubscriber())) {
      this.grantStatusEntitlement_ = entitlement;
      this.onGrantStateResolvedCallbacks_.fire();
    }
  }

  /**
   * Returns the entitlement which unlocked the document
   * @return {!Promise<?Entitlement>}
   */
  getGrantEntitlement() {
    if (this.grantStatusEntitlementPromise_) {
      return (this.grantStatusEntitlementPromise_.promise);
    }
    this.grantStatusEntitlementPromise_ = new Deferred();
    if ((this.grantStatusEntitlement_
        && this.grantStatusEntitlement_.isSubscriber())
          || this.areAllPlatformsResolved_()) {
      this.grantStatusEntitlementPromise_.resolve(this.grantStatusEntitlement_);
    } else {
      this.onGrantStateResolvedCallbacks_.add(() => {
        if (this.grantStatusEntitlement_.granted
            || this.areAllPlatformsResolved_()) {
          this.grantStatusEntitlementPromise_.resolve(
              this.grantStatusEntitlement_);
        }
      });
    }
    return this.grantStatusEntitlementPromise_.promise;
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
   * @return {!Promise<!Array<!./entitlement.Entitlement>>}
   */
  getAllPlatformsEntitlements_() {
    if (this.allResolvedPromise_) {
      return this.allResolvedPromise_.promise;
    }
    this.allResolvedPromise_ = new Deferred();
    if (this.areAllPlatformsResolved_()) {
      // Resolve with null if non of the entitlements unblocks the reader
      this.allResolvedPromise_.resolve(
          this.getAvailablePlatformsEntitlements_());
    } else {
      // Listen if any upcoming entitlements unblock the reader
      this.onChange(() => {
        if (this.areAllPlatformsResolved_()) {
          this.allResolvedPromise_.resolve(
              this.getAvailablePlatformsEntitlements_());
        }
      });
    }
    return this.allResolvedPromise_.promise;
  }

  /**
   * Returns entitlements for resolved platforms.
   * @private
   * @return {!Array<!./entitlement.Entitlement>}
   */
  getAvailablePlatformsEntitlements_() {
    const entitlements = [];
    for (const platform in this.entitlements_) {
      if (hasOwn(this.entitlements_, platform)) {
        entitlements.push(this.entitlements_[platform]);
      }
    }
    return entitlements;
  }

  /**
   * Returns entitlements when all services are done fetching them.
   * @return {!Promise<!./subscription-platform.SubscriptionPlatform>}
   */
  selectPlatform() {

    return this.getAllPlatformsEntitlements_().then(() => {
      // TODO(@prateekbh): explain why sometimes a quick resolve is possible vs
      // waiting for all entitlement.
      return this.selectApplicablePlatform_();
    });
  }

  /**
   * Returns the number of entitlements resolved
   * @return {boolean}
   * @private
   */
  areAllPlatformsResolved_() {
    const entitlementsResolved = Object.keys(this.entitlements_).length;
    return entitlementsResolved === this.serviceIds_.length;
  }

  /**
   * Calculates weight to add/remove based on getSupportedScoreFactor()
   * @param {string} factorName
   * @param {!./subscription-platform.SubscriptionPlatform} platform
   * @return {number}
   * @private
   */
  getSupportedFactorWeight_(factorName, platform) {
    const factorValue = platform.getSupportedScoreFactor(factorName);
    if (typeof factorValue !== 'number') {
      return 0;
    }
    return this.scoreConfig_[factorName] *
      Math.min(1, Math.max(-1, factorValue));
  }

  /**
   * Returns most qualified platform. Qualification of a platform is based on
   * weight. Every platform starts with weight 0 and evaluated against
   * the following parameters,
   * - base weight
   * - weight factors the platform supports multiploed by score in the config
   *
   * In the end candidate with max weight is selected. However if candidate's
   * weight is equal to local platform, then local platform is selected.
   * @return {!./subscription-platform.SubscriptionPlatform}
   * @param {string=} optionalFactor if present only use this factor for calculation
   * @private
   */
  selectApplicablePlatform_(optionalFactor) {
    const localPlatform = this.getLocalPlatform();

    dev().assert(this.areAllPlatformsResolved_(),
        'All platforms are not resolved yet');

    // Subscriber wins immediatly.
    const availablePlatforms = this.getAvailablePlatforms();
    while (availablePlatforms.length) {
      const platform = availablePlatforms.pop();
      const entitlement =
          this.getResolvedEntitlementFor(platform.getServiceId());
      if (entitlement.isSubscriber()) {
        return platform;
      }
    }

    const platformWeights = this.getAllPlatformWeights_(optionalFactor);
    platformWeights.sort((platform1, platform2) => {
      // Force local platform to win ties
      if (platform2.weight == platform1.weight &&
        platform2.platform == localPlatform) {
        return 1;
      }
      return platform2.weight - platform1.weight;
    });
    return platformWeights[0].platform;
  }

  /**
   * Calculate and return weights for all platforms
   * @return {!Array<{platform:!./subscription-platform.SubscriptionPlatform, weight: number}>}
   * @param {string=} optionalFactor if present only use this factor for calculation
   * @private
   */
  getAllPlatformWeights_(optionalFactor) {
    // Get weights for all of the platforms
    return this.getAvailablePlatforms().map(platform => {
      return {
        platform,
        weight: this.calculatePlatformWeight_(platform, optionalFactor),
      };
    });
  }

  /**
   * Calculate platform weight
   * @param {!./subscription-platform.SubscriptionPlatform} platform
   * @param {string=} optionalFactor if specified only calculate this factor
   * @return {number}
   * @private
   */
  calculatePlatformWeight_(platform, optionalFactor) {
    const factorWeights = [0]; // reduce always needs somthing to work with

    // Start with base score
    const weight = platform.getBaseScore();

    // Iterate score factors checking service support
    for (const factor in this.scoreConfig_) {
      if (hasOwn(this.scoreConfig_, factor) &&
        (!optionalFactor || optionalFactor === factor)) {
        factorWeights.push(this.getSupportedFactorWeight_(factor, platform));
      }
    }

    return weight + factorWeights.reduce((a, b) => { return a + b; });
  }

  /**
   * Records a platform failure and logs error if all platforms have failed.
   * @param {string} serviceId
   */
  reportPlatformFailure(serviceId) {
    if (this.failedPlatforms_.indexOf(serviceId) == -1) {
      const entitlement = Entitlement.empty(serviceId);
      this.resolveEntitlement(serviceId, entitlement);
      this.failedPlatforms_.push(serviceId);
    }

    if (this.failedPlatforms_.length == this.serviceIds_.length) {
      user().warn(TAG, 'All platforms have failed to resolve, '
          + 'using fallback entitlement for local platform');
      this.resolveEntitlement(this.getLocalPlatform().getServiceId(),
          this.fallbackEntitlement_);
    }
  }

  /**
   * Evaluates platforms and select the one to be selected for login.
   * @return {!./subscription-platform.SubscriptionPlatform}
   */
  selectPlatformForLogin() {
    return this.selectApplicablePlatform_(
        SubscriptionsScoreFactor.SUPPORTS_VIEWER);
  }
}
