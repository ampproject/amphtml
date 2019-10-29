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
import {startsWith} from '../../../src/string';
import {user, userAssert} from '../../../src/log';
import {RTC_VENDORS} from '../../amp-a4a/0.1/callout-vendors';
import {Deferred} from '../../../src/utils/promise';
import {Services} from '../../../src/services';
import {
  getIdentityToken,
  googleAdUrl,
  googleBlockParameters,
  googlePageParameters,
} from '../../../ads/google/a4a/utils';

const TAG = 'AMP-AD-NETWORK-DOTANDADS-IMPL';
const RTC_SUCCESS = '2';
const DOT_BASE_URL = 'https://et.ad.dotandad.com/iframeCall?';
//const DOT_BASE_URL = 'https://staging.ad.dotandad.com/iframeCall?';

export class AmpAdNetworkDotandadsImpl extends AmpA4A {
  /**
  * @param {!Element} element
  */
  constructor(element) {
    super(element);

    this.getAdUrlDeferred = new Deferred();
    this.troubleshootData_ = ({});
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

  /** @override */
  getSigningServiceNames() {
    // Does not utilize crypto signature based AMP creative validation.
    return [];
  }

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

  mergeRtcResponses_(rtcResponseArray) {
    if (!rtcResponseArray) {
      return null;
    }
    const artc = [];
    const ati = [];
    const ard = [];
    let exclusions;
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

  getBlockParameters_() {
    var retVal = "";
    retVal += 'mpt=' + this.element.getAttribute('data-mpt') +
    '&mpo='  + this.element.getAttribute('data-mpo') +
    '&cid='  + this.element.getAttribute('data-cid') +
    '&sp='   + this.element.getAttribute('data-sp') +
    '&ssl=1' +
    '&isAmp=1' +
    '&kw='   + 'ampAds' + ( this.element.getAttribute('data-kw') ? this.element.getAttribute('data-kw') : "")
    if (this.jsonTargeting['targeting']) {
      for (var key in this.jsonTargeting['targeting']) {
        retVal += "&" + key + "=" + this.jsonTargeting['targeting'][key];
      }
    }
    retVal += "&rnd=" + (new Date()).getTime();
    return retVal;
  }

  getPageParameters(consentState, instances) {
    return {};
  }

  buildIdentityParams() {
    return this.identityToken
    ? {
      adsid: this.identityToken.token || null,
      jar: this.identityToken.jar || null,
      pucrd: this.identityToken.pucrd || null,
    }
    : {};
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
      return ({});
    });
    const experimentIds = [];
    const checkStillCurrent = this.verifyStillCurrent();
    Promise.all([opt_rtcResponsesPromise, identityPromise]).then(results => {
      checkStillCurrent();
      const rtcParams = this.mergeRtcResponses_(results[0]);
      /*window.console.log("jsonTargeting: ");
      window.console.log(this.jsonTargeting);*/
      this.identityToken = results[1];
      googleAdUrl(
        this,
        DOT_BASE_URL + this.getBlockParameters_(),
        startTime,
        {} /* Object.assign(
          this.getBlockParameters_(),
          this.buildIdentityParams(),
          this.getPageParameters(),
          rtcParams
        )*/,
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

  /** @override */
  sendXhrRequest(adUrl) {
    return super.sendXhrRequest(adUrl).then(response => {
      if (!response) {
        return null;
      }
      const {
        status,
        headers,
      } = /** @type {{status: number, headers: !Headers}} */ (response);

      // In the convert creative mode the content is the plain AMP HTML.
      // This mode is primarily used for A4A Envelop for testing.
      // See DEVELOPING.md for more info.
      if (this.element.getAttribute('a4a-conversion') == 'true') {
        return response.text().then(
          responseText =>
          new Response(this.transformCreative_(responseText), {
            status,
            headers,
          })
        );
      }

      // Normal mode: Expect the creative is written in AMP4ADS doc.
      return response;
    });
  }

  /**
  * Converts a general AMP doc to a AMP4ADS doc.
  * @param {string} source
  * @return {string}
  */
  transformCreative_(source) {
    const doc = new DOMParser().parseFromString(source, 'text/html');
    const root = doc.documentElement;

    // <html ⚡> -> <html ⚡4ads>
    if (root.hasAttribute('⚡')) {
      root.removeAttribute('⚡');
    } else if (root.hasAttribute('amp')) {
      root.removeAttribute('amp');
    } else if (root.hasAttribute('AMP')) {
      root.removeAttribute('AMP');
    }
    if (!root.hasAttribute('⚡4ads') && !root.hasAttribute('⚡4ADS')) {
      root.setAttribute('amp4ads', '');
    }

    this.reorderHeadTransformer_.reorderHead(doc.head);
    const metadata = this.metadataTransformer_.generateMetadata(doc);

    //Removes <amp-ad-metadata> tag if it exists
    const oldMetadata = doc.querySelector('script[amp-ad-metadata]');
    if (oldMetadata) {
      oldMetadata.parentNode.removeChild(oldMetadata);
    }

    const creative = root./*OK*/ outerHTML;
    const creativeSplit = creative.split('</body>');
    const docWithMetadata =
    creativeSplit[0] +
    `<script type="application/json" amp-ad-metadata>` +
    metadata +
    '</script></body>' +
    creativeSplit[1];
    return docWithMetadata;
  }
}

AMP.extension('amp-ad-network-dotandads-impl', '0.1', AMP => {
  AMP.registerElement('amp-ad-network-dotandads-impl', AmpAdNetworkDotandadsImpl);
});
