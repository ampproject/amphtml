'use strict';

const path = require('path');
const {getMinifiedConfig} = require('./minified-config');
const {getUnminifiedConfig} = require('./unminified-config');

/**
 * @param {!Object} config
 * @return {Object}
 */
function mergeReactBabelConfig(config) {
  const rootDir = path.join(__dirname, '../../');
  return {
    ...config,
    plugins: [
      path.join(
        rootDir,
        './build-system/babel-plugins/babel-plugin-react-style-props'
      ),
      ...(config.plugins || []),
    ],
  };
}

/**
 * @return {!Object}
 */
function getReactUnminifiedConfig() {
  return mergeReactBabelConfig(getUnminifiedConfig());
}

/**
 * @return {!Object}
 */
function getReactMinifiedConfig() {
  return mergeReactBabelConfig(getMinifiedConfig());
}

module.exports = {
  getReactMinifiedConfig,
  getReactUnminifiedConfig,
  mergeReactBabelConfig,
};
