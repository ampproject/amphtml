'use strict';

/**
 * @fileoverview Script that runs the bundle-size checks during CI.
 */

const {runCiJob} = require('./ci-job');
const {skipDependentJobs, timedExecOrDie} = require('./utils');
const {Targets, buildTargetsInclude} = require('./build-targets');

const jobName = 'bundle-size.js';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  timedExecOrDie('amp bundle-size --on_push_build');
}

/**
 * Steps to run during PR builds.
 */
function prBuildWorkflow() {
  if (buildTargetsInclude(Targets.RUNTIME)) {
    timedExecOrDie('amp bundle-size --on_pr_build');
  } else {
    timedExecOrDie('amp bundle-size --on_skipped_build');
    skipDependentJobs(jobName, 'this PR does not affect the runtime');
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
