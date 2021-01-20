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
 * @fileoverview
 * This script runs end to end tests.
 * This is run during the CI stage = test; job = e2e tests.
 */

const {
  downloadNomoduleOutput,
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

const jobName = 'e2e-tests.js';

async function main() {
  setLoggingPrefix(jobName);
  const startTime = startTimer(jobName);

  if (!isPullRequestBuild()) {
    downloadNomoduleOutput();
    timedExecOrDie('gulp update-packages');

    try {
      timedExecOrThrow(
        'gulp e2e --nobuild --headless --compiled --report',
        'End-to-end tests failed!'
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
    if (
      buildTargets.has('RUNTIME') ||
      buildTargets.has('FLAG_CONFIG') ||
      buildTargets.has('E2E_TEST')
    ) {
      downloadNomoduleOutput();
      timedExecOrDie('gulp update-packages');
      timedExecOrDie('gulp e2e --nobuild --headless --compiled');
    } else {
      printSkipMessage(
        jobName,
        'this PR does not affect the runtime, flag configs, or end-to-end tests'
      );
    }
  }

  stopTimer(jobName, startTime);
}

main();
