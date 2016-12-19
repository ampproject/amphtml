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
import {LIFECYCLE_STAGES} from '../../../extensions/amp-a4a/0.1/amp-a4a';
import {isExperimentOn, toggleExperiment} from '../../../src/experiments';
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {serializeQueryString} from '../../../src/url';
import {getCorrelator, EXPERIMENT_ATTRIBUTE} from './utils';
import {urlReplacementsForDoc} from '../../../src/url-replacements';

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
  // In local dev mode, manually set the profiling rate, for testing/dev.
  if (getMode().localDev) {
    toggleExperiment(win, 'a4aProfilingRate', true, true);
  }
  randomlySelectUnsetPageExperiments(win, win.AMP_CONFIG['a4aProfilingRate']);
  if ((type == 'doubleclick' || type == 'adsense') &&
      isInReportableBranch(ampElement, namespace) &&
      isExperimentOn(win, 'a4aProfilingRate')) {
    let correlator;
    if (typeof corr === 'undefined') {
      correlator = getCorrelator(win);
    } else {
      correlator = corr;
    }
    return new GoogleAdLifecycleReporter(win, ampElement.element, namespace,
        correlator, Number(slotId));
  } else {
    return new BaseLifecycleReporter();
  }
}

/**
 * A NOOP base class for the LifecycleReporter
 */
export class BaseLifecycleReporter {
  constructor() {
    /** @private */
    this.extraVariables_ = new Object(null);
  }

  /**
   * Get an ID for this ad slot that should be unique within the page.  The
   * default implementation returns the constant -1; subclasses should implement
   * in meaningful ways.
   *
   * @return {number}
   */
  getSlotId() {
    return -1;
  }

  /**
   * A beacon function that will be called at various stages of the lifecycle.
   *
   * To be overriden by network specific implementations.
   *
   * @param {string} unusedName A descriptive name for the beacon signal.
   */
  sendPing(unusedName) {}

  /**
   * Set a URL parameter to be added to the ping data.  The parameter's value is
   * subject to URL replacement and both parameter name and value are URI
   * encoded before being written to the ping.  The entry is silently dropped
   * if either `parameter` or `value` is falsey, with the exception that the
   * `value` may be 0.
   *
   * @param {string} parameter
   * @param {string|number} value
   */
  setPingParameter(parameter, value) {
    if (parameter == null || parameter === false || parameter === '') {
      return;
    }
    if (value === null || value === undefined || value === '') { return; }
    this.extraVariables_[parameter] = value;
  }

  /**
   * Sets a (possibly empty) collection of URL parameter values by invoking
   * #setPingParameter on each key/value pair in the input collection.
   *
   * @param {!Object<string, string|number>} parametersToValues
   */
  setPingParameters(parametersToValues) {
    for (const variable in parametersToValues) {
      if (parametersToValues.hasOwnProperty(variable)) {
        this.setPingParameter(variable, parametersToValues[variable]);
      }
    }
  }

  /**
   * A function to reset the lifecycle reporter. Will be called immediately
   * after firing the last beacon signal in unlayoutCallback.  Clears all
   * variables that have been set via #setPingParameter.
   */
  reset() {
    this.extraVariables_ = new Object(null);
  }
}

export class GoogleAdLifecycleReporter extends BaseLifecycleReporter {

  /**
   * @param {!Window} win  Parent window object.
   * @param {!Element} element  Parent element object.
   * @param {string} namespace  Namespace for page-level info.  (E.g.,
   *   'amp' vs 'a4a'.)
   * @param {number} correlator
   * @param {number} slotId
   */
  constructor(win, element, namespace, correlator, slotId) {
    super();

    /** @private {!Window} @const */
    this.win_ = win;

    /** @private {!Element} @const */
    this.element_ = element;

    /** @private {string} @const */
    this.namespace_ = namespace;

    /** @private {number} @const */
    this.slotId_ = slotId;

    /** @private {number} @const */
    this.correlator_ = correlator;

    /** @private {string} @const */
    this.slotName_ = this.namespace_ + '.' + this.slotId_;

    /** @private {number} @const */
    this.initTime_ = (win.performance && win.performance.timing &&
        win.performance.timing.navigationStart) || Date.now();

    /** @private {!function:number} @const */
    this.getDeltaTime_ = (win.performance && win.performance.now.bind(
            win.performance)) || (() => {return Date.now() - this.initTime_;});

    /** @private @const */
    this.pingbackAddress_ = 'https://csi.gstatic.com/csi';

    /** @private {!../../../src/url-replacements-impl.UrlReplacements} @const */
    this.urlReplacer_ = urlReplacementsForDoc(element);
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
   * @override
   */
  sendPing(name) {
    this.emitPing_(this.buildPingAddress_(name, this.extraVariables_));
  }

  /**
   * @return {number}
   * @override
   */
  getSlotId() {
    return this.slotId_;
  }

  /**
   * @param {string} name  Metric name to send.
   * @param {!Object<string, string|number>=} opt_extraParams
   * @returns {string}  URL to send metrics to.
   * @private
   */
  buildPingAddress_(name, opt_extraParams) {
    const stageId = LIFECYCLE_STAGES[name] || 9999;
    const delta = this.getDeltaTime_();
    let extraParams = '';
    if (opt_extraParams) {
      extraParams = serializeQueryString(opt_extraParams);
      if (extraParams != '') {
        // Note: Using sync URL replacer here, rather than async, for a number
        // of reasons:
        //   - Don't want to block pings waiting for potentially delayed bits
        //     of information.
        //   - Don't (currently) need access to any properties that are
        //     available async only.
        //   - Don't want to pass through expandStringAsync if there are zero
        //     extra params, but async would force us to (or to maintain two
        //     code branches).
        // TODO(ampproject/a4a): Change to async if/when there's a need to
        // expand async-only parameters.  E.g., we'd like to have scroll_y
        // offset, but it's not currently available through url-replacement.
        // If it becomes available, it's likely to be an async parameter.
        extraParams = '&' +
            this.urlReplacer_.expandStringSync(extraParams);
      }
    }
    const pingUrl = `${this.pingbackAddress_}?` +
        `s=${this.namespace_}` +
        `&v=2&it=${name}.${delta},${name}_${this.slotId_}.${delta}` +
        `&rt=stage.${stageId},slotId.${this.slotId_}` +
        `&c=${this.correlator_}` +
        '&rls=$internalRuntimeVersion$' +
        `&it.${this.slotName_}=${name}.${delta}` +
        `&rt.${this.slotName_}=stage.${stageId}` +
        `&met.${this.slotName_}=stage_${stageId}.${delta}` +
        extraParams;
    return pingUrl;
  }

  /**
   * Send ping by creating an img element and attaching to the DOM.
   * Separate function so that it can be stubbed out for testing.
   *
   * @param {string} url Address to ping.
   * @visibleForTesting
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
