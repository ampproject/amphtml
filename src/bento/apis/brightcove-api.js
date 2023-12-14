import {addParamsToUrl} from '../../url';
import {VideoEvents_Enum} from '../../video-interface';

/**
 * Maps events coming from the Brightcove frame to events to be dispatched from the
 * component element.
 *
 * If the item does not have a value, the event will not be forwarded 1:1, but
 * it will be listened to.
 *
 * @const {!{[key: string]: ?string}}
 */
export const BRIGHTCOVE_EVENTS = {
  'playing': VideoEvents_Enum.PLAYING,
  'pause': VideoEvents_Enum.PAUSE,
  'ended': VideoEvents_Enum.ENDED,
  'ads-ad-started': VideoEvents_Enum.AD_START,
  'ads-ad-ended': VideoEvents_Enum.AD_END,
  'loadedmetadata': VideoEvents_Enum.LOADEDMETADATA,
};

/**
 * id is either a Brightcove-assigned id, or a publisher-generated
 * reference id. Reference ids are prefixed 'ref:' and the colon
 * must be preserved unencoded.
 * @param {string} id
 * @return {string}
 */
function encodeId(id) {
  if (id.substring(0, 4) === 'ref:') {
    return `ref:${encodeURIComponent(id.substring(4))}`;
  }
  return encodeURIComponent(id);
}

/**
 * @param {string} account
 * @param {string} player
 * @param {string} embed
 * @param {string|undefined} playlistId
 * @param {string|undefined} videoId
 * @param {string|undefined} referrer
 * @param {!JsonObject<string, string>} additionalParams
 * @return {string}
 */
export function getBrightcoveIframeSrc(
  account,
  player,
  embed,
  playlistId,
  videoId,
  referrer,
  additionalParams
) {
  let playlistOrVideoParam = '';
  if (playlistId) {
    playlistOrVideoParam = '&playlistId=' + encodeId(playlistId);
  } else if (videoId) {
    playlistOrVideoParam = '&videoId=' + encodeId(videoId);
  }
  return addParamsToUrl(
    `https://players.brightcove.net/${encodeURIComponent(account)}` +
      `/${encodeURIComponent(player)}` +
      `_${encodeURIComponent(embed)}/index.html` +
      '?amp=1' +
      playlistOrVideoParam,
    {...additionalParams, referrer, playsinline: true, autoplay: undefined}
  );
}
