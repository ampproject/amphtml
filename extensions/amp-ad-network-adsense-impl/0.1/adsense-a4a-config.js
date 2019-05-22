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
  MANUAL_EXPERIMENT_ID,
  addExperimentIdToElement,
  extractUrlExperimentId,
} from '../../../ads/google/a4a/traffic-experiments';
import {dev} from '../../../src/log';
import {
  forceExperimentBranch,
  getExperimentBranch,
} from '../../../src/experiments';
import {
  isCdnProxy,
  isGoogleAdsA4AValidEnvironment,
} from '../../../ads/google/a4a/utils';
import {selectAndSetExperiments} from '../../../ads/google/a4a/experiment-utils';

/** @const {string} @visibleForTesting */
export const ADSENSE_A4A_EXPERIMENT_NAME = 'expAdsenseA4A';

/** @type {string} */
const TAG = 'amp-ad-network-adsense-impl';

/** @const @type {!Object<string,?string>} */
export const URL_EXPERIMENT_MAPPING = {
  '-1': MANUAL_EXPERIMENT_ID,
  '0': null,
};

/** @const @type {!Object<string, string>} */
export const ADSENSE_EXPERIMENTS = {
  UNCONDITIONED_CANONICAL_EXP: '21062154',
  UNCONDITIONED_CANONICAL_CTL: '21062155',
  CANONICAL_EXP: '21062158',
  CANONICAL_CTL: '21062159',
};

/** @const @type {!Object<string, string>} */
export const ADSENSE_EXP_NAMES = {
  UNCONDITIONED_CANONICAL: 'expAdsenseUnconditionedCanonical',
  CANONICAL: 'expAdsenseCanonical',
};

/**
 * Attempts to select into Adsense experiments.
 * @param {!Window} win
 * @param {!Element} element
 */
function selectExperiments(win, element) {
  selectAndSetExperiments(
    win,
    element,
    [
      ADSENSE_EXPERIMENTS.UNCONDITIONED_CANONICAL_EXP,
      ADSENSE_EXPERIMENTS.UNCONDITIONED_CANONICAL_CTL,
    ],
    ADSENSE_EXP_NAMES.UNCONDITIONED_CANONICAL,
    true
  );

  // See if in holdback control/experiment.
  const urlExperimentId = extractUrlExperimentId(win, element);
  const experimentId = URL_EXPERIMENT_MAPPING[urlExperimentId || ''];
  if (experimentId) {
    addExperimentIdToElement(experimentId, element);
    forceExperimentBranch(win, ADSENSE_A4A_EXPERIMENT_NAME, experimentId);
    dev().info(
      TAG,
      `url experiment selection ${urlExperimentId}: ${experimentId}.`
    );
  }

  // If not in the unconditioned canonical experiment, attempt to
  // select into the undiluted canonical experiment.
  const inUnconditionedCanonicalExp = !!getExperimentBranch(
    win,
    ADSENSE_EXP_NAMES.UNCONDITIONED_CANONICAL
  );
  if (!inUnconditionedCanonicalExp && !isCdnProxy(win)) {
    selectAndSetExperiments(
      win,
      element,
      [ADSENSE_EXPERIMENTS.CANONICAL_EXP, ADSENSE_EXPERIMENTS.CANONICAL_CTL],
      ADSENSE_EXP_NAMES.CANONICAL,
      true
    );
  }
}

/**
 * @param {!Window} win
 * @param {!Element} element
 * @param {boolean} useRemoteHtml
 * @return {boolean}
 */
export function adsenseIsA4AEnabled(win, element, useRemoteHtml) {
  if (useRemoteHtml || !element.getAttribute('data-ad-client')) {
    return false;
  }
  selectExperiments(win, element);
  return (
    isGoogleAdsA4AValidEnvironment(win) ||
    getExperimentBranch(win, ADSENSE_EXP_NAMES.UNCONDITIONED_CANONICAL) ==
      ADSENSE_EXPERIMENTS.UNCONDITIONED_CANONICAL_EXP ||
    getExperimentBranch(win, ADSENSE_EXP_NAMES.CANONICAL) ==
      ADSENSE_EXPERIMENTS.CANONICAL_EXP
  );
}
