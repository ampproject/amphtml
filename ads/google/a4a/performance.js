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

import {getCorrelator} from './utils';
import {LIFECYCLE_STAGES} from '../../../extensions/amp-a4a/0.1/amp-a4a';
import {dev} from '../../../src/log';
import {serializeQueryString} from '../../../src/url';
import {getTimingDataSync} from '../../../src/service/variable-source';
import {urlReplacementsForDoc} from '../../../src/services';
import {viewerForDoc} from '../../../src/services';
import {CommonSignals} from '../../../src/common-signals';
import {analyticsForDoc} from '../../../src/analytics';

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
 * A NOOP base class for the LifecycleReporter
 */
export class BaseLifecycleReporter {
  constructor() {
    /**
     * @type {!Object<string, string>}
     * @private
     */
    this.extraVariables_ = new Object(null);
  }

  /**
   * To be overridden.
   *
   * @param {!Element} unusedElement Amp ad element we are measuring.
   */
  addPingsForVisibility(unusedElement) {}

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
    if (parameter == null || parameter === '') {
      return;
    }
    if (value === null || value === undefined || value === '') { return; }
    this.extraVariables_[parameter] = String(value);
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

  /**
   * Returns the initialization time of this reporter.
   * @return {number} The initialization time in ms.
   */
  getInitTime() {}

  /**
   * Returns the time delta between initialization and now.
   * @return {number} The time delta in ms.
   */
  getDeltaTime() {}
}

export class GoogleAdLifecycleReporter extends BaseLifecycleReporter {

  /**
   * @param {!Window} win  Parent window object.
   * @param {!Element} element  Parent element object.
   * @param {string} namespace  Namespace for page-level info.  (E.g.,
   *   'amp' vs 'a4a'.)
   * @param {number} slotId
   */
  constructor(win, element, namespace, slotId) {
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
    this.correlator_ = getCorrelator(win);

    /** @private {string} @const */
    this.slotName_ = this.namespace_ + '.' + this.slotId_;

    // Contortions to convince the type checker that we're type-safe.
    let initTime;
    const scratch = getTimingDataSync(win, 'navigationStart') || Date.now();
    if (typeof scratch == 'number') {
      initTime = scratch;
    } else {
      initTime = Number(scratch);
    }
    /** @private {time} @const */
    this.initTime_ = initTime;

    /** @const {!function():number} */
    this.getDeltaTime = (win.performance && win.performance.now.bind(
            win.performance)) || (() => {return Date.now() - this.initTime_;});

    /** (Not constant b/c this can be overridden for testing.) @private */
    this.pingbackAddress_ = 'https://csi.gstatic.com/csi';

    /**
     * @private {!../../../src/service/url-replacements-impl.UrlReplacements}
     * @const
     */
    this.urlReplacer_ = urlReplacementsForDoc(element);

    /** @const @private {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = viewerForDoc(element);
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
   * The special variable SLOT_ID will be substituted into either parameter
   * names or values with the ID of the ad slot on the page.
   *
   * @param {string} name  Stage name to ping out.  Should be one of the ones
   * from `LIFECYCLE_STAGES`.  If it's an unknown name, it will still be pinged,
   * but the stage ID will be set to `9999`.
   * @override
   */
  sendPing(name) {
    const url = this.buildPingAddress_(name);
    if (url) {
      this.emitPing_(url);
    }
  }

  /**
   * @param {string} name  Metric name to send.
   * @returns {string}  URL to send metrics to.
   * @private
   */
  buildPingAddress_(name) {
    const stageId = LIFECYCLE_STAGES[name] || 9999;
    const delta = Math.round(this.getDeltaTime());
    // Note: extraParams can end up empty if (a) this.extraVariables_ is empty
    // or (b) if all values are themselves empty or null.
    let extraParams = serializeQueryString(this.extraVariables_);
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
      extraParams = this.urlReplacer_./*OK*/expandStringSync(extraParams, {
        AD_SLOT_NAMESPACE: this.namespace_,
        AD_SLOT_ID: this.slotId_,
        AD_SLOT_TIME_TO_EVENT: delta,
        AD_SLOT_EVENT_NAME: name,
        AD_SLOT_EVENT_ID: stageId,
        AD_PAGE_CORRELATOR: this.correlator_,
        AD_PAGE_VISIBLE: this.viewer_.isVisible() ? 1 : 0,
        AD_PAGE_FIRST_VISIBLE_TIME:
            Math.round(this.viewer_.getFirstVisibleTime() - this.initTime_),
        AD_PAGE_LAST_VISIBLE_TIME:
            Math.round(this.viewer_.getLastVisibleTime() - this.initTime_),
      });
    }
    return extraParams ? `${this.pingbackAddress_}?${extraParams}` : '';
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

  /**
   * Returns the initialization time of this reporter.
   * @return {number} The initialization time in ms.
   */
  getInitTime() {
    return this.initTime_;
  }

  /**
   * Adds CSI pings for various visibility measurements on element.
   *
   * @param {!Element} element Amp ad element we are measuring.
   * @override
   */
  addPingsForVisibility(element) {
    const readyPromise = Promise.race([
      element.signals.whenSignal(CommonSignals.INI_LOAD),
      element.signals.whenSignal(CommonSignals.LOAD_END),
    ]);
    analyticsForDoc(element, true).then(analytics => {
      const vis = analytics.getAnalyticsRoot(element).getVisibilityManager();
      // Can be any promise or `null`.
      // Element must be an AMP element at this time.
      // 50% vis w/o ini load
      vis.listenElement(element, {visiblePercentageMin: 50}, null, null,
                        () => {
                          this.sendPing('visHalf');
                        });
      // 50% vis w ini load
      vis.listenElement(element,
                        {visiblePercentageMin: 50},
                        readyPromise, null,
                        () => {
                          this.sendPing('visHalfIniLoad');
                        });
      // first visible
      vis.listenElement(element, {visiblePercentageMin: 1}, null, null,
                        () => {
                          this.sendPing('firstVisible');
                        });
      // ini-load
      vis.listenElement(element, {waitFor: 'ini-load'},
                        readyPromise, null,
                        () => {
                          this.sendPing('iniLoad');
                        });

      // 50% vis, ini-load and 1 sec
      vis.listenElement(element,
                        {visiblePercentageMin: 1, waitFor: 'ini-load',
                         totalTimeMin: 1000},
                        readyPromise, null,
                        () => {
                          this.sendPing('visLoadAndOneSec');
                        });
    });
  }
}
