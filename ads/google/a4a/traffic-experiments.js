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

import {
  isGoogleAdsA4AValidEnvironment,
  mergeExperimentIds,
  EXPERIMENT_ATTRIBUTE,
} from './utils';
import {
  isExperimentOn,
  forceExperimentBranch,
  getExperimentBranch,
  randomlySelectUnsetExperiments,
} from '../../../src/experiments';
import {dev} from '../../../src/log';
import {
  viewerForDoc,
  performanceForOrNull,
} from '../../../src/services';
import {parseQueryString} from '../../../src/url';

/** @typedef {{
 *    control: string,
 *    experiment: string
 *  }} */
export let A4aExperimentBranches;

/** @type {!string} @private */
export const MANUAL_EXPERIMENT_ID = '117152632';

/** @type {!string} @private */
const EXTERNALLY_SELECTED_ID = '2088461';

/** @type {!string} @private */
const INTERNALLY_SELECTED_ID = '2088462';

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
 * @param {!A4aExperimentBranches} externalBranches experiment and control
 *   branch IDs to use when experiment is triggered externally (e.g., via Google
 *   Search results page).
 * @param {!A4aExperimentBranches} internalBranches experiment and control
 *   branch IDs to use when experiment is triggered internally (i.e., via
 *   client-side selection).
 * @param {!A4aExperimentBranches} delayedExternalBranches
 * @param {!A4aExperimentBranches=} opt_sfgInternalBranches
 * @return {boolean} Whether Google Ads should attempt to render via the A4A
 *   pathway.
 */
export function googleAdsIsA4AEnabled(win, element, experimentName,
    externalBranches, internalBranches, delayedExternalBranches,
    opt_sfgInternalBranches) {
  if (!isGoogleAdsA4AValidEnvironment(win)) {
    // Serving location doesn't qualify for A4A treatment
    return false;
  }

  const isSetFromUrl = maybeSetExperimentFromUrl(win, element,
      experimentName, externalBranches.control,
      externalBranches.experiment, delayedExternalBranches.control,
      delayedExternalBranches.experiment,
      opt_sfgInternalBranches ? opt_sfgInternalBranches.control : null,
      opt_sfgInternalBranches ? opt_sfgInternalBranches.experiment : null,
      MANUAL_EXPERIMENT_ID);
  const experimentInfoMap = {};
  const branches = [
    internalBranches.control,
    internalBranches.experiment,
  ];
  experimentInfoMap[experimentName] = {
    isTrafficEligible: () => true,
    branches,
  };
  // Note: Because the same experimentName is being used everywhere here,
  // randomlySelectUnsetExperiments won't add new IDs if
  // maybeSetExperimentFromUrl has already set something for this
  // experimentName.
  randomlySelectUnsetExperiments(win, experimentInfoMap);
  if (isExperimentOn(win, experimentName)) {
    // Page is selected into the overall traffic experiment.
    // In other words, if A4A has not yet launched serve A4A Fast Fetch,
    // else serve Delayed Fetch.
    const selectedBranch = getExperimentBranch(win, experimentName);
    if (selectedBranch) {
      addExperimentIdToElement(selectedBranch, element);
      const perf = performanceForOrNull(win);
      if (perf) {
        perf.addEnabledExperiment(experimentName + '-' + selectedBranch);
      }
    }
    // Detect how page was selected into the overall experimentName.
    if (isSetFromUrl) {
      addExperimentIdToElement(EXTERNALLY_SELECTED_ID, element);
    } else {
      // Must be internally selected.
      addExperimentIdToElement(INTERNALLY_SELECTED_ID, element);
    }
    // Detect whether page is on the "experiment" (i.e., use A4A rendering
    // pathway) branch of the overall traffic experiment or it's on the
    // "control" (i.e., use traditional, 3p iframe rendering pathway).
    const selected = selectedBranch == internalBranches.experiment ||
                     selectedBranch == externalBranches.experiment ||
                     selectedBranch == delayedExternalBranches.experiment ||
                     selectedBranch == MANUAL_EXPERIMENT_ID;
    // Not launched, control branch -> Delayed Fetch
    // Not launched, experimental branch -> Fast Fetch
    // Launched, control branch -> Fast Fetch
    // Launched, experimental branch -> Delayed Fetch (for holdback)
    return (selected == !hasLaunched(win, element));
  } else {
    // Page is not selected into the overall traffic experiment.
    // In other words, if A4A has launched serve A4A Fast Fetch, else serve
    // Delayed Fetch.
    return hasLaunched(win, element);
  }
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
 * Allows for per network selection using exp=aa:# for AdSense and exp=da:# for
 * Doubleclick.
 *
 * @param {!Window} win  Window.
 * @param {!Element} element Ad tag Element.
 * @param {!string} experimentName  Name of the overall experiment.
 * @param {!string} controlBranchId  Experiment ID string for control branch of
 *   the overall experiment.
 * @param {!string} treatmentBranchId  Experiment ID string for the 'treatment'
 *   branch of the overall experiment.
 * @param {!string} delayedTreatmentBrandId Experiment ID string for the
 *   'treatment' plus delayed request experiment.
 * @param {!string} manualId  ID of the manual experiment.
 * @return {boolean}  Whether the experiment state was set from a command-line
 *   parameter or not.
 */
function maybeSetExperimentFromUrl(win, element, experimentName,
     controlBranchId, treatmentBranchId, delayedControlId,
     delayedTreatmentBrandId, sfgControlId, sfgTreatmentId, manualId) {
  const expParam = viewerForDoc(element).getParam('exp') ||
    parseQueryString(win.location.search)['exp'];
  if (!expParam) {
    return false;
  }
  // Allow for per type experiment control with Doubleclick key set for 'da'
  // and AdSense using 'aa'.  Fallbsck to 'a4a' if type specific is missing.
  const expKeys = [
    (element.getAttribute('type') || '').toLowerCase() == 'doubleclick' ?
      'da' : 'aa',
    'a4a',
  ];
  let arg;
  let match;
  expKeys.forEach(key => arg = arg ||
    ((match = new RegExp(`(?:^|,)${key}:(-?\\d+)`).exec(expParam)) &&
      match[1]));
  if (!arg) {
    return false;
  }
  const argMapping = {
    '-1': manualId,
    '0': null,
    '1': controlBranchId,
    '2': treatmentBranchId,
    '3': delayedControlId,
    '4': delayedTreatmentBrandId,
    '5': sfgControlId,
    '6': sfgTreatmentId,
  };
  if (argMapping.hasOwnProperty(arg)) {
    forceExperimentBranch(win, experimentName, argMapping[arg]);
    return true;
  } else {
    dev().warn('A4A-CONFIG', 'Unknown a4a URL parameter: ', arg,
        ' expected one of -1 (manual), 0 (not in experiment), 1 (control ' +
        'branch), or 2 (a4a experiment branch)');
    return false;
  }
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
 * Predicate to check whether A4A has launched yet or not.
 * If it has not yet launched, then the experimental branch serves A4A, and
 * control/filler do not. If it has not, then the filler and control branch do
 * serve A4A, and the experimental branch does not.
 *
 * @param {!Window} win  Host window for the ad.
 * @param {!Element} element  Element to check for pre-launch membership.
 * @returns {boolean}
 */
export function hasLaunched(win, element) {
  switch (element.getAttribute('type')) {
    case 'adsense':
      return isExperimentOn(win, 'a4aFastFetchAdSenseLaunched');
    case 'doubleclick':
      return isExperimentOn(win, 'a4aFastFetchDoubleclickLaunched');
    default:
      return false;
  }
}

/**
 * Checks whether the given element is in any of the branches triggered by
 * the externally-provided experiment parameter (as decided by the
 * #maybeSetExperimentFromUrl function).
 *
 * @param {!Element} element
 * @return {boolean}
 */
export function isExternallyTriggeredExperiment(element) {
  return isInExperiment(element, EXTERNALLY_SELECTED_ID);
}

/**
 * Checks whether the given element is in any of the branches triggered by
 * internal experiment selection (as set by
 * #randomlySelectUnsetExperiments).
 *
 * @param {!Element} element
 * @return {boolean}
 */
export function isInternallyTriggeredExperiment(element) {
  return isInExperiment(element, INTERNALLY_SELECTED_ID);
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
 * Adds a single experimentID to an element iff it's a valid experiment ID.
 *
 * @param {!string} experimentId  ID to add to the element.
 * @param element Element to add the experiment ID to.
 */
export function addExperimentIdToElement(experimentId, element) {
  const currentEids = element.getAttribute(EXPERIMENT_ATTRIBUTE);
  if (currentEids && validateExperimentIds(parseExperimentIds(currentEids))) {
    element.setAttribute(EXPERIMENT_ATTRIBUTE,
        mergeExperimentIds([experimentId], currentEids));
  } else {
    element.setAttribute(EXPERIMENT_ATTRIBUTE, experimentId);
  }
}
