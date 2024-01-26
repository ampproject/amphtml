'using strict';

const argv = require('minimist')(process.argv.slice(2));
const {
  RuntimeTestConfig,
  RuntimeTestRunner,
} = require('./runtime-test/runtime-test-base');
const {analyticsVendorConfigs} = require('./analytics-vendor-configs');
const {compileJison} = require('./compile-jison');
const {css} = require('./css');
const {getUnitTestsToRun} = require('./runtime-test/helpers-unit');
const {maybePrintArgvMessages} = require('./runtime-test/helpers');

class Runner extends RuntimeTestRunner {
  /**
   *
   * @param {RuntimeTestConfig} config
   */
  constructor(config) {
    super(config);
  }

  /** @override */
  async maybeBuild() {
    await analyticsVendorConfigs();
    await css();
    await compileJison();
  }
}

/**
 * @return {Promise<void>}
 */
async function unit() {
  maybePrintArgvMessages();
  if (argv.local_changes && !(await getUnitTestsToRun())) {
    return;
  }

  const config = new RuntimeTestConfig('unit');
  const runner = new Runner(config);

  await runner.setup();
  await runner.run();
  await runner.teardown();
}

module.exports = {
  unit,
};

unit.description = 'Run unit tests';
unit.flags = {
  'chrome_canary': 'Run tests on Chrome Canary',
  'chrome_flags': 'Use the given flags to launch Chrome',
  'coverage': 'Run tests in code coverage mode',
  'edge': 'Run tests on Edge',
  'firefox': 'Run tests on Firefox',
  'files': 'Run tests for specific files',
  'grep': 'Run tests that match the pattern',
  'headless': 'Run tests in a headless Chrome window',
  'local_changes':
    'Run unit tests directly affected by the files changed in the local branch',
  'nohelp': 'Silence help messages that are printed prior to test run',
  'safari': 'Run tests on Safari',
  'testnames': 'List the name of each test being run',
  'verbose': 'Enable logging',
  'watch': 'Watch for changes in files, runs corresponding test(s)',
  'filelist': 'Run tests specified in this comma-separated list of test files',
};
