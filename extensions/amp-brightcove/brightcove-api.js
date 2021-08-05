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
import {VideoEvents} from '../../src/video-interface';

/**
 * Maps events coming from the Brightcove frame to events to be dispatched from the
 * component element.
 *
 * If the item does not have a value, the event will not be forwarded 1:1, but
 * it will be listened to.
 *
 * @const {!Object<string, ?string>}
 */
export const BRIGHTCOVE_EVENTS = {
  'playing': VideoEvents.PLAYING,
  'pause': VideoEvents.PAUSE,
  'ended': VideoEvents.ENDED,
  'ads-ad-started': VideoEvents.AD_START,
  'ads-ad-ended': VideoEvents.AD_END,
  'loadedmetadata': VideoEvents.LOADEDMETADATA,
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
