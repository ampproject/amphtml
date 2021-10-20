const {getUnminifiedConfig} = require('./unminified-config');

/**
 * @return {!Object}
 */
function getBentoUnminifiedConfig() {
  const config = getUnminifiedConfig();
  return {
    ...config,
    plugins: [
      './build-system/babel-plugins/babel-plugin-bento-imports',
      ...config.plugins,
    ],
  };
}

module.exports = {
  getBentoUnminifiedConfig,
};
