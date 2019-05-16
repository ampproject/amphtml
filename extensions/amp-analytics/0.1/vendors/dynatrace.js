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

export const DYNATRACE_CONFIG = /** @type {!JsonObject} */ ({
  'requests': {
    'endpoint':
      '${protocol}://${tenant}${separator}${environment}:${port}/ampbf/${tenantpath}',
    'pageview':
      '${endpoint}?type=js&' +
      'flavor=amp&' +
      'v=1&' +
      'a=1%7C1%7C_load_%7C_load_%7C-%7C${navTiming(navigationStart)}%7C' +
      '${navTiming(domContentLoadedEventEnd)}%7C0%2C2%7C2%7C_onload_%7C' +
      '_load_%7C-%7C${navTiming(domContentLoadedEventStart)}%7C' +
      '${navTiming(domContentLoadedEventEnd)}%7C0&' +
      'fId=${pageViewId}&' +
      'vID=${clientId(rxVisitor)}&' +
      'url=${sourceUrl}&' +
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
});
