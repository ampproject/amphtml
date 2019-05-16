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

export const MEDIAMETRIE_CONFIG = /** @type {!JsonObject} */ ({
  'requests': {
    'host': 'https://prof.estat.com/m/web',
    'pageview':
      '${host}/${serial}?' +
      'c=${level1}' +
      '&dom=${ampdocUrl}' +
      '&enc=${documentCharset}' +
      '&l3=${level3}' +
      '&l4=${level4}' +
      '&n=${random}' +
      '&p=${level2}' +
      '&r=${documentReferrer}' +
      '&sch=${screenHeight}' +
      '&scw=${screenWidth}' +
      '&tn=amp' +
      '&v=1' +
      '&vh=${availableScreenHeight}' +
      '&vw=${availableScreenWidth}',
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
