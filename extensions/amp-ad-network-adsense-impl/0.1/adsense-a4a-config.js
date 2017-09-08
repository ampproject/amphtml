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
  extractUrlExperimentId,
  addExperimentIdToElement,
} from '../../../ads/google/a4a/traffic-experiments';
import {isGoogleAdsA4AValidEnvironment} from '../../../ads/google/a4a/utils';
import {
  /* eslint no-unused-vars: 0 */ ExperimentInfo,
  getExperimentBranch,
  forceExperimentBranch,
  randomlySelectUnsetExperiments,
} from '../../../src/experiments';
import {dev} from '../../../src/log';

/** @const {!string} @visibleForTesting */
export const ADSENSE_A4A_EXPERIMENT_NAME = 'expAdsenseA4A';

/**
 * Unconditioned, client-side diverted experiment across all AdSense traffic.
 * @const {!string} @visibleForTesting
 */
export const FF_DR_EXP_NAME = 'expAdSenseFFDR';

/** @const @enum{string} @visibleForTesting */
export const INTERNAL_FAST_FETCH_DELAY_REQUEST_EXP = {
  CONTROL: '21060901',
  EXPERIMENT: '21060902',
};

/** @const @enum{string} @visibleForTesting */
export const ADSENSE_EXPERIMENT_FEATURE = {
  HOLDBACK_EXTERNAL_CONTROL: '21060732',
  HOLDBACK_EXTERNAL: '21060733',
  DELAYED_REQUEST_EXTERNAL_CONTROL: '21060734',
  DELAYED_REQUEST_EXTERNAL: '21060735',
  HOLDBACK_INTERNAL_CONTROL: '2092615',
  HOLDBACK_INTERNAL: '2092616',
  CACHE_EXTENSION_INJECTION_CONTROL: '21060953',
  CACHE_EXTENSION_INJECTION_EXP: '21060954',
};

/** @type {string} */
const TAG = 'amp-ad-network-adsense-impl';

/** @const @type {!Object<string,?string>} */
export const URL_EXPERIMENT_MAPPING = {
  '-1': MANUAL_EXPERIMENT_ID,
  '0': null,
  // Holdback
  '1': ADSENSE_EXPERIMENT_FEATURE.HOLDBACK_EXTERNAL_CONTROL,
  '2': ADSENSE_EXPERIMENT_FEATURE.HOLDBACK_EXTERNAL,
  // Delay Request
  '3': ADSENSE_EXPERIMENT_FEATURE.DELAYED_REQUEST_EXTERNAL_CONTROL,
  '4': ADSENSE_EXPERIMENT_FEATURE.DELAYED_REQUEST_EXTERNAL,
  // AMP Cache extension injection
  '5': ADSENSE_EXPERIMENT_FEATURE.CACHE_EXTENSION_INJECTION_CONTROL,
  '6': ADSENSE_EXPERIMENT_FEATURE.CACHE_EXTENSION_INJECTION_EXP,
};

/**
 * @param {!Window} win
 * @param {!Element} element
 * @returns {boolean}
 */
export function adsenseIsA4AEnabled(win, element) {
  // Select Fast fetch, delayed request across all traffic as its unconditioned.
  // Note that this will "pollute" the SERP triggered control/experiments and
  // will have no effect on delayed fetch.
  const ffDrExperimentInfoMap =
      /** @type {!Object<string, !ExperimentInfo>} */ ({});
  ffDrExperimentInfoMap[FF_DR_EXP_NAME] = {
    isTrafficEligible: () => true,
    branches: [
      INTERNAL_FAST_FETCH_DELAY_REQUEST_EXP.CONTROL,
      INTERNAL_FAST_FETCH_DELAY_REQUEST_EXP.EXPERIMENT,
    ],
  };
  randomlySelectUnsetExperiments(win, ffDrExperimentInfoMap);
  const delayedFetchExperimentId = getExperimentBranch(win, FF_DR_EXP_NAME);
  if (delayedFetchExperimentId) {
    addExperimentIdToElement(delayedFetchExperimentId, element);
  }
  if (!isGoogleAdsA4AValidEnvironment(win) ||
      !element.getAttribute('data-ad-client')) {
    return false;
  }
  // See if in holdback control/experiment.
  let experimentId;
  const urlExperimentId = extractUrlExperimentId(win, element);
  if (urlExperimentId != undefined) {
    experimentId = URL_EXPERIMENT_MAPPING[urlExperimentId];
    dev().info(
        TAG, `url experiment selection ${urlExperimentId}: ${experimentId}.`);
  } else {
    // Not set via url so randomly set.
    const experimentInfoMap =
        /** @type {!Object<string, !ExperimentInfo>} */ ({});
    experimentInfoMap[ADSENSE_A4A_EXPERIMENT_NAME] = {
      isTrafficEligible: () => true,
      branches: [
        ADSENSE_EXPERIMENT_FEATURE.HOLDBACK_INTERNAL_CONTROL,
        ADSENSE_EXPERIMENT_FEATURE.HOLDBACK_INTERNAL,
      ],
    };
    // Note: Because the same experimentName is being used everywhere here,
    // randomlySelectUnsetExperiments won't add new IDs if
    // maybeSetExperimentFromUrl has already set something for this
    // experimentName.
    randomlySelectUnsetExperiments(win, experimentInfoMap);
    experimentId = getExperimentBranch(win, ADSENSE_A4A_EXPERIMENT_NAME);
    dev().info(
        TAG, `random experiment selection ${urlExperimentId}: ${experimentId}`);

  }
  if (experimentId) {
    addExperimentIdToElement(experimentId, element);
    forceExperimentBranch(win, ADSENSE_A4A_EXPERIMENT_NAME, experimentId);
  }
  return ![ADSENSE_EXPERIMENT_FEATURE.HOLDBACK_EXTERNAL,
    ADSENSE_EXPERIMENT_FEATURE.HOLDBACK_INTERNAL].includes(experimentId);
}

/**
 * @param {!Window} win
 * @return {boolean} whether fast fetch delayed request experiment is enabled.
 */
export function fastFetchDelayedRequestEnabled(win) {
  return !!(
      getExperimentBranch(win, ADSENSE_A4A_EXPERIMENT_NAME) ==
        ADSENSE_EXPERIMENT_FEATURE.DELAYED_REQUEST_EXTERNAL ||
      getExperimentBranch(win, FF_DR_EXP_NAME) ==
        INTERNAL_FAST_FETCH_DELAY_REQUEST_EXP.EXPERIMENT);
}
