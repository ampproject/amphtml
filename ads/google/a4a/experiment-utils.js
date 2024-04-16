import {
  forceExperimentBranch,
  getExperimentBranch,
  randomlySelectUnsetExperiments,
} from '#experiments';

import {addExperimentIdToElement} from './traffic-experiments';

/**
 * Attempts to select into experiment and forces branch if selected.
 * @param {!Window} win
 * @param {!Element} element
 * @param {!Array<string>} branches
 * @param {string} expName
 * @param {boolean=} optAddExpIdToElement
 * @return {*} TODO(#23582): Specify return type
 */
export function selectAndSetExperiments(
  win,
  element,
  branches,
  expName,
  optAddExpIdToElement
) {
  const experimentId = expUtils.maybeSelectExperiment(
    win,
    element,
    branches,
    expName
  );
  if (!!experimentId) {
    addExperimentIdToElement(
      optAddExpIdToElement ? experimentId : undefined,
      element
    );
    forceExperimentBranch(win, expName, experimentId);
  }
  return experimentId;
}

export class ExperimentUtils {
  /**
   * @param {!Window} win
   * @param {!Element} element
   * @param {!Array<string>} selectionBranches
   * @param {string} experimentName
   * @return {?string}
   */
  maybeSelectExperiment(win, element, selectionBranches, experimentName) {
    const experimentInfoList = /** @type {!Array<!ExperimentInfoDef>} */ ([]);
    experimentInfoList.push({
      experimentId: experimentName,
      isTrafficEligible: () => true,
      branches: selectionBranches,
    });
    randomlySelectUnsetExperiments(win, experimentInfoList);
    return getExperimentBranch(win, experimentName);
  }
}

/**
 * ExperimentUtils singleton.
 * @type {!ExperimentUtils}
 */
const expUtils = new ExperimentUtils();
