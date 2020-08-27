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

/**
 * @implements {./ad-network-config.AdNetworkConfigDef}
 */
export class DenakopNetworkConfig {
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
    const accountId = this.autoAmpAdsElement_.getAttribute('data-account-id');
    if (accountId) {
      return buildUrl(
        'https://v3.denakop.com/ad-request',
        {
          'a': accountId,
          'v': 'amp',
          'u': docInfo.canonicalUrl,
        },
        /* maxLength */ 4096
      );
    }

    const publisherId = this.autoAmpAdsElement_.getAttribute(
      'data-publisher-id'
    );
    const tagId = this.autoAmpAdsElement_.getAttribute('data-tag-id');
    return buildUrl(
      '//v2.denakop.com/ad-request/amp',
      {
        'p': publisherId,
        't': tagId,
        'u': docInfo.canonicalUrl,
      },
      /* maxLength */ 4096
    );
  }

  /** @override */
  getAttributes() {
    const attributes = dict({
      'data-multi-size-validation': 'false',
      'type': 'doubleclick',
      'data-ad': 'denakop',
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
