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

export const VPONANALYTICS_CONFIG = /** @type {!JsonObject} */ ({
  'vars': {
    'ctid': '${clientId(vpadn-ctid)}',
  },
  'requests': {
    'host': 'https://tags-dmp.vpadn.com',
    'sync': 'https://ids-dmp.vpadn.com/set?t=${timestamp}&dn=&ctid=${ctid}',
    'scroll':
      '${host}/et?t=${timestamp}&sdkn=j&sdkv=1.2.0&lk=${licence_key}' +
      '&en=UTF-8&ctid=${ctid}&ev=element_interact&' +
      'pl={"name":"${category}","action":"${action}",' +
      '"value":"${documentReferrer}"}',
    'event':
      '${host}/et?t=${timestamp}&sdkn=j&sdkv=1.2.0&lk=${licence_key}' +
      '&en=UTF-8&ctid=${ctid}&ev=${ev_name}&pl=${payload}',
    'elementInteract':
      '${host}/et?t=${timestamp}&sdkn=j&' +
      'sdkv=1.2.0&lk=${licence_key}' +
      '&en=UTF-8&ctid=${ctid}&ev=element_interact&' +
      'pl={"name":"${category}","action":"${action}",' +
      '"value":"${label}"}',
  },
  'extraUrlParams': {
    'is_amp': '1',
    'page_id': '${pageViewId}',
  },
  'triggers': {
    'cookieSync': {
      'on': 'visible',
      'request': 'sync',
    },
    'trackPageview': {
      'on': 'visible',
      'request': 'event',
      'vars': {
        'ev_name': 'page_view',
        'payload':
          '{"title":"${title}","current":"${canonicalUrl}"' +
          ',"previous":"${documentReferrer}"}',
      },
    },
  },
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
});
