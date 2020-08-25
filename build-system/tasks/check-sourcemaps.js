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
const {decode} = require('sourcemap-codec');
const {execOrDie} = require('../common/exec');

// Compile related constants
const distWithSourcemapsCmd = 'gulp dist --core_runtime_only --full_sourcemaps';
const v0JsMap = 'dist/v0.js.map';

// Sourcemap URL related constants
const sourcemapUrlMatcher =
  'https://raw.githubusercontent.com/ampproject/amphtml/\\d{13}/';

// Mapping related constants
const expectedFirstLineFile = 'src/polyfills/array-includes.js';
const expectedFirstLineCode = 'function includes(value, opt_fromIndex) {';
const expectedColStart = 'use strict'.length; // Code begins after an initial 'use strict'.

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
 * Verifies that the sourcemap file exists, and returns its contents.
 *
 * @return {!Object}
 */
function getSourcemapJson() {
  if (!fs.existsSync(v0JsMap)) {
    log(red('ERROR:'), 'Could not find', cyan(v0JsMap));
    throwError('Could not find sourcemap file');
  }
  return JSON.parse(fs.readFileSync(v0JsMap, 'utf8'));
}

/**
 * Verifies that a correctly formatted sourcemap URL is present in v0.js.map.
 *
 * @param {!Object} sourcemapJson
 */
function checkSourcemapUrl(sourcemapJson) {
  log('Inspecting', cyan('sourceRoot'), 'in', cyan(v0JsMap) + '...');
  if (!sourcemapJson.sourceRoot) {
    log(red('ERROR:'), 'Could not find', cyan('sourceRoot'));
    throwError('Could not find sourcemap URL');
  }
  if (!sourcemapJson.sourceRoot.match(sourcemapUrlMatcher)) {
    log(red('ERROR:'), cyan(sourcemapJson.sourceRoot), 'is badly formatted');
    throwError('Badly formatted sourcemap URL');
  }
}

/**
 * Verifies all the paths in the sources field are as expected.
 *
 * @param {!Object} sourcemapJson
 */
function checkSourcemapSources(sourcemapJson) {
  log('Inspecting', cyan('sources'), 'in', cyan(v0JsMap) + '...');
  if (!sourcemapJson.sources) {
    log(red('ERROR:'), 'Could not find', cyan('sources'));
    throwError('Could not find sources array');
  }
  const invalidSources = sourcemapJson.sources
    .filter((source) => !source.match(/\[.*\]/)) // Ignore non-path sources '[...]'
    .filter((source) => !fs.existsSync(source)); // All source paths should exist
  if (invalidSources.length > 0) {
    log(
      red('ERROR:'),
      'Found invalid paths in',
      cyan('sources') + ':',
      cyan(invalidSources.join(', '))
    );
    throwError('Invalid paths in sources array');
  }
}

/**
 * Performs a sanity check on the mappings field in the sourcemap file.
 *
 * Today, the first line of amp.js after resolving imports comes from
 * src/polyfills/array-includes.js. (The import chain is src/amp.js -> src/polyfills.js
 * -> src/polyfills/array-includes.js.) This sequence changes rarely, so we can
 * use it as a sentinel value. Here is the process:
 *
 * 1. Decode the 'mappings' field into a 3d array using 'sourcemap-codec'.
 * 2. Extract the mapping for the first line of code in minified v0.js.
 * 3. Compute the name of the source file that corresponds to this line.
 * 4. Read the source file and extract the corresponding line of code.
 * 5. Check if the filename and the line of code match expected sentinel values.
 *
 * @param {!Object} sourcemapJson
 */
function checkSourcemapMappings(sourcemapJson) {
  log('Inspecting', cyan('mappings'), 'in', cyan(v0JsMap) + '...');
  if (!sourcemapJson.mappings) {
    log(red('ERROR:'), 'Could not find', cyan('mappings'));
    throwError('Could not find mappings array');
  }

  // Zeroth sub-array corresponds to ';' and has no mappings.
  // See https://www.npmjs.com/package/sourcemap-codec#usage
  const firstLineMapping = decode(sourcemapJson.mappings)[1][0];
  const [
    generatedCodeColumn,
    sourceIndex,
    sourceCodeLine,
    sourceCodeColumn,
  ] = firstLineMapping;

  const firstLineFile = sourcemapJson.sources[sourceIndex];
  const contents = fs.readFileSync(firstLineFile, 'utf8').split('\n');
  const firstLineCode = contents[sourceCodeLine];
  const helpMessage =
    'If this change is intentional, update the mapping related constants in ' +
    cyan('build-system/tasks/check-sourcemaps.js') +
    '.';
  if (firstLineFile != expectedFirstLineFile) {
    log(red('ERROR:'), 'Found mapping for incorrect file.');
    log('Actual:', cyan(firstLineFile));
    log('Expected:', cyan(expectedFirstLineFile));
    log(helpMessage);
    throwError('Found mapping for incorrect file');
  }
  if (firstLineCode != expectedFirstLineCode) {
    log(red('ERROR:'), 'Found mapping for incorrect code.');
    log('Actual:', cyan(firstLineCode));
    log('Expected:', cyan(expectedFirstLineCode));
    log(helpMessage);
    throwError('Found mapping for incorrect code');
  }
  if (generatedCodeColumn != 0 || sourceCodeColumn != expectedColStart) {
    log(red('ERROR:'), 'Found mapping for incorrect (non-zero) column.');
    log('generatedCodeColumn:', cyan(generatedCodeColumn));
    log('sourceCodeColumn:', cyan(sourceCodeColumn));
    throwError('Found mapping for incorrect column');
  }
}

/**
 * Checks sourcemaps generated during minified compilation for correctness.
 * Entry point for `gulp check-sourcemaps`.
 */
async function checkSourcemaps() {
  maybeBuild();
  const sourcemapJson = getSourcemapJson();
  checkSourcemapUrl(sourcemapJson);
  checkSourcemapSources(sourcemapJson);
  checkSourcemapMappings(sourcemapJson);
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
