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

const argv = require('minimist')(process.argv.slice(2));
const log = require('fancy-log');
const {
  bootstrapThirdPartyFrames,
  compileAllUnminifiedJs,
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
const {cyan, green} = require('ansi-colors');
const {maybeUpdatePackages} = require('./update-packages');
const {parseExtensionFlags} = require('./extension-helpers');
const {serve} = require('./serve');

/**
 * Enables watching for file changes in css, extensions.
 * @return {!Promise}
 */
async function watch() {
  maybeUpdatePackages();
  createCtrlcHandler('watch');
  return performBuild(/* watch */ true);
}

/**
 * Main build
 * @return {!Promise}
 */
async function build() {
  maybeUpdatePackages();
  const handlerProcess = createCtrlcHandler('build');
  await performBuild();
  return exitCtrlcHandler(handlerProcess);
}

/**
 * Prints a useful help message prior to the default gulp task
 */
function printDefaultTaskHelp() {
  log(green('Running the default ') + cyan('gulp ') + green('task.'));
  const defaultTaskMessage =
    green('⤷ JS and extensions will be ') +
    green(
      argv.eager_build
        ? 'built after server startup.'
        : 'lazily built when requested from the server.'
    );
  log(defaultTaskMessage);
  if (!argv.eager_build) {
    const eagerBuildMessage =
      green('⤷ Use ') +
      cyan('--eager_build ') +
      green('to build JS and extensions after server startup.');
    log(eagerBuildMessage);
  }
}

/**
 * Performs the pre-requisite build steps for gulp, gulp build, and gulp watch
 * @param {boolean} watch
 * @return {!Promise}
 */
async function performPrerequisiteSteps(watch) {
  await compileCss(watch);
  await compileJison();
  await bootstrapThirdPartyFrames(watch);
}

/**
 * Performs the build steps for gulp build and gulp watch
 * @param {boolean} watch
 * @return {!Promise}
 */
async function performBuild(watch) {
  process.env.NODE_ENV = 'development';
  printNobuildHelp();
  printConfigHelp(watch ? 'gulp watch' : 'gulp build');
  parseExtensionFlags();
  await performPrerequisiteSteps(watch);
  await compileAllUnminifiedJs(watch);
  await buildExtensions({watch});
}

/**
 * The default task run when `gulp` is executed
 * @return {!Promise}
 */
async function defaultTask() {
  maybeUpdatePackages();
  createCtrlcHandler('gulp');
  process.env.NODE_ENV = 'development';
  printConfigHelp('gulp');
  printDefaultTaskHelp();
  parseExtensionFlags(/* preBuild */ !argv.eager_build);
  await performPrerequisiteSteps(/* watch */ true);
  await serve();
  if (!argv.eager_build) {
    log(green('JS and extensions will be lazily built when requested...'));
  } else {
    log(green('Building JS and extensions...'));
    await compileAllUnminifiedJs(/* watch */ true);
    await buildExtensions({watch: true});
  }
}

module.exports = {
  build,
  defaultTask,
  watch,
};

/* eslint "google-camelcase/google-camelcase": 0 */

build.description = 'Builds the AMP library';
build.flags = {
  config: '  Sets the runtime\'s AMP_CONFIG to one of "prod" or "canary"',
  extensions: '  Builds only the listed extensions.',
  extensions_from: '  Builds only the extensions from the listed AMP(s).',
  noextensions: '  Builds with no extensions.',
};

watch.description = 'Watches for changes in files, re-builds when detected';
watch.flags = {
  config: '  Sets the runtime\'s AMP_CONFIG to one of "prod" or "canary"',
  extensions: '  Watches and builds only the listed extensions.',
  extensions_from:
    '  Watches and builds only the extensions from the listed AMP(s).',
  noextensions: '  Watches and builds with no extensions.',
};

defaultTask.description =
  'Starts the dev server and lazily builds JS and extensions when requested';
defaultTask.flags = {
  eager_build:
    '  Starts the dev server and builds JS and extensions after server startup',
  config: '  Sets the runtime\'s AMP_CONFIG to one of "prod" or "canary"',
  extensions: '  Watches and builds only the listed extensions.',
  extensions_from:
    '  Watches and builds only the extensions from the listed AMP(s).',
  noextensions: '  Watches and builds with no extensions.',
};
