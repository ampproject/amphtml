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

  // Default parent configuration applied to all amp-analytics tags.
  'default': {
    'vars': {
      'random': 'RANDOM',
      'canonicalUrl': 'CANONICAL_URL',
      'canonicalHost': 'CANONICAL_HOST',
      'canonicalPath': 'CANONICAL_PATH',
      'documentReferrer': 'DOCUMENT_REFERRER',
      'title': 'TITLE',
      'ampdocUrl': 'AMPDOC_URL',
      'ampdocHost': 'AMPDOC_HOST',
      'pageViewId': 'PAGE_VIEW_ID',
      'clientId': 'CLIENT_ID',
      'timestamp': 'TIMESTAMP',
      'timezone': 'TIMEZONE',
      'scrollTop': 'SCROLL_TOP',
      'scrollLeft': 'SCROLL_LEFT',
      'scrollWidth': 'SCROLL_WIDTH',
      'scrollHeight': 'SCROLL_HEIGHT',
      'screenWidth': 'SCREEN_WIDTH',
      'screenHeight': 'SCREEN_HEIGHT'
    }
    // TODO(btownsend, #871): Add a generic hit format to make custom analytics
    // easier.
  },

  'googleanalytics': {
    'host': 'www.google-analytics.com',
    'method': 'GET',
    'requests': {
      'baseHit': '/collect?v=1&_v=a0&aip=true&_s=${hitCount}&' +
          'dl=${canonicalUrl}&dt=${title}&sr=${screenWidth}x${screenHeight}&' +
          '_utmht=${timestamp}&jid=&cid=${clientId(_ga)}&tid=${account}',
      'pageview': '/r${baseHit}&t=pageview&_r=1',
      'event': '${baseHit}&t=event&ec=${eventCategory}&ea=${eventAction}&' +
          'el=${eventLabel}&ev=${eventValue}',
      'social': '${baseHit}&t=social&sa=${socialAction}&sn=${socialNetwork}&' +
          'st=${socialActionTarget}'
    },
    'optout': '_gaUserPrefs.ioo'
  }
};

