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

import {resourcesForDoc} from '../../../src/services';

/**
 * Structure for defining contraints about the placement of ads.
 *
 * initialMinSpacing - gives the minimum vertical spacing (in pixels) that
 *                     should be between any two ads on the page. This is used
 *                     up to the point where a rule in subsequentMinSpacing
 *                     matches the number of ads on the page.
 *
 * subsequentMinSpacing - an array of rules that change the minimum vertical
 *                        spacing required between ads as a function of how
 *                        many ads are on the page. adCount matches the number
 *                        of ads on the page (both hard-coded and those inserted
 *                        by amp-auto-ads), and spacing defines the vertical
 *                        spacing for the matching condition.
 *
 * maxAdCount - specifies the maximum number of ads that should be on the page.
 *              Both hard-coded ads and those inserted by amp-auto-ads count
 *              towards this. Once this limit is reached, amp-auto-ads will
 *              stop trying to insert additional ads.
 *
 * @typedef {{
 *   initialMinSpacing: number,
 *   subsequentMinSpacing: !Array<!{adCount: number, spacing: number}>,
 *   maxAdCount: number
 * }}
 */
export let AdConstraints;

export class AdTracker {

  /**
   * @param {!Array<!Element>} ads
   * @param {!AdConstraints} adConstraints
   */
  constructor(ads, adConstraints) {
    /** @type {!Array<!Element>} */
    this.ads_ = ads;

    /** @type {number} */
    this.initialMinSpacing_ = adConstraints.initialMinSpacing;

    /** @type {!Array<!{adCount: number, spacing: number}>} */
    this.subsequentMinSpacing_ = adConstraints.subsequentMinSpacing.slice(0)
        .sort((a, b) => {
          return a.adCount - b.adCount;
        });

    /** @type {number} */
    this.maxAdCount_ = adConstraints.maxAdCount;

    /** @type {number} */
    this.minAdSpacing_ = this.getMinAdSpacing_();
  }

  /**
   * @param {!Element} ad
   */
  addAd(ad) {
    this.ads_.push(ad);
    this.minAdSpacing_ = this.getMinAdSpacing_();
  }

  /**
   * @return {number}
   */
  getAdCount() {
    return this.ads_.length;
  }

  /**
   * @return {boolean}
   */
  isMaxAdCountReached() {
    return this.getAdCount() >= this.maxAdCount_;
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

  /**
   * @private
   * @return {number}
   */
  getMinAdSpacing_() {
    const adCount = this.getAdCount();
    let spacing = this.initialMinSpacing_;
    for (let i = 0; i < this.subsequentMinSpacing_.length; i++) {
      const item = this.subsequentMinSpacing_[i];
      if (item.adCount <= adCount) {
        spacing = item.spacing;
      }
    }
    return spacing;
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
