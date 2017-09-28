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
  const timeoutMillis = 1000;
  const rtcConfig = validateRtcConfig(element, timeoutMillis);
  if (!rtcConfig) {
    return;
  }
  return Promise.all(inflateAndSendCallouts(ampDoc, rtcConfig, customMacros, win));
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
function validateRtcConfig(element, timeoutMillis) {
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
    if (!Number.isInteger(timeout) || timeout >= timeoutMillis || timeout < 0) {
      timeout = timeoutMillis;
      user().warn(TAG, `Invalid RTC timeout: ${timeout}ms, ` +
                  `using default timeout ${timeoutMillis}ms`);
    }
  }
  rtcConfig['timeoutMillis'] = timeout;
  return rtcConfig;
}

function inflateAndSendCallouts(ampDoc, rtcConfig, customMacros, win) {
  const promiseArray = [];
  const urlToCalloutMap = {};
  maybeInflatePublisherUrls(rtcConfig, urlToCalloutMap, customMacros, ampDoc);
  maybeInflateVendorUrls(rtcConfig, urlToCalloutMap, ampDoc);
  const rtcStartTime = Date.now();
  for (let url in urlToCalloutMap) {
    promiseArray.push(sendRtcCallout_(url, rtcStartTime, win, rtcConfig['timeoutMillis'], urlToCalloutMap[url]));
  }
  return promiseArray;
}

function maybeInflatePublisherUrls(rtcConfig, urlToCalloutMap, customMacros, ampDoc) {
  let url;
  let remaining;
  if (rtcConfig['urls']) {
    for (let i in rtcConfig['urls']) {
      url = rtcConfig['urls'][i];
      maybeInflateAndAddUrl(url, customMacros, ampDoc, urlToCalloutMap);
      if (Object.keys(urlToCalloutMap).length == MAX_RTC_CALLOUTS) {
        logRemaining(rtcConfig['urls'].slice(++i), rtcConfig['vendors'])
        break;
      }
    }
  }
}

function maybeInflateVendorUrls(rtcConfig, urlToCalloutMap, ampDoc) {
  if (rtcConfig['vendors'] && Object.keys(urlToCalloutMap).length < MAX_RTC_CALLOUTS) {
    let vendor;
    let macros;
    const vendors = Object.keys(rtcConfig['vendors']);
    for (let i in vendors) {
      vendor = vendors[i];
      macros = rtcConfig['vendors'][vendor]
      url = RTC_VENDORS[vendor.toLowerCase()];
      if (url) {
        maybeInflateAndAddUrl(url, macros, ampDoc, urlToCalloutMap, vendor);
      }
      if (Object.keys(urlToCalloutMap).length == MAX_RTC_CALLOUTS) {
        log_remaining(vendors.slice(i));
        break;
      }
    }
  }
}

function logRemaining(remaining, opt_vendors) {
  if (opt_vendors) {
    remaining = remaining.concat(Object.keys(opt_vendors));
  }
  if (remaining) {
    remaining = JSON.stringify(remaining);
    dev().warn(TAG, `${MAX_RTC_CALLOUTS} RTC Callout URLS exceeded, ` +
               ` dropping ${remaining}`);
  }
}

/**
 * Substitutes macros into url, and adds the resulting URL to the list
 * of callouts. Checks each URL to see if secure. If a supplied macro
 * does not exist in the url, it is silently ignored.
 */
function maybeInflateAndAddUrl(url, macros, ampDoc, urlToCalloutMap, opt_vendor) {
  const urlReplacements = Services.urlReplacementsForDoc(ampDoc);
  // TODO: change to use whitelist.
  url = urlReplacements.expandSync(url, macros);
  const callout = opt_vendor || url;
  try {
    user().assert(isSecureUrl(url),
                  `Dropping RTC URL: ${url}, not secure`);
    user().assert(!urlToCalloutMap[url],
                  `Dropping duplicate calls to RTC URL: ${url}`)
  } catch (err) {
    return;
  }
  urlToCalloutMap[url] = callout;
}

AMP.realTimeConfigManager = realTimeConfigManager;
