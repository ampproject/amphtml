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

import {IFRAME_TRANSPORTS} from './iframe-transport-vendors.js';
import {hasOwn} from '../../../src/utils/object.js';

// Disable auto-sorting of imports from here on.
/* eslint-disable sort-imports-es6-autofix/sort-imports-es6 */

import {ACQUIALIFT_CONFIG} from './vendors/acquialift.js';
import {AFSANALYTICS_CONFIG} from './vendors/afsanalytics.js';
import {ALEXAMETRICS_CONFIG} from './vendors/alexametrics.js';
import {ATINTERNET_CONFIG} from './vendors/atinternet.js';
import {UMENGANALYTICS_CONFIG} from './vendors/umenganalytics.js';
import {BAIDUANALYTICS_CONFIG} from './vendors/baiduanalytics.js';
import {BURT_CONFIG} from './vendors/burt.js';
import {BYSIDE_CONFIG} from './vendors/byside.js';
import {CHARTBEAT_CONFIG} from './vendors/chartbeat.js';
import {CLICKY_CONFIG} from './vendors/clicky.js';
import {COLANALYTICS_CONFIG} from './vendors/colanalytics.js';
import {COMSCORE_CONFIG} from './vendors/comscore.js';
import {CXENSE_CONFIG} from './vendors/cxense.js';
import {DYNATRACE_CONFIG} from './vendors/dynatrace.js';
import {EULERIANANALYTICS_CONFIG} from './vendors/euleriananalytics.js';
import {FACEBOOKPIXEL_CONFIG} from './vendors/facebookpixel.js';
import {GEMIUS_CONFIG} from './vendors/gemius.js';
import {GOOGLEADWORDS_CONFIG} from './vendors/googleadwords.js';
import {GTAG_CONFIG} from './vendors/gtag.js';
import {GOOGLEANALYTICS_CONFIG} from './vendors/googleanalytics.js';
import {KRUX_CONFIG} from './vendors/krux.js';
import {IPLABEL_CONFIG} from './vendors/iplabel.js';
import {LOTAME_CONFIG} from './vendors/lotame.js';
import {MARINSOFTWARE_CONFIG} from './vendors/marinsoftware.js';
import {MEDIAMETRIE_CONFIG} from './vendors/mediametrie.js';
import {MEDIARITHMICS_CONFIG} from './vendors/mediarithmics.js';
import {MEDIATOR_CONFIG} from './vendors/mediator.js';
import {METRIKA_CONFIG} from './vendors/metrika.js';
import {MOBIFY_CONFIG} from './vendors/mobify.js';
import {MPARTICLE_CONFIG} from './vendors/mparticle.js';
import {NEWRELIC_CONFIG} from './vendors/newrelic.js';
import {NIELSEN_CONFIG} from './vendors/nielsen.js';
import {
  NIELSEN_MARKETING_CLOUD_CONFIG,
} from './vendors/nielsen-marketing-cloud.js';
import {OEWADIRECT_CONFIG} from './vendors/oewadirect.js';
import {OEWA_CONFIG} from './vendors/oewa.js';
import {PARSELY_CONFIG} from './vendors/parsely.js';
import {PIANO_CONFIG} from './vendors/piano.js';
import {PISTATS_CONFIG} from './vendors/piStats.js';
import {QUANTCAST_CONFIG} from './vendors/quantcast.js';
import {ADOBEANALYTICS_CONFIG} from './vendors/adobeanalytics.js';
import {
  ADOBEANALYTICS_NATIVECONFIG_CONFIG,
} from './vendors/adobeanalytics_nativeConfig.js';
import {INFONLINE_CONFIG} from './vendors/infonline.js';
import {SIMPLEREACH_CONFIG} from './vendors/simplereach.js';
import {SEGMENT_CONFIG} from './vendors/segment.js';
import {SHINYSTAT_CONFIG} from './vendors/shinystat.js';
import {SNOWPLOW_CONFIG} from './vendors/snowplow.js';
import {TOP100_CONFIG} from './vendors/top100.js';
import {TREASUREDATA_CONFIG} from './vendors/treasuredata.js';
import {WEBTREKK_CONFIG} from './vendors/webtrekk.js';
import {WEBTREKK_V2_CONFIG} from './vendors/webtrekk_v2.js';
import {MPULSE_CONFIG} from './vendors/mpulse.js';
import {LINKPULSE_CONFIG} from './vendors/linkpulse.js';
import {RAKAM_CONFIG} from './vendors/rakam.js';
import {IBEATANALYTICS_CONFIG} from './vendors/ibeatanalytics.js';
import {TOPMAILRU_CONFIG} from './vendors/topmailru.js';
import {
  ORACLEINFINITYANALYTICS_CONFIG,
} from './vendors/oracleInfinityAnalytics.js';
import {MOAT_CONFIG} from './vendors/moat.js';
import {BG_CONFIG} from './vendors/bg.js';

/**
 * @const {!JsonObject}
 */
export const ANALYTICS_CONFIG = /** @type {!JsonObject} */ ({

  // Default parent configuration applied to all amp-analytics tags.
  'default': {
    'transport': {'beacon': true, 'xhrpost': true, 'image': true},
    'vars': {
      'accessReaderId': 'ACCESS_READER_ID',
      'adNavTiming': 'AD_NAV_TIMING', // only available in A4A embeds
      'adNavType': 'AD_NAV_TYPE', // only available in A4A embeds
      'adRedirectCount': 'AD_NAV_REDIRECT_COUNT', // only available in A4A
      'ampdocHost': 'AMPDOC_HOST',
      'ampdocHostname': 'AMPDOC_HOSTNAME',
      'ampdocUrl': 'AMPDOC_URL',
      'ampGeo': 'AMP_GEO',
      'ampState': 'AMP_STATE',
      'ampVersion': 'AMP_VERSION',
      'ancestorOrigin': 'ANCESTOR_ORIGIN',
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
  },
  'acquialift': ACQUIALIFT_CONFIG,
  'adobeanalytics': ADOBEANALYTICS_CONFIG,
  'adobeanalytics_nativeConfig': ADOBEANALYTICS_NATIVECONFIG_CONFIG,
  'afsanalytics': AFSANALYTICS_CONFIG,
  'alexametrics': ALEXAMETRICS_CONFIG,
  'atinternet': ATINTERNET_CONFIG,
  'baiduanalytics': BAIDUANALYTICS_CONFIG,
  'bg': BG_CONFIG,
  'burt': BURT_CONFIG,
  'byside': BYSIDE_CONFIG,
  'chartbeat': CHARTBEAT_CONFIG,
  'clicky': CLICKY_CONFIG,
  'colanalytics': COLANALYTICS_CONFIG,
  'comscore': COMSCORE_CONFIG,
  'cxense': CXENSE_CONFIG,
  'dynatrace': DYNATRACE_CONFIG,
  'euleriananalytics': EULERIANANALYTICS_CONFIG,
  'facebookpixel': FACEBOOKPIXEL_CONFIG,
  'gemius': GEMIUS_CONFIG,
  'googleadwords': GOOGLEADWORDS_CONFIG,
  'googleanalytics': GOOGLEANALYTICS_CONFIG,
  'gtag': GTAG_CONFIG,
  'ibeatanalytics': IBEATANALYTICS_CONFIG,
  'infonline': INFONLINE_CONFIG,
  'iplabel': IPLABEL_CONFIG,
  'krux': KRUX_CONFIG,
  'linkpulse': LINKPULSE_CONFIG,
  'lotame': LOTAME_CONFIG,
  'marinsoftware': MARINSOFTWARE_CONFIG,
  'mediametrie': MEDIAMETRIE_CONFIG,
  'mediarithmics': MEDIARITHMICS_CONFIG,
  'mediator': MEDIATOR_CONFIG,
  'metrika': METRIKA_CONFIG,
  'moat': MOAT_CONFIG,
  'mobify': MOBIFY_CONFIG,
  'mparticle': MPARTICLE_CONFIG,
  'mpulse': MPULSE_CONFIG,
  'newrelic': NEWRELIC_CONFIG,
  'nielsen': NIELSEN_CONFIG,
  'nielsen-marketing-cloud': NIELSEN_MARKETING_CLOUD_CONFIG,
  'oewa': OEWA_CONFIG,
  'oewadirect': OEWADIRECT_CONFIG,
  'oracleInfinityAnalytics': ORACLEINFINITYANALYTICS_CONFIG,
  'parsely': PARSELY_CONFIG,
  'piStats': PISTATS_CONFIG,
  'piano': PIANO_CONFIG,
  'quantcast': QUANTCAST_CONFIG,
  'rakam': RAKAM_CONFIG,
  'segment': SEGMENT_CONFIG,
  'shinystat': SHINYSTAT_CONFIG,
  'simplereach': SIMPLEREACH_CONFIG,
  'snowplow': SNOWPLOW_CONFIG,
  'top100': TOP100_CONFIG,
  'topmailru': TOPMAILRU_CONFIG,
  'treasuredata': TREASUREDATA_CONFIG,
  'umenganalytics': UMENGANALYTICS_CONFIG,
  'webtrekk': WEBTREKK_CONFIG,
  'webtrekk_v2': WEBTREKK_V2_CONFIG,
});

ANALYTICS_CONFIG['infonline']['triggers']['pageview']['iframe' +
/* TEMPORARY EXCEPTION */ 'Ping'] = true;

ANALYTICS_CONFIG['adobeanalytics_nativeConfig']
    ['triggers']['pageLoad']['iframe' +
    /* TEMPORARY EXCEPTION */ 'Ping'] = true;

ANALYTICS_CONFIG['oewa']['triggers']['pageview']['iframe' +
/* TEMPORARY EXCEPTION */ 'Ping'] = true;

mergeIframeTransportConfig(ANALYTICS_CONFIG, IFRAME_TRANSPORTS);

/**
 * Merges iframe transport config.
 *
 * @param {!JsonObject} config
 * @param {!JsonObject} iframeTransportConfig
 */
function mergeIframeTransportConfig(config, iframeTransportConfig) {
  for (const vendor in iframeTransportConfig) {
    if (hasOwn(iframeTransportConfig, vendor)) {
      const url = iframeTransportConfig[vendor];
      config[vendor]['transport'] =
          Object.assign({}, config[vendor]['transport'], {'iframe': url});
    }
  }
}
