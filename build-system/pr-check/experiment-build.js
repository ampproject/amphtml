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
 * @fileoverview Script that builds the experiment A/B/C runtime during CI.
 */

const {
  skipDependentJobs: skipDependentJobs,
  storeExperimentBuildToWorkspace,
  timedExecOrDie,
} = require('./utils');
const {experiment} = require('minimist')(process.argv.slice(2));
const {getExperimentConfig} = require('../common/utils');
const {runCiJob} = require('./ci-job');
const {Targets, buildTargetsInclude} = require('./build-targets');

const jobName = `${experiment}-build.js`;

function pushBuildWorkflow() {
  // Note that if config is invalid, this build would have been skipped by CircleCI.
  const config = getExperimentConfig(experiment);
  const defineFlag = `--define_experiment_constant ${config.define_experiment_constant}`;
  timedExecOrDie(`amp dist --fortesting ${defineFlag}`);
  storeExperimentBuildToWorkspace(experiment);
}

function prBuildWorkflow() {
  if (
    buildTargetsInclude(
      Targets.RUNTIME,
      Targets.INTEGRATION_TEST,
      Targets.E2E_TEST
    )
  ) {
    pushBuildWorkflow();
  } else {
    skipDependentJobs(
      jobName,
      'this PR does not affect the runtime, integration tests, or end-to-end tests'
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
