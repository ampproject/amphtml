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

import {resourcesForDoc} from '../../../src/resources';

export class AdTracker {

  /**
   * @param {!Array<!Element>} ads
   * @param {number} minAdSpacing
   */
  constructor(ads, minAdSpacing) {
    /** @type {!Array<!Element>} */
    this.ads_ = ads;

    /** @type {number} */
    this.minAdSpacing_ = minAdSpacing;
  }

  /**
   * @param {!Element} ad
   */
  addAd(ad) {
    this.ads_.push(ad);
  }

  /**
   * @return {number}
   */
  getAdCount() {
    return this.ads_.length;
  }

  /**
   * Indicates if the given yPosition would be within the specifiec minDistance,
   * vertically, of an ad that the AdTracker is aware of.
   * @param {number} yPosition
   * @return {!Promise<boolean>}
   */
  isTooNearAnAd(yPosition) {
    return this.isWithinMinDistanceOfAd_(yPosition, 0);
  }

  /**
   * @param {number} yPosition
   * @param {number} adIndex
   * @return {!Promise<boolean>}
   * @private
   */
  isWithinMinDistanceOfAd_(yPosition, adIndex) {
    if (adIndex >= this.ads_.length) {
      return Promise.resolve(false);
    }
    return this.getDistanceFromAd_(yPosition, this.ads_[adIndex])
        .then(distance => {
          if (distance < this.minAdSpacing_) {
            return true;
          }
          return this.isWithinMinDistanceOfAd_(yPosition, adIndex + 1);
        });
  }

  /**
   * @param {number} yPosition
   * @param {!Element} ad
   * @return {!Promise<number>} The absolute value of the minimum vertical
   *     distance from the yPosition to the ad.
   * @private
   */
  getDistanceFromAd_(yPosition, ad) {
    return resourcesForDoc(ad).getElementLayoutBox(ad).then(box => {
      if (yPosition >= box.top && yPosition <= box.bottom) {
        return 0;
      } else {
        return Math.min(Math.abs(yPosition - box.top),
            Math.abs(yPosition - box.bottom));
      }
    });
  }
}

/**
 * @param {!Window} win
 * @return {!Array<!Element>}
 */
export function getExistingAds(win) {
  return [].slice.call(win.document.getElementsByTagName('AMP-AD')).concat(
      [].slice.call(win.document.getElementsByTagName('AMP-A4A')));
}
