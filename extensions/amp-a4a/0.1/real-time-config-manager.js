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
import {RTC_VENDORS} from './callout-vendors.js';
import {tryParseJson} from '../../../src/json';
import {dev, user} from '../../../src/log';
import {Services} from '../../../src/services';
import {isArray, isObject} from '../../../src/types';
import {isSecureUrl} from '../../../src/url';

/** @type {string} */
const TAG = 'real-time-config';

/** @type {number} */
const MAX_RTC_CALLOUTS = 5;

/** @type {number} */
const MAX_URL_LENGTH = 16384;

/** @enum {string} */
export const RTC_ERROR_ENUM = {
  // Occurs when response is unparseable as JSON
  MALFORMED_JSON_RESPONSE: 'malformed_json_response',
  // Occurs when a publisher has specified the same url
  // or vendor url (after macros are substituted) to call out to more than once.
  DUPLICATE_URL: 'duplicate_url',
  // Occurs when a URL fails isSecureUrl check.
  INSECURE_URL: 'insecure_url',
  // Occurs when 5 valid callout urls have already been built, and additional
  // urls are still specified.
  MAX_CALLOUTS_EXCEEDED: 'max_callouts_exceeded',
  // Occurs due to XHR failure.
  NETWORK_FAILURE: 'network_failure',
  // Occurs when a specified vendor does not exist in RTC_VENDORS.
  UNKNOWN_VENDOR: 'unknown_vendor',
  // Occurs when request took longer than timeout
  TIMEOUT: 'timeout',
};

/**
 * @param {!Array<!Promise<!rtcResponseDef>>} promiseArray
 * @param {string} error
 * @param {string} callout
 * @private
 */
function logAndAddErrorResponse_(promiseArray, error, callout) {
  dev().warn(TAG, `Dropping RTC Callout to ${callout} due to ${error}`);
  promiseArray.push(buildErrorResponse_(error, callout));
}

/**
 * @param {string} error
 * @param {string} callout
 * @param {number=} opt_rtcTime
 * @return {!Promise<!rtcResponseDef>}
 * @private
 */
function buildErrorResponse_(error, callout, opt_rtcTime) {
  return Promise.resolve(/**@type {rtcResponseDef} */(
    {error, callout, rtcTime: opt_rtcTime || 0}));
}

/**
 * For a given A4A Element, sends out Real Time Config requests to
 * any urls or vendors specified by the publisher.
 * @param {!AMP.BaseElement} a4aElement
 * @param {!Object<string, !../../../src/service/variable-source.SyncResolverDef>} customMacros The ad-network specified macro
 *   substitutions available to use.
 * @return {Promise<!Array<!rtcResponseDef>>|undefined}
 * @visibleForTesting
 */
export function maybeExecuteRealTimeConfig_(a4aElement, customMacros) {
  const rtcConfig = validateRtcConfig_(a4aElement.element);
  if (!rtcConfig) {
    return;
  }
  const promiseArray = [];
  const seenUrls = {};
  const rtcStartTime = Date.now();
  // For each publisher defined URL, inflate the url using the macros,
  // and send the RTC request.
  (rtcConfig['urls'] || []).forEach(url =>
    inflateAndSendRtc_(a4aElement, url, seenUrls, promiseArray,
        rtcStartTime, customMacros,
        rtcConfig['timeoutMillis'])
  );
  // For each vendor the publisher has specified, inflate the vendor
  // url if it exists, and send the RTC request.
  Object.keys(rtcConfig['vendors'] || []).forEach(vendor => {
    const vendorObject = RTC_VENDORS[vendor.toLowerCase()];
    const url = vendorObject ? vendorObject.url : '';
    if (!url) {
      return logAndAddErrorResponse_(promiseArray,
          RTC_ERROR_ENUM.UNKNOWN_VENDOR, vendor);
    }
    const validVendorMacros = {};
    Object.keys(rtcConfig['vendors'][vendor]).forEach(macro => {
      if (vendorObject.macros && vendorObject.macros.includes(macro)) {
        validVendorMacros[macro] = rtcConfig['vendors'][vendor][macro];
      } else {
        user().warn(TAG, `Unknown macro: ${macro} for vendor: ${vendor}`);
      }
    });
    // The ad network defined macros override vendor defined/pub specifed.
    const macros = Object.assign(validVendorMacros, customMacros);
    inflateAndSendRtc_(a4aElement, url, seenUrls, promiseArray, rtcStartTime,
        macros, rtcConfig['timeoutMillis'],
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
 * @param {!Object<string, !../../../src/service/variable-source.SyncResolverDef>} macros
 * @param {number} timeoutMillis
 * @param {string=} opt_vendor
 * @private
 */
function inflateAndSendRtc_(a4aElement, url, seenUrls, promiseArray,
  rtcStartTime, macros, timeoutMillis,
  opt_vendor) {
  const win = a4aElement.win;
  const ampDoc = a4aElement.getAmpDoc();
  if (Object.keys(seenUrls).length == MAX_RTC_CALLOUTS) {
    return logAndAddErrorResponse_(
        promiseArray, RTC_ERROR_ENUM.MAX_CALLOUTS_EXCEEDED,
        opt_vendor || url);
  }
  if (macros && Object.keys(macros).length) {
    const urlReplacements = Services.urlReplacementsForDoc(ampDoc);
    const whitelist = {};
    Object.keys(macros).forEach(key => whitelist[key] = true);
    url = urlReplacements.expandUrlSync(
        url, macros, /** opt_collectVars */undefined, whitelist);
  }
  if (!isSecureUrl(url)) {
    return logAndAddErrorResponse_(promiseArray, RTC_ERROR_ENUM.INSECURE_URL,
        opt_vendor || url);
  }
  if (seenUrls[url]) {
    return logAndAddErrorResponse_(promiseArray, RTC_ERROR_ENUM.DUPLICATE_URL,
        opt_vendor || url);
  }
  seenUrls[url] = true;
  if (url.length > MAX_URL_LENGTH) {
    url = truncUrl_(url);
  }
  promiseArray.push(sendRtcCallout_(
      url, rtcStartTime, win, timeoutMillis, opt_vendor || url));
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
 * @return {!Promise<!rtcResponseDef>}
 * @private
 */
function sendRtcCallout_(
  url, rtcStartTime, win, timeoutMillis, callout) {
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
                RTC_ERROR_ENUM.MALFORMED_JSON_RESPONSE, callout, rtcTime);
        });
      })).catch(error => {
    return buildErrorResponse_(
        // The relevant error message for timeout looks like it is
        // just 'message' but is in fact 'messageXXX' where the
        // X's are hidden special characters. That's why we use
        // match here.
        (error.message && error.message.match(/^timeout/)) ?
          RTC_ERROR_ENUM.TIMEOUT : RTC_ERROR_ENUM.NETWORK_FAILURE,
        callout, Date.now() - rtcStartTime);
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
          } else if (timeout >= defaultTimeoutMillis || timeout < 0) {
            timeout = undefined;
            user().warn(TAG, `Invalid RTC timeout: ${timeout}ms, ` +
                        `using default timeout ${defaultTimeoutMillis}ms`);
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
