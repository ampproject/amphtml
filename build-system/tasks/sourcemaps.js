const argv = require('minimist')(process.argv.slice(2));
const {
  VERSION: internalRuntimeVersion,
} = require('../compile/internal-version');
const path = require('path');
const Remapping = require('@ampproject/remapping');

/** @type {Remapping.default} */
const remapping = /** @type {*} */ (Remapping);

/**
 * @param {Array<Object|string>} mapChain
 * @param {*} options
 * @return {Object}
 */
function massageSourcemaps(mapChain, options) {
  const map = remapping(mapChain, () => null, !argv.full_sourcemaps);
  map.sourceRoot = getSourceRoot(options);
  if (map.file) {
    map.file = path.basename(map.file);
  }
  map.sources = map.sources.map((s) => {
    if (s?.startsWith('../')) {
      return s.slice('../'.length);
    }
    return s;
  });

  return map;
}

/**
 * Computes the base url for sourcemaps. Custom sourcemap URLs have placeholder
 * {version} that should be replaced with the actual version. Also, ensures
 * that a trailing slash exists.
 * @param {Object} options
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
};
