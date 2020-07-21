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
'use strict';

const argv = require('minimist')(process.argv.slice(2));
const karmaConfig = require('../karma.conf');
const log = require('fancy-log');
const testConfig = require('../../test-configs/config');
const {
  createCtrlcHandler,
  exitCtrlcHandler,
} = require('../../common/ctrlcHandler');
const {app} = require('../../server/test-server');
const {createKarmaServer, getAdTypes} = require('./helpers');
const {getFilesFromArgv} = require('../../common/utils');
const {green, yellow, cyan, red} = require('ansi-colors');
const {isGithubActionsBuild} = require('../../common/github-actions');
const {isTravisBuild} = require('../../common/travis');
const {reportTestStarted} = require('.././report-test-status');
const {startServer, stopServer} = require('../serve');
const {unitTestsToRun} = require('./helpers-unit');

/**
 * Updates the browsers based off of the test type
 * being run (unit, integration, a4a) and test settings.
 * Defaults to Chrome if no matching settings are found.
 * @param {!RuntimeTestConfig} config
 */
function updateBrowsers(config) {
  if (argv.edge) {
    Object.assign(config, {browsers: ['Edge']});
    return;
  }

  if (argv.firefox) {
    Object.assign(config, {
      browsers: ['Firefox_flags'],
      customLaunchers: {
        // eslint-disable-next-line
        Firefox_flags: {
          base: 'Firefox',
          flags: argv.headless ? ['-headless'] : [],
        },
      },
    });
    return;
  }

  if (argv.ie) {
    Object.assign(config, {
      browsers: ['IE'],
      customLaunchers: {
        IeNoAddOns: {
          base: 'IE',
          flags: ['-extoff'],
        },
      },
    });
    return;
  }

  if (argv.safari) {
    Object.assign(config, {browsers: ['SafariNative']});
    return;
  }

  if (argv.chrome_canary) {
    Object.assign(config, {browsers: ['ChromeCanary']});
    return;
  }

  if (argv.chrome_flags) {
    const chromeFlags = [];
    argv.chrome_flags.split(',').forEach((flag) => {
      chromeFlags.push('--'.concat(flag));
    });
    Object.assign(config, {
      browsers: ['Chrome_flags'],
      customLaunchers: {
        // eslint-disable-next-line
          Chrome_flags: {
          base: 'Chrome',
          flags: chromeFlags,
        },
      },
    });
    return;
  }

  if (argv.headless) {
    Object.assign(config, {browsers: ['Chrome_no_extensions_headless']});
    return;
  }

  // Default to Chrome.
  Object.assign(config, {
    browsers: [isTravisBuild() ? 'Chrome_travis_ci' : 'Chrome_no_extensions'],
  });
}

/**
 * Get the appropriate files based off of the test type
 * being run (unit, integration, a4a) and test settings.
 * @param {string} testType
 * @return {!Array<string>}
 */
function getFiles(testType) {
  let files;

  switch (testType) {
    case 'unit':
      files = testConfig.commonUnitTestPaths;
      if (argv.files) {
        return files.concat(getFilesFromArgv());
      }
      if (isGithubActionsBuild()) {
        return files.concat(testConfig.unitTestCrossBrowserPaths);
      }
      if (argv.local_changes) {
        return files.concat(unitTestsToRun());
      }
      return files.concat(testConfig.unitTestPaths);

    case 'integration':
      files = testConfig.commonIntegrationTestPaths;
      if (argv.files) {
        return files.concat(getFilesFromArgv());
      }
      return files.concat(testConfig.integrationTestPaths);

    case 'a4a':
      return testConfig.a4aTestPaths;

    default:
      throw new Error(`Test type ${testType} was not recognized`);
  }
}

/**
 * Adds reporters to the default karma spec per test settings.
 * Overrides default reporters for verbose settings.
 * @param {!RuntimeTestConfig} config
 */
function updateReporters(config) {
  if (
    (argv.testnames || argv.local_changes || argv.files || argv.verbose) &&
    !isTravisBuild()
  ) {
    config.reporters = ['mocha'];
  }

  if (argv.coverage) {
    config.reporters.push('coverage-istanbul');
  }

  if (argv.report) {
    config.reporters.push('json-result');
    config.jsonResultReporter = {
      outputFile: `result-reports/${config.testType}.json`,
    };
  }
}

class RuntimeTestConfig {
  constructor(testType) {
    this.testType = testType;

    Object.assign(this, karmaConfig);
    updateBrowsers(this);
    updateReporters(this);
    this.files = getFiles(this.testType);
    this.singleRun = !argv.watch && !argv.w;
    this.client.mocha.grep = !!argv.grep;
    this.client.verboseLogging = !!argv.verbose || !!argv.v;
    this.client.captureConsole = !!argv.verbose || !!argv.v || !!argv.files;
    this.browserify.configure = function (bundle) {
      bundle.on('prebundle', function () {
        log(
          green('Transforming tests with'),
          cyan('browserify') + green('...')
        );
      });
    };

    // c.client is available in test browser via window.parent.karma.config
    this.client.amp = {
      useCompiledJs: !!argv.compiled,
      adTypes: getAdTypes(),
      mochaTimeout: this.client.mocha.timeout,
      testServerPort: this.client.testServerPort,
    };

    if (argv.coverage && this.testType != 'a4a') {
      this.plugins.push('karma-coverage-istanbul-reporter');
      this.coverageIstanbulReporter = {
        dir: 'test/coverage',
        reports: isTravisBuild()
          ? ['lcovonly']
          : ['html', 'text', 'text-summary'],
        'report-config': {lcovonly: {file: `lcov-${testType}.info`}},
      };
    }
  }
}

class RuntimeTestRunner {
  constructor(config) {
    this.config = config;
    this.env = null;
    this.exitCode = 0;
  }

  async maybeBuild() {
    throw new Error('maybeBuild method must be overridden');
  }

  async setup() {
    await this.maybeBuild();
    await startServer({
      name: 'AMP Test Server',
      host: 'localhost',
      port: this.config.client.testServerPort,
      middleware: () => [app],
    });
    const handlerProcess = createCtrlcHandler(`gulp ${this.config.testType}`);

    this.env = new Map().set('handlerProcess', handlerProcess);
  }

  async run() {
    reportTestStarted();
    this.exitCode = await createKarmaServer(this.config);
  }

  async teardown() {
    await stopServer();
    exitCtrlcHandler(this.env.get('handlerProcess'));

    if (this.exitCode != 0) {
      log(
        red('ERROR:'),
        yellow(`Karma test failed with exit code ${this.exitCode}`)
      );
      process.exitCode = this.exitCode;
    }
  }
}

module.exports = {
  RuntimeTestRunner,
  RuntimeTestConfig,
};
