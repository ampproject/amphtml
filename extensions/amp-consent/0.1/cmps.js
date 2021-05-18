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
 * [
 *   string, // The key to store consent information
 *   url, // remote endpoint
 *   url, // the src for prompt iframe window
 *]}
 */

export const CMP_CONFIG = {};

if (getMode().test || getMode().localDev) {
  CMP_CONFIG['_ping_'] = [
    '/get-consent-v1?cid=CLIENT_ID&pid=PAGE_VIEW_ID',
    '/examples/amp-consent/diy-consent.html?cid=CLIENT_ID&pid=PAGE_VIEW_ID',
  ];
}

CMP_CONFIG['appconsent'] = [
  'https://collector.appconsent.io/amp/check-consent',
  'https://cdn.appconsent.io/loader.html',
];

CMP_CONFIG['ConsentManager'] = [
  'https://consentmanager.mgr.consensu.org/delivery/ampcheck.php',
  'https://consentmanager.mgr.consensu.org/delivery/ampui.php',
];

CMP_CONFIG['didomi'] = [
  'https://api.privacy-center.org/amp/check-consent',
  'https://sdk-amp.privacy-center.org/loader.html',
];

CMP_CONFIG['iubenda'] = [
  'https://amp.iubenda.com/checkConsent',
  'https://www.iubenda.com/en/help/22135-cookie-solution-amp',
];

CMP_CONFIG['sirdata'] = [
  'https://sddan.mgr.consensu.org/api/v1/public/amp/check',
  'https://ui.sddan.mgr.consensu.org/amp.html',
];

CMP_CONFIG['Marfeel'] = [
  'https://live.mrf.io/cmp/marfeel/amp/check-consent',
  'https://live.mrf.io/cmp/marfeel/amp/index.html',
];

CMP_CONFIG['Ogury'] = [
  'https://api.ogury.mgr.consensu.org/v1/check-for-consent',
  'https://www.ogury.mgr.consensu.org/amp.html',
];

CMP_CONFIG['onetrust'] = [
  'https://cdn.cookielaw.org/amp/consent/check',
  'https://amp.onetrust.mgr.consensu.org/',
];

CMP_CONFIG['opencmp'] = [
  'https://amp.opencmp.net/consent/check',
  'https://cdn.opencmp.net/tcf-v2/amp/cmp.html',
];

CMP_CONFIG['pubtech'] = [
  'https://amp.pubtech.it/cmp-amp-check-consent',
  'https://cdn.pubtech.ai/amp/index.html',
];

CMP_CONFIG['quantcast'] = [
  'https://apis.quantcast.mgr.consensu.org/amp/check-consent',
  'https://quantcast.mgr.consensu.org/tcfv2/amp.html',
];

CMP_CONFIG['SourcePoint'] = [
  'https://sourcepoint.mgr.consensu.org/consent/v2/amp',
  'https://amp.pm.sourcepoint.mgr.consensu.org/',
];

CMP_CONFIG['UniConsent'] = [
  'https://edge.uniconsent.com/amp/check-consent',
  'https://cmp.uniconsent.com/amp/index.html',
];

CMP_CONFIG['Usercentrics'] = [
  'https://consents.usercentrics.eu/amp/checkConsent',
  'https://amp.usercentrics.eu/amp.html',
];

CMP_CONFIG['LiveRamp'] = [
  'https://api.privacymanager.io/amp/check-consent',
  'https://amp-consent-tool.privacymanager.io/1/index.html',
];
