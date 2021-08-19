'use strict';

/**
 * @fileoverview Script that builds every commit on Linux, macOS, and Windows.
 */

const {flavor} = require('minimist')(process.argv.slice(2));
const {runCiJob} = require('./ci-job');
const {timedExecOrDie} = require('./utils');

const jobName = 'cross-platform-builds.js';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  timedExecOrDie(flavor == 'Build' ? 'amp build' : 'amp dist');
}

runCiJob(jobName, pushBuildWorkflow, () => {});
