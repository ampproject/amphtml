function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
  function RequestHandler(element, request, preconnect, transport, isSandbox) {
    _classCallCheck(this, RequestHandler);

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
    this.batchInterval_ = request['batchInterval'];
    //unit is sec

    /** @private {?number} */
    this.reportWindow_ = Number(request['reportWindow']) || null;
    // unit is sec

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
  _createClass(RequestHandler, [{
    key: "send",
    value: function send(configParams, trigger, expansionOptions) {
      var isImportant = trigger['important'] === true;

      if (!this.reportRequest_ && !isImportant) {
        // Ignore non important trigger out reportWindow
        return;
      }

      this.queueSize_++;
      this.lastTrigger_ = trigger;
      var bindings = this.variableService_.getMacros(this.element_);
      bindings['RESOURCE_TIMING'] = getResourceTiming(this.element_, trigger['resourceTimingSpec'], this.startTime_);

      if (!this.baseUrlPromise_) {
        expansionOptions.freezeVar('extraUrlParams');
        this.baseUrlPromise_ = this.expandTemplateUrl_(this.baseUrl, expansionOptions, bindings);
      }

      // expand requestOrigin if it is declared
      if (!this.requestOriginPromise_ && this.requestOrigin_) {
        // do not encode vars in request origin
        var requestOriginExpansionOptions = new ExpansionOptions(expansionOptions.vars, expansionOptions.iterations,
        /* opt_noEncode */
        true);
        this.requestOriginPromise_ = this.expandTemplateUrl_(this.requestOrigin_, requestOriginExpansionOptions, bindings);
      }

      var params = _extends({}, configParams, trigger['extraUrlParams']);

      var timestamp = this.win.Date.now();
      var batchSegmentPromise = expandExtraUrlParams(this.variableService_, this.urlReplacementService_, params, expansionOptions, bindings, this.element_, this.allowlist_).then(function (params) {
        return dict({
          'trigger': trigger['on'],
          'timestamp': timestamp,
          'extraUrlParams': params
        });
      });
      this.batchSegmentPromises_.push(batchSegmentPromise);
      this.trigger_(isImportant || !this.batchInterval_);
    }
    /**
     * Dispose function that clear request handler state.
     */

  }, {
    key: "dispose",
    value: function dispose() {
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
     */

  }, {
    key: "expandTemplateUrl_",
    value: function expandTemplateUrl_(url, expansionOptions, bindings) {
      var _this = this;

      return this.variableService_.expandTemplate(url, expansionOptions, this.element_, bindings, this.allowlist_).then(function (url) {
        return _this.urlReplacementService_.expandUrlAsync(url, bindings, _this.allowlist_).catch(function (e) {
          return userAssert(false, "Could not expand URL \"" + url + "\": " + e.message);
        });
      });
    }
    /**
     * Function that schedule the actual request send.
     * @param {boolean} isImmediate
     * @private
     */

  }, {
    key: "trigger_",
    value: function trigger_(isImmediate) {
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

  }, {
    key: "fire_",
    value: function fire_() {
      var _this2 = this;

      var baseUrlPromise = this.baseUrlPromise_,
          segmentPromises = this.batchSegmentPromises_,
          requestOriginPromise = this.requestOriginPromise_;
      var trigger =
      /** @type {!JsonObject} */
      this.lastTrigger_;
      this.reset_();
      // preconnect to requestOrigin if available, otherwise baseUrl
      var preconnectPromise = requestOriginPromise ? requestOriginPromise : baseUrlPromise;
      preconnectPromise.then(function (preUrl) {
        _this2.preconnect_.url(_this2.ampdoc_, preUrl, true);
      });
      Promise.all([baseUrlPromise, Promise.all(segmentPromises), requestOriginPromise]).then(function (results) {
        var requestUrl = _this2.composeRequestUrl_(results[0], results[2]);

        var batchSegments = results[1];

        if (batchSegments.length === 0) {
          return;
        }

        // TODO: iframePing will not work with batch. Add a config validation.
        if (trigger['iframePing']) {
          userAssert(trigger['on'] == AnalyticsEventType.VISIBLE, 'iframePing is only available on page view requests.');

          _this2.transport_.sendRequestUsingIframe(requestUrl, batchSegments[0]);
        } else {
          _this2.transport_.sendRequest(requestUrl, batchSegments, !!_this2.batchInterval_);
        }
      });
    }
    /**
     * Reset batching status
     * @private
     */

  }, {
    key: "reset_",
    value: function reset_() {
      this.queueSize_ = 0;
      this.baseUrlPromise_ = null;
      this.batchSegmentPromises_ = [];
      this.lastTrigger_ = null;
    }
    /**
     * Handle batchInterval
     */

  }, {
    key: "initBatchInterval_",
    value: function initBatchInterval_() {
      if (!this.batchInterval_) {
        return;
      }

      this.batchInterval_ = isArray(this.batchInterval_) ? this.batchInterval_ : [this.batchInterval_];

      for (var i = 0; i < this.batchInterval_.length; i++) {
        var interval = this.batchInterval_[i];
        userAssert(isFiniteNumber(interval), 'Invalid batchInterval value: %s', this.batchInterval_);
        interval = Number(interval) * 1000;
        userAssert(interval >= BATCH_INTERVAL_MIN, 'Invalid batchInterval value: %s, ' + 'interval value must be greater than %s ms.', this.batchInterval_, BATCH_INTERVAL_MIN);
        this.batchInterval_[i] = interval;
      }

      this.batchIntervalPointer_ = 0;
      this.refreshBatchInterval_();
    }
    /**
     * Initializes report window.
     */

  }, {
    key: "initReportWindow_",
    value: function initReportWindow_() {
      var _this3 = this;

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
     */

  }, {
    key: "refreshBatchInterval_",
    value: function refreshBatchInterval_() {
      var _this4 = this;

      devAssert(this.batchIntervalPointer_ != null, 'Should not start batchInterval without pointer');
      var interval = this.batchIntervalPointer_ < this.batchInterval_.length ? this.batchInterval_[this.batchIntervalPointer_++] : this.batchInterval_[this.batchInterval_.length - 1];
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
     */

  }, {
    key: "composeRequestUrl_",
    value: function composeRequestUrl_(baseUrl, opt_requestOrigin) {
      if (opt_requestOrigin) {
        // We expect requestOrigin to always contain the URL origin. In the case
        // where requestOrigin has a relative URL, the current page's origin will
        // be used. We will simply respect the requestOrigin and baseUrl, we don't
        // check if they form a valid URL and request will fail silently
        var requestOriginInfo = this.urlService_.parse(opt_requestOrigin);
        return requestOriginInfo.origin + baseUrl;
      }

      return baseUrl;
    }
  }]);

  return RequestHandler;
}();

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
export function expandPostMessage(ampdoc, msg, configParams, trigger, expansionOption, element) {
  var variableService = variableServiceForDoc(ampdoc);
  var urlReplacementService = Services.urlReplacementsForDoc(element);
  var bindings = variableService.getMacros(element);
  expansionOption.freezeVar('extraUrlParams');
  var basePromise = variableService.expandTemplate(msg, expansionOption, element).then(function (base) {
    return urlReplacementService.expandStringAsync(base, bindings);
  });

  if (msg.indexOf('${extraUrlParams}') < 0) {
    // No need to append extraUrlParams
    return basePromise;
  }

  return basePromise.then(function (expandedMsg) {
    var params = _extends({}, configParams, trigger['extraUrlParams']);

    //return base url with the appended extra url params;
    return expandExtraUrlParams(variableService, urlReplacementService, params, expansionOption, bindings, element).then(function (extraUrlParams) {
      return defaultSerializer(expandedMsg, [dict({
        'extraUrlParams': extraUrlParams
      })]);
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
function expandExtraUrlParams(variableService, urlReplacements, params, expansionOption, bindings, element, opt_allowlist) {
  var newParams = {};
  var requestPromises = [];
  // Don't encode param values here,
  // as we'll do it later in the getExtraUrlParamsString call.
  var option = new ExpansionOptions(expansionOption.vars, expansionOption.iterations, true
  /* noEncode */
  );

  var expandObject = function expandObject(data, key, expandedData) {
    var value = data[key];

    if (typeof value === 'string') {
      expandedData[key] = undefined;
      var request = variableService.expandTemplate(value, option, element).then(function (value) {
        return urlReplacements.expandStringAsync(value, bindings, opt_allowlist);
      }).then(function (value) {
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

  return Promise.all(requestPromises).then(function () {
    return newParams;
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlcXVlc3RzLmpzIl0sIm5hbWVzIjpbIkFuYWx5dGljc0V2ZW50VHlwZSIsIkJhdGNoU2VnbWVudERlZiIsImRlZmF1bHRTZXJpYWxpemVyIiwiRXhwYW5zaW9uT3B0aW9ucyIsInZhcmlhYmxlU2VydmljZUZvckRvYyIsIlNBTkRCT1hfQVZBSUxBQkxFX1ZBUlMiLCJTZXJ2aWNlcyIsImRldkFzc2VydCIsInVzZXJBc3NlcnQiLCJkaWN0IiwiZ2V0UmVzb3VyY2VUaW1pbmciLCJpc0FycmF5IiwiaXNGaW5pdGVOdW1iZXIiLCJpc09iamVjdCIsIkJBVENIX0lOVEVSVkFMX01JTiIsIlJlcXVlc3RIYW5kbGVyIiwiZWxlbWVudCIsInJlcXVlc3QiLCJwcmVjb25uZWN0IiwidHJhbnNwb3J0IiwiaXNTYW5kYm94IiwiZWxlbWVudF8iLCJhbXBkb2NfIiwiZ2V0QW1wRG9jIiwid2luIiwicmVxdWVzdE9yaWdpbl8iLCJiYXNlVXJsIiwiYmF0Y2hJbnRlcnZhbF8iLCJyZXBvcnRXaW5kb3dfIiwiTnVtYmVyIiwiYmF0Y2hJbnRlcnZhbFBvaW50ZXJfIiwidmFyaWFibGVTZXJ2aWNlXyIsInVybFJlcGxhY2VtZW50U2VydmljZV8iLCJ1cmxSZXBsYWNlbWVudHNGb3JEb2MiLCJ1cmxTZXJ2aWNlXyIsInVybEZvckRvYyIsImJhc2VVcmxQcm9taXNlXyIsInJlcXVlc3RPcmlnaW5Qcm9taXNlXyIsImJhdGNoU2VnbWVudFByb21pc2VzXyIsInByZWNvbm5lY3RfIiwidHJhbnNwb3J0XyIsImFsbG93bGlzdF8iLCJ1bmRlZmluZWQiLCJiYXRjaEludGVydmFsVGltZW91dElkXyIsInJlcG9ydFdpbmRvd1RpbWVvdXRJZF8iLCJyZXBvcnRSZXF1ZXN0XyIsImxhc3RUcmlnZ2VyXyIsInF1ZXVlU2l6ZV8iLCJzdGFydFRpbWVfIiwiRGF0ZSIsIm5vdyIsImluaXRSZXBvcnRXaW5kb3dfIiwiaW5pdEJhdGNoSW50ZXJ2YWxfIiwiY29uZmlnUGFyYW1zIiwidHJpZ2dlciIsImV4cGFuc2lvbk9wdGlvbnMiLCJpc0ltcG9ydGFudCIsImJpbmRpbmdzIiwiZ2V0TWFjcm9zIiwiZnJlZXplVmFyIiwiZXhwYW5kVGVtcGxhdGVVcmxfIiwicmVxdWVzdE9yaWdpbkV4cGFuc2lvbk9wdGlvbnMiLCJ2YXJzIiwiaXRlcmF0aW9ucyIsInBhcmFtcyIsInRpbWVzdGFtcCIsImJhdGNoU2VnbWVudFByb21pc2UiLCJleHBhbmRFeHRyYVVybFBhcmFtcyIsInRoZW4iLCJwdXNoIiwidHJpZ2dlcl8iLCJyZXNldF8iLCJjbGVhclRpbWVvdXQiLCJ1cmwiLCJleHBhbmRUZW1wbGF0ZSIsImV4cGFuZFVybEFzeW5jIiwiY2F0Y2giLCJlIiwibWVzc2FnZSIsImlzSW1tZWRpYXRlIiwiZmlyZV8iLCJiYXNlVXJsUHJvbWlzZSIsInNlZ21lbnRQcm9taXNlcyIsInJlcXVlc3RPcmlnaW5Qcm9taXNlIiwicHJlY29ubmVjdFByb21pc2UiLCJwcmVVcmwiLCJQcm9taXNlIiwiYWxsIiwicmVzdWx0cyIsInJlcXVlc3RVcmwiLCJjb21wb3NlUmVxdWVzdFVybF8iLCJiYXRjaFNlZ21lbnRzIiwibGVuZ3RoIiwiVklTSUJMRSIsInNlbmRSZXF1ZXN0VXNpbmdJZnJhbWUiLCJzZW5kUmVxdWVzdCIsImkiLCJpbnRlcnZhbCIsInJlZnJlc2hCYXRjaEludGVydmFsXyIsInNldFRpbWVvdXQiLCJvcHRfcmVxdWVzdE9yaWdpbiIsInJlcXVlc3RPcmlnaW5JbmZvIiwicGFyc2UiLCJvcmlnaW4iLCJleHBhbmRQb3N0TWVzc2FnZSIsImFtcGRvYyIsIm1zZyIsImV4cGFuc2lvbk9wdGlvbiIsInZhcmlhYmxlU2VydmljZSIsInVybFJlcGxhY2VtZW50U2VydmljZSIsImJhc2VQcm9taXNlIiwiYmFzZSIsImV4cGFuZFN0cmluZ0FzeW5jIiwiaW5kZXhPZiIsImV4cGFuZGVkTXNnIiwiZXh0cmFVcmxQYXJhbXMiLCJ1cmxSZXBsYWNlbWVudHMiLCJvcHRfYWxsb3dsaXN0IiwibmV3UGFyYW1zIiwicmVxdWVzdFByb21pc2VzIiwib3B0aW9uIiwiZXhwYW5kT2JqZWN0IiwiZGF0YSIsImtleSIsImV4cGFuZGVkRGF0YSIsInZhbHVlIiwiaW5kZXgiLCJ2YWx1ZUtleXMiLCJPYmplY3QiLCJrZXlzIiwicGFyYW1LZXlzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLGtCQUFSO0FBQ0EsU0FBUUMsZUFBUixFQUF5QkMsaUJBQXpCO0FBQ0EsU0FBUUMsZ0JBQVIsRUFBMEJDLHFCQUExQjtBQUNBLFNBQVFDLHNCQUFSO0FBQ0EsU0FBUUMsUUFBUjtBQUNBLFNBQVFDLFNBQVIsRUFBbUJDLFVBQW5CO0FBQ0EsU0FBUUMsSUFBUjtBQUNBLFNBQVFDLGlCQUFSO0FBQ0EsU0FBUUMsT0FBUixFQUFpQkMsY0FBakIsRUFBaUNDLFFBQWpDO0FBRUEsSUFBTUMsa0JBQWtCLEdBQUcsR0FBM0I7QUFFQSxXQUFhQyxjQUFiO0FBQ0U7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRSwwQkFBWUMsT0FBWixFQUFxQkMsT0FBckIsRUFBOEJDLFVBQTlCLEVBQTBDQyxTQUExQyxFQUFxREMsU0FBckQsRUFBZ0U7QUFBQTs7QUFDOUQ7QUFDQSxTQUFLQyxRQUFMLEdBQWdCTCxPQUFoQjs7QUFFQTtBQUNBLFNBQUtNLE9BQUwsR0FBZU4sT0FBTyxDQUFDTyxTQUFSLEVBQWY7O0FBRUE7QUFDQSxTQUFLQyxHQUFMLEdBQVcsS0FBS0YsT0FBTCxDQUFhRSxHQUF4Qjs7QUFFQTtBQUNBLFNBQUtDLGNBQUwsR0FBc0JSLE9BQU8sQ0FBQyxRQUFELENBQTdCOztBQUVBO0FBQ0EsU0FBS1MsT0FBTCxHQUFlbkIsU0FBUyxDQUFDVSxPQUFPLENBQUMsU0FBRCxDQUFSLENBQXhCOztBQUVBO0FBQ0EsU0FBS1UsY0FBTCxHQUFzQlYsT0FBTyxDQUFDLGVBQUQsQ0FBN0I7QUFBZ0Q7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TUFBTUssU0FBUyxHQUFHRixNQUFNLENBQUNDLElBQVAsQ0FBWWpFLE1BQVosQ0FBbEI7O0FBQ0EsT0FBSyxJQUFJOEQsS0FBSyxHQUFHLENBQWpCLEVBQW9CQSxLQUFLLEdBQUdJLFNBQVMsQ0FBQ3RDLE1BQXRDLEVBQThDa0MsS0FBSyxFQUFuRCxFQUF1RDtBQUNyREwsSUFBQUEsWUFBWSxDQUFDekQsTUFBRCxFQUFTa0UsU0FBUyxDQUFDSixLQUFELENBQWxCLEVBQTJCUixTQUEzQixDQUFaO0FBQ0Q7O0FBRUQsU0FBT2hDLE9BQU8sQ0FBQ0MsR0FBUixDQUFZZ0MsZUFBWixFQUE2Qm5ELElBQTdCLENBQWtDO0FBQUEsV0FBTWtELFNBQU47QUFBQSxHQUFsQyxDQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE3IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtBbmFseXRpY3NFdmVudFR5cGV9IGZyb20gJy4vZXZlbnRzJztcbmltcG9ydCB7QmF0Y2hTZWdtZW50RGVmLCBkZWZhdWx0U2VyaWFsaXplcn0gZnJvbSAnLi90cmFuc3BvcnQtc2VyaWFsaXplcic7XG5pbXBvcnQge0V4cGFuc2lvbk9wdGlvbnMsIHZhcmlhYmxlU2VydmljZUZvckRvY30gZnJvbSAnLi92YXJpYWJsZXMnO1xuaW1wb3J0IHtTQU5EQk9YX0FWQUlMQUJMRV9WQVJTfSBmcm9tICcuL3NhbmRib3gtdmFycy1hbGxvd2xpc3QnO1xuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHtkZXZBc3NlcnQsIHVzZXJBc3NlcnR9IGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuaW1wb3J0IHtkaWN0fSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtnZXRSZXNvdXJjZVRpbWluZ30gZnJvbSAnLi9yZXNvdXJjZS10aW1pbmcnO1xuaW1wb3J0IHtpc0FycmF5LCBpc0Zpbml0ZU51bWJlciwgaXNPYmplY3R9IGZyb20gJyNjb3JlL3R5cGVzJztcblxuY29uc3QgQkFUQ0hfSU5URVJWQUxfTUlOID0gMjAwO1xuXG5leHBvcnQgY2xhc3MgUmVxdWVzdEhhbmRsZXIge1xuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcGFyYW0geyFKc29uT2JqZWN0fSByZXF1ZXN0XG4gICAqIEBwYXJhbSB7IS4uLy4uLy4uL3NyYy9wcmVjb25uZWN0LlByZWNvbm5lY3RTZXJ2aWNlfSBwcmVjb25uZWN0XG4gICAqIEBwYXJhbSB7Li90cmFuc3BvcnQuVHJhbnNwb3J0fSB0cmFuc3BvcnRcbiAgICogQHBhcmFtIHtib29sZWFufSBpc1NhbmRib3hcbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIHJlcXVlc3QsIHByZWNvbm5lY3QsIHRyYW5zcG9ydCwgaXNTYW5kYm94KSB7XG4gICAgLyoqIEBjb25zdCB7IUVsZW1lbnR9ICovXG4gICAgdGhpcy5lbGVtZW50XyA9IGVsZW1lbnQ7XG5cbiAgICAvKiogQGNvbnN0IHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSAqL1xuICAgIHRoaXMuYW1wZG9jXyA9IGVsZW1lbnQuZ2V0QW1wRG9jKCk7XG5cbiAgICAvKiogQGNvbnN0IHshV2luZG93fSAqL1xuICAgIHRoaXMud2luID0gdGhpcy5hbXBkb2NfLndpbjtcblxuICAgIC8qKiBAY29uc3Qge3N0cmluZ30gIWlmIHNwZWNpZmllZCwgYWxsIHJlcXVlc3RzIGFyZSBwcmVwZW5kZWQgd2l0aCB0aGlzICovXG4gICAgdGhpcy5yZXF1ZXN0T3JpZ2luXyA9IHJlcXVlc3RbJ29yaWdpbiddO1xuXG4gICAgLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuICAgIHRoaXMuYmFzZVVybCA9IGRldkFzc2VydChyZXF1ZXN0WydiYXNlVXJsJ10pO1xuXG4gICAgLyoqIEBwcml2YXRlIHtBcnJheTxudW1iZXI+fG51bWJlcnx1bmRlZmluZWR9ICovXG4gICAgdGhpcy5iYXRjaEludGVydmFsXyA9IHJlcXVlc3RbJ2JhdGNoSW50ZXJ2YWwnXTsgLy91bml0IGlzIHNlY1xuXG4gICAgLyoqIEBwcml2YXRlIHs/bnVtYmVyfSAqL1xuICAgIHRoaXMucmVwb3J0V2luZG93XyA9IE51bWJlcihyZXF1ZXN0WydyZXBvcnRXaW5kb3cnXSkgfHwgbnVsbDsgLy8gdW5pdCBpcyBzZWNcblxuICAgIC8qKiBAcHJpdmF0ZSB7P251bWJlcn0gKi9cbiAgICB0aGlzLmJhdGNoSW50ZXJ2YWxQb2ludGVyXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgeyEuL3ZhcmlhYmxlcy5WYXJpYWJsZVNlcnZpY2V9ICovXG4gICAgdGhpcy52YXJpYWJsZVNlcnZpY2VfID0gdmFyaWFibGVTZXJ2aWNlRm9yRG9jKGVsZW1lbnQpO1xuXG4gICAgLyoqIEBwcml2YXRlIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvdXJsLXJlcGxhY2VtZW50cy1pbXBsLlVybFJlcGxhY2VtZW50c30gKi9cbiAgICB0aGlzLnVybFJlcGxhY2VtZW50U2VydmljZV8gPSBTZXJ2aWNlcy51cmxSZXBsYWNlbWVudHNGb3JEb2MoZWxlbWVudCk7XG5cbiAgICAvKiogQHByaXZhdGUgeyEuLi8uLi8uLi9zcmMvc2VydmljZS91cmwtaW1wbC5Vcmx9ICovXG4gICAgdGhpcy51cmxTZXJ2aWNlXyA9IFNlcnZpY2VzLnVybEZvckRvYyhlbGVtZW50KTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P1Byb21pc2U8c3RyaW5nPn0gKi9cbiAgICB0aGlzLmJhc2VVcmxQcm9taXNlXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9Qcm9taXNlPHN0cmluZz59ICovXG4gICAgdGhpcy5yZXF1ZXN0T3JpZ2luUHJvbWlzZV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHshQXJyYXk8IVByb21pc2U8IUJhdGNoU2VnbWVudERlZj4+fSAqL1xuICAgIHRoaXMuYmF0Y2hTZWdtZW50UHJvbWlzZXNfID0gW107XG5cbiAgICAvKiogQHByaXZhdGUgeyEuLi8uLi8uLi9zcmMvcHJlY29ubmVjdC5QcmVjb25uZWN0U2VydmljZX0gKi9cbiAgICB0aGlzLnByZWNvbm5lY3RfID0gcHJlY29ubmVjdDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Li90cmFuc3BvcnQuVHJhbnNwb3J0fSAqL1xuICAgIHRoaXMudHJhbnNwb3J0XyA9IHRyYW5zcG9ydDtcblxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgeyFPYmplY3R8dW5kZWZpbmVkfSAqL1xuICAgIHRoaXMuYWxsb3dsaXN0XyA9IGlzU2FuZGJveCA/IFNBTkRCT1hfQVZBSUxBQkxFX1ZBUlMgOiB1bmRlZmluZWQ7XG5cbiAgICAvKiogQHByaXZhdGUgez9udW1iZXJ9ICovXG4gICAgdGhpcy5iYXRjaEludGVydmFsVGltZW91dElkXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9udW1iZXJ9ICovXG4gICAgdGhpcy5yZXBvcnRXaW5kb3dUaW1lb3V0SWRfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLnJlcG9ydFJlcXVlc3RfID0gdHJ1ZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0pzb25PYmplY3R9ICovXG4gICAgdGhpcy5sYXN0VHJpZ2dlcl8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy5xdWV1ZVNpemVfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3Qge251bWJlcn0gKi9cbiAgICB0aGlzLnN0YXJ0VGltZV8gPSBEYXRlLm5vdygpO1xuXG4gICAgdGhpcy5pbml0UmVwb3J0V2luZG93XygpO1xuICAgIHRoaXMuaW5pdEJhdGNoSW50ZXJ2YWxfKCk7XG4gIH1cblxuICAvKipcbiAgICogRXhwb3NlZCBtZXRob2QgdG8gc2VuZCBhIHJlcXVlc3Qgb24gZXZlbnQuXG4gICAqIFJlYWwgcGluZyBtYXkgYmUgYmF0Y2hlZCBhbmQgc2VuZCBvdXQgbGF0ZXIuXG4gICAqIEBwYXJhbSB7P0pzb25PYmplY3R9IGNvbmZpZ1BhcmFtc1xuICAgKiBAcGFyYW0geyFKc29uT2JqZWN0fSB0cmlnZ2VyXG4gICAqIEBwYXJhbSB7IS4vdmFyaWFibGVzLkV4cGFuc2lvbk9wdGlvbnN9IGV4cGFuc2lvbk9wdGlvbnNcbiAgICovXG4gIHNlbmQoY29uZmlnUGFyYW1zLCB0cmlnZ2VyLCBleHBhbnNpb25PcHRpb25zKSB7XG4gICAgY29uc3QgaXNJbXBvcnRhbnQgPSB0cmlnZ2VyWydpbXBvcnRhbnQnXSA9PT0gdHJ1ZTtcbiAgICBpZiAoIXRoaXMucmVwb3J0UmVxdWVzdF8gJiYgIWlzSW1wb3J0YW50KSB7XG4gICAgICAvLyBJZ25vcmUgbm9uIGltcG9ydGFudCB0cmlnZ2VyIG91dCByZXBvcnRXaW5kb3dcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnF1ZXVlU2l6ZV8rKztcbiAgICB0aGlzLmxhc3RUcmlnZ2VyXyA9IHRyaWdnZXI7XG4gICAgY29uc3QgYmluZGluZ3MgPSB0aGlzLnZhcmlhYmxlU2VydmljZV8uZ2V0TWFjcm9zKHRoaXMuZWxlbWVudF8pO1xuICAgIGJpbmRpbmdzWydSRVNPVVJDRV9USU1JTkcnXSA9IGdldFJlc291cmNlVGltaW5nKFxuICAgICAgdGhpcy5lbGVtZW50XyxcbiAgICAgIHRyaWdnZXJbJ3Jlc291cmNlVGltaW5nU3BlYyddLFxuICAgICAgdGhpcy5zdGFydFRpbWVfXG4gICAgKTtcblxuICAgIGlmICghdGhpcy5iYXNlVXJsUHJvbWlzZV8pIHtcbiAgICAgIGV4cGFuc2lvbk9wdGlvbnMuZnJlZXplVmFyKCdleHRyYVVybFBhcmFtcycpO1xuXG4gICAgICB0aGlzLmJhc2VVcmxQcm9taXNlXyA9IHRoaXMuZXhwYW5kVGVtcGxhdGVVcmxfKFxuICAgICAgICB0aGlzLmJhc2VVcmwsXG4gICAgICAgIGV4cGFuc2lvbk9wdGlvbnMsXG4gICAgICAgIGJpbmRpbmdzXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIGV4cGFuZCByZXF1ZXN0T3JpZ2luIGlmIGl0IGlzIGRlY2xhcmVkXG4gICAgaWYgKCF0aGlzLnJlcXVlc3RPcmlnaW5Qcm9taXNlXyAmJiB0aGlzLnJlcXVlc3RPcmlnaW5fKSB7XG4gICAgICAvLyBkbyBub3QgZW5jb2RlIHZhcnMgaW4gcmVxdWVzdCBvcmlnaW5cbiAgICAgIGNvbnN0IHJlcXVlc3RPcmlnaW5FeHBhbnNpb25PcHRpb25zID0gbmV3IEV4cGFuc2lvbk9wdGlvbnMoXG4gICAgICAgIGV4cGFuc2lvbk9wdGlvbnMudmFycyxcbiAgICAgICAgZXhwYW5zaW9uT3B0aW9ucy5pdGVyYXRpb25zLFxuICAgICAgICAvKiBvcHRfbm9FbmNvZGUgKi8gdHJ1ZVxuICAgICAgKTtcblxuICAgICAgdGhpcy5yZXF1ZXN0T3JpZ2luUHJvbWlzZV8gPSB0aGlzLmV4cGFuZFRlbXBsYXRlVXJsXyhcbiAgICAgICAgdGhpcy5yZXF1ZXN0T3JpZ2luXyxcbiAgICAgICAgcmVxdWVzdE9yaWdpbkV4cGFuc2lvbk9wdGlvbnMsXG4gICAgICAgIGJpbmRpbmdzXG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcmFtcyA9IHsuLi5jb25maWdQYXJhbXMsIC4uLnRyaWdnZXJbJ2V4dHJhVXJsUGFyYW1zJ119O1xuICAgIGNvbnN0IHRpbWVzdGFtcCA9IHRoaXMud2luLkRhdGUubm93KCk7XG4gICAgY29uc3QgYmF0Y2hTZWdtZW50UHJvbWlzZSA9IGV4cGFuZEV4dHJhVXJsUGFyYW1zKFxuICAgICAgdGhpcy52YXJpYWJsZVNlcnZpY2VfLFxuICAgICAgdGhpcy51cmxSZXBsYWNlbWVudFNlcnZpY2VfLFxuICAgICAgcGFyYW1zLFxuICAgICAgZXhwYW5zaW9uT3B0aW9ucyxcbiAgICAgIGJpbmRpbmdzLFxuICAgICAgdGhpcy5lbGVtZW50XyxcbiAgICAgIHRoaXMuYWxsb3dsaXN0X1xuICAgICkudGhlbigocGFyYW1zKSA9PiB7XG4gICAgICByZXR1cm4gZGljdCh7XG4gICAgICAgICd0cmlnZ2VyJzogdHJpZ2dlclsnb24nXSxcbiAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgJ2V4dHJhVXJsUGFyYW1zJzogcGFyYW1zLFxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdGhpcy5iYXRjaFNlZ21lbnRQcm9taXNlc18ucHVzaChiYXRjaFNlZ21lbnRQcm9taXNlKTtcbiAgICB0aGlzLnRyaWdnZXJfKGlzSW1wb3J0YW50IHx8ICF0aGlzLmJhdGNoSW50ZXJ2YWxfKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwb3NlIGZ1bmN0aW9uIHRoYXQgY2xlYXIgcmVxdWVzdCBoYW5kbGVyIHN0YXRlLlxuICAgKi9cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLnJlc2V0XygpO1xuXG4gICAgLy8gQ2xlYXIgYmF0Y2hJbnRlcnZhbCB0aW1lb3V0XG4gICAgaWYgKHRoaXMuYmF0Y2hJbnRlcnZhbFRpbWVvdXRJZF8pIHtcbiAgICAgIHRoaXMud2luLmNsZWFyVGltZW91dCh0aGlzLmJhdGNoSW50ZXJ2YWxUaW1lb3V0SWRfKTtcbiAgICAgIHRoaXMuYmF0Y2hJbnRlcnZhbFRpbWVvdXRJZF8gPSBudWxsO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnJlcG9ydFdpbmRvd1RpbWVvdXRJZF8pIHtcbiAgICAgIHRoaXMud2luLmNsZWFyVGltZW91dCh0aGlzLnJlcG9ydFdpbmRvd1RpbWVvdXRJZF8pO1xuICAgICAgdGhpcy5yZXBvcnRXaW5kb3dUaW1lb3V0SWRfID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgKiBAcGFyYW0geyFFeHBhbnNpb25PcHRpb25zfSBleHBhbnNpb25PcHRpb25zXG4gICAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsICghLi4vLi4vLi4vc3JjL3NlcnZpY2UvdmFyaWFibGUtc291cmNlLlJlc29sdmVyUmV0dXJuRGVmfCEuLi8uLi8uLi9zcmMvc2VydmljZS92YXJpYWJsZS1zb3VyY2UuU3luY1Jlc29sdmVyRGVmKT49fSBiaW5kaW5nc1xuICAgKiBAcmV0dXJuIHshUHJvbWlzZTxzdHJpbmc+fVxuICAgKi9cbiAgZXhwYW5kVGVtcGxhdGVVcmxfKHVybCwgZXhwYW5zaW9uT3B0aW9ucywgYmluZGluZ3MpIHtcbiAgICByZXR1cm4gdGhpcy52YXJpYWJsZVNlcnZpY2VfXG4gICAgICAuZXhwYW5kVGVtcGxhdGUoXG4gICAgICAgIHVybCxcbiAgICAgICAgZXhwYW5zaW9uT3B0aW9ucyxcbiAgICAgICAgdGhpcy5lbGVtZW50XyxcbiAgICAgICAgYmluZGluZ3MsXG4gICAgICAgIHRoaXMuYWxsb3dsaXN0X1xuICAgICAgKVxuICAgICAgLnRoZW4oKHVybCkgPT5cbiAgICAgICAgdGhpcy51cmxSZXBsYWNlbWVudFNlcnZpY2VfXG4gICAgICAgICAgLmV4cGFuZFVybEFzeW5jKHVybCwgYmluZGluZ3MsIHRoaXMuYWxsb3dsaXN0XylcbiAgICAgICAgICAuY2F0Y2goKGUpID0+XG4gICAgICAgICAgICB1c2VyQXNzZXJ0KGZhbHNlLCBgQ291bGQgbm90IGV4cGFuZCBVUkwgXCIke3VybH1cIjogJHtlLm1lc3NhZ2V9YClcbiAgICAgICAgICApXG4gICAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIHRoYXQgc2NoZWR1bGUgdGhlIGFjdHVhbCByZXF1ZXN0IHNlbmQuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNJbW1lZGlhdGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHRyaWdnZXJfKGlzSW1tZWRpYXRlKSB7XG4gICAgaWYgKHRoaXMucXVldWVTaXplXyA9PSAwKSB7XG4gICAgICAvLyBEbyBub3RoaW5nIGlmIG5vIHJlcXVlc3QgaW4gcXVldWVcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoaXNJbW1lZGlhdGUpIHtcbiAgICAgIC8vIElmIG5vdCBiYXRjaGVkLCBvciBiYXRjaEludGVydmFsIHNjaGVkdWxlciBzY2hlZHVsZSB0cmlnZ2VyIGltbWVkaWF0ZWx5XG4gICAgICB0aGlzLmZpcmVfKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgb3V0IHJlcXVlc3QuIFNob3VsZCBvbmx5IGJlIGNhbGxlZCBieSBgdHJpZ2dlcl9gIGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBmaXJlXygpIHtcbiAgICBjb25zdCB7XG4gICAgICBiYXNlVXJsUHJvbWlzZV86IGJhc2VVcmxQcm9taXNlLFxuICAgICAgYmF0Y2hTZWdtZW50UHJvbWlzZXNfOiBzZWdtZW50UHJvbWlzZXMsXG4gICAgICByZXF1ZXN0T3JpZ2luUHJvbWlzZV86IHJlcXVlc3RPcmlnaW5Qcm9taXNlLFxuICAgIH0gPSB0aGlzO1xuICAgIGNvbnN0IHRyaWdnZXIgPSAvKiogQHR5cGUgeyFKc29uT2JqZWN0fSAqLyAodGhpcy5sYXN0VHJpZ2dlcl8pO1xuICAgIHRoaXMucmVzZXRfKCk7XG5cbiAgICAvLyBwcmVjb25uZWN0IHRvIHJlcXVlc3RPcmlnaW4gaWYgYXZhaWxhYmxlLCBvdGhlcndpc2UgYmFzZVVybFxuICAgIGNvbnN0IHByZWNvbm5lY3RQcm9taXNlID0gcmVxdWVzdE9yaWdpblByb21pc2VcbiAgICAgID8gcmVxdWVzdE9yaWdpblByb21pc2VcbiAgICAgIDogYmFzZVVybFByb21pc2U7XG5cbiAgICBwcmVjb25uZWN0UHJvbWlzZS50aGVuKChwcmVVcmwpID0+IHtcbiAgICAgIHRoaXMucHJlY29ubmVjdF8udXJsKHRoaXMuYW1wZG9jXywgcHJlVXJsLCB0cnVlKTtcbiAgICB9KTtcblxuICAgIFByb21pc2UuYWxsKFtcbiAgICAgIGJhc2VVcmxQcm9taXNlLFxuICAgICAgUHJvbWlzZS5hbGwoc2VnbWVudFByb21pc2VzKSxcbiAgICAgIHJlcXVlc3RPcmlnaW5Qcm9taXNlLFxuICAgIF0pLnRoZW4oKHJlc3VsdHMpID0+IHtcbiAgICAgIGNvbnN0IHJlcXVlc3RVcmwgPSB0aGlzLmNvbXBvc2VSZXF1ZXN0VXJsXyhyZXN1bHRzWzBdLCByZXN1bHRzWzJdKTtcblxuICAgICAgY29uc3QgYmF0Y2hTZWdtZW50cyA9IHJlc3VsdHNbMV07XG4gICAgICBpZiAoYmF0Y2hTZWdtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBUT0RPOiBpZnJhbWVQaW5nIHdpbGwgbm90IHdvcmsgd2l0aCBiYXRjaC4gQWRkIGEgY29uZmlnIHZhbGlkYXRpb24uXG4gICAgICBpZiAodHJpZ2dlclsnaWZyYW1lUGluZyddKSB7XG4gICAgICAgIHVzZXJBc3NlcnQoXG4gICAgICAgICAgdHJpZ2dlclsnb24nXSA9PSBBbmFseXRpY3NFdmVudFR5cGUuVklTSUJMRSxcbiAgICAgICAgICAnaWZyYW1lUGluZyBpcyBvbmx5IGF2YWlsYWJsZSBvbiBwYWdlIHZpZXcgcmVxdWVzdHMuJ1xuICAgICAgICApO1xuICAgICAgICB0aGlzLnRyYW5zcG9ydF8uc2VuZFJlcXVlc3RVc2luZ0lmcmFtZShyZXF1ZXN0VXJsLCBiYXRjaFNlZ21lbnRzWzBdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudHJhbnNwb3J0Xy5zZW5kUmVxdWVzdChcbiAgICAgICAgICByZXF1ZXN0VXJsLFxuICAgICAgICAgIGJhdGNoU2VnbWVudHMsXG4gICAgICAgICAgISF0aGlzLmJhdGNoSW50ZXJ2YWxfXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgYmF0Y2hpbmcgc3RhdHVzXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICByZXNldF8oKSB7XG4gICAgdGhpcy5xdWV1ZVNpemVfID0gMDtcbiAgICB0aGlzLmJhc2VVcmxQcm9taXNlXyA9IG51bGw7XG4gICAgdGhpcy5iYXRjaFNlZ21lbnRQcm9taXNlc18gPSBbXTtcbiAgICB0aGlzLmxhc3RUcmlnZ2VyXyA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIGJhdGNoSW50ZXJ2YWxcbiAgICovXG4gIGluaXRCYXRjaEludGVydmFsXygpIHtcbiAgICBpZiAoIXRoaXMuYmF0Y2hJbnRlcnZhbF8pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmJhdGNoSW50ZXJ2YWxfID0gaXNBcnJheSh0aGlzLmJhdGNoSW50ZXJ2YWxfKVxuICAgICAgPyB0aGlzLmJhdGNoSW50ZXJ2YWxfXG4gICAgICA6IFt0aGlzLmJhdGNoSW50ZXJ2YWxfXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5iYXRjaEludGVydmFsXy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IGludGVydmFsID0gdGhpcy5iYXRjaEludGVydmFsX1tpXTtcbiAgICAgIHVzZXJBc3NlcnQoXG4gICAgICAgIGlzRmluaXRlTnVtYmVyKGludGVydmFsKSxcbiAgICAgICAgJ0ludmFsaWQgYmF0Y2hJbnRlcnZhbCB2YWx1ZTogJXMnLFxuICAgICAgICB0aGlzLmJhdGNoSW50ZXJ2YWxfXG4gICAgICApO1xuICAgICAgaW50ZXJ2YWwgPSBOdW1iZXIoaW50ZXJ2YWwpICogMTAwMDtcbiAgICAgIHVzZXJBc3NlcnQoXG4gICAgICAgIGludGVydmFsID49IEJBVENIX0lOVEVSVkFMX01JTixcbiAgICAgICAgJ0ludmFsaWQgYmF0Y2hJbnRlcnZhbCB2YWx1ZTogJXMsICcgK1xuICAgICAgICAgICdpbnRlcnZhbCB2YWx1ZSBtdXN0IGJlIGdyZWF0ZXIgdGhhbiAlcyBtcy4nLFxuICAgICAgICB0aGlzLmJhdGNoSW50ZXJ2YWxfLFxuICAgICAgICBCQVRDSF9JTlRFUlZBTF9NSU5cbiAgICAgICk7XG4gICAgICB0aGlzLmJhdGNoSW50ZXJ2YWxfW2ldID0gaW50ZXJ2YWw7XG4gICAgfVxuXG4gICAgdGhpcy5iYXRjaEludGVydmFsUG9pbnRlcl8gPSAwO1xuXG4gICAgdGhpcy5yZWZyZXNoQmF0Y2hJbnRlcnZhbF8oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyByZXBvcnQgd2luZG93LlxuICAgKi9cbiAgaW5pdFJlcG9ydFdpbmRvd18oKSB7XG4gICAgaWYgKHRoaXMucmVwb3J0V2luZG93Xykge1xuICAgICAgdGhpcy5yZXBvcnRXaW5kb3dUaW1lb3V0SWRfID0gdGhpcy53aW4uc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIC8vIEZsdXNoIGJhdGNoIHF1ZXVlO1xuICAgICAgICB0aGlzLnRyaWdnZXJfKHRydWUpO1xuICAgICAgICB0aGlzLnJlcG9ydFJlcXVlc3RfID0gZmFsc2U7XG4gICAgICAgIC8vIENsZWFyIGJhdGNoSW50ZXJ2YWwgdGltZW91dFxuICAgICAgICBpZiAodGhpcy5iYXRjaEludGVydmFsVGltZW91dElkXykge1xuICAgICAgICAgIHRoaXMud2luLmNsZWFyVGltZW91dCh0aGlzLmJhdGNoSW50ZXJ2YWxUaW1lb3V0SWRfKTtcbiAgICAgICAgICB0aGlzLmJhdGNoSW50ZXJ2YWxUaW1lb3V0SWRfID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcy5yZXBvcnRXaW5kb3dfICogMTAwMCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNjaGVkdWxlIHNlbmRpbmcgcmVxdWVzdCByZWdhcmRpbmcgdG8gYmF0Y2hJbnRlcnZhbFxuICAgKi9cbiAgcmVmcmVzaEJhdGNoSW50ZXJ2YWxfKCkge1xuICAgIGRldkFzc2VydChcbiAgICAgIHRoaXMuYmF0Y2hJbnRlcnZhbFBvaW50ZXJfICE9IG51bGwsXG4gICAgICAnU2hvdWxkIG5vdCBzdGFydCBiYXRjaEludGVydmFsIHdpdGhvdXQgcG9pbnRlcidcbiAgICApO1xuICAgIGNvbnN0IGludGVydmFsID1cbiAgICAgIHRoaXMuYmF0Y2hJbnRlcnZhbFBvaW50ZXJfIDwgdGhpcy5iYXRjaEludGVydmFsXy5sZW5ndGhcbiAgICAgICAgPyB0aGlzLmJhdGNoSW50ZXJ2YWxfW3RoaXMuYmF0Y2hJbnRlcnZhbFBvaW50ZXJfKytdXG4gICAgICAgIDogdGhpcy5iYXRjaEludGVydmFsX1t0aGlzLmJhdGNoSW50ZXJ2YWxfLmxlbmd0aCAtIDFdO1xuXG4gICAgdGhpcy5iYXRjaEludGVydmFsVGltZW91dElkXyA9IHRoaXMud2luLnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy50cmlnZ2VyXyh0cnVlKTtcbiAgICAgIHRoaXMucmVmcmVzaEJhdGNoSW50ZXJ2YWxfKCk7XG4gICAgfSwgaW50ZXJ2YWwpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXBvc2VzIGEgcmVxdWVzdCBVUkwgZ2l2ZW4gYSBiYXNlIGFuZCByZXF1ZXN0T3JpZ2luXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVXJsXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X3JlcXVlc3RPcmlnaW5cbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgY29tcG9zZVJlcXVlc3RVcmxfKGJhc2VVcmwsIG9wdF9yZXF1ZXN0T3JpZ2luKSB7XG4gICAgaWYgKG9wdF9yZXF1ZXN0T3JpZ2luKSB7XG4gICAgICAvLyBXZSBleHBlY3QgcmVxdWVzdE9yaWdpbiB0byBhbHdheXMgY29udGFpbiB0aGUgVVJMIG9yaWdpbi4gSW4gdGhlIGNhc2VcbiAgICAgIC8vIHdoZXJlIHJlcXVlc3RPcmlnaW4gaGFzIGEgcmVsYXRpdmUgVVJMLCB0aGUgY3VycmVudCBwYWdlJ3Mgb3JpZ2luIHdpbGxcbiAgICAgIC8vIGJlIHVzZWQuIFdlIHdpbGwgc2ltcGx5IHJlc3BlY3QgdGhlIHJlcXVlc3RPcmlnaW4gYW5kIGJhc2VVcmwsIHdlIGRvbid0XG4gICAgICAvLyBjaGVjayBpZiB0aGV5IGZvcm0gYSB2YWxpZCBVUkwgYW5kIHJlcXVlc3Qgd2lsbCBmYWlsIHNpbGVudGx5XG4gICAgICBjb25zdCByZXF1ZXN0T3JpZ2luSW5mbyA9IHRoaXMudXJsU2VydmljZV8ucGFyc2Uob3B0X3JlcXVlc3RPcmlnaW4pO1xuICAgICAgcmV0dXJuIHJlcXVlc3RPcmlnaW5JbmZvLm9yaWdpbiArIGJhc2VVcmw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJhc2VVcmw7XG4gIH1cbn1cblxuLyoqXG4gKiBFeHBhbmQgdGhlIHBvc3RNZXNzYWdlIHN0cmluZ1xuICogQHBhcmFtIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAqIEBwYXJhbSB7c3RyaW5nfSBtc2dcbiAqIEBwYXJhbSB7P0pzb25PYmplY3R9IGNvbmZpZ1BhcmFtc1xuICogQHBhcmFtIHshSnNvbk9iamVjdH0gdHJpZ2dlclxuICogQHBhcmFtIHshLi92YXJpYWJsZXMuRXhwYW5zaW9uT3B0aW9uc30gZXhwYW5zaW9uT3B0aW9uXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJuIHtQcm9taXNlPHN0cmluZz59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHBhbmRQb3N0TWVzc2FnZShcbiAgYW1wZG9jLFxuICBtc2csXG4gIGNvbmZpZ1BhcmFtcyxcbiAgdHJpZ2dlcixcbiAgZXhwYW5zaW9uT3B0aW9uLFxuICBlbGVtZW50XG4pIHtcbiAgY29uc3QgdmFyaWFibGVTZXJ2aWNlID0gdmFyaWFibGVTZXJ2aWNlRm9yRG9jKGFtcGRvYyk7XG4gIGNvbnN0IHVybFJlcGxhY2VtZW50U2VydmljZSA9IFNlcnZpY2VzLnVybFJlcGxhY2VtZW50c0ZvckRvYyhlbGVtZW50KTtcblxuICBjb25zdCBiaW5kaW5ncyA9IHZhcmlhYmxlU2VydmljZS5nZXRNYWNyb3MoZWxlbWVudCk7XG4gIGV4cGFuc2lvbk9wdGlvbi5mcmVlemVWYXIoJ2V4dHJhVXJsUGFyYW1zJyk7XG5cbiAgY29uc3QgYmFzZVByb21pc2UgPSB2YXJpYWJsZVNlcnZpY2VcbiAgICAuZXhwYW5kVGVtcGxhdGUobXNnLCBleHBhbnNpb25PcHRpb24sIGVsZW1lbnQpXG4gICAgLnRoZW4oKGJhc2UpID0+IHtcbiAgICAgIHJldHVybiB1cmxSZXBsYWNlbWVudFNlcnZpY2UuZXhwYW5kU3RyaW5nQXN5bmMoYmFzZSwgYmluZGluZ3MpO1xuICAgIH0pO1xuICBpZiAobXNnLmluZGV4T2YoJyR7ZXh0cmFVcmxQYXJhbXN9JykgPCAwKSB7XG4gICAgLy8gTm8gbmVlZCB0byBhcHBlbmQgZXh0cmFVcmxQYXJhbXNcbiAgICByZXR1cm4gYmFzZVByb21pc2U7XG4gIH1cblxuICByZXR1cm4gYmFzZVByb21pc2UudGhlbigoZXhwYW5kZWRNc2cpID0+IHtcbiAgICBjb25zdCBwYXJhbXMgPSB7Li4uY29uZmlnUGFyYW1zLCAuLi50cmlnZ2VyWydleHRyYVVybFBhcmFtcyddfTtcbiAgICAvL3JldHVybiBiYXNlIHVybCB3aXRoIHRoZSBhcHBlbmRlZCBleHRyYSB1cmwgcGFyYW1zO1xuICAgIHJldHVybiBleHBhbmRFeHRyYVVybFBhcmFtcyhcbiAgICAgIHZhcmlhYmxlU2VydmljZSxcbiAgICAgIHVybFJlcGxhY2VtZW50U2VydmljZSxcbiAgICAgIHBhcmFtcyxcbiAgICAgIGV4cGFuc2lvbk9wdGlvbixcbiAgICAgIGJpbmRpbmdzLFxuICAgICAgZWxlbWVudFxuICAgICkudGhlbigoZXh0cmFVcmxQYXJhbXMpID0+IHtcbiAgICAgIHJldHVybiBkZWZhdWx0U2VyaWFsaXplcihleHBhbmRlZE1zZywgW1xuICAgICAgICBkaWN0KHsnZXh0cmFVcmxQYXJhbXMnOiBleHRyYVVybFBhcmFtc30pLFxuICAgICAgXSk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRoYXQgaGFuZGxlciBleHRyYVVybFBhcmFtcyBmcm9tIGNvbmZpZyBhbmQgdHJpZ2dlci5cbiAqIEBwYXJhbSB7IS4vdmFyaWFibGVzLlZhcmlhYmxlU2VydmljZX0gdmFyaWFibGVTZXJ2aWNlXG4gKiBAcGFyYW0geyEuLi8uLi8uLi9zcmMvc2VydmljZS91cmwtcmVwbGFjZW1lbnRzLWltcGwuVXJsUmVwbGFjZW1lbnRzfSB1cmxSZXBsYWNlbWVudHNcbiAqIEBwYXJhbSB7IU9iamVjdH0gcGFyYW1zXG4gKiBAcGFyYW0geyEuL3ZhcmlhYmxlcy5FeHBhbnNpb25PcHRpb25zfSBleHBhbnNpb25PcHRpb25cbiAqIEBwYXJhbSB7IU9iamVjdH0gYmluZGluZ3NcbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7IU9iamVjdD19IG9wdF9hbGxvd2xpc3RcbiAqIEByZXR1cm4geyFQcm9taXNlPCFPYmplY3Q+fVxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gZXhwYW5kRXh0cmFVcmxQYXJhbXMoXG4gIHZhcmlhYmxlU2VydmljZSxcbiAgdXJsUmVwbGFjZW1lbnRzLFxuICBwYXJhbXMsXG4gIGV4cGFuc2lvbk9wdGlvbixcbiAgYmluZGluZ3MsXG4gIGVsZW1lbnQsXG4gIG9wdF9hbGxvd2xpc3Rcbikge1xuICBjb25zdCBuZXdQYXJhbXMgPSB7fTtcbiAgY29uc3QgcmVxdWVzdFByb21pc2VzID0gW107XG4gIC8vIERvbid0IGVuY29kZSBwYXJhbSB2YWx1ZXMgaGVyZSxcbiAgLy8gYXMgd2UnbGwgZG8gaXQgbGF0ZXIgaW4gdGhlIGdldEV4dHJhVXJsUGFyYW1zU3RyaW5nIGNhbGwuXG4gIGNvbnN0IG9wdGlvbiA9IG5ldyBFeHBhbnNpb25PcHRpb25zKFxuICAgIGV4cGFuc2lvbk9wdGlvbi52YXJzLFxuICAgIGV4cGFuc2lvbk9wdGlvbi5pdGVyYXRpb25zLFxuICAgIHRydWUgLyogbm9FbmNvZGUgKi9cbiAgKTtcblxuICBjb25zdCBleHBhbmRPYmplY3QgPSAoZGF0YSwga2V5LCBleHBhbmRlZERhdGEpID0+IHtcbiAgICBjb25zdCB2YWx1ZSA9IGRhdGFba2V5XTtcblxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBleHBhbmRlZERhdGFba2V5XSA9IHVuZGVmaW5lZDtcbiAgICAgIGNvbnN0IHJlcXVlc3QgPSB2YXJpYWJsZVNlcnZpY2VcbiAgICAgICAgLmV4cGFuZFRlbXBsYXRlKHZhbHVlLCBvcHRpb24sIGVsZW1lbnQpXG4gICAgICAgIC50aGVuKCh2YWx1ZSkgPT5cbiAgICAgICAgICB1cmxSZXBsYWNlbWVudHMuZXhwYW5kU3RyaW5nQXN5bmModmFsdWUsIGJpbmRpbmdzLCBvcHRfYWxsb3dsaXN0KVxuICAgICAgICApXG4gICAgICAgIC50aGVuKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgIGV4cGFuZGVkRGF0YVtrZXldID0gdmFsdWU7XG4gICAgICAgIH0pO1xuICAgICAgcmVxdWVzdFByb21pc2VzLnB1c2gocmVxdWVzdCk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgZXhwYW5kZWREYXRhW2tleV0gPSBbXTtcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB2YWx1ZS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgZXhwYW5kT2JqZWN0KHZhbHVlLCBpbmRleCwgZXhwYW5kZWREYXRhW2tleV0pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNPYmplY3QodmFsdWUpICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICBleHBhbmRlZERhdGFba2V5XSA9IHt9O1xuICAgICAgY29uc3QgdmFsdWVLZXlzID0gT2JqZWN0LmtleXModmFsdWUpO1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHZhbHVlS2V5cy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgZXhwYW5kT2JqZWN0KHZhbHVlLCB2YWx1ZUtleXNbaW5kZXhdLCBleHBhbmRlZERhdGFba2V5XSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE51bWJlciwgYm9vbCwgbnVsbFxuICAgICAgZXhwYW5kZWREYXRhW2tleV0gPSB2YWx1ZTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgcGFyYW1LZXlzID0gT2JqZWN0LmtleXMocGFyYW1zKTtcbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHBhcmFtS2V5cy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICBleHBhbmRPYmplY3QocGFyYW1zLCBwYXJhbUtleXNbaW5kZXhdLCBuZXdQYXJhbXMpO1xuICB9XG5cbiAgcmV0dXJuIFByb21pc2UuYWxsKHJlcXVlc3RQcm9taXNlcykudGhlbigoKSA9PiBuZXdQYXJhbXMpO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/requests.js