const argv = require('minimist')(process.argv.slice(2));
const {
  VERSION: internalRuntimeVersion,
} = require('../compile/internal-version');
const path = require('path');
const Remapping = require('@ampproject/remapping');

/** @type {Remapping.default} */
const remapping = /** @type {*} */ (Remapping);

/**
 * @param {!Array<string|object>} sourcemaps
 * @param {Map<string, string|object>} babelMaps
 * @param {*} options
 * @return {string}
 */
function massageSourcemaps(sourcemaps, babelMaps, options) {
  const root = process.cwd();
  const remapped = remapping(
    sourcemaps,
    (f) => {
      if (f.includes('__SOURCE__')) {
        return null;
      }
      const file = path.join(root, f);
      // The Babel tranformed file and the original file have the same path,
      // which makes it difficult to distinguish during remapping's load phase.
      // We perform some manual path mangling to destingish the babel files
      // (which have a sourcemap) from the actual source file by pretending the
      // source file exists in the '__SOURCE__' root directory.
      const map = babelMaps.get(file);
      if (!map) {
        throw new Error(`failed to find sourcemap for babel file "${f}"`);
      }
      return {
        ...map,
        sourceRoot: path.posix.join('/__SOURCE__/', path.dirname(f)),
      };
    },
    !argv.full_sourcemaps
  );

  remapped.sources = remapped.sources.map((source) => {
    if (source?.startsWith('/__SOURCE__/')) {
      return source.slice('/__SOURCE__/'.length);
    }
    return source;
  });
  remapped.sourceRoot = getSourceRoot(options);
  if (remapped.file) {
    remapped.file = path.basename(remapped.file);
  }

  return remapped.toString();
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
