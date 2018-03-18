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
import {forceExperimentBranch} from '../../../src/experiments';
import {isGoogleAdsA4AValidEnvironment} from '../../../ads/google/a4a/utils';

/** @const {string} @visibleForTesting */
export const ADSENSE_A4A_EXPERIMENT_NAME = 'expAdsenseA4A';

/** @type {string} */
const TAG = 'amp-ad-network-adsense-impl';

/** @const @type {!Object<string,?string>} */
export const URL_EXPERIMENT_MAPPING = {
  '-1': MANUAL_EXPERIMENT_ID,
  '0': null,
};

/**
 * @param {!Window} win
 * @param {!Element} element
 * @param {boolean} useRemoteHtml
 * @returns {boolean}
 */
export function adsenseIsA4AEnabled(win, element, useRemoteHtml) {
  if (useRemoteHtml || !isGoogleAdsA4AValidEnvironment(win) ||
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
  }
  if (experimentId) {
    addExperimentIdToElement(experimentId, element);
    forceExperimentBranch(win, ADSENSE_A4A_EXPERIMENT_NAME, experimentId);
  }
  return true;
}
