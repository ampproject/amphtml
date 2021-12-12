const {
  getSharedBentoSymbols,
} = require('../compile/generate/shared-bento-symbols');
const {generateIntermediatePackage} = require('../compile/generate/bento');
const {getMinifiedConfig} = require('./minified-config');
const {getUnminifiedConfig} = require('./unminified-config');
const {outputFileSync} = require('fs-extra');

let modulePath;

/**
 * @param {{[name: string]: string[]}} packages
 * @return {string}
 */
function writeIntermediatePackage(packages) {
  if (!modulePath) {
    // Don't remove the `./`
    modulePath = './build/bento-shared.js';
    outputFileSync(modulePath, generateIntermediatePackage(packages));
  }
  return modulePath;
}

/**
 * @param {{[name: string]: string[]}} packages
 * @return {[string, {root: string[], alias: {[alias: string]: string}}, string]}
 */
function getModuleResolver(packages) {
  const modulePath = writeIntermediatePackage(packages);
  const alias = Object.fromEntries(
    Object.entries(packages).map(([name]) => [`^${name}$`, modulePath])
  );
  return [
    'module-resolver',
    {root: ['.'], alias},
    // Unique name because "module-resolver" is used elsewhere and babel will
    // throw a duplicate name error.
    'module-resolver-bento-shared',
  ];
}

/**
 * @param {!Object} config
 * @return {Object}
 */
function withModuleResolver(config) {
  return {
    ...config,
    plugins: [getModuleResolver(getSharedBentoSymbols()), ...config.plugins],
  };
}

/**
 * @return {!Object}
 */
function getBentoElementUnminifiedConfig() {
  return withModuleResolver(getUnminifiedConfig());
}

/**
 * @return {!Object}
 */
function getBentoElementMinifiedConfig() {
  return withModuleResolver(getMinifiedConfig());
}

module.exports = {
  getBentoElementUnminifiedConfig,
  getBentoElementMinifiedConfig,
};
