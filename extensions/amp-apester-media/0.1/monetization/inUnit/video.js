import {getValueForExpr} from '#core/types/object';

import {constructInUnitAd} from '../ads-constructor';
import {AD_TYPES} from '../consent-util';

/**
 * @param {!JsonObject} media
 * @param {!AmpElement} apesterElement
 * @param {!JsonObject} consentObj
 */
export function handleInUnitVideo(media, apesterElement, consentObj) {
  const playerOptions = getValueForExpr(
    /**@type {!JsonObject}*/ (media),
    'campaignData.playerOptions'
  );
  if (!playerOptions) {
    return;
  }
  const videoSettings = playerOptions.find(
    (options) => options.player.type === 'va'
  );
  if (!videoSettings) {
    return;
  }
  const idleOptions = videoSettings.requests.find(
    (request) => request.type === 'idle'
  );
  const {provider} = videoSettings.player;
  switch (provider.type) {
    case 'aniview': {
      const playerOptions = provider.options || {};
      const {aniviewPlayerId} = playerOptions;
      if (!aniviewPlayerId) {
        return;
      }
      constructInUnitAd(
        AD_TYPES.video,
        aniviewPlayerId,
        apesterElement,
        consentObj,
        idleOptions.options
      );
      break;
    }
    default:
      break;
  }
}
