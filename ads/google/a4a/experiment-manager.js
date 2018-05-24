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
  forceExperimentBranch,
  getExperimentBranch,
  isExperimentOn,
  randomlySelectUnsetExperiments,
} from '../../../src/experiments';
import {
  MANUAL_EXPERIMENT_ID,
  addExperimentIdToElement,
  extractUrlExperimentId,
} from './traffic-experiments';

/**
 * Attempts to select into experiment and forces branch if selected.
 * @param {!Window} win
 * @param {!Element} element
 * @param {!Array<string>} branches
 * @param {string} expName
 */
export function selectAndSetExperiments(win, element, branches, expName) {
  const experimentId = maybeSelectExperiment(
      win, element, branches, expName);
  if (!!experimentId) {
    addExperimentIdToElement(experimentId, element);
    forceExperimentBranch(win, expName, experimentId);
  }
  return experimentId;
}

/**
 * @param {!Window} win
 * @param {!Element} element
 * @param {!Array<string>} selectionBranches
 * @param {string} experimentName}
 * @return {?string} Experiment branch ID or null if not selected.
 * @visibileForTesting
 */
function maybeSelectExperiment(win, element, selectionBranches, experimentName) {
  const experimentInfoMap =
        /** @type {!Object<string, !ExperimentInfo>} */ ({});
  experimentInfoMap[experimentName] = {
    isTrafficEligible: () => true,
    branches: selectionBranches,
  };
  randomlySelectUnsetExperiments(win, experimentInfoMap);
  return getExperimentBranch(win, experimentName);
}
