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

import {dev} from '../../../src/log';
import {isObject} from '../../../src/types';
import {hasOwn, map} from '../../../src/utils/object';
import {filterSplice} from '../../../src/utils/array';
import {appendEncodedParamStringToUrl} from '../../../src/url';
import {
  variableServiceFor,
} from './variables';
import {SANDBOX_AVAILABLE_VARS} from './sandbox-vars-whitelist';
import {Services} from '../../../src/services';


export class RequestHandler {
  constructor(ampdoc, request, handler, isSandbox) {

    /** @const {!Window} */
    this.win = ampdoc.win;

    /** @const {string} */
    this.baseUrl = dev().assert(request['baseUrl']);

    /** @private {number} */
    this.maxDelay_ = Number(request['maxDelay']) || 0;

    /** @private {!./variables.VariableService} */
    this.variableService_ = variableServiceFor(this.win);

    /** @private {!../../../src/service/url-replacements-impl.UrlReplacements} */
    this.urlReplacementService_ = Services.urlReplacementsForDoc(ampdoc);

    /** @private {?Promise<string>} */
    this.baseUrlPromise_ = null;

    /** @private {!Array<!Promise<string>>}*/
    this.extraUrlParamsPromise_ = [];

    /** @private {!function(string, !JsonObject)} */
    this.handler_ = handler;

    /** @const @private {!Object|undefined} */
    this.whiteList_ = isSandbox ? SANDBOX_AVAILABLE_VARS : undefined;

    /** @private {?number} */
    this.schedule_ = null;

    /** @private {?JsonObject} */
    this.lastTrigger_ = null;
  }

  /**
   *
   * @param {!JsonObject} configParams
   * @param {!JsonObject} trigger
   * @param {!./variables.ExpansionOptions} expansionOption
   */
  send(configParams, trigger, expansionOption) {
    this.lastTrigger_ = trigger;
    const triggerParams = trigger['extraUrlParams'];
    if (!this.baseUrlPromise_) {
      expansionOption.freezeVar('extraUrlParams');
      this.baseUrlPromise_ =
          this.variableService_.expandTemplate(this.baseUrl, expansionOption)
          .then(baseUrl => {
            return this.urlReplacementService_.expandAsync(
                baseUrl, undefined, this.whiteList_);
          });
    };

    this.extraUrlParamsPromise_.push(
        this.expandExtraUrlParams_(configParams, triggerParams, expansionOption)
            .then(expandExtraUrlParams => {
              return this.urlReplacementService_.expandAsync(
                  expandExtraUrlParams, undefined, this.whiteList_);
            })
            .then(finalExtraUrlParams => {
              return finalExtraUrlParams;
            }));

    this.trigger_();
  }

  /**
   * Dispose function that clear reqeust handler state.
   */
  dispose() {
    if (this.schedule_) {
      this.win.clearTimeout(this.schedule_);
    }
    this.reset_();
  }

  /**
   * Function that schedule the actual request send.
   * @private
   */
  trigger_() {
    if (!this.schedule_) {
      this.schedule_ = this.win.setTimeout(() => {
        this.fire_();
      }, this.maxDelay_ * 1000);
    }
  }

  /**
   * Send out request.
   * @private
   */
  fire_() {
    //TODO: need to preconnect to request url at the right time
    this.baseUrlPromise_.then(request => {
      return Promise.all(this.extraUrlParamsPromise_).then(paramStrs => {
        filterSplice(paramStrs, item => {return !!item;});
        const extraUrlParamsStr = paramStrs.join('&');
        if (request.indexOf('${extraUrlParams}') >= 0) {
          request = request.replace('${extraUrlParams}', extraUrlParamsStr);
        } else {
          request = appendEncodedParamStringToUrl(request, extraUrlParamsStr);
        }
        return request;
      });
    }).then(request => {
      const lastTrigger = /** @type {!JsonObject} */ (this.lastTrigger_);
      this.handler_(request, lastTrigger);
      this.reset_();
    });
  }

  /**
   * Reset batching status
   * @private
   */
  reset_() {
    this.baseUrlPromise_ = null;
    this.extraUrlParamsPromise_ = [];
    this.schedule_ = null;
    this.lastTrigger_ = null;
  }

  /**
   * Function that handler extraUrlParams from config and trigger.
   * @param {!JsonObject} configParams
   * @param {!JsonObject} triggerParams
   * @param {!./variables.ExpansionOptions} expansionOption
   * @return {!Promise<string>}
   * @private
   */
  expandExtraUrlParams_(configParams, triggerParams, expansionOption) {
    const requestPromises = [];
    const params = map();
    // Add any given extraUrlParams as query string param
    if (configParams || triggerParams) {
      Object.assign(params, configParams, triggerParams);
      for (const k in params) {
        if (typeof params[k] == 'string') {
          requestPromises.push(
              this.variableService_.expandTemplate(params[k], expansionOption)
                  .then(value => { params[k] = value; }));
        }
      }
    }
    return Promise.all(requestPromises).then(() => {
      return this.getExtraUrlParamsString_(params);
    });
  }

  //TODO: Need function to handler batchSegment as well

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
        const sv = this.variableService_.encodeVars(v, k);
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
  if (!config['requests-v2']) {
    return config;
  }
  for (const k in config['requests-v2']) {
    if (hasOwn(config['requests-v2'], k)) {
      config['requests-v2'][k] = expandRequestStr(config['requests-v2'][k]);
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
