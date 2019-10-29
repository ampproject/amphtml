/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import '../../amp-a4a/0.1/real-time-config-manager';
import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';
import {Deferred} from '../../../src/utils/promise';
import {RTC_VENDORS} from '../../amp-a4a/0.1/callout-vendors';
import {Services} from '../../../src/services';
import {deepMerge} from '../../../src/utils/object';
import {getIdentityToken, googleAdUrl} from '../../../ads/google/a4a/utils';
import {user, userAssert} from '../../../src/log';

const TAG = 'AMP-AD-NETWORK-DOTANDADS-IMPL';
const RTC_SUCCESS = '2';
const DOT_BASE_URL = 'https://et.ad.dotandad.com/iframeCall?';

export class AmpAdNetworkDotandadsImpl extends AmpA4A {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    this.getAdUrlDeferred = new Deferred();
    this.troubleshootData_ = {};

    /** @private {?Promise<!../../../ads/google/a4a/utils.IdentityToken>} */
    this.identityTokenPromise_ = null;
    /** @type {?../../../ads/google/a4a/utils.IdentityToken} */
    this.identityToken = null;

    this.jsonTargeting = {};
  }

  /** @override */
  buildCallback() {
    userAssert(
      this.element.hasAttribute('data-mpt'),
      'Attribute src required for <amp-ad type="dotandads">: %s',
      this.element
    );
    super.buildCallback();
    this.identityTokenPromise_ = this.getAmpDoc()
      .whenFirstVisible()
      .then(() =>
        getIdentityToken(this.win, this.getAmpDoc(), super.getConsentPolicy())
      );
  }

  /** @override */
  isValidElement() {
    // To send out ad request, ad type='dotandads' requires the id set to an invalid
    // value start with `i-amphtml-demo-`. So that fake ad can only be used in
    // invalid AMP pages.

    const id = this.element.getAttribute('data-cid');
    if (!id) {
      user().warn(TAG, 'Only works with id starts with i-amphtml-demo-');
      return false;
    }

    return true;
  }

  /**
   * Appends the callout value to the keys of response to prevent a collision
   * case caused by multiple vendors returning the same keys.
   * @param {!Object<string, string>} response
   * @param {string} callout
   * @return {!Object<string, string>}
   * @private
   */
  rewriteRtcKeys_(response, callout) {
    // Only perform this substitution for vendor-defined URLs.
    if (!RTC_VENDORS[callout] || RTC_VENDORS[callout].disableKeyAppend) {
      return response;
    }
    const newResponse = {};
    Object.keys(response).forEach(key => {
      newResponse[`${key}_${callout}`] = response[key];
    });
    return newResponse;
  }

  /**
   * Merges all of the rtcResponses into the JSON targeting and
   * category exclusions.
   * @param {?Array<!rtcResponseDef>} rtcResponseArray
   * @return {?Object|undefined}
   * @private
   */
  mergeRtcResponses_(rtcResponseArray) {
    if (!rtcResponseArray) {
      return null;
    }
    const artc = [];
    const ati = [];
    const ard = [];
    rtcResponseArray.forEach(rtcResponse => {
      if (!rtcResponse) {
        return;
      }
      artc.push(rtcResponse.rtcTime);
      ati.push(rtcResponse.error || RTC_SUCCESS);
      ard.push(rtcResponse.callout);
      if (rtcResponse.response) {
        if (rtcResponse.response['targeting']) {
          const rewrittenResponse = this.rewriteRtcKeys_(
            rtcResponse.response['targeting'],
            rtcResponse.callout
          );
          this.jsonTargeting['targeting'] = !!this.jsonTargeting['targeting']
            ? deepMerge(this.jsonTargeting['targeting'], rewrittenResponse)
            : rewrittenResponse;
        }
      }
    });
    return {'artc': artc.join() || null, 'ati': ati.join(), 'ard': ard.join()};
  }

  /**
   * Constructs block-level url parameters with side effect of setting
   * size_, jsonTargeting, and adKey_ fields.
   * @return {string}
   */
  getBlockParameters_() {
    let retVal = '';
    retVal +=
      'mpt=' +
      this.element.getAttribute('data-mpt') +
      '&mpo=' +
      this.element.getAttribute('data-mpo') +
      '&cid=' +
      this.element.getAttribute('data-cid') +
      '&sp=' +
      this.element.getAttribute('data-sp') +
      '&ssl=1' +
      '&isAmp=1' +
      '&kw=' +
      'ampAds' +
      (this.element.getAttribute('data-kw')
        ? this.element.getAttribute('data-kw')
        : '');
    if (this.jsonTargeting['targeting']) {
      for (const key in this.jsonTargeting['targeting']) {
        retVal += '&' + key + '=' + this.jsonTargeting['targeting'][key];
      }
    }
    retVal += '&rnd=' + Date.now();
    return retVal;
  }

  /** @override */
  getAdUrl(consentState, opt_rtcResponsesPromise) {
    opt_rtcResponsesPromise = opt_rtcResponsesPromise || Promise.resolve();
    const startTime = Date.now();
    const identityPromise = Services.timerFor(this.win)
      .timeoutPromise(1000, this.identityTokenPromise_)
      .catch(() => {
        // On error/timeout, proceed.
        //window.console.log("AB: ERR");
        return {};
      });
    const experimentIds = [];
    const checkStillCurrent = this.verifyStillCurrent();
    Promise.all([opt_rtcResponsesPromise, identityPromise]).then(results => {
      checkStillCurrent();
      this.mergeRtcResponses_(results[0]);
      /*window.console.log("jsonTargeting: ");
      window.console.log(this.jsonTargeting);*/
      this.identityToken = results[1];
      googleAdUrl(
        this,
        DOT_BASE_URL + this.getBlockParameters_(),
        startTime,
        {},
        experimentIds
      ).then(adUrl => this.getAdUrlDeferred.resolve(adUrl));
    });
    this.troubleshootData_.adUrl = this.getAdUrlDeferred.promise;
    return this.getAdUrlDeferred.promise;
  }

  /** @override */
  tearDownSlot() {
    super.tearDownSlot();

    this.getAdUrlDeferred = new Deferred();
    this.jsonTargeting = {};
  }
}

AMP.extension('amp-ad-network-dotandads-impl', '0.1', AMP => {
  AMP.registerElement(
    'amp-ad-network-dotandads-impl',
    AmpAdNetworkDotandadsImpl
  );
});
