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
 * @fileoverview
 * This script runs the unit and integration tests against minified code
 * on a local CI service VM.
 * This is run during the CI stage = test; job = nomodule tests.
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

const jobName = 'nomodule-tests.js';

function main() {
  setLoggingPrefix(jobName);
  const startTime = startTimer(jobName);

  if (!isPullRequestBuild()) {
    downloadNomoduleOutput();
    timedExecOrDie('gulp update-packages');
    try {
      timedExecOrThrow(
        'gulp integration --nobuild --headless --compiled --report',
        'Integration tests failed!'
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
      !buildTargets.has('RUNTIME') &&
      !buildTargets.has('FLAG_CONFIG') &&
      !buildTargets.has('INTEGRATION_TEST')
    ) {
      printSkipMessage(
        jobName,
        'this PR does not affect the runtime, flag configs, or integration tests'
      );
      stopTimer(jobName, startTime);
      return;
    }

    downloadNomoduleOutput();
    timedExecOrDie('gulp update-packages');

    if (
      buildTargets.has('RUNTIME') ||
      buildTargets.has('FLAG_CONFIG') ||
      buildTargets.has('INTEGRATION_TEST')
    ) {
      timedExecOrDie('gulp integration --nobuild --headless --compiled');
    }
  }

  stopTimer(jobName, startTime);
}

main();
