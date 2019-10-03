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
const fs = require('fs');
const log = require('fancy-log');
const opn = require('opn');
const path = require('path');
const {
  reportTestErrored,
  reportTestFinished,
  reportTestRunComplete,
} = require('../report-test-status');
const {green, yellow, cyan, red} = require('ansi-colors');
const {isTravisBuild} = require('../../common/travis');
const {Server} = require('karma');

const BATCHSIZE = 4; // Number of Sauce Lab browsers
const CHROMEBASE = argv.chrome_canary ? 'ChromeCanary' : 'Chrome';
const chromeFlags = [];

/**
 * Validates arguments before test runs
 * @return {boolean}
 */
function shouldNotRun() {
  if (argv.saucelabs) {
    if (!process.env.SAUCE_USERNAME) {
      throw new Error('Missing SAUCE_USERNAME Env variable');
    }
    if (!process.env.SAUCE_ACCESS_KEY) {
      throw new Error('Missing SAUCE_ACCESS_KEY Env variable');
    }
  }

  return false;
}

/**
 * Returns an array of ad types.
 * @return {!Array<string>}
 */
function getAdTypes() {
  const namingExceptions = {
    // We recommend 3P ad networks use the same string for filename and type.
    // Write exceptions here in alphabetic order.
    // filename: [type1, type2, ... ]
    adblade: ['adblade', 'industrybrains'],
    mantis: ['mantis-display', 'mantis-recommend'],
    weborama: ['weborama-display'],
  };

  const adTypes = [];

  // Add ad types (google networks not included as they full support native
  // implementations).
  const files = fs.readdirSync('./ads/');
  for (let i = 0; i < files.length; i++) {
    if (
      path.extname(files[i]) == '.js' &&
      files[i][0] != '_' &&
      files[i] != 'ads.extern.js'
    ) {
      const adType = path.basename(files[i], '.js');
      const expanded = namingExceptions[adType];
      if (expanded) {
        for (let j = 0; j < expanded.length; j++) {
          adTypes.push(expanded[j]);
        }
      } else {
        adTypes.push(adType);
      }
    }
  }
  return adTypes;
}

/**
 * Prints help messages for args if tests are being run for local development.
 */
function maybePrintArgvMessages() {
  if (argv.nohelp || isTravisBuild()) {
    return;
  }

  const argvMessages = {
    safari: 'Running tests on Safari.',
    firefox: 'Running tests on Firefox.',
    ie: 'Running tests on IE.',
    edge: 'Running tests on Edge.',
    // eslint-disable-next-line
    chrome_canary: 'Running tests on Chrome Canary.',
    saucelabs: 'Running tests on Sauce Labs browsers.',
    nobuild: 'Skipping build.',
    watch:
      'Enabling watch mode. Editing and saving a file will cause the' +
      ' tests for that file to be re-run in the same browser instance.',
    verbose: 'Enabling verbose mode. Expect lots of output!',
    testnames: 'Listing the names of all tests being run.',
    files: 'Running tests in the file(s): ' + cyan(argv.files),
    grep:
      'Only running tests that match the pattern "' + cyan(argv.grep) + '".',
    coverage: 'Running tests in code coverage mode.',
    headless: 'Running tests in a headless Chrome window.',
    // eslint-disable-next-line
    local_changes:
      'Running unit tests directly affected by the files' +
      ' changed in the local branch.',
    compiled: 'Running tests in compiled mode.',
    stable: 'Running tests only on stable browsers.',
    beta: 'Running tests only on beta browsers.',
  };
  if (argv.chrome_flags) {
    log(
      green('Launching'),
      cyan(CHROMEBASE),
      green('with flags'),
      cyan(chromeFlags)
    );
  }

  log(
    green('Run'),
    cyan('gulp help'),
    green('to see a list of all test flags.')
  );
  log(green('⤷ Use'), cyan('--nohelp'), green('to silence these messages.'));
  log(
    green('⤷ Use'),
    cyan('--local_changes'),
    green('to run unit tests from files commited to the local branch.')
  );
  if (!argv.testnames && !argv.files && !argv.local_changes) {
    log(
      green('⤷ Use'),
      cyan('--testnames'),
      green('to see the names of all tests being run.')
    );
  }
  if (!argv.headless) {
    log(
      green('⤷ Use'),
      cyan('--headless'),
      green('to run tests in a headless Chrome window.')
    );
  }
  if (argv.compiled || !argv.nobuild) {
    log(green('Running tests against minified code.'));
  } else {
    log(green('Running tests against unminified code.'));
  }
  Object.keys(argv).forEach(arg => {
    const message = argvMessages[arg];
    if (message) {
      log(yellow(`--${arg}:`), green(message));
    }
  });
}

function maybePrintCoverageMessage() {
  if (!argv.coverage || isTravisBuild()) {
    return;
  }

  const url = 'file://' + path.resolve('test/coverage/index.html');
  log(green('INFO:'), 'Generated code coverage report at', cyan(url));
  opn(url, {wait: false});
}

/**
 * @param {Object} browser
 * @private
 */
function karmaBrowserStart_(browser) {
  console./*OK*/ log('\n');
  log(`${browser.name}: ${green('STARTED')}`);
}

/**
 * @param {Object} browser
 * @private
 */
async function karmaBrowserComplete_(browser) {
  const result = browser.lastResult;
  result.total = result.success + result.failed + result.skipped;
  // Set test status to "error" if browser_complete shows zero tests (#16851).
  // Sometimes, Sauce labs can follow this up with another successful status, in
  // which case the error status will be replaced by a pass / fail status.
  if (result.total == 0) {
    log(
      yellow('WARNING:'),
      'Received a status with zero tests:',
      cyan(JSON.stringify(result))
    );
    await reportTestErrored();
    return;
  }
  // Print a summary for each browser as soon as tests complete.
  let message =
    `${browser.name}: Executed ` +
    `${result.success + result.failed} of ${result.total} ` +
    `(Skipped ${result.skipped}) `;
  if (result.failed === 0) {
    message += green('SUCCESS');
  } else {
    message += red(result.failed + ' FAILED');
  }
  message += '\n';
  console./*OK*/ log('\n');
  log(message);
}

/**
 * @private
 */
function karmaBrowsersReady_() {
  console./*OK*/ log('\n');
  log(green('Done. Running tests...'));
}

/**
 * @private
 */
function karmaRunStart_() {
  if (!argv.saucelabs) {
    log(green('Running tests locally...'));
  }
}

/**
 * Runs tests in sauce labs
 *
 * If --stable is provided, runs tests only on stable browsers in sauce labs without batching.
 * If --beta is provided, runs tests only on beta browsers in sauce labs without batching. Does not fail.
 * If neither --stable nor --beta are provided, runs test on all browsers in sauce labs with batching.
 *
 * @param {Object} config karma config
 * @return {!Promise<number>} exitCode
 */
async function runTestInSauceLabs(config) {
  const browsers = {stable: [], beta: []};
  for (const browserId of config.browsers) {
    browsers[
      browserId.toLowerCase().endsWith('_beta') ? 'beta' : 'stable'
    ].push(browserId);
  }

  if (argv.stable) {
    config.browsers = browsers.stable;
    return createKarmaServer(config, reportTestRunComplete);
  }

  if (argv.beta) {
    config.browsers = browsers.beta;
    const betaExitCode = await createKarmaServer(config, reportTestRunComplete);
    if (betaExitCode != 0) {
      log(
        yellow('Some tests have failed on'),
        cyan('beta'),
        yellow('browsers.')
      );
      log(
        yellow('This is not currently a fatal error, but will become an'),
        yellow('error once the beta browsers are released as next stable'),
        yellow('version!')
      );
    }

    return 0;
  }

  return await runTestInBatches_(config, browsers);
}

/**
 * Runs tests in batches.
 *
 * Splits stable and beta browsers to separate batches. Test failures in any
 * of the stable browsers will return an exit code of 1, whereas test failures
 * in any of the beta browsers will only print error messages, but will return
 * an exit code of 0.
 *
 * @param {Object} config karma config
 * @param {!Array<string>} browsers browsers
 * @return {number} exitCode
 * @private
 */
async function runTestInBatches_(config, browsers) {
  let errored = false;
  let totalSuccess = 0;
  let totalFailed = 0;
  const partialTestRunCompleteFn = async (browsers, results) => {
    if (results.error) {
      errored = true;
    } else {
      totalSuccess += results.success;
      totalFailed += results.failed;
    }
  };

  const reportResults = async () => {
    if (errored) {
      await reportTestErrored();
    } else {
      await reportTestFinished(totalSuccess, totalFailed);
    }
  };

  if (browsers.stable.length) {
    const allBatchesExitCodes = await runTestInBatchesWithBrowsers_(
      'stable',
      browsers.stable,
      config,
      partialTestRunCompleteFn
    );
    if (allBatchesExitCodes || errored) {
      await reportResults();
      log(
        yellow('Some tests have failed on'),
        cyan('stable'),
        yellow('browsers, so skipping running them on'),
        cyan('beta'),
        yellow('browsers.')
      );
      return allBatchesExitCodes || Number(errored);
    }
  }

  if (browsers.beta.length) {
    const allBatchesExitCodes = await runTestInBatchesWithBrowsers_(
      'beta',
      browsers.beta,
      config,
      partialTestRunCompleteFn
    );
    if (allBatchesExitCodes) {
      log(
        yellow('Some tests have failed on'),
        cyan('beta'),
        yellow('browsers.')
      );
      log(
        yellow('This is not currently a fatal error, but will become an'),
        yellow('error once the beta browsers are released as next stable'),
        yellow('version!')
      );
    }
  }

  await reportResults();
  return 0;
}

/**
 * Runs tests in named batch(es), with the specified browsers.
 *
 * @param {string} batchName a human readable name for the batch.
 * @param {!Array{string}} browsers list of SauceLabs browsers as
 *     customLaunchers IDs. *
 * @param {Object} config karma config
 * @param {function()} runCompleteFn a function to execute on the
 *     `run_complete` event. It should take two arguments, (browser, results),
 *     and return nothing.
 * @return {number} processExitCode
 * @private
 */
async function runTestInBatchesWithBrowsers_(
  batchName,
  browsers,
  config,
  runCompleteFn
) {
  let batch = 1;
  let startIndex = 0;
  let endIndex = BATCHSIZE;
  const batchExitCodes = [];

  log(
    green('Running tests on'),
    cyan(browsers.length),
    green('Sauce Labs'),
    cyan(batchName),
    green('browser(s)...')
  );
  while (startIndex < endIndex) {
    const configBatch = Object.assign({}, config);
    configBatch.browsers = browsers.slice(startIndex, endIndex);
    log(
      green('Batch'),
      cyan(`#${batch}`) + green(': Running tests on'),
      cyan(configBatch.browsers.length),
      green('Sauce Labs browser(s)...')
    );
    batchExitCodes.push(await createKarmaServer(configBatch, runCompleteFn));
    startIndex = batch * BATCHSIZE;
    batch++;
    endIndex = Math.min(batch * BATCHSIZE, browsers.length);
  }

  return batchExitCodes.every(exitCode => exitCode == 0) ? 0 : 1;
}

/**
 * Creates and starts karma server
 * @param {!Object} configBatch
 * @param {function()} runCompleteFn a function to execute on the
 *     `run_complete` event. It should take two arguments, (browser, results),
 *     and return nothing.
 * @return {!Promise<number>}
 */
async function createKarmaServer(
  configBatch,
  runCompleteFn = reportTestRunComplete
) {
  let resolver;
  const deferred = new Promise(resolverIn => {
    resolver = resolverIn;
  });

  const karmaServer = new Server(configBatch, exitCode => {
    maybePrintCoverageMessage();
    resolver(exitCode);
  });

  karmaServer
    .on('run_start', karmaRunStart_)
    .on('browsers_ready', karmaBrowsersReady_)
    .on('browser_start', karmaBrowserStart_)
    .on('browser_complete', karmaBrowserComplete_)
    .on('run_complete', runCompleteFn);

  karmaServer.start();

  return deferred;
}

module.exports = {
  createKarmaServer,
  getAdTypes,
  maybePrintArgvMessages,
  runTestInSauceLabs,
  shouldNotRun,
};
