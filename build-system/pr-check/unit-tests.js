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
 * @fileoverview Script that runs the unit tests during CI.
 */

const {
  skipDependentJobs,
  timedExecOrDie,
  timedExecOrThrow,
} = require('./utils');
const {runCiJob} = require('./ci-job');
const {Targets, buildTargetsInclude} = require('./build-targets');

const jobName = 'unit-tests.js';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  try {
    timedExecOrThrow(
      'amp unit --headless --coverage --report',
      'Unit tests failed!'
    );
    timedExecOrThrow(
      'amp codecov-upload',
      'Failed to upload code coverage to Codecov!'
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
  if (buildTargetsInclude(Targets.RUNTIME, Targets.UNIT_TEST)) {
    timedExecOrDie('amp unit --headless --local_changes');
    timedExecOrDie('amp unit --headless --coverage');
    timedExecOrDie('amp codecov-upload');
  } else {
    skipDependentJobs(
      jobName,
      'this PR does not affect the runtime or unit tests'
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
