/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS-IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {jsonLiteral} from '../../../../src/json';

const CONTENTSQUARE_CONFIG = jsonLiteral({
  'requests': {
    'base': 'https://c.contentsquare.net',
    'pageview':
      '${base}/pageview?pid=${projectId}' +
      '&pn=${counter(page_number)}&hd=${timestamp}' +
      '&dw=${screenWidth}&dh=${scrollHeight}' +
      '&sw=${screenWidth}&sh=${screenHeight}' +
      '&dr=${externalReferrer}&url=${ampdocUrl}' +
      '&la=${browserLanguage}&v=${version}' +
      '&sn=${sn}',
  },
  'triggers': {
    'trackPageview': {
      'on': 'visible',
      'request': 'pageview',
    },
  },
  'extraUrlParams': {
    'uu': '${uuid}',
  },
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
  'vars': {
    'version': 'amp-0.0.1',
    'csid': '$MATCH(COOKIE(_cs_id), `([0-9a-fA-F-]{36})`, 1)',
    'sn': '$MATCH(COOKIE(_cs_id), `([0-9a-fA-F-]{36}.)([0-9]+)`, 2)',
    'uuid': '$IF(${csid}, ${csid}, CLIENT_ID(_cs_id))',
  },
  'cookies': {
    'cookieMaxAge': 341164037, // 13 months in seconds
    '_cs_amp': {
      'value': 'CLIENT_ID(amp-cs).COUNTER(page_number)',
    },
  },
});

export {CONTENTSQUARE_CONFIG};
