import {getValueForExpr} from '#core/types/object';

import {
  constructStaticDisplayAd,
  constructStaticAniviewAd,
  constructBottomAd,
  constructInUnitAd
} from './ads-constructor';
import {PLACAMENT_POSITIONS, AD_TYPES, defaultBannerSizes, defaultRefreshTime} from './consent-util';


/**
 * @param {!JsonObject} media
 * @param {!AmpElement} apesterElement
 * @param {!JsonObject} consentObj
 */
export function handleAdsetAds(media, apesterElement, consentObj) {
  // check if adset settings is set
  const adsetData = getValueForExpr(
    /**@type {!JsonObject}*/ (media),
    'adsetData'
  );
  const adsetPlacements = adsetData?.placements;
  if (!adsetPlacements?.length) {
    return;
  }  
  const staticSettings = adsetData.settings?.staticAds || {};
  const inUnitSettings = adsetData.settings?.inUnit || {};

  adsetPlacements.forEach((adPlacement) => {
    const adData = adPlacement.ads[0];
    const adProvider = adData?.provider;
    const adUnit = adProvider?.adUnit;
    const aniviewPlayerId = adProvider?.playerId;
    const rtcConfig = adProvider?.rtcConfig;

    // static ads above or below
    if ([PLACAMENT_POSITIONS.above, PLACAMENT_POSITIONS.below].includes(adPlacement.type)) {
      const isAbove = adPlacement.type === PLACAMENT_POSITIONS.above;

      if (adUnit && adData.mediaType === AD_TYPES.display) {
        const refreshInterval = staticSettings?.refresh?.refreshTime || defaultRefreshTime;
        const bannerSizes = adProvider.sizes || defaultBannerSizes;
        constructStaticDisplayAd(
          adUnit,
          bannerSizes,
          apesterElement,
          refreshInterval,
          rtcConfig,
          isAbove
        );
      } else if (aniviewPlayerId && adData.mediaType === AD_TYPES.video) {
        constructStaticAniviewAd(
          apesterElement,
          aniviewPlayerId,
          consentObj,
          isAbove,
          adProvider?.publisherId
        );
      }
    }

    // bottom Ad
    if (adPlacement.type === PLACAMENT_POSITIONS.bottom && adUnit) {
      constructBottomAd(adUnit, apesterElement, rtcConfig);
    }

     // inUnit Ad
     if (adPlacement.type === PLACAMENT_POSITIONS.in_unit && (adUnit || aniviewPlayerId)) {
      constructInUnitAd(
        adData.mediaType,
        adData.mediaType === AD_TYPES.display ? adUnit : aniviewPlayerId,
        apesterElement,
        consentObj,
        inUnitSettings,
        adProvider?.publisherId,
        rtcConfig
      );
    }
  });  
}
