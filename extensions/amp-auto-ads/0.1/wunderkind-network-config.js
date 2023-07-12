import {buildUrl} from '#ads/google/a4a/shared/url-builder';

import {Services} from '#service';

/**
 * @implements {./ad-network-config.AdNetworkConfigDef}
 */
export class WunderkindNetworkConfig {
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
    const websiteID = this.autoAmpAdsElement_.getAttribute('data-website-id');

    return !!(websiteID && websiteID.match(/^[0-9]+$/));
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
    const websiteID = this.autoAmpAdsElement_.getAttribute('data-website-id');

    return buildUrl(
      'https://api.bounceexchange.com/bounce/amp',
      {
        'w_id': websiteID,
        'calling_url': docInfo.sourceUrl,
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
      'type': 'wunderkind',
      'data-ad': 'wunderkind',
      'layout': 'responsive',
      'height': '75vw',
      'width': '100vw',
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
      subsequentMinSpacing: [],
      maxAdCount: 10,
    };
  }

  /** @override */
  getSizing() {
    return {};
  }
}
