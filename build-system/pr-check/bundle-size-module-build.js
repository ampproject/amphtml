'use strict';

/**
 * @fileoverview Script that builds the module AMP runtime for bundle-size during CI.
 */

const {
  skipDependentJobs,
  storeModuleBuildToWorkspace,
  timedExecOrDie,
} = require('./utils');
const {runCiJob} = require('./ci-job');
const {Targets, buildTargetsInclude} = require('./build-targets');

const jobName = 'bundle-size-module-build.js';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  timedExecOrDie(
    'amp dist --noconfig --esm --version_override 0000000000000 --nomanglecache'
  );
  storeModuleBuildToWorkspace();
}

/**
 * Steps to run during PR builds.
 */
function prBuildWorkflow() {
  if (buildTargetsInclude(Targets.RUNTIME)) {
    pushBuildWorkflow();
  } else {
    skipDependentJobs(
      jobName,
      'this PR does not affect the runtime',
      /* gracefullyHaltNextJobs= */ false
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
