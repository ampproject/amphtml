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

const argv = require('minimist')(process.argv.slice(2));
const log = require('fancy-log');
const {createCtrlcHandler} = require('../common/ctrlcHandler');
const {cyan, green} = require('ansi-colors');
const {doServe} = require('./serve');
const {maybeUpdatePackages} = require('./update-packages');
const {parseExtensionFlags} = require('./extension-helpers');
const {printConfigHelp} = require('./helpers');
const {runPreBuildSteps} = require('./build');
const {runPreDistSteps} = require('./dist');

/**
 * Prints a useful help message prior to the default gulp task
 */
function printDefaultTaskHelp() {
  log(green('Running the default ') + cyan('gulp ') + green('task.'));
  log(
    green(
      '⤷ JS and extensions will be lazily built when requested from the server.'
    )
  );
}

/**
 * The default task run when `gulp` is executed
 *
 * @return {!Promise}
 */
async function defaultTask() {
  maybeUpdatePackages();
  createCtrlcHandler('gulp');
  process.env.NODE_ENV = 'development';
  printConfigHelp('gulp');
  printDefaultTaskHelp();
  parseExtensionFlags(/* preBuild */ true);
  if (argv.compiled) {
    await runPreDistSteps(/* watch */ true);
  } else {
    await runPreBuildSteps(/* watch */ true);
  }
  await doServe(/* lazyBuild */ true);
  log(green('JS and extensions will be lazily built when requested...'));
}

module.exports = {
  defaultTask,
};

/* eslint "google-camelcase/google-camelcase": 0 */

defaultTask.description =
  'Starts the dev server, lazily builds JS and extensions when requested, and watches them for changes';
defaultTask.flags = {
  compiled: '  Compiles and serves minified binaries',
  pseudo_names:
    '  Compiles with readable names. ' +
    'Great for profiling and debugging production code.',
  pretty_print:
    '  Outputs compiled code with whitespace. ' +
    'Great for debugging production code.',
  fortesting: '  Compiles production binaries for local testing',
  noconfig: '  Compiles production binaries without applying AMP_CONFIG',
  config: '  Sets the runtime\'s AMP_CONFIG to one of "prod" or "canary"',
  closure_concurrency: '  Sets the number of concurrent invocations of closure',
  extensions: '  Pre-builds the given extensions, lazily builds the rest.',
  extensions_from:
    '  Pre-builds the extensions used by the provided example page.',
  full_sourcemaps: '  Includes source code content in sourcemaps',
  version_override: '  Overrides the version written to AMP_CONFIG',
  host: '  Host to serve the project on. localhost by default.',
  port: '  Port to serve the project on. 8000 by default.',
  define_experiment_constant:
    '  Builds runtime with the EXPERIMENT constant set to true',
};
