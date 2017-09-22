import {Services} from '../../../src/services';
import {tryParseJson} from '../../../src/json';
import {isSecureUrl} from '../../../src/url';
import {RTC_VENDORS} from './callout-vendors.js';
import {UrlReplacements} from '../../../src/service/url-replacements-impl';


/** Timeout in millis */
const DEFAULT_RTC_TIMEOUT = 1000;


export class RealTimeConfigManager {
  constructor(element, win, ampDoc) {
    this.element = element;
    this.ampDoc = ampDoc;
    this.win = win;
    this.rtcConfig = null;
    this.calloutUrls = [];
    this.urlReplacements_ = new Services.urlReplacementsForDoc(this.ampDoc);
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
      let rtcStartTime = Date.now();
      rtcPromiseArray.push(Services.timerFor(this.win).timeoutPromise(
          rtcTimeout,
          Services.xhrFor(this.win).fetchJson(
              url, {credentials: 'include'}).then(res => {
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
    // TODO: Catch errors thrown by promises in promise array
    return Promise.all(rtcPromiseArray);
  }

  validateRtcConfig() {
    this.rtcConfig = tryParseJson(this.element.getAttribute('prerequest-callouts'));
    return this.rtcConfig && (this.rtcConfig.vendors || this.rtcConfig.urls);
  }

  inflateVendorUrls() {
    let url;
    if (this.rtcConfig.vendors) {
      for (vendor in this.rtcConfig.vendors) {
        url = RTC_VENDORS[vendor];
        if (!url) {
          console.log(`Vendor ${vendor} invalid`);
          continue;
        }
        this.maybeInflateAndAddUrl(url, this.rtcConfig.vendors[vendor]);
      }
    }
  }

  inflatePublisherUrls(macros) {
    if (this.rtcConfig.urls) {
      this.rtcConfig.urls.forEach(url => {
        this.maybeInflateAndAddUrl(url, macros);
      });
    }
  }

  maybeInflateAndAddUrl(url, macros) {
    url = this.urlReplacements_.expandSync(url, macros);
    if (isSecureUrl(url)) {
      this.calloutUrls.push(url);
    }
  }
}

AMP.RealTimeConfigManager = RealTimeConfigManager;
