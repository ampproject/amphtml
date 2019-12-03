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
const colors = require('ansi-colors');
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
  message = message.replace(closurePluginLoggingPrefix, '');
  message = highlight(message, {ignoreIllegals: true});
  message = message.replace(/WARNING/g, colors.yellow('WARNING'));
  message = message.replace(/ERROR/g, colors.red('ERROR'));
  return message;
}

function handleCompilerError(outputFilename) {
  handleError(
    colors.red('Compilation failed for ') +
      colors.cyan(outputFilename) +
      colors.red(':')
  );
}

function handleTypeCheckError() {
  handleError(colors.red('Type checking failed:'));
}

function handleSinglePassCompilerError() {
  handleError(colors.red('Single pass compilation failed:'));
}

/**
 * Prints an error message when compilation fails
 * @param {string} message
 */
function handleError(message) {
  console./*OK*/ error(
    `${message}\n` + formatClosureCompilerError(compilerErrors)
  );
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
    logger: errors => (compilerErrors = errors), // Capture compiler errors
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

  return closureCompiler.gulp(initOptions)(compilerOptions, pluginOptions);
}

module.exports = {
  gulpClosureCompile,
  handleCompilerError,
  handleSinglePassCompilerError,
  handleTypeCheckError,
};
