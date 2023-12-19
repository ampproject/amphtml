import {buildUrl} from '#ads/google/a4a/shared/url-builder';

import {Layout_Enum} from '#core/dom/layout';

import {Services} from '#service';

/**
 * @implements {./ad-network-config.AdNetworkConfigDef}
 */
export class PremiumadsNetworkConfig {
  /**
   * @param {!Element} autoAmpAdsElement
   */
  constructor(autoAmpAdsElement) {
    this.autoAmpAdsElement_ = autoAmpAdsElement;
  }

  /** @override */
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
    const data = this.autoAmpAdsElement_.dataset;
    const host = data.host || 'https://tags.premiumads.com.br';
    return buildUrl(`${host}/autoads/${data.publisher}`, {}, 4096);
  }

  /** @override */
  filterConfig(config) {
    return config;
  }

  /** @override */
  getAttributes() {
    const data = this.autoAmpAdsElement_.dataset;
    return {
      'type': 'doubleclick',
      'data-ad': 'premiumads',
      'json': data.json || '',
      'layout': data.layout || Layout_Enum.FIXED,
      'style':
        data['style'] ||
        'margin: 15px auto; position: relative !important; display: block !important;',
    };
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
