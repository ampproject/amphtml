/** @exports {string} Extension name*/
export const TAG = 'amp-access-fewcents';

/** @exports {string} Extension shorthand name used for CSS classes */
export const TAG_SHORTHAND = 'aaf';

/** @exports {string} */
export const CONFIG_BASE_PATH =
  'https://api.hounds.fewcents.co/v1/amp/authorizeBid?articleUrl=SOURCE_URL&ampReaderId=READER_ID&returnUrl=RETURN_URL';

/** @exports {JsonObject} */
export const DEFAULT_MESSAGES = {
  /* fc denotes fewcents */
  fcTitleText: 'Instant Access With Fewcents.',
  fcButtonText: 'Unlock',
};
