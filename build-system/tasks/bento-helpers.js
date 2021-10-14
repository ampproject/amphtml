/**
 * @param {string} name
 * @return {string}
 */
function getBentoName(name) {
  return name.replace(/^amp-/, 'bento-');
}

module.exports = {getBentoName};
