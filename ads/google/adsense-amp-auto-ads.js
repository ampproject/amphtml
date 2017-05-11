/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
  randomlySelectUnsetExperiments,
  getExperimentBranch,
} from '../../src/experiments';


/** @const {string} */
export const ADSENSE_AMP_AUTO_ADS_HOLDOUT_EXPERIMENT_NAME =
    'amp-auto-ads-adsense-holdout';


/**
 * @enum {string}
 */
export const AdSenseAmpAutoAdsHoldoutBranches = {
  CONTROL: '3782001',  // don't run amp-auto-ads
  EXPERIMENT: '3782002',  // do run amp-auto-ads
};


/** @const {!../../src/experiments.ExperimentInfo} */
const ADSENSE_AMP_AUTO_ADS_EXPERIMENT_INFO = {
  isTrafficEligible: win => !!win.document.querySelector('AMP-AUTO-ADS'),
  branches: [
    AdSenseAmpAutoAdsHoldoutBranches.CONTROL,
    AdSenseAmpAutoAdsHoldoutBranches.EXPERIMENT,
  ],
};


/**
 * This has the side-effect of selecting the page into a branch of the
 * experiment, which becomes sticky for the entire pageview.
 *
 * @param {!Window} win
 * @return {?string}
 */
export function getAdSenseAmpAutoAdsExpBranch(win) {
  const experiments = {};
  experiments[ADSENSE_AMP_AUTO_ADS_HOLDOUT_EXPERIMENT_NAME] =
      ADSENSE_AMP_AUTO_ADS_EXPERIMENT_INFO;
  randomlySelectUnsetExperiments(win, experiments);
  return getExperimentBranch(win, ADSENSE_AMP_AUTO_ADS_HOLDOUT_EXPERIMENT_NAME)
      || null;
};
