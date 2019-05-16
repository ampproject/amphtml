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
import {CONSENT_POLICY_STATE} from '../../../src/consent-state';
import {RTC_VENDORS} from './callout-vendors';
import {Services} from '../../../src/services';
import {dev, user, userAssert} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {isArray, isObject} from '../../../src/types';
import {isCancellation} from '../../../src/error';
import {tryParseJson} from '../../../src/json';

/** @type {string} */
const TAG = 'real-time-config';

/** @type {number} */
const MAX_RTC_CALLOUTS = 5;

/** @type {number} */
const MAX_URL_LENGTH = 16384;

/** @type {boolean} */
const ERROR_REPORTING_ENABLED =
  getMode(window).localDev || getMode(window).test || Math.random() < 0.01;

/** @typedef {{
    urls: (undefined|Array<string>|
      Array<{url:string, errorReportingUrl:string,
        sendRegardlessOfConsentState:(undefined|boolean|Array<string>)}>),
    vendors: (undefined|Object),
    timeoutMillis: number,
    errorReportingUrl: (undefined|string),
    sendRegardlessOfConsentState: (undefined|boolean|Array<string>)
}} */
let RtcConfigDef;

/**
 * Enum starts at 4 because 1-3 reserved as:
 *  1 = custom remote.html in use.
 *  2 = RTC succeeded.
 *  3 = deprecated generic RTC failures.
 * @enum {string}
 */
export const RTC_ERROR_ENUM = {
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
  MACRO_EXPAND_TIMEOUT: '11',
};

export class RealTimeConfigManager {
  /**
   * @param {!./amp-a4a.AmpA4A} a4aElement
   */
  constructor(a4aElement) {
    /** @private {!./amp-a4a.AmpA4A} */
    this.a4aElement_ = a4aElement;

    /** @private {!Window} */
    this.win_ = this.a4aElement_.win;

    /** @private {!Object<string, boolean>} */
    this.seenUrls_ = {};

    /** @private {?number} */
    this.rtcStartTime_ = null;

    /** @private {!Array<!Promise<!rtcResponseDef>>} */
    this.promiseArray_ = [];

    /** @private {?RtcConfigDef} */
    this.rtcConfig_ = null;

    /** @private !../../../src/service/ampdoc-impl.AmpDoc */
    this.ampDoc_ = this.a4aElement_.getAmpDoc();

    /** @private {?CONSENT_POLICY_STATE} */
    this.consentState_ = null;

    /** @private {?string} */
    this.consentString_ = null;
  }

  /**
   * @param {string} error
   * @param {string} callout
   * @param {string} errorReportingUrl
   * @param {number=} opt_rtcTime
   * @return {!Promise<!rtcResponseDef>}
   * @private
   */
  buildErrorResponse_(error, callout, errorReportingUrl, opt_rtcTime) {
    dev().warn(TAG, `RTC callout to ${callout} caused ${error}`);
    if (errorReportingUrl) {
      this.sendErrorMessage(error, errorReportingUrl);
    }
    return Promise.resolve(
      /**@type {rtcResponseDef} */ ({error, callout, rtcTime: opt_rtcTime || 0})
    );
  }

  /**
   * @param {string} errorType Uses the RTC_ERROR_ENUM above.
   * @param {string} errorReportingUrl
   */
  sendErrorMessage(errorType, errorReportingUrl) {
    if (!ERROR_REPORTING_ENABLED) {
      return;
    }
    const whitelist = {ERROR_TYPE: true, HREF: true};
    const macros = {
      ERROR_TYPE: errorType,
      HREF: this.win_.location.href,
    };
    const service = Services.urlReplacementsForDoc(this.a4aElement_.element);
    const url = service.expandUrlSync(errorReportingUrl, macros, whitelist);
    new this.win_.Image().src = url;
  }

  /**
   * Converts a URL into its corresponding shortened callout string.
   * We also truncate to a maximum length of 50 characters.
   * For instance, if we are passed
   * "https://example.com/example.php?foo=a&bar=b, then we return
   * example.com/example.php
   * @param {string} url
   * @return {string}
   */
  getCalloutParam_(url) {
    const urlService = Services.urlForDoc(this.a4aElement_.element);
    const parsedUrl = urlService.parse(url);
    return (parsedUrl.hostname + parsedUrl.pathname).substr(0, 50);
  }

  /**
   * For a given A4A Element, sends out Real Time Config requests to
   * any urls or vendors specified by the publisher.
   * @param {!Object<string, !../../../src/service/variable-source.AsyncResolverDef>} customMacros The ad-network specified macro
   *   substitutions available to use.
   * @param {?CONSENT_POLICY_STATE} consentState
   * @param {?string} consentString
   * @return {Promise<!Array<!rtcResponseDef>>|undefined}
   * @visibleForTesting
   */
  maybeExecuteRealTimeConfig(customMacros, consentState, consentString) {
    if (!this.validateRtcConfig_(this.a4aElement_.element)) {
      return;
    }
    this.consentState_ = consentState;
    this.consentString_ = consentString;
    this.modifyRtcConfigForConsentStateSettings();
    customMacros = this.assignMacros(customMacros);
    this.rtcStartTime_ = Date.now();
    this.handleRtcForCustomUrls(customMacros);
    this.handleRtcForVendorUrls(customMacros);
    return Promise.all(this.promiseArray_);
  }

  /**
   * Returns whether a given callout object is valid to send an RTC request
   * to, for the given consentState.
   * @param {Object|string} calloutConfig
   * @param {boolean=} optIsGloballyValid
   * @return {boolean}
   * @visibleForTesting
   */
  isValidCalloutForConsentState(calloutConfig, optIsGloballyValid) {
    const {sendRegardlessOfConsentState} = calloutConfig;
    if (!isObject(calloutConfig) || !sendRegardlessOfConsentState) {
      return !!optIsGloballyValid;
    }

    if (typeof sendRegardlessOfConsentState == 'boolean') {
      return sendRegardlessOfConsentState;
    }

    if (isArray(sendRegardlessOfConsentState)) {
      for (let i = 0; i < sendRegardlessOfConsentState.length; i++) {
        if (
          this.consentState_ ==
          CONSENT_POLICY_STATE[sendRegardlessOfConsentState[i]]
        ) {
          return true;
        } else if (!CONSENT_POLICY_STATE[sendRegardlessOfConsentState[i]]) {
          dev().warn(
            TAG,
            'Invalid RTC consent state given: ' +
              `${sendRegardlessOfConsentState[i]}`
          );
        }
      }
      return false;
    }
    user().warn(
      TAG,
      'Invalid value for sendRegardlessOfConsentState:' +
        `${sendRegardlessOfConsentState}`
    );
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
  modifyRtcConfigForConsentStateSettings() {
    if (
      this.consentState_ == undefined ||
      this.consentState_ == CONSENT_POLICY_STATE.SUFFICIENT ||
      this.consentState_ == CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED
    ) {
      return;
    }

    const isGloballyValid = this.isValidCalloutForConsentState(this.rtcConfig_);
    this.rtcConfig_.urls = (this.rtcConfig_.urls || []).filter(url =>
      this.isValidCalloutForConsentState(url, isGloballyValid)
    );

    Object.keys(this.rtcConfig_.vendors || {}).forEach(vendor => {
      if (
        !this.isValidCalloutForConsentState(
          this.rtcConfig_.vendors[vendor],
          isGloballyValid
        )
      ) {
        delete this.rtcConfig_.vendors[vendor];
      }
    });
  }

  /**
   * Assigns constant macros that should exist for all RTC to object of custom
   * per-network macros.
   * @param {!Object<string, !../../../src/service/variable-source.AsyncResolverDef>} macros
   */
  assignMacros(macros) {
    macros['TIMEOUT'] = () => this.rtcConfig_.timeoutMillis;
    macros['CONSENT_STATE'] = () => this.consentState_;
    macros['CONSENT_STRING'] = () => this.consentString_;
    return macros;
  }

  /**
   * Manages sending the RTC callouts for the Custom URLs.
   * @param {!Object<string, !../../../src/service/variable-source.AsyncResolverDef>} customMacros The ad-network specified macro
   */
  handleRtcForCustomUrls(customMacros) {
    // For each publisher defined URL, inflate the url using the macros,
    // and send the RTC request.
    (this.rtcConfig_.urls || []).forEach(urlObj => {
      let url, errorReportingUrl;
      if (isObject(urlObj)) {
        url = urlObj.url;
        errorReportingUrl = urlObj.errorReportingUrl;
      } else if (typeof urlObj == 'string') {
        url = urlObj;
      } else {
        dev().warn(TAG, `Invalid url: ${urlObj}`);
      }
      this.inflateAndSendRtc_(url, customMacros, errorReportingUrl);
    });
  }

  /**
   * Manages sending the RTC callouts for all specified vendors.
   * @param {!Object<string, !../../../src/service/variable-source.AsyncResolverDef>} customMacros The ad-network specified macro
   */
  handleRtcForVendorUrls(customMacros) {
    // For each vendor the publisher has specified, inflate the vendor
    // url if it exists, and send the RTC request.
    Object.keys(this.rtcConfig_.vendors || []).forEach(vendor => {
      const vendorObject = RTC_VENDORS[vendor.toLowerCase()];
      const url = vendorObject ? vendorObject.url : '';
      const errorReportingUrl =
        vendorObject && vendorObject.errorReportingUrl
          ? vendorObject.errorReportingUrl
          : '';
      if (!url) {
        return this.promiseArray_.push(
          this.buildErrorResponse_(
            RTC_ERROR_ENUM.UNKNOWN_VENDOR,
            vendor,
            errorReportingUrl
          )
        );
      }
      // There are two valid configurations of the vendor object.
      // It can either be an object of macros mapping string to string,
      // or it can be an object with sub-objects, one of which can be
      // 'macros'. This is for backwards compatability.
      const vendorMacros = isObject(this.rtcConfig_.vendors[vendor]['macros'])
        ? this.rtcConfig_.vendors[vendor]['macros']
        : this.rtcConfig_.vendors[vendor];
      const validVendorMacros = {};
      Object.keys(vendorMacros).forEach(macro => {
        if (!(vendorObject.macros && vendorObject.macros.includes(macro))) {
          user().error(TAG, `Unknown macro: ${macro} for vendor: ${vendor}`);
        } else {
          const value = vendorMacros[macro];
          validVendorMacros[macro] =
            isObject(value) || isArray(value) ? JSON.stringify(value) : value;
        }
      });
      // The ad network defined macros override vendor defined/pub specifed.
      const macros = Object.assign(validVendorMacros, customMacros);
      this.inflateAndSendRtc_(
        url,
        macros,
        errorReportingUrl,
        vendor.toLowerCase()
      );
    });
  }

  /**
   * @param {string} url
   * @param {!Object<string, !../../../src/service/variable-source.AsyncResolverDef>} macros
   * @param {string} errorReportingUrl
   * @param {string=} opt_vendor
   * @private
   */
  inflateAndSendRtc_(url, macros, errorReportingUrl, opt_vendor) {
    let {timeoutMillis} = this.rtcConfig_;
    const callout = opt_vendor || this.getCalloutParam_(url);
    const checkStillCurrent = this.a4aElement_.verifyStillCurrent.bind(
      this.a4aElement_
    )();
    /**
     * The time that it takes to substitute the macros into the URL can vary
     * depending on what the url requires to be substituted, i.e. a long
     * async call. Thus, however long the URL replacement took is treated as a
     * time penalty.
     * @param {string} url
     */
    const send = url => {
      if (Object.keys(this.seenUrls_).length == MAX_RTC_CALLOUTS) {
        return this.buildErrorResponse_(
          RTC_ERROR_ENUM.MAX_CALLOUTS_EXCEEDED,
          callout,
          errorReportingUrl
        );
      }
      if (!Services.urlForDoc(this.a4aElement_.element).isSecure(url)) {
        return this.buildErrorResponse_(
          RTC_ERROR_ENUM.INSECURE_URL,
          callout,
          errorReportingUrl
        );
      }
      if (this.seenUrls_[url]) {
        return this.buildErrorResponse_(
          RTC_ERROR_ENUM.DUPLICATE_URL,
          callout,
          errorReportingUrl
        );
      }
      this.seenUrls_[url] = true;
      if (url.length > MAX_URL_LENGTH) {
        url = this.truncUrl_(url);
      }
      return this.sendRtcCallout_(
        url,
        timeoutMillis,
        callout,
        checkStillCurrent,
        errorReportingUrl
      );
    };

    const whitelist = {};
    Object.keys(macros).forEach(key => (whitelist[key] = true));
    const urlReplacementStartTime = Date.now();
    this.promiseArray_.push(
      Services.timerFor(this.win_)
        .timeoutPromise(
          timeoutMillis,
          Services.urlReplacementsForDoc(
            this.a4aElement_.element
          ).expandUrlAsync(url, macros, whitelist)
        )
        .then(url => {
          checkStillCurrent();
          timeoutMillis -= urlReplacementStartTime - Date.now();
          return send(url);
        })
        .catch(error => {
          return isCancellation(error)
            ? undefined
            : this.buildErrorResponse_(
                RTC_ERROR_ENUM.MACRO_EXPAND_TIMEOUT,
                callout,
                errorReportingUrl
              );
        })
    );
  }

  /**
   * @param {string} url
   * @return {string}
   */
  truncUrl_(url) {
    url = url.substr(0, MAX_URL_LENGTH - 12).replace(/%\w?$/, '');
    return url + '&__trunc__=1';
  }

  /**
   * @param {string} url
   * @param {number} timeoutMillis
   * @param {string} callout
   * @param {!Function} checkStillCurrent
   * @param {string} errorReportingUrl
   * @return {!Promise<!rtcResponseDef>}
   * @private
   */
  sendRtcCallout_(
    url,
    timeoutMillis,
    callout,
    checkStillCurrent,
    errorReportingUrl
  ) {
    /**
     * Note: Timeout is enforced by timerFor, not the value of
     *   rtcTime. There are situations where rtcTime could thus
     *   end up being greater than timeoutMillis.
     */
    return Services.timerFor(this.win_)
      .timeoutPromise(
        timeoutMillis,
        Services.xhrFor(this.win_)
          .fetchJson(
            // NOTE(bradfrizzell): we could include ampCors:false allowing
            // the request to be cached across sites but for now assume that
            // is not a required feature.
            url,
            {credentials: 'include'}
          )
          .then(res => {
            checkStillCurrent();
            return res.text().then(text => {
              checkStillCurrent();
              const rtcTime = Date.now() - this.rtcStartTime_;
              // An empty text response is allowed, not an error.
              if (!text) {
                return {rtcTime, callout};
              }
              const response = tryParseJson(text);
              return response
                ? {response, rtcTime, callout}
                : this.buildErrorResponse_(
                    RTC_ERROR_ENUM.MALFORMED_JSON_RESPONSE,
                    callout,
                    errorReportingUrl,
                    rtcTime
                  );
            });
          })
      )
      .catch(error => {
        return isCancellation(error)
          ? undefined
          : this.buildErrorResponse_(
              // The relevant error message for timeout looks like it is
              // just 'message' but is in fact 'messageXXX' where the
              // X's are hidden special characters. That's why we use
              // match here.
              /^timeout/.test(error.message)
                ? RTC_ERROR_ENUM.TIMEOUT
                : RTC_ERROR_ENUM.NETWORK_FAILURE,
              callout,
              errorReportingUrl,
              Date.now() - this.rtcStartTime_
            );
      });
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
  validateRtcConfig_(element) {
    const defaultTimeoutMillis = 1000;
    const unparsedRtcConfig = element.getAttribute('rtc-config');
    if (!unparsedRtcConfig) {
      return false;
    }
    const rtcConfig = tryParseJson(unparsedRtcConfig);
    if (!rtcConfig) {
      user().warn(TAG, 'Could not JSON parse rtc-config attribute');
      return false;
    }

    let timeout;
    try {
      userAssert(
        rtcConfig['vendors'] || rtcConfig['urls'],
        'RTC Config must specify vendors or urls'
      );
      Object.keys(rtcConfig).forEach(key => {
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
              user().warn(
                TAG,
                'Invalid RTC timeout is NaN, ' +
                  `using default timeout ${defaultTimeoutMillis}ms`
              );
              timeout = undefined;
            } else if (timeout >= defaultTimeoutMillis || timeout < 0) {
              user().warn(
                TAG,
                `Invalid RTC timeout: ${timeout}ms, ` +
                  `using default timeout ${defaultTimeoutMillis}ms`
              );
              timeout = undefined;
            }
            break;
          default:
            user().warn(TAG, `Unknown RTC Config key: ${key}`);
            break;
        }
      });
      if (
        !Object.keys(rtcConfig['vendors'] || {}).length &&
        !(rtcConfig['urls'] || []).length
      ) {
        return false;
      }
      const validateErrorReportingUrl = urlObj => {
        const errorUrl = urlObj['errorReportingUrl'];
        if (
          errorUrl &&
          !Services.urlForDoc(this.a4aElement_.element).isSecure(errorUrl)
        ) {
          dev().warn(TAG, `Insecure RTC errorReportingUrl: ${errorUrl}`);
          urlObj['errorReportingUrl'] = undefined;
        }
      };
      (rtcConfig['urls'] || []).forEach(urlObj => {
        if (isObject(urlObj)) {
          validateErrorReportingUrl(urlObj);
        }
      });
      validateErrorReportingUrl(rtcConfig);
    } catch (unusedErr) {
      // This error would be due to the asserts above.
      return false;
    }
    rtcConfig['timeoutMillis'] =
      timeout !== undefined ? timeout : defaultTimeoutMillis;
    this.rtcConfig_ = /** @type {RtcConfigDef} */ (rtcConfig);
    return true;
  }
}
AMP.RealTimeConfigManager = RealTimeConfigManager;
