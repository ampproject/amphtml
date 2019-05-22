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

export const OEWADIRECT_CONFIG = /** @type {!JsonObject} */ ({
  'transport': {'beacon': false, 'xhrpost': false, 'image': true},
  'requests': {
    'pageview':
      'https://${s}.oewabox.at/j0=,,,r=${canonicalUrl};+,amp=1+cp=${cp}+ssl=1+hn=${canonicalHost};;;?lt=${pageViewId}&x=${screenWidth}x${screenHeight}x24&c=CLIENT_ID(oewa)',
  },
  'triggers': {
    'pageview': {
      'on': 'visible',
      'request': 'pageview',
    },
  },
});
