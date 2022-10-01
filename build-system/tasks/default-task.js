const argv = require('minimist')(process.argv.slice(2));
const {createCtrlcHandler} = require('../common/ctrlcHandler');
const {cyan, green} = require('kleur/colors');
const {doServe} = require('./serve');
const {log} = require('../common/logging');
const {parseExtensionFlags} = require('./extension-helpers');
const {printConfigHelp} = require('./helpers');
const {runPreBuildSteps} = require('./build');
const {runPreDistSteps} = require('./dist');

/**
 * Prints a useful help message prior to the default amp task
 */
function printDefaultTaskHelp() {
  log(green('Running the default ') + cyan('amp ') + green('task.'));
  log(
    green(
      '⤷ JS and extensions will be lazily built when requested from the server.'
    )
  );
}

/**
 * The default task run when `amp` is executed
 *
 * @return {!Promise}
 */
async function defaultTask() {
  createCtrlcHandler('amp');
  process.env.NODE_ENV = 'development';
  printConfigHelp('amp');
  printDefaultTaskHelp();
  parseExtensionFlags(/* preBuild */ true);

  const options = {fortesting: true, minify: argv.minified, watch: true};
  if (argv.minified) {
    await runPreDistSteps(options);
  } else {
    await runPreBuildSteps(options);
  }

  await doServe(/* lazyBuild */ true);
  log(green('JS and extensions will be lazily built when requested...'));
}

module.exports = {
  defaultTask,
};

/* eslint "local/camelcase": 0 */

defaultTask.description =
  'Start the dev server, lazily build JS when requested, and watch for changes';
defaultTask.flags = {
  minified: 'Compile and serve minified binaries',
  esm: 'Compile and serve minified ESM binaries',
  pseudo_names:
    'Compile with readable names (useful while profiling / debugging production code)',
  pretty_print:
    'Output code with whitespace (useful while profiling / debugging production code)',
  fortesting: 'Compile production binaries for local testing',
  noconfig: 'Compile production binaries without applying AMP_CONFIG',
  config: 'Set the runtime\'s AMP_CONFIG to one of "prod" or "canary"',
  extensions: 'Pre-build the given extensions, lazily builds the rest.',
  extensions_from:
    'Pre-build the extensions used by the provided example page.',
  full_sourcemaps: 'Include source code content in sourcemaps',
  version_override: 'Override the version written to AMP_CONFIG',
  host: 'Host to serve the project on [default: localhost]',
  port: 'Port to serve the project on [default: 8000]',
  https: 'Use https',
  define_experiment_constant:
    'Build runtime with the EXPERIMENT constant set to true',
};
