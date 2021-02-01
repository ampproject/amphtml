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
 * @fileoverview Script that builds the module AMP runtime during CI.
 */

const {
  printSkipMessage,
  timedExecOrDie,
  uploadModuleOutput,
} = require('./utils');
const {buildTargetsInclude, Targets} = require('./build-targets');
const {runCiJob} = require('./ci-job');

const jobName = 'module-build.js';

function pushBuildWorkflow() {
  timedExecOrDie('gulp update-packages');
  timedExecOrDie('gulp dist --esm --fortesting');
  uploadModuleOutput();
}

function prBuildWorkflow() {
  // TODO(#31102): This list must eventually match the same buildTargets check
  // found in pr-check/nomodule-build.js as we turn on the systems that
  // run against the module build. (ex. visual diffs, e2e, etc.)
  if (buildTargetsInclude(Targets.RUNTIME, Targets.INTEGRATION_TEST)) {
    timedExecOrDie('gulp update-packages');
    timedExecOrDie('gulp dist --esm --fortesting');
    uploadModuleOutput();
  } else {
    printSkipMessage(
      jobName,
      'this PR does not affect the runtime or integration tests'
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
