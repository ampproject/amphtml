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

const AMPLITUDE_CONFIG = jsonLiteral({
  'transport': {
    'beacon': true,
    'xhrpost': true,
    'useBody': true,
    'image': false,
  },
  'vars': {
    'deviceId': 'CLIENT_ID(amplitude_amp_id)',
  },
  'requests': {
    'host': 'https://api.amplitude.com',
    'event': {
      'baseUrl': '${host}/amp/event',
    },
  },
  'extraUrlParams': {
    'api_key': '${apiKey}',
    'device_id': '${deviceId}',
    'library': 'amp/${ampVersion}',
    'time': '${timestamp}',
    'language': '${browserLanguage}',
    'user_agent': '${userAgent}',
  },
  'linkers': {
    'amplitude': {
      'ids': {
        'amplitude_amp_id': '${deviceId}',
      },
      'proxyOnly': false,
    },
  },
  'cookies': {
    'amplitude_amp_id': {
      'value': 'LINKER_PARAM(amplitude, amplitude_amp_id)',
    },
  },
});

export {AMPLITUDE_CONFIG};
