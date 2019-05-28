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
  getConsentStateStr,
  variableServiceForDoc,
} from './variables';
import {SANDBOX_AVAILABLE_VARS} from './sandbox-vars-whitelist';
import {Services} from '../../../src/services';
import {devAssert, user, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getResourceTiming} from './resource-timing';
import {isArray, isFiniteNumber, isObject} from '../../../src/types';

const TAG = 'amp-analytics/requests';
const BATCH_INTERVAL_MIN = 200;

export class RequestHandler {
  /**
   * @param {!Element} element
   * @param {!JsonObject} request
   * @param {!../../../src/preconnect.Preconnect} preconnect
   * @param {./transport.Transport} transport
   * @param {boolean} isSandbox
   */
  constructor(element, request, preconnect, transport, isSandbox) {
    /** @const {!Element} */
    this.element_ = element;

    /** @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = element.getAmpDoc();

    /** @const {!Window} */
    this.win = this.ampdoc_.win;

    /** @const {string} !if specified, all requests are prepended with this */
    this.requestOrigin_ = request['requestOrigin'];

    /** @const {string} */
    this.baseUrl = devAssert(request['baseUrl']);

    /** @private {Array<number>|number|undefined} */
    this.batchInterval_ = request['batchInterval']; //unit is sec

    /** @private {?number} */
    this.reportWindow_ = Number(request['reportWindow']) || null; // unit is sec

    /** @private {?number} */
    this.batchIntervalPointer_ = null;

    /** @private {!./variables.VariableService} */
    this.variableService_ = variableServiceForDoc(element);

    /** @private {!../../../src/service/url-replacements-impl.UrlReplacements} */
    this.urlReplacementService_ = Services.urlReplacementsForDoc(element);

    /** @private {?Promise<string>} */
    this.baseUrlPromise_ = null;

    /** @private {?Promise<string>} */
    this.baseUrlTemplatePromise_ = null;

    /** @private {?Promise<string>} */
    this.requestOriginPromise_ = null;

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
    const isImportant = trigger['important'] === true;
    if (!this.reportRequest_ && !isImportant) {
      // Ignore non important trigger out reportWindow
      return;
    }

    this.queueSize_++;
    this.lastTrigger_ = trigger;
    const bindings = this.variableService_.getMacros();
    bindings['RESOURCE_TIMING'] = getResourceTiming(
      this.ampdoc_,
      trigger['resourceTimingSpec'],
      this.startTime_
    );
    // TODO: (@zhouyx) Move to variable service once that becomes
    // a doc level services
    bindings['CONSENT_STATE'] = getConsentStateStr(this.element_);

    if (!this.baseUrlPromise_) {
      expansionOption.freezeVar('extraUrlParams');

      // expand requestOrigin if it is declared
      if (this.requestOrigin_) {
        // do not encode vars in request origin
        const requestOriginExpansionOpt = new ExpansionOptions(
          expansionOption.vars,
          expansionOption.iterations,
          true // opt_noEncode
        );

        this.requestOriginPromise_ = this.variableService_
          // expand variables in request origin
          .expandTemplate(this.requestOrigin_, requestOriginExpansionOpt)
          // substitute in URL values e.g. DOCUMENT_REFERRER -> https://example.com
          .then(expandedRequestOrigin => {
            return this.urlReplacementService_.expandUrlAsync(
              expandedRequestOrigin,
              bindings,
              this.whiteList_,
              true // opt_noEncode
            );
          });
      }

      this.baseUrlTemplatePromise_ = this.variableService_.expandTemplate(
        this.baseUrl,
        expansionOption
      );

      this.baseUrlPromise_ = this.baseUrlTemplatePromise_.then(baseUrl => {
        return this.urlReplacementService_.expandUrlAsync(
          baseUrl,
          bindings,
          this.whiteList_
        );
      });
    }

    const params = Object.assign({}, configParams, trigger['extraUrlParams']);
    const timestamp = this.win.Date.now();
    const batchSegmentPromise = expandExtraUrlParams(
      this.variableService_,
      this.urlReplacementService_,
      params,
      expansionOption,
      bindings,
      this.whiteList_
    ).then(params => {
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
      requestOriginPromise_: requestOriginPromise,
      baseUrlTemplatePromise_: baseUrlTemplatePromise,
      baseUrlPromise_: baseUrlPromise,
      batchSegmentPromises_: segmentPromises,
    } = this;
    const trigger = /** @type {!JsonObject} */ (this.lastTrigger_);
    this.reset_();

    // preconnect to requestOrigin if available, otherwise baseUrlTemplate
    const preconnectPromise = requestOriginPromise
      ? requestOriginPromise
      : baseUrlTemplatePromise;

    preconnectPromise.then(preUrl => {
      this.preconnect_.url(preUrl, true);
      Promise.all([baseUrlPromise, Promise.all(segmentPromises)]).then(
        results => {
          // prepend requestOrigin if available
          let baseUrl;
          if (requestOriginPromise) {
            try {
              baseUrl = new URL(results[0], preUrl).href;
            } catch (e) {
              user().error(
                TAG,
                'Unable to construct URL with ' + preUrl + ' and ' + results[0]
              );
              return;
            }
          } else {
            baseUrl = results[0];
          }

          const batchSegments = results[1];
          if (batchSegments.length === 0) {
            return;
          }
          // TODO: iframePing will not work with batch. Add a config validation.
          if (trigger['iframePing']) {
            userAssert(
              trigger['on'] == 'visible',
              'iframePing is only available on page view requests.'
            );
            this.transport_.sendRequestUsingIframe(baseUrl, batchSegments[0]);
          } else {
            this.transport_.sendRequest(
              baseUrl,
              batchSegments,
              !!this.batchInterval_
            );
          }
        }
      );
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

    this.batchInterval_ = isArray(this.batchInterval_)
      ? this.batchInterval_
      : [this.batchInterval_];

    for (let i = 0; i < this.batchInterval_.length; i++) {
      let interval = this.batchInterval_[i];
      userAssert(
        isFiniteNumber(interval),
        'Invalid batchInterval value: %s',
        this.batchInterval_
      );
      interval = Number(interval) * 1000;
      userAssert(
        interval >= BATCH_INTERVAL_MIN,
        'Invalid batchInterval value: %s, ' +
          'interval value must be greater than %s ms.',
        this.batchInterval_,
        BATCH_INTERVAL_MIN
      );
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
    devAssert(
      this.batchIntervalPointer_ != null,
      'Should not start batchInterval without pointer'
    );
    const interval =
      this.batchIntervalPointer_ < this.batchInterval_.length
        ? this.batchInterval_[this.batchIntervalPointer_++]
        : this.batchInterval_[this.batchInterval_.length - 1];

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
 * @param {!Element} element
 * @return {Promise<string>}
 */
export function expandPostMessage(
  ampdoc,
  msg,
  configParams,
  trigger,
  expansionOption,
  element
) {
  const variableService = variableServiceForDoc(ampdoc);
  const urlReplacementService = Services.urlReplacementsForDoc(element);

  const bindings = variableService.getMacros();
  expansionOption.freezeVar('extraUrlParams');

  const basePromise = variableService
    .expandTemplate(msg, expansionOption)
    .then(base => {
      return urlReplacementService.expandStringAsync(base, bindings);
    });
  if (msg.indexOf('${extraUrlParams}') < 0) {
    // No need to append extraUrlParams
    return basePromise;
  }

  return basePromise.then(expandedMsg => {
    const params = Object.assign({}, configParams, trigger['extraUrlParams']);
    //return base url with the appended extra url params;
    return expandExtraUrlParams(
      variableService,
      urlReplacementService,
      params,
      expansionOption,
      bindings
    ).then(extraUrlParams => {
      return defaultSerializer(expandedMsg, [
        dict({'extraUrlParams': extraUrlParams}),
      ]);
    });
  });
}

/**
 * Function that handler extraUrlParams from config and trigger.
 * @param {!./variables.VariableService} variableService
 * @param {!../../../src/service/url-replacements-impl.UrlReplacements} urlReplacements
 * @param {!Object} params
 * @param {!./variables.ExpansionOptions} expansionOption
 * @param {!Object} bindings
 * @param {!Object=} opt_whitelist
 * @return {!Promise<!Object>}
 * @private
 */
function expandExtraUrlParams(
  variableService,
  urlReplacements,
  params,
  expansionOption,
  bindings,
  opt_whitelist
) {
  const requestPromises = [];
  // Don't encode param values here,
  // as we'll do it later in the getExtraUrlParamsString call.
  const option = new ExpansionOptions(
    expansionOption.vars,
    expansionOption.iterations,
    true /* noEncode */
  );

  const expandObject = (params, key) => {
    const value = params[key];

    if (typeof value === 'string') {
      const request = variableService
        .expandTemplate(value, option)
        .then(value =>
          urlReplacements.expandStringAsync(value, bindings, opt_whitelist)
        )
        .then(value => (params[key] = value));
      requestPromises.push(request);
    } else if (isArray(value)) {
      value.forEach((_, index) => expandObject(value, index));
    } else if (isObject(value) && value !== null) {
      Object.keys(value).forEach(key => expandObject(value, key));
    }
  };

  Object.keys(params).forEach(key => expandObject(params, key));

  return Promise.all(requestPromises).then(() => params);
}
