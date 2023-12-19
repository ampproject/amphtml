'use strict';

/**
 * @fileoverview Script that tests the unminified AMP runtime during CI.
 */

const {
  skipDependentJobs,
  timedExecOrDie,
  timedExecOrThrow,
} = require('./utils');
const {runCiJob} = require('./ci-job');
const {Targets, buildTargetsInclude} = require('./build-targets');

const jobName = 'unminified-tests.js';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  try {
    timedExecOrThrow(
      'amp integration --nobuild --headless --coverage',
      'Integration tests failed!'
    );
  } catch (e) {
    if (e.status) {
      process.exitCode = e.status;
    }
  }
}

/**
 * Steps to run during PR builds.
 */
function prBuildWorkflow() {
  if (buildTargetsInclude(Targets.RUNTIME, Targets.INTEGRATION_TEST)) {
    timedExecOrDie('amp integration --nobuild --headless --coverage');
  } else {
    skipDependentJobs(
      jobName,
      'this PR does not affect the runtime or integration tests'
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
