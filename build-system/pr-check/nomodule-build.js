'use strict';

/**
 * @fileoverview Script that builds the nomodule AMP runtime during CI.
 */

const {
  abortTimedJob,
  startTimer,
  storeNomoduleBuildToWorkspace,
  timedExecOrDie,
  timedExecWithError,
} = require('./utils');
const {log} = require('../common/logging');
const {red, yellow} = require('kleur/colors');
const {runCiJob} = require('./ci-job');
const {signalPrDeployUpload} = require('../tasks/pr-deploy-bot-utils');

const jobName = 'nomodule-build.js';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  timedExecOrDie('amp dist --fortesting');
  storeNomoduleBuildToWorkspace();
}

/**
 * Steps to run during PR builds.
 * @return {Promise<void>}
 */
async function prBuildWorkflow() {
  const startTime = startTimer(jobName);
  const process = timedExecWithError('amp dist --fortesting');
  if (process.status !== 0) {
    const message = process?.error
      ? process.error.message
      : 'Unknown error, check logs';
    log(red('ERROR'), yellow(message));
    await signalPrDeployUpload('errored');
    return abortTimedJob(jobName, startTime);
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
