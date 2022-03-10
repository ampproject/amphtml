/**
 * Get extensions to be published on npm
 * @return {Array<any>}
 */
function getExtensions() {
  const bundles = require('../compile/bundles.config.extensions.json');
  const extensions = bundles
    .filter((bundle) => bundle.options?.npm)
    .map((bundle) => ({
      'extension': bundle.name,
      'version': bundle.version,
    }));
  return extensions;
}

/**
 * Get bento components to be published on npm
 * @return {Array<any>}
 */
function getComponents() {
  const bundles = require('../compile/bundles.config.bento.json');
  const components = bundles.map((bundle) => ({
    'extension': bundle.name,
    'version': bundle.version,
  }));
  return components;
}

/**
 * Sets package config for @bentoproject/core.
 * Follows interface used in bundle configs above
 * @type {{name: string, version: string}}
 */
const coreConfig = {
  name: 'core',
  version: '0.1',
};

/**
 * Get bento components and extensions to be published on npm
 * @return {Array<any>}
 */
function getExtensionsAndComponents() {
  return [...getExtensions(), ...getComponents()];
}

/**
 * Gets the directory of the component or extension.
 * @param {string} extension
 * @param {string} version
 * @return {string}
 */
function getPackageDir(extension, version) {
  return extension.startsWith('bento')
    ? `src/bento/components/${extension}/${version}`
    : `extensions/${extension}/${version}`;
}

/**
 * Get semver from extension version and amp version
 * See build-system/compile/internal-version.js for versioning description
 * @param {string} extensionVersion
 * @param {string} ampVersion
 * @return {string}
 */
function getSemver(extensionVersion, ampVersion) {
  const major = extensionVersion.split('.', 2)[0];
  const minor = ampVersion.slice(0, 10);
  const patch = Number(ampVersion.slice(-3)); // npm trims leading zeroes in patch number, so mimic this in package.json
  return `${major}.${minor}.${patch}`;
}

module.exports = {
  getComponents,
  getExtensions,
  getExtensionsAndComponents,
  getPackageDir,
  getSemver,
  coreConfig,
};
