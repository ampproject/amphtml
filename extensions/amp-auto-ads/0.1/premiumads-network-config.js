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

import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {buildUrl} from '../../../ads/google/a4a/shared/url-builder';
import {dict} from '../../../src/utils/object';

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
    return true;
  }

  /** @override */
  getConfigUrl() {
    return buildUrl(
      'https://tags.premiumads.com.br/autoads/' +
        this.autoAmpAdsElement_.getAttribute('data-publisher'),
      {},
      4096
    );
  }

  /** @override */
  getAttributes() {
    const attributesObj = dict({
      'type': 'doubleclick',
      'data-ad': 'premiumads',
      'width': 336,
      'height': 280,
      'layout': Layout.RESPONSIVE,
      'sizes': '(min-width: 320px) 320px, 100vw',
      'style': 'position:relative!important',
    });
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
