import {tryResolve} from '#core/data-structures/promise';

import {user} from '#utils/log';

import {SizeInfoDef} from './ad-network-config';
import {PlacementState} from './placement';

/** @const */
const TAG = 'amp-auto-ads';

/**
 * @typedef {{
 *   adsPlaced: number,
 *   totalAdsOnPage: number
 * }}
 */
export let StrategyResult;

export class AdStrategy {
  /**
   * @param {!Array<!./placement.Placement>} placements
   * @param {!JsonObject<string, string>} baseAttributes Any attributes that
   *     should be added to any inserted ads. These will be combined with any
   *     additional data atrributes specified by the placement.
   * @param {!SizeInfoDef} sizing
   * @param {!./ad-tracker.AdTracker} adTracker
   * @param {boolean} isResponsiveEnabled
   */
  constructor(
    placements,
    baseAttributes,
    sizing,
    adTracker,
    isResponsiveEnabled = false
  ) {
    this.availablePlacements_ = placements.slice(0);

    /** @private {!JsonObject<string, string>} */
    this.baseAttributes_ = baseAttributes;

    /** @private {!SizeInfoDef} sizing */
    this.sizing_ = sizing;

    /** @type {!./ad-tracker.AdTracker} */
    this.adTracker_ = adTracker;

    /** @type {number} */
    this.adsPlaced_ = 0;

    /** @private {boolean} */
    this.isResponsiveEnabled_ = isResponsiveEnabled;
  }

  /**
   * @return {!Promise<StrategyResult>} Resolves when the strategy is complete.
   */
  run() {
    if (this.adTracker_.isMaxAdCountReached()) {
      return tryResolve(() => this.getStrategyResult_());
    }
    return this.placeNextAd_().then((success) => {
      if (success) {
        return this.run();
      }
      return this.getStrategyResult_();
    });
  }

  /**
   * @return {!StrategyResult}
   * @private
   */
  getStrategyResult_() {
    return {
      adsPlaced: this.adsPlaced_,
      totalAdsOnPage: this.adTracker_.getAdCount(),
    };
  }

  /**
   * Tries to place an ad using the next placement (if one is available). If
   * placing the ad fails then calls itself recursively until either an ad is
   * placed or no more placements are available.
   * @return {!Promise<boolean>}
   * @private
   */
  placeNextAd_() {
    const nextPlacement = this.availablePlacements_.shift();
    if (!nextPlacement) {
      user().info(TAG, 'unable to fulfill ad strategy');
      return Promise.resolve(false);
    }
    return nextPlacement
      .placeAd(
        this.baseAttributes_,
        this.sizing_,
        this.adTracker_,
        this.isResponsiveEnabled_
      )
      .then((state) => {
        if (state == PlacementState.PLACED) {
          this.adTracker_.addAd(nextPlacement.getAdElement());
          this.adsPlaced_++;
          return true;
        } else {
          return this.placeNextAd_();
        }
      });
  }
}
