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

export const UMENGANALYTICS_CONFIG = /** @type {!JsonObject} */ ({
  'vars': {
    'siteid': '',
    'initial_view_time': '',
    'eventName': '',
    'eventProps': '',
  },
  'requests': {
    'base':
      'https://b.cnzz.com/utrack?' +
      '&_siteid=${siteid}' +
      '&_distinct_id=${clientId(umeng_amp_id)}' +
      '&_t=${timestamp}' +
      '&_s=google' +
      '&_b=web' +
      '&_r=${externalReferrer}' +
      '&_h=${screenHeight}' +
      '&_w=${screenWidth}' +
      '&_ivt=${initial_view_time}',
    'pageview': '${base}&_ename=$w_page_view&_eprops=${eventProps}',
    'event': '${base}&_ename=${eventName}&_eprops=${eventProps}',
  },
  'triggers': {
    'defaultPageview': {
      'on': 'visible',
      'request': 'pageview',
    },
  },
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
});
