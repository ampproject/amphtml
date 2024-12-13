import {
  CONSENT_POLICY_STATE,
  CONSENT_STRING_TYPE,
} from '#core/constants/consent-state';
import {createElementWithAttributes, removeElement} from '#core/dom';
import {hasOwn} from '#core/types/object';

import {Services} from '#service';

import {user} from '#utils/log';

import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';

/** @const {string} */
const TAG = 'amp-ad-network-mgid-impl';

const BASE_URL_ = 'https://servicer.mgid.com/';
const PV_URL_ = 'https://c.mgid.com/pv/';

export class AmpAdNetworkMgidImpl extends AmpA4A {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.ampAnalyticsElement_ = null;
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

    adUrlParams = adUrlParams.concat(this.getNetworkInfoParams_());
    adUrlParams.push(this.getCacheBusterParam_());
    adUrlParams.push(this.getDevicePixelRatioParam_());
    adUrlParams.push(this.getCxurlParam_());
    adUrlParams.push(this.getPrParam_());
    adUrlParams.push(this.getPvidParam_());
    adUrlParams.push(this.getMuidParam_());
    adUrlParams.push('implVersion=15');

    return Promise.allSettled(adUrlParams).then((params) => {
      const data = [];
      params.forEach((result) => data.push(result.value));
      const joinedParams = '?' + data.join('&');
      servicerUrl += joinedParams;

      if (!hasOwn(this.win, '_mgAmpStoryPV')) {
        this.getAmpDoc()
          .getBody()
          .appendChild(
            createElementWithAttributes(this.win.document, 'amp-pixel', {
              'src': PV_URL_ + joinedParams,
            })
          );

        this.win['_mgAmpStoryPV'] = 1;
      }

      return servicerUrl;
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
    const counter = Services.urlReplacementsForDoc(
      this.element
    )./*OK*/ expandStringSync('COUNTER', undefined, {
      'COUNTER': true,
    });
    return parseInt(counter, 10) % 20;
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
   * @return {string} Referrer info for ad request
   * @private
   */
  getPrParam_() {
    return this.getReferrer_(10).then((referrer) => {
      const matchDomain = referrer.match(/:\/\/([^\/:]+)/i);
      return (
        'pr=' +
        encodeURIComponent(matchDomain && matchDomain[1] ? matchDomain[1] : '')
      );
    });
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
   * @return {string} Pageview info for ad request
   * @private
   */
  getPvidParam_() {
    return Services.documentInfoForDoc(this.element).pageViewId64.then(
      (pvid) => {
        return 'pvid=' + pvid;
      }
    );
  }

  /**
   * @return {string} Muidn info for ad request
   * @private
   */
  getMuidParam_() {
    return Services.urlReplacementsForDoc(this.element)
      ./*OK*/ expandStringAsync('CLIENT_ID(muidn)', undefined, {
        'CLIENT_ID': true,
      })
      .then((r) => {
        return 'muid=' + r;
      });
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
