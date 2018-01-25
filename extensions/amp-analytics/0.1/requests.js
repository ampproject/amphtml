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

import {user, dev} from '../../../src/log';
import {isObject} from '../../../src/types';
import {hasOwn, map} from '../../../src/utils/object';
import {filterSplice} from '../../../src/utils/array';
import {appendEncodedParamStringToUrl} from '../../../src/url';
import {
  variableServiceFor,
  ExpansionOptions,
} from './variables';
import {SANDBOX_AVAILABLE_VARS} from './sandbox-vars-whitelist';
import {Services} from '../../../src/services';
import {batchSegmentDef, BatchingPluginFunctions} from './batching-plugins';
import {parseQueryString} from '../../../src/url';
import {dict} from '../../../src/utils/object';

const TAG = 'AMP-ANALYTICS';


export class RequestHandler {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} request
   * @param {!../../../src/preconnect.Preconnect} preconnect
   * @param {function(string, !JsonObject)} handler
   * @param {boolean} isSandbox
   */
  constructor(ampdoc, request, preconnect, handler, isSandbox) {

    /** @const {!Window} */
    this.win = ampdoc.win;

    /** @const {string} */
    this.baseUrl = dev().assert(request['baseUrl']);

    /** @private @const {number} */
    // TODO: to support intervalDelay that start timeout during construction.
    this.maxDelay_ = Number(request['maxDelay']) || 0; //unit is sec

    /** @private @const {boolean} */
    this.isBatched_ = !!this.maxDelay_;

    /** @private @const {string} */
    this.batchPluginId_ = request['batchPlugin'];

    user().assert((this.batchPluginId_ ? this.isBatched_ : true),
        'Invalid request: batchPlugin cannot be set on non-batched request');

    /** @const {?function(string, !Array<!batchSegmentDef>)} */
    this.batchingPlugin_ = this.batchPluginId_
      ? user().assert(BatchingPluginFunctions[this.batchPluginId_],
          `Invalid request: unsupported batch plugin ${this.batchPluginId_}`)
      : null;

    /** @private {!./variables.VariableService} */
    this.variableService_ = variableServiceFor(this.win);

    /** @private {!../../../src/service/url-replacements-impl.UrlReplacements} */
    this.urlReplacementService_ = Services.urlReplacementsForDoc(ampdoc);

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
    this.timeoutId_ = null;

    /** @private {?JsonObject} */
    this.lastTrigger_ = null;
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
    this.lastTrigger_ = trigger;
    const triggerParams = trigger['extraUrlParams'];
    const isImmediate =
        (trigger['immediate'] === true) || (this.maxDelay_ == 0);
    if (!this.baseUrlPromise_) {
      expansionOption.freezeVar('extraUrlParams');
      this.baseUrlTemplatePromise_ =
          this.variableService_.expandTemplate(this.baseUrl, expansionOption);
      this.baseUrlPromise_ = this.baseUrlTemplatePromise_.then(baseUrl => {
        return this.urlReplacementService_.expandUrlAsync(
            baseUrl, dynamicBindings, this.whiteList_);
      });
    };

    const extraUrlParamsPromise = this.expandExtraUrlParams_(
        configParams, triggerParams, expansionOption)
        .then(expandExtraUrlParams => {
          // Construct the extraUrlParamsString: Remove null param and encode component
          const expandedExtraUrlParamsStr =
              this.getExtraUrlParamsString_(expandExtraUrlParams);
          return this.urlReplacementService_.expandUrlAsync(
              expandedExtraUrlParamsStr, dynamicBindings, this.whiteList_);
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
  }

  /**
   * Function that schedule the actual request send.
   * @param {boolean} isImmediate
   * @private
   */
  trigger_(isImmediate) {
    if (isImmediate) {
      this.fire_();
      return;
    }

    // If is batched and not immediate
    if (!this.timeoutId_) {
      // schedule fire_ after certain time
      this.timeoutId_ = this.win.setTimeout(() => {
        this.fire_();
      }, this.maxDelay_ * 1000);
    }
  }

  /**
   * Send out request once ready
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
    if (this.timeoutId_) {
      this.win.clearTimeout(this.timeoutId_);
    }
    this.baseUrlPromise_ = null;
    this.baseUrlTemplatePromise_ = null;
    this.extraUrlParamsPromise_ = [];
    this.batchSegmentPromises_ = [];
    this.timeoutId_ = null;
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
    // Add any given extraUrlParams as query string param
    if (configParams || triggerParams) {
      Object.assign(params, configParams, triggerParams);
      for (const k in params) {
        if (typeof params[k] == 'string') {
          requestPromises.push(
              this.variableService_.expandTemplate(params[k], option)
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
   * @param {!Object} params
   * @return {string}
   */
  getExtraUrlParamsString_(params) {
    const s = [];
    for (const k in params) {
      const v = params[k];
      if (v == null) {
        continue;
      } else {
        const sv = this.variableService_.encodeVars(k, v);
        s.push(`${encodeURIComponent(k)}=${sv}`);
      }
    }
    return s.join('&');
  }
}

/**
 * Expand config's request to object
 * @param {!JsonObject} config
 */
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

/**
 * Expand single request to an object
 * @param {!JsonObject} request
 */
function expandRequestStr(request) {
  if (isObject(request)) {
    return request;
  }
  return {
    'baseUrl': request,
  };
}
