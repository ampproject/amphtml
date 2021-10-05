'use strict';

const {
  getLoggingPrefix,
  logWithoutTimestamp,
  setLoggingPrefix,
} = require('../common/logging');
const {abortTimedJob, startTimer, stopTimer} = require('../pr-check/utils');
const {red} = require('kleur/colors');
const {updatePackages} = require('../common/update-packages');

/**
 * Helper used by release related CI job scripts.
 * @param {string} jobName
 * @param {Function} workflow
 * @return {Promise<void>}
 */
async function runReleaseJob(jobName, workflow) {
  setLoggingPrefix(jobName);
  const startTime = startTimer(jobName);
  try {
    updatePackages();
    await workflow();
    stopTimer(jobName, startTime);
  } catch (err) {
    logWithoutTimestamp(getLoggingPrefix(), red('ERROR:'), err);
    abortTimedJob(jobName, startTime);
  }
}

module.exports = {
  runReleaseJob,
};
