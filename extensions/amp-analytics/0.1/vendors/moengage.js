/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {jsonLiteral} from '../../../../src/json';

const MOEENGAGE_CONFIG = jsonLiteral({
  'requests': {
    'addDevice':
      'https://websdk.moengage.com/v2/device/add?os=${os}&app_id=${appId}&sdk_ver=${sdk_ver}&app_ver=${app_ver}&device_tz=${device_tz}&os_platform=${os_platform}&unique_id=${unique_id}&device_ts=${timestamp}&isAmp=true',
    'event':
      'https://websdk.moengage.com/v2/report/add?os=${os}&app_id=${appId}&sdk_ver=${sdk_ver}&app_ver=${app_ver}&device_tz=${device_tz}&os_platform=${os_platform}&unique_id=${unique_id}&device_ts=${timestamp}',
  },
  'vars': {
    'os': 'mweb',
    'sdk_ver': '0.0.0',
    'app_ver': '1',
    'device_tz': '${timezone}',
    'os_platform': '${userAgent}',
    'unique_id': '${clientId(moe_uuid)}',
  },
  'extraUrlParams': {
    'a': {
      'timestamp': '${timestamp}',
      'URL': '${ampdocUrl}',
    },
    'meta': {
      'bid': '${random}',
    },
    'url': '${ampdocUrl}',
  },
  'triggers': {
    'pageViewed': {
      'on': 'visible',
      'request': ['addDevice', 'event'],
      'extraUrlParams': {
        'e': 'MOE_PAGE_VIEWED',
      },
    },
  },
  'transport': {
    'xhrpost': true,
    'useBody': true,
  },
});

export {MOEENGAGE_CONFIG};
