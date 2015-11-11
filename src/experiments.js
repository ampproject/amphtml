/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {getCookie} from './cookies';


/**
 * Whether the specified experiment is on or off.
 *
 * All experiments are opt-in. A user has to visit the experiments page and
 * manually toggle the experiment on.
 * TODO(dvoytenko): provide the URL for the experiments page once ready.
 *
 * @param {!Window} win
 * @param {string} experimentId
 * @return {boolean}
 */
export function isExperimentOn(win, experimentId) {
  const experimentCookie = getCookie(win, 'amp-exp');
  if (!experimentCookie) {
    return false;
  }
  return experimentCookie.split(/\s*,\s*/g).indexOf(experimentId) != -1;
}
