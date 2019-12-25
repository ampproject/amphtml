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
  'vars': {
    'pubKey': '',
    'siteKey': '',
  },
  'transport': {'beacon': true, 'xhrpost': true, 'image': false},
  'requests': {
    'base':
      'https://www.browsi.com/ampData?' +
      'pk=${pubKey}' +
      '&sk=${siteKey}' +
      '&et=${type}' +
      '&pvid=PAGE_VIEW_ID_64',
    'engagement':
      '${base}' +
      '&path=${canonicalPath}' +
      '&now=${timestamp}' +
      '&st=${scrollTop}' +
      '&ph=${scrollHeight}',
    'pageview':
      '${base}' +
      '&client=${clientId(siteKey)}' +
      '&lng=${browserLanguage}' +
      '&ref=${documentReferrer}' +
      '&pdt=${pageDownloadTime}' +
      '&plt=${pageLoadTime}' +
      '&t=${title}' +
      '&tzc=${timezoneCode}' +
      '&sh=${availableScreenHeight}' +
      '&sw=${availableScreenWidth}' +
      '&vh=${viewportHeight}' +
      '&vw=${viewportWidth}' +
      '&ua=${userAgent}',
    'visibility':
      '${base}' +
      '&isd=${initialScrollDepth}' +
      '&ir=${intersectionRatio}' +
      '&irct=${intersectionRect}' +
      '&msd=${maxScrollDepth}' +
      '&c=${counter(siteKey)}' +
      '&mcvt=${maxContinuousVisibleTime}' +
      '&tvt=${totalVisibleTime}' +
      '&fst=${firstSeenTime}' +
      '&lst=${lastSeenTime}' +
      '&fvt=${firstVisibleTime}' +
      '&lvt=${lastVisibleTime}' +
      '&mvp=${minVisiblePercentage}' +
      '&mxvp=${maxVisiblePercentage}' +
      '&ex=${elementX}' +
      '&ey=${elementY}' +
      '&ew=${elementWidth}' +
      '&eh=${elementHeight}' +
      '&tt=${totalTime}' +
      '&tet=${totalEngagedTime}' +
      '&ltv=${loadTimeVisibility}' +
      '&bas=${backgroundedAtStart}' +
      '&b=${backgrounded}' +
      '&subTitle=${subTitle}',
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
        'maxTimerLength': 180,
      },
      'request': 'engagement',
      'vars': {
        'type': 'engagement',
      },
    },
    'visibility50': {
      'on': 'visible',
      'request': 'visibility',
      'selector': 'amp-ad',
      'important': 'true',
      'visibilitySpec': {
        'visiblePercentageMin': 50,
        'totalTimeMin': 1000,
        'continuousTimeMin': 200,
        'continuousTimeMax': 20000,
        'repeat': false,
      },
      'vars': {
        'type': 'visibility50',
      },
    },
    'visibility100-1': {
      'on': 'visible',
      'request': 'visibility',
      'selector': 'amp-ad:nth-child(1)',
      'important': 'true',
      'visibilitySpec': {
        'visiblePercentageMin': 100,
        'totalTimeMin': 1000,
        'continuousTimeMin': 1000,
        'continuousTimeMax': 10000,
        'repeat': false,
      },
      'vars': {
        'type': 'visibility100',
      },
    },
    'visibility100-2': {
      'on': 'visible',
      'request': 'visibility',
      'selector': 'amp-ad:nth-child(2)',
      'important': 'true',
      'visibilitySpec': {
        'visiblePercentageMin': 100,
        'totalTimeMin': 1000,
        'continuousTimeMin': 1000,
        'continuousTimeMax': 10000,
        'repeat': false,
      },
      'vars': {
        'type': 'visibility100',
      },
    },
  },
});

export {BROWSI_CONFIG};
