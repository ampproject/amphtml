const {getMinifiedConfig} = require('./minified-config');
const {getPreClosureConfig} = require('./pre-closure-config');
const {getUnminifiedConfig} = require('./unminified-config');

/**
 * @param {!Object} config
 * @return {Object}
 */
function mergeWithConfig(config) {
  return {
    ...config,
    plugins: [
      './build-system/babel-plugins/babel-plugin-bento-imports',
      ...config.plugins,
    ],
  };
}

/**
 * @return {!Object}
 */
function getBentoElementPreClosureConfig() {
  return mergeWithConfig(getPreClosureConfig());
}

/**
 * @return {!Object}
 */
function getBentoElementUnminifiedConfig() {
  return mergeWithConfig(getUnminifiedConfig());
}

/**
 * @return {!Object}
 */
function getBentoElementMinifiedConfig() {
  return mergeWithConfig(getMinifiedConfig());
}

module.exports = {
  getBentoElementPreClosureConfig,
  getBentoElementUnminifiedConfig,
  getBentoElementMinifiedConfig,
};
