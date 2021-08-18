'use strict';

/**
 * @fileoverview Script that builds every commit on Linux, macOS, and Windows.
 */

const {runCiJob} = require('./ci-job');
const {timedExecOrDie} = require('./utils');

const jobName = 'cross-platform-builds.js';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  timedExecOrDie('amp build');
  timedExecOrDie('amp dist');
}

runCiJob(jobName, pushBuildWorkflow, () => {});
