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
  isInManualExperiment,
} from '../../../ads/google/a4a/traffic-experiments';
import {EXPERIMENT_ATTRIBUTE} from '../../../ads/google/a4a/utils';
import {getMode} from '../../../src/mode';
import {isProxyOrigin} from '../../../src/url';

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

// We would prefer the following constants to remain private, but we need to
// refer to them directly in amp-ad-3p-impl.js and amp-a4a.js in order to check
// whether we're in the experiment or not, for the purposes of enabling
// debug traffic profiling.  Once we have debugged the a4a implementation and
// can disable profiling again, we can return these constants to being
// private to this file.
/** @const {!../../../ads/google/a4a/traffic-experiments.ExperimentInfo} */
export const DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES = {
  control: '117152660',
  experiment: '117152661',
};

/** @const {!../../../ads/google/a4a/traffic-experiments.ExperimentInfo} */
export const DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES = {
  control: '117152680',
  experiment: '117152681',
};

/** @const {!../../../ads/google/a4a/traffic-experiments.ExperimentInfo} */
export const DOUBLECLICK_A4A_BETA_BRANCHES = {
  control: '2077830',
  experiment: '2077831',
};

export const BETA_ATTRIBUTE = 'data-use-beta-a4a-implementation';

/**
 * @param {!Window} win
 * @param {!Element} element
 * @returns {boolean}
 */
export function doubleclickIsA4AEnabled(win, element) {
  if (!!win.document.querySelector('meta[name=amp-3p-iframe-src]')) {
    return false;
  }
  const a4aRequested = element.hasAttribute(BETA_ATTRIBUTE);
  // Note: Under this logic, a4aRequested shortcuts googleAdsIsA4AEnabled and,
  // therefore, carves out of the experiment branches.  Any publisher using this
  // attribute will be excluded from the experiment altogether.
  // TODO(tdrl): The "is this site eligible" logic has gotten scattered around
  // and is now duplicated.  It should be cleaned up and factored into a single,
  // shared location.
  const enableA4A = googleAdsIsA4AEnabled(
          win, element, DOUBLECLICK_A4A_EXPERIMENT_NAME,
          DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES,
          DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES) ||
      (a4aRequested && (isProxyOrigin(win.location) ||
       getMode(win).localDev || getMode(win).test));
  if (enableA4A && a4aRequested && !isInManualExperiment(element)) {
    element.setAttribute(EXPERIMENT_ATTRIBUTE,
        DOUBLECLICK_A4A_BETA_BRANCHES.experiment);
  }
  return enableA4A;
}
