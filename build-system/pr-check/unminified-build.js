'use strict';

/**
 * @fileoverview Script that builds the unminified AMP runtime during CI.
 */

const {
  skipDependentJobs,
  storeUnminifiedBuildToWorkspace,
  timedExecOrDie,
} = require('./utils');
const {runCiJob} = require('./ci-job');
const {Targets, buildTargetsInclude} = require('./build-targets');

const jobName = 'unminified-build.js';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  timedExecOrDie('amp build --fortesting');
  storeUnminifiedBuildToWorkspace();
}

/**
 * Steps to run during PR builds.
 */
function prBuildWorkflow() {
  if (buildTargetsInclude(Targets.RUNTIME, Targets.INTEGRATION_TEST)) {
    timedExecOrDie('amp build --fortesting');
    storeUnminifiedBuildToWorkspace();
  } else {
    skipDependentJobs(
      jobName,
      'this PR does not affect the runtime or integration tests'
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
