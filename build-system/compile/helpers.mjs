import fs from 'fs-extra';
import minimist from 'minimist';
import path from 'path';
import {getBabelOutputDir} from './pre-closure-babel.mjs';
import {VERSION as internalRuntimeVersion} from './internal-version.mjs';

const argv = minimist(process.argv.slice(2));

/**
 * Computes the base url for sourcemaps. Custom sourcemap URLs have placeholder
 * {version} that should be replaced with the actual version. Also, ensures
 * that a trailing slash exists.
 * @param {Object} options
 * @return {string}
 */
function getSourceMapBase(options) {
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
export async function writeSourcemaps(sourcemapsFile, options) {
  const sourcemaps = await fs.readJson(sourcemapsFile);
  updatePaths(sourcemaps);
  const extra = {
    sourceRoot: getSourceMapBase(options),
    includeContent: !!argv.full_sourcemaps,
  };
  await fs.writeJSON(sourcemapsFile, {...sourcemaps, ...extra});
}
