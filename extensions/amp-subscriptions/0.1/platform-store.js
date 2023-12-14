import {Observable} from '#core/data-structures/observable';
import {Deferred} from '#core/data-structures/promise';
import {hasOwn} from '#core/types/object';

import {devAssert, user} from '#utils/log';

import {DEFAULT_SCORE_CONFIG, SubscriptionsScoreFactor} from './constants';
import {Entitlement} from './entitlement';

/** @typedef {{platformKey: string, entitlement: (!./entitlement.Entitlement|undefined)}} */
export let EntitlementChangeEventDef;

/** @const */
const TAG = 'amp-subscriptions';

/**
 * @typedef {{
 *   platform: !./subscription-platform.SubscriptionPlatform,
 *   weight: number,
 * }}
 */
let PlatformWeightDef;

/**
 * Manages subscription platforms.
 */
export class PlatformStore {
  /**
   * @param {!Array<string>} platformKeys
   * @param {!JsonObject|{[key: string]: number}} scoreConfig
   * @param {!./entitlement.Entitlement} fallbackEntitlement
   * @param {{[key: string]: !./subscription-platform.SubscriptionPlatform}=} opt_Platforms
   * @param {!Observable<!EntitlementChangeEventDef>} opt_externalOnEntitlementResolvedCallbacks
   */
  constructor(
    platformKeys,
    scoreConfig,
    fallbackEntitlement,
    opt_Platforms,
    opt_externalOnEntitlementResolvedCallbacks
  ) {
    /** @private @const {!{[key: string]: !./subscription-platform.SubscriptionPlatform}} */
    this.subscriptionPlatforms_ = opt_Platforms || {};

    /** @private @const {!Array<string>} */
    this.platformKeys_ = platformKeys;

    /** @private @const {!{[key: string]: !./entitlement.Entitlement}} */
    this.entitlements_ = {};

    /**
     * @private @const
     * {!{[key: string]: !Deferred<!./entitlement.Entitlement>}}
     */
    this.entitlementDeferredMap_ = {};
    platformKeys.forEach((platformKey) => {
      this.entitlementDeferredMap_[platformKey] = new Deferred();
    });

    /** @private @const {!Observable<!EntitlementChangeEventDef>} */
    this.onEntitlementResolvedCallbacks_ = new Observable();

    /** @private @const {!Observable<{platformKey: string}>} */
    this.onPlatformResolvedCallbacks_ = new Observable();

    /** @private {?Deferred} */
    this.grantStatusPromise_ = null;

    /** @private {?Entitlement} */
    this.grantStatusEntitlement_ = null;

    /** @private {?Deferred<?Entitlement>} */
    this.grantStatusEntitlementDeferred_ = null;

    /** @private {?Deferred<!Array<!./entitlement.Entitlement>>} */
    this.allResolvedDeferred_ = null;

    /** @private {!Array<string>} */
    this.failedPlatforms_ = [];

    /** @private @const {!./entitlement.Entitlement} */
    this.fallbackEntitlement_ = fallbackEntitlement;

    /** @private @const {!{[key: string]: number}} */
    this.scoreConfig_ = Object.assign(DEFAULT_SCORE_CONFIG, scoreConfig);

    /** @private @const {!Observable<!EntitlementChangeEventDef>} */
    this.externalOnEntitlementResolvedCallbacks_ =
      opt_externalOnEntitlementResolvedCallbacks
        ? opt_externalOnEntitlementResolvedCallbacks
        : new Observable();
  }

  /**
   * Resolves a platform in the store
   * @param {string} platformKey
   * @param {!./subscription-platform.SubscriptionPlatform} platform
   */
  resolvePlatform(platformKey, platform) {
    this.subscriptionPlatforms_[platformKey] = platform;
    this.onPlatformResolvedCallbacks_.fire({
      platformKey,
    });
  }

  /**
   * Reset the platformStore via a factory that returns a
   * new PlatformStore with the same platforms as this one.
   * @return {PlatformStore}
   */
  resetPlatformStore() {
    // Reset individual platforms to ensure their UX clears.
    for (const platformKey in this.subscriptionPlatforms_) {
      this.subscriptionPlatforms_[platformKey].reset();
    }

    // Then create new platform store with the newly reset platforms in it.
    return new PlatformStore(
      this.platformKeys_,
      this.scoreConfig_,
      this.fallbackEntitlement_,
      this.subscriptionPlatforms_,
      this.externalOnEntitlementResolvedCallbacks_
    );
  }

  /**
   * Resets a given platform.
   * @param {string} platformKey
   */
  resetPlatform(platformKey) {
    // Remove platform's entitlement.
    delete this.entitlements_[platformKey];

    // Reset platform's deferred entitlement map entry.
    this.entitlementDeferredMap_[platformKey] = new Deferred();

    // Reset platform's UX.
    this.subscriptionPlatforms_[platformKey].reset();

    // Reset summary promises.
    this.grantStatusPromise_ = null;
    this.grantStatusEntitlement_ = null;
    this.grantStatusEntitlementDeferred_ = null;
    this.allResolvedDeferred_ = null;
  }

  /**
   * Calls a callback for when a platform is resolved.
   * @param {string} platformKey
   * @param {!Function} callback
   */
  onPlatformResolves(platformKey, callback) {
    const platform = this.subscriptionPlatforms_[platformKey];
    if (platform) {
      callback(platform);
    } else {
      this.onPlatformResolvedCallbacks_.add((e) => {
        if (e.platformKey === platformKey) {
          callback(this.getPlatform(platformKey));
        }
      });
    }
  }

  /**
   * Returns the platform for the given id
   * @param {string} platformKey
   * @return {!./subscription-platform.SubscriptionPlatform}
   */
  getPlatform(platformKey) {
    const platform = this.subscriptionPlatforms_[platformKey];
    devAssert(platform, `Platform for id ${platformKey} is not resolved`);
    return platform;
  }

  /**
   * Returns the local platform
   * @private
   * @return {!./subscription-platform.SubscriptionPlatform}
   */
  getLocalPlatform_() {
    const localPlatform =
      /** @type {!./subscription-platform.SubscriptionPlatform} */
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
      const subscriptionPlatform = this.subscriptionPlatforms_[platformKey];
      platforms.push(subscriptionPlatform);
    }
    return platforms;
  }

  /**
   * This registers a callback which is called whenever a platform key is resolved
   * with an entitlement.
   * @param {function(!EntitlementChangeEventDef):void} callback
   */
  onChange(callback) {
    this.onEntitlementResolvedCallbacks_.add(callback);
  }

  /**
   * This registers a callback which is called whenever a platform key is resolved
   * with an entitlement.
   * @param {function(!EntitlementChangeEventDef):void} callback
   */
  addOnEntitlementResolvedCallback(callback) {
    this.externalOnEntitlementResolvedCallbacks_.add(callback);
  }

  /**
   * This resolves the entitlement to a platformKey
   * @param {string} platformKey
   * @param {!./entitlement.Entitlement} entitlement
   */
  resolveEntitlement(platformKey, entitlement) {
    if (entitlement) {
      entitlement.service = platformKey;
    }
    this.entitlements_[platformKey] = entitlement;
    const deferred = this.entitlementDeferredMap_[platformKey];
    if (deferred) {
      deferred.resolve(entitlement);
    }
    // Remove this platformKey from the failed platforms list
    if (this.failedPlatforms_.indexOf(platformKey) !== -1) {
      this.failedPlatforms_.splice(
        this.failedPlatforms_.indexOf(platformKey),
        1
      );
    }
    // Call all onChange callbacks.
    if (entitlement.granted) {
      this.saveGrantEntitlement_(entitlement);
    }
    this.onEntitlementResolvedCallbacks_.fire({
      platformKey,
      entitlement,
    });
    this.externalOnEntitlementResolvedCallbacks_.fire({
      platformKey,
      entitlement,
    });
  }

  /**
   * Returns entitlement for a platform.
   * @param {string} platformKey
   * @return {!./entitlement.Entitlement} entitlement
   */
  getResolvedEntitlementFor(platformKey) {
    devAssert(
      this.entitlements_[platformKey],
      `Platform ${platformKey} has not yet resolved with entitlements`
    );
    return this.entitlements_[platformKey];
  }

  /**
   * Returns entitlement for a platform once it's resolved.
   * @param {string} platformKey
   * @return {!Promise<!./entitlement.Entitlement>} entitlement
   */
  getEntitlementPromiseFor(platformKey) {
    devAssert(
      this.entitlementDeferredMap_[platformKey],
      `Platform ${platformKey} is not declared`
    );
    return this.entitlementDeferredMap_[platformKey].promise;
  }

  /**
   * Get scoreFactor states for each platform
   * @return {!Promise<!JsonObject>}
   *
   * return value looks somethinglike this
   * {
   *   'subscribe.google.com': {
   *     isReadyToPay: 1,
   *     supportsViewer: 1,
   *   },
   *   local: {
   *     isReadyToPay: 0,
   *     supportsViewer: 0,
   *   },
   * }
   */
  getScoreFactorStates() {
    const states = {};
    return Promise.all(
      this.platformKeys_.map((platformId) => {
        states[platformId] = {};
        return Promise.all(
          Object.values(SubscriptionsScoreFactor).map((scoreFactor) =>
            this.getScoreFactorPromiseFor_(platformId, scoreFactor).then(
              (factorValue) => {
                states[platformId][scoreFactor] = factorValue;
              }
            )
          )
        );
      })
    ).then(() => states);
  }

  /**
   * Return a score factor for a platform once it's resolved
   * @param {string} platformKey
   * @param {string} scoreFactor
   * @return {!Promise<number>}
   * @private
   */
  getScoreFactorPromiseFor_(platformKey, scoreFactor) {
    // Make sure the platform is ready
    return this.getEntitlementPromiseFor(platformKey).then(() => {
      return this.subscriptionPlatforms_[platformKey].getSupportedScoreFactor(
        scoreFactor
      );
    });
  }

  /**
   * @return {!Promise<boolean>}
   */
  getGrantStatus() {
    if (this.grantStatusPromise_ !== null) {
      return this.grantStatusPromise_.promise;
    }

    this.grantStatusPromise_ = new Deferred();

    // Check if current entitlements unblock the reader
    for (const key in this.entitlements_) {
      const entitlement = this.entitlements_[key];
      if (entitlement.granted) {
        this.saveGrantEntitlement_(entitlement);
        this.grantStatusPromise_.resolve(true);
      }
    }

    if (this.areAllPlatformsResolved_()) {
      // Resolve with null if none of the entitlements unblock the reader
      this.grantStatusPromise_.resolve(false);
    } else {
      // Listen if any upcoming entitlements unblock the reader
      this.onChange((e) => {
        const {entitlement} = e;
        if (entitlement.granted) {
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
    // The entitlement will be stored if either it is the first one to grant
    // or the new one has full subscription but the last one didn't.
    if (
      (!this.grantStatusEntitlement_ && entitlement.granted) ||
      (this.grantStatusEntitlement_ &&
        !this.grantStatusEntitlement_.isSubscriber() &&
        entitlement.isSubscriber())
    ) {
      this.grantStatusEntitlement_ = entitlement;
    }
  }

  /**
   * Returns the entitlement which unlocked the document
   * @return {!Promise<?Entitlement>}
   */
  getGrantEntitlement() {
    // Define when grant entitlement promise can resolve.
    const canResolveImmediately = () =>
      this.grantStatusEntitlement_ &&
      (this.grantStatusEntitlement_.isSubscriber() ||
        this.grantStatusEntitlement_.isFree());
    const canResolve = () =>
      canResolveImmediately() || this.areAllPlatformsResolved_();

    // Cache deferred.
    if (this.grantStatusEntitlementDeferred_) {
      return this.grantStatusEntitlementDeferred_.promise;
    }
    this.grantStatusEntitlementDeferred_ = new Deferred();

    // Resolve when possible.
    if (canResolve()) {
      this.grantStatusEntitlementDeferred_.resolve(
        this.grantStatusEntitlement_
      );
    } else {
      this.onEntitlementResolvedCallbacks_.add(() => {
        // Grant entitlement only if subscriber
        if (canResolve()) {
          this.grantStatusEntitlementDeferred_.resolve(
            this.grantStatusEntitlement_
          );
        }
      });
    }

    return this.grantStatusEntitlementDeferred_.promise;
  }

  /**
   * Clears the grant status
   */
  reset() {
    this.grantStatusPromise_ = null;
  }

  /**
   * Returns entitlements when all platforms are done fetching them.
   * @return {!Promise<!Array<!./entitlement.Entitlement>>}
   */
  getAllPlatformsEntitlements() {
    // Cache deferred.
    if (this.allResolvedDeferred_) {
      return this.allResolvedDeferred_.promise;
    }
    this.allResolvedDeferred_ = new Deferred();

    // Resolve when possible.
    if (this.areAllPlatformsResolved_()) {
      // Resolve with null if none of the entitlements unblock the reader
      this.allResolvedDeferred_.resolve(
        this.getAvailablePlatformsEntitlements_()
      );
    } else {
      // Listen if any upcoming entitlements unblock the reader
      this.onChange(() => {
        if (this.areAllPlatformsResolved_()) {
          this.allResolvedDeferred_.resolve(
            this.getAvailablePlatformsEntitlements_()
          );
        }
      });
    }

    return this.allResolvedDeferred_.promise;
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
   * Returns platform after all platforms fetch entitlements.
   * @return {!Promise<!./subscription-platform.SubscriptionPlatform>}
   */
  selectPlatform() {
    return this.getAllPlatformsEntitlements().then(() => {
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
    return entitlementsResolved === this.platformKeys_.length;
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
    return (
      this.scoreConfig_[factorName] * Math.min(1, Math.max(-1, factorValue))
    );
  }

  /**
   * Returns most qualified platform. Qualification of a platform is based on
   * weight. Every platform starts with weight 0 and evaluated against
   * the following parameters,
   * - base weight
   * - weight factors the platform supports multiplied by score in the config
   *
   * In the end candidate with max weight is selected. However if candidate's
   * weight is equal to local platform, then local platform is selected.
   * @return {!./subscription-platform.SubscriptionPlatform}
   * @private
   */
  selectApplicablePlatform_() {
    devAssert(
      this.areAllPlatformsResolved_(),
      'All platforms are not resolved yet'
    );

    // Prefer platforms that granted with subscriptions or free articles.
    const availablePlatforms = this.getAvailablePlatforms();
    while (availablePlatforms.length) {
      const platform = availablePlatforms.pop();
      const entitlement = this.getResolvedEntitlementFor(
        platform.getPlatformKey()
      );
      if (entitlement.isSubscriber() || entitlement.isFree()) {
        return platform;
      }
    }

    return this.rankPlatformsByWeight_(this.getAllPlatformWeights_());
  }

  /**
   * Calculate and return weights for all platforms
   * @return {!Array<!PlatformWeightDef>}
   * @private
   */
  getAllPlatformWeights_() {
    // Get weights for all of the platforms.
    return this.getAvailablePlatforms().map((platform) => {
      return {
        platform,
        weight: this.calculatePlatformWeight_(platform),
      };
    });
  }

  /**
   * Calculate platform weight
   * @param {!./subscription-platform.SubscriptionPlatform} platform
   * @return {number}
   * @private
   */
  calculatePlatformWeight_(platform) {
    const factorWeights = [0]; // reduce always needs something to work with

    // Start with base score
    const weight = platform.getBaseScore();

    // Iterate score factors checking platform support
    for (const factor in this.scoreConfig_) {
      if (hasOwn(this.scoreConfig_, factor)) {
        factorWeights.push(this.getSupportedFactorWeight_(factor, platform));
      }
    }

    return (
      weight +
      factorWeights.reduce((a, b) => {
        return a + b;
      })
    );
  }

  /**
   * @param {!Array<!PlatformWeightDef>} platformWeights
   * @return {!./subscription-platform.SubscriptionPlatform}
   * @private
   */
  rankPlatformsByWeight_(platformWeights) {
    const localPlatform = this.getLocalPlatform_();
    platformWeights.sort((platform1, platform2) => {
      // Force local platform to win ties
      if (
        platform2.weight === platform1.weight &&
        platform1.platform === localPlatform
      ) {
        return -1;
      }
      return platform2.weight - platform1.weight;
    });
    return platformWeights[0].platform;
  }

  /**
   * Returns most qualified platform for the specified factor.
   *
   * In the end candidate with max weight is selected. However if candidate's
   * weight is equal to local platform, then local platform is selected.
   *
   * @param {string} factor
   * @return {!./subscription-platform.SubscriptionPlatform}
   * @private
   */
  selectApplicablePlatformForFactor_(factor) {
    const platformWeights = this.getAvailablePlatforms().map((platform) => {
      const factorValue = platform.getSupportedScoreFactor(factor);
      const weight = typeof factorValue === 'number' ? factorValue : 0;
      return {platform, weight};
    });
    return this.rankPlatformsByWeight_(platformWeights);
  }

  /**
   * Records a platform failure
   * logs error if all platforms have failed
   * uses fallback if there is one.
   * @param {string} platformKey
   */
  reportPlatformFailureAndFallback(platformKey) {
    if (
      platformKey === this.getLocalPlatform_().getPlatformKey() &&
      this.fallbackEntitlement_
    ) {
      this.resolveEntitlement(
        this.getLocalPlatform_().getPlatformKey(),
        this.fallbackEntitlement_
      );
      user().warn(
        TAG,
        'Local platform has failed to resolve,  ' +
          'using fallback entitlement.'
      );
    } else if (this.failedPlatforms_.indexOf(platformKey) === -1) {
      const entitlement = Entitlement.empty(platformKey);
      this.resolveEntitlement(platformKey, entitlement);
      this.failedPlatforms_.push(platformKey);
    }
  }

  /**
   * Evaluates platforms and select the one to be selected for login.
   * @return {!./subscription-platform.SubscriptionPlatform}
   */
  selectPlatformForLogin() {
    return this.selectApplicablePlatformForFactor_(
      SubscriptionsScoreFactor.SUPPORTS_VIEWER
    );
  }
}
