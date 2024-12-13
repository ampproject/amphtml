'use strict';

/**
 * @fileoverview Script that runs the experiment A/B/C E2E tests during CI.
 */

const {
  FILELIST_PATH,
  generateCircleCiShardTestFileList,
  skipDependentJobs,
  timedExecOrThrow,
} = require('./utils');
const {e2eTestPaths} = require('../test-configs/config');
const {experiment} = require('minimist')(process.argv.slice(2));
const {getExperimentConfig} = require('../common/utils');
const {runCiJob} = require('./ci-job');
const {Targets, buildTargetsInclude} = require('./build-targets');

const jobName = `${experiment}-e2e-tests.js`;

/**
 * Runs tests for the given configuration and reports results for push builds.
 * @param {!Object} config
 */
function runExperimentTests(config) {
  try {
    const defineFlag = `--define_experiment_constant ${config.define_experiment_constant}`;
    const experimentFlag = `--experiment ${experiment}`;
    generateCircleCiShardTestFileList(e2eTestPaths);
    timedExecOrThrow(
      `amp e2e --nobuild --minified --headless ${experimentFlag} ${defineFlag} --filelist ${FILELIST_PATH}`
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
  if (buildTargetsInclude(Targets.RUNTIME, Targets.E2E_TEST)) {
    pushBuildWorkflow();
  } else {
    skipDependentJobs(
      jobName,
      'this PR does not affect the runtime or end-to-end tests'
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
