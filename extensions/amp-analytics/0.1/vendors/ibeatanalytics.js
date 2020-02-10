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

const IBEATANALYTICS_CONFIG = jsonLiteral({
  'requests': {
    'host': 'https://ibeat.indiatimes.com',
    'track':
      '${host}/ping-amp?url=${ampdocUrl}' +
      '&sid=${clientId(_iibeat_session)}' +
      '&ua=${userAgent}' +
      '&ref=${documentReferrer}' +
      '&at=${incrementalEngagedTime}' +
      '&tt=${totalTime}' +
      '&pid=${pageViewId}' +
      '&d=${d}' +
      '&ct=${ct}' +
      '&pt=${pt}' +
      '&au=${au}' +
      '&ag=${ag}' +
      '&aid=${aid}' +
      '&cn=${canonicalUrl}' +
      '&ctIds=${ctIds}',
  },
  'triggers': {
    'trackInterval': {
      'on': 'timer',
      'timerSpec': {
        'interval': 15,
        'maxTimerLength': 7200,
      },
      'request': 'track',
    },
  },
});

export {IBEATANALYTICS_CONFIG};
