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
  ExpansionOptions,
} from './variables';
import {SANDBOX_AVAILABLE_VARS} from './sandbox-vars-whitelist';
import {Services} from '../../../src/services';


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

    /** @private {?Promise<string>} */
    this.sendPromise_ = null;
  }

  /**
   * Exposed method to send a request on event.
   * Real ping may be batched and send out later.
   * @param {?JsonObject} configParams
   * @param {!JsonObject} trigger
   * @param {!./variables.ExpansionOptions} expansionOption
   * @return {!Promise<string>}
   */
  send(configParams, trigger, expansionOption) {
    this.lastTrigger_ = trigger;
    const triggerParams = trigger['extraUrlParams'];
    if (!this.baseUrlPromise_) {
      expansionOption.freezeVar('extraUrlParams');
      this.baseUrlTemplatePromise_ =
          this.variableService_.expandTemplate(this.baseUrl, expansionOption);
      this.baseUrlPromise_ = this.baseUrlTemplatePromise_.then(baseUrl => {
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

    return this.trigger_();
  }

  /**
   * Dispose function that clear reqeust handler state.
   */
  dispose() {
    if (this.timeoutId_) {
      this.win.clearTimeout(this.timeoutId_);
    }
    this.reset_();
  }

  /**
   * Function that schedule the actual request send.
   * @private
   */
  trigger_() {
    if (this.maxDelay_ == 0) {
      return this.fire_();
    }
    // If is batched
    if (!this.timeoutId_) {
      // schedule fire_ after certain time
      return this.sendPromise_ = new Promise(resolve => {
        this.timeoutId_ = this.win.setTimeout(() => {
          this.fire_().then(request => {
            resolve(request);
          });
        }, this.maxDelay_ * 1000);
      });
    }

    return this.sendPromise_;
  }

  /**
   * Send out request once ready
   * @private
   */
  fire_() {
    const extraUrlParamsPromise = this.extraUrlParamsPromise_;
    const baseUrlTemplatePromise = this.baseUrlTemplatePromise_;
    const baseUrlPromise = this.baseUrlPromise_;
    const lastTrigger = /** @type {!JsonObject} */ (this.lastTrigger_);
    this.reset_();
    return Promise.all(extraUrlParamsPromise).then(paramStrs => {
      filterSplice(paramStrs, item => {return !!item;});
      const extraUrlParamsStr = paramStrs.join('&');
      return baseUrlTemplatePromise.then(preUrl => {
        this.preconnect_.url(preUrl, true);
        return baseUrlPromise.then(request => {
          if (request.indexOf('${extraUrlParams}') >= 0) {
            request = request.replace('${extraUrlParams}', extraUrlParamsStr);
          } else {
            request = appendEncodedParamStringToUrl(request, extraUrlParamsStr);
          }
          return request;
        }).then(request => {
          this.handler_(request, lastTrigger);
          return request;
        });
      });
    });
  }

  /**
   * Reset batching status
   * @private
   */
  reset_() {
    this.baseUrlPromise_ = null;
    this.baseUrlTemplatePromise_ = null;
    this.extraUrlParamsPromise_ = [];
    this.timeoutId_ = null;
    this.lastTrigger_ = null;
    this.sendPromise_ = null;
  }

  /**
   * Function that handler extraUrlParams from config and trigger.
   * @param {?JsonObject} configParams
   * @param {?JsonObject} triggerParams
   * @param {!./variables.ExpansionOptions} expansionOption
   * @return {!Promise<string>}
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
      return this.getExtraUrlParamsString_(params);
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
