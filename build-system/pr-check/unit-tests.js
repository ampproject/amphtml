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
 * @fileoverview
 * This script runs the unit and integration tests locally on a VM.
 * This is run during the CI stage = test; job = unit tests.
 */

const {
  printChangeSummary,
  printSkipMessage,
  startTimer,
  stopTimer,
  timedExecOrDie,
  timedExecOrThrow,
} = require('./utils');
const {determineBuildTargets} = require('./build-targets');
const {isPullRequestBuild} = require('../common/ci');
const {setLoggingPrefix} = require('../common/logging');

const jobName = 'unit-tests.js';

function main() {
  setLoggingPrefix(jobName);
  const startTime = startTimer(jobName);

  if (!isPullRequestBuild()) {
    timedExecOrDie('gulp update-packages');
    try {
      timedExecOrThrow(
        'gulp unit --headless --coverage --report',
        'Unit tests failed!'
      );
      timedExecOrThrow(
        'gulp codecov-upload',
        'Failed to upload code coverage to Codecov!'
      );
    } catch (e) {
      if (e.status) {
        process.exitCode = e.status;
      }
    } finally {
      timedExecOrDie('gulp test-report-upload');
    }
  } else {
    printChangeSummary();
    const buildTargets = determineBuildTargets();
    if (buildTargets.has('RUNTIME') || buildTargets.has('UNIT_TEST')) {
      timedExecOrDie('gulp update-packages');
      timedExecOrDie('gulp unit --headless --local_changes');
      timedExecOrDie('gulp unit --headless --coverage');
      timedExecOrDie('gulp codecov-upload');
    } else {
      printSkipMessage(
        jobName,
        'this PR does not affect the runtime or unit tests'
      );
    }
  }

  stopTimer(jobName, startTime);
}

main();
