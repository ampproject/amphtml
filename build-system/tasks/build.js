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
const {buildStoryLocalization} = require('./build-story-localization');

const argv = require('minimist')(process.argv.slice(2));

/**
 * Perform the prerequisite steps before starting the unminified build.
 * Used by `amp` and `amp build`.
 *
 * @param {!Object} options
 * @return {Promise}
 */
async function runPreBuildSteps(options) {
  return Promise.all([
    buildStoryLocalization(options),
    compileCss(options),
    bootstrapThirdPartyFrames(options),
  ]);
}

/**
 * Unminified build. Entry point for `amp build`.
 * @return {Promise<void>}
 */
async function build() {
  const handlerProcess = createCtrlcHandler('build');
  process.env.NODE_ENV = 'development';
  const options = {
    fortesting: argv.fortesting,
    localDev: true,
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

  // This step is to be run only during a full `amp build`.
  if (!argv.core_runtime_only) {
    await buildVendorConfigs(options);
  }
  if (!argv.watch) {
    exitCtrlcHandler(handlerProcess);
  }
}

module.exports = {
  build,
  runPreBuildSteps,
};

/* eslint "local/camelcase": 0 */

build.description = 'Build the AMP library';
build.flags = {
  config: 'Set the runtime\'s AMP_CONFIG to one of "prod" or "canary"',
  fortesting: 'Build the AMP library for local testing',
  extensions: 'Build only the listed extensions',
  extensions_from: 'Build only the extensions from the listed AMP(s)',
  noextensions: 'Build with no extensions',
  core_runtime_only: 'Build only the core runtime',
  coverage: 'Add code coverage instrumentation to JS files using istanbul',
  version_override: 'Override the version written to AMP_CONFIG',
  watch: 'Watch for changes in files, re-builds when detected',
  esm: 'Do not transpile down to ES5',
  define_experiment_constant:
    'Build runtime with the EXPERIMENT constant set to true',
};
