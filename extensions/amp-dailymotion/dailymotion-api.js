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

/**
 *
 * @param {string} videoid
 * @param videoId
 * @param {string} mute
 * @param {string} endscreenEnable
 * @param {string} sharingEnable
 * @param {string} start
 * @param {string} uiHighlight
 * @param {string} uiLogo
 * @param {string} info
 * @param {!JsonObject} implicitParams
 * @return {string}
 */
export function getDailymotionIframeSrc(
  videoId,
  endscreenEnable,
  info,
  mute,
  sharingEnable,
  start,
  uiHighlight,
  uiLogo,
  implicitParams
) {
  let iframeUrl = addParamsToUrl(
    `https://www.dailymotion.com/embed/video/${encodeURIComponent(
      videoId
    )}?api=1&html=1&app=amp`,
    dict({
      'endscreen-enable': endscreenEnable ? endscreenEnable : undefined,
      'info': info ? info : undefined,
      'mute': mute ? mute : undefined,
      'sharing-enable': sharingEnable ? sharingEnable : undefined,
      'start': start ? start : undefined,
      'ui-highlight': uiHighlight ? uiHighlight : undefined,
      'ui-logo': uiLogo ? uiLogo : undefined,
    })
  );

  iframeUrl = addParamsToUrl(iframeUrl, implicitParams);
  return iframeUrl;
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
 * @private
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
