import {RTC_VENDORS} from './callout-vendors.js';
import {tryParseJson} from '../../../src/json';
import {dev} from '../../../src/log';
import {Services} from '../../../src/services';
import {isArray, isObject} from '../../../src/types';
import {isSecureUrl, parseUrl} from '../../../src/url';

/** Timeout in millis */
const DEFAULT_RTC_TIMEOUT = 1000;

/** @type {string} */
const TAG = 'real-time-config';

/** @type {number} */
const MAX_RTC_CALLOUTS = 5;

export class RealTimeConfigManager {
  constructor(element, win, ampDoc) {
    this.element = element;
    this.win = win;
    this.rtcConfig = null;
    this.calloutUrls = [];
    this.urlReplacements_ = Services.urlReplacementsForDoc(ampDoc);
  }

  executeRealTimeConfig(customMacros) {
    if (!this.rtcConfig) {
      return null;
    }
    const rtcTimeout = this.rtcConfig.timeoutMillis || DEFAULT_RTC_TIMEOUT;
    this.inflatePublisherUrls(customMacros);
    this.inflateVendorUrls();
    if (this.calloutUrls.length == 0) {
      return Promise.resolve();
    }
    let rtcTime;
    return Promise.all(this.calloutUrls.map(url => {
      const rtcStartTime = Date.now();
      /** ISSUE: For very short timeouts, and/or for slow devices, the calculated time
       * that RTC took (rtcTime below) can be longer than the timeout without getting timed-out,
       * due to the time it takes to set up the timeout promise.
       * EXAMPLE, let rtcTimeout = 100ms.
       * Time = 0: const rtcStartTime = 0
       * Time = 10: call Services.timerFor.timeoutPromise
       * Time = 25: timeout promise starts the xhr callout, timeout promise sees start time as 25
       * Time = 120: xhr callout returns, timeoutPromise sees total time as 95ms, so no timeout
       * Time = 125: rtcTime = 125ms, which is greater than the publisher specified timeout.
       */
      return Services.timerFor(this.win).timeoutPromise(
          rtcTimeout,
          Services.xhrFor(this.win).fetchJson(
              url, {credentials: 'include'}).then(res => {
                // Non-200 status codes are forbidden for RTC.
                // TODO: Add to fetchResponse the ability to
                // check for redirects as well.
                if (res.status != 200) {
                  rtcTime = Date.now() - rtcStartTime;
                  return {rtcTime, error: 'Non-200 Status', hostname};
                }
                return res.text().then(text => {
                  rtcTime = Date.now() - rtcStartTime;
                  const hostname = parseUrl(url).hostname;
                  // An empty text response is fine, just means
                  // we have nothing to merge.
                  if (!text) {
                    return {rtcTime, hostname};
                  }
                  const rtcResponse = tryParseJson(text);
                  return rtcResponse ? {rtcResponse, rtcTime, hostname} :
                  {rtcTime, hostname, error: 'Unparsable JSON'};
                });
              })).catch(err => {
                const hostname = parseUrl(url).hostname;
                const rtcTime = Date.now() - rtcStartTime;
                return {error: err, rtcTime, hostname};
              });
    }));
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
  validateRtcConfig() {
    let rtcConfig = tryParseJson(
        this.element.getAttribute('prerequest-callouts'));
    if (!rtcConfig) {
      return false;
    }
    if (!((rtcConfig['vendors'] && isObject(rtcConfig['vendors']) &&
           Object.keys(rtcConfig['vendors']).length) ||
          (rtcConfig['urls'] && isArray(rtcConfig['urls']) &&
           rtcConfig['urls'].length))) {
      return false;
    }
    if (rtcConfig['timeoutMillis'] &&
        !Number.isInteger(rtcConfig['timeoutMillis'])) {
      const timeout = Number(rtcConfig['timeoutMillis']);
      rtcConfig['timeoutMillis'] = timeout || DEFAULT_RTC_TIMEOUT;
    }
    this.rtcConfig = rtcConfig;
    return true;
  }

  /**
   * For every vendor specified by the publisher in the rtcConfig,
   * check that the vendor URL actually exists, and if so call
   * helper function to inflate URL and add to list of callouts.
   */
  inflateVendorUrls() {
    let url;
    if (this.rtcConfig['vendors']) {
      let vendor;
      for (vendor in this.rtcConfig['vendors']) {
        if (this.calloutUrls.length >= MAX_RTC_CALLOUTS) {
          return;
        }
        url = RTC_VENDORS[vendor];
        if (!url) {
          dev().error(TAG, `Vendor ${vendor} invalid`);
          continue;
        }
        this.maybeInflateAndAddUrl(url, this.rtcConfig['vendors'][vendor]);
      }
    }
  }

  /**
   * For each publisher-defined URL, call helper function to inflate and
   * add the URLs to list of callouts.
   * @param {!Object<string, string>} macros A mapping of macro to value for
   *   substitution in a publisher-defined url. E.g. {'SLOT_ID': '1'}.
   */
  inflatePublisherUrls(macros) {
    if (this.rtcConfig['urls']) {
      this.rtcConfig['urls'].forEach(url => {
        if (this.calloutUrls.length >= MAX_RTC_CALLOUTS) {
          return;
        }
        this.maybeInflateAndAddUrl(url, macros);
      });
    }
  }

  /**
   * Substitutes macros into url, and adds the resulting URL to the list
   * of callouts. Checks each URL to see if secure. If a supplied macro
   * does not exist in the url, it is silently ignored.
   * @param {!string} url
   * @param {!Object<string, string>} macros A mapping of macro to value for
   *   substitution. I.e. if url = 'https://www.foo.com/slot=SLOT_ID' then
   *   the macro object may look like {'SLOT_ID': '1'}.
   */
  maybeInflateAndAddUrl(url, macros) {
    url = this.urlReplacements_.expandSync(url, macros);
    if (isSecureUrl(url)) {
      this.calloutUrls.push(url);
    }
  }
}

AMP.RealTimeConfigManager = RealTimeConfigManager;
