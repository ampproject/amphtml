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

import {AdSenseNetworkConfig} from './adsense-network-config';
import {AlrightNetworkConfig} from './alright-network-config';
import {DenakopNetworkConfig} from './denakop-network-config';
import {DoubleclickNetworkConfig} from './doubleclick-network-config';
import {PingNetworkConfig} from './ping-network-config';
import {PremiumadsNetworkConfig} from './premiumads-network-config';
import {getMode} from '../../../src/mode';

/** @typedef {{width: (number|undefined), height: (number|undefined)}} */
export let SizeInfoDef;

/**
 * An interface intended to be implemented by any ad-networks wishing to support
 * amp-auto-ads.
 * @interface
 */
export class AdNetworkConfigDef {
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
  if (type == 'alright') {
    return new AlrightNetworkConfig(autoAmpAdsElement);
  }
  if (type == 'denakop') {
    return new DenakopNetworkConfig(autoAmpAdsElement);
  }
  if (type == 'doubleclick') {
    return new DoubleclickNetworkConfig(autoAmpAdsElement);
  }
  if (type == 'premiumads') {
    return new PremiumadsNetworkConfig(autoAmpAdsElement);
  }
  return null;
}
