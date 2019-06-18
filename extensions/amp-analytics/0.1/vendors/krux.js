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

export const KRUX_CONFIG = /** @type {!JsonObject} */ ({
  'requests': {
    'beaconHost': 'https://beacon.krxd.net',
    'timing':
      't_navigation_type=0&' +
      't_dns=${domainLookupTime}&' +
      't_tcp=${tcpConnectTime}&' +
      't_http_request=${serverResponseTime}&' +
      't_http_response=${pageDownloadTime}&' +
      't_content_ready=${contentLoadTime}&' +
      't_window_load=${pageLoadTime}&' +
      't_redirect=${redirectTime}',
    'common':
      'source=amp&' +
      'confid=${confid}&' +
      '_kpid=${pubid}&' +
      '_kcp_s=${site}&' +
      '_kcp_sc=${section}&' +
      '_kcp_ssc=${subsection}&' +
      '_kcp_d=${canonicalHost}&' +
      '_kpref_=${documentReferrer}&' +
      '_kua_kx_amp_client_id=${clientId(_kuid_)}&' +
      '_kua_kx_lang=${browserLanguage}&' +
      '_kua_kx_tech_browser_language=${browserLanguage}&' +
      '_kua_kx_tz=${timezone}',
    'pageview': '${beaconHost}/pixel.gif?${common}&${timing}',
    'event': '${beaconHost}/event.gif?${common}&${timing}&pageview=false',
  },
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
  'extraUrlParamsReplaceMap': {
    'user.': '_kua_',
    'page.': '_kpa_',
  },
});
