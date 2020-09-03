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

const minimist = require('minimist');
const sourcemaps = require('gulp-sourcemaps');
const {VERSION: internalRuntimeVersion} = require('./internal-version');

const argv = minimist(process.argv.slice(2));

function getSourceMapBase(options) {
  if (argv.sourcemap_url) {
    // Custom sourcemap URLs have placeholder {version} that should be
    // replaced with the actual version. Also, ensure trailing slash exists.
    return String(argv.sourcemap_url)
      .replace(/\{version\}/g, internalRuntimeVersion)
      .replace(/([^/])$/, '$1/');
  }
  if (options.fortesting) {
    return 'http://localhost:8000/';
  }
  return `https://raw.githubusercontent.com/ampproject/amphtml/${internalRuntimeVersion}/`;
}

function writeSourcemaps(options) {
  return sourcemaps.write('.', {
    sourceRoot: getSourceMapBase(options),
    includeContent: !!argv.full_sourcemaps,
  });
}

module.exports = {
  writeSourcemaps,
};
