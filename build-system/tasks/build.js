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
const {buildVendorConfigs} = require('./3p-vendor-helpers');
const {compileCss} = require('./css');
const {parseExtensionFlags} = require('./extension-helpers');

const argv = require('minimist')(process.argv.slice(2));

/**
 * Perform the prerequisite steps before starting the unminified build.
 * Used by `amp` and `amp build`.
 *
 * @param {!Object} options
 * @return {Promise}
 */
async function runPreBuildSteps(options) {
  return Promise.all([compileCss(options), bootstrapThirdPartyFrames(options)]);
}

/**
 * Unminified build. Entry point for `amp build`.
 */
async function build() {
  await doBuild();
}

/**
 * Performs an unminified build with the given extra args.
 *
 * @param {Object=} extraArgs
 */
async function doBuild(extraArgs = {}) {
  const handlerProcess = createCtrlcHandler('build');
  process.env.NODE_ENV = 'development';
  const options = {
    fortesting: extraArgs.fortesting || argv.fortesting,
    minify: false,
    watch: argv.watch,
  };
  printNobuildHelp();
  printConfigHelp('amp build');
  parseExtensionFlags();
  await runPreBuildSteps(options);
  if (argv.core_runtime_only) {
    await compileCoreRuntime(options);
  } else {
    await compileAllJs(options);
  }
  await buildExtensions(options);

  if (!argv.core_runtime_only) {
    await buildVendorConfigs(options);
  }
  if (!argv.watch) {
    exitCtrlcHandler(handlerProcess);
  }
}

module.exports = {
  build,
  doBuild,
  runPreBuildSteps,
};

/* eslint "google-camelcase/google-camelcase": 0 */

build.description = 'Builds the AMP library';
build.flags = {
  config: 'Sets the runtime\'s AMP_CONFIG to one of "prod" or "canary"',
  fortesting: 'Builds the AMP library for local testing',
  extensions: 'Builds only the listed extensions.',
  extensions_from: 'Builds only the extensions from the listed AMP(s).',
  noextensions: 'Builds with no extensions.',
  core_runtime_only: 'Builds only the core runtime.',
  coverage: 'Adds code coverage instrumentation to JS files using istanbul.',
  version_override: 'Overrides the version written to AMP_CONFIG',
  watch: 'Watches for changes in files, re-builds when detected',
  esm: 'Do not transpile down to ES5',
  define_experiment_constant:
    'Builds runtime with the EXPERIMENT constant set to true',
};
