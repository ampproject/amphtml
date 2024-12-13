'use strict';

/**
 * @fileoverview Script that runs the end-to-end tests during CI.
 */

const {
  FILELIST_PATH,
  generateCircleCiShardTestFileList,
  skipDependentJobs,
  timedExecOrDie,
  timedExecOrThrow,
} = require('./utils');
const {e2eTestPaths} = require('../test-configs/config');
const {runCiJob} = require('./ci-job');
const {Targets, buildTargetsInclude} = require('./build-targets');

const jobName = 'e2e-tests.js';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  try {
    generateCircleCiShardTestFileList(e2eTestPaths);
    timedExecOrThrow(
      `amp e2e --nobuild --headless --minified --filelist ${FILELIST_PATH}`,
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
  if (buildTargetsInclude(Targets.RUNTIME, Targets.E2E_TEST)) {
    generateCircleCiShardTestFileList(e2eTestPaths);
    timedExecOrDie(
      `amp e2e --nobuild --headless --minified --filelist ${FILELIST_PATH}`
    );
  } else {
    skipDependentJobs(
      jobName,
      'this PR does not affect the runtime or end-to-end tests'
    );
  }
}
runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
