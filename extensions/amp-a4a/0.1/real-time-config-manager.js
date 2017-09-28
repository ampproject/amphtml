import {RTC_VENDORS} from './callout-vendors.js';
import {tryParseJson} from '../../../src/json';
import {dev, user} from '../../../src/log';
import {Services} from '../../../src/services';
import {isArray, isObject} from '../../../src/types';
import {isSecureUrl, parseUrl} from '../../../src/url';

/** @type {string} */
const TAG = 'real-time-config';

/** @type {number} */
export const MAX_RTC_CALLOUTS = 5;

function realTimeConfigManager(element, win, ampDoc, customMacros) {
  const rtcConfig = validateRtcConfig(element);
  if (!rtcConfig) {
    return;
  }
  const promiseArray = [];
  const urlToCalloutMap = {};
  const seenUrls = [];
  const rtcStartTime = Date.now();
  (rtcConfig['urls'] || []).forEach(url => {
    inflateAndSendRtc_(element, url, seenUrls, promiseArray,
                       rtcStartTime, customMacros, win, ampDoc,
                       rtcConfig['timeoutMillis']);
  });
  Object.keys(rtcConfig['vendors'] || []).forEach(vendor => {
    const url = RTC_VENDORS[vendor.toLowerCase()];
    if (!url) {
      user().warn(TAG, `unknown vendor ${vendor}`);
      return;
    }
    const macros = rtcConfig['vendors'][vendor];
    inflateAndSendRtc_(element, url, seenUrls, promiseArray, rtcStartTime,
                       macros, win, ampDoc, rtcConfig['timeoutMillis'],
                       vendor);
  });
  return Promise.all(promiseArray);
}

function inflateAndSendRtc_(element, url, seenUrls, promiseArray, rtcStartTime,
                            macros, win, ampDoc, timeoutMillis, opt_vendor) {
  if(promiseArray.length == MAX_RTC_CALLOUTS) {
    dev().warn(TAG, `${MAX_RTC_CALLOUTS} RTC Callout URLS exceeded, ` +
               ` dropping ${url}`);
    return;
  }
  const urlReplacements = Services.urlReplacementsForDoc(ampDoc);
  // TODO: change to use whitelist.
  url = urlReplacements.expandSync(url, macros);
  const callout = opt_vendor || url;
  try {
    user().assert(isSecureUrl(url),
                  `Dropping RTC URL: ${url}, not secure`);
    user().assert(!seenUrls.includes(url),
                  `Dropping duplicate calls to RTC URL: ${url}`)
  } catch (err) {
    return;
  }
  seenUrls.push(url);
  promiseArray.push(sendRtcCallout_(url, rtcStartTime, win, timeoutMillis, callout));
}

function sendRtcCallout_(url, rtcStartTime, win, timeoutMillis, callout) {
  /**
   * Note: Timeout is enforced by timerFor, not the value of
   *   rtcTime. There are situations where rtcTime could thus
   *   end up being greater than timeoutMillis.
   */
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
 * @return {!boolean}
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
  } catch (err) {
    return false;
  }
  let timeout = rtcConfig['timeoutMillis'];
  if (timeout) {
    if (!Number.isInteger(timeout) || timeout >= defaultTimeoutMillis || timeout < 0) {
      timeout = defaultTimeoutMillis;
      user().warn(TAG, `Invalid RTC timeout: ${timeout}ms, ` +
                  `using default timeout ${timeoutMillis}ms`);
    }
  }
  rtcConfig['timeoutMillis'] = timeout;
  return rtcConfig;
}

AMP.realTimeConfigManager = realTimeConfigManager;
