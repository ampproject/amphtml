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

const compiler = require('@ampproject/google-closure-compiler');
const vinylFs = require('vinyl-fs');
const {cyan, red, yellow} = require('kleur/colors');
const {getBabelCacheDir} = require('./pre-closure-babel');
const {log, logWithoutTimestamp} = require('../common/logging');

/**
 * Logs a closure compiler error message after syntax highlighting it and then
 * formatting it into a more readable form by dropping the plugin's logging
 * prefix, normalizing paths, and emphasizing errors and warnings.
 * @param {string} message
 */
function logClosureCompilerError(message) {
  log(red('ERROR:'));
  const babelCacheDir = `${getBabelCacheDir()}/`;
  const loggingPrefix = /^.*?gulp-google-closure-compiler.*?: /;
  const {highlight} = require('cli-highlight'); // Lazy-required to speed up task loading.
  const highlightedMessage = highlight(message, {ignoreIllegals: true});
  const formattedMessage = highlightedMessage
    .replace(loggingPrefix, '')
    .replace(new RegExp(babelCacheDir, 'g'), '')
    .replace(/ ERROR /g, red(' ERROR '))
    .replace(/ WARNING /g, yellow(' WARNING '));
  logWithoutTimestamp(formattedMessage);
}

/**
 * Handles a closure error during compilation and type checking. Passes through
 * the error except in watch mode, where we want to print a failure message and
 * continue.
 * @param {!PluginError} err
 * @param {string} outputFilename
 * @param {?Object} options
 * @return {!PluginError|undefined}
 */
function handleClosureCompilerError(err, outputFilename, options) {
  if (options.typeCheckOnly) {
    log(`${red('ERROR:')} Type checking failed`);
    return err;
  }
  log(`${red('ERROR:')} Could not minify ${cyan(outputFilename)}`);
  if (options.continueOnError) {
    options.errored = true;
    return;
  }
  return err;
}

/**
 * Initializes closure compiler with the given set of flags. We use the gulp
 * streaming plugin because invoking a command with a long list of --fs flags
 * on Windows exceeds the command line size limit. The stream mode is 'IN'
 * because output files and sourcemaps are written directly to disk.
 * @param {Array<string>} flags
 * @return {!Object}
 */
function initializeClosure(flags) {
  const pluginOptions = {streamMode: 'IN', logger: logClosureCompilerError};
  return compiler.gulp()(flags, pluginOptions);
}

/**
 * Runs closure compiler with the given set of flags.
 * @param {string} outputFilename
 * @param {!Object} options
 * @param {Array<string>} flags
 * @param {Array<string>} srcFiles
 * @return {Promise<void>}
 */
function runClosure(outputFilename, options, flags, srcFiles) {
  return new Promise((resolve, reject) => {
    vinylFs
      .src(srcFiles, {base: getBabelCacheDir()})
      .pipe(initializeClosure(flags))
      .on('error', (err) => {
        const reason = handleClosureCompilerError(err, outputFilename, options);
        reason ? reject(reason) : resolve();
      })
      .on('end', resolve)
      .pipe(vinylFs.dest('.'));
  });
}

module.exports = {
  runClosure,
};
