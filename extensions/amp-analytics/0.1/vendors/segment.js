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

export const SEGMENT_CONFIG = /** @type {!JsonObject} */ ({
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
  'vars': {
    'anonymousId': 'CLIENT_ID(AMP_ECID_GOOGLE,,_ga)',
  },
  'requests': {
    'host': 'https://api.segment.io/v1/pixel',
    'base':
      '?writeKey=${writeKey}' +
      '&context.library.name=amp' +
      '&anonymousId=${anonymousId}' +
      '&context.locale=${browserLanguage}' +
      '&context.page.path=${canonicalPath}' +
      '&context.page.url=${canonicalUrl}' +
      '&context.page.referrer=${documentReferrer}' +
      '&context.page.title=${title}' +
      '&context.screen.width=${screenWidth}' +
      '&context.screen.height=${screenHeight}',
    'page': '${host}/page${base}&name=${name}',
    'track': '${host}/track${base}&event=${event}',
  },
  'triggers': {
    'page': {
      'on': 'visible',
      'request': 'page',
    },
  },
  'linkers': {
    'segment': {
      'ids': {
        's_amp_id': '${anonymousId}',
      },
      'proxyOnly': false,
    },
  },
  'cookies': {
    '_ga': {
      'value': 'LINKER_PARAM(segment, s_amp_id)',
    },
  },
});
