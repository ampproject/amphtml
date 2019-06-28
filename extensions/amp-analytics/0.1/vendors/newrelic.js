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

export const NEWRELIC_CONFIG = /** @type {!JsonObject} */ ({
  'requests': {
    'pageview':
      'https://${beacon}/amp?appId=${appId}' +
      '&licenseKey=${licenseKey}' +
      '&ampUrl=${ampdocUrl}' +
      '&canonicalUrl=${canonicalUrl}' +
      '&timeToDomContentLoadedEventEnd=' +
      '${navTiming(domContentLoadedEventEnd)}' +
      '&timeToDomInteractive=${navTiming(domInteractive)}' +
      '&timeToDomComplete=${navTiming(domComplete)}' +
      '&timeToDomLoading=${navTiming(domLoading)}' +
      '&timeToResponseStart=${navTiming(responseStart)}' +
      '&timeToResponseEnd=${navTiming(responseEnd)}' +
      '&timeToLoadEventStart=${navTiming(loadEventStart)}' +
      '&timeToLoadEventEnd=${navTiming(loadEventEnd)}' +
      '&timeToConnectStart=${navTiming(connectStart)}' +
      '&timeToConnectEnd=${navTiming(connectEnd)}' +
      '&timeToFetchStart=${navTiming(fetchStart)}' +
      '&timeToRequestStart=${navTiming(requestStart)}' +
      '&timeToUnloadEventStart=${navTiming(unloadEventStart)}' +
      '&timeToUnloadEventEnd=${navTiming(unloadEventEnd)}' +
      '&timeToDomainLookupStart=${navTiming(domainLookupStart)}' +
      '&timeToDomainLookupEnd=${navTiming(domainLookupEnd)}' +
      '&timeToRedirectStart=${navTiming(redirectStart)}' +
      '&timeToRedirectEnd=${navTiming(redirectEnd)}' +
      '&timeToSecureConnection=${navTiming(secureConnectionStart)}' +
      '&timestamp=${timestamp}' +
      '&ampVersion=${ampVersion}' +
      '&pageLoadTime=${pageLoadTime}',
  },
  'vars': {
    'beacon': 'bam.nr-data.net',
    'appId': [],
    'licenseKey': '',
  },
  'triggers': {
    'trackPageview': {
      'on': 'ini-load',
      'request': 'pageview',
    },
  },
});
