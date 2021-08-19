'use strict';

/**
 * @fileoverview Script that runs the performance tests during CI.
 */

const {runCiJob} = require('./ci-job');
const {timedExecOrDie} = require('./utils');

const jobName = 'performance-tests.js';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  timedExecOrDie('amp performance --nobuild --quiet --headless');
}

runCiJob(jobName, pushBuildWorkflow, () => {});
