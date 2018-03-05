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

// Because AdSense and DoubleClick are both operated by Google and their A4A
// implementations share some behavior in common, part of the logic for this
// implementation is located in the ads/google/a4a directory rather than here.
// Most other ad networks will want to put their A4A code entirely in the
// extensions/amp-ad-network-${NETWORK_NAME}-impl directory.
import {
  ExperimentInfo, // eslint-disable-line no-unused-vars
  forceExperimentBranch,
  getExperimentBranch,
  randomlySelectUnsetExperiments,
} from '../../../src/experiments';
import {
  MANUAL_EXPERIMENT_ID,
  addExperimentIdToElement,
  extractUrlExperimentId,
} from '../../../ads/google/a4a/traffic-experiments';
import {dev, user} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {
  isCdnProxy,
} from '../../../ads/google/a4a/utils';
import {tryParseJson} from '../../../src/json';

/** @const {string} */
export const DOUBLECLICK_A4A_EXPERIMENT_NAME = 'expDoubleclickA4A';

export const UNCONDITIONED_CANONICAL_FF_HOLDBACK_EXP_NAME =
  'expUnconditionedCanonicalHoldback';

/** @type {string} */
const TAG = 'amp-ad-network-doubleclick-impl';

/** @const @enum{string} */
export const DOUBLECLICK_EXPERIMENT_FEATURE = {
  DELAYED_REQUEST_CONTROL: '21060728',
  DELAYED_REQUEST: '21060729',
  SRA_CONTROL: '117152666',
  SRA: '117152667',
  CANONICAL_EXPERIMENT: '21060933',
  CACHE_EXTENSION_INJECTION_CONTROL: '21060955',
  CACHE_EXTENSION_INJECTION_EXP: '21060956',
  REMOTE_HTML_CONTROL: '21061728',
  REMOTE_HTML_EXPERIMENT: '21061729',
};

/** @const @enum{string} */
export const DOUBLECLICK_UNCONDITIONED_EXPERIMENTS = {
  CANONICAL_HLDBK_CTL: '21061372',
  CANONICAL_HLDBK_EXP: '21061373',
};

/** @const @type {!Object<string,?string>} */
export const URL_EXPERIMENT_MAPPING = {
  '-1': MANUAL_EXPERIMENT_ID,
  '0': null,
  // Delay Request
  '3': DOUBLECLICK_EXPERIMENT_FEATURE.DELAYED_REQUEST_CONTROL,
  '4': DOUBLECLICK_EXPERIMENT_FEATURE.DELAYED_REQUEST,
  // SRA
  '7': DOUBLECLICK_EXPERIMENT_FEATURE.SRA_CONTROL,
  '8': DOUBLECLICK_EXPERIMENT_FEATURE.SRA,
  '9': DOUBLECLICK_EXPERIMENT_FEATURE.REMOTE_HTML_CONTROL,
  '10': DOUBLECLICK_EXPERIMENT_FEATURE.REMOTE_HTML_EXPERIMENT,
};

/**
 * Class for checking whether a page/element is eligible for Fast Fetch.
 * Singleton class.
 * @visibleForTesting
 */
export class DoubleclickA4aEligibility {
  /**
   * Returns whether we are running on the AMP CDN.
   * @param {!Window} win
   * @return {boolean}
   */
  isCdnProxy(win) {
    return isCdnProxy(win);
  }

  /**
   * Attempts all unconditioned experiment selection.
   * @param {!Window} win
   * @param {!Element} element
   */
  unconditionedExperimentSelection(win, element) {
    this.selectAndSetUnconditionedExp(
        win, element,
        [DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.CANONICAL_HLDBK_CTL,
          DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.CANONICAL_HLDBK_EXP],
        UNCONDITIONED_CANONICAL_FF_HOLDBACK_EXP_NAME);
  }

  /**
   * Attempts to select into experiment and forces branch if selected.
   * @param {!Window} win
   * @param {!Element} element
   * @param {!Array<string>} branches
   * @param {string} expName
   */
  selectAndSetUnconditionedExp(win, element, branches, expName) {
    const experimentId = this.maybeSelectExperiment(
        win, element, branches, expName);
    if (!!experimentId) {
      addExperimentIdToElement(experimentId, element);
      forceExperimentBranch(win, expName, experimentId);
    }
  }

  /** Whether Fast Fetch is enabled
   * @param {!Window} win
   * @param {!Element} element
   * @param {boolean} useRemoteHtml
   * @return {boolean}
   */
  isA4aEnabled(win, element, useRemoteHtml) {
    this.unconditionedExperimentSelection(win, element);
    const warnDeprecation = feature => user().warn(
        TAG, `${feature} will no longer ` +
          'be supported starting on March 29, 2018. Please refer to ' +
          'https://github.com/ampproject/amphtml/issues/11834 ' +
          'for more information');
    const usdrd = 'useSameDomainRenderingUntilDeprecated';
    const hasUSDRD = usdrd in element.dataset ||
          (tryParseJson(element.getAttribute('json')) || {})[usdrd];
    if (hasUSDRD) {
      warnDeprecation(usdrd);
    }
    if (useRemoteHtml) {
      warnDeprecation('remote.html');
    }
    let experimentId;
    const urlExperimentId = extractUrlExperimentId(win, element);
    if (hasUSDRD || (useRemoteHtml &&
                     !element.getAttribute('rtc-config') &&
                     urlExperimentId != '10')) {
      return false;
    }
    if (!this.isCdnProxy(win)) {
      // Ensure that forcing FF via url is applied if test/localDev.
      if (urlExperimentId == -1 &&
          (getMode(win).localDev || getMode(win).test)) {
        experimentId = MANUAL_EXPERIMENT_ID;
      } else {
        // For unconditioned canonical holdback, in the control branch
        // we allow Fast Fetch on non-CDN pages, but in the experiment we do not.
        if (getExperimentBranch(
            win, UNCONDITIONED_CANONICAL_FF_HOLDBACK_EXP_NAME) !=
            DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.CANONICAL_HLDBK_EXP) {
          addExperimentIdToElement(
              DOUBLECLICK_EXPERIMENT_FEATURE.CANONICAL_EXPERIMENT, element);
          return true;
        }
        return false;
      }
    } else {
      // See if in holdback control/experiment.
      if (urlExperimentId != undefined) {
        experimentId = URL_EXPERIMENT_MAPPING[urlExperimentId];
        dev().info(
            TAG,
            `url experiment selection ${urlExperimentId}: ${experimentId}.`);
      }
    }
    if (experimentId) {
      addExperimentIdToElement(experimentId, element);
      forceExperimentBranch(win, DOUBLECLICK_A4A_EXPERIMENT_NAME, experimentId);
    }
    return experimentId != DOUBLECLICK_EXPERIMENT_FEATURE.REMOTE_HTML_CONTROL;
  }

  /**
   * @param {!Window} win
   * @param {!Element} element
   * @param {!Array<string>} selectionBranches
   * @param {string} experimentName}
   * @return {?string} Experiment branch ID or null if not selected.
   * @visibileForTesting
   */
  maybeSelectExperiment(win, element, selectionBranches, experimentName) {
    const experimentInfoMap =
        /** @type {!Object<string, !ExperimentInfo>} */ ({});
    experimentInfoMap[experimentName] = {
      isTrafficEligible: () => true,
      branches: selectionBranches,
    };
    randomlySelectUnsetExperiments(win, experimentInfoMap);
    return getExperimentBranch(win, experimentName);
  }
}

/** @const {!DoubleclickA4aEligibility} */
const singleton = new DoubleclickA4aEligibility();

/**
 * @param {!Window} win
 * @param {!Element} element
 * @param {boolean} useRemoteHtml
 * @returns {boolean}
 */
export function doubleclickIsA4AEnabled(win, element, useRemoteHtml) {
  return singleton.isA4aEnabled(win, element, useRemoteHtml);
}

/**
 * @param {!Window} win
 * @param {!DOUBLECLICK_EXPERIMENT_FEATURE|
 *         DOUBLECLICK_UNCONDITIONED_EXPERIMENTS} feature
 * @param {string=} opt_experimentName
 * @return {boolean} whether feature is enabled
 */
export function experimentFeatureEnabled(win, feature, opt_experimentName) {
  const experimentName = opt_experimentName || DOUBLECLICK_A4A_EXPERIMENT_NAME;
  return getExperimentBranch(win, experimentName) == feature;
}
