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
  MANUAL_EXPERIMENT_ID,
  extractUrlExperimentId,
  addExperimentIdToElement,
} from '../../../ads/google/a4a/traffic-experiments';
import {supportsNativeCrypto} from '../../../ads/google/a4a/utils';
import {
  /* eslint no-unused-vars: 0 */ ExperimentInfo,
  getExperimentBranch,
  forceExperimentBranch,
  randomlySelectUnsetExperiments,
} from '../../../src/experiments';
import {getMode} from '../../../src/mode';
import {dev, user} from '../../../src/log';

/** @const {string} */
export const DOUBLECLICK_A4A_EXPERIMENT_NAME = 'expDoubleclickA4A';

/** @const {string} */
export const DFP_CANONICAL_FF_EXPERIMENT_NAME = 'expDfpCanonicalFf';

/** @const {string} */
export const UNCONDITIONED_CANONICAL_FF_EXPERIMENT_NAME =
    'expUnconditionedCanonical';

/** @const {string} */
export const UNCONDITIONED_IDENTITY_EXPERIMENT_NAME =
    'expUnconditionedDfpIdentity';

/** @type {string} */
const TAG = 'amp-ad-network-doubleclick-impl';

/** @const @enum{string} */
export const DOUBLECLICK_EXPERIMENT_FEATURE = {
  DELAYED_REQUEST_CONTROL: '21060728',
  DELAYED_REQUEST: '21060729',
  SRA_CONTROL: '117152666',
  SRA: '117152667',
  CANONICAL_CONTROL: '21060932',
  CANONICAL_EXPERIMENT: '21060933',
  CACHE_EXTENSION_INJECTION_CONTROL: '21060955',
  CACHE_EXTENSION_INJECTION_EXP: '21060956',
  IDENTITY_CONTROL: '21060937',
  IDENTITY_EXPERIMENT: '21060938',
};

/** @const @enum{string} */
export const DOUBLECLICK_UNCONDITIONED_EXPERIMENTS = {
  FF_CANONICAL_CTL: '21061145',
  FF_CANONICAL_EXP: '21061146',
  IDENTITY_CONTROL: '21061304',
  IDENTITY_EXPERIMENT: '21061305',
};

/** @const @type {!Object<string,?string>} */
export const URL_EXPERIMENT_MAPPING = {
  '-1': MANUAL_EXPERIMENT_ID,
  '0': null,
  // Delay Request
  '3': DOUBLECLICK_EXPERIMENT_FEATURE.DELAYED_REQUEST_CONTROL,
  '4': DOUBLECLICK_EXPERIMENT_FEATURE.DELAYED_REQUEST,
  // Identity
  '5': DOUBLECLICK_EXPERIMENT_FEATURE.IDENTITY_CONTROL,
  '6': DOUBLECLICK_EXPERIMENT_FEATURE.IDENTITY_EXPERIMENT,
  // SRA
  '7': DOUBLECLICK_EXPERIMENT_FEATURE.SRA_CONTROL,
  '8': DOUBLECLICK_EXPERIMENT_FEATURE.SRA,
  // AMP Cache extension injection
  '9': DOUBLECLICK_EXPERIMENT_FEATURE.CACHE_EXTENSION_INJECTION_CONTROL,
  '10': DOUBLECLICK_EXPERIMENT_FEATURE.CACHE_EXTENSION_INJECTION_EXP,
};

/**
 * Class for checking whether a page/element is eligible for Fast Fetch.
 * Singleton class.
 * @visibleForTesting
 */
export class DoubleclickA4aEligibility {
  /**
   * Returns whether win supports native crypto. Is just a wrapper around
   * supportsNativeCrypto, but this way we can mock out for testing.
   * @param {!Window} win
   * @return {boolean}
   */
  supportsCrypto(win) {
    return supportsNativeCrypto(win);
  }

  /**
   * Returns whether we are running on the AMP CDN.
   * @param {!Window} win
   * @return {boolean}
   */
  isCdnProxy(win) {
    const googleCdnProxyRegex =
        /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org((\/.*)|($))+/;
    return googleCdnProxyRegex.test(win.location.origin);
  }

  /**
   * Attempts all unconditioned experiment selection.
   * @param {!Window} win
   * @param {!Element} element
   */
  unconditionedExperimentSelection(win, element) {
    this.selectAndSetUnconditionedExp(
        win, element,
        [DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.FF_CANONICAL_CTL,
          DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.FF_CANONICAL_EXP],
        UNCONDITIONED_CANONICAL_FF_EXPERIMENT_NAME);

    this.selectAndSetUnconditionedExp(
        win, element,
        [DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.IDENTITY_CONTROL,
          DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.IDENTITY_EXPERIMENT],
        UNCONDITIONED_IDENTITY_EXPERIMENT_NAME);
  }

  /**
   * Attempts to select into experiment and forces branch if selected.
   * @param {!Window} win
   * @param {!Element} element
   * @param {!Array<string>} branches
   * @param {!string} expName
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
   * @param {!boolean} useRemoteHtml
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
    const hasUSDRD = usdrd in element.dataset || element.hasAttribute(usdrd);
    if (hasUSDRD) {
      warnDeprecation(usdrd);
    }
    if (useRemoteHtml) {
      warnDeprecation('remote.html');
    }
    if (hasUSDRD || (useRemoteHtml && !element.getAttribute('rtc-config'))) {
      return false;
    }
    let experimentId;
    const urlExperimentId = extractUrlExperimentId(win, element);
    let experimentName = DFP_CANONICAL_FF_EXPERIMENT_NAME;
    if (!this.isCdnProxy(win)) {
      // Ensure that forcing FF via url is applied if test/localDev.
      if (urlExperimentId == -1 &&
          (getMode(win).localDev || getMode(win).test)) {
        experimentId = MANUAL_EXPERIMENT_ID;
      } else {
        let unconditionedExp;
        // For unconditioned canonical experiment, in the experiment branch
        // we allow Fast Fetch on non-CDN pages, but in the control we do not.
        if ((unconditionedExp = getExperimentBranch(
            win, UNCONDITIONED_CANONICAL_FF_EXPERIMENT_NAME))) {
          return unconditionedExp ==
              DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.FF_CANONICAL_EXP;
        }
        experimentId = this.maybeSelectExperiment(win, element, [
          DOUBLECLICK_EXPERIMENT_FEATURE.CANONICAL_CONTROL,
          DOUBLECLICK_EXPERIMENT_FEATURE.CANONICAL_EXPERIMENT,
        ], DFP_CANONICAL_FF_EXPERIMENT_NAME);
      }
      // If no experiment selected, return false.
      if (!experimentId) {
        return false;
      }
    } else {
      experimentName = DOUBLECLICK_A4A_EXPERIMENT_NAME;
      // See if in holdback control/experiment.
      if (urlExperimentId != undefined) {
        experimentId = URL_EXPERIMENT_MAPPING[urlExperimentId];
        // Do not select into Identity experiment if in corresponding
        // unconditioned experiment.
        if ((experimentId == DOUBLECLICK_EXPERIMENT_FEATURE.IDENTITY_CONTROL ||
             experimentId ==
             DOUBLECLICK_EXPERIMENT_FEATURE.IDENTITY_EXPERIMENT) &&
            getExperimentBranch(win, UNCONDITIONED_IDENTITY_EXPERIMENT_NAME)) {
          experimentId = null;
        } else {
          dev().info(
              TAG,
              `url experiment selection ${urlExperimentId}: ${experimentId}.`);
        }
      }
    }
    if (experimentId) {
      addExperimentIdToElement(experimentId, element);
      forceExperimentBranch(win, DOUBLECLICK_A4A_EXPERIMENT_NAME, experimentId);
    }
    return DOUBLECLICK_EXPERIMENT_FEATURE.CANONICAL_CONTROL != experimentId;
  }

  /**
   * @param {!Window} win
   * @param {!Element} element
   * @param {!Array<string>} selectionBranches
   * @param {!string} experimentName}
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
 * @param {!boolean} useRemoteHtml
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
