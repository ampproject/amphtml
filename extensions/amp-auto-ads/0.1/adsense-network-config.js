

import {buildUrl} from '#ads/google/a4a/shared/url-builder';

import {dict} from '#core/types/object';
import {toWin} from '#core/window';

import {Services} from '#service';

import {parseUrlDeprecated} from '../../../src/url';

/**
 * @implements {./ad-network-config.AdNetworkConfigDef}
 */
export class AdSenseNetworkConfig {
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
    return true;
  }

  /** @override */
  getConfigUrl() {
    const docInfo = Services.documentInfoForDoc(this.autoAmpAdsElement_);
    const canonicalHostname = parseUrlDeprecated(docInfo.canonicalUrl).hostname;
    const win = toWin(this.autoAmpAdsElement_.ownerDocument.defaultView);
    return buildUrl(
      '//pagead2.googlesyndication.com/getconfig/ama',
      {
        'client': this.autoAmpAdsElement_.getAttribute('data-ad-client'),
        'plah': canonicalHostname,
        'ama_t': 'amp',
        'url': docInfo.canonicalUrl,
        'debug_experiment_id':
          (/(?:#|,)deid=([\d,]+)/i.exec(win.location.hash) || [])[1] || null,
      },
      4096
    );
  }

  /** @override */
  getAttributes() {
    const attributesObj = dict({
      'type': 'adsense',
      'data-ad-client': this.autoAmpAdsElement_.getAttribute('data-ad-client'),
    });
    const dataAdHost = this.autoAmpAdsElement_.getAttribute('data-ad-host');
    const dataAdHostChannel = this.autoAmpAdsElement_.getAttribute(
      'data-ad-host-channel'
    );
    if (dataAdHost) {
      attributesObj['data-ad-host'] = dataAdHost;
      if (dataAdHostChannel) {
        attributesObj['data-ad-host-channel'] = dataAdHostChannel;
      }
    }
    return attributesObj;
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
