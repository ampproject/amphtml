/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
const closureCompiler = require('google-closure-compiler');
const log = require('fancy-log');
const path = require('path');
const pumpify = require('pumpify');
const sourcemaps = require('gulp-sourcemaps');
const {cyan, red, yellow} = require('ansi-colors');
const {EventEmitter} = require('events');
const {highlight} = require('cli-highlight');

let compilerErrors = '';

/**
 * Formats a closure compiler error message into a more readable form by
 * dropping the closure compiler plugin's logging prefix and then syntax
 * highlighting the error text.
 * @param {string} message
 * @return {string}
 */
function formatClosureCompilerError(message) {
  const closurePluginLoggingPrefix = /^.*?gulp-google-closure-compiler.*?: /;
  message = highlight(message, {ignoreIllegals: true})
    .replace(closurePluginLoggingPrefix, '')
    .replace(/ WARNING /g, yellow(' WARNING '))
    .replace(/ ERROR /g, red(' ERROR '));
  return message;
}

/**
 * Handles a closure error during multi-pass compilation. Optionally doesn't
 * emit a fatal error when compilation fails and signals the error so subsequent
 * operations can be skipped (used in watch mode).
 *
 * @param {Error} err
 * @param {string} outputFilename
 * @param {?Object} options
 * @param {?Function} resolve
 */
function handleCompilerError(err, outputFilename, options, resolve) {
  logError(`${red('ERROR:')} Could not minify ${cyan(outputFilename)}`);
  if (options && options.continueOnError) {
    options.errored = true;
    if (resolve) {
      resolve();
    }
  } else {
    emitError(err);
  }
}

/**
 * Handles a closure error during type checking
 *
 * @param {Error} err
 */
function handleTypeCheckError(err) {
  logError(red('Type checking failed:'));
  emitError(err);
}

/**
 * Handles a closure error during single-pass compilation
 *
 * @param {Error} err
 */
function handleSinglePassCompilerError(err) {
  logError(red('Single pass compilation failed:'));
  emitError(err);
}

/**
 * Emits an error to the caller
 *
 * @param {Error} err
 */
function emitError(err) {
  err.showStack = false;
  new EventEmitter().emit('error', err);
}

/**
 * Prints an error message when compilation fails
 * @param {string} message
 */
function logError(message) {
  log(`${message}\n` + formatClosureCompilerError(compilerErrors));
}

/**
 * Normalize the sourcemap file paths before pushing into Closure.
 * Closure don't follow Gulp's normal sourcemap "root" pattern. Gulp considers
 * all files to be relative to the CWD by default, meaning a file `src/foo.js`
 * with a sourcemap alongside points to `src/foo.js`. Closure considers each
 * file relative to the sourcemap. Since the sourcemap for `src/foo.js` "lives"
 * in `src/`, it ends up resolving to `src/src/foo.js`.
 *
 * @param {!Stream} closureStream
 * @return {!Stream}
 */
function makeSourcemapsRelative(closureStream) {
  const relativeSourceMap = sourcemaps.mapSources((source, file) => {
    const dir = path.dirname(file.sourceMap.file);
    return path.relative(dir, source);
  });

  return pumpify.obj(relativeSourceMap, closureStream);
}

/**
 * @param {Array<string>} compilerOptions
 * @param {?string} nailgunPort
 * @return {stream.Writable}
 */
function gulpClosureCompile(compilerOptions, nailgunPort) {
  const initOptions = {
    extraArguments: ['-XX:+TieredCompilation'], // Significant speed up!
  };
  const pluginOptions = {
    platform: ['java'], // Override the binary used by closure compiler
    logger: (errors) => (compilerErrors = errors), // Capture compiler errors
  };

  if (compilerOptions.includes('SINGLE_FILE_COMPILATION=true')) {
    // For single-pass compilation, use the default compiler.jar
    closureCompiler.compiler.JAR_PATH = require.resolve(
      '../../node_modules/google-closure-compiler-java/compiler.jar'
    );
  } else {
    // On Mac OS and Linux, speed up compilation using nailgun (unless the
    // --disable_nailgun flag was passed in)
    // See https://github.com/facebook/nailgun.
    if (
      !argv.disable_nailgun &&
      (process.platform == 'darwin' || process.platform == 'linux')
    ) {
      compilerOptions = [
        '--nailgun-port',
        nailgunPort,
        'org.ampproject.AmpCommandLineRunner',
        '--',
      ].concat(compilerOptions);
      pluginOptions.platform = ['native']; // nailgun-runner isn't a java binary
      initOptions.extraArguments = null; // Already part of nailgun-server
    } else {
      // For other platforms, or if nailgun is explicitly disabled, use AMP's
      // custom runner.jar
      closureCompiler.compiler.JAR_PATH = require.resolve(
        `../runner/dist/${nailgunPort}/runner.jar`
      );
    }
  }

  return makeSourcemapsRelative(
    closureCompiler.gulp(initOptions)(compilerOptions, pluginOptions)
  );
}

module.exports = {
  gulpClosureCompile,
  handleCompilerError,
  handleSinglePassCompilerError,
  handleTypeCheckError,
};
