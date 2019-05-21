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

export const GOOGLEANALYTICS_CONFIG = /** @type {!JsonObject} */ ({
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
    'basePrefix':
      'v=1&' +
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
    'baseSuffix': '&a=${pageViewId}&z=${random}',
    'pageview':
      '${host}/r/collect?${basePrefix}&' +
      't=pageview&' +
      'jid=${random}&' +
      '_r=1' +
      '${baseSuffix}',
    'event':
      '${host}/collect?${basePrefix}&' +
      't=event&' +
      'jid=&' +
      'ec=${eventCategory}&' +
      'ea=${eventAction}&' +
      'el=${eventLabel}&' +
      'ev=${eventValue}' +
      '${baseSuffix}',
    'social':
      '${host}/collect?${basePrefix}&' +
      't=social&' +
      'jid=&' +
      'sa=${socialAction}&' +
      'sn=${socialNetwork}&' +
      'st=${socialTarget}' +
      '${baseSuffix}',
    'timing':
      '${host}/collect?${basePrefix}&' +
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
    'error':
      '${host}/collect?${basePrefix}&' +
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
  'optoutElementId': '__gaOptOutExtension',
  'linkers': {
    '_gl': {
      'ids': {
        '_ga': '${clientId}',
      },
    },
  },
  'cookies': {
    '_ga': {
      'value': 'LINKER_PARAM(_gl, _ga)',
    },
  },
});
