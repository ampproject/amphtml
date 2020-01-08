/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

const CAPTAINMETRICS_CONFIG = jsonLiteral({
  'transport': {
    'beacon': true,
    'xhrpost': true,
    'useBody': true,
    'image': false,
  },
  'vars': {
    'hostDomain': 'photon.captainmetrics.com',
    'deviceId': 'CLIENT_ID(_cm_cid)',
    'sessionId': '$HASH(PAGE_VIEW_IDCLIENT_ID(_cm_cid))',
    'page': 'SOURCE_URL',
    'projectId': '',
  },
  'requests': {
    'hit': {
      'baseUrl': 'https://${hostDomain}/amp/',
    },
  },
  'extraUrlParams': {
    'cId': '${deviceId}',
    'sId': '${sessionId}',
    'ts': '${timestamp}',
    'rand': '${random}',
    'pId': '${projectId}',
    'ampV': '${ampVersion}',
    'v': '1',
    'lang': '${browserLanguage}',
    'ua': '${userAgent}',
    'res': '${screenHeight}x${screenWidth}',
    'aRes': '${availableScreenHeight}x${availableScreenWidth}',
    'off': '${timezone}',
    'tz': '${timezoneCode}',
    'lp': '${page}',
    'ref': '${externalReferrer}',
    'ampRef': '${ampdocUrl}',
    'pageId': '${pageViewId}',
  },
  'linkers': {
    '_cm_amp': {
      'ids': {
        'cId': '${deviceId}',
        'sId': '${sessionId}',
      },
      'enabled': true,
      'proxyOnly': false,
    },
  },
  'cookies': {
    '_cm_cid': {
      'value': 'LINKER_PARAM(_cm_amp, cId)',
    },
  },
});

export {CAPTAINMETRICS_CONFIG};
