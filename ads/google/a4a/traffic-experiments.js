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

import {isGoogleAdsA4AValidEnvironment} from './utils';
import {isExperimentOn, toggleExperiment} from '../../../src/experiments';
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {viewerForDoc} from '../../../src/viewer';
import {parseQueryString} from '../../../src/url';

/** @typedef {{string: {branches: !Branches}}} */
export let Branches;

/** @typedef {{control: string, experiment: string}} */
export let ExperimentInfo;

/** @type {!string} @private */
const MANUAL_EXPERIMENT_ID = '117152632';

/**
 * Check whether Google Ads supports the A4A rendering pathway for a given ad
 * Element on a given Window.  The tests we use are:
 *
 * - The page must have originated in the `cdn.ampproject.org` CDN _or_ we must
 *   be running in local dev mode.
 * - We must be selected in to an A4A traffic experiment and be selected into
 *   the "experiment" branch.
 *
 * If we're selected into the overall traffic experiment, this function will
 * also attach an experiment or control branch ID to the `Element` as
 * a side-effect.
 *
 * @param {!Window} win  Host window for the ad.
 * @param {!Element} element Ad tag Element.
 * @param {string} experimentName Overall name for the experiment.
 * @param {!ExperimentInfo} externalBranches experiment and control branch IDs to use
 *   when experiment is triggered externally (e.g., via Google Search
 *   results page).
 * @param {!ExperimentInfo} internalBranches experiment and control branch IDs to
 *   use when experiment is triggered internally (i.e., via client-side
 *   selection).
 * @return {boolean}  Whether Google Ads should attempt to render via the A4A
 *   pathway.
 */
export function googleAdsIsA4AEnabled(win, element, experimentName,
    externalBranches, internalBranches) {
  if (isGoogleAdsA4AValidEnvironment(win, element)) {
    maybeSetExperimentFromUrl(win, element,
        experimentName, externalBranches.control,
        externalBranches.experiment, MANUAL_EXPERIMENT_ID);
    const experimentInfo = {};
    experimentInfo[experimentName] = internalBranches;
    // Note: Because the same experimentName is being used everywhere here,
    // randomlySelectUnsetPageExperiments won't add new IDs if
    // maybeSetExperimentFromUrl has already set something for this
    // experimentName.
    randomlySelectUnsetPageExperiments(win, experimentInfo);
    if (isExperimentOn(win, experimentName)) {
      // Page is selected into the overall traffic experiment.
      const selectedBranch = getPageExperimentBranch(win, experimentName);
      addExperimentIdToElement(selectedBranch, element);
      // Detect whether page is on the "experiment" (i.e., use A4A rendering
      // pathway) branch of the overall traffic experiment or it's on the
      // "control" (i.e., use traditional, 3p iframe rendering pathway).
      return selectedBranch == internalBranches.experiment ||
          selectedBranch == externalBranches.experiment ||
          selectedBranch == MANUAL_EXPERIMENT_ID;
    }
  }
  // Serving location doesn't qualify for A4A treatment or page is not in the
  // traffic experiment.
  return false;
}

/**
 * Set experiment state from URL parameter, if present.  This looks for the
 * presence of a URL parameter of the form
 *   `exp=expt0:val0,expt1:val1,...,a4a:X,...,exptN:valN`
 * and interprets the X as one of the following:
 *   - `-1`: Manually-triggered experiment.  For testing only.  Sets
 *     `adtest=on` on the ad request, so that it will not bill or record
 *     user clicks as ad CTR.  Ad request will be accounted in a special
 *     'testing only' experiment statistic pool so that we can track usage
 *     of this feature.
 *   - `0`: Ad is explicitly opted out of the overall A4A-vs-3p iframe
 *     experiment.  Ad will serve into a 3p iframe, as traditional, but ad
 *     request and clicks will not be accounted in experiment statistics.
 *   - `1`: Ad is on the control branch of the overall A4A-vs-3p iframe
 *     experiment.  Ad will serve into a 3p iframe, and ad requests and
 *     clicks _will_ be accounted in experiment statistics.
 *   - `2`: Ad is on the experimental branch of the overall A4A-vs-3p iframe
 *     experiment.  Ad will render via the A4A path, including early ad
 *     request and (possibly) early rendering in shadow DOM or iframe.
 *
 * @param {!Window} win  Window.
 * @param {!Element} element Ad tag Element.
 * @param {!string} experimentName  Name of the overall experiment.
 * @param {!string} controlBranchId  Experiment ID string for control branch of
 *   the overall experiment.
 * @param {!string} treatmentBranchId  Experiment ID string for the 'treatment'
 *   (i.e., a4a) branch of the overall experiment.
 * @param {!string} manualId  ID of the manual experiment.
 */
function maybeSetExperimentFromUrl(win, element, experimentName,
    controlBranchId, treatmentBranchId, manualId) {
  const expParam = viewerForDoc(element).getParam('exp') ||
      parseQueryString(win.location.search)['exp'];
  if (!expParam) {
    return;
  }
  const match = /(^|,)(a4a:[^,]*)/.exec(expParam);
  const a4aParam = match && match[2];
  if (!a4aParam) {
    return;
  }
  // In the future, we may want to specify multiple experiments in the a4a
  // arg.  For the moment, however, assume that it's just a single flag.
  const arg = a4aParam.split(':', 2)[1];
  const argMapping = {
    '-1': manualId,
    '0': null,
    '1': controlBranchId,
    '2': treatmentBranchId,
  };
  if (argMapping.hasOwnProperty(arg)) {
    forceExperimentBranch(win, experimentName, argMapping[arg]);
  } else {
    dev().warn('a4a-config', 'Unknown a4a URL parameter: ', a4aParam,
        ' expected one of -1 (manual), 0 (not in experiment), 1 (control ' +
        'branch), or 2 (a4a experiment branch)');
  }
}

// TODO(tdrl): New test case: Invoke randomlySelectUnsetPageExperiments twice for different
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
 * participate in.  If a given experiment name is already set (including to
 * the null / no branches selected state), this won't alter its state.
 *
 * Check whether a given experiment is set using isExperimentOn(win,
 * experimentName) and, if it is on, look for which branch is selected in
 * win.pageExperimentBranches[experimentName].
 *
 * @param {!Window} win Window context on which to save experiment
 *     selection state.
 * @param {!Object<string,!ExperimentInfo>} experiments  Set of experiments to
 *     configure for this page load.
 * @visibleForTesting
 */
export function randomlySelectUnsetPageExperiments(win, experiments) {
  win.pageExperimentBranches = win.pageExperimentBranches || {};
  if (getMode(win).localDev) {
    // In local dev mode, it can be difficult to configure AMP_CONFIG
    // externally.  Default it here if necessary.
    win.AMP_CONFIG = win.AMP_CONFIG || {};
  }
  for (const experimentName in experiments) {
    // Skip experimentName if it is not a key of experiments object or if it
    // has already been populated by some other property.
    if (!experiments.hasOwnProperty(experimentName) ||
        win.pageExperimentBranches.hasOwnProperty(experimentName)) {
      continue;
    }
    if (getMode(win).localDev) {
      win.AMP_CONFIG[experimentName] = win.AMP_CONFIG[experimentName] || 0.0;
    }
    // If we're in the experiment, but we haven't already forced a specific
    // experiment branch (e.g., via a test setup), then randomize the branch
    // choice.
    if (!win.pageExperimentBranches[experimentName] &&
        isExperimentOn(win, experimentName)) {
      const branches = experiments[experimentName];
      const branch = selectRandomProperty(branches);
      win.pageExperimentBranches[experimentName] = branches[branch];
    }
  }
}

/**
 * Returns the experiment branch enabled for the given experiment ID.
 * For example, 'control' or 'experiment'.
 *
 * @param {!Window} win Window context to check for experiment state.
 * @param {!string} experimentName Name of the experiment to check.
 * @return {string} Active experiment branch ID for experimentName (possibly
 *     null/false if experimentName has been tested but no branch was enabled).
 */
export function getPageExperimentBranch(win, experimentName) {
  return win.pageExperimentBranches[experimentName];
}

/**
 * Force enable (or disable) a specific branch of a given experiment name.
 * Disables the experiment name altogether if branchId is falseish.
 *
 * @param {!Window} win Window context to check for experiment state.
 * @param {!string} experimentName Name of the experiment to check.
 * @param {?string} branchId ID of branch to force or null/false to disable
 *   altogether.
 * @visibleForTesting
 */
export function forceExperimentBranch(win, experimentName, branchId) {
  win.pageExperimentBranches = win.pageExperimentBranches || {};
  toggleExperiment(win, experimentName, !!branchId, true);
  win.pageExperimentBranches[experimentName] = branchId;
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
 * Checks whether the given element is a member of the given experiment branch.
 * I.e., whether the element's data-experiment-id attribute contains the id
 * value (possibly because the host page URL contains a 'exp=a4a:X' parameter
 * and #maybeSetExperimentFromUrl has added the appropriate EID).
 *
 * @param element  {!Element}  Element to check for membership in a specific
 *   experiment.
 * @param id {?string} Experiment ID to check for on `element`.
 * @return {boolean}
 */
export function isInExperiment(element, id) {
  return parseExperimentIds(element.getAttribute(EXPERIMENT_ATTRIBUTE)).some(
      x => { return x === id; });
}

/**
 * Checks whether the given element is a member of the 'manually triggered
 * "experiment" branch'.  I.e., whether the element's data-experiment-id
 * attribute contains the MANUAL_EXPERIMENT_ID value (hopefully because the
 * user has manually specified 'exp=a4a:-1' in the host page URL and
 * #maybeSetExperimentFromUrl has added it).
 *
 * @param {!Element} element  Element to check for manual experiment membership.
 * @returns {boolean}
 */
export function isInManualExperiment(element) {
  return isInExperiment(element, MANUAL_EXPERIMENT_ID);
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
  return currentIdString || '';
}

/**
 * Element attribute that stores experiment IDs.
 *
 * Note: This attribute should be used only for tracking experimental
 * implementations of AMP tags, e.g., by AMPHTML implementors.  It should not be
 * added by a publisher page.
 *
 * @const {!string}
 * @visibleForTesting
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
