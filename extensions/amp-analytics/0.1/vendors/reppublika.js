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

export const REPPUBLIKA_CONFIG = /** @type {!JsonObject} */ ({
  'requests': {
    'host': 'https://t5.mindtake.com',
    'basePrefix': '/tag/cid/',
    'baseSuffix':
      'Service=${service}&Category=${category}&' +
      'Url=${sourceUrl}&Device=${device}&uid=${random}',
    'pageview': '${host}${basePrefix}${code}/track.gif?${baseSuffix}',
  },
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
});
