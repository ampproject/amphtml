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
const DOUBLECLICK_A4A_EXPERIMENT_NAME = 'expDoubleclickA4A';

// The following experiment IDs are used by Google-side servers to
// understand what experiment is running and what mode the A4A code is
// running in.  In this experiment phase, we're testing 8 different
// configurations, resulting from the Cartesian product of the following:
//   - Traditional 3p iframe ad rendering (control) vs A4A rendering
//     (experiment)
//   - Experiment triggered by an external page, such as the Google Search
//     page vs. triggered internally in the client code.
//   - Doubleclick vs Adsense
// The following two objects contain experiment IDs for the first two
// categories for Doubleclick ads.  They are attached to the ad request by
// ads/google/a4a/traffic-experiments.js#googleAdsIsA4AEnabled when it works
// out whether a given ad request is in the overall experiment and, if so,
// which branch it's on.

/** @const {!Branches} @private */
const DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES = {
  control: '117152660',
  experiment: '117152661',
};

/** @const {!Branches} @private */
const DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES = {
  control: '117152640',
  experiment: '117152641',
};

/**
 * @param {!Window} win
 * @param {!Element} element
 * @returns {boolean}
 */
export function doubleclickIsA4AEnabled(win, element) {
  // Ensure not within remote.html iframe.
  return !win.document.querySelector('meta[name=amp-3p-iframe-src]') &&
      googleAdsIsA4AEnabled(
        win, element, DOUBLECLICK_A4A_EXPERIMENT_NAME,
        DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES,
        DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES);
}
