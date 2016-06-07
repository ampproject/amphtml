/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
 * Machinery for doing "traffic-level" experiments.  That is, rather than
 * a single user choosing to opt-in to an experimental version of a module,
 * this framework allows you to do randomized, controlled experiments on all
 * AMP page loads to, for example, test relative performance or look for
 * impacts on click-throughs.
 */

import {isExperimentOn, toggleExperiment} from './experiments';
import {getMode} from './mode';

/** @typedef {{string: {branches: control: string, experiment: string}} */
export let ExperimentInfo;

// TODO(tdrl): New test case: Invoke setupPageExperiments twice for different
// experiment lists.

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
export const RANDOM_NUMBER_GENERATORS = {
  accuratePrng: slowButAccuratePrng,
};

/**
 * Selects, uniformly at random, a single property name from all
 * properties set on a given object.
 *
 * @param {!Object} obj Object to select from.
 * @return {string} Single property name from obj.
 */
function selectRandomProperty(obj) {
  const allProperties = Object.keys(obj);
  const rn = RANDOM_NUMBER_GENERATORS.accuratePrng();
  return allProperties[Math.floor(rn * allProperties.length)];
}

/**
 * Selects which page-level experiments, if any, a given amp-ad will
 * participate in.  Check experiments using isExperimentOn(win,
 * experimentId) and, if a given experiment is on, look for which
 * branch is selected in win.pageExperimentBranches[experimentId].
 *
 * @param {!Window} win Window context on which to save experiment
 * selection state.
 * @param {ExperimentInfo} experiments  Set of experiments to
 * configure for this page load.
 * @visibleForTesting
 */
export function setupPageExperiments(win, experiments) {
  win.pageExperimentBranches = win.pageExperimentBranches || {};
  if (getMode().localDev) {
    // In local dev mode, it can be difficult to configure AMP_CONFIG
    // externally.  Default it here if necessary.
    win.AMP_CONFIG = win.AMP_CONFIG || {};
  }
  for (experimentId in experiments) {
    // Skip experimentId if it is not a key of experiments object or if it
    // has already been populated by some other property.
    if (!experiments.hasOwnProperty(experimentId) ||
        win.pageExperimentBranches.hasOwnProperty(experimentId)) {
      continue;
    }
    if (getMode().localDev) {
      win.AMP_CONFIG[experimentId] = win.AMP_CONFIG[experimentId] || 0.0;
    }
    // If we're in the experiment, but we haven't already forced a specific
    // experiment branch (e.g., via a test setup), then randomize the branch
    // choice.
    if (!win.pageExperimentBranches[experimentId] &&
        isExperimentOn(win, experimentId)) {
      const branches = experiments[experimentId];
      const branch = selectRandomProperty(branches);
      win.pageExperimentBranches[experimentId] = branches[branch];
    }
  }
}

/**
 * Returns the experiment branch enabled for the given experiment ID.
 * For example, 'control' or 'experiment'.
 *
 * @param {!Window} win Window context to check for experiment state.
 * @param {!string} experimentId ID of the experiment to check.
 * @return {string} Experiment branch ID for experimentId.
 */
export function getPageExperimentBranch(win, experimentId) {
  return win.pageExperimentBranches[experimentId];
}

/**
 * Force enable (or disable) a specific branch of a given experiment ID.
 * Disables the experiment ID altogether if branchId is falseish.
 *
 * @param {!Window} win Window context to check for experiment state.
 * @param {!string} experimentId ID of the experiment to check.
 * @param {string} branchId ID of branch to force or null/false to disable
 *   altogether.
 * @visibleForTesting
 */
export function forceExperimentBranch(win, experimentId, branchId) {
  win.pageExperimentBranches = win.pageExperimentBranches || {};
  toggleExperiment(win, experimentId, !!branchId, true);
  win.pageExperimentBranches[experimentId] = branchId;
}

/**
 * Sets of experiment IDs can be attached to Elements via attributes.  In
 * that case, we encode them as a string containing a comma-separated list
 * of experiment IDs.  This parses a comma-separated list from a string into
 * a list of ID strings.  If the input string is empty or null, this returns
 * the empty list.  This does no validity checking on the ID formats -- for
 * that, use validateExperimentIds.
 *
 * @param {?string} idString  String to parse.
 * @returns {!Array<!string>}  List of experiment IDs (possibly empty).
 * @see validateExperimentIds
 */
export function parseExperimentIds(idString) {
  if (idString) {
    return idString.split(',');
  }
  return [];
}

/**
 * Checks that all string experiment IDs in a list are syntactically valid
 * (integer base 10).
 *
 * @param {!Array<!string>} idList  List of experiment IDs.  Can be empty.
 * @returns {boolean} Whether all list elements are valid experiment IDs.
 */
export function validateExperimentIds(idList) {
  return idList.every(id => { return !isNaN(parseInt(id, 10)); });
}

/**
 * Add a new experiment ID to a (possibly empty) existing set of experiment IDs.
 * The {@code currentIdString} may be {@code null} or {@code ''}, but if it is
 * populated, it must contain a comma-separated list of integer experiment IDs
 * (per {@code parseExperimentIds()}).  Returns the new set of IDs, encoded
 * as a comma-separated list.  Does not de-duplicate ID entries.
 *
 * @param {!string} newId  ID to merge in.  Must be a stringified integer
 *   (base 10).
 * @param {?string} currentIdString  If present, a string containing a
 *   comma-separated list of integer experiment IDs.
 * @returns {string}  New experiment list string, including newId iff it is
 *   a valid (integer) experiment ID.
 * @see parseExperimentIds, validateExperimentIds
 */
export function mergeExperimentIds(newId, currentIdString) {
  if (newId && !isNaN(parseInt(newId, 10))) {
    return currentIdString ? (currentIdString + ',' + newId) : newId;
  }
  return currentIdString;
}

/**
 * Element attribute that stores experiment IDs.
 *
 * Note: This attribute should be used only for tracking experimental
 * implementations of AMP tags, e.g., by AMPHTML implementors.  It should not be
 * added by a publisher page.
 *
 * @const {!string}
 */
export const EXPERIMENT_ATTRIBUTE = 'data-experiment-id';

/**
 * Adds a single experimentID to an element iff it's a valid experiment ID.
 *
 * @param {!string} experimentId  ID to add to the element.
 * @param element  Element to add the experiment ID to.
 */
export function addExperimentIdToElement(experimentId, element) {
  const currentEids = element.getAttribute(EXPERIMENT_ATTRIBUTE);
  if (currentEids && validateExperimentIds(parseExperimentIds(currentEids))) {
    element.setAttribute(EXPERIMENT_ATTRIBUTE,
        mergeExperimentIds(experimentId, currentEids));
  } else {
    element.setAttribute(EXPERIMENT_ATTRIBUTE, experimentId);
  }
}
