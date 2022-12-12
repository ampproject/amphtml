import {CONSENT_POLICY_STATE, CONSENT_STRING_TYPE} from '#core/constants/consent-state';
import {removeElement} from "#core/dom";
import {Services} from '#service';
import {user} from '#utils/log';
import {devAssert} from "#utils/log";
import {insertAnalyticsElement} from "../../../src/extension-analytics";
import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';
import {CookieWriter} from '../../amp-consent/0.1/cookie-writer';

/** @const {string} */
const TAG = 'amp-ad-network-mgid-impl';

const BASE_URL_ = 'https://servicer.mgid.com/';

export class AmpAdNetworkMgidImpl extends AmpA4A {

  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.ampAnalyticsElement_ = null;

    /** @private */
    this.mgidMetadata = {
      "h": "",
      "muidn": "",
      "h2": "",
      "rid": "",
      "tt": "",
      "ts": "",
    };
  }

  /** @override */
  tearDownSlot() {
    super.tearDownSlot();
    if (this.ampAnalyticsElement_) {
      removeElement(this.ampAnalyticsElement_);
      this.ampAnalyticsElement_ = null;
    }
  }

  /** @override */
  getAdUrl(consentTuple, opt_rtcResponsesPromise) {
    const adUrlParams = [];

    const consentParams = this.getConsents_(consentTuple);
    if (consentParams.length === 0) {
      user().info(TAG, 'Ad request suppressed due to unknown consent');
      return Promise.resolve('');
    }

    const widget = this.element.getAttribute('data-widget');

    let servicerUrl = BASE_URL_ + widget + '/' + this.getPageParam_();

    adUrlParams.concat(this.getNetworkInfoParams_());
    adUrlParams.push(this.getCacheBusterParam_());
    adUrlParams.push(this.getDevicePixelRatioParam_());
    adUrlParams.push(this.getRefParam_());
    adUrlParams.push(this.getPrParam_());
    adUrlParams.push(this.getLuParam_());
    adUrlParams.push(this.getSessionIdParam_());
    adUrlParams.push(this.getPvidParam_());
    adUrlParams.push('muid=' + this.mgidMetadata.muid);
    adUrlParams.push('implVersion=15');

    return Promise.allSettled(adUrlParams).then((params) => {
      const data = [];
      params.forEach((result) => data.push(result.value));
      servicerUrl += '?' + data.join('&');
      return servicerUrl;
    });
  }

  /** @override */
  onCreativeRender(creativeMetaData, opt_onLoadPromise) {
    super.onCreativeRender(creativeMetaData);

    const config = {
      'transport': {'beacon': false, 'xhrpost': false, 'image': true},
      "requests": {
        "base": "https://ads.localhost/c"
      },
      "triggers": {
        "storyAdView": {
          "on": "story-ad-view",
          "request": "base",
          "extraUrlParams": {
            "f": 1,
            "cid": this.element.getAttribute('data-widget'),
            "h2": this.mgidMetadata.h2,
            "rid": this.mgidMetadata.rid,
            "tt": this.mgidMetadata.tt,
            "ts": this.mgidMetadata.ts,
            "iv": 13,
            "pageImp": 1,
            "pvid": "",
            "muid": this.mgidMetadata.muidn,
            "cbuster": "",
            "v": "x|y|0|" + this.mgidMetadata.h,
          }
        },
      },
    };

    this.ampAnalyticsElement_ = insertAnalyticsElement(
      this.element,
      config,
      /*loadAnalytics*/ true,
      false
    );
  }


  /** @override */
  sendXhrRequest(adUrl) {
    return super.sendXhrRequest(adUrl).then((response) => {
      if (!response) {
        return null;
      }
      const {headers, status} =
        /** @type {{status: number, headers: !Headers}} */ (response);

      return response.text().then((responseText) => {
        const doc = new DOMParser().parseFromString(responseText, 'text/html');
        const root = doc.documentElement;
        const meta = root.querySelector('#mgid_metadata');
        if (meta) {
          this.mgidMetadata = JSON.parse(meta.innerHTML);
        }

        return new Response(responseText, {
          status,
          headers,
        });
      });
    });
  }

  getConsents_(consentTuple) {
    const result = [];

    let consentState = undefined;
    let consentString = undefined;
    let gdprApplies = undefined;
    let consentStringType = undefined;
    if (consentTuple) {
      consentState = consentTuple.consentState;
      consentString = consentTuple.consentString;
      gdprApplies = consentTuple.gdprApplies;
      consentStringType = consentTuple.consentStringType;
    }
    if (
      consentState === CONSENT_POLICY_STATE.UNKNOWN &&
      this.element.getAttribute('data-npa-on-unknown-consent') !== 'true'
    ) {
      return result;
    }

    result.push(
      'gdprApplies=' +
      (gdprApplies === true ? '1' : gdprApplies === false ? '0' : null)
    );
    result.push(
      'consentData=' +
      (consentStringType !=
      CONSENT_STRING_TYPE.US_PRIVACY_STRING
        ? consentString
        : null)
    );
    result.push(
      'uspString=' +
      (consentStringType ==
      CONSENT_STRING_TYPE.US_PRIVACY_STRING
        ? consentString
        : null)
    );

    return result;
  }

  getPageParam_() {
    const widget = this.element.getAttribute('data-widget');
    let page = 1;
    if (sessionStorage[`MG_widget_${widget}_page`]) {
      page = sessionStorage[`MG_widget_${widget}_page`];
      if (page++ > 20) {
        page = 1;
      }
    }

    return page;
  }

  getCacheBusterParam_() {
    return 'cbuster=' +
      Date.now().toString() +
      Math.floor(Math.random() * 1000000000 + 1);
  }

  getNetworkInfoParams_() {
    const params = [];
    try {
      const networkInformation = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

      if (typeof networkInformation.type != 'undefined') {
        params.push('nit=' + networkInformation.type);
      }
      if (typeof networkInformation.effectiveType != 'undefined') {
        params.push('niet=' + networkInformation.effectiveType);
      }
      if (typeof networkInformation.saveData != 'undefined') {
        params.push('nisd=' + (networkInformation.saveData ? 1 : 0));
      }
    } catch (e) {
    }

    return params;
  }

  getDevicePixelRatioParam_() {
    let ratio = 1;

    if (typeof window.devicePixelRatio !== 'undefined') {
      ratio = window.devicePixelRatio;
    } else if (typeof window.screen.systemXDPI !== 'undefined' &&
      typeof window.screen.logicalXDPI !== 'undefined' &&
      window.screen.systemXDPI > window.screen.logicalXDPI) {
      ratio = window.screen.systemXDPI / window.screen.logicalXDPI;
    }

    const isInt = ratio % 1 === 0;

    if (!isInt) {
      ratio = ratio.toFixed(3);
    }

    return 'dpr=' + ratio;
  }

  getRefParam_() {
    return this.getReferrer_(10).then(referrer => {
      return 'ref=' + referrer;
    });
  }

  getPrParam_() {
    if (sessionStorage.MG_Session_pr) {
      return 'pr=' + encodeURIComponent(sessionStorage.MG_Session_pr);
    } else {
      return this.getReferrer_(10).then(referrer => {
        const matchDomain = referrer.match(/:\/\/([^\/:]+)/i);
        sessionStorage.MG_Session_pr = matchDomain && matchDomain[1] ? matchDomain[1] : '';
        return 'pr=' + encodeURIComponent(referrer);
      });
    }
  }

  getLuParam_() {
    if (sessionStorage.MG_Session_lu) {
      return 'lu=' + encodeURIComponent(sessionStorage.MG_Session_lu);
    } else {
      const url = Services.documentInfoForDoc(this.element).canonicalUrl;
      sessionStorage.MG_Session_lu = url;
      return 'lu=' + encodeURIComponent(url);
    }
  }

  getSessionIdParam_() {
    if (sessionStorage.MG_Session_Id) {
      return 'sessionId=' + sessionStorage.MG_Session_Id;
    } else {
      const sessionId = Math.round(Date.now() / 1000).toString(16) + '-' +
        ('00000' + Math.round(Math.random() * 100000).toString(16)).slice(-5);
      sessionStorage.MG_Session_Id = sessionId;
      return 'sessionId=' + sessionId;
    }
  }

  getPvidParam_() {
    return 'pvid=' + Services.documentInfoForDoc(this.element).pageViewId64;
  }

  /**
   * Returns the referrer or undefined if the referrer is not resolved
   * before the given timeout
   * @param {number=} opt_timeout
   * @return {!(Promise<string>|Promise<undefined>)} A promise with a referrer or undefined
   * if timed out
   * @private
   */
  getReferrer_(opt_timeout) {
    const timeoutInt = parseInt(opt_timeout, 10);
    const referrerPromise = Services.viewerForDoc(
      this.getAmpDoc()
    ).getReferrerUrl();
    if (isNaN(timeoutInt) || timeoutInt < 0) {
      return referrerPromise;
    }
    return Services.timerFor(this.win)
    .timeoutPromise(timeoutInt, referrerPromise)
    .catch(() => undefined);
  }
}

AMP.extension('amp-ad-network-mgid-impl', '0.1', (AMP) => {
  AMP.registerElement('amp-ad-network-mgid-impl', AmpAdNetworkMgidImpl);
});
