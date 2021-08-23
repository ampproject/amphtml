/**
 * Get extensions to be published on npm
 * @return {Array<any>}
 */
export function getExtensions() {
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
 * Get semver from extension version and amp version
 * See build-system/compile/internal-version.js for versioning description
 * @param {string} extensionVersion
 * @param {string} ampVersion
 * @return {string}
 */
export function getSemver(extensionVersion, ampVersion) {
  const major = extensionVersion.split('.', 2)[0];
  const minor = ampVersion.slice(0, 10);
  const patch = Number(ampVersion.slice(-3)); // npm trims leading zeroes in patch number, so mimic this in package.json
  return `${major}.${minor}.${patch}`;
}
