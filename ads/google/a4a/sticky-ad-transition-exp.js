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

import {randomlySelectUnsetExperiments} from '../../../src/experiments';

/** @const @enum{string} */
export const STICKY_AD_TRANSITION_EXP = {
  id: 'sticky-ad-transition',
  control: '31060071',
  experiment: '31060072',
};

/**
 * Select exp vs control for sticky-ad-transition.
 * @param {!Window} win
 */
export function divertStickyAdTransition(win) {
  const expInfoList = /** @type {!Array<!../experiments.ExperimentInfo>} */ ([
    {
      experimentId: STICKY_AD_TRANSITION_EXP.id,
      isTrafficEligible: () => true,
      branches: [
        STICKY_AD_TRANSITION_EXP.control,
        STICKY_AD_TRANSITION_EXP.experiment,
      ],
    },
  ]);
  randomlySelectUnsetExperiments(win, expInfoList);
}
