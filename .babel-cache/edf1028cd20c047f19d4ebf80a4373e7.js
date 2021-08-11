function _createForOfIteratorHelper(o, allowArrayLike) {var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];if (!it) {if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || (allowArrayLike && o && typeof o.length === "number")) {if (it) o = it;var i = 0;var F = function F() {};return { s: F, n: function n() {if (i >= o.length) return { done: true };return { done: false, value: o[i++] };}, e: function e(_e) {throw _e;}, f: F };}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}var normalCompletion = true,didErr = false,err;return { s: function s() {it = it.call(o);}, n: function n() {var step = it.next();normalCompletion = step.done;return step;}, e: function e(_e2) {didErr = true;err = _e2;}, f: function f() {try {if (!normalCompletion && it.return != null) it.return();} finally {if (didErr) throw err;}} };}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;} /**
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

import { isArray } from "../core/types";
import { hasOwn, map } from "../core/types/object";
import { parseJson } from "../core/types/object/json";
import { parseQueryString } from "../core/types/string/url";

import { ExperimentInfoDef } from "./experiments.type";

import { dev, user } from "../log";
import { getMode } from "../mode";
import { getTopWindow } from "../service-helpers";

/** @const {string} */
var TAG = 'EXPERIMENTS';

/** @const {string} */
var LOCAL_STORAGE_KEY = 'amp-experiment-toggles';

/** @const {string} */
var TOGGLES_WINDOW_PROPERTY = '__AMP__EXPERIMENT_TOGGLES';

/**
 * Whether we are in canary.
 * @param {!Window} win
 * @return {boolean}
 */
export function isCanary(win) {var _win$AMP_CONFIG;
  return !!(((_win$AMP_CONFIG = win.AMP_CONFIG) !== null && _win$AMP_CONFIG !== void 0) && _win$AMP_CONFIG.canary);
}

/**
 * Returns binary type, e.g., canary, production, control, or rc.
 * @param {!Window} win
 * @return {string}
 */
export function getBinaryType(win) {var _win$AMP_CONFIG2;
  return (((_win$AMP_CONFIG2 = win.AMP_CONFIG) === null || _win$AMP_CONFIG2 === void 0) ? (void 0) : _win$AMP_CONFIG2.type) || 'unknown';
}

/**
 * Whether the specified experiment is on or off.
 * @param {!Window} win
 * @param {string} experimentId
 * @return {boolean}
 */
export function isExperimentOn(win, experimentId) {
  var toggles = experimentToggles(win);
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
 *     durably (by saving the experiment IDs after toggling).
 *     Default: false (save durably).
 * @return {boolean} New state for experimentId.
 */
export function toggleExperiment(
win,
experimentId,
opt_on,
opt_transientExperiment)
{
  var currentlyOn = isExperimentOn(win, /*OK*/experimentId);
  var on = opt_on !== null && opt_on !== void 0 ? opt_on : !currentlyOn;
  if (on != currentlyOn) {
    var toggles = experimentToggles(win);
    toggles[experimentId] = on;

    if (!opt_transientExperiment) {
      var storedToggles = getExperimentToggles(win);
      storedToggles[experimentId] = on;
      saveExperimentToggles(win, storedToggles);
      // Avoid affecting tests that spy/stub warn().
      if (!false) {
        user().warn(
        TAG,
        '"%s" experiment %s for the domain "%s". See: https://amp.dev/documentation/guides-and-tutorials/learn/experimental',
        experimentId,
        on ? 'enabled' : 'disabled',
        win.location.hostname);

      }
    }
  }
  return on;
}

/**
 * Calculate whether the experiment is on or off based off of its default value,
 * stored overriden value, or the global config frequency given.
 * @param {!Window} win
 * @return {!Object<string, boolean>}
 */
export function experimentToggles(win) {var _win$AMP_CONFIG3, _win$AMP_EXP, _win$__AMP_EXP, _win$AMP_CONFIG4, _win$AMP_CONFIG5;
  if (win[TOGGLES_WINDOW_PROPERTY]) {
    return win[TOGGLES_WINDOW_PROPERTY];
  }
  win[TOGGLES_WINDOW_PROPERTY] = map();
  var toggles = win[TOGGLES_WINDOW_PROPERTY];

  // Read default and injected configs of this build.
  var buildExperimentConfigs = _objectSpread(_objectSpread({}, (_win$AMP_CONFIG3 =
  win.AMP_CONFIG) !== null && _win$AMP_CONFIG3 !== void 0 ? _win$AMP_CONFIG3 : {}), (_win$AMP_EXP =
  win.AMP_EXP) !== null && _win$AMP_EXP !== void 0 ? _win$AMP_EXP : parseJson((((_win$__AMP_EXP = win.__AMP_EXP) === null || _win$__AMP_EXP === void 0) ? (void 0) : _win$__AMP_EXP.textContent) || '{}'));

  for (var experimentId in buildExperimentConfigs) {
    var frequency = buildExperimentConfigs[experimentId];
    if (typeof frequency === 'number' && frequency >= 0 && frequency <= 1) {
      toggles[experimentId] = Math.random() < frequency;
    }
  }
  // Read document level override from meta tag.
  var allowedDocOptIn = ((_win$AMP_CONFIG4 = win.AMP_CONFIG) === null || _win$AMP_CONFIG4 === void 0) ? (void 0) : _win$AMP_CONFIG4['allow-doc-opt-in'];
  if (isArray(allowedDocOptIn) && allowedDocOptIn.length) {
    var meta = win.document.head.querySelector(
    'meta[name="amp-experiments-opt-in"]');

    if (meta) {
      var optedInExperiments = meta.getAttribute('content').split(',');var _iterator = _createForOfIteratorHelper(
      optedInExperiments),_step;try {for (_iterator.s(); !(_step = _iterator.n()).done;) {var experiment = _step.value;
          if ( /** @type {!Array} */(allowedDocOptIn).includes(experiment)) {
            toggles[experiment] = true;
          }
        }} catch (err) {_iterator.e(err);} finally {_iterator.f();}
    }
  }

  Object.assign(toggles, getExperimentToggles(win));

  var allowedUrlOptIn = ((_win$AMP_CONFIG5 = win.AMP_CONFIG) === null || _win$AMP_CONFIG5 === void 0) ? (void 0) : _win$AMP_CONFIG5['allow-url-opt-in'];
  if (isArray(allowedUrlOptIn) && allowedUrlOptIn.length) {
    var hash = win.location['originalHash'] || win.location.hash;
    var params = parseQueryString(hash);var _iterator2 = _createForOfIteratorHelper(
    allowedUrlOptIn),_step2;try {for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {var _experiment = _step2.value;
        var param = params["e-".concat(_experiment)];
        if (param == '1') {
          toggles[_experiment] = true;
        }
        if (param == '0') {
          toggles[_experiment] = false;
        }
      }} catch (err) {_iterator2.e(err);} finally {_iterator2.f();}
  }
  return toggles;
}

/**
 * Returns the cached experiments toggles, or null if they have not been
 * computed yet.
 * @param {!Window} win
 * @return {?Object<string, boolean>}
 */
export function experimentTogglesOrNull(win) {
  return win[TOGGLES_WINDOW_PROPERTY] || null;
}

/**
 * Returns a set of experiment IDs currently on.
 * @param {!Window} win
 * @return {!Object<string, boolean>}
 */
function getExperimentToggles(win) {var _experimentsString;
  var experimentsString = '';
  try {
    if ('localStorage' in win) {
      experimentsString = win.localStorage.getItem(LOCAL_STORAGE_KEY);
    }
  } catch (_unused) {
    dev().warn(TAG, 'Failed to retrieve experiments from localStorage.');
  }
  var tokens = (((_experimentsString = experimentsString) === null || _experimentsString === void 0) ? (void 0) : _experimentsString.split(/\s*,\s*/g)) || [];

  var toggles = map();var _iterator3 = _createForOfIteratorHelper(
  tokens),_step3;try {for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {var token = _step3.value;
      if (!token) {
        continue;
      }
      if (token[0] == '-') {
        toggles[token.substr(1)] = false;
      } else {
        toggles[token] = true;
      }
    }} catch (err) {_iterator3.e(err);} finally {_iterator3.f();}
  return toggles;
}

/**
 * Saves a set of experiment IDs currently on.
 * @param {!Window} win
 * @param {!Object<string, boolean>} toggles
 */
function saveExperimentToggles(win, toggles) {
  var experimentIds = [];
  for (var experiment in toggles) {
    experimentIds.push((toggles[experiment] === false ? '-' : '') + experiment);
  }
  try {var _win$localStorage;
    ((_win$localStorage = win.localStorage) === null || _win$localStorage === void 0) ? (void 0) : _win$localStorage.setItem(LOCAL_STORAGE_KEY, experimentIds.join(','));
  } catch (e) {
    user().error(TAG, 'Failed to save experiments to localStorage.');
  }
}

/**
 * See getExperimentToggles().
 * @param {!Window} win
 * @return {!Object<string, boolean>}
 * @visibleForTesting
 */
export function getExperimentTogglesForTesting(win) {
  return getExperimentToggles(win);
}

/**
 * Resets the experimentsToggle cache for testing purposes.
 * @param {!Window} win
 * @visibleForTesting
 */
export function resetExperimentTogglesForTesting(win) {
  saveExperimentToggles(win, {});
  win[TOGGLES_WINDOW_PROPERTY] = null;
}

/**
 * In some browser implementations of Math.random(), sequential calls of
 * Math.random() are correlated and can cause a bias.  In particular,
 * if the previous random() call was < 0.001 (as it will be if we select
 * into an experiment), the next value could be less than 0.5 more than
 * 50.7% of the time.  This provides an implementation that roots down into
 * the crypto API, when available, to produce less biased samples.
 *
 * @return {number} Pseudo-random floating-point value on the range [0, 1).
 */
function slowButAccuratePrng() {
  // TODO(tdrl): Implement.
  return Math.random();
}

/**
 * Container for alternate random number generator implementations.  This
 * allows us to set an "accurate" PRNG for branch selection, but to mock it
 * out easily in tests.
 *
 * @visibleForTesting
 * @const {!{accuratePrng: function():number}}
 */
export var RANDOM_NUMBER_GENERATORS = {
  accuratePrng: slowButAccuratePrng };


/**
 * Selects, uniformly at random, a single item from the array.
 * @param {!Array<string>} arr Object to select from.
 * @return {?string} Single item from arr or null if arr was empty.
 */
function selectRandomItem(arr) {
  var rn = RANDOM_NUMBER_GENERATORS.accuratePrng();
  return (/** @type {string} */(arr[Math.floor(rn * arr.length)]) || null);
}

/**
 * Selects which page-level experiment branches are enabled. If a given
 * experiment name is already set (including to the null / no branches selected
 * state), this won't alter its state.
 *
 * Check whether a given experiment is set using isExperimentOn(win,
 * experimentName) and, if it is on, look for which branch is selected in
 * win.__AMP_EXPERIMENT_BRANCHES[experimentName].
 *
 * @param {!Window} win Window context on which to save experiment
 *     selection state.
 * @param {!Array<!ExperimentInfoDef>} experiments  Set of experiments to
 *     configure for this page load.
 * @return {!Object<string, string>} Map of experiment names to selected
 *     branches.
 */
export function randomlySelectUnsetExperiments(win, experiments) {
  win.__AMP_EXPERIMENT_BRANCHES = win.__AMP_EXPERIMENT_BRANCHES || {};
  var selectedExperiments = {};var _iterator4 = _createForOfIteratorHelper(
  experiments),_step4;try {for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {var _experiment$isTraffic;var experiment = _step4.value;
      var experimentName = experiment.experimentId;
      if (hasOwn(win.__AMP_EXPERIMENT_BRANCHES, experimentName)) {
        selectedExperiments[experimentName] =
        win.__AMP_EXPERIMENT_BRANCHES[experimentName];
        continue;
      }

      if (!(((_experiment$isTraffic = experiment.isTrafficEligible) !== null && _experiment$isTraffic !== void 0) && _experiment$isTraffic.call(experiment, win))) {
        win.__AMP_EXPERIMENT_BRANCHES[experimentName] = null;
        continue;
      }

      // If we're in the experiment, but we haven't already forced a specific
      // experiment branch (e.g., via a test setup), then randomize the branch
      // choice.
      if (
      !win.__AMP_EXPERIMENT_BRANCHES[experimentName] &&
      isExperimentOn(win, /*OK*/experimentName))
      {
        win.__AMP_EXPERIMENT_BRANCHES[experimentName] = selectRandomItem(
        experiment.branches);

        selectedExperiments[experimentName] =
        win.__AMP_EXPERIMENT_BRANCHES[experimentName];
      }
    }} catch (err) {_iterator4.e(err);} finally {_iterator4.f();}
  return selectedExperiments;
}

/**
 * Returns the experiment branch enabled for the given experiment ID.
 * For example, 'control' or 'experiment'.
 *
 * @param {!Window} win Window context to check for experiment state.
 * @param {string} experimentName Name of the experiment to check.
 * @return {?string} Active experiment branch ID for experimentName (possibly
 *     null if experimentName has been tested but no branch was enabled).
 */
export function getExperimentBranch(win, experimentName) {
  return win.__AMP_EXPERIMENT_BRANCHES ?
  win.__AMP_EXPERIMENT_BRANCHES[experimentName] :
  null;
}

/**
 * Returns an object containing all active experiment branches on the
 * top Window.
 *
 * @param {!Window} win Window context to check for experiment state.
 * @return {!Object} contains all experiment branches and their ids.
 */
export function getActiveExperimentBranches(win) {
  var topWin = getTopWindow(win);
  if (!topWin.__AMP_EXPERIMENT_BRANCHES) {
    topWin.__AMP_EXPERIMENT_BRANCHES = {};
  }
  return _objectSpread({}, topWin.__AMP_EXPERIMENT_BRANCHES);
}

/**
 * Force enable (or disable) a specific branch of a given experiment name.
 * Disables the experiment name altogether if branchId is falseish.
 *
 * @param {!Window} win Window context to check for experiment state.
 * @param {string} experimentName Name of the experiment to check.
 * @param {?string} branchId ID of branch to force or null to disable
 *     altogether.
 * @visibleForTesting
 */
export function forceExperimentBranch(win, experimentName, branchId) {
  win.__AMP_EXPERIMENT_BRANCHES = win.__AMP_EXPERIMENT_BRANCHES || {};
  toggleExperiment(win, experimentName, !!branchId, true);
  win.__AMP_EXPERIMENT_BRANCHES[experimentName] = branchId;
}
// /Users/mszylkowski/src/amphtml/src/experiments/index.js