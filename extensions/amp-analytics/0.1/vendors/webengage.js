/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {jsonLiteral} from '../../../../src/json';

const WEBENGAGE_CONFIG = jsonLiteral({
  'requests': {
    'base':
      'https://c.${region}.webengage.com/amp?licenseCode=${licenseCode}&luid=${clientId(we_luid)}&pageUrl=${canonicalUrl}&pageTitle=${title}&referrer=${documentReferrer}&vh=${viewportHeight}&vw=${viewportWidth}&category=application',
    'wePageview': {
      'baseUrl': '${base}&eventName=Page Viewed',
    },
  },
  'extraUrlParams': {
    'isAmp': 1,
  },
  'triggers': {
    'wePageviewTrigger': {
      'on': 'visible',
      'request': 'wePageview',
    },
  },
  'linkers': {
    '_we_linker': {
      'enabled': true,
      'ids': {
        'we_luid': '${clientId(we_luid)}',
      },
      'proxyOnly': false,
    },
  },
  'cookies': {
    'we_luid': {
      'value':
        '$IF(LINKER_PARAM(_we_linker, we_luid),LINKER_PARAM(_we_linker, we_luid))',
    },
  },
});

export {WEBENGAGE_CONFIG};
