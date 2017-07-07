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
  getExperimentBranch,
  forceExperimentBranch,
  randomlySelectUnsetExperiments,
} from '../../../src/experiments';
import {dev} from '../../../src/log';

/** @const {string} */
export const DOUBLECLICK_A4A_EXPERIMENT_NAME = 'expDoubleclickA4A';

/** @type {string} */
const TAG = 'amp-ad-network-doubleclick-impl';

/** @const @enum{string} */
export const DOUBLECLICK_EXPERIMENT_FEATURE = {
  HOLDBACK_EXTERNAL: '2092620',
  HOLDBACK_INTERNAL: '2092614',
  DELAYED_REQUEST: '117152665',
  SRA: '117152667',
};

/** @const @type {!Object<string,?string>} */
export const URL_EXPERIMENT_MAPPING = {
  '-1': MANUAL_EXPERIMENT_ID,
  '0': null,
  // Holdback
  '1': '2092619',
  '2': DOUBLECLICK_EXPERIMENT_FEATURE.HOLDBACK_EXTERNAL,
  // Delay Request
  '3': '117152664',
  '4': DOUBLECLICK_EXPERIMENT_FEATURE.DELAYED_REQUEST,
  // SFG
  '5': '21060540',
  '6': '21060541',
  // SRA
  '7': '117152666',
  '8': DOUBLECLICK_EXPERIMENT_FEATURE.SRA,
};

/** @const {string} */
export const BETA_ATTRIBUTE = 'data-use-beta-a4a-implementation';

/** @const {string} */
export const BETA_EXPERIMENT_ID = '2077831';

/**
 * @param {!Window} win
 * @param {!Element} element
 * @returns {boolean}
 */
export function doubleclickIsA4AEnabled(win, element) {
  if (!isGoogleAdsA4AValidEnvironment(win)) {
    return false;
  }
  if (element.hasAttribute(BETA_ATTRIBUTE)) {
    addExperimentIdToElement(BETA_EXPERIMENT_ID, element);
    dev().info(TAG, `beta forced a4a selection ${element}`);
    return true;
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
    const experimentInfoMap = {};
    experimentInfoMap[DOUBLECLICK_A4A_EXPERIMENT_NAME] = {
      isTrafficEligible: () => true,
      branches: {
        control: '2092613',
        experiment: DOUBLECLICK_EXPERIMENT_FEATURE.HOLDBACK_INTERNAL,
      },
    };
    // Note: Because the same experimentName is being used everywhere here,
    // randomlySelectUnsetExperiments won't add new IDs if
    // maybeSetExperimentFromUrl has already set something for this
    // experimentName.
    randomlySelectUnsetExperiments(win, experimentInfoMap);
    experimentId = getExperimentBranch(win, DOUBLECLICK_A4A_EXPERIMENT_NAME);
    dev().info(
        TAG, `random experiment selection ${urlExperimentId}: ${experimentId}`);
  }
  if (experimentId) {
    addExperimentIdToElement(experimentId, element);
    forceExperimentBranch(win, DOUBLECLICK_A4A_EXPERIMENT_NAME, experimentId);
  }
  return ![DOUBLECLICK_EXPERIMENT_FEATURE.HOLDBACK_EXTERNAL,
    DOUBLECLICK_EXPERIMENT_FEATURE.HOLDBACK_INTERNAL].includes(experimentId);
}

/**
 * @param {!Window} win
 * @param {!DOUBLECLICK_EXPERIMENT_FEATURE} feature
 * @return {boolean} whether feature is enabled
 */
export function experimentFeatureEnabled(win, feature) {
  return getExperimentBranch(win, DOUBLECLICK_A4A_EXPERIMENT_NAME) == feature;
}
