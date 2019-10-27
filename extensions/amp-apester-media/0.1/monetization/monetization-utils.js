/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

export const MARGIN_AD_HEIGHT = 10;

/**
 * @param {Array} ads
 * @return {number}
 */
export function calculateAdsHeight(ads) {
  return ads
    .filter(ad => ad)
    .reduce((accumulator, ad) => {
      return MARGIN_AD_HEIGHT * 2 + accumulator + ad.height;
    }, 0);
}
