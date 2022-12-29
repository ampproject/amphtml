import {
  CONSENT_POLICY_STATE,
  CONSENT_STRING_TYPE,
} from '#core/constants/consent-state';
import {createElementWithAttributes, removeElement} from '#core/dom';

import {Services} from '#service';

import {user} from '#utils/log';

import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';

/** @const {string} */
const TAG = 'amp-ad-network-mgid-impl';

const BASE_URL_ = 'https://servicer.mgid.com/';
const PV_URL_ = 'https://c.mgid.com/';

export class AmpAdNetworkMgidImpl extends AmpA4A {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.ampAnalyticsElement_ = null;

    /** @private */
    this.mgidMetadata_ = {
      'muidn': '',
      'pvid': '',
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
  isValidElement() {
    const id = this.element.getAttribute('data-widget');
    if (!id || parseInt(id, 10) != id) {
      user().warn(TAG, 'Undefined or non-numeric data-widget param!');
      return false;
    }
    return true;
  }

  /** @override */
  getAdUrl(consentTuple, opt_rtcResponsesPromise) {
    let adUrlParams = [];

    const consentParams = this.getConsents_(consentTuple);
    if (consentParams.length !== 0) {
      adUrlParams = adUrlParams.concat(consentParams);
    }

    const widget = this.element.getAttribute('data-widget');

    let servicerUrl = BASE_URL_ + widget + '/' + this.getPageParam_();
    let pvUrl = PV_URL_ + 'pv/';

    adUrlParams = adUrlParams.concat(this.getNetworkInfoParams_());
    adUrlParams.push(this.getCacheBusterParam_());
    adUrlParams.push(this.getDevicePixelRatioParam_());
    adUrlParams.push(this.getCxurlParam_());
    adUrlParams.push(this.getPrParam_());
    adUrlParams.push(this.getLuParam_());
    adUrlParams.push(this.getSessionIdParam_());
    adUrlParams.push(this.getPvidParam_());
    if (localStorage.mgMuidn) {
      adUrlParams.push('muid=' + localStorage.mgMuidn);
    }
    adUrlParams.push('implVersion=15');

    return Promise.allSettled(adUrlParams).then((params) => {
      const data = [];
      params.forEach((result) => data.push(result.value));
      const joinedParams = '?' + data.join('&');
      servicerUrl += joinedParams;
      pvUrl += joinedParams;

      if (typeof this.win['_mgAmpStoryPV'] == 'undefined') {
        this.getAmpDoc()
          .getBody()
          .appendChild(
            createElementWithAttributes(this.win.document, 'amp-pixel', {
              'src': pvUrl,
            })
          );

        this.win['_mgAmpStoryPV'] = 1;
      }

      return servicerUrl;
    });
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
          this.mgidMetadata_ = JSON.parse(meta./*OK*/ innerHTML);
          this.mgidMetadata_.muidn = this.mgidMetadata_.muidn.trim();
          if (this.mgidMetadata_.muidn != '') {
            localStorage.mgMuidn = this.mgidMetadata_.muidn;
          }
        }

        return new Response(responseText, {
          status,
          headers,
        });
      });
    });
  }

  /**
   * @param {!ConsentTupleDef=} consentTuple
   * @return {string[]} Consents parameters.
   * @private
   */
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

    if (gdprApplies) {
      result.push(
        'gdprApplies=' +
          (gdprApplies === true ? '1' : gdprApplies === false ? '0' : null)
      );
    }

    if (
      consentString &&
      consentStringType != CONSENT_STRING_TYPE.US_PRIVACY_STRING
    ) {
      result.push('consentData=' + consentString);
    }

    if (
      consentString &&
      consentStringType == CONSENT_STRING_TYPE.US_PRIVACY_STRING
    ) {
      result.push('uspString=' + consentString);
    }

    return result;
  }

  /**
   * @return {string} Page data for ad request
   * @private
   */
  getPageParam_() {
    const widget = this.element.getAttribute('data-widget');
    let page = 1;
    if (sessionStorage[`MG_widget_${widget}_page`]) {
      page = sessionStorage[`MG_widget_${widget}_page`];
      if (page++ > 20) {
        page = 1;
      }
    }

    sessionStorage[`MG_widget_${widget}_page`] = page;

    return page;
  }

  /**
   * @return {string} Cachebuster for ad request
   * @private
   */
  getCacheBusterParam_() {
    return (
      'cbuster=' +
      Date.now().toString() +
      Math.floor(Math.random() * 1000000000 + 1)
    );
  }

  /**
   * @return {string} Network information data for ad request
   * @private
   */
  getNetworkInfoParams_() {
    const params = [];
    try {
      const networkInformation =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;

      if (typeof networkInformation.type != 'undefined') {
        params.push('nit=' + networkInformation.type);
      }
      if (typeof networkInformation.effectiveType != 'undefined') {
        params.push('niet=' + networkInformation.effectiveType);
      }
      if (typeof networkInformation.saveData != 'undefined') {
        params.push('nisd=' + (networkInformation.saveData ? 1 : 0));
      }
    } catch (e) {}

    return params;
  }

  /**
   * @return {string} Device pixel ratio info for ad request
   * @private
   */
  getDevicePixelRatioParam_() {
    let ratio = 1;

    if (typeof window.devicePixelRatio !== 'undefined') {
      ratio = window.devicePixelRatio;
    } else if (
      typeof window.screen.systemXDPI !== 'undefined' &&
      typeof window.screen.logicalXDPI !== 'undefined' &&
      window.screen.systemXDPI > window.screen.logicalXDPI
    ) {
      ratio = window.screen.systemXDPI / window.screen.logicalXDPI;
    }

    const isInt = ratio % 1 === 0;

    if (!isInt) {
      ratio = ratio.toFixed(3);
    }

    return 'dpr=' + ratio;
  }

  /**
   * @return {string} Primary referrer info for ad request
   * @private
   */
  getPrParam_() {
    if (sessionStorage['MG_Session_pr']) {
      return 'pr=' + encodeURIComponent(sessionStorage['MG_Session_pr']);
    } else {
      return this.getReferrer_(10).then((referrer) => {
        const matchDomain = referrer.match(/:\/\/([^\/:]+)/i);
        sessionStorage['MG_Session_pr'] =
          matchDomain && matchDomain[1] ? matchDomain[1] : '';
        return 'pr=' + encodeURIComponent(sessionStorage['MG_Session_pr']);
      });
    }
  }

  /**
   * @return {string} First session page info for ad request
   * @private
   */
  getLuParam_() {
    if (sessionStorage['MG_Session_lu']) {
      return 'lu=' + encodeURIComponent(sessionStorage['MG_Session_lu']);
    } else {
      const url = Services.documentInfoForDoc(this.element).canonicalUrl;
      sessionStorage['MG_Session_lu'] = url;
      return 'lu=' + encodeURIComponent(url);
    }
  }

  /**
   * @return {string} Current page url for ad request
   * @private
   */
  getCxurlParam_() {
    const url = Services.documentInfoForDoc(this.element).canonicalUrl;
    return 'cxurl=' + encodeURIComponent(url);
  }

  /**
   * @return {string} Session id info for ad request
   * @private
   */
  getSessionIdParam_() {
    if (sessionStorage['MG_Session_Id']) {
      return 'sessionId=' + sessionStorage['MG_Session_Id'];
    } else {
      const sessionId =
        Math.round(Date.now() / 1000).toString(16) +
        '-' +
        ('00000' + Math.round(Math.random() * 100000).toString(16)).slice(-5);
      sessionStorage['MG_Session_Id'] = sessionId;
      return 'sessionId=' + sessionId;
    }
  }

  /**
   * @return {string} Pageview info for ad request
   * @private
   */
  getPvidParam_() {
    return Services.documentInfoForDoc(this.element).pageViewId64.then(
      (pvid) => {
        this.mgidMetadata_.pvid = pvid;
        return 'pvid=' + pvid;
      }
    );
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
