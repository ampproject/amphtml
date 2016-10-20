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
import {isExperimentOn} from '../../../src/experiments';
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';

/**
 * This module provides a fairly crude form of performance monitoring (or
 * profiling) for A4A code.  It generates individual pings back to Google
 * servers at key points in the A4A lifecycle and at a few points in the 3p
 * amp-ad lifecycle, for baseline.
 *
 * This is intended to be a short-term solution, for a rough-and-ready form
 * of profiling.  In particular, it doesn't use high-resolution timers (when
 * they're available) and it doesn't queue pings for network efficiency.  A
 * better long-term solution is to integrate `src/performance.js` with
 * `amp-analytics`.  However, we need a short-term solution quickly.  This
 * module should go away once we have verified that A4A is performing as
 * desired.
 */

/**
 * Header name for per-ad-slot QQid.
 * @type {string}
 */
export const QQID_HEADER = 'X-QQID';

/** @private */
const PINGBACK_ADDRESS = 'https://csi.gstatic.com/csi';

/** @private */
const LIFECYCLE_STAGES = {
  // Note: Use strings as values here, rather than numbers, so that "0" does
  // not test as `false` later.
  adSlotBuilt: '0',
  urlBuilt: '1',
  adRequestStart: '2',
  adRequestEnd: '3',
  extractCreativeAndSignature: '4',
  adResponseValidateStart: '5',
  renderFriendlyStart: '6',
  renderCrossDomainStart: '7',
  renderFriendlyEnd: '8',
  renderCrossDomainEnd: '9',
  preAdThrottle: '10',
  renderSafeFrameStart: '11',
  adSlotCleared: '20',
};

export const PROFILING_RATE = {
  a4aProfilingRate: {on: 1},
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
  const eid = ampElement.element.getAttribute(EXPERIMENT_ATTRIBUTE);
  if (namespace == 'a4a' &&
      ((eid == ADSENSE_A4A_EXTERNAL_EXPERIMENT_BRANCHES.experiment) ||
       (eid == ADSENSE_A4A_INTERNAL_EXPERIMENT_BRANCHES.experiment) ||
       (eid == DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES.experiment) ||
       (eid == DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES.experiment) ||
       isInManualExperiment(ampElement.element))) {
    return true;
  } else if (namespace == 'amp' &&
             ((eid == ADSENSE_A4A_EXTERNAL_EXPERIMENT_BRANCHES.control) ||
              (eid == ADSENSE_A4A_INTERNAL_EXPERIMENT_BRANCHES.control) ||
              (eid == DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES.control) ||
              (eid == DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES.control))) {
    return true;
  } else {
    return false;
  }
}

/**
 * @return {!AmpAdLifecycleReporter|!NullLifecycleReporter}
 */
export function getLifecycleReporter(ampElement, namespace) {
  // Carve-outs: We only want to enable profiling pingbacks when:
  //   - The ad is from one of the Google networks (AdSense or Doubleclick).
  //   - The ad slot is in the A4A-vs-3p amp-ad control branch (either via
  //     internal, client-side selection or via external, Google Search
  //     selection).
  //   - We haven't turned off profiling via the rate controls in
  //     build-system/global-config/{canary,prod}-config.json
  // If any of those fail, we use the `NullLifecycleReporter`, which is a
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
  randomlySelectUnsetPageExperiments(win, PROFILING_RATE);
  if ((type == 'doubleclick' || type == 'adsense') &&
      isInReportableBranch(ampElement, namespace) &&
      isExperimentOn(win, 'a4aProfilingRate')) {
    return new AmpAdLifecycleReporter(win, ampElement.element, 'a4a');
  } else {
    return new NullLifecycleReporter();
  }
}

export class AmpAdLifecycleReporter {

  /**
   * @param {!Window} win  Parent window object.
   * @param {!Element} element  Parent element object.
   * @param {string} namespace  Namespace for page-level info.  (E.g.,
   *   'amp' vs 'a4a'.)
   */
  constructor(win, element, namespace) {
    this.win_ = win;
    this.element_ = element;
    this.namespace_ = namespace;
    this.win_.ampAdSlotId = this.win_.ampAdSlotId || 0;
    this.win_.ampAdPageCorrelator = this.win_.ampAdPageCorrelator ||
        Math.floor(Math.pow(2, 52) * Math.random());
    this.slotId_ = this.win_.ampAdSlotId++;
    this.slotName_ = this.namespace_ + '.' + this.slotId_;
    this.qqid_ = null;
    this.initTime_ = Date.now();
    this.pingbackAddress_ = PINGBACK_ADDRESS;
  }

  /**
   * @param {string} qqid
   */
  setQqid(qqid) {
    this.qqid_ = qqid;
  }

  /**
   * Sets the address to which pings will be sent, overriding
   * `PINGBACK_ADDRESS`.  Intended for testing.
   * @param {string} address
   * @visibleForTesting
   */
  setPingAddress(address) {
    this.pingbackAddress_ = address;
  }

  /**
   * @param {string} name  Stage name to ping out.  Should be one of the ones
   * from `LIFECYCLE_STAGES`.  If it's an unknown name, it will still be pinged,
   * but the stage ID will be set to `9999`.
   */
  sendPing(name) {
    this.emitPing_(this.buildPingAddress_(name));
  }

  /**
   * @param {string} name  Metric name to send.
   * @returns {string}  URL to send metrics to.
   * @private
   */
  buildPingAddress_(name) {
    const stageId = LIFECYCLE_STAGES[name] || 9999;
    const delta = Date.now() - this.initTime_;
    // Note: QQid comes from a network header and eid could, potentially, be
    // injected by a publisher.  Treat both of them as unverified user content
    // and encode before inserting them into URI.
    const encodedQqid = this.qqid_ ?
        encodeURIComponent(this.qqid_) : false;
    const qqidParam = encodedQqid ?
        `&qqid.${this.slotId_}=${encodedQqid}` : '';
    const eid = this.element_.getAttribute(EXPERIMENT_ATTRIBUTE);
    const eidParam = eid ? `&e=${encodeURIComponent(eid)}` : '';
    const pingUrl = `${this.pingbackAddress_}?` +
        `s=${this.namespace_}` +
        `&v=2&it=${name}.${delta},${name}_${this.slotId_}.${delta}` +
        `&rt=stage.${stageId},slotId.${this.slotId_}` +
        `&c=${this.win_.ampAdPageCorrelator}` +
        '&rls=$internalRuntimeVersion$' +
        `${eidParam}${qqidParam}` +
        `&it.${this.slotName_}=${name}.${delta}` +
        `&rt.${this.slotName_}=stage.${stageId}` +
        `&met.${this.slotName_}=stage_${stageId}.${delta}`;
    return pingUrl;
  }

  /**
   * Send ping by creating an img element and attaching to the DOM.
   * Separate function so that it can be stubbed out for testing.
   *
   * @param {string} url Address to ping.
   */
  emitPing_(url) {
    const pingElement = this.element_.ownerDocument.createElement('img');
    pingElement.setAttribute('src', url);
    // Styling is copied directly from amp-pixel's CSS.  This is a kludgy way
    // to do this -- much better would be to invoke amp-pixel's styling directly
    // or to add an additional style selector for these ping pixels.
    // However, given that this is a short-term performance system, I'd rather
    // not tamper with AMP-wide CSS just to create styling for this
    // element.
    pingElement.setAttribute('style',
        'position:fixed!important;top:0!important;width:1px!important;' +
        'height:1px!important;overflow:hidden!important;visibility:hidden');
    pingElement.setAttribute('aria-hidden', 'true');
    this.element_.parentNode.insertBefore(pingElement, this.element_);
    dev().info('PING', url);
  }
}

/**
 * A fake version of AmpAdLifecycleReporter that simply discards all pings.
 * This is used for non-Google ad types, to avoid gathering data about their
 * ads.
 */
export class NullLifecycleReporter {
  setQQId(unusedQqid) {}
  sendPing(unusedName, unusedStageId) {}
}
