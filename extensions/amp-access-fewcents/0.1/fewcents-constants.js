/** @const {string} Extension name*/
export const TAG = 'amp-access-fewcents';

/** @const {string} Extension shorthand name used for CSS classes */
export const TAG_SHORTHAND = 'aaf';

/** @const {string} */
export const CONFIG_BASE_PATH =
  'https://api.hounds.fewcents.co/v1/amp/authorizeBid?articleUrl=SOURCE_URL&ampReaderId=READER_ID&returnUrl=RETURN_URL';

/** @const {JsonObject} */
export const DEFAULT_MESSAGES = {
  /* fc denotes fewcents */
  fcTitleText: 'Instant Access With Fewcents.',
  fcButtonText: 'Unlock',
};
