/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {toArray} from '../../../src/types';
import {tryParseJson} from '../../../src/json';

export class Prediction {
  /**
   * This will set our rtc configuration.
   * @param {Window} win our current window
   * @param {string} pubKey
   * @param {string} siteKey
   */
  constructor(win, pubKey, siteKey) {
    this.win_ = win || window;
    /**@private string */
    this.browsiVendor_ = 'browsi';
    /**@private number */
    this.rtcTimeout_ = 750;
    /** @private Object */
    this.macro_ = `{"BROWSI_ID":${pubKey}_${siteKey}}`;
  }

  /**
   * Add browsi RTC vendor to each ad on page
   * @return {Array} amp-ads from page
   */
  setRtc() {
    const ads = toArray(this.win_.document.getElementsByTagName('amp-ad'));
    for (let i = 0; i < ads.length; i++) {
      const ad = ads[i];
      ad.setAttribute('rtc-config', this.getRtcTarget(ad));
    }
    return ads;
  }

  /**
   * Generate rtc-config object
   * if attribute exist - add vendor
   * else create new object
   * @return {string} rtc in stringed JSON
   * @param {Element} ad the ad to getRtc from
   */
  getRtcTarget(ad) {
    const curRtcString = ad.getAttribute('rtc-config');
    if (!curRtcString) {
      return `{"vendors": {"${this.browsiVendor_}": ${this.macro_}},"timeoutMillis": ${this.rtcTimeout_}}`;
    }
    const curRtc = tryParseJson(curRtcString) || {};
    if (!curRtc['vendors']) {
      curRtc['vendors'] = {};
    }
    curRtc['vendors'][this.browsiVendor_] = this.macro_;
    if (!curRtc['timeoutMillis']) {
      curRtc['timeoutMillis'] = this.rtcTimeout_;
    }
    return JSON.stringify(/** @type {JsonObject} */ (curRtc));
  }
}
