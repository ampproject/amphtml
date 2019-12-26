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
  IFRAME_TRANSPORTS,
  IFRAME_TRANSPORTS_CANARY,
} from './iframe-transport-vendors';
import {getMode} from '../../../src/mode';
import {hasOwn} from '../../../src/utils/object';
import {
  includeJsonLiteral,
  jsonConfiguration,
  jsonLiteral,
} from '../../../src/json';
import {isCanary} from '../../../src/experiments';

import {ACQUIALIFT_CONFIG} from './vendors/acquialift';
import {ADOBEANALYTICS_CONFIG} from './vendors/adobeanalytics';
import {ADOBEANALYTICS_NATIVECONFIG_CONFIG} from './vendors/adobeanalytics_nativeConfig';
import {AFSANALYTICS_CONFIG} from './vendors/afsanalytics';
import {ALEXAMETRICS_CONFIG} from './vendors/alexametrics';
import {AMPLITUDE_CONFIG} from './vendors/amplitude';
import {ATINTERNET_CONFIG} from './vendors/atinternet';
import {BAIDUANALYTICS_CONFIG} from './vendors/baiduanalytics';
import {BG_CONFIG} from './vendors/bg';
import {BURT_CONFIG} from './vendors/burt';
import {BYSIDE_CONFIG} from './vendors/byside';
import {CHARTBEAT_CONFIG} from './vendors/chartbeat';
import {CLICKY_CONFIG} from './vendors/clicky';
import {COLANALYTICS_CONFIG} from './vendors/colanalytics';
import {COMSCORE_CONFIG} from './vendors/comscore';
import {CXENSE_CONFIG} from './vendors/cxense';
import {DEEPBI_CONFIG} from './vendors/deepbi';
import {DYNATRACE_CONFIG} from './vendors/dynatrace';
import {EPICA_CONFIG} from './vendors/epica';
import {EULERIANANALYTICS_CONFIG} from './vendors/euleriananalytics';
import {FACEBOOKPIXEL_CONFIG} from './vendors/facebookpixel';
import {GEMIUS_CONFIG} from './vendors/gemius';
import {GOOGLEADWORDS_CONFIG} from './vendors/googleadwords';
import {GOOGLEANALYTICS_CONFIG} from './vendors/googleanalytics';
import {GTAG_CONFIG} from './vendors/gtag';
import {IBEATANALYTICS_CONFIG} from './vendors/ibeatanalytics';
import {INFONLINE_CONFIG} from './vendors/infonline';
import {IPLABEL_CONFIG} from './vendors/iplabel';
import {KEEN_CONFIG} from './vendors/keen';
import {KENSHOO_CONFIG} from './vendors/kenshoo';
import {KRUX_CONFIG} from './vendors/krux';
import {LINKPULSE_CONFIG} from './vendors/linkpulse';
import {LOTAME_CONFIG} from './vendors/lotame';
import {MARINSOFTWARE_CONFIG} from './vendors/marinsoftware';
import {MEDIAMETRIE_CONFIG} from './vendors/mediametrie';
import {MEDIARITHMICS_CONFIG} from './vendors/mediarithmics';
import {MEDIATOR_CONFIG} from './vendors/mediator';
import {MEMO_CONFIG} from './vendors/memo';
import {METRIKA_CONFIG} from './vendors/metrika';
import {MOAT_CONFIG} from './vendors/moat';
import {MOBIFY_CONFIG} from './vendors/mobify';
import {MPARTICLE_CONFIG} from './vendors/mparticle';
import {MPULSE_CONFIG} from './vendors/mpulse';
import {NAVEGG_CONFIG} from './vendors/navegg';
import {NEWRELIC_CONFIG} from './vendors/newrelic';
import {NIELSEN_CONFIG} from './vendors/nielsen';
import {NIELSEN_MARKETING_CLOUD_CONFIG} from './vendors/nielsen-marketing-cloud';
import {OEWADIRECT_CONFIG} from './vendors/oewadirect';
import {OEWA_CONFIG} from './vendors/oewa';
import {ORACLEINFINITYANALYTICS_CONFIG} from './vendors/oracleInfinityAnalytics';
import {PARSELY_CONFIG} from './vendors/parsely';
import {PERMUTIVE_CONFIG} from './vendors/permutive';
import {PIANO_CONFIG} from './vendors/piano';
import {PINPOLL_CONFIG} from './vendors/pinpoll';
import {PISTATS_CONFIG} from './vendors/piStats';
import {PRESSBOARD_CONFIG} from './vendors/pressboard';
import {QUANTCAST_CONFIG} from './vendors/quantcast';
import {RAKAM_CONFIG} from './vendors/rakam';
import {REPPUBLIKA_CONFIG} from './vendors/reppublika';
import {RETARGETLY_CONFIG} from './vendors/retargetly';
import {SEGMENT_CONFIG} from './vendors/segment';
import {SHINYSTAT_CONFIG} from './vendors/shinystat';
import {SIMPLEREACH_CONFIG} from './vendors/simplereach';
import {SNOWPLOW_CONFIG} from './vendors/snowplow';
import {SNOWPLOW_V2_CONFIG} from './vendors/snowplow_v2';
import {TEAANALYTICS_CONFIG} from './vendors/teaanalytics';
import {TEALIUMCOLLECT_CONFIG} from './vendors/tealiumcollect';
import {TOP100_CONFIG} from './vendors/top100';
import {TOPMAILRU_CONFIG} from './vendors/topmailru';
import {TREASUREDATA_CONFIG} from './vendors/treasuredata';
import {UMENGANALYTICS_CONFIG} from './vendors/umenganalytics';
import {UPSCORE_CONFIG} from './vendors/upscore';
import {VPONANALYTICS_CONFIG} from './vendors/vponanalytics';
import {WEBENGAGE_CONFIG} from './vendors/webengage';
import {WEBTREKK_CONFIG} from './vendors/webtrekk';
import {WEBTREKK_V2_CONFIG} from './vendors/webtrekk_v2';
import {_FAKE_} from './vendors/_fake_.js';

const DELIMITER = '_';

const DEFAULT_CONFIG = jsonLiteral({
  'transport': {'beacon': true, 'xhrpost': true, 'image': true},
  'vars': [
    'accessReaderId',
    'ampdocHost',
    'ampdocHostname',
    'ampdocUrl',
    'ampGeo',
    'ampState',
    'ampVersion',
    'ancestorOrigin',
    'authdata',
    'availableScreenHeight',
    'availableScreenWidth',
    'backgroundState',
    'browserLanguage',
    'canonicalHost',
    'canonicalHostname',
    'canonicalPath',
    'canonicalUrl',
    'clientId',
    'consentState',
    'contentLoadTime',
    'cookie',
    'counter',
    'documentCharset',
    'documentReferrer',
    'domainLookupTime',
    'domInteractiveTime',
    'externalReferrer',
    'firstContentfulPaint',
    'firstViewportReady',
    'fragmentParam',
    'makeBodyVisible',
    'htmlAttr',
    'incrementalEngagedTime',
    'navRedirectCount',
    'navTiming',
    'navType',
    'pageDownloadTime',
    'pageLoadTime',
    'pageViewId',
    'queryParam',
    'random',
    'redirectTime',
    'resourceTiming',
    'screenColorDepth',
    'screenHeight',
    'screenWidth',
    'scrollHeight',
    'scrollLeft',
    'scrollTop',
    'scrollWidth',
    'serverResponseTime',
    'sourceUrl',
    'sourceHost',
    'sourceHostname',
    'sourcePath',
    'tcpConnectTime',
    'timestamp',
    'timezone',
    'timezoneCode',
    'title',
    'totalEngagedTime',
    'userAgent',
    'viewer',
    'viewportHeight',
    'viewportWidth',
  ],
});

/**
 *
 * @param {!JsonObject} config
 * @return {!!JsonObject}
 */
function transformDefaultVars(config) {
  const vars = config['default']['vars'];
  const map = {};
  for (let i = 0; i < vars.length; i++) {
    const variable = vars[i];
    map[variable] = toPlatformVariable(variable);
  }
  config['default']['vars'] = map;
  return config;
}

/**
 * @param {string} analyticsVariable
 * @return {string}
 */
function toPlatformVariable(analyticsVariable) {
  return analyticsVariable
    .split(/(?=[A-Z])/)
    .map(key => key.toUpperCase())
    .join(DELIMITER);
}

/**
 * @const {!JsonObject}
 */
export const ANALYTICS_CONFIG = ANALYTICS_VENDOR_SPLIT
  ? transformDefaultVars(
      jsonConfiguration({'default': includeJsonLiteral(DEFAULT_CONFIG)})
    )
  : transformDefaultVars(
      jsonConfiguration({
        // Default parent configuration applied to all amp-analytics tags.
        'default': includeJsonLiteral(DEFAULT_CONFIG),
        'acquialift': includeJsonLiteral(ACQUIALIFT_CONFIG),
        'adobeanalytics': includeJsonLiteral(ADOBEANALYTICS_CONFIG),
        'adobeanalytics_nativeConfig': includeJsonLiteral(
          ADOBEANALYTICS_NATIVECONFIG_CONFIG
        ),
        'afsanalytics': includeJsonLiteral(AFSANALYTICS_CONFIG),
        'alexametrics': includeJsonLiteral(ALEXAMETRICS_CONFIG),
        'amplitude': includeJsonLiteral(AMPLITUDE_CONFIG),
        'atinternet': includeJsonLiteral(ATINTERNET_CONFIG),
        'baiduanalytics': includeJsonLiteral(BAIDUANALYTICS_CONFIG),
        'bg': includeJsonLiteral(BG_CONFIG),
        'burt': includeJsonLiteral(BURT_CONFIG),
        'byside': includeJsonLiteral(BYSIDE_CONFIG),
        'chartbeat': includeJsonLiteral(CHARTBEAT_CONFIG),
        'clicky': includeJsonLiteral(CLICKY_CONFIG),
        'colanalytics': includeJsonLiteral(COLANALYTICS_CONFIG),
        'comscore': includeJsonLiteral(COMSCORE_CONFIG),
        'cxense': includeJsonLiteral(CXENSE_CONFIG),
        'deepbi': includeJsonLiteral(DEEPBI_CONFIG),
        'dynatrace': includeJsonLiteral(DYNATRACE_CONFIG),
        'epica': includeJsonLiteral(EPICA_CONFIG),
        'euleriananalytics': includeJsonLiteral(EULERIANANALYTICS_CONFIG),
        'facebookpixel': includeJsonLiteral(FACEBOOKPIXEL_CONFIG),
        'gemius': includeJsonLiteral(GEMIUS_CONFIG),
        'googleadwords': includeJsonLiteral(GOOGLEADWORDS_CONFIG),
        'googleanalytics': includeJsonLiteral(GOOGLEANALYTICS_CONFIG),
        'gtag': includeJsonLiteral(GTAG_CONFIG),
        'ibeatanalytics': includeJsonLiteral(IBEATANALYTICS_CONFIG),
        'infonline': includeJsonLiteral(INFONLINE_CONFIG),
        'iplabel': includeJsonLiteral(IPLABEL_CONFIG),
        'keen': includeJsonLiteral(KEEN_CONFIG),
        'kenshoo': includeJsonLiteral(KENSHOO_CONFIG),
        'krux': includeJsonLiteral(KRUX_CONFIG),
        'linkpulse': includeJsonLiteral(LINKPULSE_CONFIG),
        'lotame': includeJsonLiteral(LOTAME_CONFIG),
        'marinsoftware': includeJsonLiteral(MARINSOFTWARE_CONFIG),
        'mediametrie': includeJsonLiteral(MEDIAMETRIE_CONFIG),
        'mediarithmics': includeJsonLiteral(MEDIARITHMICS_CONFIG),
        'mediator': includeJsonLiteral(MEDIATOR_CONFIG),
        'memo': includeJsonLiteral(MEMO_CONFIG),
        'metrika': includeJsonLiteral(METRIKA_CONFIG),
        'moat': includeJsonLiteral(MOAT_CONFIG),
        'mobify': includeJsonLiteral(MOBIFY_CONFIG),
        'mparticle': includeJsonLiteral(MPARTICLE_CONFIG),
        'mpulse': includeJsonLiteral(MPULSE_CONFIG),
        'navegg': includeJsonLiteral(NAVEGG_CONFIG),
        'newrelic': includeJsonLiteral(NEWRELIC_CONFIG),
        'nielsen': includeJsonLiteral(NIELSEN_CONFIG),
        'nielsen-marketing-cloud': includeJsonLiteral(
          NIELSEN_MARKETING_CLOUD_CONFIG
        ),
        'oewa': includeJsonLiteral(OEWA_CONFIG),
        'oewadirect': includeJsonLiteral(OEWADIRECT_CONFIG),
        'oracleInfinityAnalytics': includeJsonLiteral(
          ORACLEINFINITYANALYTICS_CONFIG
        ),
        'parsely': includeJsonLiteral(PARSELY_CONFIG),
        'piStats': includeJsonLiteral(PISTATS_CONFIG),
        'permutive': includeJsonLiteral(PERMUTIVE_CONFIG),
        'piano': includeJsonLiteral(PIANO_CONFIG),
        'pinpoll': includeJsonLiteral(PINPOLL_CONFIG),
        'pressboard': includeJsonLiteral(PRESSBOARD_CONFIG),
        'quantcast': includeJsonLiteral(QUANTCAST_CONFIG),
        'retargetly': includeJsonLiteral(RETARGETLY_CONFIG),
        'rakam': includeJsonLiteral(RAKAM_CONFIG),
        'reppublika': includeJsonLiteral(REPPUBLIKA_CONFIG),
        'segment': includeJsonLiteral(SEGMENT_CONFIG),
        'shinystat': includeJsonLiteral(SHINYSTAT_CONFIG),
        'simplereach': includeJsonLiteral(SIMPLEREACH_CONFIG),
        'snowplow': includeJsonLiteral(SNOWPLOW_CONFIG),
        'snowplow_v2': includeJsonLiteral(SNOWPLOW_V2_CONFIG),
        'teaanalytics': includeJsonLiteral(TEAANALYTICS_CONFIG),
        'tealiumcollect': includeJsonLiteral(TEALIUMCOLLECT_CONFIG),
        'top100': includeJsonLiteral(TOP100_CONFIG),
        'topmailru': includeJsonLiteral(TOPMAILRU_CONFIG),
        'treasuredata': includeJsonLiteral(TREASUREDATA_CONFIG),
        'umenganalytics': includeJsonLiteral(UMENGANALYTICS_CONFIG),
        'upscore': includeJsonLiteral(UPSCORE_CONFIG),
        'vponanalytics': includeJsonLiteral(VPONANALYTICS_CONFIG),
        'webengage': includeJsonLiteral(WEBENGAGE_CONFIG),
        'webtrekk': includeJsonLiteral(WEBTREKK_CONFIG),
        'webtrekk_v2': includeJsonLiteral(WEBTREKK_V2_CONFIG),
      })
    );

if (!ANALYTICS_VENDOR_SPLIT) {
  if (getMode().test || getMode().localDev) {
    ANALYTICS_CONFIG['_fake_'] = _FAKE_;
  }

  ANALYTICS_CONFIG['infonline']['triggers']['pageview']['iframePing'] = true;

  ANALYTICS_CONFIG['adobeanalytics_nativeConfig']['triggers']['pageLoad'][
    'iframePing'
  ] = true;

  ANALYTICS_CONFIG['oewa']['triggers']['pageview']['iframePing'] = true;

  mergeIframeTransportConfig(
    ANALYTICS_CONFIG,
    isCanary(self) ? IFRAME_TRANSPORTS_CANARY : IFRAME_TRANSPORTS
  );
}

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
      config[vendor]['transport'] = {
        ...config[vendor]['transport'],
        'iframe': url,
      };
    }
  }
}
