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
 * @fileoverview Script that deploys a PR's nomodule and storybook output during CI.
 */

const {
  processAndStoreBuildToArtifacts,
  skipDependentJobs,
  timedExecOrDie,
} = require('./utils');
const {runCiJob} = require('./ci-job');
const {signalPrDeployUpload} = require('../tasks/pr-deploy-bot-utils');
const {Targets, buildTargetsInclude} = require('./build-targets');

const jobName = 'pr-deploy.js';

/**
 * Steps to run during PR builds.
 * @return {Promise<void>}
 */
async function prBuildWorkflow() {
  if (
    buildTargetsInclude(
      Targets.RUNTIME,
      Targets.INTEGRATION_TEST,
      Targets.E2E_TEST,
      Targets.VISUAL_DIFF
    )
  ) {
    timedExecOrDie('amp storybook --build');
    await processAndStoreBuildToArtifacts();
    await signalPrDeployUpload('success');
  } else {
    await signalPrDeployUpload('skipped');
    skipDependentJobs(
      jobName,
      'this PR does not affect the runtime, integration tests, end-to-end tests, or visual diff tests'
    );
  }
}

runCiJob(jobName, () => {}, prBuildWorkflow);
