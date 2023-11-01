const argv = require('minimist')(process.argv.slice(2));
const {
  VERSION: internalRuntimeVersion,
} = require('../compile/internal-version');
const {posix: path} = require('path');
const Remapping = require('@ampproject/remapping');
const ResolveUri = require('@jridgewell/resolve-uri');

/** @type {Remapping.default} */
const remapping = /** @type {*} */ (Remapping);

/** @type {ResolveUri.default} */
const resolveUri = /** @type {*} */ (ResolveUri);

/**
 * @return {boolean}
 */
function includeSourcesContent() {
  if (argv._.includes('dist')) {
    return !!argv.full_sourcemaps;
  }
  return true;
}

/**
 * @param {Array<Object|string>} mapChain
 * @param {string} destFile
 * @param {*} options
 * @return {object}
 */
function massageSourcemaps(mapChain, destFile, options) {
  const map = remapping(mapChain, () => null, !includeSourcesContent());
  map.file = path.basename(destFile);
  map.sourceRoot = getSourceRoot(options);
  map.sources = map.sources.map((s) => {
    // By default, sources are relative to the map. But we just added an
    // absolute sourceRoot, and we do not want the file to be relative to that
    // root.
    return resolveUri(s || '', destFile);
  });

  return map;
}

/**
 * Computes the base url for sourcemaps. Custom sourcemap URLs have placeholder
 * {version} that should be replaced with the actual version. Also, ensures
 * that a trailing slash exists.
 * @param {object} options
 * @return {string}
 */
function getSourceRoot(options) {
  if (argv.sourcemap_url) {
    return String(argv.sourcemap_url)
      .replace(/\{version\}/g, internalRuntimeVersion)
      .replace(/([^/])$/, '$1/');
  }
  if (options.fortesting || !argv._.includes('dist')) {
    return 'http://localhost:8000/';
  }
  return `https://raw.githubusercontent.com/ampproject/amphtml/${internalRuntimeVersion}/`;
}

module.exports = {
  massageSourcemaps,
  includeSourcesContent,
};
