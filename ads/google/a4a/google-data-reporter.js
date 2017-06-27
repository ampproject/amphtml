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

import {
  EXPERIMENT_ATTRIBUTE,
  QQID_HEADER,
  isReportingEnabled,
} from './utils';
import {BaseLifecycleReporter, GoogleAdLifecycleReporter} from './performance';
import {
  getExperimentBranch,
  randomlySelectUnsetExperiments,
} from '../../../src/experiments';
import {
    ADSENSE_A4A_EXPERIMENT_NAME,
} from '../../../extensions/amp-ad-network-adsense-impl/0.1/adsense-a4a-config';
import {
  DOUBLECLICK_A4A_EXPERIMENT_NAME,
} from '../../../extensions/amp-ad-network-doubleclick-impl/0.1/doubleclick-a4a-config'; // eslint-disable-line max-len

/**
 * An experiment config for controlling profiling.  Profiling has no branches:
 * it's either on or off for a given page.  The off state is controlled by the
 * general traffic-experiments mechanism and is configured via the
 * a4aProfilingRate property of the global config(s),
 * build-system/global-configs/{canary,prod}-config.js.  This object is just
 * necessary for the page-level-experiments.js API, which expects a branch list
 * for each experiment.  We assign all pages to the "control" branch
 * arbitrarily.
 *
 * @const {!Object<string,!../../../src/experiments.ExperimentInfo>}
 */
export const PROFILING_BRANCHES = {
  a4aProfilingRate: {
    isTrafficEligible: () => true,
    branches: ['unused', 'unused'],
  },
};

/**
 * @param {!AMP.BaseElement} ampElement The element on whose lifecycle this
 *    reporter will be reporting.
 * @param {number|string} slotId A unique numeric identifier in the page for
 *    the given element's slot.
 * @return {!./performance.BaseLifecycleReporter}
 * @visibleForTesting
 */
export function getLifecycleReporter(ampElement, slotId) {
  const win = ampElement.win;
  randomlySelectUnsetExperiments(win, PROFILING_BRANCHES);
  if (isReportingEnabled(ampElement) &&
      (!!getExperimentBranch(win, DOUBLECLICK_A4A_EXPERIMENT_NAME) ||
       !!getExperimentBranch(win, ADSENSE_A4A_EXPERIMENT_NAME))) {
    return new GoogleAdLifecycleReporter(
      win, ampElement.element, Number(slotId));
  } else {
    return new BaseLifecycleReporter();
  }
}

/**
 * Creates or reinitializes a lifecycle reporter for Google ad network
 * implementations.  (I.e., 'type="doubleclick"' and 'type="adsense"'.)  For
 * non-Google networks, returns a BaseLifecycleReporter -- a stub reporter that
 * generates no outputs.
 *
 * @param {!../../../extensions/amp-a4a/0.1/amp-a4a.AmpA4A|!../../../extensions/amp-ad/0.1/amp-ad-3p-impl.AmpAd3PImpl} baseInstance
 * @return {!./performance.BaseLifecycleReporter}
 */
export function googleLifecycleReporterFactory(baseInstance) {
  const reporter = getLifecycleReporter(
      baseInstance, baseInstance.element.getAttribute('data-amp-slot-index'));
  reporter.setPingParameters({
    's': 'AD_SLOT_NAMESPACE',
    'dt': 'NAV_TIMING(navigationStart)',
    'v': '2',
    'c': 'AD_PAGE_CORRELATOR',
    'rls': 'AMP_VERSION',
    'v_h': 'VIEWPORT_HEIGHT',
    's_t': 'SCROLL_TOP',
    'slotId': 'AD_SLOT_ID',
    'stageName': 'AD_SLOT_EVENT_NAME',
    'stageIdx': 'AD_SLOT_EVENT_ID',
    'met.AD_SLOT_NAMESPACE.AD_SLOT_ID':
        'AD_SLOT_EVENT_NAME.AD_SLOT_TIME_TO_EVENT',
    'e.AD_SLOT_ID': baseInstance.element.getAttribute(EXPERIMENT_ATTRIBUTE),
    'adt.AD_SLOT_ID': baseInstance.element.getAttribute('type'),
    // Page-level visibility times: `firstVisibleTime.T,.lastVisibleTime.T`.
    'met.AD_SLOT_NAMESPACE':
        'firstVisibleTime.AD_PAGE_FIRST_VISIBLE_TIME' +
        ',lastVisibleTime.AD_PAGE_LAST_VISIBLE_TIME',
  });
  return reporter;
}


/**
 * Sets reportable variables from ad response headers.
 *
 * @param {!../../../src/service/xhr-impl.FetchResponseHeaders} headers
 * @param {!./performance.GoogleAdLifecycleReporter} reporter
 */
export function setGoogleLifecycleVarsFromHeaders(headers, reporter) {
  // This is duplicated from the amp-a4a.js implementation.  It needs to be
  // defined there because it's an implementation detail of that module, but
  // we want to report it to Google b/c we're interested in how rendering mode
  // affects Google ads.  However, we can't directly reference a variable
  // in extensions/ from here.
  const renderingMethodHeader = 'X-AmpAdRender';
  const renderingMethodKey = 'rm.AD_SLOT_ID';
  const qqidKey = 'qqid.AD_SLOT_ID';
  const pingParameters = new Object(null);
  pingParameters[qqidKey] = headers.get(QQID_HEADER);
  pingParameters[renderingMethodKey] = headers.get(renderingMethodHeader);
  reporter.setPingParameters(pingParameters);
}
