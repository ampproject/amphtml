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
import {dict} from '../../src/core/types/object';

/**
 *
 * @param {string} videoid
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
  videoid,
  mute,
  endscreenEnable,
  sharingEnable,
  start,
  uiHighlight,
  uiLogo,
  info,
  implicitParams
) {
  let iframeUrl = addParamsToUrl(
    `https://www.dailymotion.com/embed/video/${encodeURIComponent(
      videoid
    )}?api=1&html=1&app=amp`,
    dict({
      'mute': mute ? mute : undefined,
      'endscreen-enable': endscreenEnable ? endscreenEnable : undefined,
      'sharing-enable': sharingEnable ? sharingEnable : undefined,
      'start': start ? start : undefined,
      'ui-highlight': uiHighlight ? uiHighlight : undefined,
      'ui-logo': uiLogo ? uiLogo : undefined,
      'info': info ? info : undefined,
    })
  );

  iframeUrl = addParamsToUrl(iframeUrl, implicitParams);
  return iframeUrl;
}
