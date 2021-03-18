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

const {buildTargetsInclude, Targets} = require('./build-targets');
const {log} = require('../common/logging');
const {printSkipMessage, timedExecOrDie} = require('./utils');
const {red, cyan} = require('kleur/colors');
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
        'amp integration --nobuild --compiled --headless --firefox'
      );
      break;
    case 'darwin':
      timedExecOrDie('amp integration --nobuild --compiled --safari');
      break;
    case 'win32':
      timedExecOrDie('amp integration --nobuild --compiled --headless --edge');
      timedExecOrDie('amp integration --nobuild --compiled --ie');
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
 * Helper that runs platform-specific E2E tests
 */
function runE2eTestsForPlatform() {
  switch (process.platform) {
    case 'linux':
      timedExecOrDie('amp e2e --nobuild --compiled --browsers=firefox');
      break;
    case 'darwin':
      timedExecOrDie('amp e2e --nobuild --compiled --browsers=safari');
      break;
    case 'win32':
      break;
    default:
      log(
        red('ERROR:'),
        'Cannot run cross-browser E2E tests on',
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
      timedExecOrDie('amp unit --headless --firefox');
      break;
    case 'darwin':
      timedExecOrDie('amp unit --safari');
      break;
    case 'win32':
      timedExecOrDie('amp unit --headless --edge');
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
  runUnitTestsForPlatform();
  timedExecOrDie('amp dist --fortesting');
  runIntegrationTestsForPlatform();
}

/**
 * @return {Promise<void>}
 */
async function prBuildWorkflow() {
  if (process.platform == 'linux') {
    await reportAllExpectedTests(); // Only once is sufficient.
  }
  if (
    !buildTargetsInclude(
      Targets.RUNTIME,
      Targets.UNIT_TEST,
      Targets.E2E_TEST,
      Targets.INTEGRATION_TEST
    )
  ) {
    printSkipMessage(
      jobName,
      'this PR does not affect the runtime, unit tests, integration tests, or end-to-end tests'
    );
    return;
  }
  if (buildTargetsInclude(Targets.RUNTIME, Targets.UNIT_TEST)) {
    runUnitTestsForPlatform();
  }
  if (
    buildTargetsInclude(
      Targets.RUNTIME,
      Targets.INTEGRATION_TEST,
      Targets.E2E_TEST
    )
  ) {
    timedExecOrDie('amp dist --fortesting');
  }
  if (buildTargetsInclude(Targets.RUNTIME, Targets.INTEGRATION_TEST)) {
    runIntegrationTestsForPlatform();
  }
  if (buildTargetsInclude(Targets.RUNTIME, Targets.E2E_TEST)) {
    runE2eTestsForPlatform();
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
