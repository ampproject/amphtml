function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

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
export function isCanary(win) {
  var _win$AMP_CONFIG;

  return !!((_win$AMP_CONFIG = win.AMP_CONFIG) != null && _win$AMP_CONFIG.canary);
}

/**
 * Returns binary type, e.g., canary, production, control, or rc.
 * @param {!Window} win
 * @return {string}
 */
export function getBinaryType(win) {
  var _win$AMP_CONFIG2;

  return ((_win$AMP_CONFIG2 = win.AMP_CONFIG) == null ? void 0 : _win$AMP_CONFIG2.type) || 'unknown';
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
export function toggleExperiment(win, experimentId, opt_on, opt_transientExperiment) {
  var currentlyOn = isExperimentOn(win,
  /*OK*/
  experimentId);
  var on = opt_on != null ? opt_on : !currentlyOn;

  if (on != currentlyOn) {
    var toggles = experimentToggles(win);
    toggles[experimentId] = on;

    if (!opt_transientExperiment) {
      var storedToggles = getExperimentToggles(win);
      storedToggles[experimentId] = on;
      saveExperimentToggles(win, storedToggles);

      // Avoid affecting tests that spy/stub warn().
      if (!getMode().test) {
        user().warn(TAG, '"%s" experiment %s for the domain "%s". See: https://amp.dev/documentation/guides-and-tutorials/learn/experimental', experimentId, on ? 'enabled' : 'disabled', win.location.hostname);
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
export function experimentToggles(win) {
  var _win$AMP_CONFIG3, _win$AMP_EXP, _win$__AMP_EXP, _win$AMP_CONFIG4, _win$AMP_CONFIG5;

  if (win[TOGGLES_WINDOW_PROPERTY]) {
    return win[TOGGLES_WINDOW_PROPERTY];
  }

  win[TOGGLES_WINDOW_PROPERTY] = map();
  var toggles = win[TOGGLES_WINDOW_PROPERTY];

  // Read default and injected configs of this build.
  var buildExperimentConfigs = _extends({}, (_win$AMP_CONFIG3 = win.AMP_CONFIG) != null ? _win$AMP_CONFIG3 : {}, (_win$AMP_EXP = win.AMP_EXP) != null ? _win$AMP_EXP : parseJson(((_win$__AMP_EXP = win.__AMP_EXP) == null ? void 0 : _win$__AMP_EXP.textContent) || '{}'));

  for (var experimentId in buildExperimentConfigs) {
    var frequency = buildExperimentConfigs[experimentId];

    if (typeof frequency === 'number' && frequency >= 0 && frequency <= 1) {
      toggles[experimentId] = Math.random() < frequency;
    }
  }

  // Read document level override from meta tag.
  var allowedDocOptIn = (_win$AMP_CONFIG4 = win.AMP_CONFIG) == null ? void 0 : _win$AMP_CONFIG4['allow-doc-opt-in'];

  if (isArray(allowedDocOptIn) && allowedDocOptIn.length) {
    var meta = win.document.head.querySelector('meta[name="amp-experiments-opt-in"]');

    if (meta) {
      var optedInExperiments = meta.getAttribute('content').split(',');

      for (var _iterator = _createForOfIteratorHelperLoose(optedInExperiments), _step; !(_step = _iterator()).done;) {
        var experiment = _step.value;

        if (dev().assertArray(allowedDocOptIn).includes(experiment)) {
          toggles[experiment] = true;
        }
      }
    }
  }

  Object.assign(toggles, getExperimentToggles(win));
  var allowedUrlOptIn = (_win$AMP_CONFIG5 = win.AMP_CONFIG) == null ? void 0 : _win$AMP_CONFIG5['allow-url-opt-in'];

  if (isArray(allowedUrlOptIn) && allowedUrlOptIn.length) {
    var hash = win.location['originalHash'] || win.location.hash;
    var params = parseQueryString(hash);

    for (var _iterator2 = _createForOfIteratorHelperLoose(allowedUrlOptIn), _step2; !(_step2 = _iterator2()).done;) {
      var _experiment = _step2.value;
      var param = params["e-" + _experiment];

      if (param == '1') {
        toggles[_experiment] = true;
      }

      if (param == '0') {
        toggles[_experiment] = false;
      }
    }
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
function getExperimentToggles(win) {
  var _experimentsString;

  var experimentsString = '';

  try {
    if ('localStorage' in win) {
      experimentsString = win.localStorage.getItem(LOCAL_STORAGE_KEY);
    }
  } catch (_unused) {
    dev().warn(TAG, 'Failed to retrieve experiments from localStorage.');
  }

  var tokens = ((_experimentsString = experimentsString) == null ? void 0 : _experimentsString.split(/\s*,\s*/g)) || [];
  var toggles = map();

  for (var _iterator3 = _createForOfIteratorHelperLoose(tokens), _step3; !(_step3 = _iterator3()).done;) {
    var token = _step3.value;

    if (!token) {
      continue;
    }

    if (token[0] == '-') {
      toggles[token.substr(1)] = false;
    } else {
      toggles[token] = true;
    }
  }

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

  try {
    var _win$localStorage;

    (_win$localStorage = win.localStorage) == null ? void 0 : _win$localStorage.setItem(LOCAL_STORAGE_KEY, experimentIds.join(','));
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
  accuratePrng: slowButAccuratePrng
};

/**
 * Selects, uniformly at random, a single item from the array.
 * @param {!Array<string>} arr Object to select from.
 * @return {?string} Single item from arr or null if arr was empty.
 */
function selectRandomItem(arr) {
  var rn = RANDOM_NUMBER_GENERATORS.accuratePrng();
  return dev().assertString(arr[Math.floor(rn * arr.length)]) || null;
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
  var selectedExperiments = {};

  for (var _iterator4 = _createForOfIteratorHelperLoose(experiments), _step4; !(_step4 = _iterator4()).done;) {
    var experiment = _step4.value;
    var experimentName = experiment.experimentId;

    if (hasOwn(win.__AMP_EXPERIMENT_BRANCHES, experimentName)) {
      selectedExperiments[experimentName] = win.__AMP_EXPERIMENT_BRANCHES[experimentName];
      continue;
    }

    if (!(experiment.isTrafficEligible != null && experiment.isTrafficEligible(win))) {
      win.__AMP_EXPERIMENT_BRANCHES[experimentName] = null;
      continue;
    }

    // If we're in the experiment, but we haven't already forced a specific
    // experiment branch (e.g., via a test setup), then randomize the branch
    // choice.
    if (!win.__AMP_EXPERIMENT_BRANCHES[experimentName] && isExperimentOn(win,
    /*OK*/
    experimentName)) {
      win.__AMP_EXPERIMENT_BRANCHES[experimentName] = selectRandomItem(experiment.branches);
      selectedExperiments[experimentName] = win.__AMP_EXPERIMENT_BRANCHES[experimentName];
    }
  }

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
  return win.__AMP_EXPERIMENT_BRANCHES ? win.__AMP_EXPERIMENT_BRANCHES[experimentName] : null;
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

  return _extends({}, topWin.__AMP_EXPERIMENT_BRANCHES);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbImlzQXJyYXkiLCJoYXNPd24iLCJtYXAiLCJwYXJzZUpzb24iLCJwYXJzZVF1ZXJ5U3RyaW5nIiwiRXhwZXJpbWVudEluZm9EZWYiLCJkZXYiLCJ1c2VyIiwiZ2V0TW9kZSIsImdldFRvcFdpbmRvdyIsIlRBRyIsIkxPQ0FMX1NUT1JBR0VfS0VZIiwiVE9HR0xFU19XSU5ET1dfUFJPUEVSVFkiLCJpc0NhbmFyeSIsIndpbiIsIkFNUF9DT05GSUciLCJjYW5hcnkiLCJnZXRCaW5hcnlUeXBlIiwidHlwZSIsImlzRXhwZXJpbWVudE9uIiwiZXhwZXJpbWVudElkIiwidG9nZ2xlcyIsImV4cGVyaW1lbnRUb2dnbGVzIiwidG9nZ2xlRXhwZXJpbWVudCIsIm9wdF9vbiIsIm9wdF90cmFuc2llbnRFeHBlcmltZW50IiwiY3VycmVudGx5T24iLCJvbiIsInN0b3JlZFRvZ2dsZXMiLCJnZXRFeHBlcmltZW50VG9nZ2xlcyIsInNhdmVFeHBlcmltZW50VG9nZ2xlcyIsInRlc3QiLCJ3YXJuIiwibG9jYXRpb24iLCJob3N0bmFtZSIsImJ1aWxkRXhwZXJpbWVudENvbmZpZ3MiLCJBTVBfRVhQIiwiX19BTVBfRVhQIiwidGV4dENvbnRlbnQiLCJmcmVxdWVuY3kiLCJNYXRoIiwicmFuZG9tIiwiYWxsb3dlZERvY09wdEluIiwibGVuZ3RoIiwibWV0YSIsImRvY3VtZW50IiwiaGVhZCIsInF1ZXJ5U2VsZWN0b3IiLCJvcHRlZEluRXhwZXJpbWVudHMiLCJnZXRBdHRyaWJ1dGUiLCJzcGxpdCIsImV4cGVyaW1lbnQiLCJhc3NlcnRBcnJheSIsImluY2x1ZGVzIiwiT2JqZWN0IiwiYXNzaWduIiwiYWxsb3dlZFVybE9wdEluIiwiaGFzaCIsInBhcmFtcyIsInBhcmFtIiwiZXhwZXJpbWVudFRvZ2dsZXNPck51bGwiLCJleHBlcmltZW50c1N0cmluZyIsImxvY2FsU3RvcmFnZSIsImdldEl0ZW0iLCJ0b2tlbnMiLCJ0b2tlbiIsInN1YnN0ciIsImV4cGVyaW1lbnRJZHMiLCJwdXNoIiwic2V0SXRlbSIsImpvaW4iLCJlIiwiZXJyb3IiLCJnZXRFeHBlcmltZW50VG9nZ2xlc0ZvclRlc3RpbmciLCJyZXNldEV4cGVyaW1lbnRUb2dnbGVzRm9yVGVzdGluZyIsInNsb3dCdXRBY2N1cmF0ZVBybmciLCJSQU5ET01fTlVNQkVSX0dFTkVSQVRPUlMiLCJhY2N1cmF0ZVBybmciLCJzZWxlY3RSYW5kb21JdGVtIiwiYXJyIiwicm4iLCJhc3NlcnRTdHJpbmciLCJmbG9vciIsInJhbmRvbWx5U2VsZWN0VW5zZXRFeHBlcmltZW50cyIsImV4cGVyaW1lbnRzIiwiX19BTVBfRVhQRVJJTUVOVF9CUkFOQ0hFUyIsInNlbGVjdGVkRXhwZXJpbWVudHMiLCJleHBlcmltZW50TmFtZSIsImlzVHJhZmZpY0VsaWdpYmxlIiwiYnJhbmNoZXMiLCJnZXRFeHBlcmltZW50QnJhbmNoIiwiZ2V0QWN0aXZlRXhwZXJpbWVudEJyYW5jaGVzIiwidG9wV2luIiwiZm9yY2VFeHBlcmltZW50QnJhbmNoIiwiYnJhbmNoSWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLE9BQVI7QUFDQSxTQUFRQyxNQUFSLEVBQWdCQyxHQUFoQjtBQUNBLFNBQVFDLFNBQVI7QUFDQSxTQUFRQyxnQkFBUjtBQUVBLFNBQVFDLGlCQUFSO0FBRUEsU0FBUUMsR0FBUixFQUFhQyxJQUFiO0FBQ0EsU0FBUUMsT0FBUjtBQUNBLFNBQVFDLFlBQVI7O0FBRUE7QUFDQSxJQUFNQyxHQUFHLEdBQUcsYUFBWjs7QUFFQTtBQUNBLElBQU1DLGlCQUFpQixHQUFHLHdCQUExQjs7QUFFQTtBQUNBLElBQU1DLHVCQUF1QixHQUFHLDJCQUFoQzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FB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QUFTSSwyQkFBVCxDQUFxQzdFLEdBQXJDLEVBQTBDO0FBQy9DLE1BQU04RSxNQUFNLEdBQUduRixZQUFZLENBQUNLLEdBQUQsQ0FBM0I7O0FBQ0EsTUFBSSxDQUFDOEUsTUFBTSxDQUFDUCx5QkFBWixFQUF1QztBQUNyQ08sSUFBQUEsTUFBTSxDQUFDUCx5QkFBUCxHQUFtQyxFQUFuQztBQUNEOztBQUNELHNCQUFXTyxNQUFNLENBQUNQLHlCQUFsQjtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTUSxxQkFBVCxDQUErQi9FLEdBQS9CLEVBQW9DeUUsY0FBcEMsRUFBb0RPLFFBQXBELEVBQThEO0FBQ25FaEYsRUFBQUEsR0FBRyxDQUFDdUUseUJBQUosR0FBZ0N2RSxHQUFHLENBQUN1RSx5QkFBSixJQUFpQyxFQUFqRTtBQUNBOUQsRUFBQUEsZ0JBQWdCLENBQUNULEdBQUQsRUFBTXlFLGNBQU4sRUFBc0IsQ0FBQyxDQUFDTyxRQUF4QixFQUFrQyxJQUFsQyxDQUFoQjtBQUNBaEYsRUFBQUEsR0FBRyxDQUFDdUUseUJBQUosQ0FBOEJFLGNBQTlCLElBQWdETyxRQUFoRDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBFeHBlcmltZW50cyBzeXN0ZW0gYWxsb3dzIGEgZGV2ZWxvcGVyIHRvIG9wdC1pbiB0byB0ZXN0XG4gKiBmZWF0dXJlcyB0aGF0IGFyZSBub3QgeWV0IGZ1bGx5IHRlc3RlZC5cbiAqXG4gKiBFeHBlcmltZW50cyBwYWdlOiBodHRwczovL2Nkbi5hbXBwcm9qZWN0Lm9yZy9leHBlcmltZW50cy5odG1sICpcbiAqL1xuXG5pbXBvcnQge2lzQXJyYXl9IGZyb20gJyNjb3JlL3R5cGVzJztcbmltcG9ydCB7aGFzT3duLCBtYXB9IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5pbXBvcnQge3BhcnNlSnNvbn0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0L2pzb24nO1xuaW1wb3J0IHtwYXJzZVF1ZXJ5U3RyaW5nfSBmcm9tICcjY29yZS90eXBlcy9zdHJpbmcvdXJsJztcblxuaW1wb3J0IHtFeHBlcmltZW50SW5mb0RlZn0gZnJvbSAnLi9leHBlcmltZW50cy50eXBlJztcblxuaW1wb3J0IHtkZXYsIHVzZXJ9IGZyb20gJy4uL2xvZyc7XG5pbXBvcnQge2dldE1vZGV9IGZyb20gJy4uL21vZGUnO1xuaW1wb3J0IHtnZXRUb3BXaW5kb3d9IGZyb20gJy4uL3NlcnZpY2UtaGVscGVycyc7XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IFRBRyA9ICdFWFBFUklNRU5UUyc7XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IExPQ0FMX1NUT1JBR0VfS0VZID0gJ2FtcC1leHBlcmltZW50LXRvZ2dsZXMnO1xuXG4vKiogQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBUT0dHTEVTX1dJTkRPV19QUk9QRVJUWSA9ICdfX0FNUF9fRVhQRVJJTUVOVF9UT0dHTEVTJztcblxuLyoqXG4gKiBXaGV0aGVyIHdlIGFyZSBpbiBjYW5hcnkuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ2FuYXJ5KHdpbikge1xuICByZXR1cm4gISF3aW4uQU1QX0NPTkZJRz8uY2FuYXJ5O1xufVxuXG4vKipcbiAqIFJldHVybnMgYmluYXJ5IHR5cGUsIGUuZy4sIGNhbmFyeSwgcHJvZHVjdGlvbiwgY29udHJvbCwgb3IgcmMuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QmluYXJ5VHlwZSh3aW4pIHtcbiAgcmV0dXJuIHdpbi5BTVBfQ09ORklHPy50eXBlIHx8ICd1bmtub3duJztcbn1cblxuLyoqXG4gKiBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgZXhwZXJpbWVudCBpcyBvbiBvciBvZmYuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHBhcmFtIHtzdHJpbmd9IGV4cGVyaW1lbnRJZFxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRXhwZXJpbWVudE9uKHdpbiwgZXhwZXJpbWVudElkKSB7XG4gIGNvbnN0IHRvZ2dsZXMgPSBleHBlcmltZW50VG9nZ2xlcyh3aW4pO1xuICByZXR1cm4gISF0b2dnbGVzW2V4cGVyaW1lbnRJZF07XG59XG5cbi8qKlxuICogVG9nZ2xlcyB0aGUgZXhwZXJpbWVudCBvbiBvciBvZmYuIFJldHVybnMgdGhlIGFjdHVhbCB2YWx1ZSBvZiB0aGUgZXhwZXJpbWVudFxuICogYWZ0ZXIgdG9nZ2xpbmcgaXMgZG9uZS5cbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcGFyYW0ge3N0cmluZ30gZXhwZXJpbWVudElkXG4gKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfb25cbiAqIEBwYXJhbSB7Ym9vbGVhbj19IG9wdF90cmFuc2llbnRFeHBlcmltZW50ICBXaGV0aGVyIHRvIHRvZ2dsZSB0aGVcbiAqICAgICBleHBlcmltZW50IHN0YXRlIFwidHJhbnNpZW50bHlcIiAoaS5lLiwgZm9yIHRoaXMgcGFnZSBsb2FkIG9ubHkpIG9yXG4gKiAgICAgZHVyYWJseSAoYnkgc2F2aW5nIHRoZSBleHBlcmltZW50IElEcyBhZnRlciB0b2dnbGluZykuXG4gKiAgICAgRGVmYXVsdDogZmFsc2UgKHNhdmUgZHVyYWJseSkuXG4gKiBAcmV0dXJuIHtib29sZWFufSBOZXcgc3RhdGUgZm9yIGV4cGVyaW1lbnRJZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZUV4cGVyaW1lbnQoXG4gIHdpbixcbiAgZXhwZXJpbWVudElkLFxuICBvcHRfb24sXG4gIG9wdF90cmFuc2llbnRFeHBlcmltZW50XG4pIHtcbiAgY29uc3QgY3VycmVudGx5T24gPSBpc0V4cGVyaW1lbnRPbih3aW4sIC8qT0sqLyBleHBlcmltZW50SWQpO1xuICBjb25zdCBvbiA9IG9wdF9vbiA/PyAhY3VycmVudGx5T247XG4gIGlmIChvbiAhPSBjdXJyZW50bHlPbikge1xuICAgIGNvbnN0IHRvZ2dsZXMgPSBleHBlcmltZW50VG9nZ2xlcyh3aW4pO1xuICAgIHRvZ2dsZXNbZXhwZXJpbWVudElkXSA9IG9uO1xuXG4gICAgaWYgKCFvcHRfdHJhbnNpZW50RXhwZXJpbWVudCkge1xuICAgICAgY29uc3Qgc3RvcmVkVG9nZ2xlcyA9IGdldEV4cGVyaW1lbnRUb2dnbGVzKHdpbik7XG4gICAgICBzdG9yZWRUb2dnbGVzW2V4cGVyaW1lbnRJZF0gPSBvbjtcbiAgICAgIHNhdmVFeHBlcmltZW50VG9nZ2xlcyh3aW4sIHN0b3JlZFRvZ2dsZXMpO1xuICAgICAgLy8gQXZvaWQgYWZmZWN0aW5nIHRlc3RzIHRoYXQgc3B5L3N0dWIgd2FybigpLlxuICAgICAgaWYgKCFnZXRNb2RlKCkudGVzdCkge1xuICAgICAgICB1c2VyKCkud2FybihcbiAgICAgICAgICBUQUcsXG4gICAgICAgICAgJ1wiJXNcIiBleHBlcmltZW50ICVzIGZvciB0aGUgZG9tYWluIFwiJXNcIi4gU2VlOiBodHRwczovL2FtcC5kZXYvZG9jdW1lbnRhdGlvbi9ndWlkZXMtYW5kLXR1dG9yaWFscy9sZWFybi9leHBlcmltZW50YWwnLFxuICAgICAgICAgIGV4cGVyaW1lbnRJZCxcbiAgICAgICAgICBvbiA/ICdlbmFibGVkJyA6ICdkaXNhYmxlZCcsXG4gICAgICAgICAgd2luLmxvY2F0aW9uLmhvc3RuYW1lXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBvbjtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGUgd2hldGhlciB0aGUgZXhwZXJpbWVudCBpcyBvbiBvciBvZmYgYmFzZWQgb2ZmIG9mIGl0cyBkZWZhdWx0IHZhbHVlLFxuICogc3RvcmVkIG92ZXJyaWRlbiB2YWx1ZSwgb3IgdGhlIGdsb2JhbCBjb25maWcgZnJlcXVlbmN5IGdpdmVuLlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEByZXR1cm4geyFPYmplY3Q8c3RyaW5nLCBib29sZWFuPn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4cGVyaW1lbnRUb2dnbGVzKHdpbikge1xuICBpZiAod2luW1RPR0dMRVNfV0lORE9XX1BST1BFUlRZXSkge1xuICAgIHJldHVybiB3aW5bVE9HR0xFU19XSU5ET1dfUFJPUEVSVFldO1xuICB9XG4gIHdpbltUT0dHTEVTX1dJTkRPV19QUk9QRVJUWV0gPSBtYXAoKTtcbiAgY29uc3QgdG9nZ2xlcyA9IHdpbltUT0dHTEVTX1dJTkRPV19QUk9QRVJUWV07XG5cbiAgLy8gUmVhZCBkZWZhdWx0IGFuZCBpbmplY3RlZCBjb25maWdzIG9mIHRoaXMgYnVpbGQuXG4gIGNvbnN0IGJ1aWxkRXhwZXJpbWVudENvbmZpZ3MgPSB7XG4gICAgLi4uKHdpbi5BTVBfQ09ORklHID8/IHt9KSxcbiAgICAuLi4od2luLkFNUF9FWFAgPz8gcGFyc2VKc29uKHdpbi5fX0FNUF9FWFA/LnRleHRDb250ZW50IHx8ICd7fScpKSxcbiAgfTtcbiAgZm9yIChjb25zdCBleHBlcmltZW50SWQgaW4gYnVpbGRFeHBlcmltZW50Q29uZmlncykge1xuICAgIGNvbnN0IGZyZXF1ZW5jeSA9IGJ1aWxkRXhwZXJpbWVudENvbmZpZ3NbZXhwZXJpbWVudElkXTtcbiAgICBpZiAodHlwZW9mIGZyZXF1ZW5jeSA9PT0gJ251bWJlcicgJiYgZnJlcXVlbmN5ID49IDAgJiYgZnJlcXVlbmN5IDw9IDEpIHtcbiAgICAgIHRvZ2dsZXNbZXhwZXJpbWVudElkXSA9IE1hdGgucmFuZG9tKCkgPCBmcmVxdWVuY3k7XG4gICAgfVxuICB9XG4gIC8vIFJlYWQgZG9jdW1lbnQgbGV2ZWwgb3ZlcnJpZGUgZnJvbSBtZXRhIHRhZy5cbiAgY29uc3QgYWxsb3dlZERvY09wdEluID0gd2luLkFNUF9DT05GSUc/LlsnYWxsb3ctZG9jLW9wdC1pbiddO1xuICBpZiAoaXNBcnJheShhbGxvd2VkRG9jT3B0SW4pICYmIGFsbG93ZWREb2NPcHRJbi5sZW5ndGgpIHtcbiAgICBjb25zdCBtZXRhID0gd2luLmRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3RvcihcbiAgICAgICdtZXRhW25hbWU9XCJhbXAtZXhwZXJpbWVudHMtb3B0LWluXCJdJ1xuICAgICk7XG4gICAgaWYgKG1ldGEpIHtcbiAgICAgIGNvbnN0IG9wdGVkSW5FeHBlcmltZW50cyA9IG1ldGEuZ2V0QXR0cmlidXRlKCdjb250ZW50Jykuc3BsaXQoJywnKTtcbiAgICAgIGZvciAoY29uc3QgZXhwZXJpbWVudCBvZiBvcHRlZEluRXhwZXJpbWVudHMpIHtcbiAgICAgICAgaWYgKGRldigpLmFzc2VydEFycmF5KGFsbG93ZWREb2NPcHRJbikuaW5jbHVkZXMoZXhwZXJpbWVudCkpIHtcbiAgICAgICAgICB0b2dnbGVzW2V4cGVyaW1lbnRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIE9iamVjdC5hc3NpZ24odG9nZ2xlcywgZ2V0RXhwZXJpbWVudFRvZ2dsZXMod2luKSk7XG5cbiAgY29uc3QgYWxsb3dlZFVybE9wdEluID0gd2luLkFNUF9DT05GSUc/LlsnYWxsb3ctdXJsLW9wdC1pbiddO1xuICBpZiAoaXNBcnJheShhbGxvd2VkVXJsT3B0SW4pICYmIGFsbG93ZWRVcmxPcHRJbi5sZW5ndGgpIHtcbiAgICBjb25zdCBoYXNoID0gd2luLmxvY2F0aW9uWydvcmlnaW5hbEhhc2gnXSB8fCB3aW4ubG9jYXRpb24uaGFzaDtcbiAgICBjb25zdCBwYXJhbXMgPSBwYXJzZVF1ZXJ5U3RyaW5nKGhhc2gpO1xuICAgIGZvciAoY29uc3QgZXhwZXJpbWVudCBvZiBhbGxvd2VkVXJsT3B0SW4pIHtcbiAgICAgIGNvbnN0IHBhcmFtID0gcGFyYW1zW2BlLSR7ZXhwZXJpbWVudH1gXTtcbiAgICAgIGlmIChwYXJhbSA9PSAnMScpIHtcbiAgICAgICAgdG9nZ2xlc1tleHBlcmltZW50XSA9IHRydWU7XG4gICAgICB9XG4gICAgICBpZiAocGFyYW0gPT0gJzAnKSB7XG4gICAgICAgIHRvZ2dsZXNbZXhwZXJpbWVudF0gPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRvZ2dsZXM7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY2FjaGVkIGV4cGVyaW1lbnRzIHRvZ2dsZXMsIG9yIG51bGwgaWYgdGhleSBoYXZlIG5vdCBiZWVuXG4gKiBjb21wdXRlZCB5ZXQuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHJldHVybiB7P09iamVjdDxzdHJpbmcsIGJvb2xlYW4+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXhwZXJpbWVudFRvZ2dsZXNPck51bGwod2luKSB7XG4gIHJldHVybiB3aW5bVE9HR0xFU19XSU5ET1dfUFJPUEVSVFldIHx8IG51bGw7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHNldCBvZiBleHBlcmltZW50IElEcyBjdXJyZW50bHkgb24uXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHJldHVybiB7IU9iamVjdDxzdHJpbmcsIGJvb2xlYW4+fVxuICovXG5mdW5jdGlvbiBnZXRFeHBlcmltZW50VG9nZ2xlcyh3aW4pIHtcbiAgbGV0IGV4cGVyaW1lbnRzU3RyaW5nID0gJyc7XG4gIHRyeSB7XG4gICAgaWYgKCdsb2NhbFN0b3JhZ2UnIGluIHdpbikge1xuICAgICAgZXhwZXJpbWVudHNTdHJpbmcgPSB3aW4ubG9jYWxTdG9yYWdlLmdldEl0ZW0oTE9DQUxfU1RPUkFHRV9LRVkpO1xuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgZGV2KCkud2FybihUQUcsICdGYWlsZWQgdG8gcmV0cmlldmUgZXhwZXJpbWVudHMgZnJvbSBsb2NhbFN0b3JhZ2UuJyk7XG4gIH1cbiAgY29uc3QgdG9rZW5zID0gZXhwZXJpbWVudHNTdHJpbmc/LnNwbGl0KC9cXHMqLFxccyovZykgfHwgW107XG5cbiAgY29uc3QgdG9nZ2xlcyA9IG1hcCgpO1xuICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuICAgIGlmICghdG9rZW4pIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAodG9rZW5bMF0gPT0gJy0nKSB7XG4gICAgICB0b2dnbGVzW3Rva2VuLnN1YnN0cigxKV0gPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdG9nZ2xlc1t0b2tlbl0gPSB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdG9nZ2xlcztcbn1cblxuLyoqXG4gKiBTYXZlcyBhIHNldCBvZiBleHBlcmltZW50IElEcyBjdXJyZW50bHkgb24uXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHBhcmFtIHshT2JqZWN0PHN0cmluZywgYm9vbGVhbj59IHRvZ2dsZXNcbiAqL1xuZnVuY3Rpb24gc2F2ZUV4cGVyaW1lbnRUb2dnbGVzKHdpbiwgdG9nZ2xlcykge1xuICBjb25zdCBleHBlcmltZW50SWRzID0gW107XG4gIGZvciAoY29uc3QgZXhwZXJpbWVudCBpbiB0b2dnbGVzKSB7XG4gICAgZXhwZXJpbWVudElkcy5wdXNoKCh0b2dnbGVzW2V4cGVyaW1lbnRdID09PSBmYWxzZSA/ICctJyA6ICcnKSArIGV4cGVyaW1lbnQpO1xuICB9XG4gIHRyeSB7XG4gICAgd2luLmxvY2FsU3RvcmFnZT8uc2V0SXRlbShMT0NBTF9TVE9SQUdFX0tFWSwgZXhwZXJpbWVudElkcy5qb2luKCcsJykpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdXNlcigpLmVycm9yKFRBRywgJ0ZhaWxlZCB0byBzYXZlIGV4cGVyaW1lbnRzIHRvIGxvY2FsU3RvcmFnZS4nKTtcbiAgfVxufVxuXG4vKipcbiAqIFNlZSBnZXRFeHBlcmltZW50VG9nZ2xlcygpLlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEByZXR1cm4geyFPYmplY3Q8c3RyaW5nLCBib29sZWFuPn1cbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RXhwZXJpbWVudFRvZ2dsZXNGb3JUZXN0aW5nKHdpbikge1xuICByZXR1cm4gZ2V0RXhwZXJpbWVudFRvZ2dsZXMod2luKTtcbn1cblxuLyoqXG4gKiBSZXNldHMgdGhlIGV4cGVyaW1lbnRzVG9nZ2xlIGNhY2hlIGZvciB0ZXN0aW5nIHB1cnBvc2VzLlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRFeHBlcmltZW50VG9nZ2xlc0ZvclRlc3Rpbmcod2luKSB7XG4gIHNhdmVFeHBlcmltZW50VG9nZ2xlcyh3aW4sIHt9KTtcbiAgd2luW1RPR0dMRVNfV0lORE9XX1BST1BFUlRZXSA9IG51bGw7XG59XG5cbi8qKlxuICogSW4gc29tZSBicm93c2VyIGltcGxlbWVudGF0aW9ucyBvZiBNYXRoLnJhbmRvbSgpLCBzZXF1ZW50aWFsIGNhbGxzIG9mXG4gKiBNYXRoLnJhbmRvbSgpIGFyZSBjb3JyZWxhdGVkIGFuZCBjYW4gY2F1c2UgYSBiaWFzLiAgSW4gcGFydGljdWxhcixcbiAqIGlmIHRoZSBwcmV2aW91cyByYW5kb20oKSBjYWxsIHdhcyA8IDAuMDAxIChhcyBpdCB3aWxsIGJlIGlmIHdlIHNlbGVjdFxuICogaW50byBhbiBleHBlcmltZW50KSwgdGhlIG5leHQgdmFsdWUgY291bGQgYmUgbGVzcyB0aGFuIDAuNSBtb3JlIHRoYW5cbiAqIDUwLjclIG9mIHRoZSB0aW1lLiAgVGhpcyBwcm92aWRlcyBhbiBpbXBsZW1lbnRhdGlvbiB0aGF0IHJvb3RzIGRvd24gaW50b1xuICogdGhlIGNyeXB0byBBUEksIHdoZW4gYXZhaWxhYmxlLCB0byBwcm9kdWNlIGxlc3MgYmlhc2VkIHNhbXBsZXMuXG4gKlxuICogQHJldHVybiB7bnVtYmVyfSBQc2V1ZG8tcmFuZG9tIGZsb2F0aW5nLXBvaW50IHZhbHVlIG9uIHRoZSByYW5nZSBbMCwgMSkuXG4gKi9cbmZ1bmN0aW9uIHNsb3dCdXRBY2N1cmF0ZVBybmcoKSB7XG4gIC8vIFRPRE8odGRybCk6IEltcGxlbWVudC5cbiAgcmV0dXJuIE1hdGgucmFuZG9tKCk7XG59XG5cbi8qKlxuICogQ29udGFpbmVyIGZvciBhbHRlcm5hdGUgcmFuZG9tIG51bWJlciBnZW5lcmF0b3IgaW1wbGVtZW50YXRpb25zLiAgVGhpc1xuICogYWxsb3dzIHVzIHRvIHNldCBhbiBcImFjY3VyYXRlXCIgUFJORyBmb3IgYnJhbmNoIHNlbGVjdGlvbiwgYnV0IHRvIG1vY2sgaXRcbiAqIG91dCBlYXNpbHkgaW4gdGVzdHMuXG4gKlxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKiBAY29uc3QgeyF7YWNjdXJhdGVQcm5nOiBmdW5jdGlvbigpOm51bWJlcn19XG4gKi9cbmV4cG9ydCBjb25zdCBSQU5ET01fTlVNQkVSX0dFTkVSQVRPUlMgPSB7XG4gIGFjY3VyYXRlUHJuZzogc2xvd0J1dEFjY3VyYXRlUHJuZyxcbn07XG5cbi8qKlxuICogU2VsZWN0cywgdW5pZm9ybWx5IGF0IHJhbmRvbSwgYSBzaW5nbGUgaXRlbSBmcm9tIHRoZSBhcnJheS5cbiAqIEBwYXJhbSB7IUFycmF5PHN0cmluZz59IGFyciBPYmplY3QgdG8gc2VsZWN0IGZyb20uXG4gKiBAcmV0dXJuIHs/c3RyaW5nfSBTaW5nbGUgaXRlbSBmcm9tIGFyciBvciBudWxsIGlmIGFyciB3YXMgZW1wdHkuXG4gKi9cbmZ1bmN0aW9uIHNlbGVjdFJhbmRvbUl0ZW0oYXJyKSB7XG4gIGNvbnN0IHJuID0gUkFORE9NX05VTUJFUl9HRU5FUkFUT1JTLmFjY3VyYXRlUHJuZygpO1xuICByZXR1cm4gZGV2KCkuYXNzZXJ0U3RyaW5nKGFycltNYXRoLmZsb29yKHJuICogYXJyLmxlbmd0aCldKSB8fCBudWxsO1xufVxuXG4vKipcbiAqIFNlbGVjdHMgd2hpY2ggcGFnZS1sZXZlbCBleHBlcmltZW50IGJyYW5jaGVzIGFyZSBlbmFibGVkLiBJZiBhIGdpdmVuXG4gKiBleHBlcmltZW50IG5hbWUgaXMgYWxyZWFkeSBzZXQgKGluY2x1ZGluZyB0byB0aGUgbnVsbCAvIG5vIGJyYW5jaGVzIHNlbGVjdGVkXG4gKiBzdGF0ZSksIHRoaXMgd29uJ3QgYWx0ZXIgaXRzIHN0YXRlLlxuICpcbiAqIENoZWNrIHdoZXRoZXIgYSBnaXZlbiBleHBlcmltZW50IGlzIHNldCB1c2luZyBpc0V4cGVyaW1lbnRPbih3aW4sXG4gKiBleHBlcmltZW50TmFtZSkgYW5kLCBpZiBpdCBpcyBvbiwgbG9vayBmb3Igd2hpY2ggYnJhbmNoIGlzIHNlbGVjdGVkIGluXG4gKiB3aW4uX19BTVBfRVhQRVJJTUVOVF9CUkFOQ0hFU1tleHBlcmltZW50TmFtZV0uXG4gKlxuICogQHBhcmFtIHshV2luZG93fSB3aW4gV2luZG93IGNvbnRleHQgb24gd2hpY2ggdG8gc2F2ZSBleHBlcmltZW50XG4gKiAgICAgc2VsZWN0aW9uIHN0YXRlLlxuICogQHBhcmFtIHshQXJyYXk8IUV4cGVyaW1lbnRJbmZvRGVmPn0gZXhwZXJpbWVudHMgIFNldCBvZiBleHBlcmltZW50cyB0b1xuICogICAgIGNvbmZpZ3VyZSBmb3IgdGhpcyBwYWdlIGxvYWQuXG4gKiBAcmV0dXJuIHshT2JqZWN0PHN0cmluZywgc3RyaW5nPn0gTWFwIG9mIGV4cGVyaW1lbnQgbmFtZXMgdG8gc2VsZWN0ZWRcbiAqICAgICBicmFuY2hlcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbWx5U2VsZWN0VW5zZXRFeHBlcmltZW50cyh3aW4sIGV4cGVyaW1lbnRzKSB7XG4gIHdpbi5fX0FNUF9FWFBFUklNRU5UX0JSQU5DSEVTID0gd2luLl9fQU1QX0VYUEVSSU1FTlRfQlJBTkNIRVMgfHwge307XG4gIGNvbnN0IHNlbGVjdGVkRXhwZXJpbWVudHMgPSB7fTtcbiAgZm9yIChjb25zdCBleHBlcmltZW50IG9mIGV4cGVyaW1lbnRzKSB7XG4gICAgY29uc3QgZXhwZXJpbWVudE5hbWUgPSBleHBlcmltZW50LmV4cGVyaW1lbnRJZDtcbiAgICBpZiAoaGFzT3duKHdpbi5fX0FNUF9FWFBFUklNRU5UX0JSQU5DSEVTLCBleHBlcmltZW50TmFtZSkpIHtcbiAgICAgIHNlbGVjdGVkRXhwZXJpbWVudHNbZXhwZXJpbWVudE5hbWVdID1cbiAgICAgICAgd2luLl9fQU1QX0VYUEVSSU1FTlRfQlJBTkNIRVNbZXhwZXJpbWVudE5hbWVdO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKCFleHBlcmltZW50LmlzVHJhZmZpY0VsaWdpYmxlPy4od2luKSkge1xuICAgICAgd2luLl9fQU1QX0VYUEVSSU1FTlRfQlJBTkNIRVNbZXhwZXJpbWVudE5hbWVdID0gbnVsbDtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIElmIHdlJ3JlIGluIHRoZSBleHBlcmltZW50LCBidXQgd2UgaGF2ZW4ndCBhbHJlYWR5IGZvcmNlZCBhIHNwZWNpZmljXG4gICAgLy8gZXhwZXJpbWVudCBicmFuY2ggKGUuZy4sIHZpYSBhIHRlc3Qgc2V0dXApLCB0aGVuIHJhbmRvbWl6ZSB0aGUgYnJhbmNoXG4gICAgLy8gY2hvaWNlLlxuICAgIGlmIChcbiAgICAgICF3aW4uX19BTVBfRVhQRVJJTUVOVF9CUkFOQ0hFU1tleHBlcmltZW50TmFtZV0gJiZcbiAgICAgIGlzRXhwZXJpbWVudE9uKHdpbiwgLypPSyovIGV4cGVyaW1lbnROYW1lKVxuICAgICkge1xuICAgICAgd2luLl9fQU1QX0VYUEVSSU1FTlRfQlJBTkNIRVNbZXhwZXJpbWVudE5hbWVdID0gc2VsZWN0UmFuZG9tSXRlbShcbiAgICAgICAgZXhwZXJpbWVudC5icmFuY2hlc1xuICAgICAgKTtcbiAgICAgIHNlbGVjdGVkRXhwZXJpbWVudHNbZXhwZXJpbWVudE5hbWVdID1cbiAgICAgICAgd2luLl9fQU1QX0VYUEVSSU1FTlRfQlJBTkNIRVNbZXhwZXJpbWVudE5hbWVdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc2VsZWN0ZWRFeHBlcmltZW50cztcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBleHBlcmltZW50IGJyYW5jaCBlbmFibGVkIGZvciB0aGUgZ2l2ZW4gZXhwZXJpbWVudCBJRC5cbiAqIEZvciBleGFtcGxlLCAnY29udHJvbCcgb3IgJ2V4cGVyaW1lbnQnLlxuICpcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luIFdpbmRvdyBjb250ZXh0IHRvIGNoZWNrIGZvciBleHBlcmltZW50IHN0YXRlLlxuICogQHBhcmFtIHtzdHJpbmd9IGV4cGVyaW1lbnROYW1lIE5hbWUgb2YgdGhlIGV4cGVyaW1lbnQgdG8gY2hlY2suXG4gKiBAcmV0dXJuIHs/c3RyaW5nfSBBY3RpdmUgZXhwZXJpbWVudCBicmFuY2ggSUQgZm9yIGV4cGVyaW1lbnROYW1lIChwb3NzaWJseVxuICogICAgIG51bGwgaWYgZXhwZXJpbWVudE5hbWUgaGFzIGJlZW4gdGVzdGVkIGJ1dCBubyBicmFuY2ggd2FzIGVuYWJsZWQpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RXhwZXJpbWVudEJyYW5jaCh3aW4sIGV4cGVyaW1lbnROYW1lKSB7XG4gIHJldHVybiB3aW4uX19BTVBfRVhQRVJJTUVOVF9CUkFOQ0hFU1xuICAgID8gd2luLl9fQU1QX0VYUEVSSU1FTlRfQlJBTkNIRVNbZXhwZXJpbWVudE5hbWVdXG4gICAgOiBudWxsO1xufVxuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgYWxsIGFjdGl2ZSBleHBlcmltZW50IGJyYW5jaGVzIG9uIHRoZVxuICogdG9wIFdpbmRvdy5cbiAqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpbiBXaW5kb3cgY29udGV4dCB0byBjaGVjayBmb3IgZXhwZXJpbWVudCBzdGF0ZS5cbiAqIEByZXR1cm4geyFPYmplY3R9IGNvbnRhaW5zIGFsbCBleHBlcmltZW50IGJyYW5jaGVzIGFuZCB0aGVpciBpZHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBY3RpdmVFeHBlcmltZW50QnJhbmNoZXMod2luKSB7XG4gIGNvbnN0IHRvcFdpbiA9IGdldFRvcFdpbmRvdyh3aW4pO1xuICBpZiAoIXRvcFdpbi5fX0FNUF9FWFBFUklNRU5UX0JSQU5DSEVTKSB7XG4gICAgdG9wV2luLl9fQU1QX0VYUEVSSU1FTlRfQlJBTkNIRVMgPSB7fTtcbiAgfVxuICByZXR1cm4gey4uLnRvcFdpbi5fX0FNUF9FWFBFUklNRU5UX0JSQU5DSEVTfTtcbn1cblxuLyoqXG4gKiBGb3JjZSBlbmFibGUgKG9yIGRpc2FibGUpIGEgc3BlY2lmaWMgYnJhbmNoIG9mIGEgZ2l2ZW4gZXhwZXJpbWVudCBuYW1lLlxuICogRGlzYWJsZXMgdGhlIGV4cGVyaW1lbnQgbmFtZSBhbHRvZ2V0aGVyIGlmIGJyYW5jaElkIGlzIGZhbHNlaXNoLlxuICpcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luIFdpbmRvdyBjb250ZXh0IHRvIGNoZWNrIGZvciBleHBlcmltZW50IHN0YXRlLlxuICogQHBhcmFtIHtzdHJpbmd9IGV4cGVyaW1lbnROYW1lIE5hbWUgb2YgdGhlIGV4cGVyaW1lbnQgdG8gY2hlY2suXG4gKiBAcGFyYW0gez9zdHJpbmd9IGJyYW5jaElkIElEIG9mIGJyYW5jaCB0byBmb3JjZSBvciBudWxsIHRvIGRpc2FibGVcbiAqICAgICBhbHRvZ2V0aGVyLlxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JjZUV4cGVyaW1lbnRCcmFuY2god2luLCBleHBlcmltZW50TmFtZSwgYnJhbmNoSWQpIHtcbiAgd2luLl9fQU1QX0VYUEVSSU1FTlRfQlJBTkNIRVMgPSB3aW4uX19BTVBfRVhQRVJJTUVOVF9CUkFOQ0hFUyB8fCB7fTtcbiAgdG9nZ2xlRXhwZXJpbWVudCh3aW4sIGV4cGVyaW1lbnROYW1lLCAhIWJyYW5jaElkLCB0cnVlKTtcbiAgd2luLl9fQU1QX0VYUEVSSU1FTlRfQlJBTkNIRVNbZXhwZXJpbWVudE5hbWVdID0gYnJhbmNoSWQ7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/experiments/index.js