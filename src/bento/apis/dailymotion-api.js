import {isAutoplaySupported} from '#core/dom/video';

import {addParamsToUrl} from '../../url';

/**
 *
 * @param {!Window} win
 * @param {string} videoId
 * @param {boolean|undefined} autoplay
 * @param {boolean|undefined} endscreenEnable
 * @param {boolean|undefined} info
 * @param {boolean|undefined} mute
 * @param {boolean|undefined} sharingEnable
 * @param {string|undefined} start
 * @param {string|undefined} uiHighlight
 * @param {boolean|undefined} uiLogo
 * @param {!JsonObject} implicitParams
 * @return {string}
 */
export function getDailymotionIframeSrc(
  win,
  videoId,
  autoplay = false,
  endscreenEnable = true,
  info = true,
  mute = false,
  sharingEnable = true,
  start,
  uiHighlight,
  uiLogo = true,
  implicitParams
) {
  return addParamsToUrl(
    `https://www.dailymotion.com/embed/video/${encodeURIComponent(
      videoId
    )}?api=1&html=1&app=amp`,
    {
      'endscreen-enable': !endscreenEnable ? endscreenEnable : undefined,
      'info': !info ? info : undefined,
      'mute': mute || (autoplay && isAutoplaySupported(win)) ? 1 : undefined,
      'sharing-enable': !sharingEnable ? sharingEnable : undefined,
      'start': start,
      'ui-highlight': uiHighlight,
      'ui-logo': !uiLogo ? uiLogo : undefined,
      ...implicitParams,
    }
  );
}

/**
 * @param {string} command
 * @param {?boolean} param
 * @return {string}
 */
export function makeDailymotionMessage(command, param) {
  return JSON.stringify({
    'command': command,
    'parameters': param,
  });
}

/**
 * Player events reverse-engineered from the Dailymotion API
 * NOTE: 'unstarted' isn't part of the API, just a placeholder
 * as an initial state
 *
 * @enum {string}
 */
export const DailymotionEvents = {
  UNSTARTED: 'unstarted',
  API_READY: 'apiready',
  // Events fired for both the original content or ads
  START: 'start',
  PLAY: 'play',
  PAUSE: 'pause',
  END: 'end',
  // Events fired only for ads
  AD_START: 'ad_start',
  AD_PLAY: 'ad_play',
  AD_PAUSE: 'ad_pause',
  AD_END: 'ad_end',
  // Events fired only for the original content
  VIDEO_START: 'video_start',
  VIDEO_END: 'video_end',
  // Other events
  VOLUMECHANGE: 'volumechange',
  STARTED_BUFFERING: 'progress',
  FULLSCREEN_CHANGE: 'fullscreenchange',
};
