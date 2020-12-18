/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

const log = require('fancy-log');
const {
  printChangeSummary,
  startTimer,
  stopTimer,
  stopTimedJob,
  timedExecOrDie: timedExecOrDieBase,
} = require('./utils');
const {determineBuildTargets} = require('./build-targets');
const {isPullRequestBuild} = require('../common/ci');
const {red, cyan, bold, yellow} = require('ansi-colors');
const {reportAllExpectedTests} = require('../tasks/report-test-status');
const {runNpmChecks} = require('./npm-checks');

/**
 * @fileoverview
 * This script kicks off the unit and integration tests on Linux, Mac OS, and
 * Windows. This is run on Github Actions CI stage = Cross-Browser Tests.
 */

const FILENAME = 'cross-browser-tests.js';
const FILELOGPREFIX = bold(yellow(`${FILENAME}:`));
const timedExecOrDie = (cmd) => timedExecOrDieBase(cmd, FILENAME);

/**
 * Helper that runs platform-specific integration tests
 */
function runIntegrationTestsForPlatform() {
  switch (process.platform) {
    case 'linux':
      timedExecOrDie(
        'gulp integration --nobuild --compiled --headless --firefox'
      );
      break;
    case 'darwin':
      timedExecOrDie('gulp integration --nobuild --compiled --safari');
      break;
    case 'win32':
      timedExecOrDie('gulp integration --nobuild --compiled --headless --edge');
      timedExecOrDie('gulp integration --nobuild --compiled --ie');
      break;
    default:
      log(
        red('ERROR:'),
        'Cannot run cross-browser integration tests on',
        cyan(process.platform) + '.'
      );
  }
}

/**
 * Helper that runs platform-specific unit tests
 */
function runUnitTestsForPlatform() {
  switch (process.platform) {
    case 'linux':
      timedExecOrDie('gulp unit --nobuild --headless --firefox');
      break;
    case 'darwin':
      timedExecOrDie('gulp unit --nobuild --safari');
      break;
    case 'win32':
      timedExecOrDie('gulp unit --nobuild --headless --edge');
      break;
    default:
      log(
        red('ERROR:'),
        'Cannot run cross-browser unit tests on',
        cyan(process.platform) + '.'
      );
  }
}

async function main() {
  const startTime = startTimer(FILENAME, FILENAME);
  if (!runNpmChecks(FILENAME)) {
    stopTimedJob(FILENAME, startTime);
    return;
  }
  if (!isPullRequestBuild()) {
    timedExecOrDie('gulp update-packages');
    timedExecOrDie('gulp dist --fortesting');
    runIntegrationTestsForPlatform();
    runUnitTestsForPlatform();
  } else {
    printChangeSummary(FILENAME);
    const buildTargets = determineBuildTargets(FILENAME);
    if (process.platform == 'linux') {
      await reportAllExpectedTests(buildTargets); // Only once is sufficient.
    }
    if (
      !buildTargets.has('RUNTIME') &&
      !buildTargets.has('FLAG_CONFIG') &&
      !buildTargets.has('UNIT_TEST') &&
      !buildTargets.has('INTEGRATION_TEST')
    ) {
      console.log(
        `${FILELOGPREFIX} Skipping`,
        cyan('Cross-Browser Tests'),
        'because this commit not affect the runtime, flag configs,',
        'unit tests, or integration tests.'
      );
      stopTimer(FILENAME, FILENAME, startTime);
      return;
    }
    timedExecOrDie('gulp update-packages');
    if (
      buildTargets.has('RUNTIME') ||
      buildTargets.has('FLAG_CONFIG') ||
      buildTargets.has('INTEGRATION_TEST')
    ) {
      timedExecOrDie('gulp dist --fortesting');
      runIntegrationTestsForPlatform();
    }
    if (buildTargets.has('RUNTIME') || buildTargets.has('UNIT_TEST')) {
      runUnitTestsForPlatform();
    }
  }
  stopTimer(FILENAME, FILENAME, startTime);
}

main();
