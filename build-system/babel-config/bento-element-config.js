const {
  getSharedBentoSymbols,
} = require('../compile/generate/metadata/bento-runtime-packages');
const {generateIntermediatePackage} = require('../compile/generate/bento');
const {getMinifiedConfig} = require('./minified-config');
const {getUnminifiedConfig} = require('./unminified-config');
const {outputFileSync, pathExistsSync} = require('fs-extra');

/**
 * @param {{[name: string]: string[]}} packages
 * @return {string}
 */
function writeIntermediatePackage(packages) {
  // Don't remove the `./`
  const modulePath = './build/bento-shared.js';
  if (!pathExistsSync(modulePath)) {
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
    // Unique name because babel errors out otherwise:
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
