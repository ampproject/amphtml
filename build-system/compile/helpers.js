/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
async function writeSourcemaps(sourcemapsFile, options) {
  const sourcemaps = await fs.readJson(sourcemapsFile);
  updatePaths(sourcemaps);
  const extra = {
    sourceRoot: getSourceMapBase(options),
    includeContent: !!argv.full_sourcemaps,
  };
  await fs.writeJSON(sourcemapsFile, {...sourcemaps, ...extra});
}

module.exports = {
  writeSourcemaps,
};
