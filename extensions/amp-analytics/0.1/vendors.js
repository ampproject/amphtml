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
      'ampdocHost': 'AMPDOC_HOST',
      'ampdocUrl': 'AMPDOC_URL',
      'availableScreenHeight': 'AVAILABLE_SCREEN_HEIGHT',
      'availableScreenWidth': 'AVAILABLE_SCREEN_WIDTH',
      'browserLanguage': 'BROWSER_LANGUAGE',
      'canonicalHost': 'CANONICAL_HOST',
      'canonicalPath': 'CANONICAL_PATH',
      'canonicalUrl': 'CANONICAL_URL',
      'clientId': 'CLIENT_ID',
      'contentLoadTime': 'CONTENT_LOAD_TIME',
      'documentCharset': 'DOCUMENT_CHARSET',
      'documentReferrer': 'DOCUMENT_REFERRER',
      'domainLookupTime': 'DOMAIN_LOOKUP_TIME',
      'domInteractiveTime': 'DOM_INTERACTIVE_TIME',
      'pageDownloadTime': 'PAGE_DOWNLOAD_TIME',
      'pageLoadTime': 'PAGE_LOAD_TIME',
      'pageViewId': 'PAGE_VIEW_ID',
      'random': 'RANDOM',
      'redirectTime': 'REDIRECT_TIME',
      'screenColorDepth': 'SCREEN_COLOR_DEPTH',
      'screenHeight': 'SCREEN_HEIGHT',
      'screenWidth': 'SCREEN_WIDTH',
      'scrollHeight': 'SCROLL_HEIGHT',
      'scrollLeft': 'SCROLL_LEFT',
      'scrollTop': 'SCROLL_TOP',
      'scrollWidth': 'SCROLL_WIDTH',
      'serverResponseTime': 'SERVER_RESPONSE_TIME',
      'tcpConnectTime': 'TCP_CONNECT_TIME',
      'timestamp': 'TIMESTAMP',
      'timezone': 'TIMEZONE',
      'title': 'TITLE',
    }
  },

  'chartbeat': {
    'requests': {
      'host': 'https://ping.chartbeat.net',
      'basePrefix': '/ping?h=${domain}&' +
        'p=${canonicalPath}&' +
        'u=${clientId(_cb)}&' +
        'd=${canonicalHost}&' +
        'g=${uid}&' +
        'g0=${sections}&' +
        'g1=${authors}&' +
        'g2=${zone}&' +
        'g3=${sponsorName}&' +
        'g4=${contentType}&' +
        'x=${scrollTop}&' +
        'w=${screenHeight}&' +
        'j=${decayTime}&' +
        'r=${documentReferrer}&' +
        't=${clientId(_cb_amp)}${pageViewId}&' +
        'i=${title}',
      'baseSuffix': '&_',
      'interval': '${host}${basePrefix}&${baseSuffix}',
      'anchorClick': '${host}${basePrefix}&${baseSuffix}'
    },
    'triggers': {
      'trackInterval': {
        'on': 'timer',
        'timerSpec': {
          'interval': 15,
          'maxTimerLength': 7200
        },
        'request': 'interval',
        'vars': {
          'decayTime': 30
        }
      },
      'trackAnchorClick': {
        'on': 'click',
        'selector': 'a',
        'request': 'anchorClick',
        'vars': {
          'decayTime': 30
        }
      }
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true
    }
  },

  'comscore': {
    'vars': {
      'c2': '1000001'
    },
    'requests': {
      'host': 'https://sb.scorecardresearch.com',
      'base': '${host}/b?',
      'pageview': '${base}c1=2&c2=${c2}&rn=${random}&c8=${title}' +
        '&c7=${canonicalUrl}&c9=${documentReferrer}&cs_c7amp=${ampdocUrl}'
    },
    'triggers': {
      'defaultPageview': {
        'on': 'visible',
        'request': 'pageview'
      }
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true
    }
  },

  'googleanalytics': {
    'vars': {
      'eventValue': "0",
      'documentLocation': 'AMPDOC_URL'
    },
    'requests': {
      'host': 'https://www.google-analytics.com',
      'basePrefix': 'v=1&_v=a0&aip=true&_s=${requestCount}&' +
          'dt=${title}&sr=${screenWidth}x${screenHeight}&_utmht=${timestamp}&' +
          'jid=&cid=${clientId(AMP_ECID_GOOGLE)}&tid=${account}&' +
          'dl=${documentLocation}&' +
          'dr=${documentReferrer}&sd=${screenColorDepth}&' +
          'ul=${browserLanguage}&de=${documentCharset}' ,
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
  },

  'parsely': {
    'requests': {
      'host': 'https://srv.pixel.parsely.com',
      'basePrefix': '${host}/plogger/?' +
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
      'pageview': '${basePrefix}&action=pageview'
      // TODO(#1612): client-side session support
      // TODO(#1296): active engaged time support
      // 'heartbeat': '${basePrefix}&action=heartbeat&inc=${engagedTime}'
    },
    'triggers': {
      'defaultPageview': {
        'on': 'visible',
        'request': 'pageview'
      }
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true
    }
  }
};
