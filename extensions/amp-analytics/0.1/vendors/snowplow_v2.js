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

import {jsonLiteral} from '../../../../src/json';

const SNOWPLOW_V2_CONFIG = jsonLiteral({
  'linkers': {
    'linker': {
      'ids': {
        '_sp_asid': '${linkerSessionId}',
        '_sp_aduid': '${duid}',
      },
    },
  },
  'cookies': {
    'enabled': true,
    '_sp_lsid': {
      'value': '$IF(LINKER_PARAM(linker,_sp_asid), LINKER_PARAM(linker,_sp_asid), QUERY_PARAM(_sp_asid))',
    },
    '_sp_lduid': {
      'value': '$IF(LINKER_PARAM(linker,_sp_aduid), LINKER_PARAM(linker,_sp_aduid), QUERY_PARAM(_sp_aduid))',
    },
    '_sp_asid': {
      'value': '$IF(COOKIE(_sp_asid), COOKIE(_sp_asid), COOKIE(_sp_lsid))',
    },
    '_sp_aduid': {
      'value': '$IF(COOKIE(_sp_aduid), COOKIE(_sp_aduid), COOKIE(_sp_lduid))',
    },
  },
  'vars': {
    'ampVistorId': 'CLIENT_ID(_sp_id)',
    'generatedSessionId': ['616d70',['a'].map(a=>{return Math.random()}).join().slice(2,4),'-',['a'].map(a=>{return Math.random()}).join().slice(2,6),'-4',['a'].map(a=>{return Math.random()}).join().slice(2,5),'-8',['a'].map(a=>{return Math.random()}).join().slice(2,5),'-',['a'].map(a=>{return Math.random()}).join().slice(2,14)].join(''),
    'linkerSessionId': '$IF(COOKIE(_sp_asid), COOKIE(_sp_asid), ${generatedSessionId})',
    'sid': '$IF(${sessionId}, ${sessionId}, ${linkerSessionId})',
    'vid': '$IF(${spVisitIndex}, ${spVisitIndex}, 0)',
    'duid': '$IF(${sessionId}, ${domainUserId}, ${ampVistorId})',
    'customEventTemplate': [
      '{',
        '"schema":"iglu:com.snowplowanalytics.snowplow/unstruct_event/jsonschema/1-0-0",',
        '"data":{',
          '"schema":"iglu:${customEventSchemaVendor}/${customEventSchemaName}/jsonschema/${customEventSchemaVersion}",',
          '"data":{',
            '${customEventSchemaData}',
          '}',
        '}',
      '}',
    ].join(''),
  },
  'requests': {
    'aaVersion': 'amp_v2-0.1',
    'basePrefix': 'https://${collectorHost}/i?p=web' +
      'url=${canonicalUrl}' +
      'page=${title}' +
      'res=${screenWidth}x${screenHeight}' +
      'stm=${timestamp}' +
      'tz=${timezoneCode}' +
      'aid=${appId}' +
      'tv=${aaVersion}' +
      'cd=${screenColorDepth}' +
      'cs=${documentCharset}' +
      'duid=${duid}' +
      'lang=${browserLanguage}' +
      'refr=${documentReferrer}' +
      'vp=${viewportWidth}x${viewportHeight}' +
      'ua=${userAgent}' +
      'ds=${scrollWidth}x${scrollHeight}' +
      'uid=${userId}' +
      'vid=${vid}' +
      'sid=${sid}' +
      'co=${customContexts}',
    'pageView':
      '${basePrefix}&e=pv',
    'structEvent':
      '${basePrefix}&e=se' +
      '&se_ca=${structEventCategory}' +
      '&se_ac=${structEventAction}' +
      '&se_la=${structEventLabel}' +
      '&se_pr=${structEventProperty}' +
      '&se_va=${structEventValue}',
    'pagePing':
      '${basePrefix}&e=pp' +
      '&pp_mix=${scrollLeft}' +
      '&pp_miy=${scrollTop}',
    'selfDescribedEvent':
      '${basePrefix}&e=ue' +
      '&ue_pr=${customEventTemplate}',
  },
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
});

export {SNOWPLOW_V2_CONFIG};
