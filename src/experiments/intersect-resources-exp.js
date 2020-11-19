/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {isAmp4Email} from '../format';
import {randomlySelectUnsetExperiments} from '../experiments';

/** @const {!{id: string, control: string, experiment: string}} */
export const INTERSECT_RESOURCES_EXP = {
  id: 'intersect-resources',
  control: '21068800',
  experiment: '21068801',
};

/**
 * Determine if browser supports IntersectionObserver
 * @return {boolean}
 */
function supportsIntersectionObserver() {
  try {
    new IntersectionObserver(() => {}, {root: document});
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Select exp vs control for intersect-resources.
 * @param {!Window} win
 */
export function divertIntersectResources(win) {
  // Only record metrics for inOb eligible browsers. AMP4Email always falls back.
  if (isAmp4Email(win.document) || !supportsIntersectionObserver()) {
    return;
  }
  const expInfoList = /** @type {!Array<!../experiments.ExperimentInfo>} */ ([
    {
      experimentId: INTERSECT_RESOURCES_EXP.id,
      isTrafficEligible: () => true,
      branches: [
        INTERSECT_RESOURCES_EXP.control,
        INTERSECT_RESOURCES_EXP.experiment,
      ],
    },
  ]);
  randomlySelectUnsetExperiments(win, expInfoList);
}
