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
import {dev} from '../../../src/log';

/** @const */
const TAG = 'amp-auto-ads';

export class AdStrategy {

  /**
   * @param {string} type
   * @param {!Array<!./placement.Placement>} placements
   * @param {!Array<!DataAttributeDef>} baseDataAttributes Any data attributes
   *     that should be added to any inserted ads. These will be combined with
   *     any additional data atrributes specified by the configuration.
   */
  constructor(type, placements, baseDataAttributes) {
    this.type_ = type;

    this.availablePlacements_ = placements.slice(0);

    this.baseDataAttributes_ = baseDataAttributes;

    /** @type {!Array<!./placement.Placement>} */
    this.placedAds_ = [];
  }

  /**
   * @return {!Promise<boolean>} True if strategy succeeds false otherwise.
   */
  run() {
    // TODO: Implement a more extensive strategy based on parameters set in the
    // configuration.
    return this.placeNextAd_();
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
      dev().warn(TAG, 'unable to fulfill ad strategy');
      return Promise.resolve(false);
    }
    return nextPlacement.placeAd(this.type_, this.baseDataAttributes_)
        .then(state => {
          if (state == PlacementState.PLACED) {
            this.placedAds_.push(nextPlacement);
            return true;
          } else {
            return this.placeNextAd_();
          }
        });
  }
}
