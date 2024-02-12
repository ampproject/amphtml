import {getValueForExpr} from '#core/types/object';

import {constructBottomAd} from '../ads-constructor';
const ALLOWED_AD_PROVIDER = 'gpt';

/**
 * @param {!JsonObject} media
 * @param {!AmpElement} apesterElement
 */
export function handleBottomAd(media, apesterElement) {
  const bottomAdOptions = getValueForExpr(
    /**@type {!JsonObject}*/ (media),
    'campaignData.bottomAdOptions'
  );
  if (!bottomAdOptions) {
    return;
  }
  const enabledBottomAd = getValueForExpr(
    /**@type {!JsonObject}*/ (bottomAdOptions),
    'enabled'
  );
  const rtcConfig = getValueForExpr(
    /**@type {!JsonObject}*/ (bottomAdOptions),
    'rtcConfig'
  );
  if (
    enabledBottomAd &&
    bottomAdOptions['videoPlayer'] === ALLOWED_AD_PROVIDER
  ) {
    const slot = bottomAdOptions['tag'];
    constructBottomAd(slot, apesterElement, rtcConfig);
  }
}
