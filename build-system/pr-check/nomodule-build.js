'use strict';

/**
 * @fileoverview Script that builds the nomodule AMP runtime during CI.
 */

const {
  abortTimedJob,
  skipDependentJobs,
  startTimer,
  storeNomoduleBuildToWorkspace,
  timedExecOrDie,
  timedExecWithError,
} = require('./utils');
const {log} = require('../common/logging');
const {red, yellow} = require('../common/colors');
const {runCiJob} = require('./ci-job');
const {signalPrDeployUpload} = require('../tasks/pr-deploy-bot-utils');
const {Targets, buildTargetsInclude} = require('./build-targets');

const jobName = 'nomodule-build.js';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  timedExecOrDie('amp dist --fortesting');
  storeNomoduleBuildToWorkspace();
}

/**
 * Steps to run during PR builds.
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
    storeNomoduleBuildToWorkspace();
  } else {
    await signalPrDeployUpload('skipped');
    timedExecOrDie('amp visual-diff --empty');
    skipDependentJobs(
      jobName,
      'this PR does not affect the runtime, integration tests, end-to-end tests, or visual diff tests'
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
