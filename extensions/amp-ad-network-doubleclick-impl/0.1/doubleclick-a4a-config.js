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
import {dev} from '../../../src/log';

/** @const {string} */
export const DOUBLECLICK_A4A_EXPERIMENT_NAME = 'expDoubleclickA4A';

/** @const {string} */
export const DFP_CANONICAL_FF_EXPERIMENT_NAME = 'expDfpCanonicalFf';

/** @const {string} */
export const DFP_UNCONDITIONED_CANONICAL_FF_EXPERIMENT_NAME =
    'expUnconditionedCanonical';

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

/** @const {string} */
export const BETA_ATTRIBUTE = 'data-use-beta-a4a-implementation';

/** @const {string} */
export const BETA_EXPERIMENT_ID = '2077831';

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

  /** Whether Fast Fetch is enabled
   * @param {!Window} win
   * @param {!Element} element
   * @param {!boolean} useRemoteHtml
   * @return {boolean}
   */
  isA4aEnabled(win, element, useRemoteHtml) {
    let experimentId = this.maybeSelectExperiment(
        win, element,[DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.FF_CANONICAL_CTL,
          DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.FF_CANONICAL_EXP],
        DFP_UNCONDITIONED_CANONICAL_FF_EXPERIMENT_NAME);
    if (!!experimentId) {
      addExperimentIdToElement(experimentId, element);
      forceExperimentBranch(
          win, DFP_CANONICAL_FF_EXPERIMENT_NAME, experimentId);
    }

    if ('useSameDomainRenderingUntilDeprecated' in element.dataset ||
        element.hasAttribute('useSameDomainRenderingUntilDeprecated')) {
      return false;
    }
    const urlExperimentId = extractUrlExperimentId(win, element);
    let experimentName = DFP_CANONICAL_FF_EXPERIMENT_NAME;

    if (!this.isCdnProxy(win)) {
      // Ensure that forcing FF via url is applied if test/localDev.
      if (urlExperimentId == -1 &&
          (getMode(win).localDev || getMode(win).test)) {
        experimentId = MANUAL_EXPERIMENT_ID;
      } else {
        // For unconditioned canonical experiment, in the experiment branch
        // we allow Fast Fetch on non-CDN pages, but in the control we do not.
        if ([DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.FF_CANONICAL_CTL,
          DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.FF_CANONICAL_EXP,
        ].includes(experimentId)) {
          return experimentId ==
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
      if (element.hasAttribute(BETA_ATTRIBUTE)) {
        addExperimentIdToElement(BETA_EXPERIMENT_ID, element);
        dev().info(TAG, `beta forced a4a selection ${element}`);
        return true;
      }
      experimentName = DOUBLECLICK_A4A_EXPERIMENT_NAME;
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
 * @param {!DOUBLECLICK_EXPERIMENT_FEATURE} feature
 * @param {string=} opt_experimentName
 * @return {boolean} whether feature is enabled
 */
export function experimentFeatureEnabled(win, feature, opt_experimentName) {
  const experimentName = opt_experimentName || DOUBLECLICK_A4A_EXPERIMENT_NAME;
  return getExperimentBranch(win, experimentName) == feature;
}
