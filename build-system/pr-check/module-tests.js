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
 * @fileoverview Script that tests the module AMP runtime during CI.
 */

const {
  downloadModuleOutput,
  downloadNomoduleOutput,
  printSkipMessage,
  timedExecOrDie,
} = require('./utils');
const {buildTargetsInclude, Targets} = require('./build-targets');
const {runCiJob} = require('./ci-job');

const jobName = 'module-tests.js';

function pushBuildWorkflow() {
  downloadNomoduleOutput();
  downloadModuleOutput();
  timedExecOrDie('gulp update-packages');
  timedExecOrDie('gulp integration --nobuild --compiled --headless --esm');
}

function prBuildWorkflow() {
  if (
    buildTargetsInclude(
      Targets.RUNTIME,
      Targets.FLAG_CONFIG,
      Targets.INTEGRATION_TEST
    )
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

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
