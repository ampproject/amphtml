'use strict';

/**
 * @fileoverview Script that builds the experiment A/B/C runtime during CI.
 */

const {
  skipDependentJobs: skipDependentJobs,
  storeExperimentBuildToWorkspace,
  timedExecOrDie,
} = require('./utils');
const {experiment} = require('minimist')(process.argv.slice(2));
const {getExperimentConfig} = require('../common/utils');
const {runCiJob} = require('./ci-job');
const {Targets, buildTargetsInclude} = require('./build-targets');

const jobName = `${experiment}-build.js`;

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  // Note that if config is invalid, this build would have been skipped by CircleCI.
  const config = getExperimentConfig(experiment);
  const defineFlag = `--define_experiment_constant ${config.define_experiment_constant}`;
  timedExecOrDie(`amp dist --fortesting ${defineFlag}`);
  storeExperimentBuildToWorkspace(experiment);
}

/**
 * Steps to run during PR builds.
 */
function prBuildWorkflow() {
  if (
    buildTargetsInclude(
      Targets.RUNTIME,
      Targets.INTEGRATION_TEST,
      Targets.E2E_TEST
    )
  ) {
    pushBuildWorkflow();
  } else {
    skipDependentJobs(
      jobName,
      'this PR does not affect the runtime, integration tests, or end-to-end tests'
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
