/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

// To contribute, please submit issues and PRs to https://github.com/snowplow-incubator/amphtml

import {jsonLiteral} from '../../../../src/json';

const SNOWPLOW_V2_CONFIG = jsonLiteral({
  'linkers': {
    'linker': {
      'ids': {
        '_sp_duid': '${duid}',
        'amp_id': '${ampVistorId}',
      },
    },
  },
  'cookies': {
    'enabled': true,
    '_sp_duid': {
      'value':
        '$IF($IF(COOKIE(_sp_duid), COOKIE(_sp_duid), LINKER_PARAM(linker,_sp_duid)), $IF(COOKIE(_sp_duid), COOKIE(_sp_duid), LINKER_PARAM(linker,_sp_duid)), $SUBSTR(QUERY_PARAM(_sp),0,36))',
    },
  },
  'vars': {
    'aaVersion': 'amp-1.0.0',
    'ampVistorId': 'CLIENT_ID(_sp_id)',
    'nullString': 'null',
    'customEventTemplate': [
      '{',
      '"schema":"iglu:com.snowplowanalytics.snowplow/unstruct_event/jsonschema/1-0-0",',
      '"data":{',
      '"schema":"iglu:${customEventSchemaVendor}/${customEventSchemaName}/jsonschema/${customEventSchemaVersion}",',
      '"data":',
      '${customEventSchemaData}',
      '}',
      '}',
    ].join(''),
    'contextsHead':
      '{"schema":"iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0","data":[{"schema":"iglu:dev.amp.snowplow/amp_id/jsonschema/1-0-0","data":{"ampClientId":"${ampVistorId}", "domainUserid": "COOKIE(_sp_duid)", "userId": "${userId}"}},$REPLACE(`${customContexts}`, `^,*(.+?),*$`, `$1,`)',
    'contextsTail':
      '{"schema":"iglu:dev.amp.snowplow/amp_web_page/jsonschema/1-0-0","data":{"ampPageViewId":"PAGE_VIEW_ID_64"}}]}',
  },
  'requests': {
    'basePrefix': 'https://${collectorHost}/i?p=web&tv=${aaVersion}',
    'pageView': '${basePrefix}&e=pv',
    'structEvent':
      '${basePrefix}&e=se&se_ca=${structEventCategory}&se_ac=${structEventAction}&se_la=${structEventLabel}&se_pr=${structEventProperty}&se_va=$IF(${structEventValue}, ${structEventValue}, ${nullString})',
    'pagePing': '${basePrefix}&e=pp&pp_mix=${scrollLeft}&pp_miy=${scrollTop}',
    'selfDescribingEvent': '${basePrefix}&e=ue&ue_pr=${customEventTemplate}',
  },
  'extraUrlParams': {
    'url': '${ampdocUrl}',
    'page': '${title}',
    'res': '${screenWidth}x${screenHeight}',
    'dtm': '${timestamp}',
    'tz': '${timezoneCode}',
    'aid': '${appId}',
    'cd': '${screenColorDepth}',
    'cs': '${documentCharset}',
    'lang': '${browserLanguage}',
    'refr': '${documentReferrer}',
    'vp': '${viewportWidth}x${viewportHeight}',
    'ua': '${userAgent}',
    'ds': '${scrollWidth}x${scrollHeight}',
    'uid': '${userId}',
    'co': '${contextsHead}${contextsTail}',
  },
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
});

export {SNOWPLOW_V2_CONFIG};
