'use strict';

/**
 * @fileoverview Script that runs tests on Safari / Firefox / Edge during CI.
 */

const {
  skipDependentJobs,
  timedExecOrDie,
  timedExecOrThrow,
} = require('./utils');
const {browser} = require('minimist')(process.argv.slice(2));
const {runCiJob} = require('./ci-job');
const {Targets, buildTargetsInclude} = require('./build-targets');

const jobName = 'browser-tests.js';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  try {
    timedExecOrThrow(`amp unit --${browser}`, 'Unit tests failed!');
    timedExecOrThrow(
      `amp integration --nobuild --minified --${browser}`,
      'Integration tests failed!'
    );
    timedExecOrThrow(
      `amp e2e --nobuild --minified --browsers=${browser}`,
      'End-to-end tests failed!'
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
  if (
    !buildTargetsInclude(
      Targets.RUNTIME,
      Targets.UNIT_TEST,
      Targets.E2E_TEST,
      Targets.INTEGRATION_TEST
    )
  ) {
    skipDependentJobs(
      jobName,
      'this PR does not affect the runtime, unit tests, integration tests, or end-to-end tests'
    );
    return;
  }
  if (buildTargetsInclude(Targets.RUNTIME, Targets.UNIT_TEST)) {
    timedExecOrDie(`amp unit --${browser}`);
  }
  if (buildTargetsInclude(Targets.RUNTIME, Targets.INTEGRATION_TEST)) {
    timedExecOrDie(`amp integration --nobuild --minified --${browser}`);
  }
  if (
    buildTargetsInclude(Targets.RUNTIME, Targets.E2E_TEST) &&
    ['safari', 'firefox'].includes(browser) // E2E tests can't be run on Edge.
  ) {
    timedExecOrDie(`amp e2e --nobuild --minified --browsers=${browser}`);
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
