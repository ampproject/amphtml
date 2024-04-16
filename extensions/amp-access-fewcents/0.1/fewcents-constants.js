/** @const {string} Extension name*/
export const TAG = 'amp-access-fewcents';

/** @const {string} Extension shorthand name used for CSS classes */
export const TAG_SHORTHAND = 'aaf';

/** @const {json} */
export const CONFIG_BASE_PATH = {
  development: 'https://api.hounds.fewcents.co/',
  demo: 'https://api.demo.fewcents.co/',
  production: 'https://api.fewcents.co/',
};

/** @const {string} Path params for authorize url */
export const CONFIG_PATH_PARAMS =
  'v1/amp/authorizeBid?articleUrl=SOURCE_URL&ampReaderId=READER_ID&returnUrl=RETURN_URL';

/** @const {number} */
export const AUTHORIZATION_TIMEOUT = 10000;

/** @const {JsonObject} */
export const DEFAULT_MESSAGES = {
  /* fc denotes fewcents */
  fcTitleText: 'Instant Access With Fewcents.',
  fcPromptText: 'I already bought this',
  fcButtonText: 'Unlock',
  fcPoweredImageRef: 'https://images.fewcents.co/paywall/powered-fewcents.png',
  fcTermsRef: 'https://www.fewcents.co/terms',
  fcPrivacyRef: 'https://www.fewcents.co/privacy',
  fcContactUsRef: 'mailto:support@fewcents.co',
};
