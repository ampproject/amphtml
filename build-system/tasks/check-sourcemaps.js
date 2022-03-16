'use strict';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const {cyan, green, red} = require('kleur/colors');
const {decode} = require('sourcemap-codec');
const {execOrDie} = require('../common/exec');
const {log} = require('../common/logging');

// Compile related constants
const distWithSourcemapsCmd =
  'amp dist --core_runtime_only --extensions=amp-audio --full_sourcemaps';
const distEsmWithSourcemapsCmd =
  'amp dist --core_runtime_only --extensions=amp-audio --full_sourcemaps --esm';

// Sourcemap URL related constants
const sourcemapUrlMatcher =
  'https://raw.githubusercontent.com/ampproject/amphtml/\\d{13}/';

/**
 * Build runtime with sourcemaps if needed.
 */
function maybeBuild() {
  if (!argv.nobuild) {
    log('Compiling', cyan('v0.js'), 'with full sourcemaps...');
    execOrDie(distWithSourcemapsCmd, {'stdio': 'ignore'});
    log('Compiling', cyan('v0.mjs'), 'with full sourcemaps...');
    execOrDie(distEsmWithSourcemapsCmd, {'stdio': 'ignore'});
  }
}

/**
 * Verifies that the sourcemap file exists, and returns its contents.
 * @param {string} map The map filepath to check
 * @return {!Object}
 */
function getSourcemapJson(map) {
  if (!fs.existsSync(map)) {
    log(red('ERROR:'), 'Could not find', cyan(map));
    throw new Error(`Could not find sourcemap file '${map}'`);
  }
  return JSON.parse(fs.readFileSync(map, 'utf8'));
}

/**
 * Verifies that a correctly formatted sourcemap URL is present in v0.js.map.
 *
 * @param {!Object} sourcemapJson
 * @param {string} map The map filepath to check
 */
function checkSourcemapUrl(sourcemapJson, map) {
  log('Inspecting', cyan('sourceRoot'), 'in', cyan(map) + '...');
  if (!sourcemapJson.sourceRoot) {
    log(red('ERROR:'), 'Could not find', cyan('sourceRoot'));
    throw new Error('Could not find sourcemap URL');
  }
  if (!sourcemapJson.sourceRoot.match(sourcemapUrlMatcher)) {
    log(red('ERROR:'), cyan(sourcemapJson.sourceRoot), 'is badly formatted');
    throw new Error('Badly formatted sourcemap URL');
  }
}

/**
 * Verifies all the paths in the sources field are as expected.
 *
 * @param {!Object} sourcemapJson
 * @param {string} map The map filepath to check
 */
function checkSourcemapSources(sourcemapJson, map) {
  log('Inspecting', cyan('sources'), 'in', cyan(map) + '...');
  if (!sourcemapJson.sources) {
    log(red('ERROR:'), 'Could not find', cyan('sources'));
    throw new Error('Could not find sources array');
  }
  /** @type {string[]} */
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
    throw new Error('Invalid paths in sources array');
  }
}

/**
 * Performs a sanity check on the mappings field in the sourcemap file.
 *
 * Today, the first line of amp.js after resolving imports comes from
 * src/polyfills/array-includes.js. (The import chain is src/amp.js ->
 * src/polyfills/index.js -> src/polyfills/array-includes.js.) This sequence
 * changes rarely, so we can use it as a sentinel value. Here is the process:
 *
 * 1. Decode the 'mappings' field into a 3d array using 'sourcemap-codec'.
 * 2. Extract the mapping for the first line of code in minified v0.js.
 * 3. Compute the name of the source file that corresponds to this line.
 * 4. Read the source file and extract the corresponding line of code.
 * 5. Check if the filename, line of code, and column match expected sentinel values.
 *
 * @param {!Object} sourcemapJson
 * @param {string} map The map filepath to check
 */
function checkSourcemapMappings(sourcemapJson, map) {
  log('Inspecting', cyan('mappings'), 'in', cyan(map) + '...');
  if (!sourcemapJson.mappings) {
    log(red('ERROR:'), 'Could not find', cyan('mappings'));
    throw new Error('Could not find mappings array');
  }

  // See https://www.npmjs.com/package/sourcemap-codec#usage.
  const firstLineMapping = decode(sourcemapJson.mappings)[1][0];
  const [, sourceIndex = 0, sourceCodeLine = 0, sourceCodeColumn] =
    firstLineMapping;

  const firstLineFile = sourcemapJson.sources[sourceIndex];
  const contents = fs.readFileSync(firstLineFile, 'utf8').split('\n');
  const firstLineCode = contents[sourceCodeLine].slice(sourceCodeColumn);
  const helpMessage =
    'If this change is intentional, update the mapping related constants in ' +
    cyan('build-system/tasks/check-sourcemaps.js') +
    '.';

  // Mapping related constants
  const expectedFirstLine = map.includes('mjs')
    ? {
        file: 'src/polyfills/abort-controller.js',
        code: 'class AbortController {',
      }
    : {
        file: 'node_modules/@babel/runtime/helpers/esm/createClass.js',
        code: 'function _defineProperties(target, props) {',
      };

  if (firstLineFile != expectedFirstLine.file) {
    log(red('ERROR:'), 'Found mapping for incorrect file.');
    log('Actual:', cyan(firstLineFile));
    log('Expected:', cyan(expectedFirstLine.file));
    log(helpMessage);
    throw new Error('Found mapping for incorrect file');
  }
  if (firstLineCode != expectedFirstLine.code) {
    log(red('ERROR:'), 'Found mapping for incorrect code.');
    log('Actual:', cyan(firstLineCode));
    log('Expected:', cyan(expectedFirstLine.code));
    log(helpMessage);
    throw new Error('Found mapping for incorrect code');
  }
}

/**
 * @param {string} map The map filepath to check
 * @param {boolean} checkMappings Whether to test a mapping points to a correct source.
 */
function checkSourceMap(map, checkMappings) {
  const sourcemapJson = getSourcemapJson(map);
  checkSourcemapUrl(sourcemapJson, map);
  checkSourcemapSources(sourcemapJson, map);
  if (checkMappings) {
    checkSourcemapMappings(sourcemapJson, map);
  }
}

/**
 * Checks sourcemaps generated during minified compilation for correctness.
 * Entry point for `amp check-sourcemaps`.
 * @return {Promise<void>}
 */
async function checkSourcemaps() {
  maybeBuild();
  checkSourceMap('dist/v0.js.map', true);
  checkSourceMap('dist/v0.mjs.map', true);

  checkSourceMap('dist/v0/amp-audio-0.1.js.map', false);
  checkSourceMap('dist/v0/amp-audio-0.1.mjs.map', false);

  log(green('SUCCESS:'), 'All sourcemaps checks passed.');
}

module.exports = {
  checkSourcemaps,
};

checkSourcemaps.description =
  'Check sourcemaps generated during minified compilation for correctness';
checkSourcemaps.flags = {
  'nobuild': 'Skip building the runtime (checks previously built code)',
};
