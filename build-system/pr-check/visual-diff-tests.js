'use strict';

/**
 * @fileoverview Script that runs the visual diff tests during CI.
 */

const {runCiJob} = require('./ci-job');
const {skipDependentJobs, timedExecOrDie} = require('./utils');
const {Targets, buildTargetsInclude} = require('./build-targets');

const jobName = 'visual-diff-tests.js';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  // TODO(#36604): restore: timedExecOrDie('amp visual-diff --nobuild --main');
  timedExecOrDie('amp visual-diff --empty');
}

/**
 * Steps to run during PR builds.
 */
function prBuildWorkflow() {
  if (buildTargetsInclude(Targets.RUNTIME, Targets.VISUAL_DIFF)) {
    // TODO(#36604): restore: timedExecOrDie('amp visual-diff --nobuild');
    timedExecOrDie('amp visual-diff --empty');
  } else {
    timedExecOrDie('amp visual-diff --empty');
    skipDependentJobs(
      jobName,
      'this PR does not affect the runtime or visual diff tests'
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
