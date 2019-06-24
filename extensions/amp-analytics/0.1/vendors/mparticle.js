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

export const MPARTICLE_CONFIG = /** @type {!JsonObject} */ ({
  'vars': {
    'eventType': 'Unknown',
    'debug': false,
    'amp_clientId': 'CLIENT_ID(mparticle_amp_id)',
  },
  'requests': {
    'host': 'https://pixels.mparticle.com',
    'endpointPath': '/v1/${apiKey}/Pixel',
    'baseParams':
      'et=${eventType}&' +
      'amp_id=${amp_clientId}&' +
      'attrs_k=${eventAttributes_Keys}&' +
      'attrs_v=${eventAttributes_Values}&' +
      'ua_k=${userAttributes_Keys}&' +
      'ua_v=${userAttributes_Values}&' +
      'ui_t=${userIdentities_Types}&' +
      'ui_v=${userIdentities_Values}&' +
      'flags_k=${customFlags_Keys}&' +
      'flags_v=${customFlags_Values}&' +
      'ct=${timestamp}&' +
      'dbg=${debug}&' +
      'lc=${location}&' +
      'av=${appVersion}',
    'pageview':
      '${host}${endpointPath}?' +
      'dt=ScreenView&' +
      'n=${pageName}&' +
      'hn=${ampdocUrl}&' +
      'ttl=${title}&' +
      'path=${canonicalPath}&' +
      '${baseParams}',
    'event':
      '${host}${endpointPath}?' +
      'dt=AppEvent&' +
      'n=${eventName}&' +
      '${baseParams}',
  },
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
});
