/**
 * @param {string} name
 * @return {string}
 */
function getBentoName(name) {
  return `bento-${name.replace(/^amp-/, '')}`;
}

module.exports = {getBentoName};
