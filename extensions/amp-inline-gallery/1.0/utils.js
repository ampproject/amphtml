/**
 * @param {string} bentoName
 * @return {string} `amp-` prefixed component name
 */
export function getAmpName(bentoName) {
  return bentoName.replace(/^bento-/, 'amp-');
}
