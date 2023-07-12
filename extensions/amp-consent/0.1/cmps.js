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
      '/examples/amp-consent/diy-consent.html?cid=CLIENT_ID&pid=PAGE_VIEW_ID&clientconfig=CONSENT_INFO(clientConfig)&cpid=CONSENT_PAGE_VIEW_ID_64',
  };
}

CMP_CONFIG['appconsent'] = {
  'consentInstanceId': 'appconsent',
  'checkConsentHref': 'https://collector.appconsent.io/amp/check-consent',
  'promptUISrc': 'https://cdn.appconsent.io/loader.html',
};

CMP_CONFIG['ConsentManager'] = {
  'consentInstanceId': 'ConsentManager',
  'checkConsentHref':
    'https://delivery.consentmanager.net/delivery/ampcheck.php',
  'promptUISrc': 'https://delivery.consentmanager.net/delivery/ampui.php',
};

CMP_CONFIG['didomi'] = {
  'consentInstanceId': 'didomi',
  'checkConsentHref': 'https://api.privacy-center.org/amp/check-consent',
  'promptUISrc': 'https://sdk-amp.privacy-center.org/loader.html',
};

CMP_CONFIG['iubenda'] = {
  'consentInstanceId': 'iubenda',
  'checkConsentHref': 'https://amp.iubenda.com/checkConsent',
  'promptUISrc': 'https://www.iubenda.com/en/help/22135-cookie-solution-amp',
};

CMP_CONFIG['sirdata'] = {
  'consentInstanceId': 'sirdata',
  'checkConsentHref':
    'https://choices.consentframework.com/api/v1/public/amp/check',
  'promptUISrc': 'https://ui.consentframework.com/amp/loader.html',
};

CMP_CONFIG['Marfeel'] = {
  'consentInstanceId': 'Marfeel',
  'checkConsentHref': 'https://live.mrf.io/cmp/marfeel/amp/check-consent',
  'promptUISrc': 'https://live.mrf.io/cmp/marfeel/amp/index.html',
};

CMP_CONFIG['Ogury'] = {
  'consentInstanceId': 'Ogury',
  'checkConsentHref': 'https://api.ogury.mgr.consensu.org/v1/check-for-consent',
  'promptUISrc': 'https://www.ogury.mgr.consensu.org/amp.html',
};

CMP_CONFIG['onetrust'] = {
  'consentInstanceId': 'onetrust',
  'checkConsentHref': 'https://cdn.cookielaw.org/amp/consent/check',
  'promptUISrc': ' https://amp.onetrust.mgr.consensu.org/',
};

CMP_CONFIG['opencmp'] = {
  'consentInstanceId': 'opencmp',
  'checkConsentHref': 'https://amp.opencmp.net/consent/check',
  'promptUISrc': 'https://cdn.opencmp.net/tcf-v2/amp/cmp.html',
};

CMP_CONFIG['pubtech'] = {
  'consentInstanceId': 'pubtech',
  'checkConsentHref': 'https://amp.pubtech.it/cmp-amp-check-consent',
  'promptUISrc': 'https://cdn.pubtech.ai/amp/index.html',
};

CMP_CONFIG['quantcast'] = {
  'consentInstanceId': 'quantcast',
  'checkConsentHref':
    'https://apis.quantcast.mgr.consensu.org/amp/check-consent',
  'promptUISrc': 'https://quantcast.mgr.consensu.org/tcfv2/amp.html',
};

CMP_CONFIG['SourcePoint'] = {
  'consentInstanceId': 'SourcePoint',
  'checkConsentHref': 'https://sourcepoint.mgr.consensu.org/consent/v2/amp',
  'promptUISrc': 'https://amp.pm.sourcepoint.mgr.consensu.org/',
};

CMP_CONFIG['UniConsent'] = {
  'consentInstanceId': 'UniConsent',
  'checkConsentHref': 'https://edge.uniconsent.com/amp/check-consent',
  'promptUISrc': 'https://cmp.uniconsent.com/amp/index.html',
};

CMP_CONFIG['Usercentrics'] = {
  'consentInstanceId': 'Usercentrics',
  'checkConsentHref': 'https://consents.usercentrics.eu/amp/checkConsent',
  'promptUISrc': 'https://amp.usercentrics.eu/amp.html',
};

CMP_CONFIG['LiveRamp'] = {
  'consentInstanceId': 'LiveRamp',
  'checkConsentHref': 'https://api.privacymanager.io/amp/check-consent',
  'promptUISrc': 'https://amp-consent-tool.privacymanager.io/1/index.html',
};

CMP_CONFIG['googlefc'] = {
  'consentInstanceId': 'googlefc',
  'checkConsentHref':
    'https://fundingchoicesmessages.google.com/amp/consent/check?pvid=PAGE_VIEW_ID_64&anonid=CONSENT_PAGE_VIEW_ID_64&href=SOURCE_URL',
  'promptUISrc':
    'https://fundingchoicesmessages.google.com/amp/consent/message?pvid=PAGE_VIEW_ID_64&anonid=CONSENT_PAGE_VIEW_ID_64&href=SOURCE_URL&clientConfig=CONSENT_INFO(clientConfig)',
  'xssiPrefix': ")]}'",
  'uiConfig': {
    'overlay': true,
  },
  'clearDirtyBitOnResponse_dontUseThisItMightBeRemoved': true,
};
