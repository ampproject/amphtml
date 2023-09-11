'using strict';

const argv = require('minimist')(process.argv.slice(2));
const {
  RuntimeTestConfig,
  RuntimeTestRunner,
} = require('./runtime-test/runtime-test-base');
const {buildRuntime} = require('../common/utils');
const {maybePrintArgvMessages} = require('./runtime-test/helpers');

class Runner extends RuntimeTestRunner {
  /**
   * @param {RuntimeTestConfig} config
   */
  constructor(config) {
    super(config);
  }

  /** @override */
  async maybeBuild() {
    if (!argv.nobuild) {
      await buildRuntime();
    }
  }
}

/**
 * Entry point for the `amp integration` task.
 * @return {Promise<void>}
 */
async function integration() {
  maybePrintArgvMessages();

  const config = new RuntimeTestConfig('integration');
  const runner = new Runner(config);

  await runner.setup();
  await runner.run();
  await runner.teardown();
}

module.exports = {
  integration,
};

integration.description = 'Run integration tests';
integration.flags = {
  'chrome_canary': 'Run tests on Chrome Canary',
  'chrome_flags': 'Use the given flags to launch Chrome',
  'minified': 'Run tests against minified JS',
  'config':
    'Set the runtime\'s AMP_CONFIG to one of "prod" (default) or "canary"',
  'coverage': 'Run tests in code coverage mode',
  'debug':
    "Allow debug statements by auto opening devtools (doesn't work in non-headless mode)",
  'edge': 'Run tests on Edge',
  'esm': 'Run against module(esm) build',
  'define_experiment_constant':
    'Transform tests with the EXPERIMENT constant set to true',
  'experiment': 'Experiment being tested (used for status reporting)',
  'firefox': 'Run tests on Firefox',
  'files': 'Run tests for specific files',
  'grep': 'Run tests that match the pattern',
  'headless': 'Run tests in a headless Chrome window',
  'nobuild': 'Skip build step',
  'nohelp': 'Silence help messages that are printed prior to test run',
  'safari': 'Run tests on Safari',
  'testnames': 'List the name of each test being run',
  'verbose': 'With logging enabled',
  'watch': 'Watch for changes in files, runs corresponding test(s)',
};
