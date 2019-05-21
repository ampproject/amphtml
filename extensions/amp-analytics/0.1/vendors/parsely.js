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

export const PARSELY_CONFIG = /** @type {!JsonObject} */ ({
  'requests': {
    'host': 'https://srv.pixel.parsely.com',
    'basePrefix':
      '${host}/plogger/?' +
      'rand=${timestamp}&' +
      'idsite=${apikey}&' +
      'url=${ampdocUrl}&' +
      'urlref=${documentReferrer}&' +
      'screen=${screenWidth}x${screenHeight}%7C' +
      '${availableScreenWidth}x${availableScreenHeight}%7C' +
      '${screenColorDepth}&' +
      'title=${title}&' +
      'date=${timestamp}&' +
      'ampid=${clientId(_parsely_visitor)}',
    'pageview':
      '${basePrefix}&action=pageview&metadata=' +
      '{"canonical_url":"${canonicalUrl}"}',
    'heartbeat':
      '${basePrefix}&action=heartbeat' +
      '&tt=${totalEngagedTime}&inc=${incrementalEngagedTime(parsely-js)}',
  },
  'triggers': {
    'defaultPageview': {
      'on': 'visible',
      'request': 'pageview',
    },
    'defaultHeartbeat': {
      'on': 'timer',
      'enabled': '${incrementalEngagedTime(parsely-js,false)}',
      'timerSpec': {
        'interval': 10,
        'maxTimerLength': 7200,
      },
      'request': 'heartbeat',
    },
  },
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
});
