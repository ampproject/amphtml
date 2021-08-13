'use strict';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs-extra');
const path = require('path');
const {getBabelOutputDir} = require('./pre-closure-babel');
const {VERSION: internalRuntimeVersion} = require('./internal-version');

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
  if (options.fortesting) {
    return 'http://localhost:8000/';
  }
  return `https://raw.githubusercontent.com/ampproject/amphtml/${internalRuntimeVersion}/`;
}

/**
 * Updates all filepaths in the sourcemap output.
 * @param {Object} sourcemaps
 */
function updatePaths(sourcemaps) {
  const babelOutputDir = getBabelOutputDir();
  sourcemaps.sources = sourcemaps.sources.map((source) =>
    source.startsWith(babelOutputDir)
      ? path.relative(babelOutputDir, source)
      : source
  );
  if (sourcemaps.file) {
    sourcemaps.file = path.basename(sourcemaps.file);
  }
}

/**
 * Writes the sourcemap output to disk.
 * @param {string} sourcemapsFile
 * @param {Object} options
 * @return {Promise<void>}
 */
async function writeSourcemaps(sourcemapsFile, options) {
  const sourcemaps = await fs.readJson(sourcemapsFile);

  updatePaths(sourcemaps);
  if (!argv.full_sourcemaps) {
    delete sourcemaps.sourcesContent;
  }
  sourcemaps.sourceRoot = getSourceRoot(options);

  await fs.writeJSON(sourcemapsFile, sourcemaps);
}

module.exports = {
  getSourceMapBase,
  writeSourcemaps,
};
