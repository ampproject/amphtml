

import {buildUrl} from '#ads/google/a4a/shared/url-builder';

import {dict} from '#core/types/object';

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
  getAttributes() {
    const attributes = dict({
      'type': 'wunderkind',
      'data-ad': 'wunderkind',
      'layout': 'responsive',
      'height': '250',
      'width': '250',
    });
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
    return {};
  }
}
