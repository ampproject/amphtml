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

const CHARTBEAT_CONFIG = jsonLiteral({
  'requests': {
    'host': 'https://ping.chartbeat.net',
    'basePrefix':
      '/ping?h=${domain}&' +
      'p=${canonicalPath}&' +
      'u=${clientId(_cb)}&' +
      'd=${canonicalHost}&' +
      'g=${uid}&' +
      'g0=${sections}&' +
      'g1=${authors}&' +
      'g2=${zone}&' +
      'g3=${sponsorName}&' +
      'g4=${contentType}&' +
      'c=${totalTime}&' +
      'x=${scrollTop}&' +
      'm=${maxScrollDepth}&' +
      'y=${scrollHeight}&' +
      'o=${scrollWidth}&' +
      'w=${viewportHeight}&' +
      'j=${decayTime}&' +
      'R=1&' +
      'W=0&' +
      'I=0&' +
      'E=${totalEngagedTime}&' +
      'r=${documentReferrer}&' +
      't=${pageViewId}${clientId(_cb)}&' +
      'b=${pageLoadTime}&' +
      'i=${title}&' +
      'T=${timestamp}&' +
      'tz=${timezone}&' +
      'sn=${requestCount}&' +
      'C=2',
    'baseSuffix': '&_',
    'interval': '${host}${basePrefix}${baseSuffix}',
    'anchorClick': '${host}${basePrefix}${baseSuffix}',
  },
  'triggers': {
    'trackInterval': {
      'on': 'timer',
      'timerSpec': {
        'interval': 15,
        'maxTimerLength': 7200,
      },
      'request': 'interval',
      'vars': {
        'decayTime': 30,
      },
    },
    'trackAnchorClick': {
      'on': 'click',
      'selector': 'a',
      'request': 'anchorClick',
      'vars': {
        'decayTime': 30,
      },
    },
  },
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
});

export {CHARTBEAT_CONFIG};
