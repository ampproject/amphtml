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
import {isExperimentOn} from '../../../src/experiments';

/** @const {!string}  @private */
export const ADSENSE_A4A_EXPERIMENT_NAME = 'expAdsenseA4A';

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
// categories for Adsense ads.  They are attached to the ad request by
// ads/google/a4a/traffic-experiments.js#googleAdsIsA4AEnabled when it works
// out whether a given ad request is in the overall experiment and, if so,
// which branch it's on.

// We would prefer the following constants to remain private, but we need to
// refer to them directly in amp-ad-3p-impl.js and amp-a4a.js in order to check
// whether we're in the experiment or not, for the purposes of enabling
// debug traffic profiling.  Once we have debugged the a4a implementation and
// can disable profiling again, we can return these constants to being
// private to this file.
/**
 * const {!../../../ads/google/a4a/traffic-experiments.A4aExperimentBranches}
 */
export const ADSENSE_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH = {
  control: '117152652',
  experiment: '117152653',
};

export const ADSENSE_A4A_EXTERNAL_DELAYED_EXPERIMENT_BRANCHES_PRE_LAUNCH = {
  control: '117152654',
  experiment: '117152655',
};

/**
 * const {!../../../ads/google/a4a/traffic-experiments.A4aExperimentBranches}
 */
export const ADSENSE_A4A_EXTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH = {
  control: '2092617',
  experiment: '2092618',
};

/**
 * @const {!../../../ads/google/a4a/traffic-experiments.A4aExperimentBranches}
 */
export const ADSENSE_A4A_INTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH = {
  control: '117152670',
  experiment: '117152671',
};

/**
 * @const {!../../../ads/google/a4a/traffic-experiments.A4aExperimentBranches}
 */
export const ADSENSE_A4A_INTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH = {
  control: '2092615',
  experiment: '2092616',
};

/**
 * @param {!Window} win
 * @param {!Element} element
 * @returns {boolean}
 */
export function adsenseIsA4AEnabled(win, element) {
  let externalBranches, internalBranches;
  if (isExperimentOn(win, 'a4aFastFetchAdSenseLaunched')) {
    externalBranches = ADSENSE_A4A_EXTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH;
    internalBranches = ADSENSE_A4A_INTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH;
  } else {
    externalBranches = ADSENSE_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH;
    internalBranches = ADSENSE_A4A_INTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH;
  }

  return !!element.getAttribute('data-ad-client') &&
      googleAdsIsA4AEnabled(
          win, element, ADSENSE_A4A_EXPERIMENT_NAME,
          externalBranches, internalBranches,
          ADSENSE_A4A_EXTERNAL_DELAYED_EXPERIMENT_BRANCHES_PRE_LAUNCH);
}
