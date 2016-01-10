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

/**
 * @fileoverview Experiments system allows a developer to opt-in to test
 * features that are not yet fully tested.
 *
 * Experiments page: https://cdn.ampproject.org/experiments.html *
 */

import {getCookie, setCookie} from './cookies';
import {timer} from './timer';


/** @const {string} */
const COOKIE_NAME = 'AMP_EXP';

/** @const {number} */
const COOKIE_MAX_AGE_DAYS = 180;  // 6 month

/** @const {time} */
const COOKIE_EXPIRATION_INTERVAL = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;


/**
 * Whether the specified experiment is on or off.
 * @param {!Window} win
 * @param {string} experimentId
 * @return {boolean}
 */
export function isExperimentOn(win, experimentId) {
  return getExperimentIds(win).indexOf(experimentId) != -1;
}


/**
 * Toggles the expriment on or off. Returns the actual value of the expriment
 * after toggling is done.
 * @param {!Window} win
 * @param {string} experimentId
 * @param {boolean=} opt_on
 * @return {boolean}
 */
export function toggleExperiment(win, experimentId, opt_on) {
  const experimentIds = getExperimentIds(win);
  const currentlyOn = experimentIds.indexOf(experimentId) != -1;
  const on = opt_on !== undefined ? opt_on : !currentlyOn;
  if (on != currentlyOn) {
    if (on) {
      experimentIds.push(experimentId);
    } else {
      experimentIds.splice(experimentIds.indexOf(experimentId), 1);
    }
    saveExperimentIds(win, experimentIds);
  }
  return on;
}


/**
 * Returns a set of experiment IDs currently on.
 * @param {!Window} win
 * @return {!Array<string>}
 */
function getExperimentIds(win) {
  const experimentCookie = getCookie(win, COOKIE_NAME);
  return experimentCookie ? experimentCookie.split(/\s*,\s*/g) : [];
}


/**
 * Saves a set of experiment IDs currently on.
 * @param {!Window} win
 * @param {!Array<string>} experimentIds
 */
function saveExperimentIds(win, experimentIds) {
  setCookie(win, COOKIE_NAME, experimentIds.join(','),
      timer.now() + COOKIE_EXPIRATION_INTERVAL);
}
