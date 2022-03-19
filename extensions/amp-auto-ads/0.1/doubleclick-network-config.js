import {buildUrl} from '#ads/google/a4a/shared/url-builder';

import {tryParseJson} from '#core/types/object/json';

import {Services} from '#service';

import {parseUrlDeprecated} from '../../../src/url';

/**
 * @implements {./ad-network-config.AdNetworkConfigDef}
 */
export class DoubleclickNetworkConfig {
  /**
   * @param {!Element} autoAmpAdsElement
   */
  constructor(autoAmpAdsElement) {
    this.autoAmpAdsElement_ = autoAmpAdsElement;
  }

  /**
   * @param {!Window} unused
   */
  isEnabled(unused) {
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
    const canonicalHostname = parseUrlDeprecated(docInfo.canonicalUrl).hostname;
    return buildUrl(
      '//pagead2.googlesyndication.com/getconfig/ama',
      {
        'client': this.autoAmpAdsElement_.getAttribute('data-ad-legacy-client'),
        'plah': canonicalHostname,
        'ama_t': 'amp',
        'url': docInfo.canonicalUrl,
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
      'type': 'doubleclick',
      'data-slot': this.autoAmpAdsElement_.getAttribute('data-slot'),
      'json': this.autoAmpAdsElement_.getAttribute('data-json'),
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
    const experimentJson = tryParseJson(
      this.autoAmpAdsElement_.getAttribute('data-experiment')
    );
    if (experimentJson) {
      return {
        height: experimentJson['height']
          ? Number(experimentJson['height'])
          : 250,
        width: experimentJson['width']
          ? Number(experimentJson['width'])
          : undefined,
      };
    }
    return {};
  }
}
