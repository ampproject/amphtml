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

export const ACQUIALIFT_CONFIG = /** @type {!JsonObject} */ ({
  'vars': {
    'decisionApiUrl': 'us-east-1-decisionapi.lift.acquia.com',
    'accountId': 'xxxxxxxx',
    'siteId': 'xxxxxxxx',
  },
  'transport': {'beacon': true, 'xhrpost': true, 'image': false},
  'requests': {
    'base':
      'https://${decisionApiUrl}/capture?account_id=${accountId}&site_id=${siteId}',
    'basicCapture':
      '${base}' +
      '&ident=${clientId(tc_ptid)}' +
      '&identsrc=amp' +
      '&es=Amp' +
      '&url=${canonicalUrl}' +
      '&rurl=${documentReferrer}' +
      '&cttl=${title}',
    'pageview': '${basicCapture}' + '&en=Content View',
    'click': '${basicCapture}' + '&en=Click-Through',
  },
  'triggers': {
    'defaultPageview': {
      'on': 'visible',
      'request': 'pageview',
    },
  },
});
