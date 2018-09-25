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

import {BatchingPluginFunctions, batchSegmentDef} from './batching-plugins';
import {
  ExpansionOptions,
  variableServiceFor,
} from './variables';
import {SANDBOX_AVAILABLE_VARS} from './sandbox-vars-whitelist';
import {Services} from '../../../src/services';
import {
  appendEncodedParamStringToUrl,
  parseQueryString,
} from '../../../src/url';
import {dev, user} from '../../../src/log';
import {dict, map} from '../../../src/utils/object';
import {filterSplice} from '../../../src/utils/array';
import {isArray, isFiniteNumber} from '../../../src/types';

const TAG = 'amp-analytics/requests';

const BATCH_INTERVAL_MIN = 200;

export class RequestHandler {
  /**
   * @param {!Element} ampAnalyticsElement
   * @param {!JsonObject} request
   * @param {!../../../src/preconnect.Preconnect} preconnect
   * @param {./transport.Transport} transport
   * @param {boolean} isSandbox
   */
  constructor(ampAnalyticsElement, request, preconnect, transport, isSandbox) {

    /** @const {!Window} */
    this.win = ampAnalyticsElement.getAmpDoc().win;

    /** @const {string} */
    this.baseUrl = dev().assert(request['baseUrl']);

    /** @private {Array<number>|number|undefined} */
    this.batchInterval_ = request['batchInterval']; //unit is sec

    /** @private {?number} */
    this.reportWindow_ = Number(request['reportWindow']) || null; // unit is sec

    /** @private {?number} */
    this.batchIntervalPointer_ = null;

    /** @private @const {string} */
    this.batchPluginId_ = request['batchPlugin'];

    user().assert((this.batchPluginId_ ? this.batchInterval_ : true),
        'Invalid request: batchPlugin cannot be set on non-batched request');

    /** @const {?function(string, !Array<!batchSegmentDef>)} */
    this.batchingPlugin_ = this.batchPluginId_
      ? user().assert(BatchingPluginFunctions[this.batchPluginId_],
          `Invalid request: unsupported batch plugin ${this.batchPluginId_}`)
      : null;

    /** @private {!./variables.VariableService} */
    this.variableService_ = variableServiceFor(this.win);

    /** @private {!../../../src/service/url-replacements-impl.UrlReplacements} */
    this.urlReplacementService_ =
      Services.urlReplacementsForDoc(ampAnalyticsElement);

    /** @private {?Promise<string>} */
    this.baseUrlPromise_ = null;

    /** @private {?Promise<string>} */
    this.baseUrlTemplatePromise_ = null;

    /** @private {!Array<!Promise<string>>}*/
    this.extraUrlParamsPromise_ = [];

    /** @private {!Array<!Promise<!batchSegmentDef>>} */
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

    this.initReportWindow_();
    this.initBatchInterval_();
  }

  /**
   * Exposed method to send a request on event.
   * Real ping may be batched and send out later.
   * @param {?JsonObject} configParams
   * @param {!JsonObject} trigger
   * @param {!./variables.ExpansionOptions} expansionOption
   * @param {!Object<string, *>} dynamicBindings A mapping of variables to
   *     stringable values. For example, values could be strings, functions that
   *     return strings, promises, etc.
   */
  send(configParams, trigger, expansionOption, dynamicBindings) {
    const isImportant = trigger['important'];

    const isImmediate =
        (trigger['important'] === true) || (!this.batchInterval_);
    if (!this.reportRequest_ && !isImportant) {
      // Ignore non important trigger out reportWindow
      return;
    }

    this.queueSize_++;
    this.lastTrigger_ = trigger;
    const triggerParams = trigger['extraUrlParams'];

    const macros = this.variableService_.getMacros();
    const bindings = Object.assign({}, dynamicBindings, macros);

    if (!this.baseUrlPromise_) {
      expansionOption.freezeVar('extraUrlParams');
      this.baseUrlTemplatePromise_ =
          this.variableService_.expandTemplate(this.baseUrl, expansionOption);
      this.baseUrlPromise_ = this.baseUrlTemplatePromise_.then(baseUrl => {
        return this.urlReplacementService_.expandUrlAsync(
            baseUrl, bindings, this.whiteList_);
      });
    }

    const extraUrlParamsPromise = getExtraUrlParams(
        this.variableService_, configParams, triggerParams, expansionOption)
        .then(expandExtraUrlParams => {
          // Construct the extraUrlParamsString: Remove null param and encode
          // component
          const expandedExtraUrlParamsStr = getExtraUrlParamsString(
              this.variableService_, expandExtraUrlParams);
          return this.urlReplacementService_.expandUrlAsync(
              expandedExtraUrlParamsStr, bindings, this.whiteList_);
        });

    if (this.batchingPlugin_) {
      const batchSegment = dict({
        'trigger': trigger['on'],
        'timestamp': this.win.Date.now(),
        'extraUrlParams': null,
      });
      this.batchSegmentPromises_.push(extraUrlParamsPromise.then(str => {
        batchSegment['extraUrlParams'] =
                parseQueryString(str);
        return batchSegment;
      }));
    }

    this.extraUrlParamsPromise_.push(extraUrlParamsPromise);
    this.trigger_(isImmediate);
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
      return;
    }
  }

  /**
   * Send out request. Should only be called by `trigger_` function
   * @private
   */
  fire_() {
    const {
      extraUrlParamsPromise_: extraUrlParamsPromise,
      baseUrlTemplatePromise_: baseUrlTemplatePromise,
      baseUrlPromise_: baseUrlPromise,
      batchSegmentPromises_: batchSegmentsPromise,
    } = this;
    const trigger = /** @type {!JsonObject} */ (this.lastTrigger_);
    this.reset_();

    baseUrlTemplatePromise.then(preUrl => {
      this.preconnect_.url(preUrl, true);
      baseUrlPromise.then(baseUrl => {
        let requestUrlPromise;
        if (this.batchingPlugin_) {
          requestUrlPromise =
              this.constructBatchSegments_(baseUrl, batchSegmentsPromise);
        } else {
          requestUrlPromise =
              constructExtraUrlParamStrs(baseUrl, extraUrlParamsPromise);
        }
        requestUrlPromise.then(request => {
          if (!request) {
            user().error(TAG, 'Request not sent. Contents empty.');
            return;
          }
          if (trigger['iframePing']) {
            user().assert(trigger['on'] == 'visible',
                'iframePing is only available on page view requests.');
            this.transport_.sendRequestUsingIframe(request);
          } else {
            this.transport_.sendRequest(request);
          }
        });
      });
    });
  }

  /**
   * Construct the final requestUrl by calling the batch plugin function
   * @param {string} baseUrl
   * @param {!Array<!Promise<batchSegmentDef>>} batchSegmentsPromise
   */
  constructBatchSegments_(baseUrl, batchSegmentsPromise) {
    dev().assert(this.batchingPlugin_ &&
        typeof this.batchingPlugin_ == 'function', 'Should never call ' +
        'constructBatchSegments_ with invalid batchingPlugin function');

    return Promise.all(batchSegmentsPromise).then(batchSegments => {
      try {
        return this.batchingPlugin_(baseUrl, batchSegments);
      } catch (e) {
        dev().error(TAG,
            `Error: batchPlugin function ${this.batchPluginId_}`, e);
        return '';
      }
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
    this.extraUrlParamsPromise_ = [];
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
          `Invalid batchInterval value: ${this.batchInterval_}` +
          'interval must be a number');
      interval = Number(interval) * 1000;
      user().assert(interval >= BATCH_INTERVAL_MIN,
          `Invalid batchInterval value: ${this.batchInterval_}, ` +
          `interval value must be greater than ${BATCH_INTERVAL_MIN}ms.`);
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
 * @param {!AMP.BaseElement} baseInstance
 * @param {string} msg
 * @param {?JsonObject} configParams
 * @param {?JsonObject} triggerParams
 * @param {!./variables.ExpansionOptions} expansionOption
 * @param {!Object<string, *>} dynamicBindings A mapping of variables to
 *     stringable values. For example, values could be strings, functions that
 *     return strings, promises, etc.
 * @return {Promise<string>}
 */
export function expandPostMessage(baseInstance, msg,
  configParams, triggerParams, expansionOption, dynamicBindings) {
  const variableService = variableServiceFor(baseInstance.win);
  const urlReplacementService =
      Services.urlReplacementsForDoc(baseInstance.element);

  const macros = variableService.getMacros();
  const bindings = Object.assign({}, dynamicBindings, macros);
  expansionOption.freezeVar('extraUrlParams');

  const basePromise = variableService.expandTemplate(
      msg, expansionOption).then(base => {
    return urlReplacementService.expandUrlAsync(base, bindings);
  });
  if (msg.indexOf('${extraUrlParams}') < 0) {
    // No need to append extraUrlParams
    return basePromise;
  }

  //return base url with the appended extra url params;
  const extraUrlParamsStrPromise = getExtraUrlParams(
      variableService, configParams, triggerParams, expansionOption)
      .then(params => {
        const str = getExtraUrlParamsString(variableService, params);
        return urlReplacementService.expandUrlAsync(str, bindings);
      });

  return basePromise.then(expandedMsg => {
    return constructExtraUrlParamStrs(expandedMsg, [extraUrlParamsStrPromise]);
  });
}

/**
 * Function that handler extraUrlParams from config and trigger.
 * @param {!./variables.VariableService} variableService
 * @param {?JsonObject} configParams
 * @param {?JsonObject} triggerParams
 * @param {!./variables.ExpansionOptions} expansionOption
 * @return {!Promise<!JsonObject>}
 * @private
 */
function getExtraUrlParams(
  variableService, configParams, triggerParams, expansionOption) {
  const requestPromises = [];
  const params = map();
  // Don't encode param values here,
  // as we'll do it later in the getExtraUrlParamsString call.
  const option = new ExpansionOptions(
      expansionOption.vars,
      expansionOption.iterations,
      true /* noEncode */);
  // Add any given extraUrlParams as query string param
  if (configParams || triggerParams) {
    Object.assign(params, configParams, triggerParams);
    for (const k in params) {
      if (typeof params[k] == 'string') {
        requestPromises.push(
            variableService.expandTemplate(params[k], option)
                .then(value => { params[k] = value; }));
      }
    }
  }
  return Promise.all(requestPromises).then(() => {
    return params;
  });
}

/**
 * Handle the params map and form the final extraUrlParams string
 * @param {!./variables.VariableService} variableService
 * @param {!Object} params
 * @return {string}
 */
function getExtraUrlParamsString(variableService, params) {
  const s = [];
  for (const k in params) {
    const v = params[k];
    if (v == null) {
      continue;
    } else {
      const sv = variableService.encodeVars(k, v);
      s.push(`${encodeURIComponent(k)}=${sv}`);
    }
  }
  return s.join('&');
}

/**
 * Construct the final requestUrl with baseUrl and extraUrlParams
 * @param {string} baseUrl
 * @param {!Array<!Promise<string>>} extraUrlParamStrsPromise
 */
function constructExtraUrlParamStrs(baseUrl, extraUrlParamStrsPromise) {
  return Promise.all(extraUrlParamStrsPromise).then(paramStrs => {
    filterSplice(paramStrs, item => {return !!item;});
    const extraUrlParamsStr = paramStrs.join('&');
    let requestUrl;
    if (baseUrl.indexOf('${extraUrlParams}') >= 0) {
      requestUrl = baseUrl.replace('${extraUrlParams}', extraUrlParamsStr);
    } else {
      requestUrl = appendEncodedParamStringToUrl(baseUrl, extraUrlParamsStr);
    }
    return requestUrl;
  });
}
