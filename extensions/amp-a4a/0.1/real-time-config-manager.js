import {RTC_VENDORS} from './callout-vendors.js';
import {tryParseJson} from '../../../src/json';
import {dev, user} from '../../../src/log';
import {Services} from '../../../src/services';
import {isArray, isObject} from '../../../src/types';
import {isSecureUrl, parseUrl} from '../../../src/url';

/** Timeout in millis */
const DEFAULT_RTC_TIMEOUT = 1000;

/** @type {string} */
const TAG = 'real-time-config';

/** @type {number} */
export const MAX_RTC_CALLOUTS = 5;

export class RealTimeConfigManager {
  constructor(element, win, ampDoc, customMacros) {
    this.element = element;
    this.win = win;
    this.rtcConfig = null;
    this.calloutUrls = [];
    this.urlReplacements_ = Services.urlReplacementsForDoc(ampDoc);
    this.validateRtcConfig();
    if (!this.rtcConfig) {
      return;
    }
    this.inflatePublisherUrls(customMacros);
    this.inflateVendorUrls();
  }

  executeRealTimeConfig() {
    if (!this.rtcConfig || this.calloutUrls.length == 0) {
      return Promise.resolve();
    }
    const rtcStartTime = Date.now();
    return Promise.all(this.calloutUrls.map(url => {
      return this.sendRtcCallout_(url, rtcStartTime);
    }));
  }

  sendRtcCallout_(url, rtcStartTime, key) {
    const rtcTimeout = this.rtcConfig.timeoutMillis || DEFAULT_RTC_TIMEOUT;
    return Services.timerFor(this.win).timeoutPromise(
        rtcTimeout,
        Services.xhrFor(this.win).fetchJson(
            // Need to keep reference to vendor names in here, have to change how this works
            url, {credentials: 'include'}).then(res => {
              // Non-200 status codes are forbidden for RTC.
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
    const rtcConfig = tryParseJson(
        this.element.getAttribute('prerequest-callouts'));
    try {
      user().assert(rtcConfig, 'RTC Config is undefined');
      user().assert(rtcConfig['vendors'] || rtcConfig['urls'],
                  'RTC Config must specify vendors or urls');
      user().assert(!rtcConfig['vendors'] || isObject(rtcConfig['vendors']),
                  'RTC invalid vendors');
      user().assert(!rtcConfig['urls'] || isArray(rtcConfig['urls']),
                  'RTC invalid urls');
    } catch (err) {
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
