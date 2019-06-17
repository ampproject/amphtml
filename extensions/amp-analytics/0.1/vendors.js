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

import {getMode} from '../../../src/mode';
import {isCanary} from '../../../src/experiments';

// Disable auto-sorting of imports from here on.
/* eslint-disable sort-imports-es6-autofix/sort-imports-es6 */

import _FAKE_ from './vendors/_fake_.json';
import ACQUIALIFT_CONFIG from './vendors/acquialift.json';
import AFSANALYTICS_CONFIG from './vendors/afsanalytics.json';
import ALEXAMETRICS_CONFIG from './vendors/alexametrics.json';
import AMPLITUDE_CONFIG from './vendors/amplitude.json';
import ATINTERNET_CONFIG from './vendors/atinternet.json';
import UMENGANALYTICS_CONFIG from './vendors/umenganalytics.json';
import BAIDUANALYTICS_CONFIG from './vendors/baiduanalytics.json';
import BURT_CONFIG from './vendors/burt.json';
import BYSIDE_CONFIG from './vendors/byside.json';
import CHARTBEAT_CONFIG from './vendors/chartbeat.json';
import CLICKY_CONFIG from './vendors/clicky.json';
import COLANALYTICS_CONFIG from './vendors/colanalytics.json';
import COMSCORE_CONFIG from './vendors/comscore.json';
import CXENSE_CONFIG from './vendors/cxense.json';
import DYNATRACE_CONFIG from './vendors/dynatrace.json';
import EPICA_CONFIG from './vendors/epica.json';
import EULERIANANALYTICS_CONFIG from './vendors/euleriananalytics.json';
import FACEBOOKPIXEL_CONFIG from './vendors/facebookpixel.json';
import GEMIUS_CONFIG from './vendors/gemius.json';
import GOOGLEADWORDS_CONFIG from './vendors/googleadwords.json';
import GTAG_CONFIG from './vendors/gtag.json';
import GOOGLEANALYTICS_CONFIG from './vendors/googleanalytics.json';
import KEEN_CONFIG from './vendors/keen.json';
import KENSHOO_CONFIG from './vendors/kenshoo.json';
import KRUX_CONFIG from './vendors/krux.json';
import IPLABEL_CONFIG from './vendors/iplabel.json';
import LOTAME_CONFIG from './vendors/lotame.json';
import MARINSOFTWARE_CONFIG from './vendors/marinsoftware.json';
import MEDIAMETRIE_CONFIG from './vendors/mediametrie.json';
import MEDIARITHMICS_CONFIG from './vendors/mediarithmics.json';
import MEDIATOR_CONFIG from './vendors/mediator.json';
import METRIKA_CONFIG from './vendors/metrika.json';
import MOBIFY_CONFIG from './vendors/mobify.json';
import MPARTICLE_CONFIG from './vendors/mparticle.json';
import NEWRELIC_CONFIG from './vendors/newrelic.json';
import NIELSEN_CONFIG from './vendors/nielsen.json';
import NIELSEN_MARKETING_CLOUD_CONFIG from './vendors/nielsen-marketing-cloud.json';
import OEWADIRECT_CONFIG from './vendors/oewadirect.json';
import OEWA_CONFIG from './vendors/oewa.json';
import PARSELY_CONFIG from './vendors/parsely.json';
import PERMUTIVE_CONFIG from './vendors/permutive.json';
import PIANO_CONFIG from './vendors/piano.json';
import PINPOLL_CONFIG from './vendors/pinpoll.json';
import PISTATS_CONFIG from './vendors/piStats.json';
import PRESSBOARD_CONFIG from './vendors/pressboard.json';
import QUANTCAST_CONFIG from './vendors/quantcast.json';
import RETARGETLY_CONFIG from './vendors/retargetly.json';
import ADOBEANALYTICS_CONFIG from './vendors/adobeanalytics.json';
import ADOBEANALYTICS_NATIVECONFIG_CONFIG from './vendors/adobeanalytics_nativeConfig.json';
import INFONLINE_CONFIG from './vendors/infonline.json';
import SIMPLEREACH_CONFIG from './vendors/simplereach.json';
import SEGMENT_CONFIG from './vendors/segment.json';
import SHINYSTAT_CONFIG from './vendors/shinystat.json';
import SNOWPLOW_CONFIG from './vendors/snowplow.json';
import TEAANALYTICS_CONFIG from './vendors/teaanalytics.json';
import TEALIUMCOLLECT_CONFIG from './vendors/tealiumcollect.json';
import TOP100_CONFIG from './vendors/top100.json';
import TREASUREDATA_CONFIG from './vendors/treasuredata.json';
import WEBTREKK_CONFIG from './vendors/webtrekk.json';
import WEBTREKK_V2_CONFIG from './vendors/webtrekk_v2.json';
import MPULSE_CONFIG from './vendors/mpulse.json';
import LINKPULSE_CONFIG from './vendors/linkpulse.json';
import RAKAM_CONFIG from './vendors/rakam.json';
import IBEATANALYTICS_CONFIG from './vendors/ibeatanalytics.json';
import TOPMAILRU_CONFIG from './vendors/topmailru.json';
import ORACLEINFINITYANALYTICS_CONFIG from './vendors/oracleInfinityAnalytics.json';
import MOAT_CONFIG from './vendors/moat.json';
import MOAT_CANARY_CONFIG from './vendors/moat.canary.json';
import BG_CONFIG from './vendors/bg.json';
import BG_CANARY_CONFIG from './vendors/bg.canary.json';
import UPSCORE_CONFIG from './vendors/upscore.json';
import REPPUBLIKA_CONFIG from './vendors/reppublika.json';
import NAVEGG_CONFIG from './vendors/navegg.json';
import VPONANALYTICS_CONFIG from './vendors/vponanalytics.json';

/**
 * @const {!JsonObject}
 */
export const ANALYTICS_CONFIG = /** @type {!JsonObject} */ ({
  // Default parent configuration applied to all amp-analytics tags.
  'default': {
    'transport': {'beacon': true, 'xhrpost': true, 'image': true},
    'vars': {
      'accessReaderId': 'ACCESS_READER_ID',
      'ampdocHost': 'AMPDOC_HOST',
      'ampdocHostname': 'AMPDOC_HOSTNAME',
      'ampdocUrl': 'AMPDOC_URL',
      'ampGeo': 'AMP_GEO',
      'ampUserLocation': 'AMP_USER_LOCATION',
      'ampUserLocationPoll': 'AMP_USER_LOCATION_POLL',
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
      'consentState': 'CONSENT_STATE',
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
  'amplitude': AMPLITUDE_CONFIG,
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
  'epica': EPICA_CONFIG,
  'euleriananalytics': EULERIANANALYTICS_CONFIG,
  'facebookpixel': FACEBOOKPIXEL_CONFIG,
  'gemius': GEMIUS_CONFIG,
  'googleadwords': GOOGLEADWORDS_CONFIG,
  'googleanalytics': GOOGLEANALYTICS_CONFIG,
  'gtag': GTAG_CONFIG,
  'ibeatanalytics': IBEATANALYTICS_CONFIG,
  'infonline': INFONLINE_CONFIG,
  'iplabel': IPLABEL_CONFIG,
  'keen': KEEN_CONFIG,
  'kenshoo': KENSHOO_CONFIG,
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
  'navegg': NAVEGG_CONFIG,
  'newrelic': NEWRELIC_CONFIG,
  'nielsen': NIELSEN_CONFIG,
  'nielsen-marketing-cloud': NIELSEN_MARKETING_CLOUD_CONFIG,
  'oewa': OEWA_CONFIG,
  'oewadirect': OEWADIRECT_CONFIG,
  'oracleInfinityAnalytics': ORACLEINFINITYANALYTICS_CONFIG,
  'parsely': PARSELY_CONFIG,
  'piStats': PISTATS_CONFIG,
  'permutive': PERMUTIVE_CONFIG,
  'piano': PIANO_CONFIG,
  'pinpoll': PINPOLL_CONFIG,
  'pressboard': PRESSBOARD_CONFIG,
  'quantcast': QUANTCAST_CONFIG,
  'retargetly': RETARGETLY_CONFIG,
  'rakam': RAKAM_CONFIG,
  'reppublika': REPPUBLIKA_CONFIG,
  'segment': SEGMENT_CONFIG,
  'shinystat': SHINYSTAT_CONFIG,
  'simplereach': SIMPLEREACH_CONFIG,
  'snowplow': SNOWPLOW_CONFIG,
  'teaanalytics': TEAANALYTICS_CONFIG,
  'tealiumcollect': TEALIUMCOLLECT_CONFIG,
  'top100': TOP100_CONFIG,
  'topmailru': TOPMAILRU_CONFIG,
  'treasuredata': TREASUREDATA_CONFIG,
  'umenganalytics': UMENGANALYTICS_CONFIG,
  'upscore': UPSCORE_CONFIG,
  'vponanalytics': VPONANALYTICS_CONFIG,
  'webtrekk': WEBTREKK_CONFIG,
  'webtrekk_v2': WEBTREKK_V2_CONFIG,
});

if (getMode().test || getMode().localDev) {
  ANALYTICS_CONFIG['_fake_'] = _FAKE_;
}

if (isCanary(self)) {
  mergeCanaryConfigs_(ANALYTICS_CONFIG);
}

/**
 * Merges vendor configs that have differentcanary configs
 *
 * @private
 * @param {!JsonObject} config
 */
function mergeCanaryConfigs_(config) {
  const CANARY_CONFIGS = {
    bg: BG_CANARY_CONFIG,
    moat: MOAT_CANARY_CONFIG,
  };

  Object.keys(CANARY_CONFIGS).forEach(configName => {
    const canaryConfig = CANARY_CONFIGS[configName];

    config[configName] = canaryConfig;
  });
}
