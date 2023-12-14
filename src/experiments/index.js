/**
 * @fileoverview Experiments system allows a developer to opt-in to test
 * features that are not yet fully tested.
 *
 * Experiments page: https://cdn.ampproject.org/experiments.html
 */

import {devAssert} from '#core/assert';
import {isArray} from '#core/types';
import {hasOwn, map} from '#core/types/object';
import {parseJson} from '#core/types/object/json';
import {parseQueryString} from '#core/types/string/url';

import {dev, user} from '#utils/log';

import {getMode} from '../mode';
import {getTopWindow} from '../service-helpers';

/** @typedef {import('./types.d').ExperimentBranchMap} ExperimentBranchMap */
/** @typedef {{[key: string]: boolean}} ExperimentTogglesMap */

/**
 * @const
 * @type {string}
 */
const TAG = 'EXPERIMENTS';

/**
 * @const
 * @type {string}
 */
const LOCAL_STORAGE_KEY = 'amp-experiment-toggles';

const TOGGLES_WINDOW_PROPERTY = '__AMP__EXPERIMENT_TOGGLES';

/**
 * Whether we are in canary.
 * @param {Window} win
 * @return {boolean}
 */
export function isCanary(win) {
  return !!win.AMP_CONFIG?.canary;
}

/**
 * Returns binary type, e.g., canary, production, control, or rc.
 * @param {Window} win
 * @return {string}
 */
export function getBinaryType(win) {
  return win.AMP_CONFIG?.type || 'unknown';
}

/**
 * Whether the specified experiment is on or off.
 * @param {Window} win
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
 * @param {Window} win
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
  opt_transientExperiment
) {
  const currentlyOn = isExperimentOn(win, /*OK*/ experimentId);
  const on = opt_on ?? !currentlyOn;
  if (on != currentlyOn) {
    const toggles = experimentToggles(win);
    toggles[experimentId] = on;

    if (!opt_transientExperiment) {
      const storedToggles = getExperimentToggles(win);
      storedToggles[experimentId] = on;
      saveExperimentToggles(win, storedToggles);
      // Avoid affecting tests that spy/stub warn().
      if (!getMode().test) {
        user().warn(
          TAG,
          '"%s" experiment %s for the domain "%s". See: https://amp.dev/documentation/guides-and-tutorials/learn/experimental',
          experimentId,
          on ? 'enabled' : 'disabled',
          win.location.hostname
        );
      }
    }
  }
  return on;
}

/**
 * Calculate whether the experiment is on or off based off of its default value,
 * stored overriden value, or the global config frequency given.
 * @param {Window} win
 * @return {ExperimentTogglesMap}
 */
export function experimentToggles(win) {
  if (win[TOGGLES_WINDOW_PROPERTY]) {
    return /** @type {ExperimentTogglesMap} */ (win[TOGGLES_WINDOW_PROPERTY]);
  }
  win[TOGGLES_WINDOW_PROPERTY] = /** @type {ExperimentTogglesMap} */ (map());
  const toggles = win[TOGGLES_WINDOW_PROPERTY];
  devAssert(toggles);

  // Read default and injected configs of this build.
  const buildExperimentConfigs = {
    ...(win.AMP_CONFIG ?? {}),
    ...(win.AMP_EXP ?? parseJson(win.__AMP_EXP?.textContent || '{}')),
  };
  for (const experimentId in buildExperimentConfigs) {
    const frequency = buildExperimentConfigs[experimentId];
    if (typeof frequency === 'number' && frequency >= 0 && frequency <= 1) {
      toggles[experimentId] = Math.random() < frequency;
    }
  }
  // Read document level override from meta tag.
  const allowedDocOptIn = win.AMP_CONFIG?.['allow-doc-opt-in'];
  if (isArray(allowedDocOptIn) && allowedDocOptIn.length) {
    const meta = win.document.head.querySelector(
      'meta[name="amp-experiments-opt-in"]'
    );
    if (meta) {
      const optedInExperiments = meta.getAttribute('content')?.split(',') || [];
      for (const experiment of optedInExperiments) {
        if (allowedDocOptIn.includes(experiment)) {
          toggles[experiment] = true;
        }
      }
    }
  }

  Object.assign(toggles, getExperimentToggles(win));

  const allowedUrlOptIn = win.AMP_CONFIG?.['allow-url-opt-in'];
  if (isArray(allowedUrlOptIn) && allowedUrlOptIn.length) {
    const hash = win.location['originalHash'] || win.location.hash;
    const params = parseQueryString(hash);
    for (const experiment of allowedUrlOptIn) {
      const param = params[`e-${experiment}`];
      if (param == '1') {
        toggles[experiment] = true;
      }
      if (param == '0') {
        toggles[experiment] = false;
      }
    }
  }
  return toggles;
}

/**
 * Returns the cached experiments toggles, or null if they have not been
 * computed yet.
 * @param {Window} win
 * @return {?ExperimentTogglesMap}
 */
export function experimentTogglesOrNull(win) {
  return win[TOGGLES_WINDOW_PROPERTY] || null;
}

/**
 * Returns a set of experiment IDs currently on.
 * @param {Window} win
 * @return {ExperimentTogglesMap}
 */
function getExperimentToggles(win) {
  let experimentsString = '';
  try {
    if ('localStorage' in win) {
      experimentsString = win.localStorage.getItem(LOCAL_STORAGE_KEY) ?? '';
    }
  } catch {
    dev().warn(TAG, 'Failed to retrieve experiments from localStorage.');
  }
  const tokens = experimentsString?.split(/\s*,\s*/g) || [];

  const toggles = map();
  for (const token of tokens) {
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
 * @param {Window} win
 * @param {ExperimentTogglesMap} toggles
 */
function saveExperimentToggles(win, toggles) {
  const experimentIds = [];
  for (const experiment in toggles) {
    experimentIds.push((toggles[experiment] === false ? '-' : '') + experiment);
  }
  try {
    win.localStorage?.setItem(LOCAL_STORAGE_KEY, experimentIds.join(','));
  } catch (e) {
    user().error(TAG, 'Failed to save experiments to localStorage.');
  }
}

/**
 * See getExperimentToggles().
 * @param {Window} win
 * @return {ExperimentTogglesMap}
 * @visibleForTesting
 */
export function getExperimentTogglesForTesting(win) {
  return getExperimentToggles(win);
}

/**
 * Resets the experimentsToggle cache for testing purposes.
 * @param {Window} win
 * @visibleForTesting
 */
export function resetExperimentTogglesForTesting(win) {
  saveExperimentToggles(win, {});
  win[TOGGLES_WINDOW_PROPERTY] = undefined;
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
 * @const
 * @type {{accuratePrng: function():number}}
 */
export const RANDOM_NUMBER_GENERATORS = {
  accuratePrng: slowButAccuratePrng,
};

/**
 * Selects, uniformly at random, a single item from the array.
 * @param {string[]} arr Object to select from.
 * @return {?string} Single item from arr or null if arr was empty.
 */
function selectRandomItem(arr) {
  const rn = RANDOM_NUMBER_GENERATORS.accuratePrng();
  return arr[Math.floor(rn * arr.length)] || null;
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
 * @param {Window} win Window context on which to save experiment
 *     selection state.
 * @param {import('./types.d').ExperimentInfo[]} experiments Set of experiments
 *     to configure for this page load.
 * @return {ExperimentBranchMap} Map of experiment names to selected
 *     branches.
 */
export function randomlySelectUnsetExperiments(win, experiments) {
  win.__AMP_EXPERIMENT_BRANCHES = win.__AMP_EXPERIMENT_BRANCHES || {};
  /** @type {ExperimentBranchMap} */
  const selectedExperiments = {};
  for (const experiment of experiments) {
    const experimentName = experiment.experimentId;
    if (hasOwn(win.__AMP_EXPERIMENT_BRANCHES, experimentName)) {
      selectedExperiments[experimentName] =
        win.__AMP_EXPERIMENT_BRANCHES[experimentName];
      continue;
    }

    if (!experiment.isTrafficEligible?.(win)) {
      win.__AMP_EXPERIMENT_BRANCHES[experimentName] = null;
      continue;
    }

    // If we're in the experiment, but we haven't already forced a specific
    // experiment branch (e.g., via a test setup), then randomize the branch
    // choice.
    if (
      !win.__AMP_EXPERIMENT_BRANCHES[experimentName] &&
      isExperimentOn(win, /*OK*/ experimentName)
    ) {
      win.__AMP_EXPERIMENT_BRANCHES[experimentName] = selectRandomItem(
        experiment.branches
      );
      selectedExperiments[experimentName] =
        win.__AMP_EXPERIMENT_BRANCHES[experimentName];
    }
  }
  return selectedExperiments;
}

/**
 * Returns the experiment branch enabled for the given experiment ID.
 * For example, 'control' or 'experiment'.
 *
 * @param {Window} win Window context to check for experiment state.
 * @param {string} experimentName Name of the experiment to check.
 * @return {?string} Active experiment branch ID for experimentName (possibly
 *     null if experimentName has been tested but no branch was enabled).
 */
export function getExperimentBranch(win, experimentName) {
  return win.__AMP_EXPERIMENT_BRANCHES
    ? win.__AMP_EXPERIMENT_BRANCHES[experimentName]
    : null;
}

/**
 * Returns an object containing all active experiment branches on the
 * top Window.
 *
 * @param {Window} win Window context to check for experiment state.
 * @return {object} contains all experiment branches and their ids.
 */
export function getActiveExperimentBranches(win) {
  const topWin = getTopWindow(win);
  if (!topWin.__AMP_EXPERIMENT_BRANCHES) {
    topWin.__AMP_EXPERIMENT_BRANCHES = {};
  }
  return {...topWin.__AMP_EXPERIMENT_BRANCHES};
}

/**
 * Force enable (or disable) a specific branch of a given experiment name.
 * Disables the experiment name altogether if branchId is falseish.
 *
 * @param {Window} win Window context to check for experiment state.
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
