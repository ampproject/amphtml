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

import {
  includeJsonLiteral,
  jsonConfiguration,
  jsonLiteral,
} from '../../../src/json';

// TODO(zhouyx@: Rename file and object name)
const DEFAULT_CONFIG = jsonLiteral({
  'transport': {'beacon': true, 'xhrpost': true, 'image': true},
  'vars': {
    'accessReaderId': 'ACCESS_READER_ID',
    'ampdocHost': 'AMPDOC_HOST',
    'ampdocHostname': 'AMPDOC_HOSTNAME',
    'ampdocUrl': 'AMPDOC_URL',
    'ampGeo': 'AMP_GEO',
    'ampState': 'AMP_STATE',
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
    'consentState': 'CONSENT_STATE',
    'contentLoadTime': 'CONTENT_LOAD_TIME',
    'cookie': 'COOKIE',
    'counter': 'COUNTER',
    'documentCharset': 'DOCUMENT_CHARSET',
    'documentReferrer': 'DOCUMENT_REFERRER',
    'domainLookupTime': 'DOMAIN_LOOKUP_TIME',
    'domInteractiveTime': 'DOM_INTERACTIVE_TIME',
    'externalReferrer': 'EXTERNAL_REFERRER',
    'firstContentfulPaint': 'FIRST_CONTENTFUL_PAINT',
    'firstViewportReady': 'FIRST_VIEWPORT_READY',
    'fragmentParam': 'FRAGMENT_PARAM',
    'makeBodyVisible': 'MAKE_BODY_VISIBLE',
    'htmlAttr': 'HTML_ATTR',
    'incrementalEngagedTime': 'INCREMENTAL_ENGAGED_TIME',
    'navRedirectCount': 'NAV_REDIRECT_COUNT',
    'navTiming': 'NAV_TIMING',
    'navType': 'NAV_TYPE',
    'pageDownloadTime': 'PAGE_DOWNLOAD_TIME',
    'pageLoadTime': 'PAGE_LOAD_TIME',
    'pageViewId': 'PAGE_VIEW_ID',
    'queryParam': 'QUERY_PARAM',
    'random': 'RANDOM',
    'redirectTime': 'REDIRECT_TIME',
    'resourceTiming': 'RESOURCE_TIMING',
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
    'timezoneCode': 'TIMEZONE_CODE',
    'title': 'TITLE',
    'totalEngagedTime': 'TOTAL_ENGAGED_TIME',
    'userAgent': 'USER_AGENT',
    'viewer': 'VIEWER',
    'viewportHeight': 'VIEWPORT_HEIGHT',
    'viewportWidth': 'VIEWPORT_WIDTH',
  },
});

const analyticsConfig = jsonConfiguration({
  'default': includeJsonLiteral(DEFAULT_CONFIG),
});

/**
 * @const {!JsonObject}
 */
export const ANALYTICS_CONFIG = analyticsConfig;
