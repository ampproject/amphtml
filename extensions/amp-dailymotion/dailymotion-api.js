/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {addParamsToUrl} from '../../src/url';
import {dict} from '#core/types/object';
import {isAutoplaySupported} from '#core/dom/video';
import {VideoEvents} from '../../src/video-interface';

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
        'mute': Number(!!(mute || (autoplay && isAutoplaySupported(win)))),
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
 * Maps events coming from the Dailymotion frame to events to be dispatched from the
 * component element.
 *
 * If the item does not have a value, the event will not be forwarded 1:1, but
 * it will be listened to.
 *
 * @const {!Object<string, ?string>}
 */
export const DAILYMOTION_VIDEO_EVENTS = {
  'apiready': ['canplay', VideoEvents.LOAD],
  'end': [VideoEvents.ENDED, VideoEvents.PAUSE],
  'pause': VideoEvents.PAUSE,
  'play': VideoEvents.PLAYING,
};

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
