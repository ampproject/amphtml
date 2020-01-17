/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Services} from '../../../src/services';
import {buildUrl} from '../../../ads/google/a4a/shared/url-builder';
import {dict} from '../../../src/utils/object';
import {parseUrlDeprecated} from '../../../src/url';
import {toWin} from '../../../src/types';

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
