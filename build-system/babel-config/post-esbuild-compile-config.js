'use strict';

const {getPresetEnv} = require('./helpers');

/**
 * Gets the config that transforms any syntax output by esbuild into the
 * appropriate target syntax.
 *
 * @param {boolean} isProd
 * @return {!Object}
 */
function config(isProd) {
  return {
    compact: false,
    presets: [getPresetEnv(isProd)],
    inputSourceMap: false,
    sourceMaps: true,
  };
}

/**
 * @return {!Object}
 */
function getPostEsbuildCompileMinifiedConfig() {
  return config(true);
}

/**
 * @return {!Object}
 */
function getPostEsbuildCompileUnminifiedConfig() {
  return config(true);
}

module.exports = {
  getPostEsbuildCompileMinifiedConfig,
  getPostEsbuildCompileUnminifiedConfig,
};
