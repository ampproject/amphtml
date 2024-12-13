'use strict';

/**
 * @fileoverview Script that runs the experiment A/B/C integration tests during CI.
 */

const {skipDependentJobs, timedExecOrThrow} = require('./utils');
const {experiment} = require('minimist')(process.argv.slice(2));
const {getExperimentConfig} = require('../common/utils');
const {runCiJob} = require('./ci-job');
const {Targets, buildTargetsInclude} = require('./build-targets');

const jobName = `${experiment}-integration-tests.js`;

/**
 * Runs tests for the given configuration and reports results.
 * @param {!Object} config
 */
function runExperimentTests(config) {
  try {
    const defineFlag = `--define_experiment_constant ${config.define_experiment_constant}`;
    const experimentFlag = `--experiment ${experiment}`;
    timedExecOrThrow(
      `amp integration --nobuild --minified --headless ${experimentFlag} ${defineFlag}`
    );
  } catch (e) {
    if (e.status) {
      process.exitCode = e.status;
    }
  }
}

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  // Note that if config is invalid, this build would have been skipped by CircleCI.
  const config = getExperimentConfig(experiment);
  runExperimentTests(config);
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
