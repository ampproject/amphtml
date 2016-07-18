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

// Because AdSense and DoubleClick are both operated by Google and their A4A
// implementations share some behavior in common, part of the logic for this
// implementation is located in the ads/google/a4a directory rather than here.
// Most other ad networks will want to put their A4A code entirely in the
// extensions/amp-ad-network-${NETWORK_NAME}-impl directory.

import {
  googleAdsIsA4AEnabled,
} from '../../../ads/google/a4a/traffic-experiments';

/** @const {string} */
const DOUBLECLICK_A4A_EXPERIMENT_ID = 'expDoubleclickA4A';

/** @const {!Branches} */
const DOUBLECLICK_A4A_EXPERIMENT_BRANCHES = {
  control: '117152640',
  experiment: '117152641',
};

/**
 * @param {!Window} win
 * @param {!Element} element
 * @returns {boolean}
 */
export function doubleclickIsA4AEnabled(win, element) {
  return googleAdsIsA4AEnabled(
      win, element, DOUBLECLICK_A4A_EXPERIMENT_ID,
      DOUBLECLICK_A4A_EXPERIMENT_BRANCHES);
}
