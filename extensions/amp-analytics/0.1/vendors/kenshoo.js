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

export const KENSHOO_CONFIG = /** @type {!JsonObject} */ ({
  'vars': {
    'clientId': 'CLIENT_ID(ken_amp_id)',
    'channelClickId': 'QUERY_PARAM(gclid)',
    'tid': 'KT-XXXXX-XXX',
    'userId': '<USER_ID>',
  },
  'requests': {
    'host': 'https://amp.xg4ken.com',
    'parameters':
      'ampcid=${clientId}' +
      '&chcid=${channelClickId}' +
      '&tid=${tid}' +
      '&uid=${userId}' +
      '&domain=${canonicalHostname}',
    'landingPage': '${host}/amp/v1/match?${parameters}',
  },
  'triggers': {
    'trackLandingPage': {
      'enabled': 'QUERY_PARAM(gclid)',
      'on': 'visible',
      'request': 'landingPage',
    },
  },
  'linkers': {
    'linker': {
      'ids': {
        'clientId': '${clientId}',
        'channelClickId': '${channelClickId}',
      },
      'proxyOnly': false,
      'enabled': true,
    },
  },
  'cookies': {
    'enabled': true,
    'ken_gclid': {
      'value': 'QUERY_PARAM(gclid)',
    },
    'ken_amp_gclid': {
      'value': 'QUERY_PARAM(gclid)',
    },
  },
});
