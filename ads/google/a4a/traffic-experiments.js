/**
 * Machinery for doing "traffic-level" experiments.  That is, rather than
 * a single user choosing to opt-in to an experimental version of a module,
 * this framework allows you to do randomized, controlled experiments on all
 * AMP page loads to, for example, test relative performance or look for
 * impacts on click-throughs.
 */

import {parseQueryString} from '#core/types/string/url';

import {Services} from '#service';

import {
  AMP_EXPERIMENT_ATTRIBUTE,
  EXPERIMENT_ATTRIBUTE,
  mergeExperimentIds,
} from './utils';

/** @typedef {{
 *    control: string,
 *    experiment: string
 *  }} */
export let A4aExperimentBranches;

/** @type {string} @private */
export const MANUAL_EXPERIMENT_ID = '117152632';

/**
 * @param {!Window} win
 * @param {!Element} element Ad tag Element.
 * @return {?string} experiment extracted from page url.
 */
export function extractUrlExperimentId(win, element) {
  const expParam =
    Services.ampdoc(element).getParam('exp') ||
    parseQueryString(win.location.search)['exp'];
  if (!expParam) {
    return null;
  }
  // Allow for per type experiment control with Doubleclick key set for 'da'
  // and AdSense using 'aa'.  Fallback to 'a4a' if type specific is missing.
  const expKeys = [
    (element.getAttribute('type') || '').toLowerCase() == 'doubleclick'
      ? 'da'
      : 'aa',
    'a4a',
  ];
  let arg;
  let match;
  expKeys.forEach(
    (key) =>
      (arg =
        arg ||
        ((match = new RegExp(`(?:^|,)${key}:(-?\\d+)`).exec(expParam)) &&
          match[1]))
  );
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
    (x) => {
      return x === id;
    }
  );
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
 * Checks that all string experiment IDs in a list are syntactically valid
 * (integer base 10).
 *
 * @param {!Array<string>} idList  List of experiment IDs.  Can be empty.
 * @return {boolean} Whether all list elements are valid experiment IDs.
 */
export function validateExperimentIds(idList) {
  return idList.every((id) => {
    return !isNaN(parseInt(id, 10));
  });
}

/**
 * Adds a single experimentID to an element iff it's a valid experiment ID.
 * No-ops if the experimentId is undefined.
 *
 * @param {string|undefined} experimentId  ID to add to the element.
 * @param {Element} element to add the experiment ID to.
 * @param {string} attr the attribute name that holds the experiments
 */
function addExpIdToElement(experimentId, element, attr) {
  if (!experimentId) {
    return;
  }
  const currentEids = element.getAttribute(attr);
  if (currentEids && validateExperimentIds(parseExperimentIds(currentEids))) {
    element.setAttribute(attr, mergeExperimentIds([experimentId], currentEids));
  } else {
    element.setAttribute(attr, experimentId);
  }
}

/**
 * Adds a single experimentID to an element iff it's a valid experiment ID.
 * No-ops if the experimentId is undefined.
 *
 * @param {string|undefined} experimentId  ID to add to the element.
 * @param {Element} element to add the experiment ID to.
 */
export function addExperimentIdToElement(experimentId, element) {
  addExpIdToElement(experimentId, element, EXPERIMENT_ATTRIBUTE);
}

/**
 * Adds a single AMP experimentID to an element iff it's a valid experiment ID.
 * No-ops if the experimentId is undefined.
 *
 * Note that AMP experiment brances do not have their own unique IDs. Instead,
 * we generate a pseudo ID for them by concatenating the id with the
 * experiment's value.
 *
 * @param {string|undefined} experimentId  ID to add to the element.
 * @param {Element} element to add the experiment ID to.
 */
export function addAmpExperimentIdToElement(experimentId, element) {
  addExpIdToElement(experimentId, element, AMP_EXPERIMENT_ATTRIBUTE);
}
