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
<<<<<<< HEAD
import {CONSENT_POLICY_STATE} from '../../../src/consent-state';
import {RTC_VENDORS} from './callout-vendors';
import {Services} from '../../../src/services';
import {dev, user} from '../../../src/log';
import {getMode} from '../../../src/mode';
=======
import {RTC_VENDORS} from './callout-vendors.js';
import {Services} from '../../../src/services';
import {dev, user} from '../../../src/log';
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
import {isArray, isObject} from '../../../src/types';
import {
  isSecureUrl,
  parseUrl,
} from '../../../src/url';
import {tryParseJson} from '../../../src/json';

/** @type {string} */
const TAG = 'real-time-config';

/** @type {number} */
const MAX_RTC_CALLOUTS = 5;

/** @type {number} */
const MAX_URL_LENGTH = 16384;

<<<<<<< HEAD
/** @type {boolean} */
const ERROR_REPORTING_ENABLED = Math.random() < 0.01;

=======
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
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
  // Occurs when URL expansion time exceeded allowed timeout, request never sent.
  MACRO_EXPAND_TIMEOUT: '11',
};

/**
 * @param {string} error
 * @param {string} callout
<<<<<<< HEAD
 * @param {!Window} win
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampDoc
=======
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
 * @param {number=} opt_rtcTime
 * @return {!Promise<!rtcResponseDef>}
 * @private
 */
<<<<<<< HEAD
function buildErrorResponse_(
  error, callout, errorReportingUrl, win, ampDoc, opt_rtcTime) {
  dev().warn(TAG, `RTC callout to ${callout} caused ${error}`);
  if (errorReportingUrl) {
    sendErrorMessage(error, errorReportingUrl, win, ampDoc);
  }
=======
function buildErrorResponse_(error, callout, opt_rtcTime) {
  dev().warn(TAG, `RTC callout to ${callout} caused ${error}`);
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
  return Promise.resolve(/**@type {rtcResponseDef} */(
    {error, callout, rtcTime: opt_rtcTime || 0}));
}

/**
<<<<<<< HEAD
 * @param {string} errorType Uses the RTC_ERROR_ENUM above.
 * @param {string} errorReportingUrl
 * @param {!Window} win
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampDoc
 */
export function sendErrorMessage(errorType, errorReportingUrl, win, ampDoc) {
  if (ERROR_REPORTING_ENABLED || getMode(win).localDev || getMode(win).test) {
    if (!isSecureUrl(errorReportingUrl)) {
      dev().warn(TAG, `Insecure RTC errorReportingUrl: ${errorReportingUrl}`);
      return;
    }
    const whitelist = {ERROR_TYPE: true, HREF: true};
    const macros = {
      ERROR_TYPE: errorType,
      HREF: win.location.href,
    };
    const url = Services.urlReplacementsForDoc(ampDoc).expandUrlSync(
        errorReportingUrl, macros, whitelist);
    new win.Image().src = url;
  }
}

/**
=======
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
 * Converts a URL into its corresponding shortened callout string.
 * We also truncate to a maximum length of 50 characters.
 * For instance, if we are passed
 * "https://example.com/example.php?foo=a&bar=b, then we return
 * example.com/example.php
 * @param {string} url
 * @return {string}
 * @visibleForTesting
 */
export function getCalloutParam_(url) {
  const parsedUrl = parseUrl(url);
  return (parsedUrl.hostname + parsedUrl.pathname).substr(0, 50);
}

/**
 * For a given A4A Element, sends out Real Time Config requests to
 * any urls or vendors specified by the publisher.
 * @param {!AMP.BaseElement} a4aElement
 * @param {!Object<string, !../../../src/service/variable-source.AsyncResolverDef>} customMacros The ad-network specified macro
 *   substitutions available to use.
<<<<<<< HEAD
 * @param {?CONSENT_POLICY_STATE} consentState
 * @return {Promise<!Array<!rtcResponseDef>>|undefined}
 * @visibleForTesting
 */
export function maybeExecuteRealTimeConfig_(
  a4aElement, customMacros, consentState) {
  // TODO(keithwrightbos) - allow pub to override such that some callouts are
  // still allowed.
  if (consentState == CONSENT_POLICY_STATE.INSUFFICIENT ||
      consentState == CONSENT_POLICY_STATE.UNKNOWN) {
    return;
  }
=======
 * @return {Promise<!Array<!rtcResponseDef>>|undefined}
 * @visibleForTesting
 */
export function maybeExecuteRealTimeConfig_(a4aElement, customMacros) {
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
  const rtcConfig = validateRtcConfig_(a4aElement.element);
  if (!rtcConfig) {
    return;
  }
  customMacros['TIMEOUT'] = () => rtcConfig['timeoutMillis'];
  const promiseArray = [];
  const seenUrls = {};
  const rtcStartTime = Date.now();
  // For each publisher defined URL, inflate the url using the macros,
  // and send the RTC request.
<<<<<<< HEAD
  (rtcConfig['urls'] || []).forEach(urlObj => {
    let url, errorReportingUrl;
    if (isObject(urlObj)) {
      url = urlObj['url'];
      errorReportingUrl = urlObj['errorReportingUrl'];
    } else if (typeof urlObj == 'string') {
      url = urlObj;
    } else {
      dev().warn(TAG, `Invalid url: ${urlObj}`);
    }
    inflateAndSendRtc_(a4aElement, url, seenUrls, promiseArray,
        rtcStartTime, customMacros,
        rtcConfig['timeoutMillis'], errorReportingUrl);
  });
=======
  (rtcConfig['urls'] || []).forEach(url =>
    inflateAndSendRtc_(a4aElement, url, seenUrls, promiseArray,
        rtcStartTime, customMacros,
        rtcConfig['timeoutMillis'])
  );
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
  // For each vendor the publisher has specified, inflate the vendor
  // url if it exists, and send the RTC request.
  Object.keys(rtcConfig['vendors'] || []).forEach(vendor => {
    const vendorObject = RTC_VENDORS[vendor.toLowerCase()];
    const url = vendorObject ? vendorObject.url : '';
<<<<<<< HEAD
    const errorReportingUrl = vendorObject ?
      vendorObject['errorReportingUrl'] : '';
    if (!url) {
      return promiseArray.push(
          buildErrorResponse_(
              RTC_ERROR_ENUM.UNKNOWN_VENDOR, vendor, errorReportingUrl,
              a4aElement.win, a4aElement.getAmpDoc()));
=======
    if (!url) {
      return promiseArray.push(
          buildErrorResponse_(
              RTC_ERROR_ENUM.UNKNOWN_VENDOR, vendor));
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
    }
    const validVendorMacros = {};
    Object.keys(rtcConfig['vendors'][vendor]).forEach(macro => {
      if (vendorObject.macros && vendorObject.macros.includes(macro)) {
        const value = rtcConfig['vendors'][vendor][macro];
        validVendorMacros[macro] = isObject(value) || isArray(value) ?
          JSON.stringify(value) : value;
      } else {
        user().warn(TAG, `Unknown macro: ${macro} for vendor: ${vendor}`);
      }
    });
    // The ad network defined macros override vendor defined/pub specifed.
    const macros = Object.assign(validVendorMacros, customMacros);
    inflateAndSendRtc_(a4aElement, url, seenUrls, promiseArray, rtcStartTime,
<<<<<<< HEAD
        macros, rtcConfig['timeoutMillis'], errorReportingUrl,
=======
        macros, rtcConfig['timeoutMillis'],
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
        vendor.toLowerCase());
  });
  return Promise.all(promiseArray);
}

/**
 * @param {!AMP.BaseElement} a4aElement
 * @param {string} url
 * @param {!Object<string, boolean>} seenUrls
 * @param {!Array<!Promise<!rtcResponseDef>>} promiseArray
 * @param {number} rtcStartTime
 * @param {!Object<string, !../../../src/service/variable-source.AsyncResolverDef>} macros
 * @param {number} timeoutMillis
<<<<<<< HEAD
 * @param {string} errorReportingUrl
=======
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
 * @param {string=} opt_vendor
 * @private
 */
export function inflateAndSendRtc_(a4aElement, url, seenUrls, promiseArray,
<<<<<<< HEAD
  rtcStartTime, macros, timeoutMillis, errorReportingUrl, opt_vendor) {
=======
  rtcStartTime, macros, timeoutMillis, opt_vendor) {
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
  const win = a4aElement.win;
  const ampDoc = a4aElement.getAmpDoc();
  const callout = opt_vendor || getCalloutParam_(url);
  /**
   * The time that it takes to substitute the macros into the URL can vary
   * depending on what the url requires to be substituted, i.e. a long
   * async call. Thus, however long the URL replacement took is treated as a
   * time penalty.
   */
  const send = url => {
    if (Object.keys(seenUrls).length == MAX_RTC_CALLOUTS) {
      return buildErrorResponse_(
          RTC_ERROR_ENUM.MAX_CALLOUTS_EXCEEDED,
<<<<<<< HEAD
          callout, errorReportingUrl, win, ampDoc);
    }
    if (!isSecureUrl(url)) {
      return buildErrorResponse_(RTC_ERROR_ENUM.INSECURE_URL,
          callout, errorReportingUrl, win, ampDoc);
    }
    if (seenUrls[url]) {
      return buildErrorResponse_(RTC_ERROR_ENUM.DUPLICATE_URL,
          callout, errorReportingUrl, win, ampDoc);
=======
          callout);
    }
    if (!isSecureUrl(url)) {
      return buildErrorResponse_(RTC_ERROR_ENUM.INSECURE_URL,
          callout);
    }
    if (seenUrls[url]) {
      return buildErrorResponse_(RTC_ERROR_ENUM.DUPLICATE_URL,
          callout);
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
    }
    seenUrls[url] = true;
    if (url.length > MAX_URL_LENGTH) {
      url = truncUrl_(url);
    }
    return sendRtcCallout_(
<<<<<<< HEAD
        url, rtcStartTime, win, timeoutMillis,
        callout, errorReportingUrl, ampDoc);
=======
        url, rtcStartTime, win, timeoutMillis, callout);
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
  };

  const urlReplacements = Services.urlReplacementsForDoc(ampDoc);
  const whitelist = {};
  Object.keys(macros).forEach(key => whitelist[key] = true);
  const urlReplacementStartTime = Date.now();
  promiseArray.push(Services.timerFor(win).timeoutPromise(
      timeoutMillis,
      urlReplacements.expandUrlAsync(url, macros, whitelist)).then(url => {
    timeoutMillis -= (urlReplacementStartTime - Date.now());
    return send(url);
  }).catch(unused => {
    return buildErrorResponse_(RTC_ERROR_ENUM.MACRO_EXPAND_TIMEOUT,
<<<<<<< HEAD
        callout, errorReportingUrl, win, ampDoc);
=======
        callout);
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
  }));
}

/**
 * @param {string} url
 * @return {string}
 * @visibleForTesting
 */
export function truncUrl_(url) {
  url = url.substr(0, MAX_URL_LENGTH - 12).replace(/%\w?$/, '');
  return url + '&__trunc__=1';
}

/**
 * @param {string} url
 * @param {number} rtcStartTime
 * @param {!Window} win
 * @param {number} timeoutMillis
 * @param {string} callout
<<<<<<< HEAD
 * @param {string} errorReportingUrl
=======
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
 * @return {!Promise<!rtcResponseDef>}
 * @private
 */
function sendRtcCallout_(
<<<<<<< HEAD
  url, rtcStartTime, win, timeoutMillis, callout, errorReportingUrl, ampDoc) {
=======
  url, rtcStartTime, win, timeoutMillis, callout) {
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
  /**
   * Note: Timeout is enforced by timerFor, not the value of
   *   rtcTime. There are situations where rtcTime could thus
   *   end up being greater than timeoutMillis.
   */
  return Services.timerFor(win).timeoutPromise(
      timeoutMillis,
      Services.xhrFor(win).fetchJson(
          // NOTE(bradfrizzell): we could include ampCors:false allowing
          // the request to be cached across sites but for now assume that
          // is not a required feature.
          url, {credentials: 'include'}).then(res => {
        return res.text().then(text => {
          const rtcTime = Date.now() - rtcStartTime;
          // An empty text response is allowed, not an error.
          if (!text) {
            return {rtcTime, callout};
          }
          const response = tryParseJson(text);
          return response ? {response, rtcTime, callout} :
            buildErrorResponse_(
<<<<<<< HEAD
                RTC_ERROR_ENUM.MALFORMED_JSON_RESPONSE, callout,
                errorReportingUrl, win, ampDoc, rtcTime);
=======
                RTC_ERROR_ENUM.MALFORMED_JSON_RESPONSE, callout, rtcTime);
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
        });
      })).catch(error => {
    return buildErrorResponse_(
        // The relevant error message for timeout looks like it is
        // just 'message' but is in fact 'messageXXX' where the
        // X's are hidden special characters. That's why we use
        // match here.
        (error.message && error.message.match(/^timeout/)) ?
          RTC_ERROR_ENUM.TIMEOUT : RTC_ERROR_ENUM.NETWORK_FAILURE,
<<<<<<< HEAD
        callout, errorReportingUrl, win, ampDoc, Date.now() - rtcStartTime);
=======
        callout, Date.now() - rtcStartTime);
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
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
 * @return {?Object}
 * @visibleForTesting
 */
export function validateRtcConfig_(element) {
  const defaultTimeoutMillis = 1000;
  const unparsedRtcConfig = element.getAttribute('rtc-config');
  if (!unparsedRtcConfig) {
    return null;
  }
  const rtcConfig = tryParseJson(unparsedRtcConfig);
  if (!rtcConfig) {
    user().warn(TAG, 'Could not parse rtc-config attribute');
    return null;
  }
  let timeout;
  try {
    user().assert(rtcConfig['vendors'] || rtcConfig['urls'],
        'RTC Config must specify vendors or urls');
    Object.keys(rtcConfig).forEach(key => {
      switch (key) {
        case 'vendors':
          user().assert(isObject(rtcConfig[key]), 'RTC invalid vendors');
          break;
        case 'urls':
          user().assert(isArray(rtcConfig[key]), 'RTC invalid urls');
          break;
        case 'timeoutMillis':
          timeout = parseInt(rtcConfig[key], 10);
          if (isNaN(timeout)) {
            user().warn(TAG, 'Invalid RTC timeout is NaN, ' +
                        `using default timeout ${defaultTimeoutMillis}ms`);
            timeout = undefined;
          } else if (timeout >= defaultTimeoutMillis || timeout < 0) {
            user().warn(TAG, `Invalid RTC timeout: ${timeout}ms, ` +
                        `using default timeout ${defaultTimeoutMillis}ms`);
            timeout = undefined;
          }
          break;
        default:
          user().warn(TAG, `Unknown RTC Config key: ${key}`);
          break;
      }
    });
    if (!Object.keys(rtcConfig['vendors'] || {}).length
       && !(rtcConfig['urls'] || []).length) {
      return null;
    }
  } catch (unusedErr) {
    // This error would be due to the asserts above.
    return null;
  }
  rtcConfig['timeoutMillis'] = timeout !== undefined ?
    timeout : defaultTimeoutMillis;
  return rtcConfig;
}

AMP.maybeExecuteRealTimeConfig = maybeExecuteRealTimeConfig_;
