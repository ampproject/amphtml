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

export const SIMPLEREACH_CONFIG = /** @type {!JsonObject} */ ({
  'vars': {
    'pid': '',
    'published_at': '',
    'authors': [],
    'channels': [],
    'tags': [],
  },
  'requests': {
    'host': 'https://edge.simplereach.com',
    'baseParams':
      'amp=true' +
      '&pid=${pid}' +
      '&title=${title}' +
      '&url=${canonicalUrl}' +
      '&date=${published_at}' +
      '&authors=${authors}' +
      '&channels=${categories}' +
      '&tags=${tags}' +
      '&referrer=${documentReferrer}' +
      '&page_url=${sourceUrl}' +
      '&user_id=${clientId(sr_amp_id)}' +
      '&domain=${canonicalHost}' +
      '&article_id=${article_id}' +
      '&ignore_metadata=${ignore_metadata}',
    'visible': '${host}/n?${baseParams}',
    'timer': '${host}/t?${baseParams}' + '&t=5000' + '&e=5000',
  },
  'triggers': {
    'visible': {
      'on': 'visible',
      'request': 'visible',
    },
    'timer': {
      'on': 'timer',
      'timerSpec': {
        'interval': 5,
        'maxTimerLength': 1200,
      },
      'request': 'timer',
    },
  },
});
