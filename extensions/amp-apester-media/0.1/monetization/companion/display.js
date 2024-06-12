import {getValueForExpr} from '#core/types/object';

import {constructStaticDisplayAd} from '../ads-constructor';
import {defaultBannerSizes} from '../consent-util';
const ALLOWED_AD_PROVIDER = 'gdt';

/**
 * @param {!JsonObject} media
 * @param {!AmpElement} apesterElement
 */
export function handleCompanionDisplay(media, apesterElement) {
  const companionOptions = getValueForExpr(
    /**@type {!JsonObject}*/ (media),
    'campaignData.companionOptions'
  );
  if (!companionOptions) {
    return;
  }
  const enabledDisplayAd = getValueForExpr(
    /**@type {!JsonObject}*/ (companionOptions),
    'enabled'
  );
  const settings = getValueForExpr(
    /**@type {!JsonObject}*/ (companionOptions),
    'settings'
  );
  const rtcConfig = getValueForExpr(
    /**@type {!JsonObject}*/ (companionOptions),
    'rtcConfig'
  );

  if (
    enabledDisplayAd &&
    settings &&
    settings['bannerAdProvider'] === ALLOWED_AD_PROVIDER
  ) {
    const slot = settings['slot'];
    const refreshInterval =
      settings['options']['autoRefreshTime'] === 60000 ? 60 : 30;
    const bannerSizes = settings['bannerSizes'] || defaultBannerSizes;
    constructStaticDisplayAd(
      slot,
      bannerSizes,
      apesterElement,
      refreshInterval,
      rtcConfig
    );
  }
}
