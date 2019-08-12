/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS-IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {jsonLiteral} from '../../../../src/json';

const KEEN_CONFIG = jsonLiteral({
  'requests': {
    'base': 'https://api.keen.io/3.0/projects/${projectId}/events',
    'pageview': '${base}/pageviews?api_key=${writeKey}',
    'click': '${base}/clicks?api_key=${writeKey}',
    'custom': '${base}/${collection}?api_key=${writeKey}',
  },
  'triggers': {
    'trackPageview': {
      'on': 'visible',
      'request': 'pageview',
    },
  },
  'extraUrlParams': {
    'amp': true,
    'ampdocHostname': '${ampdocHostname}',
    'ampdocUrl': '${ampdocUrl}',
    'ampVersion': '${ampVersion}',
    'backgroundState': '${backgroundState}',
    'backgroundedAtStart': '${backgroundedAtStart}',
    'browserLanguage': '${browserLanguage}',
    'canonicalHost': '${canonicalHost}',
    'canonicalHostname': '${canonicalHostname}',
    'canonicalPath': '${canonicalPath}',
    'canonicalUrl': '${canonicalUrl}',
    'clientId': 'CLIENT_ID(cid)',
    'contentLoadTime': '${contentLoadTime}',
    'documentReferrer': '${documentReferrer}',
    'domainLookupTime': '${domainLookupTime}',
    'domInteractiveTime': '${domInteractiveTime}',
    'externalReferrer': '${externalReferrer}',
    'incrementalEngagedTime': '${incrementalEngagedTime}',
    'pageDownloadTime': '${pageDownloadTime}',
    'pageLoadTime': '${pageLoadTime}',
    'screenHeight': '${screenHeight}',
    'screenWidth': '${screenWidth}',
    'screenColorDepth': '${screenColorDepth}',
    'scrollHeight': '${scrollHeight}',
    'scrollWidth': '${scrollWidth}',
    'scrollTop': '${scrollTop}',
    'scrollLeft': '${scrollLeft}',
    'serverResponseTime': '${serverResponseTime}',
    'timestamp': '${timestamp}',
    'timezone': '${timezone}',
    'title': '${title}',
    'totalEngagedTime': '${totalEngagedTime}',
    'totalTime': '${totalTime}',
    'userAgent': '${userAgent}',
    'viewportHeight': '${viewportHeight}',
    'viewportWidth': '${viewportWidth}',
  },
  'transport': {
    'beacon': true,
    'xhrpost': true,
    'img': false,
    'useBody': true,
  },
});

export {KEEN_CONFIG};
