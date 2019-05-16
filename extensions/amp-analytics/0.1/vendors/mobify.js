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

export const MOBIFY_CONFIG = /** @type {!JsonObject} */ ({
  'vars': {
    'projectSlug': 'mobify-project-id',
    'templateName': 'page-type',
  },
  'requests': {
    '_host': 'https://engagement-collector.mobify.net',
    '_dimensions': [
      '%22platform%22%3a%22AMP%22',
      '%22client_id%22%3a%22${clientId(sandy-client-id)}%22',
      '%22title%22%3a%22${title}%22',
      '%22location%22%3a%22${sourceUrl}%22',
      '%22page%22%3a%22${sourcePath}%22',
      '%22src_location%22%3a%22${ampdocUrl}%22',
      '%22referrer%22%3a%22${documentReferrer}%22',
      '%22templateName%22%3a%22${templateName}%22',
    ].join('%2c'),
    '_basePrefix':
      '${_host}/s.gif?' +
      'slug=${projectSlug}&' +
      'timestamp_local=${timestamp}&' +
      'channel=web&' +
      'dimensions=%7b${_dimensions}%7d',
    'ampstart':
      '${_basePrefix}&data=%7b%22category%22%3a%22timing%22%2c' +
      '%22action%22%3a%22ampStart%22%2c%22value%22' +
      '%3a${navTiming(navigationStart,domLoading)}%7d',
    'pageview': '${_basePrefix}&data=%7b%22action%22%3a%22pageview%22%7d',
    'pageload':
      '${_basePrefix}&data=%7b%22category%22%3a%22timing%22%2c' +
      '%22action%22%3a%22load%22%2c%22value%22%3a${pageLoadTime}%7d',
    'pagedcl':
      '${_basePrefix}&data=%7b%22category%22%3a%22timing%22%2c' +
      '%22action%22%3a%22DOMContentLoaded%22%2c%22value%22' +
      '%3a${contentLoadTime}%7d',
  },
  'triggers': {
    'triggerName': {
      'on': 'visible',
      'request': ['ampstart', 'pageload', 'pagedcl'],
    },
    'pageview': {
      'on': 'ini-load',
      'request': 'pageview',
    },
  },
  'transport': {
    'beacon': true,
    'xhrpost': false,
    'image': true,
  },
});
