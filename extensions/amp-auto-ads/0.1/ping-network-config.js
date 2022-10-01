import {buildUrl} from '#ads/google/a4a/shared/url-builder';

import {Services} from '#service';

/**
 * A fake ad network integration that is mainly used for testing
 * and demo purposes. This implementation gets stripped out in compiled
 * production code.
 * @implements {./ad-network-config.AdNetworkConfigDef}
 * @visibleForTesting
 */
export class PingNetworkConfig {
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

  /** @override */
  isResponsiveEnabled() {
    return true;
  }

  /** @override */
  getConfigUrl() {
    return buildUrl(
      '//lh3.googleusercontent.com/' +
        'pSECrJ82R7-AqeBCOEPGPM9iG9OEIQ_QXcbubWIOdkY=w400-h300-no-n',
      {},
      4096
    );
  }

  /** @override */
  filterConfig(config) {
    return config;
  }

  /** @override */
  getAttributes() {
    return {
      'type': '_ping_',
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
