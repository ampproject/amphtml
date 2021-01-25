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

/**
 * @fileoverview Script that builds and tests on Linux, macOS, and Windows during CI.
 */

const {determineBuildTargets} = require('./build-targets');
const {log} = require('../common/logging');
const {printSkipMessage, timedExecOrDie} = require('./utils');
const {red, cyan} = require('ansi-colors');
const {reportAllExpectedTests} = require('../tasks/report-test-status');
const {runCiJob} = require('./ci-job');

const jobName = 'cross-browser-tests.js';

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
      timedExecOrDie('gulp unit --headless --firefox');
      break;
    case 'darwin':
      timedExecOrDie('gulp unit --safari');
      break;
    case 'win32':
      timedExecOrDie('gulp unit --headless --edge');
      break;
    default:
      log(
        red('ERROR:'),
        'Cannot run cross-browser unit tests on',
        cyan(process.platform) + '.'
      );
  }
}

function pushBuildWorkflow() {
  timedExecOrDie('gulp update-packages');
  timedExecOrDie('gulp dist --fortesting');
  runIntegrationTestsForPlatform();
  runUnitTestsForPlatform();
}

async function prBuildWorkflow() {
  const buildTargets = determineBuildTargets();
  if (process.platform == 'linux') {
    await reportAllExpectedTests(buildTargets); // Only once is sufficient.
  }
  if (
    !buildTargets.has('RUNTIME') &&
    !buildTargets.has('FLAG_CONFIG') &&
    !buildTargets.has('UNIT_TEST') &&
    !buildTargets.has('INTEGRATION_TEST')
  ) {
    printSkipMessage(
      jobName,
      'this PR does not affect the runtime, flag configs, unit tests, or integration tests'
    );
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

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
