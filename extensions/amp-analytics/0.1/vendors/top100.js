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

export const TOP100_CONFIG = /** @type {!JsonObject} */ ({
  'vars': {
    'pid': '',
    'rid': 'PAGE_VIEW_ID',
    'ruid': 'CLIENT_ID(ruid)',
    'version': '1.0.0',
  },
  'requests': {
    'host': 'https://kraken.rambler.ru',
    'base':
      '${host}/cnt/?pid=${pid}' +
      '&rid=${rid}' +
      '&v=${version}' +
      '&rn=${random}' +
      '&ruid=${ruid}' +
      '&ct=amp',
    'pageview': '${base}&et=pv${_pageData}${_screenData}',
    '_screenData':
      '&sr=${screenWidth}x${screenHeight}' +
      '&cd=${screenColorDepth}-bit' +
      '&bs=${scrollWidth}x${scrollHeight}',
    '_pageData':
      '&pt=${title}' +
      '&rf=${documentReferrer}' +
      '&en=${documentCharset}' +
      '&la=${browserLanguage}' +
      '&tz=${timezone}',
  },
  'triggers': {
    'trackPageview': {
      'on': 'visible',
      'request': 'pageview',
    },
  },
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
});
