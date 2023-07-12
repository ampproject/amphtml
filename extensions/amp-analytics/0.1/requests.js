import {isArray, isFiniteNumber, isObject} from '#core/types';

import {Services} from '#service';

import {devAssert, userAssert} from '#utils/log';

import {AnalyticsEventType} from './events';
import {getResourceTiming} from './resource-timing';
import {SANDBOX_AVAILABLE_VARS} from './sandbox-vars-allowlist';
import {BatchSegmentDef, defaultSerializer} from './transport-serializer';
import {ExpansionOptions, variableServiceForDoc} from './variables';

const BATCH_INTERVAL_MIN = 200;

export class RequestHandler {
  /**
   * @param {!Element} element
   * @param {!JsonObject} request
   * @param {!../../../src/preconnect.PreconnectService} preconnect
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
    this.requestOrigin_ = request['origin'];

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

    /** @private {!../../../src/service/url-impl.Url} */
    this.urlService_ = Services.urlForDoc(element);

    /** @private {?Promise<string>} */
    this.baseUrlPromise_ = null;

    /** @private {?Promise<string>} */
    this.requestOriginPromise_ = null;

    /** @private {!Array<!Promise<!BatchSegmentDef>>} */
    this.batchSegmentPromises_ = [];

    /** @private {!../../../src/preconnect.PreconnectService} */
    this.preconnect_ = preconnect;

    /** @private {./transport.Transport} */
    this.transport_ = transport;

    /** @const @private {!Object|undefined} */
    this.allowlist_ = isSandbox ? SANDBOX_AVAILABLE_VARS : undefined;

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
   * @param {!./variables.ExpansionOptions} expansionOptions
   */
  send(configParams, trigger, expansionOptions) {
    const isImportant = trigger['important'] === true;
    if (!this.reportRequest_ && !isImportant) {
      // Ignore non important trigger out reportWindow
      return;
    }

    this.queueSize_++;
    this.lastTrigger_ = trigger;
    const bindings = this.variableService_.getMacros(this.element_);
    bindings['RESOURCE_TIMING'] = getResourceTiming(
      this.element_,
      trigger['resourceTimingSpec'],
      this.startTime_
    );

    if (!this.baseUrlPromise_) {
      expansionOptions.freezeVar('extraUrlParams');

      this.baseUrlPromise_ = this.expandTemplateUrl_(
        this.baseUrl,
        expansionOptions,
        bindings
      );
    }

    // expand requestOrigin if it is declared
    if (!this.requestOriginPromise_ && this.requestOrigin_) {
      // do not encode vars in request origin
      const requestOriginExpansionOptions = new ExpansionOptions(
        expansionOptions.vars,
        expansionOptions.iterations,
        /* opt_noEncode */ true
      );

      this.requestOriginPromise_ = this.expandTemplateUrl_(
        this.requestOrigin_,
        requestOriginExpansionOptions,
        bindings
      );
    }

    const params = {...configParams, ...trigger['extraUrlParams']};
    const timestamp = this.win.Date.now();
    const batchSegmentPromise = expandExtraUrlParams(
      this.variableService_,
      this.urlReplacementService_,
      params,
      expansionOptions,
      bindings,
      this.element_,
      this.allowlist_
    ).then((params) => {
      return {
        'trigger': trigger['on'],
        'timestamp': timestamp,
        'extraUrlParams': params,
      };
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
   * @param {string} url
   * @param {!ExpansionOptions} expansionOptions
   * @param {!{[key: string]: (!../../../src/service/variable-source.ResolverReturnDef|!../../../src/service/variable-source.SyncResolverDef)}=} bindings
   * @return {!Promise<string>}
   */
  expandTemplateUrl_(url, expansionOptions, bindings) {
    return this.variableService_
      .expandTemplate(
        url,
        expansionOptions,
        this.element_,
        bindings,
        this.allowlist_
      )
      .then((url) =>
        this.urlReplacementService_
          .expandUrlAsync(url, bindings, this.allowlist_)
          .catch((e) =>
            userAssert(false, `Could not expand URL "${url}": ${e.message}`)
          )
      );
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
      baseUrlPromise_: baseUrlPromise,
      batchSegmentPromises_: segmentPromises,
      requestOriginPromise_: requestOriginPromise,
    } = this;
    const trigger = /** @type {!JsonObject} */ (this.lastTrigger_);
    this.reset_();

    // preconnect to requestOrigin if available, otherwise baseUrl
    const preconnectPromise = requestOriginPromise
      ? requestOriginPromise
      : baseUrlPromise;

    preconnectPromise.then((preUrl) => {
      this.preconnect_.url(this.ampdoc_, preUrl, true);
    });

    Promise.all([
      baseUrlPromise,
      Promise.all(segmentPromises),
      requestOriginPromise,
    ]).then((results) => {
      const requestUrl = this.composeRequestUrl_(results[0], results[2]);

      const batchSegments = results[1];
      if (batchSegments.length === 0) {
        return;
      }

      // TODO: iframePing will not work with batch. Add a config validation.
      if (trigger['iframePing']) {
        userAssert(
          trigger['on'] == AnalyticsEventType.VISIBLE,
          'iframePing is only available on page view requests.'
        );
        this.transport_.sendRequestUsingIframe(requestUrl, batchSegments[0]);
      } else {
        this.transport_.sendRequest(
          requestUrl,
          batchSegments,
          !!this.batchInterval_
        );
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

  /**
   * Composes a request URL given a base and requestOrigin
   * @private
   * @param {string} baseUrl
   * @param {string=} opt_requestOrigin
   * @return {string}
   */
  composeRequestUrl_(baseUrl, opt_requestOrigin) {
    if (opt_requestOrigin) {
      // We expect requestOrigin to always contain the URL origin. In the case
      // where requestOrigin has a relative URL, the current page's origin will
      // be used. We will simply respect the requestOrigin and baseUrl, we don't
      // check if they form a valid URL and request will fail silently
      const requestOriginInfo = this.urlService_.parse(opt_requestOrigin);
      return requestOriginInfo.origin + baseUrl;
    }

    return baseUrl;
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

  const bindings = variableService.getMacros(element);
  expansionOption.freezeVar('extraUrlParams');

  const basePromise = variableService
    .expandTemplate(msg, expansionOption, element)
    .then((base) => {
      return urlReplacementService.expandStringAsync(base, bindings);
    });
  if (msg.indexOf('${extraUrlParams}') < 0) {
    // No need to append extraUrlParams
    return basePromise;
  }

  return basePromise.then((expandedMsg) => {
    const params = {...configParams, ...trigger['extraUrlParams']};
    //return base url with the appended extra url params;
    return expandExtraUrlParams(
      variableService,
      urlReplacementService,
      params,
      expansionOption,
      bindings,
      element
    ).then((extraUrlParams) => {
      return defaultSerializer(expandedMsg, [
        {'extraUrlParams': extraUrlParams},
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
 * @param {!Element} element
 * @param {!Object=} opt_allowlist
 * @return {!Promise<!Object>}
 * @private
 */
function expandExtraUrlParams(
  variableService,
  urlReplacements,
  params,
  expansionOption,
  bindings,
  element,
  opt_allowlist
) {
  const newParams = {};
  const requestPromises = [];
  // Don't encode param values here,
  // as we'll do it later in the getExtraUrlParamsString call.
  const option = new ExpansionOptions(
    expansionOption.vars,
    expansionOption.iterations,
    true /* noEncode */
  );

  const expandObject = (data, key, expandedData) => {
    const value = data[key];

    if (typeof value === 'string') {
      expandedData[key] = undefined;
      const request = variableService
        .expandTemplate(value, option, element)
        .then((value) =>
          urlReplacements.expandStringAsync(value, bindings, opt_allowlist)
        )
        .then((value) => {
          expandedData[key] = value;
        });
      requestPromises.push(request);
    } else if (isArray(value)) {
      expandedData[key] = [];
      for (let index = 0; index < value.length; index++) {
        expandObject(value, index, expandedData[key]);
      }
    } else if (isObject(value) && value !== null) {
      expandedData[key] = {};
      const valueKeys = Object.keys(value);
      for (let index = 0; index < valueKeys.length; index++) {
        expandObject(value, valueKeys[index], expandedData[key]);
      }
    } else {
      // Number, bool, null
      expandedData[key] = value;
    }
  };

  const paramKeys = Object.keys(params);
  for (let index = 0; index < paramKeys.length; index++) {
    expandObject(params, paramKeys[index], newParams);
  }

  return Promise.all(requestPromises).then(() => newParams);
}
