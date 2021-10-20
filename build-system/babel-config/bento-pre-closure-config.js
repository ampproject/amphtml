const {getPreClosureConfig} = require('./pre-closure-config');

/**
 * @return {!Object}
 */
function getBentoPreClosureConfig() {
  const config = getPreClosureConfig();
  return {
    ...config,
    plugins: [
      './build-system/babel-plugins/babel-plugin-bento-imports',
      ...config.plugins,
    ],
  };
}

module.exports = {
  getBentoPreClosureConfig,
};
