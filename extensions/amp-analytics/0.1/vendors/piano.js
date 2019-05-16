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

export const PIANO_CONFIG = /** @type {!JsonObject} */ ({
  'requests': {
    'host': 'https://api-v3.tinypass.com',
    'basePrefix': '/api/v3',
    'baseSuffix':
      '&pageview_id=${pageViewId}&rand=${random}&' +
      'amp_client_id=${clientId}&aid=${aid}',
    'pageview':
      '${host}${basePrefix}/page/track?url=${canonicalUrl}&' +
      'referer=${documentReferrer}&content_created=${contentCreated}&' +
      'content_author=${contentAuthor}&content_section=${contentSection}&' +
      'timezone_offset=${timezone}&tags=${tags}&amp_url=${ampdocUrl}&' +
      'screen=${screenWidth}x${screenHeight}${baseSuffix}',
  },
});
