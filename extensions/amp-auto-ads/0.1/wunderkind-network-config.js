/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
