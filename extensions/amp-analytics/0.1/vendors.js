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
      'accessReaderId': 'ACCESS_READER_ID',
      'ampdocHost': 'AMPDOC_HOST',
      'ampdocUrl': 'AMPDOC_URL',
      'authdata': 'AUTHDATA',
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
      'queryParam': 'QUERY_PARAM',
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
      'sourceUrl': 'SOURCE_URL',
      'sourceHost': 'SOURCE_HOST',
      'tcpConnectTime': 'TCP_CONNECT_TIME',
      'timestamp': 'TIMESTAMP',
      'timezone': 'TIMEZONE',
      'title': 'TITLE',
      'viewer': 'VIEWER',
    }
  },

  'atinternet': {
    'transport': {'beacon': false, 'xhrpost': false, 'image': true},
    'requests': {
      'base': 'https://${log}${domain}/?s=${site}&ts=${timestamp}&r=${screenWidth}x${screenHeight}x${screenColorDepth}&re=${availableScreenWidth}x${availableScreenHeight}',
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

  'krux': {
    'requests': {
      'beaconHost': 'https://beacon.krxd.net',
      'timing': 't_navigation_type=0&' +
        't_dns=${domainLookupTime}&' +
        't_tcp=${tcpConnectTime}&' +
        't_http_request=${serverResponseTime}&' +
        't_http_response=${pageDownloadTime}&' +
        't_content_ready=${contentLoadTime}&' +
        't_window_load=${pageLoadTime}&' +
        't_redirect=${redirectTime}',
      'common': 'source=amp&' +
        'confid=${confid}&' +
        '_kpid=${pubid}&' +
        '_kcp_s=${site}&' +
        '_kcp_sc=${section}&' +
        '_kcp_ssc=${subsection}&' +
        '_kcp_d=${canonicalHost}&' +
        '_kpref_=${documentReferrer}&' +
        '_kua_kx_amp_client_id=${clientId(_kuid_)}&' +
        '_kua_kx_lang=${browserLanguage}&' +
        '_kua_kx_tech_browser_language=${browserLanguage}&' +
        '_kua_kx_tz=${timezone}',
      'pageview': '${beaconHost}/pixel.gif?${common}&${timing}',
      'event': '${beaconHost}/event.gif?${common}&${timing}&pageview=false'
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true
    },
    'extraUrlParamsReplaceMap': {
      'user.': '_kua_',
      'page.': '_kpa_'
    }
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
  },

  'piano': {
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
    },
    'transport': {
      'beacon': true,
      'xhrpost': true,
      'image': true
    }
  },

  'quantcast': {
    'vars': {
      'labels': ''
    },
    'requests': {
      'host': 'https://pixel.quantserve.com/pixel',
      'pageview': '${host};r=${random};a=${pcode};labels=${labels};' +
        'fpan=;fpa=${clientId(__qca)};ns=0;ce=1;cm=;je=0;' +
        'sr=${screenWidth}x${screenHeight}x${screenColorDepth};' +
        'enc=n;et=${timestamp};ref=${documentReferrer};url=${canonicalUrl}'
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

  'adobeanalytics': {
    'vars': {
      'pageName': 'TITLE',
      'host': '',
      'reportSuites': '',
      'linkType': 'o',
      'linkUrl': '',
      'linkName': '',
    },
    'requests': {
      'requestPath': '/b/ss/${reportSuites}/0/amp-1.0/s${random}',
      'basePrefix': 'vid=${clientId(amp_id)}' +
          '&ndh=0' +
          '&ce=${documentCharset}' +
          '&pageName=${pageName}' +
          '&g=${ampdocUrl}' +
          '&r=${documentReferrer}' +
          '&bh=${availableScreenHeight}' +
          '&bw=${availableScreenWidth}' +
          '&c=${screenColorDepth}' +
          '&j=amp' +
          '&s=${screenWidth}x${screenHeight}',
      'pageview': 'https://${host}${requestPath}?${basePrefix}',
      'click': 'https://${host}${requestPath}?${basePrefix}&pe=lnk_${linkType}&pev1=${linkUrl}&pev2=${linkName}',
    }
  },

  'infonline': {
    'vars': {
      'sv': 'ke',
      'ap': '1'
    },
    'transport': {'beacon': false, 'xhrpost': false, 'image': true},
    'requests': {
      'pageview': '${url}?st=${st}' +
        '&sv=${sv}' +
        '&ap=${ap}' +
        '&co=${co}' +
        '&cp=${cp}' +
        '&host=${canonicalHost}' +
        '&path=${canonicalPath}'
    },
    'triggers': {
      'pageview': {
        'on': 'visible',
        'request': 'pageview'
      }
    }
  }

};
ANALYTICS_CONFIG['infonline']['triggers']['pageview']['iframe' +
/* TEMPORARY EXCEPTION */ 'Ping'] = true;

