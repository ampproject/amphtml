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

import {jsonLiteral} from '../../../../src/json';

const DEEPBI_CONFIG = jsonLiteral({
  'requestOrigin': 'https://${endpoint}',
  'vars': {
    'gdpr': true,
    'endpoint': 'api.deep.bi',
  },
  'requests': {
    'base':
      '/v1/pixel/${datasetKey}/p.gif?accessKey=${accessKey}&gdpr=${gdpr}&page_href=${sourceUrl}&referrer_href=${documentReferrer}&page_title=${title}&amp=true',
    'pageview': '${base}&event_type=page-open',
    'event': '${base}&event_type=event',
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

export {DEEPBI_CONFIG};
