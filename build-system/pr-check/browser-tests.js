'use strict';

/**
 * @fileoverview Script that runs tests on Safari / Firefox / Edge during CI.
 */

const {skipDependentJobs, timedExecOrThrow} = require('./utils');
const {runCiJob} = require('./ci-job');
const {Targets, buildTargetsInclude} = require('./build-targets');

const argv = require('minimist')(process.argv.slice(2));
const {type} = argv;
const browser = argv.browser.toLowerCase();

const jobName = 'browser-tests.js';

const COMMANDS = {
  'Unit': `amp unit --${browser}`,
  'Integration': `amp integration --nobuild --minified --${browser}`,
  'End-to-End': `amp e2e --nobuild --minified --browsers=${browser}`,
};

const INDIVIDUAL_TARGET = {
  'Unit': Targets.UNIT_TEST,
  'Integration': Targets.INTEGRATION_TEST,
  'End-to-End': Targets.E2E_TEST,
};

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  try {
    timedExecOrThrow(COMMANDS[type], `${type} tests failed!`);
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
  if (!buildTargetsInclude(Targets.RUNTIME, INDIVIDUAL_TARGET[type])) {
    skipDependentJobs(
      jobName,
      `this PR does not affect the runtime or ${type} tests`
    );
    return;
  }

  pushBuildWorkflow();
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
