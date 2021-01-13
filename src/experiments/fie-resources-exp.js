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

import {randomlySelectUnsetExperiments} from '../experiments';

/** @const {!{id: string, control: string, experiment: string}} */
export const FIE_RESOURCES_EXP = {
  id: 'fie-resources',
  control: '21068940',
  experiment: '21068941',
};

/**
 * Select exp vs control for fie-resources.
 * @param {!Window} win
 */
export function divertFieResources(win) {
  const expInfoList = /** @type {!Array<!../experiments.ExperimentInfo>} */ ([
    {
      experimentId: FIE_RESOURCES_EXP.id,
      isTrafficEligible: () => true,
      branches: [FIE_RESOURCES_EXP.control, FIE_RESOURCES_EXP.experiment],
    },
  ]);
  randomlySelectUnsetExperiments(win, expInfoList);
}
