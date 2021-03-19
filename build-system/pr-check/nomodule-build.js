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
 * @fileoverview Script that builds the nomodule AMP runtime during CI.
 */

const {
  abortTimedJob,
  printSkipMessage,
  processAndUploadNomoduleOutput,
  startTimer,
  timedExecWithError,
  timedExecOrDie,
  uploadNomoduleOutput,
} = require('./utils');
const {buildTargetsInclude, Targets} = require('./build-targets');
const {log} = require('../common/logging');
const {red, yellow} = require('kleur/colors');
const {runCiJob} = require('./ci-job');
const {signalPrDeployUpload} = require('../tasks/pr-deploy-bot-utils');

const jobName = 'nomodule-build.js';

function pushBuildWorkflow() {
  timedExecOrDie('amp dist --fortesting');
  uploadNomoduleOutput();
}

/**
 * @return {Promise<void>}
 */
async function prBuildWorkflow() {
  const startTime = startTimer(jobName);
  if (
    buildTargetsInclude(
      Targets.RUNTIME,
      Targets.INTEGRATION_TEST,
      Targets.E2E_TEST,
      Targets.VISUAL_DIFF
    )
  ) {
    const process = timedExecWithError('amp dist --fortesting');
    if (process.status !== 0) {
      const message = process?.error
        ? process.error.message
        : 'Unknown error, check logs';
      log(red('ERROR'), yellow(message));
      await signalPrDeployUpload('errored');
      return abortTimedJob(jobName, startTime);
    }
    timedExecOrDie('amp storybook --build');
    await processAndUploadNomoduleOutput();
    await signalPrDeployUpload('success');
  } else {
    await signalPrDeployUpload('skipped');
    printSkipMessage(
      jobName,
      'this PR does not affect the runtime, integration tests, end-to-end tests, or visual diff tests'
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
