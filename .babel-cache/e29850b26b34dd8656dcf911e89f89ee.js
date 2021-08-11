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
import { CONSENT_POLICY_STATE } from "../../core/constants/consent-state";
import { isArray, isObject } from "../../core/types";
import { tryParseJson } from "../../core/types/object/json";
import { Services } from "./..";
import { RTC_VENDORS } from "./callout-vendors";
import { isCancellation } from "../../error-reporting";
import { dev, user, userAssert } from "../../log";
import { getMode } from "../../mode";
import { registerServiceBuilderForDoc } from "../../service-helpers";
import { isAmpScriptUri } from "../../url";

/** @type {string} */
var TAG = 'real-time-config';

/** @type {number} */
var MAX_RTC_CALLOUTS = 5;

/** @type {number} */
var MAX_URL_LENGTH = 16384;

/** @typedef {{
    urls: (undefined|Array<string>|
      Array<{url:string, errorReportingUrl:string,
        sendRegardlessOfConsentState:(undefined|boolean|Array<string>)}>),
    vendors: (undefined|Object),
    timeoutMillis: number,
    errorReportingUrl: (undefined|string),
    sendRegardlessOfConsentState: (undefined|boolean|Array<string>)
}} */
var RtcConfigDef;

/**
 * Enum starts at 4 because 1-3 reserved as:
 *  1 = custom remote.html in use.
 *  2 = RTC succeeded.
 *  3 = deprecated generic RTC failures.
 * @enum {string}
 */
export var RTC_ERROR_ENUM = {
  // Occurs when response is unparseable as JSON
  MALFORMED_JSON_RESPONSE: '4',
  // Occurs when a publisher has specified the same url
  // or vendor url (after macros are substituted) to call out to more than once.
  DUPLICATE_URL: '5',
  // Occurs when a URL fails isSecureUrl check.
  INSECURE_URL: '6',
  // Occurs when 5 valid callout urls have already been built, and additional
  // urls are still specified.
  MAX_CALLOUTS_EXCEEDED: '7',
  // Occurs due to XHR failure.
  NETWORK_FAILURE: '8',
  // Occurs when a specified vendor does not exist in RTC_VENDORS.
  UNKNOWN_VENDOR: '9',
  // Occurs when request took longer than timeout
  TIMEOUT: '10',
  // Occurs when URL expansion time exceeded allowed timeout, request never
  // sent.
  MACRO_EXPAND_TIMEOUT: '11'
};

/** @const {!Object<string, boolean>} */
var GLOBAL_MACRO_ALLOWLIST = {
  CLIENT_ID: true
};
export var RealTimeConfigService = /*#__PURE__*/function () {
  /**
   * @param {!../ampdoc-impl.AmpDoc} ampDoc
   */
  function RealTimeConfigService(ampDoc) {
    _classCallCheck(this, RealTimeConfigService);

    /** @protected {!../ampdoc-impl.AmpDoc} */
    this.ampDoc_ = ampDoc;
  }

  /**
   * For a given A4A Element, sends out Real Time Config requests to
   * any urls or vendors specified by the publisher.
   * @param {!Element} element
   * @param {!Object<string, !../../../src/service/variable-source.AsyncResolverDef>} customMacros The ad-network specified macro
   *   substitutions available to use.
   * @param {?CONSENT_POLICY_STATE} consentState
   * @param {?string} consentString
   * @param {?Object<string, string|number|boolean|undefined>} consentMetadata
   * @param {!Function} checkStillCurrent
   * @return {Promise<!Array<!rtcResponseDef>>|undefined}
   * @visibleForTesting
   */
  _createClass(RealTimeConfigService, [{
    key: "maybeExecuteRealTimeConfig",
    value: function maybeExecuteRealTimeConfig(element, customMacros, consentState, consentString, consentMetadata, checkStillCurrent) {
      return new RealTimeConfigManager(this.ampDoc_).execute(element, customMacros, consentState, consentString, consentMetadata, checkStillCurrent);
    }
  }]);

  return RealTimeConfigService;
}();
export var RealTimeConfigManager = /*#__PURE__*/function () {
  /**
   * @param {!../ampdoc-impl.AmpDoc} ampDoc
   */
  function RealTimeConfigManager(ampDoc) {
    _classCallCheck(this, RealTimeConfigManager);

    /** @protected {!../ampdoc-impl.AmpDoc} */
    this.ampDoc_ = ampDoc;

    /** @private {!Window} */
    this.win_ = ampDoc.win;

    /** @private {!Object<string, boolean>} */
    this.seenUrls_ = {};

    /** @private {?number} */
    this.rtcStartTime_ = null;

    /** @private {!Array<!Promise<!rtcResponseDef>>} */
    this.promiseArray_ = [];

    /** @private {?RtcConfigDef} */
    this.rtcConfig_ = null;

    /** @private {?CONSENT_POLICY_STATE} */
    this.consentState_ = null;

    /** @private {?string} */
    this.consentString_ = null;

    /** @private {?Object<string, string|number|boolean|undefined>} */
    this.consentMetadata_ = null;
  }

  /**
   * @param {string} error
   * @param {string} callout
   * @param {string} errorReportingUrl
   * @param {number=} opt_rtcTime
   * @return {!Promise<!rtcResponseDef>}
   * @private
   */
  _createClass(RealTimeConfigManager, [{
    key: "buildErrorResponse_",
    value: function buildErrorResponse_(error, callout, errorReportingUrl, opt_rtcTime) {
      dev().warn(TAG, "RTC callout to " + callout + " caused " + error);

      if (errorReportingUrl) {
        this.sendErrorMessage(error, errorReportingUrl);
      }

      return Promise.resolve(
      /**@type {rtcResponseDef} */
      {
        error: error,
        callout: callout,
        rtcTime: opt_rtcTime || 0
      });
    }
    /**
     * @param {string} errorType Uses the RTC_ERROR_ENUM above.
     * @param {string} errorReportingUrl
     */

  }, {
    key: "sendErrorMessage",
    value: function sendErrorMessage(errorType, errorReportingUrl) {
      if (!getMode(this.win_).localDev && !getMode(this.win_).test && Math.random() >= 0.01) {
        return;
      }

      var allowlist = {
        ERROR_TYPE: true,
        HREF: true
      };
      var macros = {
        ERROR_TYPE: errorType,
        HREF: this.win_.location.href
      };
      var service = Services.urlReplacementsForDoc(this.ampDoc_);
      var url = service.expandUrlSync(errorReportingUrl, macros, allowlist);
      new this.win_.Image().src = url;
    }
    /**
     * Converts a URL into its corresponding shortened callout string.
     * We also truncate to a maximum length of 50 characters.
     * For instance, if we are passed
     * "https://example.test/example.php?foo=a&bar=b, then we return
     * example.test/example.php
     * @param {string} url
     * @return {string}
     */

  }, {
    key: "getCalloutParam_",
    value: function getCalloutParam_(url) {
      var urlService = Services.urlForDoc(this.ampDoc_);
      var parsedUrl = urlService.parse(url);
      return (parsedUrl.hostname + parsedUrl.pathname).substr(0, 50);
    }
    /**
     * Returns whether a given callout object is valid to send an RTC request
     * to, for the given consentState.
     * @param {Object|string} calloutConfig
     * @param {boolean=} optIsGloballyValid
     * @return {boolean}
     * @visibleForTesting
     */

  }, {
    key: "isValidCalloutForConsentState",
    value: function isValidCalloutForConsentState(calloutConfig, optIsGloballyValid) {
      var sendRegardlessOfConsentState = calloutConfig.sendRegardlessOfConsentState;

      if (!isObject(calloutConfig) || !sendRegardlessOfConsentState) {
        return !!optIsGloballyValid;
      }

      if (typeof sendRegardlessOfConsentState == 'boolean') {
        return sendRegardlessOfConsentState;
      }

      if (isArray(sendRegardlessOfConsentState)) {
        for (var i = 0; i < sendRegardlessOfConsentState.length; i++) {
          if (this.consentState_ == CONSENT_POLICY_STATE[sendRegardlessOfConsentState[i]]) {
            return true;
          } else if (!CONSENT_POLICY_STATE[sendRegardlessOfConsentState[i]]) {
            dev().warn(TAG, 'Invalid RTC consent state given: ' + ("" + sendRegardlessOfConsentState[i]));
          }
        }

        return false;
      }

      user().warn(TAG, 'Invalid value for sendRegardlessOfConsentState:' + ("" + sendRegardlessOfConsentState));
      return !!optIsGloballyValid;
    }
    /**
     * Goes through the RTC config, and for any URL that we should not callout
     * as per the current consent state, deletes it from the RTC config.
     * For example, if the RTC config looked like:
     *    {vendors: {vendorA: {'sendRegardlessOfConsentState': true}
     *               vendorB: {'macros': {'SLOT_ID': 1}}},
     *     urls: ['https://www.rtc.example/example',
     *            {url: 'https://www.rtcSite2.example/example',
     *             sendRegardlessOfConsentState: ['UNKNOWN']}]
     *    }
     * and the consentState is CONSENT_POLICY_STATE.UNKNOWN,
     * then this method call would clear the callouts to vendorB, and to the first
     * custom URL.
     */

  }, {
    key: "modifyRtcConfigForConsentStateSettings",
    value: function modifyRtcConfigForConsentStateSettings() {
      var _this = this;

      if (this.consentState_ == undefined || this.consentState_ == CONSENT_POLICY_STATE.SUFFICIENT || this.consentState_ == CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED) {
        return;
      }

      var isGloballyValid = this.isValidCalloutForConsentState(this.rtcConfig_);
      this.rtcConfig_.urls = (this.rtcConfig_.urls || []).filter(function (url) {
        return _this.isValidCalloutForConsentState(url, isGloballyValid);
      });
      Object.keys(this.rtcConfig_.vendors || {}).forEach(function (vendor) {
        if (!_this.isValidCalloutForConsentState(_this.rtcConfig_.vendors[vendor], isGloballyValid)) {
          delete _this.rtcConfig_.vendors[vendor];
        }
      });
    }
    /**
     * Assigns constant macros that should exist for all RTC to object of custom
     * per-network macros.
     * @param {!Object<string, !../../../src/service/variable-source.AsyncResolverDef>} macros
     * @return {!Object<string, !../../../src/service/variable-source.AsyncResolverDef>}
     */

  }, {
    key: "assignMacros",
    value: function assignMacros(macros) {
      var _this2 = this;

      macros['TIMEOUT'] = function () {
        return _this2.rtcConfig_.timeoutMillis;
      };

      macros['CONSENT_STATE'] = function () {
        return _this2.consentState_;
      };

      macros['CONSENT_STRING'] = function () {
        return _this2.consentString_;
      };

      macros['CONSENT_METADATA'] =
      /** @type {!../../../src/service/variable-source.AsyncResolverDef} */
      function (key) {
        userAssert(key, 'CONSENT_METADATA macro must contian a key');
        return _this2.consentMetadata_ ? _this2.consentMetadata_[key] : null;
      };

      return macros;
    }
    /**
     * Manages sending the RTC callouts for the Custom URLs.
     * @param {!Object<string, !../../../src/service/variable-source.AsyncResolverDef>} customMacros The ad-network specified macro
     * @param {!Function} checkStillCurrent
     * @param {!Element} element
     */

  }, {
    key: "handleRtcForCustomUrls",
    value: function handleRtcForCustomUrls(customMacros, checkStillCurrent, element) {
      var _this3 = this;

      // For each publisher defined URL, inflate the url using the macros,
      // and send the RTC request.
      (this.rtcConfig_.urls || []).forEach(function (urlObj) {
        var url, errorReportingUrl;

        if (isObject(urlObj)) {
          url = urlObj.url;
          errorReportingUrl = urlObj.errorReportingUrl;
        } else if (typeof urlObj == 'string') {
          url = urlObj;
        } else {
          dev().warn(TAG, "Invalid url: " + urlObj);
        }

        _this3.inflateAndSendRtc_(url, customMacros, errorReportingUrl, checkStillCurrent,
        /* opt_vendor */
        undefined, element);
      });
    }
    /**
     * Manages sending the RTC callouts for all specified vendors.
     * @param {!Object<string, !../../../src/service/variable-source.AsyncResolverDef>} customMacros The ad-network specified macro
     * @param {!Function} checkStillCurrent
     */

  }, {
    key: "handleRtcForVendorUrls",
    value: function handleRtcForVendorUrls(customMacros, checkStillCurrent) {
      var _this4 = this;

      // For each vendor the publisher has specified, inflate the vendor
      // url if it exists, and send the RTC request.
      Object.keys(this.rtcConfig_.vendors || []).forEach(function (vendor) {
        var vendorObject = RTC_VENDORS[vendor.toLowerCase()];
        var url = vendorObject ? vendorObject.url : '';
        var errorReportingUrl = vendorObject && vendorObject.errorReportingUrl ? vendorObject.errorReportingUrl : '';

        if (!url) {
          return _this4.promiseArray_.push(_this4.buildErrorResponse_(RTC_ERROR_ENUM.UNKNOWN_VENDOR, vendor, errorReportingUrl));
        }

        // There are two valid configurations of the vendor object.
        // It can either be an object of macros mapping string to string,
        // or it can be an object with sub-objects, one of which can be
        // 'macros'. This is for backwards compatability.
        var vendorMacros = isObject(_this4.rtcConfig_.vendors[vendor]['macros']) ? _this4.rtcConfig_.vendors[vendor]['macros'] : _this4.rtcConfig_.vendors[vendor];
        var validVendorMacros = {};
        Object.keys(vendorMacros).forEach(function (macro) {
          if (!(vendorObject.macros && vendorObject.macros.includes(macro))) {
            user().error(TAG, "Unknown macro: " + macro + " for vendor: " + vendor);
          } else {
            var value = vendorMacros[macro];
            validVendorMacros[macro] = isObject(value) || isArray(value) ? JSON.stringify(value) : value;
          }
        });
        // The ad network defined macros override vendor defined/pub specifed.
        var macros = Object.assign(validVendorMacros, customMacros);

        _this4.inflateAndSendRtc_(url, macros, errorReportingUrl, checkStillCurrent, vendor.toLowerCase());
      });
    }
    /**
     * @param {string} url
     * @param {!Object<string, !../../../src/service/variable-source.AsyncResolverDef>} macros
     * @param {string} errorReportingUrl
     * @param {!Function} checkStillCurrent
     * @param {string=} opt_vendor
     * @param {!Element=} opt_element
     * @private
     */

  }, {
    key: "inflateAndSendRtc_",
    value: function inflateAndSendRtc_(url, macros, errorReportingUrl, checkStillCurrent, opt_vendor, opt_element) {
      var _this5 = this;

      var timeoutMillis = this.rtcConfig_.timeoutMillis;
      var callout = opt_vendor || this.getCalloutParam_(url);

      /**
       * The time that it takes to substitute the macros into the URL can vary
       * depending on what the url requires to be substituted, i.e. a long
       * async call. Thus, however long the URL replacement took is treated as a
       * time penalty.
       * @param {string} url
       * @return {*} TODO(#23582): Specify return type
       */
      var send = function send(url) {
        if (Object.keys(_this5.seenUrls_).length == MAX_RTC_CALLOUTS) {
          return _this5.buildErrorResponse_(RTC_ERROR_ENUM.MAX_CALLOUTS_EXCEEDED, callout, errorReportingUrl);
        }

        if (!Services.urlForDoc(_this5.ampDoc_).isSecure(url) && !isAmpScriptUri(url)) {
          return _this5.buildErrorResponse_(RTC_ERROR_ENUM.INSECURE_URL, callout, errorReportingUrl);
        }

        if (_this5.seenUrls_[url]) {
          return _this5.buildErrorResponse_(RTC_ERROR_ENUM.DUPLICATE_URL, callout, errorReportingUrl);
        }

        _this5.seenUrls_[url] = true;

        if (url.length > MAX_URL_LENGTH) {
          url = _this5.truncUrl_(url);
        }

        return _this5.sendRtcCallout_(url, timeoutMillis, callout, checkStillCurrent, errorReportingUrl, opt_element);
      };

      var allowlist = _extends({}, GLOBAL_MACRO_ALLOWLIST);

      Object.keys(macros).forEach(function (key) {
        return allowlist[key] = true;
      });
      var urlReplacementStartTime = Date.now();
      this.promiseArray_.push(Services.timerFor(this.win_).timeoutPromise(timeoutMillis, Services.urlReplacementsForDoc(this.ampDoc_).expandUrlAsync(url, macros, allowlist)).then(function (url) {
        checkStillCurrent();
        timeoutMillis -= urlReplacementStartTime - Date.now();
        return send(url);
      }).catch(function (error) {
        return isCancellation(error) ? undefined : _this5.buildErrorResponse_(RTC_ERROR_ENUM.MACRO_EXPAND_TIMEOUT, callout, errorReportingUrl);
      }));
    }
    /**
     * @param {string} url
     * @return {string}
     */

  }, {
    key: "truncUrl_",
    value: function truncUrl_(url) {
      url = url.substr(0, MAX_URL_LENGTH - 12).replace(/%\w?$/, '');
      return url + '&__trunc__=1';
    }
    /**
     * @param {string} url
     * @param {number} timeoutMillis
     * @param {string} callout
     * @param {!Function} checkStillCurrent
     * @param {string} errorReportingUrl
     * @param {!Element=} opt_element
     * @return {!Promise<!rtcResponseDef>}
     * @private
     */

  }, {
    key: "sendRtcCallout_",
    value: function sendRtcCallout_(url, timeoutMillis, callout, checkStillCurrent, errorReportingUrl, opt_element) {
      var _this6 = this;

      var rtcFetch;

      if (isAmpScriptUri(url)) {
        rtcFetch = Services.scriptForDocOrNull(opt_element).then(function (service) {
          userAssert(service, 'AMP-SCRIPT is not installed.');
          return service.fetch(url);
        }).then(function (json) {
          checkStillCurrent();

          var rtcTime = Date.now() - _this6.rtcStartTime_;

          if (typeof json !== 'object') {
            return _this6.buildErrorResponse_(RTC_ERROR_ENUM.MALFORMED_JSON_RESPONSE, callout, errorReportingUrl, rtcTime);
          }

          return {
            response: json,
            rtcTime: rtcTime,
            callout: callout
          };
        });
      } else {
        rtcFetch = Services.xhrFor(this.win_).fetchJson( // NOTE(bradfrizzell): we could include ampCors:false allowing
        // the request to be cached across sites but for now assume that
        // is not a required feature.
        url, {
          credentials: 'include'
        }).then(function (res) {
          checkStillCurrent();
          return res.text().then(function (text) {
            checkStillCurrent();

            var rtcTime = Date.now() - _this6.rtcStartTime_;

            // An empty text response is allowed, not an error.
            if (!text) {
              return {
                rtcTime: rtcTime,
                callout: callout
              };
            }

            var response = tryParseJson(text);
            return response ? {
              response: response,
              rtcTime: rtcTime,
              callout: callout
            } : _this6.buildErrorResponse_(RTC_ERROR_ENUM.MALFORMED_JSON_RESPONSE, callout, errorReportingUrl, rtcTime);
          });
        });
      }

      /**
       * Note: Timeout is enforced by timerFor, not the value of
       *   rtcTime. There are situations where rtcTime could thus
       *   end up being greater than timeoutMillis.
       */
      return Services.timerFor(this.win_).timeoutPromise(timeoutMillis, rtcFetch).catch(function (error) {
        return isCancellation(error) ? undefined : _this6.buildErrorResponse_( // The relevant error message for timeout looks like it is
        // just 'message' but is in fact 'messageXXX' where the
        // X's are hidden special characters. That's why we use
        // match here.
        /^timeout/.test(error.message) ? RTC_ERROR_ENUM.TIMEOUT : RTC_ERROR_ENUM.NETWORK_FAILURE, callout, errorReportingUrl, Date.now() - _this6.rtcStartTime_);
      });
    }
    /**
     * For a given A4A Element, sends out Real Time Config requests to
     * any urls or vendors specified by the publisher.
     * @param {!Element} element
     * @param {!Object<string, !../../../src/service/variable-source.AsyncResolverDef>} customMacros The ad-network specified macro
     *   substitutions available to use.
     * @param {?CONSENT_POLICY_STATE} consentState
     * @param {?string} consentString
     * @param {?Object<string, string|number|boolean|undefined>} consentMetadata
     * @param {!Function} checkStillCurrent
     * @return {Promise<!Array<!rtcResponseDef>>|undefined}
     * @visibleForTesting
     */

  }, {
    key: "execute",
    value: function execute(element, customMacros, consentState, consentString, consentMetadata, checkStillCurrent) {
      if (!this.validateRtcConfig_(element)) {
        return;
      }

      this.consentState_ = consentState;
      this.consentString_ = consentString;
      this.consentMetadata_ = consentMetadata;
      this.modifyRtcConfigForConsentStateSettings();
      customMacros = this.assignMacros(customMacros);
      this.rtcStartTime_ = Date.now();
      this.handleRtcForCustomUrls(customMacros, checkStillCurrent, element);
      this.handleRtcForVendorUrls(customMacros, checkStillCurrent);
      return Promise.all(this.promiseArray_);
    }
    /**
     * Attempts to parse the publisher-defined RTC config off the amp-ad
     * element, then validates that the rtcConfig exists, and contains
     * an entry for either vendor URLs, or publisher-defined URLs. If the
     * config contains an entry for timeoutMillis, validates that it is a
     * number, or converts to a number if number-like, otherwise overwrites
     * with the default.
     * IMPORTANT: If the rtcConfig is invalid, RTC is aborted, and the ad
     *   request continues without RTC.
     * @param {!Element} element
     * @return {boolean}
     */

  }, {
    key: "validateRtcConfig_",
    value: function validateRtcConfig_(element) {
      var _this7 = this;

      var defaultTimeoutMillis = 1000;
      var unparsedRtcConfig = element.getAttribute('rtc-config');

      if (!unparsedRtcConfig) {
        return false;
      }

      var rtcConfig = tryParseJson(unparsedRtcConfig);

      if (!rtcConfig) {
        user().warn(TAG, 'Could not JSON parse rtc-config attribute');
        return false;
      }

      var timeout;

      try {
        userAssert(rtcConfig['vendors'] || rtcConfig['urls'], 'RTC Config must specify vendors or urls');
        Object.keys(rtcConfig).forEach(function (key) {
          switch (key) {
            case 'vendors':
              userAssert(isObject(rtcConfig[key]), 'RTC invalid vendors');
              break;

            case 'urls':
              userAssert(isArray(rtcConfig[key]), 'RTC invalid urls');
              break;

            case 'timeoutMillis':
              timeout = parseInt(rtcConfig[key], 10);

              if (isNaN(timeout)) {
                user().warn(TAG, 'Invalid RTC timeout is NaN, ' + ("using default timeout " + defaultTimeoutMillis + "ms"));
                timeout = undefined;
              } else if (timeout > defaultTimeoutMillis || timeout < 0) {
                user().warn(TAG, "Invalid RTC timeout: " + timeout + "ms, " + ("using default timeout " + defaultTimeoutMillis + "ms"));
                timeout = undefined;
              }

              break;

            default:
              user().warn(TAG, "Unknown RTC Config key: " + key);
              break;
          }
        });

        if (!Object.keys(rtcConfig['vendors'] || {}).length && !(rtcConfig['urls'] || []).length) {
          return false;
        }

        var validateErrorReportingUrl = function validateErrorReportingUrl(urlObj) {
          var errorUrl = urlObj['errorReportingUrl'];

          if (errorUrl && !Services.urlForDoc(_this7.ampDoc_).isSecure(errorUrl)) {
            dev().warn(TAG, "Insecure RTC errorReportingUrl: " + errorUrl);
            urlObj['errorReportingUrl'] = undefined;
          }
        };

        /** @type {!Array} */
        (rtcConfig['urls'] || []).forEach(function (urlObj) {
          if (isObject(urlObj)) {
            validateErrorReportingUrl(urlObj);
          }
        });
        validateErrorReportingUrl(rtcConfig);
      } catch (unusedErr) {
        // This error would be due to the asserts above.
        return false;
      }

      rtcConfig['timeoutMillis'] = timeout !== undefined ? timeout : defaultTimeoutMillis;
      this.rtcConfig_ =
      /** @type {RtcConfigDef} */
      rtcConfig;
      return true;
    }
  }]);

  return RealTimeConfigManager;
}();

/**
 * @param {!../ampdoc-impl.AmpDoc} ampdoc
 */
export function installRealTimeConfigServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'real-time-config', function (doc) {
    return new RealTimeConfigService(doc);
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWwtdGltZS1jb25maWctaW1wbC5qcyJdLCJuYW1lcyI6WyJDT05TRU5UX1BPTElDWV9TVEFURSIsImlzQXJyYXkiLCJpc09iamVjdCIsInRyeVBhcnNlSnNvbiIsIlNlcnZpY2VzIiwiUlRDX1ZFTkRPUlMiLCJpc0NhbmNlbGxhdGlvbiIsImRldiIsInVzZXIiLCJ1c2VyQXNzZXJ0IiwiZ2V0TW9kZSIsInJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MiLCJpc0FtcFNjcmlwdFVyaSIsIlRBRyIsIk1BWF9SVENfQ0FMTE9VVFMiLCJNQVhfVVJMX0xFTkdUSCIsIlJ0Y0NvbmZpZ0RlZiIsIlJUQ19FUlJPUl9FTlVNIiwiTUFMRk9STUVEX0pTT05fUkVTUE9OU0UiLCJEVVBMSUNBVEVfVVJMIiwiSU5TRUNVUkVfVVJMIiwiTUFYX0NBTExPVVRTX0VYQ0VFREVEIiwiTkVUV09SS19GQUlMVVJFIiwiVU5LTk9XTl9WRU5ET1IiLCJUSU1FT1VUIiwiTUFDUk9fRVhQQU5EX1RJTUVPVVQiLCJHTE9CQUxfTUFDUk9fQUxMT1dMSVNUIiwiQ0xJRU5UX0lEIiwiUmVhbFRpbWVDb25maWdTZXJ2aWNlIiwiYW1wRG9jIiwiYW1wRG9jXyIsImVsZW1lbnQiLCJjdXN0b21NYWNyb3MiLCJjb25zZW50U3RhdGUiLCJjb25zZW50U3RyaW5nIiwiY29uc2VudE1ldGFkYXRhIiwiY2hlY2tTdGlsbEN1cnJlbnQiLCJSZWFsVGltZUNvbmZpZ01hbmFnZXIiLCJleGVjdXRlIiwid2luXyIsIndpbiIsInNlZW5VcmxzXyIsInJ0Y1N0YXJ0VGltZV8iLCJwcm9taXNlQXJyYXlfIiwicnRjQ29uZmlnXyIsImNvbnNlbnRTdGF0ZV8iLCJjb25zZW50U3RyaW5nXyIsImNvbnNlbnRNZXRhZGF0YV8iLCJlcnJvciIsImNhbGxvdXQiLCJlcnJvclJlcG9ydGluZ1VybCIsIm9wdF9ydGNUaW1lIiwid2FybiIsInNlbmRFcnJvck1lc3NhZ2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJ0Y1RpbWUiLCJlcnJvclR5cGUiLCJsb2NhbERldiIsInRlc3QiLCJNYXRoIiwicmFuZG9tIiwiYWxsb3dsaXN0IiwiRVJST1JfVFlQRSIsIkhSRUYiLCJtYWNyb3MiLCJsb2NhdGlvbiIsImhyZWYiLCJzZXJ2aWNlIiwidXJsUmVwbGFjZW1lbnRzRm9yRG9jIiwidXJsIiwiZXhwYW5kVXJsU3luYyIsIkltYWdlIiwic3JjIiwidXJsU2VydmljZSIsInVybEZvckRvYyIsInBhcnNlZFVybCIsInBhcnNlIiwiaG9zdG5hbWUiLCJwYXRobmFtZSIsInN1YnN0ciIsImNhbGxvdXRDb25maWciLCJvcHRJc0dsb2JhbGx5VmFsaWQiLCJzZW5kUmVnYXJkbGVzc09mQ29uc2VudFN0YXRlIiwiaSIsImxlbmd0aCIsInVuZGVmaW5lZCIsIlNVRkZJQ0lFTlQiLCJVTktOT1dOX05PVF9SRVFVSVJFRCIsImlzR2xvYmFsbHlWYWxpZCIsImlzVmFsaWRDYWxsb3V0Rm9yQ29uc2VudFN0YXRlIiwidXJscyIsImZpbHRlciIsIk9iamVjdCIsImtleXMiLCJ2ZW5kb3JzIiwiZm9yRWFjaCIsInZlbmRvciIsInRpbWVvdXRNaWxsaXMiLCJrZXkiLCJ1cmxPYmoiLCJpbmZsYXRlQW5kU2VuZFJ0Y18iLCJ2ZW5kb3JPYmplY3QiLCJ0b0xvd2VyQ2FzZSIsInB1c2giLCJidWlsZEVycm9yUmVzcG9uc2VfIiwidmVuZG9yTWFjcm9zIiwidmFsaWRWZW5kb3JNYWNyb3MiLCJtYWNybyIsImluY2x1ZGVzIiwidmFsdWUiLCJKU09OIiwic3RyaW5naWZ5IiwiYXNzaWduIiwib3B0X3ZlbmRvciIsIm9wdF9lbGVtZW50IiwiZ2V0Q2FsbG91dFBhcmFtXyIsInNlbmQiLCJpc1NlY3VyZSIsInRydW5jVXJsXyIsInNlbmRSdGNDYWxsb3V0XyIsInVybFJlcGxhY2VtZW50U3RhcnRUaW1lIiwiRGF0ZSIsIm5vdyIsInRpbWVyRm9yIiwidGltZW91dFByb21pc2UiLCJleHBhbmRVcmxBc3luYyIsInRoZW4iLCJjYXRjaCIsInJlcGxhY2UiLCJydGNGZXRjaCIsInNjcmlwdEZvckRvY09yTnVsbCIsImZldGNoIiwianNvbiIsInJlc3BvbnNlIiwieGhyRm9yIiwiZmV0Y2hKc29uIiwiY3JlZGVudGlhbHMiLCJyZXMiLCJ0ZXh0IiwibWVzc2FnZSIsInZhbGlkYXRlUnRjQ29uZmlnXyIsIm1vZGlmeVJ0Y0NvbmZpZ0ZvckNvbnNlbnRTdGF0ZVNldHRpbmdzIiwiYXNzaWduTWFjcm9zIiwiaGFuZGxlUnRjRm9yQ3VzdG9tVXJscyIsImhhbmRsZVJ0Y0ZvclZlbmRvclVybHMiLCJhbGwiLCJkZWZhdWx0VGltZW91dE1pbGxpcyIsInVucGFyc2VkUnRjQ29uZmlnIiwiZ2V0QXR0cmlidXRlIiwicnRjQ29uZmlnIiwidGltZW91dCIsInBhcnNlSW50IiwiaXNOYU4iLCJ2YWxpZGF0ZUVycm9yUmVwb3J0aW5nVXJsIiwiZXJyb3JVcmwiLCJ1bnVzZWRFcnIiLCJpbnN0YWxsUmVhbFRpbWVDb25maWdTZXJ2aWNlRm9yRG9jIiwiYW1wZG9jIiwiZG9jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVFBLG9CQUFSO0FBQ0EsU0FBUUMsT0FBUixFQUFpQkMsUUFBakI7QUFDQSxTQUFRQyxZQUFSO0FBRUEsU0FBUUMsUUFBUjtBQUVBLFNBQVFDLFdBQVI7QUFFQSxTQUFRQyxjQUFSO0FBQ0EsU0FBUUMsR0FBUixFQUFhQyxJQUFiLEVBQW1CQyxVQUFuQjtBQUNBLFNBQVFDLE9BQVI7QUFDQSxTQUFRQyw0QkFBUjtBQUNBLFNBQVFDLGNBQVI7O0FBRUE7QUFDQSxJQUFNQyxHQUFHLEdBQUcsa0JBQVo7O0FBRUE7QUFDQSxJQUFNQyxnQkFBZ0IsR0FBRyxDQUF6Qjs7QUFFQTtBQUNBLElBQU1DLGNBQWMsR0FBRyxLQUF2Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJQyxZQUFKOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFNQyxjQUFjLEdBQUc7QUFDNUI7QUFDQUMsRUFBQUEsdUJBQXVCLEVBQUUsR0FGRztBQUc1QjtBQUNBO0FBQ0FDLEVBQUFBLGFBQWEsRUFBRSxHQUxhO0FBTTVCO0FBQ0FDLEVBQUFBLFlBQVksRUFBRSxHQVBjO0FBUTVCO0FBQ0E7QUFDQUMsRUFBQUEscUJBQXFCLEVBQUUsR0FWSztBQVc1QjtBQUNBQyxFQUFBQSxlQUFlLEVBQUUsR0FaVztBQWE1QjtBQUNBQyxFQUFBQSxjQUFjLEVBQUUsR0FkWTtBQWU1QjtBQUNBQyxFQUFBQSxPQUFPLEVBQUUsSUFoQm1CO0FBaUI1QjtBQUNBO0FBQ0FDLEVBQUFBLG9CQUFvQixFQUFFO0FBbkJNLENBQXZCOztBQXNCUDtBQUNBLElBQU1DLHNCQUFzQixHQUFHO0FBQUNDLEVBQUFBLFNBQVMsRUFBRTtBQUFaLENBQS9CO0FBRUEsV0FBYUMscUJBQWI7QUFDRTtBQUNGO0FBQ0E7QUFDRSxpQ0FBWUMsTUFBWixFQUFvQjtBQUFBOztBQUNsQjtBQUNBLFNBQUtDLE9BQUwsR0FBZUQsTUFBZjtBQUNEOztBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBckJBO0FBQUE7QUFBQSxXQXNCRSxvQ0FDRUUsT0FERixFQUVFQyxZQUZGLEVBR0VDLFlBSEYsRUFJRUMsYUFKRixFQUtFQyxlQUxGLEVBTUVDLGlCQU5GLEVBT0U7QUFDQSxhQUFPLElBQUlDLHFCQUFKLENBQTBCLEtBQUtQLE9BQS9CLEVBQXdDUSxPQUF4QyxDQUNMUCxPQURLLEVBRUxDLFlBRkssRUFHTEMsWUFISyxFQUlMQyxhQUpLLEVBS0xDLGVBTEssRUFNTEMsaUJBTkssQ0FBUDtBQVFEO0FBdENIOztBQUFBO0FBQUE7QUF5Q0EsV0FBYUMscUJBQWI7QUFDRTtBQUNGO0FBQ0E7QUFDRSxpQ0FBWVIsTUFBWixFQUFvQjtBQUFBOztBQUNsQjtBQUNBLFNBQUtDLE9BQUwsR0FBZUQsTUFBZjs7QUFFQTtBQUNBLFNBQUtVLElBQUwsR0FBWVYsTUFBTSxDQUFDVyxHQUFuQjs7QUFFQTtBQUNBLFNBQUtDLFNBQUwsR0FBaUIsRUFBakI7O0FBRUE7QUFDQSxTQUFLQyxhQUFMLEdBQXFCLElBQXJCOztBQUVBO0FBQ0EsU0FBS0MsYUFBTCxHQUFxQixFQUFyQjs7QUFFQTtBQUNBLFNBQUtDLFVBQUwsR0FBa0IsSUFBbEI7O0FBRUE7QUFDQSxTQUFLQyxhQUFMLEdBQXFCLElBQXJCOztBQUVBO0FBQ0EsU0FBS0MsY0FBTCxHQUFzQixJQUF0Qjs7QUFFQTtBQUNBLFNBQUtDLGdCQUFMLEdBQXdCLElBQXhCO0FBQ0Q7O0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXhDQTtBQUFBO0FBQUEsV0F5Q0UsNkJBQW9CQyxLQUFwQixFQUEyQkMsT0FBM0IsRUFBb0NDLGlCQUFwQyxFQUF1REMsV0FBdkQsRUFBb0U7QUFDbEU1QyxNQUFBQSxHQUFHLEdBQUc2QyxJQUFOLENBQVd2QyxHQUFYLHNCQUFrQ29DLE9BQWxDLGdCQUFvREQsS0FBcEQ7O0FBQ0EsVUFBSUUsaUJBQUosRUFBdUI7QUFDckIsYUFBS0csZ0JBQUwsQ0FBc0JMLEtBQXRCLEVBQTZCRSxpQkFBN0I7QUFDRDs7QUFDRCxhQUFPSSxPQUFPLENBQUNDLE9BQVI7QUFDTDtBQUE4QjtBQUFDUCxRQUFBQSxLQUFLLEVBQUxBLEtBQUQ7QUFBUUMsUUFBQUEsT0FBTyxFQUFQQSxPQUFSO0FBQWlCTyxRQUFBQSxPQUFPLEVBQUVMLFdBQVcsSUFBSTtBQUF6QyxPQUR6QixDQUFQO0FBR0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUF0REE7QUFBQTtBQUFBLFdBdURFLDBCQUFpQk0sU0FBakIsRUFBNEJQLGlCQUE1QixFQUErQztBQUM3QyxVQUNFLENBQUN4QyxPQUFPLENBQUMsS0FBSzZCLElBQU4sQ0FBUCxDQUFtQm1CLFFBQXBCLElBQ0EsQ0FBQ2hELE9BQU8sQ0FBQyxLQUFLNkIsSUFBTixDQUFQLENBQW1Cb0IsSUFEcEIsSUFFQUMsSUFBSSxDQUFDQyxNQUFMLE1BQWlCLElBSG5CLEVBSUU7QUFDQTtBQUNEOztBQUNELFVBQU1DLFNBQVMsR0FBRztBQUFDQyxRQUFBQSxVQUFVLEVBQUUsSUFBYjtBQUFtQkMsUUFBQUEsSUFBSSxFQUFFO0FBQXpCLE9BQWxCO0FBQ0EsVUFBTUMsTUFBTSxHQUFHO0FBQ2JGLFFBQUFBLFVBQVUsRUFBRU4sU0FEQztBQUViTyxRQUFBQSxJQUFJLEVBQUUsS0FBS3pCLElBQUwsQ0FBVTJCLFFBQVYsQ0FBbUJDO0FBRlosT0FBZjtBQUlBLFVBQU1DLE9BQU8sR0FBR2hFLFFBQVEsQ0FBQ2lFLHFCQUFULENBQStCLEtBQUt2QyxPQUFwQyxDQUFoQjtBQUNBLFVBQU13QyxHQUFHLEdBQUdGLE9BQU8sQ0FBQ0csYUFBUixDQUFzQnJCLGlCQUF0QixFQUF5Q2UsTUFBekMsRUFBaURILFNBQWpELENBQVo7QUFDQSxVQUFJLEtBQUt2QixJQUFMLENBQVVpQyxLQUFkLEdBQXNCQyxHQUF0QixHQUE0QkgsR0FBNUI7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFqRkE7QUFBQTtBQUFBLFdBa0ZFLDBCQUFpQkEsR0FBakIsRUFBc0I7QUFDcEIsVUFBTUksVUFBVSxHQUFHdEUsUUFBUSxDQUFDdUUsU0FBVCxDQUFtQixLQUFLN0MsT0FBeEIsQ0FBbkI7QUFDQSxVQUFNOEMsU0FBUyxHQUFHRixVQUFVLENBQUNHLEtBQVgsQ0FBaUJQLEdBQWpCLENBQWxCO0FBQ0EsYUFBTyxDQUFDTSxTQUFTLENBQUNFLFFBQVYsR0FBcUJGLFNBQVMsQ0FBQ0csUUFBaEMsRUFBMENDLE1BQTFDLENBQWlELENBQWpELEVBQW9ELEVBQXBELENBQVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBL0ZBO0FBQUE7QUFBQSxXQWdHRSx1Q0FBOEJDLGFBQTlCLEVBQTZDQyxrQkFBN0MsRUFBaUU7QUFDL0QsVUFBT0MsNEJBQVAsR0FBdUNGLGFBQXZDLENBQU9FLDRCQUFQOztBQUNBLFVBQUksQ0FBQ2pGLFFBQVEsQ0FBQytFLGFBQUQsQ0FBVCxJQUE0QixDQUFDRSw0QkFBakMsRUFBK0Q7QUFDN0QsZUFBTyxDQUFDLENBQUNELGtCQUFUO0FBQ0Q7O0FBRUQsVUFBSSxPQUFPQyw0QkFBUCxJQUF1QyxTQUEzQyxFQUFzRDtBQUNwRCxlQUFPQSw0QkFBUDtBQUNEOztBQUVELFVBQUlsRixPQUFPLENBQUNrRiw0QkFBRCxDQUFYLEVBQTJDO0FBQ3pDLGFBQUssSUFBSUMsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBR0QsNEJBQTRCLENBQUNFLE1BQWpELEVBQXlERCxDQUFDLEVBQTFELEVBQThEO0FBQzVELGNBQ0UsS0FBS3ZDLGFBQUwsSUFDQTdDLG9CQUFvQixDQUFDbUYsNEJBQTRCLENBQUNDLENBQUQsQ0FBN0IsQ0FGdEIsRUFHRTtBQUNBLG1CQUFPLElBQVA7QUFDRCxXQUxELE1BS08sSUFBSSxDQUFDcEYsb0JBQW9CLENBQUNtRiw0QkFBNEIsQ0FBQ0MsQ0FBRCxDQUE3QixDQUF6QixFQUE0RDtBQUNqRTdFLFlBQUFBLEdBQUcsR0FBRzZDLElBQU4sQ0FDRXZDLEdBREYsRUFFRSw0Q0FDS3NFLDRCQUE0QixDQUFDQyxDQUFELENBRGpDLENBRkY7QUFLRDtBQUNGOztBQUNELGVBQU8sS0FBUDtBQUNEOztBQUNENUUsTUFBQUEsSUFBSSxHQUFHNEMsSUFBUCxDQUNFdkMsR0FERixFQUVFLDBEQUNLc0UsNEJBREwsQ0FGRjtBQUtBLGFBQU8sQ0FBQyxDQUFDRCxrQkFBVDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFoSkE7QUFBQTtBQUFBLFdBaUpFLGtEQUF5QztBQUFBOztBQUN2QyxVQUNFLEtBQUtyQyxhQUFMLElBQXNCeUMsU0FBdEIsSUFDQSxLQUFLekMsYUFBTCxJQUFzQjdDLG9CQUFvQixDQUFDdUYsVUFEM0MsSUFFQSxLQUFLMUMsYUFBTCxJQUFzQjdDLG9CQUFvQixDQUFDd0Ysb0JBSDdDLEVBSUU7QUFDQTtBQUNEOztBQUVELFVBQU1DLGVBQWUsR0FBRyxLQUFLQyw2QkFBTCxDQUFtQyxLQUFLOUMsVUFBeEMsQ0FBeEI7QUFDQSxXQUFLQSxVQUFMLENBQWdCK0MsSUFBaEIsR0FBdUIsQ0FBQyxLQUFLL0MsVUFBTCxDQUFnQitDLElBQWhCLElBQXdCLEVBQXpCLEVBQTZCQyxNQUE3QixDQUFvQyxVQUFDdEIsR0FBRDtBQUFBLGVBQ3pELEtBQUksQ0FBQ29CLDZCQUFMLENBQW1DcEIsR0FBbkMsRUFBd0NtQixlQUF4QyxDQUR5RDtBQUFBLE9BQXBDLENBQXZCO0FBSUFJLE1BQUFBLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZLEtBQUtsRCxVQUFMLENBQWdCbUQsT0FBaEIsSUFBMkIsRUFBdkMsRUFBMkNDLE9BQTNDLENBQW1ELFVBQUNDLE1BQUQsRUFBWTtBQUM3RCxZQUNFLENBQUMsS0FBSSxDQUFDUCw2QkFBTCxDQUNDLEtBQUksQ0FBQzlDLFVBQUwsQ0FBZ0JtRCxPQUFoQixDQUF3QkUsTUFBeEIsQ0FERCxFQUVDUixlQUZELENBREgsRUFLRTtBQUNBLGlCQUFPLEtBQUksQ0FBQzdDLFVBQUwsQ0FBZ0JtRCxPQUFoQixDQUF3QkUsTUFBeEIsQ0FBUDtBQUNEO0FBQ0YsT0FURDtBQVVEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWhMQTtBQUFBO0FBQUEsV0FpTEUsc0JBQWFoQyxNQUFiLEVBQXFCO0FBQUE7O0FBQ25CQSxNQUFBQSxNQUFNLENBQUMsU0FBRCxDQUFOLEdBQW9CO0FBQUEsZUFBTSxNQUFJLENBQUNyQixVQUFMLENBQWdCc0QsYUFBdEI7QUFBQSxPQUFwQjs7QUFDQWpDLE1BQUFBLE1BQU0sQ0FBQyxlQUFELENBQU4sR0FBMEI7QUFBQSxlQUFNLE1BQUksQ0FBQ3BCLGFBQVg7QUFBQSxPQUExQjs7QUFDQW9CLE1BQUFBLE1BQU0sQ0FBQyxnQkFBRCxDQUFOLEdBQTJCO0FBQUEsZUFBTSxNQUFJLENBQUNuQixjQUFYO0FBQUEsT0FBM0I7O0FBQ0FtQixNQUFBQSxNQUFNLENBQUMsa0JBQUQsQ0FBTjtBQUNFO0FBQ0UsZ0JBQUNrQyxHQUFELEVBQVM7QUFDUDFGLFFBQUFBLFVBQVUsQ0FBQzBGLEdBQUQsRUFBTSwyQ0FBTixDQUFWO0FBQ0EsZUFBTyxNQUFJLENBQUNwRCxnQkFBTCxHQUF3QixNQUFJLENBQUNBLGdCQUFMLENBQXNCb0QsR0FBdEIsQ0FBeEIsR0FBcUQsSUFBNUQ7QUFDRCxPQUxMOztBQU9BLGFBQU9sQyxNQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBcE1BO0FBQUE7QUFBQSxXQXFNRSxnQ0FBdUJqQyxZQUF2QixFQUFxQ0ksaUJBQXJDLEVBQXdETCxPQUF4RCxFQUFpRTtBQUFBOztBQUMvRDtBQUNBO0FBQ0EsT0FBQyxLQUFLYSxVQUFMLENBQWdCK0MsSUFBaEIsSUFBd0IsRUFBekIsRUFBNkJLLE9BQTdCLENBQXFDLFVBQUNJLE1BQUQsRUFBWTtBQUMvQyxZQUFJOUIsR0FBSixFQUFTcEIsaUJBQVQ7O0FBQ0EsWUFBSWhELFFBQVEsQ0FBQ2tHLE1BQUQsQ0FBWixFQUFzQjtBQUNwQjlCLFVBQUFBLEdBQUcsR0FBRzhCLE1BQU0sQ0FBQzlCLEdBQWI7QUFDQXBCLFVBQUFBLGlCQUFpQixHQUFHa0QsTUFBTSxDQUFDbEQsaUJBQTNCO0FBQ0QsU0FIRCxNQUdPLElBQUksT0FBT2tELE1BQVAsSUFBaUIsUUFBckIsRUFBK0I7QUFDcEM5QixVQUFBQSxHQUFHLEdBQUc4QixNQUFOO0FBQ0QsU0FGTSxNQUVBO0FBQ0w3RixVQUFBQSxHQUFHLEdBQUc2QyxJQUFOLENBQVd2QyxHQUFYLG9CQUFnQ3VGLE1BQWhDO0FBQ0Q7O0FBQ0QsUUFBQSxNQUFJLENBQUNDLGtCQUFMLENBQ0UvQixHQURGLEVBRUV0QyxZQUZGLEVBR0VrQixpQkFIRixFQUlFZCxpQkFKRjtBQUtFO0FBQWlCa0QsUUFBQUEsU0FMbkIsRUFNRXZELE9BTkY7QUFRRCxPQWxCRDtBQW1CRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBak9BO0FBQUE7QUFBQSxXQWtPRSxnQ0FBdUJDLFlBQXZCLEVBQXFDSSxpQkFBckMsRUFBd0Q7QUFBQTs7QUFDdEQ7QUFDQTtBQUNBeUQsTUFBQUEsTUFBTSxDQUFDQyxJQUFQLENBQVksS0FBS2xELFVBQUwsQ0FBZ0JtRCxPQUFoQixJQUEyQixFQUF2QyxFQUEyQ0MsT0FBM0MsQ0FBbUQsVUFBQ0MsTUFBRCxFQUFZO0FBQzdELFlBQU1LLFlBQVksR0FBR2pHLFdBQVcsQ0FBQzRGLE1BQU0sQ0FBQ00sV0FBUCxFQUFELENBQWhDO0FBQ0EsWUFBTWpDLEdBQUcsR0FBR2dDLFlBQVksR0FBR0EsWUFBWSxDQUFDaEMsR0FBaEIsR0FBc0IsRUFBOUM7QUFDQSxZQUFNcEIsaUJBQWlCLEdBQ3JCb0QsWUFBWSxJQUFJQSxZQUFZLENBQUNwRCxpQkFBN0IsR0FDSW9ELFlBQVksQ0FBQ3BELGlCQURqQixHQUVJLEVBSE47O0FBSUEsWUFBSSxDQUFDb0IsR0FBTCxFQUFVO0FBQ1IsaUJBQU8sTUFBSSxDQUFDM0IsYUFBTCxDQUFtQjZELElBQW5CLENBQ0wsTUFBSSxDQUFDQyxtQkFBTCxDQUNFeEYsY0FBYyxDQUFDTSxjQURqQixFQUVFMEUsTUFGRixFQUdFL0MsaUJBSEYsQ0FESyxDQUFQO0FBT0Q7O0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFNd0QsWUFBWSxHQUFHeEcsUUFBUSxDQUFDLE1BQUksQ0FBQzBDLFVBQUwsQ0FBZ0JtRCxPQUFoQixDQUF3QkUsTUFBeEIsRUFBZ0MsUUFBaEMsQ0FBRCxDQUFSLEdBQ2pCLE1BQUksQ0FBQ3JELFVBQUwsQ0FBZ0JtRCxPQUFoQixDQUF3QkUsTUFBeEIsRUFBZ0MsUUFBaEMsQ0FEaUIsR0FFakIsTUFBSSxDQUFDckQsVUFBTCxDQUFnQm1ELE9BQWhCLENBQXdCRSxNQUF4QixDQUZKO0FBR0EsWUFBTVUsaUJBQWlCLEdBQUcsRUFBMUI7QUFDQWQsUUFBQUEsTUFBTSxDQUFDQyxJQUFQLENBQVlZLFlBQVosRUFBMEJWLE9BQTFCLENBQWtDLFVBQUNZLEtBQUQsRUFBVztBQUMzQyxjQUFJLEVBQUVOLFlBQVksQ0FBQ3JDLE1BQWIsSUFBdUJxQyxZQUFZLENBQUNyQyxNQUFiLENBQW9CNEMsUUFBcEIsQ0FBNkJELEtBQTdCLENBQXpCLENBQUosRUFBbUU7QUFDakVwRyxZQUFBQSxJQUFJLEdBQUd3QyxLQUFQLENBQWFuQyxHQUFiLHNCQUFvQytGLEtBQXBDLHFCQUF5RFgsTUFBekQ7QUFDRCxXQUZELE1BRU87QUFDTCxnQkFBTWEsS0FBSyxHQUFHSixZQUFZLENBQUNFLEtBQUQsQ0FBMUI7QUFDQUQsWUFBQUEsaUJBQWlCLENBQUNDLEtBQUQsQ0FBakIsR0FDRTFHLFFBQVEsQ0FBQzRHLEtBQUQsQ0FBUixJQUFtQjdHLE9BQU8sQ0FBQzZHLEtBQUQsQ0FBMUIsR0FBb0NDLElBQUksQ0FBQ0MsU0FBTCxDQUFlRixLQUFmLENBQXBDLEdBQTREQSxLQUQ5RDtBQUVEO0FBQ0YsU0FSRDtBQVNBO0FBQ0EsWUFBTTdDLE1BQU0sR0FBRzRCLE1BQU0sQ0FBQ29CLE1BQVAsQ0FBY04saUJBQWQsRUFBaUMzRSxZQUFqQyxDQUFmOztBQUNBLFFBQUEsTUFBSSxDQUFDcUUsa0JBQUwsQ0FDRS9CLEdBREYsRUFFRUwsTUFGRixFQUdFZixpQkFIRixFQUlFZCxpQkFKRixFQUtFNkQsTUFBTSxDQUFDTSxXQUFQLEVBTEY7QUFPRCxPQTFDRDtBQTJDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUExUkE7QUFBQTtBQUFBLFdBMlJFLDRCQUNFakMsR0FERixFQUVFTCxNQUZGLEVBR0VmLGlCQUhGLEVBSUVkLGlCQUpGLEVBS0U4RSxVQUxGLEVBTUVDLFdBTkYsRUFPRTtBQUFBOztBQUNBLFVBQUtqQixhQUFMLEdBQXNCLEtBQUt0RCxVQUEzQixDQUFLc0QsYUFBTDtBQUNBLFVBQU1qRCxPQUFPLEdBQUdpRSxVQUFVLElBQUksS0FBS0UsZ0JBQUwsQ0FBc0I5QyxHQUF0QixDQUE5Qjs7QUFDQTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0ksVUFBTStDLElBQUksR0FBRyxTQUFQQSxJQUFPLENBQUMvQyxHQUFELEVBQVM7QUFDcEIsWUFBSXVCLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZLE1BQUksQ0FBQ3JELFNBQWpCLEVBQTRCNEMsTUFBNUIsSUFBc0N2RSxnQkFBMUMsRUFBNEQ7QUFDMUQsaUJBQU8sTUFBSSxDQUFDMkYsbUJBQUwsQ0FDTHhGLGNBQWMsQ0FBQ0kscUJBRFYsRUFFTDRCLE9BRkssRUFHTEMsaUJBSEssQ0FBUDtBQUtEOztBQUNELFlBQ0UsQ0FBQzlDLFFBQVEsQ0FBQ3VFLFNBQVQsQ0FBbUIsTUFBSSxDQUFDN0MsT0FBeEIsRUFBaUN3RixRQUFqQyxDQUEwQ2hELEdBQTFDLENBQUQsSUFDQSxDQUFDMUQsY0FBYyxDQUFDMEQsR0FBRCxDQUZqQixFQUdFO0FBQ0EsaUJBQU8sTUFBSSxDQUFDbUMsbUJBQUwsQ0FDTHhGLGNBQWMsQ0FBQ0csWUFEVixFQUVMNkIsT0FGSyxFQUdMQyxpQkFISyxDQUFQO0FBS0Q7O0FBQ0QsWUFBSSxNQUFJLENBQUNULFNBQUwsQ0FBZTZCLEdBQWYsQ0FBSixFQUF5QjtBQUN2QixpQkFBTyxNQUFJLENBQUNtQyxtQkFBTCxDQUNMeEYsY0FBYyxDQUFDRSxhQURWLEVBRUw4QixPQUZLLEVBR0xDLGlCQUhLLENBQVA7QUFLRDs7QUFDRCxRQUFBLE1BQUksQ0FBQ1QsU0FBTCxDQUFlNkIsR0FBZixJQUFzQixJQUF0Qjs7QUFDQSxZQUFJQSxHQUFHLENBQUNlLE1BQUosR0FBYXRFLGNBQWpCLEVBQWlDO0FBQy9CdUQsVUFBQUEsR0FBRyxHQUFHLE1BQUksQ0FBQ2lELFNBQUwsQ0FBZWpELEdBQWYsQ0FBTjtBQUNEOztBQUVELGVBQU8sTUFBSSxDQUFDa0QsZUFBTCxDQUNMbEQsR0FESyxFQUVMNEIsYUFGSyxFQUdMakQsT0FISyxFQUlMYixpQkFKSyxFQUtMYyxpQkFMSyxFQU1MaUUsV0FOSyxDQUFQO0FBUUQsT0F0Q0Q7O0FBd0NBLFVBQU1yRCxTQUFTLGdCQUFPcEMsc0JBQVAsQ0FBZjs7QUFDQW1FLE1BQUFBLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZN0IsTUFBWixFQUFvQitCLE9BQXBCLENBQTRCLFVBQUNHLEdBQUQ7QUFBQSxlQUFVckMsU0FBUyxDQUFDcUMsR0FBRCxDQUFULEdBQWlCLElBQTNCO0FBQUEsT0FBNUI7QUFDQSxVQUFNc0IsdUJBQXVCLEdBQUdDLElBQUksQ0FBQ0MsR0FBTCxFQUFoQztBQUNBLFdBQUtoRixhQUFMLENBQW1CNkQsSUFBbkIsQ0FDRXBHLFFBQVEsQ0FBQ3dILFFBQVQsQ0FBa0IsS0FBS3JGLElBQXZCLEVBQ0dzRixjQURILENBRUkzQixhQUZKLEVBR0k5RixRQUFRLENBQUNpRSxxQkFBVCxDQUErQixLQUFLdkMsT0FBcEMsRUFBNkNnRyxjQUE3QyxDQUNFeEQsR0FERixFQUVFTCxNQUZGLEVBR0VILFNBSEYsQ0FISixFQVNHaUUsSUFUSCxDQVNRLFVBQUN6RCxHQUFELEVBQVM7QUFDYmxDLFFBQUFBLGlCQUFpQjtBQUNqQjhELFFBQUFBLGFBQWEsSUFBSXVCLHVCQUF1QixHQUFHQyxJQUFJLENBQUNDLEdBQUwsRUFBM0M7QUFDQSxlQUFPTixJQUFJLENBQUMvQyxHQUFELENBQVg7QUFDRCxPQWJILEVBY0cwRCxLQWRILENBY1MsVUFBQ2hGLEtBQUQsRUFBVztBQUNoQixlQUFPMUMsY0FBYyxDQUFDMEMsS0FBRCxDQUFkLEdBQ0hzQyxTQURHLEdBRUgsTUFBSSxDQUFDbUIsbUJBQUwsQ0FDRXhGLGNBQWMsQ0FBQ1Esb0JBRGpCLEVBRUV3QixPQUZGLEVBR0VDLGlCQUhGLENBRko7QUFPRCxPQXRCSCxDQURGO0FBeUJEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBdFhBO0FBQUE7QUFBQSxXQXVYRSxtQkFBVW9CLEdBQVYsRUFBZTtBQUNiQSxNQUFBQSxHQUFHLEdBQUdBLEdBQUcsQ0FBQ1UsTUFBSixDQUFXLENBQVgsRUFBY2pFLGNBQWMsR0FBRyxFQUEvQixFQUFtQ2tILE9BQW5DLENBQTJDLE9BQTNDLEVBQW9ELEVBQXBELENBQU47QUFDQSxhQUFPM0QsR0FBRyxHQUFHLGNBQWI7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXJZQTtBQUFBO0FBQUEsV0FzWUUseUJBQ0VBLEdBREYsRUFFRTRCLGFBRkYsRUFHRWpELE9BSEYsRUFJRWIsaUJBSkYsRUFLRWMsaUJBTEYsRUFNRWlFLFdBTkYsRUFPRTtBQUFBOztBQUNBLFVBQUllLFFBQUo7O0FBQ0EsVUFBSXRILGNBQWMsQ0FBQzBELEdBQUQsQ0FBbEIsRUFBeUI7QUFDdkI0RCxRQUFBQSxRQUFRLEdBQUc5SCxRQUFRLENBQUMrSCxrQkFBVCxDQUE0QmhCLFdBQTVCLEVBQ1JZLElBRFEsQ0FDSCxVQUFDM0QsT0FBRCxFQUFhO0FBQ2pCM0QsVUFBQUEsVUFBVSxDQUFDMkQsT0FBRCxFQUFVLDhCQUFWLENBQVY7QUFDQSxpQkFBT0EsT0FBTyxDQUFDZ0UsS0FBUixDQUFjOUQsR0FBZCxDQUFQO0FBQ0QsU0FKUSxFQUtSeUQsSUFMUSxDQUtILFVBQUNNLElBQUQsRUFBVTtBQUNkakcsVUFBQUEsaUJBQWlCOztBQUNqQixjQUFNb0IsT0FBTyxHQUFHa0UsSUFBSSxDQUFDQyxHQUFMLEtBQWEsTUFBSSxDQUFDakYsYUFBbEM7O0FBQ0EsY0FBSSxPQUFPMkYsSUFBUCxLQUFnQixRQUFwQixFQUE4QjtBQUM1QixtQkFBTyxNQUFJLENBQUM1QixtQkFBTCxDQUNMeEYsY0FBYyxDQUFDQyx1QkFEVixFQUVMK0IsT0FGSyxFQUdMQyxpQkFISyxFQUlMTSxPQUpLLENBQVA7QUFNRDs7QUFDRCxpQkFBTztBQUFDOEUsWUFBQUEsUUFBUSxFQUFFRCxJQUFYO0FBQWlCN0UsWUFBQUEsT0FBTyxFQUFQQSxPQUFqQjtBQUEwQlAsWUFBQUEsT0FBTyxFQUFQQTtBQUExQixXQUFQO0FBQ0QsU0FqQlEsQ0FBWDtBQWtCRCxPQW5CRCxNQW1CTztBQUNMaUYsUUFBQUEsUUFBUSxHQUFHOUgsUUFBUSxDQUFDbUksTUFBVCxDQUFnQixLQUFLaEcsSUFBckIsRUFDUmlHLFNBRFEsRUFFUDtBQUNBO0FBQ0E7QUFDQWxFLFFBQUFBLEdBTE8sRUFNUDtBQUFDbUUsVUFBQUEsV0FBVyxFQUFFO0FBQWQsU0FOTyxFQVFSVixJQVJRLENBUUgsVUFBQ1csR0FBRCxFQUFTO0FBQ2J0RyxVQUFBQSxpQkFBaUI7QUFDakIsaUJBQU9zRyxHQUFHLENBQUNDLElBQUosR0FBV1osSUFBWCxDQUFnQixVQUFDWSxJQUFELEVBQVU7QUFDL0J2RyxZQUFBQSxpQkFBaUI7O0FBQ2pCLGdCQUFNb0IsT0FBTyxHQUFHa0UsSUFBSSxDQUFDQyxHQUFMLEtBQWEsTUFBSSxDQUFDakYsYUFBbEM7O0FBQ0E7QUFDQSxnQkFBSSxDQUFDaUcsSUFBTCxFQUFXO0FBQ1QscUJBQU87QUFBQ25GLGdCQUFBQSxPQUFPLEVBQVBBLE9BQUQ7QUFBVVAsZ0JBQUFBLE9BQU8sRUFBUEE7QUFBVixlQUFQO0FBQ0Q7O0FBQ0QsZ0JBQU1xRixRQUFRLEdBQUduSSxZQUFZLENBQUN3SSxJQUFELENBQTdCO0FBQ0EsbUJBQU9MLFFBQVEsR0FDWDtBQUFDQSxjQUFBQSxRQUFRLEVBQVJBLFFBQUQ7QUFBVzlFLGNBQUFBLE9BQU8sRUFBUEEsT0FBWDtBQUFvQlAsY0FBQUEsT0FBTyxFQUFQQTtBQUFwQixhQURXLEdBRVgsTUFBSSxDQUFDd0QsbUJBQUwsQ0FDRXhGLGNBQWMsQ0FBQ0MsdUJBRGpCLEVBRUUrQixPQUZGLEVBR0VDLGlCQUhGLEVBSUVNLE9BSkYsQ0FGSjtBQVFELFdBaEJNLENBQVA7QUFpQkQsU0EzQlEsQ0FBWDtBQTRCRDs7QUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0ksYUFBT3BELFFBQVEsQ0FBQ3dILFFBQVQsQ0FBa0IsS0FBS3JGLElBQXZCLEVBQ0pzRixjQURJLENBQ1czQixhQURYLEVBQzBCZ0MsUUFEMUIsRUFFSkYsS0FGSSxDQUVFLFVBQUNoRixLQUFELEVBQVc7QUFDaEIsZUFBTzFDLGNBQWMsQ0FBQzBDLEtBQUQsQ0FBZCxHQUNIc0MsU0FERyxHQUVILE1BQUksQ0FBQ21CLG1CQUFMLEVBQ0U7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBVzlDLElBQVgsQ0FBZ0JYLEtBQUssQ0FBQzRGLE9BQXRCLElBQ0kzSCxjQUFjLENBQUNPLE9BRG5CLEdBRUlQLGNBQWMsQ0FBQ0ssZUFQckIsRUFRRTJCLE9BUkYsRUFTRUMsaUJBVEYsRUFVRXdFLElBQUksQ0FBQ0MsR0FBTCxLQUFhLE1BQUksQ0FBQ2pGLGFBVnBCLENBRko7QUFjRCxPQWpCSSxDQUFQO0FBa0JEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBdGVBO0FBQUE7QUFBQSxXQXVlRSxpQkFDRVgsT0FERixFQUVFQyxZQUZGLEVBR0VDLFlBSEYsRUFJRUMsYUFKRixFQUtFQyxlQUxGLEVBTUVDLGlCQU5GLEVBT0U7QUFDQSxVQUFJLENBQUMsS0FBS3lHLGtCQUFMLENBQXdCOUcsT0FBeEIsQ0FBTCxFQUF1QztBQUNyQztBQUNEOztBQUNELFdBQUtjLGFBQUwsR0FBcUJaLFlBQXJCO0FBQ0EsV0FBS2EsY0FBTCxHQUFzQlosYUFBdEI7QUFDQSxXQUFLYSxnQkFBTCxHQUF3QlosZUFBeEI7QUFDQSxXQUFLMkcsc0NBQUw7QUFDQTlHLE1BQUFBLFlBQVksR0FBRyxLQUFLK0csWUFBTCxDQUFrQi9HLFlBQWxCLENBQWY7QUFDQSxXQUFLVSxhQUFMLEdBQXFCZ0YsSUFBSSxDQUFDQyxHQUFMLEVBQXJCO0FBQ0EsV0FBS3FCLHNCQUFMLENBQTRCaEgsWUFBNUIsRUFBMENJLGlCQUExQyxFQUE2REwsT0FBN0Q7QUFDQSxXQUFLa0gsc0JBQUwsQ0FBNEJqSCxZQUE1QixFQUEwQ0ksaUJBQTFDO0FBQ0EsYUFBT2tCLE9BQU8sQ0FBQzRGLEdBQVIsQ0FBWSxLQUFLdkcsYUFBakIsQ0FBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXhnQkE7QUFBQTtBQUFBLFdBeWdCRSw0QkFBbUJaLE9BQW5CLEVBQTRCO0FBQUE7O0FBQzFCLFVBQU1vSCxvQkFBb0IsR0FBRyxJQUE3QjtBQUNBLFVBQU1DLGlCQUFpQixHQUFHckgsT0FBTyxDQUFDc0gsWUFBUixDQUFxQixZQUFyQixDQUExQjs7QUFDQSxVQUFJLENBQUNELGlCQUFMLEVBQXdCO0FBQ3RCLGVBQU8sS0FBUDtBQUNEOztBQUNELFVBQU1FLFNBQVMsR0FBR25KLFlBQVksQ0FBQ2lKLGlCQUFELENBQTlCOztBQUNBLFVBQUksQ0FBQ0UsU0FBTCxFQUFnQjtBQUNkOUksUUFBQUEsSUFBSSxHQUFHNEMsSUFBUCxDQUFZdkMsR0FBWixFQUFpQiwyQ0FBakI7QUFDQSxlQUFPLEtBQVA7QUFDRDs7QUFFRCxVQUFJMEksT0FBSjs7QUFDQSxVQUFJO0FBQ0Y5SSxRQUFBQSxVQUFVLENBQ1I2SSxTQUFTLENBQUMsU0FBRCxDQUFULElBQXdCQSxTQUFTLENBQUMsTUFBRCxDQUR6QixFQUVSLHlDQUZRLENBQVY7QUFJQXpELFFBQUFBLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZd0QsU0FBWixFQUF1QnRELE9BQXZCLENBQStCLFVBQUNHLEdBQUQsRUFBUztBQUN0QyxrQkFBUUEsR0FBUjtBQUNFLGlCQUFLLFNBQUw7QUFDRTFGLGNBQUFBLFVBQVUsQ0FBQ1AsUUFBUSxDQUFDb0osU0FBUyxDQUFDbkQsR0FBRCxDQUFWLENBQVQsRUFBMkIscUJBQTNCLENBQVY7QUFDQTs7QUFDRixpQkFBSyxNQUFMO0FBQ0UxRixjQUFBQSxVQUFVLENBQUNSLE9BQU8sQ0FBQ3FKLFNBQVMsQ0FBQ25ELEdBQUQsQ0FBVixDQUFSLEVBQTBCLGtCQUExQixDQUFWO0FBQ0E7O0FBQ0YsaUJBQUssZUFBTDtBQUNFb0QsY0FBQUEsT0FBTyxHQUFHQyxRQUFRLENBQUNGLFNBQVMsQ0FBQ25ELEdBQUQsQ0FBVixFQUFpQixFQUFqQixDQUFsQjs7QUFDQSxrQkFBSXNELEtBQUssQ0FBQ0YsT0FBRCxDQUFULEVBQW9CO0FBQ2xCL0ksZ0JBQUFBLElBQUksR0FBRzRDLElBQVAsQ0FDRXZDLEdBREYsRUFFRSw2REFDMkJzSSxvQkFEM0IsUUFGRjtBQUtBSSxnQkFBQUEsT0FBTyxHQUFHakUsU0FBVjtBQUNELGVBUEQsTUFPTyxJQUFJaUUsT0FBTyxHQUFHSixvQkFBVixJQUFrQ0ksT0FBTyxHQUFHLENBQWhELEVBQW1EO0FBQ3hEL0ksZ0JBQUFBLElBQUksR0FBRzRDLElBQVAsQ0FDRXZDLEdBREYsRUFFRSwwQkFBd0IwSSxPQUF4Qix3Q0FDMkJKLG9CQUQzQixRQUZGO0FBS0FJLGdCQUFBQSxPQUFPLEdBQUdqRSxTQUFWO0FBQ0Q7O0FBQ0Q7O0FBQ0Y7QUFDRTlFLGNBQUFBLElBQUksR0FBRzRDLElBQVAsQ0FBWXZDLEdBQVosK0JBQTRDc0YsR0FBNUM7QUFDQTtBQTNCSjtBQTZCRCxTQTlCRDs7QUErQkEsWUFDRSxDQUFDTixNQUFNLENBQUNDLElBQVAsQ0FBWXdELFNBQVMsQ0FBQyxTQUFELENBQVQsSUFBd0IsRUFBcEMsRUFBd0NqRSxNQUF6QyxJQUNBLENBQUMsQ0FBQ2lFLFNBQVMsQ0FBQyxNQUFELENBQVQsSUFBcUIsRUFBdEIsRUFBMEJqRSxNQUY3QixFQUdFO0FBQ0EsaUJBQU8sS0FBUDtBQUNEOztBQUNELFlBQU1xRSx5QkFBeUIsR0FBRyxTQUE1QkEseUJBQTRCLENBQUN0RCxNQUFELEVBQVk7QUFDNUMsY0FBTXVELFFBQVEsR0FBR3ZELE1BQU0sQ0FBQyxtQkFBRCxDQUF2Qjs7QUFDQSxjQUFJdUQsUUFBUSxJQUFJLENBQUN2SixRQUFRLENBQUN1RSxTQUFULENBQW1CLE1BQUksQ0FBQzdDLE9BQXhCLEVBQWlDd0YsUUFBakMsQ0FBMENxQyxRQUExQyxDQUFqQixFQUFzRTtBQUNwRXBKLFlBQUFBLEdBQUcsR0FBRzZDLElBQU4sQ0FBV3ZDLEdBQVgsdUNBQW1EOEksUUFBbkQ7QUFDQXZELFlBQUFBLE1BQU0sQ0FBQyxtQkFBRCxDQUFOLEdBQThCZCxTQUE5QjtBQUNEO0FBQ0YsU0FORDs7QUFPQTtBQUFzQixTQUFDZ0UsU0FBUyxDQUFDLE1BQUQsQ0FBVCxJQUFxQixFQUF0QixFQUEwQnRELE9BQTFCLENBQWtDLFVBQUNJLE1BQUQsRUFBWTtBQUNsRSxjQUFJbEcsUUFBUSxDQUFDa0csTUFBRCxDQUFaLEVBQXNCO0FBQ3BCc0QsWUFBQUEseUJBQXlCLENBQUN0RCxNQUFELENBQXpCO0FBQ0Q7QUFDRixTQUpxQjtBQUt0QnNELFFBQUFBLHlCQUF5QixDQUFDSixTQUFELENBQXpCO0FBQ0QsT0F2REQsQ0F1REUsT0FBT00sU0FBUCxFQUFrQjtBQUNsQjtBQUNBLGVBQU8sS0FBUDtBQUNEOztBQUNETixNQUFBQSxTQUFTLENBQUMsZUFBRCxDQUFULEdBQ0VDLE9BQU8sS0FBS2pFLFNBQVosR0FBd0JpRSxPQUF4QixHQUFrQ0osb0JBRHBDO0FBRUEsV0FBS3ZHLFVBQUw7QUFBa0I7QUFBNkIwRyxNQUFBQSxTQUEvQztBQUNBLGFBQU8sSUFBUDtBQUNEO0FBcmxCSDs7QUFBQTtBQUFBOztBQXdsQkE7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTTyxrQ0FBVCxDQUE0Q0MsTUFBNUMsRUFBb0Q7QUFDekRuSixFQUFBQSw0QkFBNEIsQ0FBQ21KLE1BQUQsRUFBUyxrQkFBVCxFQUE2QixVQUFVQyxHQUFWLEVBQWU7QUFDdEUsV0FBTyxJQUFJbkkscUJBQUosQ0FBMEJtSSxHQUExQixDQUFQO0FBQ0QsR0FGMkIsQ0FBNUI7QUFHRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuaW1wb3J0IHtDT05TRU5UX1BPTElDWV9TVEFURX0gZnJvbSAnI2NvcmUvY29uc3RhbnRzL2NvbnNlbnQtc3RhdGUnO1xuaW1wb3J0IHtpc0FycmF5LCBpc09iamVjdH0gZnJvbSAnI2NvcmUvdHlwZXMnO1xuaW1wb3J0IHt0cnlQYXJzZUpzb259IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdC9qc29uJztcblxuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuXG5pbXBvcnQge1JUQ19WRU5ET1JTfSBmcm9tICcuL2NhbGxvdXQtdmVuZG9ycyc7XG5cbmltcG9ydCB7aXNDYW5jZWxsYXRpb259IGZyb20gJy4uLy4uL2Vycm9yLXJlcG9ydGluZyc7XG5pbXBvcnQge2RldiwgdXNlciwgdXNlckFzc2VydH0gZnJvbSAnLi4vLi4vbG9nJztcbmltcG9ydCB7Z2V0TW9kZX0gZnJvbSAnLi4vLi4vbW9kZSc7XG5pbXBvcnQge3JlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2N9IGZyb20gJy4uLy4uL3NlcnZpY2UtaGVscGVycyc7XG5pbXBvcnQge2lzQW1wU2NyaXB0VXJpfSBmcm9tICcuLi8uLi91cmwnO1xuXG4vKiogQHR5cGUge3N0cmluZ30gKi9cbmNvbnN0IFRBRyA9ICdyZWFsLXRpbWUtY29uZmlnJztcblxuLyoqIEB0eXBlIHtudW1iZXJ9ICovXG5jb25zdCBNQVhfUlRDX0NBTExPVVRTID0gNTtcblxuLyoqIEB0eXBlIHtudW1iZXJ9ICovXG5jb25zdCBNQVhfVVJMX0xFTkdUSCA9IDE2Mzg0O1xuXG4vKiogQHR5cGVkZWYge3tcbiAgICB1cmxzOiAodW5kZWZpbmVkfEFycmF5PHN0cmluZz58XG4gICAgICBBcnJheTx7dXJsOnN0cmluZywgZXJyb3JSZXBvcnRpbmdVcmw6c3RyaW5nLFxuICAgICAgICBzZW5kUmVnYXJkbGVzc09mQ29uc2VudFN0YXRlOih1bmRlZmluZWR8Ym9vbGVhbnxBcnJheTxzdHJpbmc+KX0+KSxcbiAgICB2ZW5kb3JzOiAodW5kZWZpbmVkfE9iamVjdCksXG4gICAgdGltZW91dE1pbGxpczogbnVtYmVyLFxuICAgIGVycm9yUmVwb3J0aW5nVXJsOiAodW5kZWZpbmVkfHN0cmluZyksXG4gICAgc2VuZFJlZ2FyZGxlc3NPZkNvbnNlbnRTdGF0ZTogKHVuZGVmaW5lZHxib29sZWFufEFycmF5PHN0cmluZz4pXG59fSAqL1xubGV0IFJ0Y0NvbmZpZ0RlZjtcblxuLyoqXG4gKiBFbnVtIHN0YXJ0cyBhdCA0IGJlY2F1c2UgMS0zIHJlc2VydmVkIGFzOlxuICogIDEgPSBjdXN0b20gcmVtb3RlLmh0bWwgaW4gdXNlLlxuICogIDIgPSBSVEMgc3VjY2VlZGVkLlxuICogIDMgPSBkZXByZWNhdGVkIGdlbmVyaWMgUlRDIGZhaWx1cmVzLlxuICogQGVudW0ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IFJUQ19FUlJPUl9FTlVNID0ge1xuICAvLyBPY2N1cnMgd2hlbiByZXNwb25zZSBpcyB1bnBhcnNlYWJsZSBhcyBKU09OXG4gIE1BTEZPUk1FRF9KU09OX1JFU1BPTlNFOiAnNCcsXG4gIC8vIE9jY3VycyB3aGVuIGEgcHVibGlzaGVyIGhhcyBzcGVjaWZpZWQgdGhlIHNhbWUgdXJsXG4gIC8vIG9yIHZlbmRvciB1cmwgKGFmdGVyIG1hY3JvcyBhcmUgc3Vic3RpdHV0ZWQpIHRvIGNhbGwgb3V0IHRvIG1vcmUgdGhhbiBvbmNlLlxuICBEVVBMSUNBVEVfVVJMOiAnNScsXG4gIC8vIE9jY3VycyB3aGVuIGEgVVJMIGZhaWxzIGlzU2VjdXJlVXJsIGNoZWNrLlxuICBJTlNFQ1VSRV9VUkw6ICc2JyxcbiAgLy8gT2NjdXJzIHdoZW4gNSB2YWxpZCBjYWxsb3V0IHVybHMgaGF2ZSBhbHJlYWR5IGJlZW4gYnVpbHQsIGFuZCBhZGRpdGlvbmFsXG4gIC8vIHVybHMgYXJlIHN0aWxsIHNwZWNpZmllZC5cbiAgTUFYX0NBTExPVVRTX0VYQ0VFREVEOiAnNycsXG4gIC8vIE9jY3VycyBkdWUgdG8gWEhSIGZhaWx1cmUuXG4gIE5FVFdPUktfRkFJTFVSRTogJzgnLFxuICAvLyBPY2N1cnMgd2hlbiBhIHNwZWNpZmllZCB2ZW5kb3IgZG9lcyBub3QgZXhpc3QgaW4gUlRDX1ZFTkRPUlMuXG4gIFVOS05PV05fVkVORE9SOiAnOScsXG4gIC8vIE9jY3VycyB3aGVuIHJlcXVlc3QgdG9vayBsb25nZXIgdGhhbiB0aW1lb3V0XG4gIFRJTUVPVVQ6ICcxMCcsXG4gIC8vIE9jY3VycyB3aGVuIFVSTCBleHBhbnNpb24gdGltZSBleGNlZWRlZCBhbGxvd2VkIHRpbWVvdXQsIHJlcXVlc3QgbmV2ZXJcbiAgLy8gc2VudC5cbiAgTUFDUk9fRVhQQU5EX1RJTUVPVVQ6ICcxMScsXG59O1xuXG4vKiogQGNvbnN0IHshT2JqZWN0PHN0cmluZywgYm9vbGVhbj59ICovXG5jb25zdCBHTE9CQUxfTUFDUk9fQUxMT1dMSVNUID0ge0NMSUVOVF9JRDogdHJ1ZX07XG5cbmV4cG9ydCBjbGFzcyBSZWFsVGltZUNvbmZpZ1NlcnZpY2Uge1xuICAvKipcbiAgICogQHBhcmFtIHshLi4vYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBEb2NcbiAgICovXG4gIGNvbnN0cnVjdG9yKGFtcERvYykge1xuICAgIC8qKiBAcHJvdGVjdGVkIHshLi4vYW1wZG9jLWltcGwuQW1wRG9jfSAqL1xuICAgIHRoaXMuYW1wRG9jXyA9IGFtcERvYztcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgYSBnaXZlbiBBNEEgRWxlbWVudCwgc2VuZHMgb3V0IFJlYWwgVGltZSBDb25maWcgcmVxdWVzdHMgdG9cbiAgICogYW55IHVybHMgb3IgdmVuZG9ycyBzcGVjaWZpZWQgYnkgdGhlIHB1Ymxpc2hlci5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcGFyYW0geyFPYmplY3Q8c3RyaW5nLCAhLi4vLi4vLi4vc3JjL3NlcnZpY2UvdmFyaWFibGUtc291cmNlLkFzeW5jUmVzb2x2ZXJEZWY+fSBjdXN0b21NYWNyb3MgVGhlIGFkLW5ldHdvcmsgc3BlY2lmaWVkIG1hY3JvXG4gICAqICAgc3Vic3RpdHV0aW9ucyBhdmFpbGFibGUgdG8gdXNlLlxuICAgKiBAcGFyYW0gez9DT05TRU5UX1BPTElDWV9TVEFURX0gY29uc2VudFN0YXRlXG4gICAqIEBwYXJhbSB7P3N0cmluZ30gY29uc2VudFN0cmluZ1xuICAgKiBAcGFyYW0gez9PYmplY3Q8c3RyaW5nLCBzdHJpbmd8bnVtYmVyfGJvb2xlYW58dW5kZWZpbmVkPn0gY29uc2VudE1ldGFkYXRhXG4gICAqIEBwYXJhbSB7IUZ1bmN0aW9ufSBjaGVja1N0aWxsQ3VycmVudFxuICAgKiBAcmV0dXJuIHtQcm9taXNlPCFBcnJheTwhcnRjUmVzcG9uc2VEZWY+Pnx1bmRlZmluZWR9XG4gICAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICAgKi9cbiAgbWF5YmVFeGVjdXRlUmVhbFRpbWVDb25maWcoXG4gICAgZWxlbWVudCxcbiAgICBjdXN0b21NYWNyb3MsXG4gICAgY29uc2VudFN0YXRlLFxuICAgIGNvbnNlbnRTdHJpbmcsXG4gICAgY29uc2VudE1ldGFkYXRhLFxuICAgIGNoZWNrU3RpbGxDdXJyZW50XG4gICkge1xuICAgIHJldHVybiBuZXcgUmVhbFRpbWVDb25maWdNYW5hZ2VyKHRoaXMuYW1wRG9jXykuZXhlY3V0ZShcbiAgICAgIGVsZW1lbnQsXG4gICAgICBjdXN0b21NYWNyb3MsXG4gICAgICBjb25zZW50U3RhdGUsXG4gICAgICBjb25zZW50U3RyaW5nLFxuICAgICAgY29uc2VudE1ldGFkYXRhLFxuICAgICAgY2hlY2tTdGlsbEN1cnJlbnRcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZWFsVGltZUNvbmZpZ01hbmFnZXIge1xuICAvKipcbiAgICogQHBhcmFtIHshLi4vYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBEb2NcbiAgICovXG4gIGNvbnN0cnVjdG9yKGFtcERvYykge1xuICAgIC8qKiBAcHJvdGVjdGVkIHshLi4vYW1wZG9jLWltcGwuQW1wRG9jfSAqL1xuICAgIHRoaXMuYW1wRG9jXyA9IGFtcERvYztcblxuICAgIC8qKiBAcHJpdmF0ZSB7IVdpbmRvd30gKi9cbiAgICB0aGlzLndpbl8gPSBhbXBEb2Mud2luO1xuXG4gICAgLyoqIEBwcml2YXRlIHshT2JqZWN0PHN0cmluZywgYm9vbGVhbj59ICovXG4gICAgdGhpcy5zZWVuVXJsc18gPSB7fTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P251bWJlcn0gKi9cbiAgICB0aGlzLnJ0Y1N0YXJ0VGltZV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHshQXJyYXk8IVByb21pc2U8IXJ0Y1Jlc3BvbnNlRGVmPj59ICovXG4gICAgdGhpcy5wcm9taXNlQXJyYXlfID0gW107XG5cbiAgICAvKiogQHByaXZhdGUgez9SdGNDb25maWdEZWZ9ICovXG4gICAgdGhpcy5ydGNDb25maWdfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0NPTlNFTlRfUE9MSUNZX1NUQVRFfSAqL1xuICAgIHRoaXMuY29uc2VudFN0YXRlXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9zdHJpbmd9ICovXG4gICAgdGhpcy5jb25zZW50U3RyaW5nXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9PYmplY3Q8c3RyaW5nLCBzdHJpbmd8bnVtYmVyfGJvb2xlYW58dW5kZWZpbmVkPn0gKi9cbiAgICB0aGlzLmNvbnNlbnRNZXRhZGF0YV8gPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBlcnJvclxuICAgKiBAcGFyYW0ge3N0cmluZ30gY2FsbG91dFxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXJyb3JSZXBvcnRpbmdVcmxcbiAgICogQHBhcmFtIHtudW1iZXI9fSBvcHRfcnRjVGltZVxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhcnRjUmVzcG9uc2VEZWY+fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYnVpbGRFcnJvclJlc3BvbnNlXyhlcnJvciwgY2FsbG91dCwgZXJyb3JSZXBvcnRpbmdVcmwsIG9wdF9ydGNUaW1lKSB7XG4gICAgZGV2KCkud2FybihUQUcsIGBSVEMgY2FsbG91dCB0byAke2NhbGxvdXR9IGNhdXNlZCAke2Vycm9yfWApO1xuICAgIGlmIChlcnJvclJlcG9ydGluZ1VybCkge1xuICAgICAgdGhpcy5zZW5kRXJyb3JNZXNzYWdlKGVycm9yLCBlcnJvclJlcG9ydGluZ1VybCk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoXG4gICAgICAvKipAdHlwZSB7cnRjUmVzcG9uc2VEZWZ9ICovICh7ZXJyb3IsIGNhbGxvdXQsIHJ0Y1RpbWU6IG9wdF9ydGNUaW1lIHx8IDB9KVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGVycm9yVHlwZSBVc2VzIHRoZSBSVENfRVJST1JfRU5VTSBhYm92ZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGVycm9yUmVwb3J0aW5nVXJsXG4gICAqL1xuICBzZW5kRXJyb3JNZXNzYWdlKGVycm9yVHlwZSwgZXJyb3JSZXBvcnRpbmdVcmwpIHtcbiAgICBpZiAoXG4gICAgICAhZ2V0TW9kZSh0aGlzLndpbl8pLmxvY2FsRGV2ICYmXG4gICAgICAhZ2V0TW9kZSh0aGlzLndpbl8pLnRlc3QgJiZcbiAgICAgIE1hdGgucmFuZG9tKCkgPj0gMC4wMVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBhbGxvd2xpc3QgPSB7RVJST1JfVFlQRTogdHJ1ZSwgSFJFRjogdHJ1ZX07XG4gICAgY29uc3QgbWFjcm9zID0ge1xuICAgICAgRVJST1JfVFlQRTogZXJyb3JUeXBlLFxuICAgICAgSFJFRjogdGhpcy53aW5fLmxvY2F0aW9uLmhyZWYsXG4gICAgfTtcbiAgICBjb25zdCBzZXJ2aWNlID0gU2VydmljZXMudXJsUmVwbGFjZW1lbnRzRm9yRG9jKHRoaXMuYW1wRG9jXyk7XG4gICAgY29uc3QgdXJsID0gc2VydmljZS5leHBhbmRVcmxTeW5jKGVycm9yUmVwb3J0aW5nVXJsLCBtYWNyb3MsIGFsbG93bGlzdCk7XG4gICAgbmV3IHRoaXMud2luXy5JbWFnZSgpLnNyYyA9IHVybDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIFVSTCBpbnRvIGl0cyBjb3JyZXNwb25kaW5nIHNob3J0ZW5lZCBjYWxsb3V0IHN0cmluZy5cbiAgICogV2UgYWxzbyB0cnVuY2F0ZSB0byBhIG1heGltdW0gbGVuZ3RoIG9mIDUwIGNoYXJhY3RlcnMuXG4gICAqIEZvciBpbnN0YW5jZSwgaWYgd2UgYXJlIHBhc3NlZFxuICAgKiBcImh0dHBzOi8vZXhhbXBsZS50ZXN0L2V4YW1wbGUucGhwP2Zvbz1hJmJhcj1iLCB0aGVuIHdlIHJldHVyblxuICAgKiBleGFtcGxlLnRlc3QvZXhhbXBsZS5waHBcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBnZXRDYWxsb3V0UGFyYW1fKHVybCkge1xuICAgIGNvbnN0IHVybFNlcnZpY2UgPSBTZXJ2aWNlcy51cmxGb3JEb2ModGhpcy5hbXBEb2NfKTtcbiAgICBjb25zdCBwYXJzZWRVcmwgPSB1cmxTZXJ2aWNlLnBhcnNlKHVybCk7XG4gICAgcmV0dXJuIChwYXJzZWRVcmwuaG9zdG5hbWUgKyBwYXJzZWRVcmwucGF0aG5hbWUpLnN1YnN0cigwLCA1MCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIGEgZ2l2ZW4gY2FsbG91dCBvYmplY3QgaXMgdmFsaWQgdG8gc2VuZCBhbiBSVEMgcmVxdWVzdFxuICAgKiB0bywgZm9yIHRoZSBnaXZlbiBjb25zZW50U3RhdGUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fHN0cmluZ30gY2FsbG91dENvbmZpZ1xuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRJc0dsb2JhbGx5VmFsaWRcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQHZpc2libGVGb3JUZXN0aW5nXG4gICAqL1xuICBpc1ZhbGlkQ2FsbG91dEZvckNvbnNlbnRTdGF0ZShjYWxsb3V0Q29uZmlnLCBvcHRJc0dsb2JhbGx5VmFsaWQpIHtcbiAgICBjb25zdCB7c2VuZFJlZ2FyZGxlc3NPZkNvbnNlbnRTdGF0ZX0gPSBjYWxsb3V0Q29uZmlnO1xuICAgIGlmICghaXNPYmplY3QoY2FsbG91dENvbmZpZykgfHwgIXNlbmRSZWdhcmRsZXNzT2ZDb25zZW50U3RhdGUpIHtcbiAgICAgIHJldHVybiAhIW9wdElzR2xvYmFsbHlWYWxpZDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHNlbmRSZWdhcmRsZXNzT2ZDb25zZW50U3RhdGUgPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICByZXR1cm4gc2VuZFJlZ2FyZGxlc3NPZkNvbnNlbnRTdGF0ZTtcbiAgICB9XG5cbiAgICBpZiAoaXNBcnJheShzZW5kUmVnYXJkbGVzc09mQ29uc2VudFN0YXRlKSkge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZW5kUmVnYXJkbGVzc09mQ29uc2VudFN0YXRlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICB0aGlzLmNvbnNlbnRTdGF0ZV8gPT1cbiAgICAgICAgICBDT05TRU5UX1BPTElDWV9TVEFURVtzZW5kUmVnYXJkbGVzc09mQ29uc2VudFN0YXRlW2ldXVxuICAgICAgICApIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmICghQ09OU0VOVF9QT0xJQ1lfU1RBVEVbc2VuZFJlZ2FyZGxlc3NPZkNvbnNlbnRTdGF0ZVtpXV0pIHtcbiAgICAgICAgICBkZXYoKS53YXJuKFxuICAgICAgICAgICAgVEFHLFxuICAgICAgICAgICAgJ0ludmFsaWQgUlRDIGNvbnNlbnQgc3RhdGUgZ2l2ZW46ICcgK1xuICAgICAgICAgICAgICBgJHtzZW5kUmVnYXJkbGVzc09mQ29uc2VudFN0YXRlW2ldfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHVzZXIoKS53YXJuKFxuICAgICAgVEFHLFxuICAgICAgJ0ludmFsaWQgdmFsdWUgZm9yIHNlbmRSZWdhcmRsZXNzT2ZDb25zZW50U3RhdGU6JyArXG4gICAgICAgIGAke3NlbmRSZWdhcmRsZXNzT2ZDb25zZW50U3RhdGV9YFxuICAgICk7XG4gICAgcmV0dXJuICEhb3B0SXNHbG9iYWxseVZhbGlkO1xuICB9XG5cbiAgLyoqXG4gICAqIEdvZXMgdGhyb3VnaCB0aGUgUlRDIGNvbmZpZywgYW5kIGZvciBhbnkgVVJMIHRoYXQgd2Ugc2hvdWxkIG5vdCBjYWxsb3V0XG4gICAqIGFzIHBlciB0aGUgY3VycmVudCBjb25zZW50IHN0YXRlLCBkZWxldGVzIGl0IGZyb20gdGhlIFJUQyBjb25maWcuXG4gICAqIEZvciBleGFtcGxlLCBpZiB0aGUgUlRDIGNvbmZpZyBsb29rZWQgbGlrZTpcbiAgICogICAge3ZlbmRvcnM6IHt2ZW5kb3JBOiB7J3NlbmRSZWdhcmRsZXNzT2ZDb25zZW50U3RhdGUnOiB0cnVlfVxuICAgKiAgICAgICAgICAgICAgIHZlbmRvckI6IHsnbWFjcm9zJzogeydTTE9UX0lEJzogMX19fSxcbiAgICogICAgIHVybHM6IFsnaHR0cHM6Ly93d3cucnRjLmV4YW1wbGUvZXhhbXBsZScsXG4gICAqICAgICAgICAgICAge3VybDogJ2h0dHBzOi8vd3d3LnJ0Y1NpdGUyLmV4YW1wbGUvZXhhbXBsZScsXG4gICAqICAgICAgICAgICAgIHNlbmRSZWdhcmRsZXNzT2ZDb25zZW50U3RhdGU6IFsnVU5LTk9XTiddfV1cbiAgICogICAgfVxuICAgKiBhbmQgdGhlIGNvbnNlbnRTdGF0ZSBpcyBDT05TRU5UX1BPTElDWV9TVEFURS5VTktOT1dOLFxuICAgKiB0aGVuIHRoaXMgbWV0aG9kIGNhbGwgd291bGQgY2xlYXIgdGhlIGNhbGxvdXRzIHRvIHZlbmRvckIsIGFuZCB0byB0aGUgZmlyc3RcbiAgICogY3VzdG9tIFVSTC5cbiAgICovXG4gIG1vZGlmeVJ0Y0NvbmZpZ0ZvckNvbnNlbnRTdGF0ZVNldHRpbmdzKCkge1xuICAgIGlmIChcbiAgICAgIHRoaXMuY29uc2VudFN0YXRlXyA9PSB1bmRlZmluZWQgfHxcbiAgICAgIHRoaXMuY29uc2VudFN0YXRlXyA9PSBDT05TRU5UX1BPTElDWV9TVEFURS5TVUZGSUNJRU5UIHx8XG4gICAgICB0aGlzLmNvbnNlbnRTdGF0ZV8gPT0gQ09OU0VOVF9QT0xJQ1lfU1RBVEUuVU5LTk9XTl9OT1RfUkVRVUlSRURcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBpc0dsb2JhbGx5VmFsaWQgPSB0aGlzLmlzVmFsaWRDYWxsb3V0Rm9yQ29uc2VudFN0YXRlKHRoaXMucnRjQ29uZmlnXyk7XG4gICAgdGhpcy5ydGNDb25maWdfLnVybHMgPSAodGhpcy5ydGNDb25maWdfLnVybHMgfHwgW10pLmZpbHRlcigodXJsKSA9PlxuICAgICAgdGhpcy5pc1ZhbGlkQ2FsbG91dEZvckNvbnNlbnRTdGF0ZSh1cmwsIGlzR2xvYmFsbHlWYWxpZClcbiAgICApO1xuXG4gICAgT2JqZWN0LmtleXModGhpcy5ydGNDb25maWdfLnZlbmRvcnMgfHwge30pLmZvckVhY2goKHZlbmRvcikgPT4ge1xuICAgICAgaWYgKFxuICAgICAgICAhdGhpcy5pc1ZhbGlkQ2FsbG91dEZvckNvbnNlbnRTdGF0ZShcbiAgICAgICAgICB0aGlzLnJ0Y0NvbmZpZ18udmVuZG9yc1t2ZW5kb3JdLFxuICAgICAgICAgIGlzR2xvYmFsbHlWYWxpZFxuICAgICAgICApXG4gICAgICApIHtcbiAgICAgICAgZGVsZXRlIHRoaXMucnRjQ29uZmlnXy52ZW5kb3JzW3ZlbmRvcl07XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQXNzaWducyBjb25zdGFudCBtYWNyb3MgdGhhdCBzaG91bGQgZXhpc3QgZm9yIGFsbCBSVEMgdG8gb2JqZWN0IG9mIGN1c3RvbVxuICAgKiBwZXItbmV0d29yayBtYWNyb3MuXG4gICAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsICEuLi8uLi8uLi9zcmMvc2VydmljZS92YXJpYWJsZS1zb3VyY2UuQXN5bmNSZXNvbHZlckRlZj59IG1hY3Jvc1xuICAgKiBAcmV0dXJuIHshT2JqZWN0PHN0cmluZywgIS4uLy4uLy4uL3NyYy9zZXJ2aWNlL3ZhcmlhYmxlLXNvdXJjZS5Bc3luY1Jlc29sdmVyRGVmPn1cbiAgICovXG4gIGFzc2lnbk1hY3JvcyhtYWNyb3MpIHtcbiAgICBtYWNyb3NbJ1RJTUVPVVQnXSA9ICgpID0+IHRoaXMucnRjQ29uZmlnXy50aW1lb3V0TWlsbGlzO1xuICAgIG1hY3Jvc1snQ09OU0VOVF9TVEFURSddID0gKCkgPT4gdGhpcy5jb25zZW50U3RhdGVfO1xuICAgIG1hY3Jvc1snQ09OU0VOVF9TVFJJTkcnXSA9ICgpID0+IHRoaXMuY29uc2VudFN0cmluZ187XG4gICAgbWFjcm9zWydDT05TRU5UX01FVEFEQVRBJ10gPVxuICAgICAgLyoqIEB0eXBlIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvdmFyaWFibGUtc291cmNlLkFzeW5jUmVzb2x2ZXJEZWZ9ICovIChcbiAgICAgICAgKGtleSkgPT4ge1xuICAgICAgICAgIHVzZXJBc3NlcnQoa2V5LCAnQ09OU0VOVF9NRVRBREFUQSBtYWNybyBtdXN0IGNvbnRpYW4gYSBrZXknKTtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25zZW50TWV0YWRhdGFfID8gdGhpcy5jb25zZW50TWV0YWRhdGFfW2tleV0gOiBudWxsO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIHJldHVybiBtYWNyb3M7XG4gIH1cblxuICAvKipcbiAgICogTWFuYWdlcyBzZW5kaW5nIHRoZSBSVEMgY2FsbG91dHMgZm9yIHRoZSBDdXN0b20gVVJMcy5cbiAgICogQHBhcmFtIHshT2JqZWN0PHN0cmluZywgIS4uLy4uLy4uL3NyYy9zZXJ2aWNlL3ZhcmlhYmxlLXNvdXJjZS5Bc3luY1Jlc29sdmVyRGVmPn0gY3VzdG9tTWFjcm9zIFRoZSBhZC1uZXR3b3JrIHNwZWNpZmllZCBtYWNyb1xuICAgKiBAcGFyYW0geyFGdW5jdGlvbn0gY2hlY2tTdGlsbEN1cnJlbnRcbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKi9cbiAgaGFuZGxlUnRjRm9yQ3VzdG9tVXJscyhjdXN0b21NYWNyb3MsIGNoZWNrU3RpbGxDdXJyZW50LCBlbGVtZW50KSB7XG4gICAgLy8gRm9yIGVhY2ggcHVibGlzaGVyIGRlZmluZWQgVVJMLCBpbmZsYXRlIHRoZSB1cmwgdXNpbmcgdGhlIG1hY3JvcyxcbiAgICAvLyBhbmQgc2VuZCB0aGUgUlRDIHJlcXVlc3QuXG4gICAgKHRoaXMucnRjQ29uZmlnXy51cmxzIHx8IFtdKS5mb3JFYWNoKCh1cmxPYmopID0+IHtcbiAgICAgIGxldCB1cmwsIGVycm9yUmVwb3J0aW5nVXJsO1xuICAgICAgaWYgKGlzT2JqZWN0KHVybE9iaikpIHtcbiAgICAgICAgdXJsID0gdXJsT2JqLnVybDtcbiAgICAgICAgZXJyb3JSZXBvcnRpbmdVcmwgPSB1cmxPYmouZXJyb3JSZXBvcnRpbmdVcmw7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB1cmxPYmogPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdXJsID0gdXJsT2JqO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGV2KCkud2FybihUQUcsIGBJbnZhbGlkIHVybDogJHt1cmxPYmp9YCk7XG4gICAgICB9XG4gICAgICB0aGlzLmluZmxhdGVBbmRTZW5kUnRjXyhcbiAgICAgICAgdXJsLFxuICAgICAgICBjdXN0b21NYWNyb3MsXG4gICAgICAgIGVycm9yUmVwb3J0aW5nVXJsLFxuICAgICAgICBjaGVja1N0aWxsQ3VycmVudCxcbiAgICAgICAgLyogb3B0X3ZlbmRvciAqLyB1bmRlZmluZWQsXG4gICAgICAgIGVsZW1lbnRcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogTWFuYWdlcyBzZW5kaW5nIHRoZSBSVEMgY2FsbG91dHMgZm9yIGFsbCBzcGVjaWZpZWQgdmVuZG9ycy5cbiAgICogQHBhcmFtIHshT2JqZWN0PHN0cmluZywgIS4uLy4uLy4uL3NyYy9zZXJ2aWNlL3ZhcmlhYmxlLXNvdXJjZS5Bc3luY1Jlc29sdmVyRGVmPn0gY3VzdG9tTWFjcm9zIFRoZSBhZC1uZXR3b3JrIHNwZWNpZmllZCBtYWNyb1xuICAgKiBAcGFyYW0geyFGdW5jdGlvbn0gY2hlY2tTdGlsbEN1cnJlbnRcbiAgICovXG4gIGhhbmRsZVJ0Y0ZvclZlbmRvclVybHMoY3VzdG9tTWFjcm9zLCBjaGVja1N0aWxsQ3VycmVudCkge1xuICAgIC8vIEZvciBlYWNoIHZlbmRvciB0aGUgcHVibGlzaGVyIGhhcyBzcGVjaWZpZWQsIGluZmxhdGUgdGhlIHZlbmRvclxuICAgIC8vIHVybCBpZiBpdCBleGlzdHMsIGFuZCBzZW5kIHRoZSBSVEMgcmVxdWVzdC5cbiAgICBPYmplY3Qua2V5cyh0aGlzLnJ0Y0NvbmZpZ18udmVuZG9ycyB8fCBbXSkuZm9yRWFjaCgodmVuZG9yKSA9PiB7XG4gICAgICBjb25zdCB2ZW5kb3JPYmplY3QgPSBSVENfVkVORE9SU1t2ZW5kb3IudG9Mb3dlckNhc2UoKV07XG4gICAgICBjb25zdCB1cmwgPSB2ZW5kb3JPYmplY3QgPyB2ZW5kb3JPYmplY3QudXJsIDogJyc7XG4gICAgICBjb25zdCBlcnJvclJlcG9ydGluZ1VybCA9XG4gICAgICAgIHZlbmRvck9iamVjdCAmJiB2ZW5kb3JPYmplY3QuZXJyb3JSZXBvcnRpbmdVcmxcbiAgICAgICAgICA/IHZlbmRvck9iamVjdC5lcnJvclJlcG9ydGluZ1VybFxuICAgICAgICAgIDogJyc7XG4gICAgICBpZiAoIXVybCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9taXNlQXJyYXlfLnB1c2goXG4gICAgICAgICAgdGhpcy5idWlsZEVycm9yUmVzcG9uc2VfKFxuICAgICAgICAgICAgUlRDX0VSUk9SX0VOVU0uVU5LTk9XTl9WRU5ET1IsXG4gICAgICAgICAgICB2ZW5kb3IsXG4gICAgICAgICAgICBlcnJvclJlcG9ydGluZ1VybFxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIC8vIFRoZXJlIGFyZSB0d28gdmFsaWQgY29uZmlndXJhdGlvbnMgb2YgdGhlIHZlbmRvciBvYmplY3QuXG4gICAgICAvLyBJdCBjYW4gZWl0aGVyIGJlIGFuIG9iamVjdCBvZiBtYWNyb3MgbWFwcGluZyBzdHJpbmcgdG8gc3RyaW5nLFxuICAgICAgLy8gb3IgaXQgY2FuIGJlIGFuIG9iamVjdCB3aXRoIHN1Yi1vYmplY3RzLCBvbmUgb2Ygd2hpY2ggY2FuIGJlXG4gICAgICAvLyAnbWFjcm9zJy4gVGhpcyBpcyBmb3IgYmFja3dhcmRzIGNvbXBhdGFiaWxpdHkuXG4gICAgICBjb25zdCB2ZW5kb3JNYWNyb3MgPSBpc09iamVjdCh0aGlzLnJ0Y0NvbmZpZ18udmVuZG9yc1t2ZW5kb3JdWydtYWNyb3MnXSlcbiAgICAgICAgPyB0aGlzLnJ0Y0NvbmZpZ18udmVuZG9yc1t2ZW5kb3JdWydtYWNyb3MnXVxuICAgICAgICA6IHRoaXMucnRjQ29uZmlnXy52ZW5kb3JzW3ZlbmRvcl07XG4gICAgICBjb25zdCB2YWxpZFZlbmRvck1hY3JvcyA9IHt9O1xuICAgICAgT2JqZWN0LmtleXModmVuZG9yTWFjcm9zKS5mb3JFYWNoKChtYWNybykgPT4ge1xuICAgICAgICBpZiAoISh2ZW5kb3JPYmplY3QubWFjcm9zICYmIHZlbmRvck9iamVjdC5tYWNyb3MuaW5jbHVkZXMobWFjcm8pKSkge1xuICAgICAgICAgIHVzZXIoKS5lcnJvcihUQUcsIGBVbmtub3duIG1hY3JvOiAke21hY3JvfSBmb3IgdmVuZG9yOiAke3ZlbmRvcn1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IHZlbmRvck1hY3Jvc1ttYWNyb107XG4gICAgICAgICAgdmFsaWRWZW5kb3JNYWNyb3NbbWFjcm9dID1cbiAgICAgICAgICAgIGlzT2JqZWN0KHZhbHVlKSB8fCBpc0FycmF5KHZhbHVlKSA/IEpTT04uc3RyaW5naWZ5KHZhbHVlKSA6IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIC8vIFRoZSBhZCBuZXR3b3JrIGRlZmluZWQgbWFjcm9zIG92ZXJyaWRlIHZlbmRvciBkZWZpbmVkL3B1YiBzcGVjaWZlZC5cbiAgICAgIGNvbnN0IG1hY3JvcyA9IE9iamVjdC5hc3NpZ24odmFsaWRWZW5kb3JNYWNyb3MsIGN1c3RvbU1hY3Jvcyk7XG4gICAgICB0aGlzLmluZmxhdGVBbmRTZW5kUnRjXyhcbiAgICAgICAgdXJsLFxuICAgICAgICBtYWNyb3MsXG4gICAgICAgIGVycm9yUmVwb3J0aW5nVXJsLFxuICAgICAgICBjaGVja1N0aWxsQ3VycmVudCxcbiAgICAgICAgdmVuZG9yLnRvTG93ZXJDYXNlKClcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgKiBAcGFyYW0geyFPYmplY3Q8c3RyaW5nLCAhLi4vLi4vLi4vc3JjL3NlcnZpY2UvdmFyaWFibGUtc291cmNlLkFzeW5jUmVzb2x2ZXJEZWY+fSBtYWNyb3NcbiAgICogQHBhcmFtIHtzdHJpbmd9IGVycm9yUmVwb3J0aW5nVXJsXG4gICAqIEBwYXJhbSB7IUZ1bmN0aW9ufSBjaGVja1N0aWxsQ3VycmVudFxuICAgKiBAcGFyYW0ge3N0cmluZz19IG9wdF92ZW5kb3JcbiAgICogQHBhcmFtIHshRWxlbWVudD19IG9wdF9lbGVtZW50XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpbmZsYXRlQW5kU2VuZFJ0Y18oXG4gICAgdXJsLFxuICAgIG1hY3JvcyxcbiAgICBlcnJvclJlcG9ydGluZ1VybCxcbiAgICBjaGVja1N0aWxsQ3VycmVudCxcbiAgICBvcHRfdmVuZG9yLFxuICAgIG9wdF9lbGVtZW50XG4gICkge1xuICAgIGxldCB7dGltZW91dE1pbGxpc30gPSB0aGlzLnJ0Y0NvbmZpZ187XG4gICAgY29uc3QgY2FsbG91dCA9IG9wdF92ZW5kb3IgfHwgdGhpcy5nZXRDYWxsb3V0UGFyYW1fKHVybCk7XG4gICAgLyoqXG4gICAgICogVGhlIHRpbWUgdGhhdCBpdCB0YWtlcyB0byBzdWJzdGl0dXRlIHRoZSBtYWNyb3MgaW50byB0aGUgVVJMIGNhbiB2YXJ5XG4gICAgICogZGVwZW5kaW5nIG9uIHdoYXQgdGhlIHVybCByZXF1aXJlcyB0byBiZSBzdWJzdGl0dXRlZCwgaS5lLiBhIGxvbmdcbiAgICAgKiBhc3luYyBjYWxsLiBUaHVzLCBob3dldmVyIGxvbmcgdGhlIFVSTCByZXBsYWNlbWVudCB0b29rIGlzIHRyZWF0ZWQgYXMgYVxuICAgICAqIHRpbWUgcGVuYWx0eS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICAgICogQHJldHVybiB7Kn0gVE9ETygjMjM1ODIpOiBTcGVjaWZ5IHJldHVybiB0eXBlXG4gICAgICovXG4gICAgY29uc3Qgc2VuZCA9ICh1cmwpID0+IHtcbiAgICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLnNlZW5VcmxzXykubGVuZ3RoID09IE1BWF9SVENfQ0FMTE9VVFMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnVpbGRFcnJvclJlc3BvbnNlXyhcbiAgICAgICAgICBSVENfRVJST1JfRU5VTS5NQVhfQ0FMTE9VVFNfRVhDRUVERUQsXG4gICAgICAgICAgY2FsbG91dCxcbiAgICAgICAgICBlcnJvclJlcG9ydGluZ1VybFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaWYgKFxuICAgICAgICAhU2VydmljZXMudXJsRm9yRG9jKHRoaXMuYW1wRG9jXykuaXNTZWN1cmUodXJsKSAmJlxuICAgICAgICAhaXNBbXBTY3JpcHRVcmkodXJsKVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJ1aWxkRXJyb3JSZXNwb25zZV8oXG4gICAgICAgICAgUlRDX0VSUk9SX0VOVU0uSU5TRUNVUkVfVVJMLFxuICAgICAgICAgIGNhbGxvdXQsXG4gICAgICAgICAgZXJyb3JSZXBvcnRpbmdVcmxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnNlZW5VcmxzX1t1cmxdKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJ1aWxkRXJyb3JSZXNwb25zZV8oXG4gICAgICAgICAgUlRDX0VSUk9SX0VOVU0uRFVQTElDQVRFX1VSTCxcbiAgICAgICAgICBjYWxsb3V0LFxuICAgICAgICAgIGVycm9yUmVwb3J0aW5nVXJsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB0aGlzLnNlZW5VcmxzX1t1cmxdID0gdHJ1ZTtcbiAgICAgIGlmICh1cmwubGVuZ3RoID4gTUFYX1VSTF9MRU5HVEgpIHtcbiAgICAgICAgdXJsID0gdGhpcy50cnVuY1VybF8odXJsKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuc2VuZFJ0Y0NhbGxvdXRfKFxuICAgICAgICB1cmwsXG4gICAgICAgIHRpbWVvdXRNaWxsaXMsXG4gICAgICAgIGNhbGxvdXQsXG4gICAgICAgIGNoZWNrU3RpbGxDdXJyZW50LFxuICAgICAgICBlcnJvclJlcG9ydGluZ1VybCxcbiAgICAgICAgb3B0X2VsZW1lbnRcbiAgICAgICk7XG4gICAgfTtcblxuICAgIGNvbnN0IGFsbG93bGlzdCA9IHsuLi5HTE9CQUxfTUFDUk9fQUxMT1dMSVNUfTtcbiAgICBPYmplY3Qua2V5cyhtYWNyb3MpLmZvckVhY2goKGtleSkgPT4gKGFsbG93bGlzdFtrZXldID0gdHJ1ZSkpO1xuICAgIGNvbnN0IHVybFJlcGxhY2VtZW50U3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLnByb21pc2VBcnJheV8ucHVzaChcbiAgICAgIFNlcnZpY2VzLnRpbWVyRm9yKHRoaXMud2luXylcbiAgICAgICAgLnRpbWVvdXRQcm9taXNlKFxuICAgICAgICAgIHRpbWVvdXRNaWxsaXMsXG4gICAgICAgICAgU2VydmljZXMudXJsUmVwbGFjZW1lbnRzRm9yRG9jKHRoaXMuYW1wRG9jXykuZXhwYW5kVXJsQXN5bmMoXG4gICAgICAgICAgICB1cmwsXG4gICAgICAgICAgICBtYWNyb3MsXG4gICAgICAgICAgICBhbGxvd2xpc3RcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICAgLnRoZW4oKHVybCkgPT4ge1xuICAgICAgICAgIGNoZWNrU3RpbGxDdXJyZW50KCk7XG4gICAgICAgICAgdGltZW91dE1pbGxpcyAtPSB1cmxSZXBsYWNlbWVudFN0YXJ0VGltZSAtIERhdGUubm93KCk7XG4gICAgICAgICAgcmV0dXJuIHNlbmQodXJsKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgIHJldHVybiBpc0NhbmNlbGxhdGlvbihlcnJvcilcbiAgICAgICAgICAgID8gdW5kZWZpbmVkXG4gICAgICAgICAgICA6IHRoaXMuYnVpbGRFcnJvclJlc3BvbnNlXyhcbiAgICAgICAgICAgICAgICBSVENfRVJST1JfRU5VTS5NQUNST19FWFBBTkRfVElNRU9VVCxcbiAgICAgICAgICAgICAgICBjYWxsb3V0LFxuICAgICAgICAgICAgICAgIGVycm9yUmVwb3J0aW5nVXJsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIHRydW5jVXJsXyh1cmwpIHtcbiAgICB1cmwgPSB1cmwuc3Vic3RyKDAsIE1BWF9VUkxfTEVOR1RIIC0gMTIpLnJlcGxhY2UoLyVcXHc/JC8sICcnKTtcbiAgICByZXR1cm4gdXJsICsgJyZfX3RydW5jX189MSc7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgKiBAcGFyYW0ge251bWJlcn0gdGltZW91dE1pbGxpc1xuICAgKiBAcGFyYW0ge3N0cmluZ30gY2FsbG91dFxuICAgKiBAcGFyYW0geyFGdW5jdGlvbn0gY2hlY2tTdGlsbEN1cnJlbnRcbiAgICogQHBhcmFtIHtzdHJpbmd9IGVycm9yUmVwb3J0aW5nVXJsXG4gICAqIEBwYXJhbSB7IUVsZW1lbnQ9fSBvcHRfZWxlbWVudFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhcnRjUmVzcG9uc2VEZWY+fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2VuZFJ0Y0NhbGxvdXRfKFxuICAgIHVybCxcbiAgICB0aW1lb3V0TWlsbGlzLFxuICAgIGNhbGxvdXQsXG4gICAgY2hlY2tTdGlsbEN1cnJlbnQsXG4gICAgZXJyb3JSZXBvcnRpbmdVcmwsXG4gICAgb3B0X2VsZW1lbnRcbiAgKSB7XG4gICAgbGV0IHJ0Y0ZldGNoO1xuICAgIGlmIChpc0FtcFNjcmlwdFVyaSh1cmwpKSB7XG4gICAgICBydGNGZXRjaCA9IFNlcnZpY2VzLnNjcmlwdEZvckRvY09yTnVsbChvcHRfZWxlbWVudClcbiAgICAgICAgLnRoZW4oKHNlcnZpY2UpID0+IHtcbiAgICAgICAgICB1c2VyQXNzZXJ0KHNlcnZpY2UsICdBTVAtU0NSSVBUIGlzIG5vdCBpbnN0YWxsZWQuJyk7XG4gICAgICAgICAgcmV0dXJuIHNlcnZpY2UuZmV0Y2godXJsKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKGpzb24pID0+IHtcbiAgICAgICAgICBjaGVja1N0aWxsQ3VycmVudCgpO1xuICAgICAgICAgIGNvbnN0IHJ0Y1RpbWUgPSBEYXRlLm5vdygpIC0gdGhpcy5ydGNTdGFydFRpbWVfO1xuICAgICAgICAgIGlmICh0eXBlb2YganNvbiAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJ1aWxkRXJyb3JSZXNwb25zZV8oXG4gICAgICAgICAgICAgIFJUQ19FUlJPUl9FTlVNLk1BTEZPUk1FRF9KU09OX1JFU1BPTlNFLFxuICAgICAgICAgICAgICBjYWxsb3V0LFxuICAgICAgICAgICAgICBlcnJvclJlcG9ydGluZ1VybCxcbiAgICAgICAgICAgICAgcnRjVGltZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHtyZXNwb25zZToganNvbiwgcnRjVGltZSwgY2FsbG91dH07XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBydGNGZXRjaCA9IFNlcnZpY2VzLnhockZvcih0aGlzLndpbl8pXG4gICAgICAgIC5mZXRjaEpzb24oXG4gICAgICAgICAgLy8gTk9URShicmFkZnJpenplbGwpOiB3ZSBjb3VsZCBpbmNsdWRlIGFtcENvcnM6ZmFsc2UgYWxsb3dpbmdcbiAgICAgICAgICAvLyB0aGUgcmVxdWVzdCB0byBiZSBjYWNoZWQgYWNyb3NzIHNpdGVzIGJ1dCBmb3Igbm93IGFzc3VtZSB0aGF0XG4gICAgICAgICAgLy8gaXMgbm90IGEgcmVxdWlyZWQgZmVhdHVyZS5cbiAgICAgICAgICB1cmwsXG4gICAgICAgICAge2NyZWRlbnRpYWxzOiAnaW5jbHVkZSd9XG4gICAgICAgIClcbiAgICAgICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgIGNoZWNrU3RpbGxDdXJyZW50KCk7XG4gICAgICAgICAgcmV0dXJuIHJlcy50ZXh0KCkudGhlbigodGV4dCkgPT4ge1xuICAgICAgICAgICAgY2hlY2tTdGlsbEN1cnJlbnQoKTtcbiAgICAgICAgICAgIGNvbnN0IHJ0Y1RpbWUgPSBEYXRlLm5vdygpIC0gdGhpcy5ydGNTdGFydFRpbWVfO1xuICAgICAgICAgICAgLy8gQW4gZW1wdHkgdGV4dCByZXNwb25zZSBpcyBhbGxvd2VkLCBub3QgYW4gZXJyb3IuXG4gICAgICAgICAgICBpZiAoIXRleHQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHtydGNUaW1lLCBjYWxsb3V0fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gdHJ5UGFyc2VKc29uKHRleHQpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlXG4gICAgICAgICAgICAgID8ge3Jlc3BvbnNlLCBydGNUaW1lLCBjYWxsb3V0fVxuICAgICAgICAgICAgICA6IHRoaXMuYnVpbGRFcnJvclJlc3BvbnNlXyhcbiAgICAgICAgICAgICAgICAgIFJUQ19FUlJPUl9FTlVNLk1BTEZPUk1FRF9KU09OX1JFU1BPTlNFLFxuICAgICAgICAgICAgICAgICAgY2FsbG91dCxcbiAgICAgICAgICAgICAgICAgIGVycm9yUmVwb3J0aW5nVXJsLFxuICAgICAgICAgICAgICAgICAgcnRjVGltZVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE5vdGU6IFRpbWVvdXQgaXMgZW5mb3JjZWQgYnkgdGltZXJGb3IsIG5vdCB0aGUgdmFsdWUgb2ZcbiAgICAgKiAgIHJ0Y1RpbWUuIFRoZXJlIGFyZSBzaXR1YXRpb25zIHdoZXJlIHJ0Y1RpbWUgY291bGQgdGh1c1xuICAgICAqICAgZW5kIHVwIGJlaW5nIGdyZWF0ZXIgdGhhbiB0aW1lb3V0TWlsbGlzLlxuICAgICAqL1xuICAgIHJldHVybiBTZXJ2aWNlcy50aW1lckZvcih0aGlzLndpbl8pXG4gICAgICAudGltZW91dFByb21pc2UodGltZW91dE1pbGxpcywgcnRjRmV0Y2gpXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIHJldHVybiBpc0NhbmNlbGxhdGlvbihlcnJvcilcbiAgICAgICAgICA/IHVuZGVmaW5lZFxuICAgICAgICAgIDogdGhpcy5idWlsZEVycm9yUmVzcG9uc2VfKFxuICAgICAgICAgICAgICAvLyBUaGUgcmVsZXZhbnQgZXJyb3IgbWVzc2FnZSBmb3IgdGltZW91dCBsb29rcyBsaWtlIGl0IGlzXG4gICAgICAgICAgICAgIC8vIGp1c3QgJ21lc3NhZ2UnIGJ1dCBpcyBpbiBmYWN0ICdtZXNzYWdlWFhYJyB3aGVyZSB0aGVcbiAgICAgICAgICAgICAgLy8gWCdzIGFyZSBoaWRkZW4gc3BlY2lhbCBjaGFyYWN0ZXJzLiBUaGF0J3Mgd2h5IHdlIHVzZVxuICAgICAgICAgICAgICAvLyBtYXRjaCBoZXJlLlxuICAgICAgICAgICAgICAvXnRpbWVvdXQvLnRlc3QoZXJyb3IubWVzc2FnZSlcbiAgICAgICAgICAgICAgICA/IFJUQ19FUlJPUl9FTlVNLlRJTUVPVVRcbiAgICAgICAgICAgICAgICA6IFJUQ19FUlJPUl9FTlVNLk5FVFdPUktfRkFJTFVSRSxcbiAgICAgICAgICAgICAgY2FsbG91dCxcbiAgICAgICAgICAgICAgZXJyb3JSZXBvcnRpbmdVcmwsXG4gICAgICAgICAgICAgIERhdGUubm93KCkgLSB0aGlzLnJ0Y1N0YXJ0VGltZV9cbiAgICAgICAgICAgICk7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgYSBnaXZlbiBBNEEgRWxlbWVudCwgc2VuZHMgb3V0IFJlYWwgVGltZSBDb25maWcgcmVxdWVzdHMgdG9cbiAgICogYW55IHVybHMgb3IgdmVuZG9ycyBzcGVjaWZpZWQgYnkgdGhlIHB1Ymxpc2hlci5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcGFyYW0geyFPYmplY3Q8c3RyaW5nLCAhLi4vLi4vLi4vc3JjL3NlcnZpY2UvdmFyaWFibGUtc291cmNlLkFzeW5jUmVzb2x2ZXJEZWY+fSBjdXN0b21NYWNyb3MgVGhlIGFkLW5ldHdvcmsgc3BlY2lmaWVkIG1hY3JvXG4gICAqICAgc3Vic3RpdHV0aW9ucyBhdmFpbGFibGUgdG8gdXNlLlxuICAgKiBAcGFyYW0gez9DT05TRU5UX1BPTElDWV9TVEFURX0gY29uc2VudFN0YXRlXG4gICAqIEBwYXJhbSB7P3N0cmluZ30gY29uc2VudFN0cmluZ1xuICAgKiBAcGFyYW0gez9PYmplY3Q8c3RyaW5nLCBzdHJpbmd8bnVtYmVyfGJvb2xlYW58dW5kZWZpbmVkPn0gY29uc2VudE1ldGFkYXRhXG4gICAqIEBwYXJhbSB7IUZ1bmN0aW9ufSBjaGVja1N0aWxsQ3VycmVudFxuICAgKiBAcmV0dXJuIHtQcm9taXNlPCFBcnJheTwhcnRjUmVzcG9uc2VEZWY+Pnx1bmRlZmluZWR9XG4gICAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICAgKi9cbiAgZXhlY3V0ZShcbiAgICBlbGVtZW50LFxuICAgIGN1c3RvbU1hY3JvcyxcbiAgICBjb25zZW50U3RhdGUsXG4gICAgY29uc2VudFN0cmluZyxcbiAgICBjb25zZW50TWV0YWRhdGEsXG4gICAgY2hlY2tTdGlsbEN1cnJlbnRcbiAgKSB7XG4gICAgaWYgKCF0aGlzLnZhbGlkYXRlUnRjQ29uZmlnXyhlbGVtZW50KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmNvbnNlbnRTdGF0ZV8gPSBjb25zZW50U3RhdGU7XG4gICAgdGhpcy5jb25zZW50U3RyaW5nXyA9IGNvbnNlbnRTdHJpbmc7XG4gICAgdGhpcy5jb25zZW50TWV0YWRhdGFfID0gY29uc2VudE1ldGFkYXRhO1xuICAgIHRoaXMubW9kaWZ5UnRjQ29uZmlnRm9yQ29uc2VudFN0YXRlU2V0dGluZ3MoKTtcbiAgICBjdXN0b21NYWNyb3MgPSB0aGlzLmFzc2lnbk1hY3JvcyhjdXN0b21NYWNyb3MpO1xuICAgIHRoaXMucnRjU3RhcnRUaW1lXyA9IERhdGUubm93KCk7XG4gICAgdGhpcy5oYW5kbGVSdGNGb3JDdXN0b21VcmxzKGN1c3RvbU1hY3JvcywgY2hlY2tTdGlsbEN1cnJlbnQsIGVsZW1lbnQpO1xuICAgIHRoaXMuaGFuZGxlUnRjRm9yVmVuZG9yVXJscyhjdXN0b21NYWNyb3MsIGNoZWNrU3RpbGxDdXJyZW50KTtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwodGhpcy5wcm9taXNlQXJyYXlfKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRlbXB0cyB0byBwYXJzZSB0aGUgcHVibGlzaGVyLWRlZmluZWQgUlRDIGNvbmZpZyBvZmYgdGhlIGFtcC1hZFxuICAgKiBlbGVtZW50LCB0aGVuIHZhbGlkYXRlcyB0aGF0IHRoZSBydGNDb25maWcgZXhpc3RzLCBhbmQgY29udGFpbnNcbiAgICogYW4gZW50cnkgZm9yIGVpdGhlciB2ZW5kb3IgVVJMcywgb3IgcHVibGlzaGVyLWRlZmluZWQgVVJMcy4gSWYgdGhlXG4gICAqIGNvbmZpZyBjb250YWlucyBhbiBlbnRyeSBmb3IgdGltZW91dE1pbGxpcywgdmFsaWRhdGVzIHRoYXQgaXQgaXMgYVxuICAgKiBudW1iZXIsIG9yIGNvbnZlcnRzIHRvIGEgbnVtYmVyIGlmIG51bWJlci1saWtlLCBvdGhlcndpc2Ugb3ZlcndyaXRlc1xuICAgKiB3aXRoIHRoZSBkZWZhdWx0LlxuICAgKiBJTVBPUlRBTlQ6IElmIHRoZSBydGNDb25maWcgaXMgaW52YWxpZCwgUlRDIGlzIGFib3J0ZWQsIGFuZCB0aGUgYWRcbiAgICogICByZXF1ZXN0IGNvbnRpbnVlcyB3aXRob3V0IFJUQy5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgdmFsaWRhdGVSdGNDb25maWdfKGVsZW1lbnQpIHtcbiAgICBjb25zdCBkZWZhdWx0VGltZW91dE1pbGxpcyA9IDEwMDA7XG4gICAgY29uc3QgdW5wYXJzZWRSdGNDb25maWcgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgncnRjLWNvbmZpZycpO1xuICAgIGlmICghdW5wYXJzZWRSdGNDb25maWcpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgcnRjQ29uZmlnID0gdHJ5UGFyc2VKc29uKHVucGFyc2VkUnRjQ29uZmlnKTtcbiAgICBpZiAoIXJ0Y0NvbmZpZykge1xuICAgICAgdXNlcigpLndhcm4oVEFHLCAnQ291bGQgbm90IEpTT04gcGFyc2UgcnRjLWNvbmZpZyBhdHRyaWJ1dGUnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgdGltZW91dDtcbiAgICB0cnkge1xuICAgICAgdXNlckFzc2VydChcbiAgICAgICAgcnRjQ29uZmlnWyd2ZW5kb3JzJ10gfHwgcnRjQ29uZmlnWyd1cmxzJ10sXG4gICAgICAgICdSVEMgQ29uZmlnIG11c3Qgc3BlY2lmeSB2ZW5kb3JzIG9yIHVybHMnXG4gICAgICApO1xuICAgICAgT2JqZWN0LmtleXMocnRjQ29uZmlnKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICBjYXNlICd2ZW5kb3JzJzpcbiAgICAgICAgICAgIHVzZXJBc3NlcnQoaXNPYmplY3QocnRjQ29uZmlnW2tleV0pLCAnUlRDIGludmFsaWQgdmVuZG9ycycpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAndXJscyc6XG4gICAgICAgICAgICB1c2VyQXNzZXJ0KGlzQXJyYXkocnRjQ29uZmlnW2tleV0pLCAnUlRDIGludmFsaWQgdXJscycpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAndGltZW91dE1pbGxpcyc6XG4gICAgICAgICAgICB0aW1lb3V0ID0gcGFyc2VJbnQocnRjQ29uZmlnW2tleV0sIDEwKTtcbiAgICAgICAgICAgIGlmIChpc05hTih0aW1lb3V0KSkge1xuICAgICAgICAgICAgICB1c2VyKCkud2FybihcbiAgICAgICAgICAgICAgICBUQUcsXG4gICAgICAgICAgICAgICAgJ0ludmFsaWQgUlRDIHRpbWVvdXQgaXMgTmFOLCAnICtcbiAgICAgICAgICAgICAgICAgIGB1c2luZyBkZWZhdWx0IHRpbWVvdXQgJHtkZWZhdWx0VGltZW91dE1pbGxpc31tc2BcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgdGltZW91dCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGltZW91dCA+IGRlZmF1bHRUaW1lb3V0TWlsbGlzIHx8IHRpbWVvdXQgPCAwKSB7XG4gICAgICAgICAgICAgIHVzZXIoKS53YXJuKFxuICAgICAgICAgICAgICAgIFRBRyxcbiAgICAgICAgICAgICAgICBgSW52YWxpZCBSVEMgdGltZW91dDogJHt0aW1lb3V0fW1zLCBgICtcbiAgICAgICAgICAgICAgICAgIGB1c2luZyBkZWZhdWx0IHRpbWVvdXQgJHtkZWZhdWx0VGltZW91dE1pbGxpc31tc2BcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgdGltZW91dCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB1c2VyKCkud2FybihUQUcsIGBVbmtub3duIFJUQyBDb25maWcga2V5OiAke2tleX1gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmIChcbiAgICAgICAgIU9iamVjdC5rZXlzKHJ0Y0NvbmZpZ1sndmVuZG9ycyddIHx8IHt9KS5sZW5ndGggJiZcbiAgICAgICAgIShydGNDb25maWdbJ3VybHMnXSB8fCBbXSkubGVuZ3RoXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgY29uc3QgdmFsaWRhdGVFcnJvclJlcG9ydGluZ1VybCA9ICh1cmxPYmopID0+IHtcbiAgICAgICAgY29uc3QgZXJyb3JVcmwgPSB1cmxPYmpbJ2Vycm9yUmVwb3J0aW5nVXJsJ107XG4gICAgICAgIGlmIChlcnJvclVybCAmJiAhU2VydmljZXMudXJsRm9yRG9jKHRoaXMuYW1wRG9jXykuaXNTZWN1cmUoZXJyb3JVcmwpKSB7XG4gICAgICAgICAgZGV2KCkud2FybihUQUcsIGBJbnNlY3VyZSBSVEMgZXJyb3JSZXBvcnRpbmdVcmw6ICR7ZXJyb3JVcmx9YCk7XG4gICAgICAgICAgdXJsT2JqWydlcnJvclJlcG9ydGluZ1VybCddID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgLyoqIEB0eXBlIHshQXJyYXl9ICovIChydGNDb25maWdbJ3VybHMnXSB8fCBbXSkuZm9yRWFjaCgodXJsT2JqKSA9PiB7XG4gICAgICAgIGlmIChpc09iamVjdCh1cmxPYmopKSB7XG4gICAgICAgICAgdmFsaWRhdGVFcnJvclJlcG9ydGluZ1VybCh1cmxPYmopO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHZhbGlkYXRlRXJyb3JSZXBvcnRpbmdVcmwocnRjQ29uZmlnKTtcbiAgICB9IGNhdGNoICh1bnVzZWRFcnIpIHtcbiAgICAgIC8vIFRoaXMgZXJyb3Igd291bGQgYmUgZHVlIHRvIHRoZSBhc3NlcnRzIGFib3ZlLlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBydGNDb25maWdbJ3RpbWVvdXRNaWxsaXMnXSA9XG4gICAgICB0aW1lb3V0ICE9PSB1bmRlZmluZWQgPyB0aW1lb3V0IDogZGVmYXVsdFRpbWVvdXRNaWxsaXM7XG4gICAgdGhpcy5ydGNDb25maWdfID0gLyoqIEB0eXBlIHtSdGNDb25maWdEZWZ9ICovIChydGNDb25maWcpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbi8qKlxuICogQHBhcmFtIHshLi4vYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGxSZWFsVGltZUNvbmZpZ1NlcnZpY2VGb3JEb2MoYW1wZG9jKSB7XG4gIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MoYW1wZG9jLCAncmVhbC10aW1lLWNvbmZpZycsIGZ1bmN0aW9uIChkb2MpIHtcbiAgICByZXR1cm4gbmV3IFJlYWxUaW1lQ29uZmlnU2VydmljZShkb2MpO1xuICB9KTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/service/real-time-config/real-time-config-impl.js