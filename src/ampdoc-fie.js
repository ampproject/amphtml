/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
  forceExperimentBranch,
  getExperimentBranch,
  isExperimentOn,
  randomlySelectUnsetExperiments,
} from './experiments';

// TODO(#22733): Remove this file once "ampdoc-fie" is cleaned up.

const EXPERIMENT_ID = 'ampdoc-fie';

/**
 * @const {{experiment: string, control: string, branch: string}}
 */
const EXPERIMENT = {
  branch: EXPERIMENT_ID,
  control: '21066823',
  experiment: '21066824',
};

/**
 * @const {!Array<!./experiments.ExperimentInfo>}
 */
export const EXPERIMENT_INFO_LIST = [
  {
    experimentId: EXPERIMENT_ID,
    isTrafficEligible: () => true,
    branches: [EXPERIMENT.control, EXPERIMENT.experiment],
  },
];

/**
 * @param {!Window} win
 * @param {boolean} on
 * @visibleForTesting
 */
export function toggleAmpdocFieForTesting(win, on) {
  forceExperimentBranch(win, EXPERIMENT_ID, on ? EXPERIMENT.experiment : null);
}

/**
 * @param {!Window} win
 * @return {boolean}
 */
export function isInAmpdocFieExperiment(win) {
  if (!isExperimentOn(win, 'ampdoc-fie')) {
    return false;
  }
  randomlySelectUnsetExperiments(win, EXPERIMENT_INFO_LIST);
  return getExperimentBranch(win, EXPERIMENT_ID) === EXPERIMENT.experiment;
}
