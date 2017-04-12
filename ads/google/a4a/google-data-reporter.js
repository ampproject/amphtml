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

import {EXPERIMENT_ATTRIBUTE, QQID_HEADER} from './utils';
import {BaseLifecycleReporter, GoogleAdLifecycleReporter} from './performance';
import {getMode} from '../../../src/mode';
import {isExperimentOn, toggleExperiment} from '../../../src/experiments';

import {
    parseExperimentIds,
    isInManualExperiment,
    randomlySelectUnsetPageExperiments,
} from './traffic-experiments';
import {
    ADSENSE_A4A_EXTERNAL_EXPERIMENT_BRANCHES,
    ADSENSE_A4A_INTERNAL_EXPERIMENT_BRANCHES,
} from '../../../extensions/amp-ad-network-adsense-impl/0.1/adsense-a4a-config';
import {
    DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH,
    DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH,
    DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH,
    DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH,
} from '../../../extensions/amp-ad-network-doubleclick-impl/0.1/doubleclick-a4a-config';  // eslint-disable-line max-len

/**
 * An experiment config for controlling profiling.  Profiling has no branches:
 * it's either on or off for a given page.  The off state is controlled by the
 * general traffic-experiments mechanism and is configured via the
 * a4aProfilingRate property of the global config(s),
 * build-system/global-configs/{canary,prod}-config.js.  This object is just
 * necessary for the traffic-experiments.js API, which expects a branch list
 * for each experiment.  We assign all pages to the "control" branch
 * arbitrarily.
 *
 * @const {!Object<string,!./traffic-experiments.ExperimentInfo>}
 */
export const PROFILING_BRANCHES = {
  a4aProfilingRate: {
    control: 'unused',
    experiment: 'unused',
  },
};

/**
 * Set of namespaces that can be set for lifecycle reporters.
 *
 * @enum {string}
 */
export const ReporterNamespace = {
  A4A: 'a4a',
  AMP: 'amp',
};

/**
 * Check whether the element is in an experiment branch that is eligible for
 * monitoring.
 *
 * @param {!AMP.BaseElement} ampElement
 * @param {!string} namespace
 * @returns {boolean}
 */
function isInReportableBranch(ampElement, namespace) {
  // Handle the possibility of multiple eids on the element.
  const eids = parseExperimentIds(
      ampElement.element.getAttribute(EXPERIMENT_ATTRIBUTE));
  const reportableA4AEids = {
    [ADSENSE_A4A_EXTERNAL_EXPERIMENT_BRANCHES.experiment]: 1,
    [ADSENSE_A4A_INTERNAL_EXPERIMENT_BRANCHES.experiment]: 1,
    [DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH.experiment]: 1,
    [DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH.experiment]: 1,
    [DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH.experiment]: 1,
    [DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH.experiment]: 1,
  };
  const reportableControlEids = {
    [ADSENSE_A4A_EXTERNAL_EXPERIMENT_BRANCHES.control]: 1,
    [ADSENSE_A4A_INTERNAL_EXPERIMENT_BRANCHES.control]: 1,
    [DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH.control]: 1,
    [DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH.control]: 1,
    [DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH.control]: 1,
    [DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH.control]: 1,
  };
  switch (namespace) {
    case ReporterNamespace.A4A:
      return eids.some(x => { return x in reportableA4AEids; }) ||
          isInManualExperiment(ampElement.element);
    case ReporterNamespace.AMP:
      return eids.some(x => { return x in reportableControlEids; });
    default:
      return false;
  }
}

/**
 * @param {!AMP.BaseElement} ampElement The element on whose lifecycle this
 *    reporter will be reporting.
 * @param {string} namespace
 * @param {number|string} slotId A unique numeric identifier in the page for
 *    the given element's slot.
 * @return {!GoogleAdLifecycleReporter|!BaseLifecycleReporter}
 */
export function getLifecycleReporter(ampElement, namespace, slotId) {
  // Carve-outs: We only want to enable profiling pingbacks when:
  //   - The ad is from one of the Google networks (AdSense or Doubleclick).
  //   - The ad slot is in the A4A-vs-3p amp-ad control branch (either via
  //     internal, client-side selection or via external, Google Search
  //     selection).
  //   - We haven't turned off profiling via the rate controls in
  //     build-system/global-config/{canary,prod}-config.json
  // If any of those fail, we use the `BaseLifecycleReporter`, which is a
  // a no-op (sends no pings).
  const type = ampElement.element.getAttribute('type');
  const win = ampElement.win;
  const experimentName = 'a4aProfilingRate';
  // In local dev mode, neither the canary nor prod config files is available,
  // so manually set the profiling rate, for testing/dev.
  if (getMode().localDev) {
    toggleExperiment(win, experimentName, true, true);
  }
  randomlySelectUnsetPageExperiments(win, PROFILING_BRANCHES);
  if ((type == 'doubleclick' || type == 'adsense') &&
      isInReportableBranch(ampElement, namespace) &&
      isExperimentOn(win, experimentName)) {
    return new GoogleAdLifecycleReporter(win, ampElement.element, namespace,
        Number(slotId));
  } else {
    return new BaseLifecycleReporter();
  }
}

/**
 * Creates or reinitializes a lifecycle reporter for Google ad network
 * implementations.
 *
 * @param {!../../../extensions/amp-a4a/0.1/amp-a4a.AmpA4A} a4aElement
 * @return {!./performance.GoogleAdLifecycleReporter}
 */
export function googleLifecycleReporterFactory(a4aElement) {
  const reporter =
      /** @type {!./performance.GoogleAdLifecycleReporter} */
      (getLifecycleReporter(a4aElement, ReporterNamespace.A4A,
          a4aElement.element.getAttribute('data-amp-slot-index')));
  reporter.setPingParameters({
    's': 'AD_SLOT_NAMESPACE',
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
    'e.AD_SLOT_ID': a4aElement.element.getAttribute(EXPERIMENT_ATTRIBUTE),
    'adt.AD_SLOT_ID': a4aElement.element.getAttribute('type'),
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

