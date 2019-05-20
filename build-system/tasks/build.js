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

const gulp = require('gulp');
const {
  buildAlp,
  buildExaminer,
  buildWebWorker,
  compileAllUnminifiedTargets,
  compileJs,
  printConfigHelp,
  printNobuildHelp,
} = require('./helpers');
const {buildExtensions} = require('./extension-helpers');
const {clean} = require('./clean');
const {compileCss} = require('./css');
const {createCtrlcHandler, exitCtrlcHandler} = require('../ctrlcHandler');
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
  return performBuild(true);
}

/**
 * Main build
 * @return {!Promise}
 */
async function build() {
  maybeUpdatePackages();
  const handlerProcess = createCtrlcHandler('build');
  return performBuild().then(() => exitCtrlcHandler(handlerProcess));
}

/**
 * Performs the build steps for gulp build and gulp watch
 * @param {boolean} watch
 * @return {!Promise}
 */
async function performBuild(watch) {
  process.env.NODE_ENV = 'development';
  printNobuildHelp();
  await clean();
  printConfigHelp(watch ? 'gulp watch' : 'gulp build');
  parseExtensionFlags();
  return compileCss(watch).then(() => {
    return Promise.all([
      polyfillsForTests(),
      buildAlp({watch}),
      buildExaminer({watch}),
      buildWebWorker({watch}),
      buildExtensions({bundleOnlyIfListedInFiles: !watch, watch}),
      compileAllUnminifiedTargets(watch),
    ]);
  });
}

/**
 * Compile the polyfills script and drop it in the build folder
 * @return {!Promise}
 */
function polyfillsForTests() {
  return compileJs('./src/', 'polyfills.js', './build/');
}

/**
 * The default task run when `gulp` is executed
 */
const defaultTask = gulp.series(watch, serve);

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
  with_inabox: '  Also watch and build the amp-inabox.js binary.',
  with_shadow: '  Also watch and build the amp-shadow.js binary.',
  extensions: '  Watches and builds only the listed extensions.',
  extensions_from:
    '  Watches and builds only the extensions from the listed AMP(s).',
  noextensions: '  Watches and builds with no extensions.',
};

defaultTask.description = 'Runs "watch" and then "serve"';
defaultTask.flags = {
  extensions: '  Watches and builds only the listed extensions.',
  extensions_from:
    '  Watches and builds only the extensions from the listed AMP(s).',
  noextensions: '  Watches and builds with no extensions.',
};
