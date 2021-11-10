'use strict';

const {getMinifiedConfig} = require('./minified-config');
const {getUnminifiedConfig} = require('./unminified-config');

/**
 * @param {!Object} config
 * @return {Object}
 */
function mergeWithConfig(config) {
  return {
    ...config,
    plugins: [
      './build-system/babel-plugins/babel-plugin-react-style-props',
      ...config.plugins,
    ],
  };
}

/**
 * @return {!Object}
 */
function getReactUnminifiedConfig() {
  return mergeWithConfig(getUnminifiedConfig());
}

/**
 * @return {!Object}
 */
function getReactMinifiedConfig() {
  return mergeWithConfig(getMinifiedConfig());
}

module.exports = {
  getReactMinifiedConfig,
  getReactUnminifiedConfig,
};
