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
import {getMode} from '../../../src/mode';
import {parseUrlDeprecated} from '../../../src/url';
import {tryParseJson} from '../../../src/json';


/** @typedef {{width: (number|undefined), height: (number|undefined)}} */
export let SizeInfoDef;

/**
 * An interface intended to be implemented by any ad-networks wishing to support
 * amp-auto-ads.
 * @interface
 */
class AdNetworkConfigDef {

  /**
   * Indicates whether amp-auto-ads should be enabled on this pageview.
   * @param {!Window} unusedWin
   * @return {boolean} true if amp-auto-ads should be enabled on this pageview.
   */
  isEnabled(unusedWin) {}

  /**
   * Indicates whether amp-auto-ads should be displayed at full-width.
   * @return {boolean} true if amp-auto-ads full-width responsive is enabled.
   */
  isResponsiveEnabled() {}

  /**
   * @return {string}
   */
  getConfigUrl() {}

  /**
   * Any attributes derived from either the page or the auto-amp-ads tag that
   * should be applied to any ads inserted.
   * @return {!JsonObject<string, string>}
   */
  getAttributes() {}

  /**
   * Network specific constraints on the placement of ads on the page.
   * @return {!./ad-tracker.AdConstraints}
   */
  getDefaultAdConstraints() {}

  /**
   * Network specific sizing information.
   * @return {!SizeInfoDef}
   */
  getSizing() {}
}

/**
 * Builds and returns an AdNetworkConfig instance for the given type.
 * @param {string} type
 * @param {!Element} autoAmpAdsElement
 * @return {?AdNetworkConfigDef}
 */
export function getAdNetworkConfig(type, autoAmpAdsElement) {
  if ((getMode().test || getMode().localDev) && type == '_ping_') {
    return new PingNetworkConfig(autoAmpAdsElement);
  }
  if (type == 'adsense') {
    return new AdSenseNetworkConfig(autoAmpAdsElement);
  }
  if (type == 'doubleclick') {
    return new DoubleclickNetworkConfig(autoAmpAdsElement);
  }
  return null;
}

/**
 * A fake ad network integration that is mainly used for testing
 * and demo purposes. This implementation gets stripped out in compiled
 * production code.
 * @implements {AdNetworkConfigDef}
 * @visibleForTesting
 */
class PingNetworkConfig {
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
    return buildUrl('//lh3.googleusercontent.com/' +
      'pSECrJ82R7-AqeBCOEPGPM9iG9OEIQ_QXcbubWIOdkY=w400-h300-no-n', {}, 4096);
  }

  /** @override */
  getAttributes() {
    return dict({
      'type': '_ping_',
    });
  }

  /** @override */
  getDefaultAdConstraints() {
    const viewportHeight =
      Services.viewportForDoc(this.autoAmpAdsElement_).getSize().height;
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


/**
 * @implements {AdNetworkConfigDef}
 */
class AdSenseNetworkConfig {
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
    return buildUrl('//pagead2.googlesyndication.com/getconfig/ama', {
      'client': this.autoAmpAdsElement_.getAttribute('data-ad-client'),
      'plah': canonicalHostname,
      'ama_t': 'amp',
      'url': docInfo.canonicalUrl,
    }, 4096);
  }

  /** @override */
  getAttributes() {
    return dict({
      'type': 'adsense',
      'data-ad-client': this.autoAmpAdsElement_.getAttribute('data-ad-client'),
    });
  }

  /** @override */
  getDefaultAdConstraints() {
    const viewportHeight =
        Services.viewportForDoc(this.autoAmpAdsElement_).getSize().height;
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


/**
 * @implements {AdNetworkConfigDef}
 */
class DoubleclickNetworkConfig {
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
    return buildUrl('//pagead2.googlesyndication.com/getconfig/ama', {
      'client': this.autoAmpAdsElement_.getAttribute('data-ad-legacy-client'),
      'plah': canonicalHostname,
      'ama_t': 'amp',
      'url': docInfo.canonicalUrl,
    }, 4096);
  }

  /** @override */
  getAttributes() {
    const attributes = dict({
      'type': 'doubleclick',
      'data-slot': this.autoAmpAdsElement_.getAttribute('data-slot'),
      'json': this.autoAmpAdsElement_.getAttribute('data-json'),
    });
    return attributes;
  }

  /** @override */
  getDefaultAdConstraints() {
    const viewportHeight =
        Services.viewportForDoc(this.autoAmpAdsElement_).getSize().height;
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
        this.autoAmpAdsElement_.getAttribute('data-experiment'));
    if (experimentJson) {
      return {
        height: experimentJson['height'] ?
          Number(experimentJson['height']) : 250,
        width: experimentJson['width'] ?
          Number(experimentJson['width']) : undefined,
      };
    }
    return {};
  }
}
