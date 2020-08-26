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

import {forceExperimentBranch, isExperimentOn} from './experiments';

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
  return isExperimentOn(win, 'ampdoc-fie');
}
