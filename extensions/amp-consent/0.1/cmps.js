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
    'checkConsentHref': '/get-consent-v1?cid=CLIENT_ID&pid=PAGE_VIEW_ID',
    'promptUISrc':
      '/examples/amp-consent/diy-consent.html?cid=CLIENT_ID&pid=PAGE_VIEW_ID',
  };
}

CMP_CONFIG['appconsent'] = {
  'consentInstanceId': 'appconsent',
  'checkConsentHref': 'https://collector.appconsent.io/amp/check-consent',
  'promptUISrc': 'https://cdn.appconsent.io/loader.html',
};

CMP_CONFIG['didomi'] = {
  'consentInstanceId': 'didomi',
  'checkConsentHref': 'https://api.privacy-center.org/amp/check-consent',
  'promptUISrc': 'https://sdk-amp.privacy-center.org/loader.html',
};

CMP_CONFIG['iubenda'] = {
  'consentInstanceId': 'iubenda',
  'checkConsentHref': 'https://cdn.iubenda.com/cs/amp/checkConsent',
  'promptUISrc': 'https://www.iubenda.com/en/help/22135-cookie-solution-amp',
};

CMP_CONFIG['sirdata'] = {
  'consentInstanceId': 'sirdata',
  'checkConsentHref': 'https://sddan.mgr.consensu.org/api/v1/public/amp/check',
  'promptUISrc': 'https://ui.sddan.mgr.consensu.org/amp.html',
};

CMP_CONFIG['Marfeel'] = {
  'consentInstanceId': 'Marfeel',
  'checkConsentHref': 'https://live.mrf.io/cmp/consents/amp',
  'promptUISrc': 'https://marfeel.mgr.consensu.org/amp/index.html',
};

CMP_CONFIG['Ogury'] = {
  'consentInstanceId': 'Ogury',
  'checkConsentHref': 'https://api.ogury.mgr.consensu.org/v1/check-for-consent',
  'promptUISrc': 'https://www.ogury.mgr.consensu.org/amp.html',
};

CMP_CONFIG['opencmp'] = {
  'consentInstanceId': 'opencmp',
  'checkConsentHref': 'https://amp.opencmp.net/consent/check',
  'promptUISrc': 'https://cdn.opencmp.net/tcf-v2/amp/cmp.html',
};

CMP_CONFIG['SourcePoint'] = {
  'consentInstanceId': 'SourcePoint',
  'checkConsentHref': 'https://sourcepoint.mgr.consensu.org/consent/v2/amp',
  'promptUISrc': 'https://amp.pm.sourcepoint.mgr.consensu.org/',
};

CMP_CONFIG['Usercentrics'] = {
  'consentInstanceId': 'Usercentrics',
  'checkConsentHref': 'https://consents.usercentrics.eu/amp/checkConsent',
  'promptUISrc': 'https://amp.usercentrics.eu/amp.html',
};
