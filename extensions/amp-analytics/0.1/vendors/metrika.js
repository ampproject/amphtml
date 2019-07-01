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

export const METRIKA_CONFIG = /** @type {!JsonObject} */ ({
  'transport': {'beacon': true, 'xhrpost': true, 'image': false},
  'requests': {
    'pageview': '${_watch}?browser-info=${_brInfo}&${_siteInfo}&${_suffix}',
    'notBounce':
      '${_watch}?browser-info=ar%3A1%3Anb%3A1%3A${_brInfo}&${_suffix}',
    'externalLink': '${_watch}?browser-info=ln%3A1%3A${_brInfo}&${_suffix}',
    'reachGoal':
      '${_watch}?browser-info=ar%3A1%3A${_brInfo}&${_siteInfo}' +
      '&${_goalSuffix}',
    '_domain': 'https://mc.yandex.ru',
    '_watch': '${_domain}/watch/${counterId}',
    '_suffix': 'page-url=${sourceUrl}&page-ref=${documentReferrer}',
    '_goalSuffix':
      'page-url=goal%3A%2F%2F${sourceHost}%2F${goalId}' +
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
});
