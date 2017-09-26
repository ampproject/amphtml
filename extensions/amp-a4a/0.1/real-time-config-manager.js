import {RTC_VENDORS} from './callout-vendors.js';
import {tryParseJson} from '../../../src/json';
import {dev} from '../../../src/log';
import {Services} from '../../../src/services';
import {isSecureUrl, parseUrl} from '../../../src/url';

/** Timeout in millis */
const DEFAULT_RTC_TIMEOUT = 1000;

/** @type {string} */
const TAG = 'real-time-config';

export class RealTimeConfigManager {
  constructor(element, win, ampDoc) {
    this.element = element;
    this.ampDoc = ampDoc;
    this.win = win;
    this.rtcConfig = null;
    this.calloutUrls = [];
    this.urlReplacements_ = Services.urlReplacementsForDoc(this.ampDoc);
  }

  executeRealTimeConfig(customMacros) {
    if (!this.rtcConfig) {
      return null;
    }
    const rtcTimeout = this.rtcConfig.timeoutMillis || DEFAULT_RTC_TIMEOUT;
    this.inflateVendorUrls();
    this.inflatePublisherUrls(customMacros);
    if (this.calloutUrls.length == 0) {
      return Promise.resolve();
    }
    const rtcPromiseArray = [];
    this.calloutUrls.forEach(url => {
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
      rtcPromiseArray.push(Services.timerFor(this.win).timeoutPromise(
          rtcTimeout,
          Services.xhrFor(this.win).fetchJson(
              url, {credentials: 'include'}).then(res => {
                const rtcTime = Date.now() - rtcStartTime;
                const hostname = parseUrl(url).hostname;
                // Non-200 status codes are forbidden for RTC.
                // TODO: Add to fetchResponse the ability to
                // check for redirects as well.
                if (res.status != 200) {
                  return {rtcTime, error: 'Non-200 Status', hostname};
                }
                return res.text().then(text => {
                  // An empty text response is fine, just means
                  // we have nothing to merge.
                  if (rtcTime > rtcTimeout) {
                    dev.error(TAG, 'exceeded timeout');
                  }
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
              }));
    });
    // TODO: Catch errors thrown by promises in promise array
    return Promise.all(rtcPromiseArray);
  }

  /**
   * Attempts to parse the publisher-defined RTC config off the amp-ad
   * element, then validates that the rtcConfig exists, and contains
   * an entry for either vendor URLs, or publisher-defined URLs.
   * @return {!boolean}
   */
  validateRtcConfig() {
    this.rtcConfig = tryParseJson(
        this.element.getAttribute('prerequest-callouts'));
    return (!!this.rtcConfig && (this.rtcConfig['vendors'] ||
                                 this.rtcConfig['urls'])) ? true : false;
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
        url = RTC_VENDORS[vendor];
        if (!url) {
          dev.error(TAG, `Vendor ${vendor} invalid`);
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
        this.maybeInflateAndAddUrl(url, macros);
      });
    }
  }

  /**
   * Substitutes macros into url, and adds the resulting URL to the list
   * of callouts. Checks each URL to see if secure, and stops adding URLs
   * once a total of 5 callouts are added to the list. If a supplied macro
   * does not exist in the url, it is silently ignored.
   * @param {!string} url
   * @param {!Object<string, string>} macros A mapping of macro to value for
   *   substitution. I.e. if url = 'https://www.foo.com/slot=SLOT_ID' then
   *   the macro object may look like {'SLOT_ID': '1'}.
   */
  maybeInflateAndAddUrl(url, macros) {
    // TODO: Is there a better place to put this check?
    if (this.calloutUrls.length == 5) {
      return;
    }
    url = this.urlReplacements_.expandSync(url, macros);
    if (isSecureUrl(url)) {
      this.calloutUrls.push(url);
    }
  }
}

AMP.RealTimeConfigManager = RealTimeConfigManager;
