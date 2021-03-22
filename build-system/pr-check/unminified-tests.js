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

/**
 * @fileoverview Script that tests the unminified AMP runtime during CI.
 */

const {
  downloadUnminifiedOutput,
  printSkipMessage,
  timedExecOrDie,
  timedExecOrThrow,
} = require('./utils');
const {buildTargetsInclude, Targets} = require('./build-targets');
const {runCiJob} = require('./ci-job');

const jobName = 'unminified-tests.js';

function pushBuildWorkflow() {
  downloadUnminifiedOutput();

  try {
    timedExecOrThrow(
      'amp integration --nobuild --headless --coverage --report',
      'Integration tests failed!'
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

function prBuildWorkflow() {
  if (buildTargetsInclude(Targets.RUNTIME, Targets.INTEGRATION_TEST)) {
    downloadUnminifiedOutput();
    timedExecOrDie('amp integration --nobuild --headless --coverage');
    timedExecOrDie('amp codecov-upload');
  } else {
    printSkipMessage(
      jobName,
      'this PR does not affect the runtime or integration tests'
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
