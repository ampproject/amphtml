/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
import {parseQueryString} from '../../../src/url';

/**
 * @implements {./ad-network-config.AdNetworkConfigDef}
 */
export class FirstImpressionIoConfig {
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
    return false;
  }

  /** @override */
  getConfigUrl() {
    let previewId = 0;

    const {host, pathname, hash} = this.autoAmpAdsElement_.ampdoc_.win.location;
    const hashParams = parseQueryString(hash);
    const docInfo = Services.documentInfoForDoc(this.autoAmpAdsElement_);

    const previewFlowRegex = /amp\/fi\/(\d+)\//;
    const previewFlowParam = pathname.match(previewFlowRegex);
    if (previewFlowParam != null && previewFlowParam.length == 2) {
      previewId = previewFlowParam[1];
    }

    const fiReveal = hashParams['fi_reveal'];
    const fiDemand = hashParams['fi_demand'];
    const fiGeo = hashParams['fi_geo'];

    const cdnHost =
      hashParams['fi_cdnhost'] || (previewId ? host : 'cdn.firstimpression.io');
    const cdnpath =
      hashParams['fi_cdnpath'] ||
      (previewId ? '/amp-preview.php' : '/delivery/amp.php');

    const websiteId = this.autoAmpAdsElement_.getAttribute('data-website-id');
    const targeting = this.autoAmpAdsElement_.getAttribute('data-targeting');

    const queryParams = {
      'id': websiteId,
      'url': docInfo.canonicalUrl,
      'w': window.screen.width,
      'h': window.screen.height,
    };

    if (targeting) {
      queryParams['targeting'] = targeting;
    }
    if (fiReveal) {
      queryParams['fi_reveal'] = fiReveal;
    }
    if (fiDemand) {
      queryParams['fi_demand'] = fiReveal;
    }
    if (fiGeo) {
      queryParams['fi_geo'] = fiGeo;
    }
    if (previewId) {
      queryParams['preview_id'] = previewId;
    }

    return buildUrl(
      'https://' + cdnHost + cdnpath,
      queryParams,
      /* maxLength */ 4096
    );
  }

  /** @override */
  getAttributes() {
    const attributes = dict({
      'type': 'firstimpression',
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
    return {
      height: 1,
    };
  }
}
