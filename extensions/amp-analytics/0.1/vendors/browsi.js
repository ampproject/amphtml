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

const BROWSI_CONFIG = jsonLiteral({
  'transport': {'beacon': true, 'xhrpost': true, 'image': false},
  'requests': {
    'host': 'https://events.browsiprod.com/events/amp',
    'base':
      '${host}?' +
      'pk=${pubKey}' +
      '&sk=${siteKey}' +
      '&et=${type}' +
      '&pvid=PAGE_VIEW_ID_64' +
      '&aid=${ampdocUrl}' +
      '&now=${timestamp}',
    'engagement': '${base}&ul=${scrollTop}&top=${totalEngagedTime}',
    'pageview':
      '${base}' +
      '&ref=${documentReferrer}' +
      '&sh=${viewportHeight}' +
      '&pl=${scrollHeight}' +
      '&plt=${pageLoadTime}' +
      '&clt=${contentLoadTime}' +
      '&nt=${navType}' +
      '&eup=${extraUrlParams}',
    'visibility':
      '${base}' +
      '&adix=${index}' +
      '&ex=${elementX}' +
      '&ey=${elementY}' +
      '&ew=${elementWidth}' +
      '&eh=${elementHeight}',
  },
  'triggers': {
    'page-view': {
      'on': 'visible',
      'request': 'pageview',
      'vars': {
        'type': 'pageview',
      },
    },
    'timer': {
      'on': 'timer',
      'timerSpec': {
        'interval': 3,
        'maxTimerLength': 30,
      },
      'request': 'engagement',
      'vars': {
        'type': 'engagement',
      },
    },
    'v100-0': {
      'on': 'visible',
      'request': 'visibility',
      'selector': "amp-ad[data-amp-slot-index='0']",
      'important': 'true',
      'visibilitySpec': {
        'visiblePercentageMin': 100,
        'continuousTimeMin': 1000,
        'repeat': false,
      },
      'vars': {
        'type': 'v100',
        'index': 0,
      },
    },
  },
});

export {BROWSI_CONFIG};
