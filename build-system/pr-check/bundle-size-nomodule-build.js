'use strict';

/**
 * @fileoverview Script that builds the nomodule AMP runtime for bundle-size during CI.
 */

const {
  skipDependentJobs,
  storeNomoduleBuildToWorkspace,
  timedExecOrDie,
} = require('./utils');
const {runCiJob} = require('./ci-job');
const {Targets, buildTargetsInclude} = require('./build-targets');

const jobName = 'bundle-size-nomodule-build.js';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  timedExecOrDie(
    'amp dist --noconfig --version_override 0000000000000 --nomanglecache'
  );
  storeNomoduleBuildToWorkspace();
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
