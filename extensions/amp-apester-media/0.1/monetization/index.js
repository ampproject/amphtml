import {handleAdsetAds} from './adset';
import {handleBottomAd} from './bottomAd/bottomAd';
import {handleCompanionDisplay} from './companion/display';
import {handleCompanionVideo} from './companion/video';
import {getConsentData} from './consent-util';
import {handleInUnitVideo} from './inUnit/video';

/**
 * @param {!JsonObject} media
 * @param {!AmpElement} apesterElement
 * @return {!Promise}
 */
export function handleAds(media, apesterElement) {
  const companionSettings = media['campaignData'];
  const adsetSettings = media['adsetData'];
  if (
    (companionSettings && !companionSettings.disabledAmpCompanionAds) ||
    (adsetSettings && adsetSettings._id)
  ) {
    return getConsentData(apesterElement).then((consentData) => {
      if (adsetSettings?.placements?.length) {
        handleAdsetAds(media, apesterElement, consentData);
        return;
      }
      handleCompanionVideo(media, apesterElement, consentData);
      handleCompanionDisplay(media, apesterElement);
      handleBottomAd(media, apesterElement);
      handleInUnitVideo(media, apesterElement, consentData);
    });
  }
  return Promise.resolve();
}
