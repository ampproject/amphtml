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
const {green, yellow, cyan} = require('ansi-colors');
const {isTravisBuild} = require('../../common/travis');
const {reportTestRunComplete} = require('../report-test-status');
const {Server} = require('karma');

const CHROMEBASE = argv.chrome_canary ? 'ChromeCanary' : 'Chrome';
const chromeFlags = [];

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
      files[i] != 'ads.extern.js' &&
      files[i] != '.eslintrc.js'
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
  Object.keys(argv).forEach((arg) => {
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
async function karmaBrowserComplete_(browser) {
  const result = browser.lastResult;
  result.total = result.success + result.failed + result.skipped;
  // Initially we were reporting an error with reportTestErrored() when zero tests were detected (see #16851),
  // but since Karma sometimes returns a transient, recoverable state, we will
  // print a warning without reporting an error to the github test status. (see #24957)
  if (result.total == 0) {
    log(
      yellow('WARNING:'),
      'Received a status with zero tests:',
      cyan(JSON.stringify(result))
    );
  }
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
  log(green('Running tests locally...'));
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
  const deferred = new Promise((resolverIn) => {
    resolver = resolverIn;
  });

  const karmaServer = new Server(configBatch, (exitCode) => {
    maybePrintCoverageMessage();
    resolver(exitCode);
  });

  karmaServer
    .on('run_start', karmaRunStart_)
    .on('browsers_ready', karmaBrowsersReady_)
    .on('browser_complete', karmaBrowserComplete_)
    .on('run_complete', runCompleteFn);

  karmaServer.start();

  return deferred;
}

module.exports = {
  createKarmaServer,
  getAdTypes,
  maybePrintArgvMessages,
};
