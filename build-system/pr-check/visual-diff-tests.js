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
  timedExecOrDie('amp visual-diff --esm --minified --main');
}

/**
 * Steps to run during PR builds.
 */
function prBuildWorkflow() {
  if (buildTargetsInclude(Targets.RUNTIME, Targets.VISUAL_DIFF)) {
    timedExecOrDie('amp visual-diff --esm --minified');
  } else {
    timedExecOrDie('amp visual-diff --empty --esm --minified');
    skipDependentJobs(
      jobName,
      'this PR does not affect the runtime or visual diff tests'
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
