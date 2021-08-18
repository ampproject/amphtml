
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
