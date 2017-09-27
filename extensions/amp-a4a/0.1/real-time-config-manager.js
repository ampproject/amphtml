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

export class RealTimeConfigManager {
  constructor(element, win, ampDoc, customMacros) {
    this.element = element;
    this.win = win;
    this.rtcConfig = null;
    this.callouts = [];
    this.urlObjects = [];
    this.timeoutMillis = 1000;
    this.urlReplacements_ = Services.urlReplacementsForDoc(ampDoc);
    this.validateRtcConfig();
    if (!this.rtcConfig) {
      return;
    }
    this.addPublisherUrlsToArray(customMacros);
    this.addVendorUrlsToArray();
    this.inflateAndAddUrls();
  }

  executeRealTimeConfig() {
    if (!this.rtcConfig || !this.callouts.length) {
      return Promise.resolve();
    }
    const rtcStartTime = Date.now();
    return Promise.all(this.callouts.map(urlObject => {
      return this.sendRtcCallout_(urlObject.url, rtcStartTime, urlObject.vendor);
    }));
  }

  sendRtcCallout_(url, rtcStartTime, opt_vendor) {
    let callout = opt_vendor || url;
    /**
     * Note: Timeout is enforced by timerFor, not the value of
     *   rtcTime. There are situations where rtcTime could thus
     *   end up being greater than this.timeoutMillis.
     */
    return Services.timerFor(this.win).timeoutPromise(
        this.timeoutMillis,
        Services.xhrFor(this.win).fetchJson(
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
  validateRtcConfig() {
    const rtcConfig = tryParseJson(
        this.element.getAttribute('prerequest-callouts'));
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
    const timeout = rtcConfig['timeoutMillis'];
    if (timeout && Number.isInteger(timeout)) {
      if (timeout < this.timeoutMillis && timeout > 0) {
        this.timeoutMillis = Number(rtcConfig['timeoutMillis']) || this.timeoutMillis;
      } else {
        user().warn(TAG, `Invalid RTC timeout: ${timeout}ms, ` +
                    `using default timeout ${this.timeoutMillis}ms`);
      }
    }
    this.rtcConfig = rtcConfig;
    return true;
  }

  /**
   * For every vendor specified by the publisher in the rtcConfig,
   * check that the vendor URL actually exists, and if so call
   * helper function to inflate URL and add to list of callouts.
   */
  addVendorUrlsToArray() {
    if (!this.rtcConfig['vendors']) {
      return;
    }
    let url;
    Object.keys(this.rtcConfig['vendors']).forEach(vendor => {
      url = RTC_VENDORS[vendor.toLowerCase()];
      if (url) {
        this.urlObjects.push({url, macros: this.rtcConfig['vendors'][vendor], vendor});
      }
    });
  }

  /**
   * For each publisher-defined URL, call helper function to inflate and
   * add the URLs to list of callouts.
   * @param {!Object<string, string>} macros A mapping of macro to value for
   *   substitution in a publisher-defined url. E.g. {'SLOT_ID': '1'}.
   */
  addPublisherUrlsToArray(macros) {
    if (!this.rtcConfig['urls']) {
      return;
    }
    this.rtcConfig['urls'].forEach(url => {
      this.urlObjects.push({url, macros});
    });
  }

  inflateAndAddUrls() {
    for (i in this.urlObjects) {
      if (this.callouts.length == MAX_RTC_CALLOUTS) {
        let remaining = JSON.stringify(
            this.urlObjects.slice(i).map(urlObject => urlObject.url));
        dev().warn(TAG, `${MAX_RTC_CALLOUTS} RTC Callout URLS exceeded, ` +
                   ` dropping ${remaining}`);
        return;
      }
      this.maybeInflateAndAddUrl(this.urlObjects[i]);
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
  maybeInflateAndAddUrl(urlObject) {
    const url = this.urlReplacements_.expandSync(urlObject.url, macros);
    const macros = urlObject.macros;
    const vendor = urlObject.vendor || url;
    try {
      user().assert(isSecureUrl(url),
                    `Dropping RTC URL: ${url}, not secure`);
      user().assert(!this.callouts.includes(url),
                    `Dropping duplicate calls to RTC URL: ${url}`)
    } catch (err) {
      return;
    }
    this.callouts.push({url, vendor});
  }
}

AMP.RealTimeConfigManager = RealTimeConfigManager;
