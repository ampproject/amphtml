function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { AnalyticsEventType } from "./events";
import { BatchSegmentDef, defaultSerializer } from "./transport-serializer";
import { ExpansionOptions, variableServiceForDoc } from "./variables";
import { SANDBOX_AVAILABLE_VARS } from "./sandbox-vars-allowlist";
import { Services } from "../../../src/service";
import { devAssert, userAssert } from "../../../src/log";
import { dict } from "../../../src/core/types/object";
import { getResourceTiming } from "./resource-timing";
import { isArray, isFiniteNumber, isObject } from "../../../src/core/types";

var BATCH_INTERVAL_MIN = 200;

export var RequestHandler = /*#__PURE__*/function () {
  /**
   * @param {!Element} element
   * @param {!JsonObject} request
   * @param {!../../../src/preconnect.PreconnectService} preconnect
   * @param {./transport.Transport} transport
   * @param {boolean} isSandbox
   */
  function RequestHandler(element, request, preconnect, transport, isSandbox) {_classCallCheck(this, RequestHandler);
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
   */_createClass(RequestHandler, [{ key: "send", value:
    function send(configParams, trigger, expansionOptions) {
      var isImportant = trigger['important'] === true;
      if (!this.reportRequest_ && !isImportant) {
        // Ignore non important trigger out reportWindow
        return;
      }

      this.queueSize_++;
      this.lastTrigger_ = trigger;
      var bindings = this.variableService_.getMacros(this.element_);
      bindings['RESOURCE_TIMING'] = getResourceTiming(
      this.element_,
      trigger['resourceTimingSpec'],
      this.startTime_);


      if (!this.baseUrlPromise_) {
        expansionOptions.freezeVar('extraUrlParams');

        this.baseUrlPromise_ = this.expandTemplateUrl_(
        this.baseUrl,
        expansionOptions,
        bindings);

      }

      // expand requestOrigin if it is declared
      if (!this.requestOriginPromise_ && this.requestOrigin_) {
        // do not encode vars in request origin
        var requestOriginExpansionOptions = new ExpansionOptions(
        expansionOptions.vars,
        expansionOptions.iterations,
        /* opt_noEncode */true);


        this.requestOriginPromise_ = this.expandTemplateUrl_(
        this.requestOrigin_,
        requestOriginExpansionOptions,
        bindings);

      }

      var params = _objectSpread(_objectSpread({}, configParams), trigger['extraUrlParams']);
      var timestamp = this.win.Date.now();
      var batchSegmentPromise = expandExtraUrlParams(
      this.variableService_,
      this.urlReplacementService_,
      params,
      expansionOptions,
      bindings,
      this.element_,
      this.allowlist_).
      then(function (params) {
        return dict({
          'trigger': trigger['on'],
          'timestamp': timestamp,
          'extraUrlParams': params });

      });
      this.batchSegmentPromises_.push(batchSegmentPromise);
      this.trigger_(isImportant || !this.batchInterval_);
    }

    /**
     * Dispose function that clear request handler state.
     */ }, { key: "dispose", value:
    function dispose() {
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
     * @param {!Object<string, (!../../../src/service/variable-source.ResolverReturnDef|!../../../src/service/variable-source.SyncResolverDef)>=} bindings
     * @return {!Promise<string>}
     */ }, { key: "expandTemplateUrl_", value:
    function expandTemplateUrl_(url, expansionOptions, bindings) {var _this = this;
      return this.variableService_.
      expandTemplate(
      url,
      expansionOptions,
      this.element_,
      bindings,
      this.allowlist_).

      then(function (url) {return (
          _this.urlReplacementService_.
          expandUrlAsync(url, bindings, _this.allowlist_).
          catch(function (e) {return (
              userAssert(false, "Could not expand URL \"".concat(url, "\": ").concat(e.message)));}));});


    }

    /**
     * Function that schedule the actual request send.
     * @param {boolean} isImmediate
     * @private
     */ }, { key: "trigger_", value:
    function trigger_(isImmediate) {
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
     */ }, { key: "fire_", value:
    function fire_() {var _this2 = this;
      var
      baseUrlPromise =


      this.baseUrlPromise_,segmentPromises = this.batchSegmentPromises_,requestOriginPromise = this.requestOriginPromise_;
      var trigger = /** @type {!JsonObject} */(this.lastTrigger_);
      this.reset_();

      // preconnect to requestOrigin if available, otherwise baseUrl
      var preconnectPromise = requestOriginPromise ?
      requestOriginPromise :
      baseUrlPromise;

      preconnectPromise.then(function (preUrl) {
        _this2.preconnect_.url(_this2.ampdoc_, preUrl, true);
      });

      Promise.all([
      baseUrlPromise,
      Promise.all(segmentPromises),
      requestOriginPromise]).
      then(function (results) {
        var requestUrl = _this2.composeRequestUrl_(results[0], results[2]);

        var batchSegments = results[1];
        if (batchSegments.length === 0) {
          return;
        }

        // TODO: iframePing will not work with batch. Add a config validation.
        if (trigger['iframePing']) {
          userAssert(
          trigger['on'] == AnalyticsEventType.VISIBLE,
          'iframePing is only available on page view requests.');

          _this2.transport_.sendRequestUsingIframe(requestUrl, batchSegments[0]);
        } else {
          _this2.transport_.sendRequest(
          requestUrl,
          batchSegments,
          !!_this2.batchInterval_);

        }
      });
    }

    /**
     * Reset batching status
     * @private
     */ }, { key: "reset_", value:
    function reset_() {
      this.queueSize_ = 0;
      this.baseUrlPromise_ = null;
      this.batchSegmentPromises_ = [];
      this.lastTrigger_ = null;
    }

    /**
     * Handle batchInterval
     */ }, { key: "initBatchInterval_", value:
    function initBatchInterval_() {
      if (!this.batchInterval_) {
        return;
      }

      this.batchInterval_ = isArray(this.batchInterval_) ?
      this.batchInterval_ :
      [this.batchInterval_];

      for (var i = 0; i < this.batchInterval_.length; i++) {
        var interval = this.batchInterval_[i];
        userAssert(
        isFiniteNumber(interval),
        'Invalid batchInterval value: %s',
        this.batchInterval_);

        interval = Number(interval) * 1000;
        userAssert(
        interval >= BATCH_INTERVAL_MIN,
        'Invalid batchInterval value: %s, ' +
        'interval value must be greater than %s ms.',
        this.batchInterval_,
        BATCH_INTERVAL_MIN);

        this.batchInterval_[i] = interval;
      }

      this.batchIntervalPointer_ = 0;

      this.refreshBatchInterval_();
    }

    /**
     * Initializes report window.
     */ }, { key: "initReportWindow_", value:
    function initReportWindow_() {var _this3 = this;
      if (this.reportWindow_) {
        this.reportWindowTimeoutId_ = this.win.setTimeout(function () {
          // Flush batch queue;
          _this3.trigger_(true);
          _this3.reportRequest_ = false;
          // Clear batchInterval timeout
          if (_this3.batchIntervalTimeoutId_) {
            _this3.win.clearTimeout(_this3.batchIntervalTimeoutId_);
            _this3.batchIntervalTimeoutId_ = null;
          }
        }, this.reportWindow_ * 1000);
      }
    }

    /**
     * Schedule sending request regarding to batchInterval
     */ }, { key: "refreshBatchInterval_", value:
    function refreshBatchInterval_() {var _this4 = this;
      devAssert(
      this.batchIntervalPointer_ != null);


      var interval =
      this.batchIntervalPointer_ < this.batchInterval_.length ?
      this.batchInterval_[this.batchIntervalPointer_++] :
      this.batchInterval_[this.batchInterval_.length - 1];

      this.batchIntervalTimeoutId_ = this.win.setTimeout(function () {
        _this4.trigger_(true);
        _this4.refreshBatchInterval_();
      }, interval);
    }

    /**
     * Composes a request URL given a base and requestOrigin
     * @private
     * @param {string} baseUrl
     * @param {string=} opt_requestOrigin
     * @return {string}
     */ }, { key: "composeRequestUrl_", value:
    function composeRequestUrl_(baseUrl, opt_requestOrigin) {
      if (opt_requestOrigin) {
        // We expect requestOrigin to always contain the URL origin. In the case
        // where requestOrigin has a relative URL, the current page's origin will
        // be used. We will simply respect the requestOrigin and baseUrl, we don't
        // check if they form a valid URL and request will fail silently
        var requestOriginInfo = this.urlService_.parse(opt_requestOrigin);
        return requestOriginInfo.origin + baseUrl;
      }

      return baseUrl;
    } }]);return RequestHandler;}();


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
element)
{
  var variableService = variableServiceForDoc(ampdoc);
  var urlReplacementService = Services.urlReplacementsForDoc(element);

  var bindings = variableService.getMacros(element);
  expansionOption.freezeVar('extraUrlParams');

  var basePromise = variableService.
  expandTemplate(msg, expansionOption, element).
  then(function (base) {
    return urlReplacementService.expandStringAsync(base, bindings);
  });
  if (msg.indexOf('${extraUrlParams}') < 0) {
    // No need to append extraUrlParams
    return basePromise;
  }

  return basePromise.then(function (expandedMsg) {
    var params = _objectSpread(_objectSpread({}, configParams), trigger['extraUrlParams']);
    //return base url with the appended extra url params;
    return expandExtraUrlParams(
    variableService,
    urlReplacementService,
    params,
    expansionOption,
    bindings,
    element).
    then(function (extraUrlParams) {
      return defaultSerializer(expandedMsg, [
      dict({ 'extraUrlParams': extraUrlParams })]);

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
opt_allowlist)
{
  var newParams = {};
  var requestPromises = [];
  // Don't encode param values here,
  // as we'll do it later in the getExtraUrlParamsString call.
  var option = new ExpansionOptions(
  expansionOption.vars,
  expansionOption.iterations,
  true /* noEncode */);


  var expandObject = function expandObject(data, key, expandedData) {
    var value = data[key];

    if (typeof value === 'string') {
      expandedData[key] = undefined;
      var request = variableService.
      expandTemplate(value, option, element).
      then(function (value) {return (
          urlReplacements.expandStringAsync(value, bindings, opt_allowlist));}).

      then(function (value) {
        expandedData[key] = value;
      });
      requestPromises.push(request);
    } else if (isArray(value)) {
      expandedData[key] = [];
      for (var index = 0; index < value.length; index++) {
        expandObject(value, index, expandedData[key]);
      }
    } else if (isObject(value) && value !== null) {
      expandedData[key] = {};
      var valueKeys = Object.keys(value);
      for (var _index = 0; _index < valueKeys.length; _index++) {
        expandObject(value, valueKeys[_index], expandedData[key]);
      }
    } else {
      // Number, bool, null
      expandedData[key] = value;
    }
  };

  var paramKeys = Object.keys(params);
  for (var index = 0; index < paramKeys.length; index++) {
    expandObject(params, paramKeys[index], newParams);
  }

  return Promise.all(requestPromises).then(function () {return newParams;});
}
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/requests.js