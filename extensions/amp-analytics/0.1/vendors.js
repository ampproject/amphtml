/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @const {!JSONObject}
 */
export const ANALYTICS_CONFIG = {
  // TODO(btownsend, #871): Add a generic hit format to make custom analytics
  // easier.

  'googleanalytics': {
    'host': 'www.google-analytics.com',
    'method': 'GET',
    'vars': {
      // TODO(btownsend, #1116) These are placeholders to temporarily simulate
      // built-in vars. To be removed when amp-analytics.js is updated with
      // real built-in var support.
      'title': 'TITLE',
      'domain': 'CANONICAL_HOST',
      'path': 'CANONICAL_PATH',
      'hitCount': 'HIT_COUNT',
      'screenWidth': 'SCREEN_WIDTH',
      'screenHeight': 'SCREEN_HEIGHT',
      'timestamp': 'TIMESTAMP',
      'clientId': 'CLIENT_IDENTIFIER'
    },
    'requests': {
      'baseHit': '/collect?v=1&_v=a0&aip=true&_s=${hitCount}&dp=${path}&' +
          'dl=${domain}&dt=${title}&sr=${screenWidth}x${screenHeight}&' +
          '_utmht=${timestamp}&jid=&cid=${clientId}&tid=${account}',
      'pageview': '/r${baseHit}&t=pageview&_r=1',
      'event': '${baseHit}&t=event&ec=${eventCategory}&ea=${eventAction}&' +
          'el=${eventLabel}&ev=${eventValue}',
      'social': '${baseHit}&t=social&sa=${socialAction}&sn=${socialNetwork}&' +
          'st=${socialActionTarget}'
    },
    'optout': '_gaUserPrefs.ioo'
  }
};

