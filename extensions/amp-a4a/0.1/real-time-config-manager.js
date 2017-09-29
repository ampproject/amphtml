import {RTC_VENDORS} from './callout-vendors.js';
import {tryParseJson} from '../../../src/json';
import {dev, user} from '../../../src/log';
import {Services} from '../../../src/services';
import {isArray, isObject} from '../../../src/types';
import {isSecureUrl} from '../../../src/url';

/** @type {string} */
const TAG = 'real-time-config';

/** @type {number} */
export const MAX_RTC_CALLOUTS = 5;

/** @enum {string} */
export const RTC_ERROR_ENUM = {
  BAD_JSON_RESPONSE: 'bad_json_response',
  DUPLICATE_URL: 'duplicate_url',
  INSECURE_URL: 'insecure_url',
  MAX_CALLOUTS_EXCEEDED: 'max_callouts_exceeded',
  NETWORK_FAILURE: 'network_failure',
  UNKNOWN_VENDOR: 'unknown_vendor',
};

/**
 * @param {!Array<Promise>} promiseArray
 * @param {!string} error
 * @param {!string} callout
 * @return
 */
function logAndAddErrorResponse(promiseArray, error, callout) {
  dev().warn(TAG, `Dropping RTC Callout to ${callout} due to ${error}`);
  promiseArray.push(buildErrorResponse(error, callout));
}

/**
 * @param {!string} error
 * @param {!string} callout
 * @param {number=} opt_rtcTime
 * @return
 */
function buildErrorResponse(error, callout, opt_rtcTime) {
  return {error, callout, rtcTime: opt_rtcTime || 0};
}

/**
 * For a given A4A Element, sends out Real Time Config requests to
 * any urls or vendors specified by the publisher.
 * @param {!AMP.BaseElement} a4aElement
 * @param {!Object} customMacros The ad-network specified macro
 *   substitutions available to use.
 * @return
 */
function maybeExecuteRealTimeConfig(a4aElement, customMacros) {
  const rtcConfig = validateRtcConfig(a4aElement.element);
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
    const url = RTC_VENDORS[vendor.toLowerCase()];
    if (!url) {
      return logAndAddErrorResponse(promiseArray,
                                    RTC_ERROR_ENUM.UNKNOWN_VENDOR, vendor);
    }
    // The ad network defined macros override vendor defined/pub specifed.
    const macros = Object.assign(rtcConfig['vendors'][vendor], customMacros);
    inflateAndSendRtc_(a4aElement, url, seenUrls, promiseArray, rtcStartTime,
        macros, rtcConfig['timeoutMillis'],
        vendor);
  });
  return Promise.all(promiseArray);
}

/**
 * @param {!AMP.BaseElement} a4aElement
 * @param {!string} url
 * @param {!Object<string, boolean>} seenUrls
 * @param {!Array<Promise>} promiseArray
 * @param {!number} rtcStartTime
 * @param {!Object} macros
 * @param {!number} timeoutMillis
 * @param {string=} opt_vendor
 * @return
 */
function inflateAndSendRtc_(a4aElement, url, seenUrls, promiseArray,
                            rtcStartTime, macros, timeoutMillis,
                            opt_vendor) {
  const win = a4aElement.win;
  const ampDoc = a4aElement.getAmpDoc();
  if (seenUrls.length == MAX_RTC_CALLOUTS) {
    return logAndAddErrorResponse(
        promiseArray, RTC_ERROR_ENUM.MAX_CALLOUTS_EXCEEDED,
        opt_vendor || url);
  }
  const urlReplacements = Services.urlReplacementsForDoc(ampDoc);
  const whitelist = {};
  Object.keys(macros || {}).forEach(key => whitelist[key] = true);
  url = urlReplacements.expandSync(
      url, macros, undefined, whitelist);
  if (!isSecureUrl(url)) {
    return logAndAddErrorResponse(promiseArray, RTC_ERROR_ENUM.INSECURE_URL,
        opt_vendor || url);
  }
  if (!!seenUrls[url]) {
    return logAndAddErrorResponse(promiseArray, RTC_ERROR_ENUM.DUPLICATE_URL,
        opt_vendor || url);
  }
  seenUrls[url] = true;
  promiseArray.push(sendRtcCallout_(
      url, rtcStartTime, win, timeoutMillis, opt_vendor || url));
}

/**
 * @param {!string} url
 * @param {!number} rtcStartTime
 * @param {!Window} win
 * @param {!number} timeoutMillis
 * @param {!string} callout
 */
function sendRtcCallout_(url, rtcStartTime, win, timeoutMillis, callout) {
  /**
   * Note: Timeout is enforced by timerFor, not the value of
   *   rtcTime. There are situations where rtcTime could thus
   *   end up being greater than timeoutMillis.
   */
  let rtcTime;
  return Services.timerFor(win).timeoutPromise(
      timeoutMillis,
      Services.xhrFor(win).fetchJson(
          url, {credentials: 'include'}).then(res => {
            return res.text().then(text => {
              rtcTime = Date.now() - rtcStartTime;
              // An empty text response is allowed, not an error.
              if (!text) {
                return {rtcTime, callout};
              }
              const rtcResponse = tryParseJson(text);
              return rtcResponse ? {rtcResponse, rtcTime, callout} :
              {rtcTime, callout, error: 'Unparsable JSON'};
            }).catch(unusedError => {
              return buildErrorResponse(RTC_ERROR_ENUM.BAD_JSON_RESPONSE,
                  callout, Date.now() - rtcStartTime);
            });
          })).catch(unusedError => {
            return buildErrorResponse(RTC_ERROR_ENUM.NETWORK_FAILURE,
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
 * @return {!boolean|Object}
 */
function validateRtcConfig(element) {
  const defaultTimeoutMillis = 1000;
  const rtcConfig = tryParseJson(
      element.getAttribute('prerequest-callouts'));
  if (!rtcConfig) {
    return false;
  }
  try {
    user().assert(rtcConfig['vendors'] || rtcConfig['urls'],
        'RTC Config must specify vendors or urls');
    user().assert(!rtcConfig['vendors'] || isObject(rtcConfig['vendors']),
        'RTC invalid vendors');
    user().assert(!rtcConfig['urls'] || isArray(rtcConfig['urls']),
        'RTC invalid urls');
  } catch (unusedErr) {
    return false;
  }
  let timeout = parseInt(rtcConfig['timeoutMillis'], 10);
  if (timeout) {
    if (timeout >= defaultTimeoutMillis || timeout < 0) {
      timeout = undefined;
      user().warn(TAG, `Invalid RTC timeout: ${timeout}ms, ` +
                  `using default timeout ${defaultTimeoutMillis}ms`);
    }
  }
  rtcConfig['timeoutMillis'] = timeout || defaultTimeoutMillis;
  return rtcConfig;
}

AMP.maybeExecuteRealTimeConfig = maybeExecuteRealTimeConfig;
