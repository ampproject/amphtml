import {AdSenseNetworkConfig} from './adsense-network-config';
import {AlrightNetworkConfig} from './alright-network-config';
import {DenakopNetworkConfig} from './denakop-network-config';
import {DoubleclickNetworkConfig} from './doubleclick-network-config';
import {FirstImpressionIoConfig} from './firstimpression.io-network-config';
import {PingNetworkConfig} from './ping-network-config';
import {PremiumadsNetworkConfig} from './premiumads-network-config';
import {WunderkindNetworkConfig} from './wunderkind-network-config';

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
   * After fetching the config, this method is called to allow rewriting the
   * config on the client side.
   * @param {!JsonObject} unusedConfig
   * @return {!JsonObject}
   */
  filterConfig(unusedConfig) {}

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
  if (type == 'firstimpression.io') {
    return new FirstImpressionIoConfig(autoAmpAdsElement);
  }
  if (type == 'premiumads') {
    return new PremiumadsNetworkConfig(autoAmpAdsElement);
  }
  if (type == 'wunderkind') {
    return new WunderkindNetworkConfig(autoAmpAdsElement);
  }
  return null;
}
