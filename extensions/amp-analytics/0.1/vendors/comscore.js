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

import {jsonLiteral} from '../../../../src/json';

const COMSCORE_CONFIG = jsonLiteral({
  'vars': {
    'c2': '1000001',
  },
  'requests': {
    'host': 'https://sb.scorecardresearch.com',
    'base': '${host}/b?',
    'pageview':
      '${base}c1=2' +
      '&c2=${c2}' +
      '&cs_ucfr=$IF($EQUALS(${consentState}, sufficient), 1)$IF($EQUALS(${consentState}, insufficient), 0)$IF($EQUALS(${consentState}, ), )' +
      '&cs_amp_consent=${consentState}' +
      '&cs_pv=${pageViewId}' +
      '&c12=${clientId(comScore)}' +
      '&rn=${random}' +
      '&c8=${title}' +
      '&c7=${canonicalUrl}' +
      '&c9=${documentReferrer}' +
      '&cs_c7amp=${ampdocUrl}',
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

export {COMSCORE_CONFIG};
