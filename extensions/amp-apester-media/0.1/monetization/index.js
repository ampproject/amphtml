
import {getConsentData} from './consent-util';
import {handleCompanionBottomAd} from './companion/bottomAd';
import {handleCompanionDisplay} from './companion/display';
import {handleCompanionVideo} from './companion/video';

/**
 * @param {!JsonObject} media
 * @param {!AmpElement} apesterElement
 * @return {!Promise}
 */
export function handleCompanionAds(media, apesterElement) {
  const monetizationSettings = media['campaignData'];
  if (monetizationSettings && !monetizationSettings.disabledAmpCompanionAds) {
    return getConsentData(apesterElement).then((consentData) => {
      handleCompanionDisplay(media, apesterElement);
      handleCompanionVideo(media, apesterElement, consentData);
      handleCompanionBottomAd(media, apesterElement);
    });
  }
  return Promise.resolve();
}
