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

export const BYSIDE_CONFIG = /** @type {!JsonObject} */ ({
  'vars': {
    'webcareZone': 'webcare',
    'webcareId': '',
    'channel': '',
    'fid': '',
    'lang': 'pt',
  },
  'requests': {
    'host': '//${webcareZone}.byside.com/',
    'base': '${host}BWA${webcareId}/amp/',
    'pageview': '${base}pixel.php',
    'event':
      '${base}signal.php?event_id=${eventId}' +
      '&event_label=${eventLabel}&fields=${fields}',
  },
  'extraUrlParams': {
    'webcare_id': '${webcareId}',
    'bwch': '${channel}',
    'lang': '${lang}',
    'fid': '${fid}',
    'bwit': 'A',
    'tuid': '${clientId(byside_webcare_tuid)}',
    'suid': '',
    'puid': '${pageViewId}p${timestamp}',
    'referrer': '${documentReferrer}',
    'page': '${sourceUrl}',
    'amppage': '${ampdocUrl}',
    'bwpt': '${title}',
    'bres': '${viewportWidth}x${viewportHeight}',
    'res': '${screenWidth}x${screenHeight}',
    'v': 'v20171116a',
    'ampv': '${ampVersion}',
    'viewer': '${viewer}',
    'ua': '${userAgent}',
    'r': '${random}',
  },
  'triggers': {
    'pageview': {
      'on': 'visible',
      'request': 'pageview',
    },
  },
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
});
