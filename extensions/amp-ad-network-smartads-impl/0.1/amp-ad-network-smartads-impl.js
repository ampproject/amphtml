import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';

/**
 * Base URL
 *
 * @type {string}
 * @private
 */
const BASE_URL_ = 'https://smart-ads.biz/_amp';

/**
 * A4A base URL
 *
 * @type {string}
 * @private
 */
const BASE_A4A_URL_ = 'https://smart-ads.biz/_a4a';

export class AmpAdNetworkSmartAdsImpl extends AmpA4A {
  /** @override */
  getAdUrl(unusedConsentTuple, opt_rtcResponsesPromise) {
    return this.element.getAttribute('src').replace(BASE_URL_, BASE_A4A_URL_);
  }

  /** @override */
  getSigningServiceNames() {
    return ['cloudflare'];
  }

  /** @override */
  isValidElement() {
    const src = this.element.getAttribute('src') || '';
    return (
      this.isAmpAdElement() &&
      (src.startsWith(BASE_URL_) || src.startsWith(BASE_A4A_URL_))
    );
  }
}

AMP.extension('amp-ad-network-smartads-impl', '0.1', (AMP) => {
  AMP.registerElement('amp-ad-network-smartads-impl', AmpAdNetworkSmartAdsImpl);
});
