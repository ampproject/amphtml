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
 * @const {!JsonObject}
 */
export const ANALYTICS_CONFIG = /** @type {!JsonObject} */ ({

  // Default parent configuration applied to all amp-analytics tags.
  'default': {
    'transport': {'beacon': true, 'xhrpost': true, 'image': true},
    'vars': {
      'accessReaderId': 'ACCESS_READER_ID',
      'adNavTiming': 'AD_NAV_TIMING',  // only available in A4A embeds
      'adNavType': 'AD_NAV_TYPE',  // only available in A4A embeds
      'adRedirectCount': 'AD_NAV_REDIRECT_COUNT',  // only available in A4A
      'ampdocHost': 'AMPDOC_HOST',
      'ampdocHostname': 'AMPDOC_HOSTNAME',
      'ampdocUrl': 'AMPDOC_URL',
      'ampVersion': 'AMP_VERSION',
      'authdata': 'AUTHDATA',
      'availableScreenHeight': 'AVAILABLE_SCREEN_HEIGHT',
      'availableScreenWidth': 'AVAILABLE_SCREEN_WIDTH',
      'backgroundState': 'BACKGROUND_STATE',
      'browserLanguage': 'BROWSER_LANGUAGE',
      'canonicalHost': 'CANONICAL_HOST',
      'canonicalHostname': 'CANONICAL_HOSTNAME',
      'canonicalPath': 'CANONICAL_PATH',
      'canonicalUrl': 'CANONICAL_URL',
      'clientId': 'CLIENT_ID',
      'contentLoadTime': 'CONTENT_LOAD_TIME',
      'counter': 'COUNTER',
      'documentCharset': 'DOCUMENT_CHARSET',
      'documentReferrer': 'DOCUMENT_REFERRER',
      'domainLookupTime': 'DOMAIN_LOOKUP_TIME',
      'domInteractiveTime': 'DOM_INTERACTIVE_TIME',
      'container': 'CONTAINER',
      'containerToken': 'CONTAINER_TOKEN',
      'externalReferrer': 'EXTERNAL_REFERRER',
      'navRedirectCount': 'NAV_REDIRECT_COUNT',
      'navTiming': 'NAV_TIMING',
      'navType': 'NAV_TYPE',
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
      'sourceHostname': 'SOURCE_HOSTNAME',
      'sourcePath': 'SOURCE_PATH',
      'tcpConnectTime': 'TCP_CONNECT_TIME',
      'timestamp': 'TIMESTAMP',
      'timezone': 'TIMEZONE',
      'title': 'TITLE',
      'totalEngagedTime': 'TOTAL_ENGAGED_TIME',
      'userAgent': 'USER_AGENT',
      'viewer': 'VIEWER',
      'viewportHeight': 'VIEWPORT_HEIGHT',
      'viewportWidth': 'VIEWPORT_WIDTH',
    },
  },
  'acquialift': {
    'vars': {
      'decisionApiUrl': 'us-east-1-decisionapi.lift.acquia.com',
      'accountId': 'xxxxxxxx',
      'siteId': 'xxxxxxxx',
    },
    'transport': {'beacon': true, 'xhrpost': true, 'image': false},
    'requests': {
      'base': 'https://${decisionApiUrl}/capture?account_id=${accountId}&site_id=${siteId}',
      'basicCapture': '${base}' +
        '&ident=${clientId(tc_ptid)}' +
        '&identsrc=amp' +
        '&es=Amp' +
        '&url=${canonicalUrl}' +
        '&rurl=${documentReferrer}' +
        '&cttl=${title}',
      'pageview': '${basicCapture}' +
        '&en=Content View',
      'click': '${basicCapture}' +
        '&en=Click-Through',
    },
    'triggers': {
      'defaultPageview': {
        'on': 'visible',
        'request': 'pageview',
      },
    },
  },

  'afsanalytics': {
    'vars': {
      'server': 'www',
      'websiteid': 'xxxxxxxx',
      'event': 'click',
      'clicklabel': 'clicked from AMP page',
    },
    'transport': {'beacon': false, 'xhrpost': false, 'image': true},
    'requests': {
      'host': '//${server}.afsanalytics.com',
      'base': '${host}/cgi_bin/',
      'pageview': '${base}connect.cgi?usr=${websiteid}Pauto' +
        '&js=1' +
        '&amp=1' +
        '&title=${title}' +
        '&url=${canonicalUrl}' +
        '&refer=${documentReferrer}' +
        '&resolution=${screenWidth}x${screenHeight}' +
        '&color=${screenColorDepth}' +
        '&Tips=${random}',
      'click': '${base}click.cgi?usr=${websiteid}' +
        '&event=${event}' +
        '&exit=${clicklabel}',
    },
    'triggers': {
      'defaultPageview': {
        'on': 'visible',
        'request': 'pageview',
      },
    },
  },

  'atinternet': {
    'transport': {'beacon': false, 'xhrpost': false, 'image': true},
    'requests': {
      'base': 'https://${log}${domain}/hit.xiti?s=${site}&ts=${timestamp}&r=${screenWidth}x${screenHeight}x${screenColorDepth}&re=${availableScreenWidth}x${availableScreenHeight}',
      'suffix': '&medium=amp&${extraUrlParams}&ref=${documentReferrer}',
      'pageview': '${base}&' +
        'p=${title}&' +
        's2=${level2}${suffix}',
      'click': '${base}&' +
        'pclick=${title}&' +
        's2click=${level2}&' +
        'p=${label}&' +
        's2=${level2Click}&' +
        'type=click&click=${type}${suffix}',
    },
  },

  'baiduanalytics': {
    'requests': {
      'host': 'https://hm.baidu.com',
      'base': '${host}/hm.gif?' +
          'si=${token}&nv=0&st=4&v=pixel-1.0&rnd=${timestamp}',
      'pageview': '${base}&et=0',
      'event': '${base}&ep=${category}*${action}*' +
          '${label}*${value}&et=4&api=8_0',
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
  },

  'bg': {
    'transport': {
      'iframe': 'https://tpc.googlesyndication.com/b4a/b4a-runner.html',
    },
  },

  'burt': {
    'vars': {
      'trackingKey': 'ignore',
      'category': '',
      'subCategory': '',
    },
    'requests': {
      'host': '//${trackingKey}.c.richmetrics.com/',
      'base': '${host}imglog?' +
        'e=${trackingKey}&' +
        'pi=${trackingKey}' +
          '|${pageViewId}' +
          '|${canonicalPath}' +
          '|${clientId(burt-amp-user-id)}&' +
        'ui=${clientId(burt-amp-user-id)}&' +
        'v=amp&' +
        'ts=${timestamp}&' +
        'sn=${requestCount}&',
      'pageview': '${base}' +
        'type=page&' +
        'ca=${category}&' +
        'sc=${subCategory}&' +
        'ln=${browserLanguage}&' +
        'lr=${documentReferrer}&' +
        'eu=${sourceUrl}&' +
        'tz=${timezone}&' +
        'pd=${scrollWidth}x${scrollHeight}&' +
        'sd=${screenWidth}x${screenHeight}&' +
        'wd=${availableScreenWidth}x${availableScreenHeight}&' +
        'ws=${scrollLeft}x${scrollTop}',
      'pageping': '${base}' +
        'type=pageping',
    },
    'triggers': {
      'pageview': {
        'on': 'visible',
        'request': 'pageview',
      },
      'pageping': {
        'on': 'timer',
        'timerSpec': {
          'interval': 15,
          'maxTimerLength': 1200,
        },
        'request': 'pageping',
      },
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
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
        'c=120&' +
        'x=${scrollTop}&' +
        'y=${scrollHeight}&' +
        'j=${decayTime}&' +
        'R=1&' +
        'W=0&' +
        'I=0&' +
        'E=${totalEngagedTime}&' +
        'r=${documentReferrer}&' +
        't=${pageViewId}${clientId(_cb)}&' +
        'b=${pageLoadTime}&' +
        'i=${title}&' +
        'T=${timestamp}&' +
        'tz=${timezone}&' +
        'C=2',
      'baseSuffix': '&_',
      'interval': '${host}${basePrefix}${baseSuffix}',
      'anchorClick': '${host}${basePrefix}${baseSuffix}',
    },
    'triggers': {
      'trackInterval': {
        'on': 'timer',
        'timerSpec': {
          'interval': 15,
          'maxTimerLength': 7200,
        },
        'request': 'interval',
        'vars': {
          'decayTime': 30,
        },
      },
      'trackAnchorClick': {
        'on': 'click',
        'selector': 'a',
        'request': 'anchorClick',
        'vars': {
          'decayTime': 30,
        },
      },
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
  },

  'clicky': {
    'vars': {
      'site_id': '',
    },
    'requests': {
      'base': 'https://in.getclicky.com/in.php?' +
        'site_id=${site_id}',
      'baseSuffix': '&mime=${contentType}&' +
        'x=${random}',
      'pageview': '${base}&' +
        'res=${screenWidth}x${screenHeight}&' +
        'lang=${browserLanguage}&' +
        'secure=1&' +
        'type=pageview&' +
        'href=${canonicalPath}&' +
        'title=${title}' +
        '${baseSuffix}',
      'interval': '${base}&' +
        'type=ping' +
        '${baseSuffix}',
    },
    'triggers': {
      'defaultPageview': {
        'on': 'visible',
        'request': 'pageview',
      },
      'interval': {
        'on': 'timer',
        'timerSpec': {
          'interval': 60,
          'maxTimerLength': 600,
        },
        'request': 'interval',
      },
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
  },

  'colanalytics': {
    'requests': {
      'host': 'https://ase.clmbtech.com',
      'base': '${host}/message',
      'pageview': '${base}?cid=${id}' +
        '&val_101=${id}' +
        '&val_101=${canonicalPath}' +
        '&ch=${canonicalHost}' +
        '&uuid=${uid}' +
        '&au=${authors}' +
        '&zo=${zone}' +
        '&sn=${sponsorName}' +
        '&ct=${contentType}' +
        '&st=${scrollTop}' +
        '&sh=${scrollHeight}' +
        '&dct=${decayTime}' +
        '&tet=${totalEngagedTime}' +
        '&dr=${documentReferrer}' +
        '&plt=${pageLoadTime}' +
        '&val_108=${title}' +
        '&val_120=3',
    },
    'triggers': {
      'defaultPageview': {
        'on': 'visible',
        'request': 'pageview',
      },
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
  },

  'comscore': {
    'vars': {
      'c2': '1000001',
    },
    'requests': {
      'host': 'https://sb.scorecardresearch.com',
      'base': '${host}/b?',
      'pageview': '${base}c1=2' +
        '&c2=${c2}' +
        '&cs_pv=${pageViewId}' +
        '&c12=${clientId(comScore)}' +
        '&rn=${random}' +
        '&c8=${title}' +
        '&c7=${canonicalUrl}' +
        '&c9=${documentReferrer}' +
        '&cs_c7amp=${ampdocUrl}',
    },
    'triggers': {
      'defaultPageview': {
        'on': 'visible',
        'request': 'pageview',
      },
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
  },

  'cxense': {
    'requests': {
      'host': 'https://scomcluster.cxense.com',
      'base': '${host}/Repo/rep.gif',
      'pageview': '${base}?ver=1&typ=pgv&sid=${siteId}&ckp=${clientId(cX_P)}&' +
          'loc=${sourceUrl}&rnd=${random}&ref=${documentReferrer}&' +
          'ltm=${timestamp}&wsz=${screenWidth}x${screenHeight}&' +
          'bln=${browserLanguage}&chs=${documentCharset}&' +
          'col=${screenColorDepth}&tzo=${timezone}&cp_cx_channel=amp',
    },
    'triggers': {
      'defaultPageview': {
        'on': 'visible',
        'request': 'pageview',
      },
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
  },

  'dynatrace': {
    'requests': {
      'endpoint': '${protocol}://${tenant}${separator}${environment}:${port}/ampbf/${tenantpath}',
      'pageview': '${endpoint}?type=js&' +
        'flavor=amp&' +
        'v=1&' +
        'a=1%7C1%7C_load_%7C_load_%7C-%7C${navTiming(navigationStart)}%7C' +
		'${navTiming(domContentLoadedEventEnd)}%7C0%2C2%7C2%7C_onload_%7C' +
		'_load_%7C-%7C${navTiming(domContentLoadedEventStart)}%7C' +
		'${navTiming(domContentLoadedEventEnd)}%7C0&' +
        'fId=${pageViewId}&' +
        'vID=${clientId(rxVisitor)}&' +
        'referer=${sourceUrl}&' +
        'title=${title}&' +
        'sw=${screenWidth}&' +
        'sh=${screenHeight}&' +
        'w=${viewportWidth}&' +
        'h=${viewportHeight}&' +
        'nt=a${navType}' +
        'b${navTiming(navigationStart)}' +
        'c${navTiming(navigationStart,redirectStart)}' +
        'd${navTiming(navigationStart,redirectEnd)}' +
        'e${navTiming(navigationStart,fetchStart)}' +
        'f${navTiming(navigationStart,domainLookupStart)}' +
        'g${navTiming(navigationStart,domainLookupEnd)}' +
        'h${navTiming(navigationStart,connectStart)}' +
        'i${navTiming(navigationStart,connectEnd)}' +
        'j${navTiming(navigationStart,secureConnectionStart)}' +
        'k${navTiming(navigationStart,requestStart)}' +
        'l${navTiming(navigationStart,responseStart)}' +
        'm${navTiming(navigationStart,responseEnd)}' +
        'n${navTiming(navigationStart,domLoading)}' +
        'o${navTiming(navigationStart,domInteractive)}' +
        'p${navTiming(navigationStart,domContentLoadedEventStart)}' +
        'q${navTiming(navigationStart,domContentLoadedEventEnd)}' +
        'r${navTiming(navigationStart,domComplete)}' +
        's${navTiming(navigationStart,loadEventStart)}' +
        't${navTiming(navigationStart,loadEventEnd)}&' +
        'app=${app}&' +
        'time=${timestamp}',
    },
    'triggers': {
      'trackPageview': {
        'on': 'visible',
        'request': 'pageview',
      },
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
    'vars': {
      'app': 'ampapp',
      'protocol': 'https',
      'tenant': '',
      'environment': 'live.dynatrace.com',
      'port': '443',
      'separator': '.',
    },
  },

  'euleriananalytics': {
    'vars': {
      'analyticsHost': '',
      'documentLocation': 'SOURCE_URL',
    },
    'requests': {
      'base': 'https://${analyticsHost}',
      'basePrefix': '-/${random}?' +
        'euid-amp=${clientId(etuix)}&' +
        'url=${documentLocation}&',
      'pageview': '${base}/col2/${basePrefix}' +
        'rf=${documentReferrer}&' +
        'sd=${screenWidth}x${screenHeight}&' +
        'sd=${screenColorDepth}&' +
        'elg=${browserLanguage}',
      'action': '${base}/action/${basePrefix}' +
        'eact=${actionCode}&' +
        'actr=${actionRef}',
      'user': '${base}/uparam/${basePrefix}' +
        'euk${userParamKey}=${userParamVal}',
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
  },

  'facebookpixel': {
    'vars': {
      'pixelId': 'PIXEL-ID',
    },
    'requests': {
      'host': 'https://www.facebook.com',
      'base': '${host}/tr?noscript=1',
      'pageview': '${base}&ev=PageView&' +
          'id=${pixelId}',
      'event': '${base}&ev=${eventName}&' +
          'id=${pixelId}' +
          '&cd[content_name]=${content_name}',
      'eventViewContent': '${base}&ev=ViewContent&' +
          'id=${pixelId}' +
          '&cd[value]=${value}' +
          '&cd[currency]=${currency}' +
          '&cd[content_name]=${content_name}' +
          '&cd[content_type]=${content_type}' +
          '&cd[content_ids]=${content_ids}',
      'eventSearch': '${base}&ev=Search&' +
          'id=${pixelId}' +
          '&cd[value]=${value}' +
          '&cd[currency]=${currency}' +
          '&cd[content_category]=${content_category}' +
          '&cd[content_ids]=${content_ids}' +
          '&cd[search_string]=${search_string}',
      'eventAddToCart': '${base}&ev=AddToCart&' +
          'id=${pixelId}' +
          '&cd[value]=${value}' +
          '&cd[currency]=${currency}' +
          '&cd[content_name]=${content_name}' +
          '&cd[content_type]=${content_type}' +
          '&cd[content_ids]=${content_ids}',
      'eventAddToWishlist': '${base}&ev=AddToWishlist&' +
          'id=${pixelId}' +
          '&cd[value]=${value}' +
          '&cd[currency]=${currency}' +
          '&cd[content_name]=${content_name}' +
          '&cd[content_category]=${content_category}' +
          '&cd[content_ids]=${content_ids}',
      'eventInitiateCheckout': '${base}&ev=InitiateCheckout&' +
          'id=${pixelId}' +
          '&cd[value]=${value}' +
          '&cd[currency]=${currency}' +
          '&cd[content_name]=${content_name}' +
          '&cd[content_category]=${content_category}' +
          '&cd[num_items]=${num_items}' +
          '&cd[content_ids]=${content_ids}',
      'eventAddPaymentInfo': '${base}&ev=AddPaymentInfo&' +
          'id=${pixelId}' +
          '&cd[value]=${value}' +
          '&cd[currency]=${currency}' +
          '&cd[content_category]=${content_category}' +
          '&cd[content_ids]=${content_ids}',
      'eventPurchase': '${base}&ev=Purchase&' +
          'id=${pixelId}' +
          '&cd[value]=${value}' +
          '&cd[currency]=${currency}' +
          '&cd[content_name]=${content_name}' +
          '&cd[content_type]=${content_type}' +
          '&cd[content_ids]=${content_ids}' +
          '&cd[num_items]=${num_items}',
      'eventLead': '${base}&ev=Lead&' +
          'id=${pixelId}' +
          '&cd[value]=${value}' +
          '&cd[currency]=${currency}' +
          '&cd[content_name]=${content_name}' +
          '&cd[content_category]=${content_category}',
      'eventCompleteRegistration': '${base}&ev=CompleteRegistration&' +
          'id=${pixelId}' +
          '&cd[value]=${value}' +
          '&cd[currency]=${currency}' +
          '&cd[content_name]=${content_name}' +
          '&cd[status]=${status}',
    },
    'triggers': {
      'trackPageview': {
        'on': 'visible',
        'request': 'pageview',
      },
    },
  },

  'gemius': {
    'requests': {
      'base': 'https://${prefix}.hit.gemius.pl/_${timestamp}/redot.gif?l=91&id=${identifier}&screen=${screenWidth}x${screenHeight}&window=${viewportWidth}x${viewportHeight}&fr=1&href=${sourceUrl}&ref=${documentReferrer}&extra=gemamp%3D1%7Campid%3D${clientId(gemius)}%7C${extraparams}',
      'pageview': '${base}&et=view&hsrc=1',
      'event': '${base}&et=action&hsrc=3',
    },
    'triggers': {
      'defaultPageview': {
        'on': 'visible',
        'request': 'pageview',
      },
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
  },

  'googleadwords': {
    'requests': {
      'conversion_prefix': 'https://www.googleadservices.com/pagead/conversion/',
      'remarketing_prefix':
          'https://googleads.g.doubleclick.net/pagead/viewthroughconversion/',
      'common_params': '${googleConversionId}/?' +
          'cv=amp2&' +  // Increment when making changes.
          'label=${googleConversionLabel}&' +
          'random=${random}&' +
          'url=${sourceUrl}&' +
          'ref=${documentReferrer}&' +
          'fst=${pageViewId}&' +
          'num=${counter(googleadwords)}&' +
          'fmt=3&' +
          'async=1&' +
          'u_h=${screenHeight}&u_w=${screenWidth}&' +
          'u_ah=${availableScreenHeight}&u_aw=${availableScreenWidth}&' +
          'u_cd=${screenColorDepth}&' +
          'u_tz=${timezone}&' +
          'tiba=${title}&' +
          'guid=ON&script=0',
      'conversion_params': 'value=${googleConversionValue}&' +
          'currency_code=${googleConversionCurrency}&' +
          'bg=${googleConversionColor}&' +
          'hl=${googleConversionLanguage}',
      'conversion': '${conversion_prefix}${common_params}&${conversion_params}',
      'remarketing': '${remarketing_prefix}${common_params}',
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
  },

  // Important: please keep this in sync with the following config
  // 'googleanalytics-alpha'.
  'googleanalytics': {
    'vars': {
      'eventValue': '0',
      'documentLocation': 'SOURCE_URL',
      'clientId': 'CLIENT_ID(AMP_ECID_GOOGLE,,_ga)',
      'dataSource': 'AMP',
      'anonymizeIP': 'aip',
      'errorParam': '${errorName}-${errorMessage}',
    },
    'requests': {
      'host': 'https://www.google-analytics.com',
      'basePrefix': 'v=1&' +
          '_v=a1&' +
          'ds=${dataSource}&' +
          '${anonymizeIP}&' +
          '_s=${requestCount}&' +
          'dt=${title}&' +
          'sr=${screenWidth}x${screenHeight}&' +
          '_utmht=${timestamp}&' +
          'cid=${clientId}&' +
          'tid=${account}&' +
          'dl=${documentLocation}&' +
          'dr=${externalReferrer}&' +
          'sd=${screenColorDepth}&' +
          'ul=${browserLanguage}&' +
          'de=${documentCharset}',
      'baseSuffix': '&a=${pageViewId}&' +
          'z=${random}',
      'pageview': '${host}/r/collect?${basePrefix}&' +
          't=pageview&' +
          'jid=${random}&' +
          '_r=1' +
          '${baseSuffix}',
      'event': '${host}/collect?${basePrefix}&' +
          't=event&' +
          'jid=&' +
          'ec=${eventCategory}&' +
          'ea=${eventAction}&' +
          'el=${eventLabel}&' +
          'ev=${eventValue}' +
          '${baseSuffix}',
      'social': '${host}/collect?${basePrefix}&' +
          't=social&' +
          'jid=&' +
          'sa=${socialAction}&' +
          'sn=${socialNetwork}&' +
          'st=${socialTarget}' +
          '${baseSuffix}',
      'timing': '${host}/collect?${basePrefix}&' +
          't=${timingRequestType}&' +
          'jid=&' +
          'plt=${pageLoadTime}&' +
          'dns=${domainLookupTime}&' +
          'tcp=${tcpConnectTime}&' +
          'rrt=${redirectTime}&' +
          'srt=${serverResponseTime}&' +
          'pdt=${pageDownloadTime}&' +
          'clt=${contentLoadTime}&' +
          'dit=${domInteractiveTime}' +
          '${baseSuffix}',
      'error': '${host}/collect?${basePrefix}&' +
          't=exception&' +
          'exd=${errorParam}' +
          '${baseSuffix}',
    },
    'triggers': {
      'performanceTiming': {
        'on': 'visible',
        'request': 'timing',
        'sampleSpec': {
          'sampleOn': '${clientId}',
          'threshold': 1,
        },
        'vars': {
          'timingRequestType': 'timing',
        },
      },
      'adwordsTiming': {
        'on': 'visible',
        'request': 'timing',
        'enabled': '${queryParam(gclid)}',
        'vars': {
          'timingRequestType': 'adtiming',
        },
      },
    },
    'extraUrlParamsReplaceMap': {
      'dimension': 'cd',
      'metric': 'cm',
    },
    'optout': '_gaUserPrefs.ioo',
  },

  // USE WITH CAUTION (unless told by Google Analytics representatives)
  // googleanalytics-alpha configuration is not planned to be supported
  // long-term. Avoid use of this value for amp-analytics config attribute
  // unless you plan to migrate before deprecation' #5761
  'googleanalytics-alpha': {
    'vars': {
      'eventValue': '0',
      'documentLocation': 'SOURCE_URL',
      'clientId': 'CLIENT_ID(AMP_ECID_GOOGLE,,_ga)',
      'dataSource': 'AMP',
      'anonymizeIP': 'aip',
      'errorParam': '${errorName}-${errorMessage}',
    },
    'requests': {
      'host': 'https://www.google-analytics.com',
      'basePrefix': 'v=1&' +
          '_v=a1&' +
          'ds=${dataSource}&' +
          '${anonymizeIP}&' +
          '_s=${requestCount}&' +
          'dt=${title}&' +
          'sr=${screenWidth}x${screenHeight}&' +
          '_utmht=${timestamp}&' +
          'cid=${clientId}&' +
          'tid=${account}&' +
          'dl=${documentLocation}&' +
          'dr=${externalReferrer}&' +
          'sd=${screenColorDepth}&' +
          'ul=${browserLanguage}&' +
          'de=${documentCharset}',
      'baseSuffix': '&a=${pageViewId}&' +
          'z=${random}',
      'pageview': '${host}/r/collect?${basePrefix}&' +
          't=pageview&' +
          'jid=${random}&' +
          '_r=1' +
          '${baseSuffix}',
      'event': '${host}/collect?${basePrefix}&' +
          't=event&' +
          'jid=&' +
          'ec=${eventCategory}&' +
          'ea=${eventAction}&' +
          'el=${eventLabel}&' +
          'ev=${eventValue}' +
          '${baseSuffix}',
      'social': '${host}/collect?${basePrefix}&' +
          't=social&' +
          'jid=&' +
          'sa=${socialAction}&' +
          'sn=${socialNetwork}&' +
          'st=${socialTarget}' +
          '${baseSuffix}',
      'timing': '${host}/collect?${basePrefix}&' +
          't=${timingRequestType}&' +
          'jid=&' +
          'plt=${pageLoadTime}&' +
          'dns=${domainLookupTime}&' +
          'tcp=${tcpConnectTime}&' +
          'rrt=${redirectTime}&' +
          'srt=${serverResponseTime}&' +
          'pdt=${pageDownloadTime}&' +
          'clt=${contentLoadTime}&' +
          'dit=${domInteractiveTime}' +
          '${baseSuffix}',
      'error': '${host}/collect?${basePrefix}&' +
          't=exception&' +
          'exd=${errorParam}' +
          '${baseSuffix}',
    },
    'triggers': {
      'performanceTiming': {
        'on': 'visible',
        'request': 'timing',
        'sampleSpec': {
          'sampleOn': '${clientId}',
          'threshold': 1,
        },
        'vars': {
          'timingRequestType': 'timing',
        },
      },
      'adwordsTiming': {
        'on': 'visible',
        'request': 'timing',
        'enabled': '${queryParam(gclid)}',
        'vars': {
          'timingRequestType': 'adtiming',
        },
      },
    },
    'extraUrlParamsReplaceMap': {
      'dimension': 'cd',
      'metric': 'cm',
    },
    'optout': '_gaUserPrefs.ioo',
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
      'event': '${beaconHost}/event.gif?${common}&${timing}&pageview=false',
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
    'extraUrlParamsReplaceMap': {
      'user.': '_kua_',
      'page.': '_kpa_',
    },
  },

  'lotame': {
    'requests': {
      'pageview': 'https://bcp.crwdcntrl.net/amp?c=${account}&pv=y',
    },
    'triggers': {
      'track pageview': {
        'on': 'visible',
        'request': 'pageview',
      },
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
  },

  'mediametrie': {
    'requests': {
      'host': 'https://prof.estat.com/m/web',
      'pageview': '${host}/${serial}?' +
        'c=${level1}' +
        '&dom=${ampdocUrl}' +
        '&enc=${documentCharset}' +
        '&l3=${level3}' +
        '&l4=${level4}' +
        '&n=${random}' +
        '&p=${level2}' +
        '&r=${documentReferrer}' +
        '&sch=${screenHeight}' +
        '&scw=${screenWidth}' +
        '&tn=amp' +
        '&v=1' +
        '&vh=${availableScreenHeight}' +
        '&vw=${availableScreenWidth}',
    },
    'triggers': {
      'trackPageview': {
        'on': 'visible',
        'request': 'pageview',
      },
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
  },

  'mediarithmics': {
    'vars': {
      'domain': 'events.mediarithmics.com',
      'url': 'SOURCE_URL',
      'event_name': '$page_view',
      'referrer': 'DOCUMENT_REFERRER',
    },
    'requests': {
      'host': 'https://${domain}',
      'pageview': '${host}/v1/visits/pixel?' +
        '$site_token=${site_token}' +
        '&$url=${url}' +
        '&$ev=${event_name}' +
        '&$referrer=${referrer}',
    },
    'triggers': {
      'trackPageview': {
        'on': 'visible',
        'request': 'pageview',
      },
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
  },

  'mediator': {
    'requests': {
      'host': '//collector.mediator.media/amp/?',
      'prefix': '${host}cid=${mediator_id}&url=${canonicalUrl}' +
                '&ref=${documentReferrer}&p=4&',
      'suffix': 'vh=${viewportHeight}&sh=${scrollHeight}&st=${scrollTop}',
      'pageview': '${prefix}e=v',
      'timer': '${prefix}e=t&${suffix}',
      's0': '${prefix}e=s0',
      's1': '${prefix}e=s1',
      's2': '${prefix}e=s2',
      's3': '${prefix}e=s3',
    },
    'vars': {
      'mediator_id': '',
    },
    'triggers': {
      'trackPageview': {
        'on': 'visible',
        'request': 'pageview',
      },
      'scrollPing0': {
        'on': 'scroll',
        'scrollSpec': {
          'verticalBoundaries': [
            5,
          ],
        },
        'request': 's0',
      },
      'scrollPing1': {
        'on': 'scroll',
        'scrollSpec': {
          'verticalBoundaries': [
            35,
          ],
        },
        'request': 's1',
      },
      'scrollPing2': {
        'on': 'scroll',
        'scrollSpec': {
          'verticalBoundaries': [
            65,
          ],
        },
        'request': 's2',
      },
      'scrollPing3': {
        'on': 'scroll',
        'scrollSpec': {
          'verticalBoundaries': [
            95,
          ],
        },
        'request': 's3',
      },
      'pageTimer': {
        'on': 'timer',
        'timerSpec': {
          'interval': 5,
          'maxTimerLength': 600,
          'immediate': false,
        },
        'request': 'timer',
      },
    },
  },

  'metrika': {
    'transport': {'beacon': true, 'xhrpost': true, 'image': false},
    'requests': {
      'pageview': '${_watch}?browser-info=${_brInfo}&${_siteInfo}&${_suffix}',
      'notBounce': '${_watch}?browser-info=ar%3A1%3Anb%3A1%3A${_brInfo}' +
        '&${_suffix}',
      'externalLink': '${_watch}?browser-info=ln%3A1%3A${_brInfo}&${_suffix}',
      'reachGoal': '${_watch}?browser-info=ar%3A1%3A${_brInfo}&${_siteInfo}' +
        '&${_goalSuffix}',
      '_domain': 'https://mc.yandex.ru',
      '_watch': '${_domain}/watch/${counterId}',
      '_suffix': 'page-url=${sourceUrl}&page-ref=${documentReferrer}',
      '_goalSuffix': 'page-url=goal%3A%2F%2F${sourceHost}%2F${goalId}' +
      '&page-ref=${sourceUrl}',
      '_techInfo': [
        'amp%3A1%3Az%3A${timezone}%3Ai%3A${timestamp}%3Arn%3A${random}',
        'la%3A${browserLanguage}%3Aen%3A${documentCharset}',
        'rqn%3A${requestCount}',
        's%3A${screenWidth}x${screenHeight}x${screenColorDepth}',
        'w%3A${availableScreenWidth}x${availableScreenHeight}',
        'ds%3A${_timings}%3Auid%3A${clientId(_ym_uid)}%3Apvid%3A${pageViewId}',
      ].join('%3A'),
      '_timings': [
        '${domainLookupTime}%2C${tcpConnectTime}',
        '${serverResponseTime}%2C${pageDownloadTime}',
        '${redirectTime}%2C${navTiming(redirectStart,redirectEnd)}',
        '${navRedirectCount}%2C${navTiming(domLoading,domInteractive)}',
        '${navTiming(domContentLoadedEventStart,domContentLoadedEventEnd)}',
        '${navTiming(navigationStart,domComplete)}',
        '${pageLoadTime}%2C${navTiming(loadEventStart,loadEventEnd)}',
        '${contentLoadTime}',
      ].join('%2C'),
      '_brInfo': '${_techInfo}%3A${_title}',
      '_title': 't%3A${title}',
      '_siteInfo': 'site-info=${yaParams}',
    },
    'triggers': {
      'pageview': {
        'on': 'visible',
        'request': 'pageview',
      },
    },
  },

  'mparticle': {
    'vars': {
      'eventType': 'Unknown',
      'debug': false,
      'amp_clientId': 'CLIENT_ID(mparticle_amp_id)',
    },
    'requests': {
      'host': 'https://pixels.mparticle.com',
      'endpointPath': '/v1/${apiKey}/Pixel',
      'baseParams': 'et=${eventType}&' +
          'amp_id=${amp_clientId}&' +
          'attrs_k=${eventAttributes_Keys}&' +
          'attrs_v=${eventAttributes_Values}&' +
          'ua_k=${userAttributes_Keys}&' +
          'ua_v=${userAttributes_Values}&' +
          'ui_t=${userIdentities_Types}&' +
          'ui_v=${userIdentities_Values}&' +
          'flags_k=${customFlags_Keys}&' +
          'flags_v=${customFlags_Values}&' +
          'ct=${timestamp}&' +
          'dbg=${debug}&' +
          'lc=${location}&' +
          'av=${appVersion}',
      'pageview': '${host}${endpointPath}?' +
          'dt=ScreenView&' +
          'n=${canonicalPath}&' +
          'hn=${ampdocUrl}&' +
          'ttl=${title}&' +
          '${baseParams}',
      'event': '${host}${endpointPath}?' +
          'dt=AppEvent&' +
          'n=${eventName}&' +
          '${baseParams}',
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
  },

  'nielsen': {
    'vars': {
      'sessionId': 'CLIENT_ID(imrworldwide)',
    },
    'requests': {
      'session': 'https://uaid-linkage.imrworldwide.com/cgi-bin/gn?prd=session&c13=asid,P${apid}&sessionId=${sessionId}&pingtype=4&enc=false&c61=createtm,${timestamp}&rnd=${random}',
      'cloudapi': 'https://cloudapi.imrworldwide.com/nmapi/v2/${apid}/${sessionId}/a?b=%7B%22devInfo%22%3A%7B%22devId%22%3A%22${sessionId}%22%2C%22apn%22%3A%22${apn}%22%2C%22apv%22%3A%22${apv}%22%2C%22apid%22%3A%22${apid}%22%7D%2C%22metadata%22%3A%7B%22static%22%3A%7B%22type%22%3A%22static%22%2C%22section%22%3A%22${section}%22%2C%22assetid%22%3A%22${pageViewId}%22%2C%22segA%22%3A%22${segA}%22%2C%22segB%22%3A%22${segB}%22%2C%22segC%22%3A%22${segC}%22%2C%22adModel%22%3A%220%22%2C%22dataSrc%22%3A%22cms%22%7D%2C%22content%22%3A%7B%7D%2C%22ad%22%3A%7B%7D%7D%2C%22event%22%3A%22playhead%22%2C%22position%22%3A%22${timestamp}%22%2C%22data%22%3A%7B%22hidden%22%3A%22${backgroundState}%22%2C%22blur%22%3A%22${backgroundState}%22%2C%22position%22%3A%22${timestamp}%22%7D%2C%22type%22%3A%22static%22%2C%22utc%22%3A%22${timestamp}%22%2C%22index%22%3A%22${requestCount}%22%7D',
    },
    'triggers': {
      'visible': {
        'on': 'visible',
        'request': ['session', 'cloudapi'],
      },
      'hidden': {
        'on': 'hidden',
        'request': 'cloudapi',
      },
      'duration': {
        'on': 'timer',
        'timerSpec': {
          'interval': 10,
          'maxTimerLength': 86400,
          'immediate': false,
        },
        'request': 'cloudapi',
      },
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
  },

  'nielsen-marketing-cloud': {
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
    'vars': {
      'pubId': '',
      'siteId': '',
    },
    'requests': {
      'host': 'loadeu.exelator.com',
      'pathPrefix': 'load/',
      'trackurl': 'https://${host}/${pathPrefix}?p=${pubId}&g=${siteId}&j=0',
    },
    'triggers': {
      'defaultPageview': {
        'on': 'visible',
        'request': 'trackurl',
      },
    },
  },

  'oewadirect': {
    'transport': {'beacon': false, 'xhrpost': false, 'image': true},
    'requests': {
      'pageview': 'https://${s}.oewabox.at/j0=,,,r=${canonicalUrl};+,amp=1+cp=${cp}+ssl=1+hn=${canonicalHost};;;?lt=${pageViewId}&x=${screenWidth}x${screenHeight}x24&c=CLIENT_ID(oewa)',
    },
    'triggers': {
      'pageview': {
        'on': 'visible',
        'request': 'pageview',
      },
    },
  },

  'oewa': {
    'transport': {'beacon': false, 'xhrpost': false, 'image': true},
    'requests': {
      'pageview': '${url}?s=${s}' +
        '&amp=1' +
        '&cp=${cp}' +
        '&host=${canonicalHost}' +
        '&path=${canonicalPath}',
    },
    'triggers': {
      'pageview': {
        'on': 'visible',
        'request': 'pageview',
      },
    },
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
      'pageview': '${basePrefix}&action=pageview',
    },
    'triggers': {
      'defaultPageview': {
        'on': 'visible',
        'request': 'pageview',
      },
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
  },

  'piano': {
    'requests': {
      'host': 'https://api-v3.tinypass.com',
      'basePrefix': '/api/v3',
      'baseSuffix': '&pageview_id=${pageViewId}&rand=${random}&' +
        'amp_client_id=${clientId}&aid=${aid}',
      'pageview': '${host}${basePrefix}/page/track?url=${canonicalUrl}&' +
        'referer=${documentReferrer}&content_created=${contentCreated}&' +
        'content_author=${contentAuthor}&content_section=${contentSection}&' +
        'timezone_offset=${timezone}&tags=${tags}&amp_url=${ampdocUrl}&' +
        'screen=${screenWidth}x${screenHeight}${baseSuffix}',
    },
  },

  'quantcast': {
    'vars': {
      'labels': '',
    },
    'requests': {
      'host': 'https://pixel.quantserve.com/pixel',
      'pageview': '${host};r=${random};a=${pcode};labels=${labels};' +
        'fpan=;fpa=${clientId(__qca)};ns=0;ce=1;cm=;je=0;' +
        'sr=${screenWidth}x${screenHeight}x${screenColorDepth};' +
        'enc=n;et=${timestamp};ref=${documentReferrer};url=${canonicalUrl}',
    },
    'triggers': {
      'defaultPageview': {
        'on': 'visible',
        'request': 'pageview',
      },
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
  },

  'adobeanalytics': {
    'transport': {'xhrpost': false, 'beacon': false, 'image': true},
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
      // vid starts with z to work around #2198
      'basePrefix': 'vid=z${clientId(adobe_amp_id)}' +
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
    },
  },

  'adobeanalytics_nativeConfig': {
    'triggers': {
      'pageLoad': {
        'on': 'visible',
        'request': 'iframeMessage',
      },
    },
  },

  'infonline': {
    'vars': {
      'sv': 'ke',
      'ap': '1',
    },
    'transport': {'beacon': false, 'xhrpost': false, 'image': true},
    'requests': {
      'pageview': '${url}?st=${st}' +
        '&sv=${sv}' +
        '&ap=${ap}' +
        '&co=${co}' +
        '&cp=${cp}' +
        '&host=${canonicalHost}' +
        '&path=${canonicalPath}',
    },
    'triggers': {
      'pageview': {
        'on': 'visible',
        'request': 'pageview',
      },
    },
  },
  'simplereach': {
    'vars': {
      'pid': '',
      'published_at': '',
      'authors': [],
      'channels': [],
      'tags': [],
    },
    'requests': {
      'host': 'https://edge.simplereach.com',
      'baseParams': 'amp=true' +
        '&pid=${pid}' +
        '&title=${title}' +
        '&url=${canonicalUrl}' +
        '&date=${published_at}' +
        '&authors=${authors}' +
        '&channels=${categories}' +
        '&tags=${tags}' +
        '&referrer=${documentReferrer}' +
        '&page_url=${sourceUrl}' +
        '&user_id=${clientId(sr_amp_id)}' +
        '&domain=${canonicalHost}' +
        '&article_id=${article_id}' +
        '&ignore_metadata=${ignore_metadata}',
      'visible': '${host}/n?${baseParams}',
      'timer': '${host}/t?${baseParams}' +
        '&t=5000' +
        '&e=5000',
    },
    'triggers': {
      'visible': {
        'on': 'visible',
        'request': 'visible',
      },
      'timer': {
        'on': 'timer',
        'timerSpec': {
          'interval': 5,
          'maxTimerLength': 1200,
        },
        'request': 'timer',
      },
    },
  },

  'segment': {
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
    'vars': {
      'anonymousId': 'CLIENT_ID(segment_amp_id)',
    },
    'requests': {
      'host': 'https://api.segment.io/v1/pixel',
      'base': '?writeKey=${writeKey}' +
        '&context.library.name=amp' +
        '&anonymousId=${anonymousId}' +
        '&context.locale=${browserLanguage}' +
        '&context.page.path=${canonicalPath}' +
        '&context.page.url=${canonicalUrl}' +
        '&context.page.referrer=${documentReferrer}' +
        '&context.page.title=${title}' +
        '&context.screen.width=${screenWidth}' +
        '&context.screen.height=${screenHeight}',
      'page': '${host}/page${base}&name=${name}',
      'track': '${host}/track${base}&event=${event}',
    },
    'triggers': {
      'page': {
        'on': 'visible',
        'request': 'page',
      },
    },
  },

  'shinystat': {
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
    'requests': {
      'base': 'https://amp.shinystat.com/cgi-bin/shinyamp.cgi',
      'commpar': 'AMP=1&RM=${random}' +
                 '&USER=${account}' +
                 '&PAG=${page}' +
                 '&HR=${canonicalUrl}' +
                 '&REFER=${documentReferrer}' +
                 '&RES=${screenWidth}X${screenHeight}' +
                 '&COLOR=${screenColorDepth}' +
                 '&CID=${clientId(AMP_CID)}' +
                 '&PAGID=${pageViewId}' +
                 '&TITL=${title}' +
                 '&RQC=${requestCount}',
      'pagepar': '&VIE=${viewer}' +
                 '&PLT=${pageLoadTime}',
      'eventpar': '&SSXL=1',
      'linkpar': '&LINK=${outboundLink}',
      'pageview': '${base}?${commpar}${pagepar}',
      'event': '${base}?${commpar}${eventpar}',
      'link': '${base}?${commpar}${linkpar}',
    },
    'triggers': {
      'pageview': {
        'on': 'visible',
        'request': 'pageview',
      },
    },
  },

  'snowplow': {
    'vars': {
      'duid': 'CLIENT_ID(_sp_id)',
    },
    'requests': {
      'aaVersion': 'amp-0.2',
      'basePrefix': 'https://${collectorHost}/i?url=${canonicalUrl}&page=${title}&' +
          'res=${screenWidth}x${screenHeight}&stm=${timestamp}&' +
          'tz=${timezone}&aid=${appId}&p=web&tv=${aaVersion}&' +
          'cd=${screenColorDepth}&cs=${documentCharset}&' +
          'duid=${duid}&' +
          'lang=${browserLanguage}&refr=${documentReferrer}&stm=${timezone}&' +
          'vp=${viewportWidth}x${viewportHeight}',
      'pageView': '${basePrefix}&e=pv',
      'structEvent': '${basePrefix}&e=se&' +
          'se_ca=${structEventCategory}&se_ac=${structEventAction}&' +
          'se_la=${structEventLabel}&se_pr=${structEventProperty}&' +
          'se_va=${structEventValue}',
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
  },

  'top100': {
    'vars': {
      'pid': '',
      'rid': 'PAGE_VIEW_ID',
      'ruid': 'CLIENT_ID(ruid)',
      'version': '1.0.0',
    },
    'requests': {
      'host': 'https://kraken.rambler.ru',
      'base': '${host}/cnt/?pid=${pid}' +
                          '&rid=${rid}' +
                          '&v=${version}' +
                          '&rn=${random}' +
                          '&ruid=${ruid}' +
                          '&ct=amp',
      'pageview': '${base}&et=pv' +
                  '${_pageData}' +
                  '${_screenData}',
      '_screenData': '&sr=${screenWidth}x${screenHeight}' +
                     '&cd=${screenColorDepth}-bit' +
                     '&bs=${scrollWidth}x${scrollHeight}',
      '_pageData': '&pt=${title}' +
                   '&rf=${documentReferrer}' +
                   '&en=${documentCharset}' +
                   '&la=${browserLanguage}' +
                   '&tz=${timezone}',
    },
    'triggers': {
      'trackPageview': {
        'on': 'visible',
        'request': 'pageview',
      },
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
  },

  'webtrekk': {
    'requests': {
      'trackURL': 'https://${trackDomain}/${trackId}/wt',
      'parameterPrefix': '?p=432,${contentId},1,' +
        '${screenWidth}x${screenHeight},${screenColorDepth},1,' +
        '${timestamp},${documentReferrer},${viewportWidth}x' +
        '${viewportHeight},0&tz=${timezone}' +
        '&eid=${clientId(amp-wt3-eid)}&la=${browserLanguage}',
      'parameterSuffix': '&pu=${sourceUrl}',
      'pageParameter': '&cp1=${pageParameter1}' +
        '&cp2=${pageParameter2}&cp3=${pageParameter3}' +
        '&cp4=${pageParameter4}&cp5=${pageParameter5}' +
        '&cp6=${pageParameter6}&cp7=${pageParameter7}' +
        '&cp8=${pageParameter8}&cp9=${pageParameter9}' +
        '&cp10=${pageParameter10}',
      'pageCategories': '&cg1=${pageCategory1}' +
        '&cg2=${pageCategory2}&cg3=${pageCategory3}' +
        '&cg4=${pageCategory4}&cg5=${pageCategory5}' +
        '&cg6=${pageCategory6}&cg7=${pageCategory7}' +
        '&cg8=${pageCategory8}&cg9=${pageCategory9}' +
        '&cg10=${pageCategory10}',
      'pageview': '${trackURL}${parameterPrefix}${pageParameter}' +
        '${pageCategories}${parameterSuffix}',
      'actionParameter': '&ck1=${actionParameter1}' +
        '&ck2=${actionParameter2}&ck3=${actionParameter3}' +
        '&ck4=${actionParameter4}&ck5=${actionParameter5}',
      'event': '${trackURL}${parameterPrefix}&ct=${actionName}' +
        '${actionParameter}${parameterSuffix}',
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
  },

  'mpulse': {
    'requests': {
      'onvisible': 'https://${beacon_url}?' +
        'h.d=${h.d}' +
        '&h.key=${h.key}' +
        '&h.t=${h.t}' +
        '&h.cr=${h.cr}' +
        '&rt.start=navigation' +
        '&rt.si=${clientId(amp_mpulse)}' +
        '&rt.ss=${timestamp}' +
        '&rt.end=${timestamp}' +
        '&t_resp=${navTiming(navigationStart,responseStart)}' +
        '&t_page=${navTiming(responseStart,loadEventStart)}' +
        '&t_done=${navTiming(navigationStart,loadEventStart)}' +
        '&nt_nav_type=${navType}' +
        '&nt_red_cnt=${navRedirectCount}' +
        '&nt_nav_st=${navTiming(navigationStart)}' +
        '&nt_red_st=${navTiming(redirectStart)}' +
        '&nt_red_end=${navTiming(redirectEnd)}' +
        '&nt_fet_st=${navTiming(fetchStart)}' +
        '&nt_dns_st=${navTiming(domainLookupStart)}' +
        '&nt_dns_end=${navTiming(domainLookupEnd)}' +
        '&nt_con_st=${navTiming(connectStart)}' +
        '&nt_ssl_st=${navTiming(secureConnectionStart)}' +
        '&nt_con_end=${navTiming(connectEnd)}' +
        '&nt_req_st=${navTiming(requestStart)}' +
        '&nt_res_st=${navTiming(responseStart)}' +
        '&nt_unload_st=${navTiming(unloadEventStart)}' +
        '&nt_unload_end=${navTiming(unloadEventEnd)}' +
        '&nt_domloading=${navTiming(domLoading)}' +
        '&nt_res_end=${navTiming(responseEnd)}' +
        '&nt_domint=${navTiming(domInteractive)}' +
        '&nt_domcontloaded_st=${navTiming(domContentLoadedEventStart)}' +
        '&nt_domcontloaded_end=${navTiming(domContentLoadedEventEnd)}' +
        '&nt_domcomp=${navTiming(domComplete)}' +
        '&nt_load_st=${navTiming(loadEventStart)}' +
        '&nt_load_end=${navTiming(loadEventEnd)}' +
        '&v=1' +
        '&http.initiator=amp' +
        '&u=${sourceUrl}' +
        '&amp.u=${ampdocUrl}' +
        '&r2=${documentReferrer}' +
        '&scr.xy=${screenWidth}x${screenHeight}',
    },

    'triggers': {
      'onvisible': {
        'on': 'visible',
        'request': 'onvisible',
      },
    },

    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },

    'extraUrlParamsReplaceMap': {
      'ab_test': 'h.ab',
      'page_group': 'h.pg',
      'custom_dimension.': 'cdim.',
      'custom_metric.': 'cmet.',
    },
  },

  'linkpulse': {
    'vars': {
      'id': '',
      'pageUrl': 'CANONICAL_URL',
      'title': 'TITLE',
      'section': '',
      'channel': 'amp',
      'type': '',
      'host': 'pp.lp4.io',
      'empty': '',
    },
    'requests': {
      'base': 'https://${host}',
      'pageview': '${base}/p?i=${id}' +
                '&r=${documentReferrer}' +
                '&p=${pageUrl}' +
                '&s=${section}' +
                '&t=${type}' +
                '&c=${channel}' +
                '&mt=${title}' +
                '&_t=amp' +
                '&_r=${random}',
      'pageload': '${base}/pl?i=${id}' +
                '&ct=${domInteractiveTime}' +
                '&rt=${pageDownloadTime}' +
                '&pt=${pageLoadTime}' +
                '&p=${pageUrl}' +
                '&c=${channel}' +
                '&t=${type}' +
                '&s=${section}' +
                '&_t=amp' +
                '&_r=${random}',
      'ping': '${base}/u?i=${id}' +
                '&u=${clientId(_lp4_u)}' +
                '&p=${pageUrl}' +
                '&uActive=true' +
                '&isPing=yes' +
                '&c=${channel}' +
                '&t=${type}' +
                '&s=${section}' +
                '&_t=amp' +
                '&_r=${random}',
    },
    'triggers': {
      'pageview': {
        'on': 'visible',
        'request': 'pageview',
      },
      'pageload': {
        'on': 'visible',
        'request': 'pageload',
      },
      'ping': {
        'on': 'timer',
        'timerSpec': {
          'interval': 30,
          'maxTimerLength': 7200,
        },
        'request': 'ping',

      },
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
  },
  'rakam': {
    'vars': {
      'deviceId': 'CLIENT_ID(rakam_device_id)',
    },
    'requests': {
      'base': '?api.api_key=${writeKey}' +
        '&prop._platform=amp' +
        '&prop._device_id=${deviceId}' +
        '&prop.locale=${browserLanguage}' +
        '&prop.path=${canonicalPath}' +
        '&prop.url=${canonicalUrl}' +
        '&prop.color_depth=${screenColorDepth}' +
        '&prop._referrer=${documentReferrer}' +
        '&prop.title=${title}' +
        '&prop.timezone=${timezone}' +
        '&prop._time=${timestamp}' +
        '&prop.resolution=${screenWidth} × ${screenHeight}',
      'pageview': 'https://${apiEndpoint}/event/pixel${base}&collection=${pageViewName}',
      'custom': 'https://${apiEndpoint}/event/pixel${base}&collection=${collection}',
    },
  },
  'ibeatanalytics': {
    'requests': {
      'host': 'https://ibeat.indiatimes.com',
      'base': 'https://ibeat.indiatimes.com/iBeat/pageTrendlogAmp.html',
      'pageview': '${base}?' +
                '&h=${h}' +
                '&d=${h}' +
                '&url=${url}' +
                '&k=${key}' +
                '&ts=${time}' +
                '&ch=${channel}' +
                '&sid=${uid}' +
                '&at=${agentType}' +
                '&ref=${documentReferrer}' +
                '&aid=${aid}' +
                '&loc=1' +
                '&ct=1' +
                '&cat=${cat}' +
                '&scat=${scat}' +
                '&ac=1' +
                '&tg=${tags}' +
                '&ctids=${catIds}' +
                '&pts=${pagePublishTime}' +
                '&auth=${author}' +
                '&pos=${position}' +
                '&iBeatField=${ibeatFields}' +
                '&cid=${clientId(MSCSAuthDetails)}',
    },
    'triggers': {
      'defaultPageview': {
        'on': 'visible',
        'request': 'pageview',
      },
    },
  },

  'topmailru': {
    'transport': {
      'beacon': false,
      'xhrpost': false,
      'image': true,
    },
    'vars': {
      'url': '${sourceUrl}',
      'referrer': '${documentReferrer}',
    },
    'requests': {
      'pageView': '${_domain}/counter?${_basicMessage};title=${title}',
      'reachGoal': '${_domain}/tracker?${_basicMessage};title=${title}' +
                   ';e=RG%3A${value}%2F${goal}',
      'sendEvent': '${_domain}/tracker?${_basicMessage}' +
                   ';e=CE%3A${value}%2F${category}%3B${action}%3B${label}',
      '_domain': 'https://top-fwz1.mail.ru',
      '_basicMessage': 'js=13;id=${id};u=${url};r=${referrer}' +
                       ';s=${screenWidth}*${screenHeight}' +
                       ';vp=${viewportWidth}*${viewportHeight}' +
                       ';st=${start};gender=${gender};age=${age}' +
                       ';pid=${pid};userid=${userid};device=${device}' +
                       ';params=${params};_=${random}',
    },
    'triggers': {
      'pageView': {
        'on': 'visible',
        'request': 'pageView',
      },
    },
  },

});
ANALYTICS_CONFIG['infonline']['triggers']['pageview']['iframe' +
/* TEMPORARY EXCEPTION */ 'Ping'] = true;

ANALYTICS_CONFIG['adobeanalytics_nativeConfig']
  ['triggers']['pageLoad']['iframe' +
/* TEMPORARY EXCEPTION */ 'Ping'] = true;

ANALYTICS_CONFIG['oewa']['triggers']['pageview']['iframe' +
/* TEMPORARY EXCEPTION */ 'Ping'] = true;
