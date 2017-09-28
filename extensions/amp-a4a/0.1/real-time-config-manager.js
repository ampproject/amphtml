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
  const urlObjects = [];
  addPublisherUrlsToArray(customMacros, urlObjects, rtcConfig);
  addVendorUrlsToArray(urlObjects, rtcConfig);
  const callouts = inflateAndAddUrls(ampDoc, urlObjects);
  return executeRealTimeConfig(callouts, win, rtcConfig['timeoutMillis']);
}

function executeRealTimeConfig(callouts, win, timeoutMillis) {
  if (!callouts.length) {
    return Promise.resolve();
  }
  const rtcStartTime = Date.now();
  return Promise.all(callouts.map(urlObject => {
    return sendRtcCallout_(urlObject.url, rtcStartTime, win, timeoutMillis, urlObject.vendor);
  }));
}

function sendRtcCallout_(url, rtcStartTime, win, timeoutMillis, opt_vendor) {
  let callout = opt_vendor || url;
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

function addVendorUrlsToArray(urlObjects, rtcConfig) {
  if (!rtcConfig['vendors']) {
    return;
  }
  let url;
  Object.keys(rtcConfig['vendors']).forEach(vendor => {
    url = RTC_VENDORS[vendor.toLowerCase()];
    if (url) {
      urlObjects.push({url, macros: rtcConfig['vendors'][vendor], vendor});
    }
  });
}

function addPublisherUrlsToArray(macros, urlObjects, rtcConfig) {
  if (!rtcConfig['urls']) {
    return;
  }
  rtcConfig['urls'].forEach(url => {
    urlObjects.push({url, macros});
  });
}

function inflateAndAddUrls(ampDoc, urlObjects) {
  const callouts = [];
  for (i in urlObjects) {
    if (callouts.length == MAX_RTC_CALLOUTS) {
      let remaining = JSON.stringify(
          urlObjects.slice(i).map(urlObject => urlObject.url));
      dev().warn(TAG, `${MAX_RTC_CALLOUTS} RTC Callout URLS exceeded, ` +
                 ` dropping ${remaining}`);
      break;
    }
    maybeInflateAndAddUrl(urlObjects[i], ampDoc, callouts);
  }
  return callouts;
}

/**
 * Substitutes macros into url, and adds the resulting URL to the list
 * of callouts. Checks each URL to see if secure. If a supplied macro
 * does not exist in the url, it is silently ignored.
 */
function maybeInflateAndAddUrl(urlObject, ampDoc, callouts) {
  const urlReplacements = Services.urlReplacementsForDoc(ampDoc);
  const url = urlReplacements.expandSync(urlObject.url, macros);
  const macros = urlObject.macros;
  const vendor = urlObject.vendor || url;
  try {
    user().assert(isSecureUrl(url),
                  `Dropping RTC URL: ${url}, not secure`);
    user().assert(!callouts.includes(url),
                  `Dropping duplicate calls to RTC URL: ${url}`)
  } catch (err) {
    return;
  }
  callouts.push({url, vendor});
}

AMP.realTimeConfigManager = realTimeConfigManager;
