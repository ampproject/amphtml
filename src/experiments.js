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

/** @type {Object<string, boolean>} */
let toggles_ = null;

/**
 * Whether we are in canary.
 * @param {!Window} win
 * @return {boolean}
 */
export function isCanary(win) {
  return !!(win.AMP_CONFIG && win.AMP_CONFIG.canary);
}


/**
 * Whether the specified experiment is on or off.
 * @param {!Window} win
 * @param {string} experimentId
 * @return {boolean}
 */
export function isExperimentOn(win, experimentId) {
  const toggles = experimentToggles(win);
  return !!toggles[experimentId];
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
  const currentlyOn = isExperimentOn(win, experimentId);
  const on = !!(opt_on !== undefined ? opt_on : !currentlyOn);
  if (on != currentlyOn) {
    const toggles = experimentToggles(win);
    toggles[experimentId] = on;

    if (!opt_transientExperiment) {
      const cookieToggles = getExperimentTogglesFromCookie(win);
      cookieToggles[experimentId] = on;
      saveExperimentTogglesToCookie(win, cookieToggles);
    }
  }
  return on;
}

/**
 * Calculate whether the experiment is on or off based off of the
 * cookieFlag or the global config frequency given.
 * @param {!Window} win
 * @return {!Object<string, boolean>}
 */
export function experimentToggles(win) {
  if (toggles_) {
    return toggles_;
  }
  toggles_ = Object.create(null);

  // Read the default config of this build.
  if (win.AMP_CONFIG) {
    for (const experimentId in win.AMP_CONFIG) {
      const frequency = win.AMP_CONFIG[experimentId];
      if (typeof frequency === 'number' && frequency >= 0 && frequency <= 1) {
        toggles_[experimentId] = Math.random() < frequency;
      }
    }
  }

  // Read document level override from meta tag.
  if (win.AMP_CONFIG
      && Array.isArray(win.AMP_CONFIG['allow-doc-opt-in'])
      && win.AMP_CONFIG['allow-doc-opt-in'].length > 0) {
    const allowed = win.AMP_CONFIG['allow-doc-opt-in'];
    const meta =
        win.document.head.querySelector('meta[name="amp-experiments-opt-in"]');
    if (meta) {
      const optedInExperiments = meta.getAttribute('content').split(',');
      for (let i = 0; i < optedInExperiments.length; i++) {
        if (allowed.indexOf(optedInExperiments[i]) != -1) {
          toggles_[optedInExperiments[i]] = true;
        }
      }
    }
  }

  Object.assign(toggles_, getExperimentTogglesFromCookie(win));

  if (win.AMP_CONFIG
      && Array.isArray(win.AMP_CONFIG['allow-url-opt-in'])
      && win.AMP_CONFIG['allow-url-opt-in'].length > 0) {
    const allowed = win.AMP_CONFIG['allow-url-opt-in'];
    const hash = win.location.originalHash || win.location.hash;
    const params = parseQueryString(hash);
    for (let i = 0; i < allowed.length; i++) {
      const param = params[`e-${allowed[i]}`];
      if (param == '1') {
        toggles_[allowed[i]] = true;
      }
      if (param == '0') {
        toggles_[allowed[i]] = false;
      }
    }
  }
  return toggles_;
}

/**
 * Returns the cached experiments toggles, or null if they have not been
 * computed yet.
 * @return {Object<string, boolean>}
 */
export function experimentTogglesOrNull() {
  return toggles_;
}

/**
 * Returns a set of experiment IDs currently on.
 * @param {!Window} win
 * @return {!Object<string, boolean>}
 */
function getExperimentTogglesFromCookie(win) {
  const experimentCookie = getCookie(win, COOKIE_NAME);
  const tokens = experimentCookie ? experimentCookie.split(/\s*,\s*/g) : [];

  const toggles = Object.create(null);
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].length == 0) {
      continue;
    }
    if (tokens[i][0] == '-') {
      toggles[tokens[i].substr(1)] = false;
    } else {
      toggles[tokens[i]] = true;
    }
  }

  return toggles;
}

/**
 * Saves a set of experiment IDs currently on.
 * @param {!Window} win
 * @param {!Object<string, boolean>} toggles
 */
function saveExperimentTogglesToCookie(win, toggles) {
  const experimentIds = [];
  for (const experiment in toggles) {
    experimentIds.push((toggles[experiment] === false ? '-' : '') + experiment);
  }

  setCookie(win, COOKIE_NAME, experimentIds.join(','),
      Date.now() + COOKIE_EXPIRATION_INTERVAL, {
        // Set explicit domain, so the cookie gets send to sub domains.
        domain: win.location.hostname,
      });
}

/**
 * See getExperimentTogglesFromCookie().
 * @param {!Window} win
 * @return {!Object<string, boolean>}
 * @visibleForTesting
 */
export function getExperimentToglesFromCookieForTesting(win) {
  return getExperimentTogglesFromCookie(win);
}

/**
 * Resets the experimentsToggle cache for testing purposes.
 * @param {!Window} win
 * @visibleForTesting
 */
export function resetExperimentTogglesForTesting(win) {
  setCookie(win, COOKIE_NAME, '', 0, {
    domain: win.location.hostname,
  });
  toggles_ = null;
}
