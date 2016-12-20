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

import {EXPERIMENT_ATTRIBUTE, getCorrelator, QQID_HEADER} from './utils';
import {BaseLifecycleReporter, GoogleAdLifecycleReporter} from './performance';
import {getMode} from '../../../src/mode';
import {isExperimentOn} from '../../../src/experiments';

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
    DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES,
    DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES,
} from '../../../extensions/amp-ad-network-doubleclick-impl/0.1/doubleclick-a4a-config';  // eslint-disable-line max-len

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
    [DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES.experiment]: 1,
    [DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES.experiment]: 1,
  };
  const reportableControlEids = {
    [ADSENSE_A4A_EXTERNAL_EXPERIMENT_BRANCHES.control]: 1,
    [ADSENSE_A4A_INTERNAL_EXPERIMENT_BRANCHES.control]: 1,
    [DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES.control]: 1,
    [DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES.control]: 1,
  };
  if (namespace == 'a4a' &&
      (eids.some(x => { return x in reportableA4AEids; }) ||
      isInManualExperiment(ampElement.element))) {
    return true;
  } else if (namespace == 'amp' &&
      eids.some(x => { return x in reportableControlEids; })) {
    return true;
  } else {
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
  // In local dev mode, neither the canary nor prod config files is available,
  // so manually set the profiling rate, for testing/dev.
  if (getMode().localDev &&
      (!win.AMP_CONFIG || !win.AMP_CONFIG['a4aProfilingRate'])) {
    win.AMP_CONFIG = win.AMP_CONFIG || {};
    win.AMP_CONFIG['a4aProfilingRate'] = 1.0;
  }
  randomlySelectUnsetPageExperiments(win, win.AMP_CONFIG['a4aProfilingRate']);
  if ((type == 'doubleclick' || type == 'adsense') &&
      isInReportableBranch(ampElement, namespace) &&
      isExperimentOn(win, 'a4aProfilingRate')) {
    const correlator = getCorrelator(win);
    return new GoogleAdLifecycleReporter(win, ampElement.element, namespace,
        correlator, Number(slotId));
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
      (getLifecycleReporter(a4aElement, 'a4a',
          a4aElement.element.getAttribute('data-amp-slot-index')));
  const slotId = reporter.getSlotId();
  reporter.setPingParameters({
    'v_h': 'VIEWPORT_HEIGHT',
    's_t': 'SCROLL_TOP',
    'e': a4aElement.element.getAttribute(EXPERIMENT_ATTRIBUTE),
  });
  reporter.setPingParameter(
      `adt.${slotId}`, a4aElement.element.getAttribute('type'));
  return reporter;
}


/**
 * Sets reportable variables from ad response headers.
 *
 * @param {!FetchResponseHeaders} headers
 * @param {!./performance.GoogleAdLifecycleReporter} reporter
 */
export function setGoogleLifecycleVarsFromHeaders(headers, reporter) {
  // This is duplicated from the amp-a4a.js implementation.  It needs to be
  // defined there because it's an implementation detail of that module, but
  // we want to report it to Google b/c we're interested in how rendering mode
  // affects Google ads.  However, we can't directly reference a variable
  // in extensions/ from here.
  const renderingMethodHeader = 'X-AmpAdRender';
  const renderingMethodKey = `rm.${reporter.getSlotId()}`;
  const qqidKey = `qqid.${reporter.getSlotId()}`;
  const pingParameters = new Object(null);
  pingParameters[qqidKey] = headers.get(QQID_HEADER);
  pingParameters[renderingMethodKey] = headers.get(renderingMethodHeader);
  reporter.setPingParameters(pingParameters);
}

