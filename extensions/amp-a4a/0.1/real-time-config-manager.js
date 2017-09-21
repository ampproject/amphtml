import {Services} from '../../../src/services';
import {tryParseJson} from '../../../src/json';
import {isSecureUrl} from '../../../src/url';
import {RTC_VENDORS} from './callout-vendors.js';


/** Timeout in millis */
const DEFAULT_RTC_TIMEOUT = 1000;


export class RealTimeConfigManager {
  constructor(element, win) {
    this.element = element;
    this.win = win;
    this.rtcConfig = null;
    this.calloutUrls = [];
    this.rtcResponses = null;
  }

  executeRealTimeConfig(customMacros) {
    if (!this.rtcConfig) {
      return null;
    }
    const rtcTimeout = this.rtcConfig.timeoutMillis || DEFAULT_RTC_TIMEOUT;
    this.inflateVendorUrls();
    this.inflatePublisherUrls(customMacros);
    this.validateUrls();
    const rtcPromiseArray = [];
    let url;
    this.calloutUrls.forEach(url => {
      let rtcStartTime = Date.now();
      rtcPromiseArray.push(Services.timerFor(this.win).timeoutPromise(
          rtcTimeout,
          Services.xhrFor(this.win).fetchJson(
              url, {credentials: 'include'}).then(res => {
                // can use timerFor
                let rtcTime = Date.now() - rtcStartTime;
                // Non-200 status codes are forbidden for RTC.
                // TODO: Add to fetchResponse the ability to
                // check for redirects as well.
                if (res.status != 200) {
                  return {rtcTime, error: "Non-200 Status"};
                }
                return res.text().then(text => {
                  // An empty text response is fine, just means
                  // we have nothing to merge.
                  if (!text) {
                    return {rtcTime};
                  }
                  const rtcResponse = tryParseJson(text);
                  return {rtcResponse, rtcTime};
                });
              })
      ));
    });
    return this.rtcResponses = Promise.all(rtcPromiseArray);
  }

  validateRtcConfig() {
    this.rtcConfig = tryParseJson(this.element.getAttribute('prerequest-callouts'));
    return this.rtcConfig && (this.rtcConfig.vendors || this.rtcConfig.urls);
  }

  /**
   * Delete any urls from this.calloutUrls that are not valid.
   */
  validateUrls() {
    this.calloutUrls.filter(url => isSecureUrl);
  }

  inflateVendorUrls() {

    // Switch to use url-replacement-service
    let baseUrl;
    if (this.rtcConfig.vendors) {
      for (vendor in this.rtcConfig.vendors) {
        baseUrl = RTC_VENDORS[vendor];
        if (!baseUrl) {
          console.log(`Vendor ${vendor} invalid`);
          continue;
        }
        // If a publisher includes a macro that does not actually exist in the vendor URL,
        // we are currently silently ignoring it.
        for (macro in this.rtcConfig.vendors[vendor]) {
          baseUrl = baseUrl.replace(macro, this.rtcConfig.vendors[vendor][macro]);
        }
        this.calloutUrls.push(baseUrl);
      }
    }
  }

  inflatePublisherUrls(macros) {
    let baseUrl;
    if (this.rtcConfig.urls) {
      for (i in this.rtcConfig.urls) {
        baseUrl = this.rtcConfig.urls[i];
        for (macro in macros) {
          baseUrl = baseUrl.replace(macro, macros[macro]);
        }
        this.calloutUrls.push(baseUrl);
      }
    }
  }
}

AMP.RealTimeConfigManager = RealTimeConfigManager;
