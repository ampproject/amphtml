import {addParamsToUrl} from '../../src/url';
import {dict} from '#core/types/object';
import {isAutoplaySupported} from '#core/dom/video';

/**
 *
 * @param {!Window} win
 * @param {string} videoId
 * @param {boolean} autoplay
 * @param {boolean} endscreenEnable
 * @param {boolean} info
 * @param {boolean} mute
 * @param {boolean} sharingEnable
 * @param {string} start
 * @param {string} uiHighlight
 * @param {boolean} uiLogo
 * @param {!JsonObject} implicitParams
 * @return {string}
 */
export function getDailymotionIframeSrc(
  win,
  videoId,
  autoplay,
  endscreenEnable,
  info,
  mute,
  sharingEnable,
  start,
  uiHighlight,
  uiLogo,
  implicitParams
) {
  return addParamsToUrl(
    `https://www.dailymotion.com/embed/video/${encodeURIComponent(
      videoId
    )}?api=1&html=1&app=amp`,
    Object.assign(
      dict({
        'endscreen-enable': endscreenEnable,
        'info': info,
        // In order to support autoplay the video needs to be muted on load so we
        // dont receive an unmute event which prevents the video from autoplay.
        'mute': mute || (autoplay && isAutoplaySupported(win)) ? 1 : undefined,
        'sharing-enable': sharingEnable,
        'start': start,
        'ui-highlight': uiHighlight,
        'ui-logo': uiLogo,
      }),
      implicitParams
    )
  );
}

/**
 * @param {string} command
 * @param {?Object|string=} params
 * @return {string}
 */
export function makeDailymotionMessage(command, params = []) {
  return JSON.stringify(
    dict({
      'command': command,
      'parameters': params,
    })
  );
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
