/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
const colors = require('ansi-colors');
const config = require('../../config');
const gulp = require('gulp-help')(require('gulp'));
const Karma = require('karma').Server;
const karmaDefault = require('../karma.conf');
const log = require('fancy-log');
const opn = require('opn');
const path = require('path');
const webserver = require('gulp-webserver');
const {
  getAdTypes,
  isLargeRefactor,
  refreshKarmaWdCache,
  unitTestsToRun,
} = require('./helpers');
const {
  reportTestErrored,
  reportTestFinished,
  reportTestSkipped,
  reportTestStarted,
} = require('./status-report');
const {app} = require('../../test-server');
const {build} = require('../build');
const {createCtrlcHandler, exitCtrlcHandler} = require('../../ctrlcHandler');
const {css} = require('../css');
const {getStdout} = require('../../exec');
const {isTravisBuild} = require('../../travis');


const {green, yellow, cyan, red} = colors;

const batchSize = 4; // Number of Sauce Lab browsers

const chromeBase = argv.chrome_canary ? 'ChromeCanary' : 'Chrome';

const formattedFlagList = [];

let saucelabsBrowsers = [];
/**
 * Read in and process the configuration settings for karma
 * @return {!Object} Karma configuration
 */
function getConfig() {
  if (argv.safari) {
    return Object.assign({}, karmaDefault, {browsers: ['Safari']});
  }
  if (argv.firefox) {
    return Object.assign({}, karmaDefault, {browsers: ['Firefox']});
  }
  if (argv.edge) {
    return Object.assign({}, karmaDefault, {browsers: ['Edge']});
  }
  if (argv.ie) {
    return Object.assign({}, karmaDefault, {browsers: ['IE'],
      customLaunchers: {
        IeNoAddOns: {
          base: 'IE',
          flags: ['-extoff'],
        },
      }});
  }
  if (argv.chrome_canary && !argv.chrome_flags) {
    return Object.assign({}, karmaDefault, {browsers: ['ChromeCanary']});
  }
  if (argv.chrome_flags) {
    const flagList = argv.chrome_flags.split(',');
    flagList.forEach(flag => {
      formattedFlagList.push('--'.concat(flag));
    });
    const config = Object.assign({}, karmaDefault, {
      browsers: ['Chrome_flags'],
      customLaunchers: {
        Chrome_flags: { // eslint-disable-line google-camelcase/google-camelcase
          base: chromeBase,
          flags: formattedFlagList,
        },
      },
    });
    return config;
  }
  if (argv.headless) {
    return Object.assign({}, karmaDefault,
        {browsers: ['Chrome_no_extensions_headless']});
  }
  if (argv.saucelabs || argv.saucelabs_lite) {
    if (!process.env.SAUCE_USERNAME) {
      throw new Error('Missing SAUCE_USERNAME Env variable');
    }
    if (!process.env.SAUCE_ACCESS_KEY) {
      throw new Error('Missing SAUCE_ACCESS_KEY Env variable');
    }

    // Browser names are defined in `karma.conf.js`.
    saucelabsBrowsers = argv.saucelabs ?
    // With --saucelabs, integration tests are run on this set of browsers.
      [
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
      ] : [
      // With --saucelabs_lite, a subset of the unit tests are run.
      // Only browsers that support chai-as-promised may be included below.
      // TODO(rsimha): Add more browsers to this list. #6039.
        'SL_Safari_12',
      ];

    return Object.assign({}, karmaDefault, {
      reporters: ['super-dots', 'saucelabs', 'karmaSimpleReporter'],
      browsers: saucelabsBrowsers,
    });
  }
  return karmaDefault;
}

/**
 * Prints help messages for args if tests are being run for local development.
 */
function printArgvMessages() {
  const argvMessages = {
    safari: 'Running tests on Safari.',
    firefox: 'Running tests on Firefox.',
    ie: 'Running tests on IE.',
    edge: 'Running tests on Edge.',
    'chrome_canary': 'Running tests on Chrome Canary.',
    saucelabs: 'Running integration tests on Sauce Labs browsers.',
    saucelabs_lite: 'Running tests on a subset of Sauce Labs browsers.', // eslint-disable-line google-camelcase/google-camelcase
    nobuild: 'Skipping build.',
    watch: 'Enabling watch mode. Editing and saving a file will cause the' +
        ' tests for that file to be re-run in the same browser instance.',
    verbose: 'Enabling verbose mode. Expect lots of output!',
    testnames: 'Listing the names of all tests being run.',
    files: 'Running tests in the file(s): ' + cyan(argv.files),
    integration: 'Running only the integration tests. Prerequisite: ' +
        cyan('gulp build'),
    unit: 'Running only the unit tests. Prerequisite: ' + cyan('gulp css'),
    a4a: 'Running only A4A tests.',
    compiled: 'Running tests against minified code.',
    grep: 'Only running tests that match the pattern "' +
        cyan(argv.grep) + '".',
    coverage: 'Running tests in code coverage mode.',
    headless: 'Running tests in a headless Chrome window.',
    'local-changes': 'Running unit tests directly affected by the files' +
        ' changed in the local branch.',
  };
  if (argv.chrome_flags) {
    log(green('Launching'), cyan(chromeBase), green('with flags'),
        cyan(formattedFlagList));
  }
  if (!isTravisBuild()) {
    log(green('Run'), cyan('gulp help'),
        green('to see a list of all test flags.'));
    log(green('⤷ Use'), cyan('--nohelp'),
        green('to silence these messages.'));
    if (!argv.unit && !argv.integration && !argv.files && !argv.a4a &&
        !argv['local-changes']) {
      log(green('Running all tests.'));
      log(green('⤷ Use'), cyan('--unit'), green('or'), cyan('--integration'),
          green('to run just the unit tests or integration tests.'));
      log(green('⤷ Use'), cyan('--local-changes'),
          green('to run unit tests from files commited to the local branch.'));
    }
    if (!argv.testnames && !argv.files && !argv['local-changes']) {
      log(green('⤷ Use'), cyan('--testnames'),
          green('to see the names of all tests being run.'));
    }
    if (!argv.headless) {
      log(green('⤷ Use'), cyan('--headless'),
          green('to run tests in a headless Chrome window.'));
    }
    if (!argv.compiled) {
      log(green('Running tests against unminified code.'));
    }
    Object.keys(argv).forEach(arg => {
      const message = argvMessages[arg];
      if (message) {
        log(yellow(`--${arg}:`), green(message));
      }
    });
  }
}

/**
 * Runs all the tests.
 */
async function runTests() {
  if (!argv.integration && process.env.AMPSAUCE_REPO) {
    console./* OK*/info('Deactivated for ampsauce repo');
  }

  if (argv.saucelabs && !argv.integration) {
    log(red('ERROR:'), 'Only integration tests may be run on the full set of',
        'Sauce Labs browsers');
    log('Use', cyan('--saucelabs'), 'with', cyan('--integration'));
    process.exit();
  }

  const c = getConfig();

  if (argv.watch || argv.w) {
    c.singleRun = false;
  }

  if (argv.verbose || argv.v) {
    c.client.captureConsole = true;
    c.client.verboseLogging = true;
  }

  if (!isTravisBuild() && (argv.testnames || argv['local-changes'])) {
    c.reporters = ['mocha'];
  }

  c.browserify = {
    transform: [['babelify', {global: true}]],
    configure: function(bundle) {
      bundle.on('prebundle', function() {
        log(green('Transforming tests with'),
            cyan('browserify') + green('...'));
      });
      bundle.on('transform', function(tr) {
        if (tr instanceof babelify) {
          tr.once('babelify', function() {
            process.stdout.write('.');
          });
        }
      });
    },
  };
  // Exclude chai-as-promised from runs on the full set of sauce labs browsers.
  // See test/chai-as-promised/chai-as-promised.js for why this is necessary.
  c.files = argv.saucelabs ? [] : config.chaiAsPromised;

  if (argv.files) {
    c.client.captureConsole = true;
    c.files = c.files.concat(config.commonIntegrationTestPaths, argv.files);
    if (!argv.saucelabs && !argv.saucelabs_lite) {
      c.reporters = ['mocha'];
    }
  } else if (argv['local-changes']) {
    if (isLargeRefactor()) {
      log(green('INFO:'),
          'Skipping tests on local changes because this is a large refactor.');
      return reportTestSkipped();
    }
    const testsToRun = unitTestsToRun(config.unitTestPaths);
    if (testsToRun.length == 0) {
      log(green('INFO:'),
          'No unit tests were directly affected by local changes.');
      return reportTestSkipped();
    } else {
      log(green('INFO:'), 'Running the following unit tests:');
      testsToRun.forEach(test => {
        log(cyan(test));
      });
    }
    c.client.captureConsole = true;
    c.files = c.files.concat(config.commonUnitTestPaths, testsToRun);
  } else if (argv.integration) {
    c.files = c.files.concat(
        config.commonIntegrationTestPaths, config.integrationTestPaths);
  } else if (argv.unit) {
    if (argv.saucelabs_lite) {
      c.files = c.files.concat(
          config.commonUnitTestPaths, config.unitTestOnSaucePaths);
    } else {
      c.files = c.files.concat(
          config.commonUnitTestPaths, config.unitTestPaths);
    }
  } else if (argv.a4a) {
    c.files = c.files.concat(config.a4aTestPaths);
  } else {
    c.files = c.files.concat(config.testPaths);
  }

  // c.client is available in test browser via window.parent.karma.config
  c.client.amp = {
    useCompiledJs: !!argv.compiled,
    saucelabs: (!!argv.saucelabs) || (!!argv.saucelabs_lite),
    singlePass: !!argv.single_pass,
    adTypes: getAdTypes(),
    mochaTimeout: c.client.mocha.timeout,
    propertiesObfuscated: !!argv.single_pass,
    testServerPort: c.client.testServerPort,
    testOnIe: !!argv.ie ||
        (!!argv.saucelabs && saucelabsBrowsers.includes('SL_IE_11')),
  };

  if (argv.compiled) {
    process.env.SERVE_MODE = 'compiled';
  } else {
    process.env.SERVE_MODE = 'default';
  }

  if (argv.grep) {
    c.client.mocha = {
      'grep': argv.grep,
    };
  }

  if (argv.coverage) {
    c.browserify.transform = [
      ['babelify', {
        plugins: [
          ['babel-plugin-istanbul', {
            exclude: [
              './ads/**/*.js',
              './third_party/**/*.js',
              './test/**/*.js',
              './extensions/**/test/**/*.js',
              './testing/**/*.js',
            ],
          }],
        ],
      }],
    ];
    c.plugins.push('karma-coverage-istanbul-reporter');
    c.reporters = c.reporters.concat(['coverage-istanbul']);
    c.coverageIstanbulReporter = {
      dir: 'test/coverage',
      reports: isTravisBuild() ? ['lcov'] : ['html', 'text', 'text-summary'],
    };
  }

  const server = gulp.src(process.cwd(), {base: '.'}).pipe(webserver({
    port: karmaDefault.client.testServerPort,
    host: 'localhost',
    directoryListing: true,
    middleware: [app],
  }).on('kill', function() {
    log(yellow('Shutting down test responses server on '
        + `localhost:${karmaDefault.client.testServerPort}`));
  }));
  log(yellow('Started test responses server on '
        + `localhost:${karmaDefault.client.testServerPort}`));

  // Listen for Ctrl + C to cancel testing
  const handlerProcess = createCtrlcHandler('test');

  // Avoid Karma startup errors
  refreshKarmaWdCache();

  // Run Sauce Labs tests in batches to avoid timeouts when connecting to the
  // Sauce Labs environment.
  let processExitCode;
  if (argv.saucelabs || argv.saucelabs_lite) {
    processExitCode = await runTestInBatches();
  } else {
    processExitCode = await createKarmaServer(c);
  }

  // Exit tests
  // TODO(rsimha, 14814): Remove after Karma / Sauce ticket is resolved.
  if (isTravisBuild()) {
    setTimeout(() => {
      process.exit(processExitCode);
    }, 5000);
  }

  server.emit('kill');
  exitCtrlcHandler(handlerProcess);

  if (processExitCode != 0) {
    log(
        red('ERROR:'),
        yellow(`Karma test failed with exit code ${processExitCode}`));
    process.exitCode = processExitCode;
  }

  /**
   * Runs tests in batches.
   *
   * Splits stable and beta browsers to separate batches. Test failures in any
   * of the stable browsers will return an exit code of 1, whereas test failures
   * in any of the beta browsers will only print error messages, but will return
   * an exit code of 0.
   *
   * @return {number} processExitCode
   */
  async function runTestInBatches() {
    const browsers = {stable: [], beta: []};
    for (const browserId of saucelabsBrowsers) {
      browsers[
          browserId.toLowerCase().endsWith('_beta')
            ? 'beta' : 'stable']
          .push(browserId);
    }
    if (browsers.stable.length) {
      const allBatchesExitCodes = await runTestInBatchesWithBrowsers(
          'stable', browsers.stable);
      if (allBatchesExitCodes) {
        log(yellow('Some tests have failed on'), cyan('stable'),
            yellow('browsers, so skipping running them on'), cyan('beta'),
            yellow('browsers.'));
        return allBatchesExitCodes;
      }
    }

    if (browsers.beta.length) {
      const allBatchesExitCodes = await runTestInBatchesWithBrowsers(
          'beta', browsers.beta);
      if (allBatchesExitCodes) {
        log(yellow('Some tests have failed on'), cyan('beta'),
            yellow('browsers.'));
        log(yellow('This is not currently a fatal error, but will become an'),
            yellow('error once the beta browsers are released as next stable'),
            yellow('version!'));
      }
    }

    return 0;
  }

  /**
   * Runs tests in named batch(es), with the specified browsers.
   *
   * @param {string} batchName a human readable name for the batch.
   * @param {!Array{string}} browsers list of SauceLabs browsers as
   *     customLaunchers IDs.
   * @return {number} processExitCode
   */
  async function runTestInBatchesWithBrowsers(batchName, browsers) {
    let batch = 1;
    let startIndex = 0;
    let endIndex = batchSize;
    const batchExitCodes = [];

    log(green('Running tests on'), cyan(browsers.length),
        green('Sauce Labs'), cyan(batchName), green('browser(s)...'));
    while (startIndex < endIndex) {
      const configBatch = Object.assign({}, c);
      configBatch.browsers = browsers.slice(startIndex, endIndex);
      log(green('Batch'), cyan(`#${batch}`) + green(': Running tests on'),
          cyan(configBatch.browsers.length), green('Sauce Labs browser(s)...'));
      batchExitCodes.push(await createKarmaServer(configBatch));
      startIndex = batch * batchSize;
      batch++;
      endIndex = Math.min(batch * batchSize, browsers.length);
    }

    return batchExitCodes.every(exitCode => exitCode == 0) ? 0 : 1;
  }

  /**
   * Creates and starts karma server
   * @param {!Object} configBatch
   * @return {!Promise<number>}
   */
  function createKarmaServer(configBatch) {
    let resolver;
    const deferred = new Promise(resolverIn => {resolver = resolverIn;});
    new Karma(configBatch, function(exitCode) {
      if (argv.coverage) {
        if (isTravisBuild()) {
          const codecovCmd =
              './node_modules/.bin/codecov --file=test/coverage/lcov.info';
          let flags = '';
          if (argv.unit) {
            flags = ' --flags=unit_tests';
          } else if (argv.integration) {
            flags = ' --flags=integration_tests';
          }
          log(green('INFO:'), 'Uploading code coverage report to',
              cyan('https://codecov.io/gh/ampproject/amphtml'), 'by running',
              cyan(codecovCmd + flags) + '...');
          const output = getStdout(codecovCmd + flags);
          const viewReportPrefix = 'View report at: ';
          const viewReport = output.match(`${viewReportPrefix}.*`);
          if (viewReport && viewReport.length > 0) {
            log(green('INFO:'), viewReportPrefix +
                cyan(viewReport[0].replace(viewReportPrefix, '')));
          } else {
            log(yellow('WARNING:'),
                'Code coverage report upload may have failed:\n',
                yellow(output));
          }
        } else {
          const coverageReportUrl =
              'file://' + path.resolve('test/coverage/index.html');
          log(green('INFO:'), 'Generated code coverage report at',
              cyan(coverageReportUrl));
          opn(coverageReportUrl, {wait: false});
        }
      }
      resolver(exitCode);
    }).on('run_start', function() {
      if (!argv.saucelabs && !argv.saucelabs_lite) {
        log(green('Running tests locally...'));
      }
      reportTestStarted();
    }).on('browsers_ready', function() {
      console./*OK*/log('\n');
      log(green('Done. Running tests...'));
    }).on('browser_complete', function(browser) {
      const result = browser.lastResult;
      // Prevent cases where Karma detects zero tests and still passes. #16851.
      if (result.total == 0) {
        log(red('ERROR: Zero tests detected by Karma. Something went wrong.'));
        reportTestErrored().finally(() => {
          if (!argv.watch) {
            process.exit(1);
          }
        });
      }
      // Print a summary for each browser as soon as tests complete.
      let message = `${browser.name}: Executed ` +
          `${result.success + result.failed} of ${result.total} ` +
          `(Skipped ${result.skipped}) `;
      if (result.failed === 0) {
        message += green('SUCCESS');
      } else {
        message += red(result.failed + ' FAILED');
      }
      message += '\n';
      console./*OK*/log('\n');
      log(message);
    }).on('run_complete', (browsers, results) => {
      if (results.error) {
        reportTestErrored();
      } else {
        reportTestFinished(results.success, results.failed);
      }
    }).start();
    return deferred;
  }
}

async function test() {
  if (!argv.nobuild) {
    if (argv.unit || argv.a4a || argv['local-changes']) {
      await css();
    } else {
      await build();
    }
  }
  // TODO(alanorozco): Come up with a more elegant check?
  global.AMP_TESTING = true;

  if (!argv.nohelp) {
    printArgvMessages();
  }
  return runTests();
}

module.exports = {
  test,
};

/* eslint "google-camelcase/google-camelcase": 0 */

test.description = 'Runs tests';
test.flags = {
  'verbose': '  With logging enabled',
  'testnames': '  Lists the name of each test being run',
  'watch': '  Watches for changes in files, runs corresponding test(s)',
  'saucelabs': '  Runs integration tests on saucelabs (requires setup)',
  'saucelabs_lite': '  Runs tests on a subset of saucelabs browsers ' +
      '(requires setup)',
  'safari': '  Runs tests on Safari',
  'firefox': '  Runs tests on Firefox',
  'edge': '  Runs tests on Edge',
  'ie': '  Runs tests on IE',
  'chrome_canary': 'Runs tests on Chrome Canary',
  'chrome_flags':
    'Uses the given flags to launch Chrome',
  'unit': '  Run only unit tests.',
  'integration': '  Run only integration tests.',
  'compiled': '  Changes integration tests to use production JS ' +
      'binaries for execution',
  'grep': '  Runs tests that match the pattern',
  'files': '  Runs tests for specific files',
  'nohelp': '  Silence help messages that are printed prior to test run',
  'a4a': '  Runs all A4A tests',
  'coverage': '  Run tests in code coverage mode',
  'headless': '  Run tests in a headless Chrome window',
  'local-changes': '  Run unit tests directly affected by the files ' +
      'changed in the local branch',
};
