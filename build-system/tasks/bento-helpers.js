/**
 * @param {string} name
 * @return {string}
 */
function getBentoName(name) {
  return name.replace(/^amp-/, 'bento-');
}

/**
 * @param {string} name
 * @return {string} name without `amp-` or `bento-` prefix
 */
function getNameWithoutComponentPrefix(name) {
  return name.replace(/^(amp|bento)-/, '');
}

module.exports = {getBentoName, getNameWithoutComponentPrefix};
