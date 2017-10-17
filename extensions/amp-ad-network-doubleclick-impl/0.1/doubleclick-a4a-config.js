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
export const DOUBLECLICK_UNCONDITIONED_EXPERIMENT_NAME =
    'expUnconditionedDoubleclick';

/** @type {string} */
const TAG = 'amp-ad-network-doubleclick-impl';

/** @const @enum{string} */
export const DOUBLECLICK_EXPERIMENT_FEATURE = {
  HOLDBACK_EXTERNAL_CONTROL: '21060726',
  HOLDBACK_EXTERNAL: '21060727',
  DELAYED_REQUEST_CONTROL: '21060728',
  DELAYED_REQUEST: '21060729',
  SRA_CONTROL: '117152666',
  SRA: '117152667',
  HOLDBACK_INTERNAL_CONTROL: '2092613',
  HOLDBACK_INTERNAL: '2092614',
  CANONICAL_CONTROL: '21060932',
  CANONICAL_EXPERIMENT: '21060933',
  CACHE_EXTENSION_INJECTION_CONTROL: '21060955',
  CACHE_EXTENSION_INJECTION_EXP: '21060956',
  IDENTITY_CONTROL: '21060937',
  IDENTITY_EXPERIMENT: '21060938',
};

export const DOUBLECLICK_UNCONDITIONED_EXPERIMENTS = {
  FF_CANONICAL_CTL: '21061145',
  FF_CANONICAL_EXP: '21061146',
};

/** @const @type {!Object<string,?string>} */
export const URL_EXPERIMENT_MAPPING = {
  '-1': MANUAL_EXPERIMENT_ID,
  '0': null,
  // Holdback
  '1': DOUBLECLICK_EXPERIMENT_FEATURE.HOLDBACK_EXTERNAL_CONTROL,
  '2': DOUBLECLICK_EXPERIMENT_FEATURE.HOLDBACK_EXTERNAL,
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

/** @typedef {{
    forceExperimentId: (string|undefined),
    experimentName: !string,
    diversionCriteria: (Function|undefined),
    experimentBranchIds: (!Array<string>|undefined)}} */
let A4A_EXPERIMENT_TYPE;

/**
 * Class for checking whether a page/element is eligible for Fast Fetch.
 * Singleton class.
 * @visibleForTesting
 */
export class DoubleclickA4aEligibility {
  constructor() {
    this.activeExperiments_ = {};
  }
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
   * Attempts to select into all A4A experiments as defined in the two arrays
   * of experiments: unconditionedExperiments and conditionedExperiments.
   * @param {!Window} win
   * @param {!Element} element
   * @param {!boolean} useRemoteHtml
   */
  selectA4aExperiments(win, element, useRemoteHtml) {
    const urlExperimentId = extractUrlExperimentId(win, element);
    const isFastFetchEligible =
          !((useRemoteHtml && !element.getAttribute('rtc-config')) ||
            'useSameDomainRenderingUntilDeprecated' in element.dataset ||
            element.hasAttribute('useSameDomainRenderingUntilDeprecated'));
    const isCdnProxy = this.isCdnProxy(win);
    const isDevMode = (getMode(win).localDev || getMode(win).test);
    const hasBetaAttribute = element.hasAttribute(BETA_ATTRIBUTE);

    /**
     * Definition of unconditioned A4A experiments. For a given experiment, we will
     * attempt to select into the experiment unconditionally.
     */
    /** @type {!Array<A4A_EXPERIMENT_TYPE>} */
    const unconditionedExperiments = [
      /****** CANONICAL FAST FETCH UNCONDITIONED EXPERIMENT *******************/
      {experimentBranchIds: [
        DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.FF_CANONICAL_CTL,
        DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.FF_CANONICAL_EXP],
        experimentName: DOUBLECLICK_UNCONDITIONED_EXPERIMENT_NAME},
    ];
    /**
     * Definition of A4A experiments. For each experiment, if forceExperimentBranch is
     * provided, then if the diversion criteria passes, we force on that experiment.
     * If experimentBranchIds is provided, then if the diversionCriteria passes, we
     * attempt to randomly select into one of the provided experiment branch IDs.
     */
    /** @type {!Array<A4A_EXPERIMENT_TYPE>} */
    const conditionedExperiments = [
      /************************** MANUAL EXPERIMENT ***************************/
      {forceExperimentId: MANUAL_EXPERIMENT_ID,
        experimentName: DOUBLECLICK_A4A_EXPERIMENT_NAME,
        diversionCriteria: () => {
          return isFastFetchEligible && !isCdnProxy && urlExperimentId == -1
             && isDevMode;
        }},
      /****************** CANONICAL FAST FETCH EXPERIMENT *********************/
      {experimentBranchIds: [DOUBLECLICK_EXPERIMENT_FEATURE.CANONICAL_CONTROL,
        DOUBLECLICK_EXPERIMENT_FEATURE.CANONICAL_EXPERIMENT],
        experimentName: DFP_CANONICAL_FF_EXPERIMENT_NAME,
        diversionCriteria: () => {
          return isFastFetchEligible && !isCdnProxy &&
             (urlExperimentId != -1 || !isDevMode) &&
             !this.activeExperiments_[
                 DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.FF_CANONICAL_CTL] &&
             !this.activeExperiments_[
                 DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.FF_CANONICAL_EXP];
        }},
      /******************* HOLDBACK INTERNAL EXPERIMENT ***********************/
      {experimentBranchIds: [
        DOUBLECLICK_EXPERIMENT_FEATURE.HOLDBACK_INTERNAL_CONTROL,
        DOUBLECLICK_EXPERIMENT_FEATURE.HOLDBACK_INTERNAL,
      ],
        experimentName: DOUBLECLICK_A4A_EXPERIMENT_NAME,
        diversionCriteria: () => {
          return isFastFetchEligible && isCdnProxy &&
             urlExperimentId == undefined && !hasBetaAttribute;
        },
      },
      /****************** URL EXPERIMENT SELECTION ****************************/
      {forceExperimentId: urlExperimentId ?
       URL_EXPERIMENT_MAPPING[urlExperimentId] : null,
        experimentName: DOUBLECLICK_A4A_EXPERIMENT_NAME,
        diversionCriteria: () => {
          return isFastFetchEligible && isCdnProxy &&
              urlExperimentId != undefined && !hasBetaAttribute;
        },
      },
      /***************** BETA EXPERIMENT SELECTION ****************************/
      {forceExperimentId: BETA_EXPERIMENT_ID,
        experimentName: DOUBLECLICK_A4A_EXPERIMENT_NAME,
        diversionCriteria: () => {
          return isFastFetchEligible && isCdnProxy && hasBetaAttribute;
        },
      },
    ];
    /********* Unconditioned Experiment Selection *******************************/
    this.experimentSelection(win, element, unconditionedExperiments);
    /********** Conditioned Experiment Selection *******************************/
    this.experimentSelection(win, element, conditionedExperiments);
  }

  /**
   * Attempts to select into all A4A experiments as defined in the two arrays
   * of experiments: unconditionedExperiments and conditionedExperiments.
   * @param {!Window} win
   * @param {!Element} element
   * @param {!Array<A4A_EXPERIMENT_TYPE>} experiments
   */
  experimentSelection(win, element, experiments) {
    let experimentId;
    experiments.forEach(experiment => {
      // If diversionCriteria is undefined, then it is an unconditioned experiment.
      if ((experiment.diversionCriteria && experiment.diversionCriteria()) ||
          experiment.diversionCriteria == undefined) {
        experimentId = experiment.forceExperimentId ||
            this.maybeSelectExperiment(
                win, element,
                /** @type {!Array<string>}*/(experiment.experimentBranchIds),
                experiment.experimentName);
        if (!!experimentId) {
          addExperimentIdToElement(experimentId, element);
          forceExperimentBranch(win, experiment.experimentName, experimentId);
          this.activeExperiments_[experimentId] = true;
        }
      }
    });
  }

  /**
   * @param {!Window} win
   * @param {!Element} element
   * @param {!boolean} useRemoteHtml
   * @return {boolean}
   */
  fastFetchSelection(win, element, useRemoteHtml) {
    const urlExperimentId = extractUrlExperimentId(win, element);
    const isDevMode = (getMode(win).localDev || getMode(win).test);
    /************ FF Selection Criteria for Unconditioned Exp *************/
    const fastFetchExperimentConditions = {};
    fastFetchExperimentConditions[
      DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.FF_CANONICAL_EXP] = () => {
        return !((useRemoteHtml && !element.getAttribute('rtc-config')) ||
               'useSameDomainRenderingUntilDeprecated' in element.dataset ||
               element.hasAttribute('useSameDomainRenderingUntilDeprecated')) &&
            !this.isCdnProxy(win) && (urlExperimentId != -1 || !isDevMode);
      };
    /******************* Fast Fetch Experiment Branches *******************/
    const exp = DOUBLECLICK_EXPERIMENT_FEATURE;
    const fastFetchBranches = [
      exp.HOLDBACK_EXTERNAL_CONTROL,
      exp.DELAYED_REQUEST,
      exp.DELAYED_REQUEST_CONTROL,
      exp.SRA_CONTROL,
      exp.SRA,
      exp.HOLDBACK_INTERNAL_CONTROL,
      exp.CANONICAL_EXPERIMENT,
      exp.CACHE_EXTENSION_INJECTION_EXP,
      exp.CACHE_EXTENSION_INJECTION_CONTROL,
      exp.IDENTITY_EXPERIMENT,
      exp.IDENTITY_CONTROL,
      MANUAL_EXPERIMENT_ID,
    ];
    /***************** Delayed Fetch Experiment Branches ******************/
    const delayedFetchBranches = [
      exp.HOLDBACK_EXTERNAL,
      exp.HOLDBACK_INTERNAL,
      exp.CANONICAL_CONTROL,
      DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.FF_CANONICAL_CTL,
    ];

    /**** For unconditioned experiments, attempt to select into Fast Fetch */
    const activeExpIds = Object.keys(this.activeExperiments_);
    for (const expId in this.activeExperiments_) {
      if (fastFetchExperimentConditions[expId]) {
        return fastFetchExperimentConditions[expId]();
      }
    }
    /**
     *  If in a conditioned experiment, select based on whether the branch is
     *  designated as a Fast Fetch or Delayed Fetch branch.
     */
    for (const expId in this.activeExperiments_) {
      if (fastFetchBranches.includes(expId) ||
          delayedFetchBranches.includes(expId)) {
        return fastFetchBranches.includes(expId);
      }
    }
    /************** Default Fast Fetch Selection ***************************/
    return !(useRemoteHtml && !element.getAttribute('rtc-config')) &&
        !('useSameDomainRenderingUntilDeprecated' in element.dataset) &&
        !element.hasAttribute('useSameDomainRenderingUntilDeprecated') &&
        this.isCdnProxy(win);
  }

  /** Whether Fast Fetch is enabled
   * @param {!Window} win
   * @param {!Element} element
   * @param {!boolean} useRemoteHtml
   * @return {boolean}
   */
  isA4aEnabled(win, element, useRemoteHtml) {
    this.selectA4aExperiments(win, element, useRemoteHtml);
    return this.fastFetchSelection(win, element, useRemoteHtml);
  }

  /**
   * @param {!Window} win
   * @param {!Element} element
   * @param {!Array<string>} selectionBranches
   * @param {!string} experimentName}
   * @return {?string} Experiment branch ID or null if not selected.
   * @visibleForTesting
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

/** @type {!DoubleclickA4aEligibility} */
let singleton = new DoubleclickA4aEligibility();

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
 * Resets state of singleton.
 */
export function resetForTesting() {
  singleton = new DoubleclickA4aEligibility();
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
