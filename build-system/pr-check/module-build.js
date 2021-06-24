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
  skipDependentJobs,
  storeModuleBuildToWorkspace,
  timedExecOrDie,
} = require('./utils');
const {runCiJob} = require('./ci-job');
const {Targets, buildTargetsInclude} = require('./build-targets');

const jobName = 'module-build.js';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  timedExecOrDie('amp dist --esm --fortesting');
  storeModuleBuildToWorkspace();
}

/**
 * Steps to run during PR builds.
 */
function prBuildWorkflow() {
  // TODO(#31102): This list must eventually match the same buildTargets check
  // found in pr-check/nomodule-build.js as we turn on the systems that
  // run against the module build. (ex. visual diffs, e2e, etc.)
  if (buildTargetsInclude(Targets.RUNTIME, Targets.INTEGRATION_TEST)) {
    timedExecOrDie('amp dist --esm --fortesting');
    storeModuleBuildToWorkspace();
  } else {
    skipDependentJobs(
      jobName,
      'this PR does not affect the runtime or integration tests'
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
