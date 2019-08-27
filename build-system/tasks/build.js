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
  compileCoreRuntime,
  printConfigHelp,
  printNobuildHelp,
} = require('./helpers');
const {buildExtensions} = require('./extension-helpers');
const {compileCss} = require('./css');
const {compileJison} = require('./compile-jison');
const {createCtrlcHandler, exitCtrlcHandler} = require('../ctrlcHandler');
const {cyan, green} = require('ansi-colors');
const {isTravisBuild} = require('../travis');
const {maybeUpdatePackages} = require('./update-packages');
const {parseExtensionFlags} = require('./extension-helpers');
const {serve} = require('./serve');

/**
 * Enables watching for file changes in css, extensions.
 * @param {boolean} defaultTask
 * @return {!Promise}
 */
async function watch(defaultTask) {
  maybeUpdatePackages();
  createCtrlcHandler('watch');
  return performBuild(/* watch */ true, defaultTask);
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
      argv.lazy_build
        ? 'lazily built when requested from the server.'
        : 'built after server startup.'
    );
  log(defaultTaskMessage);
  if (!argv.lazy_build) {
    const lazyBuildMessage =
      green('⤷ Use ') +
      cyan('--lazy_build ') +
      green('to lazily build JS and extensions ') +
      green('when requested from the server.');
    log(lazyBuildMessage);
  }
}

/**
 * Performs the build steps for gulp, gulp build, and gulp watch
 * @param {boolean} watch
 * @param {boolean} defaultTask
 * @return {!Promise}
 */
async function performBuild(watch, defaultTask) {
  process.env.NODE_ENV = 'development';
  printNobuildHelp();
  printConfigHelp(defaultTask ? 'gulp' : watch ? 'gulp watch' : 'gulp build');
  if (defaultTask) {
    printDefaultTaskHelp();
  }
  if (!argv.lazy_build) {
    parseExtensionFlags();
  }
  await Promise.all([compileCss(watch), compileJison()]);
  await Promise.all([
    bootstrapThirdPartyFrames(watch),
    compileCoreRuntime(watch),
  ]);
  if (!defaultTask) {
    await compileAllUnminifiedJs(watch);
    await buildExtensions({watch});
  }
  if (isTravisBuild()) {
    // New line after all the compilation progress dots on Travis.
    console.log('\n');
  }
}

/**
 * The default task run when `gulp` is executed
 */
async function defaultTask() {
  await watch(/* defaultTask */ true);
  serve(argv.lazy_build);
  log(green('Started ') + cyan('gulp ') + green('server. '));
  if (argv.lazy_build) {
    log(green('JS and extensions will be lazily built when requested...'));
  } else {
    log(green('Building JS and extensions...'));
    await compileAllUnminifiedJs(watch);
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

defaultTask.description = 'Runs "watch" and then "serve"';
defaultTask.flags = {
  lazy_build:
    '  Lazily builds JS and extensions when they are requested from the server',
  config: '  Sets the runtime\'s AMP_CONFIG to one of "prod" or "canary"',
  extensions: '  Watches and builds only the listed extensions.',
  extensions_from:
    '  Watches and builds only the extensions from the listed AMP(s).',
  noextensions: '  Watches and builds with no extensions.',
};
