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
const fs = require('fs');
const log = require('fancy-log');
const {cyan, green, red} = require('ansi-colors');
const {execOrDie} = require('../common/exec');

// Compile related constants
const distWithSourcemapsCmd = 'gulp dist --core_runtime_only --full_sourcemaps';
const v0JsMap = 'dist/v0.js.map';

// Sourcemap URL related constants
const sourcemapUrlMatcher =
  'https://raw.githubusercontent.com/ampproject/amphtml/\\d{13}/';

/**
 * Throws an error with the given message
 *
 * @param {string} message
 */
function throwError(message) {
  const err = new Error(message);
  err.showStack = false;
  throw err;
}

/**
 * Build runtime with sourcemaps if needed.
 */
function maybeBuild() {
  if (!argv.nobuild) {
    log('Compiling', cyan('v0.js'), 'with full sourcemaps...');
    execOrDie(distWithSourcemapsCmd, {'stdio': 'ignore'});
  }
}

/**
 * Verifies that a correctly formatted sourcemap URL is present in v0.js.map.
 */
function checkSourcemapUrl() {
  log('Inspecting sourcemaps URL in', cyan(v0JsMap) + '...');
  const v0JsMapJson = JSON.parse(fs.readFileSync(v0JsMap, 'utf8'));
  if (!v0JsMapJson.sourceRoot) {
    log(
      red('ERROR:'),
      'Could not find',
      cyan('sourceRoot'),
      'in',
      cyan(v0JsMap)
    );
    throwError('Error in finding sourcemap URL');
  }
  if (!v0JsMapJson.sourceRoot.match(sourcemapUrlMatcher)) {
    log(
      red('ERROR:'),
      'Sourcemaps URL',
      cyan(v0JsMapJson.sourceRoot),
      'is of the wrong format'
    );
    throwError('Error in sourcemap URL format');
  }
}

/**
 * Checks sourcemaps generated during minified compilation for correctness.
 * Entry point for `gulp check-sourcemaps`.
 */
async function checkSourcemaps() {
  maybeBuild();
  checkSourcemapUrl();
  // TODO(#27681): Add a meaningful check for sourcemap content that doesn't
  // require updating a golden file for every single change to the compilation
  // code in `build-system/`.
  log(green('SUCCESS:'), 'All sourcemaps checks passed.');
}

module.exports = {
  checkSourcemaps,
};

checkSourcemaps.description =
  'Checks sourcemaps generated during minified compilation for correctness.';
checkSourcemaps.flags = {
  'nobuild': '  Skips building the runtime (checks previously built code)',
};
