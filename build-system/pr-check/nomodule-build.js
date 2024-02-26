'use strict';

/**
 * @fileoverview Script that builds the nomodule AMP runtime during CI.
 */

const {
  skipDependentJobs,
  storeBuildOutputToWorkspace,
  timedExecOrDie,
} = require('./utils');
const {runCiJob} = require('./ci-job');
const {Targets, buildTargetsInclude} = require('./build-targets');
const {maybeParallelizeCommand} = require('./parallelization');

const jobName = 'nomodule-build.js';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  const command = maybeParallelizeCommand(
    'amp dist --fortesting',
    'extensions/amp-*',
    {
      callback(results) {
        return `--extensions=${results.replaceAll(/\bextensions\//g, '').replaceAll(' ', ',')}`;
      },
      onZero: '--vendor_configs',
    }
  );

  timedExecOrDie(command);
  storeBuildOutputToWorkspace();
}

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
    pushBuildWorkflow();
  } else {
    skipDependentJobs(
      jobName,
      'this PR does not affect the runtime, integration tests, end-to-end tests, or visual diff tests'
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
