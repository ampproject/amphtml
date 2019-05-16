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

export const BURT_CONFIG = /** @type {!JsonObject} */ ({
  'vars': {
    'trackingKey': 'ignore',
    'category': '',
    'subCategory': '',
  },
  'requests': {
    'host': '//${trackingKey}.c.richmetrics.com/',
    'base':
      '${host}imglog?' +
      'e=${trackingKey}&' +
      'pi=${trackingKey}' +
      '|${pageViewId}' +
      '|${canonicalPath}' +
      '|${clientId(burt-amp-user-id)}&' +
      'ui=${clientId(burt-amp-user-id)}&' +
      'v=amp&' +
      'ts=${timestamp}&' +
      'sn=${requestCount}&',
    'pageview':
      '${base}' +
      'type=page&' +
      'ca=${category}&' +
      'sc=${subCategory}&' +
      'ln=${browserLanguage}&' +
      'lr=${documentReferrer}&' +
      'eu=${sourceUrl}&' +
      'tz=${timezone}&' +
      'pd=${scrollWidth}x${scrollHeight}&' +
      'sd=${screenWidth}x${screenHeight}&' +
      'wd=${availableScreenWidth}x${availableScreenHeight}&' +
      'ws=${scrollLeft}x${scrollTop}',
    'pageping': '${base}' + 'type=pageping',
  },
  'triggers': {
    'pageview': {
      'on': 'visible',
      'request': 'pageview',
    },
    'pageping': {
      'on': 'timer',
      'timerSpec': {
        'interval': 15,
        'maxTimerLength': 1200,
      },
      'request': 'pageping',
    },
  },
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
});
