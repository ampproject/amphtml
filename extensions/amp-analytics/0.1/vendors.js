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
    'transport': {'beacon': true, 'xhrpost': true, 'image': true},
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
      // Vars that GA can use: documentEncoding, userLanguage
    }
    // TODO(btownsend, #871): Add a generic hit format to make custom analytics
    // easier.
  },

  'googleanalytics': {
    'vars': {
      'eventValue': "0",
      'documentLocation': 'AMPDOC_URL'
    },
    'requests': {
      'host': 'https://www.google-analytics.com',
      'basePrefix': 'v=1&_v=a0&aip=true&_s=${hitCount}&dr=${documentReferrer}' +
          'dt=${title}&sr=${screenWidth}x${screenHeight}&_utmht=${timestamp}&' +
          'jid=&cid=${clientId(_ga)}&tid=${account}&dl=${documentLocation}',
      'baseSuffix': '&a=${pageViewId}&z=${random}',
      'pageview': '${host}/r/collect?${basePrefix}&t=pageview&' +
          '_r=1${baseSuffix}',
      'event': '${host}/collect?${basePrefix}&t=event&' +
          'ec=${eventCategory}&ea=${eventAction}&el=${eventLabel}&' +
          'ev=${eventValue}${baseSuffix}',
      'social': '${host}/collect?${basePrefix}&t=social&' +
          'sa=${socialAction}&sn=${socialNetwork}&st=${socialTarget}' +
          '${baseSuffix}'
    },
    'optout': '_gaUserPrefs.ioo'
  },

  'piano': {
    'vars': {
      'aid': "AIDAIDAID",
      'contentCreated': 'contentCreated',
      'contentAuthor': 'contentAuthor',
      'contentSection': 'contentSection',
      'tags': 'tags'
    },
    'requests': {
      'host': 'https://api-v3.tinypass.com',
      'basePrefix': '/api/v3',
      'baseSuffix': '&pageview_id=${pageViewId}&rand=${random}',
      'pageview': '${host}${basePrefix}/page/track?url=${canonicalUrl}&' +
          'referer=${documentReferrer}&content_created=${contentCreated}&' +
          'content_author=${contentAuthor}&content_section=${contentSection}&' +
          'timezone_offset=${timezone}&tags=${tags}&amp_url=${ampdocUrl}&' +
          'screen=${screenWidth}x${screenHeight}',
      // TODO: piano request for unload beacon
      //'unload': '${host}${basePrefix}/page/unload?aid=${aid}&amp_url=${ampdocUrl}&' +
      //    'time_on_page=${timeOnPage}&scroll_depth=${scrollTop}'
    },
    'triggers': {
      'defaultPageview': {
        'on': 'visible',
        'request': 'pageview'
      }
    }
  }
};

