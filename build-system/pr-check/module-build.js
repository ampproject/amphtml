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
  if (
    buildTargetsInclude(
      Targets.RUNTIME,
      Targets.INTEGRATION_TEST,
      Targets.VISUAL_DIFF
    )
  ) {
    timedExecOrDie('amp dist --esm --fortesting');
    storeModuleBuildToWorkspace();
  } else {
    timedExecOrDie('amp visual-diff --empty');
    skipDependentJobs(
      jobName,
      'this PR does not affect the runtime, integration tests, or visual diff tests'
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
