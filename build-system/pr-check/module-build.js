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
