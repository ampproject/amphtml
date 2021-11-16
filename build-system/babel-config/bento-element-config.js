const bentoRuntimePackages = require('../compile/generate/metadata/bento-runtime-packages');
const {generateIntermediatePackage} = require('../compile/generate/bento');
const {getMinifiedConfig} = require('./minified-config');
const {getUnminifiedConfig} = require('./unminified-config');
const {outputFileSync, pathExistsSync} = require('fs-extra');

/**
 * @param {string} original
 * @param {string[]} names
 * @return {string}
 */
function writeIntermediatePackage(original, names) {
  const basename = original.replace(/[^a-z0-9]/g, '_');
  const filePath = `build/bento-package/${basename}.js`;
  if (!pathExistsSync(filePath)) {
    outputFileSync(filePath, generateIntermediatePackage(original, names));
  }
  // #build is an alias to the root build/
  return `#${filePath}`;
}

/**
 * @return {[string, {packages: {[original: string]: {pkg: string, names: string[]}}}]}
 */
function getImportPlugin() {
  const packages = Object.fromEntries(
    Object.entries(bentoRuntimePackages).map(([original, names]) => {
      const pkg = writeIntermediatePackage(original, names);
      return [original, {pkg, names}];
    })
  );
  return [
    './build-system/babel-plugins/babel-plugin-bento-imports',
    {packages},
  ];
}

/**
 * @param {!Object} config
 * @return {Object}
 */
function mergeWithConfig(config) {
  return {
    ...config,
    plugins: [getImportPlugin(), ...config.plugins],
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
