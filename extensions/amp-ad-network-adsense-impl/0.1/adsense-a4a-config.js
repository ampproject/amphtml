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
import {tryParseJson} from '../../../src/json';
import {dev} from '../../../src/log';

/** @const {!string}  @private */
export const ADSENSE_A4A_EXPERIMENT_NAME = 'expAdsenseA4A';

/** @type {string} */
const TAG = 'amp-ad-network-adsense-impl';

/** @const @enum{string} */
export const ADSENSE_EXPERIMENT_FEATURE = {
  HOLDBACK_EXTERNAL: '2092618',
  HOLDBACK_INTERNAL: '2092616',
  DELAYED_REQUEST: '117152655',
};

/** @const @type {!Object<string,?string>} */
export const URL_EXPERIMENT_MAPPING = {
  '-1': MANUAL_EXPERIMENT_ID,
  '0': null,
  // Holdback
  '1': '2092617',
  '2': ADSENSE_EXPERIMENT_FEATURE.HOLDBACK_EXTERNAL,
  // Delay Request
  '3': '117152654',
  '4': ADSENSE_EXPERIMENT_FEATURE.DELAYED_REQUEST,
};

/**
 * @param {!Window} win
 * @param {!Element} element
 * @returns {boolean}
 */
export function adsenseIsA4AEnabled(win, element) {
  const jsonAttribute = element.getAttribute('json');
  const json = jsonAttribute && tryParseJson(jsonAttribute);
  if (!isGoogleAdsA4AValidEnvironment(win) ||
      !((json && json['adClient']) || 'adClient' in element.dataset)) {
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
    const experimentInfoMap = {};
    experimentInfoMap[ADSENSE_A4A_EXPERIMENT_NAME] = {
      isTrafficEligible: () => true,
      branches: {
        control: '2092615',
        experiment: ADSENSE_EXPERIMENT_FEATURE.HOLDBACK_INTERNAL,
      },
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

<<<<<<< HEAD
/**
 * @param {!Window} win
 * @param {!ADSENSE_EXPERIMENT_FEATURE} feature
 * @return {boolean} whether feature is enabled
 */
export function experimentFeatureEnabled(win, feature) {
  return getExperimentBranch(win, ADSENSE_A4A_EXPERIMENT_NAME) == feature;
=======
  // TODO(@taymonbeal, #10524): unify this with methods in AmpA4A
      googleAdsIsA4AEnabled(
          win, element, ADSENSE_A4A_EXPERIMENT_NAME, externalBranches,
          internalBranches,
          ADSENSE_A4A_EXTERNAL_DELAYED_EXPERIMENT_BRANCHES_PRE_LAUNCH);
>>>>>>> Apply JSON agnosticism to config checkers and fix numerous test problems
}
