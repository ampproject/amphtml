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

/**
 * For a given A4A Element, sends out Real Time Config requests to
 * any urls or vendors specified by the publisher.
 * @param {!AMP.BaseElement} a4aElement
 * @param {!Object} customMacros The ad-network specified macro
 *   substitutions available to use.
 */
function realTimeConfigManager(a4aElement, customMacros) {
  const rtcConfig = validateRtcConfig(a4aElement.element);
  if (!rtcConfig) {
    return;
  }
  const promiseArray = [];
  const seenUrls = {};
  const rtcStartTime = Date.now();
  // For each publisher defined URL, inflate the url using the macros,
  // and send the RTC request.
  (rtcConfig['urls'] || []).forEach(url => {
    inflateAndSendRtc_(a4aElement, url, seenUrls, promiseArray,
        rtcStartTime, customMacros,
        rtcConfig['timeoutMillis']);
  });
  // For each vendor the publisher has specified, inflate the vendor
  // url if it exists, and send the RTC request.
  Object.keys(rtcConfig['vendors'] || []).forEach(vendor => {
    const url = RTC_VENDORS[vendor.toLowerCase()];
    if (!url) {
      user().warn(TAG, `unknown vendor ${vendor}`);
      return;
    }
    const macros = rtcConfig['vendors'][vendor];
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
 */
function inflateAndSendRtc_(a4aElement, url, seenUrls, promiseArray,
                            rtcStartTime, macros, timeoutMillis,
                            opt_vendor) {
  const win = a4aElement.win;
  const ampDoc = a4aElement.getAmpDoc();
  if (promiseArray.length == MAX_RTC_CALLOUTS) {
    dev().warn(TAG, `${MAX_RTC_CALLOUTS} RTC Callout URLS exceeded, ` +
               `dropping ${url}`);
    return;
  }
  const urlReplacements = Services.urlReplacementsForDoc(ampDoc);
  // TODO: change to use whitelist.
  url = urlReplacements.expandSync(url, macros);
  try {
    user().assert(isSecureUrl(url),
        `Dropping RTC URL: ${url}, not secure`);
    user().assert(!seenUrls[url],
        `Dropping duplicate calls to RTC URL: ${url}`);
  } catch (unusedErr) {
    return;
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
            });
          })).catch(error => {
            return {error, rtcTime: Date.now() - rtcStartTime, callout};
          });
}

/**
 * Attempts to parse the publisher-defined RTC config off the amp-ad
 * element, then validates that the rtcConfig exists, and contains
 * an entry for either vendor URLs, or publisher-defined URLs. If the
 * config contains an entry for timeoutMillis, validates that it is a
 * number, or converts to a number if number-like, otherwise overwrites
 * with the default.
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

AMP.realTimeConfigManager = realTimeConfigManager;
