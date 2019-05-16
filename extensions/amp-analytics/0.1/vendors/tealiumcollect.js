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

export const TEALIUMCOLLECT_CONFIG = /** @type {!JsonObject} */ ({
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
  'vars': {
    'account': 'TEALIUM_ACCOUNT',
    'profile': 'TEALIUM_PROFILE',
    'datasource': 'TEALIUM_DATASOURCE',
    'visitor_id': 'CLIENT_ID(AMP_ECID_GOOGLE,,_ga)',
  },
  'requests': {
    'host': 'https://collect.tealiumiq.com',
    'base':
      '${host}/event?${tealium}&' +
      '${dom1}&${dom2}&${datetime}&' +
      'tealium_event=${tealium_event}&' +
      'amp_version=${ampVersion}&' +
      'amp_request_count=${requestCount}',
    'tealium':
      'tealium_account=${account}&' +
      'tealium_profile=${profile}&' +
      'tealium_datasource=${datasource}&' +
      'tealium_visitor_id=${visitor_id}',
    'dom1':
      'url=${sourceUrl}&ampdoc_url=${ampdocUrl}&' +
      'domain=${sourceHost}&pathname=${sourcePath}&' +
      'amp_hostname=${ampdocHostname}&' +
      'canonical_hostname=${canonicalHostname}',
    'dom2':
      'title=${title}&' +
      'viewport_width=${availableScreenWidth}&' +
      'viewport_height=${availableScreenHeight}',
    'datetime':
      'timestamp=${timestamp}&' + 'tz=${timezone}&lang=${browserLanguage}',
    'pageview':
      '${base}&referrer=${documentReferrer}&' +
      'screen_size=${screenWidth}x${screenHeight}&' +
      'content_load_ms=${contentLoadTime}&' +
      'page_view_id=${pageViewId}',
    'event': '${base}&' + 'scroll_y=${scrollTop}&scroll_x=${scrollLeft}',
  },
  'triggers': {
    'defaultPageview': {
      'on': 'visible',
      'request': 'pageview',
      'vars': {
        'tealium_event': 'screen_view',
      },
    },
  },
});
