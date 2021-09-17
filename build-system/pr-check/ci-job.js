'use strict';

const {
  abortTimedJob,
  printChangeSummary,
  startTimer,
  stopTimer,
} = require('./utils');
const {
  getLoggingPrefix,
  logWithoutTimestamp,
  setLoggingPrefix,
} = require('../common/logging');
const {determineBuildTargets} = require('./build-targets');
const {isPullRequestBuild} = require('../common/ci');
const {red} = require('kleur/colors');
const {updatePackages} = require('../common/update-packages');

/**
 * Helper used by all CI job scripts. Runs the PR / push build workflow.
 * @param {string} jobName
 * @param {function} pushBuildWorkflow
 * @param {function} prBuildWorkflow
 * @return {Promise<void>}
 */
async function runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow) {
  setLoggingPrefix(jobName);
  const startTime = startTimer(jobName);
  try {
    updatePackages();
    if (isPullRequestBuild()) {
      printChangeSummary();
      determineBuildTargets();
      await prBuildWorkflow();
    } else {
      await pushBuildWorkflow();
    }
    stopTimer(jobName, startTime);
  } catch (err) {
    logWithoutTimestamp(getLoggingPrefix(), red('ERROR:'), err);
    abortTimedJob(jobName, startTime);
  }
}

module.exports = {
  runCiJob,
};
