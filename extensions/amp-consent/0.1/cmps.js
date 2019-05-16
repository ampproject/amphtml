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

import {getMode} from '../../../src/mode';

/**
 * The CMP config should looks like
 * {
 *   'consentInstanceId': string, // The key to store consent information
 *   'checkConsentHref': url, // remote endpoint
 *   'promptUISrc': url, // the src for prompt iframe window
 * }
 */

export const CMP_CONFIG = {};

if (getMode().test || getMode().localDev) {
  CMP_CONFIG['_ping_'] = {
    'consentInstanceId': '_ping_',
    'checkConsentHref': '/get-consent-v1',
    'promptUISrc': '/test/manual/diy-consent.html',
  };
}

CMP_CONFIG['didomi'] = {
  'consentInstanceId': 'didomi',
  'checkConsentHref': 'https://api.privacy-center.org/amp/check-consent',
  'promptUISrc': 'https://sdk-amp.privacy-center.org/loader.html',
};
