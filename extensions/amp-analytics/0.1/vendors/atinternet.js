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

export const ATINTERNET_CONFIG = /** @type {!JsonObject} */ ({
  'transport': {'beacon': false, 'xhrpost': false, 'image': true},
  'vars': {
    'pixelPath': 'hit.xiti',
    'domain': '.xiti.com',
  },
  'requests': {
    'base':
      'https://${log}${domain}/${pixelPath}?s=${site}&ts=${timestamp}&r=${screenWidth}x${screenHeight}x${screenColorDepth}&re=${availableScreenWidth}x${availableScreenHeight}',
    'suffix': '&medium=amp&${extraUrlParams}&ref=${documentReferrer}',
    'pageview': '${base}&p=${title}&s2=${level2}${suffix}',
    'click':
      '${base}&' +
      'pclick=${title}&' +
      's2click=${level2}&' +
      'p=${label}&' +
      's2=${level2Click}&' +
      'type=click&click=${type}${suffix}',
  },
});
