'use strict';

/**
 * @fileoverview Script that runs the unit tests during CI.
 */

const {
  FILELIST_PATH,
  generateCircleCiShardTestFileList,
  skipDependentJobs,
  timedExecOrDie,
  timedExecOrThrow,
} = require('./utils');
const {runCiJob} = require('./ci-job');
const {Targets, buildTargetsInclude} = require('./build-targets');
const {unitTestPaths} = require('../test-configs/config');

const jobName = 'unit-tests.js';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  try {
    generateCircleCiShardTestFileList(unitTestPaths);
    timedExecOrThrow(
      `amp unit --headless --coverage --filelist ${FILELIST_PATH}`,
      'Unit tests failed!'
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
  if (buildTargetsInclude(Targets.RUNTIME, Targets.UNIT_TEST)) {
    generateCircleCiShardTestFileList(unitTestPaths);
    timedExecOrDie(
      `amp unit --headless --coverage --filelist ${FILELIST_PATH}`
    );
  } else {
    skipDependentJobs(
      jobName,
      'this PR does not affect the runtime or unit tests'
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
