const bentoRuntimePackages = require('../compile/generate/metadata/bento-runtime-packages');
const {generateIntermediatePackage} = require('../compile/generate/bento');
const {getMinifiedConfig} = require('./minified-config');
const {getUnminifiedConfig} = require('./unminified-config');
const {outputFileSync, pathExistsSync} = require('fs-extra');

/**
 * @param {{[name: string]: string[]}} packages
 * @return {string}
 */
function writeIntermediatePackage(packages) {
  const filePath = `build/bento-shared.js`;
  if (!pathExistsSync(filePath)) {
    outputFileSync(filePath, generateIntermediatePackage(packages));
  }
  // #build is an alias to the root build/
  return `#${filePath}`;
}

/**
 * @param {{[name: string]: string[]}} packages
 * @return {[string, {pkg: string, replacements: {[original: string]: string[]}}]}
 */
function getImportPlugin(packages) {
  return [
    './build-system/babel-plugins/babel-plugin-bento-imports',
    {
      pkg: writeIntermediatePackage(packages),
      replacements: packages,
    },
  ];
}

/**
 * @param {!Object} config
 * @return {Object}
 */
function mergeWithConfig(config) {
  return {
    ...config,
    plugins: [getImportPlugin(bentoRuntimePackages), ...config.plugins],
  };
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
  getBentoElementUnminifiedConfig,
  getBentoElementMinifiedConfig,
};
