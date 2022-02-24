import {buildUrl} from '#ads/google/a4a/shared/url-builder';

import {Services} from '#service';

/**
 * @implements {./ad-network-config.AdNetworkConfigDef}
 */
export class DenakopNetworkConfig {
  /**
   * @param {!Element} autoAmpAdsElement
   */
  constructor(autoAmpAdsElement) {
    this.autoAmpAdsElement_ = autoAmpAdsElement;
  }

  /**
   * @param {!Window} unused
   * @override
   */
  isEnabled(unused) {
    return true;
  }

  /**
   * True if responsive is enabled for auto-ads
   */
  isResponsiveEnabled() {
    return true;
  }

  /** @override */
  getConfigUrl() {
    const docInfo = Services.documentInfoForDoc(this.autoAmpAdsElement_);
    const accountId = this.autoAmpAdsElement_.getAttribute('data-account-id');
    if (accountId) {
      return buildUrl(
        'https://v3.denakop.com/ad-request',
        {
          'a': accountId,
          'v': 'amp',
          'u': docInfo.canonicalUrl,
        },
        /* maxLength */ 4096
      );
    }

    const publisherId =
      this.autoAmpAdsElement_.getAttribute('data-publisher-id');
    const tagId = this.autoAmpAdsElement_.getAttribute('data-tag-id');
    return buildUrl(
      '//v2.denakop.com/ad-request/amp',
      {
        'p': publisherId,
        't': tagId,
        'u': docInfo.canonicalUrl,
      },
      /* maxLength */ 4096
    );
  }

  /** @override */
  filterConfig(config) {
    return config;
  }

  /** @override */
  getAttributes() {
    const attributes = {
      'data-multi-size-validation': 'false',
      'type': 'doubleclick',
      'data-ad': 'denakop',
      'style': 'position:relative !important',
    };
    return attributes;
  }

  /** @override */
  getDefaultAdConstraints() {
    const viewportHeight = Services.viewportForDoc(
      this.autoAmpAdsElement_
    ).getSize().height;
    return {
      initialMinSpacing: viewportHeight,
      subsequentMinSpacing: [
        {adCount: 4, spacing: viewportHeight * 2},
        {adCount: 8, spacing: viewportHeight * 3},
      ],
      maxAdCount: 20,
    };
  }

  /** @override */
  getSizing() {
    return {};
  }
}
