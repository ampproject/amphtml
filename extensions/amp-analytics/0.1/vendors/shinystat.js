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

export const SHINYSTAT_CONFIG = /** @type {!JsonObject} */ ({
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
  'requests': {
    'base': 'https://amp.shinystat.com/cgi-bin/shinyamp.cgi',
    'commpar':
      'AMP=1&RM=${random}' +
      '&USER=${account}' +
      '&PAG=${page}' +
      '&HR=${sourceUrl}' +
      '&REFER=${documentReferrer}' +
      '&RES=${screenWidth}X${screenHeight}' +
      '&COLOR=${screenColorDepth}' +
      '&CID=${clientId(AMP_CID)}' +
      '&PAGID=${pageViewId}' +
      '&TITL=${title}' +
      '&RQC=${requestCount}',
    'pagepar': '&VIE=${viewer}&PLT=${pageLoadTime}',
    'eventpar': '&SSXL=1',
    'linkpar': '&LINK=${outboundLink}',
    'pageview': '${base}?${commpar}${pagepar}',
    'event': '${base}?${commpar}${eventpar}',
    'link': '${base}?${commpar}${linkpar}',
  },
  'triggers': {
    'pageview': {
      'on': 'visible',
      'request': 'pageview',
    },
  },
});
