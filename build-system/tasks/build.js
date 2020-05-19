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

const log = require('fancy-log');
const {
  bootstrapThirdPartyFrames,
  compileAllJs,
  compileCoreRuntime,
  printConfigHelp,
  printNobuildHelp,
} = require('./helpers');
const {
  createCtrlcHandler,
  exitCtrlcHandler,
} = require('../common/ctrlcHandler');
const {buildExtensions} = require('./extension-helpers');
const {compileCss} = require('./css');
const {compileJison} = require('./compile-jison');
const {cyan, green, yellow} = require('ansi-colors');
const {maybeUpdatePackages} = require('./update-packages');
const {parseExtensionFlags} = require('./extension-helpers');

const argv = require('minimist')(process.argv.slice(2));

/**
 * Deprecated. Use `gulp build --watch` or `gulp dist --watch`.
 *
 * TODO(rsimha, #27471): Remove this after several weeks.
 */
async function watch() {
  log(yellow('WARNING:'), cyan('gulp watch'), 'has been deprecated.');
  log(
    green('INFO:'),
    'Use',
    cyan('gulp build --watch'),
    'or',
    cyan('gulp dist --watch'),
    'instead.'
  );
  log(
    green('INFO:'),
    'Run',
    cyan('gulp help'),
    'for a full list of commands and flags.'
  );
}

/**
 * Perform the prerequisite steps before starting the unminified build.
 * Used by `gulp` and `gulp build`.
 *
 * @param {boolean} watch
 */
async function runPreBuildSteps(watch) {
  await compileCss(watch);
  await compileJison();
  await bootstrapThirdPartyFrames(watch);
}

/**
 * Unminified build. Entry point for `gulp build`.
 */
async function build() {
  maybeUpdatePackages();
  const handlerProcess = createCtrlcHandler('build');
  process.env.NODE_ENV = 'development';
  printNobuildHelp();
  printConfigHelp('gulp build');
  parseExtensionFlags();
  await runPreBuildSteps(argv.watch);
  if (argv.core_runtime_only) {
    await compileCoreRuntime(argv.watch, /* minify */ false);
  } else {
    await compileAllJs(/* minify */ false);
    await buildExtensions({watch: argv.watch});
  }
  if (!argv.watch) {
    exitCtrlcHandler(handlerProcess);
  }
}

module.exports = {
  build,
  runPreBuildSteps,
  watch,
};

/* eslint "google-camelcase/google-camelcase": 0 */

build.description = 'Builds the AMP library';
build.flags = {
  config: '  Sets the runtime\'s AMP_CONFIG to one of "prod" or "canary"',
  fortesting: '  Builds the AMP library for local testing',
  extensions: '  Builds only the listed extensions.',
  extensions_from: '  Builds only the extensions from the listed AMP(s).',
  noextensions: '  Builds with no extensions.',
  core_runtime_only: '  Builds only the core runtime.',
  coverage: '  Adds code coverage instrumentation to JS files using istanbul.',
  version_override: '  Overrides the version written to AMP_CONFIG',
  watch: '  Watches for changes in files, re-builds when detected',
  define_experiment_constant:
    '  Builds runtime with the EXPERIMENT constant set to true',
};

watch.description = 'Deprecated. Use gulp build --watch or gulp dist --watch';
