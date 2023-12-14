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
  const monetizationSettings = media['campaignData'];
  if (monetizationSettings && !monetizationSettings.disabledAmpCompanionAds) {
    return getConsentData(apesterElement).then((consentData) => {
      handleCompanionDisplay(media, apesterElement);
      handleCompanionVideo(media, apesterElement, consentData);
      handleBottomAd(media, apesterElement);
      handleInUnitVideo(media, apesterElement, consentData);
    });
  }
  return Promise.resolve();
}
