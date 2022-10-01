import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';

/**
 * Oblivki base URL
 *
 * @type {string}
 * @private
 */
const OBLIVKI_BASE_URL_ = 'https://oblivki.biz/amp/';

/**
 * Oblivki A4A base URL
 *
 * @type {string}
 * @private
 */
const OBLIVKI_BASE_A4A_URL_ = 'https://oblivki.biz/amp/a4a/';

export class AmpAdNetworkOblivkiImpl extends AmpA4A {
  /** @override */
  getAdUrl(unusedConsentTuple, opt_rtcResponsesPromise) {
    return this.element
      .getAttribute('src')
      .replace(OBLIVKI_BASE_URL_, OBLIVKI_BASE_A4A_URL_);
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
      (src.startsWith(OBLIVKI_BASE_URL_) ||
        src.startsWith(OBLIVKI_BASE_A4A_URL_))
    );
  }
}

AMP.extension('amp-ad-network-oblivki-impl', '0.1', (AMP) => {
  AMP.registerElement('amp-ad-network-oblivki-impl', AmpAdNetworkOblivkiImpl);
});
