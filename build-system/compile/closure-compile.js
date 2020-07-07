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

const closureCompiler = require('@kristoferbaxter/google-closure-compiler');
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
 * @return {stream.Writable}
 */
function gulpClosureCompile(compilerOptions) {
  const pluginOptions = {
    logger: (errors) => (compilerErrors = errors), // Capture compiler errors
  };

  return makeSourcemapsRelative(
    closureCompiler.gulp()(compilerOptions, pluginOptions)
  );
}

module.exports = {
  gulpClosureCompile,
  handleCompilerError,
  handleTypeCheckError,
};
