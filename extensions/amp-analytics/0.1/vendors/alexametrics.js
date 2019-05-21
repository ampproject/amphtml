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

export const ALEXAMETRICS_CONFIG = /** @type {!JsonObject} */ ({
  'requests': {
    'base':
      'https://${ampAtrkHost}/atrk.gif?account=${atrk_acct}&domain=${domain}',
    'pageview':
      '${base}&jsv=amp-${ampVersion}' +
      '&frame_height=${viewportHeight}&frame_width=${viewportWidth}' +
      '&title=${title}&time=${timestamp}&time_zone_offset=${timezone}' +
      '&screen_params=${screenWidth}x${screenHeight}x${screenColorDepth}' +
      '&ref_url=${documentReferrer}&host_url=${sourceUrl}' +
      '&random_number=${random}&user_cookie=${clientId(__auc)}' +
      '&user_cookie_flag=0&user_lang=${browserLanguage}' +
      '&amp_doc_url=${ampdocUrl}',
  },
  'vars': {
    'atrk_acct': '',
    'domain': '',
    'ampAtrkHost': 'certify-amp.alexametrics.com',
  },
  'triggers': {
    'trackPageview': {
      'on': 'visible',
      'request': 'pageview',
    },
  },
  'transport': {
    'xhrpost': false,
    'beacon': false,
    'image': true,
  },
});
