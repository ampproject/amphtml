'use strict';

/**
 * @fileoverview Script that builds and tests on IE 11 during CI.
 */

const {runCiJob} = require('./ci-job');
const {skipDependentJobs, timedExecOrDie} = require('./utils');
const {Targets, buildTargetsInclude} = require('./build-targets');

const jobName = 'ie-tests.js';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  timedExecOrDie('amp dist --fortesting');
  timedExecOrDie('amp integration --nobuild --minified --ie');
}

/**
 * Steps to run during PR builds.
 */
function prBuildWorkflow() {
  if (buildTargetsInclude(Targets.RUNTIME, Targets.INTEGRATION_TEST)) {
    pushBuildWorkflow();
  } else {
    skipDependentJobs(
      jobName,
      'this PR does not affect the runtime or integration tests'
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
