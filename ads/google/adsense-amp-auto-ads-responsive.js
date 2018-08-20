/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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


import {
  ExperimentInfo, // eslint-disable-line no-unused-vars
  getExperimentBranch,
  randomlySelectUnsetExperiments,
} from '../../src/experiments';


/** @const {string} */
export const ADSENSE_AMP_AUTO_ADS_RESPONSIVE_EXPERIMENT_NAME =
    'amp-auto-ads-adsense-responsive';


/**
 * @enum {string}
 */
export const AdSenseAmpAutoAdsResponsiveBranches = {
  CONTROL: '19861210', // don't attempt to expand auto ads to responsive format
  EXPERIMENT: '19861211', // do attempt to expand auto ads to responsive format
};


/** @const {!ExperimentInfo} */
const ADSENSE_AMP_AUTO_ADS_RESPONSIVE_EXPERIMENT_INFO = {
  isTrafficEligible: win => !!win.document.querySelector('AMP-AUTO-ADS'),
  branches: [
    AdSenseAmpAutoAdsResponsiveBranches.CONTROL,
    AdSenseAmpAutoAdsResponsiveBranches.EXPERIMENT,
  ],
};


/**
 * This has the side-effect of selecting the page into a branch of the
 * experiment, which becomes sticky for the entire pageview.
 *
 * @param {!Window} win
 * @return {?string}
 */
export function getAdSenseAmpAutoAdsResponsiveExperimentBranch(win) {
  const experiments = /** @type {!Object<string, !ExperimentInfo>} */ ({});
  experiments[ADSENSE_AMP_AUTO_ADS_RESPONSIVE_EXPERIMENT_NAME] =
      ADSENSE_AMP_AUTO_ADS_RESPONSIVE_EXPERIMENT_INFO;
  randomlySelectUnsetExperiments(win, experiments);
  return getExperimentBranch(win,
      ADSENSE_AMP_AUTO_ADS_RESPONSIVE_EXPERIMENT_NAME) || null;
}
