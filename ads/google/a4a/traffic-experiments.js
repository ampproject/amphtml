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
  EXPERIMENT_ATTRIBUTE,
  mergeExperimentIds,
} from './utils';
import {
  ExperimentInfo, // eslint-disable-line no-unused-vars
  isExperimentOn,
} from '../../../src/experiments';
import {Services} from '../../../src/services';
import {parseQueryString} from '../../../src/url';

/** @typedef {{
 *    control: string,
 *    experiment: string
 *  }} */
export let A4aExperimentBranches;

/** @type {string} @private */
export const MANUAL_EXPERIMENT_ID = '117152632';


/**
 * Experiment IDs used to identify single pass experiments.
 *
 * @enum {string}
 */
export const SINGLE_PASS_EXPERIMENT_IDS = {
  SINGLE_PASS: '21063530',
  MULTI_PASS: '21063529',
};

/**
 * @param {!Window} win
 * @param {!Element} element Ad tag Element.
 * @return {?string} experiment extracted from page url.
 */
export function extractUrlExperimentId(win, element) {
  const expParam = Services.viewerForDoc(element).getParam('exp') ||
    parseQueryString(win.location.search)['exp'];
  if (!expParam) {
    return null;
  }
  // Allow for per type experiment control with Doubleclick key set for 'da'
  // and AdSense using 'aa'.  Fallback to 'a4a' if type specific is missing.
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
  return arg || null;
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
 * @return {!Array<string>}  List of experiment IDs (possibly empty).
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
 * @param {!Element} element Element to check for membership in a specific
 *   experiment.
 * @param {?string} id Experiment ID to check for on `element`.
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
 * @return {boolean}
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
 * @return {boolean}
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
 * Checks that all string experiment IDs in a list are syntactically valid
 * (integer base 10).
 *
 * @param {!Array<string>} idList  List of experiment IDs.  Can be empty.
 * @return {boolean} Whether all list elements are valid experiment IDs.
 */
export function validateExperimentIds(idList) {
  return idList.every(id => { return !isNaN(parseInt(id, 10)); });
}

/**
 * Adds a single experimentID to an element iff it's a valid experiment ID.
 * No-ops if the experimentId is undefined.
 *
 * @param {string|undefined} experimentId  ID to add to the element.
 * @param {Element} element to add the experiment ID to.
 */
export function addExperimentIdToElement(experimentId, element) {
  if (!experimentId) {
    return;
  }
  const currentEids = element.getAttribute(EXPERIMENT_ATTRIBUTE);
  if (currentEids && validateExperimentIds(parseExperimentIds(currentEids))) {
    element.setAttribute(EXPERIMENT_ATTRIBUTE,
        mergeExperimentIds([experimentId], currentEids));
  } else {
    element.setAttribute(EXPERIMENT_ATTRIBUTE, experimentId);
  }
}
