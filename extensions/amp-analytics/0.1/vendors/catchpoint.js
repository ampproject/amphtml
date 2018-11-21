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

export const CATCHPOINT_CONFIG = /** @type {!JsonObject} */ ({
  'requests': {
    'pageview': 'https://r.3gl.net/hawklogserver/r.p?data={"v":2,"y":"load","ui":${UserID},"si":${SessionID},"pi":092934,"di":${AccountID},"pc":1,"dn":${dns},"fc":7,"wt":${wait},"Id":${load},"de":${domInteractive},"dl":${domLoaded},"dc":${docComplete},"rp":1338,"cl":${contentLoad},"dc":${docComplete},"rp":${response},"cl":${contentLoad},"rd":0,"jsc":0,"dh":1200,"dw":1920,"el":193,"rf":"${canonicalUrl}","cv":${isConversion},"rv":${revenue},"ri":${revenue_items}}',
  },
  'vars': {
    'dns': '${navTiming(domainLookupEnd,domainLookupStart)}',
    'contentLoad': '${navTiming(responseStart,domComplete)}',
    'docComplete': '${navTiming(navigationStart,loadEventStart)}',
    'domInteractive': '${navTiming(requestStart,domInteractive)}',
    'domLoaded': '${navTiming(requestStart,domContentLoadedEventEnd)}',
    'connect': '${navTiming(connectStart,connectEnd)}',
    'load': '${navTiming(responseStart,responseEnd)}',
    'response': '${navTiming(navigationStart,responseEnd)}',
    'wait': '${navTiming(requestStart,responseStart)}',
    'ssl': '${navTiming(secureConnectionStart,connectEnd)}',
    'revenue_items': '',
    'revenue': '',
    'isConversion': '',
    'SessionID': '',
    'UserID': '',
  },
  'triggers': {
    'trackPageview': {
      'on': 'visible',
      'request': 'pageview',
    },
  },
});
