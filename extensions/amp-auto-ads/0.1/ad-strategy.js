/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {DataAttributeDef, PlacementState} from './placement';
import {user} from '../../../src/log';

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
   * @param {!Object<string, string>} baseAttributes Any attributes that should
   *     be added to any inserted ads. These will be combined with any
   *     additional data atrributes specified by the placement.
   * @param {!./ad-tracker.AdTracker} adTracker
   */
  constructor(placements, baseAttributes, adTracker) {
    this.availablePlacements_ = placements.slice(0);

    this.baseAttributes_ = baseAttributes;

    /** @type {!./ad-tracker.AdTracker} */
    this.adTracker_ = adTracker;

    /** @type {number} */
    this.adsPlaced_ = 0;
  }

  /**
   * @return {!Promise<StrategyResult>} Resolves when the strategy is complete.
   */
  run() {
    if (this.adTracker_.isMaxAdCountReached()) {
      return Promise.resolve(this.getStrategyResult_());
    }
    return this.placeNextAd_().then(success => {
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
      user().warn(TAG, 'unable to fulfill ad strategy');
      return Promise.resolve(false);
    }
    return nextPlacement.placeAd(this.baseAttributes_, this.adTracker_)
        .then(state => {
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
