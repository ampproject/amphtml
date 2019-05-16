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

export const CXENSE_CONFIG = /** @type {!JsonObject} */ ({
  'requests': {
    'host': 'https://scomcluster.cxense.com',
    'base': '${host}/Repo/rep.gif',
    'pageview':
      '${base}?ver=1&typ=pgv&sid=${siteId}&ckp=${clientId(cX_P)}&' +
      'loc=${sourceUrl}&rnd=${random}&ref=${documentReferrer}&' +
      'ltm=${timestamp}&wsz=${screenWidth}x${screenHeight}&' +
      'bln=${browserLanguage}&chs=${documentCharset}&' +
      'col=${screenColorDepth}&tzo=${timezone}&cp_cx_channel=amp',
  },
  'triggers': {
    'defaultPageview': {
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
