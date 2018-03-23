<<<<<<< HEAD
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
=======
import {dev, user} from '../../../src/log';
import {expandTemplate} from '../../../src/string';
import {isObject} from '../../../src/types';
import {hasOwn, map} from '../../../src/utils/object';
import {filterSplice} from '../../../src/utils/array';
import {appendEncodedParamStringToUrl} from '../../../src/url';
import {
>>>>>>> wip
  variableServiceFor,
} from './variables';
import {SANDBOX_AVAILABLE_VARS} from './sandbox-vars-whitelist';
import {Services} from '../../../src/services';
<<<<<<< HEAD
import {appendEncodedParamStringToUrl} from '../../../src/url';
import {dev, user} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {filterSplice} from '../../../src/utils/array';
import {hasOwn, map} from '../../../src/utils/object';
import {isArray, isFiniteNumber} from '../../../src/types';
import {isObject} from '../../../src/types';
import {parseQueryString} from '../../../src/url';

const TAG = 'AMP-ANALYTICS';

const BATCH_INTERVAL_MIN = 200;

export class RequestHandler {
  /**
   * @param {!Element} ampAnalyticsElement
   * @param {!JsonObject} request
   * @param {!../../../src/preconnect.Preconnect} preconnect
   * @param {function(string, !JsonObject)} handler
   * @param {boolean} isSandbox
   */
  constructor(ampAnalyticsElement, request, preconnect, handler, isSandbox) {

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
=======


export class RequestHandler {
  constructor(win, obj, element, handler, isSandbox) {
    const url = dev().assert(obj['baseUrl']);

    this.win = win;

    this.element = element;
    // Expand any placeholders. For requests, we expand each string up to 5
    // times to support nested requests. Leave any unresolved placeholders.
    this.baseUrl = expandTemplate(url, key => {
      return this.requests_[key] || '${' + key + '}';
    }, 5);

    this.maxDelay = obj['maxDelay'] || 0;

    this.interval = obj['interval'] || 0;
>>>>>>> wip

    /** @private {!./variables.VariableService} */
    this.variableService_ = variableServiceFor(this.win);

<<<<<<< HEAD
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

    /** @private {function(string, !JsonObject)} */
    this.handler_ = handler;

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

    const extraUrlParamsPromise = this.expandExtraUrlParams_(
        configParams, triggerParams, expansionOption)
        .then(expandExtraUrlParams => {
          // Construct the extraUrlParamsString: Remove null param and encode component
          const expandedExtraUrlParamsStr =
              this.getExtraUrlParamsString_(expandExtraUrlParams);
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
    const extraUrlParamsPromise = this.extraUrlParamsPromise_;
    const baseUrlTemplatePromise = this.baseUrlTemplatePromise_;
    const baseUrlPromise = this.baseUrlPromise_;
    const batchSegmentsPromise = this.batchSegmentPromises_;
    const lastTrigger = /** @type {!JsonObject} */ (this.lastTrigger_);
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
              this.constructExtraUrlParamStrs_(baseUrl, extraUrlParamsPromise);
        }
        requestUrlPromise.then(requestUrl => {
          this.handler_(requestUrl, lastTrigger);
        });
      });
    });
  }

  /**
   * Construct the final requestUrl with baseUrl and extraUrlParams
   * @param {string} baseUrl
   * @param {!Array<!Promise<string>>} extraUrlParamStrsPromise
   */
  constructExtraUrlParamStrs_(baseUrl, extraUrlParamStrsPromise) {
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
   * Function that handler extraUrlParams from config and trigger.
   * @param {?JsonObject} configParams
   * @param {?JsonObject} triggerParams
   * @param {!./variables.ExpansionOptions} expansionOption
   * @return {!Promise<!JsonObject>}
   * @private
   */
  expandExtraUrlParams_(configParams, triggerParams, expansionOption) {
    const requestPromises = [];
    const params = map();
    // Don't encode param values here,
    // as we'll do it later in the getExtraUrlParamsString_ call.
    const option = new ExpansionOptions(
        expansionOption.vars,
        expansionOption.iterations,
        true /* noEncode */);
=======
    this.urlReplacementService_ = Services.urlReplacementsForDoc(this.element);

    this.baseUrlPromise_ = null;

    this.extraUrlParamsPromise_ = [];

    this.sendViaIframePing_ = false;

    this.handler_ = handler;

    this.whiteList_ = isSandbox ? SANDBOX_AVAILABLE_VARS : undefined;

    this.schedule_ = null;
  }

  send(configParams, trigger, expansionOption) {
    if (trigger['iframePing']) {
      this.sendViaIframePing_ = true;
    }
    const triggerParams = trigger['extraUrlParams'];
    if (!this.baseUrlPromise_) {
      this.baseUrlPromise_ =
          this.variableService_.expandTemplate(this.baseUrl, expansionOption)
          .then(baseUrl => {
            return this.urlReplacementService_.expandAsync(
                baseUrl, undefined, this.whiteList_);
          });
    }

    this.extraUrlParamsPromise_.push(
        this.expandExtraUrlParams_(configParams, triggerParams, expansionOption)
            .then(expandExtraUrlParams => {
              console.log('expandExtrUrlParams are', expandExtraUrlParams);
              return this.urlReplacementService_.expandAsync(
                  expandExtraUrlParams, undefined, this.whiteList_);
            })
            .then(finalExtraUrlParams => {
              return finalExtraUrlParams;
            }));

    this.trigger_();
  }

  dispose() {
    if (this.schedule_) {
      this.win.clearTimeout(this.schedule_);
    }
  }

  trigger_() {
    if (!this.schedule_) {
      console.log('asdfasdfasdfasdfasdfadsf');
      this.schedule_ = this.win.setTimeout(() => {
        console.log('setTimeout');
        this.fire_();
      }, this.maxDelay * 1000);
    }
  }

  fire_() {
    //TODO: need to preconnect to request url at the right time
    console.log('in fire function!!!!!');

    this.baseUrlPromise_.then(request => {
      return Promise.all(this.extraUrlParamsPromise_).then(paramStrs => {
        filterSplice(paramStrs, item => {return !!item;});
        const extraUrlParamsStr = paramStrs.join('&');
        if (request.indexOf('${extraUrlParams}') >= 0) {
          request.replace('${extraUrlParams}', extraUrlParamsStr);
        } else {
          request = appendEncodedParamStringToUrl(request, extraUrlParamsStr);
        }
        return request;
      });
    }).then(request => {
      console.log('request is ', request);
      this.handler_(request, this.sendViaIframePing_);
      this.reset_();
    });
  }

  reset_() {
    this.baseUrlPromise_ = null;
    this.extraUrlParamsPromise_ = [];
    this.sendViaIframePing_ = false;
    this.schedule_ = null;
  }

  // Function that handler extraUrlParams from config and trigger.
  expandExtraUrlParams_(configParams, triggerParams, expansionOption) {
    const requestPromises = [];
    const params = map();
>>>>>>> wip
    // Add any given extraUrlParams as query string param
    if (configParams || triggerParams) {
      Object.assign(params, configParams, triggerParams);
      for (const k in params) {
        if (typeof params[k] == 'string') {
          requestPromises.push(
<<<<<<< HEAD
              this.variableService_.expandTemplate(params[k], option)
=======
              this.variableService_.expandTemplate(params[k], expansionOption)
>>>>>>> wip
                  .then(value => { params[k] = value; }));
        }
      }
    }
    return Promise.all(requestPromises).then(() => {
<<<<<<< HEAD
      return params;
    });
  }

  /**
   * Handle the params map and form the final extraUrlParams string
   * @param {!Object} params
   * @return {string}
   */
=======
      return this.getExtraUrlParamsString_(params);
    });
  }

  //TODO: Need function to handler batchSegment as well
>>>>>>> wip
  getExtraUrlParamsString_(params) {
    const s = [];
    for (const k in params) {
      const v = params[k];
      if (v == null) {
        continue;
      } else {
<<<<<<< HEAD
        const sv = this.variableService_.encodeVars(k, v);
=======
        const sv = this.variableService_.encodeVars(v, k);
>>>>>>> wip
        s.push(`${encodeURIComponent(k)}=${sv}`);
      }
    }
    return s.join('&');
  }

<<<<<<< HEAD
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
 * Expand config's request to object
 * @param {!JsonObject} config
 */
=======


    /**
   * Adds parameters to URL. Similar to the function defined in url.js but with
   * a different encoding method.
   * @param {string} request
   * @param {!Object<string, string>} params
   * @return {string}
   * @private
   */
  addParamsToUrl_(request, params) {
    const s = [];
    for (const k in params) {
      const v = params[k];
      if (v == null) {
        continue;
      } else {
        const sv = this.variableService_.encodeVars(v, k);
        s.push(`${encodeURIComponent(k)}=${sv}`);
      }
    }
    const paramString = s.join('&');
    if (request.indexOf('${extraUrlParams}') >= 0) {
      return request.replace('${extraUrlParams}', paramString);
    } else {
      return appendEncodedParamStringToUrl(request, paramString);
    }
  }
}


>>>>>>> wip
export function expandConfigRequest(config) {
  if (!config['requests']) {
    return config;
  }
  for (const k in config['requests']) {
    if (hasOwn(config['requests'], k)) {
      config['requests'][k] = expandRequestStr(config['requests'][k]);
    }
  }
  return config;
}

<<<<<<< HEAD
/**
 * Expand single request to an object
 * @param {!JsonObject} request
 */
=======

>>>>>>> wip
function expandRequestStr(request) {
  if (isObject(request)) {
    return request;
  }
  return {
    'baseUrl': request,
  };
}
