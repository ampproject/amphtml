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
      'screenHeight': 'SCREEN_HEIGHT',
      'pageLoadTime': 'PAGE_LOAD_TIME',
      'domainLookupTime': 'DOMAIN_LOOKUP_TIME',
      'tcpConnectTime': 'TCP_CONNECT_TIME',
      'serverResponseTime': 'SERVER_RESPONSE_TIME',
      'pageDownloadTime': 'PAGE_DOWNLOAD_TIME',
      'redirectTime': 'REDIRECT_TIME',
      'domInteractiveTime': 'DOM_INTERACTIVE_TIME',
      'contentLoadTime': 'CONTENT_LOAD_TIME'
    }
  },

  'googleanalytics': {
    'vars': {
      'eventValue': "0",
      'documentLocation': 'AMPDOC_URL'
    },
    'requests': {
      'host': 'https://www.google-analytics.com',
      'basePrefix': 'v=1&_v=a0&aip=true&_s=${requestCount}' +
          'dt=${title}&sr=${screenWidth}x${screenHeight}&_utmht=${timestamp}&' +
          'jid=&cid=${clientId(_ga)}&tid=${account}&dl=${documentLocation}&' +
          'dr=${documentReferrer}',
      'baseSuffix': '&a=${pageViewId}&z=${random}',
      'pageview': '${host}/r/collect?${basePrefix}&t=pageview&' +
          '_r=1${baseSuffix}',
      'event': '${host}/collect?${basePrefix}&t=event&' +
          'ec=${eventCategory}&ea=${eventAction}&el=${eventLabel}&' +
          'ev=${eventValue}${baseSuffix}',
      'social': '${host}/collect?${basePrefix}&t=social&' +
          'sa=${socialAction}&sn=${socialNetwork}&st=${socialTarget}' +
          '${baseSuffix}',
      'timing': '${host}/collect?${basePrefix}&t=timing&plt=${pageLoadTime}&' +
          'dns=${domainLookupTime}&tcp=${tcpConnectTime}&rrt=${redirectTime}&' +
          'srt=${serverResponseTime}&pdt=${pageDownloadTime}&' +
          'clt=${contentLoadTime}&dit=${domInteractiveTime}${baseSuffix}'
    },
    'optout': '_gaUserPrefs.ioo'
  }
  
  'atinternet': {
    'transport': {'beacon': false, 'xhrpost': false},
    'requests': {
      'base': 'https://${log}${domain}/?s=${site}&ts=${timestamp}&r=${screenWidth}x${screenHeight}x0',
      'suffix': '&ref=${documentReferrer}',
      'pageview': '${base}&' +
        'p=${title}&' +
        's2=${level2}${suffix}',
      'click': '${base}&' +
        'pclick=${title}&' +
        's2click=${level2}&' +
        'p=${label}&' +
        's2=${level2Click}&' +
        'type=click&click=${type}${suffix}'
    }
  }
};

