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

export const GTAG_CONFIG = /** @type {!JsonObject} */ ({
  'configRewriter': {
    'url': 'https://www.googletagmanager.com/gtag/amp',
    'varGroups': {
      'dns': {
        'dr': 'DOCUMENT_REFERRER',
        'dl': 'SOURCE_URL',
      },
      'conversion': {
        'gclsrc': 'QUERY_PARAM(gclsrc)',
        'hasGcl': '$IF(QUERY_PARAM(gclid), 1, 0)',
        'hasDcl': '$IF(QUERY_PARAM(dclid), 1, 0)',
        'enabled': true,
      },
    },
  },
  'vars': {
    'eventValue': '0',
    'clientId': 'CLIENT_ID(AMP_ECID_GOOGLE,,_ga)',
    'dataSource': 'AMP',
    'anonymizeIP': 'aip',
    'errorParam': '${errorName}-${errorMessage}',
  },
  'requests': {
    'uaHost': 'https://www.google-analytics.com',
    'uaBasePrefix':
        'v=1&' +
         '_v=a1&' +
         'ds=${dataSource}&' +
         '${anonymizeIP}&' +
         '_s=${requestCount}&' +
         'dt=${title}&' +
         'sr=${screenWidth}x${screenHeight}&' +
         'cid=${clientId}&' +
         'tid=${trackingId}&' +
         'dl=${sourceUrl}&' +
         'dr=${externalReferrer}&' +
         'sd=${screenColorDepth}&' +
         'ul=${browserLanguage}&' +
         'de=${documentCharset}',
    'uaBaseSuffix':
        '&a=${pageViewId}&' +
         'z=${random}',
    'uaPageviewCommon':
         '&t=pageview&' +
         'jid=${random}&' +
         'gjid=${random}&' +
         '_r=1',
    'uaPageview':
        '${uaHost}/r/collect?${uaBasePrefix}' +
         '${uaPageviewCommon}' +
         '${uaBaseSuffix}',
    'uaPageviewNpa':
        '${uaHost}/collect?${uaBasePrefix}' +
         '${uaPageviewCommon}' +
         '${uaBaseSuffix}',
    'uaEvent':
        '${uaHost}/collect?${uaBasePrefix}&' +
         't=event&' +
         'jid=' +
         '${uaBaseSuffix}',
    'uaTiming':
        '${uaHost}/collect?${uaBasePrefix}&' +
         'jid=&' +
         'plt=${pageLoadTime}&' +
         'dns=${domainLookupTime}&' +
         'tcp=${tcpConnectTime}&' +
         'rrt=${redirectTime}&' +
         'srt=${serverResponseTime}&' +
         'pdt=${pageDownloadTime}&' +
         'clt=${contentLoadTime}&' +
         'dit=${domInteractiveTime}' +
         '${uaBaseSuffix}',
    'uaError':
        '${uaHost}/collect?${uaBasePrefix}&' +
         't=exception&' +
         'exd=${errorParam}' +
         '${uaBaseSuffix}',
    'awConversionPrefix':
        'https://www.googleadservices.com/pagead/conversion/',
    'awRemarketingPrefix':
        'https://googleads.g.doubleclick.net/pagead/viewthroughconversion/',
    'awCommonParams':
        '${conversionId}/?' +
         'cv=amp3&' + // Increment when making changes.
         'label=${conversionLabel}&' +
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
    'awConversion': '${awConversionPrefix}${awCommonParams}',
    'awRemarketing': '${awRemarketingPrefix}${awCommonParams}',
    'flBase': 'https://ad.doubleclick.net/activity;src=${flSrc};type=${flType};cat=${flCat}',
    'flDynamicBase': 'https://${flSrc}.fls.doubleclick.net/activityi;src=${flSrc};type=${flType};cat=${flCat}',
    'dnsBase': 'https://ad.doubleclick.net/ddm/clk/',
  },
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
});
