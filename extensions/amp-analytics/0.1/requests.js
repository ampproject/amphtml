/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {BatchSegmentDef, defaultSerializer} from './transport-serializer';
import {
  ExpansionOptions,
  variableServiceFor,
} from './variables';
import {SANDBOX_AVAILABLE_VARS} from './sandbox-vars-whitelist';
import {Services} from '../../../src/services';
import {dev, user} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getResourceTiming} from './resource-timing';
import {isArray, isFiniteNumber} from '../../../src/types';

const BATCH_INTERVAL_MIN = 200;

export class RequestHandler {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} request
   * @param {!../../../src/preconnect.Preconnect} preconnect
   * @param {./transport.Transport} transport
   * @param {boolean} isSandbox
   */
  constructor(ampdoc, request, preconnect, transport, isSandbox) {

    /** @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @const {!Window} */
    this.win = this.ampdoc_.win;

    /** @const {string} */
    this.baseUrl = dev().assert(request['baseUrl']);

    /** @private {Array<number>|number|undefined} */
    this.batchInterval_ = request['batchInterval']; //unit is sec

    /** @private {?number} */
    this.reportWindow_ = Number(request['reportWindow']) || null; // unit is sec

    /** @private {?number} */
    this.batchIntervalPointer_ = null;

    /** @private {!./variables.VariableService} */
    this.variableService_ = variableServiceFor(this.win);

    /** @private {!../../../src/service/url-replacements-impl.UrlReplacements} */
    this.urlReplacementService_ =
      Services.urlReplacementsForDoc(this.ampdoc_);

    /** @private {?Promise<string>} */
    this.baseUrlPromise_ = null;

    /** @private {?Promise<string>} */
    this.baseUrlTemplatePromise_ = null;

    /** @private {!Array<!Promise<!BatchSegmentDef>>} */
    this.batchSegmentPromises_ = [];

    /** @private {!../../../src/preconnect.Preconnect} */
    this.preconnect_ = preconnect;

    /** @private {./transport.Transport} */
    this.transport_ = transport;

    /** @const @private {!Object|undefined} */
    this.whiteList_ = isSandbox ? SANDBOX_AVAILABLE_VARS : undefined;

    /** @private {?number} */
    this.batchIntervalTimeoutId_ = null;

    /** @private {?number} */
    this.reportWindowTimeoutId_ = null;

    /** @private {boolean} */
    this.reportRequest_ = true;

    /** @private {?JsonObject} */
    this.lastTrigger_ = null;

    /** @private {number} */
    this.queueSize_ = 0;

    /** @private @const {number} */
    this.startTime_ = Date.now();

    this.initReportWindow_();
    this.initBatchInterval_();
  }

  /**
   * Exposed method to send a request on event.
   * Real ping may be batched and send out later.
   * @param {?JsonObject} configParams
   * @param {!JsonObject} trigger
   * @param {!./variables.ExpansionOptions} expansionOption
   */
  send(configParams, trigger, expansionOption) {
    const isImportant = (trigger['important'] === true);
    if (!this.reportRequest_ && !isImportant) {
      // Ignore non important trigger out reportWindow
      return;
    }

    this.queueSize_++;
    this.lastTrigger_ = trigger;
    const bindings = this.variableService_.getMacros();
    bindings['RESOURCE_TIMING'] = getResourceTiming(
        this.win, trigger['resourceTimingSpec'], this.startTime_);

    if (!this.baseUrlPromise_) {
      expansionOption.freezeVar('extraUrlParams');
      this.baseUrlTemplatePromise_ =
          this.variableService_.expandTemplate(this.baseUrl, expansionOption);
      this.baseUrlPromise_ = this.baseUrlTemplatePromise_.then(baseUrl => {
        return this.urlReplacementService_.expandUrlAsync(
            baseUrl, bindings, this.whiteList_);
      });
    }

    const params = Object.assign({}, configParams, trigger['extraUrlParams']);
    const timestamp = this.win.Date.now();
    const batchSegmentPromise = expandExtraUrlParams(
        this.ampdoc_, params, expansionOption, bindings, this.whiteList_)
        .then(params => {
          return dict({
            'trigger': trigger['on'],
            'timestamp': timestamp,
            'extraUrlParams': params,
          });
        });
    this.batchSegmentPromises_.push(batchSegmentPromise);
    this.trigger_(isImportant || !this.batchInterval_);
  }

  /**
   * Dispose function that clear request handler state.
   */
  dispose() {
    this.reset_();

    // Clear batchInterval timeout
    if (this.batchIntervalTimeoutId_) {
      this.win.clearTimeout(this.batchIntervalTimeoutId_);
      this.batchIntervalTimeoutId_ = null;
    }

    if (this.reportWindowTimeoutId_) {
      this.win.clearTimeout(this.reportWindowTimeoutId_);
      this.reportWindowTimeoutId_ = null;
    }
  }

  /**
   * Function that schedule the actual request send.
   * @param {boolean} isImmediate
   * @private
   */
  trigger_(isImmediate) {
    if (this.queueSize_ == 0) {
      // Do nothing if no request in queue
      return;
    }

    if (isImmediate) {
      // If not batched, or batchInterval scheduler schedule trigger immediately
      this.fire_();
    }
  }

  /**
   * Send out request. Should only be called by `trigger_` function
   * @private
   */
  fire_() {
    const {
      baseUrlTemplatePromise_: baseUrlTemplatePromise,
      baseUrlPromise_: baseUrlPromise,
      batchSegmentPromises_: segmentPromises,
    } = this;
    const trigger = /** @type {!JsonObject} */ (this.lastTrigger_);
    this.reset_();

    baseUrlTemplatePromise.then(preUrl => {
      this.preconnect_.url(preUrl, true);
      Promise.all(
          [baseUrlPromise, Promise.all(segmentPromises)]).then(results => {
        const baseUrl = results[0];
        const batchSegments = results[1];
        if (batchSegments.length === 0) {
          return;
        }
        // TODO: iframePing will not work with batch. Add a config validation.
        if (trigger['iframePing']) {
          user().assert(trigger['on'] == 'visible',
              'iframePing is only available on page view requests.');
          this.transport_.sendRequestUsingIframe(baseUrl, batchSegments[0]);
        } else {
          this.transport_.sendRequest(
              baseUrl, batchSegments, !!this.batchInterval_);
        }
      });
    });
  }

  /**
   * Reset batching status
   * @private
   */
  reset_() {
    this.queueSize_ = 0;
    this.baseUrlPromise_ = null;
    this.baseUrlTemplatePromise_ = null;
    this.batchSegmentPromises_ = [];
    this.lastTrigger_ = null;
  }

  /**
   * Handle batchInterval
   */
  initBatchInterval_() {
    if (!this.batchInterval_) {
      return;
    }

    this.batchInterval_ = isArray(this.batchInterval_) ?
      this.batchInterval_ : [this.batchInterval_];

    for (let i = 0; i < this.batchInterval_.length; i++) {
      let interval = this.batchInterval_[i];
      user().assert(isFiniteNumber(interval),
          'Invalid batchInterval value: %s', this.batchInterval_);
      interval = Number(interval) * 1000;
      user().assert(interval >= BATCH_INTERVAL_MIN,
          'Invalid batchInterval value: %s, ' +
          'interval value must be greater than %s ms.',
          this.batchInterval_, BATCH_INTERVAL_MIN);
      this.batchInterval_[i] = interval;
    }

    this.batchIntervalPointer_ = 0;

    this.refreshBatchInterval_();
  }

  /**
   * Initializes report window.
   */
  initReportWindow_() {
    if (this.reportWindow_) {
      this.reportWindowTimeoutId_ = this.win.setTimeout(() => {
        // Flush batch queue;
        this.trigger_(true);
        this.reportRequest_ = false;
        // Clear batchInterval timeout
        if (this.batchIntervalTimeoutId_) {
          this.win.clearTimeout(this.batchIntervalTimeoutId_);
          this.batchIntervalTimeoutId_ = null;
        }
      }, this.reportWindow_ * 1000);
    }
  }

  /**
   * Schedule sending request regarding to batchInterval
   */
  refreshBatchInterval_() {
    dev().assert(this.batchIntervalPointer_ != null,
        'Should not start batchInterval without pointer');
    const interval = this.batchIntervalPointer_ < this.batchInterval_.length ?
      this.batchInterval_[this.batchIntervalPointer_++] :
      this.batchInterval_[this.batchInterval_.length - 1];

    this.batchIntervalTimeoutId_ = this.win.setTimeout(() => {
      this.trigger_(true);
      this.refreshBatchInterval_();
    }, interval);
  }
}

/**
 * Expand the postMessage string
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {string} msg
 * @param {?JsonObject} configParams
 * @param {!JsonObject} trigger
 * @param {!./variables.ExpansionOptions} expansionOption
 * @return {Promise<string>}
 */
export function expandPostMessage(
  ampdoc, msg, configParams, trigger, expansionOption) {
  const variableService = variableServiceFor(ampdoc.win);
  const urlReplacementService = Services.urlReplacementsForDoc(ampdoc);

  const bindings = variableService.getMacros();
  expansionOption.freezeVar('extraUrlParams');

  const basePromise = variableService.expandTemplate(
      msg, expansionOption).then(base => {
    return urlReplacementService.expandStringAsync(base, bindings);
  });
  if (msg.indexOf('${extraUrlParams}') < 0) {
    // No need to append extraUrlParams
    return basePromise;
  }

  return basePromise.then(expandedMsg => {
    const params = Object.assign({}, configParams, trigger['extraUrlParams']);
    //return base url with the appended extra url params;
    return expandExtraUrlParams(ampdoc, params, expansionOption, bindings)
        .then(extraUrlParams => {
          return defaultSerializer(expandedMsg, [
            dict({'extraUrlParams': extraUrlParams}),
          ]);
        });
  });
}

/**
 * Function that handler extraUrlParams from config and trigger.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Object} params
 * @param {!./variables.ExpansionOptions} expansionOption
 * @param {!Object} bindings
 * @param {!Object=} opt_whitelist
 * @return {!Promise<!Object>}
 * @private
 */
function expandExtraUrlParams(
  ampdoc, params, expansionOption, bindings, opt_whitelist) {
  const variableService = variableServiceFor(ampdoc.win);
  const urlReplacements = Services.urlReplacementsForDoc(ampdoc);

  const requestPromises = [];
  // Don't encode param values here,
  // as we'll do it later in the getExtraUrlParamsString call.
  const option = new ExpansionOptions(
      expansionOption.vars,
      expansionOption.iterations,
      true /* noEncode */);
  // Add any given extraUrlParams as query string param
  for (const k in params) {
    if (typeof params[k] == 'string') {
      const request = variableService.expandTemplate(params[k], option)
          .then(v =>
            urlReplacements.expandStringAsync(v, bindings, opt_whitelist))
          .then(value => params[k] = value);
      requestPromises.push(request);
    }
  }
  return Promise.all(requestPromises).then(() => params);
}
