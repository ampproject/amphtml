import {buildUrl} from '#ads/google/a4a/shared/url-builder';

import {Layout_Enum} from '#core/dom/layout';

import {Services} from '#service';

/**
 * @implements {./ad-network-config.AdNetworkConfigDef}
 */
export class AlrightNetworkConfig {
  /**
   * @param {!Element} autoAmpAdsElement
   */
  constructor(autoAmpAdsElement) {
    this.autoAmpAdsElement_ = autoAmpAdsElement;
  }

  /**
   * @override
   */
  isEnabled() {
    return true;
  }

  /**
   * True if responsive is enabled for auto-ads
   */
  isResponsiveEnabled() {
    return false;
  }

  /** @override */
  getConfigUrl() {
    const docInfo = Services.documentInfoForDoc(this.autoAmpAdsElement_);
    const publisherId =
      this.autoAmpAdsElement_.getAttribute('data-publisher-id');
    const pageType = this.autoAmpAdsElement_.getAttribute('data-page-type');
    const contentCategory =
      this.autoAmpAdsElement_.getAttribute('data-content-category') || '';
    return buildUrl(
      '//analytics.alright.network/amp/',
      {
        'p': publisherId,
        't': pageType,
        'c': contentCategory,
        'u': docInfo.canonicalUrl,
        'w': window.screen.width,
        'h': window.screen.height,
      },
      4096
    );
  }

  /** @override */
  filterConfig(config) {
    return config;
  }

  /** @override */
  getAttributes() {
    const attributes = {
      'width': 300,
      'height': 250,
      'layout': Layout_Enum.RESPONSIVE,
      'data-multi-size-validation': 'false',
      'type': 'doubleclick',
      'data-ad': 'alright',
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
        {adCount: 3, spacing: viewportHeight * 2},
        {adCount: 6, spacing: viewportHeight * 3},
      ],
      maxAdCount: 8,
    };
  }

  /** @override */
  getSizing() {
    return {
      width: 300,
      height: 250,
    };
  }
}
