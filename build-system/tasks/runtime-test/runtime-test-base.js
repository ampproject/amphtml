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
const babelify = require('babelify');
const karmaConfig = require('../karma.conf');
const log = require('fancy-log');
const testConfig = require('../../config');
const {
  createKarmaServer,
  getAdTypes,
  runTestInBatches,
  startTestServer,
} = require('./helpers');
const {createCtrlcHandler, exitCtrlcHandler} = require('../../ctrlcHandler');
const {green, yellow, cyan, red} = require('ansi-colors');
const {isTravisBuild} = require('../../travis');
const {reportTestStarted} = require('.././report-test-status');
const {unitTestsToRun} = require('./helpers-unit');

/**
 * Updates the browsers based off of the test type
 * being run (unit, integration, a4a) and test settings.
 * Keeps the default spec as is if no matching settings are found.
 * @param {!RuntimeTestConfig} config
 */
function updateBrowsers(config) {
  if (argv.saucelabs) {
    if (config.testType == 'unit') {
      Object.assign(config, {browsers: ['SL_Safari_12', 'SL_Firefox']});
      return;
    }

    if (config.testType == 'integration') {
      Object.assign(config, {
        browsers: [
          'SL_Chrome',
          'SL_Firefox',
          'SL_Edge_17',
          'SL_Safari_12',
          'SL_IE_11',
          // TODO(amp-infra): Evaluate and add more platforms here.
          //'SL_Chrome_Android_7',
          //'SL_iOS_11',
          //'SL_iOS_12',
          'SL_Chrome_Beta',
          'SL_Firefox_Beta',
        ],
      });
      return;
    }

    throw new Error(
      'The --saucelabs flag is valid only for `gulp unit` and `gulp integration`.'
    );
  }

  const chromeFlags = [];
  if (argv.chrome_flags) {
    argv.chrome_flags.split(',').forEach(flag => {
      chromeFlags.push('--'.concat(flag));
    });
  }

  const options = new Map();
  options
    .set('chrome_canary', {browsers: ['ChromeCanary']})
    .set('chrome_flags', {
      browsers: ['Chrome_flags'],
      customLaunchers: {
        // eslint-disable-next-line
        Chrome_flags: {
          base: 'Chrome',
          flags: chromeFlags,
        },
      },
    })
    .set('edge', {browsers: ['Edge']})
    .set('firefox', {browsers: ['Firefox']})
    .set('headless', {browsers: ['Chrome_no_extensions_headless']})
    .set('ie', {
      browsers: ['IE'],
      customLaunchers: {
        IeNoAddOns: {
          base: 'IE',
          flags: ['-extoff'],
        },
      },
    })
    .set('safari', {browsers: ['Safari']});

  for (const [key, value] of options) {
    if (argv.hasOwnProperty(key)) {
      Object.assign(config, value);
      return;
    }
  }
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
      files = testConfig.commonUnitTestPaths.concat(testConfig.chaiAsPromised);
      if (argv.files) {
        return files.concat(argv.files);
      }
      if (argv.saucelabs) {
        return files.concat(testConfig.unitTestOnSaucePaths);
      }
      if (argv.local_changes) {
        return files.concat(unitTestsToRun(testConfig.unitTestPaths));
      }
      return files.concat(testConfig.unitTestPaths);

    case 'integration':
      files = testConfig.commonIntegrationTestPaths;
      if (argv.files) {
        return files.concat(argv.files);
      }
      return files.concat(testConfig.integrationTestPaths);

    case 'a4a':
      return testConfig.chaiAsPromised.concat(testConfig.a4aTestPaths);

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

  if (argv.saucelabs) {
    config.reporters.push('saucelabs');
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
    this.browserify.configure = function(bundle) {
      bundle.on('prebundle', function() {
        log(
          green('Transforming tests with'),
          cyan('browserify') + green('...')
        );
      });
      bundle.on('transform', function(tr) {
        if (tr instanceof babelify) {
          tr.once('babelify', function() {
            process.stdout.write('.');
          });
        }
      });
    };

    // c.client is available in test browser via window.parent.karma.config
    this.client.amp = {
      useCompiledJs: !!argv.compiled,
      saucelabs: !!argv.saucelabs,
      singlePass: !!argv.single_pass,
      adTypes: getAdTypes(),
      mochaTimeout: this.client.mocha.timeout,
      propertiesObfuscated: !!argv.single_pass,
      testServerPort: this.client.testServerPort,
      testOnIe:
        this.browsers.includes('IE') || this.browsers.includes('SL_IE_11'),
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

      const instanbulPlugin = [
        'istanbul',
        {
          exclude: [
            'ads/**/*.js',
            'build-system/**/*.js',
            'extensions/**/test/**/*.js',
            'third_party/**/*.js',
            'test/**/*.js',
            'testing/**/*.js',
          ],
        },
      ];
      // don't overwrite existing plugins
      const plugins = [instanbulPlugin].concat(this.babelifyConfig.plugins);

      this.browserify.transform = [
        ['babelify', Object.assign({}, this.babelifyConfig, {plugins})],
      ];
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
    // TODO(alanorozco): Come up with a more elegant check?
    global.AMP_TESTING = true;

    // Run tests against compiled code when explicitly specified via --compiled,
    // or when the minified runtime is automatically built.
    process.env.SERVE_MODE =
      argv.compiled || !argv.nobuild ? 'compiled' : 'default';

    await this.maybeBuild();

    const testServer = startTestServer(this.config.client.testServerPort);
    const handlerProcess = createCtrlcHandler(`gulp ${this.config.testType}`);

    this.env = new Map()
      .set('handlerProcess', handlerProcess)
      .set('testServer', testServer);
  }

  async run() {
    reportTestStarted();

    if (argv.saucelabs) {
      this.exitCode = await runTestInBatches(this.config);
    } else {
      this.exitCode = await createKarmaServer(this.config);
    }
  }

  async teardown() {
    this.env.get('testServer').emit('kill');
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
