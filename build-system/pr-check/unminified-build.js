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
 * This script builds the AMP runtime.
 * This is run during the CI stage = build; job = unminified build.
 */

const {
  stopTimedJob,
  printChangeSummary,
  printSkipMessage,
  startTimer,
  stopTimer,
  timedExecOrDie,
  uploadUnminifiedOutput,
} = require('./utils');
const {determineBuildTargets} = require('./build-targets');
const {isPullRequestBuild} = require('../common/ci');
const {runNpmChecks} = require('./npm-checks');
const {setLoggingPrefix} = require('../common/logging');

const jobName = 'unminified-build.js';

function main() {
  setLoggingPrefix(jobName);
  const startTime = startTimer(jobName);
  if (!runNpmChecks()) {
    return stopTimedJob(jobName, startTime);
  }

  if (!isPullRequestBuild()) {
    timedExecOrDie('gulp update-packages');
    timedExecOrDie('gulp build --fortesting');
    uploadUnminifiedOutput();
  } else {
    printChangeSummary();
    const buildTargets = determineBuildTargets();
    if (
      buildTargets.has('RUNTIME') ||
      buildTargets.has('FLAG_CONFIG') ||
      buildTargets.has('INTEGRATION_TEST') ||
      buildTargets.has('UNIT_TEST')
    ) {
      timedExecOrDie('gulp update-packages');
      timedExecOrDie('gulp build --fortesting');
      uploadUnminifiedOutput();
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
