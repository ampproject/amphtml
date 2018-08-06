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
  isExperimentOn,
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
import {selectAndSetExperiments} from '../../../ads/google/a4a/experiment-utils';
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
  DF_DEP_HOLDBACK_CONTROL: '21061787',
  DF_DEP_HOLDBACK_EXPERIMENT: '21061788',
};

/** @const {string} */
export const dfDepRollbackExperiment = 'rollback-delayed-fetch-deprecation';

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
  // Delayed Fetch Deprecation Launch Holdback
  '5': DOUBLECLICK_EXPERIMENT_FEATURE.DF_DEP_HOLDBACK_CONTROL,
  '6': DOUBLECLICK_EXPERIMENT_FEATURE.DF_DEP_HOLDBACK_EXPERIMENT,
  // SRA
  '7': DOUBLECLICK_EXPERIMENT_FEATURE.SRA_CONTROL,
  '8': DOUBLECLICK_EXPERIMENT_FEATURE.SRA,
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
    selectAndSetExperiments(
        win, element,
        [DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.CANONICAL_HLDBK_CTL,
          DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.CANONICAL_HLDBK_EXP],
        UNCONDITIONED_CANONICAL_FF_HOLDBACK_EXP_NAME);
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
        TAG, `${feature} is no longer supported for DoubleClick.` +
          'Please refer to ' +
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
    const urlExperimentId = extractUrlExperimentId(win, element) || '';
    if (!this.isCdnProxy(win)) {
      // Ensure that forcing FF via url is applied if test/localDev.
      if (urlExperimentId == -1 &&
          (getMode(win).localDev || getMode(win).test)) {
        experimentId = MANUAL_EXPERIMENT_ID;
      } else {
        // For unconditioned canonical holdback, in the control branch we allow
        // Fast Fetch on non-CDN pages, but in the experiment we do not.
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
      if (urlExperimentId != undefined) {
        experimentId = URL_EXPERIMENT_MAPPING[urlExperimentId];
        // For SRA experiments, do not include pages that are using refresh.
        if ((experimentId == DOUBLECLICK_EXPERIMENT_FEATURE.SRA_CONTROL ||
          experimentId == DOUBLECLICK_EXPERIMENT_FEATURE.SRA) &&
          (win.document.querySelector('meta[name=amp-ad-enable-refresh]') ||
           win.document.querySelector(
               'amp-ad[type=doubleclick][data-enable-refresh]'))) {
          experimentId = undefined;
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

    // If we need to rollback the launch, or we are in the launch's holdback
    // experiment, still use Delayed Fetch if USDRUD or custom remote.html in
    // use
    if (isExperimentOn(win, dfDepRollbackExperiment) ||
        experimentId ==
        DOUBLECLICK_EXPERIMENT_FEATURE.DF_DEP_HOLDBACK_EXPERIMENT) {
      return !!element.getAttribute('rtc-config') ||
          !(hasUSDRD || useRemoteHtml);
    }
    return true;
  }

}

/** @const {!DoubleclickA4aEligibility} */
const singleton = new DoubleclickA4aEligibility();

/**
 * @param {!Window} win
 * @param {!Element} element
 * @param {boolean} useRemoteHtml
 * @return {boolean}
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
