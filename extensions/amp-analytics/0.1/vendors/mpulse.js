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

export const MPULSE_CONFIG = /** @type {!JsonObject} */ ({
  'requests': {
    'onvisible':
      'https://${beacon_url}?' +
      'h.d=${h.d}' +
      '&h.key=${h.key}' +
      '&h.t=${h.t}' +
      '&h.cr=${h.cr}' +
      '&rt.start=navigation' +
      '&rt.si=${clientId(amp_mpulse)}' +
      '&rt.ss=${timestamp}' +
      '&rt.end=${timestamp}' +
      '&t_resp=${navTiming(navigationStart,responseStart)}' +
      '&t_page=${navTiming(responseStart,loadEventStart)}' +
      '&t_done=${navTiming(navigationStart,loadEventStart)}' +
      '&nt_nav_type=${navType}' +
      '&nt_red_cnt=${navRedirectCount}' +
      '&nt_nav_st=${navTiming(navigationStart)}' +
      '&nt_red_st=${navTiming(redirectStart)}' +
      '&nt_red_end=${navTiming(redirectEnd)}' +
      '&nt_fet_st=${navTiming(fetchStart)}' +
      '&nt_dns_st=${navTiming(domainLookupStart)}' +
      '&nt_dns_end=${navTiming(domainLookupEnd)}' +
      '&nt_con_st=${navTiming(connectStart)}' +
      '&nt_ssl_st=${navTiming(secureConnectionStart)}' +
      '&nt_con_end=${navTiming(connectEnd)}' +
      '&nt_req_st=${navTiming(requestStart)}' +
      '&nt_res_st=${navTiming(responseStart)}' +
      '&nt_unload_st=${navTiming(unloadEventStart)}' +
      '&nt_unload_end=${navTiming(unloadEventEnd)}' +
      '&nt_domloading=${navTiming(domLoading)}' +
      '&nt_res_end=${navTiming(responseEnd)}' +
      '&nt_domint=${navTiming(domInteractive)}' +
      '&nt_domcontloaded_st=${navTiming(domContentLoadedEventStart)}' +
      '&nt_domcontloaded_end=${navTiming(domContentLoadedEventEnd)}' +
      '&nt_domcomp=${navTiming(domComplete)}' +
      '&nt_load_st=${navTiming(loadEventStart)}' +
      '&nt_load_end=${navTiming(loadEventEnd)}' +
      '&v=1' +
      '&http.initiator=amp' +
      '&u=${sourceUrl}' +
      '&amp.u=${ampdocUrl}' +
      '&r2=${documentReferrer}' +
      '&scr.xy=${screenWidth}x${screenHeight}',
  },
  'triggers': {
    'onvisible': {
      'on': 'visible',
      'request': 'onvisible',
    },
  },
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
  'extraUrlParamsReplaceMap': {
    'ab_test': 'h.ab',
    'page_group': 'h.pg',
    'custom_dimension.': 'cdim.',
    'custom_metric.': 'cmet.',
  },
});
