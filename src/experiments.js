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
import {parseQueryString} from './url';


/** @const {string} */
const COOKIE_NAME = 'AMP_EXP';

/** @const {number} */
const COOKIE_MAX_AGE_DAYS = 180;  // 6 month

/** @const {time} */
const COOKIE_EXPIRATION_INTERVAL = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

/** @const {string} */
const CANARY_EXPERIMENT_ID = 'dev-channel';

/** @type {Object<string, boolean>|undefined} */
let toggles_;

/**
 * A wrapper to avoid a static side-effect.
 * @return {!Object<string, boolean>}
 */
function experimentToggles() {
  return toggles_ || (toggles_ = Object.create(null));
}


/**
 * Whether the scripts come from a dev channel.
 * @param {!Window} win
 * @return {boolean}
 */
export function isDevChannel(win) {
  if (isExperimentOn(win, CANARY_EXPERIMENT_ID)) {
    return true;
  }
  if (isDevChannelVersionDoNotUse_(win)) {
    return true;
  }
  return false;
}


/**
 * Whether the version corresponds to the dev-channel binary.
 * @param {!Window} win
 * @return {boolean}
 * @private Visible for testing only!
 */
export function isDevChannelVersionDoNotUse_(win) {
  return !!(win.AMP_CONFIG && win.AMP_CONFIG.canary);
}


/**
 * Whether the specified experiment is on or off.
 * @param {!Window} win
 * @param {string} experimentId
 * @return {boolean}
 */
export function isExperimentOn(win, experimentId) {
  const toggles = experimentToggles();
  if (experimentId in toggles) {
    return toggles[experimentId];
  }
  return toggles[experimentId] = calcExperimentOn(win, experimentId);
}

/**
 * Check whether an experiment is on while allowing viewers to force
 * the experiment state via a viewer URL param of the form:
 * `e-$experimentId=1` (on) or `e-$experimentId=0` (off).
 * NOTE: This should only be used if it is needed and if turning the
 * experiment on or off does not have security implications.
 * @param {!Window} win
 * @param {string} experimentId
 * @return {boolean}
 */
export function isExperimentOnAllowUrlOverride(win, experimentId) {
  const hash = win.location.originalHash || win.location.hash;
  if (hash) {
    // Note: If this is used a lot, this should be optimized to only
    // parse once per page load.
    const param = parseQueryString(hash)['e-' + experimentId];
    if (param == '1') {
      return true;
    }
    if (param == '0') {
      return false;
    }
  }
  return isExperimentOn(win, experimentId);
}

/**
 * Calculate whether the specified experiment is on or off based off of the
 * cookieFlag or the global config frequency given.
 * @param {!Window} win
 * @param {string} experimentId
 * @return {boolean}
 */
function calcExperimentOn(win, experimentId) {
  const cookieFlag = getExperimentIds(win).indexOf(experimentId) != -1;
  if (cookieFlag) {
    return true;
  }

  if (win.AMP_CONFIG && win.AMP_CONFIG.hasOwnProperty(experimentId)) {
    const frequency = win.AMP_CONFIG[experimentId];
    return Math.random() < frequency;
  }
  return false;
}


/**
 * Toggles the experiment on or off. Returns the actual value of the experiment
 * after toggling is done.
 * @param {!Window} win
 * @param {string} experimentId
 * @param {boolean=} opt_on
 * @param {boolean=} opt_transientExperiment  Whether to toggle the
 *     experiment state "transiently" (i.e., for this page load only) or
 *     durably (by saving the experiment IDs to the cookie after toggling).
 *     Default: false (save durably).
 * @return {boolean} New state for experimentId.
 */
export function toggleExperiment(win, experimentId, opt_on,
    opt_transientExperiment) {
  const toggles = experimentToggles();
  const experimentIds = getExperimentIds(win);
  const currentlyOn = (experimentIds.indexOf(experimentId) != -1) ||
      (experimentId in toggles && toggles[experimentId]);
  const on = opt_on !== undefined ? opt_on : !currentlyOn;
  if (on != currentlyOn) {
    if (on) {
      experimentIds.push(experimentId);
      toggles[experimentId] = true;
    } else {
      experimentIds.splice(experimentIds.indexOf(experimentId), 1);
      toggles[experimentId] = false;
    }
    if (!opt_transientExperiment) {
      saveExperimentIds(win, experimentIds);
    }
  }
  return on;
}


/**
 * Returns a set of experiment IDs currently on.
 * @param {!Window} win
 * @return {!Array<string>}
 */
function getExperimentIds(win) {
  if (win._experimentCookie) {
    return win._experimentCookie;
  }
  const experimentCookie = getCookie(win, COOKIE_NAME);
  return win._experimentCookie = (
      experimentCookie ? experimentCookie.split(/\s*,\s*/g) : []);
}


/**
 * Saves a set of experiment IDs currently on.
 * @param {!Window} win
 * @param {!Array<string>} experimentIds
 */
function saveExperimentIds(win, experimentIds) {
  win._experimentCookie = null;
  setCookie(win, COOKIE_NAME, experimentIds.join(','),
      Date.now() + COOKIE_EXPIRATION_INTERVAL);
}

/**
 * Resets the experimentsToggle cache for testing purposes.
 * @visibleForTesting
 */
export function resetExperimentToggles_() {
  toggles_ = undefined;
}
