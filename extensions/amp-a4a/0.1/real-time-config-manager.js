import {Services} from '../../../src/services';
import {tryParseJson} from '../../../src/json';
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

  executeRealTimeConfig() {
    const rtcTimeout = this.rtcConfig.timeoutMillis || DEFAULT_RTC_TIMEOUT;
    let baseUrl;
    if (this.rtcConfig.vendors) {
      for (vendor in this.rtcConfig.vendors) {
        baseUrl = RTC_VENDORS[vendor];
        for (macro in this.rtcConfig.vendors[vendor]) {
          baseUrl = baseUrl.replace(macro, this.rtcConfig.vendors[vendor][macro]);
        }
        this.calloutUrls.push(baseUrl);
      }
    }
    if (this.rtcConfig.urls) {
      console.log("Inflate urls");
      //todo: actually inflate urls
      for (i in this.rtcConfig.urls) {
        this.calloutUrls.push(this.rtcConfig.urls[i]);
      }
    }
    this.validateUrls();
    const rtcPromiseArray = [];
    let rtcMaxTime;
    let url;
    for (urlIndex in this.calloutUrls) {
      url = this.calloutUrls[urlIndex];
      let rtcStartTime = Date.now();
      rtcPromiseArray.push(Services.timerFor(this.win).timeoutPromise(
          rtcTimeout,
          Services.xhrFor(this.win).fetchJson(
              url, {credentials: 'include'}).then(res => {
                let rtcTime = Date.now() - rtcStartTime;
                rtcMaxTime = (!rtcMaxTime || rtcTime > rtcMaxTime) ? rtcTime : rtcMaxTime;
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
    }
    this.rtcResponses = Promise.all(rtcPromiseArray).then(rtcResponses => {
      return this.validateResponses(rtcResponses);
    });
    return this.rtcResponses;
  }

  validateRtcConfig() {
    this.rtcConfig = tryParseJson(this.element.getAttribute('prerequest-callouts'));
    return !!this.rtcConfig;
    // Actually validate the rtc config a little better plz, thx.

  }

  validateResponses(rtcResponses) {
    return rtcResponses;
  }

  validateUrls() {
    // verify
    this.calloutUrls = this.calloutUrls;
  }
}

AMP.RealTimeConfigManager = RealTimeConfigManager;
