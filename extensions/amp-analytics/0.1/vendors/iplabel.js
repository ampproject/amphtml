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

export const IPLABEL_CONFIG = /** @type {!JsonObject} */ ({
  'requests': {
    'collectorUrl': 'm.col.ip-label.net',
    'endpoint': 'https://${collectorUrl}/coll/',
    'onload':
      '${endpoint}?' +
      'T=${trackerId}&' +
      'm=' +
      '2502|${navTiming(navigationStart)}|' +
      '2508|${navTiming(domainLookupStart)}|' +
      '2509|${navTiming(domainLookupEnd)}|' +
      '2510|${navTiming(connectStart)}|' +
      '2512|${navTiming(connectEnd)}|' +
      '2514|${navTiming(responseStart)}|' +
      '2515|${navTiming(responseEnd)}|' +
      '2517|${navTiming(domInteractive)}|' +
      '2520|${navTiming(loadEventStart)}' +
      '&ts=${timestamp}' +
      '&ua=${userAgent}' +
      '&d=${ipldim}' +
      '&i=${clientip}' +
      '&d[1]=${customdim}' +
      '&d[2]=${business}' +
      '&d[3]=${abtesting}' +
      '&d[4]=${infrastructure}' +
      '&d[5]=${customer}' +
      '&u=${urlgroup}' +
      '&w=${availableScreenWidth}&h=${availableScreenHeight}' +
      '&r=${documentReferrer}' +
      '&l=${browserLanguage}',
  },
  'triggers': {
    'trackPageview': {
      'on': 'visible',
      'request': 'onload',
    },
  },
  'transport': {
    'beacon': true,
    'xhrpost': true,
    'image': {'suppressWarnings': true},
  },
  'vars': {
    'trackerId': 'notrackerID',
    'customdim': '',
    'business': '',
    'abtesting': '',
    'infrastructure': '',
    'customer': '',
    'clientip': '',
    'urlgroup': '',
  },
});
