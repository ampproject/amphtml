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
 * This script builds and tests the AMP runtime in esm mode.
 * This is run during the CI stage = test; job = module tests.
 */

const {
  printChangeSummary,
  printSkipMessage,
  startTimer,
  stopTimer,
  timedExecOrDie,
  downloadModuleOutput,
  downloadNomoduleOutput,
} = require('./utils');
const {determineBuildTargets} = require('./build-targets');
const {isPullRequestBuild} = require('../common/ci');
const {setLoggingPrefix} = require('../common/logging');

const jobName = 'module-tests.js';

function main() {
  setLoggingPrefix(jobName);
  const startTime = startTimer(jobName);

  if (!isPullRequestBuild()) {
    downloadNomoduleOutput();
    downloadModuleOutput();
    timedExecOrDie('gulp update-packages');
    timedExecOrDie('gulp integration --nobuild --compiled --headless --esm');
  } else {
    printChangeSummary();
    const buildTargets = determineBuildTargets();
    if (
      buildTargets.has('RUNTIME') ||
      buildTargets.has('FLAG_CONFIG') ||
      buildTargets.has('INTEGRATION_TEST')
    ) {
      downloadNomoduleOutput();
      downloadModuleOutput();
      timedExecOrDie('gulp update-packages');
      timedExecOrDie('gulp integration --nobuild --compiled --headless --esm');
    } else {
      printSkipMessage(
        jobName,
        'this PR does not affect the runtime, flag configs, or integration tests'
      );
    }
  }

  stopTimer(jobName, startTime);
}

main();
