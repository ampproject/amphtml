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

export const _FAKE_ = /** @type {!JsonObject} */ ({
  'requests': {
    'endpoint': '/analytics/fake',
  },
  'transport': {
    'useBody': true,
  },
  'triggers': {
    'view': {
      'on': 'visible',
      'request': 'endpoint',
    },
  },
  'configRewriter': {
    'url': '/analytics/rewriter',
    'varGroups': {
      'feature1': {
        'dr': 'DOCUMENT_REFERRER',
        'su': 'SOURCE_URL',
      },
      'feature2': {
        'name': 'cats',
        'title': 'TITLE',
      },
      'alwaysOnFeature': {
        'title2': 'TITLE',
        'enabled': true,
      },
    },
  },
  'vars': {
    'clientId': 'CLIENT_ID(_fake_)',
    'dataSource': 'AMP',
  },
});
