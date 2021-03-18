/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const {
  gitBranchCreationPoint,
  gitBranchName,
  gitCommitHash,
  gitDiffCommitLog,
  gitDiffStatMaster,
  gitCiMasterBaseline,
  shortSha,
} = require('../common/git');
const {ciBuildSha, ciPullRequestSha, isCiBuild} = require('../common/ci');
const {cyan, green, yellow} = require('kleur/colors');
const {execOrDie, execOrThrow, execWithError, exec} = require('../common/exec');
const {getLoggingPrefix, logWithoutTimestamp} = require('../common/logging');
const {replaceUrls} = require('../tasks/pr-deploy-bot-utils');

const UNMINIFIED_OUTPUT_FILE = `amp_unminified_${ciBuildSha()}.zip`;
const NOMODULE_OUTPUT_FILE = `amp_nomodule_${ciBuildSha()}.zip`;
const MODULE_OUTPUT_FILE = `amp_module_${ciBuildSha()}.zip`;
const EXPERIMENT_OUTPUT_FILE = (exp) => `amp_${exp}_${ciBuildSha()}.zip`;

const BUILD_OUTPUT_DIRS = 'build/ dist/ dist.3p/';
const APP_SERVING_DIRS =
  'dist.tools/ examples/ test/manual/ test/fixtures/e2e/';

// TODO(rsimha, ampproject/amp-github-apps#1110): Update storage details.
const GCLOUD_STORAGE_BUCKET = 'gs://amp-travis-builds';

const GIT_BRANCH_URL =
  'https://github.com/ampproject/amphtml/blob/master/contributing/getting-started-e2e.md#create-a-git-branch';

/**
 * Prints a summary of files changed by, and commits included in the PR.
 */
function printChangeSummary() {
  const loggingPrefix = getLoggingPrefix();
  let commitSha;

  if (isCiBuild()) {
    logWithoutTimestamp(
      `${loggingPrefix} Latest commit from ${cyan('master')} included ` +
        `in this build: ${cyan(shortSha(gitCiMasterBaseline()))}`
    );
    commitSha = ciPullRequestSha();
  } else {
    commitSha = gitCommitHash();
  }
  logWithoutTimestamp(
    `${loggingPrefix} Testing the following changes at commit ` +
      `${cyan(shortSha(commitSha))}`
  );

  const filesChanged = gitDiffStatMaster();
  logWithoutTimestamp(filesChanged);

  const branchCreationPoint = gitBranchCreationPoint();
  if (branchCreationPoint) {
    logWithoutTimestamp(
      `${loggingPrefix} Commit log since branch`,
      `${cyan(gitBranchName())} was forked from`,
      `${cyan('master')} at`,
      `${cyan(shortSha(branchCreationPoint))}:`
    );
    logWithoutTimestamp(gitDiffCommitLog() + '\n');
  } else {
    logWithoutTimestamp(
      loggingPrefix,
      yellow('WARNING:'),
      'Could not find a common ancestor for',
      cyan(gitBranchName()),
      'and',
      cyan('master') + '. (This can happen with older PR branches.)'
    );
    logWithoutTimestamp(
      loggingPrefix,
      yellow('NOTE 1:'),
      'If this causes unexpected test failures, try rebasing the PR branch on',
      cyan('master') + '.'
    );
    logWithoutTimestamp(
      loggingPrefix,
      yellow('NOTE 2:'),
      "If rebasing doesn't work, you may have to recreate the branch. See",
      cyan(GIT_BRANCH_URL) + '.\n'
    );
  }
}

/**
 * Prints a message indicating why a job was skipped.
 * @param {string} jobName
 * @param {string} skipReason
 */
function printSkipMessage(jobName, skipReason) {
  const loggingPrefix = getLoggingPrefix();
  logWithoutTimestamp(
    `${loggingPrefix} Skipping ${cyan(jobName)} because ${skipReason}.`
  );
}

/**
 * Starts a timer to measure the execution time of the given job / command.
 * @param {string} jobNameOrCmd
 * @return {DOMHighResTimeStamp}
 */
function startTimer(jobNameOrCmd) {
  const startTime = Date.now();
  const loggingPrefix = getLoggingPrefix();
  logWithoutTimestamp(
    '\n' + loggingPrefix,
    'Running',
    cyan(jobNameOrCmd) + '...'
  );
  return startTime;
}

/**
 * Stops the timer for the given job / command and prints the execution time.
 * @param {string} jobNameOrCmd
 * @param {DOMHighResTimeStamp} startTime
 */
function stopTimer(jobNameOrCmd, startTime) {
  const endTime = Date.now();
  const executionTime = endTime - startTime;
  const mins = Math.floor(executionTime / 60000);
  const secs = Math.floor((executionTime % 60000) / 1000);
  const loggingPrefix = getLoggingPrefix();
  logWithoutTimestamp(
    loggingPrefix,
    'Done running',
    cyan(jobNameOrCmd),
    'Total time:',
    green(mins + 'm ' + secs + 's')
  );
}

/**
 * Aborts the process after stopping the timer for a given job
 * @param {string} jobName
 * @param {number} startTime
 */
function abortTimedJob(jobName, startTime) {
  stopTimer(jobName, startTime);
  process.exitCode = 1;
}

/**
 * Wraps an exec helper in a timer. Returns the result of the helper.
 * @param {function(string, string=): ?} execFn
 * @return {function(string, string=): ?}
 */
function timedExecFn(execFn) {
  return (cmd, ...rest) => {
    const startTime = startTimer(cmd);
    const p = execFn(cmd, ...rest);
    stopTimer(cmd, startTime);
    return p;
  };
}

/**
 * Executes the provided command and times it. Errors, if any, are printed.
 * @function
 * @param {string} cmd
 * @return {!Object} Node process
 */
const timedExec = timedExecFn(exec);

/**
 * Executes the provided command and times it. Errors, if any, are returned.
 * @function
 * @param {string} cmd
 * @return {!Object} Node process
 */
const timedExecWithError = timedExecFn(execWithError);

/**
 * Executes the provided command and times it. The program terminates in case of
 * failure.
 * @function
 * @param {string} cmd
 */
const timedExecOrDie = timedExecFn(execOrDie);

/**
 * Executes the provided command and times it. The program throws on error in
 * case of failure.
 * @function
 * @param {string} cmd
 */
const timedExecOrThrow = timedExecFn(execOrThrow);

/**
 * Download output helper
 * @param {string} outputFileName
 * @param {string} outputDirs
 * @private
 */
function downloadOutput_(outputFileName, outputDirs) {
  const loggingPrefix = getLoggingPrefix();
  const buildOutputDownloadUrl = `${GCLOUD_STORAGE_BUCKET}/${outputFileName}`;
  const dirsToUnzip = outputDirs.split(' ');

  logWithoutTimestamp(
    `${loggingPrefix} Downloading build output from ` +
      cyan(buildOutputDownloadUrl) +
      '...'
  );
  execOrDie(`gsutil -q cp ${buildOutputDownloadUrl} ${outputFileName}`);

  logWithoutTimestamp(
    `${loggingPrefix} Extracting ` + cyan(outputFileName) + '...'
  );
  dirsToUnzip.forEach((dir) => {
    execOrDie(`unzip -q -o ${outputFileName} '${dir.replace('/', '/*')}'`);
  });
  execOrDie(`du -sh ${outputDirs}`);
}

/**
 * Upload output helper
 * @param {string} outputFileName
 * @param {string} outputDirs
 * @private
 */
function uploadOutput_(outputFileName, outputDirs) {
  const loggingPrefix = getLoggingPrefix();

  logWithoutTimestamp(
    `\n${loggingPrefix} Compressing ` +
      cyan(outputDirs.split(' ').join(', ')) +
      ' into ' +
      cyan(outputFileName) +
      '...'
  );
  execOrDie(`zip -r -q ${outputFileName} ${outputDirs}`);
  execOrDie(`du -sh ${outputFileName}`);

  logWithoutTimestamp(
    `${loggingPrefix} Uploading ` +
      cyan(outputFileName) +
      ' to ' +
      cyan(GCLOUD_STORAGE_BUCKET) +
      '...'
  );
  execOrDie(`gsutil -q -m cp -r ${outputFileName} ${GCLOUD_STORAGE_BUCKET}`);
}

/**
 * Downloads and unzips build output from storage
 */
function downloadUnminifiedOutput() {
  downloadOutput_(UNMINIFIED_OUTPUT_FILE, BUILD_OUTPUT_DIRS);
}

/**
 * Downloads and unzips nomodule output from storage
 */
function downloadNomoduleOutput() {
  downloadOutput_(NOMODULE_OUTPUT_FILE, BUILD_OUTPUT_DIRS);
}

/**
 * Downloads and unzips module output from storage
 */
function downloadModuleOutput() {
  downloadOutput_(MODULE_OUTPUT_FILE, BUILD_OUTPUT_DIRS);
}

/**
 * Downloads and unzips output for the given experiment from storage
 * @param {string} exp
 */
function downloadExperimentOutput(exp) {
  downloadOutput_(EXPERIMENT_OUTPUT_FILE(exp), BUILD_OUTPUT_DIRS);
}

/**
 * Zips and uploads the build output to a remote storage location
 */
function uploadUnminifiedOutput() {
  uploadOutput_(UNMINIFIED_OUTPUT_FILE, BUILD_OUTPUT_DIRS);
}

/**
 * Zips and uploads the nomodule output to a remote storage location
 */
function uploadNomoduleOutput() {
  const nomoduleOutputDirs = `${BUILD_OUTPUT_DIRS} ${APP_SERVING_DIRS}`;
  uploadOutput_(NOMODULE_OUTPUT_FILE, nomoduleOutputDirs);
}

/**
 * Zips and uploads the module output to a remote storage location
 */
function uploadModuleOutput() {
  const moduleOutputDirs = `${BUILD_OUTPUT_DIRS} ${APP_SERVING_DIRS}`;
  uploadOutput_(MODULE_OUTPUT_FILE, moduleOutputDirs);
}

/**
 * Zips and uploads the output for the given experiment to a remote storage
 * location
 * @param {string} exp
 */
function uploadExperimentOutput(exp) {
  const experimentOutputDirs = `${BUILD_OUTPUT_DIRS} ${APP_SERVING_DIRS}`;
  uploadOutput_(EXPERIMENT_OUTPUT_FILE(exp), experimentOutputDirs);
}

/**
 * Replaces URLS in HTML files, zips and uploads nomodule output,
 * and signals to the AMP PR Deploy bot that the upload is complete.
 */
async function processAndUploadNomoduleOutput() {
  await replaceUrls('test/manual');
  await replaceUrls('examples');
  uploadNomoduleOutput();
}

module.exports = {
  abortTimedJob,
  downloadExperimentOutput,
  downloadUnminifiedOutput,
  downloadNomoduleOutput,
  downloadModuleOutput,
  printChangeSummary,
  printSkipMessage,
  processAndUploadNomoduleOutput,
  startTimer,
  stopTimer,
  timedExec,
  timedExecOrDie,
  timedExecWithError,
  timedExecOrThrow,
  uploadExperimentOutput,
  uploadUnminifiedOutput,
  uploadNomoduleOutput,
  uploadModuleOutput,
};
