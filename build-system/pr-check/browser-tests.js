/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
 * @fileoverview Script that runs tests on Safari / Firefox / Edge during CI.
 */

const {
  skipDependentJobs,
  timedExecOrDie,
  timedExecOrThrow,
} = require('./utils');
const {browser} = require('minimist')(process.argv.slice(2));
const {runCiJob} = require('./ci-job');
const {Targets, buildTargetsInclude} = require('./build-targets');

const jobName = 'browser-tests.js';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  try {
    timedExecOrThrow(`amp unit --report --${browser}`, 'Unit tests failed!');
    timedExecOrThrow(
      `amp integration --report --nobuild --compiled --${browser}`,
      'Integration tests failed!'
    );
    timedExecOrThrow(
      `amp e2e --report --nobuild --compiled --browsers=${browser}`,
      'End-to-end tests failed!'
    );
  } catch (e) {
    if (e.status) {
      process.exitCode = e.status;
    }
  } finally {
    timedExecOrDie('amp test-report-upload');
  }
}

/**
 * Steps to run during PR builds.
 */
function prBuildWorkflow() {
  if (
    !buildTargetsInclude(
      Targets.RUNTIME,
      Targets.UNIT_TEST,
      Targets.E2E_TEST,
      Targets.INTEGRATION_TEST
    )
  ) {
    skipDependentJobs(
      jobName,
      'this PR does not affect the runtime, unit tests, integration tests, or end-to-end tests'
    );
    return;
  }
  if (buildTargetsInclude(Targets.RUNTIME, Targets.UNIT_TEST)) {
    timedExecOrDie(`amp unit --${browser}`);
  }
  if (buildTargetsInclude(Targets.RUNTIME, Targets.INTEGRATION_TEST)) {
    timedExecOrDie(`amp integration --nobuild --compiled --${browser}`);
  }
  if (
    buildTargetsInclude(Targets.RUNTIME, Targets.E2E_TEST) &&
    ['safari', 'firefox'].includes(browser) // E2E tests can't be run on Edge.
  ) {
    timedExecOrDie(`amp e2e --nobuild --compiled --browsers=${browser}`);
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
