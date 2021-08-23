const {getOutput} = require('../../common/process.mjs');

/**
 * @param {Array<string>} files
 * @return {Object}
 */
function format(files) {
  return getOutput(`npx prettier --ignore-unknown --write ${files.join(' ')}`);
}

module.exports = {
  format,
};
