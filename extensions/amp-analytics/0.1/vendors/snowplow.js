/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

export const SNOWPLOW_CONFIG = /** @type {!JsonObject} */ ({
  'vars': {
    'duid': 'CLIENT_ID(_sp_id)',
  },
  'requests': {
    'aaVersion': 'amp-0.2',
    'basePrefix':
      'https://${collectorHost}/i?url=${canonicalUrl}&page=${title}&' +
      'res=${screenWidth}x${screenHeight}&stm=${timestamp}&' +
      'tz=${timezone}&aid=${appId}&p=web&tv=${aaVersion}&' +
      'cd=${screenColorDepth}&cs=${documentCharset}&' +
      'duid=${duid}&' +
      'lang=${browserLanguage}&refr=${documentReferrer}&stm=${timezone}&' +
      'vp=${viewportWidth}x${viewportHeight}',
    'pageView': '${basePrefix}&e=pv',
    'structEvent':
      '${basePrefix}&e=se&' +
      'se_ca=${structEventCategory}&se_ac=${structEventAction}&' +
      'se_la=${structEventLabel}&se_pr=${structEventProperty}&' +
      'se_va=${structEventValue}',
  },
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
});
